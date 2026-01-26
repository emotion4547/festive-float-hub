import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_used: boolean;
  expires_at: string;
}

interface UseUserCouponsResult {
  coupons: UserCoupon[];
  isLoading: boolean;
  selectedCoupon: UserCoupon | null;
  selectCoupon: (coupon: UserCoupon | null) => void;
  markCouponAsUsed: (couponId: string, orderId: string) => Promise<void>;
  calculateDiscount: (total: number) => number;
  refetch: () => Promise<void>;
}

export function useUserCoupons(): UseUserCouponsResult {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);

  const fetchCoupons = async () => {
    if (!user) {
      setCoupons([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_coupons")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_used", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching user coupons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [user]);

  const selectCoupon = (coupon: UserCoupon | null) => {
    setSelectedCoupon(coupon);
  };

  const markCouponAsUsed = async (couponId: string, orderId: string) => {
    const { error } = await supabase
      .from("user_coupons")
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        order_id: orderId,
      })
      .eq("id", couponId);

    if (error) {
      console.error("Error marking coupon as used:", error);
      throw error;
    }

    // Remove from local state
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    setSelectedCoupon(null);
  };

  const calculateDiscount = (total: number): number => {
    if (!selectedCoupon) return 0;

    if (selectedCoupon.discount_type === "percentage") {
      return Math.round((total * selectedCoupon.discount_value) / 100);
    } else {
      return Math.min(Number(selectedCoupon.discount_value), total);
    }
  };

  return {
    coupons,
    isLoading,
    selectedCoupon,
    selectCoupon,
    markCouponAsUsed,
    calculateDiscount,
    refetch: fetchCoupons,
  };
}
