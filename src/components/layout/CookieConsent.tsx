import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Cookie, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "cookie_consent_accepted";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasAccepted) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Even if declined, we save that user made a choice
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="container max-w-4xl mx-auto">
            <div className="bg-background border border-border rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-start">
                {/* Icon */}
                <div className="hidden md:flex shrink-0 h-12 w-12 rounded-full bg-primary/10 items-center justify-center">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
                      <Cookie className="h-5 w-5 text-primary md:hidden" />
                      Использование cookies и персональных данных
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 -mt-1 -mr-1"
                      onClick={handleDecline}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    В соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» 
                    и Федеральным законом от 13.03.2006 № 38-ФЗ «О рекламе», мы используем файлы cookies 
                    и аналогичные технологии для следующих целей:
                  </p>

                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Обеспечение корректной работы сайта и сохранение ваших предпочтений</li>
                    <li>Сбор статистических данных для улучшения качества обслуживания</li>
                    <li>Персонализация рекламных предложений и маркетинговых материалов</li>
                    <li>Анализ поведения пользователей для оптимизации сайта</li>
                  </ul>

                  <p className="text-sm text-muted-foreground">
                    Продолжая использовать сайт, вы соглашаетесь на обработку ваших персональных данных 
                    в соответствии с нашей{" "}
                    <Link 
                      to="/about/privacy" 
                      className="text-primary hover:underline font-medium"
                    >
                      Политикой обработки персональных данных
                    </Link>
                    {" "}и{" "}
                    <Link 
                      to="/about/mailing" 
                      className="text-primary hover:underline font-medium"
                    >
                      Согласием на получение рекламных рассылок
                    </Link>
                    .
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <Shield className="h-4 w-4 text-success shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Ваши данные защищены и не передаются третьим лицам без вашего согласия
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                  <Button onClick={handleAccept} className="btn-primary whitespace-nowrap">
                    Принять все
                  </Button>
                  <Button variant="outline" onClick={handleDecline} className="whitespace-nowrap">
                    Только необходимые
                  </Button>
                </div>
              </div>

              {/* Legal reference */}
              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center md:text-left">
                  Правовое основание: ФЗ-152 «О персональных данных», ФЗ-38 «О рекламе», 
                  ст. 9 ФЗ-149 «Об информации, информационных технологиях и о защите информации».{" "}
                  <Link to="/about/offer" className="text-primary hover:underline">
                    Публичная оферта
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
