import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Star, MapPin } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { storeAPI, marketAPI } from "@/lib/api";
import { Store, Product, Market } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const StoreDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [storeRes, productsRes] = await Promise.all([
          storeAPI.getStoreById(id, language),
          storeAPI.getStoreProducts(id, { lang: language }),
        ]);

        if (storeRes.success && storeRes.data) {
          setStore(storeRes.data);
          
          // Fetch market data
          if (storeRes.data.marketId) {
            const marketRes = await marketAPI.getMarketById(storeRes.data.marketId, language);
            if (marketRes.success) setMarket(marketRes.data);
          }
        }

        if (productsRes.success) {
          setProducts(productsRes.data || []);
        }
      } catch (error) {
        console.error("[v0] Error fetching store data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [id, language]);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="gradient-hero py-16 mb-12">
          <div className="container mx-auto px-4">
            <Skeleton className="h-24 w-24 rounded-lg mb-4" />
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Store not found</h1>
        <Link to="/markets">
          <Button className="mt-4">Back to Markets</Button>
        </Link>
      </div>
    );
  }

  const name = language === "ar" ? store.nameAr : store.name;
  const description = language === "ar" ? store.descriptionAr : store.description;
  const marketName = market ? (language === "ar" ? market.nameAr : market.name) : "";
  const city = market ? (language === "ar" ? market.cityAr : market.city) : "";

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="gradient-hero text-primary-foreground py-16 mb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-6">
            <img
              src={store.logo || "/placeholder.svg"}
              alt={name}
              className="w-24 h-24 rounded-lg border-4 border-white object-cover"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{name}</h1>
              <p className="text-lg opacity-90 mb-4">{description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold">{store.rating || 0}</span>
                </div>
                {marketName && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{marketName}{city && `, ${city}`}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Products from this store</h2>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === "ar" ? "لا توجد منتجات في هذا المتجر" : "No products in this store"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;
