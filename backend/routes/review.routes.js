const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { auth } = require('../middlewares/auth');

router.get('/product/:id', reviewController.getProductReviews);
router.post('/', auth, reviewController.addReview);

module.exports = router;
