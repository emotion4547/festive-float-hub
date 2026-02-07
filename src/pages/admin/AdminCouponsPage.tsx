import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Tag } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string;
  valid_to: string | null;
}

const emptyCoupon = {
  code: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: null as number | null,
  max_uses: null as number | null,
  is_active: true,
};

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState(emptyCoupon);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        min_order_amount: coupon.min_order_amount,
        max_uses: coupon.max_uses,
        is_active: coupon.is_active,
      });
    } else {
      setEditingCoupon(null);
      setFormData(emptyCoupon);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите код промокода",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update({
            code: formData.code.toUpperCase(),
            discount_type: formData.discount_type,
            discount_value: formData.discount_value,
            min_order_amount: formData.min_order_amount,
            max_uses: formData.max_uses,
            is_active: formData.is_active,
          })
          .eq("id", editingCoupon.id);

        if (error) throw error;

        toast({ title: "Промокод обновлён" });
      } else {
        const { error } = await supabase.from("coupons").insert({
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          min_order_amount: formData.min_order_amount,
          max_uses: formData.max_uses,
          is_active: formData.is_active,
        });

        if (error) throw error;

        toast({ title: "Промокод создан" });
      }

      setDialogOpen(false);
      fetchCoupons();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить промокод",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот промокод?")) return;

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Промокод удалён" });
      fetchCoupons();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить промокод",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Промокоды">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Промокоды">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Создать промокод
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? "Редактировать промокод" : "Новый промокод"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Код промокода</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="SALE10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount_type">Тип скидки</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, discount_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Процент</SelectItem>
                        <SelectItem value="fixed">Фиксированная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount_value">
                      Размер скидки{" "}
                      {formData.discount_type === "percentage" ? "(%)" : "(₽)"}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_value: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_order">Мин. сумма заказа (₽)</Label>
                    <Input
                      id="min_order"
                      type="number"
                      value={formData.min_order_amount || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_order_amount: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      placeholder="Не ограничено"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_uses">Макс. использований</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      value={formData.max_uses || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_uses: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      placeholder="Не ограничено"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Активен</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Coupons */}
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Промокоды не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-mono font-bold text-sm">{coupon.code}</p>
                        <p className="text-sm text-primary font-medium">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}%`
                            : `${Number(coupon.discount_value).toLocaleString("ru-RU")} ₽`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(coupon)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(coupon.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {coupon.min_order_amount ? `от ${Number(coupon.min_order_amount).toLocaleString("ru-RU")} ₽` : "Без мин. суммы"}
                      </span>
                      <span className="text-muted-foreground">
                        {coupon.used_count}{coupon.max_uses && ` / ${coupon.max_uses}`} исп.
                      </span>
                      <Badge variant={coupon.is_active ? "default" : "secondary"} className="text-xs">
                        {coupon.is_active ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Код</TableHead>
                      <TableHead>Скидка</TableHead>
                      <TableHead>Мин. сумма</TableHead>
                      <TableHead>Использовано</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="w-24">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                        <TableCell>
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}%`
                            : `${Number(coupon.discount_value).toLocaleString("ru-RU")} ₽`}
                        </TableCell>
                        <TableCell>
                          {coupon.min_order_amount ? `${Number(coupon.min_order_amount).toLocaleString("ru-RU")} ₽` : "—"}
                        </TableCell>
                        <TableCell>
                          {coupon.used_count}{coupon.max_uses && ` / ${coupon.max_uses}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={coupon.is_active ? "default" : "secondary"}>
                            {coupon.is_active ? "Активен" : "Неактивен"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coupon)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
