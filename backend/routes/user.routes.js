const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth');

router.get('/addresses', auth, userController.getUserAddresses);
router.post('/addresses', auth, userController.addAddress);
router.put('/addresses/:id', auth, userController.updateAddress);
router.delete('/addresses/:id', auth, userController.deleteAddress);

module.exports = router;
