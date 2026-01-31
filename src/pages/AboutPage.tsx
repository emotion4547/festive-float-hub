import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Users, Newspaper, FileText } from "lucide-react";

const AboutPage = () => {
  const navigationLinks = [
    {
      title: "Кто работает с нами",
      description: "Наши партнёры и корпоративные клиенты",
      href: "/about/partners",
      icon: Users,
    },
    {
      title: "Новости компании",
      description: "Актуальные события и акции",
      href: "/news",
      icon: Newspaper,
    },
    {
      title: "Реквизиты",
      description: "Юридическая информация о компании",
      href: "/about/details",
      icon: FileText,
    },
  ];

  const services = [
    "😎 Стильные воздушные шары",
    "📸 Фотозоны",
    "🎉 Открытие вашего бизнеса",
    "🎈 Печать на шарах",
    "💝 Именные шары",
    "👶 Выписка из роддома",
    "💐 Арки, фонтаны, букеты",
    "🥳 Праздничная атрибутика",
    "🥳 Упаковка подарков",
    "🥳 Коробка сюрприз",
  ];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Главная
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">О нас</span>
          </nav>
        </div>
      </div>

      <section className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Воздушная мастерская "Радуга праздника"
              </h1>
              <p className="text-xl text-muted-foreground">
                К вашему выбору…
              </p>
            </div>

            {/* Services List */}
            <Card className="mb-12">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service, index) => (
                    <div
                      key={index}
                      className="text-lg py-2 border-b border-muted last:border-0 md:odd:border-r md:odd:pr-4 md:even:pl-4"
                    >
                      {service}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Links */}
            <div className="space-y-4">
              <h2 className="font-heading text-2xl font-bold mb-6">
                Узнайте больше
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {navigationLinks.map((link) => (
                  <Link key={link.href} to={link.href}>
                    <Card className="h-full hover:border-primary transition-colors group cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <link.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {link.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
