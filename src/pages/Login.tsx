import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (require2FA) {
      // Navigate to OTP verification for 2FA
      navigate("/login-otp", { state: { email, password, from2FA: true } });
    } else {
      await login(email, password);
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">{t("login")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="2fa" 
                  checked={require2FA}
                  onCheckedChange={(checked) => setRequire2FA(checked as boolean)}
                />
                <Label 
                  htmlFor="2fa" 
                  className="text-sm font-normal cursor-pointer"
                >
                  تفعيل التحقق بخطوتين (OTP) للحماية الإضافية
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary"
                size="lg"
                disabled={loading}
              >
                {loading ? "..." : t("signIn")}
              </Button>
            </form>

            <p className="text-center mt-6 text-muted-foreground">
              {t("dontHaveAccount")}{" "}
              <Link to="/register" className="text-primary hover:underline">
                {t("signUp")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
