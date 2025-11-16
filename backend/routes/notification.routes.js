const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { auth } = require('../middlewares/auth');

router.get('/', auth, notificationController.getNotifications);

module.exports = router;
