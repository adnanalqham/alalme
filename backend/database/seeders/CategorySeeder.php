<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'id' => 1,
                'name_ar' => 'قطع المحرك وملحقاته',
                'name_en' => 'Engine & Drivetrain',
                'slug' => 'engine-and-drivetrain',
                'icon_url' => 'engine',
                'sort_order' => 1,
                'children' => [
                    ['id' => 101, 'name_ar' => 'بواجي وكويلات الإشعال', 'name_en' => 'Spark Plugs & Ignition Coils', 'slug' => 'spark-plugs-ignition'],
                    ['id' => 102, 'name_ar' => 'سيور وبكرات المحرك', 'name_en' => 'Belts & Pulleys', 'slug' => 'belts-pulleys'],
                    ['id' => 103, 'name_ar' => 'مضخات الوقود وبخاخات', 'name_en' => 'Fuel Pumps & Injectors', 'slug' => 'fuel-pumps-injectors'],
                    ['id' => 104, 'name_ar' => 'جوانات وصوف المحرك', 'name_en' => 'Gaskets & Seals', 'slug' => 'engine-gaskets-seals'],
                    ['id' => 105, 'name_ar' => 'طرمبة الزيت والماء', 'name_en' => 'Oil & Water Pumps', 'slug' => 'pumps'],
                ],
            ],
            [
                'id' => 2,
                'name_ar' => 'نظام الفرامل والمكابح',
                'name_en' => 'Brake System',
                'slug' => 'brake-system',
                'icon_url' => 'disc',
                'sort_order' => 2,
                'children' => [
                    ['id' => 201, 'name_ar' => 'أقمشة وفحمات فرامل', 'name_en' => 'Brake Pads', 'slug' => 'brake-pads'],
                    ['id' => 202, 'name_ar' => 'هوبات ودسكات فرامل', 'name_en' => 'Brake Rotors & Discs', 'slug' => 'brake-rotors'],
                    ['id' => 203, 'name_ar' => 'كليبرات ومضخات فرامل', 'name_en' => 'Calipers & Master Cylinders', 'slug' => 'calipers-cylinders'],
                    ['id' => 204, 'name_ar' => 'حساسات ABS والفرامل', 'name_en' => 'ABS Sensors', 'slug' => 'abs-sensors'],
                ],
            ],
            [
                'id' => 3,
                'name_ar' => 'نظام التعليق والمساعدات',
                'name_en' => 'Suspension & Steering',
                'slug' => 'suspension-steering',
                'icon_url' => 'activity',
                'sort_order' => 3,
                'children' => [
                    ['id' => 301, 'name_ar' => 'مساعدات ويايات', 'name_en' => 'Shock Absorbers & Struts', 'slug' => 'shock-absorbers'],
                    ['id' => 302, 'name_ar' => 'أذرعة ومقصات وجوزات', 'name_en' => 'Control Arms & Ball Joints', 'slug' => 'control-arms-ball-joints'],
                    ['id' => 303, 'name_ar' => 'دودة ومضخة دركسون', 'name_en' => 'Steering Rack & Pump', 'slug' => 'steering-rack-pump'],
                    ['id' => 304, 'name_ar' => 'عكوس ومساعدات توازن', 'name_en' => 'CV Axles & Sway Bars', 'slug' => 'cv-axles-sway-bars'],
                ],
            ],
            [
                'id' => 4,
                'name_ar' => 'الفلاتر والزيوت',
                'name_en' => 'Filters & Fluids',
                'slug' => 'filters-and-fluids',
                'icon_url' => 'droplet',
                'sort_order' => 4,
                'children' => [
                    ['id' => 401, 'name_ar' => 'فلتر زيت المحرك', 'name_en' => 'Oil Filters', 'slug' => 'oil-filters'],
                    ['id' => 402, 'name_ar' => 'فلتر هواء المحرك', 'name_en' => 'Engine Air Filters', 'slug' => 'air-filters'],
                    ['id' => 403, 'name_ar' => 'فلتر مكيف المقصورة', 'name_en' => 'Cabin Air Filters', 'slug' => 'cabin-filters'],
                    ['id' => 404, 'name_ar' => 'فلتر بنزين ووقود', 'name_en' => 'Fuel Filters', 'slug' => 'fuel-filters'],
                    ['id' => 405, 'name_ar' => 'زيوت وسوائل تبريد', 'name_en' => 'Oils & Coolants', 'slug' => 'oils-coolants'],
                ],
            ],
            [
                'id' => 5,
                'name_ar' => 'الكهرباء والحساسات',
                'name_en' => 'Electrical & Sensors',
                'slug' => 'electrical-sensors',
                'icon_url' => 'zap',
                'sort_order' => 5,
                'children' => [
                    ['id' => 501, 'name_ar' => 'بطاريات ودينامو', 'name_en' => 'Batteries & Alternators', 'slug' => 'batteries-alternators'],
                    ['id' => 502, 'name_ar' => 'سلف وبادئ تشغيل', 'name_en' => 'Starter Motors', 'slug' => 'starter-motors'],
                    ['id' => 503, 'name_ar' => 'حساسات شكمان وأكسجين', 'name_en' => 'Oxygen & O2 Sensors', 'slug' => 'oxygen-sensors'],
                    ['id' => 504, 'name_ar' => 'حساس كامات وكرنك', 'name_en' => 'Crankshaft & Camshaft Sensors', 'slug' => 'cam-crank-sensors'],
                ],
            ],
            [
                'id' => 6,
                'name_ar' => 'التبريد والتكييف',
                'name_en' => 'Cooling & AC System',
                'slug' => 'cooling-ac',
                'icon_url' => 'wind',
                'sort_order' => 6,
                'children' => [
                    ['id' => 601, 'name_ar' => 'رديتر ومراوح تبريد', 'name_en' => 'Radiators & Cooling Fans', 'slug' => 'radiators-fans'],
                    ['id' => 602, 'name_ar' => 'كمبروسر ومكيف', 'name_en' => 'AC Compressors', 'slug' => 'ac-compressors'],
                    ['id' => 603, 'name_ar' => 'ثرموستات وكيعان', 'name_en' => 'Thermostats & Housings', 'slug' => 'thermostats'],
                ],
            ],
            [
                'id' => 7,
                'name_ar' => 'الإنارة والإضاءة',
                'name_en' => 'Lighting & Lamps',
                'slug' => 'lighting-lamps',
                'icon_url' => 'sun',
                'sort_order' => 7,
                'children' => [
                    ['id' => 701, 'name_ar' => 'شمعات أمامية', 'name_en' => 'Headlights', 'slug' => 'headlights'],
                    ['id' => 702, 'name_ar' => 'إسطبات وخلفية', 'name_en' => 'Tail Lights', 'slug' => 'tail-lights'],
                    ['id' => 703, 'name_ar' => 'كشافات ضباب ولمبات LED', 'name_en' => 'Fog Lights & LEDs', 'slug' => 'fog-lights-leds'],
                ],
            ],
            [
                'id' => 8,
                'name_ar' => 'الهيكل والبودي الخارجي',
                'name_en' => 'Body & Exterior',
                'slug' => 'body-exterior',
                'icon_url' => 'shield',
                'sort_order' => 8,
                'children' => [
                    ['id' => 801, 'name_ar' => 'صدامات وشبوك', 'name_en' => 'Bumpers & Grilles', 'slug' => 'bumpers-grilles'],
                    ['id' => 802, 'name_ar' => 'مرايا جانبية وزجاج', 'name_en' => 'Side Mirrors & Glass', 'slug' => 'mirrors-glass'],
                    ['id' => 803, 'name_ar' => 'كبوت ورفارف وأبواب', 'name_en' => 'Hoods, Fenders & Doors', 'slug' => 'hoods-fenders'],
                ],
            ],
        ];

        foreach ($categories as $cat) {
            $children = $cat['children'] ?? [];
            unset($cat['children']);

            DB::table('categories')->updateOrInsert(['id' => $cat['id']], $cat);

            foreach ($children as $child) {
                $child['parent_id'] = $cat['id'];
                $child['sort_order'] = $child['id'] % 100;
                $child['is_active'] = true;
                DB::table('categories')->updateOrInsert(['id' => $child['id']], $child);
            }
        }
    }
}
