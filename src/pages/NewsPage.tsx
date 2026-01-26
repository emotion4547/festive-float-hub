import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageContent } from "@/contexts/SiteDataContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const NewsPage = () => {
  const pageContent = usePageContent("news");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("id, title, slug, excerpt, image_url, published_at, created_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex gap-8">
          <Sidebar />
          
          <main className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {pageContent.main_title?.title || "НОВОСТИ НАШЕЙ КОМПАНИИ"}
            </h1>
            
            {pageContent.description?.content && (
              <p className="text-muted-foreground mb-8">{pageContent.description.content}</p>
            )}

            {/* News List */}
            {loading ? (
              <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-6 bg-background rounded-xl overflow-hidden shadow-sm border">
                    <Skeleton className="w-64 h-48" />
                    <div className="py-4 pr-4 flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                Пока нет опубликованных новостей
              </div>
            ) : (
              <div className="space-y-8">
                {articles.map((article) => {
                  const publishDate = article.published_at || article.created_at;
                  return (
                    <article key={article.id} className="flex gap-6 bg-background rounded-xl overflow-hidden shadow-sm border">
                      <Link to={`/news/${article.slug}`} className="shrink-0">
                        <img 
                          src={article.image_url || "https://placehold.co/600x400?text=📰"} 
                          alt={article.title}
                          className="w-64 h-48 object-cover hover:scale-105 transition-transform"
                        />
                      </Link>
                      <div className="py-4 pr-4 flex-1">
                        <Link to={`/news/${article.slug}`}>
                          <h2 className="font-heading text-xl font-bold mb-2 hover:text-primary transition-colors">
                            {article.title}
                          </h2>
                        </Link>
                        {article.excerpt && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(publishDate), "d MMMM yyyy", { locale: ru })}
                          </span>
                          <Link to={`/news/${article.slug}`} className="text-sm text-primary hover:underline">
                            Читать далее →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
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

export default NewsPage;
