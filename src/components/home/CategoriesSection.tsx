import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DbProduct } from "@/hooks/useProducts";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface CategoriesSectionProps {
  categories: Category[];
  products: DbProduct[];
  loading: boolean;
  initialVisibleCount?: number;
}

export function CategoriesSection({ 
  categories, 
  products, 
  loading,
  initialVisibleCount = 6 
}: CategoriesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get product image for category
  const getCategoryImage = (categoryId: string) => {
    const categoryProduct = products.find(p => 
      p.category_id === categoryId && p.images && p.images.length > 0 && p.images[0]
    );
    return categoryProduct?.images?.[0] || null;
  };

  const visibleCategories = isExpanded 
    ? categories 
    : categories.slice(0, initialVisibleCount);

  const hasMoreCategories = categories.length > initialVisibleCount;

  if (loading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Категории</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/catalog" className="flex items-center gap-1">
              Перейти в каталог
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {visibleCategories.map((category) => {
              const productImage = category.image || getCategoryImage(category.id);
              return (
                <Link 
                  key={category.id} 
                  to={`/catalog?category=${category.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl">🎈</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-heading font-bold text-sm text-background group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {hasMoreCategories && (
            <>
              <CollapsibleContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                  {categories.slice(initialVisibleCount).map((category) => {
                    const productImage = category.image || getCategoryImage(category.id);
                    return (
                      <Link 
                        key={category.id} 
                        to={`/catalog?category=${category.slug}`}
                        className="group"
                      >
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt={category.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-5xl">🎈</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-heading font-bold text-sm text-background group-hover:text-primary transition-colors">
                              {category.name}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CollapsibleContent>

              <div className="flex justify-center mt-6">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    {isExpanded ? (
                      <>
                        Скрыть категории
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Показать все категории ({categories.length})
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </>
          )}
        </Collapsible>
      </div>
    </section>
  );
}