import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Upload, X, Link as LinkIcon } from "lucide-react";

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

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    link_text: "",
    is_active: true,
  });

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
      toast.error("Ошибка загрузки баннеров");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (file: File) => {
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

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Изображение загружено");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Ошибка загрузки изображения");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      toast.error("Добавьте изображение баннера");
      return;
    }

    try {
      const bannerData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        image_url: formData.image_url,
        link_url: formData.link_url || null,
        link_text: formData.link_text || null,
        is_active: formData.is_active,
        sort_order: editingBanner?.sort_order ?? banners.length,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", editingBanner.id);

        if (error) throw error;
        toast.success("Баннер обновлен");
      } else {
        const { error } = await supabase.from("banners").insert([bannerData]);

        if (error) throw error;
        toast.success("Баннер создан");
      }

      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error: any) {
      console.error("Error saving banner:", error);
      toast.error(error.message || "Ошибка сохранения баннера");
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      link_text: banner.link_text || "",
      is_active: banner.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить баннер?")) return;

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) throw error;
      toast.success("Баннер удален");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Ошибка удаления баннера");
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !banner.is_active })
        .eq("id", banner.id);

      if (error) throw error;
      toast.success(banner.is_active ? "Баннер скрыт" : "Баннер активирован");
      fetchBanners();
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Ошибка обновления баннера");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBanners = [...banners];
    const [draggedItem] = newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedItem);
    setBanners(newBanners);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    
    // Update sort orders in database
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
      
      toast.success("Порядок сохранен");
    } catch (error) {
      console.error("Error updating sort order:", error);
      toast.error("Ошибка сохранения порядка");
      fetchBanners();
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      link_text: "",
      is_active: true,
    });
  };

  return (
    <AdminLayout title="Баннеры">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Управление баннерами на главной странице. Перетаскивайте для изменения порядка.
          </p>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Подзаголовок</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Изображение *</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center ${
                      uploading ? 'opacity-50' : 'hover:border-primary'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {formData.image_url ? (
                      <div className="relative">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="max-h-40 mx-auto rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-0 right-0"
                          onClick={() => setFormData({ ...formData, image_url: "" })}
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
                              if (file) handleImageUpload(file);
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Или вставьте URL изображения"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="link_url">Ссылка (URL)</Label>
                    <Input
                      id="link_url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      placeholder="/catalog"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link_text">Текст кнопки</Label>
                    <Input
                      id="link_text"
                      value={formData.link_text}
                      onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                      placeholder="Смотреть"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
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
                    onClick={() => setDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Загрузка...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет баннеров
          </div>
        ) : (
          <div className="space-y-2">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
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
                    onClick={() => toggleActive(banner)}
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
                    onClick={() => handleEdit(banner)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(banner.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
