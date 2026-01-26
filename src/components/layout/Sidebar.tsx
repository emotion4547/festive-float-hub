import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Flame, Tag, Store, Gift, Baby, Box, Users, Heart, Briefcase, PartyPopper, Flower2, Car, Gamepad2, Trees, Medal, Cat, Crown, Tv, Calendar, Shapes, Camera, Sparkles, Hash, Footprints, Circle, School, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface CategoryItem {
  name: string;
  href: string;
  icon?: React.ElementType;
  subcategories?: { name: string; href: string }[];
}

const catalogCategories: CategoryItem[] = [
  { name: "Хиты продаж", href: "/catalog?filter=hits", icon: Flame },
  { name: "Акции и скидки", href: "/catalog?filter=sale", icon: Tag },
  { name: "САМОВЫВОЗ", href: "/catalog?filter=pickup", icon: Store },
  { name: "Наборы до 3000р", href: "/catalog?filter=budget", icon: Gift },
  { name: "На выписку", href: "/catalog?category=discharge", icon: Baby },
  { name: "Бабл-боксы", href: "/catalog?category=bubble-box", icon: Box },
  { 
    name: "Персонажи", 
    href: "/catalog?category=characters", 
    icon: Users,
    subcategories: [
      { name: "Микки и Минни", href: "/catalog?category=characters&sub=mickey" },
      { name: "Щенячий патруль", href: "/catalog?category=characters&sub=paw-patrol" },
      { name: "Холодное сердце", href: "/catalog?category=characters&sub=frozen" },
    ]
  },
  { name: "WOW - наборы", href: "/catalog?category=wow", icon: Sparkles },
  { name: "Коробка-сюрприз", href: "/catalog?category=surprise-box", icon: Gift },
  { name: "Для девушек", href: "/catalog?category=for-girls", icon: Heart },
  { name: "Мужские наборы", href: "/catalog?category=for-men", icon: Briefcase },
  { name: "Для девочек", href: "/catalog?category=for-little-girls", icon: Crown },
  { name: "Для мальчиков", href: "/catalog?category=for-boys", icon: Car },
  { name: "Воздушные композиции", href: "/catalog?category=compositions", icon: Circle },
  { name: "Гендер пати", href: "/catalog?category=gender-party", icon: Baby },
  { name: "Девичник", href: "/catalog?category=bachelorette", icon: PartyPopper },
  { name: "Свадьба", href: "/catalog?category=wedding", icon: Heart },
  { name: "Букеты из шаров", href: "/catalog?category=bouquets", icon: Flower2 },
  { name: "Машины и техника", href: "/catalog?category=cars", icon: Car },
  { name: "Геймеры", href: "/catalog?category=gamers", icon: Gamepad2 },
  { name: "Динозавры", href: "/catalog?category=dinosaurs", icon: Trees },
  { name: "Спорт", href: "/catalog?category=sport", icon: Medal },
  { name: "Милые животные", href: "/catalog?category=animals", icon: Cat },
  { name: "Капибары", href: "/catalog?category=capybara", icon: Cat },
  { name: "Принцессы", href: "/catalog?category=princesses", icon: Crown },
  { name: "Аниме", href: "/catalog?category=anime", icon: Tv },
  { 
    name: "Праздники", 
    href: "/catalog?category=holidays", 
    icon: Calendar,
    subcategories: [
      { name: "Новый год", href: "/catalog?category=holidays&sub=new-year" },
      { name: "8 марта", href: "/catalog?category=holidays&sub=8march" },
      { name: "23 февраля", href: "/catalog?category=holidays&sub=23feb" },
      { name: "Halloween", href: "/catalog?category=holidays&sub=halloween" },
    ]
  },
  { name: "Фигуры из воздушных шаров", href: "/catalog?category=figures", icon: Shapes },
  { name: "Оформление и фотозоны", href: "/catalog?category=photozones", icon: Camera },
  { name: "Шары под потолок", href: "/catalog?category=ceiling", icon: Circle },
  { name: "Цифры фольгированные", href: "/catalog?category=foil-numbers", icon: Hash },
  { name: "Ходячие шары", href: "/catalog?category=walking", icon: Footprints },
  { name: "Фольгированные шары", href: "/catalog?category=foil", icon: Circle },
  { name: "Шарики латексные", href: "/catalog?category=latex", icon: Circle },
  { name: "Детский сад", href: "/catalog?category=kindergarten", icon: School },
  { name: "Школьный выпускной", href: "/catalog?category=graduation", icon: GraduationCap },
];

export function Sidebar() {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (name: string) => {
    setOpenItems(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-24 bg-background rounded-xl shadow-sm overflow-hidden">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-heading font-semibold flex items-center gap-2">
          <span>КАТАЛОГ ТОВАРОВ</span>
        </div>
        <nav className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {catalogCategories.map((category) => {
            const Icon = category.icon;
            const isActive = location.pathname + location.search === category.href;
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;
            const isOpen = openItems.includes(category.name);

            if (hasSubcategories) {
              return (
                <Collapsible key={category.name} open={isOpen} onOpenChange={() => toggleItem(category.name)}>
                  <CollapsibleTrigger className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors border-b border-muted/30",
                    isActive && "bg-primary/10 text-primary"
                  )}>
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4 text-primary" />}
                      <span>{category.name}</span>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-muted/20">
                    {category.subcategories?.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        className="block pl-10 pr-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/30 transition-colors"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <Link
                key={category.name}
                to={category.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors border-b border-muted/30",
                  isActive && "bg-primary/10 text-primary font-medium"
                )}
              >
                {Icon && <Icon className="h-4 w-4 text-primary" />}
                <span>{category.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
