require('dotenv').config();
const axios = require('axios');

exports.getContactProperties = async (req, res) => {
  // Handle CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Retrieve the request payload
  const { fetchOptions, inputFieldName, origin, objectTypeId, inputFields } = req.body;

  let allProperties = [];
  let after = fetchOptions?.after || undefined;  // Handle pagination cursor
  const limit = 10;  // Adjust this limit as necessary

  try {
    // Fetch contact properties from HubSpot using v3 properties API with pagination support
    do {
      const url = `https://api.hubapi.com/crm/v3/properties/contacts?hapikey=${process.env.HUBSPOT_HAPI_KEY}&limit=${limit}&after=${after || ''}`;
      const response = await axios.get(url);
      const properties = response.data.results;

      // Map properties into the expected format for HubSpot dropdown options
      const propertyList = properties.map(property => ({
        label: property.label,  // The label to show in the dropdown
        description: property.label,  // Optional: using label as description
        value: property.name  // The internal property name (value for setting the property)
      }));

      // Concatenate properties for the full list
      allProperties = allProperties.concat(propertyList);
      after = response.data.paging ? response.data.paging.next.after : undefined;

      // Handle filtering based on search query
      if (fetchOptions?.q) {
        const query = fetchOptions.q.toLowerCase();
        allProperties = allProperties.filter(property =>
          property.label.toLowerCase().includes(query)
        );
      }
    } while (after);

    // Send back the response with the options and pagination
    res.status(200).json({
      options: allProperties,  // The options HubSpot will use for the dropdown
      after: after || undefined,  // Handle pagination if there is a next page
      searchable: true  // Enable searching in the dropdown
    });
  } catch (e) {
    console.error(e.message === 'HTTP request failed' ? JSON.stringify(e.response, null, 2) : e);
    res.status(500).json({
      options: "hs_execution_state An error occurred while fetching the properties."
    });
  }
};




exports.setPropertyValue = async (req, res) => {
    try {
      const { property, propertyValue, hs_object_id } = req.body;  // Get the property details and object ID
  
      if (!property || !propertyValue || !hs_object_id) {
        return res.status(400).json({ message: 'Missing required fields: property, propertyValue, or hs_object_id' });
      }
  
      // Correct API Key variable
      const url = `https://api.hubapi.com/crm/v3/objects/contacts/${hs_object_id}?hapikey=${process.env.HUBSPOT_HAPI_KEY}`;
  
      const updateData = {
        properties: {
          [property]: propertyValue  // Update the selected property with the new value
        }
      };
  
      // Send the update request to HubSpot
      const response = await axios.patch(url, updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Return success response to client
      return res.status(200).json({ message: 'Property updated successfully', data: response.data });
    } catch (error) {
      console.error('Error updating property:', error.response?.data || error.message);
  
      // Return error response to client
      return res.status(500).json({
        message: 'Error updating property',
        error: error.response?.data || error.message,
      });
    }
  };
  