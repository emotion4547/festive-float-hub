import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface Stats {
  ordersCount: number;
  productsCount: number;
  customersCount: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingReviews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    ordersCount: 0,
    productsCount: 0,
    customersCount: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch orders count and revenue
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, total, status");

        if (ordersError) throw ordersError;

        const totalRevenue = orders?.reduce(
          (sum, order) => sum + Number(order.total),
          0
        ) || 0;
        const pendingOrders = orders?.filter(
          (o) => o.status === "pending"
        ).length || 0;

        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true });

        if (productsError) throw productsError;

        // Fetch customers count
        const { count: customersCount, error: customersError } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        if (customersError) throw customersError;

        // Fetch pending reviews
        const { count: pendingReviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending");

        if (reviewsError) throw reviewsError;

        setStats({
          ordersCount: orders?.length || 0,
          productsCount: productsCount || 0,
          customersCount: customersCount || 0,
          totalRevenue,
          pendingOrders,
          pendingReviews: pendingReviews || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Дашборд">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Заказы",
      value: stats.ordersCount,
      icon: ShoppingCart,
      description: `${stats.pendingOrders} ожидают подтверждения`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Товары",
      value: stats.productsCount,
      icon: Package,
      description: "В каталоге",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Клиенты",
      value: stats.customersCount,
      icon: Users,
      description: "Зарегистрировано",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Выручка",
      value: `${stats.totalRevenue.toLocaleString("ru-RU")} ₽`,
      icon: TrendingUp,
      description: "Общая сумма заказов",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <AdminLayout title="Дашборд">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn(stat.bgColor, "p-2 rounded-lg")}>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Требуют внимания</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.pendingOrders > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm">Новых заказов</span>
                  <span className="font-semibold text-yellow-700">
                    {stats.pendingOrders}
                  </span>
                </div>
              )}
              {stats.pendingReviews > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">Отзывов на модерации</span>
                  <span className="font-semibold text-blue-700">
                    {stats.pendingReviews}
                  </span>
                </div>
              )}
              {stats.pendingOrders === 0 && stats.pendingReviews === 0 && (
                <p className="text-muted-foreground text-sm">
                  Все задачи выполнены ✓
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <a
                href="/admin/products"
                className="p-3 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors"
              >
                <Package className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Добавить товар</span>
              </a>
              <a
                href="/admin/orders"
                className="p-3 bg-muted rounded-lg text-center hover:bg-muted/80 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Заказы</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
