import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Eye, Package, MapPin, Phone, Mail, Calendar, Truck } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
}

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_cost: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_method: string;
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  payment_method: string;
  comment: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_cost: number;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  order_items: { id: string }[];
}

const statusOptions = [
  { value: "pending", label: "Ожидает", variant: "secondary" as const },
  { value: "confirmed", label: "Подтверждён", variant: "default" as const },
  { value: "processing", label: "Собирается", variant: "default" as const },
  { value: "shipped", label: "В доставке", variant: "default" as const },
  { value: "delivered", label: "Доставлен", variant: "outline" as const },
  { value: "cancelled", label: "Отменён", variant: "destructive" as const },
];

const paymentMethods: Record<string, string> = {
  card: "Банковская карта",
  sbp: "СБП",
  cash: "Наличными",
};

const deliveryMethods: Record<string, string> = {
  courier: "Курьер",
  pickup: "Самовывоз",
};

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          total,
          delivery_cost,
          customer_name,
          customer_phone,
          created_at,
          order_items (id)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrderDetails = async (orderId: string) => {
    setLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          total,
          delivery_cost,
          customer_name,
          customer_phone,
          customer_email,
          delivery_method,
          delivery_address,
          delivery_date,
          delivery_time,
          payment_method,
          comment,
          created_at,
          order_items (
            id,
            product_name,
            product_image,
            price,
            quantity
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;

      setSelectedOrder(data);
      setOrderDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные заказа",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({ title: "Статус обновлён" });
      fetchOrders();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус",
      });
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery)
  );

  if (loading) {
    return (
      <AdminLayout title="Заказы">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Заказы">
      <div className="space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по номеру, имени или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Заказы не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Товаров</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const status = statusOptions.find(
                      (s) => s.value === order.status
                    );

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), "dd.MM.yyyy HH:mm", {
                            locale: ru,
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer_phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{order.order_items.length}</TableCell>
                        <TableCell className="font-medium">
                          {(
                            Number(order.total) + Number(order.delivery_cost)
                          ).toLocaleString("ru-RU")}{" "}
                          ₽
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              handleStatusChange(order.id, value)
                            }
                          >
                            <SelectTrigger className="w-36">
                              <Badge variant={status?.variant}>
                                {status?.label}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => fetchOrderDetails(order.id)}
                            disabled={loadingDetails}
                          >
                            {loadingDetails ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Заказ {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Статус:</span>
                <Badge variant={statusOptions.find(s => s.value === selectedOrder.status)?.variant}>
                  {statusOptions.find(s => s.value === selectedOrder.status)?.label}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Клиент</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">Имя:</span>
                    <span>{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedOrder.customer_phone}`} className="text-primary hover:underline">
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedOrder.customer_email}`} className="text-primary hover:underline">
                        {selectedOrder.customer_email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Доставка</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>{deliveryMethods[selectedOrder.delivery_method] || selectedOrder.delivery_method}</span>
                  </div>
                  {selectedOrder.delivery_address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{selectedOrder.delivery_address}</span>
                    </div>
                  )}
                  {(selectedOrder.delivery_date || selectedOrder.delivery_time) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedOrder.delivery_date && format(new Date(selectedOrder.delivery_date), "dd.MM.yyyy", { locale: ru })}
                        {selectedOrder.delivery_time && ` в ${selectedOrder.delivery_time}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">Оплата:</span>
                    <span>{paymentMethods[selectedOrder.payment_method] || selectedOrder.payment_method}</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              {selectedOrder.comment && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Комментарий</h3>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedOrder.comment}
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold">Товары</h3>
                <div className="space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
                      <img
                        src={item.product_image || "/placeholder.svg"}
                        alt={item.product_name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {Number(item.price).toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                      <span className="font-medium text-sm">
                        {(item.quantity * Number(item.price)).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Товары:</span>
                  <span>{Number(selectedOrder.total).toLocaleString("ru-RU")} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доставка:</span>
                  <span>
                    {Number(selectedOrder.delivery_cost) === 0 
                      ? "Бесплатно" 
                      : `${Number(selectedOrder.delivery_cost).toLocaleString("ru-RU")} ₽`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Итого:</span>
                  <span className="text-primary">
                    {(Number(selectedOrder.total) + Number(selectedOrder.delivery_cost)).toLocaleString("ru-RU")} ₽
                  </span>
                </div>
              </div>

              {/* Order Date */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Заказ создан: {format(new Date(selectedOrder.created_at), "dd.MM.yyyy в HH:mm", { locale: ru })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
