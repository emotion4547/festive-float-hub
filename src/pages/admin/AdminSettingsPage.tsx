import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Phone, MessageCircle, Send } from "lucide-react";

interface SiteSetting {
  key: string;
  value: string | null;
  label: string;
  category: string;
  type: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value, label, category, type");

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value || "";
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Ошибка загрузки настроек");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each setting
      const updates = Object.entries(settings).map(([key, value]) =>
        supabase
          .from("site_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key)
      );

      await Promise.all(updates);
      toast.success("Настройки сохранены!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Ошибка сохранения настроек");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Настройки">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Настройки">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>

        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
            <TabsTrigger value="social">Социальные сети</TabsTrigger>
            <TabsTrigger value="delivery">Доставка</TabsTrigger>
            <TabsTrigger value="company">О компании</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Контактная информация
                </CardTitle>
                <CardDescription>
                  Телефоны и email для связи с клиентами
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Основной телефон</Label>
                    <Input
                      id="phone"
                      value={settings.phone || ""}
                      onChange={(e) => updateSetting("phone", e.target.value)}
                      placeholder="+7 (918) 179-00-56"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_2">Дополнительный телефон</Label>
                    <Input
                      id="phone_2"
                      value={settings.phone_2 || ""}
                      onChange={(e) => updateSetting("phone_2", e.target.value)}
                      placeholder="+7 (918) 123-45-67"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => updateSetting("email", e.target.value)}
                    placeholder="info@example.ru"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={settings.address || ""}
                    onChange={(e) => updateSetting("address", e.target.value)}
                    placeholder="г. Краснодар, ул. Красная, 123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_hours">Часы работы</Label>
                  <Input
                    id="work_hours"
                    value={settings.work_hours || ""}
                    onChange={(e) => updateSetting("work_hours", e.target.value)}
                    placeholder="Пн-Вс: 09:00 - 21:00"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Социальные сети и мессенджеры
                </CardTitle>
                <CardDescription>
                  Ссылки на социальные сети и мессенджеры
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" style={{ color: "#25D366" }} />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={settings.whatsapp || ""}
                    onChange={(e) => updateSetting("whatsapp", e.target.value)}
                    placeholder="https://wa.me/79181790056"
                  />
                  <p className="text-xs text-muted-foreground">
                    Формат: https://wa.me/79181790056 (без +)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram" className="flex items-center gap-2">
                    <Send className="h-4 w-4" style={{ color: "#0088cc" }} />
                    Telegram
                  </Label>
                  <Input
                    id="telegram"
                    value={settings.telegram || ""}
                    onChange={(e) => updateSetting("telegram", e.target.value)}
                    placeholder="https://t.me/+79181790056"
                  />
                  <p className="text-xs text-muted-foreground">
                    Формат: https://t.me/username или https://t.me/+79181790056
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vk">ВКонтакте</Label>
                  <Input
                    id="vk"
                    value={settings.vk || ""}
                    onChange={(e) => updateSetting("vk", e.target.value)}
                    placeholder="https://vk.com/radugaprazdnika"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.instagram || ""}
                    onChange={(e) => updateSetting("instagram", e.target.value)}
                    placeholder="https://instagram.com/radugaprazdnika"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Настройки доставки</CardTitle>
                <CardDescription>
                  Пороги бесплатной доставки и стоимость
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="free_delivery_threshold">Порог бесплатной доставки (₽)</Label>
                    <Input
                      id="free_delivery_threshold"
                      type="number"
                      value={settings.free_delivery_threshold || ""}
                      onChange={(e) => updateSetting("free_delivery_threshold", e.target.value)}
                      placeholder="5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery_cost">Стоимость доставки (₽)</Label>
                    <Input
                      id="delivery_cost"
                      type="number"
                      value={settings.delivery_cost || ""}
                      onChange={(e) => updateSetting("delivery_cost", e.target.value)}
                      placeholder="200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Информация о компании</CardTitle>
                <CardDescription>
                  Название и описание компании
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Название компании</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name || ""}
                    onChange={(e) => updateSetting("company_name", e.target.value)}
                    placeholder="Радуга Праздника"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_description">Описание</Label>
                  <Input
                    id="company_description"
                    value={settings.company_description || ""}
                    onChange={(e) => updateSetting("company_description", e.target.value)}
                    placeholder="Магазин воздушных шаров в Краснодаре"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
