import { Layout } from "@/components/layout/Layout";

import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { CreditCard, Banknote, QrCode, Shield } from "lucide-react";

const PaymentPage = () => {
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex gap-8">
          
          <main className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
              ОПЛАТА
            </h1>

            <div className="prose prose-lg max-w-none mb-8">
              <p>
                Мы предлагаем несколько удобных способов оплаты для вашего комфорта. 
                Все платежи защищены и обрабатываются через надёжные платёжные системы.
              </p>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Card Payment */}
              <div className="bg-background rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold">Банковская карта</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Оплата картами Visa, MasterCard, МИР. Безопасные платежи через защищённое соединение.
                </p>
                <div className="flex gap-2">
                  <img src="https://cdn.svgporn.com/logos/visa.svg" alt="Visa" className="h-8" />
                  <img src="https://cdn.svgporn.com/logos/mastercard.svg" alt="Mastercard" className="h-8" />
                  <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">МИР</span>
                </div>
              </div>

              {/* Cash Payment */}
              <div className="bg-background rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold">Наличные</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Оплата наличными при получении заказа курьеру или при самовывозе в нашем магазине.
                </p>
                <p className="text-sm text-muted-foreground">
                  Курьер выдаёт чек об оплате
                </p>
              </div>

              {/* SBP Payment */}
              <div className="bg-background rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold">СБП (Система быстрых платежей)</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Мгновенная оплата через мобильное приложение вашего банка по QR-коду. Без комиссии.
                </p>
                <p className="text-sm text-muted-foreground">
                  Поддерживаются все крупные банки России
                </p>
              </div>

              {/* Online Banking */}
              <div className="bg-background rounded-xl p-6 shadow-sm border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold">Онлайн-банкинг</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Оплата через Сбербанк Онлайн, Тинькофф, Альфа-Клик и другие системы интернет-банкинга.
                </p>
                <p className="text-sm text-muted-foreground">
                  Моментальное зачисление средств
                </p>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Безопасность платежей
              </h3>
              <p className="text-muted-foreground">
                Все платежи обрабатываются через защищённое SSL-соединение. Мы не храним данные ваших банковских карт. 
                Обработка платежей осуществляется сертифицированными платёжными провайдерами.
              </p>
            </div>

            {/* FAQ */}
            <h2 className="font-heading text-2xl font-bold mb-4">Часто задаваемые вопросы</h2>
            
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Когда происходит списание средств?</h4>
                <p className="text-sm text-muted-foreground">
                  При онлайн-оплате средства списываются в момент подтверждения заказа. При оплате наличными — при получении заказа.
                </p>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Выдаётся ли чек?</h4>
                <p className="text-sm text-muted-foreground">
                  Да, электронный чек отправляется на указанный email при онлайн-оплате. При оплате наличными курьер выдаёт печатный чек.
                </p>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Можно ли оплатить заказ частями?</h4>
                <p className="text-sm text-muted-foreground">
                  Для корпоративных заказов возможна оплата по счёту с отсрочкой платежа. Свяжитесь с нами для уточнения условий.
                </p>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Как вернуть деньги за отменённый заказ?</h4>
                <p className="text-sm text-muted-foreground">
                  При отмене заказа до его отправки, средства возвращаются в течение 3-5 рабочих дней на карту, с которой была произведена оплата.
                </p>
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <div className="hidden xl:block w-64 shrink-0">
            <SidebarWidgets />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;
