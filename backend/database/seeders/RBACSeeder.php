<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RBACSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $roles = [
            ['id' => 1, 'name' => 'SUPER_ADMIN', 'label_ar' => 'مدير النظام الأعلى', 'label_en' => 'Super Administrator', 'is_system' => true],
            ['id' => 2, 'name' => 'ADMIN', 'label_ar' => 'مدير المنصة', 'label_en' => 'Platform Administrator', 'is_system' => true],
            ['id' => 3, 'name' => 'SHOP_OWNER', 'label_ar' => 'مالك متجر قطع غيار', 'label_en' => 'Shop Owner', 'is_system' => true],
            ['id' => 4, 'name' => 'SHOP_EMPLOYEE', 'label_ar' => 'موظف متجر', 'label_en' => 'Shop Employee', 'is_system' => true],
            ['id' => 5, 'name' => 'CUSTOMER', 'label_ar' => 'عميل / مشتري', 'label_en' => 'Customer', 'is_system' => true],
            ['id' => 6, 'name' => 'MECHANIC', 'label_ar' => 'ورشة / فني صيانة', 'label_en' => 'Mechanic / Workshop', 'is_system' => true],
            ['id' => 7, 'name' => 'DELIVERY', 'label_ar' => 'مندوب توصيل', 'label_en' => 'Delivery Driver', 'is_system' => true],
        ];

        foreach ($roles as $r) {
            DB::table('roles')->updateOrInsert(['id' => $r['id']], $r);
        }

        // 2. Permissions
        $permissions = [
            // Admin permissions
            ['name' => 'ADMIN_DASHBOARD_VIEW', 'label_ar' => 'عرض لوحة تحكم الإدارة', 'label_en' => 'View Admin Dashboard', 'group' => 'admin'],
            ['name' => 'USERS_MANAGE', 'label_ar' => 'إدارة المستخدمين والأدوار', 'label_en' => 'Manage Users and Roles', 'group' => 'admin'],
            ['name' => 'SHOPS_APPROVE', 'label_ar' => 'اعتماد وتعليق المتاجر', 'label_en' => 'Approve and Suspend Shops', 'group' => 'admin'],
            ['name' => 'PRODUCTS_MODERATE', 'label_ar' => 'مراقبة وإيقاف المنتجات', 'label_en' => 'Moderate and Disable Products', 'group' => 'admin'],
            ['name' => 'CATEGORIES_MANAGE', 'label_ar' => 'إدارة أقسام وتصنيفات القطع', 'label_en' => 'Manage Parts Categories', 'group' => 'admin'],
            ['name' => 'REPORTS_VIEW', 'label_ar' => 'عرض التقارير والإحصائيات المالية', 'label_en' => 'View Reports and Analytics', 'group' => 'admin'],
            ['name' => 'AUDIT_LOGS_VIEW', 'label_ar' => 'عرض سجل التدقيق والأمان', 'label_en' => 'View Audit Logs', 'group' => 'admin'],
            ['name' => 'BANNERS_MANAGE', 'label_ar' => 'إدارة الإعلانات والبانرات', 'label_en' => 'Manage Banners and Ads', 'group' => 'admin'],
            ['name' => 'VEHICLES_SYNC', 'label_ar' => 'مزامنة قاعدة بيانات السيارات', 'label_en' => 'Sync Vehicle Database', 'group' => 'admin'],

            // Shop permissions
            ['name' => 'SHOP_PROFILE_EDIT', 'label_ar' => 'تعديل بيانات المتجر', 'label_en' => 'Edit Shop Profile', 'group' => 'shop'],
            ['name' => 'SHOP_PRODUCTS_MANAGE', 'label_ar' => 'إضافة وتعديل وحذف المنتجات', 'label_en' => 'Manage Products', 'group' => 'shop'],
            ['name' => 'SHOP_INVENTORY_MANAGE', 'label_ar' => 'إدارة المخزون والكميات', 'label_en' => 'Manage Inventory', 'group' => 'shop'],
            ['name' => 'SHOP_ORDERS_PROCESS', 'label_ar' => 'معالجة وتأكيد الطلبات', 'label_en' => 'Process Orders', 'group' => 'shop'],
            ['name' => 'SHOP_EMPLOYEES_MANAGE', 'label_ar' => 'إدارة موظفي وصلاحيات المتجر', 'label_en' => 'Manage Employees', 'group' => 'shop'],
            ['name' => 'SHOP_BRANCHES_MANAGE', 'label_ar' => 'إدارة فروع المتجر', 'label_en' => 'Manage Branches', 'group' => 'shop'],
            ['name' => 'SHOP_FINANCES_VIEW', 'label_ar' => 'عرض المبيعات والأرباح', 'label_en' => 'View Sales and Revenue', 'group' => 'shop'],

            // Customer permissions
            ['name' => 'ORDERS_PLACE', 'label_ar' => 'إنشاء وطلب القطع', 'label_en' => 'Place Orders', 'group' => 'customer'],
            ['name' => 'GARAGE_MANAGE', 'label_ar' => 'إدارة مرآب سياراتي', 'label_en' => 'Manage My Garage', 'group' => 'customer'],
            ['name' => 'REVIEWS_WRITE', 'label_ar' => 'كتابة تقييمات المتاجر والقطع', 'label_en' => 'Write Reviews', 'group' => 'customer'],
        ];

        foreach ($permissions as $p) {
            DB::table('permissions')->updateOrInsert(['name' => $p['name']], $p);
        }

        // 3. Assign all permissions to SUPER_ADMIN & ADMIN
        $allPermIds = DB::table('permissions')->pluck('id');
        foreach ($allPermIds as $pId) {
            DB::table('role_permissions')->updateOrInsert(['role_id' => 1, 'permission_id' => $pId], []);
            DB::table('role_permissions')->updateOrInsert(['role_id' => 2, 'permission_id' => $pId], []);
        }

        // 4. Assign shop permissions to SHOP_OWNER
        $shopPerms = DB::table('permissions')->where('group', 'shop')->pluck('id');
        foreach ($shopPerms as $pId) {
            DB::table('role_permissions')->updateOrInsert(['role_id' => 3, 'permission_id' => $pId], []);
        }

        // 5. Assign customer permissions
        $custPerms = DB::table('permissions')->where('group', 'customer')->pluck('id');
        foreach ($custPerms as $pId) {
            DB::table('role_permissions')->updateOrInsert(['role_id' => 5, 'permission_id' => $pId], []);
        }
    }
}
