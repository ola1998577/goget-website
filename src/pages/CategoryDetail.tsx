import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreCard } from "@/components/StoreCard";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilter } from "@/components/SearchFilter";
import { Pagination } from "@/components/Pagination";
import { categoryAPI, storeAPI } from "@/lib/api";
import { Category, Store, Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import * as Icons from "lucide-react";

const ITEMS_PER_PAGE = 12;

const CategoryDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [category, setCategory] = useState<Category | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [minRating, setMinRating] = useState(0);

  const maxPrice = 2000000;

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [categoryRes, storesRes, productsRes] = await Promise.all([
          categoryAPI.getCategoryById(id, language),
          storeAPI.getStores({ categoryId: id, lang: language }),
          categoryAPI.getCategoryProducts(id, { lang: language }),
        ]);

        if (categoryRes.success && categoryRes.data) setCategory(categoryRes.data);
        if (storesRes.success) setStores(storesRes.data || []);
        if (productsRes.success) setAllProducts(productsRes.data || []);
      } catch (error) {
        console.error("[v0] Error fetching category data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
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
  }, [allProducts, searchQuery, priceRange, minRating, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="gradient-hero py-20 mb-12">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-6" />
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link to="/categories">
          <Button className="mt-4">Back to Categories</Button>
        </Link>
      </div>
    );
  }

  const Icon = (Icons as any)[category.icon] || Icons.Package;
  const name = language === "ar" ? category.nameAr : category.name;
  const description = language === "ar" ? category.descriptionAr : category.description;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="gradient-hero text-primary-foreground py-20 mb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-6">
            <Icon className="h-12 w-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{name}</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">{description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="stores">Stores</TabsTrigger>
          </TabsList>

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

          <TabsContent value="stores">
            {stores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {language === "ar" ? "لا توجد متاجر" : "No stores found"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CategoryDetail;
