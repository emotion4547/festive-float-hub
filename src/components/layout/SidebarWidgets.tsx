import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Tag, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
}

export function SidebarWidgets() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const promoCode = "RADUGA";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("id, title, slug, image_url")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setNewsItems(data || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleCopyPromo = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      toast.success("Промокод скопирован!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <div className="space-y-6">
      {/* Promo Code Banner */}
      <Card className="bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 border-primary/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/20 rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/10 rounded-tr-full" />
        <CardContent className="p-5 relative">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Скидка на первый заказ
              </p>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            
            <div className="bg-background/80 backdrop-blur rounded-xl py-3 px-4 mb-3 border border-primary/20">
              <div className="flex items-center justify-center gap-2">
                <Tag className="h-5 w-5 text-secondary" />
                <span className="text-2xl font-bold tracking-wider text-foreground">{promoCode}</span>
              </div>
            </div>
            
            <div className="text-4xl font-bold text-primary mb-1">-10%</div>
            <p className="text-sm text-muted-foreground mb-4">на ваш первый заказ</p>
            
            <Button 
              onClick={handleCopyPromo}
              variant="secondary"
              className="w-full gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Скопировать код
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 mb-3 border-b pb-3">
            <span className="text-sm font-medium">Оплата</span>
            <span className="text-sm text-muted-foreground">Доставка</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <img src="https://cdn.svgporn.com/logos/mastercard.svg" alt="Mastercard" className="h-6" />
            <img src="https://cdn.svgporn.com/logos/visa.svg" alt="Visa" className="h-6" />
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">МИР</span>
          </div>
          <Link to="/payment" className="text-sm text-primary hover:underline mt-3 block">
            Подробнее &gt;
          </Link>
        </CardContent>
      </Card>

      {/* News */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-heading font-semibold mb-4">Новости</h3>
          <div className="space-y-4">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-16 h-12 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </>
            ) : newsItems.length > 0 ? (
              newsItems.map((item) => (
                <Link key={item.id} to={`/news/${item.slug}`} className="flex gap-3 group">
                  <img
                    src={item.image_url || "https://placehold.co/150x100?text=📰"}
                    alt={item.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors line-clamp-3">
                    {item.title}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Новостей пока нет</p>
            )}
          </div>
          <Link to="/news" className="text-sm text-primary hover:underline mt-4 block">
            Все новости
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
