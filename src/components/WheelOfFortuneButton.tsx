import { useState } from "react";
import { Gift } from 'lucide-react';
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
        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-full shadow-lg bg-gradient-to-br from-amber-400 via-orange-400 to-red-500 hover:from-amber-500 hover:via-orange-500 hover:to-red-600 text-white hover:scale-110 transition-all hover:shadow-xl border-2 border-white/30 backdrop-blur-sm"
        aria-label={language === "ar" ? "عجلة الحظ" : "Wheel of Fortune"}
      >
        <Gift className="h-8 w-8" />
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
