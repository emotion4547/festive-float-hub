import { useState } from "react";
import { Send, Phone, X } from "lucide-react";
import { useSetting } from "@/contexts/SiteDataContext";
import { cn } from "@/lib/utils";
import balloonsIcon from "@/assets/balloons-icon.png";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import vkIcon from "@/assets/vk-icon.png";
import instagramIcon from "@/assets/instagram-icon.png";

export function FloatingButtons() {
  const [isOpen, setIsOpen] = useState(false);
  
  const phone = useSetting("phone", "+7 (918) 179-00-56");
  const whatsapp = useSetting("whatsapp", "https://wa.me/79181790056");
  const telegram = useSetting("telegram", "https://t.me/+79181790056");
  const vk = useSetting("vk", "https://vk.com/radugaprazdnika");
  const instagram = useSetting("instagram", "https://www.instagram.com/radugaprazdnika");
  const maxMessenger = "https://max.ru/u/f9LHodD0cOJyOl9ZhpnjXvXzcCrAHRnvR1db1geUrXBMFSftkGJgT2yukZoT";

  const cleanPhone = phone.replace(/[^\d+]/g, "");

  const contactLinks = [
    {
      name: "Телефон",
      href: `tel:${cleanPhone}`,
      icon: () => <Phone className="h-5 w-5" />,
      bgColor: "bg-primary",
      hoverColor: "hover:bg-primary/90",
    },
    {
      name: "WhatsApp",
      href: whatsapp,
      icon: () => <img src={whatsappIcon} alt="WhatsApp" className="h-6 w-6 invert" />,
      bgColor: "bg-[#25D366]",
      hoverColor: "hover:bg-[#20BD5A]",
    },
    {
      name: "Telegram",
      href: telegram,
      icon: () => <Send className="h-5 w-5" />,
      bgColor: "bg-[#0088cc]",
      hoverColor: "hover:bg-[#0077b3]",
    },
    {
      name: "VK",
      href: vk,
      icon: () => <img src={vkIcon} alt="VK" className="h-6 w-6 invert" />,
      bgColor: "bg-[#0077FF]",
      hoverColor: "hover:bg-[#0066DD]",
    },
    {
      name: "Instagram",
      href: instagram,
      icon: () => <img src={instagramIcon} alt="Instagram" className="h-6 w-6 invert" />,
      bgColor: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]",
      hoverColor: "hover:opacity-90",
    },
    {
      name: "MAX",
      href: maxMessenger,
      icon: () => <span className="font-bold text-xs">MAX</span>,
      bgColor: "bg-[#FF5722]",
      hoverColor: "hover:bg-[#E64A19]",
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
          <img src={balloonsIcon} alt="Связаться" className="h-8 w-8" />
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
                <IconComponent />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
