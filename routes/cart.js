const express = require('express');
const {getCartItems,addItemToCart,removeItemFromCart} = require('../controllers/cartcontroller');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.get('/Cart',authMiddleware,getCartItems );
router.post('/Cart',authMiddleware,addItemToCart);
router.delete('/Cart',authMiddleware,removeItemFromCart);

module.exports = router;