import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { orderAPI, promoAPI } from "@/lib/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { t, language } = useLanguage();
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    
    try {
      setIsValidatingPromo(true);
      const response = await promoAPI.validatePromoCode(promoCode);
      if (response.success && response.data) {
        const discountAmount = response.data.discountType === 'percentage'
          ? (totalPrice * response.data.discount) / 100
          : response.data.discount;
        setDiscount(discountAmount);
        toast({ title: "Promo code applied!", description: `You saved ${discountAmount.toLocaleString()} SYP` });
      } else {
        toast({ title: "Invalid promo code", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Invalid promo code", variant: "destructive" });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({ title: "Please login", description: "You need to login to place an order" });
      navigate("/login");
      return;
    }

    if (items.length === 0) return;

    try {
      setIsSubmitting(true);
      // Prepare order data from cart
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        totalPrice: totalPrice - discount,
        promoCode: promoCode || undefined,
        discount: discount || undefined,
        notes: notes || undefined,
      };

      const response = await orderAPI.createOrder(orderData);
      
      if (response.success) {
        clearCart();
        toast({ 
          title: "Order placed successfully!", 
          description: `Order ID: ${response.data.id}` 
        });
        navigate("/orders");
      } else {
        throw new Error(response.message || "Failed to place order");
      }
    } catch (error: any) {
      console.error("[v0] Checkout error:", error);
      toast({ 
        title: "Checkout failed", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold mb-4">{t("emptyCart")}</h1>
        <p className="text-muted-foreground mb-8">Start adding products to your cart</p>
        <Link to="/products">
          <Button size="lg" className="gradient-primary">
            {t("continueShopping")}
          </Button>
        </Link>
      </div>
    );
  }

  const finalTotal = totalPrice - discount;

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">{t("myCart")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.id}-${item.color}-${item.size}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{item.name}</h3>
                    {(item.color || item.size) && (
                      <div className="text-sm text-muted-foreground mb-2 space-y-1">
                        {item.color && (
                          <p>{language === 'ar' ? 'اللون' : 'Color'}: {item.color}</p>
                        )}
                        {item.size && (
                          <p>{language === 'ar' ? 'المقاس' : 'Size'}: {item.size}</p>
                        )}
                      </div>
                    )}
                    <p className="text-primary font-bold">
                      {item.price.toLocaleString()} SYP
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id, item.color, item.size)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-4">
              <Label htmlFor="notes">
                {language === "ar" ? "ملاحظات الطلب" : "Order Notes"}
              </Label>
              <Textarea
                id="notes"
                placeholder={language === "ar" ? "أضف أي ملاحظات هنا..." : "Add any notes here..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="mb-6">
                <Label htmlFor="promo">
                  {language === "ar" ? "كود الخصم" : "Promo Code"}
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="promo"
                    placeholder={language === "ar" ? "أدخل الكود" : "Enter code"}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromo}
                    disabled={isValidatingPromo || !promoCode}
                  >
                    {isValidatingPromo ? "..." : language === "ar" ? "تطبيق" : "Apply"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items ({totalItems})</span>
                  <span>{totalPrice.toLocaleString()} SYP</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{discount.toLocaleString()} SYP</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>{t("total")}</span>
                  <span className="text-primary">{finalTotal.toLocaleString()} SYP</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full gradient-primary"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : t("checkout")}
              </Button>
              <Link to="/products">
                <Button variant="outline" size="lg" className="w-full mt-3">
                  {t("continueShopping")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
