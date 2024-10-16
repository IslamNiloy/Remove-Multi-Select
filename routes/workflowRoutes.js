const express = require('express');
const router = express.Router();
const {getObjectTypes,getMultiSelectProperties, getPropertyOptions} = require('../controllers/workflowController');

router.get('/get-object', getObjectTypes);
router.get('/get-multiselect-properties', getMultiSelectProperties);
router.get('/get-property-options', getPropertyOptions);


module.exports = router;