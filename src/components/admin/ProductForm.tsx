import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useProducts";
import { Loader2, X, Upload, Link as LinkIcon, GripVertical, Video, Play, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    old_price: number | null;
    discount: number | null;
    category_id: string | null;
    type: string | null;
    occasion: string[] | null;
    size: string | null;
    in_stock: boolean;
    on_order: boolean;
    is_new: boolean;
    is_hit: boolean;
    images: string[] | null;
    colors: string[] | null;
    balloon_count: number | null;
    live_cover_url?: string | null;
    videos?: string[] | null;
  };
  onSuccess?: () => void;
}

const typeOptions = [
  { value: "helium", label: "Гелиевые" },
  { value: "latex", label: "Латексные" },
  { value: "foil", label: "Фольгированные" },
];

const occasionOptions = [
  { value: "birthday", label: "День рождения" },
  { value: "wedding", label: "Свадьба" },
  { value: "corporate", label: "Корпоратив" },
  { value: "love", label: "Для влюбленных" },
  { value: "discharge", label: "Выписка" },
];

const sizeOptions = [
  { value: "S", label: "Маленький (S)" },
  { value: "M", label: "Средний (M)" },
  { value: "L", label: "Большой (L)" },
];

const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLiveCover, setUploadingLiveCover] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    old_price: product?.old_price?.toString() || "",
    discount: product?.discount?.toString() || "",
    category_id: product?.category_id || "",
    type: product?.type || "",
    occasion: product?.occasion || [],
    size: product?.size || "",
    in_stock: product?.in_stock ?? true,
    on_order: product?.on_order ?? false,
    is_new: product?.is_new ?? false,
    is_hit: product?.is_hit ?? false,
    balloon_count: product?.balloon_count?.toString() || "",
  });

  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [liveCoverUrl, setLiveCoverUrl] = useState<string | null>(product?.live_cover_url || null);
  const [videos, setVideos] = useState<string[]>(product?.videos || []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOccasionChange = (value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      occasion: checked
        ? [...prev.occasion, value]
        : prev.occasion.filter((o) => o !== value),
    }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    if (file.size > MAX_VIDEO_SIZE) {
      toast({
        variant: "destructive",
        title: "Файл слишком большой",
        description: "Максимальный размер видео — 10 МБ",
      });
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-videos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Video upload error:", uploadError);
      toast({
        variant: "destructive",
        title: "Ошибка загрузки видео",
        description: uploadError.message,
      });
      return null;
    }

    const { data } = supabase.storage
      .from("product-videos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    setUploading(true);
    const fileArray = Array.from(files);

    try {
      const uploadPromises = fileArray.map((file) => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter((url): url is string => url !== null);

      if (validUrls.length > 0) {
        setImages((prev) => [...prev, ...validUrls]);
        toast({
          title: `Загружено ${validUrls.length} изображений`,
        });
      }

      if (validUrls.length < fileArray.length) {
        toast({
          variant: "destructive",
          title: "Некоторые файлы не загружены",
          description: "Проверьте формат файлов (jpg, png, webp)",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить изображения",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLiveCoverUpload = async (file: File) => {
    setUploadingLiveCover(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const url = await uploadVideo(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (url) {
        setLiveCoverUrl(url);
        toast({ title: "Живая обложка загружена" });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить видео",
      });
    } finally {
      setUploadingLiveCover(false);
      setUploadProgress(0);
    }
  };

  const handleGalleryVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const url = await uploadVideo(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (url) {
        setVideos(prev => [...prev, url]);
        toast({ title: "Видео добавлено в галерею" });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
        description: "Не удалось загрузить видео",
      });
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removeLiveCover = () => {
    setLiveCoverUrl(null);
  };

  const handleImageDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
        category_id: formData.category_id || null,
        type: formData.type || null,
        occasion: formData.occasion.length > 0 ? formData.occasion : null,
        size: formData.size || null,
        in_stock: formData.in_stock,
        on_order: formData.on_order,
        is_new: formData.is_new,
        is_hit: formData.is_hit,
        balloon_count: formData.balloon_count
          ? parseInt(formData.balloon_count)
          : null,
        images: images.length > 0 ? images : null,
        live_cover_url: liveCoverUrl,
        videos: videos.length > 0 ? videos : null,
      };

      if (product?.id) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;

        toast({ title: "Товар обновлён" });
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;

        toast({ title: "Товар создан" });
      }

      onSuccess?.();
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить товар",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Main info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category_id">Категория</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Цены</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Цена *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="old_price">Старая цена</Label>
                  <Input
                    id="old_price"
                    name="old_price"
                    type="number"
                    value={formData.old_price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Скидка (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="balloon_count">Кол-во шаров</Label>
                  <Input
                    id="balloon_count"
                    name="balloon_count"
                    type="number"
                    value={formData.balloon_count}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Характеристики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Тип</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Размер</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, size: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите размер" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {sizeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">По поводу</Label>
                <div className="grid grid-cols-2 gap-2">
                  {occasionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.occasion.includes(opt.value)}
                        onCheckedChange={(checked) =>
                          handleOccasionChange(opt.value, checked as boolean)
                        }
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Media & Status */}
        <div className="space-y-6">
          {/* Live Cover Video */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Живая обложка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Видео будет проигрываться при наведении на карточку товара в каталоге. Макс. 10 МБ.
              </p>
              
              {liveCoverUrl ? (
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <video
                    src={liveCoverUrl}
                    className="w-full aspect-video object-cover"
                    controls
                    muted
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeLiveCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {uploadingLiveCover ? (
                    <div className="space-y-2">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">Загрузка...</p>
                    </div>
                  ) : (
                    <>
                      <Video className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <label className="cursor-pointer">
                        <span className="text-primary hover:underline">
                          Загрузить видео
                        </span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/ogg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLiveCoverUpload(file);
                          }}
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">
                        MP4, WebM или OGG до 10 МБ
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Изображения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/30"
                }`}
              >
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Перетащите файлы сюда или
                </p>
                <label className="cursor-pointer">
                  <span className="text-primary hover:underline">
                    выберите с устройства
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handleFileUpload(e.target.files)
                    }
                  />
                </label>
                {uploading && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Загрузка...</span>
                  </div>
                )}
              </div>

              {/* URL Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Или вставьте URL изображения"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                  />
                </div>
                <Button type="button" variant="outline" onClick={addImageUrl}>
                  Добавить
                </Button>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleImageDragStart(index)}
                      onDragOver={(e) => handleImageDragOver(e, index)}
                      onDragEnd={handleImageDragEnd}
                      className={`relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-move ${
                        draggedIndex === index ? "opacity-50" : ""
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <GripVertical className="h-5 w-5 text-white absolute top-2 left-2" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                          Главное
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gallery Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Видео в галерее
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Добавьте видео, которые будут отображаться в галерее карточки товара. Макс. 10 МБ каждое.
              </p>

              {/* Upload area */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {uploadingVideo ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground">Загрузка...</p>
                  </div>
                ) : (
                  <>
                    <Play className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-primary hover:underline">
                        Добавить видео
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/ogg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleGalleryVideoUpload(file);
                        }}
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Videos list */}
              {videos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {videos.map((video, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-muted group">
                      <video
                        src={video}
                        className="w-full aspect-video object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeVideo(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        <Play className="h-3 w-3" />
                        Видео {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Статус и метки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.in_stock}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      in_stock: checked as boolean,
                    }))
                  }
                />
                <span>В наличии</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.on_order}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      on_order: checked as boolean,
                    }))
                  }
                />
                <span>Под заказ</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.is_new}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_new: checked as boolean,
                    }))
                  }
                />
                <span>Новинка</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.is_hit}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_hit: checked as boolean,
                    }))
                  }
                />
                <span>Хит продаж</span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {product ? "Сохранить" : "Создать товар"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/products")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
