export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionAr: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    nameAr: "إلكترونيات",
    icon: "Laptop",
    description: "Latest tech gadgets and electronics",
    descriptionAr: "أحدث الأجهزة التقنية والإلكترونيات",
  },
  {
    id: "2",
    name: "Fashion",
    nameAr: "أزياء",
    icon: "Shirt",
    description: "Clothing and accessories",
    descriptionAr: "ملابس وإكسسوارات",
  },
  {
    id: "3",
    name: "Home & Kitchen",
    nameAr: "منزل ومطبخ",
    icon: "Home",
    description: "Everything for your home",
    descriptionAr: "كل ما تحتاجه لمنزلك",
  },
  {
    id: "4",
    name: "Beauty & Health",
    nameAr: "جمال وصحة",
    icon: "Sparkles",
    description: "Beauty and health products",
    descriptionAr: "منتجات الجمال والصحة",
  },
  {
    id: "5",
    name: "Sports",
    nameAr: "رياضة",
    icon: "Dumbbell",
    description: "Sports equipment and gear",
    descriptionAr: "معدات وأدوات رياضية",
  },
  {
    id: "6",
    name: "Books",
    nameAr: "كتب",
    icon: "Book",
    description: "Books and educational materials",
    descriptionAr: "كتب ومواد تعليمية",
  },
];
