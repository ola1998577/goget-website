import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { orderAPI } from "@/lib/api";
import { Order } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const Orders = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await orderAPI.getOrders({ lang: language });
        if (response.success) {
          setOrders(response.data || []);
        }
      } catch (error) {
        console.error("[v0] Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, language]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view your orders</h1>
        <Button onClick={() => navigate("/login")} className="gradient-primary">
          {t("login")}
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success";
      case "shipped":
        return "bg-primary";
      case "processing":
        return "bg-warning";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { en: string; ar: string }> = {
      pending: { en: "Pending", ar: "قيد الانتظار" },
      processing: { en: "Processing", ar: "قيد المعالجة" },
      shipped: { en: "Shipped", ar: "تم الشحن" },
      delivered: { en: "Delivered", ar: "تم التوصيل" },
      cancelled: { en: "Cancelled", ar: "ملغي" },
    };
    return language === "ar" ? statusMap[status]?.ar : statusMap[status]?.en;
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">{t("orders")}</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {language === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === "ar" 
              ? "ابدأ التسوق لترى طلباتك هنا" 
              : "Start shopping to see your orders here"}
          </p>
          <Button onClick={() => navigate("/products")} className="gradient-primary">
            {language === "ar" ? "تصفح المنتجات" : "Browse Products"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                    <p className="font-bold text-lg text-primary">
                      {order.totalPrice.toLocaleString()} SYP
                    </p>
                    <Button variant="outline">
                      {language === "ar" ? "عرض التفاصيل" : "View Details"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
