import { ReactNode } from "react";
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
  Menu,
  FileText,
  RotateCcw,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

import { UserCog } from "lucide-react";

import { BarChart3 } from "lucide-react";

import { Layers } from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingCart },
  { href: "/admin/customers", label: "Клиенты", icon: Users },
  { href: "/admin/users", label: "Роли", icon: UserCog },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
  { href: "/admin/coupons", label: "Промокоды", icon: Tag },
  { href: "/admin/wheel", label: "Колесо фортуны", icon: RotateCcw },
  { href: "/admin/wheel/stats", label: "Статистика колеса", icon: BarChart3 },
  { href: "/admin/collections", label: "Подборки", icon: Layers },
  { href: "/admin/banners", label: "Баннеры", icon: FileText },
  { href: "/admin/news", label: "Новости", icon: FileText },
  { href: "/admin/pages", label: "Страницы", icon: FileText },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link to="/admin" className="flex items-center gap-2">
          <img 
            src="/assets/logo.png" 
            alt="Радуга Праздника" 
            className="h-8 w-auto"
          />
          <span className="font-semibold text-sm">Админ</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          На сайт
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Выйти
        </Button>
      </div>
    </div>
  );
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-background border-r hidden lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">{title}</span>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">
          {/* Desktop Title */}
          <h1 className="text-2xl font-bold mb-6 hidden lg:block">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
