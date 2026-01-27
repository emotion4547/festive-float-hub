import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const MailingConsentPage = () => {
  return (
    <Layout>
      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Главная
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Согласие на рассылку</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
            Согласие на получение рекламных материалов
          </h1>

          <div className="bg-background rounded-xl p-8 shadow-sm border space-y-6">
            <section>
              <h2 className="font-heading text-xl font-semibold mb-3">1. Общие положения</h2>
              <p className="text-muted-foreground leading-relaxed">
                Настоящее Согласие регулирует порядок получения вами рекламных и информационных 
                материалов от нашей компании. Подписываясь на рассылку, вы соглашаетесь получать 
                электронные письма с информацией о новых товарах, акциях, скидках и специальных 
                предложениях.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold mb-3">2. Виды рассылок</h2>
              <ul className="text-muted-foreground space-y-2">
                <li>• Информация о новых поступлениях товаров</li>
                <li>• Уведомления о скидках и акциях</li>
                <li>• Персональные предложения и промокоды</li>
                <li>• Поздравления с праздниками</li>
                <li>• Полезные советы по выбору и оформлению</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold mb-3">3. Частота рассылок</h2>
              <p className="text-muted-foreground leading-relaxed">
                Мы уважаем ваше время и не злоупотребляем рассылками. Обычно мы отправляем 
                не более 2-4 писем в месяц. В периоды праздников частота может незначительно 
                увеличиться.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold mb-3">4. Отписка от рассылки</h2>
              <p className="text-muted-foreground leading-relaxed">
                Вы можете отписаться от рассылки в любое время. Для этого воспользуйтесь 
                ссылкой «Отписаться» в нижней части любого нашего письма или свяжитесь с 
                нами по электронной почте.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold mb-3">5. Защита данных</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ваши персональные данные надёжно защищены. Мы не передаём адреса электронной 
                почты третьим лицам и используем их исключительно для отправки собственных 
                рассылок. Подробнее о защите данных читайте в нашей{" "}
                <Link to="/about/privacy" className="text-primary hover:text-primary-hover">
                  Политике конфиденциальности
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MailingConsentPage;
