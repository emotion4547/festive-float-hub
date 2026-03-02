import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Palette, Type, Megaphone, Plus, Trash2, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface HeroSetting {
  key: string;
  value: string;
  label: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
  is_active: boolean;
  sort_order: number | null;
}

export function HeroSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<HeroSetting[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);

  const fetchData = async () => {
    try {
      const [settingsRes, bannersRes] = await Promise.all([
        supabase
          .from("site_settings")
          .select("key, value, label")
          .eq("category", "hero")
          .order("sort_order"),
        supabase
          .from("banners")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (bannersRes.error) throw bannersRes.error;

      setSettings(
        (settingsRes.data || []).map((s) => ({
          key: s.key,
          value: s.value || "",
          label: s.label,
        }))
      );
      setBanners(bannersRes.data || []);
    } catch (error) {
      console.error("Error fetching hero data:", error);
      toast({ variant: "destructive", title: "Ошибка загрузки" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      for (const s of settings) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: s.value })
          .eq("key", s.key);
        if (error) throw error;
      }
      toast({ title: "Настройки херо-блока сохранены" });
    } catch {
      toast({ variant: "destructive", title: "Ошибка сохранения" });
    } finally {
      setSaving(false);
    }
  };

  const handleBannerChange = (id: string, field: keyof Banner, value: string | boolean | number) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const handleSaveBanner = async (banner: Banner) => {
    setSavingBanner(true);
    try {
      const { error } = await supabase
        .from("banners")
        .update({
          title: banner.title,
          subtitle: banner.subtitle,
          link_url: banner.link_url,
          link_text: banner.link_text,
          is_active: banner.is_active,
          sort_order: banner.sort_order,
        })
        .eq("id", banner.id);
      if (error) throw error;
      toast({ title: "Баннер сохранён" });
    } catch {
      toast({ variant: "destructive", title: "Ошибка сохранения баннера" });
    } finally {
      setSavingBanner(false);
    }
  };

  const handleAddBanner = async () => {
    setSavingBanner(true);
    try {
      const { error } = await supabase.from("banners").insert({
        title: "Новая акция",
        subtitle: "Описание акции",
        image_url: "/placeholder.svg",
        link_url: "/catalog",
        link_text: "Подробнее",
        is_active: false,
        sort_order: banners.length,
      });
      if (error) throw error;
      toast({ title: "Баннер добавлен" });
      fetchData();
    } catch {
      toast({ variant: "destructive", title: "Ошибка добавления" });
    } finally {
      setSavingBanner(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Баннер удалён" });
    } catch {
      toast({ variant: "destructive", title: "Ошибка удаления" });
    }
  };

  const colorSettings = settings.filter((s) => s.key.startsWith("hero_color"));
  const textSettings = settings.filter((s) => !s.key.startsWith("hero_color"));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gradient Background Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Фон (градиент)
          </CardTitle>
          <CardDescription>
            Три цвета анимированного градиента на главной странице
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {colorSettings.map((s) => (
              <div key={s.key} className="space-y-2">
                <Label>{s.label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={s.value}
                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                    className="h-10 w-14 rounded border border-input cursor-pointer"
                  />
                  <Input
                    value={s.value}
                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                    className="flex-1"
                    placeholder="#FF0000"
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Preview */}
          <div
            className="mt-4 h-20 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${colorSettings[0]?.value || "#F9A8D4"}, ${colorSettings[1]?.value || "#5BC5C8"}, ${colorSettings[2]?.value || "#abfffc"})`,
            }}
          />
        </CardContent>
      </Card>

      {/* Default Text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Текст по умолчанию
          </CardTitle>
          <CardDescription>
            Отображается когда нет активных баннеров/акций
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {textSettings.map((s) => (
            <div key={s.key} className="space-y-2">
              <Label>{s.label}</Label>
              {s.key.includes("subtitle") ? (
                <Textarea
                  value={s.value}
                  onChange={(e) => handleSettingChange(s.key, e.target.value)}
                  rows={3}
                />
              ) : (
                <Input
                  value={s.value}
                  onChange={(e) => handleSettingChange(s.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Сохранить настройки
        </Button>
      </div>

      <Separator />

      {/* Banners / Promotions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Акции и праздники
              </CardTitle>
              <CardDescription>
                Баннеры с акциями и актуальной информацией. Активные баннеры отображаются в слайдере на главной.
              </CardDescription>
            </div>
            <Button onClick={handleAddBanner} size="sm" disabled={savingBanner}>
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {banners.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Нет баннеров. Добавьте первый!
            </p>
          )}
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="border rounded-lg p-4 space-y-3 bg-muted/30"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={(v) => handleBannerChange(banner.id, "is_active", v)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {banner.is_active ? "Активен" : "Скрыт"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSaveBanner(banner)}
                    disabled={savingBanner}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Сохранить
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Заголовок</Label>
                  <Input
                    value={banner.title}
                    onChange={(e) => handleBannerChange(banner.id, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Порядок</Label>
                  <Input
                    type="number"
                    value={banner.sort_order ?? 0}
                    onChange={(e) => handleBannerChange(banner.id, "sort_order", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Подзаголовок / описание акции</Label>
                <Textarea
                  value={banner.subtitle || ""}
                  onChange={(e) => handleBannerChange(banner.id, "subtitle", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Ссылка</Label>
                  <Input
                    value={banner.link_url || ""}
                    onChange={(e) => handleBannerChange(banner.id, "link_url", e.target.value)}
                    placeholder="/catalog"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Текст кнопки</Label>
                  <Input
                    value={banner.link_text || ""}
                    onChange={(e) => handleBannerChange(banner.id, "link_text", e.target.value)}
                    placeholder="Подробнее"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
