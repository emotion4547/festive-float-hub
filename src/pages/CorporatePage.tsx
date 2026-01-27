import { Layout } from "@/components/layout/Layout";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { Button } from "@/components/ui/button";
import { usePageContent } from "@/contexts/SiteDataContext";
import { CallbackFormDialog } from "@/components/CallbackFormDialog";
import { Phone } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const CorporatePage = () => {
  const pageContent = usePageContent("corporate");

  // Parse services from pipe-separated string
  const services = pageContent.services?.content?.split("|") || [
    "Оформление входных групп и фасадов",
    "Декорирование залов и сцен",
    "Фотозоны с воздушными шарами",
    "Брендирование шаров логотипом компании",
    "Фигуры из шаров любой сложности",
  ];

  return (
    <Layout>
      <SEOHead
        title="Корпоративное оформление шарами"
        description="Оформление корпоративных мероприятий воздушными шарами в Краснодаре. Входные группы, фотозоны, брендирование. Заказать оформление."
        keywords="корпоративное оформление шарами, оформление мероприятий, шары на корпоратив, входные группы шарами, брендирование шаров"
        canonicalPath="/corporate"
      />
      <div className="container py-8">
        <div className="flex gap-8">
          
          <main className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
              {pageContent.main_title?.title || "КОРПОРАТИВЫ / ОФОРМЛЕНИЕ ВХОДНЫХ ГРУПП"}
            </h1>

            {/* Form Card */}
            <div className="max-w-lg mx-auto bg-background rounded-xl shadow-lg p-8">
              <h2 className="font-heading text-2xl font-bold text-center mb-6">
                ОСТАВЬ ЗАЯВКУ
              </h2>
              
              <p className="text-center text-muted-foreground mb-6">
                Оставьте заявку на обратный звонок и мы свяжемся с вами для обсуждения вашего мероприятия
              </p>

              <CallbackFormDialog
                trigger={
                  <Button className="w-full" size="lg">
                    <Phone className="h-5 w-5 mr-2" />
                    Заказать обратный звонок
                  </Button>
                }
              />
            </div>

            {/* Info Section */}
            <div className="mt-12 prose prose-lg max-w-none">
              <h2 className="font-heading text-2xl font-bold mb-4">
                {pageContent.services?.title || "Оформление корпоративных мероприятий"}
              </h2>
              
              {pageContent.description?.content && (
                <p>{pageContent.description.content}</p>
              )}
              
              <ul>
                {services.map((service, index) => (
                  <li key={index}>{service.trim()}</li>
                ))}
              </ul>
              
              {pageContent.cta_text?.content && (
                <p>{pageContent.cta_text.content}</p>
              )}

              {pageContent.benefits?.content && (
                <>
                  <h3 className="font-heading text-xl font-bold mt-8 mb-4">
                    {pageContent.benefits.title || "Преимущества"}
                  </h3>
                  <p>{pageContent.benefits.content}</p>
                </>
              )}
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

export default CorporatePage;