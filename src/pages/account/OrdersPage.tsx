import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, ChevronRight, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_cost: number;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: number;
  }[];
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Ожидает подтверждения", variant: "secondary" },
  confirmed: { label: "Подтверждён", variant: "default" },
  processing: { label: "Собирается", variant: "default" },
  shipped: { label: "В доставке", variant: "default" },
  delivered: { label: "Доставлен", variant: "outline" },
  cancelled: { label: "Отменён", variant: "destructive" },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            order_number,
            status,
            total,
            delivery_cost,
            created_at,
            order_items (
              id,
              product_name,
              product_image,
              quantity,
              price
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <AccountLayout title="Мои заказы">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AccountLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <AccountLayout title="Мои заказы">
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">У вас пока нет заказов</h3>
            <p className="text-muted-foreground mb-6">
              Самое время выбрать воздушные шары для праздника!
            </p>
            <Button asChild>
              <Link to="/">Перейти в каталог</Link>
            </Button>
          </CardContent>
        </Card>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Мои заказы">
      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusLabels[order.status] || statusLabels.pending;

          return (
            <Card key={order.id} className="overflow-hidden">
              <div className="p-4 bg-muted/50 border-b flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Заказ {order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "d MMMM yyyy, HH:mm", {
                        locale: ru,
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>

              <CardContent className="p-4">
                {/* Order Items Preview */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {order.order_items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted"
                    >
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-xs px-1 rounded-tl">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {order.order_items.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        +{order.order_items.length - 4}
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {order.order_items.length}{" "}
                      {order.order_items.length === 1
                        ? "товар"
                        : order.order_items.length < 5
                        ? "товара"
                        : "товаров"}
                    </p>
                    <p className="font-semibold text-lg">
                      {(Number(order.total) + Number(order.delivery_cost)).toLocaleString("ru-RU")} ₽
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/account/orders/${order.id}`}>
                      Подробнее
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AccountLayout>
  );
}
