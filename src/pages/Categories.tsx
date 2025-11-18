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
        console.log("Categories response:", response);
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
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.id}`}>
                <div className="p-4 border rounded-lg hover:border-primary hover:shadow-lg transition-all duration-300 text-center">
                  {cat.image && <img src={cat.image} alt={cat.title} className="mx-auto h-24 mb-3 object-contain" />}
                  <h3 className="font-semibold">{language === 'ar' ? cat.title : cat.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
};

export default Categories;
