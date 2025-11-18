import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Star, Minus, Plus, StoreIcon } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { ReviewForm } from "@/components/ReviewForm";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { productAPI, reviewAPI, storeAPI } from "@/lib/api";
import { Product, Review, Store } from "@/types";

const ProductDetail = () => {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  // Auto-advance images every 3 seconds
  useEffect(() => {
    if (!product || !product.images || product.images.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [product]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const [productRes, reviewsRes] = await Promise.all([
          productAPI.getProductById(id, language),
          reviewAPI.getProductReviews(id, { lang: language }),
        ]);

        if (productRes.success && productRes.data) {
          setProduct(productRes.data);
          
          // Fetch store data
          if (productRes.data.storeId) {
            const storeRes = await storeAPI.getStoreById(productRes.data.storeId, language);
            if (storeRes.success) setStore(storeRes.data);
          }

          // Fetch related products
          const relatedRes = await productAPI.getProducts({
            categoryId: productRes.data.categoryId,
            limit: 4,
            lang: language,
          });
          if (relatedRes.success) {
            setRelatedProducts((relatedRes.data || []).filter((p: Product) => p.id !== id));
          }
        } else {
          setError("Product not found");
        }

        // Review API may return different shapes: { reviews: [...] } or { data: [...] } or directly the array
        const rawReviews = (reviewsRes && (reviewsRes.reviews || reviewsRes.data)) || reviewsRes || [];
        if (rawReviews && Array.isArray(rawReviews)) {
          const mapped = rawReviews.map((r: any) => ({
            id: String(r.id),
            userName: r.userName || `${r.user?.fName || ''} ${r.user?.lName || ''}`.trim() || 'User',
            userImage: r.userImage || r.user?.image || undefined,
            rating: r.rating || r.rate || 0,
            title: r.title || r.summary || '',
            titleAr: r.titleAr || r.summaryAr || '',
            comment: r.comment || r.review || '',
            commentAr: r.commentAr || r.reviewAr || '',
            images: r.images || [],
            date: r.date || r.createdAt,
            helpful: r.helpful || 0,
            notHelpful: r.notHelpful || 0,
            verified: r.verified !== undefined ? r.verified : true,
          }));
          setReviews(mapped || []);
        }
      } catch (error) {
        console.error("[v0] Error fetching product:", error);
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id, language]);

  // Fetch only reviews (for refresh)
  const fetchReviews = async () => {
    if (!id) return;
    try {
      const reviewsRes = await reviewAPI.getProductReviews(id, { lang: language });
      const raw = (reviewsRes && (reviewsRes.reviews || reviewsRes.data)) || reviewsRes || [];
      if (Array.isArray(raw)) {
        const mapped = raw.map((r: any) => ({
          id: String(r.id),
          userName: r.user?.fName ? `${r.user.fName} ${r.user.lName || ''}`.trim() : (r.userName || 'User'),
          userImage: r.user?.image || r.userImage || undefined,
          rating: r.rating || r.rate || 0,
          title: r.title || r.summary || '',
          titleAr: r.titleAr || r.summaryAr || '',
          comment: r.comment || r.review || '',
          commentAr: r.commentAr || r.reviewAr || '',
          review: r.review || r.comment || '',
          images: r.images || [],
          date: r.createdAt || r.date,
          helpful: r.helpful || 0,
          notHelpful: r.notHelpful || 0,
          verified: r.verified !== undefined ? r.verified : true,
        }));
        setReviews(mapped || []);
      }
    } catch (err) {
      // ignore
    }
  };

  // Get available stock for selected variant
  const getAvailableStock = () => {
    if (!product?.variants || !selectedColor || !selectedSize) return null;
    const variant = product.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    return variant?.stock || 0;
  };

  const availableStock = getAvailableStock();
  const isVariantInStock = availableStock !== null && availableStock > 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Skeleton className="h-96 w-full rounded-lg mb-4" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{error || "Product not found"}</h1>
        <Link to="/products">
          <Button className="gradient-primary">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const name = language === "ar" ? product.nameAr : product.name;
  const description = language === "ar" ? product.descriptionAr : product.description;
  const storeName = store ? (language === "ar" ? store.nameAr : store.name) : "";
  const isWishlisted = isInWishlist(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.colors && !selectedColor) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى اختيار اللون' : 'Please select a color',
        variant: 'destructive',
      });
      return;
    }
    
    if (product.sizes && !selectedSize) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى اختيار المقاس' : 'Please select a size',
        variant: 'destructive',
      });
      return;
    }
    
    // Add selected product to cart
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      marketId: product.marketId,
      storeId: product.storeId,
    });

    toast({
      title: language === 'ar' ? 'تمت الإضافة' : 'Added to cart',
      description: language === 'ar' ? 'تمت إضافة المنتج إلى السلة' : 'Product added to cart',
      variant: 'default',
    });
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        marketId: product.marketId,
        storeId: product.storeId,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div>
          <div className="mb-4 rounded-lg overflow-hidden border">
            <img
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={name}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`rounded-lg overflow-hidden border-2 ${
                  selectedImage === idx ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={img || "/placeholder.svg"} alt={`${name} ${idx + 1}`} className="w-full h-20 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {discount > 0 && (
                <Badge className="mb-2 bg-destructive">-{discount}%</Badge>
              )}
              <h1 className="text-3xl font-bold mb-2">{name}</h1>
              {storeName && (
                <Link to={`/store/${product.storeId}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <StoreIcon className="h-4 w-4" />
                  <span>{storeName}</span>
                </Link>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleWishlist}
              className={isWishlisted ? "text-destructive" : ""}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? "fill-warning text-warning"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline cursor-pointer"
            >
              {product.rating} ({product.reviews} {language === 'ar' ? 'مراجعة' : 'reviews'})
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold text-primary">
                {product.price.toLocaleString()} SYP
              </span>
              {product.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.oldPrice.toLocaleString()} SYP
                </span>
              )}
            </div>
            <Badge variant={product.inStock ? "default" : "secondary"}>
              {product.inStock ? t("inStock") : t("outOfStock")}
            </Badge>
          </div>

          <p className="text-muted-foreground mb-6">{description}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                {language === 'ar' ? 'اللون' : 'Color'}
                {selectedColor && (
                  <span className="text-muted-foreground font-normal mr-2">: {selectedColor}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, idx) => {
                  const colorObj = color as any;
                  const colorHex = colorObj.hex;
                  const colorName = language === 'ar' ? colorObj.nameAr : colorObj.name;
                  const isSelected = selectedColor === colorName;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedColor(colorName);
                        // do not clear selectedSize so user can change sizes independently
                      }}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary ring-offset-2' 
                          : 'border-border hover:border-primary'
                      }`}
                      style={{ 
                        backgroundColor: colorHex,
                        border: colorHex === '#FFFFFF' ? '2px solid #e5e7eb' : undefined
                      }}
                      title={colorName}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${
                            colorHex === '#FFFFFF' || colorHex === '#ffffff' ? 'bg-black' : 'bg-white'
                          }`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                {language === 'ar' ? 'المقاس' : 'Size'}
                {selectedSize && (
                  <span className="text-muted-foreground font-normal mr-2">: {selectedSize}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, idx) => {
                  const sizeObj = size as any;
                  const sizeName = language === 'ar' ? sizeObj.nameAr : sizeObj.name;
                  const isSelected = selectedSize === sizeName;
                  // Make size selection independent of selected color: available if any variant has this size
                  const isAvailable = product.variants?.some(
                    (v) => v.size === sizeName && v.stock && v.stock > 0
                  ) ?? true;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => isAvailable && setSelectedSize(sizeName)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all min-w-[60px] ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isAvailable
                          ? 'border-border hover:border-primary hover:bg-primary/5'
                          : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      }`}
                    >
                      {sizeName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Info for Selected Variant */}
          {product.variants && selectedColor && selectedSize && (
            <div className="mb-4">
              {isVariantInStock ? (
                <p className="text-sm text-success">
                  ✓ {language === 'ar' ? 'متوفر في المخزون' : 'In Stock'} 
                  {availableStock && availableStock <= 5 && (
                    <span className="text-warning mr-2">
                      ({language === 'ar' ? `فقط ${availableStock} متبقية` : `Only ${availableStock} left`})
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-destructive">
                  ✗ {language === 'ar' ? 'غير متوفر بهذا المقاس واللون' : 'Not available in this size and color'}
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!product.inStock || (product.variants && !isVariantInStock)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const maxQty = availableStock || 999;
                  setQuantity(Math.min(maxQty, quantity + 1));
                }}
                disabled={!product.inStock || (product.variants && !isVariantInStock)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1 gradient-primary"
              onClick={handleAddToCart}
              disabled={!product.inStock || (product.variants && !isVariantInStock)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {t("addToCart")}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews-section" className="mb-16 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProductReviews 
              reviews={reviews}
              averageRating={product.rating}
              totalReviews={product.reviews}
            />
          </div>
          <div>
              <ReviewForm 
                productId={product.id}
                productName={name}
                onSubmitted={fetchReviews}
              />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
