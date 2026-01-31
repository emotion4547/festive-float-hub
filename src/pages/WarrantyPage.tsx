import { Layout } from "@/components/layout/Layout";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { AlertCircle, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const WarrantyPage = () => {
  return (
    <Layout>
      <SEOHead
        title="Гарантия и возврат"
        description="Условия гарантии на воздушные шары. Гарантия на полёт шаров 2-4 дня. Возврат и обмен товара. Радуга Праздника, Краснодар."
        keywords="гарантия на шары, возврат шаров, обмен воздушных шаров, гарантия полета шаров"
        canonicalPath="/about/warranty"
      />
      <div className="container py-8">
        <div className="flex gap-8">
          
          <main className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
              ГАРАНТИЯ И ВОЗВРАТ
            </h1>

            <div className="prose prose-lg max-w-none">
              <p>
                Воздушные шары не подлежат возврату или обмену в соответствии с Законом России «О защите прав потребителей» 
                (ст.25 от 1992г. №2300-1 (ред. от 25.10.2007г.)) и Постановлением Правительства Российской Федерации от 19.01.1998г. №55 
                (ред. 27.03.2007г.).
              </p>
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

export default WarrantyPage;
