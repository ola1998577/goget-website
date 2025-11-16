export interface Review {
  id: string;
  productId: string;
  userName: string;
  userImage?: string;
  rating: number;
  title: string;
  titleAr: string;
  comment: string;
  commentAr: string;
  images?: string[];
  date: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
}

export interface ProductVariant {
  color?: string;
  colorAr?: string;
  colorHex?: string;
  size?: string;
  sizeAr?: string;
  stock: number;
  priceAdjustment?: number; // إضافة أو طرح من السعر الأساسي
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
  rating: number;
  reviews: number;
  colors?: string[]; // أسماء الألوان
  colorsAr?: string[]; // أسماء الألوان بالعربية
  colorHexes?: string[]; // الألوان hex للعرض
  sizes?: string[]; // المقاسات المتاحة
  sizesAr?: string[]; // المقاسات بالعربية
  variants?: ProductVariant[]; // مخزون لكل تركيبة لون ومقاس
}

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones Pro",
    nameAr: "سماعات لاسلكية برو",
    description: "Premium wireless headphones with noise cancellation",
    descriptionAr: "سماعات لاسلكية فاخرة مع عزل للضوضاء",
    price: 850000,
    oldPrice: 1000000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    ],
    storeId: "1",
    marketId: "1",
    categoryId: "1",
    inStock: true,
    rating: 4.8,
    reviews: 234,
  },
  {
    id: "2",
    name: "Smart Watch Elite",
    nameAr: "ساعة ذكية إليت",
    description: "Feature-packed smartwatch with health tracking",
    descriptionAr: "ساعة ذكية مليئة بالميزات مع تتبع صحي",
    price: 650000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
    ],
    storeId: "1",
    marketId: "1",
    categoryId: "1",
    inStock: true,
    rating: 4.6,
    reviews: 156,
  },
  {
    id: "3",
    name: "Designer Jacket",
    nameAr: "جاكيت مصمم",
    description: "Premium leather jacket for all seasons",
    descriptionAr: "جاكيت جلد فاخر لكل المواسم",
    price: 1200000,
    oldPrice: 1500000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    ],
    storeId: "2",
    marketId: "1",
    categoryId: "2",
    inStock: true,
    rating: 4.7,
    reviews: 89,
    colors: ["Black", "Brown", "Navy Blue"],
    colorsAr: ["أسود", "بني", "أزرق داكن"],
    colorHexes: ["#000000", "#8B4513", "#000080"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sizesAr: ["صغير", "وسط", "كبير", "كبير جداً", "كبير جداً جداً"],
    variants: [
      { color: "Black", colorAr: "أسود", size: "M", sizeAr: "وسط", stock: 5 },
      { color: "Black", colorAr: "أسود", size: "L", sizeAr: "كبير", stock: 8 },
      { color: "Black", colorAr: "أسود", size: "XL", sizeAr: "كبير جداً", stock: 3 },
      { color: "Brown", colorAr: "بني", size: "M", sizeAr: "وسط", stock: 4 },
      { color: "Brown", colorAr: "بني", size: "L", sizeAr: "كبير", stock: 6 },
      { color: "Brown", colorAr: "بني", size: "XL", sizeAr: "كبير جداً", stock: 2 },
      { color: "Navy Blue", colorAr: "أزرق داكن", size: "S", sizeAr: "صغير", stock: 0 },
      { color: "Navy Blue", colorAr: "أزرق داكن", size: "M", sizeAr: "وسط", stock: 7 },
      { color: "Navy Blue", colorAr: "أزرق داكن", size: "L", sizeAr: "كبير", stock: 5 },
    ],
  },
  {
    id: "4",
    name: "Stylish Sneakers",
    nameAr: "أحذية رياضية أنيقة",
    description: "Comfortable and trendy sneakers",
    descriptionAr: "أحذية رياضية مريحة وعصرية",
    price: 450000,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80",
    ],
    storeId: "2",
    marketId: "1",
    categoryId: "2",
    inStock: true,
    rating: 4.5,
    reviews: 203,
    colors: ["White", "Black", "Red"],
    colorsAr: ["أبيض", "أسود", "أحمر"],
    colorHexes: ["#FFFFFF", "#000000", "#DC143C"],
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    sizesAr: ["38", "39", "40", "41", "42", "43", "44"],
    variants: [
      { color: "White", colorAr: "أبيض", size: "40", stock: 10 },
      { color: "White", colorAr: "أبيض", size: "41", stock: 8 },
      { color: "White", colorAr: "أبيض", size: "42", stock: 12 },
      { color: "Black", colorAr: "أسود", size: "40", stock: 6 },
      { color: "Black", colorAr: "أسود", size: "41", stock: 9 },
      { color: "Black", colorAr: "أسود", size: "42", stock: 7 },
      { color: "Black", colorAr: "أسود", size: "43", stock: 4 },
      { color: "Red", colorAr: "أحمر", size: "39", stock: 3 },
      { color: "Red", colorAr: "أحمر", size: "40", stock: 5 },
      { color: "Red", colorAr: "أحمر", size: "41", stock: 0 },
    ],
  },
  {
    id: "5",
    name: "Coffee Maker Deluxe",
    nameAr: "صانعة قهوة ديلوكس",
    description: "Professional coffee maker for your home",
    descriptionAr: "صانعة قهوة احترافية لمنزلك",
    price: 750000,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    ],
    storeId: "3",
    marketId: "2",
    categoryId: "3",
    inStock: true,
    rating: 4.9,
    reviews: 167,
  },
  {
    id: "6",
    name: "Luxury Skincare Set",
    nameAr: "طقم عناية بالبشرة فاخر",
    description: "Complete skincare routine in one package",
    descriptionAr: "روتين عناية كامل في حزمة واحدة",
    price: 950000,
    oldPrice: 1200000,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
    ],
    storeId: "4",
    marketId: "2",
    categoryId: "4",
    inStock: true,
    rating: 4.8,
    reviews: 312,
  },
  {
    id: "7",
    name: "Yoga Mat Premium",
    nameAr: "سجادة يوغا بريميوم",
    description: "Extra thick yoga mat for ultimate comfort",
    descriptionAr: "سجادة يوغا سميكة للراحة القصوى",
    price: 280000,
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
    ],
    storeId: "5",
    marketId: "3",
    categoryId: "5",
    inStock: true,
    rating: 4.6,
    reviews: 98,
  },
  {
    id: "8",
    name: "Best Seller Novel",
    nameAr: "رواية الأكثر مبيعاً",
    description: "Award-winning contemporary fiction",
    descriptionAr: "رواية حائزة على جوائز",
    price: 180000,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    ],
    storeId: "6",
    marketId: "3",
    categoryId: "6",
    inStock: true,
    rating: 4.9,
    reviews: 445,
  },
];

export const productReviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    userName: "أحمد محمد",
    userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    rating: 5,
    title: "Excellent product!",
    titleAr: "منتج ممتاز!",
    comment: "The sound quality is amazing and the noise cancellation works perfectly. Highly recommended!",
    commentAr: "جودة الصوت مذهلة وعزل الضوضاء يعمل بشكل مثالي. أنصح به بشدة!",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80",
    ],
    date: "2024-03-15",
    helpful: 45,
    notHelpful: 2,
    verified: true,
  },
  {
    id: "r2",
    productId: "1",
    userName: "فاطمة علي",
    userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    rating: 4,
    title: "Very comfortable",
    titleAr: "مريحة جداً",
    comment: "Great headphones, very comfortable for long use. Battery life is impressive.",
    commentAr: "سماعات رائعة، مريحة جداً للاستخدام الطويل. عمر البطارية ممتاز.",
    date: "2024-03-10",
    helpful: 23,
    notHelpful: 1,
    verified: true,
  },
  {
    id: "r3",
    productId: "1",
    userName: "محمود حسن",
    rating: 5,
    title: "Best purchase ever",
    titleAr: "أفضل شراء على الإطلاق",
    comment: "Worth every penny! The build quality is exceptional and the sound is crystal clear.",
    commentAr: "يستحق كل قرش! جودة التصنيع استثنائية والصوت نقي جداً.",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80"],
    date: "2024-03-05",
    helpful: 67,
    notHelpful: 0,
    verified: true,
  },
  {
    id: "r4",
    productId: "2",
    userName: "سارة خالد",
    userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    rating: 5,
    title: "Perfect smartwatch",
    titleAr: "ساعة ذكية مثالية",
    comment: "All the features I need in one device. Health tracking is very accurate.",
    commentAr: "كل الميزات التي أحتاجها في جهاز واحد. تتبع الصحة دقيق جداً.",
    date: "2024-03-12",
    helpful: 34,
    notHelpful: 1,
    verified: true,
  },
  {
    id: "r5",
    productId: "3",
    userName: "عمر يوسف",
    rating: 4,
    title: "Great quality jacket",
    titleAr: "جاكيت بجودة رائعة",
    comment: "The leather is genuine and the fit is perfect. Very stylish!",
    commentAr: "الجلد أصلي والقياس مثالي. أنيق جداً!",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    ],
    date: "2024-03-08",
    helpful: 28,
    notHelpful: 3,
    verified: false,
  },
];
