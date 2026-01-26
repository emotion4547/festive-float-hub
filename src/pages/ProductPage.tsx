import { useState } from "react";
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
  RefreshCw,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const product = products.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Товар не найден</h1>
          <Link to="/" className="text-primary hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </Layout>
    );
  }

  const isProductFavorite = isFavorite(product.id);
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.occasion.some((o) => product.occasion.includes(o)))
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
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
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex items-center gap-2">
                {product.isNew && <span className="badge-new">Новое</span>}
                {product.isHit && <span className="badge-hit">Хит</span>}
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
                        i < Math.floor(product.rating)
                          ? "fill-accent-yellow text-accent-yellow"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <Link to="#reviews" className="text-primary hover:underline">
                  {product.reviewsCount} отзывов
                </Link>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {product.price.toLocaleString("ru-RU")} ₽
                </span>
                {product.oldPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {product.oldPrice.toLocaleString("ru-RU")} ₽
                    </span>
                    <span className="bg-error text-error-foreground text-sm font-semibold px-2 py-0.5 rounded">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.inStock ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-success font-medium">В наличии</span>
                  </>
                ) : product.onOrder ? (
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
              <p className="text-muted-foreground">{product.description}</p>

              {/* Characteristics */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Тип:</span>
                  <span className="font-medium">
                    {product.type === "helium" && "Гелиевые"}
                    {product.type === "latex" && "Латексные"}
                    {product.type === "foil" && "Фольгированные"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Размер:</span>
                  <span className="font-medium">{product.size}</span>
                </div>
                {product.balloonCount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Кол-во шаров:</span>
                    <span className="font-medium">{product.balloonCount} шт</span>
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
                  disabled={!product.inStock && !product.onOrder}
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
                  onClick={() => toggleFavorite(product)}
                >
                  <Heart
                    className={cn("h-5 w-5 mr-2", isProductFavorite && "fill-current")}
                  />
                  {isProductFavorite ? "В избранном" : "В избранное"}
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <span>Доставка 1-2 дня</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-primary shrink-0" />
                  <span>Гарантия качества</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCw className="h-5 w-5 text-primary shrink-0" />
                  <span>Возврат 14 дней</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12 section-alt">
        <div className="container">
          <Tabs defaultValue="description" className="max-w-4xl">
            <TabsList className="mb-8">
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="delivery">Доставка и оплата</TabsTrigger>
              <TabsTrigger value="reviews" id="reviews">
                Отзывы ({product.reviewsCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="bg-background rounded-xl p-6">
              <div className="prose max-w-none">
                <p>{product.description}</p>
                <h3>Характеристики набора:</h3>
                <ul>
                  <li>Тип шаров: {product.type === "helium" ? "Гелиевые" : product.type === "latex" ? "Латексные" : "Фольгированные"}</li>
                  <li>Размер: {product.size === "S" ? "Маленький" : product.size === "M" ? "Средний" : "Большой"}</li>
                  {product.balloonCount && <li>Количество: {product.balloonCount} шт</li>}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="bg-background rounded-xl p-6">
              <div className="prose max-w-none">
                <h3>Способы доставки:</h3>
                <ul>
                  <li><strong>Курьер по Санкт-Петербургу</strong> — 200₽ (бесплатно от 5000₽)</li>
                  <li><strong>Самовывоз</strong> — бесплатно</li>
                </ul>
                <h3>Способы оплаты:</h3>
                <ul>
                  <li>Банковская карта (Visa, MasterCard)</li>
                  <li>СбербанкОнлайн</li>
                  <li>Наличными при получении</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="bg-background rounded-xl p-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Отзывы загружаются...
                </p>
                <Button variant="outline">Написать отзыв</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16">
          <div className="container">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">
              Похожие товары
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductPage;
