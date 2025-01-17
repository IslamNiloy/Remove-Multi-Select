const express = require('express');
const router = express.Router();
const { checkAssociateCompany} = require('../controllers/saraProjectController'); 


router.post('/check-associated-companies', checkAssociateCompany);


module.exports = router;
