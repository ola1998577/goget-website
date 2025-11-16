const prisma = require('../config/database');

// Get settings
const getSettings = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    const settings = await prisma.setting.findFirst({
      include: {
        translations: {
          where: { locale: lang }
        }
      }
    });

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const translations = settings.translations.reduce((acc, t) => {
      acc[t.title] = t.description;
      return acc;
    }, {});

    res.json({ settings: translations });
  } catch (error) {
    next(error);
  }
};

// Get banners
const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany();

    res.json({
      banners: banners.map(b => ({
        id: b.id.toString(),
        image: b.image,
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  getBanners,
};
