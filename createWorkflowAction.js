// require('dotenv').config();
// const axios = require('axios');
// const { getAccessToken } = require('./controllers/hubspotController');  // Assuming you have this function to retrieve access tokens
// const createWorkflowAction = async (req, res) => {
//   try {
//     console.log(process.env.HUBSPOT_API_KEY)
//     console.log(process.env.HUBSPOT_APP_ID)
//     const url = `https://api.hubapi.com/automation/v4/actions/${process.env.HUBSPOT_APP_ID}?${process.env.HUBSPOT_API_KEY}`;
    
//     const workflowAction = {
//       actionUrl: `${process.env.WEB_URL}/remove-multiselect-value`, 
//       objectTypes: ["CONTACT"],  
//       published: true,
//       inputFields: [
//         {
//           typeDefinition: {
//             name: "objectType",
//             type: "string",
//             fieldType: "select"
//           },
//           supportedValueTypes: ["STATIC_VALUE"],
//           isRequired: true,
//           dynamicOptionsUrl: {
//             url: `${process.env.WEB_URL}/get-object`,
//             method: "POST",
//             requestBodyTemplate: "{}"  
//           }
//         },
//         {
//           typeDefinition: {
//             name: "multiselectProperty",
//             type: "string",
//             fieldType: "select"
//           },
//           supportedValueTypes: ["STATIC_VALUE"],
//           isRequired: true,
//           dynamicOptionsUrl: {
//             url: `${process.env.WEB_URL}/get-multiselect-properties`,
//             method: "POST",
//             requestBodyTemplate: '{"objectType": "{{objectType}}"}' 
//           }
//         },
//         {
//           typeDefinition: {
//             name: "removeValue",
//             type: "string",
//             fieldType: "checkbox"
//           },
//           supportedValueTypes: ["STATIC_VALUE"],
//           isRequired: true,
//           dynamicOptionsUrl: {
//             url: `${process.env.WEB_URL}/get-property-options`,
//             method: "POST",
//             requestBodyTemplate: '{"objectType": "{{objectType}}", "propertyName": "{{multiselectProperty}}"}'  // Pass both objectType and propertyName
//           }
//         }
//       ],
//       outputFields: [
//         {
//           typeDefinition: {
//             name: "output",
//             type: "string",
//             fieldType: "text"
//           },
//           supportedValueTypes: ["STATIC_VALUE"]
//         }
//       ],
//       objectRequestOptions: {
//         properties: ["hs_object_id"]
//       },
//       labels: {
//         en: {
//           actionName: "Remove Multi-Select Values",
//           actionDescription: "Remove values from a multi-select property",
//           inputFieldLabels: {
//             objectType: "Select Object Type",
//             multiselectProperty: "Select Multi-Select Property",
//             removeValue: "Select Values to Remove"
//           },
//           outputFieldLabels: {
//             output: "Updated Property Values"
//           }
//         }
//       },
//       functions: [
//         {
//           functionType: "PRE_ACTION_EXECUTION",
//           functionSource: `exports.main = function(event, callback) {
//             const { objectType, multiselectProperty, removeValue } = event.inputFields;
//             const webhookUrl = "${process.env.WEB_URL}/remove-multiselect-value";
//             const body = {
//               objectType,
//               multiselectProperty,
//               removeValue,
//               hs_object_id: event.object.properties.hs_object_id
//             };
//             return callback({
//               webhookUrl,
//               body: JSON.stringify(body),
//               contentType: 'application/json',
//               accept: 'application/json',
//               httpMethod: 'POST'
//             });
//           };`
//         }
//       ]
//     };

//     const response = await axios.post(url, workflowAction);

//     console.log('Workflow action registered successfully:', response.data);
//   } catch (error) {
//     console.error('Error creating workflow action:', error.response?.data || error.message);
//   }
// };


// createWorkflowAction()


require('dotenv').config();
const axios = require('axios');

const createWorkflowAction = async (req, res) => {
  try {
    const url = `https://api.hubapi.com/automation/v4/actions/${process.env.HUBSPOT_APP_ID}?hapikey=${process.env.HUBSPOT_API_KEY}`;

    const workflowAction = {
      actionUrl: `${process.env.WEB_URL}/set-property-value`,  // The URL that will handle setting the property value
      objectTypes: ["CONTACT"],  // You can include other objects like "DEAL", "COMPANY", etc.
      published: true,
      inputFields: [
        {
          typeDefinition: {
            name: "property",  // The selected property
            type: "string",
            fieldType: "select"
          },
          supportedValueTypes: ["STATIC_VALUE"],
          isRequired: true,
          dynamicOptionsUrl: {
            url: `${process.env.WEB_URL}/get-contact-property`,  // URL to get contact properties dynamically
            method: "POST",
            requestBodyTemplate: "{}"  // Body template to send if needed
          }
        },
        {
          typeDefinition: {
            name: "propertyValue",  // The new value for the selected property
            type: "string",
            fieldType: "text"
          },
          supportedValueTypes: ["STATIC_VALUE"],
          isRequired: true
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
        properties: ["hs_object_id"]  // Retrieve the internal ID of the object
      },
      labels: {
        en: {
          actionName: "Set Property Value",
          actionDescription: "Set a value for a selected property",
          inputFieldLabels: {
            property: "Property to Set",
            propertyValue: "New Value"
          },
          outputFieldLabels: {
            output: "Updated Property"
          }
        }
      },
      functions: [
        {
          functionType: "PRE_ACTION_EXECUTION",
          functionSource: `exports.main = function(event, callback) {
            const { property, propertyValue } = event.inputFields;

            const webhookUrl = "${process.env.WEB_URL}/set-property-value";  // The backend that will handle updating the property value
            const body = {
              property: property,
              propertyValue: propertyValue,
              hs_object_id: event.object.properties.hs_object_id  // Send the internal object ID
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

    // Register the workflow action with HubSpot
    const response = await axios.post(url, workflowAction);
    console.log('Workflow action registered successfully:', response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating workflow action:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error creating workflow action', error });
  }
};

createWorkflowAction();
