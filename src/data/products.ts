export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  category: string;
  subcategory?: string;
  type: "helium" | "latex" | "foil";
  occasion: string[];
  size: "S" | "M" | "L";
  inStock: boolean;
  onOrder?: boolean;
  rating: number;
  reviewsCount: number;
  images: string[];
  isNew?: boolean;
  isHit?: boolean;
  colors?: string[];
  balloonCount?: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

export const categories: Category[] = [
  {
    id: "birthday",
    name: "День рождения",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop",
    href: "/catalog?category=birthday",
  },
  {
    id: "wedding",
    name: "Свадьба",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=400&fit=crop",
    href: "/catalog?category=wedding",
  },
  {
    id: "discharge",
    name: "На выписку",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop",
    href: "/catalog?category=discharge",
  },
  {
    id: "love",
    name: "Для влюбленных",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop",
    href: "/catalog?category=love",
  },
  {
    id: "corporate",
    name: "Корпоративные",
    image: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=400&h=400&fit=crop",
    href: "/catalog?category=corporate",
  },
  {
    id: "monochrome",
    name: "Монохромные",
    image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&h=400&fit=crop",
    href: "/catalog?category=monochrome",
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Розовое облако счастья",
    description: "Нежный набор из 15 гелиевых шаров в розовых оттенках. Идеально подойдет для выписки девочки или первого дня рождения.",
    price: 3500,
    oldPrice: 4200,
    discount: 17,
    category: "discharge",
    type: "helium",
    occasion: ["discharge", "birthday"],
    size: "L",
    inStock: true,
    rating: 4.9,
    reviewsCount: 45,
    images: [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=600&fit=crop",
    ],
    isNew: true,
    isHit: true,
    colors: ["#FFB6C1", "#FF69B4", "#FFC0CB"],
    balloonCount: 15,
  },
  {
    id: 2,
    name: "Голубой принц",
    description: "Элегантный набор для выписки мальчика. 12 гелиевых шаров в нежно-голубых тонах с серебряными акцентами.",
    price: 3200,
    category: "discharge",
    type: "helium",
    occasion: ["discharge"],
    size: "L",
    inStock: true,
    rating: 4.8,
    reviewsCount: 32,
    images: [
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=600&fit=crop",
    ],
    colors: ["#87CEEB", "#4169E1", "#C0C0C0"],
    balloonCount: 12,
  },
  {
    id: 3,
    name: "Радужное настроение",
    description: "Яркий и веселый набор из 20 разноцветных шаров. Создаст атмосферу настоящего праздника!",
    price: 2800,
    category: "birthday",
    subcategory: "4-7",
    type: "latex",
    occasion: ["birthday"],
    size: "M",
    inStock: true,
    rating: 4.7,
    reviewsCount: 67,
    images: [
      "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=600&h=600&fit=crop",
    ],
    isHit: true,
    balloonCount: 20,
  },
  {
    id: 4,
    name: "Белая свадьба",
    description: "Элегантный свадебный набор из 25 белых и серебряных шаров с красивыми лентами.",
    price: 5500,
    category: "wedding",
    type: "foil",
    occasion: ["wedding"],
    size: "L",
    inStock: true,
    rating: 5.0,
    reviewsCount: 28,
    images: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=600&fit=crop",
    ],
    isNew: true,
    colors: ["#FFFFFF", "#C0C0C0"],
    balloonCount: 25,
  },
  {
    id: 5,
    name: "Сердца любви",
    description: "Романтический набор из 10 шаров-сердец красного и розового цветов.",
    price: 2500,
    category: "love",
    type: "foil",
    occasion: ["love", "birthday"],
    size: "M",
    inStock: true,
    rating: 4.9,
    reviewsCount: 89,
    images: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop",
    ],
    isHit: true,
    colors: ["#FF0000", "#FF69B4"],
    balloonCount: 10,
  },
  {
    id: 6,
    name: "Золотой юбилей",
    description: "Роскошный набор для корпоративного праздника. 30 золотых и черных шаров.",
    price: 6500,
    oldPrice: 7500,
    discount: 13,
    category: "corporate",
    type: "foil",
    occasion: ["corporate"],
    size: "L",
    inStock: false,
    onOrder: true,
    rating: 4.6,
    reviewsCount: 15,
    images: [
      "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600&h=600&fit=crop",
    ],
    colors: ["#FFD700", "#000000"],
    balloonCount: 30,
  },
  {
    id: 7,
    name: "Первый годик",
    description: "Специальный набор для первого дня рождения с цифрой 1 и 15 яркими шарами.",
    price: 3800,
    category: "birthday",
    subcategory: "0-1",
    type: "helium",
    occasion: ["birthday"],
    size: "L",
    inStock: true,
    rating: 4.8,
    reviewsCount: 54,
    images: [
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=600&fit=crop",
    ],
    isNew: true,
    balloonCount: 16,
  },
  {
    id: 8,
    name: "Минимализм белый",
    description: "Стильный монохромный набор из 12 белых шаров разных размеров.",
    price: 2200,
    category: "monochrome",
    type: "latex",
    occasion: ["birthday", "corporate", "wedding"],
    size: "M",
    inStock: true,
    rating: 4.5,
    reviewsCount: 23,
    images: [
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=600&fit=crop",
    ],
    colors: ["#FFFFFF"],
    balloonCount: 12,
  },
  {
    id: 9,
    name: "Подростковая вечеринка",
    description: "Модный набор для тинейджеров. Неоновые цвета и современный дизайн!",
    price: 3000,
    category: "birthday",
    subcategory: "teens",
    type: "latex",
    occasion: ["birthday"],
    size: "M",
    inStock: true,
    rating: 4.7,
    reviewsCount: 41,
    images: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=600&fit=crop",
    ],
    isHit: true,
    balloonCount: 18,
  },
  {
    id: 10,
    name: "Розовый фламинго",
    description: "Тропический набор с фольгированным фламинго и 10 розовыми шарами.",
    price: 4200,
    category: "birthday",
    subcategory: "4-7",
    type: "foil",
    occasion: ["birthday"],
    size: "L",
    inStock: true,
    rating: 4.9,
    reviewsCount: 36,
    images: [
      "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=600&h=600&fit=crop",
    ],
    isNew: true,
    colors: ["#FF69B4", "#FF1493"],
    balloonCount: 11,
  },
  {
    id: 11,
    name: "Космическое приключение",
    description: "Набор для юных космонавтов! Ракета, звезды и планеты - 15 тематических шаров.",
    price: 4500,
    category: "birthday",
    subcategory: "8-13",
    type: "foil",
    occasion: ["birthday"],
    size: "L",
    inStock: true,
    rating: 4.8,
    reviewsCount: 29,
    images: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=600&fit=crop",
    ],
    colors: ["#000080", "#4B0082", "#C0C0C0"],
    balloonCount: 15,
  },
  {
    id: 12,
    name: "Черный шик",
    description: "Стильный монохромный набор из 15 черных шаров с серебряными акцентами.",
    price: 2800,
    category: "monochrome",
    type: "latex",
    occasion: ["birthday", "corporate"],
    size: "M",
    inStock: true,
    rating: 4.6,
    reviewsCount: 18,
    images: [
      "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600&h=600&fit=crop",
    ],
    colors: ["#000000", "#C0C0C0"],
    balloonCount: 15,
  },
];
