const express = require('express');
const { customerpost, customerget} = require('../controllers/customercontroller');
const router = express.Router();


router.post('/customerPage',customerpost );
router.post('/customers/:id', customerget );

module.exports = router;