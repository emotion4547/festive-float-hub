
# План внедрения Prerendering для SEO на VPS

## ✅ ВЫПОЛНЕНО

## Проблема
Сайт на React SPA отдаёт пустой `<div id="root">` до выполнения JavaScript. Хотя Googlebot умеет рендерить JS, это может:
- Замедлить индексирование
- Ухудшить позиции в Яндекс (хуже работает с JS)
- Сломать превью в соцсетях и мессенджерах

## Выбранное решение: Prerender.io + Nginx

Prerendering — оптимальный вариант для вашего случая:
- Не требует переписывать код
- Работает с любым React SPA
- Боты получают готовый HTML, пользователи — обычный SPA

## Созданные файлы

### ✅ Этап 1: Sitemap.xml
**Файл:** `public/sitemap.xml` — статический базовый sitemap

### ✅ Этап 2: Edge Function для динамического sitemap
**Файл:** `supabase/functions/sitemap/index.ts`

Динамический sitemap доступен по адресу:
```
https://edzhahcogyhamcwkqszp.supabase.co/functions/v1/sitemap
```

Включает:
- Все статические страницы
- Все категории из базы данных
- Все товары в наличии
- Все опубликованные новости
- Все активные коллекции

### ✅ Этап 3: Обновление robots.txt
**Файл:** `public/robots.txt`

Добавлено:
- Правила для всех основных ботов (Google, Yandex, Bing, соцсети)
- Ссылки на оба sitemap
- Блокировка служебных страниц (/admin, /account, /cart, /checkout)

### ✅ Этап 4: Инструкция по настройке VPS
**Файл:** `docs/nginx-vps-config.md`

Содержит:
- Полный конфиг Nginx с prerendering
- Инструкцию по настройке SSL через Let's Encrypt
- Альтернативный вариант с Rendertron (self-hosted)
- Инструкции по мониторингу и отладке

---

## Следующие шаги (на вашем VPS)

1. **Зарегистрируйтесь на Prerender.io** (бесплатный план — 250 страниц/месяц)
2. **Скопируйте билд сайта** на VPS в `/var/www/radugaprazdnika.ru`
3. **Настройте Nginx** по инструкции из `docs/nginx-vps-config.md`
4. **Получите SSL сертификат** через Certbot
5. **Добавьте сайт в Google Search Console и Яндекс.Вебмастер**
6. **Отправьте sitemap** в поисковые системы

---

## Проверка

После настройки VPS проверьте:

```bash
# Проверка для обычного пользователя
curl -I https://radugaprazdnika.ru/

# Проверка для Googlebot (должен вернуть полный HTML)
curl -A "Googlebot" https://radugaprazdnika.ru/

# Проверка sitemap
curl https://radugaprazdnika.ru/sitemap.xml
```
