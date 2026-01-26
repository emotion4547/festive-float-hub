import { useState } from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductReviews } from "@/hooks/useReviews";
import { ReviewForm } from "./ReviewForm";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { reviews, loading, refetch } = useProductReviews(productId);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-muted/30 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0
  }));

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-5xl font-bold">{averageRating}</span>
            <div className="flex flex-col items-start">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= Math.round(Number(averageRating))
                        ? "fill-accent-yellow text-accent-yellow"
                        : "text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length < 5 ? "отзыва" : "отзывов"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="w-3 text-sm">{rating}</span>
              <Star className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-yellow transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-sm text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      {user && !showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline">
          Написать отзыв
        </Button>
      )}

      {!user && (
        <p className="text-muted-foreground text-sm">
          <a href="/auth" className="text-primary hover:underline">Войдите</a>, чтобы оставить отзыв
        </p>
      )}

      {/* Review Form */}
      {showForm && user && (
        <ReviewForm
          productId={productId}
          onSuccess={() => {
            setShowForm(false);
            refetch();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Пока нет отзывов</p>
            <p className="text-sm mt-1">Будьте первым, кто оставит отзыв!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-muted/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium">{review.author_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "d MMMM yyyy", { locale: ru })}
                    </span>
                  </div>
                  <div className="flex mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating
                            ? "fill-accent-yellow text-accent-yellow"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}
                  <p className="text-muted-foreground whitespace-pre-wrap">{review.content}</p>
                  
                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Фото к отзыву ${idx + 1}`}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
