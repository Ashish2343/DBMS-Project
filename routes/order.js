const express = require('express');
const { createOrder, getOrder, cancelOrder } = require('../controllers/ordercontroller');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/orders', authMiddleware, createOrder);
router.get('/orders', authMiddleware, getOrder);
router.delete('/orders', authMiddleware, cancelOrder);

module.exports = router;
