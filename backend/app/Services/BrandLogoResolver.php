<?php

namespace App\Services;

class BrandLogoResolver
{
    /**
     * Default license identifier for brand trademark vectors
     */
    public const DEFAULT_LICENSE = 'Public Brand Trademark / Cardog / Wikimedia Commons';

    /**
     * Base public path for SVG brand logos
     */
    public const LOGO_BASE_PATH = '/assets/brands/';

    /**
     * Curated Master Brand Registry (Normalized Slug => Metadata)
     */
    protected static array $brandsRegistry = [
        'toyota' => [
            'name_en' => 'Toyota',
            'name_ar' => 'تويوتا',
            'filename' => 'toyota.svg',
            'country' => 'Japan',
        ],
        'nissan' => [
            'name_en' => 'Nissan',
            'name_ar' => 'نيسان',
            'filename' => 'nissan.svg',
            'country' => 'Japan',
        ],
        'hyundai' => [
            'name_en' => 'Hyundai',
            'name_ar' => 'هيونداي',
            'filename' => 'hyundai.svg',
            'country' => 'South Korea',
        ],
        'kia' => [
            'name_en' => 'Kia',
            'name_ar' => 'كيا',
            'filename' => 'kia.svg',
            'country' => 'South Korea',
        ],
        'honda' => [
            'name_en' => 'Honda',
            'name_ar' => 'هوندا',
            'filename' => 'honda.svg',
            'country' => 'Japan',
        ],
        'mitsubishi' => [
            'name_en' => 'Mitsubishi',
            'name_ar' => 'ميتسوبيشي',
            'filename' => 'mitsubishi.svg',
            'country' => 'Japan',
        ],
        'mazda' => [
            'name_en' => 'Mazda',
            'name_ar' => 'مازدا',
            'filename' => 'mazda.svg',
            'country' => 'Japan',
        ],
        'suzuki' => [
            'name_en' => 'Suzuki',
            'name_ar' => 'سوزوكي',
            'filename' => 'suzuki.svg',
            'country' => 'Japan',
        ],
        'isuzu' => [
            'name_en' => 'Isuzu',
            'name_ar' => 'إيسوزو',
            'filename' => 'isuzu.svg',
            'country' => 'Japan',
        ],
        'lexus' => [
            'name_en' => 'Lexus',
            'name_ar' => 'لكزس',
            'filename' => 'lexus.svg',
            'country' => 'Japan',
        ],
        'bmw' => [
            'name_en' => 'BMW',
            'name_ar' => 'بي إم دبليو',
            'filename' => 'bmw.svg',
            'country' => 'Germany',
        ],
        'mercedes-benz' => [
            'name_en' => 'Mercedes-Benz',
            'name_ar' => 'مرسيدس بنز',
            'filename' => 'mercedes-benz.svg',
            'country' => 'Germany',
        ],
        'audi' => [
            'name_en' => 'Audi',
            'name_ar' => 'أودي',
            'filename' => 'audi.svg',
            'country' => 'Germany',
        ],
        'volkswagen' => [
            'name_en' => 'Volkswagen',
            'name_ar' => 'فولكس فاجن',
            'filename' => 'volkswagen.svg',
            'country' => 'Germany',
        ],
        'ford' => [
            'name_en' => 'Ford',
            'name_ar' => 'فورد',
            'filename' => 'ford.svg',
            'country' => 'USA',
        ],
        'chevrolet' => [
            'name_en' => 'Chevrolet',
            'name_ar' => 'شفروليه',
            'filename' => 'chevrolet.svg',
            'country' => 'USA',
        ],
        'jeep' => [
            'name_en' => 'Jeep',
            'name_ar' => 'جيب',
            'filename' => 'jeep.svg',
            'country' => 'USA',
        ],
        'land-rover' => [
            'name_en' => 'Land Rover',
            'name_ar' => 'لاند روفر',
            'filename' => 'land-rover.svg',
            'country' => 'UK',
        ],
        'porsche' => [
            'name_en' => 'Porsche',
            'name_ar' => 'بورشه',
            'filename' => 'porsche.svg',
            'country' => 'Germany',
        ],
        'volvo' => [
            'name_en' => 'Volvo',
            'name_ar' => 'فولفو',
            'filename' => 'volvo.svg',
            'country' => 'Sweden',
        ],
        'changan' => [
            'name_en' => 'Changan',
            'name_ar' => 'شانجان',
            'filename' => 'changan.svg',
            'country' => 'China',
        ],
        'geely' => [
            'name_en' => 'Geely',
            'name_ar' => 'جيلي',
            'filename' => 'geely.svg',
            'country' => 'China',
        ],
        'gac' => [
            'name_en' => 'GAC',
            'name_ar' => 'جي أيه سي',
            'filename' => 'gac.svg',
            'country' => 'China',
        ],
        'chery' => [
            'name_en' => 'Chery',
            'name_ar' => 'شيري',
            'filename' => 'chery.svg',
            'country' => 'China',
        ],
        'haval' => [
            'name_en' => 'Haval',
            'name_ar' => 'هافال',
            'filename' => 'haval.svg',
            'country' => 'China',
        ],
        'jetour' => [
            'name_en' => 'Jetour',
            'name_ar' => 'جيتور',
            'filename' => 'jetour.svg',
            'country' => 'China',
        ],
        'mg' => [
            'name_en' => 'MG',
            'name_ar' => 'إم جي',
            'filename' => 'mg.svg',
            'country' => 'UK / China',
        ],
        'byd' => [
            'name_en' => 'BYD',
            'name_ar' => 'بي واي دي',
            'filename' => 'byd.svg',
            'country' => 'China',
        ],
        'dongfeng' => [
            'name_en' => 'Dongfeng',
            'name_ar' => 'دونغ فنغ',
            'filename' => 'dongfeng.svg',
            'country' => 'China',
        ],
        'dfsk' => [
            'name_en' => 'DFSK',
            'name_ar' => 'دي إف إس كيه',
            'filename' => 'dfsk.svg',
            'country' => 'China',
        ],
        'faw' => [
            'name_en' => 'FAW',
            'name_ar' => 'فاو',
            'filename' => 'faw.svg',
            'country' => 'China',
        ],
        'jac' => [
            'name_en' => 'JAC',
            'name_ar' => 'جاك',
            'filename' => 'jac.svg',
            'country' => 'China',
        ],
    ];

    /**
     * Aliases mapping variant strings (English corporate names, NHTSA variations, and Arabic) to canonical slug.
     */
    protected static array $aliases = [
        // Toyota
        'toyota motor corporation' => 'toyota',
        'toyota motor' => 'toyota',
        'toyota' => 'toyota',
        'تويوتا' => 'toyota',

        // Nissan
        'nissan motor co ltd' => 'nissan',
        'nissan motor' => 'nissan',
        'nissan' => 'nissan',
        'نيسان' => 'nissan',

        // Hyundai
        'hyundai motor company' => 'hyundai',
        'hyundai motor' => 'hyundai',
        'hyundai' => 'hyundai',
        'هيونداي' => 'hyundai',
        'هونداي' => 'hyundai',

        // Kia
        'kia motors corporation' => 'kia',
        'kia motor' => 'kia',
        'kia motors' => 'kia',
        'kia' => 'kia',
        'كيا' => 'kia',

        // Honda
        'honda motor co ltd' => 'honda',
        'honda motor' => 'honda',
        'honda' => 'honda',
        'هوندا' => 'honda',

        // Mitsubishi
        'mitsubishi motors' => 'mitsubishi',
        'mitsubishi' => 'mitsubishi',
        'ميتسوبيشي' => 'mitsubishi',

        // Mazda
        'mazda motor corporation' => 'mazda',
        'mazda' => 'mazda',
        'مازدا' => 'mazda',

        // Suzuki
        'suzuki motor' => 'suzuki',
        'suzuki' => 'suzuki',
        'سوزوكي' => 'suzuki',

        // Isuzu
        'isuzu motors' => 'isuzu',
        'isuzu' => 'isuzu',
        'إيسوزو' => 'isuzu',
        'ايسوزو' => 'isuzu',

        // Lexus
        'lexus' => 'lexus',
        'لكزس' => 'lexus',

        // BMW
        'bmw ag' => 'bmw',
        'bayerische motoren werke' => 'bmw',
        'bmw' => 'bmw',
        'بي إم دبليو' => 'bmw',
        'بي ام دبليو' => 'bmw',

        // Mercedes-Benz
        'mercedes benz ag' => 'mercedes-benz',
        'mercedes benz' => 'mercedes-benz',
        'mercedes-benz' => 'mercedes-benz',
        'daimler ag' => 'mercedes-benz',
        'مرسيدس' => 'mercedes-benz',
        'مرسيدس بنز' => 'mercedes-benz',

        // Audi
        'audi ag' => 'audi',
        'audi' => 'audi',
        'أودي' => 'audi',
        'اوزي' => 'audi',

        // Volkswagen
        'volkswagen ag' => 'volkswagen',
        'volkswagen' => 'volkswagen',
        'vw' => 'volkswagen',
        'فولكس فاجن' => 'volkswagen',
        'فولكسواجن' => 'volkswagen',

        // Ford
        'ford motor company' => 'ford',
        'ford' => 'ford',
        'فورد' => 'ford',

        // Chevrolet
        'general motors' => 'chevrolet',
        'chevrolet' => 'chevrolet',
        'chevy' => 'chevrolet',
        'شفروليه' => 'chevrolet',
        'شيفروليه' => 'chevrolet',

        // Jeep
        'fca us llc' => 'jeep',
        'jeep' => 'jeep',
        'جيب' => 'jeep',

        // Land Rover
        'jaguar land rover' => 'land-rover',
        'land rover' => 'land-rover',
        'لاند روفر' => 'land-rover',
        'رنج روفر' => 'land-rover',

        // Porsche
        'dr ing hc f porsche ag' => 'porsche',
        'porsche' => 'porsche',
        'بورشه' => 'porsche',
        'بورش' => 'porsche',

        // Volvo
        'volvo car corporation' => 'volvo',
        'volvo' => 'volvo',
        'فولفو' => 'volvo',

        // Changan
        'chongqing changan' => 'changan',
        'changan' => 'changan',
        'شانجان' => 'changan',

        // Geely
        'zhejiang geely' => 'geely',
        'geely' => 'geely',
        'جيلي' => 'geely',

        // GAC
        'guangzhou automobile' => 'gac',
        'gac motor' => 'gac',
        'gac' => 'gac',
        'جي أيه سي' => 'gac',

        // Chery
        'chery automobile' => 'chery',
        'chery' => 'chery',
        'شيري' => 'chery',

        // Haval
        'great wall motor' => 'haval',
        'haval' => 'haval',
        'هافال' => 'haval',

        // Jetour
        'jetour auto' => 'jetour',
        'jetour' => 'jetour',
        'جيتور' => 'jetour',

        // MG
        'saic motor' => 'mg',
        'mg motor' => 'mg',
        'mg' => 'mg',
        'إم جي' => 'mg',
        'ام جي' => 'mg',

        // BYD
        'byd company' => 'byd',
        'byd auto' => 'byd',
        'byd' => 'byd',
        'بي واي دي' => 'byd',

        // Dongfeng
        'dongfeng motor' => 'dongfeng',
        'dongfeng' => 'dongfeng',
        'دونغ فنغ' => 'dongfeng',

        // DFSK
        'dfsk' => 'dfsk',
        'sokon' => 'dfsk',
        'دي إف إس كيه' => 'dfsk',

        // FAW
        'faw group' => 'faw',
        'faw' => 'faw',
        'فاو' => 'faw',

        // JAC
        'anhui jianghuai' => 'jac',
        'jac motors' => 'jac',
        'jac' => 'jac',
        'جاك' => 'jac',
    ];

    /**
     * Normalize an input make name to a standardized slug for logo resolution
     */
    public static function normalize(string $name): string
    {
        // 1. Lowercase and trim
        $str = mb_strtolower(trim($name), 'UTF-8');

        // 2. Remove standard corporate suffixes
        $patterns = [
            '/\b(motor corporation|motors corporation|automobile co|motor co|holding group|holdings|company|corp|ltd|inc|llc|ag|gmbh|sa)\b/u',
            '/[.,\-_()&]/u',
        ];
        $cleaned = preg_replace($patterns, ' ', $str);
        $cleaned = trim(preg_replace('/\s+/', ' ', $cleaned));

        // 3. Direct alias check
        if (isset(self::$aliases[$cleaned])) {
            return self::$aliases[$cleaned];
        }

        if (isset(self::$aliases[$str])) {
            return self::$aliases[$str];
        }

        // 4. Exact slug match
        $slug = preg_replace('/[^a-z0-9]+/u', '-', $str);
        $slug = trim($slug, '-');

        if (isset(self::$brandsRegistry[$slug])) {
            return $slug;
        }

        // Check if any registry key is inside the cleaned string
        foreach (array_keys(self::$brandsRegistry) as $knownKey) {
            if (str_contains($cleaned, str_replace('-', ' ', $knownKey)) || str_contains($slug, $knownKey)) {
                return $knownKey;
            }
        }

        return $slug;
    }

    /**
     * Resolve brand logo details for a make
     * Returns: [slug, logo_url, logo_status, logo_license, logo_source]
     */
    public static function resolve(string $nameEn, ?string $nameAr = null, ?string $existingSource = null): array
    {
        // Check English normalization first
        $slug = self::normalize($nameEn);

        // If not found in registry and Arabic is provided, check Arabic alias
        if (!isset(self::$brandsRegistry[$slug]) && !empty($nameAr)) {
            $arNormalized = mb_strtolower(trim($nameAr), 'UTF-8');
            if (isset(self::$aliases[$arNormalized])) {
                $slug = self::$aliases[$arNormalized];
            }
        }

        if (isset(self::$brandsRegistry[$slug])) {
            $brand = self::$brandsRegistry[$slug];
            return [
                'slug' => $slug,
                'logo_url' => self::LOGO_BASE_PATH . $brand['filename'],
                'logo_status' => 'available',
                'logo_license' => self::DEFAULT_LICENSE,
                'logo_source' => $existingSource === 'manual' ? 'manual' : 'auto',
                'name_ar' => $brand['name_ar'],
                'country' => $brand['country'],
            ];
        }

        // Missing Logo Fallback representation
        return [
            'slug' => $slug,
            'logo_url' => null,
            'logo_status' => 'missing',
            'logo_license' => null,
            'logo_source' => $existingSource === 'manual' ? 'manual' : 'auto',
            'name_ar' => $nameAr,
            'country' => null,
        ];
    }

    /**
     * Get all supported brands in the registry
     */
    public static function getAllRegistry(): array
    {
        return self::$brandsRegistry;
    }
}
