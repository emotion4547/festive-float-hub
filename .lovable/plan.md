

# План оптимизации производительности и исправления неактивных элементов

## Часть 1: Оптимизация производительности

### 1.1 Оптимизация ShaderGradient
- Добавить проверку `prefers-reduced-motion` для пользователей, которые предпочитают меньше анимаций
- Снизить параметры `uDensity` и `uFrequency` для уменьшения нагрузки
- Опционально: заменить на статический CSS-градиент для мобильных устройств

### 1.2 Ленивая загрузка видео
- Добавить Intersection Observer для видео в ProductCard
- Проигрывать видео только когда карточка попадает в viewport
- Приостанавливать видео, когда карточка выходит из зоны видимости

### 1.3 Оптимизация 3D-карточек
- Добавить `requestAnimationFrame` для throttling mousemove событий
- Опционально отключить эффект на мобильных устройствах

### 1.4 Отложенная загрузка компонентов
- Обернуть FortuneWheelDialog в React.lazy()
- Использовать динамический импорт для тяжёлых компонентов

---

## Часть 2: Исправление неактивных ссылок

### 2.1 Создать недостающие страницы

**Новые файлы:**
- `src/pages/AboutDetailsPage.tsx` - страница "Реквизиты"
- `src/pages/MailingConsentPage.tsx` - страница согласия на рассылки

**Обновить App.tsx:**
```tsx
<Route path="/about/details" element={<AboutDetailsPage />} />
<Route path="/about/mailing" element={<MailingConsentPage />} />
```

### 2.2 Исправить быстрые фильтры в каталоге

**Обновить CatalogPage.tsx:**
```tsx
// Добавить извлечение параметра filter
const filterParam = searchParams.get("filter");

// Добавить логику в useEffect или useMemo:
useEffect(() => {
  if (filterParam === "hits") {
    setFilters(prev => ({ ...prev, isHit: true }));
  } else if (filterParam === "sale") {
    setFilters(prev => ({ ...prev, hasSale: true }));
  } else if (filterParam === "new") {
    setFilters(prev => ({ ...prev, isNew: true }));
  } else if (filterParam === "budget") {
    setFilters(prev => ({ ...prev, priceRange: [0, 3000] }));
  }
}, [filterParam]);

// Обновить фильтрацию продуктов:
if (filterParam === "hits") {
  result = result.filter(p => p.is_hit);
}
if (filterParam === "sale") {
  result = result.filter(p => p.discount && p.discount > 0);
}
if (filterParam === "new") {
  result = result.filter(p => p.is_new);
}
```

### 2.3 Исправить форму подписки на новости

**Обновить Index.tsx:**
- Добавить state для email
- Добавить обработчик отправки формы
- Сохранять email в таблицу `newsletter_subscribers` (создать миграцию)
- Показывать уведомление об успехе/ошибке

---

## Часть 3: Технические детали

### Файлы для изменения:
1. `src/pages/Index.tsx` - оптимизация ShaderGradient + форма подписки
2. `src/components/products/ProductCard.tsx` - ленивая загрузка видео
3. `src/components/ui/3d-card.tsx` - throttling mousemove
4. `src/pages/CatalogPage.tsx` - поддержка filter параметра
5. `src/App.tsx` - добавление новых маршрутов
6. `src/components/layout/Layout.tsx` - lazy loading FortuneWheelDialog

### Новые файлы:
1. `src/pages/AboutPage.tsx`
2. `src/pages/AboutDetailsPage.tsx`  
3. `src/pages/MailingConsentPage.tsx`

### Миграция базы данных:
- Создать таблицу `newsletter_subscribers` для подписок на рассылку

---

## Ожидаемые результаты

**Производительность:**
- Уменьшение нагрузки на GPU за счёт оптимизации WebGL
- Меньше одновременно играющих видео
- Более плавное отслеживание мыши для 3D-карточек

**Функциональность:**
- Все ссылки в меню будут вести на существующие страницы
- Быстрые фильтры в мобильном меню будут работать
- Форма подписки будет сохранять email

