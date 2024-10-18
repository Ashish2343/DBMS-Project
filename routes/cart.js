const express = require('express');
const {getCartItems,addItemToCart} = require('../controllers/cartcontroller');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.get('/Cart',authMiddleware,getCartItems );
router.post('/Cart',authMiddleware,addItemToCart);

module.exports = router;