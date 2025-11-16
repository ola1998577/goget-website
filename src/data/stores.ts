export interface Store {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  logo: string;
  marketId: string;
  categoryIds: string[];
  rating: number;
}

export const stores: Store[] = [
  {
    id: "1",
    name: "Tech Hub Syria",
    nameAr: "تك هب سوريا",
    description: "Your destination for latest electronics",
    descriptionAr: "وجهتك لأحدث الإلكترونيات",
    logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&q=80",
    marketId: "1",
    categoryIds: ["1"],
    rating: 4.8,
  },
  {
    id: "2",
    name: "Fashion Forward",
    nameAr: "فاشن فورورد",
    description: "Trendy fashion for everyone",
    descriptionAr: "أزياء عصرية للجميع",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80",
    marketId: "1",
    categoryIds: ["2"],
    rating: 4.5,
  },
  {
    id: "3",
    name: "Home Essentials",
    nameAr: "أساسيات المنزل",
    description: "Quality home products",
    descriptionAr: "منتجات منزلية عالية الجودة",
    logo: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80",
    marketId: "2",
    categoryIds: ["3"],
    rating: 4.7,
  },
  {
    id: "4",
    name: "Beauty Oasis",
    nameAr: "واحة الجمال",
    description: "Premium beauty products",
    descriptionAr: "منتجات تجميل فاخرة",
    logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&q=80",
    marketId: "2",
    categoryIds: ["4"],
    rating: 4.9,
  },
  {
    id: "5",
    name: "Sports Arena",
    nameAr: "ساحة الرياضة",
    description: "Professional sports equipment",
    descriptionAr: "معدات رياضية احترافية",
    logo: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&q=80",
    marketId: "3",
    categoryIds: ["5"],
    rating: 4.6,
  },
  {
    id: "6",
    name: "Book Lovers",
    nameAr: "عشاق الكتب",
    description: "Extensive book collection",
    descriptionAr: "مجموعة واسعة من الكتب",
    logo: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&q=80",
    marketId: "3",
    categoryIds: ["6"],
    rating: 4.8,
  },
];
