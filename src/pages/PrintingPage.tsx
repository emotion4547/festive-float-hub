import { Layout } from "@/components/layout/Layout";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { Star } from "lucide-react";
import { usePageContent } from "@/contexts/SiteDataContext";
import { SEOHead } from "@/components/SEOHead";

const pastelColors = [
  "#FFB6C1", "#FFC0CB", "#FFE4E1", "#FFDAB9", "#FFE4B5", "#FFFACD", 
  "#E0FFFF", "#B0E0E6", "#ADD8E6", "#87CEEB", "#87CEFA", "#B0C4DE",
  "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", "#BA55D3", "#9370DB",
];

const proColors = [
  "#FF0000", "#FF4500", "#FF6347", "#FF7F50", "#FFA500", "#FFD700",
  "#FFFF00", "#ADFF2F", "#7FFF00", "#00FF00", "#00FA9A", "#00FFFF",
  "#00CED1", "#1E90FF", "#0000FF", "#8A2BE2", "#9400D3", "#FF00FF",
];

const crystalColors = [
  "#E8E8E8", "#C0C0C0", "#A9A9A9", "#808080", "#696969", "#000000",
];

const metalColors = [
  "#FFD700", "#C0C0C0", "#CD7F32", "#B87333", "#E5C100", "#CFB53B",
];

const workExamples = [
  {
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
    title: "Печать для розничных продаж «Hello Bar»",
  },
  {
    image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=300&fit=crop",
    title: "Печать шаров для свадьбы - Hello Day",
  },
  {
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=300&fit=crop",
    title: "Корпоративные шары с логотипом",
  },
  {
    image: "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=400&h=300&fit=crop",
    title: "Шары на открытие магазина",
  },
];

const PrintingPage = () => {
  const pageContent = usePageContent("printing");

  // Parse advantages from pipe-separated string
  const advantages = pageContent.advantages?.content?.split("|") || [
    "Яркие насыщенные цвета",
    "Мелких деталей и четкого контура без разводов",
    "Краска не трескается при надувании шара",
    "Экологически безопасные материалы",
  ];

  // Parse order steps from pipe-separated string
  const orderSteps = pageContent.order_steps?.content?.split("|") || [
    "Отправьте нам макет логотипа в формате .ai, .eps, .cdr, .pdf или .png",
    "Выберите цвет шаров и укажите нужный тираж",
    "Наш дизайнер подготовит макет и отправит вам на согласование",
    "После подтверждения макета производим печать",
  ];

  return (
    <Layout>
      <SEOHead
        title="Печать на воздушных шарах"
        description="Печать логотипов и изображений на воздушных шарах в Краснодаре. Шелкография, яркие цвета, экологичные материалы. Тиражи от 50 шт."
        keywords="печать на шарах Краснодар, шары с логотипом, брендирование шаров, шелкография на шарах, корпоративные шары"
        canonicalPath="/printing"
      />
      <div className="container py-8">
        <div className="flex gap-8">
          
          <main className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {pageContent.main_title?.title || "ПЕЧАТЬ НА ШАРАХ"}
            </h1>
            <h2 className="text-xl text-primary font-semibold mb-8">
              Печать на воздушных шарах в Краснодаре
            </h2>

            {/* Main Description */}
            <div className="prose prose-lg max-w-none mb-8">
              {pageContent.description?.content ? (
                <p>{pageContent.description.content}</p>
              ) : (
                <>
                  <p>
                    Воздушные шары с печатью – это отличный способ привлечь внимание к вашему бренду, 
                    сделать праздник особенным или создать уникальный подарок. Мы предлагаем качественную 
                    печать на воздушных шарах любого цвета и размера.
                  </p>
                  <p>
                    Вы можете заказать шары с логотипом вашей компании, поздравительным текстом, 
                    фотографией или любым другим изображением. Наша технология печати обеспечивает 
                    яркие, стойкие цвета и четкие линии.
                  </p>
                </>
              )}
            </div>

            {/* Logo Printing Section */}
            <div className="bg-muted/30 rounded-xl p-6 mb-8">
              <h3 className="font-heading text-xl font-bold mb-4">
                {pageContent.technology?.title || "Печать логотипов на шариках"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {pageContent.technology?.content || 
                  "С помощью технологии шелкографии печать логотипов выполняется на латексных шарах с использованием специальных красок. Это позволяет добиться:"}
              </p>
              <ul className="space-y-2 text-sm">
                {advantages.map((advantage, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>{advantage.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Color Palette */}
            <h3 className="font-heading text-xl font-bold mb-4">Палитра цветов</h3>
            
            <div className="space-y-6 mb-8">
              {/* Pastel */}
              <div>
                <h4 className="font-semibold mb-2 text-secondary">Шары ПАСТЕЛЬ</h4>
                <div className="flex flex-wrap gap-2">
                  {pastelColors.map((color, index) => (
                    <div 
                      key={index}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* PRO */}
              <div>
                <h4 className="font-semibold mb-2 text-secondary">Шары PRO+</h4>
                <div className="flex flex-wrap gap-2">
                  {proColors.map((color, index) => (
                    <div 
                      key={index}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Crystal */}
              <div>
                <h4 className="font-semibold mb-2 text-secondary">Шары КРИСТАЛЛ</h4>
                <div className="flex flex-wrap gap-2">
                  {crystalColors.map((color, index) => (
                    <div 
                      key={index}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Metal */}
              <div>
                <h4 className="font-semibold mb-2 text-secondary">Шары МЕТАЛЛИК</h4>
                <div className="flex flex-wrap gap-2">
                  {metalColors.map((color, index) => (
                    <div 
                      key={index}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Work Examples */}
            <h3 className="font-heading text-xl font-bold mb-4">Примеры работ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {workExamples.map((example, index) => (
                <div key={index} className="group">
                  <div className="relative rounded-xl overflow-hidden mb-2">
                    <img 
                      src={example.image} 
                      alt={example.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{example.title}</p>
                </div>
              ))}
            </div>

            {/* How to Order */}
            <div className="bg-primary/10 rounded-xl p-6 mb-8">
              <h3 className="font-heading text-xl font-bold mb-4">
                {pageContent.order_steps?.title || "Как сделать заказ"}
              </h3>
              <ol className="space-y-3 text-sm">
                {orderSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">
                      {index + 1}
                    </span>
                    <span>{step.trim()}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Delivery & Payment */}
            <h3 className="font-heading text-xl font-bold mb-4">
              {pageContent.delivery_info?.title || "Доставка и оплата"}
            </h3>
            <div className="prose prose-lg max-w-none mb-8">
              <p>
                {pageContent.delivery_info?.content || 
                  "Готовый заказ вы можете забрать самовывозом или заказать доставку курьером. Срок изготовления – от 1 рабочего дня, в зависимости от сложности макета и тиража."}
              </p>
            </div>

            {/* Min Order */}
            {pageContent.min_order?.content && (
              <div className="bg-muted/30 rounded-xl p-6 mb-8">
                <h3 className="font-heading text-xl font-bold mb-2">
                  {pageContent.min_order.title || "Минимальный заказ"}
                </h3>
                <p>{pageContent.min_order.content}</p>
              </div>
            )}

            {/* Reviews */}
            <h3 className="font-heading text-xl font-bold mb-4">Отзывы клиентов</h3>
            <div className="bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl p-6">
              <div className="flex items-start gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-accent-yellow text-accent-yellow" />
                ))}
              </div>
              <blockquote className="text-lg italic mb-2">
                "Логотип напечатанный на шарах очень качественный, спасибо за ответственный подход❤️"
              </blockquote>
              <p className="text-sm text-muted-foreground">— Довольный клиент</p>
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

export default PrintingPage;