import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { offers } from "@/data/offers";
import { products } from "@/data/products";

const OfferDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();

  const offer = offers.find((o) => o.id === id);
  const offerProducts = offer
    ? products.filter((p) => offer.productIds.includes(p.id))
    : [];

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Offer not found</h1>
        <Link to="/offers">
          <Button className="mt-4">Back to Offers</Button>
        </Link>
      </div>
    );
  }

  const title = language === "ar" ? offer.titleAr : offer.title;
  const description = language === "ar" ? offer.descriptionAr : offer.description;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative h-96">
        <img
          src={offer.image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
          <Badge className="text-2xl px-6 py-3 bg-destructive mb-4">
            {offer.discount}% OFF
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-white/90 text-lg mb-2">{description}</p>
          <p className="text-white/80">
            Offer ends: {new Date(offer.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Products in this offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;
