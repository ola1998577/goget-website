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

    const getImageUrl = require('../utils/getImageUrl');
    const formattedCategories = categories.map(category => {
      const translation = category.translations[0] || {};
      
      return {
        id: category.id.toString(),
        // bilingual fields
        name: (category.translations || []).find(t => t.language === 'en')?.title || translation.title || 'No title',
        nameAr: (category.translations || []).find(t => t.language === 'ar')?.title || translation.title || 'No title',
        image: getImageUrl(category.image),
        productCount: category._count.products,
        children: category.children.map(child => {
          const childTranslation = child.translations[0] || {};
          return {
            id: child.id.toString(),
            name: (child.translations || []).find(t => t.language === 'en')?.title || childTranslation.title || 'No title',
            nameAr: (child.translations || []).find(t => t.language === 'ar')?.title || childTranslation.title || 'No title',
            image: getImageUrl(child.image),
          };
        })
      };
    });

    res.json({ success: true, data: formattedCategories });
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
        translations: true,
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
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const translation = (category.translations || []).find(t => t.language === lang) || category.translations[0] || {};
    const parentTranslation = category.parent?.translations ? 
      (category.parent.translations || []).find(t => t.language === lang) || category.parent.translations[0] || {} 
      : {};
    const getImageUrl = require('../utils/getImageUrl');

    const formattedCategory = {
      id: category.id.toString(),
      name: translation.title || 'No title',
      nameAr: (category.translations || []).find(t => t.language === 'ar')?.title || 'No title',
      description: translation.title || 'No description',
      descriptionAr: (category.translations || []).find(t => t.language === 'ar')?.title || 'No description',
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

    res.json({ success: true, data: formattedCategory });
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
          translations: true,
          productImages: true,
          colors: true,
          sizes: true,
          store: {
            include: {
              translations: true
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
      const translation = (product.translations || []).find(t => t.language === lang) || product.translations[0] || {};
      const storeTranslation = product.store?.translations ? 
        (product.store.translations || []).find(t => t.language === lang) || product.store.translations[0] || {}
        : {};
      
      const ratings = product.reviews.map(r => parseInt(r.rate));
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;

      return {
        id: product.id.toString(),
        name: translation.title || 'No title',
        nameAr: (product.translations || []).find(t => t.language === 'ar')?.title || 'No title',
        title: translation.title || 'No title',
        description: translation.description || '',
        descriptionAr: (product.translations || []).find(t => t.language === 'ar')?.description || '',
        image: getImageUrl(product.image),
        images: product.productImages.map(img => getImageUrl(img.image)),
        price: product.price,
        discount: product.discount,
        totalPrice: product.totalPrice,
        oldPrice: product.totalPrice,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: product.reviews.length,
        colors: product.colors.map(c => ({ id: c.id.toString(), name: c.color, nameAr: c.color, hex: c.color })),
        sizes: product.sizes.map(s => ({ id: s.id.toString(), name: s.size, nameAr: s.size })),
        storeId: product.storeId?.toString(),
        store: {
          id: product.store.id.toString(),
          name: storeTranslation.name || 'Unknown',
        },
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
  getCategories,
  getCategoryById,
  getCategoryProducts,
};
