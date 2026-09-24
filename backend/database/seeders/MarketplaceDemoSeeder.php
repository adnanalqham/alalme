<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MarketplaceDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Initial Users (Admin, Shop Owners, Customers)
        $users = [
            [
                'id' => 'user_admin_01',
                'clerk_user_id' => 'user_clerk_admin_01',
                'full_name' => 'مدير النظام (ALA Super Admin)',
                'email' => 'admin@ala-parts.com',
                'phone' => '+967770000001',
                'role' => 'SUPER_ADMIN',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'user_shop_owner_01',
                'clerk_user_id' => 'user_clerk_owner_01',
                'full_name' => 'عدنان القحام (مركز النجم لقطع الغيار)',
                'email' => 'adnan@najm-parts.com',
                'phone' => '+967771234567',
                'role' => 'SHOP_OWNER',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'user_shop_owner_02',
                'clerk_user_id' => 'user_clerk_owner_02',
                'full_name' => 'شركة البركة للتجارة واستيراد قطع السيارات',
                'email' => 'contact@albaraka-auto.com',
                'phone' => '+967777888999',
                'role' => 'SHOP_OWNER',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'user_customer_01',
                'clerk_user_id' => 'user_clerk_customer_01',
                'full_name' => 'محمد طاهر (عميل مشتري)',
                'email' => 'customer@ala-parts.com',
                'phone' => '+967772223334',
                'role' => 'CUSTOMER',
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($users as $u) {
            DB::table('users')->updateOrInsert(['id' => $u['id']], $u);
        }

        // 2. Demo Shops
        $shops = [
            [
                'id' => 'shop_najm_parts',
                'owner_id' => 'user_shop_owner_01',
                'name_ar' => 'مركز النجم لقطع غيار تويوتا وهونداي',
                'name_en' => 'Al-Najm Auto Parts Center',
                'slug' => 'al-najm-auto-parts',
                'description_ar' => 'وكيل معتمد وموزع لأفضل قطع غيار السيارات الأصلية والتجارية عالية الجودة مع الضمان.',
                'description_en' => 'Authorized dealer and distributor of genuine and high-grade aftermarket automotive spare parts.',
                'phone' => '+967771234567',
                'whatsapp' => '+967771234567',
                'email' => 'info@najm-parts.com',
                'country_id' => 'c_ye',
                'city_id' => 'city_sanaa',
                'city' => 'صنعاء',
                'address' => 'شارع الستين الجنوبي - جوار جولة المصباحي',
                'status' => 'ACTIVE',
                'approved_at' => now(),
                'approved_by' => 'user_admin_01',
                'rating' => 4.90,
                'rating_count' => 38,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'shop_albaraka_auto',
                'owner_id' => 'user_shop_owner_02',
                'name_ar' => 'شركة البركة لقطع غيار نيسان وميتسوبيشي',
                'name_en' => 'Al-Baraka Spare Parts Co.',
                'slug' => 'al-baraka-spare-parts',
                'description_ar' => 'متخصصون في قطع محركات الديزل والبنزين والهيكل والفرامل بأسعار الجملة.',
                'description_en' => 'Specialized in diesel and petrol engine parts, chassis, and brakes at wholesale prices.',
                'phone' => '+967777888999',
                'whatsapp' => '+967777888999',
                'email' => 'sales@albaraka-auto.com',
                'country_id' => 'c_ye',
                'city_id' => 'city_aden',
                'city' => 'عدن',
                'address' => 'المنصورة - الشارع العام',
                'status' => 'ACTIVE',
                'approved_at' => now(),
                'approved_by' => 'user_admin_01',
                'rating' => 4.75,
                'rating_count' => 22,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($shops as $s) {
            DB::table('shops')->updateOrInsert(['id' => $s['id']], $s);
        }

        // 3. Shop Branches
        $branches = [
            [
                'id' => 'br_najm_main',
                'shop_id' => 'shop_najm_parts',
                'name_ar' => 'الفرع الرئيسي - شارع الستين',
                'name_en' => 'Main Branch - Sixty St',
                'phone' => '+967771234567',
                'city' => 'صنعاء',
                'address' => 'شارع الستين الجنوبي',
                'is_main' => true,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'br_najm_hadda',
                'shop_id' => 'shop_najm_parts',
                'name_ar' => 'فرع حدة',
                'name_en' => 'Hadda Branch',
                'phone' => '+967771234568',
                'city' => 'صنعاء',
                'address' => 'شارع حدة - أمام الكميم',
                'is_main' => false,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'br_baraka_main',
                'shop_id' => 'shop_albaraka_auto',
                'name_ar' => 'الفرع الرئيسي - المنصورة',
                'name_en' => 'Main Branch - Mansoura',
                'phone' => '+967777888999',
                'city' => 'عدن',
                'address' => 'المنصورة',
                'is_main' => true,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($branches as $b) {
            DB::table('shop_branches')->updateOrInsert(['id' => $b['id']], $b);
        }

        // 4. Automotive Products with Realistic Data
        $products = [
            [
                'id' => 'prod_toy_brake_01',
                'shop_id' => 'shop_najm_parts',
                'category_id' => 201, // Brake Pads
                'manufacturer_id' => 1, // Toyota Genuine
                'name_ar' => 'طقم فحمات فرامل أمامية أصلية لاند كروزر',
                'name_en' => 'Toyota Genuine Front Brake Pad Set - Land Cruiser',
                'part_number' => '04465-60320',
                'oem_number' => '0446560320',
                'condition' => 'OEM',
                'price_visibility' => 'SHOW_PRICE',
                'purchase_method' => 'DIRECT',
                'price' => 75.00,
                'currency_code' => 'USD',
                'status' => 'ACTIVE',
                'rating' => 5.0,
                'rating_count' => 14,
                'view_count' => 184,
                'description_ar' => 'فحمات فرامل أمامية وكالة أصلية تويوتا لاندكروزر V8 وV6 وسيكويا ولكزس LX570. أداء فرملة فائق وعمر طويل بدون أي أصوات.',
                'description_en' => 'Original Toyota front brake pad set for Land Cruiser V8, V6, Sequoia and Lexus LX570. Maximum stopping power with zero noise.',
                'created_at' => now(),
                'updated_at' => now(),
                'compatibilities' => [
                    ['make' => 'Toyota', 'model' => 'Land Cruiser', 'year_start' => 2008, 'year_end' => 2023],
                    ['make' => 'Toyota', 'model' => 'Prado', 'year_start' => 2010, 'year_end' => 2024],
                ],
                'qty' => 35,
            ],
            [
                'id' => 'prod_denso_spark_02',
                'shop_id' => 'shop_najm_parts',
                'category_id' => 101, // Spark Plugs
                'manufacturer_id' => 2, // Denso
                'name_ar' => 'طقم بواجي إيريديوم دينسو ياباني (4 حبات)',
                'name_en' => 'Denso Iridium TT Spark Plugs Set of 4',
                'part_number' => 'IK20TT',
                'oem_number' => '90919-01210',
                'condition' => 'NEW',
                'price_visibility' => 'SHOW_PRICE',
                'purchase_method' => 'DIRECT',
                'price' => 38.00,
                'currency_code' => 'USD',
                'status' => 'ACTIVE',
                'rating' => 4.8,
                'rating_count' => 22,
                'view_count' => 240,
                'description_ar' => 'بواجي دينسو بلاتينيوم/إيريديوم يابانية أصلية تمنح استجابة سريعة للمحرك وتوفير استهلاك الوقود لأكثر من 100,000 كم.',
                'description_en' => 'Genuine Denso Iridium TT spark plugs engineered for superior combustion efficiency and longevity.',
                'created_at' => now(),
                'updated_at' => now(),
                'compatibilities' => [
                    ['make' => 'Toyota', 'model' => 'Camry', 'year_start' => 2007, 'year_end' => 2022],
                    ['make' => 'Toyota', 'model' => 'Corolla', 'year_start' => 2008, 'year_end' => 2023],
                    ['make' => 'Hyundai', 'model' => 'Elantra', 'year_start' => 2011, 'year_end' => 2023],
                    ['make' => 'Hyundai', 'model' => 'Tucson', 'year_start' => 2010, 'year_end' => 2022],
                ],
                'qty' => 50,
            ],
            [
                'id' => 'prod_mann_filter_03',
                'shop_id' => 'shop_najm_parts',
                'category_id' => 401, // Oil Filters
                'manufacturer_id' => 6, // Mann-Filter
                'name_ar' => 'فلتر زيت محرك مان ألماني أصلي',
                'name_en' => 'Mann-Filter Engine Oil Filter',
                'part_number' => 'W 68/3',
                'oem_number' => '04152-YZZA1',
                'condition' => 'NEW',
                'price_visibility' => 'SHOW_PRICE',
                'purchase_method' => 'DIRECT',
                'price' => 9.50,
                'currency_code' => 'USD',
                'status' => 'ACTIVE',
                'rating' => 4.9,
                'rating_count' => 41,
                'view_count' => 310,
                'description_ar' => 'فلتر زيت ألماني صناعة فاخرة لتنقية زيت المحرك من الشوائب الدقيقة وحماية صمامات المحرك.',
                'description_en' => 'Premium German engineered oil filter providing exceptional filtration and engine protection.',
                'created_at' => now(),
                'updated_at' => now(),
                'compatibilities' => [
                    ['make' => 'Toyota', 'model' => 'Hilux', 'year_start' => 2006, 'year_end' => 2024],
                    ['make' => 'Toyota', 'model' => 'Fortuner', 'year_start' => 2006, 'year_end' => 2024],
                    ['make' => 'Toyota', 'model' => 'Camry', 'year_start' => 2003, 'year_end' => 2020],
                ],
                'qty' => 120,
            ],
            [
                'id' => 'prod_kyb_shock_04',
                'shop_id' => 'shop_albaraka_auto',
                'category_id' => 301, // Shock Absorbers
                'manufacturer_id' => 7, // KYB
                'name_ar' => 'مساعدات كيه واي بي إكسيل جي أمامية ياباني (حبتين)',
                'name_en' => 'KYB Excel-G Front Strut Pair - Nissan Patrol & Sunny',
                'part_number' => '333310-PAIR',
                'oem_number' => 'E4302-1HA0A',
                'condition' => 'AFTERMARKET',
                'price_visibility' => 'SHOW_PRICE',
                'purchase_method' => 'DIRECT',
                'price' => 110.00,
                'currency_code' => 'USD',
                'status' => 'ACTIVE',
                'rating' => 4.7,
                'rating_count' => 18,
                'view_count' => 165,
                'description_ar' => 'طقم مساعدات غازية أمامية يابانية KYB لاستعادة ثبات القيادة وتحمل الطرق الوعرة والمنعطفات.',
                'description_en' => 'KYB Excel-G twin tube gas struts designed to restore original handling and ride stability.',
                'created_at' => now(),
                'updated_at' => now(),
                'compatibilities' => [
                    ['make' => 'Nissan', 'model' => 'Sunny', 'year_start' => 2012, 'year_end' => 2023],
                    ['make' => 'Nissan', 'model' => 'Altima', 'year_start' => 2013, 'year_end' => 2022],
                    ['make' => 'Nissan', 'model' => 'Patrol', 'year_start' => 2010, 'year_end' => 2023],
                ],
                'qty' => 18,
            ],
            [
                'id' => 'prod_mobil_oil_05',
                'shop_id' => 'shop_najm_parts',
                'category_id' => 405, // Oils & Fluids
                'manufacturer_id' => 8, // Mobil 1
                'name_ar' => 'زيت موبيل 1 تخليقي بالكامل 5W-30 (كرتون 4 لتر)',
                'name_en' => 'Mobil 1 Advanced Full Synthetic Motor Oil 5W-30 (4L)',
                'part_number' => 'MOBIL-5W30-4L',
                'oem_number' => 'API-SP-ILSAC-GF6',
                'condition' => 'NEW',
                'price_visibility' => 'SHOW_PRICE',
                'purchase_method' => 'DIRECT',
                'price' => 42.00,
                'currency_code' => 'USD',
                'status' => 'ACTIVE',
                'rating' => 5.0,
                'rating_count' => 56,
                'view_count' => 420,
                'description_ar' => 'زيت المحرك التخليقي رقم 1 عالمياً بحماية فائقة حتى 15,000 كم في أصعب الظروف المناخية ودرجات الحرارة العالية.',
                'description_en' => 'The world leading synthetic motor oil providing ultimate thermal stability and wear protection.',
                'created_at' => now(),
                'updated_at' => now(),
                'compatibilities' => [
                    ['make' => 'Toyota', 'model' => null, 'year_start' => 2000, 'year_end' => 2026],
                    ['make' => 'Hyundai', 'model' => null, 'year_start' => 2000, 'year_end' => 2026],
                    ['make' => 'Nissan', 'model' => null, 'year_start' => 2000, 'year_end' => 2026],
                ],
                'qty' => 80,
            ],
            [
                'id' => 'prod_brembo_disc_06',
                'shop_id' => 'shop_albaraka_auto',
                'category_id' => 202, // Brake Rotors
                'manufacturer_id' => 4, // Brembo
                'name_ar' => 'دسكات فرامل بريمبو إيطالي مهواة أمامية (حبتين)',
                'name_en' => 'Brembo Front Vented Brake Rotors Pair',
                'part_number' => '09.A820.11',
                'oem_number' => '43512-60190',
                'condition' => 'OEM',
                'price_visibility' => 'SHOW_PRICE',
                'purchase_method' => 'DIRECT',
                'price' => 145.00,
                'currency_code' => 'USD',
                'status' => 'ACTIVE',
                'rating' => 5.0,
                'rating_count' => 9,
                'view_count' => 135,
                'description_ar' => 'هوبات بريمبو إيطالية أصلية ذات تبريد عالي ومعالجة كربونية تمنع الاهتزاز وتضمن فرملة قوية ومضمونة.',
                'description_en' => 'High carbon Italian vented brake discs engineered by Brembo for supreme thermal dispersion.',
                'created_at' => now(),
                'updated_at' => now(),
                'compatibilities' => [
                    ['make' => 'Toyota', 'model' => 'Land Cruiser', 'year_start' => 2008, 'year_end' => 2023],
                    ['make' => 'Toyota', 'model' => 'Hilux', 'year_start' => 2016, 'year_end' => 2024],
                ],
                'qty' => 15,
            ],
        ];

        foreach ($products as $p) {
            $compatibilities = $p['compatibilities'] ?? [];
            $qty = $p['qty'] ?? 10;
            unset($p['compatibilities'], $p['qty']);

            DB::table('products')->updateOrInsert(['id' => $p['id']], $p);

            // Add Inventories
            DB::table('inventories')->updateOrInsert(
                ['product_id' => $p['id'], 'shop_id' => $p['shop_id'], 'branch_id' => null],
                [
                    'quantity' => $qty,
                    'low_stock_threshold' => 5,
                    'track_quantity' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Add Compatibilities
            DB::table('product_vehicle_compatibilities')->where('product_id', $p['id'])->delete();
            foreach ($compatibilities as $comp) {
                $makeRow = DB::table('vehicle_makes')->where('name_en', 'ilike', $comp['make'])->first();
                if ($makeRow) {
                    $modelRow = null;
                    if (!empty($comp['model'])) {
                        $modelRow = DB::table('vehicle_models')
                            ->where('make_id', $makeRow->id)
                            ->where('name_en', 'ilike', $comp['model'])
                            ->first();
                    }

                    DB::table('product_vehicle_compatibilities')->insert([
                        'product_id' => $p['id'],
                        'make_id' => $makeRow->id,
                        'model_id' => $modelRow ? $modelRow->id : null,
                        'year_from' => $comp['year_start'] ?? 2000,
                        'year_to' => $comp['year_end'] ?? 2026,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 5. Banners
        $banners = [
            [
                'id' => 1,
                'title_ar' => 'أكبر سوق لقطع غيار السيارات الأصلية والمعتمدة في اليمن والخليج',
                'title_en' => 'The Largest Automotive Spare Parts Marketplace',
                'image_url' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80',
                'link_url' => '/catalog',
                'placement' => 'HOME',
                'target' => 'ALL',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'title_ar' => 'ابحث برقم الهيكل (VIN) أو موديل سيارتك بدقة وتوافق 100%',
                'title_en' => 'Search by VIN or Vehicle Model with 100% Fitment Guarantee',
                'image_url' => 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80',
                'link_url' => '/garage',
                'placement' => 'HOME',
                'target' => 'ALL',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($banners as $ban) {
            DB::table('banners')->updateOrInsert(['id' => $ban['id']], $ban);
        }
    }
}
