import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AccountLayoutProps {
  children: ReactNode;
  title: string;
}

import { Ticket } from "lucide-react";

const menuItems = [
  { href: "/account", label: "Профиль", icon: User },
  { href: "/account/orders", label: "Мои заказы", icon: ShoppingBag },
  { href: "/account/addresses", label: "Адреса доставки", icon: MapPin },
  { href: "/account/coupons", label: "Мои промокоды", icon: Ticket },
  { href: "/account/favorites", label: "Избранное", icon: Heart },
  { href: "/account/settings", label: "Настройки", icon: Settings },
];

export function AccountLayout({ children, title }: AccountLayoutProps) {
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-4">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-6 border-b">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {user?.user_metadata?.full_name || "Пользователь"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="py-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
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

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-muted text-primary"
                  >
                    <Shield className="h-4 w-4" />
                    Админ-панель
                  </Link>
                )}
              </nav>

              {/* Logout */}
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Выйти
                </Button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </Layout>
  );
}
