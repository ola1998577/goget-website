// API Configuration and Helper Functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  
  // Handle non-JSON responses
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    return { success: true };
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }
  
  return data;
};

// Generic API request function
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

// Authentication APIs
export const authAPI = {
  register: (data: { fName: string; lName: string; email: string; password: string; phone: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyOTP: (data: { phone: string; otp: string }) =>
    apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resendOTP: (data: { phone: string }) =>
    apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiRequest('/auth/profile'),

  updateProfile: (data: any) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};

// Product APIs
export const productAPI = {
  getProducts: (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },

  getProductById: (id: string, lang = 'en') =>
    apiRequest(`/products/${id}?lang=${lang}`),

  getPopularProducts: (limit = 10, lang = 'en') =>
    apiRequest(`/products/popular?limit=${limit}&lang=${lang}`),
};

// Category APIs
export const categoryAPI = {
  getCategories: (lang = 'en') =>
    apiRequest(`/categories?lang=${lang}`),

  getCategoryById: (id: string, lang = 'en') =>
    apiRequest(`/categories/${id}?lang=${lang}`),

  getCategoryProducts: (id: string, params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/categories/${id}/products?${queryString}`);
  },
};

// Cart APIs
export const cartAPI = {
  getCart: (lang = 'en') => apiRequest(`/cart?lang=${lang}`),

  addToCart: (data: { productId: string; storeId?: string }) =>
    apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeFromCart: (id: string) =>
    apiRequest(`/cart/${id}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    apiRequest('/cart', {
      method: 'DELETE',
    }),
};

// Wishlist APIs
export const wishlistAPI = {
  getWishlist: (lang = 'en', type?: string) => {
    const query = type ? `?lang=${lang}&type=${type}` : `?lang=${lang}`;
    return apiRequest(`/wishlist${query}`);
  },

  addToWishlist: (data: { productId?: string; storeId?: string; type: string }) =>
    apiRequest('/wishlist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeFromWishlist: (id: string) =>
    apiRequest(`/wishlist/${id}`, {
      method: 'DELETE',
    }),
};

// Order APIs
export const orderAPI = {
  getOrders: (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders?${queryString}`);
  },

  getOrderById: (id: string, lang = 'en') =>
    apiRequest(`/orders/${id}?lang=${lang}`),

  createOrder: (data: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelOrder: (id: string) =>
    apiRequest(`/orders/${id}/cancel`, {
      method: 'PUT',
    }),
};

// Review APIs
export const reviewAPI = {
  getProductReviews: (productId: string, params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/reviews/product/${productId}?${queryString}`);
  },

  addReview: (data: { productId: string; rating: number; review?: string }) =>
    apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Store APIs
export const storeAPI = {
  getStores: (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stores?${queryString}`);
  },

  getStoreById: (id: string, lang = 'en') =>
    apiRequest(`/stores/${id}?lang=${lang}`),

  getStoreProducts: (id: string, params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stores/${id}/products?${queryString}`);
  },
};

// Market APIs (same as stores)
export const marketAPI = {
  getMarkets: (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/markets?${queryString}`);
  },

  getMarketById: (id: string, lang = 'en') =>
    apiRequest(`/markets/${id}?lang=${lang}`),

  getMarketProducts: (id: string, params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/markets/${id}/products?${queryString}`);
  },
};

// User APIs
export const userAPI = {
  getAddresses: () => apiRequest('/users/addresses'),

  addAddress: (data: any) =>
    apiRequest('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAddress: (id: string, data: any) =>
    apiRequest(`/users/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAddress: (id: string) =>
    apiRequest(`/users/addresses/${id}`, {
      method: 'DELETE',
    }),
};

// Quiz APIs
export const quizAPI = {
  getDailyQuiz: (lang = 'en') =>
    apiRequest(`/quiz/daily?lang=${lang}`),

  submitAnswer: (data: { quizId: string; answerId: string }) =>
    apiRequest('/quiz/answer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Wheel APIs
export const wheelAPI = {
  getPrizes: (lang = 'en') =>
    apiRequest(`/wheel/prizes?lang=${lang}`),

  spinWheel: () =>
    apiRequest('/wheel/spin', {
      method: 'POST',
    }),

  getUserPrizes: (lang = 'en') =>
    apiRequest(`/wheel/user-prizes?lang=${lang}`),
};

// Promo Code APIs
export const promoAPI = {
  validatePromoCode: (code: string) =>
    apiRequest('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  applyPromoCode: (code: string) =>
    apiRequest('/promo/apply', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

// Shipping APIs
export const shippingAPI = {
  getShippingOptions: (lang = 'en') =>
    apiRequest(`/shipping/options?lang=${lang}`),
};

// Contact API
export const contactAPI = {
  submitContact: (data: { name: string; email: string; subject: string; message: string }) =>
    apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Settings APIs
export const settingsAPI = {
  getSettings: (lang = 'en') =>
    apiRequest(`/settings?lang=${lang}`),

  getBanners: () =>
    apiRequest('/settings/banners'),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (lang = 'en') =>
    apiRequest(`/notifications?lang=${lang}`),
};

export default {
  auth: authAPI,
  product: productAPI,
  category: categoryAPI,
  cart: cartAPI,
  wishlist: wishlistAPI,
  order: orderAPI,
  review: reviewAPI,
  store: storeAPI,
  market: marketAPI,
  user: userAPI,
  quiz: quizAPI,
  wheel: wheelAPI,
  promo: promoAPI,
  shipping: shippingAPI,
  contact: contactAPI,
  settings: settingsAPI,
  notification: notificationAPI,
};
