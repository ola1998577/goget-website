const prisma = require('../config/database');

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

    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }

    if (storeId) {
      where.storeId = BigInt(storeId);
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
          translations: {
            where: { language: lang }
          },
          productImages: true,
          colors: true,
          sizes: true,
          store: {
            include: {
              translations: {
                where: { language: lang }
              }
            }
          },
          category: {
            include: {
              translations: {
                where: { language: lang }
              }
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
      const translation = product.translations[0] || {};
      const storeTranslation = product.store?.translations[0] || {};
      const categoryTranslation = product.category?.translations[0] || {};
      
      // Calculate average rating
      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

        console.log('Product:', product.id.toString(), 'Avg Rating:', avgRating);
      return {
        id: product.id.toString(),
        title: translation.title || 'No title',
        description: translation.description || '',
        image: product.image,
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        quantity: product.quantity,
        isPopular: product.isPopular,
        orderCount: product.orderCount,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
        images: product.productImages.map(img => img.image),
        colors: product.colors.map(c => c.color),
        sizes: product.sizes.map(s => s.size),
        store: {
          id: product.store.id.toString(),
          name: storeTranslation.name || 'Unknown',
          image: product.store.image,
        },
        category: {
          id: product.category.id.toString(),
          title: categoryTranslation.title || 'Unknown',
        },
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

// Get product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const product = await prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
        translations: {
          where: { language: lang }
        },
        productImages: true,
        colors: true,
        sizes: true,
        store: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        },
        category: {
          include: {
            translations: {
              where: { language: lang }
            }
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
      return res.status(404).json({ error: 'Product not found' });
    }

    const translation = product.translations[0] || {};
    const storeTranslation = product.store?.translations[0] || {};
    const categoryTranslation = product.category?.translations[0] || {};

    // Calculate average rating
    const ratings = product.reviews.map(r => parseInt(r.rate));
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    const formattedProduct = {
      id: product.id.toString(),
      title: translation.title || 'No title',
      description: translation.description || '',
      image: product.image,
      price: product.price,
      discount: product.discount,
      totalPrice: product.totalPrice,
      quantity: product.quantity,
      isPopular: product.isPopular,
      orderCount: product.orderCount,
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: product.reviews.length,
      images: product.productImages.map(img => img.image),
      colors: product.colors.map(c => ({ id: c.id.toString(), color: c.color })),
      sizes: product.sizes.map(s => ({ id: s.id.toString(), size: s.size })),
      store: {
        id: product.store.id.toString(),
        name: storeTranslation.name || 'Unknown',
        location: storeTranslation.location || '',
        image: product.store.image,
      },
      category: {
        id: product.category.id.toString(),
        title: categoryTranslation.title || 'Unknown',
      },
      reviews: product.reviews.map(review => ({
        id: review.id.toString(),
        user: {
          name: `${review.user.fName} ${review.user.lName}`,
        },
        rating: parseInt(review.rate),
        review: review.review,
        createdAt: review.createdAt,
      }))
    };

    res.json({ product: formattedProduct });
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
        translations: {
          where: { language: lang }
        },
        store: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        },
        reviews: {
          select: { rate: true }
        }
      },
    });

    const formattedProducts = products.map(product => {
      const translation = product.translations[0] || {};
      const storeTranslation = product.store?.translations[0] || {};
      
      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      return {
        id: product.id.toString(),
        title: translation.title || 'No title',
        image: product.image,
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

    res.json({ products: formattedProducts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getPopularProducts,
};
