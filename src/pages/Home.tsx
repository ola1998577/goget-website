import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Store } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { MarketCard } from "@/components/MarketCard";
import { StoreCard } from "@/components/StoreCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { WheelOfFortuneButton } from "@/components/WheelOfFortuneButton";
import { AppDownload } from "@/components/AppDownload";
import { productAPI, storeAPI, marketAPI } from "@/lib/api";
import { Product, Store as StoreType, Market } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, storesRes, marketsRes] = await Promise.all([
          productAPI.getPopularProducts(8, language),
          storeAPI.getStores({ limit: 6, lang: language }),
          marketAPI.getMarkets({ lang: language }),
        ]);

        if (productsRes.success) setProducts(productsRes.data || []);
        if (storesRes.success) setStores(storesRes.data || []);
        if (marketsRes.success) setMarkets(marketsRes.data || []);
      } catch (error) {
        console.error("[v0] Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [language]);

  return (
    <div className="animate-fade-in relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Markets Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t("exploreMarkets")}</h2>
            <p className="text-muted-foreground">
              Discover products from different markets across Syria
            </p>
          </div>
          <Link to="/markets">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </section>

      {/* Stores Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">{t("featuredStores")}</h2>
              <p className="text-muted-foreground">Top rated stores in your area</p>
            </div>
          </div>
          <Link to="/stores">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">{t("trendingProducts")}</h2>
              <p className="text-muted-foreground">Most popular items this week</p>
            </div>
          </div>
          <Link to="/products">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* App Download Section */}
      <AppDownload />

      {/* Wheel of Fortune Button */}
      <WheelOfFortuneButton />
    </div>
  );
};

export default Home;
