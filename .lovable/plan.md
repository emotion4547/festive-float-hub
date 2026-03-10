
# План оптимизации производительности и SEO

## ✅ ВЫПОЛНЕНО

### 1. Оптимизация изображений

**Созданные файлы:**
- `src/lib/imageUtils.ts` — утилиты для оптимизации изображений через Supabase Storage Transform API
  - Автоматическая конвертация в WebP
  - Генерация srcset для responsive изображений
  - Lazy loading с Intersection Observer

- `src/components/ui/optimized-image.tsx` — компонент OptimizedImage
  - Skeleton placeholder во время загрузки
  - Автоматическая оптимизация Supabase-изображений
  - Priority loading для критичных изображений

**Обновлённые файлы:**
- `src/components/products/ProductCard.tsx` — оптимизация изображений товаров (400px, WebP, 80% quality)

### 2. SEO-разметка (Schema.org)

**Создан файл:** `src/lib/seoSchemas.ts`

Поддерживаемые схемы:
- **Product** — для страниц товаров (цена, наличие, рейтинг)
- **BreadcrumbList** — хлебные крошки
- **Organization** — информация о компании
- **LocalBusiness** — локальный бизнес с адресом и координатами
- **ItemList** — списки товаров в категориях
- **FAQPage** — часто задаваемые вопросы
- **WebSite** — с поддержкой SearchAction

**Обновлённые страницы:**
- `src/pages/ProductPage.tsx` — Product + BreadcrumbList схемы
- `src/pages/Index.tsx` — WebSite + LocalBusiness + FAQPage схемы
- `src/pages/CatalogPage.tsx` — ItemList + BreadcrumbList схемы

### 3. Оптимизация загрузки ресурсов

**Обновлён:** `index.html`
- Preconnect к Supabase Storage
- DNS prefetch для Yandex Metrika
- Preload критичных шрифтов (Montserrat, Open Sans)

---

## Как работает оптимизация изображений

Supabase Storage Transform API автоматически:
1. Конвертирует изображения в WebP (экономия до 30%)
2. Изменяет размер под нужное разрешение
3. Применяет сжатие с заданным качеством
4. Кэширует результаты на CDN

**Пример URL-преобразования:**
```
# Исходный URL:
https://xxx.supabase.co/storage/v1/object/public/product-images/photo.jpg

# Оптимизированный URL:
https://xxx.supabase.co/storage/v1/render/image/public/product-images/photo.jpg?width=400&quality=80&format=webp&resize=cover
```

---

## Ожидаемые улучшения

### Производительность:
- **LCP (Largest Contentful Paint)**: улучшение на 20-40% за счёт WebP и правильных размеров
- **FID (First Input Delay)**: улучшение за счёт lazy loading и code splitting
- **CLS (Cumulative Layout Shift)**: skeleton placeholders предотвращают сдвиги

### SEO:
- Расширенные сниппеты в поиске (rich results)
- Улучшенное понимание структуры сайта ботами
- Правильные хлебные крошки в результатах поиска
- Карточки товаров с ценой и наличием в Google

---

## Дополнительные рекомендации

### На уровне хостинга (VPS):
1. Включить Brotli/Gzip сжатие в Nginx
2. Настроить кэширование статики (уже есть в docs/nginx-vps-config.md)
3. Использовать HTTP/2 или HTTP/3

### На уровне Supabase:
1. Убедиться, что бакеты `product-images` и `product-videos` публичные
2. Рассмотреть миграцию старых изображений через Storage Transform

### Мониторинг:
1. Использовать Lighthouse для регулярной проверки
2. Настроить Real User Monitoring (RUM) через Yandex Metrika
3. Следить за Core Web Vitals в Search Console
