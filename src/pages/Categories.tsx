import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryAPI } from "@/lib/api";
import { Category } from "@/types";
import * as Icons from "lucide-react";

const Categories = () => {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await categoryAPI.getCategories(language);
        if (response.success) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error("[v0] Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [language]);

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("categories")}</h1>
        <p className="text-muted-foreground text-lg">
          Browse products by category
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = (Icons as any)[category.icon] || Icons.Package;
            const name = language === "ar" ? category.nameAr : category.name;
            const description = language === "ar" ? category.descriptionAr : category.description;

            return (
              <Link key={category.id} to={`/category/${category.id}`}>
                <Card className="group hover:shadow-lg hover:border-primary transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;
