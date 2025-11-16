# Complete API Endpoints Documentation

## Base URL
\`\`\`
http://localhost:5000/api
\`\`\`

## Authentication Endpoints

### Register User
\`\`\`
POST /auth/register
\`\`\`
**Body:**
\`\`\`json
{
  "fName": "John",
  "lName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
\`\`\`
**Response:**
\`\`\`json
{
  "message": "User registered successfully. Please verify OTP.",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "otp": "1234"
}
\`\`\`

### Login
\`\`\`
POST /auth/login
\`\`\`
**Body:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`
**Response:**
\`\`\`json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "points": 0
  }
}
\`\`\`

### Verify OTP
\`\`\`
POST /auth/verify-otp
\`\`\`
**Body:**
\`\`\`json
{
  "phone": "1234567890",
  "otp": "1234"
}
\`\`\`

### Get Profile (Protected)
\`\`\`
GET /auth/profile
Authorization: Bearer {token}
\`\`\`

---

## Product Endpoints

### Get All Products
\`\`\`
GET /products?page=1&limit=20&search=phone&categoryId=1&minPrice=100&maxPrice=1000&sortBy=latest&lang=en
\`\`\`
**Query Parameters:**
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- search: Search term
- categoryId: Filter by category
- storeId: Filter by store
- minPrice: Minimum price
- maxPrice: Maximum price
- isPopular: Filter popular products
- sortBy: latest | price-asc | price-desc | popular
- lang: en | ar

### Get Product by ID
\`\`\`
GET /products/:id?lang=en
\`\`\`

### Get Popular Products
\`\`\`
GET /products/popular?limit=10&lang=en
\`\`\`

---

## Category Endpoints

### Get All Categories
\`\`\`
GET /categories?lang=en&parentId=1
\`\`\`

### Get Category by ID
\`\`\`
GET /categories/:id?lang=en
\`\`\`

### Get Category Products
\`\`\`
GET /categories/:id/products?page=1&limit=20&sortBy=latest&lang=en
\`\`\`

---

## Cart Endpoints (All Protected)

### Get Cart
\`\`\`
GET /cart?lang=en
Authorization: Bearer {token}
\`\`\`

### Add to Cart
\`\`\`
POST /cart
Authorization: Bearer {token}
\`\`\`
**Body:**
\`\`\`json
{
  "productId": "1",
  "storeId": "1"
}
\`\`\`

### Remove from Cart
\`\`\`
DELETE /cart/:id
Authorization: Bearer {token}
\`\`\`

### Clear Cart
\`\`\`
DELETE /cart
Authorization: Bearer {token}
\`\`\`

---

## Wishlist Endpoints (All Protected)

### Get Wishlist
\`\`\`
GET /wishlist?lang=en&type=product
Authorization: Bearer {token}
\`\`\`

### Add to Wishlist
\`\`\`
POST /wishlist
Authorization: Bearer {token}
\`\`\`
**Body:**
\`\`\`json
{
  "productId": "1",
  "type": "product"
}
\`\`\`

### Remove from Wishlist
\`\`\`
DELETE /wishlist/:id
Authorization: Bearer {token}
\`\`\`

---

## Order Endpoints (All Protected)

### Get Orders
\`\`\`
GET /orders?page=1&limit=10&status=pending&lang=en
Authorization: Bearer {token}
\`\`\`

### Get Order by ID
\`\`\`
GET /orders/:id?lang=en
Authorization: Bearer {token}
\`\`\`

### Create Order
\`\`\`
POST /orders
Authorization: Bearer {token}
\`\`\`
**Body:**
\`\`\`json
{
  "storeId": "1",
  "locationId": "1",
  "paymentMethod": "cash",
  "shippingMethod": "1",
  "shippingOptionId": "1",
  "type": "delivery",
  "products": [
    {
      "productId": "1",
      "colorId": "1",
      "sizeId": "1",
      "quantity": 2,
      "price": 100
    }
  ]
}
\`\`\`

### Cancel Order
\`\`\`
PUT /orders/:id/cancel
Authorization: Bearer {token}
\`\`\`

---

## Review Endpoints

### Get Product Reviews
\`\`\`
GET /reviews/product/:id?page=1&limit=10
\`\`\`

### Add Review (Protected)
\`\`\`
POST /reviews
Authorization: Bearer {token}
\`\`\`
**Body:**
\`\`\`json
{
  "productId": "1",
  "rating": 5,
  "review": "Great product!"
}
\`\`\`

---

## Store Endpoints

### Get All Stores
\`\`\`
GET /stores?page=1&limit=20&search=store&lang=en
\`\`\`

### Get Store by ID
\`\`\`
GET /stores/:id?lang=en
\`\`\`

### Get Store Products
\`\`\`
GET /stores/:id/products?page=1&limit=20&sortBy=latest&lang=en
\`\`\`

---

## Quiz Endpoints (All Protected)

### Get Daily Quiz
\`\`\`
GET /quiz/daily?lang=en
Authorization: Bearer {token}
\`\`\`

### Submit Answer
\`\`\`
POST /quiz/answer
Authorization: Bearer {token}
\`\`\`
**Body:**
\`\`\`json
{
  "quizId": "1",
  "answerId": "2"
}
\`\`\`

---

## Wheel Endpoints

### Get Prizes
\`\`\`
GET /wheel/prizes?lang=en
\`\`\`

### Spin Wheel (Protected)
\`\`\`
POST /wheel/spin
Authorization: Bearer {token}
\`\`\`

### Get User Prizes (Protected)
\`\`\`
GET /wheel/user-prizes?lang=en
Authorization: Bearer {token}
\`\`\`

---

## Additional Endpoints

### Promo Code
\`\`\`
POST /promo/validate
POST /promo/apply
\`\`\`

### Shipping
\`\`\`
GET /shipping/options?lang=en
\`\`\`

### Contact
\`\`\`
POST /contact
\`\`\`

### Settings
\`\`\`
GET /settings?lang=en
GET /settings/banners
\`\`\`

### Notifications (Protected)
\`\`\`
GET /notifications?lang=en
Authorization: Bearer {token}
\`\`\`

---

## Response Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Error Response Format
\`\`\`json
{
  "error": "Error message here"
}
\`\`\`
\`\`\`
