const express = require('express');
const router = express.Router();
const {getContactProperties, setPropertyValue} = require('../controllers/testController');

router.post('/get-contact-property', getContactProperties);
router.post('/set-property-value', setPropertyValue);

module.exports = router;