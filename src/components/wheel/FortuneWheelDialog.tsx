import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FortuneWheel, WheelSegment } from "./FortuneWheel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useWheelSpins } from "@/hooks/useWheelSpins";
import { useCart } from "@/hooks/useCart";
import { Gift, Copy, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const WHEEL_SHOWN_KEY = "fortune_wheel_shown";
const WHEEL_DELAY_MS = 30000; // 30 seconds

export function FortuneWheelDialog() {
  const [open, setOpen] = useState(false);
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelSegment | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [giftAdded, setGiftAdded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { 
    canSpin, 
    nextSpinDate, 
    isLoading: spinCheckLoading, 
    recordSpin, 
    savePendingSpin,
    hasPendingSpin
  } = useWheelSpins();

  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase
        .from("wheel_segments")
        .select("id, label, discount_type, discount_value, color, probability, prize_type, gift_product_id")
        .eq("is_active", true)
        .order("sort_order");
      
      if (data) setSegments(data as WheelSegment[]);
    };

    fetchSegments();
  }, []);

  useEffect(() => {
    // Check if wheel was already shown in this session
    const wasShown = sessionStorage.getItem(WHEEL_SHOWN_KEY);
    if (wasShown) return;

    // Don't show if user can't spin or still loading
    if (spinCheckLoading) return;
    if (!canSpin && !hasPendingSpin()) return;

    // Show wheel after 30 seconds
    const timer = setTimeout(() => {
      if (segments.length > 0 && canSpin) {
        setOpen(true);
        sessionStorage.setItem(WHEEL_SHOWN_KEY, "true");
      }
    }, WHEEL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [segments, canSpin, spinCheckLoading]);

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "WHEEL-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSpinEnd = async (segment: WheelSegment) => {
    setWonPrize(segment);
    
    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // If user is not logged in, save pending spin
    if (!user) {
      await savePendingSpin({
        segmentId: segment.id,
        prizeType: segment.prize_type,
        discountType: segment.discount_type,
        discountValue: segment.discount_value,
        giftProductId: segment.gift_product_id || undefined,
        label: segment.label,
      });
      
      toast({
        title: "Войдите для получения промокода",
        description: "Авторизуйтесь, чтобы сохранить ваш выигрыш!",
      });
      return;
    }

    // Generate and save coupon
    const code = generateCouponCode();
    
    // Get gift product info if it's a gift
    let giftProductName = null;
    let giftProductImage = null;
    if (segment.prize_type === "gift" && segment.gift_product_id) {
      const { data: product } = await supabase
        .from("products")
        .select("name, images")
        .eq("id", segment.gift_product_id)
        .maybeSingle();
      
      if (product) {
        giftProductName = product.name;
        giftProductImage = product.images?.[0] || null;
      }
    }

    const { data: couponData, error } = await supabase.from("user_coupons").insert({
      user_id: user.id,
      code,
      discount_type: segment.discount_type,
      discount_value: segment.discount_value,
      prize_type: segment.prize_type,
      gift_product_id: segment.gift_product_id,
      gift_product_name: giftProductName,
      gift_product_image: giftProductImage,
    }).select().single();

    if (error) {
      console.error("Error saving coupon:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить промокод",
      });
    } else {
      setCouponCode(code);
      
      // Record the spin
      if (couponData) {
        await recordSpin(segment.id, couponData.id);
      }
      
      toast({
        title: "Промокод сохранён!",
        description: "Найдите его в личном кабинете",
      });
    }
  };

  const handleApplyGift = async () => {
    if (!wonPrize || wonPrize.prize_type !== "gift" || !wonPrize.gift_product_id) return;

    // Fetch product details
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", wonPrize.gift_product_id)
      .maybeSingle();

    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: 0, // Gift is free
        images: product.images,
        in_stock: product.in_stock,
      });
      setGiftAdded(true);
      toast({
        title: "Подарок добавлен в корзину!",
        description: product.name,
      });
    }
  };

  const handleCopyCode = async () => {
    if (!couponCode) return;
    
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setWonPrize(null);
    setCouponCode(null);
    setGiftAdded(false);
  };

  if (segments.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            Колесо фортуны
          </DialogTitle>
          <DialogDescription className="text-center">
            {!wonPrize 
              ? "Крутите колесо и получите скидку на первый заказ!" 
              : "Поздравляем с выигрышем!"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {!wonPrize ? (
            <FortuneWheel
              segments={segments}
              onSpinEnd={handleSpinEnd}
              isSpinning={isSpinning}
              setIsSpinning={setIsSpinning}
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🎉</div>
              <p className="text-2xl font-bold text-primary">
                Вы выиграли {wonPrize.label}!
              </p>
              
              {couponCode ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">Ваш промокод:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-muted px-4 py-2 rounded-lg font-mono text-lg">
                      {couponCode}
                    </code>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyCode}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Gift specific actions */}
                  {wonPrize.prize_type === "gift" && wonPrize.gift_product_id && (
                    <div className="pt-2">
                      {!giftAdded ? (
                        <Button onClick={handleApplyGift} variant="secondary" className="gap-2">
                          <Gift className="h-4 w-4" />
                          Добавить подарок в корзину
                        </Button>
                      ) : (
                        <p className="text-primary font-medium flex items-center justify-center gap-2">
                          <Check className="h-4 w-4" />
                          Подарок добавлен в корзину!
                        </p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    {wonPrize.prize_type === "gift"
                      ? "Используйте промокод при оформлении заказа, чтобы получить подарок"
                      : "Промокод действует 30 дней и сохранён в личном кабинете"}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {user 
                    ? "Сохраняем промокод..." 
                    : "Войдите в аккаунт, чтобы сохранить промокод"}
                </p>
              )}
              
              <Button onClick={handleClose} className="mt-4">
                Закрыть
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
