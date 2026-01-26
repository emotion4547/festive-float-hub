import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarWidgets } from "@/components/layout/SidebarWidgets";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSetting, usePageContent } from "@/contexts/SiteDataContext";

const ContactsPage = () => {
  const pageContent = usePageContent("contacts");
  const phone = useSetting("phone", "+7 (861) 123-45-67");
  const phone2 = useSetting("phone_2");
  const email = useSetting("email", "info@radugaprazdnika.ru");
  const address = useSetting("address", "г. Краснодар, ул. Красная, 123");
  const workHours = useSetting("work_hours", "Пн-Вс: 09:00 - 21:00");
  const whatsapp = useSetting("whatsapp");
  const telegram = useSetting("telegram");
  const vk = useSetting("vk");
  const instagram = useSetting("instagram");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const mapEmbed = pageContent.map_embed?.content || "https://yandex.ru/map-widget/v1/?um=constructor%3A8f8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b&source=constructor";

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex gap-8">
          <Sidebar />
          
          <main className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
              {pageContent.main_title?.title || "КОНТАКТЫ"}
            </h1>

            {pageContent.description?.content && (
              <p className="text-muted-foreground mb-8">{pageContent.description.content}</p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="bg-background rounded-xl p-6 shadow-sm border">
                  <h2 className="font-heading text-xl font-bold mb-4">Свяжитесь с нами</h2>
                  
                  <div className="space-y-4">
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{phone}</p>
                        {phone2 && <p className="text-sm text-muted-foreground">{phone2}</p>}
                      </div>
                    </a>

                    <a href={`mailto:${email}`} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{email}</p>
                        <p className="text-sm text-muted-foreground">Пишите на email</p>
                      </div>
                    </a>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{address}</p>
                        <p className="text-sm text-muted-foreground">Наш магазин</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{workHours}</p>
                        <p className="text-sm text-muted-foreground">Время работы</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messengers */}
                {(whatsapp || telegram) && (
                  <div className="bg-background rounded-xl p-6 shadow-sm border">
                    <h2 className="font-heading text-xl font-bold mb-4">Мессенджеры</h2>
                    <div className="flex gap-4">
                      {whatsapp && (
                        <a 
                          href={whatsapp} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="h-5 w-5" />
                          WhatsApp
                        </a>
                      )}
                      {telegram && (
                        <a 
                          href={telegram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Send className="h-5 w-5" />
                          Telegram
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                {(vk || instagram) && (
                  <div className="bg-background rounded-xl p-6 shadow-sm border">
                    <h2 className="font-heading text-xl font-bold mb-4">Мы в социальных сетях</h2>
                    <div className="flex gap-4">
                      {vk && (
                        <a 
                          href={vk} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          VK
                        </a>
                      )}
                      {instagram && (
                        <a 
                          href={instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Form */}
              <div className="bg-background rounded-xl p-6 shadow-sm border">
                <h2 className="font-heading text-xl font-bold mb-4">Напишите нам</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Ваше имя *</label>
                    <Input
                      placeholder="Введите имя"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Email *</label>
                    <Input
                      type="email"
                      placeholder="Введите email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Телефон</label>
                    <Input
                      placeholder="+7 (___) ___-__-__"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Сообщение *</label>
                    <Textarea
                      placeholder="Введите сообщение"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Отправить сообщение
                  </Button>
                </form>
              </div>
            </div>

            {/* Map */}
            <div className="bg-background rounded-xl overflow-hidden shadow-sm border">
              <h2 className="font-heading text-xl font-bold p-6 pb-0">Как нас найти</h2>
              <div className="h-96 mt-4">
                <iframe 
                  src={mapEmbed} 
                  width="100%" 
                  height="100%" 
                  frameBorder="0"
                  title="Карта"
                  className="bg-muted"
                >
                  <div className="flex items-center justify-center h-full bg-muted">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-muted-foreground">{address}</p>
                    </div>
                  </div>
                </iframe>
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

export default ContactsPage;