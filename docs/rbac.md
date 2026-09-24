# نظام الصلاحيات المتقدم (Enterprise RBAC) — العالمي | Alalme

تطبق منصة **العالمي (Alalme)** نظام تحكم بالوصول قائم على الأدوار (Role-Based Access Control) متعدد المستويات مع مرونة منح وسلب الصلاحيات على مستوى المستخدم الفردي.

---

## 1. المعادلة الرياضية للصلاحيات الفعلية (Effective Permissions)

يتم احتساب الصلاحيات النشطة للمستخدم في كل طلب عبر دالة `User::getEffectivePermissions()` وفق المعادلة التالية:

```text
Effective Permissions = (Role Base Permissions + User Granted Permissions) - User Denied Permissions
```

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

---

## 2. القواعد الصارمة والاستثناءات الأمنية

1. **مدير النظام الأعلى (`SUPER_ADMIN`):**
   - يتجاوز حساب مدير النظام الأعلى كافة فحوصات الصلاحيات تلقائياً.
   - ترجع الدالة جميع صلاحيات النظام المسجلة في جدول `permissions` فورياً:
     ```php
     if ($this->role === 'SUPER_ADMIN') {
         return Permission::pluck('name')->toArray();
     }
     ```
   - لا يمكن سلب أي صلاحية من حساب `SUPER_ADMIN`.

2. **الحسابات المعلقة والمجمدة (`SUSPENDED`):**
   - إذا كانت حالة المستخدم `SUSPENDED` في جدول `users`، يتم إرجاع مصفوفة فارغة `[]` فورياً، ويتم رفض أي طلب بـ `403 Forbidden`.

3. **استنساخ الأدوار (Role Duplication):**
   - يتيح النظام لمدير المنصة استنساخ أي دور قائم بكامل صلاحياته عبر المسار:
     ```http
     POST /api/v1/admin/roles/{id}/duplicate
     ```
   - يسهل ذلك إنشاء أدوار تشغيلية مخصصة (مثل: محاسب متجر، مشرف فرع، مسؤول جرد).

---

## 3. نطاقات الصلاحيات (Permission Scopes)

تُصنف الصلاحيات داخل النظام وفق خمسة نطاقات تنظيمية محددة:

| النطاق (Scope) | الوصف والتطبيق |
|---|---|
| `PLATFORM` | صلاحية نافذة على مستوى المنصة ككل (تخص مسؤولي الإدارة). |
| `SHOP` | صلاحية محصورة بحدود المتجر التجاري ومستنداته ومنتجاته. |
| `BRANCH` | صلاحية تشغيلية محصورة بفرع جغرافي محدد مسند للموظف. |
| `OWN` | صلاحية مقيدة بالموارد والسجلات التي أنشأها المستخدم بنفسه فقط. |
| `ASSIGNED` | صلاحية مقيدة بالمهام والطلبات المسندة صراحة للمستخدم. |

---

## 4. قائمة الأدوار النظامية المعتمدة (System Roles)

| كود الدور | المسمى بالعربية | المسمى بالإنجليزية | نطاق الصلاحيات والمسؤوليات |
|---|---|---|---|
| `SUPER_ADMIN` | مدير النظام الأعلى | Super Administrator | صلاحيات مطلقة وغير مقيدة لإدارة الخوادم، الإعدادات، والمدراء. |
| `ADMIN` | مدير المنصة | Platform Administrator | إدارة المتاجر، مراجعة الوثائق، الرقابة على المخزون، وسجل التدقيق. |
| `SHOP_OWNER` | مالك متجر قطع غيار | Shop Owner | إدارة المتجر، إنشاء الفروع، دعوة الموظفين، إضافة المنتجات، والمالية. |
| `SHOP_EMPLOYEE` | موظف متجر | Shop Employee | استلام وتجهيز طلبات المتجر، ضبط المخزون بالفرع المعين له. |
| `CUSTOMER` | عميل / مشتري | Customer | إدارة المرآب، البحث برقم الهيكل، الشراء، وتتبع الشحنات. |
| `MECHANIC` | فني صيانة / ورشة | Mechanic / Workshop | حساب مخصص لطلب كميات تجارية وعروض أسعار الجملة. |
| `DELIVERY` | مندوب توصيل | Delivery Driver | استلام الشحنات وتحديث حالات النقل والتسليم للعميل. |

---

## 5. مصفوفة الصلاحيات بالوحدات (Permission Modules)

تغطي الصلاحيات الوحدات الوظيفية التالية:
- `users` (view, create, edit, suspend, delete, role.assign)
- `roles` (view, create, edit, delete, duplicate, permissions.sync)
- `permissions` (view, matrix.view)
- `shops` (view, approve, reject, suspend, reactivate, edit)
- `branches` (view, create, edit, delete)
- `employees` (view, invite, edit, suspend, delete)
- `products` (view, create, edit, delete, disable, enable)
- `inventory` (view, update, adjust, movements.view)
- `orders` (view, create, confirm, status.update, cancel)
- `reports` (summary.view, sales.view, shops.view)
- `audit` (logs.view)
- `settings` (view, update)
