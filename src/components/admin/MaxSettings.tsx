import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

export function MaxSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const [showToken, setShowToken] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["max_bot_token", "max_chat_id"]);

      if (error) throw error;

      const tokenSetting = data?.find(s => s.key === "max_bot_token");
      const chatSetting = data?.find(s => s.key === "max_chat_id");

      setBotToken(tokenSetting?.value || "");
      setChatId(chatSetting?.value || "");
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await supabase
        .from("site_settings")
        .upsert({
          key: "max_bot_token",
          label: "MAX Bot Token",
          value: botToken,
          category: "notifications",
          type: "text"
        }, { onConflict: "key" });

      await supabase
        .from("site_settings")
        .upsert({
          key: "max_chat_id",
          label: "MAX Chat ID",
          value: chatId,
          category: "notifications",
          type: "text"
        }, { onConflict: "key" });

      toast({ title: "Настройки сохранены" });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!botToken || !chatId) {
      toast({
        variant: "destructive",
        title: "Заполните все поля",
        description: "Укажите токен бота и ID чата",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const url = `https://botapi.max.ru/messages?chat_id=${encodeURIComponent(chatId)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": botToken,
        },
        body: JSON.stringify({
          text: "✅ <b>Тестовое сообщение</b>\n\nНастройки уведомлений MAX работают корректно!",
          format: "html",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResult("success");
        toast({ title: "Тест успешен!", description: "Сообщение отправлено в MAX" });
      } else {
        setTestResult("error");
        toast({
          variant: "destructive",
          title: "Ошибка MAX",
          description: result.message || result.error || "Не удалось отправить сообщение",
        });
      }
    } catch (error) {
      console.error("Test error:", error);
      setTestResult("error");
      toast({
        variant: "destructive",
        title: "Ошибка сети",
        description: "Не удалось подключиться к MAX API",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Настройки MAX
          </CardTitle>
          <CardDescription>
            Настройте бота MAX для получения уведомлений о новых заказах и заявках
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Статус:</span>
            {botToken && chatId ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Настроено
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Не настроено
              </Badge>
            )}
            {testResult === "success" && (
              <Badge variant="outline" className="text-success border-success gap-1">
                <CheckCircle className="h-3 w-3" />
                Тест пройден
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-bot-token">Токен бота (access_token)</Label>
            <div className="relative">
              <Input
                id="max-bot-token"
                type={showToken ? "text" : "password"}
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Access token из MasterBot"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Получите токен у @MasterBot в мессенджере MAX
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-chat-id">ID чата</Label>
            <Input
              id="max-chat-id"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-1234567890"
            />
            <p className="text-xs text-muted-foreground">
              ID группы или личного чата для получения уведомлений
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={saveSettings} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить настройки
            </Button>
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing || !botToken || !chatId}
            >
              {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Отправить тестовое сообщение
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Как настроить?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="font-medium text-foreground">1. Создайте бота в MAX:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Найдите @MasterBot в мессенджере MAX</li>
              <li>Отправьте команду /create</li>
              <li>Следуйте инструкциям и получите access_token</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">2. Получите ID чата:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Добавьте бота в группу или напишите ему напрямую</li>
              <li>Используйте команду бота для получения ID чата</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">3. Проверьте настройки:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Сохраните токен и ID чата</li>
              <li>Нажмите "Отправить тестовое сообщение"</li>
              <li>Убедитесь, что сообщение пришло в MAX</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}