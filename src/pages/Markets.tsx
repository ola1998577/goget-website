import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarketCard } from "@/components/MarketCard";
import { marketAPI } from "@/lib/api";
import { Market } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const Markets = () => {
  const { t, language } = useLanguage();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setIsLoading(true);
        const response = await marketAPI.getMarkets({ lang: language });
        if (response.success) {
          setMarkets(response.data || []);
        }
      } catch (error) {
        console.error("[v0] Error fetching markets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, [language]);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("markets")}</h1>
        <p className="text-muted-foreground text-lg">
          Explore all markets across Syria
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : markets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {language === "ar" ? "لا توجد أسواق متاحة" : "No markets available"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Markets;
