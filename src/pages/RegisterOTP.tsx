import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OTPInput } from "@/components/OTPInput";
import { ArrowRight, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const RegisterOTP = () => {
  const { t } = useLanguage();
  const { register, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "otp">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // If navigated here from Register page, prefill info and go to OTP step
  useEffect(() => {
    const state: any = (location && (location as any).state) || {};
    if (state && (state.phone || state.email)) {
      if (state.name) setName(state.name);
      if (state.email) setEmail(state.email);
      if (state.phone) setPhone(state.phone);
      // jump to otp step and start a countdown
      setStep('otp');
      setCountdown(60);
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
    }
  }, [location]);

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call backend registration to create user and send OTP
      await register(name, '', email, 'otp-temp-password', phone);
      toast({ title: 'تم إرسال الرمز', description: `تم إرسال رمز التحقق إلى ${phone}` });
      setStep('otp');
      setCountdown(60);
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
    } catch (err) {
      // register() already shows toast
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    try {
      // Call verify OTP endpoint
      const res = await (await import('@/lib/api')).default.auth.verifyOTP({ phone, otp });
      // For registration flow we do NOT auto-login. Show success and redirect to login.
      if (res && res.success) {
        toast({ title: 'تم التحقق بنجاح', description: 'تم تفعيل حسابك، يمكنك الآن تسجيل الدخول' });
        navigate('/login');
      } else if (res && res.token) {
        // fallback: if server returned token, use it (covers login-OTP flow)
        localStorage.setItem('authToken', res.token);
        await refreshUser();
        toast({ title: 'تم التحقق بنجاح', description: 'مرحباً بك في GoGet' });
        navigate('/');
      } else {
        toast({ title: 'خطأ', description: res.message || 'Verification failed', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'فشل التحقق', description: err.message || 'Invalid OTP', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "تم إعادة الإرسال",
        description: `تم إرسال رمز جديد إلى ${phone}`,
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
        <Card className="shadow-xl">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-center">
              {step === "info" ? "إنشاء حساب جديد" : "التحقق من الرمز"}
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              {step === "info" 
                ? "املأ البيانات التالية للتسجيل" 
                : `تم إرسال رمز التحقق إلى ${phone}`}
            </p>
          </CardHeader>
          <CardContent>
            {step === "info" ? (
              <form onSubmit={handleSubmitInfo} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("fullName")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t("phoneNumber")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+963 xxx xxx xxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    dir="ltr"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    سنرسل لك رمز تحقق عبر الرسائل القصيرة
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "جاري الإرسال..." : "متابعة"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-center block">أدخل رمز التحقق</Label>
                  <OTPInput 
                    length={4} 
                    onComplete={handleVerifyOTP}
                    loading={loading}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    رمز مكون من 4 أرقام
                  </p>
                </div>

                {loading && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-primary">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      جاري التحقق...
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
                  
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('info');
                        setCountdown(0);
                      }}
                      className="text-sm text-muted-foreground hover:text-primary"
                      disabled={loading}
                    >
                      تعديل البيانات
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        // Cancel registration: call backend to remove unverified user if exists
                        try {
                          setLoading(true);
                          const api = (await import('@/lib/api')).default;
                          await api.auth.cancelRegistration({ phone });
                          toast({ title: 'تم الإلغاء', description: 'تم إلغاء عملية التسجيل' });
                          navigate('/login');
                        } catch (err: any) {
                          toast({ title: 'فشل الإلغاء', description: err.message || 'Could not cancel registration', variant: 'destructive' });
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-sm text-destructive hover:underline"
                      disabled={loading}
                    >
                      إلغاء التسجيل
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>تفضل الطريقة التقليدية؟</span>
                <Link 
                  to="/register" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  التسجيل بالبريد الإلكتروني
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <p className="text-center mt-6 text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link to="/login-otp" className="text-primary hover:underline">
                {t("signIn")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterOTP;
