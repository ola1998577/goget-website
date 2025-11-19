const prisma = require('../config/database');

// Get prizes
const getPrizes = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    const prizes = await prisma.prize.findMany();

    const formattedPrizes = prizes.map(prize => {
      return {
        id: prize.id.toString(),
        title: prize.title,
        name: prize.title, // Use title directly since there are no translations
      };
    });

    res.json({ prizes: formattedPrizes });
  } catch (error) {
    console.error('[v0] getPrizes error:', error && error.stack ? error.stack : error);
    next(error);
  }
};

// Spin wheel
const spinWheel = async (req, res, next) => {
  try {
    // Helper to coerce user id to BigInt when possible
    const toBigInt = (v) => {
      try {
        if (typeof v === 'bigint') return v;
        if (typeof v === 'string' && v.match(/^\d+$/)) return BigInt(v);
        if (typeof v === 'number' && Number.isSafeInteger(v)) return BigInt(v);
      } catch (e) {
        // fallthrough
      }
      return v;
    };

    const userId = toBigInt(req.user && req.user.id);

    // Get all prizes
    const prizes = await prisma.prize.findMany();

    if (!prizes || prizes.length === 0) {
      return res.status(404).json({ error: 'No prizes available' });
    }

    // Select random prize
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];

    console.info('[v0] spinWheel: awarding prize', randomPrize && randomPrize.id, 'to user', String(userId));

    // Award prize to user (use coerced id when possible)
    await prisma.prizeUser.create({
      data: {
        userId: userId,
        prizeId: randomPrize.id,
      }
    });

    // Parse prize value and update user points if applicable
    let prizeValue = null;
    try {
      const parsed = parseInt(String(randomPrize.title || ''), 10);
      prizeValue = Number.isNaN(parsed) ? null : parsed;
    } catch (e) {
      prizeValue = null;
    }

    if (prizeValue !== null && prizeValue > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (user) {
        const currentPoints = parseInt(String(user.point || '0'), 10) || 0;
        const newPoints = currentPoints + prizeValue;
        await prisma.user.update({
          where: { id: userId },
          data: {
            point: String(newPoints),
          }
        });
      }
    }

    res.json({
      message: 'Congratulations!',
      prize: {
        id: randomPrize.id.toString(),
        title: randomPrize.title,
      },
      pointsEarned: prizeValue || 0,
    });
  } catch (error) {
    console.error('[v0] spinWheel error:', error && error.stack ? error.stack : error);
    next(error);
  }
};

// Get user prizes
const getUserPrizes = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    const userPrizes = await prisma.prizeUser.findMany({
      where: { userId: req.user.id },
      include: {
        prize: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPrizes = userPrizes.map(up => {
      const translation = up.prize.translations[0] || {};
      return {
        id: up.id.toString(),
        prize: {
          id: up.prize.id.toString(),
          title: up.prize.title,
          name: translation.name || 'Prize',
        },
        wonAt: up.createdAt,
      };
    });

    res.json({ prizes: formattedPrizes });
  } catch (error) {
    console.error('[v0] getUserPrizes error:', error && error.stack ? error.stack : error);
    next(error);
  }
};

module.exports = {
  getPrizes,
  spinWheel,
  getUserPrizes,
};
