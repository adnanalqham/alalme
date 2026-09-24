# دليل التطوير وبيئة العمل المحلية (Development Guide) — العالمي | Alalme

يوفر هذا الدليل الخطوات اللازمة لتشغيل وتطوير واختبار منصة **العالمي (Alalme)** محلياً عبر أجزائها الثلاثة: الواجهة الخلفية (Backend)، الواجهة الأمامية (Frontend)، وتطبيق الجوال (Mobile).

---

## 1. المتطلبات الأساسية (Prerequisites)

- **Node.js**: الإصدار 20.x أو 22.x LTS.
- **PHP**: الإصدار 8.2 أو أحدث مع الامتدادات التالية:
  - `pdo_pgsql`, `pgsql`
  - `curl`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer**: الإصدار 2.x.
- **PostgreSQL**: الإصدار 16.x قيد التشغيل على المنفذ `5432`.
- **Expo CLI**: لتشغيل ومحاكاة تطبيق الجوال.

---

## 2. إعداد الواجهة الخلفية (Backend Setup)

```bash
# الانتقال لمجلد الواجهة الخلفية
cd backend

# تثبيت الحزم عبر Composer
composer install

# نسخ ملف الإعدادات
cp .env.example .env

# توليد مفتاح التشفير الأساسي
php artisan key:generate

# تشغيل ترحيلات قاعدة البيانات وإنشاء الجداول الـ 44 مع بذور البيانات الافتراضية
php artisan migrate --seed

# تشغيل خادم التطوير على المنفذ 8000
php artisan serve --port=8000
```

---

## 3. إعداد الواجهة الأمامية (Frontend Web Setup)

```bash
# الانتقال إلى المجلد الرئيسي
cd ..

# تثبيت حزم npm
npm install

# نسخ ملف البيئة
cp .env.example .env

# تشغيل خادم تطوير Vite على المنفذ 3000
npm run dev
```

> **ملاحظة حول الـ Proxy:** يتم توجيه جميع استدعاءات `/api/v1` تلقائياً من خادم Vite (المنفذ 3000) إلى خادم Laravel (المنفذ 8000) عبر إعدادات `vite.config.ts`.

---

## 4. إعداد تطبيق الجوال (Mobile Setup)

```bash
# الانتقال إلى مجلد الجوال
cd mobile

# تثبيت الحزم
npm install

# نسخ ملف البيئة
cp .env.example .env

# تشغيل بيئة Expo
npx expo start
```

---

## 5. تشغيل الاختبارات الآلية (Running Automated Tests)

يحتوي مجلد `backend/tests/` على حزم اختبار مخصصة لفحص الأمان وتدفق البيانات:

```bash
cd backend

# 1. اختبار المصادقة والتحقق من رموز الاستجابة (401, 403, 200)
php tests/end_to_end_http_admin_auth_test.php

# 2. اختبار معادلة احتساب الصلاحيات واستثناءات المستخدم الفردي
php tests/admin_rbac_security_test.php

# 3. اختبار تقارير ومؤشرات لوحة تحكم الإدارة
php tests/admin_dashboard_reports_test.php
```

---

## 6. فحص وتنسيق الأكواد (Code Style & Linting)

```bash
# تنسيق كود PHP وفق معايير PSR-12 عبر Laravel Pint
cd backend
./vendor/bin/pint

# فحص كود TypeScript للواجهة الأمامية
cd ..
npx tsc --noEmit
```
