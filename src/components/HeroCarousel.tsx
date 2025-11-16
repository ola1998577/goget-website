import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

export const HeroCarousel = () => {
  const { language } = useLanguage();

  const heroSlides = [
    {
      id: 1,
      image: hero1,
      titleEn: "Discover Syrian Markets",
      titleAr: "اكتشف الأسواق السورية",
      descriptionEn: "Shop from the best local markets and stores across Syria",
      descriptionAr: "تسوق من أفضل الأسواق والمتاجر المحلية في سوريا",
      link: "/markets",
      buttonEn: "Explore Markets",
      buttonAr: "استكشف الأسواق",
    },
    {
      id: 2,
      image: hero2,
      titleEn: "Shop Your Way",
      titleAr: "تسوق بطريقتك",
      descriptionEn: "Fresh products, latest tech, and everything you need in one place",
      descriptionAr: "منتجات طازجة، أحدث التقنيات، وكل ما تحتاجه في مكان واحد",
      link: "/products",
      buttonEn: "Browse Products",
      buttonAr: "تصفح المنتجات",
    },
    {
      id: 3,
      image: hero3,
      titleEn: "Quality & Variety",
      titleAr: "جودة وتنوع",
      descriptionEn: "From fashion to groceries, find everything you love",
      descriptionAr: "من الأزياء إلى البقالة، اعثر على كل ما تحب",
      link: "/categories",
      buttonEn: "Shop by Category",
      buttonAr: "تسوق حسب الفئة",
    },
  ];

  return (
    <section className="container mx-auto px-4 mb-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {heroSlides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="relative rounded-lg overflow-hidden h-[400px] md:h-[500px]">
                    <div className="absolute inset-0">
                      <img
                        src={slide.image}
                        alt={language === "ar" ? slide.titleAr : slide.titleEn}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                    </div>
                    <div className="relative z-10 h-full flex items-center py-16 px-8 md:px-16">
                      <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                          {language === "ar" ? slide.titleAr : slide.titleEn}
                        </h2>
                        <p className="text-lg md:text-xl text-white/90 mb-8">
                          {language === "ar" ? slide.descriptionAr : slide.descriptionEn}
                        </p>
                        <Link to={slide.link}>
                          <Button size="lg" className="shadow-xl bg-primary hover:bg-primary-dark">
                            {language === "ar" ? slide.buttonAr : slide.buttonEn}
                            <ArrowRight className={`h-5 w-5 ${language === "ar" ? "mr-2" : "ml-2"}`} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};
