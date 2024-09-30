const express = require('express');
const { createOrder } = require('../controllers/ordercontroller');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/orders', authMiddleware, createOrder);

module.exports = router;
