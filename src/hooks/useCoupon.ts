import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number | null;
  is_active: boolean | null;
  valid_from: string | null;
  valid_to: string | null;
}

interface UseCouponResult {
  coupon: Coupon | null;
  isLoading: boolean;
  error: string | null;
  applyCoupon: (code: string, orderTotal: number) => Promise<boolean>;
  removeCoupon: () => void;
  calculateDiscount: (total: number) => number;
}

export function useCoupon(): UseCouponResult {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCoupon = async (code: string, orderTotal: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Промокод не найден");
        return false;
      }

      // Check validity dates
      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) {
        setError("Промокод ещё не активен");
        return false;
      }
      if (data.valid_to && new Date(data.valid_to) < now) {
        setError("Промокод истёк");
        return false;
      }

      // Check max uses
      if (data.max_uses && data.used_count && data.used_count >= data.max_uses) {
        setError("Лимит использования промокода исчерпан");
        return false;
      }

      // Check minimum order amount
      if (data.min_order_amount && orderTotal < data.min_order_amount) {
        setError(`Минимальная сумма заказа для промокода: ${data.min_order_amount.toLocaleString("ru-RU")} ₽`);
        return false;
      }

      setCoupon(data);
      return true;
    } catch (err) {
      console.error("Error applying coupon:", err);
      setError("Ошибка при применении промокода");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setError(null);
  };

  const calculateDiscount = (total: number): number => {
    if (!coupon) return 0;

    if (coupon.discount_type === "percentage") {
      return Math.round((total * coupon.discount_value) / 100);
    } else {
      // fixed amount
      return Math.min(coupon.discount_value, total);
    }
  };

  return {
    coupon,
    isLoading,
    error,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
  };
}
