import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X, Image } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[а-яё]/g, (char) => {
      const map: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
        'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    image_url: "",
    is_published: false,
  });

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Ошибка загрузки статей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `news/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrlData.publicUrl });
      toast.success("Изображение загружено");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Ошибка загрузки изображения");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = formData.slug || generateSlug(formData.title);
      const articleData = {
        title: formData.title,
        slug,
        content: formData.content || null,
        excerpt: formData.excerpt || null,
        image_url: formData.image_url || null,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingArticle) {
        const { error } = await supabase
          .from("news")
          .update(articleData)
          .eq("id", editingArticle.id);

        if (error) throw error;
        toast.success("Статья обновлена");
      } else {
        const { error } = await supabase.from("news").insert([articleData]);

        if (error) throw error;
        toast.success("Статья создана");
      }

      setDialogOpen(false);
      resetForm();
      fetchArticles();
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast.error(error.message || "Ошибка сохранения статьи");
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content || "",
      excerpt: article.excerpt || "",
      image_url: article.image_url || "",
      is_published: article.is_published,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить статью?")) return;

    try {
      const { error } = await supabase.from("news").delete().eq("id", id);

      if (error) throw error;
      toast.success("Статья удалена");
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Ошибка удаления статьи");
    }
  };

  const togglePublish = async (article: NewsArticle) => {
    try {
      const { error } = await supabase
        .from("news")
        .update({
          is_published: !article.is_published,
          published_at: !article.is_published ? new Date().toISOString() : null,
        })
        .eq("id", article.id);

      if (error) throw error;
      toast.success(article.is_published ? "Статья скрыта" : "Статья опубликована");
      fetchArticles();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Ошибка обновления статьи");
    }
  };

  const resetForm = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      image_url: "",
      is_published: false,
    });
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: "" });
  };

  return (
    <AdminLayout title="Новости">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Управление новостями и статьями
          </p>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить статью
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? "Редактирование статьи" : "Новая статья"}
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
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Будет сгенерирован автоматически"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Краткое описание</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Содержимое</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={10}
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Изображение</Label>
                  
                  {formData.image_url ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.image_url}
                        alt="Превью"
                        className="w-full max-w-sm h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Upload from device */}
                      <div
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                        {uploading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span>Загрузка...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Нажмите для загрузки или перетащите файл
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, WEBP до 5MB
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Or add by URL */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">или</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Вставьте URL изображения"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (formData.image_url) {
                              toast.success("URL добавлен");
                            }
                          }}
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Опубликовать сразу</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingArticle ? "Сохранить" : "Создать"}
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
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет статей
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {articles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2 mb-1">{article.title}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                          article.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {article.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {article.is_published ? "Опубл." : "Черновик"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(article)}>
                          {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(article)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(article.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Desktop Table */}
            <div className="rounded-lg border bg-background hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Изображение</TableHead>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="w-16 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                            <Image className="h-5 w-5" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          article.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {article.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {article.is_published ? "Опубликовано" : "Черновик"}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(article.created_at), "d MMM yyyy", { locale: ru })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => togglePublish(article)}>
                            {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
