-- Create site_settings table for global settings (phone, social links, etc.)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'url', 'phone', 'email', 'html')),
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create page_content table for editable page sections
CREATE TABLE public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  content TEXT,
  extra_data JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_slug, section_key)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings (public read, admin write)
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for page_content (public read, admin write)
CREATE POLICY "Anyone can view page content"
  ON public.page_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage page content"
  ON public.page_content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default site settings
INSERT INTO public.site_settings (key, value, label, type, category, sort_order) VALUES
  ('phone', '+7 (861) 123-45-67', 'Телефон', 'phone', 'contacts', 1),
  ('phone_2', '+7 (918) 123-45-67', 'Телефон 2', 'phone', 'contacts', 2),
  ('email', 'info@radugaprazdnika.ru', 'Email', 'email', 'contacts', 3),
  ('address', 'г. Краснодар, ул. Красная, 123', 'Адрес', 'text', 'contacts', 4),
  ('work_hours', 'Пн-Вс: 09:00 - 21:00', 'Часы работы', 'text', 'contacts', 5),
  ('whatsapp', 'https://wa.me/79181234567', 'WhatsApp', 'url', 'social', 1),
  ('telegram', 'https://t.me/radugaprazdnika', 'Telegram', 'url', 'social', 2),
  ('vk', 'https://vk.com/radugaprazdnika', 'ВКонтакте', 'url', 'social', 3),
  ('instagram', 'https://instagram.com/radugaprazdnika', 'Instagram', 'url', 'social', 4),
  ('company_name', 'Радуга Праздника', 'Название компании', 'text', 'general', 1),
  ('company_description', 'Магазин воздушных шаров в Краснодаре', 'Описание компании', 'text', 'general', 2),
  ('free_delivery_threshold', '5000', 'Бесплатная доставка от (₽)', 'text', 'delivery', 1),
  ('delivery_cost', '200', 'Стоимость доставки (₽)', 'text', 'delivery', 2);

-- Insert default page content
INSERT INTO public.page_content (page_slug, section_key, title, content, sort_order) VALUES
  -- Главная
  ('home', 'hero_title', 'Воздушные шары в Краснодаре', 'Создаём праздничное настроение с доставкой на дом', 1),
  ('home', 'hero_description', NULL, 'Более 500 композиций из шаров для любого праздника. Доставка по Краснодару от 2 часов.', 2),
  
  -- Доставка
  ('delivery', 'main_title', 'Доставка воздушных шаров', NULL, 1),
  ('delivery', 'description', NULL, 'Мы доставляем воздушные шары по всему Краснодару и пригороду. Доставка осуществляется ежедневно с 9:00 до 21:00.', 2),
  ('delivery', 'zone_1', 'Центр города', 'Бесплатно при заказе от 3000₽, иначе 200₽', 3),
  ('delivery', 'zone_2', 'Отдалённые районы', 'От 300₽ до 500₽ в зависимости от района', 4),
  ('delivery', 'zone_3', 'Пригород', 'Стоимость рассчитывается индивидуально', 5),
  
  -- Корпоративы
  ('corporate', 'main_title', 'Корпоративным клиентам', NULL, 1),
  ('corporate', 'description', NULL, 'Оформление мероприятий, офисов и торговых пространств воздушными шарами. Работаем с юридическими лицами, предоставляем полный пакет документов.', 2),
  ('corporate', 'benefits', 'Преимущества', 'Индивидуальный менеджер, скидки от объёма, отсрочка платежа, полный документооборот', 3),
  
  -- Печать на шарах
  ('printing', 'main_title', 'Печать на воздушных шарах', NULL, 1),
  ('printing', 'description', NULL, 'Нанесение логотипов, надписей и изображений на воздушные шары. Идеально для рекламных акций, корпоративных мероприятий и праздников.', 2),
  ('printing', 'min_order', 'Минимальный заказ', 'От 50 шаров с одним макетом', 3),
  
  -- Оплата
  ('payment', 'main_title', 'Способы оплаты', NULL, 1),
  ('payment', 'description', NULL, 'Мы принимаем различные способы оплаты для вашего удобства.', 2),
  ('payment', 'methods', 'Доступные способы', 'Наличными курьеру, банковской картой онлайн, безналичный расчёт для юр.лиц', 3),
  
  -- Контакты
  ('contacts', 'main_title', 'Контакты', NULL, 1),
  ('contacts', 'description', NULL, 'Свяжитесь с нами любым удобным способом. Мы работаем без выходных!', 2),
  
  -- Гарантии
  ('warranty', 'main_title', 'Гарантии и возврат', NULL, 1),
  ('warranty', 'content', NULL, 'Мы гарантируем качество всех наших товаров. Если шары сдулись в течение суток после доставки — бесплатно заменим.', 2),
  
  -- Политика конфиденциальности
  ('privacy', 'main_title', 'Политика обработки персональных данных', NULL, 1),
  ('privacy', 'content', NULL, '1. Общие положения\n\nНастоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных».\n\n2. Сбор данных\n\nМы собираем только необходимые данные для оформления заказа: имя, телефон, email, адрес доставки.\n\n3. Использование данных\n\nДанные используются исключительно для обработки заказов и связи с клиентом.\n\n4. Защита данных\n\nМы принимаем все необходимые меры для защиты ваших персональных данных.', 2),
  
  -- Публичная оферта
  ('offer', 'main_title', 'Публичная оферта', NULL, 1),
  ('offer', 'content', NULL, '1. Общие положения\n\nНастоящий документ является официальным предложением (публичной офертой) ИП "Радуга Праздника".\n\n2. Предмет договора\n\nПродавец обязуется передать в собственность Покупателя товары, а Покупатель обязуется принять и оплатить их.\n\n3. Цены и оплата\n\nЦены на товары указаны на сайте и могут быть изменены продавцом в одностороннем порядке.\n\n4. Доставка\n\nДоставка осуществляется по адресу, указанному покупателем при оформлении заказа.', 2),
  
  -- Партнёры
  ('partners', 'main_title', 'Партнёрам', NULL, 1),
  ('partners', 'description', NULL, 'Приглашаем к сотрудничеству организаторов мероприятий, event-агентства и свадебных координаторов.', 2),
  
  -- Новости
  ('news', 'main_title', 'Новости и акции', NULL, 1),
  ('news', 'description', NULL, 'Следите за нашими акциями и новинками.', 2),
  
  -- Отзывы
  ('reviews', 'main_title', 'Отзывы наших клиентов', NULL, 1),
  ('reviews', 'description', NULL, 'Мы ценим каждый отзыв и стараемся становиться лучше.', 2);

-- Triggers for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();