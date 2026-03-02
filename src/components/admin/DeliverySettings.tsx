import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2, ImageIcon } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

interface DeliveryZone {
  zone: string;
  price: string;
  time: string;
}

interface ContentItem {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  extra_data: Record<string, unknown>;
}

export function DeliverySettings() {
  const { toast } = useToast();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "delivery")
      .order("sort_order");

    if (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки" });
      return;
    }
    setItems((data || []) as ContentItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getItem = (key: string) => items.find(i => i.section_key === key);

  const updateItem = (key: string, field: "title" | "content", value: string) => {
    setItems(prev => prev.map(i => i.section_key === key ? { ...i, [field]: value } : i));
  };

  const updateExtraData = (key: string, extraData: Record<string, unknown>) => {
    setItems(prev => prev.map(i => i.section_key === key ? { ...i, extra_data: { ...i.extra_data, ...extraData } } : i));
  };

  const getZones = (): DeliveryZone[] => {
    const zonesItem = getItem("zones");
    return (zonesItem?.extra_data?.zones as DeliveryZone[]) || [];
  };

  const setZones = (zones: DeliveryZone[]) => {
    updateExtraData("zones", { zones });
  };

  const getAddresses = (): string[] => {
    const item = getItem("pickup_addresses");
    return (item?.extra_data?.addresses as string[]) || [];
  };

  const setAddresses = (addresses: string[]) => {
    updateExtraData("pickup_addresses", { addresses });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const item of items) {
        const { error } = await supabase
          .from("page_content")
          .update({
            title: item.title,
            content: item.content,
            extra_data: item.extra_data as any,
          })
          .eq("id", item.id);
        if (error) throw error;
      }
      toast({ title: "Страница доставки сохранена" });
    } catch {
      toast({ variant: "destructive", title: "Ошибка сохранения" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const hero = getItem("hero");
  const zones = getZones();
  const addresses = getAddresses();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Шапка страницы</CardTitle>
          <CardDescription>Заголовок, подзаголовок и фоновое изображение</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input value={hero?.title || ""} onChange={e => updateItem("hero", "title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Подзаголовок</Label>
            <Input value={hero?.content || ""} onChange={e => updateItem("hero", "content", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Изображение</Label>
            <ImageUpload
              value={(hero?.extra_data?.image_url as string) || ""}
              onChange={(url) => updateExtraData("hero", { image_url: url })}
              bucket="product-images"
              folder="delivery"
            />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Описание</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Основной текст</Label>
            <Textarea value={getItem("description")?.content || ""} onChange={e => updateItem("description", "content", e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Дополнительный текст</Label>
            <Textarea value={getItem("description2")?.content || ""} onChange={e => updateItem("description2", "content", e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Important Info */}
      <Card>
        <CardHeader>
          <CardTitle>Важная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок блока</Label>
            <Input value={getItem("important")?.title || ""} onChange={e => updateItem("important", "title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Текст</Label>
            <Textarea value={getItem("important")?.content || ""} onChange={e => updateItem("important", "content", e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Доставка и зоны</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок графика</Label>
            <Input value={getItem("schedule_title")?.title || ""} onChange={e => updateItem("schedule_title", "title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Заголовок таблицы зон</Label>
            <Input value={getItem("zones_title")?.title || ""} onChange={e => updateItem("zones_title", "title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Зоны доставки</Label>
            {zones.map((z, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input placeholder="Район" value={z.zone} onChange={e => {
                  const upd = [...zones]; upd[i] = { ...upd[i], zone: e.target.value }; setZones(upd);
                }} />
                <Input placeholder="Цена" value={z.price} className="w-32" onChange={e => {
                  const upd = [...zones]; upd[i] = { ...upd[i], price: e.target.value }; setZones(upd);
                }} />
                <Input placeholder="Время" value={z.time} className="w-28" onChange={e => {
                  const upd = [...zones]; upd[i] = { ...upd[i], time: e.target.value }; setZones(upd);
                }} />
                <Button variant="ghost" size="icon" onClick={() => setZones(zones.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setZones([...zones, { zone: "", price: "", time: "" }])}>
              <Plus className="h-4 w-4 mr-1" /> Добавить зону
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Block */}
      <Card>
        <CardHeader>
          <CardTitle>Блок связи</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Текст</Label>
            <Input value={getItem("contact")?.content || ""} onChange={e => updateItem("contact", "content", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Текст кнопки</Label>
            <Input value={(getItem("contact")?.extra_data?.button_text as string) || ""} onChange={e => updateExtraData("contact", { button_text: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Pickup */}
      <Card>
        <CardHeader>
          <CardTitle>Самовывоз</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input value={getItem("pickup_title")?.title || ""} onChange={e => updateItem("pickup_title", "title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Текст</Label>
            <Textarea value={getItem("pickup_text")?.content || ""} onChange={e => updateItem("pickup_text", "content", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Адреса</Label>
            {addresses.map((addr, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input value={addr} onChange={e => {
                  const upd = [...addresses]; upd[i] = e.target.value; setAddresses(upd);
                }} />
                <Button variant="ghost" size="icon" onClick={() => setAddresses(addresses.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setAddresses([...addresses, ""])}>
              <Plus className="h-4 w-4 mr-1" /> Добавить адрес
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Сохранить страницу доставки
        </Button>
      </div>
    </div>
  );
}
