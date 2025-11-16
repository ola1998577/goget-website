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
      id: gov.id,
      name: gov.translations[0]?.name || 'N/A',
      status: gov.status,
      createdAt: gov.createdAt,
      updatedAt: gov.updatedAt
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
      id: governate.id,
      name: governate.translations[0]?.name || 'N/A',
      status: governate.status,
      createdAt: governate.createdAt,
      updatedAt: governate.updatedAt
    };

    res.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};
