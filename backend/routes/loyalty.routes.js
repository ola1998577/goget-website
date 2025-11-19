const express = require('express');
const { auth } = require('../middlewares/auth');
const {
  getUserLoyaltyProfile,
  getLoyaltyTiers,
  claimReward,
  useReward
} = require('../controllers/loyalty.controller');

const router = express.Router();

// Get user's loyalty profile (protected)
router.get('/profile', auth, getUserLoyaltyProfile);

// Get all loyalty tiers (public)
router.get('/tiers', getLoyaltyTiers);

// Claim a reward (protected)
router.post('/claim-reward', auth, claimReward);

// Use a reward (protected)
router.post('/use-reward', auth, useReward);

module.exports = router;
