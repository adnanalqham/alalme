# توثيق واجهة برمجة التطبيقات (API Reference) — العالمي | Alalme

تتبع واجهة التطبيقات البرمجية لمنصة **العالمي (Alalme)** معايير RESTful API الكاملة.
- **المسار الأساسي:** `/api/v1`
- **صيغة البيانات:** `application/json`
- **التوثيق:** `Authorization: Bearer <Clerk JWT>` لجميع المسارات المحمية.

---

## 1. المسارات العامة (Public Endpoints)

| METHOD | PATH | ACCESS | DESCRIPTION |
|---|---|---|---|
| `POST` | `/api/v1/client-error` | Public | تسجيل أخطاء الواجهة الأمامية في سجل الخادم. |
| `GET` | `/api/v1/vehicles/makes` | Public | استعراض ماركات السيارات الرسمية مع روابط الشعارات. |
| `GET` | `/api/v1/vehicles/makes/{make}/models` | Public | جلب موديلات وطرازات سيارة تابعة لماركة محددة. |
| `GET` | `/api/v1/vehicles/models/{model}/years` | Public | جلب سنوات الصنع المتاحة لموديل سيارة محدد. |
| `GET` | `/api/v1/vehicles/{model}/specifications` | Public | جلب المواصفات الفنية التفصيلية والمحركات للطراز. |
| `GET` | `/api/v1/vehicles/search` | Public | البحث السريع عن السيارات بالاسم أو المرادفات. |
| `POST` | `/api/v1/vehicles/decode-vin` | Public | فك شفرة رقم الهيكل (VIN) واستخراج بيانات السيارة آلياً عبر NHTSA. |
| `GET` | `/api/v1/categories` | Public | استعراض شجرة تصنيفات قطع الغيار الرئيسية والفرعية. |
| `GET` | `/api/v1/categories/{id}` | Public | جلب تفاصيل تصنيف محدد وقطع الغيار التابعة له. |
| `GET` | `/api/v1/manufacturers` | Public | استعراض قائمة مصنعي قطع الغيار المعتمدين. |
| `GET` | `/api/v1/products` | Public | البحث في كتالوج المنتجات مع فلاتر المركبات والأسعار. |
| `GET` | `/api/v1/products/{id}` | Public | جلب تفاصيل قطعة الغيار وصورها وتوافقها الفني. |
| `GET` | `/api/v1/shops` | Public | دليل المتاجر المعتمدة ومواقعها الجغرافية. |
| `GET` | `/api/v1/shops/{id}` | Public | الملف التعريفي للمتجر وفروعه وتقييماته. |
| `GET` | `/api/v1/shops/{id}/products` | Public | استعراض المنتجات المعروضة لدى متجر محدد. |
| `GET` | `/api/v1/reviews/shop/{shopId}` | Public | استعراض تقييمات العملاء الخاصة بمتجر محدد. |

---

## 2. مسارات المصادقة والمستخدم (Authenticated Endpoints)

| METHOD | PATH | ACCESS | DESCRIPTION |
|---|---|---|---|
| `GET` | `/api/v1/auth/me` | Authenticated | استرجاع بيانات المستخدم الحالي مع أدواره وصلاحياته الفعلية. |
| `POST` | `/api/v1/auth/sync` | Authenticated | مزامنة بيانات حساب Clerk مع قاعدة بيانات منصة العالمي. |
| `POST` | `/api/v1/auth/register-shop` | Authenticated | تقديم طلب تسجيل متجر جديد للانضمام للمنصة. |

---

## 3. مسارات العميل والمتجر (Customer Endpoints)

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

---

## 4. مسارات إدارة المتجر (Shop Management Endpoints)
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

---

## 5. مسارات مركز التحكم الإداري (Admin Control Center Endpoints)
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
