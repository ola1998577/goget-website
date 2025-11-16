export interface Market {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image: string;
  city: string;
  cityAr: string;
}

export const markets: Market[] = [
  {
    id: "1",
    name: "Damascus Market",
    nameAr: "سوق دمشق",
    description: "Largest market in Damascus with hundreds of stores",
    descriptionAr: "أكبر سوق في دمشق يضم مئات المتاجر",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    city: "Damascus",
    cityAr: "دمشق",
  },
  {
    id: "2",
    name: "Aleppo Souk",
    nameAr: "سوق حلب",
    description: "Traditional market with authentic products",
    descriptionAr: "سوق تقليدي يضم منتجات أصيلة",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&q=80",
    city: "Aleppo",
    cityAr: "حلب",
  },
  {
    id: "3",
    name: "Homs Central Market",
    nameAr: "السوق المركزي حمص",
    description: "Modern shopping experience in Homs",
    descriptionAr: "تجربة تسوق عصرية في حمص",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=80",
    city: "Homs",
    cityAr: "حمص",
  },
  {
    id: "4",
    name: "Lattakia Port Market",
    nameAr: "سوق ميناء اللاذقية",
    description: "Coastal market with unique imports",
    descriptionAr: "سوق ساحلي يضم واردات فريدة",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80",
    city: "Lattakia",
    cityAr: "اللاذقية",
  },
];
