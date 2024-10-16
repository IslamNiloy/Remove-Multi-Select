const express = require('express');
const router = express.Router();
const {get_all_contact,property_values, get_properties} = require('../controllers/userController');

router.get('/get-all', get_all_contact);
router.get('/get-properties', get_properties);
router.get('/get-values', property_values);


module.exports = router;