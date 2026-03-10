

# План дальнейшей оптимизации производительности

## Текущее состояние
Уже выполнено: code splitting, WebP логотип, limit на продукты, отключение ShaderGradient на мобильных, локальные SVG. Остаются значительные возможности для улучшения.

---

## 1. Критическое: Google Fonts блокирует рендер (~500-800 мс)

**Проблема:** `@import url('https://fonts.googleapis.com/...')` в `index.css` (строка 9) — это render-blocking CSS import. Браузер не рисует страницу, пока не загрузит шрифты.

**Решение:**
- Перенести загрузку шрифтов из CSS `@import` в `<link>` тег в `index.html` с `display=swap`
- Добавить `font-display: swap` для мгновенного отображения текста системным шрифтом

---

## 2. Критическое: Водопад запросов на главной (8+ параллельных)

**Проблема:** При загрузке главной страницы происходит каскад запросов:
- `SiteDataContext` → site_settings + page_content (2 запроса)
- `AuthContext` → auth.getSession + user_roles (2 запроса)
- `Index` → products + categories + banners + reviews + collections (5 запросов)
- `Header` → social_links (1 запрос)
- `FloatingButtons` → social_links (ещё 1 запрос)

**Решение:**
- Объединить запросы social_links: Header и FloatingButtons делают отдельные запросы с разными фильтрами — загружать все active social_links один раз и фильтровать на клиенте
- Defer загрузку reviews и collections на главной — они ниже fold, загружать через IntersectionObserver или `requestIdleCallback`
- Настроить `staleTime` в QueryClient, чтобы повторные навигации не делали новые запросы

---

## 3. Важное: QueryClient без кэширования

**Проблема:** `const queryClient = new QueryClient()` создаётся с дефолтными настройками — `staleTime: 0`, что означает каждый mount компонента делает новый запрос.

**Решение:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 минут
      gcTime: 10 * 60 * 1000,    // 10 минут
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 4. Важное: CatalogPage и ProductPage загружаются eager

**Проблема:** `CatalogPage` и `ProductPage` импортируются eager в App.tsx (строки 15-16), хотя пользователь может никогда не зайти на них при первом визите.

**Решение:** Перевести на lazy import — они не нужны для начального рендера главной.

---

## 5. Среднее: Тяжёлые зависимости в критическом пути

**Проблема:** 
- `react-helmet-async` загружается синхронно в main.tsx
- `date-fns` импортируется с `ru` locale в AgendaSection (в hero-секции)
- `recharts` (если используется) — тяжёлая библиотека

**Решение:**
- Убрать `HelmetProvider` из main.tsx — react-helmet-async можно инициализировать лениво или заменить на нативные `document.title` вызовы
- Использовать динамический import для date-fns locale

---

## 6. Среднее: Оптимизация изображений категорий

**Проблема:** `CategoriesSection` использует обычные `<img>` без оптимизации, а `getCategoryImage()` ищет продукт в массиве products для каждой категории.

**Решение:** Использовать компонент `OptimizedImage` для изображений категорий с `loading="lazy"` и `width/height` атрибутами.

---

## 7. Среднее: Yandex Metrika в head блокирует парсинг

**Проблема:** Скрипт Яндекс.Метрики загружается синхронно в `<head>`, хотя он async — всё равно парсит JS в критическом пути.

**Решение:** Перенести скрипт Метрики в конец `<body>`, после `<div id="root">`.

---

## Порядок реализации (по влиянию на скорость)

1. **Google Fonts → link tag** (экономия ~500-800 мс FCP)
2. **QueryClient staleTime** (убрать повторные запросы, меньше нагрузки)
3. **Lazy import CatalogPage + ProductPage** (уменьшить initial bundle ~50-100 KiB)
4. **Отложить reviews/collections** на главной (меньше запросов до интерактивности)
5. **Яндекс.Метрика в конец body** (~100 мс экономии TBT)
6. **OptimizedImage в категориях** (быстрее LCP для категорий)
7. **Объединить social_links запросы** (на 1 запрос меньше)

### Ожидаемый результат
- FCP: ~3-4 сек → ~2-3 сек (мобильный)
- TBT: снижение на ~500-1000 мс
- Performance Score: ~45-60 → ~55-70

