import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { QuickViewDialog } from "@/components/products/QuickViewDialog";
import { DynamicFilterSidebar, FilterState } from "@/components/products/DynamicFilterSidebar";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";
import { generateBreadcrumbSchema, generateItemListSchema } from "@/lib/seoSchemas";

const VISIBLE_STEPS = [50, 100, 500, 1000, Infinity] as const;

const defaultFilters: FilterState = {
  priceRange: [300, 15000],
  types: [],
  occasions: [],
  sizes: [],
  colors: [],
  categories: [],
  inStock: null,
};

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");
  const filterParam = searchParams.get("filter");
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "popular";
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [visibleStepIndex, setVisibleStepIndex] = useState(0);

  const handleSortChange = (val: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val === "popular") {
        next.delete("sort");
      } else {
        next.set("sort", val);
      }
      return next;
    }, { replace: true });
    setVisibleStepIndex(0);
  };
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  
  const { products, loading: productsLoading } = useProducts({});
  const { categories } = useCategories();

  // Find current category
  const currentCategory = categories.find(c => c.slug === categorySlug);

  // Get page title based on filter
  const getPageTitle = () => {
    if (searchQuery) return `Результаты поиска: "${searchQuery}"`;
    if (currentCategory) return currentCategory.name;
    switch (filterParam) {
      case "hits": return "Хиты продаж";
      case "sale": return "Товары со скидкой";
      case "new": return "Новинки";
      case "budget": return "Бюджетные варианты";
      default: return "Каталог товаров";
    }
  };

  // Get SEO description based on filter/category
  const getSEODescription = () => {
    if (currentCategory) return `${currentCategory.name} - воздушные шары с доставкой по Краснодару. Большой выбор, гарантия свежести, доставка от 2 часов.`;
    switch (filterParam) {
      case "hits": return "Самые популярные воздушные шары в Краснодаре. Хиты продаж с доставкой от 2 часов.";
      case "sale": return "Воздушные шары со скидкой в Краснодаре. Выгодные предложения с доставкой.";
      case "new": return "Новые поступления воздушных шаров в Краснодаре. Свежие композиции с доставкой.";
      case "budget": return "Недорогие воздушные шары до 3000₽ в Краснодаре. Бюджетные варианты с доставкой.";
      default: return "Каталог воздушных шаров в Краснодаре. Более 1000 композиций на любой праздник с доставкой от 2 часов.";
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply text search from URL parameter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        if (p.keywords && p.keywords.some((k: string) => k.toLowerCase().includes(q))) return true;
        if (p.name.toLowerCase().includes(q)) return true;
        if (p.description && p.description.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    // Apply quick filter from URL parameter
    if (filterParam === "hits") {
      result = result.filter(p => p.is_hit);
    } else if (filterParam === "sale") {
      result = result.filter(p => p.discount && p.discount > 0);
    } else if (filterParam === "new") {
      result = result.filter(p => p.is_new);
    } else if (filterParam === "budget") {
      result = result.filter(p => p.price <= 3000);
    }

    // Filter by category from URL or filter panel
    if (categorySlug && currentCategory) {
      result = result.filter(p => p.category_id === currentCategory.id);
    } else if (filters.categories.length > 0) {
      result = result.filter(p => {
        if (!p.category_id) return false;
        return filters.categories.includes(p.category_id);
      });
    }

    // Apply filters
    result = result.filter((product) => {
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      if (filters.types.length > 0 && product.type && !filters.types.includes(product.type)) {
        return false;
      }
      if (filters.occasions.length > 0 && product.occasion && !product.occasion.some((o) => filters.occasions.includes(o))) {
        return false;
      }
      if (filters.sizes.length > 0 && product.size && !filters.sizes.includes(product.size)) {
        return false;
      }
      if (filters.colors.length > 0 && product.colors && !product.colors.some((c) => filters.colors.includes(c))) {
        return false;
      }
      if (filters.inStock === true && !product.in_stock) {
        return false;
      }
      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case "date-desc":
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "date-asc":
        result.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name, "ru"));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
      default:
        result.sort((a, b) => {
          const aHasImage = a.images && a.images.length > 0 && a.images[0] ? 1 : 0;
          const bHasImage = b.images && b.images.length > 0 && b.images[0] ? 1 : 0;
          if (aHasImage !== bHasImage) return bHasImage - aHasImage;
          const aHit = a.is_hit ? 1 : 0;
          const bHit = b.is_hit ? 1 : 0;
          if (aHit !== bHit) return bHit - aHit;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
    }

    return result;
  }, [products, filters, sortBy, categorySlug, filterParam, currentCategory, searchQuery]);

  // Progressive pagination
  const currentLimit = VISIBLE_STEPS[visibleStepIndex];
  const visibleProducts = useMemo(() => {
    if (currentLimit === Infinity) return filteredProducts;
    return filteredProducts.slice(0, currentLimit);
  }, [filteredProducts, currentLimit]);

  const totalCount = filteredProducts.length;
  const showingAll = currentLimit === Infinity || currentLimit >= totalCount;
  const isAtFirstStep = visibleStepIndex === 0;

  // Find the next meaningful step (skip steps that don't add more products)
  const canShowMore = !showingAll;
  const canShowLess = visibleStepIndex > 0;

  const getNextStepLabel = () => {
    if (!canShowMore) return "";
    const nextIndex = visibleStepIndex + 1;
    const nextStep = VISIBLE_STEPS[nextIndex];
    if (nextStep === Infinity) return "Показать все";
    return `Показать ${nextStep}`;
  };

  const getPrevStepLabel = () => {
    if (!canShowLess) return "";
    const prevIndex = visibleStepIndex - 1;
    const prevStep = VISIBLE_STEPS[prevIndex];
    return `Свернуть до ${prevStep}`;
  };

  const handleShowMore = () => {
    if (visibleStepIndex < VISIBLE_STEPS.length - 1) {
      setVisibleStepIndex(visibleStepIndex + 1);
    }
  };

  const handleShowLess = () => {
    if (visibleStepIndex > 0) {
      setVisibleStepIndex(visibleStepIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset step when filters change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setVisibleStepIndex(0);
  };

  // Generate structured data for SEO
  const breadcrumbItems = [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
    ...(currentCategory ? [{ name: currentCategory.name, url: `/catalog?category=${currentCategory.slug}` }] : []),
  ];

  const itemListSchema = generateItemListSchema(
    getPageTitle(),
    visibleProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0],
    }))
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      generateBreadcrumbSchema(breadcrumbItems),
      itemListSchema,
    ],
  };

  const visibleCount = visibleProducts.length;

  return (
    <Layout>
      <SEOHead
        title={getPageTitle()}
        description={getSEODescription()}
        keywords={`воздушные шары ${getPageTitle().toLowerCase()}, шары Краснодар, доставка шаров, гелиевые шары`}
        canonicalPath={currentCategory ? `/catalog?category=${currentCategory.slug}` : '/catalog'}
        structuredData={structuredData}
      />
      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Главная
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              {getPageTitle()}
            </span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">
              {getPageTitle()}
            </h1>
            <p className="text-muted-foreground mt-1">
              {showingAll
                ? `${totalCount} товаров`
                : `Показано ${visibleCount} из ${totalCount} товаров`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Фильтры
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <DynamicFilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={() => {
                      setFilters(defaultFilters);
                      setVisibleStepIndex(0);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">По умолчанию</SelectItem>
                <SelectItem value="date-desc">Сначала новые</SelectItem>
                <SelectItem value="date-asc">Сначала старые</SelectItem>
                <SelectItem value="name-asc">от А до Я</SelectItem>
                <SelectItem value="name-desc">от Я до А</SelectItem>
                <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                <SelectItem value="price-desc">Сначала дороже</SelectItem>
                <SelectItem value="rating">По рейтингу</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-background rounded-xl p-6 shadow-sm border">
              <DynamicFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => {
                  setFilters(defaultFilters);
                  setVisibleStepIndex(0);
                }}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {productsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {visibleProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>

                {/* Progressive Show More / Show Less */}
                {totalCount > VISIBLE_STEPS[0] && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                    {canShowLess && (
                      <Button
                        variant="outline"
                        onClick={handleShowLess}
                        className="gap-2"
                      >
                        <ChevronUp className="h-4 w-4" />
                        {getPrevStepLabel()}
                      </Button>
                    )}
                    {canShowMore && (
                      <Button
                        variant="default"
                        onClick={handleShowMore}
                        className="gap-2"
                      >
                        <ChevronDown className="h-4 w-4" />
                        {getNextStepLabel()}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {!productsLoading && filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  По вашим фильтрам ничего не найдено
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setVisibleStepIndex(0);
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Quick View Dialog */}
      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </Layout>
  );
};

export default CatalogPage;
