import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Register = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    setLoading(true);
    await register(fName, lName, email, password, phone);
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center">{t("register")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fName">{t("firstName") || "First Name"}</Label>
                <Input
                  id="fName"
                  type="text"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lName">{t("lastName") || "Last Name"}</Label>
                <Input
                  id="lName"
                  type="text"
                  value={lName}
                  onChange={(e) => setLName(e.target.value)}
                  required
                />
              </div>
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
                <Label htmlFor="phone">{t("phoneNumber")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              <div>
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary"
                size="lg"
                disabled={loading}
              >
                {loading ? "..." : t("signUp")}
              </Button>
            </form>
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>أو</span>
                <Link 
                  to="/register-otp" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  التسجيل برمز OTP
                </Link>
              </div>
            </div>

            <p className="text-center mt-6 text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link to="/login" className="text-primary hover:underline">
                {t("signIn")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
