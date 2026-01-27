import { useState, useMemo, useEffect, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Truck, 
  Clock, 
  Shield, 
  Sparkles, 
  ChevronRight,
  Star,
  ChevronLeft,
  SlidersHorizontal
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { CallbackFormDialog } from "@/components/CallbackFormDialog";
import { QuickViewDialog } from "@/components/products/QuickViewDialog";
import { DynamicFilterSidebar, FilterState } from "@/components/products/DynamicFilterSidebar";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AgendaSection } from "@/components/home/AgendaSection";

// Lazy load ShaderGradient for performance
const ShaderGradientCanvas = lazy(() => 
  import("shadergradient").then(mod => ({ default: mod.ShaderGradientCanvas }))
);
const ShaderGradient = lazy(() => 
  import("shadergradient").then(mod => ({ default: mod.ShaderGradient }))
);

const features = [
  {
    icon: Sparkles,
    title: "Свежие шары",
    description: "Гарантия качества материалов и свежести гелия",
  },
  {
    icon: Truck,
    title: "Быстрая доставка",
    description: "Доставим за 24-48 часов по всему городу",
  },
  {
    icon: Clock,
    title: "Работаем ежедневно",
    description: "Принимаем заказы 7 дней в неделю",
  },
  {
    icon: Shield,
    title: "Гарантия возврата",
    description: "Вернем деньги если что-то пойдет не так",
  },
];

const faqItems = [
  {
    question: "Как быстро вы доставляете?",
    answer: "Мы доставляем заказы по Краснодару в течение 2-4 часов. Срочная доставка возможна в день заказа при оформлении до 18:00.",
  },
  {
    question: "Сколько стоит доставка?",
    answer: "Стоимость доставки курьером по Краснодару составляет 200₽. При заказе от 5000₽ доставка бесплатная. Самовывоз бесплатный.",
  },
  {
    question: "Можно ли заказать в последний момент?",
    answer: "Да! Мы принимаем срочные заказы. Свяжитесь с нами по телефону или в мессенджерах для уточнения возможности срочной доставки.",
  },
  {
    question: "Как оплачивать?",
    answer: "Мы принимаем оплату картами Visa/MasterCard, через СбербанкОнлайн, а также наличными при получении.",
  },
  {
    question: "Что делать если шары сдулись?",
    answer: "Все наши шары имеют гарантию свежести. Если шары сдулись раньше обещанного срока, мы бесплатно заменим их или вернем деньги.",
  },
];

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
}

// Number of products per row and max rows on homepage
const PRODUCTS_PER_ROW = 4;
const MAX_ROWS = 2;
const MAX_PRODUCTS = PRODUCTS_PER_ROW * MAX_ROWS;

const defaultFilters: FilterState = {
  priceRange: [300, 15000],
  types: [],
  occasions: [],
  sizes: [],
  colors: [],
  categories: [],
  inStock: null,
};

const Index = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { toast } = useToast();
  
  // Load products from database
  const { products, loading: productsLoading } = useProducts({});
  const { categories, loading: categoriesLoading } = useCategories();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Load banners
  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setBanners(data || []);
    };
    fetchBanners();
  }, []);

  // Load reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3);
      setReviews(data || []);
    };
    fetchReviews();
  }, []);

  // Banner auto-rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Filter and sort products
  const displayProducts = useMemo(() => {
    let result = [...products];

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
      if (filters.categories.length > 0 && product.category_id && !filters.categories.includes(product.category_id)) {
        return false;
      }
      if (filters.inStock === true && !product.in_stock) {
        return false;
      }
      return true;
    });

    // Sort: products with images first
    result.sort((a, b) => {
      const aHasImage = a.images && a.images.length > 0 && a.images[0];
      const bHasImage = b.images && b.images.length > 0 && b.images[0];
      if (aHasImage && !bHasImage) return -1;
      if (!aHasImage && bHasImage) return 1;
      // Then by popularity (rating * reviews_count)
      return ((b.rating || 0) * (b.reviews_count || 0)) - ((a.rating || 0) * (a.reviews_count || 0));
    });

    return result.slice(0, MAX_PRODUCTS);
  }, [products, filters]);

  // Get product image for category
  const getCategoryImage = (categoryId: string) => {
    const categoryProduct = products.find(p => 
      p.category_id === categoryId && p.images && p.images.length > 0 && p.images[0]
    );
    return categoryProduct?.images?.[0] || null;
  };

  const currentBanner = banners[currentBannerIndex];

  return (
    <Layout>
      <SEOHead
        title="Воздушные шары с доставкой"
        description="Радуга Праздника — воздушные шары с доставкой по Краснодару. Более 1000 композиций на любой праздник. Доставка от 2 часов. Гарантия свежести!"
        keywords="воздушные шары Краснодар, шары с доставкой, шарики на праздник, гелиевые шары, фольгированные шары"
        canonicalPath="/"
      />
      {/* Hero Section with Animated Gradient */}
      <section className="relative overflow-hidden min-h-[400px] md:min-h-[480px]">
        {/* Shader Gradient Background - or static gradient if reduced motion */}
        <div className="absolute inset-0 z-0">
          {prefersReducedMotion ? (
            <div className="absolute inset-0 gradient-hero" />
          ) : (
            <Suspense fallback={<div className="absolute inset-0 gradient-hero" />}>
              <ShaderGradientCanvas
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <ShaderGradient
                  animate="on"
                  brightness={1.1}
                  cAzimuthAngle={180}
                  cDistance={3.6}
                  cPolarAngle={90}
                  cameraZoom={1}
                  color1="#F9A8D4"
                  color2="#5BC5C8"
                  color3="#abfffc"
                  envPreset="city"
                  grain="on"
                  lightType="3d"
                  positionX={-1.4}
                  positionY={0}
                  positionZ={0}
                  reflection={0.1}
                  rotationX={0}
                  rotationY={10}
                  rotationZ={50}
                  type="plane"
                  uAmplitude={1}
                  uDensity={1.0}
                  uFrequency={4.5}
                  uSpeed={0.15}
                  uStrength={3.5}
                />
              </ShaderGradientCanvas>
            </Suspense>
          )}
        </div>

        <div className="container py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left section - Offer (2/3) */}
            <div className="lg:col-span-2">
              {currentBanner ? (
                <div className="relative h-full">
                  {/* Semi-transparent content container */}
                  <div className="h-full space-y-6 bg-background/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg flex flex-col justify-center">
                    <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                      {currentBanner.title}
                    </h1>
                    {currentBanner.subtitle && (
                      <p className="text-base md:text-lg text-muted-foreground">
                        {currentBanner.subtitle}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {currentBanner.link_url && (
                        <Button size="lg" className="btn-primary text-base px-6" asChild>
                          <Link to={currentBanner.link_url} className="flex items-center gap-2">
                            {currentBanner.link_text || "Подробнее"}
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      )}
                      <Button size="lg" variant="outline" className="text-base px-6" asChild>
                        <Link to="/contacts">Связаться с нами</Link>
                      </Button>
                    </div>
                    {/* Banner navigation */}
                    {banners.length > 1 && (
                      <div className="flex items-center gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                          onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex gap-2">
                          {banners.map((_, index) => (
                            <button
                              key={index}
                              className={`h-2 w-2 rounded-full transition-colors ${
                                index === currentBannerIndex ? "bg-primary" : "bg-background/60"
                              }`}
                              onClick={() => setCurrentBannerIndex(index)}
                            />
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                          onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full space-y-6 bg-background/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-lg flex flex-col justify-center">
                  <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    <span className="block">Воздушные шары</span>
                    <span className="gradient-text">с доставкой</span> по&nbsp;Краснодару
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground">
                    Более 1000 композиций на любой праздник. Доставка от 2 часов. Гарантия свежести!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" className="btn-primary text-base px-6" asChild>
                      <Link to="/catalog" className="flex items-center gap-2">
                        Выбрать шары
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                    <CallbackFormDialog
                      trigger={
                        <Button size="lg" variant="outline" className="text-base px-6">
                          Заказать звонок
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right section - Agenda (1/3) */}
            <div className="lg:col-span-1">
              <div className="h-full bg-background/80 backdrop-blur-md rounded-2xl p-5 shadow-lg">
                <AgendaSection />
              </div>
            </div>
          </div>
        </div>
        
      </section>


      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Категории</h2>
            <Link
              to="/catalog"
              className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors font-medium"
            >
              Все категории
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((category) => {
                const productImage = getCategoryImage(category.id);
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
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : category.image ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl">{category.image}</span>
                        </div>
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
          )}
        </div>
      </section>

      {/* Products Catalog - Limited to 3 rows with Filters */}
      <section className="py-16 section-alt">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">Популярные товары</h2>
              <p className="text-muted-foreground mt-1">{displayProducts.length} из {products.length} товаров</p>
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
                      onFilterChange={setFilters}
                      onReset={() => setFilters(defaultFilters)}
                      showCategoryFilter={true}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Link
                to="/catalog"
                className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors font-medium"
              >
                Смотреть все
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-background rounded-xl p-6 shadow-sm border">
                <DynamicFilterSidebar
                  filters={filters}
                  onFilterChange={setFilters}
                  onReset={() => setFilters(defaultFilters)}
                  showCategoryFilter={true}
                />
              </div>
            </aside>

            {/* Products Grid - 3 rows max */}
            <div className="flex-1">
              {productsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(MAX_PRODUCTS)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-xl" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {displayProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onQuickView={setQuickViewProduct}
                    />
                  ))}
                </div>
              )}

              {/* Show More Button */}
              {products.length > MAX_PRODUCTS && (
                <div className="text-center mt-8">
                  <Button size="lg" asChild>
                    <Link to="/catalog" className="gap-2">
                      Показать больше
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-background shadow-sm"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              Отзывы наших клиентов
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Более 1000 довольных клиентов доверили нам свои праздники
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-background rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent-yellow text-accent-yellow" />
                  ))}
                </div>
                <p className="text-foreground mb-4">{review.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{review.author_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 section-alt">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                Часто задаваемые вопросы
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-background rounded-xl px-6 border-none shadow-sm"
                >
                  <AccordionTrigger className="font-heading font-medium text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              Подпишитесь на новости
            </h2>
            <p className="text-muted-foreground mb-8">
              Получайте информацию о новых товарах и специальных предложениях первыми
            </p>
            <form 
              className="flex gap-4 max-w-md mx-auto"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newsletterEmail.trim()) {
                  toast({
                    title: "Введите email",
                    description: "Пожалуйста, введите ваш email адрес",
                    variant: "destructive",
                  });
                  return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(newsletterEmail)) {
                  toast({
                    title: "Некорректный email",
                    description: "Пожалуйста, введите корректный email адрес",
                    variant: "destructive",
                  });
                  return;
                }
                
                setNewsletterLoading(true);
                try {
                  const { error } = await supabase
                    .from("newsletter_subscribers")
                    .insert({ email: newsletterEmail.trim().toLowerCase() });
                  
                  if (error) {
                    if (error.code === "23505") {
                      toast({
                        title: "Вы уже подписаны",
                        description: "Этот email уже есть в нашей базе подписчиков",
                      });
                    } else {
                      throw error;
                    }
                  } else {
                    toast({
                      title: "Успешно!",
                      description: "Вы подписались на нашу рассылку",
                    });
                    setNewsletterEmail("");
                  }
                } catch (err) {
                  toast({
                    title: "Ошибка",
                    description: "Не удалось подписаться. Попробуйте позже.",
                    variant: "destructive",
                  });
                } finally {
                  setNewsletterLoading(false);
                }
              }}
            >
              <Input
                type="email"
                placeholder="Ваш email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1"
                disabled={newsletterLoading}
              />
              <Button 
                type="submit" 
                className="btn-primary px-6"
                disabled={newsletterLoading}
              >
                {newsletterLoading ? "..." : "Подписаться"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </Layout>
  );
};

export default Index;
