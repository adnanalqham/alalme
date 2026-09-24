<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VehicleDatabaseSeeder extends Seeder
{
    /**
     * Seed regional reference vehicles with Arabic and English terminology.
     */
    public function run(): void
    {
        $makes = [
            [
                'name_en' => 'Toyota',
                'name_ar' => 'تويوتا',
                'nhtsa_make_id' => 448,
                'slug' => 'toyota',
                'models' => [
                    ['name_en' => 'Land Cruiser', 'name_ar' => 'لاند كروزر', 'nhtsa_model_id' => 2211],
                    ['name_en' => 'Camry', 'name_ar' => 'كامري', 'nhtsa_model_id' => 2207],
                    ['name_en' => 'Corolla', 'name_ar' => 'كورولا', 'nhtsa_model_id' => 2208],
                    ['name_en' => 'Hilux', 'name_ar' => 'هايلوكس', 'nhtsa_model_id' => 2235],
                    ['name_en' => 'Prado', 'name_ar' => 'برادو', 'nhtsa_model_id' => 2240],
                    ['name_en' => 'RAV4', 'name_ar' => 'راف فور', 'nhtsa_model_id' => 2210],
                    ['name_en' => 'Yaris', 'name_ar' => 'يارس', 'nhtsa_model_id' => 2212],
                    ['name_en' => 'Fortuner', 'name_ar' => 'فورتشنر', 'nhtsa_model_id' => 2245],
                ],
                'aliases' => ['تويوتا', 'Toyota', 'تايوتا'],
            ],
            [
                'name_en' => 'Hyundai',
                'name_ar' => 'هيونداي',
                'nhtsa_make_id' => 498,
                'slug' => 'hyundai',
                'models' => [
                    ['name_en' => 'Sonata', 'name_ar' => 'سوناتا', 'nhtsa_model_id' => 2380],
                    ['name_en' => 'Elantra', 'name_ar' => 'إلنترا', 'nhtsa_model_id' => 2378],
                    ['name_en' => 'Tucson', 'name_ar' => 'توسان', 'nhtsa_model_id' => 2377],
                    ['name_en' => 'Santa Fe', 'name_ar' => 'سانتافي', 'nhtsa_model_id' => 2376],
                    ['name_en' => 'Accent', 'name_ar' => 'أكسنت', 'nhtsa_model_id' => 2379],
                    ['name_en' => 'Azera', 'name_ar' => 'أزيرا', 'nhtsa_model_id' => 2382],
                ],
                'aliases' => ['هيونداي', 'هونداي', 'Hyundai'],
            ],
            [
                'name_en' => 'Nissan',
                'name_ar' => 'نيسان',
                'nhtsa_make_id' => 478,
                'slug' => 'nissan',
                'models' => [
                    ['name_en' => 'Patrol', 'name_ar' => 'باترول', 'nhtsa_model_id' => 2450],
                    ['name_en' => 'Sunny', 'name_ar' => 'صني', 'nhtsa_model_id' => 2455],
                    ['name_en' => 'Altima', 'name_ar' => 'ألتيما', 'nhtsa_model_id' => 2460],
                    ['name_en' => 'X-Trail', 'name_ar' => 'إكس تريل', 'nhtsa_model_id' => 2465],
                    ['name_en' => 'Navara', 'name_ar' => 'نافارا', 'nhtsa_model_id' => 2470],
                    ['name_en' => 'Maxima', 'name_ar' => 'مكسيما', 'nhtsa_model_id' => 2475],
                ],
                'aliases' => ['نيسان', 'Nissan'],
            ],
            [
                'name_en' => 'Lexus',
                'name_ar' => 'لكزس',
                'nhtsa_make_id' => 515,
                'slug' => 'lexus',
                'models' => [
                    ['name_en' => 'LX570', 'name_ar' => 'LX570', 'nhtsa_model_id' => 2580],
                    ['name_en' => 'LX600', 'name_ar' => 'LX600', 'nhtsa_model_id' => 2585],
                    ['name_en' => 'ES350', 'name_ar' => 'ES350', 'nhtsa_model_id' => 2590],
                    ['name_en' => 'RX350', 'name_ar' => 'RX350', 'nhtsa_model_id' => 2595],
                    ['name_en' => 'GX460', 'name_ar' => 'GX460', 'nhtsa_model_id' => 2600],
                ],
                'aliases' => ['لكزس', 'لگزس', 'Lexus'],
            ],
            [
                'name_en' => 'Honda',
                'name_ar' => 'هوندا',
                'nhtsa_make_id' => 474,
                'slug' => 'honda',
                'models' => [
                    ['name_en' => 'Accord', 'name_ar' => 'أكورد', 'nhtsa_model_id' => 1861],
                    ['name_en' => 'Civic', 'name_ar' => 'سيفيك', 'nhtsa_model_id' => 1863],
                    ['name_en' => 'CR-V', 'name_ar' => 'CR-V', 'nhtsa_model_id' => 1865],
                    ['name_en' => 'Pilot', 'name_ar' => 'بايلوت', 'nhtsa_model_id' => 1867],
                ],
                'aliases' => ['هوندا', 'Honda'],
            ],
            [
                'name_en' => 'Kia',
                'name_ar' => 'كيا',
                'nhtsa_make_id' => 499,
                'slug' => 'kia',
                'models' => [
                    ['name_en' => 'Optima', 'name_ar' => 'أوبتيما', 'nhtsa_model_id' => 2710],
                    ['name_en' => 'K5', 'name_ar' => 'K5', 'nhtsa_model_id' => 2715],
                    ['name_en' => 'Sportage', 'name_ar' => 'سبورتاج', 'nhtsa_model_id' => 2720],
                    ['name_en' => 'Sorento', 'name_ar' => 'سورينتو', 'nhtsa_model_id' => 2725],
                    ['name_en' => 'Cerato', 'name_ar' => 'سيراتو', 'nhtsa_model_id' => 2730],
                ],
                'aliases' => ['كيا', 'Kia'],
            ],
            [
                'name_en' => 'Ford',
                'name_ar' => 'فورد',
                'nhtsa_make_id' => 460,
                'slug' => 'ford',
                'models' => [
                    ['name_en' => 'F-150', 'name_ar' => 'F-150', 'nhtsa_model_id' => 1801],
                    ['name_en' => 'Explorer', 'name_ar' => 'إكسبلورر', 'nhtsa_model_id' => 1805],
                    ['name_en' => 'Expedition', 'name_ar' => 'إكسبيديشن', 'nhtsa_model_id' => 1808],
                    ['name_en' => 'Taurus', 'name_ar' => 'تورس', 'nhtsa_model_id' => 1812],
                ],
                'aliases' => ['فورد', 'Ford'],
            ],
            [
                'name_en' => 'Mercedes-Benz',
                'name_ar' => 'مرسيدس بنز',
                'nhtsa_make_id' => 449,
                'slug' => 'mercedes-benz',
                'models' => [
                    ['name_en' => 'S-Class', 'name_ar' => 'الفئة S', 'nhtsa_model_id' => 3101],
                    ['name_en' => 'E-Class', 'name_ar' => 'الفئة E', 'nhtsa_model_id' => 3105],
                    ['name_en' => 'C-Class', 'name_ar' => 'الفئة C', 'nhtsa_model_id' => 3110],
                    ['name_en' => 'G-Class', 'name_ar' => 'الفئة G', 'nhtsa_model_id' => 3115],
                ],
                'aliases' => ['مرسيدس', 'مرسيدس بنز', 'Mercedes', 'Benz'],
            ],
        ];

        $years = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2012, 2010];

        foreach ($makes as $m) {
            $makeId = DB::table('vehicle_makes')->insertGetId([
                'nhtsa_make_id' => $m['nhtsa_make_id'],
                'name_en' => $m['name_en'],
                'name_ar' => $m['name_ar'],
                'slug' => $m['slug'],
                'vehicle_type' => 'Passenger Car',
                'is_active' => true,
                'source' => 'nhtsa',
                'source_updated_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insert aliases
            foreach ($m['aliases'] as $alias) {
                DB::table('vehicle_aliases')->insert([
                    'entity_type' => 'make',
                    'entity_id' => $makeId,
                    'language' => preg_match('/[\p{Arabic}]/u', $alias) ? 'ar' : 'en',
                    'alias' => $alias,
                    'normalized_alias' => mb_strtolower(trim(preg_replace('/[^\p{L}\p{N}\s]/u', '', $alias))),
                    'created_at' => now(),
                ]);
            }

            foreach ($m['models'] as $mod) {
                $modelSlug = Str::slug($mod['name_en']);
                $modelId = DB::table('vehicle_models')->insertGetId([
                    'make_id' => $makeId,
                    'nhtsa_model_id' => $mod['nhtsa_model_id'],
                    'name_en' => $mod['name_en'],
                    'name_ar' => $mod['name_ar'],
                    'slug' => $modelSlug,
                    'vehicle_type' => 'Passenger Car',
                    'is_active' => true,
                    'source' => 'nhtsa',
                    'source_updated_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Insert Model aliases
                DB::table('vehicle_aliases')->insert([
                    [
                        'entity_type' => 'model',
                        'entity_id' => $modelId,
                        'language' => 'en',
                        'alias' => $mod['name_en'],
                        'normalized_alias' => mb_strtolower(trim($mod['name_en'])),
                        'created_at' => now(),
                    ],
                    [
                        'entity_type' => 'model',
                        'entity_id' => $modelId,
                        'language' => 'ar',
                        'alias' => $mod['name_ar'],
                        'normalized_alias' => mb_strtolower(trim($mod['name_ar'])),
                        'created_at' => now(),
                    ],
                ]);

                // Insert Model Years (2015–2026)
                foreach ($years as $yr) {
                    $yearId = DB::table('vehicle_model_years')->insertGetId([
                        'model_id' => $modelId,
                        'year' => $yr,
                        'source' => 'nhtsa',
                        'source_updated_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Add a default specification for key models (e.g. Camry 2.5L I4)
                    if ($mod['name_en'] === 'Camry') {
                        DB::table('vehicle_specs')->insert([
                            'model_id' => $modelId,
                            'year_id' => $yearId,
                            'make_id' => $makeId,
                            'model_name' => 'Camry',
                            'model_year' => $yr,
                            'trim' => 'LE / SE',
                            'body_class' => 'Sedan',
                            'engine_cylinders' => 4,
                            'engine_displacement_cc' => 2500,
                            'fuel_type' => 'Gasoline',
                            'drive_type' => 'FWD',
                            'transmission_style' => 'Automatic',
                            'transmission_speeds' => '8-Speed',
                            'source' => 'nhtsa',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }
}
