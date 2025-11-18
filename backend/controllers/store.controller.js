const prisma = require('../config/database');
const getImageUrl = require('../utils/getImageUrl');

// Get all stores
const getStores = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, lang = 'en', marketId } = req.query;
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

    // If marketId provided, filter stores by products that belong to categories linked to the governate
    if (marketId) {
      const categories = await prisma.category.findMany({ where: { governateId: BigInt(marketId) }, select: { id: true } });
      const categoryIds = categories.map(c => c.id);
      if (categoryIds.length > 0) {
        // add a products.some filter
        where.products = { some: { categoryId: { in: categoryIds } } };
      } else {
        // no categories linked to this governate -> empty result
        return res.json({ success: true, data: [], pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, pages: 0 } });
      }
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

    const getImageUrl = require('../utils/getImageUrl');
    const formattedStores = stores.map(store => {
      const translation = store.translations[0] || {};
      
      return {
        id: store.id.toString(),
        name: translation.name || 'Unknown',
        nameAr: translation.name || 'Unknown',
        location: translation.location || '',
        logo: getImageUrl(store.image),
        image: getImageUrl(store.image),
        discount: store.discount,
        productCount: store._count.products,
        status: store.status,
        rating: 4.5,
        description: '',
        descriptionAr: '',
      };
    });

    res.json({
      success: true,
      data: formattedStores,
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
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const getImageUrl = require('../utils/getImageUrl');
    const translation = store.translations[0] || {};

    // Find the first product's governateId to determine the market
    let marketId = null;
    if (store.products.length > 0) {
      const firstProduct = await prisma.product.findUnique({
        where: { id: store.products[0].id },
        include: {
          category: {
            select: { governateId: true }
          }
        }
      });
      if (firstProduct?.category?.governateId) {
        marketId = firstProduct.category.governateId.toString();
      }
    }

    const formattedProducts = store.products.map(product => {
      const productTranslation = product.translations[0] || {};
      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      return {
        id: product.id.toString(),
        title: productTranslation.title || 'No title',
        image: getImageUrl(product.image),
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        rating: parseFloat(avgRating.toFixed(1)),
      };
    });

    const formattedStore = {
      id: store.id.toString(),
      name: translation.name || 'Unknown',
      nameAr: translation.name || 'Unknown',
      description: '',
      descriptionAr: '',
      logo: getImageUrl(store.image),
      rating: 4.5,
      reviewCount: 0,
      productCount: store._count.products,
      marketId: marketId || '1',
      isActive: store.status === 'active' || store.status === 1,
      location: translation.location || '',
      image: getImageUrl(store.image),
      discount: store.discount,
      discountExp: store.discountExp,
      allowCash: store.allowCash,
      allowOnline: store.allowOnline,
      deliveryType: store.deliveryType,
      deliveryFee: store.deliveryFee ? parseFloat(store.deliveryFee) : null,
      products: formattedProducts,
      status: store.status,
    };

    res.json({ success: true, data: formattedStore });
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
        name: translation.title || 'No title',
        nameAr: translation.title || 'No title',
        description: translation.description || '',
        image: getImageUrl(product.image),
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
        categoryId: product.categoryId.toString(),
        storeId: product.storeId?.toString(),
      };
    });

    res.json({
      success: true,
      data: formattedProducts,
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
