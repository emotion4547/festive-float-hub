import { Layout } from "@/components/layout/Layout";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageContent, useSetting } from "@/contexts/SiteDataContext";
import { SEOHead } from "@/components/SEOHead";

interface DeliveryZone {
  zone: string;
  price: string;
  time: string;
}

const DeliveryPage = () => {
  const content = usePageContent("delivery");
  const whatsapp = useSetting("whatsapp");

  const heroTitle = content.hero?.title || "ДОСТАВКА";
  const heroSubtitle = content.hero?.content || "по Краснодару и Краснодарскому краю";
  const heroImage = (content.hero?.extra_data?.image_url as string) || "";
  const desc1 = content.description?.content || "Получить свой заказ вы можете любым удобным способом: доставкой или самовывозом.";
  const desc2 = content.description2?.content || "";
  const importantTitle = content.important?.title || "ВАЖНО!";
  const importantText = content.important?.content || "";
  const scheduleTitle = content.schedule_title?.title || "Доставляем 24/7";
  const zonesTitle = content.zones_title?.title || "Зоны и стоимость доставки";
  const zones = (content.zones?.extra_data?.zones as DeliveryZone[]) || [];
  const contactText = content.contact?.content || "Окончательную сумму доставки поможет рассчитать наш менеджер";
  const contactButton = (content.contact?.extra_data?.button_text as string) || "Связаться с менеджером";
  const pickupTitle = content.pickup_title?.title || "Самовывоз";
  const pickupText = content.pickup_text?.content || "";
  const addresses = (content.pickup_addresses?.extra_data?.addresses as string[]) || [];

  return (
    <Layout>
      <SEOHead
        title="Доставка воздушных шаров"
        description="Доставка воздушных шаров по Краснодару и Краснодарскому краю. Доставка от 2 часов. Стоимость доставки от 300 ₽."
        keywords="доставка шаров Краснодар, доставка воздушных шаров, курьерская доставка шаров, доставка гелиевых шаров"
        canonicalPath="/delivery"
      />

      <div className="container py-8">
        <div className="flex gap-8">
          <main className="flex-1">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-primary/20 to-secondary/20">
              <div className="p-8 md:p-12">
                <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">{heroTitle}</h1>
                <p className="text-xl text-primary font-semibold">{heroSubtitle}</p>
              </div>
              {heroImage && (
                <img
                  src={heroImage}
                  alt="Доставка шаров"
                  className="absolute right-0 top-0 h-full w-1/3 object-cover hidden md:block"
                />
              )}
            </div>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-8">
              {desc1 && <p>{desc1}</p>}
              {desc2 && <p>{desc2}</p>}
            </div>

            {/* Important Info */}
            {importantText && (
              <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-secondary mb-2">{importantTitle}</p>
                    <p className="text-sm">{importantText}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Title */}
            {scheduleTitle && <h2 className="font-heading text-2xl font-bold mb-4">{scheduleTitle}</h2>}

            {/* Zones */}
            {zones.length > 0 && (
              <>
                <h2 className="font-heading text-2xl font-bold mb-4">{zonesTitle}</h2>
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
                      {zones.map((zone, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                          <td className="px-4 py-3 border-b">{zone.zone}</td>
                          <td className="px-4 py-3 border-b font-semibold text-primary">{zone.price}</td>
                          <td className="px-4 py-3 border-b">{zone.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Contact */}
            <div id="calculator" className="bg-primary/10 rounded-xl p-6 mb-8 text-center">
              <p className="mb-4">{contactText}</p>
              <Button
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                onClick={() => whatsapp && window.open(whatsapp, "_blank")}
              >
                {contactButton}
              </Button>
            </div>

            {/* Pickup */}
            {(pickupTitle || addresses.length > 0) && (
              <>
                <h2 className="font-heading text-2xl font-bold mb-4">{pickupTitle}</h2>
                <div className="prose prose-lg max-w-none mb-8">
                  {pickupText && <p>{pickupText}</p>}
                  {addresses.length > 0 && (
                    <ul className="list-disc pl-6 space-y-2">
                      {addresses.map((addr, i) => (
                        <li key={i}>{addr}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </main>

          <div className="hidden xl:block w-64 shrink-0">
            <SidebarWidgets />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeliveryPage;
