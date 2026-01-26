import { useState } from "react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, MessageSquare, Shield } from "lucide-react";

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    sms: true,
    email: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Настройки сохранены",
      description: "Ваши предпочтения обновлены",
    });
  };

  return (
    <AccountLayout title="Настройки">
      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Уведомления
            </CardTitle>
            <CardDescription>
              Настройте, какие уведомления вы хотите получать
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="orderUpdates">Статус заказа</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомления об изменении статуса заказа
                </p>
              </div>
              <Switch
                id="orderUpdates"
                checked={notifications.orderUpdates}
                onCheckedChange={() => handleNotificationChange("orderUpdates")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="promotions">Акции и скидки</Label>
                <p className="text-sm text-muted-foreground">
                  Информация о специальных предложениях
                </p>
              </div>
              <Switch
                id="promotions"
                checked={notifications.promotions}
                onCheckedChange={() => handleNotificationChange("promotions")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Каналы связи
            </CardTitle>
            <CardDescription>
              Выберите способы получения уведомлений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления на email
                  </p>
                </div>
              </div>
              <Switch
                id="email"
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange("email")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label htmlFor="sms">SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать SMS-уведомления
                  </p>
                </div>
              </div>
              <Switch
                id="sms"
                checked={notifications.sms}
                onCheckedChange={() => handleNotificationChange("sms")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Безопасность
            </CardTitle>
            <CardDescription>
              Управление безопасностью аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Изменить пароль
            </Button>
            <Separator />
            <div className="pt-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={signOut}
              >
                Выйти из аккаунта
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AccountLayout>
  );
}
