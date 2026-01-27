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

export interface UserCouponMatch {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_used: boolean;
  expires_at: string;
  prize_type: string;
  gift_product_id: string | null;
  gift_product_name: string | null;
  gift_product_image: string | null;
  user_id: string;
}

interface UseCouponResult {
  coupon: Coupon | null;
  userCouponMatch: UserCouponMatch | null;
  isLoading: boolean;
  error: string | null;
  applyCoupon: (code: string, orderTotal: number, userId?: string) => Promise<{ success: boolean; isUserCoupon?: boolean }>;
  removeCoupon: () => void;
  calculateDiscount: (total: number) => number;
}

export function useCoupon(): UseCouponResult {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [userCouponMatch, setUserCouponMatch] = useState<UserCouponMatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCoupon = async (code: string, orderTotal: number, userId?: string): Promise<{ success: boolean; isUserCoupon?: boolean }> => {
    setIsLoading(true);
    setError(null);

    try {
      const normalizedCode = code.toUpperCase().trim();
      
      // First, try to find in admin coupons table
      const { data: adminCoupon, error: adminFetchError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", normalizedCode)
        .eq("is_active", true)
        .maybeSingle();

      if (adminFetchError) throw adminFetchError;

      if (adminCoupon) {
        // Check validity dates
        const now = new Date();
        if (adminCoupon.valid_from && new Date(adminCoupon.valid_from) > now) {
          setError("Промокод ещё не активен");
          return { success: false };
        }
        if (adminCoupon.valid_to && new Date(adminCoupon.valid_to) < now) {
          setError("Промокод истёк");
          return { success: false };
        }

        // Check max uses
        if (adminCoupon.max_uses && adminCoupon.used_count && adminCoupon.used_count >= adminCoupon.max_uses) {
          setError("Лимит использования промокода исчерпан");
          return { success: false };
        }

        // Check minimum order amount
        if (adminCoupon.min_order_amount && orderTotal < adminCoupon.min_order_amount) {
          setError(`Минимальная сумма заказа для промокода: ${adminCoupon.min_order_amount.toLocaleString("ru-RU")} ₽`);
          return { success: false };
        }

        setCoupon(adminCoupon);
        setUserCouponMatch(null);
        return { success: true, isUserCoupon: false };
      }

      // If not found in admin coupons, try user_coupons (wheel prizes)
      if (userId) {
        const { data: userCoupon, error: userFetchError } = await supabase
          .from("user_coupons")
          .select("*")
          .eq("code", normalizedCode)
          .eq("user_id", userId)
          .eq("is_used", false)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (userFetchError) throw userFetchError;

        if (userCoupon) {
          setUserCouponMatch(userCoupon);
          setCoupon(null);
          return { success: true, isUserCoupon: true };
        }
      }

      // Not found in either table
      setError("Промокод не найден");
      return { success: false };
    } catch (err) {
      console.error("Error applying coupon:", err);
      setError("Ошибка при применении промокода");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setUserCouponMatch(null);
    setError(null);
  };

  const calculateDiscount = (total: number): number => {
    const activeCoupon = coupon || userCouponMatch;
    if (!activeCoupon) return 0;
    
    // Gift coupons don't provide monetary discount
    if ('prize_type' in activeCoupon && activeCoupon.prize_type === "gift") return 0;

    if (activeCoupon.discount_type === "percentage") {
      return Math.round((total * activeCoupon.discount_value) / 100);
    } else {
      // fixed amount
      return Math.min(Number(activeCoupon.discount_value), total);
    }
  };

  return {
    coupon,
    userCouponMatch,
    isLoading,
    error,
    applyCoupon,
    removeCoupon,
    calculateDiscount,
  };
}
