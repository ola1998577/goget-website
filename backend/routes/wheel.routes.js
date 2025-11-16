const express = require('express');
const router = express.Router();
const wheelController = require('../controllers/wheel.controller');
const { auth } = require('../middlewares/auth');

router.get('/prizes', wheelController.getPrizes);
router.post('/spin', auth, wheelController.spinWheel);
router.get('/user-prizes', auth, wheelController.getUserPrizes);

module.exports = router;
