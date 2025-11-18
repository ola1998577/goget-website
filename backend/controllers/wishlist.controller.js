const prisma = require('../config/database');
const getImageUrl = require('../utils/getImageUrl');

// Get user's token
const getUserToken = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenId: true }
  });
  return user?.tokenId;
};

// Get wishlist items
const getWishlist = async (req, res, next) => {
  try {
    const { lang = 'en', type } = req.query;
    const tokenId = await getUserToken(req.user.id);

    if (!tokenId) {
      return res.json({ items: [] });
    }

    const where = { tokenId };
    if (type) {
      where.type = type;
    }

    const wishlistItems = await prisma.favourite.findMany({
      where,
      include: {
        product: {
          include: {
            translations: {
              where: { language: lang }
            },
            reviews: {
              select: { rate: true }
            }
          }
        },
        store: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        }
      }
    });

    const formattedItems = wishlistItems.map(item => {
      if (item.type === 'product' && item.product) {
        const translation = item.product.translations[0] || {};
        const ratings = item.product.reviews.map(r => parseInt(r.rate));
        const avgRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;

        return {
          id: item.id.toString(),
          type: 'product',
          product: {
            id: item.product.id.toString(),
            title: translation.title || 'No title',
            image: getImageUrl(item.product.image),
            price: item.product.price,
            discount: item.product.discount,
            totalPrice: item.product.totalPrice,
            rating: parseFloat(avgRating.toFixed(1)),
          }
        };
      } else if (item.type === 'store' && item.store) {
        const translation = item.store.translations[0] || {};
        
        return {
          id: item.id.toString(),
          type: 'store',
          store: {
            id: item.store.id.toString(),
            name: translation.name || 'Unknown',
            location: translation.location || '',
            image: getImageUrl(item.store.image),
          }
        };
      }
      return null;
    }).filter(item => item !== null);

    res.json({ items: formattedItems });
  } catch (error) {
    next(error);
  }
};

// Add to wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const { productId, storeId, type = 'product' } = req.body;

    if (!productId && !storeId) {
      return res.status(400).json({ error: 'Product ID or Store ID is required' });
    }

    const tokenId = await getUserToken(req.user.id);
    if (!tokenId) {
      return res.status(400).json({ error: 'User token not found' });
    }

    // Check if already in wishlist
    const where = { tokenId, type };
    if (productId) where.productId = BigInt(productId);
    if (storeId) where.storeId = BigInt(storeId);

    const existing = await prisma.favourite.findFirst({ where });

    if (existing) {
      return res.status(400).json({ error: 'Already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await prisma.favourite.create({
      data: {
        tokenId,
        productId: productId ? BigInt(productId) : null,
        storeId: storeId ? BigInt(storeId) : null,
        type,
      }
    });

    res.status(201).json({
      message: 'Added to wishlist',
      item: {
        id: wishlistItem.id.toString(),
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tokenId = await getUserToken(req.user.id);

    const wishlistItem = await prisma.favourite.findFirst({
      where: {
        id: BigInt(id),
        tokenId,
      }
    });

    if (!wishlistItem) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    await prisma.favourite.delete({
      where: { id: BigInt(id) }
    });

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
