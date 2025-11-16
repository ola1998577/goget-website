import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  marketId: string;
  storeId: string;
  color?: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string, color?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      // Check if same product with same color and size exists
      const existing = prev.find((i) => 
        i.id === item.id && 
        i.color === item.color && 
        i.size === item.size
      );
      if (existing) {
        toast({ title: "Updated cart", description: `Quantity updated for ${item.name}` });
        return prev.map((i) =>
          i.id === item.id && i.color === item.color && i.size === item.size
            ? { ...i, quantity: i.quantity + quantity } 
            : i
        );
      }
      toast({ title: "Added to cart", description: `${item.name} added to cart` });
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string, color?: string, size?: string) => {
    setItems((prev) => prev.filter((i) => 
      !(i.id === id && i.color === color && i.size === size)
    ));
    toast({ title: "Removed", description: "Item removed from cart" });
  };

  const updateQuantity = (id: string, quantity: number, color?: string, size?: string) => {
    if (quantity < 1) {
      removeFromCart(id, color, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) => 
        i.id === id && i.color === color && i.size === size 
          ? { ...i, quantity } 
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({ title: "Cart cleared", description: "All items removed from cart" });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
