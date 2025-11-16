const prisma = require('../config/database');

// Get all banners
exports.getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};
