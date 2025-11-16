import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ShoppingCart } from "lucide-react";

const Wishlist = () => {
  const { t } = useLanguage();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8">Save products you love for later</p>
        <Link to="/products">
          <Button size="lg" className="gradient-primary">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">{t("wishlist")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <Link to={`/product/${item.id}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              </Link>
              <h3 className="font-semibold mb-2">{item.name}</h3>
              <p className="text-primary font-bold mb-4">
                {item.price.toLocaleString()} SYP
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gradient-primary"
                  onClick={() => {
                    addToCart({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      marketId: item.marketId,
                      storeId: item.storeId,
                    });
                    removeFromWishlist(item.id);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
