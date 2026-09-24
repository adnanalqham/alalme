<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GeographySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            ['id' => 'c_ye', 'name_ar' => 'اليمن', 'name_en' => 'Yemen', 'code' => 'YE', 'phone_code' => '+967', 'currency_code' => 'YER', 'is_active' => true],
            ['id' => 'c_sa', 'name_ar' => 'المملكة العربية السعودية', 'name_en' => 'Saudi Arabia', 'code' => 'SA', 'phone_code' => '+966', 'currency_code' => 'SAR', 'is_active' => true],
            ['id' => 'c_ae', 'name_ar' => 'الإمارات العربية المتحدة', 'name_en' => 'United Arab Emirates', 'code' => 'AE', 'phone_code' => '+971', 'currency_code' => 'AED', 'is_active' => true],
            ['id' => 'c_om', 'name_ar' => 'سلطنة عمان', 'name_en' => 'Oman', 'code' => 'OM', 'phone_code' => '+968', 'currency_code' => 'OMR', 'is_active' => true],
            ['id' => 'c_kw', 'name_ar' => 'الكويت', 'name_en' => 'Kuwait', 'code' => 'KW', 'phone_code' => '+965', 'currency_code' => 'KWD', 'is_active' => true],
            ['id' => 'c_qa', 'name_ar' => 'قطر', 'name_en' => 'Qatar', 'code' => 'QA', 'phone_code' => '+974', 'currency_code' => 'QAR', 'is_active' => true],
            ['id' => 'c_eg', 'name_ar' => 'مصر', 'name_en' => 'Egypt', 'code' => 'EG', 'phone_code' => '+20', 'currency_code' => 'EGP', 'is_active' => true],
            ['id' => 'c_jo', 'name_ar' => 'الأردن', 'name_en' => 'Jordan', 'code' => 'JO', 'phone_code' => '+962', 'currency_code' => 'JOD', 'is_active' => true],
        ];

        foreach ($countries as $c) {
            DB::table('countries')->updateOrInsert(['id' => $c['id']], $c);
        }

        $cities = [
            // Yemen
            ['id' => 'city_sanaa', 'country_id' => 'c_ye', 'name_ar' => 'صنعاء', 'name_en' => 'Sanaa', 'is_active' => true],
            ['id' => 'city_aden', 'country_id' => 'c_ye', 'name_ar' => 'عدن', 'name_en' => 'Aden', 'is_active' => true],
            ['id' => 'city_taiz', 'country_id' => 'c_ye', 'name_ar' => 'تعز', 'name_en' => 'Taiz', 'is_active' => true],
            ['id' => 'city_hodeidah', 'country_id' => 'c_ye', 'name_ar' => 'الحديدة', 'name_en' => 'Hodeidah', 'is_active' => true],
            ['id' => 'city_mukalla', 'country_id' => 'c_ye', 'name_ar' => 'المكلا', 'name_en' => 'Mukalla', 'is_active' => true],
            ['id' => 'city_ibb', 'country_id' => 'c_ye', 'name_ar' => 'إب', 'name_en' => 'Ibb', 'is_active' => true],
            ['id' => 'city_dhamar', 'country_id' => 'c_ye', 'name_ar' => 'ذمار', 'name_en' => 'Dhamar', 'is_active' => true],
            ['id' => 'city_marib', 'country_id' => 'c_ye', 'name_ar' => 'مأرب', 'name_en' => 'Marib', 'is_active' => true],

            // Saudi Arabia
            ['id' => 'city_riyadh', 'country_id' => 'c_sa', 'name_ar' => 'الرياض', 'name_en' => 'Riyadh', 'is_active' => true],
            ['id' => 'city_jeddah', 'country_id' => 'c_sa', 'name_ar' => 'جدة', 'name_en' => 'Jeddah', 'is_active' => true],
            ['id' => 'city_dammam', 'country_id' => 'c_sa', 'name_ar' => 'الدمام', 'name_en' => 'Dammam', 'is_active' => true],
            ['id' => 'city_makkah', 'country_id' => 'c_sa', 'name_ar' => 'مكة المكرمة', 'name_en' => 'Makkah', 'is_active' => true],
            ['id' => 'city_madinah', 'country_id' => 'c_sa', 'name_ar' => 'المدينة المنورة', 'name_en' => 'Madinah', 'is_active' => true],

            // UAE
            ['id' => 'city_dubai', 'country_id' => 'c_ae', 'name_ar' => 'دبي', 'name_en' => 'Dubai', 'is_active' => true],
            ['id' => 'city_abudhabi', 'country_id' => 'c_ae', 'name_ar' => 'أبوظبي', 'name_en' => 'Abu Dhabi', 'is_active' => true],
            ['id' => 'city_sharjah', 'country_id' => 'c_ae', 'name_ar' => 'الشارقة', 'name_en' => 'Sharjah', 'is_active' => true],
        ];

        foreach ($cities as $ct) {
            DB::table('cities')->updateOrInsert(['id' => $ct['id']], $ct);
        }
    }
}
