import { useState } from "react";
import { MessageCircle, Send, Phone, X } from "lucide-react";
import { useSetting } from "@/contexts/SiteDataContext";
import { cn } from "@/lib/utils";
import { CallbackFormDialog } from "@/components/CallbackFormDialog";
import { Button } from "@/components/ui/button";

export function FloatingButtons() {
  const [isOpen, setIsOpen] = useState(false);
  
  const phone = useSetting("phone", "+7 (918) 179-00-56");
  const whatsapp = useSetting("whatsapp", "https://wa.me/79181790056");
  const telegram = useSetting("telegram", "https://t.me/+79181790056");
  const vk = useSetting("vk", "https://vk.com/radugaprazdnika");

  const cleanPhone = phone.replace(/[^\d+]/g, "");

  const contactLinks = [
    {
      name: "Телефон",
      href: `tel:${cleanPhone}`,
      icon: Phone,
      bgColor: "bg-primary",
      hoverColor: "hover:bg-primary/90",
    },
    {
      name: "WhatsApp",
      href: whatsapp,
      icon: MessageCircle,
      bgColor: "bg-[#25D366]",
      hoverColor: "hover:bg-[#20BD5A]",
    },
    {
      name: "Telegram",
      href: telegram,
      icon: Send,
      bgColor: "bg-[#0088cc]",
      hoverColor: "hover:bg-[#0077b3]",
    },
    {
      name: "VK",
      href: vk,
      icon: () => <span className="font-bold text-sm">VK</span>,
      bgColor: "bg-[#0077FF]",
      hoverColor: "hover:bg-[#0066DD]",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
      {/* Main toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300",
          isOpen ? "rotate-0" : "animate-pulse-soft",
          "hover:scale-110"
        )}
        aria-label={isOpen ? "Закрыть меню контактов" : "Открыть меню контактов"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <span className="text-2xl">🎈</span>
        )}
      </button>

      {/* Tooltip when closed */}
      {!isOpen && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg px-4 py-2 whitespace-nowrap animate-fade-in">
          <span className="text-sm font-medium">Свяжитесь с нами!</span>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-background rotate-45 shadow-lg"></div>
        </div>
      )}

      {/* Contact links */}
      {isOpen && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {/* Callback form button */}
          <CallbackFormDialog
            trigger={
              <button
                className="h-12 w-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Заказать звонок"
              >
                <Phone className="h-5 w-5" />
              </button>
            }
          />
          
          {contactLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                target={link.href.startsWith("tel:") ? undefined : "_blank"}
                rel={link.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
                className={cn(
                  "h-12 w-12 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-200",
                  link.bgColor,
                  link.hoverColor,
                  "hover:scale-110"
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                }}
                aria-label={link.name}
              >
                <IconComponent className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
