# دليل النشر والإنتاج (Deployment & Operations Guide) — العالمي | Alalme

يوفر هذا المستند أفضل الممارسات المعتمدة لنشر منصة **العالمي (Alalme)** في بيئة الإنتاج السحابية المباشرة (Production).

---

## 1. متطلبات الخادم (Server Infrastructure)

- **نظام التشغيل:** Ubuntu 22.04 LTS أو 24.04 LTS.
- **خادم الويب:** Nginx مع دعم HTTP/2 و TLS 1.3.
- **معالج PHP:** PHP 8.2-FPM أو أحدث مع تفعيل Opcache.
- **قاعدة البيانات:** خادم PostgreSQL 16 مُدار أو محلي مع ضبط الـ Connection Pooling.
- **إدارة العمليات الخلفية:** Supervisor لإدارة طوابير المهام وعمليات المزامنة.

---

## 2. إعداد خادم Nginx العكسي (Nginx Reverse Proxy)

نموذج لتكوين Nginx لدعم توجيه الواجهة الأمامية وربط الـ API الخلفي:

```nginx
server {
    listen 80;
    server_name alalme.com www.alalme.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name alalme.com www.alalme.com;

    ssl_certificate /etc/letsencrypt/live/alalme.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alalme.com/privkey.pem;

    root /var/www/alalme/dist;
    index index.html;

    # توجيه واجهة الويب
    location / {
        try_files $uri $uri/ /index.html;
    }

    # توجيه واجهة برمجة التطبيقات (API)
    location /api/v1 {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3. تحسين أداء الواجهة الخلفية في بيئة الإنتاج

```bash
cd /var/www/alalme/backend

# 1. تثبيت حزم الإنتاج فقط بدون حزم التطوير
composer install --no-dev --optimize-autoloader

# 2. تخزين التكوينات والمسارات مؤقتاً لسرعة التنفيذ
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 3. تشغيل الترحيلات
php artisan migrate --force
```

---

## 4. بناء الواجهة الأمامية (Production Build)

```bash
cd /var/www/alalme

# تثبيت الحزم والبناء الإنتاجي
npm ci
npm run build

# المخرجات ستكون في مجلد dist/ المربوط بخادم Nginx
```

---

## 5. متغيرات البيئة في الإنتاج (Production Variables)

| المتغير | القيمة الموصى بها في الإنتاج |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` (إلزامي لمنع تسريب بيانات النظام) |
| `CORS_ALLOWED_ORIGINS` | النطاقات الرسمية فقط مثل `https://alalme.com` |
| `CLERK_JWKS_URL` | عنوان الـ JWKS الرسمي لحساب Clerk في وضع الإنتاج |
