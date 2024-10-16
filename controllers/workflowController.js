const hubspot = require('@hubspot/api-client');
const {getAccessToken,isAuthorized} = require('./hubspotController')
// Fetch available object types
exports.getObjectTypes = async (req, res) => {
  try {
    const availableObjects = ["contacts", "deals", "companies", "tickets"]; 

    // Return object types for the dropdown
    res.status(200).json({
      objectTypes: availableObjects.map(type => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type
      }))
    });
  } catch (error) {
    console.error("Error fetching object types:", error);
    res.status(500).json({ error: "Error fetching object types." });
  }
};

// Fetch multi-select properties for a given object type
exports.getMultiSelectProperties = async (req, res) => {
    const { objectType } = req.query;
  
    if (!objectType) {
      return res.status(400).json({ error: "Missing object type parameter" });
    }
  
    try {
      const accessToken = await getAccessToken(req.sessionID); // Your method to get accessToken
      const hubspotClient = new hubspot.Client({ accessToken });
  
      // Fetch all properties for the given objectType
      const propertiesResponse = await hubspotClient.crm.properties.coreApi.getAll(objectType);
      const multiSelectProperties = propertiesResponse.results.filter(property => property.fieldType === 'checkbox' || property.fieldType === 'select');
  
      // Return multi-select properties for the dropdown
      res.status(200).json({
        properties: multiSelectProperties.map(property => ({
          label: property.label,
          value: property.name
        }))
      });
    } catch (error) {
      console.error("Error fetching multi-select properties:", error);
      res.status(500).json({ error: "Error fetching multi-select properties." });
    }
  };

  // Fetch options for a selected multi-select property
exports.getPropertyOptions = async (req, res) => {
    const { objectType, propertyName } = req.query;
  
    if (!objectType || !propertyName) {
      return res.status(400).json({ error: "Missing object type or property name parameter" });
    }
  
    try {
      const accessToken = await getAccessToken(req.sessionID);
      const hubspotClient = new hubspot.Client({ accessToken });
  
      // Fetch the specific property definition to get its options
      const propertyResponse = await hubspotClient.crm.properties.coreApi.getByName(objectType, propertyName);
      const propertyOptions = propertyResponse.options;
  
      // Return the property options for checkboxes
      res.status(200).json({
        options: propertyOptions.map(option => ({
          label: option.label,
          value: option.value
        }))
      });
    } catch (error) {
      console.error("Error fetching property options:", error);
      res.status(500).json({ error: "Error fetching property options." });
    }
  };
