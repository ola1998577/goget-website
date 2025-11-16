# Frontend Integration Guide

This guide explains how to connect the React frontend to the Node.js backend API.

## Step 1: Configure Environment Variables

Create a `.env` file in the React project root:

\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

For production, change this to your production API URL.

## Step 2: Install the API Integration File

The `src/lib/api.ts` file has been created with all API endpoints. This file provides:

- Type-safe API calls
- Automatic token management
- Error handling
- All endpoints organized by feature

## Step 3: Update Context Files

### Update AuthContext.tsx

Replace the simulated login/register functions with real API calls:

\`\`\`typescript
import { authAPI } from '@/lib/api';

// In login function:
const login = async (email: string, password: string) => {
  try {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
    toast({ title: "Welcome back!", description: "You've successfully logged in" });
  } catch (error: any) {
    toast({ 
      title: "Login failed", 
      description: error.message,
      variant: "destructive" 
    });
  }
};

// In register function:
const register = async (name: string, email: string, password: string, phone: string) => {
  try {
    const [fName, ...lNameParts] = name.split(' ');
    const lName = lNameParts.join(' ') || fName;
    
    const response = await authAPI.register({ fName, lName, email, password, phone });
    // Handle OTP verification flow
    toast({ 
      title: "Registration successful", 
      description: "Please verify your phone number" 
    });
  } catch (error: any) {
    toast({ 
      title: "Registration failed", 
      description: error.message,
      variant: "destructive" 
    });
  }
};
\`\`\`

### Update CartContext.tsx

Replace localStorage cart with API calls:

\`\`\`typescript
import { cartAPI } from '@/lib/api';

const fetchCart = async () => {
  try {
    const response = await cartAPI.getCart();
    setItems(response.items);
  } catch (error) {
    console.error('Failed to fetch cart:', error);
  }
};

const addItem = async (product: Product) => {
  try {
    await cartAPI.addToCart({ 
      productId: product.id,
      storeId: product.store?.id 
    });
    await fetchCart(); // Refresh cart
    toast({ title: "Added to cart" });
  } catch (error: any) {
    toast({ 
      title: "Failed to add to cart",
      description: error.message,
      variant: "destructive"
    });
  }
};
\`\`\`

### Update WishlistContext.tsx

\`\`\`typescript
import { wishlistAPI } from '@/lib/api';

const fetchWishlist = async () => {
  try {
    const response = await wishlistAPI.getWishlist();
    setItems(response.items);
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
  }
};

const addItem = async (item: Product | Store, type: 'product' | 'store') => {
  try {
    await wishlistAPI.addToWishlist({
      productId: type === 'product' ? item.id : undefined,
      storeId: type === 'store' ? item.id : undefined,
      type
    });
    await fetchWishlist();
    toast({ title: "Added to wishlist" });
  } catch (error: any) {
    toast({ 
      title: "Failed to add to wishlist",
      description: error.message,
      variant: "destructive"
    });
  }
};
\`\`\`

## Step 4: Update Page Components

### Products Page

\`\`\`typescript
import { productAPI } from '@/lib/api';
import { useEffect, useState } from 'react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getProducts({
          page: 1,
          limit: 20,
          lang: 'en'
        });
        setProducts(response.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ... rest of component
};
\`\`\`

### Product Detail Page

\`\`\`typescript
import { productAPI, reviewAPI } from '@/lib/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getProductById(id);
        setProduct(response.product);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  // ... rest of component
};
\`\`\`

## Step 5: Testing the Integration

1. **Start the backend server:**
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`

2. **Start the frontend:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Test the following flows:**
   - Register a new user
   - Verify OTP
   - Login
   - Browse products
   - Add to cart
   - Add to wishlist
   - Create an order
   - Submit a review

## API Endpoints Reference

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- POST `/api/auth/verify-otp` - Verify OTP
- GET `/api/auth/profile` - Get user profile (requires auth)

### Products
- GET `/api/products` - Get all products (with filters)
- GET `/api/products/:id` - Get product details
- GET `/api/products/popular` - Get popular products

### Cart
- GET `/api/cart` - Get cart items (requires auth)
- POST `/api/cart` - Add to cart (requires auth)
- DELETE `/api/cart/:id` - Remove from cart (requires auth)

### Orders
- GET `/api/orders` - Get user orders (requires auth)
- POST `/api/orders` - Create order (requires auth)
- GET `/api/orders/:id` - Get order details (requires auth)

### Quiz & Wheel
- GET `/api/quiz/daily` - Get daily quiz (requires auth)
- POST `/api/quiz/answer` - Submit quiz answer (requires auth)
- POST `/api/wheel/spin` - Spin the wheel (requires auth)

## Error Handling

All API functions throw errors that can be caught and displayed to users:

\`\`\`typescript
try {
  const response = await authAPI.login({ email, password });
  // Handle success
} catch (error: any) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
\`\`\`

## Authentication Flow

1. User logs in → Backend returns JWT token
2. Token is stored in localStorage
3. All authenticated requests include token in Authorization header
4. On logout → Token is removed from localStorage

## Next Steps

1. Replace all simulated API calls in Context files with real API calls
2. Add loading states to all components
3. Implement proper error handling
4. Add request interceptors for token refresh (if needed)
5. Implement file upload for product images (if needed)

## Support

For any issues or questions, refer to the backend README.md or API documentation.
\`\`\`
