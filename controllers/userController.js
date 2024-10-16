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

exports.removeMultiselectValue = async (req, res) => {
  console.log("Log the body", req.body);
  if (isAuthorized(req.sessionID)) {
    const accessToken = await getAccessToken(req.sessionID);
  try {
    const { propertyValue, removeValue, hs_object_id, propertyName } = req.body;

    // Create an instance of the HubSpot Client
    const hubspotClient = new hubspot.Client(accessToken);

    // Fetch the property definition to get the label-internal value mapping
    const propertyResponse = await hubspotClient.crm.properties.coreApi.getByName('contacts', propertyName);

    // Ensure the response contains 'options' before accessing it
    const propertyOptions = propertyResponse.options;
    if (!propertyOptions) {
      throw new Error(`Property options not found for ${propertyName}`);
    }

    // Log the fetched options to debug
    console.log("Property Options: ", JSON.stringify(propertyOptions, null, 2));

    // Convert the propertyValue (with labels) to internal values using the fetched options
    let valuesArray = propertyValue.split(',').map(valueLabel => {
      const matchedOption = propertyOptions.find(option => option.label === valueLabel.trim());
      return matchedOption ? matchedOption.value : valueLabel.trim();  // Convert to internal value if matched
    });

    // Convert the removeValue from label to its internal value
    const matchedRemoveOption = propertyOptions.find(option => option.label === removeValue.trim());
    const internalRemoveValue = matchedRemoveOption ? matchedRemoveOption.value : removeValue.trim();

    console.log("Internal remove value: " + internalRemoveValue);

    // Remove the value that matches the internal removeValue
    valuesArray = valuesArray.filter(value => value !== internalRemoveValue);

    // Join the array back into a string for updating the contact property
    const updatedPropertyValue = valuesArray.join('; ');

    // Prepare the properties to update using the internal values
    const properties = {
      [propertyName]: updatedPropertyValue
    };
    const SimplePublicObjectInput = { objectWriteTraceId: "string", properties };

    // Update the contact using the HubSpot API
    const apiResponse = await hubspotClient.crm.contacts.basicApi.update(hs_object_id, SimplePublicObjectInput);

    // Log the API response for debugging
    console.log("API Response: ", JSON.stringify(apiResponse, null, 2));

    // Send the updated value in the response
    res.status(200).json({
      "outputFields": {
        "output": updatedPropertyValue,
        "hs_execution_state": "SUCCESS"
      }
    });
  } catch (error) {
    console.error("Error: ", error.message);
    if (error.message === 'HTTP request failed') {
      console.error(JSON.stringify(error.response, null, 2));
    }
    res.status(500).send('Server Error');
    }
  }
};
