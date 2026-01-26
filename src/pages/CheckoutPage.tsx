import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  Check, 
  Truck, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Tag,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/hooks/useCart";
import { useCoupon } from "@/hooks/useCoupon";
import { useUserCoupons } from "@/hooks/useUserCoupons";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Ticket } from "lucide-react";

type Step = 1 | 2 | 3;

interface CouponData {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { coupon, calculateDiscount, removeCoupon } = useCoupon();
  const { 
    coupons: userCoupons, 
    selectedCoupon: selectedUserCoupon, 
    selectCoupon: selectUserCoupon,
    markCouponAsUsed,
    calculateDiscount: calculateUserCouponDiscount 
  } = useUserCoupons();
  const [step, setStep] = useState<Step>(1);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get coupon from cart page if passed via state
  const passedCoupon = location.state?.coupon as CouponData | undefined;
  const activeCoupon = coupon || passedCoupon;
  
  // Use user coupon if no regular coupon is active
  const effectiveCoupon = activeCoupon || selectedUserCoupon;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    comment: "",
    city: "Краснодар",
    street: "",
    house: "",
    apartment: "",
    deliveryDate: "",
    deliveryTime: "",
    deliveryMethod: "courier",
    paymentMethod: "card",
  });

  const discount = activeCoupon 
    ? calculateDiscount(total) 
    : selectedUserCoupon 
      ? calculateUserCouponDiscount(total) 
      : 0;
  const deliveryCost = formData.deliveryMethod === "pickup" ? 0 : total >= 5000 ? 0 : 200;
  const finalTotal = total - discount + deliveryCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsSubmitting(true);
      try {
        // Create order in database
        const deliveryAddress = formData.deliveryMethod === "courier" 
          ? `${formData.city}, ${formData.street}, д. ${formData.house}${formData.apartment ? `, кв. ${formData.apartment}` : ""}`
          : "Самовывоз";

        // Generate temporary order number (will be replaced by DB trigger)
        const tempOrderNumber = `RP-${new Date().toISOString().slice(2,10).replace(/-/g, "")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

        const orderPayload = {
          order_number: tempOrderNumber,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          delivery_method: formData.deliveryMethod,
          delivery_address: deliveryAddress,
          delivery_date: formData.deliveryDate || null,
          delivery_time: formData.deliveryTime || null,
          delivery_cost: deliveryCost,
          payment_method: formData.paymentMethod,
          comment: formData.comment || null,
          total: finalTotal,
          status: "pending",
          ...(user?.id ? { user_id: user.id } : {}),
        };

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([orderPayload])
          .select("id, order_number")
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: String(item.product.id),
          product_name: item.product.name,
          product_image: item.product.images?.[0] || null,
          price: item.product.price,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Record coupon usage if applied (regular coupon)
        if (activeCoupon) {
          await supabase
            .from("coupon_uses")
            .insert({
              coupon_id: activeCoupon.id,
              user_id: user?.id || null,
              order_id: orderData.id,
            });
          
          // Increment used_count
          await supabase
            .from("coupons")
            .update({ used_count: (activeCoupon as any).used_count + 1 })
            .eq("id", activeCoupon.id);
        }

        // Mark user coupon as used (wheel coupon)
        if (selectedUserCoupon) {
          await markCouponAsUsed(selectedUserCoupon.id, orderData.id);
        }

        setOrderNumber(orderData.order_number);
        clearCart();
        removeCoupon();
        selectUserCoupon(null);
        setStep(3);

        toast({
          title: "Заказ успешно оформлен!",
          description: `Номер заказа: ${orderData.order_number}`,
        });
      } catch (error) {
        console.error("Order creation error:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось создать заказ. Попробуйте еще раз.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 3) {
      setStep((step - 1) as Step);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Корзина пуста</h1>
          <Link to="/" className="text-primary hover:underline">
            Перейти в каталог
          </Link>
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
            <Link to="/cart" className="hover:text-primary transition-colors">
              Корзина
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Оформление заказа</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        {/* Progress */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Доставка" },
              { num: 2, label: "Оплата" },
              { num: 3, label: "Готово" },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all",
                    step >= s.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                </div>
                <span
                  className={cn(
                    "ml-2 font-medium hidden sm:inline",
                    step >= s.num ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
                {index < 2 && (
                  <div
                    className={cn(
                      "w-16 sm:w-32 h-1 mx-4 rounded",
                      step > s.num ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 3 ? (
          /* Confirmation */
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="font-heading text-3xl font-bold mb-4 text-success">
              Спасибо за заказ!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Номер вашего заказа: <strong className="text-foreground">#{orderNumber}</strong>
            </p>

            <div className="bg-muted/30 rounded-xl p-6 mb-8 text-left space-y-4">
              <h3 className="font-heading font-semibold text-lg">Что дальше:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <p>Мы подтвердим ваш заказ по телефону или email</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <p>Соберём вашу доставку с любовью</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <p>На номер телефона придёт SMS при отправке</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    4
                  </div>
                  <p>Получите доставку в указанное время</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link to="/">Продолжить покупки</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contacts">Связаться с нами</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="space-y-8">
                  {/* Contact Info */}
                  <div className="bg-background rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Контактные данные
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Имя и фамилия *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Иван Иванов"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Телефон *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+7 (999) 123-45-67"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="bg-background rounded-xl p-6 shadow-sm space-y-6">
                    <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      Способ доставки
                    </h2>
                    <RadioGroup
                      value={formData.deliveryMethod}
                      onValueChange={(value) =>
                        setFormData({ ...formData, deliveryMethod: value })
                      }
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="courier" id="courier" />
                        <Label htmlFor="courier" className="flex-1 cursor-pointer">
                          <span className="font-medium">Курьер по городу</span>
                          <span className="text-muted-foreground ml-2">
                            {total >= 5000 ? "Бесплатно" : "200 ₽"}
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                          <span className="font-medium">Самовывоз</span>
                          <span className="text-success ml-2">Бесплатно</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Address */}
                  {formData.deliveryMethod === "courier" && (
                    <div className="bg-background rounded-xl p-6 shadow-sm space-y-6">
                      <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Адрес доставки
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="street">Улица *</Label>
                          <Input
                            id="street"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            placeholder="Невский проспект"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="house">Дом / корпус *</Label>
                          <Input
                            id="house"
                            name="house"
                            value={formData.house}
                            onChange={handleInputChange}
                            placeholder="10"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="apartment">Квартира</Label>
                          <Input
                            id="apartment"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleInputChange}
                            placeholder="5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryDate">Дата доставки *</Label>
                          <Input
                            id="deliveryDate"
                            name="deliveryDate"
                            type="date"
                            value={formData.deliveryDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryTime">Время доставки</Label>
                          <Input
                            id="deliveryTime"
                            name="deliveryTime"
                            type="time"
                            value={formData.deliveryTime}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comment */}
                  <div className="bg-background rounded-xl p-6 shadow-sm space-y-4">
                    <Label htmlFor="comment">Комментарий к заказу</Label>
                    <Textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder="Напишите, если есть особые пожелания..."
                      rows={3}
                    />
                  </div>

                  {/* User Wheel Coupons */}
                  {user && userCoupons.length > 0 && !activeCoupon && (
                    <div className="bg-background rounded-xl p-6 shadow-sm space-y-4">
                      <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-primary" />
                        Ваши промокоды
                      </h2>
                      <div className="space-y-2">
                        {userCoupons.map((uc) => (
                          <div
                            key={uc.id}
                            onClick={() => selectUserCoupon(selectedUserCoupon?.id === uc.id ? null : uc)}
                            className={cn(
                              "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                              selectedUserCoupon?.id === uc.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Ticket className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <code className="font-mono font-medium">{uc.code}</code>
                                <p className="text-xs text-muted-foreground">
                                  Скидка {uc.discount_type === "percentage" 
                                    ? `${uc.discount_value}%` 
                                    : `${Number(uc.discount_value).toLocaleString("ru-RU")} ₽`}
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
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="bg-background rounded-xl p-6 shadow-sm space-y-6">
                  <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Способ оплаты
                  </h2>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <span className="font-medium">Банковская карта</span>
                        <span className="text-muted-foreground ml-2">
                          Visa, MasterCard
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="sbp" id="sbp" />
                      <Label htmlFor="sbp" className="flex-1 cursor-pointer">
                        <span className="font-medium">СБП</span>
                        <span className="text-muted-foreground ml-2">
                          Система быстрых платежей
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <span className="font-medium">Наличными при получении</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                {step > 1 && step < 3 && (
                  <Button variant="outline" onClick={handlePrevStep}>
                    ← Назад
                  </Button>
                )}
                {step === 1 && (
                  <Button variant="outline" asChild>
                    <Link to="/cart">← В корзину</Link>
                  </Button>
                )}
                <Button 
                  className="btn-primary ml-auto" 
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Оформление..." : step === 1 ? "Далее → К оплате" : `Оплатить ${finalTotal.toLocaleString("ru-RU")} ₽`}
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-xl p-6 shadow-card sticky top-24 space-y-6">
                <h2 className="font-heading text-xl font-bold">Ваш заказ</h2>

                {/* Items */}
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img
                        src={item.product.images?.[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {item.quantity} × {item.product.price.toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Товары:</span>
                    <span>{total.toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Доставка:</span>
                    <span>
                      {deliveryCost === 0 ? (
                        <span className="text-success">Бесплатно</span>
                      ) : (
                        `${deliveryCost} ₽`
                      )}
                    </span>
                  </div>
                  {discount > 0 && effectiveCoupon && (
                    <div className="flex justify-between text-sm text-success">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Промокод ({effectiveCoupon.code}):
                      </span>
                      <span>−{discount.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-heading font-bold text-lg">Итого:</span>
                    <span className="font-heading font-bold text-xl text-primary">
                      {finalTotal.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutPage;
