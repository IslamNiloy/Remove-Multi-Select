require('dotenv').config();
const axios = require('axios');


exports.getContactProperties = async (req, res) => {
  try {
    // Corrected API URL with v3 Properties API for contacts
    const url = `https://api.hubapi.com/crm/v3/properties/contacts?hapikey=${process.env.HUBSPOT_API_KEY}`;

    const response = await axios.get(url);

    // Check if the API call returned results
    if (response.data.results && response.data.results.length > 0) {
      // Map the data to format it as option[]
      const options = response.data.results.map(property => ({
        label: property.label,  // User-friendly label
        value: property.name,  // Internal name (used by HubSpot)
        description: property.label  // Optional description if required
      }));

      // Add pagination if there are more properties to fetch
      const paginationCursor = response.data.paging ? response.data.paging.next.after : null;

      // Return the options and pagination cursor in the required format
      return res.status(200).json({
        options: options,
        after: paginationCursor  // Include the pagination cursor if there are more options
      });
    } else {
      console.error("No properties found in the response.");
      return res.status(404).json({ message: "No properties found." });
    }
  } catch (error) {
    // Log the full error response for debugging
    console.error('Error fetching contact properties:', error.response?.data || error.message);

    // Return the error response
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
      const url = `https://api.hubapi.com/crm/v3/objects/contacts/${hs_object_id}?hapikey=${process.env.HUBSPOT_API_KEY}`;
  
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
  