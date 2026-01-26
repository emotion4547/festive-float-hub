import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone } from "lucide-react";

interface CallbackFormDialogProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

export function CallbackFormDialog({ children, trigger }: CallbackFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    comment: "",
    agreePersonal: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreePersonal) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("callback_requests" as never)
        .insert({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          comment: formData.comment.trim() || null,
        } as never);

      if (error) throw error;

      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setFormData({ name: "", phone: "", comment: "", agreePersonal: false });
      setOpen(false);
    } catch (error) {
      console.error("Error submitting callback request:", error);
      toast.error("Ошибка при отправке заявки. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Заказать звонок
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Заказать обратный звонок</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="callback-name">Ваше имя *</Label>
            <Input
              id="callback-name"
              placeholder="Введите ваше имя"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callback-phone">Телефон *</Label>
            <Input
              id="callback-phone"
              placeholder="+7 (___) ___-__-__"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callback-comment">Комментарий</Label>
            <Textarea
              id="callback-comment"
              placeholder="Опишите ваш вопрос (необязательно)"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="callback-agree"
              checked={formData.agreePersonal}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, agreePersonal: checked as boolean })
              }
            />
            <label htmlFor="callback-agree" className="text-xs text-muted-foreground leading-tight cursor-pointer">
              Я даю согласие на{" "}
              <a href="/about/privacy" className="text-primary hover:underline">
                обработку своих персональных данных
              </a>
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Отправка..." : "Отправить заявку"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
