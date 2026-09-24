# معمارية النظام (System Architecture) — العالمي | Alalme

منصة **العالمي (Alalme)** مصممة بنمط المعمارية السحابية الهجينة (Hybrid Cloud Architecture) القائمة على فصل طبقة الهوية الرقمية، واجهات العميل التفاعلية (Web و Mobile)، ومحرك الأعمال الخلفي (RESTful API) المعتمد على قواعد بيانات علائقية متطورة.

---

## 1. المخطط العام للمعمارية (Architecture Diagram)

```text
                                +-----------------------------+
                                |      Clerk Auth Cloud       |
                                |  (Identity, JWT, JWKS, MFA) |
                                +--------------+--------------+
                                               ^
                                               | (Bearer JWT RS256)
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
                |    (Reverse Proxy / Rate Limit)   |
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

## 2. طبقات النظام (System Layers)

### أ. طبقة العميل (Client Tier)
- **تطبيق الويب (Web App):** مبني بـ React 19 + TypeScript + Vite + Tailwind CSS. يركز على سرعة التحميل، والتجاوب مع جميع أحجام الشاشات، ودعم اللغة العربية (RTL).
- **تطبيق الجوال (Mobile App):** مبني بـ React Native 0.86 + Expo 57 لنظامي iOS و Android، ويوفر تجربة أصيلة مع تخزين مشفر للتوكنات في SecureStore.

### ب. طبقة الهوية والمصادقة (Identity & Authentication)
- تعتمد المنصة على خوادم **Clerk** لإدارة حسابات المستخدمين والتسجيل برقم الهاتف والبريد ووسائل التواصل الاجتماعي.
- يتم إصدار توكنات **JWT** مشفرة بخوارزمية **RS256** مع إتاحة مفاتيح التشفير العامة عبر معيار **JWKS**.

### ج. طبقة المعالجة والأعمال (Backend API Engine)
- مبنية بواسطة **Laravel 11** وفق معايير PSR-4 وRESTful API.
- معالجة التحقق من التوكنات محلياً بدون إبطاء الشبكة عبر كاش للمفاتيح العامة مدته 5 دقائق.
- خط أنابيب حماية أمني متعدد المراحل:
  1. `AuthenticateWithClerk`: التحقق من صحة التوكن وتاريخ سريانه واسترجاع المستخدم من PostgreSQL.
  2. `RequireRole`: التأكد من صلاحية الدور النظامي للوصول للمسار المطلوب.
  3. `RequirePermission`: التحقق من الصلاحية الدقيقة للعملية.

### د. طبقة البيانات (Persistence Tier)
- قاعدة بيانات **PostgreSQL 16** تضم **44 جدولاً** موزعة على 13 قطاعاً وظيفياً، مع مفاتيح أجنبية وفهارس مركبة لتسريع البحث برقم القطعة (SKU) ورقم الهيكل (VIN).
