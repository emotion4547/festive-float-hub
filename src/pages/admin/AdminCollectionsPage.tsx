import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { SortableList } from "@/components/admin/SortableList";
import { SortableItem } from "@/components/admin/SortableItem";
import { ImageUpload } from "@/components/admin/ImageUpload";

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

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
    start_date: "",
    end_date: "",
    sort_order: 0,
  });

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
    setLoading(false);
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

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: selectedCollection ? prev.slug : generateSlug(name),
    }));
  };

  const resetForm = () => {
    setFormData({
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

  const handleOpenEdit = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      image_url: collection.image_url || "",
      is_active: collection.is_active,
      start_date: collection.start_date || "",
      end_date: collection.end_date || "",
      sort_order: collection.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast({ title: "Заполните название и slug", variant: "destructive" });
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      sort_order: formData.sort_order,
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

    setDialogOpen(false);
    resetForm();
    fetchCollections();
  };

  const handleDelete = async () => {
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

  const handleReorder = async (reorderedItems: Collection[]) => {
    setCollections(reorderedItems);

    // Update sort_order for all items
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

  return (
    <AdminLayout title="Подборки">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Перетащите подборки для изменения порядка
          </p>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="8 марта"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL (slug) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="8-marta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Подборка шаров к 8 марта"
                  />
                </div>
                
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                  bucket="collection-images"
                  label="Изображение подборки"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Дата начала</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Дата окончания</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
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

        {loading ? (
          <p>Загрузка...</p>
        ) : collections.length === 0 ? (
          <p className="text-muted-foreground">Подборок пока нет</p>
        ) : (
          <div className="space-y-2">
            <SortableList items={collections} onReorder={handleReorder}>
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
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(collection)}>
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
      </div>

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
