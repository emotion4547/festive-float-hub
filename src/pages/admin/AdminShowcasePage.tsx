import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Upload, X, Link as LinkIcon, Settings2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { SortableList } from "@/components/admin/SortableList";
import { SortableItem } from "@/components/admin/SortableItem";
import { ImageUpload } from "@/components/admin/ImageUpload";

// === Banners Types ===
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

// === Collections Types ===
interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  sort_order: number | null;
  created_at: string;
}

export default function AdminShowcasePage() {
  // === Banners State ===
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    link_text: "",
    is_active: true,
  });

  // === Collections State ===
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [collectionFormData, setCollectionFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
    start_date: "",
    end_date: "",
    sort_order: 0,
  });

  const { toast } = useToast();

  // === Banners Logic ===
  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      sonnerToast.error("Ошибка загрузки баннеров");
    } finally {
      setBannersLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleBannerImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setBannerFormData({ ...bannerFormData, image_url: publicUrl });
      sonnerToast.success("Изображение загружено");
    } catch (error) {
      console.error("Error uploading image:", error);
      sonnerToast.error("Ошибка загрузки изображения");
    } finally {
      setUploading(false);
    }
  };

  const handleBannerDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleBannerImageUpload(imageFile);
    }
  }, [bannerFormData]);

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerFormData.image_url) {
      sonnerToast.error("Добавьте изображение баннера");
      return;
    }

    try {
      const bannerData = {
        title: bannerFormData.title,
        subtitle: bannerFormData.subtitle || null,
        image_url: bannerFormData.image_url,
        link_url: bannerFormData.link_url || null,
        link_text: bannerFormData.link_text || null,
        is_active: bannerFormData.is_active,
        sort_order: editingBanner?.sort_order ?? banners.length,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", editingBanner.id);

        if (error) throw error;
        sonnerToast.success("Баннер обновлен");
      } else {
        const { error } = await supabase.from("banners").insert([bannerData]);

        if (error) throw error;
        sonnerToast.success("Баннер создан");
      }

      setBannerDialogOpen(false);
      resetBannerForm();
      fetchBanners();
    } catch (error: any) {
      console.error("Error saving banner:", error);
      sonnerToast.error(error.message || "Ошибка сохранения баннера");
    }
  };

  const handleBannerEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      link_text: banner.link_text || "",
      is_active: banner.is_active,
    });
    setBannerDialogOpen(true);
  };

  const handleBannerDelete = async (id: string) => {
    if (!confirm("Удалить баннер?")) return;

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) throw error;
      sonnerToast.success("Баннер удален");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      sonnerToast.error("Ошибка удаления баннера");
    }
  };

  const toggleBannerActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !banner.is_active })
        .eq("id", banner.id);

      if (error) throw error;
      sonnerToast.success(banner.is_active ? "Баннер скрыт" : "Баннер активирован");
      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner:", error);
      sonnerToast.error("Ошибка обновления баннера");
    }
  };

  const handleBannerDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleBannerDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBanners = [...banners];
    const [draggedItem] = newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedItem);
    setBanners(newBanners);
    setDraggedIndex(index);
  };

  const handleBannerDragEnd = async () => {
    setDraggedIndex(null);
    
    try {
      const updates = banners.map((banner, index) => ({
        id: banner.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("banners")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }
      
      sonnerToast.success("Порядок сохранен");
    } catch (error) {
      console.error("Error updating sort order:", error);
      sonnerToast.error("Ошибка сохранения порядка");
      fetchBanners();
    }
  };

  const resetBannerForm = () => {
    setEditingBanner(null);
    setBannerFormData({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      link_text: "",
      is_active: true,
    });
  };

  // === Collections Logic ===
  const fetchCollections = async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching collections:", error);
      toast({ title: "Ошибка загрузки подборок", variant: "destructive" });
    } else {
      setCollections(data || []);
    }
    setCollectionsLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const generateSlug = (name: string) => {
    const translitMap: Record<string, string> = {
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
      з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
      п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
      ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    };
    return name
      .toLowerCase()
      .split("")
      .map((char) => translitMap[char] || char)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleCollectionNameChange = (name: string) => {
    setCollectionFormData((prev) => ({
      ...prev,
      name,
      slug: selectedCollection ? prev.slug : generateSlug(name),
    }));
  };

  const resetCollectionForm = () => {
    setCollectionFormData({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      is_active: true,
      start_date: "",
      end_date: "",
      sort_order: 0,
    });
    setSelectedCollection(null);
  };

  const handleOpenCollectionEdit = (collection: Collection) => {
    setSelectedCollection(collection);
    setCollectionFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      image_url: collection.image_url || "",
      is_active: collection.is_active,
      start_date: collection.start_date || "",
      end_date: collection.end_date || "",
      sort_order: collection.sort_order || 0,
    });
    setCollectionDialogOpen(true);
  };

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionFormData.name || !collectionFormData.slug) {
      toast({ title: "Заполните название и slug", variant: "destructive" });
      return;
    }

    const payload = {
      name: collectionFormData.name,
      slug: collectionFormData.slug,
      description: collectionFormData.description || null,
      image_url: collectionFormData.image_url || null,
      is_active: collectionFormData.is_active,
      start_date: collectionFormData.start_date || null,
      end_date: collectionFormData.end_date || null,
      sort_order: collectionFormData.sort_order,
    };

    if (selectedCollection) {
      const { error } = await supabase
        .from("collections")
        .update(payload)
        .eq("id", selectedCollection.id);

      if (error) {
        toast({ title: "Ошибка обновления", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Подборка обновлена" });
    } else {
      const { error } = await supabase.from("collections").insert(payload);

      if (error) {
        toast({ title: "Ошибка создания", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Подборка создана" });
    }

    setCollectionDialogOpen(false);
    resetCollectionForm();
    fetchCollections();
  };

  const handleCollectionDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("collections").delete().eq("id", deleteId);

    if (error) {
      toast({ title: "Ошибка удаления", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Подборка удалена" });
      fetchCollections();
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleCollectionReorder = async (reorderedItems: Collection[]) => {
    setCollections(reorderedItems);

    const updates = reorderedItems.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from("collections")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id);
    }

    toast({ title: "Порядок сохранен" });
  };

  const isLoading = bannersLoading || collectionsLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Витрина">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Витрина">
      <Tabs defaultValue="banners" className="space-y-6">
        <TabsList>
          <TabsTrigger value="banners">Баннеры</TabsTrigger>
          <TabsTrigger value="collections">Подборки</TabsTrigger>
        </TabsList>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Управление баннерами на главной странице. Перетаскивайте для изменения порядка.
            </p>
            <Dialog open={bannerDialogOpen} onOpenChange={(open) => {
              setBannerDialogOpen(open);
              if (!open) resetBannerForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить баннер
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingBanner ? "Редактирование баннера" : "Новый баннер"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBannerSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Заголовок *</Label>
                    <Input
                      id="title"
                      value={bannerFormData.title}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Подзаголовок</Label>
                    <Input
                      id="subtitle"
                      value={bannerFormData.subtitle}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Изображение *</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        uploading ? 'opacity-50' : 'hover:border-primary'
                      }`}
                      onDrop={handleBannerDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {bannerFormData.image_url ? (
                        <div className="relative">
                          <img
                            src={bannerFormData.image_url}
                            alt="Preview"
                            className="max-h-40 mx-auto rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-0 right-0"
                            onClick={() => setBannerFormData({ ...bannerFormData, image_url: "" })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Перетащите изображение или
                          </p>
                          <label className="cursor-pointer">
                            <span className="text-primary hover:underline">выберите файл</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleBannerImageUpload(file);
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Или вставьте URL изображения"
                        value={bannerFormData.image_url}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, image_url: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="link_url">Ссылка (URL)</Label>
                      <Input
                        id="link_url"
                        value={bannerFormData.link_url}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, link_url: e.target.value })}
                        placeholder="/catalog"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link_text">Текст кнопки</Label>
                      <Input
                        id="link_text"
                        value={bannerFormData.link_text}
                        onChange={(e) => setBannerFormData({ ...bannerFormData, link_text: e.target.value })}
                        placeholder="Смотреть"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={bannerFormData.is_active}
                      onCheckedChange={(checked) => setBannerFormData({ ...bannerFormData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Активен</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1" disabled={uploading}>
                      {editingBanner ? "Сохранить" : "Создать"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBannerDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {banners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет баннеров
            </div>
          ) : (
            <div className="space-y-2">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  draggable
                  onDragStart={() => handleBannerDragStart(index)}
                  onDragOver={(e) => handleBannerDragOver(e, index)}
                  onDragEnd={handleBannerDragEnd}
                  className={`flex items-center gap-4 p-4 rounded-lg border bg-background ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${!banner.is_active ? 'opacity-60' : ''}`}
                >
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-24 h-14 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
                    )}
                    {banner.link_url && (
                      <p className="text-xs text-primary flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        {banner.link_url}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBannerActive(banner)}
                      title={banner.is_active ? "Скрыть" : "Показать"}
                    >
                      {banner.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleBannerEdit(banner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleBannerDelete(banner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Перетащите подборки для изменения порядка
            </p>
            <Dialog open={collectionDialogOpen} onOpenChange={(open) => {
              setCollectionDialogOpen(open);
              if (!open) resetCollectionForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить подборку
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedCollection ? "Редактировать подборку" : "Новая подборка"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCollectionSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название *</Label>
                    <Input
                      id="name"
                      value={collectionFormData.name}
                      onChange={(e) => handleCollectionNameChange(e.target.value)}
                      placeholder="8 марта"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL (slug) *</Label>
                    <Input
                      id="slug"
                      value={collectionFormData.slug}
                      onChange={(e) => setCollectionFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="8-marta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={collectionFormData.description}
                      onChange={(e) => setCollectionFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Подборка шаров к 8 марта"
                    />
                  </div>
                  
                  <ImageUpload
                    value={collectionFormData.image_url}
                    onChange={(url) => setCollectionFormData((prev) => ({ ...prev, image_url: url }))}
                    bucket="collection-images"
                    label="Изображение подборки"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Дата начала</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={collectionFormData.start_date}
                        onChange={(e) => setCollectionFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Дата окончания</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={collectionFormData.end_date}
                        onChange={(e) => setCollectionFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={collectionFormData.is_active}
                      onCheckedChange={(checked) => setCollectionFormData((prev) => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Активна</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    {selectedCollection ? "Сохранить" : "Создать"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {collections.length === 0 ? (
            <p className="text-muted-foreground">Подборок пока нет</p>
          ) : (
            <div className="space-y-2">
              <SortableList items={collections} onReorder={handleCollectionReorder}>
                {collections.map((collection) => (
                  <SortableItem key={collection.id} id={collection.id} className="p-3">
                    <div className="flex items-center gap-4 flex-1">
                      {collection.image_url ? (
                        <img
                          src={collection.image_url}
                          alt={collection.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                          Нет
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{collection.name}</p>
                        <p className="text-sm text-muted-foreground truncate">/{collection.slug}</p>
                      </div>
                      <div className="text-sm text-muted-foreground hidden md:block">
                        {collection.start_date && collection.end_date
                          ? `${format(new Date(collection.start_date), "d MMM", { locale: ru })} - ${format(new Date(collection.end_date), "d MMM", { locale: ru })}`
                          : "—"}
                      </div>
                      <Badge variant={collection.is_active ? "default" : "secondary"}>
                        {collection.is_active ? "Активна" : "Неактивна"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/collections/${collection.id}`}>
                            <Settings2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenCollectionEdit(collection)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setDeleteId(collection.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableList>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить подборку?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все товары будут отвязаны от подборки.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleCollectionDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
