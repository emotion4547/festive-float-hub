import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Cookie, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "cookie_consent_accepted";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasAccepted) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setIsVisible(false);
  };

  const handleDecline = () => {
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
          className="fixed bottom-0 left-0 right-0 z-[100] p-3 md:p-4"
        >
          <div className="container max-w-3xl mx-auto">
            <div className="bg-background border border-border rounded-xl shadow-xl p-3 md:p-4">
              <div className="flex flex-col gap-3">
                {/* Main row: icon, text, buttons */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex shrink-0 h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                    <Cookie className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Cookie className="h-4 w-4 text-primary sm:hidden shrink-0" />
                      <p className="text-sm font-medium">
                        Мы используем cookies для работы сайта
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Подробнее в{" "}
                      <Link to="/about/privacy" className="text-primary hover:underline">
                        Политике конфиденциальности
                      </Link>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="hidden sm:flex gap-1 text-xs"
                    >
                      {isExpanded ? (
                        <>Скрыть <ChevronUp className="h-3 w-3" /></>
                      ) : (
                        <>Подробнее <ChevronDown className="h-3 w-3" /></>
                      )}
                    </Button>
                    <Button onClick={handleAccept} size="sm" className="btn-primary text-xs">
                      Принять
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDecline}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mobile expand button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="sm:hidden w-full gap-1 text-xs"
                >
                  {isExpanded ? (
                    <>Скрыть подробности <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>Подробнее <ChevronDown className="h-3 w-3" /></>
                  )}
                </Button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 border-t border-border/50 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          В соответствии с ФЗ-152 «О персональных данных» и ФЗ-38 «О рекламе», 
                          мы используем cookies для:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Корректной работы сайта и сохранения предпочтений</li>
                          <li>Сбора статистики для улучшения качества</li>
                          <li>Персонализации рекламы</li>
                        </ul>
                        <div className="flex items-center gap-2 pt-1">
                          <Shield className="h-3 w-3 text-success shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            Данные защищены и не передаются третьим лицам
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs">
                          <Link to="/about/privacy" className="text-primary hover:underline">
                            Политика конфиденциальности
                          </Link>
                          <Link to="/about/mailing" className="text-primary hover:underline">
                            Согласие на рассылку
                          </Link>
                          <Link to="/about/offer" className="text-primary hover:underline">
                            Публичная оферта
                          </Link>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDecline} className="w-full mt-2 text-xs">
                          Только необходимые
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
