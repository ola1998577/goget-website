import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/OTPInput";
import { Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const LoginOTP = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, password, from2FA } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Redirect if not coming from 2FA login
  useEffect(() => {
    if (!from2FA || !email || !password) {
      toast({
        title: "خطأ",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    // Simulate sending OTP
    toast({
      title: "تم إرسال الرمز",
      description: `تم إرسال رمز التحقق إلى البريد الإلكتروني المسجل`,
    });

    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [from2FA, email, password, navigate]);

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);

    // Simulate OTP verification
    setTimeout(async () => {
      await login(email, password);
      toast({
        title: "تم التحقق بنجاح",
        description: "مرحباً بك في GoGet - تم تسجيل الدخول بأمان",
      });
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "تم إعادة الإرسال",
        description: "تم إرسال رمز تحقق جديد",
      });
      setCountdown(60);
      setLoading(false);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl border-primary/20">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-center">
              التحقق بخطوتين
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              لحماية حسابك، أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <p className="text-sm text-center">
                  <span className="font-semibold">البريد الإلكتروني:</span>
                  <br />
                  {email && email.replace(/(.{3})(.*)(@.*)/, "$1***$3")}
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-center block">أدخل رمز التحقق</Label>
                <OTPInput 
                  length={6} 
                  onComplete={handleVerifyOTP}
                  loading={loading}
                />
                <p className="text-xs text-muted-foreground text-center">
                  رمز مكون من 6 أرقام
                </p>
              </div>

              {loading && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-primary">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    جاري التحقق من الرمز...
                  </div>
                </div>
              )}

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {countdown > 0 
                    ? `إعادة الإرسال بعد ${countdown} ثانية` 
                    : "إعادة إرسال الرمز"}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-muted-foreground hover:text-primary block mx-auto"
                  disabled={loading}
                >
                  العودة لتسجيل الدخول
                </button>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-center text-muted-foreground">
                  💡 نصيحة أمنية: لا تشارك رمز التحقق مع أي شخص. 
                  فريق GoGet لن يطلب منك هذا الرمز أبداً.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginOTP;
