const prisma = require('../config/database');

// Get all stores
const getStores = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, lang = 'en' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.translations = {
        some: {
          name: { contains: search },
          language: lang,
        }
      };
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take,
        include: {
          translations: {
            where: { language: lang }
          },
          _count: {
            select: { products: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.store.count({ where }),
    ]);

    const formattedStores = stores.map(store => {
      const translation = store.translations[0] || {};
      
      return {
        id: store.id.toString(),
        name: translation.name || 'Unknown',
        location: translation.location || '',
        image: store.image,
        discount: store.discount,
        productCount: store._count.products,
        status: store.status,
      };
    });

    res.json({
      stores: formattedStores,
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

// Get store by ID
const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const store = await prisma.store.findUnique({
      where: { id: BigInt(id) },
      include: {
        translations: {
          where: { language: lang }
        },
        products: {
          take: 10,
          include: {
            translations: {
              where: { language: lang }
            },
            reviews: {
              select: { rate: true }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const translation = store.translations[0] || {};

    const formattedProducts = store.products.map(product => {
      const productTranslation = product.translations[0] || {};
      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      return {
        id: product.id.toString(),
        title: productTranslation.title || 'No title',
        image: product.image,
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        rating: parseFloat(avgRating.toFixed(1)),
      };
    });

    const formattedStore = {
      id: store.id.toString(),
      name: translation.name || 'Unknown',
      location: translation.location || '',
      image: store.image,
      discount: store.discount,
      discountExp: store.discountExp,
      allowCash: store.allowCash,
      allowOnline: store.allowOnline,
      deliveryType: store.deliveryType,
      deliveryFee: store.deliveryFee ? parseFloat(store.deliveryFee) : null,
      productCount: store._count.products,
      products: formattedProducts,
      status: store.status,
    };

    res.json({ store: formattedStore });
  } catch (error) {
    next(error);
  }
};

// Get store products
const getStoreProducts = async (req, res, next) => {
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { storeId: BigInt(id) },
        skip,
        take,
        orderBy,
        include: {
          translations: {
            where: { language: lang }
          },
          reviews: {
            select: { rate: true }
          }
        },
      }),
      prisma.product.count({ where: { storeId: BigInt(id) } }),
    ]);

    const formattedProducts = products.map(product => {
      const translation = product.translations[0] || {};
      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      return {
        id: product.id.toString(),
        title: translation.title || 'No title',
        description: translation.description || '',
        image: product.image,
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
      };
    });

    res.json({
      products: formattedProducts,
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

module.exports = {
  getStores,
  getStoreById,
  getStoreProducts,
};
