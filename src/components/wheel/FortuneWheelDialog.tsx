import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FortuneWheel } from "./FortuneWheel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Gift, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface WheelSegment {
  id: string;
  label: string;
  discount_type: string;
  discount_value: number;
  color: string;
  probability: number;
}

const WHEEL_SHOWN_KEY = "fortune_wheel_shown";
const WHEEL_DELAY_MS = 30000; // 30 seconds

export function FortuneWheelDialog() {
  const [open, setOpen] = useState(false);
  const [segments, setSegments] = useState<WheelSegment[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelSegment | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase
        .from("wheel_segments")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      
      if (data) setSegments(data);
    };

    fetchSegments();
  }, []);

  useEffect(() => {
    // Check if wheel was already shown in this session
    const wasShown = sessionStorage.getItem(WHEEL_SHOWN_KEY);
    if (wasShown) return;

    // Show wheel after 30 seconds
    const timer = setTimeout(() => {
      if (segments.length > 0) {
        setOpen(true);
        sessionStorage.setItem(WHEEL_SHOWN_KEY, "true");
      }
    }, WHEEL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [segments]);

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

    if (!user) {
      toast({
        title: "Войдите для получения промокода",
        description: "Авторизуйтесь, чтобы сохранить ваш выигрыш!",
      });
      return;
    }

    // Generate and save coupon
    const code = generateCouponCode();
    
    const { error } = await supabase.from("user_coupons").insert({
      user_id: user.id,
      code,
      discount_type: segment.discount_type,
      discount_value: segment.discount_value,
    });

    if (error) {
      console.error("Error saving coupon:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить промокод",
      });
    } else {
      setCouponCode(code);
      toast({
        title: "Промокод сохранён!",
        description: "Найдите его в личном кабинете",
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
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Промокод действует 30 дней и сохранён в личном кабинете
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
