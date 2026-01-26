import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWheelSpins } from "@/hooks/useWheelSpins";
import { useToast } from "@/hooks/use-toast";

const PENDING_SPIN_KEY = "pending_wheel_spin";

export function PendingSpinHandler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { claimPendingSpin } = useWheelSpins();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (!user || processed) return;

    const processPendingSpin = async () => {
      const pendingSpinStr = localStorage.getItem(PENDING_SPIN_KEY);
      if (!pendingSpinStr) return;

      try {
        const pendingSpin = JSON.parse(pendingSpinStr);
        
        // Generate coupon code
        const generateCouponCode = () => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          let code = "WHEEL-";
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return code;
        };

        const code = generateCouponCode();

        // Get gift product info if it's a gift
        let giftProductName = null;
        let giftProductImage = null;
        if (pendingSpin.prizeType === "gift" && pendingSpin.giftProductId) {
          const { data: product } = await supabase
            .from("products")
            .select("name, images")
            .eq("id", pendingSpin.giftProductId)
            .maybeSingle();
          
          if (product) {
            giftProductName = product.name;
            giftProductImage = product.images?.[0] || null;
          }
        }

        // Create the coupon for the user
        const { data: couponData, error } = await supabase
          .from("user_coupons")
          .insert({
            user_id: user.id,
            code,
            discount_type: pendingSpin.discountType || "percentage",
            discount_value: pendingSpin.discountValue || 0,
            prize_type: pendingSpin.prizeType,
            gift_product_id: pendingSpin.giftProductId || null,
            gift_product_name: giftProductName,
            gift_product_image: giftProductImage,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating coupon from pending spin:", error);
          return;
        }

        // Record the spin
        if (couponData) {
          await supabase.from("user_wheel_spins").insert({
            user_id: user.id,
            segment_id: pendingSpin.segmentId,
            coupon_id: couponData.id,
          });
        }

        // Clear localStorage
        localStorage.removeItem(PENDING_SPIN_KEY);

        // Delete from pending_wheel_spins table
        const sessionId = localStorage.getItem("wheel_session_id");
        if (sessionId) {
          await supabase
            .from("pending_wheel_spins")
            .delete()
            .eq("session_id", sessionId);
        }

        toast({
          title: "🎉 Ваш приз сохранён!",
          description: `Вы выиграли "${pendingSpin.label}". Промокод добавлен в ваш аккаунт.`,
        });

        setProcessed(true);
      } catch (error) {
        console.error("Error processing pending spin:", error);
      }
    };

    // Small delay to ensure auth is fully set up
    const timer = setTimeout(processPendingSpin, 1000);
    return () => clearTimeout(timer);
  }, [user, processed, toast]);

  return null;
}
