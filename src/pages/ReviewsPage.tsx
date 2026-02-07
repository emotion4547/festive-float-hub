import { Layout } from "@/components/layout/Layout";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SEOHead } from "@/components/SEOHead";
import { useReviews } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "react-router-dom";

const ReviewsPage = () => {
  const { reviews, loading, error } = useReviews({ status: "approved" });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: ru });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <SEOHead
        title="Отзывы клиентов"
        description="Отзывы клиентов о магазине воздушных шаров Радуга Праздника. Читайте реальные отзывы покупателей."
        keywords="отзывы о магазине шаров, отзывы Радуга Праздника, отзывы о доставке шаров Краснодар"
        canonicalPath="/reviews"
      />
      <div className="container py-8">
        <div className="flex gap-8">
          
          <main className="flex-1">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-secondary/30 to-primary/30">
              <div className="p-8 md:p-12">
                <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                  ОТЗЫВЫ
                </h1>
                <p className="text-lg text-muted-foreground">
                  Что говорят наши клиенты о нас
                </p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop" 
                alt="Отзывы"
                className="absolute right-0 top-0 h-full w-1/3 object-cover hidden md:block"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {reviews.length > 0 
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : "5.0"
                  }
                </div>
                <div className="flex justify-center gap-0.5 my-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Средний рейтинг</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">{reviews.length}</div>
                <div className="text-sm text-muted-foreground mt-2">Отзывов</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {reviews.length > 0 
                    ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)
                    : 100
                  }%
                </div>
                <div className="text-sm text-muted-foreground mt-2">Довольных клиентов</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground mt-2">Заказов выполнено</div>
              </div>
            </div>

            {/* Write Review Button */}
            <div className="flex justify-end mb-6">
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <MessageCircle className="h-4 w-4 mr-2" />
                Оставить отзыв
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-background rounded-xl p-6 shadow-sm border">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">Ошибка загрузки отзывов</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && reviews.length === 0 && (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Пока нет отзывов</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Будьте первым, кто оставит отзыв!
                </p>
              </div>
            )}

            {/* Reviews List */}
            {!loading && !error && reviews.length > 0 && (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-background rounded-xl p-6 shadow-sm border">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(review.author_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{review.author_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatDate(review.created_at)}</span>
                              {review.products && (
                                <>
                                  <span>•</span>
                                  <Link 
                                    to={`/product/${review.products.id}`}
                                    className="text-primary hover:underline"
                                  >
                                    {review.products.name}
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? "fill-accent-yellow text-accent-yellow" : "text-muted"}`} 
                              />
                            ))}
                          </div>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-medium mb-2">{review.title}</h4>
                        )}
                        
                        <p className="text-foreground mb-4">{review.content}</p>
                        
                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mb-4 flex-wrap">
                            {review.images.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img}
                                alt={`Фото отзыва ${idx + 1}`}
                                className="h-20 w-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Полезно</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <div className="hidden xl:block w-64 shrink-0">
            <SidebarWidgets />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReviewsPage;
