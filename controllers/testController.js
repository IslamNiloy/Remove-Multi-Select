require('dotenv').config();
const axios = require('axios');


exports.getContactProperties = async (req, res) => {
  try {
    // Corrected API URL with v3 Properties API for contacts
    const url = `https://api.hubapi.com/crm/v3/properties/contacts?hapikey=${process.env.HUBSPOT_API_KEY}`;

    const response = await axios.get(url);

    // Check if the API call returned results
    if (response.data.results && response.data.results.length > 0) {
      const properties = response.data.results.map(property => ({
        label: property.label,  // User-friendly label
        internalName: property.name,  // Internal name used by HubSpot API
        type: property.type,  // Type of property (e.g., string, number)
        value: property.defaultValue || ""  // Default value if available
      }));
      
      res.json(properties);  // Return the properties to the frontend
    } else {
      console.error("No properties found in the response.");
      res.status(404).json({ message: "No properties found." });
    }
  } catch (error) {
    // Log the full error response to understand the issue
    console.error('Error fetching contact properties:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Error fetching contact properties',
      error: error.response?.data || error.message,
    });
  }
};




exports.setPropertyValue = async (req, res) => {
  try {
    const { property, propertyValue, hs_object_id } = req.body;  // Get the property details and object ID

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

    res.json({ message: 'Property updated successfully', data: response.data });
  } catch (error) {
    console.error('Error updating property:', error.message);
    res.status(500).send('Internal Server Error');
  }
};
