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
  Send,
  Sparkles,
  Tag,
  Flame,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useProducts";
import { useSetting } from "@/contexts/SiteDataContext";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Печать на шарах", href: "/printing", icon: Printer },
  { name: "Корпоративы", href: "/corporate", icon: Building2 },
  { name: "Доставка", href: "/delivery", icon: Truck },
  { name: "Оплата", href: "/payment", icon: CreditCard },
  { name: "Отзывы", href: "/reviews", icon: MessageSquare },
  { name: "Новости", href: "/news", icon: Newspaper },
  { name: "Контакты", href: "/contacts", icon: Phone },
];

const quickFilters = [
  { name: "Хиты продаж", href: "/catalog?filter=hits", icon: Flame, color: "text-orange-500" },
  { name: "Акции и скидки", href: "/catalog?filter=sale", icon: Tag, color: "text-red-500" },
  { name: "Новинки", href: "/catalog?filter=new", icon: Sparkles, color: "text-blue-500" },
  { name: "Наборы до 3000₽", href: "/catalog?filter=budget", icon: Gift, color: "text-green-500" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
};

const subcategoryVariants = {
  hidden: { 
    opacity: 0, 
    height: 0,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1, 
    height: "auto",
    transition: { 
      duration: 0.3,
      staggerChildren: 0.02,
      delayChildren: 0.1
    }
  },
};

const subcategoryItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function MobileMenu() {
  const { user, isAdmin, signOut } = useAuth();
  const { categories } = useCategories();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const phone = useSetting("phone", "+7 (918) 179-00-56");
  const whatsapp = useSetting("whatsapp", "https://wa.me/79181790056");
  const telegram = useSetting("telegram", "https://t.me/+79181790056");
  const vk = useSetting("vk", "https://vk.com/radugaprazdnika");
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  // Group categories by parent
  const parentCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => 
    categories.filter(c => c.parent_id === parentId);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div 
        className="p-4 bg-primary text-primary-foreground"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎈</span>
          <div>
            <h2 className="font-heading font-bold text-lg">Радуга Праздника</h2>
            <p className="text-sm text-primary-foreground/80">Воздушные шары</p>
          </div>
        </div>
      </motion.div>

      {/* User section */}
      <AnimatePresence>
        {user && (
          <motion.div 
            className="p-4 bg-muted/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2">
          {/* Catalog Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Catalog Toggle */}
            <motion.button 
              variants={itemVariants}
              onClick={() => setCatalogOpen(!catalogOpen)}
              className={cn(
                "flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200",
                catalogOpen ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                  catalogOpen ? "bg-primary-foreground/20" : "bg-primary/10"
                )}>
                  <ShoppingBag className={cn("h-5 w-5", catalogOpen ? "text-primary-foreground" : "text-primary")} />
                </div>
                <span className="font-semibold">Каталог</span>
              </div>
              <motion.div
                animate={{ rotate: catalogOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.div>
            </motion.button>

            {/* Catalog Content */}
            <AnimatePresence>
              {catalogOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={subcategoryVariants}
                  className="overflow-hidden"
                >
                  {/* Quick Filters */}
                  <div className="grid grid-cols-2 gap-2 p-2 mt-2">
                    {quickFilters.map((filter) => {
                      const Icon = filter.icon;
                      return (
                        <SheetClose key={filter.href} asChild>
                          <motion.div variants={subcategoryItemVariants}>
                            <Link 
                              to={filter.href}
                              className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <Icon className={cn("h-4 w-4", filter.color)} />
                              <span className="text-sm font-medium">{filter.name}</span>
                            </Link>
                          </motion.div>
                        </SheetClose>
                      );
                    })}
                  </div>

                  <Separator className="my-2" />

                  {/* All Products Link */}
                  <motion.div variants={subcategoryItemVariants} className="px-2">
                    <SheetClose asChild>
                      <Link 
                        to="/catalog" 
                        className="block py-3 px-4 rounded-lg text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        Все товары →
                      </Link>
                    </SheetClose>
                  </motion.div>

                  {/* Categories with Subcategories */}
                  <div className="mt-2 space-y-1 px-2">
                    {parentCategories.map((category) => {
                      const subcategories = getSubcategories(category.id);
                      const hasSubcategories = subcategories.length > 0;
                      const isExpanded = expandedCategory === category.id;

                      return (
                        <motion.div 
                          key={category.id}
                          variants={subcategoryItemVariants}
                        >
                          {hasSubcategories ? (
                            <>
                              <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm hover:bg-muted/50 transition-colors"
                              >
                                <span className="font-medium">{category.name}</span>
                                <motion.div
                                  animate={{ rotate: isExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </motion.div>
                              </button>
                              
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden pl-4 space-y-1"
                                  >
                                    <SheetClose asChild>
                                      <Link 
                                        to={`/catalog?category=${category.slug}`}
                                        className="block py-2 px-3 rounded-md text-sm text-primary hover:bg-primary/10 transition-colors"
                                      >
                                        Все в "{category.name}"
                                      </Link>
                                    </SheetClose>
                                    {subcategories.map((sub) => (
                                      <SheetClose key={sub.id} asChild>
                                        <Link 
                                          to={`/catalog?category=${sub.slug}`}
                                          className="block py-2 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                        >
                                          {sub.name}
                                        </Link>
                                      </SheetClose>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <SheetClose asChild>
                              <Link 
                                to={`/catalog?category=${category.slug}`}
                                className="block py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
                              >
                                {category.name}
                              </Link>
                            </SheetClose>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Separator className="my-2" />

            {/* Main nav items */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.href} variants={itemVariants}>
                  <SheetClose asChild>
                    <Link 
                      to={item.href} 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SheetClose>
                </motion.div>
              );
            })}

            {/* Admin link */}
            {isAdmin && (
              <>
                <Separator className="my-2" />
                <motion.div variants={itemVariants}>
                  <SheetClose asChild>
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-primary">Админ-панель</span>
                    </Link>
                  </SheetClose>
                </motion.div>
              </>
            )}
          </motion.div>
        </nav>
      </ScrollArea>

      {/* Footer actions */}
      <motion.div 
        className="p-4 border-t bg-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
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
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg"
              aria-label="WhatsApp"
            >
              <MessageSquare className="h-5 w-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-lg"
              aria-label="Telegram"
            >
              <Send className="h-5 w-5" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href={vk}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-[#0077FF] text-white flex items-center justify-center shadow-lg"
              aria-label="VKontakte"
            >
              <span className="font-bold text-sm">VK</span>
            </motion.a>
          </div>
          <p className="text-xs text-muted-foreground text-center">Ежедневно 9:00-21:00</p>
        </div>
      </motion.div>
    </div>
  );
}
