<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ManufacturerSeeder extends Seeder
{
    public function run(): void
    {
        $manufacturers = [
            ['id' => 1, 'name_ar' => 'قطع غيار تويوتا الأصلية', 'name_en' => 'Toyota Genuine Parts', 'slug' => 'toyota-genuine', 'country_of_origin' => 'Japan', 'is_active' => true],
            ['id' => 2, 'name_ar' => 'دينسو', 'name_en' => 'Denso', 'slug' => 'denso', 'country_of_origin' => 'Japan', 'is_active' => true],
            ['id' => 3, 'name_ar' => 'بوش', 'name_en' => 'Bosch', 'slug' => 'bosch', 'country_of_origin' => 'Germany', 'is_active' => true],
            ['id' => 4, 'name_ar' => 'بريمبو', 'name_en' => 'Brembo', 'slug' => 'brembo', 'country_of_origin' => 'Italy', 'is_active' => true],
            ['id' => 5, 'name_ar' => 'ان جي كيه', 'name_en' => 'NGK', 'slug' => 'ngk', 'country_of_origin' => 'Japan', 'is_active' => true],
            ['id' => 6, 'name_ar' => 'مان فلتر', 'name_en' => 'Mann-Filter', 'slug' => 'mann-filter', 'country_of_origin' => 'Germany', 'is_active' => true],
            ['id' => 7, 'name_ar' => 'كيه واي بي', 'name_en' => 'KYB', 'slug' => 'kyb', 'country_of_origin' => 'Japan', 'is_active' => true],
            ['id' => 8, 'name_ar' => 'موبيل 1', 'name_en' => 'Mobil 1', 'slug' => 'mobil-1', 'country_of_origin' => 'USA', 'is_active' => true],
            ['id' => 9, 'name_ar' => 'كاسترول', 'name_en' => 'Castrol', 'slug' => 'castrol', 'country_of_origin' => 'UK', 'is_active' => true],
            ['id' => 10, 'name_ar' => 'فاليو', 'name_en' => 'Valeo', 'slug' => 'valeo', 'country_of_origin' => 'France', 'is_active' => true],
            ['id' => 11, 'name_ar' => 'اي سي ديلكو', 'name_en' => 'ACDelco', 'slug' => 'acdelco', 'country_of_origin' => 'USA', 'is_active' => true],
            ['id' => 12, 'name_ar' => 'آيسين', 'name_en' => 'AISIN', 'slug' => 'aisin', 'country_of_origin' => 'Japan', 'is_active' => true],
            ['id' => 13, 'name_ar' => 'موتول', 'name_en' => 'Motul', 'slug' => 'motul', 'country_of_origin' => 'France', 'is_active' => true],
            ['id' => 14, 'name_ar' => 'تي ار دبليو', 'name_en' => 'TRW', 'slug' => 'trw', 'country_of_origin' => 'Germany', 'is_active' => true],
            ['id' => 15, 'name_ar' => 'كونتيننتال', 'name_en' => 'Continental', 'slug' => 'continental', 'country_of_origin' => 'Germany', 'is_active' => true],
            ['id' => 16, 'name_ar' => 'قطع هيونداي الأصلية (موبيس)', 'name_en' => 'Hyundai Mobis', 'slug' => 'hyundai-mobis', 'country_of_origin' => 'South Korea', 'is_active' => true],
            ['id' => 17, 'name_ar' => 'قطع نيسان الأصلية', 'name_en' => 'Nissan Genuine', 'slug' => 'nissan-genuine', 'country_of_origin' => 'Japan', 'is_active' => true],
        ];

        foreach ($manufacturers as $m) {
            DB::table('manufacturers')->updateOrInsert(['id' => $m['id']], $m);
        }
    }
}
