import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PENDING_SPIN_KEY = "pending_wheel_spin";
const SESSION_ID_KEY = "wheel_session_id";
const COOLDOWN_DAYS = 15;

interface PendingSpin {
  segmentId: string;
  prizeType: string;
  discountType?: string;
  discountValue?: number;
  giftProductId?: string;
  label: string;
}

export function useWheelSpins() {
  const { user } = useAuth();
  const [canSpin, setCanSpin] = useState(false);
  const [nextSpinDate, setNextSpinDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate or get session ID for anonymous users
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  };

  // Check if user can spin
  const checkCanSpin = async () => {
    setIsLoading(true);

    if (!user) {
      // For anonymous users, check localStorage
      const pendingSpin = localStorage.getItem(PENDING_SPIN_KEY);
      setCanSpin(!pendingSpin);
      setNextSpinDate(null);
      setIsLoading(false);
      return;
    }

    try {
      // Check last spin for authenticated user
      const { data } = await supabase
        .from("user_wheel_spins")
        .select("spun_at")
        .eq("user_id", user.id)
        .order("spun_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const lastSpinDate = new Date(data.spun_at);
        const nextSpin = new Date(lastSpinDate);
        nextSpin.setDate(nextSpin.getDate() + COOLDOWN_DAYS);

        if (nextSpin > new Date()) {
          setCanSpin(false);
          setNextSpinDate(nextSpin);
        } else {
          setCanSpin(true);
          setNextSpinDate(null);
        }
      } else {
        setCanSpin(true);
        setNextSpinDate(null);
      }
    } catch (error) {
      console.error("Error checking spin eligibility:", error);
      setCanSpin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCanSpin();
  }, [user]);

  // Record a spin for authenticated user
  const recordSpin = async (segmentId: string, couponId: string) => {
    if (!user) return;

    await supabase.from("user_wheel_spins").insert({
      user_id: user.id,
      segment_id: segmentId,
      coupon_id: couponId,
    });

    // Update local state
    const nextSpin = new Date();
    nextSpin.setDate(nextSpin.getDate() + COOLDOWN_DAYS);
    setCanSpin(false);
    setNextSpinDate(nextSpin);
  };

  // Save pending spin for anonymous user
  const savePendingSpin = async (spin: PendingSpin) => {
    const sessionId = getSessionId();

    // Save to localStorage
    localStorage.setItem(PENDING_SPIN_KEY, JSON.stringify(spin));

    // Also save to database for retrieval after registration
    try {
      await supabase.from("pending_wheel_spins").upsert({
        session_id: sessionId,
        segment_id: spin.segmentId,
        prize_type: spin.prizeType,
        discount_type: spin.discountType,
        discount_value: spin.discountValue,
        gift_product_id: spin.giftProductId,
      });
    } catch (error) {
      console.error("Error saving pending spin:", error);
    }

    setCanSpin(false);
  };

  // Check and claim pending spin after registration/login
  const claimPendingSpin = async (): Promise<PendingSpin | null> => {
    const pendingSpinStr = localStorage.getItem(PENDING_SPIN_KEY);
    if (!pendingSpinStr || !user) return null;

    try {
      const pendingSpin: PendingSpin = JSON.parse(pendingSpinStr);
      
      // Clear localStorage
      localStorage.removeItem(PENDING_SPIN_KEY);
      
      // Delete from database
      const sessionId = localStorage.getItem(SESSION_ID_KEY);
      if (sessionId) {
        await supabase
          .from("pending_wheel_spins")
          .delete()
          .eq("session_id", sessionId);
      }

      return pendingSpin;
    } catch (error) {
      console.error("Error claiming pending spin:", error);
      return null;
    }
  };

  // Check if there's a pending spin
  const hasPendingSpin = (): boolean => {
    return !!localStorage.getItem(PENDING_SPIN_KEY);
  };

  return {
    canSpin,
    nextSpinDate,
    isLoading,
    recordSpin,
    savePendingSpin,
    claimPendingSpin,
    hasPendingSpin,
    checkCanSpin,
  };
}
