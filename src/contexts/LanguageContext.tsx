import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    home: "Home",
    markets: "Markets",
    categories: "Categories",
    latestProducts: "Latest Products",
    offers: "Offers",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    cart: "Cart",
    wishlist: "Wishlist",
    login: "Login",
    register: "Register",
    orders: "My Orders",
    profile: "Profile",
    logout: "Logout",
    
    // Hero
    heroTitle: "GoGet - Your Multi-Market Shopping Destination",
    heroSubtitle: "Discover thousands of products from multiple markets across Syria",
    shopNow: "Shop Now",
    
    // Sections
    exploreMarkets: "Explore Markets",
    featuredStores: "Featured Stores",
    trendingProducts: "Trending Products",
    specialOffers: "Special Offers",
    
    // Product
    addToCart: "Add to Cart",
    addToWishlist: "Add to Wishlist",
    removeFromWishlist: "Remove from Wishlist",
    outOfStock: "Out of Stock",
    inStock: "In Stock",
    viewDetails: "View Details",
    
    // Cart
    myCart: "My Cart",
    emptyCart: "Your cart is empty",
    total: "Total",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    
    // Points
    points: "Points",
    earnPoints: "Earn points with every purchase",
    redeemPoints: "Redeem Points",
    myPoints: "My Points",
    pointsHistory: "Points History",
    
    // Wheel
    spinToWin: "Spin to Win",
    tryYourLuck: "Try Your Luck!",
    spin: "Spin",
    congratulations: "Congratulations!",
    youWon: "You Won",
    
    // Auth
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    signIn: "Sign In",
    signUp: "Sign Up",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    
    // Footer
    followUs: "Follow Us",
    quickLinks: "Quick Links",
    customerService: "Customer Service",
    allRightsReserved: "All rights reserved",
  },
  ar: {
    // Navbar
    home: "الرئيسية",
    markets: "الأسواق",
    categories: "الفئات",
    latestProducts: "أحدث المنتجات",
    offers: "العروض",
    aboutUs: "من نحن",
    contactUs: "اتصل بنا",
    cart: "السلة",
    wishlist: "المفضلة",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    orders: "طلباتي",
    profile: "الملف الشخصي",
    logout: "تسجيل الخروج",
    
    // Hero
    heroTitle: "GoGet - وجهتك للتسوق من أسواق متعددة",
    heroSubtitle: "اكتشف آلاف المنتجات من أسواق متعددة في جميع أنحاء سوريا",
    shopNow: "تسوق الآن",
    
    // Sections
    exploreMarkets: "استكشف الأسواق",
    featuredStores: "متاجر مميزة",
    trendingProducts: "المنتجات الرائجة",
    specialOffers: "عروض خاصة",
    
    // Product
    addToCart: "أضف إلى السلة",
    addToWishlist: "أضف إلى المفضلة",
    removeFromWishlist: "إزالة من المفضلة",
    outOfStock: "غير متوفر",
    inStock: "متوفر",
    viewDetails: "عرض التفاصيل",
    
    // Cart
    myCart: "��لتي",
    emptyCart: "سلتك فارغة",
    total: "المجموع",
    checkout: "إتمام الطلب",
    continueShopping: "متابعة التسوق",
    
    // Points
    points: "النقاط",
    earnPoints: "اكسب نقاطاً مع كل عملية شراء",
    redeemPoints: "استبدل النقاط",
    myPoints: "نقاطي",
    pointsHistory: "سجل النقاط",
    
    // Wheel
    spinToWin: "اسحب للفوز",
    tryYourLuck: "جرب حظك!",
    spin: "تدوير",
    congratulations: "تهانينا!",
    youWon: "لقد ربحت",
    
    // Auth
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    dontHaveAccount: "ليس لديك حساب؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    
    // Footer
    followUs: "تابعنا",
    quickLinks: "روابط سريعة",
    customerService: "خدمة العملاء",
    allRightsReserved: "جميع الحقوق محفوظة",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "ar";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
