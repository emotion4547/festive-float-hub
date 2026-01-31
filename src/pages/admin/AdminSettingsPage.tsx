import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Globe, Phone, Share2, Truck, MessageCircle, Send } from "lucide-react";
import { BrandingSettings } from "@/components/admin/BrandingSettings";
import { SocialLinksManager } from "@/components/admin/SocialLinksManager";

interface Setting {
  id: string;
  key: string;
  value: string | null;
  label: string;
  type: string;
  category: string;
}

interface PageContentItem {
  id: string;
  page_slug: string;
  section_key: string;
  title: string | null;
  content: string | null;
}

const pageLabels: Record<string, string> = {
  home: "Главная",
  delivery: "Доставка",
  corporate: "Корпоративным клиентам",
  printing: "Печать на шарах",
  payment: "Оплата",
  contacts: "Контакты",
  warranty: "Гарантии и возврат",
  privacy: "Политика конфиденциальности",
  offer: "Публичная оферта",
  partners: "Партнёрам",
  news: "Новости",
  reviews: "Отзывы",
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [pageContent, setPageContent] = useState<PageContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings")
        .select("*")
        .order("sort_order");

      if (settingsError) throw settingsError;

      const { data: contentData, error: contentError } = await supabase
        .from("page_content")
        .select("*")
        .order("sort_order");

      if (contentError) throw contentError;

      setSettings(settingsData || []);
      setPageContent(contentData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", title: "Ошибка загрузки данных" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleContentChange = (id: string, field: "title" | "content", value: string) => {
    setPageContent((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: setting.value })
          .eq("key", setting.key);

        if (error) throw error;
      }

      toast({ title: "Настройки сохранены" });
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка сохранения" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePageContent = async (pageSlug: string) => {
    setSaving(true);
    try {
      const pageItems = pageContent.filter((c) => c.page_slug === pageSlug);

      for (const item of pageItems) {
        const { error } = await supabase
          .from("page_content")
          .update({ title: item.title, content: item.content })
          .eq("id", item.id);

        if (error) throw error;
      }

      toast({ title: `Страница "${pageLabels[pageSlug]}" сохранена` });
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка сохранения" });
    } finally {
      setSaving(false);
    }
  };

  const settingsByCategory = settings.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Setting[]>);

  const contentByPage = pageContent.reduce((acc, c) => {
    if (!acc[c.page_slug]) acc[c.page_slug] = [];
    acc[c.page_slug].push(c);
    return acc;
  }, {} as Record<string, PageContentItem[]>);

  if (loading) {
    return (
      <AdminLayout title="Настройки">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Настройки">
      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="branding">Брендинг</TabsTrigger>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="contacts">Контакты</TabsTrigger>
          <TabsTrigger value="social">Соцсети</TabsTrigger>
          <TabsTrigger value="delivery">Доставка</TabsTrigger>
          <TabsTrigger value="pages">Страницы</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <BrandingSettings />
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Общие настройки
              </CardTitle>
              <CardDescription>
                Название и описание компании
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {settingsByCategory.general?.map((s) => (
                <div key={s.key} className="space-y-2">
                  <Label htmlFor={s.key}>{s.label}</Label>
                  <Input
                    id={s.key}
                    value={s.value || ""}
                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить настройки
            </Button>
          </div>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contacts" className="space-y-6">
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
                {settingsByCategory.contacts?.filter(s => s.key.includes('phone')).map((s) => (
                  <div key={s.key} className="space-y-2">
                    <Label htmlFor={s.key}>{s.label}</Label>
                    <Input
                      id={s.key}
                      value={s.value || ""}
                      onChange={(e) => handleSettingChange(s.key, e.target.value)}
                      placeholder="+7 (918) 179-00-56"
                    />
                  </div>
                ))}
              </div>
              {settingsByCategory.contacts?.filter(s => !s.key.includes('phone')).map((s) => (
                <div key={s.key} className="space-y-2">
                  <Label htmlFor={s.key}>{s.label}</Label>
                  <Input
                    id={s.key}
                    value={s.value || ""}
                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить настройки
            </Button>
          </div>
        </TabsContent>

        {/* Social Settings */}
        <TabsContent value="social" className="space-y-6">
          <SocialLinksManager />
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Настройки доставки
              </CardTitle>
              <CardDescription>
                Пороги бесплатной доставки и стоимость
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {settingsByCategory.delivery?.map((s) => (
                <div key={s.key} className="space-y-2">
                  <Label htmlFor={s.key}>{s.label}</Label>
                  <Input
                    id={s.key}
                    value={s.value || ""}
                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить настройки
            </Button>
          </div>
        </TabsContent>

        {/* Pages Content */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Редактирование страниц</CardTitle>
              <CardDescription>
                Измените тексты и заголовки на страницах сайта
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(contentByPage).map(([pageSlug, sections]) => (
                  <AccordionItem key={pageSlug} value={pageSlug}>
                    <AccordionTrigger className="text-left">
                      {pageLabels[pageSlug] || pageSlug}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      {sections.map((section) => (
                        <div key={section.id} className="space-y-3 p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">
                            {section.section_key}
                          </p>
                          {section.title !== null && (
                            <div className="space-y-1">
                              <Label>Заголовок</Label>
                              <Input
                                value={section.title || ""}
                                onChange={(e) =>
                                  handleContentChange(section.id, "title", e.target.value)
                                }
                              />
                            </div>
                          )}
                          <div className="space-y-1">
                            <Label>Содержимое</Label>
                            <Textarea
                              value={section.content || ""}
                              onChange={(e) =>
                                handleContentChange(section.id, "content", e.target.value)
                              }
                              rows={section.content && section.content.length > 200 ? 8 : 3}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSavePageContent(pageSlug)}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Сохранить страницу
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
