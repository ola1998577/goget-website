const prisma = require('../config/database');

// Validate promo code
const validatePromoCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const promoCode = await prisma.promoCode.findFirst({
      where: { code }
    });

    if (!promoCode) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    if (promoCode.status !== 'active') {
      return res.status(400).json({ error: 'This promo code is no longer active' });
    }

    // Check expiration
    if (promoCode.discountExp && new Date(promoCode.discountExp) < new Date()) {
      return res.status(400).json({ error: 'This promo code has expired' });
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usage >= promoCode.usageLimit) {
      return res.status(400).json({ error: 'This promo code has reached its usage limit' });
    }

    res.json({
      valid: true,
      promoCode: {
        id: promoCode.id.toString(),
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountAmount: parseFloat(promoCode.discountAmount),
      }
    });
  } catch (error) {
    next(error);
  }
};

// Apply promo code (increment usage)
const applyPromoCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    const promoCode = await prisma.promoCode.findFirst({
      where: { code }
    });

    if (!promoCode) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    // Increment usage
    await prisma.promoCode.update({
      where: { id: promoCode.id },
      data: { usage: promoCode.usage + 1 }
    });

    res.json({ message: 'Promo code applied successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validatePromoCode,
  applyPromoCode,
};
