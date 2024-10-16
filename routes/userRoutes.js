const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/get_all', userController.get_all_contact);

module.exports = router;