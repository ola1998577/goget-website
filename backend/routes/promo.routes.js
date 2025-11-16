const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
const { auth } = require('../middlewares/auth');

router.post('/validate', auth, promoController.validatePromoCode);
router.post('/apply', auth, promoController.applyPromoCode);

module.exports = router;
