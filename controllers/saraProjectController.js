  require('dotenv').config();
  const hubspot = require('@hubspot/api-client');

  exports.checkAssociateCompany = async (req,res) => {
    console.log('Reqest Body:', req.body);
    const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
    const { inputFields, object } = req.body;
    
    // Input: Extract Company Name from the workflow action
    const companyName  = inputFields.companyName; // Input company name
    const contactId = object.objectId; // ID of the contact enrolled in the workflow
    const objectType = "contact";
    const toObjectType = "company";
    const limit = 500;
  
    try {
      let after = undefined;
      let associatedCompanyIds = [];
  
      // Step 1: Fetch associated companies (handle pagination)
      do {
        const response = await hubspotClient.crm.associations.v4.basicApi.getPage(objectType, contactId, toObjectType, after, limit);
        associatedCompanyIds.push(...response.results.map((assoc) => assoc.toObjectId));
        after = response.paging?.next?.after;
      } while (after);
  
      if (associatedCompanyIds.length === 0) {
        // No associated companies found
        return {
          outputFields: {
            CompanyExist: false,
          },
        };
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
  
      const isCompanyExist = companies.some((name) => {
        const normalizedCompanyName = name.toLowerCase().trim();
        return normalizedCompanyName.includes(normalizedInputName);
      });
  
      // Output: Return True/False based on the match
      return {
        outputFields: {
          CompanyExist: isCompanyExist,
        },
      };
  
    } catch (error) {
      console.error('Error checking associated companies:', error.message);
      throw new Error(`Failed to execute workflow action: ${error.message}`);
    }
  };
  


// Test the main function
// (async () => {
//     const event = {
//         inputFields: {
//             companyName:  '     Height '
//         },
//         object: {
//             objectId: '91074587703' // Replace with a valid contact ID
//         }
//     };

//     try {
//         const result = await exports.main(event);
//         console.log('Test Result:', result);
//     } catch (error) {
//         console.error('Test Error:', error.message);
//     }
// })();
