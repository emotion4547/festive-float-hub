import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const NewsArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex gap-8">
            <Sidebar />
            <main className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </main>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-16">
            <h1 className="font-heading text-2xl font-bold mb-4">Статья не найдена</h1>
            <Button asChild>
              <Link to="/news">Вернуться к новостям</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const publishDate = article.published_at || article.created_at;

  return (
    <Layout>
      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Главная
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link to="/news" className="text-muted-foreground hover:text-foreground">
              Новости
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          <Sidebar />
          
          <main className="flex-1">
            <Button variant="ghost" className="mb-4 gap-2" asChild>
              <Link to="/news">
                <ArrowLeft className="h-4 w-4" />
                Назад к новостям
              </Link>
            </Button>

            <article>
              <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {article.title}
              </h1>

              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <Calendar className="h-4 w-4" />
                <time dateTime={publishDate}>
                  {format(new Date(publishDate), "d MMMM yyyy", { locale: ru })}
                </time>
              </div>

              {article.image_url && (
                <div className="rounded-xl overflow-hidden mb-8">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-auto max-h-[500px] object-cover"
                  />
                </div>
              )}

              {article.excerpt && (
                <p className="text-lg text-muted-foreground mb-6 font-medium">
                  {article.excerpt}
                </p>
              )}

              {article.content && (
                <div className="prose prose-lg max-w-none">
                  {article.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </article>
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

export default NewsArticlePage;
