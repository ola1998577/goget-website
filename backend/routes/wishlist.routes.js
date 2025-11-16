const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { auth } = require('../middlewares/auth');

router.get('/', auth, wishlistController.getWishlist);
router.post('/', auth, wishlistController.addToWishlist);
router.delete('/:id', auth, wishlistController.removeFromWishlist);

module.exports = router;
