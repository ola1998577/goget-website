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

// Get products for a governate (market)
exports.getGovernateProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'latest',
      lang = 'en',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build orderBy
    let orderBy = {};
    switch (sortBy) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { orderCount: 'desc' };
        break;
      case 'latest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Find products where product's category.governateId == id
    const where = {
      category: {
        is: { governateId: BigInt(id) }
      }
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          translations: true,
          productImages: true,
          store: { include: { translations: true } },
          reviews: { select: { rate: true } }
        }
      }),
      prisma.product.count({ where })
    ]);

    const getImageUrl = require('../utils/getImageUrl');

    const formatted = products.map(product => {
      const translation = (product.translations || []).find(t => t.language === lang) || product.translations[0] || {};
      const storeTranslation = (product.store?.translations || []).find(t => t.language === lang) || product.store?.translations[0] || {};

      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 ? ratings.reduce((a,b) => a + b, 0) / ratings.length : 0;

      return {
        id: product.id.toString(),
        title: translation.title || 'No title',
        name: translation.title || 'No title',
        description: translation.description || '',
        image: getImageUrl(product.image),
        images: product.productImages.map(img => getImageUrl(img.image)),
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
        store: product.store ? { id: product.store.id.toString(), name: storeTranslation.name || 'Unknown', image: getImageUrl(product.store.image) } : null,
      };
    });

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    next(error);
  }
};
