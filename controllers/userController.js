const { getAccessToken, isAuthorized } = require('./hubspotController');
const hubspot = require('@hubspot/api-client');

// Initialize HubSpot Client globally
let hubspotClient = new hubspot.Client();

exports.get_all_contact = async (req, res) => {
  try {
    // Retrieve the portalId from the session
    const portalId = req.session.portalId;
    if (!portalId) {
      throw new Error('Portal ID not found in session');
    }

    // Get the access token using the portalId
    const accessToken = await getAccessToken(portalId);
    hubspotClient.setAccessToken(accessToken);

    // Use the @hubspot/api-client for consistent API requests
    const result = await hubspotClient.crm.contacts.getAll();

    res.json(result);
  } catch (e) {
    console.error('Unable to retrieve contacts:', e.message);
    res.status(e.response?.status || 500).json({
      message: 'Unable to retrieve contacts',
      error: e.message,
    });
  }
};


// Fetch available properties
exports.get_properties = async (req, res) => {
  try {
    const portalId = req.session.portalId;
    if (!portalId) {
      throw new Error('Portal ID not found in session');
    }
    const accessToken = await getAccessToken(portalId);
    hubspotClient.setAccessToken(accessToken);

    const propertiesResponse = await hubspotClient.crm.properties.coreApi.getAll('contacts');
    const properties = propertiesResponse.results.map(property => ({
      label: property.label,
      value: property.name,
    }));

    res.json(properties);
  } catch (e) {
    console.error('Unable to retrieve contact properties:', e.message);
    res.status(e.response?.status || 500).json({
      message: 'Unable to retrieve contact properties',
      error: e.message,
    });
  }
};

// Fetch property values based on the selected property
exports.property_values = async (req, res) => {
  try {
    const portalId = req.session.portalId;
    if (!portalId) {
      throw new Error('Portal ID not found in session');
    }
    const accessToken = await getAccessToken(portalId);
    hubspotClient.setAccessToken(accessToken);

    const { propertyName } = req.body;
    const contactsResponse = await hubspotClient.crm.contacts.basicApi.getPage(100, undefined, [propertyName]);

    const propertyValues = contactsResponse.results
      .map(contact => ({
        label: contact.properties[propertyName] || 'N/A',
        value: contact.properties[propertyName] || 'N/A',
      }))
      .filter(item => item.value !== 'N/A');

    res.status(200).json(propertyValues);
  } catch (e) {
    console.error('Unable to retrieve property values:', e.message);
    res.status(e.response?.status || 500).json({
      message: 'Unable to retrieve property values',
      error: e.message,
    });
  }
};

// Remove a value from a multi-select property
exports.removeMultiselectValue = async (req, res) => {
  try {
    const portalId = req.session.portalId || '47070065'
    if (!portalId) {
      throw new Error('Portal ID not found in session');
    }
    const accessToken = await getAccessToken(portalId);
    hubspotClient.setAccessToken(accessToken);

    const { propertyValue, removeValue, hs_object_id, propertyName } = req.body;

    // Fetch the property definition to get the label-internal value mapping
    const propertyResponse = await hubspotClient.crm.properties.coreApi.getByName('contacts', propertyName);
    const propertyOptions = propertyResponse.options;

    if (!propertyOptions) {
      throw new Error(`Property options not found for ${propertyName}`);
    }

    const valuesArray = propertyValue
      .split(',')
      .map(valueLabel => {
        const matchedOption = propertyOptions.find(option => option.label === valueLabel.trim());
        return matchedOption ? matchedOption.value : valueLabel.trim();
      });

    // Convert the removeValue from label to its internal value
    const matchedRemoveOption = propertyOptions.find(option => option.label === removeValue.trim());
    const internalRemoveValue = matchedRemoveOption ? matchedRemoveOption.value : removeValue.trim();

    const updatedPropertyValue = valuesArray.filter(value => value !== internalRemoveValue).join('; ');

    const properties = {
      [propertyName]: updatedPropertyValue,
    };

    // Update the contact using the HubSpot API
    const apiResponse = await hubspotClient.crm.contacts.basicApi.update(hs_object_id, { properties });

    res.status(200).json({
      outputFields: {
        output: updatedPropertyValue,
        hs_execution_state: 'SUCCESS',
      },
    });
  } catch (error) {
    console.error('Error removing multiselect value:', error.message);
    res.status(500).json({
      message: 'Server error while removing multiselect value',
      error: error.message,
    });
  }
};
