const {getAccessToken,isAuthorized} = require('./hubspotController')
const request = require('request-promise-native');

const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client();

exports.get_all_contact =  async (req, res) => {
    if (isAuthorized(req.sessionID)) {
      const accessToken = await getAccessToken(req.sessionID);
      try {
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        };
        const result = await request.get('https://api.hubapi.com/contacts/v1/lists/all/contacts/all?count=1', {
          headers: headers
        });
        res.json(result)
      } catch (e) {
        console.error('  > Unable to retrieve contact:');
        res.json(e.response);
      }
    } else {
      return 0;
    }
  };

// Endpoint to fetch available properties
exports.get_properties = async (req, res) => {
  if (isAuthorized(req.sessionID)) {
    const accessToken = await getAccessToken(req.sessionID);
    try {
      hubspotClient.setAccessToken(accessToken);
      const propertiesResponse = await hubspotClient.crm.properties.coreApi.getAll('contacts');
      const properties = propertiesResponse.results.map(property => ({
        label: property.label,
        value: property.name,
      }));
      
      res.json(properties);
      
    } catch (e) {
      console.error('  > Unable to retrieve contact properties:', e.message);
      // Respond with the error message and status code
      res.status(e.response?.status || 500).json({
        message: 'Unable to retrieve contact properties',
        error: e.message
      });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized access' });
  }
};



// Endpoint to fetch property values based on the selected property
exports.property_values = async (req, res) => {
  if (isAuthorized(req.sessionID)) {
    const accessToken = await getAccessToken(req.sessionID);
    try {
      hubspotClient.setAccessToken(accessToken);
      const { propertyName } = req.body;
      const contactsResponse = await hubspotClient.crm.contacts.basicApi.getPage(
        OBJECTS_LIMIT,
        undefined,
        [propertyName]
      );

      const propertyValues = contactsResponse.results.map(contact => ({
        label: _.get(contact.properties, propertyName, 'N/A'),
        value: _.get(contact.properties, propertyName, 'N/A'),
      })).filter(item => item.value !== 'N/A'); // Filter out empty values

      res.status(200).json(propertyValues);
      
    } catch (e) {
      console.error('  > Unable to retrieve contact properties:', e.message);
      // Respond with the error message and status code
      res.status(e.response?.status || 500).json({
        message: 'Unable to retrieve contact properties',
        error: e.message
      });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized access' });
  }
} 