import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/Pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";

const ITEMS_PER_PAGE = 9;

const Offers = () => {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredOffers = useMemo(() => {
    let filtered = [...offers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          (offer.title && offer.title.toLowerCase().includes(query)) ||
          (offer.nameAr && offer.nameAr.includes(query))
      );
    }

    // Sorting
    if (sortBy === "discount-high") {
      filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sortBy === "discount-low") {
      filtered.sort((a, b) => (a.discount || 0) - (b.discount || 0));
    } else if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [offers, searchQuery, sortBy]);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.product.getOffers({ limit: 100, lang: language });
        // API returns { success: true, data: [...] }
        const data = res?.data ?? res;
        setOffers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("[v0] Error fetching offers:", err);
        setError(err?.message || 'Failed to load offers');
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [language]);

  // Pagination
  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOffers = filteredOffers.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("specialOffers")}</h1>
        <p className="text-muted-foreground text-lg">
          {language === "ar" 
            ? "لا تفوت هذه العروض المذهلة" 
            : "Don't miss out on these amazing deals"}
        </p>
      </div>

      {/* Search and Sort */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={language === "ar" ? "ابحث عن العروض..." : "Search offers..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-10 h-12"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            {language === "ar" 
              ? `${filteredOffers.length} عرض متاح`
              : `${filteredOffers.length} offers available`}
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={language === "ar" ? "ترتيب حسب" : "Sort by"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">
                {language === "ar" ? "الأحدث" : "Latest"}
              </SelectItem>
              <SelectItem value="discount-high">
                {language === "ar" ? "الخصم الأعلى" : "Highest Discount"}
              </SelectItem>
              <SelectItem value="discount-low">
                {language === "ar" ? "الخصم الأقل" : "Lowest Discount"}
              </SelectItem>
              <SelectItem value="price-low">
                {language === "ar" ? "السعر الأقل" : "Price: Low to High"}
              </SelectItem>
              <SelectItem value="price-high">
                {language === "ar" ? "السعر الأعلى" : "Price: High to Low"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Offers Grid */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">{language === 'ar' ? 'جارٍ تحميل العروض...' : 'Loading offers...'}</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive text-lg">{error}</p>
        </div>
      )}
      {!loading && !error && currentOffers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOffers.map((offer) => {
              const title = language === "ar"
                ? (offer.nameAr || offer.title)
                : (offer.title || offer.name);

              return (
                <Link key={offer.id} to={`/product/${offer.id}`}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative overflow-hidden h-56">
                      <img
                        src={offer.image || "/placeholder.svg"}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {offer.discount && (
                        <Badge className="absolute top-4 left-4 text-lg px-4 py-2 bg-destructive">
                          {Math.round(offer.discount)}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {title}
                      </h3>
                      <div className="flex justify-between items-end">
                        <div>
                          {offer.totalPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              {offer.totalPrice}
                            </p>
                          )}
                          <p className="text-2xl font-bold text-primary">
                            {offer.price}
                          </p>
                        </div>
                        {offer.rating && (
                          <div className="text-right">
                            <p className="text-sm text-yellow-500">★ {offer.rating}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredOffers.length}
            />
          )}
        </>
      ) : (
        !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === "ar" 
                ? "لم يتم العثور على عروض تطابق معايير البحث"
                : "No offers found matching your criteria"}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Offers;
