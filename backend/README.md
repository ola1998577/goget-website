# GoGet Backend API

Complete Node.js Express backend for the GoGet e-commerce platform.

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the following variables:
- `DATABASE_URL`: Your MySQL database connection string
- `JWT_SECRET`: A secure random string for JWT token generation
- `CORS_ORIGIN`: Your frontend URL (default: http://localhost:5173)

### 3. Database Setup

Run Prisma migrations to create the database schema:

\`\`\`bash
npm run prisma:generate
npm run prisma:migrate
\`\`\`

### 4. Start the Server

Development mode (with auto-reload):
\`\`\`bash
npm run dev
\`\`\`

Production mode:
\`\`\`bash
npm start
\`\`\`

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/verify-otp` - Verify OTP
- POST `/api/auth/resend-otp` - Resend OTP

### Products
- GET `/api/products` - Get all products (with filters)
- GET `/api/products/:id` - Get product details
- POST `/api/products` - Create product (auth required)
- PUT `/api/products/:id` - Update product (auth required)
- DELETE `/api/products/:id` - Delete product (auth required)

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/:id` - Get category details
- GET `/api/categories/:id/products` - Get products by category

### Cart
- GET `/api/cart` - Get cart items
- POST `/api/cart` - Add item to cart
- PUT `/api/cart/:id` - Update cart item
- DELETE `/api/cart/:id` - Remove cart item

### Wishlist
- GET `/api/wishlist` - Get wishlist items
- POST `/api/wishlist` - Add item to wishlist
- DELETE `/api/wishlist/:id` - Remove wishlist item

### Orders
- GET `/api/orders` - Get user orders (auth required)
- POST `/api/orders` - Create order (auth required)
- GET `/api/orders/:id` - Get order details (auth required)

### Reviews
- GET `/api/reviews/product/:id` - Get product reviews
- POST `/api/reviews` - Add review (auth required)

### More endpoints available for stores, markets, quiz, wheel, shipping, etc.

## Project Structure

\`\`\`
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middlewares/      # Custom middleware
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── validators/       # Request validation schemas
├── prisma/           # Prisma schema and migrations
├── uploads/          # File uploads directory
└── server.js         # Entry point
\`\`\`

## Technologies Used

- **Express.js**: Web framework
- **Prisma**: ORM for database operations
- **MySQL**: Database
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Joi**: Input validation
- **Multer**: File uploads
- **CORS**: Cross-origin resource sharing

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Input validation
- SQL injection protection (via Prisma)
- CORS configuration
- Environment variables for sensitive data

## Support

For issues and questions, please refer to the project documentation or contact the development team.
