import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, Check, X, MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  content: string;
  status: string;
  created_at: string;
  products: {
    name: string;
  } | null;
}

interface Product {
  id: string;
  name: string;
}

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    product_id: "",
    author_name: "",
    rating: 5,
    title: "",
    content: "",
  });

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name")
      .order("name");
    setProducts(data || []);
  };

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from("reviews")
        .select(`
          id,
          author_name,
          rating,
          title,
          content,
          status,
          created_at,
          products (name)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleStatusChange = async (reviewId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ status: newStatus })
        .eq("id", reviewId);

      if (error) throw error;

      toast({
        title: newStatus === "approved" ? "Отзыв одобрен" : "Отзыв отклонён",
      });
      fetchReviews();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус",
      });
    }
  };

  const handleCreateReview = async () => {
    if (!formData.product_id || !formData.author_name || !formData.content) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: formData.product_id,
        author_name: formData.author_name.trim(),
        rating: formData.rating,
        title: formData.title.trim() || null,
        content: formData.content.trim(),
        status: "approved", // Сразу одобряем, т.к. это ручное добавление
        user_id: null, // Нет привязки к пользователю
      });

      if (error) throw error;

      toast({ title: "Отзыв добавлен" });
      setIsDialogOpen(false);
      setFormData({
        product_id: "",
        author_name: "",
        rating: 5,
        title: "",
        content: "",
      });
      fetchReviews();
    } catch (error) {
      console.error("Error creating review:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить отзыв",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Отзывы">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Отзывы">
      <div className="space-y-4">
        {/* Filter & Add Button */}
        <Card>
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="approved">Одобренные</SelectItem>
                <SelectItem value="rejected">Отклонённые</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить отзыв
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Добавить отзыв вручную</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Товар *</Label>
                    <Select
                      value={formData.product_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, product_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите товар" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Имя автора *</Label>
                    <Input
                      id="author"
                      value={formData.author_name}
                      onChange={(e) =>
                        setFormData({ ...formData, author_name: e.target.value })
                      }
                      placeholder="Введите имя"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Рейтинг *</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: star })
                          }
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= formData.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Краткий заголовок (необязательно)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Текст отзыва *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Введите текст отзыва"
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleCreateReview}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Добавить отзыв
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Отзывы не найдены</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Автор</TableHead>
                    <TableHead>Товар</TableHead>
                    <TableHead>Рейтинг</TableHead>
                    <TableHead className="max-w-xs">Отзыв</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-24">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(review.created_at), "dd.MM.yyyy", {
                          locale: ru,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {review.author_name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.products?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {review.title && (
                          <p className="font-medium">{review.title}</p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            review.status === "approved"
                              ? "default"
                              : review.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {review.status === "approved"
                            ? "Одобрен"
                            : review.status === "rejected"
                            ? "Отклонён"
                            : "На модерации"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {review.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleStatusChange(review.id, "approved")
                              }
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleStatusChange(review.id, "rejected")
                              }
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
