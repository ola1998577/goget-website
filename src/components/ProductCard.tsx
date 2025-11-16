import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const name = language === "ar" ? product.nameAr : product.name;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      marketId: product.marketId,
      storeId: product.storeId,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 h-full border-2 hover:border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-bl-full transform group-hover:scale-150 transition-transform duration-500"></div>
        
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-gradient-accent text-accent-foreground shadow-lg px-3 py-1 text-sm font-bold animate-pulse">
              <Sparkles className="h-3 w-3 inline ml-1" />
              -{discount}%
            </Badge>
          )}
          
          {!product.inStock && (
            <Badge className="absolute top-3 right-3 bg-destructive/90 backdrop-blur-sm">
              {t("outOfStock")}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={`absolute bottom-3 right-3 bg-card/95 backdrop-blur-md hover:bg-card shadow-lg rounded-full transition-all hover:scale-110 ${
              isWishlisted ? "text-destructive" : ""
            }`}
            onClick={handleWishlist}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>
        </div>

        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {name}
          </h3>
          
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating) 
                      ? "fill-warning text-warning" 
                      : "fill-muted text-muted"
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-gradient">
              {product.price.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-muted-foreground">SYP</span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through ml-auto">
                {product.oldPrice.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full gradient-primary hover:shadow-lg hover:shadow-primary/50 transition-all hover:-translate-y-0.5 font-semibold"
            size="lg"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t("addToCart")}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
