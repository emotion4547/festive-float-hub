import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Heart, ShoppingBag, ChevronRight, Truck, CreditCard, RefreshCw, X, Tag, Loader2, Ticket, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useCoupon } from "@/hooks/useCoupon";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import { cn } from "@/lib/utils";

const CartPage = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { addFavorite } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();
  const { coupon, isLoading: couponLoading, error: couponError, applyCoupon, removeCoupon, calculateDiscount } = useCoupon();
  const { 
    coupons: userCoupons, 
    selectedCoupon: selectedUserCoupon, 
    selectCoupon: selectUserCoupon,
    calculateDiscount: calculateUserCouponDiscount,
    applyGiftToCart 
  } = useUserCoupons();
  const [promoCode, setPromoCode] = useState("");
  const [showUserCoupons, setShowUserCoupons] = useState(false);
  const [couponNotificationShown, setCouponNotificationShown] = useState(false);

  // Show notification about unused coupons when entering cart
  useEffect(() => {
    if (user && userCoupons.length > 0 && items.length > 0 && !couponNotificationShown) {
      const discountCouponsCount = userCoupons.filter(c => c.prize_type === "discount").length;
      const giftCouponsCount = userCoupons.filter(c => c.prize_type === "gift").length;
      
      let description = "";
      if (discountCouponsCount > 0 && giftCouponsCount > 0) {
        description = `У вас ${discountCouponsCount} скидочных купона и ${giftCouponsCount} подарка. Не забудьте применить их!`;
      } else if (discountCouponsCount > 0) {
        description = `У вас ${discountCouponsCount} неиспользованных купона на скидку. Примените их к заказу!`;
      } else if (giftCouponsCount > 0) {
        description = `У вас ${giftCouponsCount} подарка от Колеса Фортуны! Добавьте их в корзину.`;
      }

      if (description) {
        toast({
          title: "🎁 У вас есть купоны!",
          description,
          duration: 7000,
        });
        setCouponNotificationShown(true);
        setShowUserCoupons(true);
      }
    }
  }, [user, userCoupons, items.length, couponNotificationShown, toast]);

  // Calculate discounts
  const adminCouponDiscount = coupon ? calculateDiscount(total) : 0;
  const userCouponDiscount = selectedUserCoupon ? calculateUserCouponDiscount(total) : 0;
  const discount = adminCouponDiscount + userCouponDiscount;
  
  const deliveryCost = total >= 5000 ? 0 : 200;
  const finalTotal = total - discount + deliveryCost;

  // Filter discount coupons (not gifts) for display
  const discountCoupons = userCoupons.filter(c => c.prize_type === "discount");
  const giftCoupons = userCoupons.filter(c => c.prize_type === "gift");

  // Recommended products
  const recommendedProducts = products
    .filter((p) => !items.find((item) => item.product.id === p.id))
    .slice(0, 4);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    const success = await applyCoupon(promoCode, total);
    if (success) {
      setPromoCode("");
    }
  };

  const handleMoveToFavorites = (productId: string | number) => {
    const productIdStr = String(productId);
    const item = items.find((i) => String(i.product.id) === productIdStr);
    if (item) {
      addFavorite(item.product);
      removeItem(productId);
    }
  };

  const handleSelectUserCoupon = (uc: typeof discountCoupons[0]) => {
    if (selectedUserCoupon?.id === uc.id) {
      selectUserCoupon(null);
    } else {
      selectUserCoupon(uc);
    }
  };

  const handleApplyGift = async (gc: typeof giftCoupons[0]) => {
    await applyGiftToCart(gc);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="text-8xl mb-6">🎈</div>
            <h1 className="font-heading text-2xl font-bold mb-4">Ваша корзина пуста</h1>
            <p className="text-muted-foreground mb-8">
              Начните покупки в нашем каталоге и добавьте понравившиеся товары
            </p>
            <Button asChild size="lg" className="btn-primary">
              <Link to="/">Перейти в каталог</Link>
            </Button>
          </div>

          {/* Recommended */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-heading text-2xl font-bold mb-8 text-center">
                Может понравиться
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

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
            <span className="text-foreground">Корзина</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        <h1 className="font-heading text-3xl font-bold mb-8">
          Ваша корзина ({items.length} {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 bg-background rounded-xl p-4 shadow-sm"
              >
                {/* Image */}
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <img
                    src={item.product.images?.[0] || item.product.image || "https://placehold.co/96x96?text=🎈"}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    loading="lazy"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="font-heading font-semibold hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>

                  {(item.product.balloonCount || item.product.balloon_count || item.product.type) && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      {(item.product.balloonCount || item.product.balloon_count) && (
                        <span>{item.product.balloonCount || item.product.balloon_count} шаров</span>
                      )}
                      {item.product.type && (
                        <>
                          <span>•</span>
                          <span>
                            {item.product.type === "helium" && "Гелиевые"}
                            {item.product.type === "latex" && "Латексные"}
                            {item.product.type === "foil" && "Фольгированные"}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Mobile Price */}
                  <div className="mt-2 lg:hidden">
                    <span className="font-bold text-lg text-primary">
                      {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
                    </span>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-secondary"
                        onClick={() => handleMoveToFavorites(item.product.id)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">В избранное</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-error"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Удалить</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop Price */}
                <div className="hidden lg:flex flex-col items-end justify-center">
                  <span className="font-bold text-xl text-primary">
                    {(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-sm text-muted-foreground">
                      {item.product.price.toLocaleString("ru-RU")} ₽ × {item.quantity}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="outline" asChild>
                <Link to="/">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Продолжить покупки
                </Link>
              </Button>
              <Button variant="ghost" className="text-error" onClick={clearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить корзину
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-background rounded-xl p-6 shadow-card sticky top-24 space-y-6">
              <h2 className="font-heading text-xl font-bold">Итого заказа</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Сумма товаров:</span>
                  <span className="font-medium">{total.toLocaleString("ru-RU")} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка:</span>
                  <span className="font-medium">
                    {deliveryCost === 0 ? (
                      <span className="text-success">Бесплатно</span>
                    ) : (
                      `${deliveryCost} ₽`
                    )}
                  </span>
                </div>
                {total < 5000 && (
                  <p className="text-sm text-muted-foreground">
                    Бесплатная доставка от 5 000 ₽. Ещё{" "}
                    <span className="text-primary font-medium">
                      {(5000 - total).toLocaleString("ru-RU")} ₽
                    </span>
                  </p>
                )}
                {adminCouponDiscount > 0 && coupon && (
                  <div className="flex justify-between text-success">
                    <span>Промокод ({coupon.code}):</span>
                    <span className="font-medium">−{adminCouponDiscount.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}
                {userCouponDiscount > 0 && selectedUserCoupon && (
                  <div className="flex justify-between text-success">
                    <span>Личный купон ({selectedUserCoupon.code}):</span>
                    <span className="font-medium">−{userCouponDiscount.toLocaleString("ru-RU")} ₽</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-heading font-bold text-lg">Итого:</span>
                    <span className="font-heading font-bold text-xl text-primary">
                      {finalTotal.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Промокод
                </label>
                {coupon ? (
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                    <div>
                      <span className="font-medium text-success">{coupon.code}</span>
                      <p className="text-sm text-muted-foreground">
                        {coupon.discount_type === "percentage" 
                          ? `Скидка ${coupon.discount_value}%`
                          : `Скидка ${coupon.discount_value.toLocaleString("ru-RU")} ₽`
                        }
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeCoupon}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Введите код" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyPromo}
                        disabled={couponLoading || !promoCode.trim()}
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Применить"}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-destructive">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* User Coupons from Wheel */}
              {user && userCoupons.length > 0 && (
                <div className="space-y-3 pt-2 border-t">
                  <button 
                    onClick={() => setShowUserCoupons(!showUserCoupons)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      Ваши купоны ({userCoupons.length})
                    </span>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      showUserCoupons && "rotate-90"
                    )} />
                  </button>
                  
                  {showUserCoupons && (
                    <div className="space-y-2">
                      {/* Discount coupons */}
                      {discountCoupons.length > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground">Скидки:</p>
                          {discountCoupons.map((uc) => (
                            <div
                              key={uc.id}
                              onClick={() => handleSelectUserCoupon(uc)}
                              className={cn(
                                "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                                selectedUserCoupon?.id === uc.id
                                  ? "border-primary bg-primary/5"
                                  : "hover:border-primary/50"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                  <Ticket className="h-3 w-3 text-primary" />
                                </div>
                                <div>
                                  <code className="font-mono text-sm font-medium">{uc.code}</code>
                                  <p className="text-xs text-muted-foreground">
                                    {uc.discount_type === "percentage" 
                                      ? `−${uc.discount_value}%` 
                                      : `−${Number(uc.discount_value).toLocaleString("ru-RU")} ₽`}
                                  </p>
                                </div>
                              </div>
                              <div className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                selectedUserCoupon?.id === uc.id
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              )}>
                                {selectedUserCoupon?.id === uc.id && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Gift coupons */}
                      {giftCoupons.length > 0 && (
                        <>
                          <p className="text-xs text-muted-foreground mt-2">Подарки:</p>
                          {giftCoupons.map((gc) => (
                            <div
                              key={gc.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-secondary/10 border-secondary/30"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                                  <Gift className="h-3 w-3 text-secondary" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium">{gc.gift_product_name || "Подарок"}</span>
                                  <p className="text-xs text-muted-foreground">Бесплатно</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApplyGift(gc)}
                                className="text-xs"
                              >
                                В корзину
                              </Button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button asChild size="lg" className="w-full btn-primary text-lg">
                <Link to="/checkout" state={{ coupon, selectedUserCoupon }}>Оформить заказ</Link>
              </Button>

              {/* Info */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <span>Доставка по городу</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="h-5 w-5 text-primary shrink-0" />
                  <span>Безопасная оплата</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCw className="h-5 w-5 text-primary shrink-0" />
                  <span>Возврат в течение 14 дней</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold mb-8">
              Может понравиться
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
