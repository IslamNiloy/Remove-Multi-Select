const hubspot = require('@hubspot/api-client');
const { getAccessToken } = require('./hubspotController');  // Import the token logic
const axios = require('axios');

// Fetch object types (Contacts, Deals, Companies)
// exports.getObjectTypes = async (req, res) => {
//   try {
//     // Retrieve portalId from session (assuming it was stored there after OAuth)
//     const portalId = req.session.portalId 
//     // || '47070065'
//     console.log('im here 1')
//     if (!portalId) {
//       return res.status(400).json({ error: 'Portal ID not found in session' });
//     }

//     // Retrieve the OAuth token for the portalId
//     const accessToken = await getAccessToken(portalId);
//     const hubspotClient = new hubspot.Client();
//     hubspotClient.setAccessToken(accessToken);

//     // Available object types in HubSpot
//     const availableObjects = ["contacts", "deals", "companies"];

//     const dropdownOptions = availableObjects.map(objectType => ({
//       label: objectType.charAt(0).toUpperCase() + objectType.slice(1),
//       value: objectType
//     }));

//     res.status(200).json(dropdownOptions);
//   } catch (error) {
//     console.error('Error fetching object types:', error.message);
//     res.status(500).json({ error: 'Error fetching object types.' });
//   }
// };

// Fetch multi-select properties for a given object type
// exports.getMultiSelectProperties = async (req, res) => {
//   const { objectType } = req.body;  // Extract objectType from the request body
  
//   try {
//     console.log('im here 2')
//     const portalId = req.session.portalId 
//     // || '47070065'
//     if (!portalId) {
//       return res.status(400).json({ error: 'Portal ID not found in session' });
//     }

//     // Retrieve the OAuth token for the portalId
//     const accessToken = await getAccessToken(portalId);
//     const hubspotClient = new hubspot.Client();
//     hubspotClient.setAccessToken(accessToken);

//     // Fetch the multi-select properties for the given object type
//     const propertiesResponse = await hubspotClient.crm.properties.coreApi.getAll(objectType);
//     const multiSelectProperties = propertiesResponse.results.filter(property =>
//       property.fieldType === 'checkbox' || property.fieldType === 'select'
//     );

//     const dropdownOptions = multiSelectProperties.map(property => ({
//       label: property.label,
//       value: property.name
//     }));

//     res.status(200).json(dropdownOptions);
//   } catch (error) {
//     console.error('Error fetching multi-select properties:', error.message);
//     res.status(500).json({ error: 'Error fetching multi-select properties.' });
//   }
// };

// Fetch options for a selected multi-select property
// exports.getPropertyOptions = async (req, res) => {
//   const { objectType, propertyName } = req.query;  // Extract objectType and propertyName from query parameters

//   if (!objectType || !propertyName) {
//     return res.status(400).json({ error: 'Missing object type or property name parameter' });
//   }

//   try {console.log('im here 3')
//     const portalId = req.session.portalId 
//     // || '47070065'
//     if (!portalId) {
//       return res.status(400).json({ error: 'Portal ID not found in session' });
//     }

//     // Retrieve the OAuth token for the portalId
//     const accessToken = await getAccessToken(portalId);
//     const hubspotClient = new hubspot.Client();
//     hubspotClient.setAccessToken(accessToken);

//     // Fetch the specific property definition to get its options
//     const propertyResponse = await hubspotClient.crm.properties.coreApi.getByName(objectType, propertyName);
//     const propertyOptions = propertyResponse.options;

//     if (!propertyOptions || propertyOptions.length === 0) {
//       return res.status(404).json({ error: 'No options available for the selected property' });
//     }

//     // Return the property options for checkboxes and select fields
//     res.status(200).json({
//       options: propertyOptions.map(option => ({
//         label: option.label,
//         value: option.value
//       }))
//     });
//   } catch (error) {
//     console.error('Error fetching property options:', error.message);
//     res.status(500).json({ error: 'Error fetching property options.' });
//   }
// };


exports.getAllObjects = async (req, res) => {
  try {
    const {portalId } = req.body; // Retrieve portalId from session
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
// exports.getProperties = async (req, res) => {
//   try {
//     // Extract objectType and filterType from inputFields
//     const { inputFields, portalId } = req.body; // Extract portalId from the request body
//     const objectType = inputFields.objectTypeSelect?.value;
//     const filterType = inputFields.filterTypeSelect?.value;

//     // Check if objectType is provided
//     if (!objectType) {
//       return res.status(400).json({ error: 'Missing object type parameter' });
//     }

//     // Check if portalId is provided
//     if (!portalId) {
//       return res.status(400).json({ error: 'Portal ID not provided in the request' });
//     }

//     // Retrieve the OAuth token for the portalId
//     const accessToken = await getAccessToken(portalId);

//     // Make the API request to fetch properties for the given object type
//     const response = await axios.get(`https://api.hubapi.com/crm/v3/properties/${objectType}`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     // Filter properties based on fieldType if provided
//     let properties = response.data.results;
//     if (filterType) {
//       properties = properties.filter((property) => property.fieldType === filterType);
//     }

//     // Format the properties into an array with label and value
//     const formattedProperties = properties.map((property) => ({
//       label: property.label,
//       value: property.name,
//     }));

//     res.status(200).json({ options: formattedProperties });
//   } catch (error) {
//     console.error('Error fetching properties:', error.message);
//     res.status(500).json({ error: 'Error fetching properties.' });
//   }
// };


exports.getMultiSelectProperties = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    // Extract objectType and portalId from inputFields and request body
    const { inputFields, portalId } = req.body;
    const objectType = inputFields.objectTypeSelect?.value;

    // Validate objectType and portalId
    if (!objectType) {
      return res.status(400).json({ error: 'Missing object type parameter' });
    }
    if (!portalId) {
      return res.status(400).json({ error: 'Portal ID not provided in the request' });
    }

    // Retrieve the OAuth token for the portalId
    const accessToken = await getAccessToken(portalId);

    // Make the API request to fetch properties for the given object type
    const response = await axios.get(`https://api.hubapi.com/crm/v3/properties/${objectType}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Filter properties for 'checkbox' or 'select' field types
    const properties = response.data.results.filter(
      (property) => property.fieldType === 'checkbox' || property.fieldType === 'select'
    );

    // Check if there are no multi-select properties
    if (properties.length === 0) {
      return res.status(200).json({
        options: [
          {
            label: "No properties available",
            value: "None"
          }
        ]
      });
    }

    // Format the properties for the dropdown options
    const formattedProperties = properties.map((property) => ({
      label: property.label,
      value: property.name,
    }));

    res.status(200).json({ options: formattedProperties });
  } catch (error) {
    console.error('Error fetching multi-select properties:', error.message);
    res.status(500).json({ error: 'Error fetching multi-select properties.' });
  }
};




exports.getPropertyOptions = async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    // Extract portalId and inputFields from the request body
    const { inputFields, portalId } = req.body;
    const objectType = inputFields.objectTypeSelect?.value;
    const propertyName = inputFields.multiSelectProperty?.value;

    // Validate portalId, objectType, and propertyName
    if (!portalId) {
      return res.status(400).json({ error: 'Portal ID not provided in the request' });
    }
    if (!objectType || !propertyName) {
      return res.status(400).json({ error: 'Object type or property name is missing' });
    }

    // Retrieve the OAuth token for the portalId
    const accessToken = await getAccessToken(portalId);
    const hubspotClient = new hubspot.Client();
    hubspotClient.setAccessToken(accessToken);

    // Fetch the specific property details from HubSpot
    const propertyResponse = await hubspotClient.crm.properties.coreApi.getByName(objectType, propertyName);

    // Access the property directly from propertyResponse
    const property = propertyResponse;

    console.log('Property:', property);

    // Check if the property and its options exist
    if (!property || !property.options || property.options.length === 0) {
      return res.status(200).json({
        options: [
          {
            label: "No option available",
            value: "None"
          }
        ]
      });
    }

    // Filter out hidden options if needed
    const visibleOptions = property.options.filter(option => !option.hidden);

    // Check if there are any visible options
    if (visibleOptions.length === 0) {
      return res.status(200).json({
        options: [
          {
            label: "No option available",
            value: "None"
          }
        ]
      });
    }

    // Format the visible options into an array with label and value
    const options = visibleOptions.map(option => ({
      label: option.label || 'Unnamed Option',
      value: option.value
    }));

    res.status(200).json({ options });
  } catch (error) {
    console.error('Error fetching property options:', error.message);
    res.status(500).json({ error: 'Error fetching property options.' });
  }
};


// exports.removePropertyOption = async (req, res) => {
//   try {
//     console.log("req body for remove", req.body);

//     // Correctly extract necessary fields from the request body
//     const portalId = req.body.origin.portalId;
//     const { inputFields } = req.body;
//     const objectType = inputFields.objectTypeSelect;
//     const propertyName = inputFields.multiSelectProperty;
//     const optionValue = inputFields.optionToRemove;

//     // Validate input
//     if (!portalId) {
//       return res.json({
//         outputFields: { message: 'Portal ID not provided in the request' }
//       });
//     }
//     if (!objectType || !propertyName || !optionValue) {
//       return res.json({
//         outputFields: { message: 'Missing required parameters' }
//       });
//     }

//     // Retrieve the OAuth token for the portalId
//     const accessToken = await getAccessToken(portalId);
//     if (!accessToken) {
//       return res.json({
//         outputFields: { message: 'Failed to retrieve access token' }
//       });
//     }

//     // Initialize HubSpot client with the access token
//     const hubspotClient = new hubspot.Client();
//     hubspotClient.setAccessToken(accessToken);

//     // Fetch the existing property details from HubSpot
//     const propertyResponse = await hubspotClient.crm.properties.coreApi.getByName(objectType, propertyName);
//     const property = propertyResponse;

//     // Ensure the property and its options exist
//     if (!property || !property.options || !Array.isArray(property.options)) {
//       return res.json({
//         outputFields: { message: 'Property or options not found' }
//       });
//     }

//     // Filter out the option to be removed
//     const updatedOptions = property.options.filter(option => option.value !== optionValue);

//     // Check if the option was found and removed
//     if (updatedOptions.length === property.options.length) {
//       return res.json({
//         outputFields: { message: 'Option to remove not found' }
//       });
//     }

//     // Update the property with the remaining options
//     await hubspotClient.crm.properties.coreApi.update(objectType, propertyName, { options: updatedOptions });

//     // Respond with a success message
//     res.json({ outputFields: { message: 'Option removed successfully' } });
//   } catch (error) {
//     console.error('Error removing property option:', error.message);
//     res.json({
//       outputFields: { message: 'Error removing property option: ' + error.message }
//     });
//   }
// };

exports.removePropertyOption = async (req, res) => {
  try {
    console.log("req body for remove", req.body);

    // Extract necessary fields from the request body
    const portalId = req.body.origin.portalId;
    const { objectId, objectType } = req.body.object;
    const { inputFields } = req.body;
    const propertyName = inputFields.multiSelectProperty;
    const optionValueToRemove = inputFields.optionToRemove;

    // Validate input
    if (!portalId) {
      return res.json({
        outputFields: { message: 'Portal ID not provided in the request' }
      });
    }
    if (!objectId || !objectType || !propertyName || !optionValueToRemove) {
      return res.json({
        outputFields: { message: 'Missing required parameters' }
      });
    }

    // Retrieve the OAuth token for the portalId
    const accessToken = await getAccessToken(portalId);
    if (!accessToken) {
      return res.json({
        outputFields: { message: 'Failed to retrieve access token' }
      });
    }

    // Initialize HubSpot client with the access token
    const hubspotClient = new hubspot.Client({ accessToken });

    // Use the appropriate HubSpot API client based on the object type
    let objectApi;
    if (objectType === 'contacts') {
      objectApi = hubspotClient.crm.contacts.basicApi;
    } else if (objectType === 'deals') {
      objectApi = hubspotClient.crm.deals.basicApi;
    } else if (objectType === 'companies') {
      objectApi = hubspotClient.crm.companies.basicApi;
    } else {
      return res.json({
        outputFields: { message: `Unsupported object type: ${objectType}` }
      });
    }

    // Fetch the current property value for the specific object
    const objectResponse = await objectApi.getById(objectId, [propertyName]);
    const currentPropertyValue = objectResponse.body.properties[propertyName];

    if (!currentPropertyValue) {
      return res.json({
        outputFields: { message: `Property ${propertyName} not found on the object` }
      });
    }

    // Split the current multi-select values into an array
    let valuesArray = currentPropertyValue.split(';');

    // Remove the specified option value
    valuesArray = valuesArray.filter(value => value.trim() !== optionValueToRemove.trim());

    // Join the values back into a string
    const updatedPropertyValue = valuesArray.join(';');

    // Prepare the properties to update
    const properties = {
      [propertyName]: updatedPropertyValue
    };

    // Update the object with the new property value
    await objectApi.update(objectId, { properties });

    // Respond with a success message
    res.json({ outputFields: { message: 'Option value removed successfully' } });
  } catch (error) {
    console.error('Error removing option value:', error.message);
    res.json({
      outputFields: { message: 'Error removing option value: ' + error.message }
    });
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


