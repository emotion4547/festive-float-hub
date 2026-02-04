# Настройка Nginx + Prerender.io на VPS

Это руководство поможет настроить VPS для хостинга React SPA с prerendering для поисковых ботов.

## Архитектура

```
                    ┌─────────────────┐
                    │    Nginx        │
                    │  (reverse proxy)│
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │  React SPA      │          │  Prerender.io   │
    │  (обычные       │          │  (для ботов)    │
    │  пользователи)  │          │                 │
    └─────────────────┘          └─────────────────┘
```

## Шаг 1: Регистрация на Prerender.io

1. Зайдите на [prerender.io](https://prerender.io) и создайте аккаунт
2. Бесплатный план включает 250 страниц/месяц
3. Скопируйте ваш **Prerender Token** из настроек

## Шаг 2: Установка зависимостей на VPS

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Nginx
sudo apt install nginx -y

# Установка Certbot для SSL
sudo apt install certbot python3-certbot-nginx -y
```

## Шаг 3: Загрузка билда React SPA

```bash
# Создаём директорию для сайта
sudo mkdir -p /var/www/radugaprazdnika.ru

# Загружаем билд (скачайте из Lovable)
# Распаковываем в /var/www/radugaprazdnika.ru
```

## Шаг 4: Конфигурация Nginx

Создайте файл `/etc/nginx/sites-available/radugaprazdnika.ru`:

```nginx
# Определяем User-Agent'ов поисковых ботов
map $http_user_agent $prerender_ua {
    default       0;
    "~*googlebot"                1;
    "~*yahoo! slurp"             1;
    "~*bingbot"                  1;
    "~*yandex"                   1;
    "~*baiduspider"              1;
    "~*facebookexternalhit"      1;
    "~*twitterbot"               1;
    "~*rogerbot"                 1;
    "~*linkedinbot"              1;
    "~*embedly"                  1;
    "~*quora link preview"       1;
    "~*showyoubot"               1;
    "~*outbrain"                 1;
    "~*pinterest\/0\."           1;
    "~*developers.google.com\/\+\/web\/snippet" 1;
    "~*slackbot"                 1;
    "~*vkshare"                  1;
    "~*w3c_validator"            1;
    "~*redditbot"                1;
    "~*applebot"                 1;
    "~*whatsapp"                 1;
    "~*flipboard"                1;
    "~*tumblr"                   1;
    "~*bitlybot"                 1;
    "~*skypeuripreview"          1;
    "~*nuzzel"                   1;
    "~*discordbot"               1;
    "~*google page speed"        1;
    "~*qwantify"                 1;
    "~*pinterestbot"             1;
    "~*bitrix link preview"      1;
    "~*xing-contenttabreceiver"  1;
    "~*chrome-lighthouse"        1;
    "~*telegrambot"              1;
}

# Проверка на запросы к файлам (не нужно пререндерить)
map $uri $prerender_file {
    default       0;
    "~*\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|doc|txt|ico|rss|zip|mp3|rar|exe|wmv|doc|avi|ppt|mpg|mpeg|tif|wav|mov|psd|ai|xls|mp4|m4a|swf|dat|dmg|iso|flv|m4v|torrent|ttf|woff|svg|eot)$" 1;
}

# Проверяем, нужен ли prerender
map "$prerender_ua:$prerender_file" $do_prerender {
    default 0;
    "1:0"   1;
}

server {
    listen 80;
    server_name radugaprazdnika.ru www.radugaprazdnika.ru;
    
    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name radugaprazdnika.ru www.radugaprazdnika.ru;
    
    # SSL сертификаты (будут созданы Certbot)
    ssl_certificate /etc/letsencrypt/live/radugaprazdnika.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/radugaprazdnika.ru/privkey.pem;
    
    # Современные SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    
    root /var/www/radugaprazdnika.ru;
    index index.html;
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;
    gzip_disable "MSIE [1-6]\.";
    
    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Основная локация
    location / {
        # Если это бот — проксируем на Prerender.io
        if ($do_prerender = 1) {
            # Замените YOUR_PRERENDER_TOKEN на ваш токен!
            rewrite .* /$scheme://$host$request_uri? break;
            proxy_pass https://service.prerender.io;
            proxy_set_header X-Prerender-Token YOUR_PRERENDER_TOKEN;
        }
        
        # Для обычных пользователей — отдаём SPA
        try_files $uri $uri/ /index.html;
    }
    
    # Блокируем доступ к скрытым файлам
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Логи
    access_log /var/log/nginx/radugaprazdnika.access.log;
    error_log /var/log/nginx/radugaprazdnika.error.log;
}
```

## Шаг 5: Активация конфига

```bash
# Создаём симлинк
sudo ln -s /etc/nginx/sites-available/radugaprazdnika.ru /etc/nginx/sites-enabled/

# Удаляем дефолтный конфиг
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl reload nginx
```

## Шаг 6: Получение SSL сертификата

```bash
# Получаем сертификат от Let's Encrypt
sudo certbot --nginx -d radugaprazdnika.ru -d www.radugaprazdnika.ru

# Автоматическое обновление (добавляется автоматически)
sudo systemctl enable certbot.timer
```

## Шаг 7: Настройка DNS

В панели управления вашим доменом создайте записи:

| Тип | Имя | Значение |
|-----|-----|----------|
| A | @ | IP_ВАШЕГО_VPS |
| A | www | IP_ВАШЕГО_VPS |

## Проверка работы

### Проверка для обычного пользователя

```bash
curl -I https://radugaprazdnika.ru/
```

### Проверка для Googlebot

```bash
curl -A "Googlebot" https://radugaprazdnika.ru/
```

Должен вернуться полный HTML с контентом.

### Проверка sitemap

```bash
curl https://radugaprazdnika.ru/sitemap.xml
# или динамический
curl https://edzhahcogyhamcwkqszp.supabase.co/functions/v1/sitemap
```

---

## Альтернатива: Self-hosted Rendertron

Если не хотите использовать Prerender.io, можно развернуть Rendertron:

### Установка Docker

```bash
sudo apt install docker.io docker-compose -y
```

### Docker Compose для Rendertron

Создайте `docker-compose.yml`:

```yaml
version: '3'
services:
  rendertron:
    image: rendertron/rendertron
    ports:
      - "3000:3000"
    restart: always
    environment:
      - TIMEOUT=30000
```

```bash
docker-compose up -d
```

### Nginx конфиг для Rendertron

Замените блок с Prerender.io на:

```nginx
location / {
    if ($do_prerender = 1) {
        rewrite .* /render/$scheme://$host$request_uri? break;
        proxy_pass http://localhost:3000;
    }
    
    try_files $uri $uri/ /index.html;
}
```

---

## Мониторинг

### Проверка логов

```bash
# Логи Nginx
sudo tail -f /var/log/nginx/radugaprazdnika.access.log

# Фильтр по ботам
sudo grep -E "(Googlebot|Yandex|Bingbot)" /var/log/nginx/radugaprazdnika.access.log
```

### Google Search Console

1. Добавьте сайт в [Google Search Console](https://search.google.com/search-console)
2. Подтвердите владение через DNS или файл
3. Отправьте sitemap: `https://radugaprazdnika.ru/sitemap.xml`
4. Используйте "Проверка URL" для проверки рендеринга

### Яндекс.Вебмастер

1. Добавьте сайт в [Яндекс.Вебмастер](https://webmaster.yandex.ru)
2. Отправьте sitemap
3. Проверьте индексацию через "Проверить URL"

---

## Troubleshooting

### Prerender не работает

1. Проверьте токен в конфиге Nginx
2. Проверьте логи: `sudo tail -f /var/log/nginx/radugaprazdnika.error.log`
3. Убедитесь, что $do_prerender корректно определяется

### Страницы не индексируются

1. Проверьте robots.txt
2. Убедитесь, что sitemap доступен
3. Проверьте, нет ли ошибок в Search Console

### SSL проблемы

```bash
# Обновление сертификата вручную
sudo certbot renew --dry-run
```
