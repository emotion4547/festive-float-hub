import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RotateCcw, Ticket, Gift, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface WheelStats {
  totalSpins: number;
  uniqueUsers: number;
  totalCoupons: number;
  usedCoupons: number;
  expiredCoupons: number;
  giftCoupons: number;
  discountCoupons: number;
}

interface RecentSpin {
  id: string;
  spun_at: string;
  user_id: string;
  segment_label: string;
  coupon_code: string;
  is_used: boolean;
  prize_type: string;
}

export default function AdminWheelStatsPage() {
  const [stats, setStats] = useState<WheelStats | null>(null);
  const [recentSpins, setRecentSpins] = useState<RecentSpin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total spins
        const { count: totalSpins } = await supabase
          .from("user_wheel_spins")
          .select("*", { count: "exact", head: true });

        // Get unique users
        const { data: uniqueUsersData } = await supabase
          .from("user_wheel_spins")
          .select("user_id");
        const uniqueUsers = new Set(uniqueUsersData?.map(s => s.user_id)).size;

        // Get coupon stats
        const { data: couponsData } = await supabase
          .from("user_coupons")
          .select("is_used, expires_at, prize_type");

        const now = new Date().toISOString();
        const totalCoupons = couponsData?.length || 0;
        const usedCoupons = couponsData?.filter(c => c.is_used).length || 0;
        const expiredCoupons = couponsData?.filter(c => !c.is_used && c.expires_at < now).length || 0;
        const giftCoupons = couponsData?.filter(c => c.prize_type === "gift").length || 0;
        const discountCoupons = couponsData?.filter(c => c.prize_type === "discount").length || 0;

        setStats({
          totalSpins: totalSpins || 0,
          uniqueUsers,
          totalCoupons,
          usedCoupons,
          expiredCoupons,
          giftCoupons,
          discountCoupons,
        });

        // Get recent spins with details
        const { data: spinsData } = await supabase
          .from("user_wheel_spins")
          .select(`
            id,
            spun_at,
            user_id,
            segment:wheel_segments(label),
            coupon:user_coupons(code, is_used, prize_type)
          `)
          .order("spun_at", { ascending: false })
          .limit(20);

        if (spinsData) {
          setRecentSpins(spinsData.map((spin: any) => ({
            id: spin.id,
            spun_at: spin.spun_at,
            user_id: spin.user_id,
            segment_label: spin.segment?.label || "—",
            coupon_code: spin.coupon?.code || "—",
            is_used: spin.coupon?.is_used || false,
            prize_type: spin.coupon?.prize_type || "discount",
          })));
        }
      } catch (error) {
        console.error("Error fetching wheel stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Статистика колеса">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Статистика колеса фортуны">
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего прокруток</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSpins || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Уникальных пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.uniqueUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Использовано промокодов</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.usedCoupons || 0}
                <span className="text-sm text-muted-foreground ml-1">
                  / {stats?.totalCoupons || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Истекших: {stats?.expiredCoupons || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">По типам призов</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Скидки:</span>
                  <span className="font-bold">{stats?.discountCoupons || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Подарки:</span>
                  <span className="font-bold">{stats?.giftCoupons || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion rate */}
        {stats && stats.totalCoupons > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Конверсия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.round((stats.usedCoupons / stats.totalCoupons) * 100)}%`,
                    }}
                  />
                </div>
                <span className="font-bold text-lg">
                  {Math.round((stats.usedCoupons / stats.totalCoupons) * 100)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Процент использованных промокодов от общего числа
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recent spins */}
        <Card>
          <CardHeader>
            <CardTitle>Последние прокрутки</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSpins.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Прокруток пока нет
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Приз</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Промокод</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSpins.map((spin) => (
                    <TableRow key={spin.id}>
                      <TableCell>
                        {format(new Date(spin.spun_at), "dd.MM.yyyy HH:mm", { locale: ru })}
                      </TableCell>
                      <TableCell>{spin.segment_label}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          spin.prize_type === "gift"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {spin.prize_type === "gift" ? "Подарок" : "Скидка"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {spin.coupon_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          spin.is_used
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {spin.is_used ? "Использован" : "Активен"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
