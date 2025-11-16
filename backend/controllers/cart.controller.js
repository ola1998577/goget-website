const prisma = require('../config/database');

// Get user's token
const getUserToken = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenId: true }
  });
  return user?.tokenId;
};

// Get cart items
const getCart = async (req, res, next) => {
  try {
    const { lang = 'en' } = req.query;
    const tokenId = await getUserToken(req.user.id);

    if (!tokenId) {
      return res.json({ items: [], total: 0 });
    }

    const cartItems = await prisma.cart.findMany({
      where: { tokenId },
      include: {
        product: {
          include: {
            translations: {
              where: { language: lang }
            },
            colors: true,
            sizes: true,
            store: {
              include: {
                translations: {
                  where: { language: lang }
                }
              }
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

    const formattedItems = cartItems.map(item => {
      const productTranslation = item.product?.translations[0] || {};
      const storeTranslation = item.store?.translations[0] || item.product?.store?.translations[0] || {};

      return {
        id: item.id.toString(),
        product: item.product ? {
          id: item.product.id.toString(),
          title: productTranslation.title || 'No title',
          image: item.product.image,
          price: item.product.price,
          discount: item.product.discount,
          totalPrice: item.product.totalPrice,
          colors: item.product.colors.map(c => c.color),
          sizes: item.product.sizes.map(s => s.size),
        } : null,
        store: {
          id: item.storeId.toString(),
          name: storeTranslation.name || 'Unknown',
        },
        quantity: 1, // You can add quantity field to cart table if needed
      };
    });

    const total = formattedItems.reduce((sum, item) => 
      sum + (item.product?.totalPrice || item.product?.price || 0), 0
    );

    res.json({
      items: formattedItems,
      total: parseFloat(total.toFixed(2)),
      count: formattedItems.length,
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, storeId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const tokenId = await getUserToken(req.user.id);
    if (!tokenId) {
      return res.status(400).json({ error: 'User token not found' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: BigInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if already in cart
    const existing = await prisma.cart.findFirst({
      where: {
        tokenId,
        productId: BigInt(productId),
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Product already in cart' });
    }

    // Add to cart
    const cartItem = await prisma.cart.create({
      data: {
        tokenId,
        productId: BigInt(productId),
        storeId: storeId ? BigInt(storeId) : product.storeId,
      }
    });

    res.status(201).json({
      message: 'Product added to cart',
      item: {
        id: cartItem.id.toString(),
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tokenId = await getUserToken(req.user.id);

    const cartItem = await prisma.cart.findFirst({
      where: {
        id: BigInt(id),
        tokenId,
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cart.delete({
      where: { id: BigInt(id) }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

// Clear cart
const clearCart = async (req, res, next) => {
  try {
    const tokenId = await getUserToken(req.user.id);

    await prisma.cart.deleteMany({
      where: { tokenId }
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};
