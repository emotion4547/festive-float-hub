import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, Upload, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAllSocialLinks,
  useCreateSocialLink,
  useUpdateSocialLink,
  useDeleteSocialLink,
  uploadSocialIcon,
  SocialLink,
} from "@/hooks/useSocialLinks";
import { toast } from "sonner";

interface FormData {
  name: string;
  url: string;
  icon_url: string;
  sort_order: number;
  is_active: boolean;
  show_in_header: boolean;
  show_in_footer: boolean;
  show_in_floating: boolean;
}

const defaultFormData: FormData = {
  name: "",
  url: "",
  icon_url: "",
  sort_order: 0,
  is_active: true,
  show_in_header: true,
  show_in_footer: true,
  show_in_floating: true,
};

export function SocialLinksManager() {
  const { data: links, isLoading } = useAllSocialLinks();
  const createMutation = useCreateSocialLink();
  const updateMutation = useUpdateSocialLink();
  const deleteMutation = useDeleteSocialLink();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [deleteLink, setDeleteLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenCreate = () => {
    setEditingLink(null);
    setFormData({
      ...defaultFormData,
      sort_order: (links?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (link: SocialLink) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      url: link.url,
      icon_url: link.icon_url || "",
      sort_order: link.sort_order,
      is_active: link.is_active,
      show_in_header: link.show_in_header,
      show_in_footer: link.show_in_footer,
      show_in_floating: link.show_in_floating,
    });
    setIsDialogOpen(true);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Выберите изображение");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadSocialIcon(file);
      setFormData((prev) => ({ ...prev, icon_url: url }));
      toast.success("Иконка загружена");
    } catch (error: any) {
      toast.error("Ошибка загрузки: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error("Заполните название и URL");
      return;
    }

    if (editingLink) {
      await updateMutation.mutateAsync({
        id: editingLink.id,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteLink) {
      await deleteMutation.mutateAsync(deleteLink.id);
      setDeleteLink(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Социальные ссылки и мессенджеры</h3>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-16">Иконка</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="text-center">Шапка</TableHead>
              <TableHead className="text-center">Подвал</TableHead>
              <TableHead className="text-center">Виджет</TableHead>
              <TableHead className="text-center">Активна</TableHead>
              <TableHead className="w-24">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links?.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Нет социальных ссылок
                </TableCell>
              </TableRow>
            )}
            {links?.map((link) => (
              <TableRow key={link.id}>
                <TableCell>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  {link.icon_url ? (
                    <img
                      src={link.icon_url}
                      alt={link.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{link.name}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {link.url}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={link.show_in_header}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({ id: link.id, show_in_header: checked })
                    }
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={link.show_in_footer}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({ id: link.id, show_in_footer: checked })
                    }
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={link.show_in_floating}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({ id: link.id, show_in_floating: checked })
                    }
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={link.is_active}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({ id: link.id, is_active: checked })
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(link)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteLink(link)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Редактировать ссылку" : "Добавить ссылку"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="WhatsApp"
              />
            </div>

            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://wa.me/79181790056"
              />
            </div>

            <div className="space-y-2">
              <Label>Иконка</Label>
              <div className="flex items-center gap-3">
                {formData.icon_url && (
                  <img
                    src={formData.icon_url}
                    alt="Preview"
                    className="h-12 w-12 rounded object-cover border"
                  />
                )}
                <div className="flex-1">
                  <Input
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    placeholder="URL иконки или загрузите файл"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                    id="icon-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isUploading}
                    onClick={() => document.getElementById("icon-upload")?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Порядок сортировки</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>В шапке</Label>
                <Switch
                  checked={formData.show_in_header}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, show_in_header: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>В подвале</Label>
                <Switch
                  checked={formData.show_in_footer}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, show_in_footer: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>В виджете</Label>
                <Switch
                  checked={formData.show_in_floating}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, show_in_floating: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Активна</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingLink ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteLink} onOpenChange={() => setDeleteLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить ссылку?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить "{deleteLink?.name}"? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
