import { useState, useEffect } from "react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Ticket, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface UserCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

export default function AccountCouponsPage() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("user_coupons")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCoupons(data || []);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [user]);

  const handleCopy = async (coupon: UserCoupon) => {
    await navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeCoupons = coupons.filter(
    (c) => !c.is_used && new Date(c.expires_at) > new Date()
  );
  const usedOrExpiredCoupons = coupons.filter(
    (c) => c.is_used || new Date(c.expires_at) <= new Date()
  );

  if (loading) {
    return (
      <AccountLayout title="Мои промокоды">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Мои промокоды">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Мои промокоды</h1>
          <p className="text-muted-foreground">
            Промокоды, выигранные в колесе фортуны
          </p>
        </div>

        {coupons.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                У вас пока нет промокодов
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Крутите колесо фортуны, чтобы получить скидку!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active coupons */}
            {activeCoupons.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Активные</h2>
                <div className="grid gap-3">
                  {activeCoupons.map((coupon) => (
                    <Card key={coupon.id} className="border-primary/30 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                              <Ticket className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <code className="bg-background px-3 py-1 rounded font-mono font-bold">
                                  {coupon.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCopy(coupon)}
                                >
                                  {copiedId === coupon.id ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Действует до{" "}
                                {format(new Date(coupon.expires_at), "d MMMM yyyy", {
                                  locale: ru,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="default" className="text-lg px-3 py-1">
                              {coupon.discount_type === "percentage"
                                ? `−${coupon.discount_value}%`
                                : `−${Number(coupon.discount_value).toLocaleString("ru-RU")} ₽`}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Used or expired coupons */}
            {usedOrExpiredCoupons.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                  Использованные / Истёкшие
                </h2>
                <div className="grid gap-3">
                  {usedOrExpiredCoupons.map((coupon) => (
                    <Card key={coupon.id} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <Ticket className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <code className="bg-muted px-3 py-1 rounded font-mono line-through">
                                {coupon.code}
                              </code>
                              <p className="text-sm text-muted-foreground mt-1">
                                {coupon.is_used
                                  ? "Использован"
                                  : `Истёк ${format(
                                      new Date(coupon.expires_at),
                                      "d MMMM yyyy",
                                      { locale: ru }
                                    )}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {coupon.discount_type === "percentage"
                              ? `−${coupon.discount_value}%`
                              : `−${Number(coupon.discount_value).toLocaleString("ru-RU")} ₽`}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
