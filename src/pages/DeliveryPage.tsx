import { Layout } from "@/components/layout/Layout";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageContent, useSetting } from "@/contexts/SiteDataContext";
import { SEOHead } from "@/components/SEOHead";

const deliveryZones = [
  { zone: "Центральный район", price: "от 300 ₽", time: "1-2 ч" },
  { zone: "Прикубанский район", price: "от 300 ₽", time: "1-2 ч" },
  { zone: "Карасунский район", price: "от 500 ₽", time: "1-3 ч" },
  { zone: "Западный округ", price: "от 500 ₽", time: "1-3 ч" },
  { zone: "Пригород", price: "от 800 ₽", time: "от 1 ч" },
];

const DeliveryPage = () => {
  const content = usePageContent("delivery");
  const phone = useSetting("phone", "+7 (861) 123-45-67");
  const address = useSetting("address", "г. Краснодар, ул. Красная, 123");
  const whatsapp = useSetting("whatsapp");

  return (
    <Layout>
      <SEOHead
        title="Доставка воздушных шаров"
        description="Доставка воздушных шаров по Краснодару и Краснодарскому краю. Доставка от 2 часов, работаем ежедневно 10:00-20:00. Бесплатная доставка от 5000₽."
        keywords="доставка шаров Краснодар, доставка воздушных шаров, курьерская доставка шаров, доставка гелиевых шаров"
        canonicalPath="/delivery"
      />
      <div className="container py-8">
        <div className="flex gap-8">
          
          <main className="flex-1">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-primary/20 to-secondary/20">
              <div className="p-8 md:p-12">
                <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                  {content.main_title?.title || "ДОСТАВКА"}
                </h1>
                <p className="text-xl text-primary font-semibold">
                  по Краснодару и Краснодарскому краю
                </p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop" 
                alt="Доставка шаров"
                className="absolute right-0 top-0 h-full w-1/3 object-cover hidden md:block"
              />
            </div>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <p>
                {content.description?.content || "Получить свой заказ вы можете любым удобным способом: доставкой или самовывозом."}
              </p>
              <p>
                Компания "Радуга Праздника" осуществляет круглосуточную доставку шаров по Краснодару и Краснодарскому краю.
              </p>
            </div>

            {/* Important Info */}
            <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-secondary mb-2">ВАЖНО!</p>
                  <p className="text-sm">
                    При заказе 3-х и более наборов возможна получить скидку на доставку. Уточняйте у менеджера!
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Tariffs */}
            <h2 className="font-heading text-2xl font-bold mb-4">Доставляем 24/7</h2>
            
            {/* Delivery Zones */}
            <h2 className="font-heading text-2xl font-bold mb-4">
              {content.zone_1?.title ? "Зоны доставки" : "Зоны и стоимость доставки"}
            </h2>
            
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="px-4 py-3 text-left">Зона доставки</th>
                    <th className="px-4 py-3 text-left">Стоимость</th>
                    <th className="px-4 py-3 text-left">Время доставки</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryZones.map((zone, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="px-4 py-3 border-b">{zone.zone}</td>
                      <td className="px-4 py-3 border-b font-semibold text-primary">{zone.price}</td>
                      <td className="px-4 py-3 border-b">{zone.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Contact */}
            <div id="calculator" className="bg-primary/10 rounded-xl p-6 mb-8 text-center">
              <p className="mb-4">Окончательную сумму доставки поможет рассчитать наш менеджер</p>
              <Button 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                onClick={() => whatsapp && window.open(whatsapp, "_blank")}
              >
                Связаться с менеджером
              </Button>
            </div>

            {/* Pickup Info */}
            <h2 className="font-heading text-2xl font-bold mb-4">Самовывоз</h2>
            <div className="prose prose-lg max-w-none mb-8">
              <p>
                Также вы можете забрать свой заказ самовывозом в нашем магазине по адресу: {address}, ежедневно с 9:00 до 21:00
              </p>
              <p>
                Все самовывозы осуществляются только по готовности!
              </p>
            </div>

            {/* Map */}
            <h2 className="font-heading text-2xl font-bold mb-4">Карта доставки</h2>
            <p className="mb-4 text-muted-foreground">Стоимость доставки можно посмотреть по Карте доставок.</p>
            
            <div className="rounded-xl overflow-hidden border h-96 mb-8 flex items-center justify-center bg-muted">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Карта зон доставки по Краснодару</p>
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

export default DeliveryPage;
