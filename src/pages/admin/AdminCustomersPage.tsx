import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Users } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Customer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, phone, created_at")
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;

        // Fetch orders to calculate stats
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("user_id, total");

        if (ordersError) throw ordersError;

        // Calculate stats per user
        const userStats: Record<string, { count: number; total: number }> = {};
        orders?.forEach((order) => {
          if (order.user_id) {
            if (!userStats[order.user_id]) {
              userStats[order.user_id] = { count: 0, total: 0 };
            }
            userStats[order.user_id].count += 1;
            userStats[order.user_id].total += Number(order.total);
          }
        });

        // Merge data
        const customersData: Customer[] = (profiles || []).map((profile) => ({
          ...profile,
          orders_count: userStats[profile.user_id]?.count || 0,
          total_spent: userStats[profile.user_id]?.total || 0,
        }));

        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      (c.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (c.phone || "").includes(searchQuery)
  );

  if (loading) {
    return (
      <AdminLayout title="Клиенты">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Клиенты">
      <div className="space-y-4">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Клиенты не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Заказов</TableHead>
                    <TableHead>Сумма покупок</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.full_name || "Без имени"}
                      </TableCell>
                      <TableCell>{customer.phone || "—"}</TableCell>
                      <TableCell>
                        {format(new Date(customer.created_at), "dd.MM.yyyy", {
                          locale: ru,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{customer.orders_count}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.total_spent.toLocaleString("ru-RU")} ₽
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
