const hubspot = require('@hubspot/api-client');
const { getAccessToken } = require('./hubspotController');  // Import the token logic
const axios = require('axios');

// Fetch object types (Contacts, Deals, Companies)
exports.getObjectTypes = async (req, res) => {
  try {
    // Retrieve portalId from session (assuming it was stored there after OAuth)
    const portalId = req.session.portalId 
    // || '47070065'
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
    const portalId = req.session.portalId 
    // || '47070065'
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
    const portalId = req.session.portalId 
    // || '47070065'
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


exports.getAllObjects = async (req, res) => {
  try {
    const portalId = req.session.portalId || '47070065'; // Retrieve portalId from session
    if (!portalId) {
      return res.status(400).json({ error: 'Portal ID not found in session' });
    }

    // Retrieve the OAuth token for the portalId
    const accessToken = await getAccessToken(portalId);
    console.log('Access Token:', accessToken);

    // Fetch custom objects using the Schemas API
    const customObjectsResponse = await axios.get('https://api.hubapi.com/crm/v3/schemas', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Standard objects list
    const standardObjects = [
      { label: 'Contacts', value: 'contacts' },
      { label: 'Companies', value: 'companies' },
      { label: 'Deals', value: 'deals' },
      { label: 'Tickets', value: 'tickets' } // Include more standard objects if needed
    ];

    // Map custom objects from the API response
    const customObjects = customObjectsResponse.data.results.map((obj) => ({
      label: obj.name,
      value: obj.objectTypeId,
    }));

    // Combine standard and custom objects
    const allObjects = [...standardObjects, ...customObjects];

    // Format the response to include an "options" property
    const response = {
      options: allObjects
    };

    // Return the response as a JSON object
    console.log('All Objects:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching objects:', error.message);
    res.status(500).json({ error: 'Error fetching objects.' });
  }
};



// Fetch properties for a given object type
// Modified getProperties function
exports.getProperties = async (req, res) => {
  const { objectTypeSelect, filterTypeSelect } = req.body; // Extract objectType and filterType from the request body

  if (!objectTypeSelect) {
    return res.status(400).json({ error: 'Missing object type parameter' });
  }

  try {
    const portalId = req.session.portalId  || '47070065'; // Retrieve portalId from session
    if (!portalId) {
      return res.status(400).json({ error: 'Portal ID not found in session' });
    }

    // Retrieve the OAuth token for the portalId
    const accessToken = await getAccessToken(portalId);

    // Make the API request to fetch properties for the given object type
    const response = await axios.get(`https://api.hubapi.com/crm/v3/properties/${objectTypeSelect}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Filter properties based on fieldType if provided
    let properties = response.data.results;
    if (filterTypeSelect) {
      properties = properties.filter((property) => property.fieldType === filterTypeSelect);
    }

    // Format the properties into an array with label and value
    const formattedProperties = properties.map((property) => ({
      label: property.label,
      value: property.name,
    }));

    // Return the formatted properties as a JSON response
    res.status(200).json({ options: formattedProperties });
  } catch (error) {
    console.error(`Error fetching properties for ${objectTypeSelect}:`, error.message);
    res.status(500).json({ error: 'Error fetching properties.' });
  }
};





// Controller function to handle /filters endpoint
exports.getFilters = async (req, res) => {
  try {
    // Define filter options based on HubSpot property field types
    const filters = [
      { label: 'Single-line text', value: 'text' },
      { label: 'Multi-line text', value: 'textarea' },
      { label: 'Single checkbox', value: 'booleancheckbox' },
      { label: 'Multiple checkboxes', value: 'checkbox' },
      { label: 'Dropdown select', value: 'select' },
      { label: 'Radio select', value: 'radiogroup' },
      { label: 'Date picker', value: 'date' },
      { label: 'Number', value: 'number' },
      { label: 'File', value: 'file' },
      { label: 'HubSpot user', value: 'owner' },
      { label: 'Calculation', value: 'calculation' },
      { label: 'Score', value: 'score' },
      { label: 'Rich text', value: 'rich_text' }
    ];

    // Format the response with an "options" property
    const response = {
      options: filters
    };

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching filters:', error.message);
    res.status(500).json({ error: 'Error fetching filters.' });
  }
};


