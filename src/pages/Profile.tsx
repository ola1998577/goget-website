import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Award, LogOut, Package, Heart, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view your profile</h1>
        <Button onClick={() => navigate("/login")} className="gradient-primary">
          {t("login")}
        </Button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{t("profile")}</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t("logout")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t("myPoints")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 mb-6">
                <Award className="h-12 w-12 mx-auto text-primary mb-3" />
                <p className="text-3xl font-bold text-primary mb-1">
                  {user.points}
                </p>
                <p className="text-muted-foreground text-sm">{t("points")}</p>
              </div>
              
              {/* Redemption Packages */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm mb-3">باقات استبدال النقاط</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">🎁</span>
                      </div>
                      <p className="font-bold text-lg text-primary mb-1">100 نقطة</p>
                      <p className="text-xs text-muted-foreground mb-2">خصم 10% على طلبك القادم</p>
                      <Button size="sm" variant="outline" className="w-full">استبدال</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">🚚</span>
                      </div>
                      <p className="font-bold text-lg text-primary mb-1">200 نقطة</p>
                      <p className="text-xs text-muted-foreground mb-2">شحن مجاني لطلبك القادم</p>
                      <Button size="sm" variant="outline" className="w-full">استبدال</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl">⭐</span>
                      </div>
                      <p className="font-bold text-lg text-primary mb-1">500 نقطة</p>
                      <p className="text-xs text-muted-foreground mb-2">خصم 25% + شحن مجاني</p>
                      <Button size="sm" variant="outline" className="w-full">استبدال</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col"
                  onClick={() => navigate("/orders")}
                >
                  <Package className="h-8 w-8 mb-2" />
                  {t("orders")}
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col"
                  onClick={() => navigate("/wishlist")}
                >
                  <Heart className="h-8 w-8 mb-2" />
                  {t("wishlist")}
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col"
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingCart className="h-8 w-8 mb-2" />
                  {t("cart")}
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Award className="h-8 w-8 mb-2" />
                  {t("pointsHistory")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
