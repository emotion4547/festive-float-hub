

# Анализ отчета Google PageSpeed Insights и план оптимизации

## Текущие показатели (мобильные)

| Метрика | Значение | Норма |
|---------|----------|-------|
| Performance | **19** | 90+ |
| FCP | 9.7 сек | < 1.8 сек |
| LCP | 29.7 сек | < 2.5 сек |
| TBT | 20 650 мс | < 200 мс |
| CLS | 0.145 | < 0.1 |
| Speed Index | 21.0 сек | < 3.4 сек |

## Выявленные проблемы и решения

### 1. КРИТИЧЕСКОЕ: Логотип logo.png — 1222 KiB

Файл `public/assets/logo.png` весит ~1.2 МБ. Он загружается в Header, Footer, MobileMenu, AdminSidebar. Это главный блокер LCP.

**Решение:** Конвертировать logo.png в WebP/AVIF с уменьшением до нужных размеров (max 200px высота), что даст ~10-30 KiB вместо 1222 KiB. Создать несколько размеров: logo.webp (полный), logo-small.webp (для header 32-48px).

### 2. КРИТИЧЕСКОЕ: Главная загружает ВСЕ продукты (~1837 шт)

`useProducts({})` на главной странице загружает все товары без лимита (ограничение Supabase — 1000 строк). Отчет показывает запрос `products?select=*` с ответом 60+ KiB. На главной отображается всего 8 товаров (`MAX_PRODUCTS = 8`).

**Решение:** Добавить `limit: 50` или `isHit: true` в вызов `useProducts` на главной. Также `CategoriesSection` получает все products чтобы найти картинку категории — заменить на отдельный легкий запрос.

### 3. КРИТИЧЕСКОЕ: useFilterOptions делает 5 последовательных запросов

`useFilterOptions.ts` запрашивает: categories, products (для category counts), products.type, products.occasion, products.size, products.colors — 6 запросов при каждом рендере. На главной странице это не нужно вообще.

**Решение:** Убрать `DynamicFilterSidebar` с главной страницы (фильтры нужны только в `/catalog`). Это уберет ~6 запросов с критического пути.

### 4. КРИТИЧЕСКОЕ: ShaderGradient / Three.js на главной

`shadergradient` использует Three.js (~550 KiB JS). Даже с lazy loading он попадает в критический путь, т.к. загружается сразу при рендере hero. Отчет показывает 1661 KiB основного бандла + FortuneWheel — ещё 17 KiB.

**Решение:** 
- Отключить ShaderGradient на мобильных (показывать CSS-градиент)
- Загружать ShaderGradient только после `requestIdleCallback` или через 3 секунды
- Рассмотреть замену на CSS-анимированный градиент полностью

### 5. ВАЖНОЕ: Нет кэширования (Cache-Control 14 сек)

Все изображения из Supabase Storage имеют TTL 14 секунд. Категории (~1.5 MiB каждая), продукты, иконки соц.сетей — всё перезагружается.

**Решение:** Это настраивается на уровне Nginx VPS. Добавить `Cache-Control: public, max-age=31536000, immutable` для статики. На уровне кода — нет возможности повлиять на заголовки Supabase Storage.

### 6. ВАЖНОЕ: Render-blocking CSS — 87.9 KiB

Основной CSS файл (`index-C8pEWRUS.css`) блокирует рендер на 1050 мс.

**Решение:** Вынести критический CSS inline в `<head>` (шрифты, layout, hero). Остальное загружать асинхронно. Также удалить неиспользуемый CSS (Tailwind purge уже работает, но можно проверить).

### 7. ВАЖНОЕ: Неиспользуемые preconnect

Google Fonts и Supabase preconnect есть, но fonts.gstatic.com возвращает 404 на один из шрифтов (preload указывает конкретный файл woff2, который может не существовать).

**Решение:** Убрать preload конкретных файлов шрифтов (они могут меняться). Оставить только preconnect. Или перейти на self-hosted шрифты.

### 8. ВАЖНОЕ: svgporn.com иконки (Visa/Mastercard)

Footer, PaymentPage и SidebarWidgets загружают SVG с `cdn.svgporn.com` без кэша.

**Решение:** Скачать SVG-иконки Visa/Mastercard/МИР и поместить в `public/assets/`.

### 9. СРЕДНЕЕ: Forced reflow в JS

Отчет показывает 152 мс layout thrashing в основном бандле.

**Решение:** Проверить компоненты, использующие `offsetWidth`/`getBoundingClientRect` — вероятно, 3D-карточки или hover-эффекты. Обернуть в `requestAnimationFrame`.

### 10. СРЕДНЕЕ: Main thread work — 41.7 сек

Script Evaluation 1251 мс, Rendering 410 мс, Style & Layout 283 мс.

**Решение:** Code splitting — вынести страницы в lazy-loaded чанки через React.lazy в App.tsx.

---

## Порядок реализации (по приоритету влияния)

1. **Сжать logo.png** → WebP, ~20 KiB (экономия ~1200 KiB, прямое влияние на LCP)
2. **Ограничить запросы на главной** — limit products, убрать useFilterOptions (экономия ~6 запросов, ~120 KiB данных)
3. **Отключить ShaderGradient на мобильных** — CSS-градиент вместо Three.js (экономия ~550 KiB JS parse)
4. **Заменить svgporn на локальные SVG** (убрать внешние запросы)
5. **Убрать preload шрифтов** (404 ошибка)
6. **Code splitting для страниц** в App.tsx через React.lazy
7. **Self-hosted шрифты** (опционально, для полного контроля кэша)

### Ожидаемый результат
- LCP: 29.7 → ~5-8 сек (мобильный на 4G)
- FCP: 9.7 → ~3-4 сек
- TBT: 20650 → ~1000-2000 мс
- Performance Score: 19 → ~45-60

Для достижения 90+ потребуется также SSR/prerendering (уже настроен через Nginx) и оптимизация на уровне хостинга (Brotli, HTTP/2, CDN).

