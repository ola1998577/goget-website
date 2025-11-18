const prisma = require('../config/database');

// Get product reviews
const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId: BigInt(id) },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fName: true,
              lName: true,
            }
          }
        }
      }),
      prisma.productReview.count({ where: { productId: BigInt(id) } }),
    ]);

    // Standardized flattened review shape expected by frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id.toString(),
      userName: `${review.user.fName} ${review.user.lName}`,
      userImage: null,
      rating: parseInt(review.rate),
      title: review.title || '',
      titleAr: review.titleAr || '',
      comment: review.review || '',
      commentAr: review.reviewAr || '',
      images: review.images || [],
      date: review.createdAt,
      helpful: review.helpful || 0,
      notHelpful: review.notHelpful || 0,
      verified: true,
    }));

    res.json({
      reviews: formattedReviews,
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

// Add review
const addReview = async (req, res, next) => {
  try {
    const { productId, rating, review } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ error: 'Product ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this product
    const existing = await prisma.productReview.findFirst({
      where: {
        productId: BigInt(productId),
        userId: req.user.id,
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Check if user has ordered this product before allowing review
    const hasOrdered = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        orderProducts: {
          some: { productId: BigInt(productId) }
        }
      }
    });

    if (!hasOrdered) {
      return res.status(403).json({ error: 'You can only review products you have ordered' });
    }

    const newReview = await prisma.productReview.create({
      data: {
        productId: BigInt(productId),
        userId: req.user.id,
        rate: rating.toString(),
        review: review || null,
      }
    });

    res.status(201).json({
      message: 'Review added successfully',
      review: {
        id: newReview.id.toString(),
        rating: parseInt(newReview.rate),
        review: newReview.review,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  addReview,
};
