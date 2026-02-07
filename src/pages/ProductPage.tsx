import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Star, 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/layout/Layout";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductReviews } from "@/components/products/ProductReviews";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  
  const { product, loading, error } = useProduct(id || "");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="bg-muted/30 py-4">
          <div className="container">
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Товар не найден</h1>
          <p className="text-muted-foreground mb-6">
            К сожалению, запрашиваемый товар не существует или был удалён
          </p>
          <Link to="/catalog" className="text-primary hover:underline">
            Перейти в каталог
          </Link>
        </div>
      </Layout>
    );
  }

  const isProductFavorite = isFavorite(product.id);
  const images = product.images || [];
  const videos = (product as any).videos || [];

  const handleAddToCart = () => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      inStock: product.in_stock,
      onOrder: product.on_order,
    };
    addItem(cartProduct as any, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    toast({
      title: "Добавлено в корзину",
      description: `${product.name} × ${quantity}`,
    });
  };

  const typeLabels: Record<string, string> = {
    helium: "Гелиевые",
    latex: "Латексные",
    foil: "Фольгированные",
  };

  const sizeLabels: Record<string, string> = {
    S: "Маленький",
    M: "Средний",
    L: "Большой",
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Главная
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/catalog" className="hover:text-primary transition-colors">
              Каталог
            </Link>
            {product.categories && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link 
                  to={`/catalog/${product.categories.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {product.categories.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <ProductGallery 
              images={images}
              videos={videos}
              liveCoverUrl={(product as any).live_cover_url}
              productName={product.name}
            />

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex items-center gap-2">
                {product.is_new && <span className="badge-new">Новое</span>}
                {product.is_hit && <span className="badge-hit">Хит</span>}
              </div>

              {/* Title */}
              <h1 className="font-heading text-3xl md:text-4xl font-bold">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.floor(product.rating || 0)
                          ? "fill-accent-yellow text-accent-yellow"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating || 0}</span>
                <a href="#reviews" className="text-primary hover:underline">
                  {product.reviews_count || 0} отзывов
                </a>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {product.price.toLocaleString("ru-RU")} ₽
                </span>
                {product.old_price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {product.old_price.toLocaleString("ru-RU")} ₽
                    </span>
                    <span className="bg-error text-error-foreground text-sm font-semibold px-2 py-0.5 rounded">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.in_stock ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-success font-medium">В наличии</span>
                  </>
                ) : product.on_order ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-warning" />
                    <span className="text-warning font-medium">На заказ — готово за 3 дня</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-error" />
                    <span className="text-error font-medium">Нет в наличии</span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Characteristics */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                {product.type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тип:</span>
                    <span className="font-medium">{typeLabels[product.type] || product.type}</span>
                  </div>
                )}
                {product.size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Размер:</span>
                    <span className="font-medium">{sizeLabels[product.size] || product.size}</span>
                  </div>
                )}
                {product.balloon_count && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Кол-во шаров:</span>
                    <span className="font-medium">{product.balloon_count} шт</span>
                  </div>
                )}
              </div>

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Цвета:</span>
                  <div className="flex gap-2">
                    {product.colors.map((color, index) => (
                      <div
                        key={index}
                        className="h-8 w-8 rounded-full border-2 border-muted"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Количество:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className={cn(
                    "flex-1 text-lg transition-all",
                    addedToCart ? "bg-success hover:bg-success" : "btn-primary"
                  )}
                  onClick={handleAddToCart}
                  disabled={!product.in_stock && !product.on_order}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Добавлено!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      В корзину
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "flex-1 text-lg",
                    isProductFavorite && "border-secondary text-secondary"
                  )}
                  onClick={() => toggleFavorite({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    images: product.images,
                  } as any)}
                >
                  <Heart
                    className={cn("h-5 w-5 mr-2", isProductFavorite && "fill-current")}
                  />
                  {isProductFavorite ? "В избранном" : "В избранное"}
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <span>Доставка от 1 часа</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-primary shrink-0" />
                  <span>Гарантия качества</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12 section-alt" id="reviews">
        <div className="container">
          <Tabs defaultValue="description" className="max-w-4xl">
            <TabsList className="mb-8">
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="delivery">Доставка и оплата</TabsTrigger>
              <TabsTrigger value="reviews">
                Отзывы ({product.reviews_count || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="bg-background rounded-xl p-6">
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{product.description || "Описание товара отсутствует."}</p>
                {(product.type || product.size || product.balloon_count) && (
                  <>
                    <h3>Характеристики набора:</h3>
                    <ul>
                      {product.type && (
                        <li>Тип шаров: {typeLabels[product.type] || product.type}</li>
                      )}
                      {product.size && (
                        <li>Размер: {sizeLabels[product.size] || product.size}</li>
                      )}
                      {product.balloon_count && (
                        <li>Количество: {product.balloon_count} шт</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="bg-background rounded-xl p-6">
              <div className="prose max-w-none">
                <h3>Способы доставки:</h3>
                <ul>
                  <li><strong>По Краснодару</strong> — от 500 ₽</li>
                  <li><strong>Самовывоз</strong> — бесплатно</li>
                </ul>
                <h3>Способы оплаты:</h3>
                <ul>
                  <li>Наличные</li>
                  <li>Банковская карта</li>
                  <li>По счёту (работаем с юр. лицами)</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="bg-background rounded-xl p-6">
              <ProductReviews productId={product.id} productName={product.name} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">
            Похожие товары
          </h2>
          <RelatedProducts 
            currentProductId={product.id} 
            categoryId={product.category_id} 
          />
        </div>
      </section>
    </Layout>
  );
};

export default ProductPage;
