const prisma = require('../config/database');

// Helper: calculate user's current tier based on monthly orders
const getUserTier = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyOrders = await prisma.order.count({
    where: {
      userId: userId,
      status: 'done',
      createdAt: { gte: monthStart }
    }
  });
  // The loyalty tables may not exist in older databases; guard against missing tables
  let tiers = [];
  try {
    tiers = await prisma.loyaltyTier.findMany({ orderBy: { minOrders: 'desc' } });
  } catch (e) {
    console.warn('[v0] loyalty tiers not available or migration missing:', e && e.message ? e.message : e);
    tiers = [];
  }

  let currentTier = null;
  for (const tier of tiers) {
    if (monthlyOrders >= tier.minOrders) {
      currentTier = tier;
      break;
    }
  }

  return { tier: currentTier, monthlyOrders };
};

// Get user loyalty profile
const getUserLoyaltyProfile = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { point: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { tier, monthlyOrders } = await getUserTier(req.user.id);

    // Fetch rewards, user rewards and history defensively: if tables are missing, return empty arrays
    let rewards = [];
    try {
      rewards = await prisma.loyaltyReward.findMany({
        where: { status: 'active' },
        include: {
          translations: { where: { language: lang } }
        }
      });
    } catch (e) {
      console.warn('[v0] loyalty rewards not available:', e && e.message ? e.message : e);
      rewards = [];
    }

    let userRewards = [];
    try {
      userRewards = await prisma.userLoyaltyReward.findMany({
        where: { userId: req.user.id, status: { in: ['pending', 'used'] } },
        include: { loyaltyReward: { include: { translations: { where: { language: lang } } } } }
      });
    } catch (e) {
      console.warn('[v0] user loyalty rewards not available:', e && e.message ? e.message : e);
      userRewards = [];
    }

    let pointHistory = [];
    try {
      pointHistory = await prisma.loyaltyPointHistory.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 20 });
    } catch (e) {
      console.warn('[v0] loyalty point history not available:', e && e.message ? e.message : e);
      pointHistory = [];
    }

    const currentPoints = parseInt(String(user?.point || '0')) || 0;
    const tierName = tier ? (tier.translations?.[0]?.name || tier.name) : null;

    res.json({
      success: true,
      profile: {
        currentPoints,
        currentTier: {
          name: tierName,
          monthlyOrders,
        },
        rewards: rewards.map(r => ({
          id: String(r.id),
          title: (r.translations && r.translations[0]?.title) || r.title || 'Reward',
          description: (r.translations && r.translations[0]?.description) || '',
          pointsRequired: r.pointsRequired || 0,
          discountAmount: r.discountAmount || 0,
          type: r.type || 'discount',
          available: currentPoints >= (r.pointsRequired || 0)
        })),
        earnedRewards: userRewards.map(ur => ({
          id: String(ur.id),
          title: (ur.loyaltyReward && ur.loyaltyReward.translations && ur.loyaltyReward.translations[0]?.title) || (ur.loyaltyReward && ur.loyaltyReward.title) || 'Reward',
          status: ur.status,
          usedAt: ur.usedAt,
          expiresAt: ur.expiresAt
        })),
        pointHistory: pointHistory.map(ph => ({
          id: String(ph.id),
          points: ph.points,
          reason: ph.reason,
          createdAt: ph.createdAt
        }))
      }
    });
  } catch (error) {
    console.error("[v0] Loyalty profile error:", error && error.stack ? error.stack : error);
    res.status(500).json({ success: false, message: 'Database error occurred' });
  }
};

// Get loyalty tiers
const getLoyaltyTiers = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { minOrders: 'asc' },
      include: {
        translations: {
          where: { language: lang }
        }
      }
    });

    res.json({
      success: true,
      data: tiers.map(tier => ({
        id: tier.id.toString(),
        name: tier.translations[0]?.name || tier.name,
        description: tier.translations[0]?.description || tier.description,
        minOrders: tier.minOrders,
        benefits: tier.benefits ? JSON.parse(tier.benefits) : []
      }))
    });
  } catch (error) {
    console.error("[v0] claimReward error:", error && error.stack ? error.stack : error);
    next(error);
  }
};

// Claim a reward
const claimReward = async (req, res, next) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({ error: 'Reward ID is required' });
    }

    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: BigInt(rewardId) }
    });

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { point: true }
    });

    const currentPoints = parseInt(user?.point || '0');

    if (currentPoints < reward.pointsRequired) {
      return res.status(400).json({ error: 'Not enough points' });
    }

    // Create user reward
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Expires in 1 month

    const userReward = await prisma.userLoyaltyReward.create({
      data: {
        userId: req.user.id,
        loyaltyRewardId: BigInt(rewardId),
        expiresAt: expiryDate
      }
    });

    // Deduct points
    const newPoints = currentPoints - reward.pointsRequired;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { point: newPoints.toString() }
    });

    res.json({
      success: true,
      message: 'Reward claimed successfully',
      reward: {
        id: userReward.id.toString(),
        rewardId: userReward.loyaltyRewardId.toString(),
        expiresAt: userReward.expiresAt
      }
    });
  } catch (error) {
    console.error("[v0] useReward error:", error && error.stack ? error.stack : error);
    next(error);
  }
};

// Use a reward (apply discount)
const useReward = async (req, res, next) => {
  try {
    const { userRewardId } = req.body;

    if (!userRewardId) {
      return res.status(400).json({ error: 'User Reward ID is required' });
    }

    const userReward = await prisma.userLoyaltyReward.findFirst({
      where: {
        id: BigInt(userRewardId),
        userId: req.user.id,
        status: 'pending'
      },
      include: { loyaltyReward: true }
    });

    if (!userReward) {
      return res.status(404).json({ error: 'Reward not found or already used' });
    }

    // Check if expired
    if (userReward.expiresAt && new Date() > userReward.expiresAt) {
      return res.status(400).json({ error: 'Reward has expired' });
    }

    // Update reward to used
    await prisma.userLoyaltyReward.update({
      where: { id: BigInt(userRewardId) },
      data: {
        status: 'used',
        usedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Reward applied successfully',
      discount: parseFloat(userReward.loyaltyReward.discountAmount)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserLoyaltyProfile,
  getLoyaltyTiers,
  claimReward,
  useReward
};
