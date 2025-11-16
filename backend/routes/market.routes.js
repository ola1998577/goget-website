const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');

// Markets are essentially stores with special filtering
router.get('/', storeController.getStores);
router.get('/:id', storeController.getStoreById);
router.get('/:id/products', storeController.getStoreProducts);

module.exports = router;
