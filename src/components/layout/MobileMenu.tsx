import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  MessageSquare, 
  Phone, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Printer, 
  Building2,
  Newspaper,
  Send
} from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useProducts";
import { useSetting } from "@/contexts/SiteDataContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mainNavItems = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Каталог", href: "/catalog", icon: ShoppingBag },
  { name: "Печать на шарах", href: "/printing", icon: Printer },
  { name: "Корпоративы", href: "/corporate", icon: Building2 },
  { name: "Доставка", href: "/delivery", icon: Truck },
  { name: "Оплата", href: "/payment", icon: CreditCard },
  { name: "Отзывы", href: "/reviews", icon: MessageSquare },
  { name: "Новости", href: "/news", icon: Newspaper },
  { name: "Контакты", href: "/contacts", icon: Phone },
];

export function MobileMenu() {
  const { user, isAdmin, signOut } = useAuth();
  const { categories } = useCategories();
  const [catalogOpen, setCatalogOpen] = useState(false);
  
  const phone = useSetting("phone", "+7 (918) 179-00-56");
  const whatsapp = useSetting("whatsapp", "https://wa.me/79181790056");
  const telegram = useSetting("telegram", "https://t.me/+79181790056");
  const vk = useSetting("vk", "https://vk.com/radugaprazdnika");
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎈</span>
          <div>
            <h2 className="font-heading font-bold text-lg">Радуга Праздника</h2>
            <p className="text-sm text-primary-foreground/80">Воздушные шары</p>
          </div>
        </div>
      </div>

      {/* User section */}
      {user && (
        <div className="p-4 bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Мой аккаунт</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <SheetClose asChild>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/account">Профиль</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/account/orders">Заказы</Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {/* Catalog with categories */}
        <Collapsible open={catalogOpen} onOpenChange={setCatalogOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Каталог</span>
            </div>
            <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${catalogOpen ? "rotate-90" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-12 pr-2 space-y-1">
            <SheetClose asChild>
              <Link 
                to="/catalog" 
                className="block py-2 px-3 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                Все товары
              </Link>
            </SheetClose>
            {categories.map((cat) => (
              <SheetClose key={cat.id} asChild>
                <Link 
                  to={`/catalog?category=${cat.slug}`} 
                  className="block py-2 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {cat.name}
                </Link>
              </SheetClose>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Main nav items */}
        {mainNavItems.filter(item => item.href !== "/catalog").map((item) => {
          const Icon = item.icon;
          return (
            <SheetClose key={item.href} asChild>
              <Link 
                to={item.href} 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium">{item.name}</span>
              </Link>
            </SheetClose>
          );
        })}

        {/* Admin link */}
        {isAdmin && (
          <>
            <Separator className="my-2" />
            <SheetClose asChild>
              <Link 
                to="/admin" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-primary">Админ-панель</span>
              </Link>
            </SheetClose>
          </>
        )}
      </nav>

      {/* Footer actions */}
      <div className="p-4 border-t bg-background">
        {user ? (
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        ) : (
          <SheetClose asChild>
            <Button className="w-full gap-2" asChild>
              <Link to="/auth">
                <User className="h-4 w-4" />
                Войти / Регистрация
              </Link>
            </Button>
          </SheetClose>
        )}
        
        {/* Contact info */}
        <div className="mt-4 space-y-3">
          <a href={`tel:${cleanPhone}`} className="flex items-center justify-center gap-2 font-bold text-primary hover:underline">
            <Phone className="h-4 w-4" />
            {phone}
          </a>
          <div className="flex items-center justify-center gap-3">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="WhatsApp"
            >
              <MessageSquare className="h-4 w-4" />
            </a>
            <a
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full bg-[#0088cc] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="Telegram"
            >
              <Send className="h-4 w-4" />
            </a>
            <a
              href={vk}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full bg-[#0077FF] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="VKontakte"
            >
              <span className="font-bold text-xs">VK</span>
            </a>
          </div>
          <p className="text-xs text-muted-foreground text-center">Ежедневно 9:00-21:00</p>
        </div>
      </div>
    </div>
  );
}
