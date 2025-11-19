import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { wheelAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from 'lucide-react';

const defaultRewards = [
  { id: 1, label: "10% Off", labelAr: "خصم 10%", color: "#ef4444" },
  { id: 2, label: "Free Shipping", labelAr: "شحن مجاني", color: "#f97316" },
  { id: 3, label: "50 Points", labelAr: "50 نقطة", color: "#eab308" },
  { id: 4, label: "5% Off", labelAr: "خصم 5%", color: "#22c55e" },
  { id: 5, label: "100 Points", labelAr: "100 نقطة", color: "#06b6d4" },
  { id: 6, label: "15% Off", labelAr: "خصم 15%", color: "#3b82f6" },
  { id: 7, label: "Try Again", labelAr: "حاول مجدداً", color: "#8b5cf6" },
  { id: 8, label: "20% Off", labelAr: "خصم 20%", color: "#ec4899" },
];

export const WheelOfFortune = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [rewards, setRewards] = useState(defaultRewards);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const res = await wheelAPI.getPrizes(language);
        const prizes = res?.prizes || res?.data || [];
        if (prizes.length > 0) {
          const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
          const formattedRewards = prizes.slice(0, 8).map((prize, idx) => ({
            id: idx + 1,
            label: prize.title || prize.name || `Prize ${idx + 1}`,
            labelAr: prize.titleAr || prize.nameAr || `جائزة ${idx + 1}`,
            color: colors[idx % colors.length],
          }));
          setRewards(formattedRewards);
        }
      } catch (err) {
        console.error("[v0] Error fetching prizes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrizes();
  }, [language]);

  const spinWheel = async () => {
    if (isSpinning || !isAuthenticated) {
      if (!isAuthenticated) {
        toast({
          title: language === "ar" ? "تسجيل الدخول مطلوب" : "Login Required",
          description: language === "ar" ? "يجب تسجيل الدخول للعب" : "You must login to play",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const baseRotation = 360 * 5;
    const segmentAngle = 360 / rewards.length;
    const finalRotation = baseRotation + randomIndex * segmentAngle;

    setRotation(finalRotation);

    try {
      const res = await wheelAPI.spinWheel();
      
      setTimeout(() => {
        const reward = rewards[randomIndex];
        const label = language === "ar" ? reward.labelAr : reward.label;
        
        toast({
          title: language === "ar" ? "تهانينا!" : "Congratulations!",
          description: `${language === "ar" ? "لقد فزت ب" : "You Won"}: ${label}!`,
        });
        
        setIsSpinning(false);
      }, 4000);
    } catch (err: any) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: err.message || (language === "ar" ? "فشل الدوران" : "Failed to spin"),
        variant: "destructive",
      });
      setIsSpinning(false);
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="gradient-primary text-primary-foreground">
          <CardTitle className="text-center text-2xl">{t("spinToWin")}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gradient-primary text-primary-foreground">
        <CardTitle className="text-center text-2xl">{t("spinToWin")}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div
            className="w-full h-full rounded-full border-8 border-primary relative transition-transform duration-4000 ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${rewards
                .map(
                  (reward, i) =>
                    `${reward.color} ${(i * 360) / rewards.length}deg ${
                      ((i + 1) * 360) / rewards.length
                    }deg`
                )
                .join(", ")})`,
            }}
          >
            {rewards.map((reward, i) => {
              const angle = (i * 360) / rewards.length + 360 / rewards.length / 2;
              return (
                <div
                  key={reward.id}
                  className="absolute top-1/2 left-1/2 origin-left"
                  style={{
                    transform: `rotate(${angle}deg) translateX(60px)`,
                  }}
                >
                  <span className="text-white font-bold text-[10px] whitespace-nowrap">
                    {language === "ar" ? reward.labelAr : reward.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-primary z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card border-4 border-primary flex items-center justify-center text-xl font-bold z-10">
            🎁
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{t("tryYourLuck")}</p>
        <Button
          onClick={spinWheel}
          disabled={isSpinning || !isAuthenticated}
          size="lg"
          className="gradient-primary"
        >
          {isSpinning ? "..." : t("spin")}
        </Button>
      </CardContent>
    </Card>
  );
};
