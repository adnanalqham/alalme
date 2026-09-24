<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class RealMarketplaceActivitySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Fetch available customers, shops, products
        $customers = DB::table('users')->where('role', 'CUSTOMER')->get();
        if ($customers->isEmpty()) {
            $customerId = 'u_customer_demo_01';
            DB::table('users')->updateOrInsert(['id' => $customerId], [
                'clerk_user_id' => 'clerk_demo_cust_01',
                'email' => 'customer.demo@ala.ye',
                'full_name' => 'صالح محمد الحكيمي',
                'phone' => '+967771122334',
                'role' => 'CUSTOMER',
                'status' => 'ACTIVE',
                'created_at' => Carbon::now()->subDays(45),
                'updated_at' => Carbon::now()->subDays(45),
            ]);
            $customers = DB::table('users')->where('role', 'CUSTOMER')->get();
        }

        $shops = DB::table('shops')->get();
        $products = DB::table('products')->get();

        if ($shops->isEmpty() || $products->isEmpty()) {
            return;
        }

        $cust = $customers->first();
        $shop1 = $shops->first();
        $shop2 = $shops->count() > 1 ? $shops->skip(1)->first() : $shop1;
        $prod1 = $products->first();
        $prod2 = $products->count() > 1 ? $products->skip(1)->first() : $prod1;
        $prod3 = $products->count() > 2 ? $products->skip(2)->first() : $prod1;

        // Ensure inventory has low-stock and out-of-stock records for testing metrics
        DB::table('inventories')->where('product_id', $prod1->id)->update([
            'quantity' => 2,
            'low_stock_threshold' => 5,
        ]);
        DB::table('inventories')->where('product_id', $prod2->id)->update([
            'quantity' => 0,
            'low_stock_threshold' => 5,
        ]);

        // 2. Orders Seeding across realistic timeline
        $orderData = [
            // Today's orders
            [
                'id' => 'ord_demo_today_01',
                'order_number' => 'ALA-2026-0924-001',
                'customer_id' => $cust->id,
                'subtotal' => 120.00,
                'delivery_fee' => 10.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 130.00,
                'currency_code' => 'USD',
                'status' => 'COMPLETED',
                'delivery_type' => 'EXPRESS',
                'payment_method' => 'KURIMI',
                'payment_status' => 'PAID',
                'created_at' => Carbon::now()->subHours(2),
                'product' => $prod1,
                'qty' => 1,
            ],
            [
                'id' => 'ord_demo_today_02',
                'order_number' => 'ALA-2026-0924-002',
                'customer_id' => $cust->id,
                'subtotal' => 85.00,
                'delivery_fee' => 5.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 90.00,
                'currency_code' => 'USD',
                'status' => 'PENDING',
                'delivery_type' => 'STANDARD',
                'payment_method' => 'CASH_ON_DELIVERY',
                'payment_status' => 'PENDING',
                'created_at' => Carbon::now()->subHours(4),
                'product' => $prod2,
                'qty' => 1,
            ],
            // Yesterday's orders
            [
                'id' => 'ord_demo_yest_01',
                'order_number' => 'ALA-2026-0923-001',
                'customer_id' => $cust->id,
                'subtotal' => 240.00,
                'delivery_fee' => 15.00,
                'discount' => 10.00,
                'tax' => 0.00,
                'total' => 245.00,
                'currency_code' => 'USD',
                'status' => 'COMPLETED',
                'delivery_type' => 'STANDARD',
                'payment_method' => 'JAWALI',
                'payment_status' => 'PAID',
                'created_at' => Carbon::now()->subDay()->subHours(5),
                'product' => $prod3,
                'qty' => 2,
            ],
            // 3 days ago
            [
                'id' => 'ord_demo_day3_01',
                'order_number' => 'ALA-2026-0921-001',
                'customer_id' => $cust->id,
                'subtotal' => 150.00,
                'delivery_fee' => 10.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 160.00,
                'currency_code' => 'USD',
                'status' => 'CONFIRMED',
                'delivery_type' => 'STANDARD',
                'payment_method' => 'KURIMI',
                'payment_status' => 'PAID',
                'created_at' => Carbon::now()->subDays(3),
                'product' => $prod1,
                'qty' => 1,
            ],
            // 7 days ago
            [
                'id' => 'ord_demo_day7_01',
                'order_number' => 'ALA-2026-0917-001',
                'customer_id' => $cust->id,
                'subtotal' => 310.00,
                'delivery_fee' => 15.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 325.00,
                'currency_code' => 'USD',
                'status' => 'COMPLETED',
                'delivery_type' => 'STANDARD',
                'payment_method' => 'CARD',
                'payment_status' => 'PAID',
                'created_at' => Carbon::now()->subDays(7),
                'product' => $prod2,
                'qty' => 2,
            ],
            // 15 days ago
            [
                'id' => 'ord_demo_day15_01',
                'order_number' => 'ALA-2026-0909-001',
                'customer_id' => $cust->id,
                'subtotal' => 95.00,
                'delivery_fee' => 10.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 105.00,
                'currency_code' => 'USD',
                'status' => 'CANCELLED',
                'delivery_type' => 'STANDARD',
                'payment_method' => 'CASH_ON_DELIVERY',
                'payment_status' => 'REFUNDED',
                'created_at' => Carbon::now()->subDays(15),
                'product' => $prod1,
                'qty' => 1,
            ],
            // Last month
            [
                'id' => 'ord_demo_month1_01',
                'order_number' => 'ALA-2026-0820-001',
                'customer_id' => $cust->id,
                'subtotal' => 450.00,
                'delivery_fee' => 20.00,
                'discount' => 25.00,
                'tax' => 0.00,
                'total' => 445.00,
                'currency_code' => 'USD',
                'status' => 'COMPLETED',
                'delivery_type' => 'EXPRESS',
                'payment_method' => 'KURIMI',
                'payment_status' => 'PAID',
                'created_at' => Carbon::now()->subDays(35),
                'product' => $prod3,
                'qty' => 3,
            ],
            // Two months ago
            [
                'id' => 'ord_demo_month2_01',
                'order_number' => 'ALA-2026-0715-001',
                'customer_id' => $cust->id,
                'subtotal' => 290.00,
                'delivery_fee' => 15.00,
                'discount' => 0.00,
                'tax' => 0.00,
                'total' => 305.00,
                'currency_code' => 'USD',
                'status' => 'COMPLETED',
                'delivery_type' => 'STANDARD',
                'payment_method' => 'JAWALI',
                'payment_status' => 'PAID',
                'created_at' => Carbon::now()->subDays(65),
                'product' => $prod1,
                'qty' => 2,
            ],
        ];

        foreach ($orderData as $ord) {
            $prod = $ord['product'];
            $qty = $ord['qty'];
            $shopId = $prod->shop_id;

            DB::table('orders')->updateOrInsert(['id' => $ord['id']], [
                'order_number' => $ord['order_number'],
                'customer_id' => $ord['customer_id'],
                'subtotal' => $ord['subtotal'],
                'delivery_fee' => $ord['delivery_fee'],
                'discount' => $ord['discount'],
                'tax' => $ord['tax'],
                'total' => $ord['total'],
                'currency_code' => $ord['currency_code'],
                'status' => $ord['status'],
                'delivery_type' => $ord['delivery_type'],
                'payment_method' => $ord['payment_method'],
                'payment_status' => $ord['payment_status'],
                'created_at' => $ord['created_at'],
                'updated_at' => $ord['created_at'],
            ]);

            // Shop Group
            $groupId = 'osg_' . $ord['id'];
            DB::table('order_shop_groups')->updateOrInsert(['id' => $groupId], [
                'order_id' => $ord['id'],
                'shop_id' => $shopId,
                'branch_id' => null,
                'subtotal' => $ord['subtotal'],
                'delivery_fee' => $ord['delivery_fee'],
                'total' => $ord['total'],
                'status' => $ord['status'],
                'delivery_type' => $ord['delivery_type'],
                'created_at' => $ord['created_at'],
                'updated_at' => $ord['created_at'],
            ]);

            // Order Item
            DB::table('order_items')->updateOrInsert([
                'order_id' => $ord['id'],
                'product_id' => $prod->id,
            ], [
                'order_shop_group_id' => $groupId,
                'shop_id' => $shopId,
                'product_name_ar' => $prod->name_ar,
                'product_name_en' => $prod->name_en,
                'part_number' => $prod->part_number,
                'oem_number' => $prod->oem_number,
                'quantity' => $qty,
                'unit_price' => $prod->price,
                'total_price' => $prod->price * $qty,
                'currency_code' => $ord['currency_code'],
                'created_at' => $ord['created_at'],
                'updated_at' => $ord['created_at'],
            ]);
        }

        // 3. Reviews Seeding
        DB::table('reviews')->updateOrInsert(['id' => 'rev_demo_01'], [
            'user_id' => $cust->id,
            'shop_id' => $shop1->id,
            'product_id' => $prod1->id,
            'order_id' => 'ord_demo_today_01',
            'rating' => 5,
            'comment' => 'قطعة أصلية ومطابقة تماماً لسيارتي تويوتا لاندكروزر وسرعة توصيل ممتازة.',
            'status' => 'APPROVED',
            'created_at' => Carbon::now()->subDays(2),
            'updated_at' => Carbon::now()->subDays(2),
        ]);

        DB::table('reviews')->updateOrInsert(['id' => 'rev_demo_02'], [
            'user_id' => $cust->id,
            'shop_id' => $shop2->id,
            'product_id' => $prod3->id,
            'order_id' => 'ord_demo_yest_01',
            'rating' => 4,
            'comment' => 'جودة ممتازة وسعر منافس، تم التركيب بنجاح.',
            'status' => 'APPROVED',
            'created_at' => Carbon::now()->subDays(4),
            'updated_at' => Carbon::now()->subDays(4),
        ]);

        // 4. Complaints Seeding
        DB::table('complaints')->updateOrInsert(['id' => 'cmp_demo_01'], [
            'user_id' => $cust->id,
            'shop_id' => $shop1->id,
            'order_id' => 'ord_demo_day15_01',
            'subject' => 'استفسار عن تأخر وصول الشحنة',
            'description' => 'تم إلغاء الطلب واسترجاع المبلغ بنجاح عبر الكريمي.',
            'status' => 'RESOLVED',
            'created_at' => Carbon::now()->subDays(14),
            'updated_at' => Carbon::now()->subDays(13),
            'resolved_at' => Carbon::now()->subDays(13),
        ]);

        DB::table('complaints')->updateOrInsert(['id' => 'cmp_demo_02'], [
            'user_id' => $cust->id,
            'shop_id' => $shop2->id,
            'order_id' => 'ord_demo_today_02',
            'subject' => 'طلب تعديل عنوان التسليم',
            'description' => 'يرجى تغيير موقع التوصيل إلى شارع الستين الغربي.',
            'status' => 'OPEN',
            'created_at' => Carbon::now()->subHours(3),
            'updated_at' => Carbon::now()->subHours(3),
        ]);

        // 5. Audit Logs Seeding
        $adminUser = DB::table('users')->where('role', 'SUPER_ADMIN')->first();
        $adminId = $adminUser ? $adminUser->id : 'system';

        DB::table('audit_logs')->insert([
            [
                'user_id' => $adminId,
                'action' => 'ROLE_PERMISSIONS_SYNC',
                'entity_type' => 'Role',
                'entity_id' => '1',
                'old_values' => json_encode(['permissions_count' => 19]),
                'new_values' => json_encode(['permissions_count' => 81]),
                'ip_address' => '127.0.0.1',
                'user_agent' => 'PostmanRuntime/7.36.0',
                'notes' => 'Upgraded platform permissions to complete 81 matrix',
                'created_at' => Carbon::now()->subHours(1),
            ],
            [
                'user_id' => $adminId,
                'action' => 'SHOP_APPROVE',
                'entity_type' => 'Shop',
                'entity_id' => $shop1->id,
                'old_values' => json_encode(['status' => 'PENDING']),
                'new_values' => json_encode(['status' => 'ACTIVE']),
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0',
                'notes' => 'Commercial registration verified',
                'created_at' => Carbon::now()->subDays(5),
            ],
        ]);
    }
}
