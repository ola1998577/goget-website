import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-br from-secondary via-primary-dark to-primary text-white mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <img 
              src={logo} 
              alt="GoGet" 
              className="h-12 w-auto mb-4 brightness-0 invert drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]" 
            />
            <p className="text-sm text-white/80">
              {t("heroSubtitle")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              <li><Link to="/markets" className="text-sm text-white/80 hover:text-accent transition-colors">{t("markets")}</Link></li>
              <li><Link to="/categories" className="text-sm text-white/80 hover:text-accent transition-colors">{t("categories")}</Link></li>
              <li><Link to="/products" className="text-sm text-white/80 hover:text-accent transition-colors">{t("latestProducts")}</Link></li>
              <li><Link to="/offers" className="text-sm text-white/80 hover:text-accent transition-colors">{t("offers")}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold mb-4">{t("customerService")}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-white/80 hover:text-accent transition-colors">{t("aboutUs")}</Link></li>
              <li><Link to="/contact" className="text-sm text-white/80 hover:text-accent transition-colors">{t("contactUs")}</Link></li>
              <li><Link to="/profile" className="text-sm text-white/80 hover:text-accent transition-colors">{t("profile")}</Link></li>
              <li><Link to="/orders" className="text-sm text-white/80 hover:text-accent transition-colors">{t("orders")}</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-bold mb-4">{t("followUs")}</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="hover:text-accent transition-all hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-all hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-all hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@goget.sy</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+963 11 123 4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/80">
          <p>© 2024 GoGet. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
};
