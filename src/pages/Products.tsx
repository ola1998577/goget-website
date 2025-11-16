import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { SearchFilter } from "@/components/SearchFilter";
import { Pagination } from "@/components/Pagination";
import { productAPI, categoryAPI } from "@/lib/api";
import { Product, Category } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 12;

const Products = () => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterCategory, setFilterCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [minRating, setMinRating] = useState(0);

  const maxPrice = 2000000;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories(language);
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error("[v0] Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [language]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const params: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          lang: language,
        };

        if (searchQuery) params.search = searchQuery;
        if (filterCategory !== "all") params.categoryId = filterCategory;
        if (priceRange[0] > 0) params.minPrice = priceRange[0];
        if (priceRange[1] < maxPrice) params.maxPrice = priceRange[1];
        if (minRating > 0) params.minRating = minRating;
        if (sortBy === "price-low") {
          params.sort = "price";
          params.order = "asc";
        } else if (sortBy === "price-high") {
          params.sort = "price";
          params.order = "desc";
        } else if (sortBy === "rating") {
          params.sort = "rating";
          params.order = "desc";
        }

        const response = await productAPI.getProducts(params);
        if (response.success) {
          setProducts(response.data || []);
          setTotalProducts(response.pagination?.total || 0);
        }
      } catch (error) {
        console.error("[v0] Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery, filterCategory, priceRange, minRating, sortBy, language]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("latestProducts")}</h1>
        <p className="text-muted-foreground text-lg">
          {language === "ar" 
            ? "اكتشف أحدث مجموعاتنا" 
            : "Discover our latest collection"}
        </p>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          handleFilterChange();
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        priceRange={priceRange}
        onPriceRangeChange={(value) => {
          setPriceRange(value);
          handleFilterChange();
        }}
        maxPrice={maxPrice}
        minRating={minRating}
        onRatingChange={(value) => {
          setMinRating(value);
          handleFilterChange();
        }}
        categoryFilter={filterCategory}
        onCategoryChange={(value) => {
          setFilterCategory(value);
          handleFilterChange();
        }}
        categories={categories}
      />

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          {language === "ar" 
            ? `${totalProducts} منتج متاح`
            : `${totalProducts} products available`}
        </p>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-lg" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalProducts}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {language === "ar" 
              ? "لم يتم العثور على منتجات تطابق معايير البحث"
              : "No products found matching your criteria"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
