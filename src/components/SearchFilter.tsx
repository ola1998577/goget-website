import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  maxPrice: number;
  minRating?: number;
  onRatingChange?: (value: number) => void;
  categoryFilter?: string;
  onCategoryChange?: (value: string) => void;
  categories?: Array<{ id: string; name: string; nameAr: string }>;
}

export const SearchFilter = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  minRating,
  onRatingChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: SearchFilterProps) => {
  const { language } = useLanguage();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={language === "ar" ? "ابحث عن المنتجات..." : "Search products..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-12"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        {categories && categoryFilter !== undefined && onCategoryChange && (
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={language === "ar" ? "جميع الفئات" : "All Categories"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === "ar" ? "جميع الفئات" : "All Categories"}
                </SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {language === "ar" ? cat.nameAr : cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={language === "ar" ? "ترتيب حسب" : "Sort by"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">{language === "ar" ? "الأحدث" : "Latest"}</SelectItem>
            <SelectItem value="price-low">
              {language === "ar" ? "السعر: من الأقل للأعلى" : "Price: Low to High"}
            </SelectItem>
            <SelectItem value="price-high">
              {language === "ar" ? "السعر: من الأعلى للأقل" : "Price: High to Low"}
            </SelectItem>
            <SelectItem value="rating">
              {language === "ar" ? "الأعلى تقييماً" : "Highest Rated"}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              {language === "ar" ? "فلاتر متقدمة" : "Advanced Filters"}
            </Button>
          </SheetTrigger>
          <SheetContent side={language === "ar" ? "left" : "right"}>
            <SheetHeader>
              <SheetTitle>{language === "ar" ? "فلاتر متقدمة" : "Advanced Filters"}</SheetTitle>
              <SheetDescription>
                {language === "ar" 
                  ? "قم بتخصيص نتائج البحث حسب تفضيلاتك" 
                  : "Customize your search results"}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Price Range Filter */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  {language === "ar" ? "نطاق السعر" : "Price Range"}
                </Label>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={10000}
                    value={priceRange}
                    onValueChange={onPriceRangeChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])} SYP</span>
                    <span>{formatPrice(priceRange[1])} SYP</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              {minRating !== undefined && onRatingChange && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    {language === "ar" ? "التقييم الأدنى" : "Minimum Rating"}
                  </Label>
                  <Select value={minRating.toString()} onValueChange={(v) => onRatingChange(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{language === "ar" ? "جميع التقييمات" : "All Ratings"}</SelectItem>
                      <SelectItem value="4">4+ ⭐</SelectItem>
                      <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                      <SelectItem value="4.8">4.8+ ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onPriceRangeChange([0, maxPrice]);
                  if (onRatingChange) onRatingChange(0);
                  if (onCategoryChange) onCategoryChange("all");
                }}
              >
                {language === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
