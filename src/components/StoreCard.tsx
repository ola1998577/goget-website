import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Store } from "@/data/stores";

interface StoreCardProps {
  store: Store;
}

export const StoreCard = ({ store }: StoreCardProps) => {
  const { language } = useLanguage();

  const name = language === "ar" ? store.nameAr : store.name;
  const description = language === "ar" ? store.descriptionAr : store.description;

  return (
    <Link to={`/store/${store.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <img
              src={store.logo}
              alt={name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{store.rating}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
