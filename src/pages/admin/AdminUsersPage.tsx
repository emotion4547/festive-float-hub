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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Users, Shield, User, UserCog } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

// === Customers Tab Types ===
interface Customer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

// === Roles Tab Types ===
interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: "admin" | "moderator" | "user";
}

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  moderator: "Модератор",
  user: "Пользователь",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  moderator: "bg-blue-100 text-blue-800",
  user: "bg-gray-100 text-gray-800",
};

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  admin: Shield,
  moderator: UserCog,
  user: User,
};

export default function AdminUsersPage() {
  // === Customers State ===
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersSearch, setCustomersSearch] = useState("");

  // === Roles State ===
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesSearch, setRolesSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // === Customers Logic ===
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, user_id, full_name, phone, created_at")
          .order("created_at", { ascending: false });

        if (profilesError) throw profilesError;

        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("user_id, total");

        if (ordersError) throw ordersError;

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

        const customersData: Customer[] = (profiles || []).map((profile) => ({
          ...profile,
          orders_count: userStats[profile.user_id]?.count || 0,
          total_spent: userStats[profile.user_id]?.total || 0,
        }));

        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      (c.full_name?.toLowerCase() || "").includes(customersSearch.toLowerCase()) ||
      (c.phone || "").includes(customersSearch)
  );

  // === Roles Logic ===
  const fetchUsersWithRoles = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, phone, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      const usersData: UserWithRole[] = (profiles || []).map((profile) => ({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at,
        role: (roleMap.get(profile.user_id) as "admin" | "moderator" | "user") || "user",
      }));

      setUsersWithRoles(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive",
      });
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Ошибка",
        description: "Вы не можете изменить свою роль",
        variant: "destructive",
      });
      return;
    }

    setUpdatingUserId(userId);

    try {
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRole) {
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({ role: newRole as "admin" | "moderator" | "user" })
          .eq("user_id", userId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role: newRole as "admin" | "moderator" | "user" }]);

        if (insertError) throw insertError;
      }

      setUsersWithRoles((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, role: newRole as "admin" | "moderator" | "user" } : u
        )
      );

      toast({
        title: "Роль обновлена",
        description: `Пользователю назначена роль: ${roleLabels[newRole]}`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить роль",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsersWithRoles = usersWithRoles.filter((user) => {
    const searchLower = rolesSearch.toLowerCase();
    return (
      (user.full_name?.toLowerCase().includes(searchLower) ?? false) ||
      (user.phone?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  return (
    <AdminLayout title="Пользователи">
      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers">Клиенты</TabsTrigger>
          <TabsTrigger value="roles">Роли</TabsTrigger>
        </TabsList>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          {customersLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по имени или телефону..."
                      value={customersSearch}
                      onChange={(e) => setCustomersSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {filteredCustomers.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Клиенты не найдены</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {filteredCustomers.map((customer) => (
                      <Card key={customer.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{customer.full_name || "Без имени"}</p>
                            <Badge variant="secondary" className="text-xs">{customer.orders_count} заказов</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{customer.phone || "—"}</span>
                            <span className="font-medium text-foreground">
                              {customer.total_spent.toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Desktop Table */}
                  <Card className="hidden md:block">
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
                              <TableCell className="font-medium">{customer.full_name || "Без имени"}</TableCell>
                              <TableCell>{customer.phone || "—"}</TableCell>
                              <TableCell>{format(new Date(customer.created_at), "dd.MM.yyyy", { locale: ru })}</TableCell>
                              <TableCell><Badge variant="secondary">{customer.orders_count}</Badge></TableCell>
                              <TableCell className="font-medium">{customer.total_spent.toLocaleString("ru-RU")} ₽</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </>
              )}
            </>
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          {rolesLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {usersWithRoles.filter((u) => u.role === "admin").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Администраторов</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <UserCog className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {usersWithRoles.filter((u) => u.role === "moderator").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Модераторов</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {usersWithRoles.filter((u) => u.role === "user").length}
                      </p>
                      <p className="text-sm text-muted-foreground">Пользователей</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени или телефону..."
                  value={rolesSearch}
                  onChange={(e) => setRolesSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users Table */}
              {filteredUsersWithRoles.length === 0 ? (
                <div className="bg-background rounded-lg border p-8 text-center text-muted-foreground">
                  {rolesSearch ? "Пользователи не найдены" : "Нет пользователей"}
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {filteredUsersWithRoles.map((user) => {
                      const RoleIcon = roleIcons[user.role];
                      const isCurrentUser = user.user_id === currentUser?.id;
                      return (
                        <Card key={user.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-sm">{user.full_name || "Без имени"}</p>
                                  {isCurrentUser && <Badge variant="outline" className="text-xs">Вы</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">{user.phone || "—"}</p>
                              </div>
                              <Badge className={`${roleColors[user.role]} text-xs`}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {roleLabels[user.role]}
                              </Badge>
                            </div>
                            {!isCurrentUser && (
                              <Select
                                value={user.role}
                                onValueChange={(value) => handleRoleChange(user.user_id, value)}
                                disabled={updatingUserId === user.user_id}
                              >
                                <SelectTrigger className="w-full h-8 text-xs">
                                  {updatingUserId === user.user_id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <SelectValue />
                                  )}
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Пользователь</SelectItem>
                                  <SelectItem value="moderator">Модератор</SelectItem>
                                  <SelectItem value="admin">Администратор</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {/* Desktop Table */}
                  <div className="bg-background rounded-lg border overflow-hidden hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Пользователь</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Дата регистрации</TableHead>
                          <TableHead>Роль</TableHead>
                          <TableHead className="w-[180px]">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsersWithRoles.map((user) => {
                          const RoleIcon = roleIcons[user.role];
                          const isCurrentUser = user.user_id === currentUser?.id;
                          return (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{user.full_name || "Без имени"}</span>
                                  {isCurrentUser && <Badge variant="outline" className="text-xs">Вы</Badge>}
                                </div>
                              </TableCell>
                              <TableCell>{user.phone || "—"}</TableCell>
                              <TableCell>{format(new Date(user.created_at), "d MMM yyyy", { locale: ru })}</TableCell>
                              <TableCell>
                                <Badge className={roleColors[user.role]}>
                                  <RoleIcon className="h-3 w-3 mr-1" />
                                  {roleLabels[user.role]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {isCurrentUser ? (
                                  <span className="text-sm text-muted-foreground">—</span>
                                ) : (
                                  <Select
                                    value={user.role}
                                    onValueChange={(value) => handleRoleChange(user.user_id, value)}
                                    disabled={updatingUserId === user.user_id}
                                  >
                                    <SelectTrigger className="w-[160px]">
                                      {updatingUserId === user.user_id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <SelectValue />
                                      )}
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">Пользователь</SelectItem>
                                      <SelectItem value="moderator">Модератор</SelectItem>
                                      <SelectItem value="admin">Администратор</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
