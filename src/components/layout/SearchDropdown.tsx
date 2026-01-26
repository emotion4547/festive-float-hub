import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Search, Package, Newspaper, FileText, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  type: "product" | "page" | "news";
  url: string;
  image?: string;
  price?: number;
}

interface SearchDropdownProps {
  query: string;
  onClose: () => void;
}

const pageResults: SearchResult[] = [
  { id: "delivery", title: "Доставка", type: "page", url: "/delivery" },
  { id: "payment", title: "Оплата", type: "page", url: "/payment" },
  { id: "contacts", title: "Контакты", type: "page", url: "/contacts" },
  { id: "corporate", title: "Корпоративы", type: "page", url: "/corporate" },
  { id: "printing", title: "Печать на шарах", type: "page", url: "/printing" },
  { id: "reviews", title: "Отзывы", type: "page", url: "/reviews" },
  { id: "warranty", title: "Гарантия и возврат", type: "page", url: "/about/warranty" },
  { id: "privacy", title: "Политика конфиденциальности", type: "page", url: "/about/privacy" },
  { id: "offer", title: "Публичная оферта", type: "page", url: "/about/offer" },
  { id: "partners", title: "Партнёры", type: "page", url: "/about/partners" },
  { id: "news", title: "Новости", type: "page", url: "/news" },
];

export function SearchDropdown({ query, onClose }: SearchDropdownProps) {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const searchItems = async () => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Search products
        const { data: products } = await supabase
          .from("products")
          .select("id, name, images, price")
          .ilike("name", `%${query}%`)
          .limit(5);

        const productResults: SearchResult[] = (products || []).map((p) => ({
          id: p.id,
          title: p.name,
          type: "product" as const,
          url: `/product/${p.id}`,
          image: p.images?.[0],
          price: p.price,
        }));

        // Search pages by title
        const matchingPages = pageResults.filter((page) =>
          page.title.toLowerCase().includes(query.toLowerCase())
        );

        // Combine results
        setResults([...productResults, ...matchingPages.slice(0, 3)]);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchItems, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleResultClick = (url: string) => {
    navigate(url);
    onClose();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "товар";
      case "page":
        return "страница";
      case "news":
        return "новость";
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />;
      case "page":
        return <FileText className="h-4 w-4" />;
      case "news":
        return <Newspaper className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!query.trim() || query.length < 2) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Ничего не найдено по запросу "{query}"</p>
        </div>
      ) : (
        <div className="py-2">
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result.url)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
            >
              {result.image ? (
                <img
                  src={result.image}
                  alt={result.title}
                  className="w-10 h-10 rounded-md object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                  {getTypeIcon(result.type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{result.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                    {getTypeLabel(result.type)}
                  </span>
                  {result.price && (
                    <span className="font-semibold text-primary">
                      {result.price.toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
          <div className="border-t mt-2 pt-2 px-4">
            <Button
              variant="ghost"
              className="w-full justify-center text-primary"
              onClick={() => {
                navigate(`/catalog?search=${encodeURIComponent(query)}`);
                onClose();
              }}
            >
              Показать все результаты
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
