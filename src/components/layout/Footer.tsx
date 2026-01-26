import { Link } from "react-router-dom";
import { Phone, MapPin, Clock, Youtube, MessageCircle, Send } from "lucide-react";
import { useSetting } from "@/contexts/SiteDataContext";
import { CallbackFormDialog } from "@/components/CallbackFormDialog";
import { Button } from "@/components/ui/button";

export function Footer() {
  const phone = useSetting("phone", "+7 (918) 179-00-56");
  const address = useSetting("address", "г. Краснодар, ул. Красная, 123");
  const workHours = useSetting("work_hours", "Пн-Вс: 09:00 - 21:00");
  const whatsapp = useSetting("whatsapp", "https://wa.me/79181790056");
  const telegram = useSetting("telegram", "https://t.me/+79181790056");
  const vk = useSetting("vk", "https://vk.com/radugaprazdnika");

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* О магазине */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-primary">О МАГАЗИНЕ</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/catalog" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Каталог
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                О нас
              </Link>
              <Link to="/news" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Новости
              </Link>
              <Link to="/reviews" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Отзывы
              </Link>
              <Link to="/contacts" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Контакты
              </Link>
              <Link to="/about/details" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Реквизиты
              </Link>
            </nav>
          </div>

          {/* Сервис и помощь */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-primary">СЕРВИС И ПОМОЩЬ</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/delivery" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Доставка
              </Link>
              <Link to="/payment" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Оплата
              </Link>
              <Link to="/printing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Печать на шарах
              </Link>
              <Link to="/about/warranty" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Гарантия и возврат
              </Link>
            </nav>
          </div>

          {/* Юридическая информация */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-primary">ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/about/offer" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Соглашение (Публичная оферта)
              </Link>
              <Link to="/about/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Политика обработки персональных данных
              </Link>
              <Link to="/about/mailing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Согласие на получение рекламных рассылок
              </Link>
            </nav>
          </div>

          {/* Время работы */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-primary">ВРЕМЯ РАБОТЫ</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <div>
                  <p>Время работы магазина:</p>
                  <p>{workHours}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <div>
                  <p>Прием заказов осуществляется:</p>
                  <p>с 8:00 до 21:00</p>
                  <p className="text-xs mt-1">Заказы, поступающие после 21:00 будут обработаны менеджером с 8:00 следующего дня</p>
                </div>
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-lg text-primary">КОНТАКТЫ</h4>
            <div className="space-y-3">
              <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-semibold">{phone}</span>
              </a>
              <div className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span>Приходите к нам в магазин:<br />{address}</span>
              </div>
              
              {/* Callback button */}
              <CallbackFormDialog
                trigger={
                  <Button variant="outline" size="sm" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    Заказать звонок
                  </Button>
                }
              />
              
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="text-primary">Подписывайтесь:</span>
              </div>
              <div className="flex items-center gap-3">
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4 text-white" />
                  </a>
                )}
                {telegram && (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-full bg-[#0088cc] flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label="Telegram"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </a>
                )}
                {vk && (
                  <a
                    href={vk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 rounded-full bg-[#0077FF] flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label="VK"
                  >
                    <span className="font-bold text-xs text-white">VK</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Bottom bar */}
        <div className="border-t border-background/10 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © 2026 Радуга Праздника. Все права защищены.
            </p>
            <div className="flex items-center gap-4">
              <img src="https://cdn.svgporn.com/logos/visa.svg" alt="Visa" className="h-6 opacity-70" />
              <img src="https://cdn.svgporn.com/logos/mastercard.svg" alt="Mastercard" className="h-6 opacity-70" />
              <span className="text-xs bg-[#4CAF50] text-white px-2 py-1 rounded opacity-70">МИР</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
