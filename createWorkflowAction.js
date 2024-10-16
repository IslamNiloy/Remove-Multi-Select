const axios = require('axios');

const createWorkflowAction = async () => {
  const apiKey = process.env.HUBSPOT_API_KEY; // API Key or OAuth Token
  const url = `https://api.hubapi.com/automation/v4/actions/${process.env.HUBSPOT_APP_ID}`;

  const workflowAction = {
    actionUrl: "https://remove-multi-select.vercel.app/remove-multiselect-value", // Backend API URL
    objectTypes: ["CONTACT"], 
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
        // Dynamic dropdown for objects
        dynamicOptionsUrl: "https://remove-multi-select.vercel.app/get-object"
      },
      {
        typeDefinition: {
          name: "multiselectProperty",
          type: "string",
          fieldType: "select"
        },
        supportedValueTypes: ["STATIC_VALUE"],
        isRequired: true,
        // Dynamic dropdown for multi-select properties
        dynamicOptionsUrl: "https://remove-multi-select.vercel.app/get-multiselect-properties?objectType={{objectType}}"
      },
      {
        typeDefinition: {
          name: "removeValue",
          type: "string",
          fieldType: "checkbox"
        },
        supportedValueTypes: ["STATIC_VALUE"],
        isRequired: true,
        // Dynamic options for property values
        dynamicOptionsUrl: "https://remove-multi-select.vercel.app/get-property-options?objectType={{objectType}}&propertyName={{multiselectProperty}}"
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
          const webhookUrl = 'https://your-backend-url/remove-multiselect-value';
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
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Workflow action registered successfully:', response.data);
  } catch (error) {
    console.error('Error creating workflow action:', error.response?.data || error.message);
  }
};

createWorkflowAction();