import { useState } from "react";
import { Phone, X, ExternalLink } from "lucide-react";
import { useSetting } from "@/contexts/SiteDataContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { cn } from "@/lib/utils";
import balloonsIcon from "@/assets/balloons-icon.png";

export function FloatingButtons() {
  const [isOpen, setIsOpen] = useState(false);
  
  const phone = useSetting("phone", "+7 (918) 179-00-56");
  const { data: socialLinks } = useSocialLinks({ floating: true });

  const cleanPhone = phone.replace(/[^\d+]/g, "");

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
          {/* Phone button */}
          <a
            href={`tel:${cleanPhone}`}
            className={cn(
              "h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-all duration-200",
              "hover:bg-primary/90 hover:scale-110"
            )}
            aria-label="Телефон"
          >
            <Phone className="h-5 w-5" />
          </a>
          
          {/* Dynamic social links */}
          {socialLinks?.map((link, index) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-all duration-200 overflow-hidden",
                "hover:opacity-90 hover:scale-110"
              )}
              style={{ 
                animationDelay: `${(index + 1) * 50}ms`,
              }}
              aria-label={link.name}
            >
              {link.icon_url ? (
                <img src={link.icon_url} alt={link.name} className="h-full w-full object-cover" />
              ) : (
                <ExternalLink className="h-5 w-5" />
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
