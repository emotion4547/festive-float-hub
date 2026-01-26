import { Layout } from "@/components/layout/Layout";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const reviews = [
  {
    id: 1,
    name: "Анна Михайлова",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    date: "20 января 2026",
    text: "Заказывала шарики на день рождения дочери, очень понравилось! Курьер привез вовремя, шары были свежие и красивые. Дочка была в восторге! Обязательно закажем еще.",
    helpful: 12,
    source: "Яндекс",
  },
  {
    id: 2,
    name: "Дмитрий Козлов",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    date: "18 января 2026",
    text: "Отличный сервис! Заказывал набор на юбилей мамы. Все было просто идеально - от оформления заказа до доставки. Шары продержались больше недели!",
    helpful: 8,
    source: "2ГИС",
  },
  {
    id: 3,
    name: "Елена Сидорова",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    date: "15 января 2026",
    text: "Уже третий раз заказываю здесь шары для корпоративных мероприятий. Качество всегда на высоте, менеджеры очень отзывчивые. Рекомендую всем!",
    helpful: 15,
    source: "Google",
  },
  {
    id: 4,
    name: "Мария Петрова",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    rating: 5,
    date: "12 января 2026",
    text: "Заказали шары на выписку из роддома. Все прошло идеально! Курьер приехал заранее, шарики были очень красивые, яркие. Все родственники были в восторге. Спасибо огромное!🎈",
    helpful: 20,
    source: "Яндекс",
  },
  {
    id: 5,
    name: "Алексей Новиков",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    rating: 5,
    date: "10 января 2026",
    text: "Заказывал шары на гендер пати. Шар-сюрприз лопнул в нужный момент, конфетти было видно издалека. Эмоции непередаваемые! Фотографии получились потрясающие.",
    helpful: 18,
    source: "2ГИС",
  },
  {
    id: 6,
    name: "Ольга Васильева",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    rating: 4,
    date: "8 января 2026",
    text: "Хороший магазин, достойный ассортимент. Единственное - хотелось бы побольше вариантов для мальчиков. Но в целом осталась довольна покупкой!",
    helpful: 5,
    source: "Google",
  },
  {
    id: 7,
    name: "Павел Кузнецов",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    rating: 5,
    date: "5 января 2026",
    text: "Супер! Жена была в восторге от сюрприза. Шары простояли почти 2 недели. Очень качественные материалы. Буду рекомендовать друзьям.",
    helpful: 11,
    source: "Яндекс",
  },
  {
    id: 8,
    name: "Наталья Федорова",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
    rating: 5,
    date: "3 января 2026",
    text: "Заказывала фотозону из шаров на свадьбу. Ребята приехали заранее, все оформили очень красиво. Гости фотографировались весь вечер! Огромное спасибо!",
    helpful: 25,
    source: "2ГИС",
  },
];

const ReviewsPage = () => {
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex gap-8">
          <Sidebar />
          
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
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="flex justify-center gap-0.5 my-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-accent-yellow text-accent-yellow" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Средний рейтинг</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">1500+</div>
                <div className="text-sm text-muted-foreground mt-2">Отзывов</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary">98%</div>
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

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-background rounded-xl p-6 shadow-sm border">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.avatar} alt={review.name} />
                      <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{review.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{review.date}</span>
                            <span>•</span>
                            <span className="text-primary">{review.source}</span>
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
                      
                      <p className="text-foreground mb-4">{review.text}</p>
                      
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                          <span>Полезно ({review.helpful})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Показать ещё отзывы
              </Button>
            </div>
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
