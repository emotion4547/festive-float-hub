import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, Check, X, MessageSquare } from "lucide-react";
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

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

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
        {/* Filter */}
        <Card>
          <CardContent className="p-4">
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
