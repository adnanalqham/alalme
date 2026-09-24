<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompleteRBACSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Production Roles
        $roles = [
            [
                'id' => 1,
                'name' => 'SUPER_ADMIN',
                'display_name' => 'مدير النظام الأعلى',
                'description' => 'كامل الصلاحيات غير المحدودة لإدارة المنصة والتحكم في المدراء وإعدادات النظام الحساسة.',
                'label_ar' => 'مدير النظام الأعلى',
                'label_en' => 'Super Administrator',
                'status' => 'ACTIVE',
                'is_system' => true,
            ],
            [
                'id' => 2,
                'name' => 'ADMIN',
                'display_name' => 'مدير المنصة',
                'description' => 'إدارة المستخدمين والمتاجر والطلبات والكتالوج والتقارير وسجل التدقيق.',
                'label_ar' => 'مدير المنصة',
                'label_en' => 'Platform Administrator',
                'status' => 'ACTIVE',
                'is_system' => true,
            ],
            [
                'id' => 3,
                'name' => 'SHOP_OWNER',
                'display_name' => 'مالك متجر قطع غيار',
                'description' => 'إدارة متجر قطع الغيار الخاص به، فروع المتجر، الموظفين، المنتجات، الأسعار، والمخزون.',
                'label_ar' => 'مالك متجر قطع غيار',
                'label_en' => 'Shop Owner',
                'status' => 'ACTIVE',
                'is_system' => true,
            ],
            [
                'id' => 4,
                'name' => 'SHOP_EMPLOYEE',
                'display_name' => 'موظف متجر',
                'description' => 'معالجة طلبات المتجر وتحديث المخزون بحسب الصلاحيات الممنوحة من مالك المتجر.',
                'label_ar' => 'موظف متجر',
                'label_en' => 'Shop Employee',
                'status' => 'ACTIVE',
                'is_system' => true,
            ],
            [
                'id' => 5,
                'name' => 'CUSTOMER',
                'display_name' => 'عميل / مشتري',
                'description' => 'تصفح الكتالوج، البحث برقم الهيكل، إضافة القطع للسلة، إنشاء الطلبات، وإدارة المرآب.',
                'label_ar' => 'عميل / مشتري',
                'label_en' => 'Customer',
                'status' => 'ACTIVE',
                'is_system' => true,
            ],
            [
                'id' => 6,
                'name' => 'MECHANIC',
                'display_name' => 'فني صيانة / ورشة',
                'description' => 'حساب متخصص للورش والفنيين لطلب القطع بالجملة وطلب عروض أسعار مباشرة.',
                'label_ar' => 'فني صيانة / ورشة',
                'label_en' => 'Mechanic / Workshop',
                'status' => 'ACTIVE',
                'is_system' => true,
            ],
            [
                'id' => 7,
                'name' => 'DELIVERY',
                'display_name' => 'مندوب توصيل',
                'description' => 'استلام وتوصيل شحنات وطلبات قطع الغيار وتحديث حالة التوصيل.',
                'label_ar' => 'مندوب توصيل',
                'label_en' => 'Delivery Driver',
                'status' => 'ACTIVE',
                'is_system' => true,
            ],
        ];

        foreach ($roles as $r) {
            DB::table('roles')->updateOrInsert(['id' => $r['id']], $r);
        }

        // 2. Comprehensive Permissions across all 20 modules
        $permissions = [
            // --- 1. USERS ---
            ['name' => 'users.view', 'display_name' => 'عرض المستخدمين', 'description' => 'عرض قائمة وتفاصيل المستخدمين في المنصة', 'module' => 'users', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'users.create', 'display_name' => 'إنشاء مستخدم جديد', 'description' => 'إضافة حساب مستخدم جديد يدوياً', 'module' => 'users', 'action' => 'create', 'scope' => 'PLATFORM'],
            ['name' => 'users.update', 'display_name' => 'تعديل بيانات المستخدم', 'description' => 'تعديل الملف الشخصي والبيانات الأساسية', 'module' => 'users', 'action' => 'update', 'scope' => 'PLATFORM'],
            ['name' => 'users.delete', 'display_name' => 'حذف المستخدم', 'description' => 'حذف حساب مستخدم من النظام', 'module' => 'users', 'action' => 'delete', 'scope' => 'PLATFORM'],
            ['name' => 'users.suspend', 'display_name' => 'تعليق الحساب', 'description' => 'إيقاف نشاط حساب المستخدم مؤقتاً', 'module' => 'users', 'action' => 'suspend', 'scope' => 'PLATFORM'],
            ['name' => 'users.activate', 'display_name' => 'تنشيط الحساب', 'description' => 'إعادة تفعيل الحساب المعلق', 'module' => 'users', 'action' => 'activate', 'scope' => 'PLATFORM'],
            ['name' => 'users.role_assign', 'display_name' => 'تعيين الأدوار للمستخدمين', 'description' => 'تغيير رتبة المستخدم وصلاحياته', 'module' => 'users', 'action' => 'assign', 'scope' => 'PLATFORM'],
            ['name' => 'roles.manage', 'display_name' => 'إدارة الأدوار والصلاحيات', 'description' => 'إنشاء وتعديل الأدوار ومصفوفة الصلاحيات', 'module' => 'users', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 2. SHOPS ---
            ['name' => 'shops.view', 'display_name' => 'عرض المتاجر', 'description' => 'عرض قائمة المتاجر وتفاصيلها', 'module' => 'shops', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'shops.create', 'display_name' => 'تسجيل متجر جديد', 'description' => 'إنشاء أو تسجيل متجر قطع غيار', 'module' => 'shops', 'action' => 'create', 'scope' => 'PLATFORM'],
            ['name' => 'shops.update', 'display_name' => 'تعديل بيانات المتجر', 'description' => 'تعديل معلومات وتفاصيل المتجر', 'module' => 'shops', 'action' => 'update', 'scope' => 'SHOP'],
            ['name' => 'shops.approve', 'display_name' => 'اعتماد المتجر', 'description' => 'الموافقة على طلب انضمام المتجر للمنصة', 'module' => 'shops', 'action' => 'approve', 'scope' => 'PLATFORM'],
            ['name' => 'shops.reject', 'display_name' => 'رفض المتجر', 'description' => 'رفض طلب تسجيل المتجر مع ذكر السبب', 'module' => 'shops', 'action' => 'reject', 'scope' => 'PLATFORM'],
            ['name' => 'shops.suspend', 'display_name' => 'تعليق المتجر', 'description' => 'إيقاف متجر قطع الغيار عن البيع', 'module' => 'shops', 'action' => 'suspend', 'scope' => 'PLATFORM'],
            ['name' => 'shops.activate', 'display_name' => 'تفعيل المتجر', 'description' => 'إعادة فتح وتفعيل المتجر', 'module' => 'shops', 'action' => 'activate', 'scope' => 'PLATFORM'],

            // --- 3. EMPLOYEES ---
            ['name' => 'employees.view', 'display_name' => 'عرض موظفي المتجر', 'description' => 'عرض قائمة موظفي المتجر وفروعهم', 'module' => 'employees', 'action' => 'view', 'scope' => 'SHOP'],
            ['name' => 'employees.create', 'display_name' => 'دعوة موظف جديد', 'description' => 'إضافة ودعوة موظف للعمل في المتجر', 'module' => 'employees', 'action' => 'create', 'scope' => 'SHOP'],
            ['name' => 'employees.update', 'display_name' => 'تعديل بيانات الموظف', 'description' => 'تعديل صلاحيات ومسمى موظف المتجر', 'module' => 'employees', 'action' => 'update', 'scope' => 'SHOP'],
            ['name' => 'employees.delete', 'display_name' => 'فصل أو إزالة موظف', 'description' => 'إنهاء ارتباط الموظف بالمتجر', 'module' => 'employees', 'action' => 'delete', 'scope' => 'SHOP'],

            // --- 4. PRODUCTS ---
            ['name' => 'products.view', 'display_name' => 'عرض المنتجات والقطع', 'description' => 'تصفح وعرض القطع والمنتجات', 'module' => 'products', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'products.create', 'display_name' => 'إضافة قطعة غيار جديدة', 'description' => 'إدراج منتج جديد للبيع', 'module' => 'products', 'action' => 'create', 'scope' => 'SHOP'],
            ['name' => 'products.update', 'display_name' => 'تعديل القطعة والأسعار', 'description' => 'تعديل مواصفات وسعر القطعة', 'module' => 'products', 'action' => 'update', 'scope' => 'SHOP'],
            ['name' => 'products.delete', 'display_name' => 'حذف قطعة غيار', 'description' => 'إزالة المنتج من المتجر', 'module' => 'products', 'action' => 'delete', 'scope' => 'SHOP'],
            ['name' => 'products.moderate', 'display_name' => 'مراقبة وإيقاف المنتجات إدارياً', 'description' => 'إيقاف القطع المخالفة بقرار إدارة المنصة', 'module' => 'products', 'action' => 'moderate', 'scope' => 'PLATFORM'],

            // --- 5. CATEGORIES ---
            ['name' => 'categories.view', 'display_name' => 'عرض أقسام القطع', 'description' => 'عرض الهيكل التصنيفي للقطع', 'module' => 'categories', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'categories.create', 'display_name' => 'إضافة قسم جديد', 'description' => 'إنشاء تصنيف رئيسي أو فرعي', 'module' => 'categories', 'action' => 'create', 'scope' => 'PLATFORM'],
            ['name' => 'categories.update', 'display_name' => 'تعديل الأقسام', 'description' => 'تحديث مسمى وصور الأقسام', 'module' => 'categories', 'action' => 'update', 'scope' => 'PLATFORM'],
            ['name' => 'categories.delete', 'display_name' => 'حذف قسم', 'description' => 'حذف تصنيف قطع الغيار', 'module' => 'categories', 'action' => 'delete', 'scope' => 'PLATFORM'],

            // --- 6. MANUFACTURERS ---
            ['name' => 'manufacturers.view', 'display_name' => 'عرض الشركات المصنعة', 'description' => 'عرض قائمة مصنعي قطع الغيار', 'module' => 'manufacturers', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'manufacturers.manage', 'display_name' => 'إدارة الشركات المصنعة', 'description' => 'إضافة وتعديل العلامات والمصنعين', 'module' => 'manufacturers', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 7. VEHICLES ---
            ['name' => 'vehicles.view', 'display_name' => 'عرض مرجع السيارات', 'description' => 'تصفح قاعدة بيانات السيارات والموديلات', 'module' => 'vehicles', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'vehicles.manage', 'display_name' => 'إدارة ومزامنة السيارات', 'description' => 'مزامنة بيانات NHTSA وتعديل الموديلات', 'module' => 'vehicles', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 8. INVENTORY ---
            ['name' => 'inventory.view', 'display_name' => 'عرض كميات المخزون', 'description' => 'معاينة مستويات المخزون وحركاته', 'module' => 'inventory', 'action' => 'view', 'scope' => 'SHOP'],
            ['name' => 'inventory.update', 'display_name' => 'تحديث كميات المخزون', 'description' => 'تعديل الكميات المتوفرة في الفرع', 'module' => 'inventory', 'action' => 'update', 'scope' => 'SHOP'],
            ['name' => 'inventory.adjust', 'display_name' => 'تسوية وتعديل المخزون', 'description' => 'إجراء تسوية يدوية مع تدوين السبب', 'module' => 'inventory', 'action' => 'adjust', 'scope' => 'SHOP'],
            ['name' => 'inventory.transfer', 'display_name' => 'تحويل مخزون بين الفروع', 'description' => 'نقل كميات قطع بين فروع المتجر', 'module' => 'inventory', 'action' => 'transfer', 'scope' => 'SHOP'],

            // --- 9. ORDERS ---
            ['name' => 'orders.view', 'display_name' => 'عرض الطلبات', 'description' => 'الاطلاع على تفاصيل الطلبات ومراحلها', 'module' => 'orders', 'action' => 'view', 'scope' => 'SHOP'],
            ['name' => 'orders.create', 'display_name' => 'إنشاء طلب شراء', 'description' => 'إنهاء سلة الشراء وإنشاء طلب جديد', 'module' => 'orders', 'action' => 'create', 'scope' => 'OWN'],
            ['name' => 'orders.update', 'display_name' => 'تحديث حالة الطلب', 'description' => 'تغيير حالة الطلب (تجهيز، جاهز، تم التسليم)', 'module' => 'orders', 'action' => 'update', 'scope' => 'SHOP'],
            ['name' => 'orders.delete', 'display_name' => 'إلغاء الطلب', 'description' => 'إلغاء الطلب أو إرجاعه', 'module' => 'orders', 'action' => 'delete', 'scope' => 'SHOP'],

            // --- 10. PAYMENTS ---
            ['name' => 'payments.view', 'display_name' => 'عرض المدفوعات والعمليات', 'description' => 'الاطلاع على سجل الدفع وحالة التحويلات', 'module' => 'payments', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'payments.manage', 'display_name' => 'إدارة التسويات والمدفوعات', 'description' => 'تأكيد الحوالات والتحقق المالي', 'module' => 'payments', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 11. REVIEWS ---
            ['name' => 'reviews.view', 'display_name' => 'عرض التقييمات', 'description' => 'قراءة تقييمات العملاء للمتاجر والقطع', 'module' => 'reviews', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'reviews.create', 'display_name' => 'كتابة تقييم', 'description' => 'كتابة مراجعة وتقييم بالنجوم بعد الشراء', 'module' => 'reviews', 'action' => 'create', 'scope' => 'OWN'],
            ['name' => 'reviews.moderate', 'display_name' => 'الإشراف على التقييمات', 'description' => 'اعتماد أو إخفاء التقييمات غير اللائقة', 'module' => 'reviews', 'action' => 'moderate', 'scope' => 'PLATFORM'],

            // --- 12. COMPLAINTS ---
            ['name' => 'complaints.view', 'display_name' => 'عرض الشكاوى والنزاعات', 'description' => 'متابعة شكاوى المستخدمين والمتاجر', 'module' => 'complaints', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'complaints.manage', 'display_name' => 'معالجة الشكاوى وإغلاقها', 'description' => 'الرد على الشكاوى والبت في النزاعات', 'module' => 'complaints', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 13. COUPONS ---
            ['name' => 'coupons.view', 'display_name' => 'عرض كوبونات الخصم', 'description' => 'الاطلاع على قسائم الخصم الفعالة', 'module' => 'coupons', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'coupons.manage', 'display_name' => 'إدارة الكوبونات والخصومات', 'description' => 'إنشاء قسائم خصم جديدة وتحديد شروطها', 'module' => 'coupons', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 14. BANNERS ---
            ['name' => 'banners.view', 'display_name' => 'عرض البانرات والإعلانات', 'description' => 'مشاهدة إعلانات المنصة الترويجية', 'module' => 'banners', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'banners.manage', 'display_name' => 'إدارة البانرات والحملات', 'description' => 'إضافة وتعديل وحذف إعلانات الصفحة الرئيسية', 'module' => 'banners', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 15. NOTIFICATIONS ---
            ['name' => 'notifications.view', 'display_name' => 'عرض الإشعارات', 'description' => 'استقبال وقراءة الإشعارات الواردة', 'module' => 'notifications', 'action' => 'view', 'scope' => 'OWN'],
            ['name' => 'notifications.send', 'display_name' => 'إرسال إشعارات جماعية', 'description' => 'بث إشعارات للمستخدمين أو المتاجر', 'module' => 'notifications', 'action' => 'send', 'scope' => 'PLATFORM'],

            // --- 16. REPORTS ---
            ['name' => 'reports.view', 'display_name' => 'عرض التقارير والإحصائيات', 'description' => 'الاطلاع على لوحات القياس والتقارير المالية', 'module' => 'reports', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'reports.export', 'display_name' => 'تصدير التقارير', 'description' => 'تنزيل التقارير بصيغة Excel أو PDF', 'module' => 'reports', 'action' => 'export', 'scope' => 'PLATFORM'],

            // --- 17. COMMISSIONS ---
            ['name' => 'commissions.view', 'display_name' => 'عرض عمولات المتاجر', 'description' => 'معاينة نسب ومبالغ عمولات المنصة', 'module' => 'commissions', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'commissions.manage', 'display_name' => 'تعديل نسب العمولات', 'description' => 'تحديد عمولة مخصصة لكل متجر أو فئة', 'module' => 'commissions', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 18. AUDIT_LOGS ---
            ['name' => 'audit_logs.view', 'display_name' => 'عرض سجل التدقيق والأمان', 'description' => 'معاينة سجل العمليات الإدارية الحساسة', 'module' => 'audit_logs', 'action' => 'view', 'scope' => 'PLATFORM'],

            // --- 19. GEOGRAPHY ---
            ['name' => 'geography.view', 'display_name' => 'عرض الدول والمدن', 'description' => 'تصفح قائمة الدول والمدن المعتمدة', 'module' => 'geography', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'geography.manage', 'display_name' => 'إدارة الدول والمدن', 'description' => 'إضافة وتعديل المدن وتغطية التوصيل', 'module' => 'geography', 'action' => 'manage', 'scope' => 'PLATFORM'],

            // --- 20. SETTINGS ---
            ['name' => 'settings.view', 'display_name' => 'عرض إعدادات النظام', 'description' => 'الاطلاع على الإعدادات العامة والتشغيلية', 'module' => 'settings', 'action' => 'view', 'scope' => 'PLATFORM'],
            ['name' => 'settings.update', 'display_name' => 'تعديل إعدادات المنصة', 'description' => 'تعديل المعايير العامة وبوابات الدفع والتوصيل', 'module' => 'settings', 'action' => 'update', 'scope' => 'PLATFORM'],
        ];

        foreach ($permissions as $p) {
            $p['label_ar'] = $p['display_name'];
            $p['label_en'] = $p['name'];
            $p['group'] = $p['module'];
            $p['is_system'] = true;
            $p['created_at'] = now();
            $p['updated_at'] = now();

            DB::table('permissions')->updateOrInsert(['name' => $p['name']], $p);
        }

        // 3. Clear existing role_permissions to build clean mapping
        DB::table('role_permissions')->delete();

        $allPermMap = DB::table('permissions')->pluck('id', 'name')->toArray();

        // 4. SUPER_ADMIN receives ALL permissions
        foreach ($allPermMap as $name => $permId) {
            DB::table('role_permissions')->insert([
                'role_id' => 1, // SUPER_ADMIN
                'permission_id' => $permId,
            ]);
        }

        // 5. ADMIN receives standard operations & management permissions (except super settings/roles)
        $adminPermNames = [
            'users.view', 'users.create', 'users.update', 'users.suspend', 'users.activate', 'users.role_assign',
            'roles.manage',
            'shops.view', 'shops.create', 'shops.update', 'shops.approve', 'shops.reject', 'shops.suspend', 'shops.activate',
            'employees.view',
            'products.view', 'products.moderate',
            'categories.view', 'categories.create', 'categories.update', 'categories.delete',
            'manufacturers.view', 'manufacturers.manage',
            'vehicles.view', 'vehicles.manage',
            'inventory.view',
            'orders.view', 'orders.update',
            'payments.view', 'payments.manage',
            'reviews.view', 'reviews.moderate',
            'complaints.view', 'complaints.manage',
            'coupons.view', 'coupons.manage',
            'banners.view', 'banners.manage',
            'notifications.view', 'notifications.send',
            'reports.view', 'reports.export',
            'commissions.view', 'commissions.manage',
            'audit_logs.view',
            'geography.view', 'geography.manage',
            'settings.view',
        ];

        foreach ($adminPermNames as $pName) {
            if (isset($allPermMap[$pName])) {
                DB::table('role_permissions')->insert([
                    'role_id' => 2, // ADMIN
                    'permission_id' => $allPermMap[$pName],
                ]);
            }
        }

        // 6. SHOP_OWNER receives full shop-scoped permissions
        $shopOwnerPermNames = [
            'shops.view', 'shops.update',
            'employees.view', 'employees.create', 'employees.update', 'employees.delete',
            'products.view', 'products.create', 'products.update', 'products.delete',
            'categories.view',
            'manufacturers.view',
            'vehicles.view',
            'inventory.view', 'inventory.update', 'inventory.adjust', 'inventory.transfer',
            'orders.view', 'orders.update',
            'reviews.view',
            'notifications.view',
            'reports.view',
        ];

        foreach ($shopOwnerPermNames as $pName) {
            if (isset($allPermMap[$pName])) {
                DB::table('role_permissions')->insert([
                    'role_id' => 3, // SHOP_OWNER
                    'permission_id' => $allPermMap[$pName],
                ]);
            }
        }

        // 7. SHOP_EMPLOYEE receives daily operational permissions
        $shopEmployeePermNames = [
            'shops.view',
            'products.view', 'products.update',
            'inventory.view', 'inventory.update',
            'orders.view', 'orders.update',
            'notifications.view',
        ];

        foreach ($shopEmployeePermNames as $pName) {
            if (isset($allPermMap[$pName])) {
                DB::table('role_permissions')->insert([
                    'role_id' => 4, // SHOP_EMPLOYEE
                    'permission_id' => $allPermMap[$pName],
                ]);
            }
        }

        // 8. CUSTOMER receives standard buyer permissions
        $customerPermNames = [
            'products.view',
            'categories.view',
            'manufacturers.view',
            'vehicles.view',
            'shops.view',
            'orders.create', 'orders.view',
            'reviews.create', 'reviews.view',
            'notifications.view',
        ];

        foreach ($customerPermNames as $pName) {
            if (isset($allPermMap[$pName])) {
                DB::table('role_permissions')->insert([
                    'role_id' => 5, // CUSTOMER
                    'permission_id' => $allPermMap[$pName],
                ]);
            }
        }

        // 9. Initial Default Settings
        $defaultSettings = [
            ['key' => 'site_name_ar', 'group' => 'general', 'value' => json_encode('ALA · عالم قطع الغيار'), 'is_public' => true],
            ['key' => 'site_name_en', 'group' => 'general', 'value' => json_encode('ALA Auto Spare Parts Marketplace'), 'is_public' => true],
            ['key' => 'support_email', 'group' => 'general', 'value' => json_encode('support@ala-parts.com'), 'is_public' => true],
            ['key' => 'support_phone', 'group' => 'general', 'value' => json_encode('+967 770 000 001'), 'is_public' => true],
            ['key' => 'default_currency', 'group' => 'localization', 'value' => json_encode('USD'), 'is_public' => true],
            ['key' => 'default_commission_rate', 'group' => 'commission', 'value' => json_encode(5.0), 'is_public' => false],
            ['key' => 'auto_approve_shops', 'group' => 'marketplace', 'value' => json_encode(false), 'is_public' => false],
            ['key' => 'enable_guest_checkout', 'group' => 'orders', 'value' => json_encode(false), 'is_public' => true],
            ['key' => 'cod_enabled', 'group' => 'payments', 'value' => json_encode(true), 'is_public' => true],
            ['key' => 'bank_transfer_enabled', 'group' => 'payments', 'value' => json_encode(true), 'is_public' => true],
        ];

        foreach ($defaultSettings as $st) {
            $st['created_at'] = now();
            $st['updated_at'] = now();
            DB::table('settings')->updateOrInsert(['key' => $st['key']], $st);
        }
    }
}
