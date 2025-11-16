// User & Auth Types
export interface User {
  id: string;
  fName: string;
  lName: string;
  email: string;
  phone: string;
  points: number;
  verified: boolean;
  image?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

// Product Types
export interface ProductImage {
  id: string;
  url: string;
  order: number;
}

export interface ProductColor {
  id: string;
  name: string;
  nameAr: string;
  hex: string;
}

export interface ProductSize {
  id: string;
  name: string;
  nameAr: string;
}

export interface ProductVariant {
  color?: string;
  colorAr?: string;
  colorHex?: string;
  size?: string;
  sizeAr?: string;
  stock: number;
  priceAdjustment?: number;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  oldPrice?: number;
  image: string;
  images: string[];
  storeId: string;
  marketId: string;
  categoryId: string;
  inStock: boolean;
  stock?: number;
  rating: number;
  reviews: number;
  colors?: ProductColor[];
  sizes?: ProductSize[];
  variants?: ProductVariant[];
  createdAt?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Category Types
export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionAr: string;
  image?: string;
  productCount?: number;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  logo: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  marketId: string;
  isActive: boolean;
}

// Market Types
export interface Market {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  image?: string;
  storeCount: number;
}

// Cart Types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  marketId: string;
  storeId: string;
  color?: string;
  size?: string;
  stock?: number;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  marketId: string;
  storeId: string;
  type?: 'product' | 'store';
}

// Order Types
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productNameAr: string;
  productImage: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  promoCode?: string;
  discount?: number;
  shippingCost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Address Types
export interface Address {
  id: string;
  userId: string;
  governorateId: string;
  governorateName?: string;
  areaId: string;
  areaName?: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  isDefault: boolean;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  review?: string;
  images?: string[];
  createdAt: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
}

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Quiz Types
export interface QuizAnswer {
  id: string;
  answer: string;
  answerAr: string;
  isCorrect: boolean;
}

export interface Quiz {
  id: string;
  question: string;
  questionAr: string;
  answers: QuizAnswer[];
  points: number;
  date: string;
}

// Wheel/Prize Types
export interface Prize {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  type: 'points' | 'discount' | 'product' | 'free_shipping';
  value: number;
  color: string;
}

export interface UserPrize {
  id: string;
  prizeId: string;
  prize: Prize;
  wonAt: string;
  claimed: boolean;
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minOrderAmount?: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive: boolean;
}

// Shipping Types
export interface ShippingOption {
  id: string;
  name: string;
  nameAr: string;
  cost: number;
  estimatedDays: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'order' | 'promotion' | 'system';
  isRead: boolean;
  createdAt: string;
}

// Settings Types
export interface Settings {
  id: string;
  key: string;
  value: string;
  valueAr?: string;
}

export interface Banner {
  id: string;
  title?: string;
  titleAr?: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ProductFilters extends PaginationParams {
  categoryId?: string;
  storeId?: string;
  marketId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
}
