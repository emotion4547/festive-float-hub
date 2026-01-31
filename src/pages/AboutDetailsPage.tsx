import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight, Building2, FileText, Phone, Mail, MapPin } from "lucide-react";

const AboutDetailsPage = () => {
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
            <span className="text-foreground font-medium">Реквизиты</span>
          </nav>
        </div>
      </div>

      <div className="container py-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
          Реквизиты компании
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="bg-background rounded-xl p-6 shadow-sm border space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg mb-2">Юридическое лицо</h2>
                <p className="text-muted-foreground">ИП Федулова Наталья Александровна</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg mb-2">Регистрационные данные</h2>
                <div className="space-y-1 text-muted-foreground">
                  <p>ИНН: 790105979012</p>
                  <p>ОГРНИП: 317237500144251</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-background rounded-xl p-6 shadow-sm border space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg mb-2">Юридический адрес</h2>
                <p className="text-muted-foreground">
                  350000, Краснодарский край, г. Краснодар, ул. Российская 72/1 к1, Торговая галерея Опера
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg mb-2">Телефон</h2>
                <a 
                  href="tel:+79181790056" 
                  className="text-primary hover:text-primary-hover transition-colors"
                >
                  +7 (918) 179-00-56
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg mb-2">Email</h2>
                <a 
                  href="mailto:9181790056@mail.ru" 
                  className="text-primary hover:text-primary-hover transition-colors"
                >
                  9181790056@mail.ru
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutDetailsPage;
