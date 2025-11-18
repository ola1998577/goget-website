const prisma = require('../config/database');

// Get all categories
const getCategories = async (req, res, next) => {
  try {
    const { lang = 'en', parentId } = req.query;

    const where = {};
    if (parentId) {
      where.parentId = BigInt(parentId);
    } else {
      where.parentId = null; // Only root categories
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        translations: {
          where: { language: lang }
        },
        children: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    const formattedCategories = categories.map(category => {
      const translation = category.translations[0] || {};
      const getImageUrl = require('../utils/getImageUrl');
      
      return {
        id: category.id.toString(),
        title: translation.title || 'No title',
        image: getImageUrl(category.image),
        productCount: category._count.products,
        children: category.children.map(child => {
          const childTranslation = child.translations[0] || {};
          return {
            id: child.id.toString(),
            title: childTranslation.title || 'No title',
            image: getImageUrl(child.image),
          };
        })
      };
    });

    res.json({ categories: formattedCategories });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const category = await prisma.category.findUnique({
      where: { id: BigInt(id) },
      include: {
        translations: {
          where: { language: lang }
        },
        children: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        },
        parent: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const translation = category.translations[0] || {};
    const parentTranslation = category.parent?.translations[0] || {};
    const getImageUrl = require('../utils/getImageUrl');

    const formattedCategory = {
      id: category.id.toString(),
      title: translation.title || 'No title',
      image: getImageUrl(category.image),
      productCount: category._count.products,
      parent: category.parent ? {
        id: category.parent.id.toString(),
        title: parentTranslation.title || 'No title',
      } : null,
      children: category.children.map(child => {
        const childTranslation = child.translations[0] || {};
        return {
          id: child.id.toString(),
          title: childTranslation.title || 'No title',
          image: getImageUrl(child.image),
        };
      })
    };

    res.json({ category: formattedCategory });
  } catch (error) {
    next(error);
  }
};

// Get products by category
const getCategoryProducts = async (req, res, next) => {
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: BigInt(id) },
        skip,
        take,
        orderBy,
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
      }),
      prisma.product.count({ where: { categoryId: BigInt(id) } }),
    ]);

    const getImageUrl = require('../utils/getImageUrl');
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
        description: translation.description || '',
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
  getCategories,
  getCategoryById,
  getCategoryProducts,
};
