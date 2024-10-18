require('dotenv').config();
const axios = require('axios');


exports.getContactProperties = async (req, res) => {
  // Handle CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Retrieve request payload for pagination, search, etc.
  const { fetchOptions, inputFieldName, origin, objectTypeId, inputFields } = req.body;
  
  let after = fetchOptions?.after || undefined;  // Handle pagination cursor
  const limit = 100;  // You can adjust this limit as needed

  try {
    // API call to fetch contact properties from HubSpot (pagination can be handled here)
    const url = `https://api.hubapi.com/crm/v3/properties/contacts?hapikey=${process.env.HUBSPOT_HAPI_KEY}&limit=${limit}&after=${after || ''}`;
    const response = await axios.get(url);

    if (response.data.results && response.data.results.length > 0) {
      // Map the properties into the format expected by HubSpot for the dropdown
      let allOptions = response.data.results.map(property => ({
        label: property.label,  // User-friendly name
        description: property.label,  // Optional: Set description as label
        value: property.name  // Internal HubSpot property name (value for setting the property)
      }));

      // Handle search functionality if there is a query
      if (fetchOptions?.q) {
        const query = fetchOptions.q.toLowerCase();
        allOptions = allOptions.filter(option => option.label.toLowerCase().includes(query));
      }

      // Handle pagination if more results are available
      const paginationCursor = response.data.paging ? response.data.paging.next.after : undefined;

      // Return the options and pagination cursor to HubSpot
      return res.status(200).json({
        options: allOptions,
        after: paginationCursor || undefined,  // Return 'after' cursor for more results if available
        searchable: true  // Allow searching in the dropdown
      });
    } else {
      // No properties found case
      console.error('No properties found in the response.');
      return res.status(404).json({ message: 'No properties found.' });
    }
  } catch (error) {
    // Log the error for debugging
    console.error('Error fetching contact properties:', error.response?.data || error.message);

    // Return error response to HubSpot
    return res.status(500).json({
      message: 'Error fetching contact properties',
      error: error.response?.data || error.message,
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
  