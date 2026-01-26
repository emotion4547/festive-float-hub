import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Необходима авторизация",
        description: "Войдите, чтобы оставить отзыв",
      });
      return;
    }

    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Укажите оценку",
        description: "Выберите количество звёзд",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Напишите отзыв",
        description: "Текст отзыва не может быть пустым",
      });
      return;
    }

    setLoading(true);

    try {
      const authorName = user.email?.split("@")[0] || "Пользователь";
      
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        author_name: authorName,
        rating,
        title: title.trim() || null,
        content: content.trim(),
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Отзыв отправлен",
        description: "Ваш отзыв появится после модерации",
      });

      onSuccess();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отправить отзыв",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/30 rounded-xl p-6 space-y-4">
      <h3 className="font-heading font-semibold text-lg">Написать отзыв</h3>

      {/* Rating */}
      <div>
        <Label className="mb-2 block">Ваша оценка *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  star <= (hoverRating || rating)
                    ? "fill-accent-yellow text-accent-yellow"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="review-title">Заголовок (необязательно)</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Кратко опишите впечатление"
          maxLength={100}
        />
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="review-content">Ваш отзыв *</Label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Расскажите о своём опыте использования товара"
          rows={4}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {content.length}/2000 символов
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Отправить
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Отзыв будет опубликован после проверки модератором
      </p>
    </form>
  );
}
