# العالمي | Alalme

> **منصة التجارة الإلكترونية الموحدة لقطع غيار السيارات وإدارة توافق المركبات**
>
> **Enterprise Multi-Vendor Automotive Spare Parts Marketplace & Vehicle Fitment Platform**

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-11.0-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 11" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/React_Native-Expo_57-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo 57" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

---

## المحتويات

- [نظرة عامة](#نظرة-عامة)
- [الميزات الرئيسية](#الميزات-الرئيسية)
  - [العميل (Customer)](#customer)
  - [مالك المتجر (Shop Owner)](#shop-owner)
  - [موظف المتجر (Shop Employee)](#shop-employee)
  - [إدارة المنصة (Admin & Super Admin)](#admin)
- [المعمارية (Architecture)](#المعمارية)
- [Authentication Flow](#authentication-flow)
- [RBAC Flow](#rbac-flow)
- [التقنيات المستخدمة](#التقنيات-المستخدمة)
  - [Frontend Web](#frontend)
  - [Backend API](#backend)
  - [Mobile Application](#mobile)
- [هيكل المشروع (Project Structure)](#هيكل-المشروع)
- [قاعدة البيانات (Database Architecture)](#قاعدة-البيانات)
- [Admin Control Center (مركز التحكم الإداري)](#admin-control-center)
- [Shop Management (إدارة المتاجر والفروع)](#shop-management)
- [تطبيق الجوال (Mobile Application)](#تطبيق-الجوال-mobile)
- [دليل الـ API (API Reference)](#دليل-الـ-api-api-reference)
  - [1. Public Endpoints](#1-public-endpoints)
  - [2. Authenticated Endpoints](#2-authenticated-endpoints)
  - [3. Customer Endpoints](#3-customer-endpoints)
  - [4. Shop Management Endpoints](#4-shop-management-endpoints)
  - [5. Admin Control Center Endpoints](#5-admin-control-center-endpoints)
- [الاختبارات وضمان الجودة (Testing & Security Audit)](#الاختبارات-وضمان-الجودة)
- [التثبيت والتشغيل (Installation & Setup)](#التثبيت-والتشغيل)
- [متغيرات البيئة (Environment Variables)](#متغيرات-البيئة)
- [الأمان والامتثال (Security & Compliance)](#الأمان-والامتثال)

---

## نظرة عامة

منصة **العالمي (Alalme)** هي منصة تجارة إلكترونية متكاملة مصممة خصيصاً لسوق قطع غيار السيارات في الشرق الأوسط (اليمن، السعودية، والإمارات). تعالج المنصة التحديات المعقدة لقطاع قطع الغيار، مثل:

1. **مطابقة التوافق مع المركبات (Vehicle Fitment Compatibility):** التأكد بنسبة 100% أن القطعة المطلوبة متوافقة تماماً مع سيارة العميل استناداً إلى سنة الصنع، الطراز، الفئة، والمحرك عبر قاعدة بيانات NHTSA vPIC وفك شفرة رقم الهيكل (VIN Decoder).
2. **التجارة متعددة المتاجر والفروع (Multi-Vendor & Multi-Branch):** تمكين المتاجر من تسجيل فروع متعددة في مدن مختلفة، وتتبع المخزون في كل فرع، مع تجزئة الطلبات آلياً (`order_shop_groups`) عند الشراء من متاجر مختلفة في سلة واحدة.
3. **نظام صلاحيات وحوكمة إداري متقدم (Enterprise RBAC):** محرك صلاحيات متعدد الطبقات يدعم الأدوار المخصصة، واستنساخ الأدوار، ومصفوفة الصلاحيات المرئية، مع إمكانية منح أو سلب صلاحيات محددة على مستوى المستخدم الفردي.
4. **تكامل متزامن بين الويب والجوال:** واجهة ويب حديثة سريعة مبنية بـ React 19 + TypeScript وتطبيق جوال أصيل (Native) مبني بـ React Native Expo 57، مع دعم كامل للغتين العربية (RTL) والإنجليزية.

---

## الميزات الرئيسية

### Customer

يوفر النظام للعملاء تجربة تسوق متخصصة تضمن الدقة المطلقة قبل الدفع لتجنب شراء قطع غير متوافقة:

| الميزة | الوصف الفني والتنفيذي |
|---|---|
| **المرآب الافتراضي (My Garage)** | حفظ مركبات العميل مع رقم الهيكل (VIN) ورقم اللوحة، وتحديد مركبة افتراضية تُفعّل التصفية التلقائية في المتجر. |
| **محرك فك شفرة VIN** | استخراج مواصفات السيارة وسنة الصنع والمحرك آلياً عبر الربط مع واجهة NHTSA vPIC الرسمية. |
| **شارة التحقق من التوافق** | تظهر في كل صفحة منتج: شارة خضراء تفيد بالتوافق مع مركبة العميل، أو تنبيه صريح بعدم التوافق. |
| **البحث المتقدم والتصنيف** | بحث برقم القطعة (Part Number / OEM / Aftermarket)، شجرة تصنيفات متفرعة، وفلترة حسب الماركة والمدينة والسعر. |
| **السلة الموحدة متعددة المتاجر** | سلة تسوق ذكية تسمح بإضافة قطع من متاجر وفروع مختلفة، مع حساب تكاليف الشحن وتجزئة الطلب بدقة. |
| **تتبع الطلبات متعددة الفروع** | تتبع حالة كل متجر فرعي في الطلب (جديد، مؤكد، قيد التجهيز، تم الشحن، مكتمل) مع سجل تاريخ الحالات. |
| **قائمة الرغبات والإشعارات** | حفظ القطع المفضلة واستقبال إشعارات فورية عن تحديثات الطلبات وتغييرات الأسعار. |
| **طلب القطع الخارجية (External Request)** | نموذج مخصص لطلب قطع نادرة أو غير متوفرة في الكتالوج ليتم تسعيرها من قبل المتاجر. |

### Shop Owner

لوحة تحكم تجارية متكاملة لمالكي المتاجر لإدارة عمليات البيع والتوزيع والموظفين:

| الميزة | الوصف الفني والتنفيذي |
|---|---|
| **إدارة الفروع المتعددة** | إنشاء الفروع الجغرافية للمتجر، ربطها بالمدن، وتعيين العناوين الجغرافية ورقم الاتصال لكل فرع. |
| **إدارة طاقم العمل (Staff Management)** | دعوة الموظفين، تعيينهم لفروع محددة، تحديد أدوارهم، وتعليق حسابات الموظفين عند الحاجة. |
| **إدارة الكتالوج والمنتجات** | إضافة المنتجات مع المواصفات الفنية، الصور المتعددة، وتحديد التوافق مع موديلات وسنوات السيارات. |
| **التحكم اللحظي بالمخزون** | ضبط كميات المخزون لكل فرع، تعيين حد التنبيه للنقص، وسجل كامل لحركات المخزون (وارد، صادر، تسوية). |
| **تنفيذ الطلبات وتجزئتها** | استعراض طلبات المتجر الخاصة، تأكيد استلام الطلب، تحديث حالة التجهيز، وتتبع التسليم. |
| **التقارير والمؤشرات المالية** | إحصائيات المبيعات، أكثر المنتجات مبيعاً، إجمالي الإيرادات، ونسب العمولة المقتطعة. |
| **إعدادات المتجر وهوية العلامة** | تخصيص اسم المتجر، الشعار، الغلاف، ساعات العمل، والسجل التجاري. |

### Shop Employee

واجهة تشغيلية مخصصة لموظفي الفروع لضمان سرعة معالجة الطلبات وضبط الأرفف:

| الميزة | الوصف الفني والتنفيذي |
|---|---|
| **العمل ضمن نطاق الفرع** | قصر وصول الموظف إلى الفرع المعين له دون الوصول إلى بيانات الفروع الأخرى أو الإعدادات المالية. |
| **معالجة وتجهيز الطلبات** | استلام إشعارات الطلبات الجديدة، التحقق من توفر القطع على الرفوف، وتحديث حالة التجهيز والشحن. |
| **التسوية السريعة للمخزون** | تعديل كميات الرفوف وإدخال حركات الجرد الفعلي للمخزون (`IN`, `OUT`, `ADJUSTMENT`, `RETURN`). |

### Admin

مركز قيادة وتحكم شامل للمنصة لمراقبة الأداء، الحوكمة الأمنية، واعتماد المتاجر:

| الميزة | الوصف الفني والتنفيذي |
|---|---|
| **لوحة المؤشرات العامة (Dashboard)** | مراقبة مباشرة لحجم المبيعات الكلي، عدد الطلبات، عدد المستخدمين النشطين، وحالة المتاجر. |
| **طابور اعتماد المتاجر (Shop Approvals)** | مراجعة طلبات الانضمام والوثائق الرسمية، والموافقة أو الرفض أو تجميد المتاجر المخالفة. |
| **محرك الصلاحيات المتقدم (RBAC Engine)** | إنشاء وتعديل واستنساخ الأدوار، مصفوفة الصلاحيات، واستثناءات الصلاحيات الفردية لكل مستخدم. |
| **إدارة المستخدمين والحسابات** | استعراض قاعدة المستخدمين، ترقية الأدوار، تفعيل أو تجميد الحسابات (`SUSPENDED`). |
| **الرقابة المركزية على المخزون والكتالوج** | مراقبة مستويات المخزون عبر كافة المتاجر، تفعيل أو تعطيل المنتجات والماركات غير المطابقة. |
| **إدارة الكتالوج الجغرافي والمركبات** | إدارة الدول، المدن، ماركات السيارات، ربط الشعارات الرسمية للعلامات، ومزامنة بيانات NHTSA. |
| **إدارة العمولات والمالية** | تعيين وتعديل نسب عمولة المنصة المقتطعة من المتاجر وسجلات المعاملات المالية. |
| **سجل التدقيق الأمني (Audit Log)** | سجل غير قابل للتعديل يوثق كل إجراء إداري، هوية المنفذ، عنوان IP، القيم السابقة والجديدة. |
| **إدارة البانرات الترويجية والإعدادات** | التحكم في البانرات الإعلانية في الصفحة الرئيسية، والتحكم في إعدادات المنصة العامة. |

---

## المعمارية

تعتمد المنصة معمارية سحابية هجينة تفصل بين الهوية (Clerk)، والواجهات الأمامية التفاعلية (Web & Mobile)، والخدمات الخلفية وقواعد البيانات العلائقية:

```text
                                +-----------------------------+
                                |      Clerk Auth Cloud       |
                                |  (Identity, JWT, JWKS, MFA) |
                                +--------------+--------------+
                                               ^
                                               | (Bearer JWT)
                                               v
+-------------------------------+   +-------------------------------+
|      React 19 Web App         |   |    React Native Mobile App    |
|   (Vite, Tailwind, Recharts)  |   |    (Expo 57, Navigation 7)    |
+---------------+---------------+   +---------------+---------------+
                |                                   |
                +-----------------+-----------------+
                                  |
                                  v HTTPS / REST API
                +-----------------------------------+
                |        API Gateway / Nginx        |
                |    (Port 8000 / Reverse Proxy)    |
                +-----------------+-----------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     Laravel 11 Backend API Engine                 |
|                                                                   |
|  [Security Pipeline]                                              |
|    AuthenticateWithClerk -> RequireRole -> RequirePermission      |
|                                                                   |
|  [Controllers: Api/V1]                                            |
|    - Public: Vehicles, Categories, Products, Shops, Reviews       |
|    - Customer: Garage, Cart, Orders, Wishlist, Notifications      |
|    - Shop: Profile, Branches, Employees, Inventory, Products      |
|    - Admin: Users, Roles, Permissions, Matrix, Reports, Audit     |
|                                                                   |
|  [Core Services]                                                  |
|    ClerkAuthService | VehicleSyncService | AuditService           |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                    PostgreSQL 16 Database                         |
|                                                                   |
|  - 44 Relational Tables across 13 Functional Domains             |
|  - Complete Foreign Key Constraints & Cascade Isolation           |
|  - High Performance Indexes on VIN, Make, Model, SKU, Status      |
+-------------------------------------------------------------------+
```

---

## Authentication Flow

تعتمد المنصة معيار **Zero-Trust Identity** المرتكز على مصادقة Clerk الخارجية مع التحقق المحلي الصارم للشهادات الرقمية عبر **JWKS (JSON Web Key Sets)** دون الحاجة إلى الاتصال الخارجي في كل طلب:

```text
[ Client (Web / Mobile) ]
           │
           │ 1. تسجيل الدخول عبر Clerk SDK
           ▼
[ Clerk Authentication Service ]
           │
           │ 2. إصدار RS256 JWT Bearer Token
           ▼
[ Client Application ]
           │
           │ 3. إرسال الطلب: Authorization: Bearer <JWT>
           ▼
[ Laravel Middleware: AuthenticateWithClerk ]
           │
           │ 4. استخراج التوكن وقراءة Key ID (kid)
           ├──────────────────────────────────────────────┐
           ▼                                              ▼
[ الكاش المحلي (5-Min TTL) ]                 [ خادم Clerk JWKS ]
           │ (مفتاح التشفير العام)                       │ (في حال انتهاء الكاش)
           └──────────────────────┬───────────────────────┘
                                  ▼
                     5. التحقق الرقمي من التوقيع
                        (Firebase\JWT\JWT::decode)
                                  │
                                  ├─ غير صالح / منتهي ──► 401 Unauthorized
                                  ▼
                     6. استرجاع المستخدم من قاعدة البيانات
                        (ClerkAuthService::resolveUser)
                                  │
                                  ├─ حالة الحساب SUSPENDED ──► 403 Forbidden
                                  ▼
                     7. ربط المستخدم بسياق الجلسة
                        (Auth::setUser($user))
                                  ▼
[ خط أنابيب الصلاحيات: RequireRole / RequirePermission ]
                                  │
                                  ▼
[ Controller Business Logic Execution ]
```

### آليات التحقق والتنفيذ في الكود:
1. **استنتاج عنوان JWKS تلقائياً:** يقوم `ClerkAuthService` بفك ترميز `CLERK_PUBLISHABLE_KEY` لاستنتاج عنوان `https://<clerk-domain>/.well-known/jwks.json` ديناميكياً مع إمكانية تحديده يدوياً عبر `CLERK_JWKS_URL`.
2. **تخزين مؤقت عالي الكفاءة:** يتم تخزين المفاتيح العامة لمدة 5 دقائق (`Cache::remember('clerk_jwks', 300, ...)`) لمنع استهلاك شبكة الاتصال ولتوفير سرعة استجابة فائقة.
3. **حماية التواجد والحظر الفوري:** إذا كان حساب المستخدم في قاعدة البيانات يحمل حالة `SUSPENDED`، يتم منعه فوراً من الوصول بـ `403 Forbidden` مع رسالة توضيحية.

---

## RBAC Flow

تم تصميم نظام الصلاحيات الموجه بالأدوار (Role-Based Access Control) ليلبي متطلبات الشركات الكبرى مع مرونة مطلقة:

```text
┌────────────────────────────────────────────────────────┐
│               صلاحيات الدور الأساسية                    │
│             (Role Base Permissions)                    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ (+)
┌────────────────────────────────────────────────────────┐
│             صلاحيات إضافية ممنوحة للمستخدم              │
│            (User Granted Permissions: is_granted=1)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ (-)
┌────────────────────────────────────────────────────────┐
│              صلاحيات مسلوبة من المستخدم                 │
│            (User Denied Permissions: is_granted=0)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ (=)
┌────────────────────────────────────────────────────────┐
│             الصلاحيات الفعلية المطبقة                  │
│               Effective Permissions                    │
└────────────────────────────────────────────────────────┘
```

### المعادلة الرياضية للصلاحيات الفعلية:
```text
Effective Permissions = (Role Base Permissions + User Granted Permissions) - User Denied Permissions
```

### القواعد الصارمة المطبقة في `User::getEffectivePermissions()`:
1. **استثناء مدير النظام الأعلى (SUPER_ADMIN):** يحصل حساب `SUPER_ADMIN` فوراً على **كافة صلاحيات النظام** دون استثناء (`Permission::pluck('name')->toArray()`) ولا يمكن سلب أي صلاحية منه.
2. **الحسابات المجمدة (SUSPENDED):** إذا كان المستخدم معلقاً، يتم إرجاع مصفوفة فارغة `[]` فوراً، مما يعطل كافة العمليات.
3. **استنساخ الأدوار (Role Duplication):** يتيح مسار `POST /api/v1/admin/roles/{id}/duplicate` تكرار أي دور مع كامل صلاحياته لتسهيل إنشاء أدوار جديدة (مثل: مدير فرع، مشرف مستودع).
4. **نطاقات الصلاحيات (Permission Scopes):**
   - `PLATFORM`: صلاحية على مستوى المنصة ككل.
   - `SHOP`: مقيدة بحدود المتجر الذي يتبع له المستخدم.
   - `BRANCH`: مقيدة بالفرع الجغرافي المعين للموظف.
   - `OWN`: مقيدة بالموارد التي يملكها المستخدم فقط.
   - `ASSIGNED`: مقيدة بالعناصر المسندة صراحة.

### الأدوار الأساسية في النظام:

| كود الدور | الاسم بالعربية | الاسم بالإنجليزية | الوصف ونطاق الوصول |
|---|---|---|---|
| `SUPER_ADMIN` | مدير النظام الأعلى | Super Administrator | كامل الصلاحيات غير المحدودة لإدارة المنصة، المدراء، الإعدادات، والعمولات. |
| `ADMIN` | مدير المنصة | Platform Administrator | إدارة المستخدمين، اعتماد المتاجر، مراقبة الكتالوج والطلبات، واستعراض سجل التدقيق. |
| `SHOP_OWNER` | مالك متجر قطع غيار | Shop Owner | إدارة المتجر بالكامل، إنشاء الفروع، دعوة الموظفين، إضافة المنتجات، وضبط المخزون. |
| `SHOP_EMPLOYEE` | موظف متجر | Shop Employee | معالجة طلبات المتجر، تحديث المخزون، والعمل ضمن حدود الفرع المسند إليه. |
| `CUSTOMER` | عميل / مشتري | Customer | تصفح الكتالوج، فحص التوافق برقم الهيكل، إدارة المرآب، الشراء وتتبع الطلبات. |
| `MECHANIC` | فني صيانة / ورشة | Mechanic / Workshop | حساب مخصص للورش للشراء بالجملة وطلب عروض أسعار مباشرة. |
| `DELIVERY` | مندوب توصيل | Delivery Driver | استلام الشحنات وتوصيلها وتحديث حالة التوصيل للعملاء. |

---

## التقنيات المستخدمة

### Frontend

| التقنية / المكتبة | الإصدار | الوظيفة في المشروع |
|---|---|---|
| **React** | `19.2.1` | المكتبة الأساسية لبناء واجهة المستخدم التفاعلية ومكونات النظام |
| **TypeScript** | `5.8.2` | كتابة كود آمن من الأخطاء البرمجية (Type-safe) مع تعريفات موحدة لكافة الكيانات |
| **Vite** | `6.2.0` | بيئة البناء والتطوير فائقة السرعة مع دعم Hot Module Replacement (HMR) |
| **Tailwind CSS** | `3.4.19` | نظام التنسيق الحديث القائم على الأدوات (Utility-first) مع دعم التصميم المتجاوب وRTL |
| **React Router DOM** | `7.10.1` | نظام التوجيه وإدارة المسارات بالمتصفح ودعم حماية المسارات (Route Guards) |
| **@clerk/clerk-react** | `5.61.10` | إدارة تسجيل الدخول السحابي، الجلسات، التوكنات، وحماية الواجهة |
| **Lucide React** | `0.556.0` | مكتبة أيقونات متجهة متناسقة تغطي كافة عناصر واجهة المستخدم |
| **Recharts** | `3.5.1` | رسم الرسوم البيانية التفاعلية للمبيعات والتقارير في لوحات التحكم |
| **Context API** | Native | إدارة الحالة المشتركة (`AuthContext`, `CartContext`, `DataContext`, `LanguageContext`, `ToastContext`) |

### Backend

| التقنية / المكتبة | الإصدار | الوظيفة في المشروع |
|---|---|---|
| **PHP** | `^8.2` | لغة المعالجة الأساسية بالاستفادة من ميزات Types وMatch Expressions |
| **Laravel Framework** | `11.0` | إطار العمل الخلفي القوي لبناء الـ RESTful API، التوجيه، ونظام الـ Eloquent ORM |
| **PostgreSQL** | `16+` | قاعدة البيانات العلائقية المتقدمة عالية الأداء للتعامل مع العلاقات المعقدة |
| **firebase/php-jwt** | `^6.10` | فك تشفير والتحقق الرياضي من توكنات JWT المشفرة بـ RS256 عبر JWKS |
| **laravel/sanctum** | `4.0` | بنية التوثيق الاحتياطية وإدارة الجلسات التابعة لـ Laravel |
| **guzzlehttp/guzzle** | `^7.8` | عميل HTTP لإجراء اتصالات خلفية سريعة مع واجهة NHTSA ومزودي الخدمات |
| **phpunit/phpunit** | `^11.0` | بيئة تنفيذ الاختبارات الوظيفية والأمنية الآلية |
| **laravel/pint** | `^1.0` | أداة ضبط جودة وتنسيق الأكواد البرمجية وفق معايير PSR-12 |

### Mobile

| التقنية / المكتبة | الإصدار | الوظيفة في المشروع |
|---|---|---|
| **React Native** | `0.86.3` | بناء تطبيق جوال أصيل لنظامي Android وiOS عبر بيئة موحدة |
| **Expo** | `57.0.0` | المنصة المتكاملة لتطوير وإطلاق وتحديث تطبيقات React Native |
| **TypeScript** | `6.0.3` | التحقق من الأنواع وضمان تكامل أنواع البيانات مع خادم الـ API |
| **@clerk/clerk-expo** | `2.20.1` | مصادقة المستخدمين في تطبيق الجوال وحفظ جلسات الدخول بأمان |
| **expo-secure-store** | `^57.0.4` | التخزين المشفر الآمن للتوكنات والمفاتيح داخل Keychain / Keystore |
| **@react-navigation/native** | `^7.0.14` | التنقل بين الشاشات وإدارة القوائم السفلية والمسارات المتداخلة |
| **react-native-svg** | `15.15.4` | عرض شعارات ماركات السيارات والأيقونات الرسومية بدقة متناهية |

---

## هيكل المشروع

```text
alalme/
├── package.json                       # إعدادات الواجهة الأمامية والمكتبات
├── vite.config.ts                     # إعدادات Vite ومسار الـ Proxy لـ API
├── tsconfig.json                      # تكوين مترجم TypeScript للمشروع
├── tailwind.config.js                 # إعدادات تصميم الألوان والخطوط وRTL
├── .env.example                       # نموذج متغيرات بيئة الويب والباك إند
│
├── api/                               # طبقة الاتصال بـ API وخدمات البيانات
│   ├── index.ts                       # نقطة التصدير الموحدة
│   ├── db.ts                          # إعدادات اتصال وتخزين البيانات
│   ├── security.ts                    # دوال التشفير والحماية في المتصفح
│   ├── services.ts                    # خدمات المنتجات والبحث والمتاجر
│   ├── servicesAdmin.ts               # خدمات لوحة تحكم الإدارة
│   ├── servicesOrders.ts              # خدمات السلة وإنشاء ومتابعة الطلبات
│   └── session.ts                     # إدارة الجلسة الحالية للمستخدم
│
├── context/                           # سياقات إدارة الحالة المشتركة (React Context)
│   ├── AuthContext.tsx                # سياق المصادقة والتحقق من الأدوار والصلاحيات
│   ├── CartContext.tsx                # سياق إدارة السلة وحساب الإجماليات
│   ├── DataContext.tsx                # سياق توفير الكتالوج وتوافق المركبات
│   ├── LanguageContext.tsx            # سياق تبديل اللغة (عربي / إنجليزي) وتوجيه RTL
│   └── ToastContext.tsx               # سياق عرض التنبيهات المنبثقة
│
├── components/                        # مكونات الواجهة الأمامية القابلة لإعادة الاستخدام
│   ├── ErrorBoundary.tsx              # صائد أخطاء التشغيل لمنع انهيار الواجهة
│   ├── ErrorScreen.tsx                # شاشة عرض الخطأ والاتصال
│   ├── Footer.tsx                     # تذييل الصفحة وروابط المنصة
│   ├── Navbar.tsx                     # الشريط العلوي والبحث وحالة المستخدم
│   ├── PartCard.tsx                   # بطاقة عرض قطعة الغيار مع شارة التوافق
│   ├── ProductCard.tsx                # بطاقة عرض المنتج للمتجر
│   ├── SafeClerkProvider.tsx          # غلاف حماية Clerk مع وضع عدم الاتصال
│   ├── SplashScreen.tsx               # شاشة التحميل الافتتاحية للمنصة
│   ├── guards.tsx                     # حراس المسارات بحسب الدور (ProtectedRoute)
│   ├── admin/                         # مكونات متخصصة للوحة الإدارة
│   │   ├── TaxonomyTreeManager.tsx    # إدارة شجرة التصنيفات المتفرعة
│   │   └── VehicleDatabaseManager.tsx # أداة فحص ومزامنة قاعدة المركبات
│   ├── brand/
│   │   └── Logo.tsx                   # الشعار الرسمي لمنصة العالمي
│   ├── layout/
│   │   ├── AdminLayout.tsx            # الهيكل الموحد للوحة الإدارة
│   │   ├── PublicLayout.tsx           # الهيكل الموحد للمتجر والصفحات العامة
│   │   └── ShopLayout.tsx             # الهيكل الموحد للوحة تحكم المتاجر
│   └── ui/
│       └── Primitives.tsx             # عناصر الواجهة الذرية (Buttons, Inputs, Badges)
│
├── pages/                             # شاشات المتجر والعملاء العامة (16 شاشة)
│   ├── Home.tsx                       # الصفحة الرئيسية والبحث السريع والمحدد
│   ├── Search.tsx                     # البحث المتقدم وفلاتر المركبات والقطع
│   ├── PartDetails.tsx                # تفاصيل القطعة والتحقق من التوافق
│   ├── ShopList.tsx                   # دليل المتاجر المعتمدة في المنصة
│   ├── ShopDetail.tsx                 # صفحة المتجر ومنتجاته وفروعه
│   ├── Cart.tsx                       # سلة التسوق متعددة المتاجر
│   ├── Checkout.tsx                   # الدفع وإتمام الطلب واختيار العناوين
│   ├── Orders.tsx                     # قائمة طلبات العميل
│   ├── OrderDetail.tsx                # تفاصيل الطلب وتتبع الشحنات الفرعية
│   ├── Profile.tsx                    # المرآب الشخصي وإدارة المركبات والعناوين
│   ├── Login.tsx                      # تسجيل الدخول
│   ├── Register.tsx                   # إنشاء حساب جديد للعميل أو المتجر
│   ├── Notifications.tsx              # مركز الإشعارات والتنبيهات
│   ├── Inbox.tsx                      # صندوق الرسائل والمحادثات
│   ├── ExternalRequest.tsx            # نموذج طلب القطع النادرة وغير المتوفرة
│   └── ContactUs.tsx                  # صفحة الاتصال والدعم الفني
│
├── pages/admin/                       # شاشات مركز التحكم الإداري (23 شاشة)
│   ├── AdminDashboard.tsx             # لوحة القيادة والمؤشرات العامة
│   ├── AdminUsers.tsx                 # إدارة المستخدمين والحسابات
│   ├── AdminUserAccess.tsx            # استثناءات الصلاحيات على مستوى المستخدم
│   ├── AdminRoles.tsx                 # إدارة الأدوار واستنساخها
│   ├── AdminRoleDetail.tsx            # تفاصيل الدور وتعديل صلاحياته
│   ├── AdminRoleMatrix.tsx            # مصفوفة الصلاحيات المرئية
│   ├── AdminPermissions.tsx           # كتالوج الصلاحيات والنطاقات
│   ├── AdminEmployees.tsx             # إدارة موظفي المتاجر والمنصة
│   ├── AdminShops.tsx                 # قائمة المتاجر وحالاتها
│   ├── AdminShopApprovals.tsx         # طابور مراجعة واعتماد المتاجر الجديدة
│   ├── AdminCatalog.tsx               # إدارة كتالوج السيارات والقطع وتصنيفاتها
│   ├── AdminInventory.tsx             # الرقابة المركزية على المخزون والفروع
│   ├── AdminOrders.tsx                # إدارة الطلبات وتجزئتها عبر المنصة
│   ├── AdminPayments.tsx              # سجل المعاملات المالية والمدفوعات
│   ├── AdminCommissions.tsx           # ضبط نسب العمولات المالية للمتاجر
│   ├── AdminGeography.tsx             # إدارة الدول والمدن المدعومة
│   ├── AdminReports.tsx               # تقارير المبيعات والأداء المالي
│   ├── AdminReviews.tsx               # مراجعة وإدارة تقييمات العملاء
│   ├── AdminComplaints.tsx            # إدارة الشكاوى والنزاعات التجارية
│   ├── AdminBanners.tsx               # إدارة البانرات الإعلانية في الواجهة
│   ├── AdminNotifications.tsx         # إرسال إشعارات جماعية للمستخدمين
│   ├── AdminAudit.tsx                 # سجل التدقيق الأمني للعمليات الإدارية
│   └── AdminSettings.tsx              # إعدادات النظام والمنصة العامة
│
├── pages/shop/                        # شاشات لوحة تحكم التاجر (9 شاشات)
│   ├── ShopDashboard.tsx              # نظرة عامة على مبيعات وأداء المتجر
│   ├── ShopProducts.tsx               # إضافة وإدارة منتجات المتجر وتوافقها
│   ├── ShopInventory.tsx              # إدارة المخزون وحركاته لكل فرع
│   ├── ShopOrders.tsx                 # معالجة وتجهيز طلبات المتجر
│   ├── ShopBranches.tsx               # إدارة فروع المتجر ومواقعها
│   ├── ShopEmployees.tsx              # إدارة موظفي المتجر وصلاحياتهم
│   ├── ShopReports.tsx                # التقارير المالية لمبيعات المتجر
│   ├── ShopSettings.tsx               # إعدادات المتجر وهوية العلامة
│   └── ShopPending.tsx                # شاشة انتظار موافقة الإدارة على المتجر
│
├── backend/                           # تطبيق الواجهة الخلفية (Laravel 11 API)
│   ├── composer.json                  # حزم وتبعية الباك إند
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/    # وحدات التحكم (33 وحدة تحكم)
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── VehicleController.php
│   │   │   │   ├── VehicleSyncController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── ManufacturerController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── ShopController.php
│   │   │   │   ├── ShopBranchController.php
│   │   │   │   ├── EmployeeController.php
│   │   │   │   ├── CartController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   ├── InventoryController.php
│   │   │   │   ├── ReviewController.php
│   │   │   │   ├── GarageController.php
│   │   │   │   ├── NotificationController.php
│   │   │   │   ├── WishlistController.php
│   │   │   │   └── Admin/             # وحدات تحكم الإدارة (17 وحدة)
│   │   │   │       ├── AdminDashboardController.php
│   │   │   │       ├── AdminUserController.php
│   │   │   │       ├── AdminUserAccessController.php
│   │   │   │       ├── AdminRoleController.php
│   │   │   │       ├── AdminPermissionController.php
│   │   │   │       ├── AdminEmployeeController.php
│   │   │   │       ├── AdminShopController.php
│   │   │   │       ├── AdminProductController.php
│   │   │   │       ├── AdminCategoryController.php
│   │   │   │       ├── AdminInventoryController.php
│   │   │   │       ├── AdminOrderController.php
│   │   │   │       ├── AdminCommissionController.php
│   │   │   │       ├── AdminGeographyController.php
│   │   │   │       ├── AdminReportController.php
│   │   │   │       ├── AdminAuditController.php
│   │   │   │       ├── AdminBannerController.php
│   │   │   │       └── AdminSettingController.php
│   │   │   └── Middleware/
│   │   │       ├── AuthenticateWithClerk.php # فحص وتوثيق JWT مع JWKS
│   │   │       ├── RequireRole.php           # حماية المسارات حسب الدور
│   │   │       └── RequirePermission.php     # حماية المسارات حسب الصلاحية الفعلية
│   │   ├── Models/                    # نماذج قاعدة البيانات (37 نموذجاً)
│   │   │   ├── User.php               # نموذج المستخدم وحساب الصلاحيات الفعلية
│   │   │   ├── Role.php, Permission.php, UserPermission.php
│   │   │   ├── Shop.php, ShopBranch.php, ShopUser.php, ShopCommission.php
│   │   │   ├── Product.php, Category.php, Manufacturer.php, ProductImage.php
│   │   │   ├── ProductVehicleCompatibility.php
│   │   │   ├── VehicleMake.php, VehicleModel.php, VehicleModelYear.php, VehicleSpec.php
│   │   │   ├── Inventory.php, InventoryMovement.php
│   │   │   ├── Order.php, OrderItem.php, OrderShopGroup.php, OrderStatusHistory.php
│   │   │   ├── Cart.php, CartItem.php, DeliveryAddress.php, UserVehicle.php
│   │   │   ├── Review.php, Complaint.php, Wishlist.php, Coupon.php
│   │   │   └── Banner.php, Notification.php, Setting.php, AuditLog.php
│   │   └── Services/                  # الخدمات الأساسية للأعمال
│   │       ├── ClerkAuthService.php   # معالجة JWKS والتحقق من التوكنات
│   │       ├── VehicleSyncService.php # مزامنة بيانات السيارات مع NHTSA
│   │       ├── VehicleService.php     # خدمة الاستعلام والبحث عن المركبات
│   │       ├── GarageService.php      # إدارة مركبات المرآب للعميل
│   │       ├── AuditService.php       # تسجيل العمليات في سجل التدقيق
│   │       └── BrandLogoResolver.php  # ربط شعارات الماركات المتجهة
│   ├── database/
│   │   ├── migrations/                # ملفات ترحيل قاعدة البيانات (10 ملفات)
│   │   └── seeders/                   # بذور البيانات الافتراضية
│   │       ├── DatabaseSeeder.php
│   │       ├── CompleteRBACSeeder.php # إعداد الأدوار والمصفوفة الكاملة
│   │       ├── GeographySeeder.php    # بيانات الدول والمدن
│   │       ├── VehicleDatabaseSeeder.php
│   │       └── MarketplaceDemoSeeder.php
│   ├── routes/
│   │   └── api.php                    # تعريف جميع مسارات الـ API (301 سطر)
│   └── tests/                         # مجموعة الاختبارات الأمنية والوظيفية
│       ├── end_to_end_http_admin_auth_test.php # اختبار 401, 403, 200
│       ├── admin_rbac_security_test.php       # اختبار معادلة الصلاحيات
│       ├── admin_dashboard_reports_test.php   # اختبار تقارير ومؤشرات الإدارة
│       └── auth_verification_runner.php       # فاحص تكامل المصادقة
│
└── mobile/                            # تطبيق الجوال (React Native Expo 57)
    ├── package.json                   # إعدادات حزم الجوال
    ├── .env.example                   # متغيرات بيئة الجوال
    ├── App.tsx                        # مدخل التطبيق وإعداد المسارات والموفرات
    └── src/
        ├── context/                   # سياقات الجوال (AppContext, AuthContext)
        ├── localization/              # الترجمة الثنائية (ar.ts, en.ts)
        ├── theme/                     # نظام الألوان، الخطوط، والمسافات
        ├── services/                  # خدمات الجوال (Garage, Vehicles, TokenCache)
        ├── components/                # مكونات الجوال المتخصصة
        │   ├── ui/                    # عناصر الواجهة الأساسية والشعارات
        │   ├── vehicle/               # محدد السيارة وبطاقة المرآب
        │   ├── product/               # بطاقة عرض القطعة
        │   └── order/                 # بطاقة الطلب
        └── screens/                   # شاشات التطبيق (19 شاشة)
            ├── auth/                  # شاشات الدخول والترحيب (4 شاشات)
            ├── customer/              # شاشات العميل والمرآب والطلبات (8 شاشات)
            ├── shop/                  # شاشات لوحة تحكم المتجر (6 شاشات)
            └── admin/                 # شاشة لوحة تحكم الإدارة (شاشة واحدة)
```

---

## قاعدة البيانات

تم تصميم قاعدة البيانات في PostgreSQL 16 باستخدام معايير الجودة العالية (3NF)، وتشمل **44 جدولاً فعلياً** تم استخراجها وتوثيقها مباشرة من ملفات الـ Migrations، مقسمة إلى 13 قطاعاً وظيفياً:

```text
إجمالي الجداول الموثقة فعلياً في الكود: 44 جدولاً
```

### 1. المستخدمون والمصادقة (Users & Authentication) — 3 جداول

| الجدول | الوصف |
|---|---|
| `users` | الحسابات الرئيسية للمستخدمين مع الربط بمعرف Clerk (`clerk_user_id`)، الدور، ورقم الهاتف، والحالة. |
| `shop_memberships` | ربط المستخدمين بعضوية المتاجر وتحديد الدور التاريخي ضمن المتجر. |
| `delivery_addresses` | عناوين الشحن والتوصيل المسجلة للعملاء مع ربط المدينة والدولة وتحديد العنوان الافتراضي. |

### 2. نظام الصلاحيات المتقدم (RBAC Architecture) — 4 جداول

| الجدول | الوصف |
|---|---|
| `roles` | الأدوار النظامية والمخصصة مع الاسم التعريفي، الوصف، كود الدور، وحالة الدور. |
| `permissions` | كتالوج الصلاحيات مقسمة حسب الوحدة (`module`)، الإجراء (`action`)، والنطاق (`scope`). |
| `role_permissions` | جدول الربط المحوري (Pivot) الذي يحدد الصلاحيات المسندة لكل دور. |
| `user_permissions` | استثناءات الصلاحيات الفردية للمستخدم (منح أو حجب) مع سبب المنح (`reason`) وهوية المنفذ. |

### 3. النطاق الجغرافي والمدن (Geography) — جدولان

| الجدول | الوصف |
|---|---|
| `countries` | الدول المدعومة (اليمن، السعودية، الإمارات) مع رموز الهواتف والعملة والحالة. |
| `cities` | المدن التابعة لكل دولة لربط الفروع وعناوين التوصيل. |

### 4. المركبات وتوافق قطع الغيار (Vehicles & Fitment) — 7 جداول

| الجدول | الوصف |
|---|---|
| `vehicle_makes` | ماركات السيارات الرسمية (تويوتا، نيسان، إلخ) مع روابط الشعارات وبيانات SVG. |
| `vehicle_models` | طرازات وموديلات السيارات التابعة لكل ماركة. |
| `vehicle_model_years` | سنوات الصنع المتاحة لكل طراز سيارة مع رمز الجيل. |
| `vehicle_specs` | المواصفات الفنية التفصيلية (سعة المحرك، نوع الوقود، ناقل الحركة، فئة الدفع). |
| `user_vehicles` | المركبات المحفوظة في مرآب العميل مع رقم الهيكل (VIN) ورقم اللوحة. |
| `vehicle_aliases` | الأسماء البديلة والمرادفات الشائعة لتسهيل البحث الذكي عن السيارات. |
| `vehicle_sync_logs` | سجل عمليات المزامنة والتحديث الآلي لقاعدة المركبات مع واجهة NHTSA. |

### 5. المتاجر والشركاء التجاريون (Shops & Vendors) — 4 جداول

| الجدول | الوصف |
|---|---|
| `shops` | سجل المتاجر المعتمدة مع السجل التجاري، الشعار، الغلاف، وحالة الاعتماد (`PENDING`, `APPROVED`, إلخ). |
| `shop_branches` | الفروع الجغرافية التابعة للمتجر مع الموقع والمدينة وبيانات التواصل والإحداثيات. |
| `shop_users` | طاقم العمل وموظفو المتجر مع ربطهم بالفرع المعين وصلاحياتهم الوظيفية. |
| `shop_commissions` | نسب العمولة المفروضة على المتجر من قبل المنصة وتاريخ سريانها. |

### 6. كتالوج المنتجات وقطع الغيار (Products Catalog) — 5 جداول

| الجدول | الوصف |
|---|---|
| `categories` | شجرة تصنيفات قطع الغيار المتفرعة (أجزاء المحرك، الفرامل، الكهرباء، إلخ) مع الأيقونة والمسار. |
| `manufacturers` | الشركات المصنعة لقطع الغيار (الأصلية OEM والبديلة Aftermarket مثل Bosch وDenso). |
| `products` | السجل الرئيسي لقطع الغيار مع رقم القطعة (SKU)، اسم القطعة، السعر، والحالة. |
| `product_images` | صور المنتج المتعددة مع تحديد الصورة الأساسية وترتيب العرض. |
| `product_vehicle_compatibilities` | جدول التوافق الهندسي الذي يربط كل قطعة بماركات وموديلات وسنوات السيارات المتوافقة معها. |

### 7. إدارة المخزون والمستودعات (Inventory & Warehousing) — جدولان

| الجدول | الوصف |
|---|---|
| `inventories` | مستويات المخزون الحالية لكل منتج في كل فرع محدد مع حد التنبيه للنقص وموقع الرف. |
| `inventory_movements` | السجل التدقيقي الكامل لحركات المخزون (`IN`, `OUT`, `ADJUSTMENT`, `RETURN`) مع الكميات والملاحظات. |

### 8. سلة التسوق (Shopping Cart) — جدولان

| الجدول | الوصف |
|---|---|
| `carts` | السلة النشطة لكل مستخدم مع كود الخصم المطبق وإجمالي الأسعار المحسوبة. |
| `cart_items` | العناصر المضافة للسلة مع الكمية المحددة والمتجر الموفر وسعر الوحدة. |

### 9. الطلبات وتجزئة المتاجر (Orders & Multi-Vendor Fulfillment) — 4 جداول

| الجدول | الوصف |
|---|---|
| `orders` | رأس الطلب الموحد للعميل متضمناً رقم الطلب، الإجمالي، رسوم الشحن، وحالة الدفع. |
| `order_shop_groups` | تجزئة الطلب الموحد لكل متجر مستقل لمتابعة تجهيزه وشحنه برقم تتبع خاص. |
| `order_items` | تفاصيل الأصناف المشتراة داخل كل مجموعة طلب مع الكمية وسعر الشراء. |
| `order_status_history` | السجل الزمني الدقيق لتغير حالات الطلب وهوية من قام بتغيير الحالة. |

### 10. الخدمات اللوجستية والشحن (Logistics & Shipments) — جدول واحد

| الجدول | الوصف |
|---|---|
| `shipments` | بوليصات الشحن المرتبطة بمجموعات المتاجر، شركة النقل، رقم التتبع، وتاريخ الوصول المتوقع. |

### 11. المعاملات المالية والدفع (Payments & Transactions) — جدولان

| الجدول | الوصف |
|---|---|
| `payments` | سجل عملية الدفع للطلب، المبلغ، وسيلة الدفع (نقدي، بطاقة، إلخ)، وحالة العملية. |
| `payment_transactions` | سجل العمليات الدقيقة لبوابة الدفع الإلكتروني واستجابات البوابة المشفرة. |

### 12. المراجعات والشكاوى والتسويق (Customer Engagement & Marketing) — 4 جداول

| الجدول | الوصف |
|---|---|
| `reviews` | تقييمات العملاء للمنتجات والمتاجر والتعليقات مع التحقق من الشراء الفعلي. |
| `complaints` | الشكاوى والنزاعات التجارية المرفوعة من العميل مع متابعة الردود وحالة الإغلاق. |
| `wishlists` | قائمة الرغبات وحفظ القطع المفضلة للعميل للرجوع إليها لاحقاً. |
| `coupons` | قسائم وكوبونات الخصم، نسب التخفيض، الحد الأدنى للطلب، وتاريخ الانتهاء. |

### 13. الإعلانات، الإشعارات، والتدقيق (Banners, Notifications & Audit) — 4 جداول

| الجدول | الوصف |
|---|---|
| `banners` | البانرات الإعلانية الترويجية في الصفحة الرئيسية، التواريخ، والجمهور المستهدف. |
| `notifications` | الإشعارات اللحظية الموجهة للمستخدمين مع حالة القراءة والبيانات الإضافية. |
| `settings` | إعدادات المنصة المركزية بصيغة JSON مقسمة لمجموعات (العامة، المالية، الدفع، الأمان). |
| `audit_logs` | سجل الرقابة والتدقيق الأمني الصارم لجميع الإجراءات الإدارية مع عناوين IP والقيم السابقة والجديدة. |

---

## Admin Control Center

توفر لوحة تحكم الإدارة (`pages/admin/`) رقابة وإشرافاً كاملاً على كافة أركان المنصة. يوضح الجدول التالي جميع الشاشات الـ 23 المتاحة في الكود والمسارات والـ APIs المرتبطة بها:

| الشاشة والملف | المسار (Route) | نقطة النهاية (Backend API) | الوظيفة والقدرات التشغيلية |
|---|---|---|---|
| `AdminDashboard.tsx` | `/admin` | `GET /api/v1/admin/dashboard` | مؤشرات الأداء الحية (KPIs)، حجم المبيعات الكلي، عدد الطلبات، والمستخدمين النشطين. |
| `AdminUsers.tsx` | `/admin/users` | `GET, PUT /api/v1/admin/users` | إدارة المستخدمين، تعديل البيانات، ترقية الأدوار، والتجميد أو التنشيط. |
| `AdminUserAccess.tsx` | `/admin/users/:id/access` | `GET, PUT /api/v1/admin/users/:id/permissions` | منح أو حجب صلاحيات فردية خاصة بمستخدم محدد مع تسجيل السبب الأمني. |
| `AdminRoles.tsx` | `/admin/roles` | `GET, POST /api/v1/admin/roles` | استعراض قائمة الأدوار، إنشاء أدوار مخصصة، واستنساخ الأدوار (`duplicate`). |
| `AdminRoleDetail.tsx` | `/admin/roles/:id` | `GET, PUT /api/v1/admin/roles/:id` | تفاصيل الدور وربط الصلاحيات به وتعديل المسمى والوصف. |
| `AdminRoleMatrix.tsx` | `/admin/permissions/matrix` | `GET /api/v1/admin/permissions/matrix` | مصفوفة بصرية شاملة توضح تقاطع كافة الأدوار مع كافة الصلاحيات حسب الوحدة. |
| `AdminPermissions.tsx` | `/admin/permissions` | `GET /api/v1/admin/permissions` | استعراض كتالوج الصلاحيات مصنفة بالوحدات (Modules)، الإجراءات، والنطاقات. |
| `AdminEmployees.tsx` | `/admin/employees` | `GET /api/v1/admin/employees` | دليل الموظفين عبر المنصة وربطهم بالمتاجر والفروع ومتابعة نشاطهم. |
| `AdminShops.tsx` | `/admin/shops` | `GET /api/v1/admin/shops` | دليل المتاجر، تجميد أو إعادة تنشيط المتاجر، واستعراض فروعها. |
| `AdminShopApprovals.tsx` | `/admin/shop-approvals` | `GET, POST /api/v1/admin/shops/:id/approve` | طابور فحص طلبات انضمام المتاجر ومراجعة المستندات والموافقة أو الرفض. |
| `AdminCatalog.tsx` | `/admin/catalog` | `GET /api/v1/categories`, `/vehicles/sync` | إدارة شجرة تصنيفات قطع الغيار، ماركات السيارات، ومزامنة بيانات NHTSA. |
| `AdminInventory.tsx` | `/admin/inventory` | `GET /api/v1/admin/inventory` | الرقابة المركزية على المخزون عبر جميع فروع المتاجر وتنبيهات النقص الحاد. |
| `AdminOrders.tsx` | `/admin/orders` | `GET /api/v1/admin/orders` | إدارة وتتبع كافة الطلبات المنفذة عبر المنصة وتفاصيل تقسيم المتاجر. |
| `AdminPayments.tsx` | `/admin/payments` | `GET /api/v1/admin/reports/sales` | مراقبة التدفقات النقدية، سجل المدفوعات، وإحصائيات بوابات الدفع. |
| `AdminCommissions.tsx` | `/admin/commissions` | `GET, POST /api/v1/admin/commissions` | إدارة نسب عمولة المنصة المقتطعة من المتاجر وتعديل شرائح التسعير. |
| `AdminGeography.tsx` | `/admin/geography` | `GET, POST /api/v1/admin/geography/cities` | إدارة وتفعيل الدول والمدن المدعومة للشحن والتوصيل. |
| `AdminReports.tsx` | `/admin/reports` | `GET /api/v1/admin/reports/summary` | التقارير المالية التفصيلية، رسوم بيانية للمبيعات، وتحليلات نمو المنصة. |
| `AdminReviews.tsx` | `/admin/reviews` | `GET /api/v1/reviews/shop/:id` | الإشراف على تقييمات العملاء والتعليقات والتحقق من مصداقيتها. |
| `AdminComplaints.tsx` | `/admin/complaints` | `GET /api/v1/admin/reports` | متابعة وحل النزاعات والشكاوى المرفوعة بين العملاء وأصحاب المتاجر. |
| `AdminBanners.tsx` | `/admin/banners` | `GET, POST /api/v1/admin/banners` | إدارة البانرات الإعلانية في الصفحة الرئيسية وتحديد فترات العرض. |
| `AdminNotifications.tsx` | `/admin/notifications`| `POST /api/v1/notifications` | إرسال الإشعارات والتنبيهات الموجهة للمستخدمين أو المتاجر. |
| `AdminAudit.tsx` | `/admin/audit` | `GET /api/v1/admin/audit-logs` | سجل التدقيق الإداري الصارم لتتبع كل تعديل إداري مع الـ IP والتاريخ. |
| `AdminSettings.tsx` | `/admin/settings` | `GET, PUT /api/v1/admin/settings` | ضبط إعدادات المنصة المركزية وتكوينات بوابات الدفع والأمان. |

---

## Shop Management

توفر بوابة التاجر (`pages/shop/`) مجموعة أدوات شاملة لإدارة المتجر والفروع والمخزون والمبيعات:

| الشاشة والملف | المسار (Route) | نقطة النهاية (Backend API) | الوظيفة والقدرات التشغيلية |
|---|---|---|---|
| `ShopDashboard.tsx` | `/shop` | `GET /api/v1/shop/dashboard` | لوحة المؤشرات للتاجر، حجم المبيعات، الطلبات المعلقة، وتنبيهات المخزون. |
| `ShopProducts.tsx` | `/shop/products` | `GET, POST, PUT /api/v1/shop/products` | كتالوج منتجات المتجر، إضافة قطعة جديدة، رفع الصور، وتحديد توافق السيارات. |
| `ShopInventory.tsx` | `/shop/inventory` | `GET, PUT, POST /api/v1/shop/inventory` | جرد المخزون لكل فرع، تعديل الكميات، وتسجيل حركات الإدخال والإخراج. |
| `ShopOrders.tsx` | `/shop/orders` | `GET, POST /api/v1/shop/orders` | استعراض طلبات المتجر، تأكيد الطلب، تحديث حالة التجهيز والشحن. |
| `ShopBranches.tsx` | `/shop/branches` | `GET, POST, PUT /api/v1/shop/branches` | إنشاء وتعديل الفروع الجغرافية وتحديد مواقعها ومديري الفروع. |
| `ShopEmployees.tsx` | `/shop/employees` | `GET, POST, PUT /api/v1/shop/employees` | دعوة وتعيين الموظفين، تحديد أدوارهم الوظيفية، وتعليق الحسابات. |
| `ShopReports.tsx` | `/shop/reports` | `GET /api/v1/shop/dashboard` | تقارير مبيعات المتجر، القطع الأكثر طلباً، والأرباح الصافية بعد العمولة. |
| `ShopSettings.tsx` | `/shop/settings` | `GET, PUT /api/v1/shop/profile` | ضبط بيانات المتجر، الشعار، ساعات العمل، والعناوين التجارية. |
| `ShopPending.tsx` | `/shop/pending` | `GET /api/v1/shop/profile` | شاشة المتابعة التلقائية للتاجر أثناء انتظار مراجعة واعتماد حسابه من الإدارة. |

---

## تطبيق الجوال (Mobile)

تطبيق الجوال مبني باستخدام **React Native 0.86** و **Expo 57**، ويحتوي على **19 شاشة فعلية** مقسمة هيكلياً حسب طبيعة الاستخدام:

### 1. شاشات المصادقة والدخول (Auth Screens) — 4 شاشات
- `SplashScreen.tsx`: شاشة البداية، فحص التوكن المخزن في SecureStore، وتوجيه المستخدم.
- `OnboardingScreen.tsx`: شاشات التعريف بمميزات المنصة وسهولة فحص التوافق عبر المرآب.
- `LoginScreen.tsx`: تسجيل الدخول عبر Clerk برقم الهاتف أو البريد الإلكتروني.
- `RegisterScreen.tsx`: إنشاء حساب عميل جديد أو تسجيل كمتجر.

### 2. شاشات العميل والتسوق (Customer Screens) — 8 شاشات
- `HomeScreen.tsx`: الواجهة الرئيسية، محدد المركبة السريع، التصنيفات، والقطع المميزة.
- `CategoriesScreen.tsx`: شجرة تصنيفات قطع الغيار مع صور وأيقونات واضحة.
- `SearchScreen.tsx`: البحث المتقدم برقم القطعة مع فلاتر التوافق وتصفية الماركات.
- `ProductDetailsScreen.tsx`: مواصفات القطعة الكاملة، السعر، المخزون، وشارة التوافق مع سيارة العميل.
- `VehicleSelectScreen.tsx`: محدد السيارة لاختيار سنة وموديل وفئة السيارة من قاعدة البيانات.
- `CartScreen.tsx`: سلة التسوق الذكية مع حساب التكاليف واختيار عنوان الشحن.
- `OrdersScreen.tsx`: قائمة الطلبات ومتابعة مسار الشحنات الفرعية.
- `ProfileScreen.tsx`: إدارة الملف الشخصي، المرآب الشخصي، والعناوين المفضلة.

### 3. شاشات إدارة المتجر (Shop Screens) — 6 شاشات
- `ShopDashboardScreen.tsx`: ملخص مبيعات المتجر اللحظي والطلبات الجديدة.
- `ShopProductsScreen.tsx`: قائمة منتجات المتجر مع سرعة تعديل الأسعار والحالة.
- `ShopOrdersScreen.tsx`: معالجة وتأكيد وتجهيز الطلبات المستلمة.
- `ShopInventoryScreen.tsx`: مراقبة المخزون وتعديل الكميات بالباركود والرف.
- `ShopMoreScreen.tsx`: قائمة الإعدادات الموسعة وإدارة الفروع والتواصل.
- `PendingApprovalScreen.tsx`: إشعار المتجر بحالة المراجعة والاعتماد.

### 4. شاشات الإدارة (Admin Screen) — شاشة واحدة
- `AdminDashboardScreen.tsx`: شاشة قيادة مختصرة على الجوال لمتابعة مؤشرات المنصة والطلبات الحرجة.

---

## دليل الـ API (API Reference)

تم استخراج وتوثيق كافة المسارات ونقاط النهاية الحقيقية المعرفة في ملف `backend/routes/api.php`:

### 1. Public Endpoints (مسارات عامة لا تتطلب توثيق)

| METHOD | PATH | ACCESS | DESCRIPTION |
|---|---|---|---|
| `POST` | `/api/v1/client-error` | Public | تسجيل أخطاء الواجهة الأمامية في سجل الخادم للتشخيص. |
| `GET` | `/api/v1/vehicles/makes` | Public | استعراض ماركات السيارات الرسمية مع روابط الشعارات. |
| `GET` | `/api/v1/vehicles/makes/{make}/models` | Public | جلب موديلات وطرازات سيارة تابعة لماركة محددة. |
| `GET` | `/api/v1/vehicles/models/{model}/years` | Public | جلب سنوات الصنع المتاحة لموديل سيارة محدد. |
| `GET` | `/api/v1/vehicles/{model}/specifications` | Public | جلب المواصفات الفنية التفصيلية والمحركات للطراز. |
| `GET` | `/api/v1/vehicles/search` | Public | البحث السريع عن السيارات بالاسم أو المرادفات. |
| `POST` | `/api/v1/vehicles/decode-vin` | Public | فك شفرة رقم الهيكل (VIN) واستخراج بيانات السيارة آلياً. |
| `GET` | `/api/v1/categories` | Public | استعراض شجرة تصنيفات قطع الغيار الرئيسية والفرعية. |
| `GET` | `/api/v1/categories/{id}` | Public | جلب تفاصيل تصنيف محدد وقطع الغيار التابعة له. |
| `GET` | `/api/v1/manufacturers` | Public | استعراض قائمة مصنعي قطع الغيار المعتمدين. |
| `GET` | `/api/v1/products` | Public | البحث في كتالوج المنتجات مع فلاتر المركبات والأسعار. |
| `GET` | `/api/v1/products/{id}` | Public | جلب تفاصيل قطعة الغيار وصورها وتوافقها الفني. |
| `GET` | `/api/v1/shops` | Public | دليل المتاجر المعتمدة ومواقعها الجغرافية. |
| `GET` | `/api/v1/shops/{id}` | Public | الملف التعريفي للمتجر وفروعه وتقييماته. |
| `GET` | `/api/v1/shops/{id}/products` | Public | استعراض المنتجات المعروضة لدى متجر محدد. |
| `GET` | `/api/v1/reviews/shop/{shopId}` | Public | استعراض تقييمات العملاء الخاصة بمتجر محدد. |

### 2. Authenticated Endpoints (مسارات تتطلب توثيق Clerk)

| METHOD | PATH | ACCESS | DESCRIPTION |
|---|---|---|---|
| `GET` | `/api/v1/auth/me` | Authenticated | استرجاع بيانات المستخدم الحالي مع أدواره وصلاحياته الفعلية. |
| `POST` | `/api/v1/auth/sync` | Authenticated | مزامنة بيانات حساب Clerk مع قاعدة بيانات منصة العالمي. |
| `POST` | `/api/v1/auth/register-shop` | Authenticated | تقديم طلب تسجيل متجر جديد للانضمام للمنصة. |

### 3. Customer Endpoints (عمليات العميل والمتجر)

| METHOD | PATH | ACCESS | DESCRIPTION |
|---|---|---|---|
| `GET` | `/api/v1/me/vehicles` | Customer | استعراض قائمة السيارات المحفوظة في مرآب العميل. |
| `POST` | `/api/v1/me/vehicles` | Customer | إضافة سيارة جديدة للمرآب مع رقم الهيكل واللوحة. |
| `PUT` | `/api/v1/me/vehicles/{id}` | Customer | تحديث بيانات مركبة مسجلة في المرآب. |
| `DELETE` | `/api/v1/me/vehicles/{id}` | Customer | حذف مركبة من المرآب الشخصي. |
| `POST` | `/api/v1/me/vehicles/{id}/default` | Customer | تعيين مركبة محددة كالمركبة الافتراضية لتصفية المتجر. |
| `GET` | `/api/v1/cart` | Customer | استعراض سلة التسوق الحالية والأصناف المضافة. |
| `POST` | `/api/v1/cart/items` | Customer | إضافة قطعة غيار جديدة إلى سلة التسوق. |
| `PUT` | `/api/v1/cart/items/{productId}` | Customer | تعديل كمية منتج محدد في سلة التسوق. |
| `DELETE` | `/api/v1/cart/items/{productId}` | Customer | إزالة منتج من سلة التسوق. |
| `DELETE` | `/api/v1/cart` | Customer | تفريغ سلة التسوق بالكامل. |
| `GET` | `/api/v1/orders` | Customer | استعراض تاريخ طلبات الشراء المنفذة للعميل. |
| `POST` | `/api/v1/orders` | Customer | إنشاء وتأكيد طلب شراء جديد وتجزئته للمتاجر. |
| `GET` | `/api/v1/orders/{id}` | Customer | جلب تفاصيل طلب محدد ومجموعات المتاجر وحالات الشحن. |
| `POST` | `/api/v1/orders/{id}/cancel` | Customer | إلغاء الطلب قبل دخول مرحلة التجهيز الفعلي. |
| `POST` | `/api/v1/reviews` | Customer | تقييم منتج أو متجر بعد استلام الطلب. |
| `GET` | `/api/v1/notifications` | Customer | استعراض الإشعارات والتنبيهات الخاصة بالعميل. |
| `POST` | `/api/v1/notifications/{id}/read` | Customer | تحديد إشعار محدد كمقروء. |
| `POST` | `/api/v1/notifications/read-all` | Customer | تحديد جميع الإشعارات كمقروءة. |
| `GET` | `/api/v1/wishlist` | Customer | استعراض قائمة الرغبات والقطع المحفوظة. |
| `POST` | `/api/v1/wishlist/{productId}` | Customer | تبديل حالة حفظ المنتج في قائمة الرغبات (إضافة/حذف). |

### 4. Shop Management Endpoints (مسارات إدارة المتجر)
*تتطلب أدوار: `SHOP_OWNER`, `SHOP_EMPLOYEE`, `ADMIN`, `SUPER_ADMIN`*

| METHOD | PATH | ACCESS | DESCRIPTION |
|---|---|---|---|
| `GET` | `/api/v1/shop/profile` | Shop Staff | استرجاع بيانات الملف التعريفي لمتجر المستخدم الحالي. |
| `PUT` | `/api/v1/shop/profile` | Shop Owner | تحديث بيانات المتجر، ساعات العمل، والوثائق التجارية. |
| `GET` | `/api/v1/shop/branches` | Shop Staff | استعراض قائمة الفروع التابعة للمتجر ومواقعها. |
| `POST` | `/api/v1/shop/branches` | Shop Owner | إنشاء فرع جغرافي جديد للمتجر. |
| `PUT` | `/api/v1/shop/branches/{id}` | Shop Owner | تعديل بيانات فرع محدد للمتجر. |
| `DELETE` | `/api/v1/shop/branches/{id}` | Shop Owner | حذف أو إلغاء تفعيل فرع محدد. |
| `GET` | `/api/v1/shop/employees` | Shop Staff | استعراض قائمة موظفي المتجر وفروعهم وأدوارهم. |
| `POST` | `/api/v1/shop/employees/invite` | Shop Owner | دعوة موظف جديد للانضمام لطاقم المتجر. |
| `PUT` | `/api/v1/shop/employees/{id}` | Shop Owner | تعديل بيانات وصلاحيات موظف في المتجر. |
| `POST` | `/api/v1/shop/employees/{id}/suspend` | Shop Owner | تعليق أو تجميد حساب موظف المتجر. |
| `DELETE` | `/api/v1/shop/employees/{id}` | Shop Owner | إزالة موظف من المتجر نهائياً. |
| `GET` | `/api/v1/shop/products` | Shop Staff | استعراض كتالوج المنتجات التابعة للمتجر. |
| `POST` | `/api/v1/shop/products` | Shop Staff | إضافة قطعة غيار جديدة وتحديد بيانات التوافق. |
| `GET` | `/api/v1/shop/products/{id}` | Shop Staff | تفاصيل قطعة غيار محددة تابعة للمتجر. |
| `PUT` | `/api/v1/shop/products/{id}` | Shop Staff | تحديث بيانات وسعر ومواصفات قطعة الغيار. |
| `DELETE` | `/api/v1/shop/products/{id}` | Shop Owner | حذف قطعة غيار من كتالوج المتجر. |
| `POST` | `/api/v1/shop/products/{id}/images` | Shop Staff | رفع صور متعددة لقطعة الغيار وتحديد الصورة الرئيسية. |
| `GET` | `/api/v1/shop/inventory` | Shop Staff | جدول كميات المخزون المتوفرة لكل فرع. |
| `PUT` | `/api/v1/shop/inventory/{productId}` | Shop Staff | تحديث كميات المخزون وحدود التنبيه للمنتج. |
| `POST` | `/api/v1/shop/inventory/{productId}/adjust` | Shop Staff | تسجيل حركة تسوية مخزون (وارد، صادر، تالف، جرد). |
| `GET` | `/api/v1/shop/inventory/movements` | Shop Staff | استعراض السجل الزمني لحركات المخزون التفصيلية. |
| `GET` | `/api/v1/shop/orders` | Shop Staff | استعراض طلبات الشراء المسندة للمتجر. |
| `GET` | `/api/v1/shop/orders/{id}` | Shop Staff | تفاصيل طلب محدد والأصناف المطلوبة وتجهيزها. |
| `POST` | `/api/v1/shop/orders/{id}/confirm` | Shop Staff | تأكيد استلام وبدء تجهيز طلب المتجر. |
| `POST` | `/api/v1/shop/orders/{id}/status` | Shop Staff | تحديث حالة تجهيز وشحن مجموعة الطلب التابعة للمتجر. |
| `GET` | `/api/v1/shop/dashboard` | Shop Staff | إحصائيات ومؤشرات مبيعات المتجر وإجمالي الأرباح. |

### 5. Admin Control Center Endpoints (مسارات إدارة المنصة)
*تتطلب أدوار: `ADMIN`, `SUPER_ADMIN`*

| METHOD | PATH | ACCESS | DESCRIPTION |
|---|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | Admin | مؤشرات الأداء الحية للعمليات والمبيعات والمستخدمين. |
| `GET` | `/api/v1/admin/users` | Admin | استعراض وفلترة كافة مستخدمي المنصة وتفاصيلهم. |
| `GET` | `/api/v1/admin/users/{id}` | Admin | جلب الملف الشامل لمستخدم محدد وسجل نشاطه. |
| `PUT` | `/api/v1/admin/users/{id}` | Admin | تعديل بيانات المستخدم الأساسية. |
| `POST` | `/api/v1/admin/users/{id}/suspend` | Admin | تجميد حساب المستخدم وحرمانه من الوصول للنظام فوراً. |
| `POST` | `/api/v1/admin/users/{id}/activate` | Admin | إعادة تنشيط حساب مستخدم معلق. |
| `PUT` | `/api/v1/admin/users/{id}/role` | Admin | تغيير الدور النظامي الممنوح للمستخدم. |
| `GET` | `/api/v1/admin/users/{id}/access` | Admin | جلب ملخص وصول المستخدم وأدواره وصلاحياته الفعلية. |
| `GET` | `/api/v1/admin/users/{id}/permissions` | Admin | استعراض مصفوفة الاستثناءات الفردية لصلاحيات المستخدم. |
| `PUT` | `/api/v1/admin/users/{id}/permissions` | Admin | حفظ استثناءات الصلاحيات الفردية (منح/سلب) للمستخدم. |
| `GET` | `/api/v1/admin/roles` | Admin | قائمة الأدوار المعتمدة في النظام وتعداد صلاحياتها. |
| `POST` | `/api/v1/admin/roles` | Admin | إنشاء دور نظامي أو مخصص جديد في المنصة. |
| `GET` | `/api/v1/admin/roles/{id}` | Admin | جلب تفاصيل دور محدد وصلاحياته المرتبطة. |
| `PUT` | `/api/v1/admin/roles/{id}` | Admin | تعديل بيانات الدور ومسماه الوظيفي ونطاقه. |
| `DELETE` | `/api/v1/admin/roles/{id}` | Admin | حذف دور مخصص (غير نظامي). |
| `POST` | `/api/v1/admin/roles/{id}/duplicate` | Admin | استنساخ دور كامل بكافة صلاحياته لتسهيل التخصيص. |
| `GET` | `/api/v1/admin/roles/{id}/permissions`| Admin | استعراض الصلاحيات المسندة لدور محدد. |
| `PUT` | `/api/v1/admin/roles/{id}/permissions`| Admin | مزامنة وتحديث الصلاحيات المسندة للدور. |
| `GET` | `/api/v1/admin/permissions` | Admin | دليل كافة صلاحيات النظام وتصنيفاتها. |
| `GET` | `/api/v1/admin/permissions/matrix` | Admin | استخراج مصفوفة الصلاحيات المتقاطعة مع الأدوار. |
| `GET` | `/api/v1/admin/employees` | Admin | دليل موظفي المتاجر والمنصة وتوزيعهم الجغرافي. |
| `GET` | `/api/v1/admin/inventory` | Admin | الرقابة الشاملة على مستويات المخزون عبر المتاجر. |
| `GET` | `/api/v1/admin/commissions` | Admin | استعراض شرائح العمولات المحددة للمتاجر. |
| `POST` | `/api/v1/admin/commissions` | Admin | إضافة شريحة عمولة مالية جديدة. |
| `PUT` | `/api/v1/admin/commissions/{id}` | Admin | تعديل نسبة شريحة العمولة. |
| `DELETE` | `/api/v1/admin/commissions/{id}` | Admin | حذف شريحة عمولة محددة. |
| `GET` | `/api/v1/admin/geography/countries` | Admin | استعراض الدول المعتمدة في النظام. |
| `POST` | `/api/v1/admin/geography/countries` | Admin | إضافة دولة جديدة للنظام. |
| `PUT` | `/api/v1/admin/geography/countries/{id}`| Admin | تعديل بيانات دولة وتفعيلها أو إيقافها. |
| `GET` | `/api/v1/admin/geography/cities` | Admin | استعراض المدن المعتمدة للشحن والربط. |
| `POST` | `/api/v1/admin/geography/cities` | Admin | إضافة مدينة جديدة تابعة لدولة محددة. |
| `PUT` | `/api/v1/admin/geography/cities/{id}` | Admin | تعديل بيانات مدينة وتفعيلها أو إيقافها. |
| `GET` | `/api/v1/admin/settings` | Admin | استعراض إعدادات المنصة المركزية. |
| `PUT` | `/api/v1/admin/settings` | Admin | تحديث إعدادات المنصة المركزية بصيغة JSON. |
| `GET` | `/api/v1/admin/shops` | Admin | استعراض المتاجر المسجلة والتحكم بحالاتها. |
| `GET` | `/api/v1/admin/shops/{id}` | Admin | جلب ملف المتجر الشامل ووثائقه وفروعه. |
| `POST` | `/api/v1/admin/shops/{id}/approve` | Admin | الموافقة على طلب تسجيل متجر واعتماده رسمياً. |
| `POST` | `/api/v1/admin/shops/{id}/reject` | Admin | رفض طلب تسجيل متجر مع تسجيل السبب. |
| `POST` | `/api/v1/admin/shops/{id}/suspend` | Admin | تعليق أو تجميد متجر مخالف عن البيع. |
| `POST` | `/api/v1/admin/shops/{id}/reactivate` | Admin | إعادة تنشيط متجر معلق. |
| `GET` | `/api/v1/admin/shop-approvals` | Admin | طابور طلبات المتاجر المعلقة التي تنتظر الاعتماد. |
| `GET` | `/api/v1/admin/products` | Admin | استعراض كافة المنتجات المعروضة في المنصة. |
| `GET` | `/api/v1/admin/products/{id}` | Admin | فحص تفاصيل منتج محدد ومخزونه وتوافقه. |
| `POST` | `/api/v1/admin/products/{id}/disable`| Admin | تعطيل منتج مخالف أو غير مطابق للمواصفات. |
| `POST` | `/api/v1/admin/products/{id}/enable` | Admin | إعادة تفعيل منتج معطل في المتجر. |
| `GET` | `/api/v1/admin/categories` | Admin | استعراض شجرة التصنيفات لإدارتها وتعديلها. |
| `POST` | `/api/v1/admin/categories` | Admin | إنشاء تصنيف جديد لقطع الغيار. |
| `PUT` | `/api/v1/admin/categories/{id}` | Admin | تعديل تصنيف محدد وترتيب عرضه وأيقونته. |
| `DELETE` | `/api/v1/admin/categories/{id}` | Admin | حذف تصنيف محدد من النظام. |
| `GET` | `/api/v1/admin/orders` | Admin | استعراض ومراقبة كافة الطلبات المنفذة في المنصة. |
| `GET` | `/api/v1/admin/orders/{id}` | Admin | تفاصيل طلب محدد وسجل تغير حالاته. |
| `GET` | `/api/v1/admin/reports/summary` | Admin | التقرير المالي والإحصائي الموجز للمنصة. |
| `GET` | `/api/v1/admin/reports/sales` | Admin | تقرير المبيعات التفصيلي حسب التواريخ. |
| `GET` | `/api/v1/admin/reports/shops` | Admin | تقرير أداء ومبيعات المتاجر والعمولات المستحقة. |
| `GET` | `/api/v1/admin/audit-logs` | Admin | استعراض سجل الرقابة والتدقيق الأمني. |
| `GET` | `/api/v1/admin/audit-logs/{id}` | Admin | جلب تفاصيل عملية محددة في سجل التدقيق الأمني. |
| `GET` | `/api/v1/admin/banners` | Admin | استعراض البانرات الإعلانية الترويجية. |
| `POST` | `/api/v1/admin/banners` | Admin | إضافة بانر إعلاني جديد في الواجهة الرئيسية. |
| `PUT` | `/api/v1/admin/banners/{id}` | Admin | تعديل بانر إعلاني وتاريخ سريانه. |
| `DELETE` | `/api/v1/admin/banners/{id}` | Admin | حذف بانر إعلاني من الواجهة. |
| `POST` | `/api/v1/admin/vehicles/sync` | Admin | بدء عملية مزامنة قاعدة المركبات مع NHTSA. |
| `GET` | `/api/v1/admin/vehicles/sync-status` | Admin | فحص حالة ومخرجات عملية مزامنة المركبات. |

---

## الاختبارات وضمان الجودة

يحتوي مجلد `backend/tests/` على حزمة اختبارات برمجية وأمنية صارمة ومكتوبة فعلياً للتحقق من أمان النظام واستقراره:

### 1. ملفات الاختبار المعتمدة في الكود:
- `backend/tests/end_to_end_http_admin_auth_test.php`: فحص الحماية الأمنية للـ HTTP وتوثيق الرموز المشفرة.
- `backend/tests/admin_rbac_security_test.php`: فحص معادلة الصلاحيات وتجاوزات المستخدم وسلطة مدير النظام.
- `backend/tests/admin_dashboard_reports_test.php`: فحص دقة التقارير الإحصائية والمالية ومؤشرات الأداء.
- `backend/tests/auth_verification_runner.php`: فحص شامل لتدفق المصادقة عبر Clerk.

### 2. مصفوفة التحقق الأمني المطبقة في الاختبارات:

| سيناريو الفحص | الرمز المتوقع | النتيجة والتحقق الفعلي |
|---|---|---|
| **طلب بدون توكن توثيق (Unauthenticated)** | `401 Unauthorized` | يتم رفض الطلب فوراً من خلال `AuthenticateWithClerk` لمنع الوصول غير المصرح به. |
| **محاولة العميل الوصول لمسارات الإدارة (Customer -> Admin)** | `403 Forbidden` | يتم رفض وصول العميل عبر `RequireRole` لحماية لوحة الإدارة. |
| **محاولة التاجر الوصول لمسارات الإدارة (Shop Owner -> Admin)** | `403 Forbidden` | يتم حظر وصول مالك المتجر إلى لوحة تحكم المنصة المركزية. |
| **هجوم تزوير الترويسات (Header Spoofing Attack)** | `403 Forbidden` | إرسال ترويسات مزورة مثل `X-Role: SUPER_ADMIN` يفشل تماماً ولا يُعتد إلا بالتوكن الحقيقي. |
| **وصول مدير النظام المعتمد (SUPER_ADMIN)** | `200 OK` | نجاح الوصول واسترجاع بيانات حقيقية موثقة من قاعدة بيانات PostgreSQL. |

### كيفية تشغيل الاختبارات:
```bash
# تشغيل اختبار التحقق الأمني ونظام الـ HTTP
cd backend
php tests/end_to_end_http_admin_auth_test.php

# تشغيل اختبار معادلة الصلاحيات الفردية
php tests/admin_rbac_security_test.php

# تشغيل اختبار التقارير الإدارية
php tests/admin_dashboard_reports_test.php
```

---

## التثبيت والتشغيل

### المتطلبات الأساسية
- **Node.js**: الإصدار 20 أو أحدث.
- **PHP**: الإصدار 8.2 أو أحدث مع امتدادات (`pdo_pgsql`, `curl`, `mbstring`, `openssl`).
- **Composer**: الإصدار 2.x.
- **PostgreSQL**: الإصدار 16 أو أحدث.
- **Expo CLI**: لتشغيل واختبار تطبيق الجوال.

---

### 1. إعداد الواجهة الخلفية (Backend Setup)

```bash
# 1. الانتقال لمجلد الباك إند
cd backend

# 2. تثبيت تبعيات Composer
composer install

# 3. إعداد ملف البيئة
cp .env.example .env

# 4. توليد مفتاح التطبيق
php artisan key:generate

# 5. تشغيل الترحيلات وإنشاء الجداول الـ 44 مع البذور
php artisan migrate --seed

# 6. تشغيل خادم التطوير للباك إند على المنفذ 8000
php artisan serve --port=8000
```

---

### 2. إعداد الواجهة الأمامية (Frontend Setup)

```bash
# 1. الانتقال للمجلد الرئيسي
cd ..

# 2. تثبيت الحزم والمكتبات
npm install

# 3. ضبط ملف البيئة
cp .env.example .env

# 4. تشغيل خادم تطوير الويب على المنفذ 3000
npm run dev
```

> يتم توجيه طلبات `/api/v1` تلقائياً من خادم Vite (المنفذ 3000) إلى خادم Laravel (المنفذ 8000) عبر إعدادات الـ Proxy المحددة في `vite.config.ts`.

---

### 3. إعداد تطبيق الجوال (Mobile Setup)

```bash
# 1. الانتقال لمجلد الجوال
cd mobile

# 2. تثبيت حزم تطبيق الجوال
npm install

# 3. ضبط ملف البيئة
cp .env.example .env

# 4. تشغيل منصة Expo
npx expo start
```

---

## متغيرات البيئة

> **تنبيه أمني صارم:** تم توثيق أسماء المتغيرات فقط بدون إدراج أي كلمات مرور أو مفاتيح سرية حقيقية.

### 1. متغيرات بيئة الويب (Frontend - `.env`)

| المتغير | الحالة | الوصف |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | إلزامي | المفتاح العام لحساب Clerk لمصادقة مستخدمي الويب. |
| `VITE_API_BASE_URL` | اختياري | المسار الأساسي لواجهة الـ API في بيئة الإنتاج. |

### 2. متغيرات بيئة الباك إند (Backend - `backend/.env`)

| المتغير | الحالة | الوصف |
|---|---|---|
| `APP_NAME` | إلزامي | اسم التطبيق الخلفي (`ALALAMI_API`). |
| `APP_ENV` | إلزامي | بيئة التشغيل (`local`, `production`). |
| `APP_KEY` | إلزامي | مفتاح التشفير الأساسي لـ Laravel. |
| `APP_DEBUG` | إلزامي | وضع استكشاف الأخطاء (`true` أو `false`). |
| `APP_URL` | إلزامي | رابط الواجهة الخلفية (`http://localhost:8000`). |
| `APP_TIMEZONE` | إلزامي | المنطقة الزمنية للنظام (`Asia/Riyadh`). |
| `DB_CONNECTION` | إلزامي | نوع قاعدة البيانات (`pgsql`). |
| `DB_HOST` | إلزامي | عنوان خادم قاعدة البيانات (`127.0.0.1`). |
| `DB_PORT` | إلزامي | منفذ الاتصال بقاعدة البيانات (`5432`). |
| `DB_DATABASE` | إلزامي | اسم قاعدة بيانات منصة العالمي (`alalami_db`). |
| `DB_USERNAME` | إلزامي | اسم مستخدم قاعدة البيانات. |
| `DB_PASSWORD` | إلزامي | كلمة مرور الاتصال بقاعدة البيانات. |
| `CLERK_PUBLISHABLE_KEY`| إلزامي | المفتاح العام لـ Clerk للتحقق من التوكنات واستنتاج JWKS. |
| `CLERK_SECRET_KEY` | إلزامي | المفتاح السري لخادم Clerk لمزامنة وإدارة المستخدمين. |
| `CLERK_JWKS_URL` | اختياري | رابط ملف مفاتيح JWKS العام لـ Clerk. |
| `CORS_ALLOWED_ORIGINS` | إلزامي | النطاقات المصرح لها بالاتصال بالـ API. |

### 3. متغيرات بيئة الجوال (Mobile - `mobile/.env`)

| المتغير | الحالة | الوصف |
|---|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | إلزامي | المفتاح العام لحساب Clerk المخصص لتطبيق Expo. |
| `EXPO_PUBLIC_API_BASE_URL` | إلزامي | عنوان الـ API الخلفي للاتصال به من هاتف الجوال أو المحاكي. |

---

## الأمان والامتثال

تلتزم المنصة بأعلى معايير الحماية والأمان السيبراني:

1. **التحقق المشفر من الهوية:** اعتماد معيار **RS256** مع التحقق التلقائي من الشهادات الرقمية عبر **JWKS**، مما يمنع انتحال الشخصية أو تزوير التوكنات نهائياً.
2. **عزل الحسابات المعلقة (Instant Revocation):** تجميد أي حساب في قاعدة البيانات يعطله فورياً في الطلب التالي بـ `403 Forbidden` حتى لو كان توكن Clerk لا يزال صالحاً زمنياً.
3. **الحماية ضد حقن قواعد البيانات (SQL Injection Protection):** استخدام محرك Eloquent ORM بالكامل مع الاستعلامات المجهزة (Parameterized Queries) دون استخدام استعلامات نصية غير مؤمنة.
4. **سجل التدقيق الأمني غير القابل للتعديل (Immutable Audit Logs):** توثيق كل عملية إدارية، ترقية أدوار، تعديل أسعار، أو اعتماد متاجر مع حفظ عنوان الـ IP وهوية المنفذ وتاريخ العملية بدقة متناهية.
5. **مقاومة تزوير الترويسات (Header Spoofing Resistance):** تجاهل تام لأي ترويسات يرسلها العميل تدعي صلاحيات إضافية، والاعتماد الحصري على التوكن المفحوص وقاعدة البيانات.

---

<p align="center">
  <b>العالمي | Alalme</b> — جميع الحقوق محفوظة © 2026<br/>
  نظام التجارة الإلكترونية المتكامل لقطع غيار السيارات وإدارة توافق المركبات
</p>
