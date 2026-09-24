# وثيقة مشروع منصة العالمي لقطع غيار السيارات

> **Software Requirements & Product Specification**  
> Marketplace متعدد الدول لقطع غيار السيارات، البحث الذكي، إدارة المحلات والمخزون والطلبات والدفع.

**الهوية البصرية:**  
- الشعار: شعار «العالمي لقطع غيار السيارات» بدون نص داخل الرمز.
- الألوان:
  - `#010736`
  - `#22396F`
  - `#FCF1D0`

**التقنيات الأساسية:** React Native + Expo · React + Vite · Laravel · PostgreSQL · Arabic + English

---

## 1. الرؤية والهدف

المنصة عبارة عن **Marketplace متخصصة في قطع غيار السيارات** تربط العملاء بالمحلات ومخازن قطع الغيار، وتوفر:

- البحث بالسيارة أو رقم القطعة أو اسمها.
- البحث الذكي بالعربية والإنجليزية.
- مقارنة القطع والمحلات.
- إدارة المخزون.
- الطلب والشراء.
- الدفع الإلكتروني.
- الشراء خارج المنصة.
- التواصل المباشر مع المحل.
- إدارة المحلات والفروع والموظفين والصلاحيات.

### المبدأ الأساسي

تطبيق Mobile واحد، وتختلف الواجهات حسب حساب المستخدم ودوره وصلاحياته. لا يتم إنشاء تطبيق منفصل لكل Role.

---

## 2. نطاق المشروع

| المنصة | الوظيفة |
|---|---|
| Mobile App | تطبيق واحد لـ Customer / Shop Owner / Shop Employee حسب Role وPermissions. |
| Web | لوحات الإدارة والتشغيل للمشرفين والمحلات. |
| Backend | Laravel REST API. |
| Database | PostgreSQL. |
| الدول | متعددة الدول من البداية. |
| اللغات | العربية والإنجليزية مع RTL/LTR. |

---

## 3. المستخدمون والأدوار والصلاحيات

| Role | الوصف |
|---|---|
| `SUPER_ADMIN` | إدارة المنصة بالكامل، الدول، المحلات، المستخدمين، العمولة، السيارات، المنتجات، الطلبات، التقارير والإعدادات. |
| `ADMIN` | إدارة العمليات حسب الصلاحيات الممنوحة. |
| `SHOP_OWNER` | إدارة المحل والفروع والموظفين والمنتجات والمخزون والطلبات والإعدادات. |
| `SHOP_EMPLOYEE` | موظف مرتبط بمحل، وتحدد صلاحياته بشكل مخصص. |
| `CUSTOMER` | البحث، حفظ السيارات، مقارنة المنتجات، السلة، الطلب، الدفع، التواصل والتقييم. |
| `GUEST` | تصفح وبحث أساسي دون حساب، بينما الوظائف الحساسة تتطلب تسجيل الدخول. |

### نظام الصلاحيات

يجب تطبيق **RBAC + Permissions**. الصلاحية لا تعتمد على إخفاء الزر فقط، بل يتم فرضها على الـAPI والخادم أيضًا.

```text
products.view
products.create
products.update
products.delete

inventory.view
inventory.adjust

orders.view
orders.update
orders.confirm

employees.view
employees.create
employees.update
employees.delete

reports.view
settings.manage
payments.view
```

صاحب المحل يستطيع:

- إنشاء موظفين.
- تعطيل الموظفين.
- حذف الموظفين.
- تحديد صلاحياتهم بشكل مخصص.

---

## 4. المحلات والفروع

### تسجيل المحل

```text
Registration
    ↓
Pending
    ↓
Admin Review
    ↓
Approved / Rejected
```

لا توجد مستندات إلزامية في النسخة الحالية حسب المتطلبات المعتمدة.

### بيانات المحل

- الاسم.
- الشعار.
- الوصف.
- الدولة.
- المدينة.
- المنطقة.
- العنوان.
- الموقع الجغرافي.
- الهاتف.
- WhatsApp.
- ساعات العمل.
- صور المحل.
- الخدمات.
- الفروع.
- التقييم.

### حالة المحل

Admin يستطيع تعطيل/تفعيل المحل.

تعطيل المحل يمنع العمليات وفق سياسة النظام دون حذف بياناته التاريخية.

---

## 5. قطع الغيار

يمكن للمحل إضافة القطع مباشرة بعد امتلاك الصلاحية، ولا تتطلب القطعة موافقة Admin في التدفق الحالي.

### حقول القطعة

- اسم القطعة.
- Part Number.
- OEM Number.
- الشركة المصنعة.
- نوع/تصنيف القطعة.
- الوصف.
- صور متعددة.
- السعر.
- الكمية.
- الحالة.
- المحل.
- الفرع.
- السيارات المتوافقة.
- الموديل.
- سنة الصنع.
- المحرك.
- ملاحظات.
- Barcode / QR.

### حالات القطع

- جديد.
- مستعمل.
- أصلي OEM.
- Aftermarket.
- مجدد.

يمكن الجمع بين الخصائص حسب المنتج.

---

## 6. السيارات والتوافق

السيارات كيان مستقل وليس نصًا عشوائيًا داخل المنتج.

```text
Make
 └── Model
      └── Generation / Year Range
           └── Engine / Trim
```

القطعة يمكن ربطها بعدة `Vehicle Fitments`.

المستخدم يستطيع:

- حفظ سيارة أو أكثر في حسابه.
- استخدام السيارة المحفوظة لتصفية نتائج البحث.

---

## 7. البحث والاكتشاف

يدعم البحث:

- اسم القطعة.
- Part Number.
- OEM Number.
- اسم الشركة المصنعة.
- السيارة.
- الموديل.
- السنة.
- المحرك.
- العربية.
- الإنجليزية.
- البحث الذكي.
- أخطاء الكتابة.
- الدولة.
- المدينة.

### الفلاتر

- السعر.
- المحل.
- المدينة.
- التوفر.
- الشركة المصنعة.
- حالة القطعة.
- أصلي / تجاري.
- السيارة.
- التقييم.

### المقارنة

إذا كانت القطعة متوفرة في عدة محلات، تظهر عروض المحلات للمقارنة بدل دمجها في نتيجة واحدة.

---

## 8. الأسعار وإظهارها

صاحب المحل يتحكم في ظهور السعر **لكل قطعة** عند الإنشاء أو التعديل.

| Setting | السلوك |
|---|---|
| `SHOW_PRICE` | عرض السعر. |
| `HIDE_PRICE` | إخفاء السعر وعرض «تواصل مع المحل». |

لا يجوز افتراض أن السعر مخفي على كل منتجات المحل؛ القرار يكون على مستوى القطعة.

---

## 9. السلة والطلبات

العميل يستطيع إضافة عدة قطع إلى السلة، ويمكن أن تحتوي السلة على منتجات من عدة محلات.

### حالات الطلب

```text
Pending
    ↓
Confirmed
    ↓
Preparing
    ↓
Ready
    ↓
Completed
```

حالات بديلة:

```text
Pending → Rejected
Pending / Confirmed → Cancelled
```

### قاعدة المخزون

لا يعتبر البيع مكتملًا لمجرد إنشاء الطلب.

تحديث المخزون النهائي يتم وفق سياسة الحجز/التأكيد المعتمدة، ويجب منع البيع المزدوج باستخدام Transactions / Locking.

---

## 10. الدفع والعمولات

النظام يدعم:

- الدفع داخل المنصة.
- البيع خارج المنصة.

صاحب المحل يحدد طريقة البيع لكل قطعة:

- داخل المنصة.
- خارج المنصة.
- كلاهما.

### طرق الدفع

- عند الاستلام.
- تحويل بنكي.
- محافظ إلكترونية.
- بطاقات بنكية.

### العمولة

Admin يحدد عمولة كل محل بشكل مستقل.

مع قابلية تحديد نوع العمولة:

- نسبة مئوية.
- مبلغ ثابت.

---

## 11. التوصيل

النظام يدعم:

- استلام من المحل.
- توصيل من المحل.
- شركة توصيل.

يمكن حفظ:

- عنوان العميل.
- إحداثيات الموقع.

مع قابلية توسعة حساب تكلفة التوصيل حسب:

- الدولة.
- المدينة.
- الوزن.
- المسافة.

---

## 12. المخزون

يشمل نظام المخزون:

- Inventory لكل محل/فرع.
- تحديث المخزون عند تأكيد/إتمام البيع حسب سياسة الحجز.
- تنبيه انخفاض المخزون.
- استيراد Excel.
- Barcode / QR.
- تتبع حركات المخزون.

### أنواع حركات المخزون

```text
IN
OUT
ADJUSTMENT
RETURN
TRANSFER
```

كل حركة مخزون يجب أن تسجل:

- المستخدم.
- الوقت.
- السبب.
- الكمية.
- المرجع المرتبط بها.

---

## 13. التواصل والإشعارات

يدعم النظام:

- الاتصال الهاتفي.
- WhatsApp.
- إرسال صورة للقطعة المطلوبة.
- Push Notifications.
- إشعارات الطلبات.
- إشعارات الدفع.
- إشعارات المخزون.
- إشعارات الرسائل.

يمكن إضافة Chat داخلي ضمن الـMVP أو لاحقًا حسب التنفيذ التفصيلي.

---

## 14. التقييمات

النظام يدعم تقييم المحل.

المتطلب الحالي يسمح للمستخدمين بالتقييم وفق سياسة المنصة، مع إمكانية تقييد التقييمات لاحقًا على العملاء ذوي الطلبات المكتملة.

---

## 15. لوحة الإدارة

تشمل:

- المستخدمين.
- المحلات والفروع.
- الموظفين والصلاحيات.
- قطع الغيار.
- السيارات والموديلات.
- الطلبات.
- المدفوعات.
- التقييمات.
- الشكاوى.
- التقارير والإحصائيات.
- الإعلانات والبنرات.
- الإشعارات.
- الإعدادات.

### Dashboard KPIs

- المستخدمون النشطون.
- المحلات المعتمدة.
- المنتجات.
- الطلبات.
- المبيعات.
- العمولات.
- المدفوعات.
- أكثر القطع بحثًا.
- أكثر السيارات بحثًا.
- أداء المحلات.

---

## 16. تطبيق React Native + Expo

تطبيق واحد متعدد الأدوار.

بعد تسجيل الدخول يتم جلب:

- Role.
- Permissions.
- Shop Context.
- Branch Context.

ثم يتم بناء الـNavigation والواجهات المناسبة.

### Customer

- Home.
- Search.
- Vehicle Garage.
- Categories.
- Product Details.
- Shop Details.
- Compare.
- Cart.
- Checkout.
- Orders.
- Notifications.
- Profile.

### Shop Owner

- Dashboard.
- Products.
- Inventory.
- Orders.
- Employees.
- Branches.
- Reports.
- Shop Settings.

### Shop Employee

واجهة ديناميكية بناءً على الصلاحيات الممنوحة، وليس على اسم الدور فقط.

---

## 17. Web Dashboard

لوحة ويب للإدارة وتشغيل المحلات، مع حماية المسارات حسب:

- Role.
- Permissions.

### تقنية الواجهة

الخيار الافتراضي:

```text
React + Vite + TypeScript
```

---

## 18. البنية التقنية

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| Web | React + Vite + TypeScript |
| Backend | Laravel + PHP |
| Database | PostgreSQL |
| API | REST API + JSON |
| Auth | Token-based authentication + OAuth providers |
| Storage | Object/File storage abstraction |
| Notifications | Push notification provider abstraction |

---

## 19. نموذج البيانات المقترح

```text
users
roles
permissions
role_permissions
user_permissions

countries
cities
addresses

shops
shop_branches
shop_users

vehicles_makes
vehicle_models
vehicle_generations
vehicle_engines
vehicle_fitments

categories
manufacturers

products
product_images
product_prices

inventories
inventory_movements
barcodes

carts
cart_items

orders
order_items
order_shop_groups

payments
payment_transactions

delivery_addresses
shipments

reviews
notifications
search_logs
wishlists
coupons

shop_commissions
complaints
audit_logs
```

### العلاقات الرئيسية

- User يمكن أن يكون Customer أو عضوًا في Shop.
- Shop يمتلك Branches.
- Shop يمتلك Shop Users.
- Product ينتمي إلى Shop/Branch وCategory وManufacturer.
- Product يرتبط بعدة Vehicle Fitments.
- Product يمتلك Price Visibility.
- Inventory يرتبط بالمنتج والفرع.
- Order يحتوي Order Items.
- Order يمكن أن يجمع منتجات من عدة محلات.
- Commission ترتبط بالمحل ويمكن تخصيصها.

---

## 20. هيكل API المقترح

```text
/api/v1/auth
/api/v1/users

/api/v1/shops
/api/v1/shops/{shop}/branches
/api/v1/shops/{shop}/employees

/api/v1/permissions

/api/v1/vehicles
/api/v1/categories
/api/v1/manufacturers

/api/v1/products
/api/v1/inventory
/api/v1/search

/api/v1/carts
/api/v1/orders

/api/v1/payments
/api/v1/delivery

/api/v1/reviews
/api/v1/notifications

/api/v1/admin
/api/v1/reports
```

يجب استخدام:

- Form Requests / Validators.
- API Resources.
- Policies.
- Services.
- Transactions.
- Pagination.
- Filtering.
- Consistent Error Responses.

---

## 21. الأمان

يجب تطبيق:

- Authorization على الخادم لكل عملية.
- Laravel Policies / Gates.
- عدم الاعتماد على إخفاء عناصر الواجهة كوسيلة حماية.
- Rate Limiting لتسجيل الدخول وOTP والبحث الحساس.
- تشفير كلمات المرور.
- Token Revocation / Logout.
- التحقق من ملكية Shop/Branch قبل تعديل البيانات.
- Validation للصور والملفات وExcel.
- Audit Logs للعمليات الحساسة.
- منع IDOR.
- منع الوصول إلى بيانات محل آخر.
- حماية عمليات الدفع والـWebhooks.
- Database Transactions للطلبات والمخزون.

---

## 22. UI/UX

الطابع البصري:

> **Automotive Modern Marketplace**

### مبادئ التصميم

- Search-first experience.
- عرض صورة القطعة بوضوح.
- عرض معلومات التوافق.
- عرض حالة توفر المنتج.
- عرض المحل والفرع والمدينة.
- السعر يظهر أو يستبدل بـ«تواصل مع المحل».
- نتائج بحث غير مزدحمة.
- RTL/LTR كامل.
- حالات Loading واضحة.
- حالات Empty واضحة.
- حالات Error واضحة.
- Accessibility.

### الهوية

الألوان الرئيسية:

```text
Primary Dark: #010736
Secondary Navy: #22396F
Cream: #FCF1D0
```

---

## 23. أهم User Flows

### Customer Search Flow

```text
Open App
    ↓
Search / Select Vehicle
    ↓
Search Part
    ↓
Filters
    ↓
Results
    ↓
Compare Shops
    ↓
Product Details
    ↓
Add to Cart / Contact Shop
    ↓
Checkout
    ↓
Payment / External Purchase
    ↓
Order Tracking
```

### Shop Registration Flow

```text
Register
    ↓
Create Shop
    ↓
Pending
    ↓
Admin Review
    ↓
Approved
    ↓
Add Branch
    ↓
Add Employees
    ↓
Assign Permissions
    ↓
Add Products
    ↓
Manage Inventory
```

### Employee Flow

```text
Login
    ↓
Load Role + Permissions
    ↓
Load Shop Context
    ↓
Render Authorized Navigation
    ↓
Perform Allowed Actions
    ↓
API Policy Validation
```

### Product Price Flow

```text
Add/Edit Product
    ↓
Price
    ↓
Visibility:
    SHOW / HIDE
    ↓
Save
    ↓
Customer sees:
    Price
    OR
    "تواصل مع المحل"
```

---

# 24. نطاق الـMVP

وفق قرارات المشروع، الـMVP يشمل:

| Module | Included |
|---|---|
| Authentication | Phone OTP + Email/Password + Google/Apple |
| Users/Roles | Customer / Shop Owner / Employee / Admin |
| Shop | Registration, approval, branches, profile |
| Permissions | Custom employee permissions |
| Products | Full product data + images + fitments |
| Vehicles | Make/Model/Year/Engine + saved vehicles |
| Search | Arabic/English, part number, vehicle, smart search |
| Comparison | Compare shop offers |
| Pricing | Per-product visibility |
| Cart | Multi-shop cart |
| Orders | Lifecycle + shop confirmation |
| Payments | Multiple methods + external purchase path |
| Delivery | Pickup / shop delivery / delivery company |
| Inventory | Stock + movements + alerts + Excel + barcode/QR |
| Communication | Phone + WhatsApp + image sharing + notifications |
| Reviews | Shop reviews |
| Admin | Full management + reports + commissions |
| Mobile | Single Expo app by role |
| Web | Admin/shop management |
| Localization | Arabic/English, multi-country |

---

# 25. Roadmap التنفيذ

1. تثبيت المتطلبات وقواعد العمل.
2. تصميم Database وERD.
3. إنشاء Laravel API وAuthentication.
4. إنشاء Roles / Permissions / Shop Context.
5. إنشاء Countries / Cities / Vehicles / Categories.
6. إنشاء Products / Fitments / Inventory.
7. إنشاء Search / Filters / Comparison.
8. إنشاء Cart / Orders.
9. إنشاء Payments / Commission.
10. إنشاء Delivery.
11. إنشاء Notifications / Communication.
12. إنشاء Admin Web.
13. إنشاء Shop Web.
14. إنشاء Expo Mobile.
15. إضافة Localization وRTL/LTR.
16. اختبارات API والواجهات.
17. Security Review.
18. Performance Review.
19. Deployment وMonitoring.

---

# 26. معايير القبول

- المستخدم يستطيع التسجيل وتسجيل الدخول بالوسائل المعتمدة.
- المحل الجديد لا يصبح Active قبل الموافقة.
- صاحب المحل يستطيع إدارة الموظفين.
- الموظف لا يستطيع تنفيذ أي عملية غير مصرح بها حتى لو استدعى API مباشرة.
- البحث يعمل بالعربية والإنجليزية وبأرقام القطع.
- القطعة يمكن ربطها بعدة سيارات.
- السعر يظهر أو يختفي حسب إعداد القطعة.
- العميل يرى عروض القطعة من عدة محلات.
- السلة تدعم المنتجات من عدة محلات.
- الطلب يمر بحالات واضحة.
- المخزون لا يسمح بتجاوز الكمية المتاحة.
- كل حركة مخزون قابلة للتتبع.
- العمولة قابلة للتخصيص لكل محل.
- Admin يستطيع تعطيل المحل.
- التطبيق يغير الواجهة حسب Role وPermissions.
- الويب والتطبيق يدعمان العربية والإنجليزية.
- لا توجد صلاحية تعتمد على Frontend فقط.
- الـAPI يعيد أخطاء موحدة وقابلة للمعالجة.

---

# 27. تعليمات مهمة للـAgent أثناء التنفيذ

> **لا تبدأ بإعادة بناء المشروع عشوائيًا. افحص المشروع الحالي أولًا، وحدد ما هو موجود وما هو ناقص، ثم نفذ على مراحل.**

1. اقرأ المشروع الحالي بالكامل قبل تغيير الملفات الجوهرية.
2. لا تحذف وظائف موجودة تعمل إلا بعد تحديد تعارض واضح.
3. لا تغير Business Rules المعتمدة دون سبب موثق.
4. ابدأ بـ Architecture وDatabase وAPI Contracts قبل بناء عشرات الشاشات.
5. استخدم TypeScript في الواجهات.
6. استخدم Laravel Policies / Requests / Resources / Services / Transactions.
7. نفذ RBAC + Permissions حقيقيًا في Backend.
8. اجعل Mobile App واحدًا، والـNavigation والواجهات تعتمد على صلاحيات الحساب.
9. اجعل Web Dashboard منفصلة عن Mobile UI مع مشاركة API.
10. لا تضع مفاتيح سرية في React أو React Native.
11. لا تثق بالسعر أو المخزون أو الصلاحيات القادمة من العميل.
12. أضف migrations وseeders وfactories وtests.
13. اكتب API documentation لكل endpoint مهم.
14. اختبر حالات النجاح والفشل والصلاحيات والتعارضات.
15. لا تعتبر نجاح Build دليلًا على اكتمال النظام؛ يجب تشغيل اختبارات وظيفية.

### Definition of Done

لا تعتبر الوحدة مكتملة إلا إذا كانت:

```text
Database
+
API
+
Authorization
+
Validation
+
UI
+
Loading States
+
Empty States
+
Error States
+
Tests
+
Localization
+
Documentation
```

موجودة ومترابطة.

### ملاحظة معمارية

المنصة متعددة الدول من البداية، لذلك يجب ألا تفترض أن:

- العملة.
- الدولة.
- المدينة.
- المنطقة الزمنية.
- طريقة الدفع.
- التوصيل.

ثابتة على مستوى النظام.

---

## الخلاصة

**المنتج:** Automotive Parts Marketplace  
**التطبيق:** React Native + Expo — تطبيق واحد متعدد الأدوار  
**Web:** React + Vite  
**Backend:** Laravel  
**Database:** PostgreSQL  
**اللغات:** العربية + الإنجليزية  
**الدول:** متعددة من البداية  
**الصلاحيات:** RBAC + Custom Permissions  
**المحلات:** تسجيل + موافقة Admin + فروع + موظفون  
**المنتجات:** قطع غيار + توافق سيارات + مخزون  
**البحث:** ذكي، عربي/إنجليزي، رقم قطعة، OEM، سيارة  
**السعر:** تحكم لكل قطعة  
**الشراء:** داخل المنصة أو خارجها  
**السلة:** متعددة المحلات  
**الدفع:** عدة طرق  
**التوصيل:** عدة خيارات  
**الإدارة:** Dashboard كاملة  
**الهوية:** `#010736` / `#22396F` / `#FCF1D0`
