const prisma = require('../config/database');

// Get all governates with translations
exports.getGovernates = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;

    const governates = await prisma.governate.findMany({
      where: { status: 'active' },
      include: {
        translations: {
          where: { locale: lang }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Format data to include translated name
    const formattedGovernates = governates.map(gov => ({
      id: gov.id?.toString(),
      name: gov.translations[0]?.name || 'N/A',
      status: gov.status,
      createdAt: gov.createdAt,
      updatedAt: gov.updatedAt,
      categoriesCount: gov._count?.categories || 0,
    }));

    res.json({
      success: true,
      data: formattedGovernates
    });
  } catch (error) {
    next(error);
  }
};

// Get governate by ID with translations
exports.getGovernateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const governate = await prisma.governate.findUnique({
      where: { id: BigInt(id) },
      include: {
        translations: {
          where: { locale: lang }
        }
      }
    });

    if (!governate) {
      return res.status(404).json({
        success: false,
        message: 'Governate not found'
      });
    }

    const formatted = {
      id: governate.id?.toString(),
      name: governate.translations[0]?.name || 'N/A',
      status: governate.status,
      createdAt: governate.createdAt,
      updatedAt: governate.updatedAt,
      categories: [],
    };

    // include categories for this governate (simple list)
    const categories = await prisma.category.findMany({
      where: { governateId: governate.id },
      include: { translations: { where: { language: lang } } },
      orderBy: { id: 'asc' }
    });

    const getImageUrl = require('../utils/getImageUrl');
    formatted.categories = categories.map(c => ({
      id: c.id.toString(),
      title: c.translations[0]?.title || '',
      image: getImageUrl(c.image),
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};
