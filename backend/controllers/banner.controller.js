const prisma = require('../config/database');
const getImageUrl = require('../utils/getImageUrl');

// Get all banners
exports.getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formatted = banners.map(b => ({ id: b.id?.toString(), image: getImageUrl(b.image) }));
    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};
