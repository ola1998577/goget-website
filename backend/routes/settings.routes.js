const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

router.get('/', settingsController.getSettings);
router.get('/banners', settingsController.getBanners);

module.exports = router;
