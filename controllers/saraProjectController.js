require('dotenv').config();
const hubspot = require('@hubspot/api-client');

exports.checkAssociateCompany = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    // Initialize HubSpot client
    const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_HAPI_KEY });

    // Extract input fields from the request
    const { inputFields, object } = req.body;
    const companyName = inputFields.companyName; // Input company name
    const additionalText = inputFields.additionalText || ""; // Optional additional text
    const contactId = object.objectId; // Contact ID from the workflow object
    const objectType = "contact";
    const toObjectType = "company";
    const limit = 500;

    let after = undefined;
    let associatedCompanyIds = [];

    // Step 1: Fetch associated companies (handle pagination)
    do {
      const response = await hubspotClient.crm.associations.v4.basicApi.getPage(
        objectType,
        contactId,
        toObjectType,
        after,
        limit
      );
      associatedCompanyIds.push(...response.results.map((assoc) => assoc.toObjectId));
      after = response.paging?.next?.after;
    } while (after);

    // No associated companies found
    if (associatedCompanyIds.length === 0) {
      return res.status(200).json({
        outputFields: {
          CompanyExist: false,
        },
      });
    }

    // Step 2: Retrieve the names of the associated companies
    const companies = await Promise.all(
      associatedCompanyIds.map(async (companyId) => {
        const company = await hubspotClient.crm.companies.basicApi.getById(companyId);
        return company.properties.name; // Get the company name
      })
    );

    // Step 3: Normalize and check for a match
    const normalizedInputName = companyName.toLowerCase().trim();
    const normalizedAdditionalText = additionalText.toLowerCase().trim();

    const isCompanyExist = companies.some((name) => {
      const normalizedCompanyName = name.toLowerCase().trim();
      return (
        normalizedCompanyName.includes(normalizedInputName) ||
        (normalizedAdditionalText && normalizedCompanyName.includes(normalizedAdditionalText))
      );
    });

    // Output: Return True/False based on the match
    return res.status(200).json({
      outputFields: {
        CompanyExist: isCompanyExist,
      },
    });
  } catch (error) {
    console.error('Error checking associated companies:', error.message);
    res.status(500).json({ error: 'Failed to check associated companies.' });
  }
};
