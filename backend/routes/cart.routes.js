const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { auth } = require('../middlewares/auth');

router.get('/', auth, cartController.getCart);
router.post('/', auth, cartController.addToCart);
router.delete('/:id', auth, cartController.removeFromCart);
router.delete('/', auth, cartController.clearCart);

module.exports = router;
