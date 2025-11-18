const prisma = require('../config/database');
const getImageUrl = require('../utils/getImageUrl');

// Get all products with filters
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      storeId,
      minPrice,
      maxPrice,
      isPopular,
      sortBy = 'latest',
      lang = 'en',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    
    if (search) {
      where.translations = {
        some: {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
          ],
          language: lang,
        }
      };
    }

    // helper to detect usable id values from query params
    const isUsable = v => typeof v !== 'undefined' && v !== null && v !== '' && v !== 'undefined' && v !== 'null';

    if (isUsable(categoryId)) {
      // support single id, comma-separated ids, or array of ids
      if (Array.isArray(categoryId)) {
        const ids = categoryId.filter(isUsable);
        const bigIds = [];
        for (const id of ids) {
          try { bigIds.push(BigInt(id)); } catch (e) { }
        }
        if (bigIds.length === 1) where.categoryId = bigIds[0];
        else if (bigIds.length > 1) where.categoryId = { in: bigIds };
      } else if (typeof categoryId === 'string' && categoryId.includes(',')) {
        const ids = categoryId.split(',').map(s => s.trim()).filter(isUsable);
        const bigIds = [];
        for (const id of ids) {
          try { bigIds.push(BigInt(id)); } catch (e) { }
        }
        if (bigIds.length === 1) where.categoryId = bigIds[0];
        else if (bigIds.length > 1) where.categoryId = { in: bigIds };
      } else {
        // single value
        try {
          where.categoryId = BigInt(categoryId);
        } catch (e) { /* ignore invalid id */ }
      }
    }

    if (isUsable(storeId)) {
      if (Array.isArray(storeId)) {
        const ids = storeId.filter(isUsable);
        const bigIds = [];
        for (const id of ids) {
          try { bigIds.push(BigInt(id)); } catch (e) { }
        }
        if (bigIds.length === 1) where.storeId = bigIds[0];
        else if (bigIds.length > 1) where.storeId = { in: bigIds };
      } else if (typeof storeId === 'string' && storeId.includes(',')) {
        const ids = storeId.split(',').map(s => s.trim()).filter(isUsable);
        const bigIds = [];
        for (const id of ids) {
          try { bigIds.push(BigInt(id)); } catch (e) { }
        }
        if (bigIds.length === 1) where.storeId = bigIds[0];
        else if (bigIds.length > 1) where.storeId = { in: bigIds };
      } else {
        try {
          where.storeId = BigInt(storeId);
        } catch (e) { /* ignore invalid id */ }
      }
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (isPopular === 'true') {
      where.isPopular = true;
    }

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

    // Get products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
            // include all translations and pick the matching language below
            translations: true,
            productImages: true,
            colors: true,
            sizes: true,
            store: {
              include: {
                translations: true
              }
            },
            category: {
              include: {
                translations: true
              }
            },
            reviews: {
              select: {
                rate: true,
              }
            }
          },
      }),
      prisma.product.count({ where }),
    ]);

    // Format products
    const formattedProducts = products.map(product => {
      const translation = (product.translations || []).find(t => t.language === lang) || product.translations[0] || {};
      const storeTranslation = (product.store?.translations || []).find(t => t.language === lang) || product.store?.translations[0] || {};
      const categoryTranslation = (product.category?.translations || []).find(t => t.language === lang) || product.category?.translations[0] || {};
      
      // Calculate average rating
      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

        console.log('Product:', product.id.toString(), 'Avg Rating:', avgRating);
      // helper to normalize color strings into objects expected by frontend
      const normalizeColor = (c) => {
        const colorVal = c.color || c;
        const isHex = typeof colorVal === 'string' && colorVal.startsWith('#');
        return {
          id: c.id ? c.id.toString() : (colorVal || '').toString(),
          name: colorVal || '',
          nameAr: colorVal || '',
          hex: colorVal || '',
        };
      };

      const normalizeSize = (s) => ({ id: s.id ? s.id.toString() : (s || '').toString(), name: s.size || s, nameAr: s.size || s });

      const stockVal = (product.quantity || product.amount || 0);

      const getImageUrl = require('../utils/getImageUrl');

      return {
        id: product.id.toString(),
        name: translation.title || 'No title',
        nameAr: translation.title || 'No title',
        title: translation.title || 'No title',
        description: translation.description || '',
        descriptionAr: translation.description || '',
        image: getImageUrl(product.image),
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        oldPrice: product.totalPrice || null,
        quantity: product.quantity,
        isPopular: product.isPopular,
        orderCount: product.orderCount,
        rating: parseFloat(avgRating.toFixed(1)),
        reviews: product.reviews.length,
        reviewCount: product.reviews.length,
        images: product.productImages.map(img => getImageUrl(img.image)),
        colors: product.colors.map(c => normalizeColor(c)),
        sizes: product.sizes.map(s => normalizeSize(s)),
        stock: stockVal,
        inStock: stockVal > 0,
        storeId: product.storeId?.toString(),
        categoryId: product.categoryId?.toString(),
        marketId: '1',
        store: product.store ? {
          id: product.store.id.toString(),
          name: storeTranslation.name || 'Unknown',
          image: getImageUrl(product.store.image),
        } : null,
        category: product.category ? {
          id: product.category.id.toString(),
          title: categoryTranslation.title || 'Unknown',
        } : null,
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

// Get product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const product = await prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
        translations: true,
        productImages: true,
        colors: true,
        sizes: true,
        store: {
          include: {
            translations: true
          }
        },
        category: {
          include: {
            translations: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fName: true,
                lName: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const translation = (product.translations || []).find(t => t.language === lang) || product.translations[0] || {};
    const storeTranslation = (product.store?.translations || []).find(t => t.language === lang) || product.store?.translations[0] || {};
    const categoryTranslation = (product.category?.translations || []).find(t => t.language === lang) || product.category?.translations[0] || {};

    // Calculate average rating
    const ratings = product.reviews.map(r => parseInt(r.rate));
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    const formattedProduct = {
      id: product.id.toString(),
      name: translation.title || 'No title',
      nameAr: translation.title || 'No title',
      title: translation.title || 'No title',
      description: translation.description || '',
      descriptionAr: translation.description || '',
      image: getImageUrl(product.image),
      price: product.price,
      discount: product.discount,
      totalPrice: product.totalPrice,
      oldPrice: product.totalPrice || null,
      quantity: product.quantity,
      isPopular: product.isPopular,
      orderCount: product.orderCount,
      rating: parseFloat(avgRating.toFixed(1)),
      reviews: product.reviews.length,
      reviewCount: product.reviews.length,
      images: product.productImages.map(img => getImageUrl(img.image)),
      colors: product.colors.map(c => ({ id: c.id.toString(), name: c.color, nameAr: c.color, hex: c.color })),
      sizes: product.sizes.map(s => ({ id: s.id.toString(), name: s.size, nameAr: s.size })),
      stock: (product.quantity || product.amount || 0),
      inStock: ((product.quantity || product.amount || 0) > 0),
      storeId: product.storeId?.toString(),
      categoryId: product.categoryId?.toString(),
      marketId: '1',
      store: {
        id: product.store.id.toString(),
        name: storeTranslation.name || 'Unknown',
        location: storeTranslation.location || '',
        image: getImageUrl(product.store.image),
      },
      category: {
        id: product.category.id.toString(),
        title: categoryTranslation.title || 'Unknown',
      },
      reviewDetails: product.reviews.map(review => ({
        id: review.id.toString(),
        user: {
          name: `${review.user.fName} ${review.user.lName}`,
        },
        rating: parseInt(review.rate),
        review: review.review,
        createdAt: review.createdAt,
      }))
    };

    res.json({ success: true, data: formattedProduct });
  } catch (error) {
    next(error);
  }
};

// Get popular products
const getPopularProducts = async (req, res, next) => {
  try {
    const { limit = 10, lang = 'en' } = req.query;

    const products = await prisma.product.findMany({
      where: { isPopular: true },
      take: parseInt(limit),
      orderBy: { orderCount: 'desc' },
      include: {
        translations: true,
        store: {
          include: {
            translations: true
          }
        },
        reviews: {
          select: { rate: true }
        }
      },
    });

    const formattedProducts = products.map(product => {
      const translation = (product.translations || []).find(t => t.language === lang) || product.translations[0] || {};
      const storeTranslation = (product.store?.translations || []).find(t => t.language === lang) || product.store?.translations[0] || {};
      
      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      return {
        id: product.id.toString(),
        title: translation.title || 'No title',
        name: translation.title || 'No title',
        image: getImageUrl(product.image),
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
        store: {
          id: product.store.id.toString(),
          name: storeTranslation.name || 'Unknown',
        },
      };
    });

    res.json({ 
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    next(error);
  }
};

// Get offers (products with a non-null discount)
const getOffers = async (req, res, next) => {
  try {
    const { limit = 12, lang = 'en' } = req.query;

    const products = await prisma.product.findMany({
      where: { discount: { not: null } },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        translations: true,
        productImages: true,
        store: { include: { translations: true } },
        reviews: { select: { rate: true } }
      }
    });

    const getImageUrl = require('../utils/getImageUrl');

    const formatted = products.map(product => {
      const translation = (product.translations || []).find(t => t.language === lang) || product.translations[0] || {};
      const storeTranslation = (product.store?.translations || []).find(t => t.language === lang) || product.store?.translations[0] || {};

      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;

      return {
        id: product.id.toString(),
        title: translation.title || 'No title',
        image: getImageUrl(product.image),
        images: product.productImages.map(img => getImageUrl(img.image)),
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        rating: parseFloat(avgRating.toFixed(1)),
        store: product.store ? { id: product.store.id.toString(), name: storeTranslation.name || 'Unknown', image: getImageUrl(product.store.image) } : null,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getPopularProducts,
  getOffers,
};
