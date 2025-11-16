import { useState } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WheelOfFortune } from "@/components/WheelOfFortune";
import { useLanguage } from "@/contexts/LanguageContext";

export const WheelOfFortuneButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-8 right-8 z-50 h-20 w-20 rounded-full shadow-2xl gradient-accent hover:scale-110 transition-all animate-pulse hover:animate-none border-4 border-white/20"
        aria-label={language === "ar" ? "عجلة الحظ" : "Wheel of Fortune"}
      >
        <Gift className="h-10 w-10" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{language === "ar" ? "عجلة الحظ" : "Wheel of Fortune"}</DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "قم بتدوير العجلة للحصول على جوائز مميزة" 
                : "Spin the wheel to win amazing prizes"}
            </DialogDescription>
          </DialogHeader>
          <WheelOfFortune />
        </DialogContent>
      </Dialog>
    </>
  );
};
