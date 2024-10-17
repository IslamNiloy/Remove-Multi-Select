const axios = require('axios');

exports.createWorkflowAction = async () => {
  const hapikey = process.env.HUBSPOT_API_KEY; // Your HubSpot Developer API key
  const url = `https://api.hubapi.com/automation/v4/actions/${process.env.HUBSPOT_APP_ID}?hapikey=${hapikey}`;

  const workflowAction = {
    actionUrl: `${process.env.WEB_URL}remove-multiselect-value`, // Your backend API URL
    objectTypes: ["CONTACT"],  // You can add more object types like "DEAL" or "COMPANY"
    published: true,
    inputFields: [
      {
        typeDefinition: {
          name: "objectType",
          type: "string",
          fieldType: "select"
        },
        supportedValueTypes: ["STATIC_VALUE"],
        isRequired: true,
        dynamicOptionsUrl: {
          url: `${process.env.WEB_URL}/get-object`,
          method: "POST",
          requestBodyTemplate: "{}"  // No additional data is required; we'll identify the HubSpot account from the OAuth token
        }
      },
      {
        typeDefinition: {
          name: "multiselectProperty",
          type: "string",
          fieldType: "select"
        },
        supportedValueTypes: ["STATIC_VALUE"],
        isRequired: true,
        dynamicOptionsUrl: {
          url: `${process.env.WEB_URL}/get-multiselect-properties`,
          method: "POST",
          requestBodyTemplate: '{"objectType": "{{objectType}}"}'  // Pass the selected object type dynamically
        }
      },
      {
        typeDefinition: {
          name: "removeValue",
          type: "string",
          fieldType: "checkbox"
        },
        supportedValueTypes: ["STATIC_VALUE"],
        isRequired: true,
        dynamicOptionsUrl: {
          url: `${process.env.WEB_URL}/get-property-options`,
          method: "POST",
          requestBodyTemplate: '{"objectType": "{{objectType}}", "propertyName": "{{multiselectProperty}}"}'  // Pass both objectType and propertyName
        }
      }
    ],
    outputFields: [
      {
        typeDefinition: {
          name: "output",
          type: "string",
          fieldType: "text"
        },
        supportedValueTypes: ["STATIC_VALUE"]
      }
    ],
    objectRequestOptions: {
      properties: ["hs_object_id"]
    },
    labels: {
      en: {
        actionName: "Remove Multi-Select Values",
        actionDescription: "Remove values from a multi-select property",
        inputFieldLabels: {
          objectType: "Select Object Type",
          multiselectProperty: "Select Multi-Select Property",
          removeValue: "Select Values to Remove"
        },
        outputFieldLabels: {
          output: "Updated Property Values"
        }
      }
    },
    functions: [
      {
        functionType: "PRE_ACTION_EXECUTION",
        functionSource: `exports.main = function(event, callback) {
          const { objectType, multiselectProperty, removeValue } = event.inputFields;
          const webhookUrl = "${process.env.WEB_URL}/remove-multiselect-value";
          const body = {
            objectType,
            multiselectProperty,
            removeValue,
            hs_object_id: event.object.properties.hs_object_id
          };
          return callback({
            webhookUrl,
            body: JSON.stringify(body),
            contentType: 'application/json',
            accept: 'application/json',
            httpMethod: 'POST'
          });
        };`
      }
    ]
  };

  try {
    const response = await axios.post(url, workflowAction, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Workflow action registered successfully:', response.data);
  } catch (error) {
    console.error('Error creating workflow action:', error.response?.data || error.message);
  }
};

