const express = require('express');
const router = express.Router();
const { getAllObjects, getProperties } = require('../controllers/workflowController'); // Import the new functions
const { getObjectTypes, getMultiSelectProperties, getPropertyOptions } = require('../controllers/workflowController');
const workflow = require('../controllers/createWorkflowAction'); // Ensure this path and file exist

// Define routes for fetching object types and properties
router.post('/get-object', getObjectTypes);
router.post('/get-multiselect-properties', getMultiSelectProperties);
router.post('/get-property-options', getPropertyOptions);

// New routes for fetching all objects and properties of a selected object
router.get('/get-all-objects', getAllObjects); // Use GET to fetch all object types
router.post('/get-properties', getProperties); // Use POST to fetch properties for a given object type

// Route for creating a workflow action
router.get('/create-workflow', workflow.createWorkflowAction);

module.exports = router;
