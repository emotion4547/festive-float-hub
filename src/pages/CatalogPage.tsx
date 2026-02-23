import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, ChevronRight } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 12;

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
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1);
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
      // Use category_id for reliable filtering instead of nested categories object
      result = result.filter(p => p.category_id === currentCategory.id);
    } else if (filters.categories.length > 0) {
      // filters.categories contains category IDs from the filter panel
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
      case "date-desc": // Сначала новые
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "date-asc": // Сначала старые
        result.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "name-asc": // от А до Я
        result.sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      case "name-desc": // от Я до А
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
        // Sort: with images first, then hits, then by rating
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

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset page when filters change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  // Generate structured data for SEO
  const breadcrumbItems = [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
    ...(currentCategory ? [{ name: currentCategory.name, url: `/catalog?category=${currentCategory.slug}` }] : []),
  ];

  const itemListSchema = generateItemListSchema(
    getPageTitle(),
    paginatedProducts.map(p => ({
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
            <p className="text-muted-foreground mt-1">{filteredProducts.length} товаров</p>
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
                      setCurrentPage(1);
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
                  setCurrentPage(1);
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
                  {paginatedProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
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
                    setCurrentPage(1);
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
