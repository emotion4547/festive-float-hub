import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  Tag,
  Settings,
  LogOut,
  ChevronLeft,
  RotateCcw,
  FileText,
  Layers,
  PanelLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingCart },
  { href: "/admin/users", label: "Пользователи", icon: Users },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
  { href: "/admin/coupons", label: "Промокоды", icon: Tag },
  { href: "/admin/wheel", label: "Колесо фортуны", icon: RotateCcw },
  { href: "/admin/showcase", label: "Витрина", icon: Layers },
  { href: "/admin/news", label: "Новости", icon: FileText },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

interface AdminSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile?: boolean;
}

export function AdminSidebar({ open, setOpen, isMobile = false }: AdminSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const sidebarWidth = open ? "w-64" : "w-16";
  const transitionDuration = 0.3;

  return (
    <motion.aside
      className={cn(
        "h-full bg-background border-r flex flex-col overflow-hidden",
        isMobile ? "w-64" : sidebarWidth
      )}
      animate={{ width: isMobile ? 256 : (open ? 256 : 64) }}
      transition={{ duration: transitionDuration, ease: "easeInOut" }}
      onMouseEnter={() => !isMobile && setOpen(true)}
      onMouseLeave={() => !isMobile && setOpen(false)}
    >
      {/* Logo */}
      <div className="p-4 border-b flex items-center gap-2 min-h-[60px]">
        <Link to="/admin" className="flex items-center gap-2">
          <img 
            src="/assets/logo.png" 
            alt="Радуга Праздника" 
            className="h-8 w-8 object-contain flex-shrink-0"
          />
          <AnimatePresence>
            {(open || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: transitionDuration }}
                className="font-semibold text-sm whitespace-nowrap overflow-hidden"
              >
                Админ
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href !== "/admin" && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                "hover:bg-muted",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence>
                {(open || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: transitionDuration }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {(open || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: transitionDuration }}
                className="whitespace-nowrap overflow-hidden"
              >
                На сайт
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {(open || isMobile) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: transitionDuration }}
                className="whitespace-nowrap overflow-hidden"
              >
                Выйти
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

// Mobile Sidebar Trigger Button
export function MobileSidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
}
