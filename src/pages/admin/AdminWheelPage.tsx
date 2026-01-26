import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Plus, Edit, Trash2, RotateCcw } from "lucide-react";

interface WheelSegment {
  id: string;
  label: string;
  discount_type: string;
  discount_value: number;
  probability: number;
  color: string;
  is_active: boolean;
  sort_order: number;
  prize_type: string;
  gift_product_id: string | null;
}

interface Product {
  id: string;
  name: string;
}

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", 
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F8B500", "#16A085"
];

const emptySegment = {
  label: "",
  discount_type: "percentage",
  discount_value: 10,
  probability: 10,
  color: COLORS[0],
  is_active: true,
  prize_type: "discount",
  gift_product_id: null as string | null,
};

export default function AdminWheelPage() {
  const { toast } = useToast();
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSegment, setEditingSegment] = useState<WheelSegment | null>(null);
  const [formData, setFormData] = useState(emptySegment);

  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from("wheel_segments")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error("Error fetching segments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from("products")
        .select("id, name")
        .eq("in_stock", true)
        .order("name");
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchSegments();
    fetchProducts();
  }, []);

  const handleOpenDialog = (segment?: WheelSegment) => {
    if (segment) {
      setEditingSegment(segment);
      setFormData({
        label: segment.label,
        discount_type: segment.discount_type,
        discount_value: Number(segment.discount_value),
        probability: segment.probability,
        color: segment.color,
        is_active: segment.is_active,
        prize_type: segment.prize_type,
        gift_product_id: segment.gift_product_id,
      });
    } else {
      setEditingSegment(null);
      setFormData(emptySegment);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите название сегмента",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingSegment) {
        const { error } = await supabase
          .from("wheel_segments")
          .update({
            label: formData.label,
            discount_type: formData.discount_type,
            discount_value: formData.discount_value,
            probability: formData.probability,
            color: formData.color,
            is_active: formData.is_active,
            prize_type: formData.prize_type,
            gift_product_id: formData.gift_product_id,
          })
          .eq("id", editingSegment.id);

        if (error) throw error;
        toast({ title: "Сегмент обновлён" });
      } else {
        const { error } = await supabase.from("wheel_segments").insert({
          label: formData.label,
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          probability: formData.probability,
          color: formData.color,
          is_active: formData.is_active,
          prize_type: formData.prize_type,
          gift_product_id: formData.gift_product_id,
          sort_order: segments.length,
        });

        if (error) throw error;
        toast({ title: "Сегмент создан" });
      }

      setDialogOpen(false);
      fetchSegments();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить сегмент",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот сегмент?")) return;

    try {
      const { error } = await supabase
        .from("wheel_segments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Сегмент удалён" });
      fetchSegments();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить сегмент",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Колесо фортуны">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Колесо фортуны">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Настройте призы колеса фортуны. Вероятность определяет шанс выпадения (больше = чаще).
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить сегмент
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSegment ? "Редактировать сегмент" : "Новый сегмент"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Название (отображается на колесе)</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder="10%"
                  />
                </div>

                {/* Prize type selector */}
                <div className="space-y-2">
                  <Label>Тип приза</Label>
                  <Select
                    value={formData.prize_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, prize_type: value, gift_product_id: value === "discount" ? null : formData.gift_product_id })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">Скидка</SelectItem>
                      <SelectItem value="gift">Подарок</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.prize_type === "discount" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Тип скидки</Label>
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
                          <SelectItem value="fixed">Фиксированная (₽)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount_value">
                        Размер {formData.discount_type === "percentage" ? "(%)" : "(₽)"}
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
                ) : (
                  <div className="space-y-2">
                    <Label>Товар-подарок</Label>
                    <Select
                      value={formData.gift_product_id || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gift_product_id: value || null })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите товар" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      При активации промокода товар добавляется в корзину бесплатно
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="probability">Вероятность (вес)</Label>
                  <Input
                    id="probability"
                    type="number"
                    value={formData.probability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        probability: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Чем больше значение, тем чаще выпадает этот приз
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Цвет сегмента</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          formData.color === color
                            ? "border-primary ring-2 ring-primary ring-offset-2"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
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

        {segments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Сегменты не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Цвет</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип приза</TableHead>
                    <TableHead>Значение</TableHead>
                    <TableHead>Вероятность</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-24">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell>
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: segment.color }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{segment.label}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          segment.prize_type === "gift"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {segment.prize_type === "gift" ? "Подарок" : "Скидка"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {segment.prize_type === "gift"
                          ? "Товар"
                          : segment.discount_type === "percentage"
                            ? `${segment.discount_value}%`
                            : `${Number(segment.discount_value).toLocaleString("ru-RU")} ₽`}
                      </TableCell>
                      <TableCell>{segment.probability}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            segment.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {segment.is_active ? "Активен" : "Неактивен"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(segment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(segment.id)}
                          >
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
        )}
      </div>
    </AdminLayout>
  );
}
