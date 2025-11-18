import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Market } from "@/data/markets";

interface MarketCardProps {
  market: Market;
}

export const MarketCard = ({ market }: MarketCardProps) => {
  const { language } = useLanguage();

  const name = language === "ar" ? market.nameAr : market.name;
  const description = language === "ar" ? market.descriptionAr : market.description;
  const city = language === "ar" ? market.cityAr : market.city;

  return (
    <Link to={`/market/${market.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative overflow-hidden h-48">
          <img
            src={market.image || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-bold text-xl mb-1">{name}</h3>
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{city}</span>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};
