import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Store, Package } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreCard } from "@/components/StoreCard";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilter } from "@/components/SearchFilter";
import { Pagination } from "@/components/Pagination";
import { marketAPI, storeAPI, categoryAPI } from "@/lib/api";
import { Market, Store as StoreType, Product, Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 12;

const MarketDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [market, setMarket] = useState<Market | null>(null);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [minRating, setMinRating] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");

  const maxPrice = 2000000;

  useEffect(() => {
    const fetchMarketData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [marketRes, storesRes, productsRes, categoriesRes] = await Promise.all([
          marketAPI.getMarketById(id, language),
          storeAPI.getStores({ marketId: id, lang: language }),
          marketAPI.getMarketProducts(id, { lang: language }),
          categoryAPI.getCategories(language),
        ]);

        if (marketRes.success) setMarket(marketRes.data);
        if (storesRes.success) setStores(storesRes.data || []);
        if (productsRes.success) setAllProducts(productsRes.data || []);
        if (categoriesRes.success) setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error("[v0] Error fetching market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, [id, language]);

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.nameAr && p.nameAr.includes(query))
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((p) => p.categoryId === filterCategory);
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    if (minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= minRating);
    }

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [allProducts, searchQuery, filterCategory, priceRange, minRating, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Skeleton className="h-96 w-full" />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Market not found</h1>
        <Link to="/markets">
          <Button className="mt-4">Back to Markets</Button>
        </Link>
      </div>
    );
  }

  const name = language === "ar" ? market.nameAr : market.name;
  const description = language === "ar" ? market.descriptionAr : market.description;
  const city = language === "ar" ? market.cityAr : market.city;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative h-96">
        <img
          src={market.image || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{name}</h1>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{city}</span>
          </div>
          <p className="text-white/80 mt-4 max-w-2xl">{description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="stores" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="stores">
              <Store className="h-4 w-4 mr-2" />
              Stores
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="stores">
            {stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === "ar" ? "لا توجد متاجر" : "No stores found"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              sortBy={sortBy}
              onSortChange={setSortBy}
              priceRange={priceRange}
              onPriceRangeChange={(value) => {
                setPriceRange(value);
                setCurrentPage(1);
              }}
              maxPrice={maxPrice}
              minRating={minRating}
              onRatingChange={(value) => {
                setMinRating(value);
                setCurrentPage(1);
              }}
              categoryFilter={filterCategory}
              onCategoryChange={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
              categories={categories}
            />

            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredProducts.length}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {language === "ar" 
                    ? "لم يتم العثور على منتجات"
                    : "No products found"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories">
            {categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Link key={category.id} to={`/category/${category.id}`}>
                    <div className="p-6 border rounded-lg hover:border-primary hover:shadow-lg transition-all duration-300 text-center">
                      <h3 className="font-semibold">
                        {language === "ar" ? category.nameAr : category.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === "ar" ? "لا توجد فئات" : "No categories found"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketDetail;
