import { useState, useEffect } from "react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, MapPin, Trash2, Star, Edit } from "lucide-react";

interface Address {
  id: string;
  title: string;
  city: string;
  street: string;
  building: string;
  apartment: string | null;
  entrance: string | null;
  floor: string | null;
  intercom: string | null;
  is_default: boolean;
}

const emptyAddress = {
  title: "Дом",
  city: "Краснодар",
  street: "",
  building: "",
  apartment: "",
  entrance: "",
  floor: "",
  intercom: "",
};

export default function AddressesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState(emptyAddress);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        title: address.title,
        city: address.city,
        street: address.street,
        building: address.building,
        apartment: address.apartment || "",
        entrance: address.entrance || "",
        floor: address.floor || "",
        intercom: address.intercom || "",
      });
    } else {
      setEditingAddress(null);
      setFormData(emptyAddress);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !formData.street || !formData.building) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from("addresses")
          .update({
            title: formData.title,
            city: formData.city,
            street: formData.street,
            building: formData.building,
            apartment: formData.apartment || null,
            entrance: formData.entrance || null,
            floor: formData.floor || null,
            intercom: formData.intercom || null,
          })
          .eq("id", editingAddress.id);

        if (error) throw error;

        toast({ title: "Адрес обновлён" });
      } else {
        const { error } = await supabase.from("addresses").insert({
          user_id: user.id,
          ...formData,
          is_default: addresses.length === 0,
        });

        if (error) throw error;

        toast({ title: "Адрес добавлен" });
      }

      setDialogOpen(false);
      fetchAddresses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить адрес",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Адрес удалён" });
      fetchAddresses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить адрес",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;

    try {
      // Remove default from all
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Set new default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Адрес по умолчанию обновлён" });
      fetchAddresses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить адрес",
      });
    }
  };

  if (loading) {
    return (
      <AccountLayout title="Адреса доставки">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Адреса доставки">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Мои адреса</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить адрес
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? "Редактировать адрес" : "Новый адрес"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Дом, Работа..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Город</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Улица *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    placeholder="ул. Красная"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building">Дом *</Label>
                    <Input
                      id="building"
                      value={formData.building}
                      onChange={(e) =>
                        setFormData({ ...formData, building: e.target.value })
                      }
                      placeholder="123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Квартира</Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) =>
                        setFormData({ ...formData, apartment: e.target.value })
                      }
                      placeholder="45"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entrance">Подъезд</Label>
                    <Input
                      id="entrance"
                      value={formData.entrance}
                      onChange={(e) =>
                        setFormData({ ...formData, entrance: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Этаж</Label>
                    <Input
                      id="floor"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intercom">Домофон</Label>
                    <Input
                      id="intercom"
                      value={formData.intercom}
                      onChange={(e) =>
                        setFormData({ ...formData, intercom: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Сохранить"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет сохранённых адресов</h3>
              <p className="text-muted-foreground">
                Добавьте адрес для быстрого оформления заказа
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <Card key={address.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{address.title}</CardTitle>
                      {address.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          По умолчанию
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    г. {address.city}, {address.street}, д. {address.building}
                    {address.apartment && `, кв. ${address.apartment}`}
                  </p>
                  {(address.entrance || address.floor || address.intercom) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {address.entrance && `Подъезд ${address.entrance}`}
                      {address.floor && `, этаж ${address.floor}`}
                      {address.intercom && `, домофон ${address.intercom}`}
                    </p>
                  )}
                  {!address.is_default && (
                    <Button
                      variant="link"
                      className="p-0 h-auto mt-2"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Сделать основным
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
