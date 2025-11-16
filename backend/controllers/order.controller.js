const prisma = require('../config/database');

// Generate random order ID
const generateOrderId = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Generate random code
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get user orders
const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, lang = 'en' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            include: {
              translations: {
                where: { language: lang }
              }
            }
          },
          orderProducts: {
            include: {
              product: {
                include: {
                  translations: {
                    where: { language: lang }
                  }
                }
              },
              color: true,
              size: true,
            }
          },
          location: true,
        }
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map(order => {
      const storeTranslation = order.store?.translations[0] || {};

      return {
        id: order.id.toString(),
        orderId: order.orderId,
        code: order.code,
        status: order.status,
        type: order.type,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod,
        store: order.store ? {
          id: order.store.id.toString(),
          name: storeTranslation.name || 'Unknown',
          image: order.store.image,
        } : null,
        products: order.orderProducts.map(op => {
          const productTranslation = op.product?.translations[0] || {};
          return {
            id: op.id.toString(),
            product: {
              id: op.product.id.toString(),
              title: productTranslation.title || 'No title',
              image: op.product.image,
            },
            quantity: op.quantity,
            price: parseFloat(op.price),
            color: op.color?.color,
            size: op.size?.size,
          };
        }),
        createdAt: order.createdAt,
      };
    });

    res.json({
      orders: formattedOrders,
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

// Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const order = await prisma.order.findFirst({
      where: {
        id: BigInt(id),
        userId: req.user.id,
      },
      include: {
        store: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        },
        orderProducts: {
          include: {
            product: {
              include: {
                translations: {
                  where: { language: lang }
                }
              }
            },
            color: true,
            size: true,
          }
        },
        location: true,
        shippingOption: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const storeTranslation = order.store?.translations[0] || {};
    const shippingTranslation = order.shippingOption?.translations[0] || {};

    const formattedOrder = {
      id: order.id.toString(),
      orderId: order.orderId,
      code: order.code,
      status: order.status,
      type: order.type,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      store: order.store ? {
        id: order.store.id.toString(),
        name: storeTranslation.name || 'Unknown',
        location: storeTranslation.location || '',
        image: order.store.image,
      } : null,
      products: order.orderProducts.map(op => {
        const productTranslation = op.product?.translations[0] || {};
        return {
          id: op.id.toString(),
          product: {
            id: op.product.id.toString(),
            title: productTranslation.title || 'No title',
            image: op.product.image,
          },
          quantity: op.quantity,
          price: parseFloat(op.price),
          color: op.color?.color,
          size: op.size?.size,
        };
      }),
      location: order.location,
      shipping: order.shippingOption ? {
        name: shippingTranslation.name || 'Unknown',
        price: order.shippingOption.price,
      } : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    res.json({ order: formattedOrder });
  } catch (error) {
    next(error);
  }
};

// Create order
const createOrder = async (req, res, next) => {
  try {
    const {
      storeId,
      locationId,
      paymentMethod,
      shippingMethod,
      shippingOptionId,
      type = 'delivery',
      products, // Array of { productId, colorId, sizeId, quantity, price }
    } = req.body;

    if (!storeId || !products || products.length === 0) {
      return res.status(400).json({ error: 'Store ID and products are required' });
    }

    // Calculate total amount
    const amount = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderId: generateOrderId(),
        code: generateCode(),
        userId: req.user.id,
        storeId: BigInt(storeId),
        locationId: locationId ? BigInt(locationId) : null,
        shippingOptionId: shippingOptionId ? BigInt(shippingOptionId) : null,
        amount,
        status: 'pending',
        paymentMethod,
        shippingMethod,
        type,
        orderProducts: {
          create: products.map(p => ({
            productId: BigInt(p.productId),
            colorId: p.colorId ? BigInt(p.colorId) : null,
            sizeId: p.sizeId ? BigInt(p.sizeId) : null,
            quantity: p.quantity,
            price: p.price,
          }))
        }
      },
      include: {
        orderProducts: true,
      }
    });

    // Clear cart after order
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { tokenId: true }
    });

    if (user?.tokenId) {
      await prisma.cart.deleteMany({
        where: {
          tokenId: user.tokenId,
          storeId: BigInt(storeId),
        }
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id.toString(),
        orderId: order.orderId,
        code: order.code,
        status: order.status,
        amount: order.amount,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: BigInt(id),
        userId: req.user.id,
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'done' || order.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot cancel this order' });
    }

    await prisma.order.update({
      where: { id: BigInt(id) },
      data: { status: 'cancelled' }
    });

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
};
