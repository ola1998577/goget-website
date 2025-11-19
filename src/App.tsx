import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import Home from "./pages/Home";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import StoreDetail from "./pages/StoreDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Offers from "./pages/Offers";
import OfferDetail from "./pages/OfferDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterOTP from "./pages/RegisterOTP";
import LoginOTP from "./pages/LoginOTP";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import Loyalty from "./pages/Loyalty";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/markets" element={<Markets />} />
                        <Route path="/market/:id" element={<MarketDetail />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/category/:id" element={<CategoryDetail />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/store/:id" element={<StoreDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/offers" element={<Offers />} />
                        <Route path="/offer/:id" element={<OfferDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/register-otp" element={<RegisterOTP />} />
                        <Route path="/login-otp" element={<LoginOTP />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/loyalty" element={<Loyalty />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
