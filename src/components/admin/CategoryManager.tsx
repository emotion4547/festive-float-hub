import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useProducts";
import { Loader2, Plus, Edit, Trash2, Upload, Link as LinkIcon, FolderOpen, X } from "lucide-react";

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  image: string;
}

export function CategoryManager() {
  const { toast } = useToast();
  const { categories, loading } = useCategories();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    image: "",
  });
  const [imageUrl, setImageUrl] = useState("");

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.id ? prev.slug : generateSlug(name),
    }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `categories/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

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

  const handleFileUpload = async (files: FileList | File[]) => {
    setUploading(true);
    try {
      const file = Array.from(files)[0];
      if (file) {
        const url = await uploadImage(file);
        if (url) {
          setFormData((prev) => ({ ...prev, image: url }));
          toast({ title: "Изображение загружено" });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка загрузки",
      });
    } finally {
      setUploading(false);
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
      setFormData((prev) => ({ ...prev, image: imageUrl.trim() }));
      setImageUrl("");
    }
  };

  const openCreate = () => {
    setFormData({ name: "", slug: "", image: "" });
    setImageUrl("");
    setOpen(true);
  };

  const openEdit = (category: { id: string; name: string; slug: string; image: string | null }) => {
    setFormData({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image || "",
    });
    setImageUrl("");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Введите название" });
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name.trim(),
        slug: formData.slug || generateSlug(formData.name),
        image: formData.image || null,
      };

      if (formData.id) {
        const { error } = await supabase
          .from("categories")
          .update(data)
          .eq("id", formData.id);
        if (error) throw error;
        toast({ title: "Категория обновлена" });
      } else {
        const { error } = await supabase.from("categories").insert(data);
        if (error) throw error;
        toast({ title: "Категория создана" });
      }

      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить категорию",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить категорию? Товары категории не будут удалены.")) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Категория удалена" });
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить категорию",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Категории
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {formData.id ? "Редактировать категорию" : "Новая категория"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cat-name">Название</Label>
                <Input
                  id="cat-name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Название категории"
                />
              </div>
              <div>
                <Label htmlFor="cat-slug">URL (slug)</Label>
                <Input
                  id="cat-slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="category-slug"
                />
              </div>
              <div>
                <Label>Изображение</Label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30"
                  }`}
                >
                  {formData.image ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <label className="cursor-pointer">
                        <span className="text-sm text-primary hover:underline">
                          Загрузить
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files && handleFileUpload(e.target.files)
                          }
                        />
                      </label>
                      {uploading && (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto mt-2" />
                      )}
                    </>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Или URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                    OK
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Категории не созданы
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Фото</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(cat)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
