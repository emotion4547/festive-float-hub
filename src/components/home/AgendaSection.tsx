import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight, Gift } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
}

export function AgendaSection() {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, description, image_url, start_date, end_date")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(10);

      if (!error && data) {
        // Find first collection that is currently active
        const activeCollection = data.find((c) => {
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
        setCollection(activeCollection || null);
      }
      setLoading(false);
    };

    fetchCollection();
  }, []);

  if (loading) {
    return (
      <div className="h-full bg-muted/30 rounded-2xl animate-pulse" />
    );
  }

  if (!collection) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-2xl p-6">
        <Calendar className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm text-center">Скоро здесь появится праздничная подборка</p>
      </div>
    );
  }

  return (
    <Link
      to={`/collection/${collection.slug}`}
      className="group relative h-full flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent-yellow/5 border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg"
    >
      {/* Background Image */}
      {collection.image_url && (
        <div className="absolute inset-0">
          <img
            src={collection.image_url}
            alt={collection.name}
            className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 flex flex-col p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Gift className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            На повестке дня
          </span>
        </div>

        {/* Main Image */}
        {collection.image_url && (
          <div className="relative mb-4 rounded-xl overflow-hidden aspect-[4/3]">
            <img
              src={collection.image_url}
              alt={collection.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {collection.end_date && (
              <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-primary" />
                до {format(parseISO(collection.end_date), "d MMM", { locale: ru })}
              </div>
            )}
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-primary transition-colors">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {collection.description}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-medium text-primary mt-auto pt-3 border-t border-border/50">
          <span>Смотреть подборку</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
