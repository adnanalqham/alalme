# العالمي | Alalme

**العالمي (Alalme)** منصة رقمية متكاملة لإدارة وعرض وشراء قطع غيار السيارات، تربط العملاء بمتاجر قطع الغيار عبر منظومة موحدة تشمل: قاعدة مركبات مدعومة من NHTSA، كتالوج منتجات، مخزون متعدد الفروع، نظام طلبات وسلة تسوق، تقييمات، إشعارات، إدارة متاجر، وصلاحيات متقدمة (RBAC).

يتألف المشروع من **ثلاثة تطبيقات متكاملة**: واجهة ويب (React + TypeScript)، خلفية API (Laravel 11 + PostgreSQL)، وتطبيق جوال (React Native + Expo).

---

## المحتويات

- [نظرة عامة](#نظرة-عامة)
- [الميزات الرئيسية](#الميزات-الرئيسية)
- [المعمارية](#المعمارية)
- [التقنيات المستخدمة](#التقنيات-المستخدمة)
- [هيكل المشروع](#هيكل-المشروع)
- [قاعدة البيانات](#قاعدة-البيانات)
- [نظام المصادقة](#نظام-المصادقة)
- [نظام الصلاحيات RBAC](#نظام-الصلاحيات-rbac)
- [API Reference](#api-reference)
- [الاختبارات](#الاختبارات)
- [تشغيل المشروع](#تشغيل-المشروع)
- [متغيرات البيئة](#متغيرات-البيئة)

---

## نظرة عامة

**العالمي** يحل مشكلة تشتت سوق قطع غيار السيارات عبر توحيده في منصة واحدة تربط:

- **العملاء** بمتاجر قطع الغيار الموثوقة، مع دعم مركبات العميل من قاعدة NHTSA.
- **أصحاب المتاجر والموظفين** بأدوات إدارة المنتجات والمخزون والطلبات.
- **الإدارة** بلوحة تحكم متكاملة لمراقبة المنصة واعتمادها.

**الأسواق المستهدفة:** اليمن، المملكة العربية السعودية، الإمارات.

**اللغات المدعومة:** العربية (RTL) والإنجليزية — مع دعم ثنائية اللغة في كل من الويب والجوال.

---

## الميزات الرئيسية

### العميل (Customer)

| الميزة | التفاصيل |
|---|---|
| التسجيل وتسجيل الدخول | عبر Clerk (بريد، هاتف، OTP، Google، Apple) |
| مرآبي (My Garage) | إضافة وإدارة مركبات المستخدم مع تحديد المركبة الافتراضية |
| البحث والتصفح | بحث بالاسم، الفئة، الماركة، والتوافق مع المركبة |
| صفحة المنتج | صور متعددة، مواصفات، قائمة التوافق مع المركبات |
| السلة | إضافة/تعديل/حذف عناصر |
| إتمام الطلب (Checkout) | تأكيد الطلب مع دعم متعدد المتاجر في طلب واحد |
| تتبع الطلبات | عرض حالة الطلب وتاريخ الحالات |
| المفضلة (Wishlist) | إضافة/إزالة المنتجات |
| التقييمات | تقييم المتجر بعد إتمام الطلب |
| الإشعارات | استقبال وقراءة إشعارات النظام |
| الطلب الخارجي | نموذج طلب قطعة غير متوفرة |
| الملف الشخصي | تحديث البيانات والعنوان |

### صاحب المتجر (Shop Owner)

| الميزة | التفاصيل |
|---|---|
| الملف التجاري | تحديث بيانات المتجر، الشعار، وساعات العمل |
| إدارة الفروع | إضافة وتعديل وحذف الفروع |
| إدارة الموظفين | دعوة موظفين، تعديل صلاحياتهم، تعليق الحساب |
| إدارة المنتجات | إضافة/تعديل/حذف المنتجات، رفع صور متعددة، تحديد التوافق مع المركبات |
| إدارة المخزون | تتبع الكميات، تعديل المخزون، عرض حركات المخزون |
| إدارة الطلبات | استقبال وتأكيد ومتابعة طلبات المتجر |
| لوحة التحليلات | إحصاءات المبيعات والطلبات والمنتجات الأكثر مبيعاً |

### موظف المتجر (Shop Employee)

- صلاحيات قابلة للتخصيص بالكامل من قِبل صاحب المتجر.
- يمكن منح/حجب صلاحيات بعينها على مستوى الفرد.
- وصول محدود للمنتجات والمخزون والطلبات حسب الدور المُعيَّن.

### الإدارة (Admin)

لوحة تحكم شاملة تضم:

| القسم | الوصف |
|---|---|
| لوحة رئيسية | KPIs المنصة، مبيعات اليوم/الشهر، المتاجر النشطة، عدد المستخدمين |
| إدارة المستخدمين | عرض، تعديل، تعليق، تغيير دور أي مستخدم |
| إدارة المتاجر | عرض المتاجر وطلبات الانضمام، الاعتماد/الرفض/التعليق |
| موافقة المتاجر | قائمة انتظار طلبات التسجيل الجديدة |
| إدارة المنتجات | رؤية شاملة وتفعيل/تعطيل أي منتج في المنصة |
| إدارة التصنيفات | شجرة تصنيفات ثنائية اللغة مع دعم التداخل |
| إدارة الطلبات | عرض ومتابعة جميع طلبات المنصة |
| التقارير | تقارير مبيعات، أداء المتاجر، ملخصات دورية |
| إدارة العمولات | تعريف ومتابعة عمولات المتاجر |
| إدارة الموظفين | عرض موظفي جميع المتاجر |
| المخزون | رؤية مجمّعة لمخزون المنصة |
| الجغرافيا | إدارة الدول والمدن |
| نظام الأدوار | إنشاء أدوار مخصصة، مضاعفتها، وإدارة صلاحياتها |
| مصفوفة الصلاحيات | عرض وتعديل صلاحيات كل دور بشكل مرئي |
| إدارة الوصول الفردي | منح/حجب صلاحيات محددة على مستوى المستخدم |
| سجل المراجعة (Audit) | تتبع جميع الإجراءات الإدارية |
| البانرات الإعلانية | إدارة بانرات الصفحة الرئيسية |
| إعدادات المنصة | إعدادات عامة للمنصة |
| مزامنة قاعدة المركبات | مزامنة بيانات المركبات من NHTSA vPIC |

---

## المعمارية

`
┌─────────────────────────────────────────────────────────────┐
│                    العالمي | Alalme                         │
├──────────────────┬──────────────────┬───────────────────────┤
│  Frontend (Web)  │  Mobile (Native) │  Backend (API)        │
│  React + Vite    │  React Native    │  Laravel 11           │
│  TypeScript      │  Expo            │  PHP 8.2+             │
│  Tailwind CSS    │  TypeScript      │  PostgreSQL           │
└──────────────────┴──────────────────┴───────────────────────┘
`

### تدفق المصادقة

`
Clerk (Identity Provider)
        |
        v  JWT Bearer Token
AuthenticateWithClerk Middleware
        |
        v  Validate Token (JWKS)
ClerkAuthService -> resolveUser()
        |
        v  Alalme User (role + status)
RequireRole / RequirePermission Middleware
        |
        v
Controller -> Business Logic -> Response
`

### تدفق الصلاحيات (RBAC)

`
صلاحيات الدور الأساسية
        +
صلاحيات ممنوحة للمستخدم
        -
صلاحيات محجوبة للمستخدم
        =
الصلاحيات الإجمالية الفعّالة
`

---

## التقنيات المستخدمة

### الواجهة الأمامية (Frontend)

| التقنية | الإصدار | الاستخدام |
|---|---|---|
| React | 19 | إطار واجهة المستخدم |
| TypeScript | 5.x | كتابة قوية الأنواع |
| Vite | 6 | أداة البناء والتطوير |
| Tailwind CSS | 3 | التصميم والتنسيق |
| React Router DOM | 7 | التوجيه (Hash Routing) |
| Clerk React | latest | المصادقة في الواجهة |
| Recharts | latest | الرسوم البيانية والإحصاءات |
| Lucide React | latest | الأيقونات |

### الخلفية (Backend)

| التقنية | الإصدار | الاستخدام |
|---|---|---|
| Laravel | 11 | إطار API |
| PHP | 8.2+ | لغة البرمجة |
| PostgreSQL | 14+ | قاعدة البيانات |
| Laravel Sanctum | 4.x | بنية المصادقة |
| Firebase PHP JWT | latest | التحقق من رموز Clerk JWT |
| GuzzleHTTP | 7.x | طلبات HTTP لـ NHTSA و Clerk API |
| PHPUnit | 11 | اختبارات الوحدة |

### التطبيق الجوال (Mobile)

| التقنية | الإصدار | الاستخدام |
|---|---|---|
| React Native | 0.86 | إطار التطبيق الجوال |
| Expo | 57 | أداة التطوير والبناء |
| React Navigation | 7 | التنقل (Stack + Bottom Tabs) |
| Clerk Expo | 2.x | المصادقة في التطبيق الجوال |
| Expo Secure Store | 57 | حفظ التوكن بشكل آمن |

---

## هيكل المشروع

`
alalme/
├── api/                        # طبقة HTTP client وخدمات الـ API
│   ├── db.ts                   # البيانات التجريبية المحلية
│   ├── index.ts                # نقطة تصدير API
│   ├── security.ts             # مساعدات التحقق من الصلاحيات
│   ├── services.ts             # خدمات المنتجات والمتاجر والعملاء
│   ├── servicesAdmin.ts        # خدمات لوحة الإدارة
│   ├── servicesOrders.ts       # خدمات الطلبات
│   └── session.ts              # إدارة جلسة المستخدم
│
├── components/                 # المكونات المشتركة
│   ├── admin/                  # مكونات لوحة الإدارة
│   ├── brand/                  # Logo وعناصر الهوية البصرية
│   ├── layout/                 # تخطيطات الصفحات (Admin/Public/Shop)
│   ├── ui/                     # مكونات UI الأساسية (Primitives)
│   ├── ErrorBoundary.tsx       # معالجة أخطاء React
│   ├── Navbar.tsx              # شريط التنقل الرئيسي
│   ├── Footer.tsx              # تذييل الصفحة
│   ├── guards.tsx              # حراسة المسارات (Route Guards)
│   └── SafeClerkProvider.tsx   # مزود Clerk الآمن
│
├── context/                    # React Context (إدارة الحالة)
│   ├── AuthContext.tsx          # حالة المصادقة والمستخدم
│   ├── CartContext.tsx          # حالة سلة التسوق
│   ├── DataContext.tsx          # بيانات المنصة
│   ├── LanguageContext.tsx      # اللغة والاتجاه (AR/EN + RTL/LTR)
│   └── ToastContext.tsx         # إشعارات النظام
│
├── pages/                      # صفحات التطبيق
│   ├── Home.tsx                # الصفحة الرئيسية
│   ├── Search.tsx              # البحث والتصفية
│   ├── PartDetails.tsx         # صفحة المنتج
│   ├── ShopList.tsx            # قائمة المتاجر
│   ├── ShopDetail.tsx          # صفحة المتجر
│   ├── Cart.tsx                # سلة التسوق
│   ├── Checkout.tsx            # إتمام الطلب
│   ├── Orders.tsx              # قائمة الطلبات
│   ├── OrderDetail.tsx         # تفاصيل الطلب
│   ├── Profile.tsx             # الملف الشخصي
│   ├── Login.tsx               # تسجيل الدخول
│   ├── Register.tsx            # إنشاء حساب
│   ├── Notifications.tsx       # الإشعارات
│   ├── Inbox.tsx               # صندوق الرسائل
│   ├── ExternalRequest.tsx     # طلب قطعة خارجية
│   ├── ContactUs.tsx           # تواصل معنا
│   ├── admin/                  # لوحة الإدارة (23 صفحة)
│   └── shop/                   # لوحة المتجر (8 صفحات)
│
├── services/                   # خدمات مساعدة
│   ├── adminApi.ts
│   ├── mockData.ts
│   ├── roleResolution.ts
│   └── taxonomySearch.ts
│
├── types.ts                    # أنواع TypeScript الكاملة
├── constants.ts                # ثوابت المشروع
├── App.tsx                     # جذر التطبيق والتوجيه
├── index.tsx                   # نقطة دخول React
├── vite.config.ts              # إعداد Vite (target: es2019 للتوافق)
│
├── backend/                    # Laravel API Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/   # 16 controller عام
│   │   │   │   └── Admin/           # 17 controller للإدارة
│   │   │   └── Middleware/
│   │   │       ├── AuthenticateWithClerk.php
│   │   │       ├── RequireRole.php
│   │   │       └── RequirePermission.php
│   │   ├── Models/                  # 37 Eloquent Model
│   │   └── Services/
│   │       ├── ClerkAuthService.php
│   │       ├── NhtsaVehicleService.php
│   │       ├── VehicleSyncService.php
│   │       ├── GarageService.php
│   │       ├── BrandLogoResolver.php
│   │       └── AuditService.php
│   ├── database/
│   │   ├── migrations/              # 10 migration ملفات
│   │   └── seeders/                 # 9 seeder ملفات
│   ├── routes/api.php               # جميع مسارات API (v1)
│   └── tests/                       # اختبارات PHP
│
└── mobile/                     # React Native (Expo)
    ├── src/
    │   ├── screens/
    │   │   ├── auth/            # تسجيل الدخول، Onboarding، السجل
    │   │   ├── customer/        # Home، Search، Product، Cart، Orders، Profile
    │   │   ├── shop/            # Dashboard، Products، Orders، Inventory
    │   │   └── admin/           # AdminDashboard
    │   ├── components/
    │   │   ├── ui/              # Button، Input، Card، Badge، Header
    │   │   ├── vehicle/         # BrandLogo، VehicleSelector، GarageCard
    │   │   ├── product/         # ProductCard
    │   │   ├── category/        # CategoryCard
    │   │   └── order/           # OrderCard
    │   ├── context/             # AuthContext، AppContext
    │   ├── services/            # vehicleService، garageService
    │   ├── localization/        # ar.ts، en.ts (ثنائية اللغة)
    │   └── theme/               # نظام الألوان والطباعة
    └── App.tsx
`

---

## قاعدة البيانات

قاعدة البيانات **PostgreSQL** مُقسَّمة عبر **10 migration files**:

### المستخدمون والمصادقة
| الجدول | الوصف |
|---|---|
| users | المستخدمون (مرتبطون بـ Clerk ID، مع role وstatus) |
| shop_memberships | عضوية الموظف في المتجر/الفرع |

### RBAC والجغرافيا
| الجدول | الوصف |
|---|---|
| oles | الأدوار (CUSTOMER, SHOP_OWNER, SHOP_EMPLOYEE, ADMIN, SUPER_ADMIN) |
| permissions | الصلاحيات المتاحة مع التصنيف |
| ole_permissions | صلاحيات الدور (Pivot) |
| user_permissions | صلاحيات المستخدم الفردية (منح/حجب) |
| countries | الدول المدعومة |
| cities | المدن |

### قاعدة المركبات (NHTSA)
| الجدول | الوصف |
|---|---|
| ehicle_makes | ماركات المركبات مع NHTSA ID وشعار الماركة |
| ehicle_models | طرازات المركبات لكل ماركة |
| ehicle_model_years | سنوات الإنتاج لكل طراز |
| ehicle_specs | مواصفات المركبة التفصيلية |
| ehicle_aliases | أسماء بديلة للمركبات |
| ehicle_sync_logs | سجل عمليات المزامنة مع NHTSA |
| user_vehicles | مركبات المستخدم (مرآبي) |

### المتاجر والمنتجات
| الجدول | الوصف |
|---|---|
| shops | المتاجر مع الحالة واسم المالك |
| shop_branches | فروع المتجر |
| shop_users | ارتباط الموظفين بالمتجر والفرع |
| shop_commissions | عمولات المتاجر |
| categories | التصنيفات الهرمية |
| manufacturers | مصنّعو قطع الغيار |
| products | المنتجات مع السعر والحالة |
| product_images | صور المنتج |
| product_vehicle_compatibility | توافق المنتج مع المركبات |

### المخزون والتجارة
| الجدول | الوصف |
|---|---|
| inventory | مخزون كل منتج في كل فرع |
| inventory_movements | حركات المخزون (دخول/خروج/تعديل) |
| carts | عربات التسوق |
| cart_items | عناصر العربة |
| orders | الطلبات الرئيسية |
| order_items | عناصر الطلب |
| order_shop_groups | تجميع عناصر الطلب حسب المتجر |
| order_status_history | تاريخ حالات الطلب |
| delivery_addresses | عناوين التسليم |
| eviews | تقييمات المتاجر |
| wishlists | المفضلة |
| 
otifications | إشعارات المستخدمين |
| anners | البانرات الإعلانية |
| settings | إعدادات المنصة |
| udit_logs | سجل الإجراءات الإدارية |

---

## نظام المصادقة

الاعتماد على **Clerk** كمزود هوية خارجي مع تكامل Laravel:

**التدفق التقني:**

1. المستخدم يسجل الدخول عبر Clerk (ويب/جوال).
2. Clerk يُصدر JWT Bearer Token موقَّعاً بـ JWKS.
3. كل طلب API يُرسَل مع: Authorization: Bearer <token>
4. AuthenticateWithClerk Middleware يتحقق من التوقيع عبر JWKS.
5. ClerkAuthService::resolveUser() يجد أو ينشئ سجل المستخدم.
6. المستخدم يُربط بالطلب عبر uth()->setUser().
7. تمرير الطلب لـ RequireRole أو RequirePermission Middleware.

**أنواع الحسابات:**

| الدور | الوصول |
|---|---|
| CUSTOMER | التسوق، الطلبات، المرآبي |
| SHOP_OWNER | إدارة المتجر الكاملة |
| SHOP_EMPLOYEE | حسب الصلاحيات الممنوحة |
| ADMIN | لوحة الإدارة كاملة |
| SUPER_ADMIN | كل الصلاحيات بلا قيود |

**حالات الحساب:** ACTIVE — PENDING — SUSPENDED — REJECTED

---

## نظام الصلاحيات RBAC

نظام صلاحيات متقدم ثلاثي الطبقات:

`
الصلاحيات الفعّالة =
    صلاحيات الدور الأساسية
  + صلاحيات ممنوحة للمستخدم
  - صلاحيات محجوبة للمستخدم
`

**خصائص النظام:**
- **أدوار قابلة للإنشاء:** بالإضافة للأدوار النظامية الخمسة، يمكن إنشاء أدوار مخصصة.
- **مضاعفة الأدوار:** نسخ دور موجود وتعديله.
- **صلاحيات فردية:** منح أو حجب صلاحية محددة لمستخدم بعينه بصرف النظر عن دوره.
- **مصفوفة الصلاحيات:** عرض بصري لجميع الأدوار والصلاحيات.
- **SUPER_ADMIN:** يمتلك جميع الصلاحيات تلقائياً.

---

## API Reference

**Base URL:** http://localhost:8000/api/v1

**المصادقة:** Authorization: Bearer <clerk_jwt_token> (مطلوب لكل المسارات المحمية)

### عام (Public)

`
GET  /vehicles/makes
GET  /vehicles/makes/{make}/models
GET  /vehicles/models/{model}/years
GET  /vehicles/search
POST /vehicles/decode-vin
GET  /categories
GET  /products
GET  /products/{id}
GET  /shops
GET  /shops/{id}
GET  /reviews/shop/{shopId}
`

### مصادَق (Authenticated)

`
GET  /auth/me
POST /auth/sync
GET  /me/vehicles
POST /me/vehicles
GET  /cart
POST /cart/items
POST /orders
GET  /orders
GET  /notifications
POST /wishlist/{productId}
`

### لوحة المتجر (SHOP_OWNER / SHOP_EMPLOYEE)

`
GET  /shop/profile
GET  /shop/products
POST /shop/products
GET  /shop/inventory
PUT  /shop/inventory/{productId}
GET  /shop/orders
GET  /shop/employees
POST /shop/employees/invite
GET  /shop/branches
GET  /shop/dashboard
`

### لوحة الإدارة (ADMIN / SUPER_ADMIN)

`
GET  /admin/dashboard
GET  /admin/users
GET  /admin/shops
POST /admin/shops/{id}/approve
GET  /admin/roles
POST /admin/roles
PUT  /admin/roles/{id}/permissions
GET  /admin/permissions/matrix
GET  /admin/reports/summary
GET  /admin/reports/sales
GET  /admin/audit-logs
POST /admin/vehicles/sync
`

---

## الاختبارات

`
backend/tests/
├── admin_dashboard_reports_test.php    # اختبار تقارير الإدارة
├── admin_rbac_security_test.php        # اختبار أمان RBAC
├── auth_verification_runner.php        # التحقق من صحة المصادقة
├── end_to_end_http_admin_auth_test.php # اختبار E2E لتسجيل دخول الإدارة
├── check_schema.php                    # التحقق من مخطط قاعدة البيانات
└── check_users.php                     # التحقق من بيانات المستخدمين
`

`ash
cd backend
php artisan test
`

---

## تشغيل المشروع

### المتطلبات الأساسية

| الأداة | الإصدار المطلوب |
|---|---|
| Node.js | >= 18 |
| PHP | >= 8.2 |
| Composer | >= 2.x |
| PostgreSQL | >= 14 |
| Expo CLI | >= 0.22 (للجوال) |

---

### 1. الواجهة الأمامية (Frontend)

`ash
npm install
npm run dev        # التطوير (المنفذ 3000)
npm run build      # بناء للإنتاج
`

---

### 2. الخلفية (Backend)

`ash
cd backend
composer install
cp .env.example .env
# عدّل .env بإعدادات قاعدة البيانات و Clerk
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve  # (المنفذ 8000)
`

---

### 3. التطبيق الجوال (Mobile)

`ash
cd mobile
npm install
npx expo start
npx expo start --android
npx expo start --ios
`

---

## متغيرات البيئة

### الواجهة الأمامية (.env)

`env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:8000/api/v1
`

### الخلفية (ackend/.env)

`env
APP_NAME="Alalme"
APP_ENV=local
APP_KEY=base64:...
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=alalme
DB_USERNAME=postgres
DB_PASSWORD=

CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_JWKS_URL= (اختياري - يُشتق تلقائياً)
`

### التطبيق الجوال (mobile/.env)

`env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:8000/api/v1
`

---

## الدعم اللغوي

- **واجهة الويب:** عربية (RTL) وإنجليزية (LTR) — قابل للتبديل في أي وقت.
- **التطبيق الجوال:** ثنائية اللغة عبر ملفات الترجمة (r.ts / en.ts).
- **قاعدة البيانات:** حقول ثنائية اللغة (
ame_ar / 
ame_en) في المركبات، الأدوار، الصلاحيات، المدن، والدول.

---

## الترخيص

هذا المشروع خاص (Proprietary). جميع الحقوق محفوظة.

---

*للمزيد من التوثيق التقني، راجع مجلد docs/.*
