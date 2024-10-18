const hubspot = require('@hubspot/api-client');
const { getAccessToken } = require('./hubspotController');  // Import the token logic

// Fetch object types (Contacts, Deals, Companies)
exports.getObjectTypes = async (req, res) => {
  try {
    // Retrieve portalId from session (assuming it was stored there after OAuth)
    const portalId = req.session.portalId || '47070065'
    console.log('im here 1')
    if (!portalId) {
      return res.status(400).json({ error: 'Portal ID not found in session' });
    }

    // Retrieve the OAuth token for the portalId
    const accessToken = await getAccessToken(portalId);
    const hubspotClient = new hubspot.Client();
    hubspotClient.setAccessToken(accessToken);

    // Available object types in HubSpot
    const availableObjects = ["contacts", "deals", "companies"];

    const dropdownOptions = availableObjects.map(objectType => ({
      label: objectType.charAt(0).toUpperCase() + objectType.slice(1),
      value: objectType
    }));

    res.status(200).json(dropdownOptions);
  } catch (error) {
    console.error('Error fetching object types:', error.message);
    res.status(500).json({ error: 'Error fetching object types.' });
  }
};

// Fetch multi-select properties for a given object type
exports.getMultiSelectProperties = async (req, res) => {
  const { objectType } = req.body;  // Extract objectType from the request body
  
  try {
    console.log('im here 2')
    const portalId = req.session.portalId || '47070065'
    if (!portalId) {
      return res.status(400).json({ error: 'Portal ID not found in session' });
    }

    // Retrieve the OAuth token for the portalId
    const accessToken = await getAccessToken(portalId);
    const hubspotClient = new hubspot.Client();
    hubspotClient.setAccessToken(accessToken);

    // Fetch the multi-select properties for the given object type
    const propertiesResponse = await hubspotClient.crm.properties.coreApi.getAll(objectType);
    const multiSelectProperties = propertiesResponse.results.filter(property =>
      property.fieldType === 'checkbox' || property.fieldType === 'select'
    );

    const dropdownOptions = multiSelectProperties.map(property => ({
      label: property.label,
      value: property.name
    }));

    res.status(200).json(dropdownOptions);
  } catch (error) {
    console.error('Error fetching multi-select properties:', error.message);
    res.status(500).json({ error: 'Error fetching multi-select properties.' });
  }
};

// Fetch options for a selected multi-select property
exports.getPropertyOptions = async (req, res) => {
  const { objectType, propertyName } = req.query;  // Extract objectType and propertyName from query parameters

  if (!objectType || !propertyName) {
    return res.status(400).json({ error: 'Missing object type or property name parameter' });
  }

  try {console.log('im here 3')
    const portalId = req.session.portalId || '47070065'
    if (!portalId) {
      return res.status(400).json({ error: 'Portal ID not found in session' });
    }

    // Retrieve the OAuth token for the portalId
    const accessToken = await getAccessToken(portalId);
    const hubspotClient = new hubspot.Client();
    hubspotClient.setAccessToken(accessToken);

    // Fetch the specific property definition to get its options
    const propertyResponse = await hubspotClient.crm.properties.coreApi.getByName(objectType, propertyName);
    const propertyOptions = propertyResponse.options;

    if (!propertyOptions || propertyOptions.length === 0) {
      return res.status(404).json({ error: 'No options available for the selected property' });
    }

    // Return the property options for checkboxes and select fields
    res.status(200).json({
      options: propertyOptions.map(option => ({
        label: option.label,
        value: option.value
      }))
    });
  } catch (error) {
    console.error('Error fetching property options:', error.message);
    res.status(500).json({ error: 'Error fetching property options.' });
  }
};
