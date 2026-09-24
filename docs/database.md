# توثيق قاعدة البيانات (Database Architecture) — العالمي | Alalme

تعتمد المنصة على قاعدة بيانات **PostgreSQL 16** مصممة وفق أصول هندسة البيانات العلائقية (Third Normal Form - 3NF).
تتألف قاعدة البيانات من **44 جدولاً فعلياً** تم استخراجها وتأكيدها من ملفات ترحيل قاعدة البيانات (Migrations):

---

## فهرس القطاعات الوظيفية للجداول

1. [المستخدمون والمصادقة (Users & Authentication)](#1-المستخدمون-والمصادقة) — 3 جداول
2. [نظام الصلاحيات المتقدم (RBAC Architecture)](#2-نظام-الصلاحيات-المتقدم) — 4 جداول
3. [النطاق الجغرافي والمدن (Geography)](#3-النطاق-الجغرافي-والمدن) — جدولان
4. [المركبات وتوافق قطع الغيار (Vehicles & Fitment)](#4-المركبات-وتوافق-قطع-الغيار) — 7 جداول
5. [المتاجر والشركاء التجاريون (Shops & Vendors)](#5-المتاجر-والشركاء-التجاريون) — 4 جداول
6. [كتالوج المنتجات وقطع الغيار (Products Catalog)](#6-كتالوج-المنتجات-وقطع-الغيار) — 5 جداول
7. [إدارة المخزون والمستودعات (Inventory & Warehousing)](#7-إدارة-المخزون-والمستودعات) — جدولان
8. [سلة التسوق (Shopping Cart)](#8-سلة-التسوق) — جدولان
9. [الطلبات وتجزئة المتاجر (Orders & Multi-Vendor Fulfillment)](#9-الطلبات-وتجزئة-المتاجر) — 4 جداول
10. [الخدمات اللوجستية والشحن (Logistics & Shipments)](#10-الخدمات-اللوجستية-والشحن) — جدول واحد
11. [المعاملات المالية والدفع (Payments & Transactions)](#11-المعاملات-المالية-والدفع) — جدولان
12. [المراجعات والشكاوى والتسويق (Customer Engagement & Marketing)](#12-المراجعات-والشكاوى-والتسويق) — 4 جداول
13. [الإعلانات، الإشعارات، والتدقيق (Banners, Notifications & Audit)](#13-الإعلانات-والإشعارات-والتدقيق) — 4 جداول

---

## 1. المستخدمون والمصادقة (Users & Authentication)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `users` | `id`, `clerk_user_id`, `email`, `phone`, `full_name`, `role`, `status`, `shop_id` | السجل الرئيسي للمستخدمين مع الربط بهوية Clerk وتحديد الدور الحالي والحالة (`ACTIVE`, `SUSPENDED`). |
| `shop_memberships` | `id`, `user_id`, `shop_id`, `role`, `branch_id`, `is_active` | ربط المستخدم بعضوية المتاجر وتحديد فرعه ودوره الوظيفي. |
| `delivery_addresses` | `id`, `user_id`, `city_id`, `country_id`, `address_line`, `is_default` | عناوين الشحن المسجلة للعميل لاختيارها أثناء إتمام الطلب. |

---

## 2. نظام الصلاحيات المتقدم (RBAC Architecture)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `roles` | `id`, `name`, `display_name`, `description`, `status`, `is_system` | جدول الأدوار النظامية والمخصصة (`SUPER_ADMIN`, `ADMIN`, `SHOP_OWNER`, إلخ). |
| `permissions` | `id`, `name`, `display_name`, `module`, `action`, `scope`, `is_system` | دليل الصلاحيات مقسمة بالوحدة والنطاق (`PLATFORM`, `SHOP`, `BRANCH`, `OWN`). |
| `role_permissions` | `role_id`, `permission_id` | جدول الربط المحوري بين الأدوار والصلاحيات المسندة لها. |
| `user_permissions` | `id`, `user_id`, `permission_id`, `is_granted`, `reason`, `created_by` | استثناءات الصلاحيات على مستوى المستخدم (منح أو سلب فردي). |

---

## 3. النطاق الجغرافي والمدن (Geography)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `countries` | `id`, `code`, `name_ar`, `name_en`, `phone_code`, `currency`, `is_active` | الدول المعتمدة في النظام (اليمن، السعودية، الإمارات). |
| `cities` | `id`, `country_id`, `name_ar`, `name_en`, `postal_code`, `is_active` | المدن والمحافظات التابعة لكل دولة. |

---

## 4. المركبات وتوافق قطع الغيار (Vehicles & Fitment)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `vehicle_makes` | `id`, `name`, `logo_url`, `brand_svg`, `country`, `is_popular` | الماركات العالمية المصنعة للسيارات مع بيانات الشعار المتجه. |
| `vehicle_models` | `id`, `make_id`, `name`, `body_type` | طرازات وموديلات السيارات التابعة لكل ماركة. |
| `vehicle_model_years` | `id`, `model_id`, `year`, `generation` | سنوات إنتاج الطراز ورمز الجيل التصنيعي. |
| `vehicle_specs` | `id`, `model_year_id`, `trim`, `engine`, `transmission`, `fuel_type` | المواصفات الفنية الميكانيكية التفصيلية لكل سيارة. |
| `user_vehicles` | `id`, `user_id`, `make`, `model`, `year`, `vin`, `license_plate`, `is_default` | مركبات العميل المحفوظة في المرآب الشخصي (My Garage). |
| `vehicle_aliases` | `id`, `alias`, `target_type`, `target_id` | المسميات الشائعة والبديلة لتسهيل البحث بالمرادفات. |
| `vehicle_sync_logs` | `id`, `source`, `status`, `records_synced`, `error_message` | سجل مزامنة بيانات الكتالوج مع واجهات NHTSA الرسمية. |

---

## 5. المتاجر والشركاء التجاريون (Shops & Vendors)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `shops` | `id`, `owner_id`, `name`, `slug`, `logo`, `banner`, `status`, `tax_number` | السجل التجاري للمتاجر وحالة الاعتماد (`APPROVED`, `PENDING`, `SUSPENDED`). |
| `shop_branches` | `id`, `shop_id`, `city_id`, `name`, `address`, `phone`, `lat`, `lng`, `is_main` | الفروع الجغرافية التابعة للمتجر مع الإحداثيات وبيانات التواصل. |
| `shop_users` | `id`, `shop_id`, `user_id`, `role`, `branch_id` | الموظفون العاملون بالمتجر وربطهم بالفروع والأدوار. |
| `shop_commissions` | `id`, `shop_id`, `rate_percentage`, `effective_from`, `effective_to` | نسب العمولة المفروضة على المتجر وسجل الفترات الزمنية. |

---

## 6. كتالوج المنتجات وقطع الغيار (Products Catalog)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `categories` | `id`, `parent_id`, `name_ar`, `name_en`, `slug`, `icon`, `sort_order` | الشجرة الهرمية لتصنيفات قطع الغيار (محرك، فرامل، ناقل حركة). |
| `manufacturers` | `id`, `name`, `country`, `is_oem`, `logo_url` | الشركات المصنعة للقطع (قطع أصلية OEM أو قطع بديلة Aftermarket). |
| `products` | `id`, `shop_id`, `category_id`, `manufacturer_id`, `sku`, `part_number`, `name_ar`, `price`, `status` | البيانات الأساسية لقطعة الغيار ورقم القطعة وحالتها. |
| `product_images` | `id`, `product_id`, `image_url`, `is_primary`, `sort_order` | الصور المرفقة للقطعة مع تحديد الصورة الرئيسية. |
| `product_vehicle_compatibilities` | `id`, `product_id`, `make_id`, `model_id`, `year_from`, `year_to`, `notes` | جدول التوافق الفني الذي يربط القطعة بالسيارات المتوافقة معها. |

---

## 7. إدارة المخزون والمستودعات (Inventory & Warehousing)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `inventories` | `id`, `product_id`, `shop_branch_id`, `quantity`, `low_stock_threshold`, `shelf_location` | كمية القطع المتوفرة في كل فرع مع موقع الرف وحد التنبيه للنقص. |
| `inventory_movements` | `id`, `inventory_id`, `type`, `quantity`, `reference_id`, `notes` | سجل حركات المخزون التفصيلي (`IN`, `OUT`, `ADJUSTMENT`, `RETURN`). |

---

## 8. سلة التسوق (Shopping Cart)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `carts` | `id`, `user_id`, `session_id`, `coupon_id`, `total` | سلة التسوق النشطة للمستخدم والإجمالي المحسوب. |
| `cart_items` | `id`, `cart_id`, `product_id`, `shop_id`, `quantity`, `price` | الأصناف والكميات المضافة داخل السلة وسعر الوحدة. |

---

## 9. الطلبات وتجزئة المتاجر (Orders & Multi-Vendor Fulfillment)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `orders` | `id`, `order_number`, `user_id`, `subtotal`, `shipping_cost`, `discount`, `total`, `status` | رأس الطلب الموحد والإجماليات العامة. |
| `order_shop_groups` | `id`, `order_id`, `shop_id`, `subtotal`, `status`, `tracking_number` | تجزئة الطلب لكل متجر مستقل لتجهيز شحنته ومتابعتها. |
| `order_items` | `id`, `order_shop_group_id`, `product_id`, `quantity`, `unit_price`, `total_price` | تفاصيل القطع المشتراة من كل متجر داخل الطلب. |
| `order_status_history` | `id`, `order_id`, `status_from`, `status_to`, `changed_by`, `notes` | السجل الزمني الدقيق لمسار تغير حالات الطلب. |

---

## 10. الخدمات اللوجستية والشحن (Logistics & Shipments)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `shipments` | `id`, `order_shop_group_id`, `carrier`, `tracking_number`, `status`, `estimated_delivery` | تتبع بوليصات الشحن مع شركات التوصيل وحالة النقل. |

---

## 11. المعاملات المالية والدفع (Payments & Transactions)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `payments` | `id`, `order_id`, `amount`, `payment_method`, `status`, `transaction_id` | سجل الدفع المالي للطلب وحالة العملية (`COMPLETED`, `PENDING`, `REFUNDED`). |
| `payment_transactions` | `id`, `payment_id`, `gateway_response`, `amount`, `status` | تفاصيل واستجابات بوابة الدفع الإلكتروني المشفرة. |

---

## 12. المراجعات والشكاوى والتسويق (Customer Engagement & Marketing)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `reviews` | `id`, `product_id`, `shop_id`, `user_id`, `rating`, `comment`, `is_verified_purchase` | تقييمات العملاء للمنتجات والمتاجر بعد التحقق من الشراء الفعلي. |
| `complaints` | `id`, `user_id`, `order_id`, `subject`, `message`, `status` | تذاكر الشكاوى والنزاعات التجارية بين العميل والمتجر. |
| `wishlists` | `id`, `user_id`, `product_id` | قائمة المنتجات المفضلة المحفوظة للعميل. |
| `coupons` | `id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `expiry_date` | قسائم وكوبونات التخفيض وشروط تطبيقها. |

---

## 13. الإعلانات، الإشعارات، والتدقيق (Banners, Notifications & Audit)

| الجدول | الحقول الأساسية | الوصف والعلاقات |
|---|---|---|
| `banners` | `id`, `title`, `image_url`, `link`, `placement`, `is_active`, `start_date`, `end_date` | البانرات الإعلانية الترويجية في الواجهة. |
| `notifications` | `id`, `user_id`, `title`, `body`, `type`, `is_read`, `data` | التنبيهات الفورية للمستخدمين بحالات الطلبات والأسعار. |
| `settings` | `id`, `key`, `value`, `group`, `is_public`, `updated_by` | إعدادات المنصة المركزية المبرمجة بصيغة JSON. |
| `audit_logs` | `id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address` | سجل الرقابة والتدقيق الأمني لجميع التعديلات الإدارية. |
