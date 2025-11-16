const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { auth } = require('../middlewares/auth');

router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderById);
router.post('/', auth, orderController.createOrder);
router.put('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;
