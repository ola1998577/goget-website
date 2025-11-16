const prisma = require('../config/database');

// Get prizes
const getPrizes = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    const prizes = await prisma.prize.findMany({
      include: {
        translations: {
          where: { language: lang }
        }
      }
    });

    const formattedPrizes = prizes.map(prize => {
      const translation = prize.translations[0] || {};
      return {
        id: prize.id.toString(),
        title: prize.title,
        name: translation.name || 'Prize',
      };
    });

    res.json({ prizes: formattedPrizes });
  } catch (error) {
    next(error);
  }
};

// Spin wheel
const spinWheel = async (req, res, next) => {
  try {
    // Get all prizes
    const prizes = await prisma.prize.findMany();

    if (prizes.length === 0) {
      return res.status(404).json({ error: 'No prizes available' });
    }

    // Select random prize
    const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];

    // Award prize to user
    await prisma.prizeUser.create({
      data: {
        userId: req.user.id,
        prizeId: randomPrize.id,
      }
    });

    // Parse prize value and update user points if applicable
    const prizeValue = parseInt(randomPrize.title);
    if (!isNaN(prizeValue) && prizeValue > 0) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (user) {
        const currentPoints = parseInt(user.point) || 0;
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            point: (currentPoints + prizeValue).toString(),
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
      pointsEarned: !isNaN(prizeValue) ? prizeValue : 0,
    });
  } catch (error) {
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
    next(error);
  }
};

module.exports = {
  getPrizes,
  spinWheel,
  getUserPrizes,
};
