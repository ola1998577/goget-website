export interface Offer {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  discount: number;
  image: string;
  productIds: string[];
  endDate: string;
}

export const offers: Offer[] = [
  {
    id: "1",
    title: "Summer Sale - Up to 50% Off",
    titleAr: "تخفيضات الصيف - حتى 50٪",
    description: "Huge discounts on selected electronics",
    descriptionAr: "تخفيضات كبيرة على إلكترونيات مختارة",
    discount: 50,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    productIds: ["1", "2"],
    endDate: "2024-12-31",
  },
  {
    id: "2",
    title: "Fashion Week Special",
    titleAr: "عرض أسبوع الموضة",
    description: "Exclusive fashion deals this week only",
    descriptionAr: "عروض أزياء حصرية هذا الأسبوع فقط",
    discount: 30,
    image: "https://images.unsplash.com/photo-1558769132-cb1aea2f6370?w=800&q=80",
    productIds: ["3", "4"],
    endDate: "2024-12-25",
  },
  {
    id: "3",
    title: "Home Makeover Sale",
    titleAr: "تخفيضات تجديد المنزل",
    description: "Transform your home with amazing deals",
    descriptionAr: "حول منزلك مع عروض مذهلة",
    discount: 40,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
    productIds: ["5"],
    endDate: "2024-12-20",
  },
];
