import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
}

export function AgendaSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, image_url, start_date, end_date")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(4);

      if (!error && data) {
        // Filter collections that are currently active (within date range or no dates set)
        const activeCollections = data.filter((c) => {
          if (!c.start_date && !c.end_date) return true;
          if (c.start_date && c.end_date) {
            return isWithinInterval(new Date(), {
              start: parseISO(c.start_date),
              end: parseISO(c.end_date),
            });
          }
          if (c.start_date && !c.end_date) {
            return new Date() >= parseISO(c.start_date);
          }
          if (!c.start_date && c.end_date) {
            return new Date() <= parseISO(c.end_date);
          }
          return true;
        });
        setCollections(activeCollections);
      }
      setLoading(false);
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 bg-muted/50 rounded animate-pulse w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Скоро здесь появятся подборки</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        На повестке дня
      </h3>
      <div className="space-y-2">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            to={`/collection/${collection.slug}`}
            className="group flex items-center gap-3 p-2.5 rounded-lg bg-background/60 hover:bg-background/80 transition-all border border-border/50 hover:border-primary/30"
          >
            {collection.image_url ? (
              <img
                src={collection.image_url}
                alt={collection.name}
                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-md flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {collection.name}
              </p>
              {collection.end_date && (
                <p className="text-xs text-muted-foreground">
                  до {format(parseISO(collection.end_date), "d MMMM", { locale: ru })}
                </p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
