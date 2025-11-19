const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middlewares/errorHandler');

// Temporary: log unhandled errors so we can diagnose crashes
process.on('unhandledRejection', (reason, p) => {
  console.error('UNHANDLED_REJECTION at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT_EXCEPTION thrown:', err);
  // keep default behavior (exit) after logging
});

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/stores', require('./routes/store.routes'));
app.use('/api/markets', require('./routes/market.routes'));
app.use('/api/governates', require('./routes/governate.routes'));
app.use('/api/areas', require('./routes/area.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/quiz', require('./routes/quiz.routes'));
app.use('/api/wheel', require('./routes/wheel.routes'));
app.use('/api/promo', require('./routes/promo.routes'));
app.use('/api/shipping', require('./routes/shipping.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
