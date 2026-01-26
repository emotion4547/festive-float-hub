import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Heart, Menu, X, ChevronDown, Phone, MessageCircle, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useSetting } from "@/contexts/SiteDataContext";
import { SearchDropdown } from "./SearchDropdown";
import { MobileMenu } from "./MobileMenu";
import { useCategories } from "@/hooks/useProducts";


const mainNavLinks = [
  { name: "ГЛАВНАЯ", href: "/" },
  { name: "ПЕЧАТЬ НА ШАРАХ", href: "/printing" },
  { name: "КОРПОРАТИВЫ", href: "/corporate" },
  { name: "ДОСТАВКА", href: "/delivery" },
  { name: "ОПЛАТА", href: "/payment" },
  { 
    name: "О НАС", 
    href: "/about",
    submenu: [
      { name: "Кто работает с нами", href: "/about/partners" },
      { name: "Новости компании", href: "/news" },
      { name: "Реквизиты", href: "/about/details" },
    ]
  },
  { name: "ОТЗЫВЫ", href: "/reviews" },
  { name: "КОНТАКТЫ", href: "/contacts" },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { itemsCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { user, isAdmin, signOut } = useAuth();
  const { categories } = useCategories();
  
  const phone = useSetting("phone", "+7 (918) 179-00-56");
  const whatsapp = useSetting("whatsapp", "https://wa.me/79181790056");
  const telegram = useSetting("telegram", "https://t.me/+79181790056");
  const cleanPhone = phone.replace(/[^\d+]/g, "");
  
  // Prepare catalog categories from database
  const catalogCategories = categories.map(cat => ({
    name: cat.name,
    href: `/catalog?category=${cat.slug}`,
    image: cat.image,
  }));

  return (
    <header className="sticky top-0 z-50 w-full bg-background shadow-sm">



      {/* Main header with logo, search, contacts */}
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 overflow-hidden">
              <MobileMenu />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-2xl">🎈</span>
              <div className="font-heading hidden sm:block">
                <span className="text-xl font-bold text-primary">Радуга</span>
                <span className="text-xl font-bold text-secondary"> Праздника</span>
              </div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <div className="relative">
              <input
                type="search"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <Button 
                size="sm" 
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover"
              >
                Найти
              </Button>
            </div>
            {showSearchDropdown && (
              <SearchDropdown 
                query={searchQuery} 
                onClose={() => setShowSearchDropdown(false)} 
              />
            )}
          </div>

          {/* Contacts & Messengers */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a 
                href={whatsapp} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a 
                href={telegram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-8 w-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                aria-label="Telegram"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            <div className="text-right">
              <a href={`tel:${cleanPhone}`} className="font-bold text-lg hover:text-primary transition-colors">
                {phone}
              </a>
              <p className="text-xs text-muted-foreground">Краснодар, ежедневно 9:00-21:00</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden"
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Favorites */}
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Auth Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account">Мой аккаунт</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/orders">Мои заказы</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="text-primary font-medium">
                          <Settings className="h-4 w-4 mr-2" />
                          Админ-панель
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Callback */}
            <Button variant="outline" size="sm" className="hidden lg:flex gap-1">
              <Phone className="h-4 w-4" />
              Обратный звонок
            </Button>

            {/* Cart with total */}
            <Link to="/cart" className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {itemsCount}
                  </span>
                )}
              </Button>
              <div className="hidden xl:block text-sm">
                <div className="text-muted-foreground">{itemsCount} шт.</div>
                <div className="font-semibold">0 ₽</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="bg-primary text-primary-foreground hidden lg:block">
        <div className="container">
          <nav className="flex items-center">
            {/* Catalog dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="bg-primary-hover hover:bg-primary-hover/80 text-primary-foreground font-heading font-semibold h-12 px-6 rounded-none gap-2"
                >
                  <Menu className="h-4 w-4" />
                  КАТАЛОГ ТОВАРОВ
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {catalogCategories.map((cat) => (
                  <DropdownMenuItem key={cat.name} asChild>
                    <Link to={cat.href}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Main nav links */}
            {mainNavLinks.map((link) => (
              link.submenu ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-hover font-heading text-sm h-12 px-4 rounded-none gap-1"
                    >
                      {link.name}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {link.submenu.map((sub) => (
                      <DropdownMenuItem key={sub.name} asChild>
                        <Link to={sub.href}>{sub.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-hover font-heading text-sm h-12 px-4 flex items-center transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}

            {/* Login/User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="ml-auto text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-hover font-heading text-sm h-12 px-4 rounded-none gap-2"
                  >
                    <User className="h-4 w-4" />
                    Профиль
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background">
                  <DropdownMenuItem asChild>
                    <Link to="/account">Мой аккаунт</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/orders">Мои заказы</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favorites">Избранное</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="text-primary font-medium">
                          <Settings className="h-4 w-4 mr-2" />
                          Админ-панель
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                className="ml-auto text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-hover font-heading text-sm h-12 px-4 rounded-none"
                asChild
              >
                <Link to="/auth">Войти</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Search bar */}
      {isSearchOpen && (
        <div className="border-t bg-background p-4 md:hidden animate-fade-in">
          <div className="relative">
            <input
              type="search"
              placeholder="Поиск по каталогу..."
              className="w-full pl-4 pr-12 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <Button 
              size="sm" 
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              Найти
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
