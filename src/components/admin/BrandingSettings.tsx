import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Image, Sparkles } from "lucide-react";

interface BrandingSettingsProps {
  onSave?: () => void;
}

export function BrandingSettings({ onSave }: BrandingSettingsProps) {
  const { toast } = useToast();
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["logo_url", "favicon_url"]);

        if (data) {
          data.forEach((setting) => {
            if (setting.key === "logo_url") setLogoUrl(setting.value || "");
            if (setting.key === "favicon_url") setFaviconUrl(setting.value || "");
          });
        }
      } catch (error) {
        console.error("Error fetching branding settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const uploadImage = async (file: File, type: "logo" | "favicon"): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `branding/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, "logo");
      if (url) {
        setLogoUrl(url);
        toast({ title: "Логотип загружен" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки" });
    } finally {
      setUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, "favicon");
      if (url) {
        setFaviconUrl(url);
        toast({ title: "Фавикон загружен" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert logo_url
      const { error: logoError } = await supabase
        .from("site_settings")
        .upsert(
          { 
            key: "logo_url", 
            value: logoUrl,
            label: "URL логотипа",
            category: "branding",
            type: "text"
          },
          { onConflict: "key" }
        );

      if (logoError) throw logoError;

      // Upsert favicon_url
      const { error: faviconError } = await supabase
        .from("site_settings")
        .upsert(
          { 
            key: "favicon_url", 
            value: faviconUrl,
            label: "URL фавикона",
            category: "branding",
            type: "text"
          },
          { onConflict: "key" }
        );

      if (faviconError) throw faviconError;

      toast({ title: "Настройки брендинга сохранены" });
      onSave?.();
    } catch (error) {
      console.error("Error saving branding settings:", error);
      toast({ variant: "destructive", title: "Ошибка сохранения" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Брендинг
        </CardTitle>
        <CardDescription>
          Настройте логотип и фавикон сайта
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div className="space-y-3">
          <Label>Логотип сайта</Label>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Image className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                </label>
                {logoUrl && (
                  <Button variant="ghost" size="sm" onClick={() => setLogoUrl("")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Или вставьте URL изображения"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Рекомендуемый размер: 200x60 px, формат PNG с прозрачным фоном
              </p>
            </div>
          </div>
        </div>

        {/* Favicon */}
        <div className="space-y-3">
          <Label>Фавикон (иконка вкладки браузера)</Label>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted">
              {faviconUrl ? (
                <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
              ) : (
                <Image className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/png,image/x-icon,image/svg+xml"
                    className="hidden"
                    onChange={handleFaviconUpload}
                    disabled={uploading}
                  />
                </label>
                {faviconUrl && (
                  <Button variant="ghost" size="sm" onClick={() => setFaviconUrl("")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Или вставьте URL изображения"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Рекомендуемый размер: 32x32 или 64x64 px, формат PNG или ICO
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить настройки брендинга"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
