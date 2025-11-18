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

export const HeroCarousel = ({ banners }: { banners?: Array<{ id: string; image: string }> }) => {
  const { language } = useLanguage();

  // If banners provided from backend, use them; otherwise fallback to static hero images
  const slides = (banners && banners.length > 0)
    ? banners.map(b => ({ id: b.id, image: b.image, link: '/markets' }))
    : [
      { id: 1, image: hero1, link: '/markets' },
      { id: 2, image: hero2, link: '/products' },
      { id: 3, image: hero3, link: '/categories' },
    ];

  return (
    <section className="container mx-auto px-4 mb-12">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="relative rounded-lg overflow-hidden h-[400px] md:h-[500px]">
                    <div className="absolute inset-0">
                      <img
                        src={slide.image}
                        alt={language === 'ar' ? 'Hero' : 'Hero'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                    </div>
                    <div className="relative z-10 h-full flex items-center py-16 px-8 md:px-16">
                      <div className="max-w-2xl text-white">
                        {/* When banners are driven by admin, they may not carry titles/translations.
                            Keep the overlay minimal: CTA button to markets/products/categories. */}
                        <Link to={slide.link}>
                          <Button size="lg" className="shadow-xl bg-primary hover:bg-primary-dark">
                            {language === 'ar' ? 'استكشف' : 'Explore'}
                            <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
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
