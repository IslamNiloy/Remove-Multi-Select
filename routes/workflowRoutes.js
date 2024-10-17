const express = require('express');
const router = express.Router();
const { getObjectTypes, getMultiSelectProperties, getPropertyOptions } = require('../controllers/workflowController');
const workflow = require('../controllers/createWorkflowAction'); // Ensure this path and file exist

// Use POST for all routes since we are expecting input in the request body
router.post('/get-object', getObjectTypes);
router.post('/get-multiselect-properties', getMultiSelectProperties);
router.post('/get-property-options', getPropertyOptions);
router.get('/create-workflow', workflow.createWorkflowAction);

module.exports = router;
