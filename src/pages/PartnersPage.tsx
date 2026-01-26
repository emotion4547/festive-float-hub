import { Layout } from "@/components/layout/Layout";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { Button } from "@/components/ui/button";
import { usePageContent } from "@/contexts/SiteDataContext";

const partners = [
  { name: "Газпром" },
  { name: "Пятёрочка" },
  { name: "МегаФон" },
  { name: "МОСБИРЖА ПАКТА" },
  { name: "Ленфильм" },
  { name: "2ГИС" },
  { name: "Институт стоматологии" },
  { name: "ТКБ" },
  { name: "Радиостанция" },
  { name: "Рынком" },
  { name: "Зелёное яблоко" },
  { name: "Буквоед Coffee" },
  { name: "CHICAGO" },
  { name: "VILLA" },
  { name: "VIXA" },
  { name: "Благотворительный фонд" },
  { name: "Форт Боярд" },
  { name: "Карусели" },
  { name: "Valentina" },
  { name: "Duos" },
  { name: "MODE" },
  { name: "Лакомка" },
  { name: "DIXIS" },
];

const workExamples = [
  { image: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=300&h=200&fit=crop", title: "Корпоратив 14 лет" },
  { image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=200&fit=crop", title: "Оформление офиса" },
  { image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=300&h=200&fit=crop", title: "Выставка" },
  { image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&h=200&fit=crop", title: "Детский праздник" },
  { image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=200&fit=crop", title: "Свадьба VILLA" },
  { image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=200&fit=crop", title: "День рождения" },
  { image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=300&h=200&fit=crop", title: "Выписка" },
  { image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=300&h=200&fit=crop", title: "Корпоратив" },
  { image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=300&h=200&fit=crop", title: "Новый год" },
  { image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop", title: "Праздник" },
  { image: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=300&h=200&fit=crop", title: "Детский сад" },
  { image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop", title: "Открытие магазина" },
];

const PartnersPage = () => {
  const pageContent = usePageContent("partners");

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex gap-8">
          <Sidebar />
          
          <main className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
              {pageContent.main_title?.title || "КТО РАБОТАЕТ С НАМИ"}
            </h1>

            {pageContent.description?.content && (
              <p className="text-muted-foreground mb-8">{pageContent.description.content}</p>
            )}

            {/* Partners Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {partners.map((partner, index) => (
                <div 
                  key={index}
                  className="bg-background rounded-xl p-4 flex items-center justify-center border hover:shadow-md transition-shadow"
                >
                  <div className="text-center">
                    <div className="h-12 flex items-center justify-center mb-2">
                      <span className="text-sm font-semibold text-muted-foreground">{partner.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-muted/30 rounded-xl p-6 mb-12 text-center">
              <p className="mb-4">
                {pageContent.cta_text?.content || 
                  "Мы всегда рады помочь с выбором, есть уникальные скидки и опциях подарков на все случаи и праздники"}
              </p>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Запросить КП
              </Button>
            </div>

            {/* Work Examples */}
            <h2 className="font-heading text-2xl font-bold mb-6 text-center">ПРИМЕРЫ РАБОТ</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {workExamples.map((example, index) => (
                <div key={index} className="group relative rounded-xl overflow-hidden">
                  <img 
                    src={example.image} 
                    alt={example.title}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-sm font-medium">{example.title}</p>
                    </div>
                  </div>
                </div>
              ))}
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

export default PartnersPage;