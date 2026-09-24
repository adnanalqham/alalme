# ALA Auto Parts — Vehicle Brand Logo System Architecture & Integration

> **Technical Specification & Asset Documentation**  
> **Target Stack**: React Native Expo · Laravel 11 (PHP 8.2+) · PostgreSQL · Vite Admin Console  
> **Source Library**: Vector SVG Brand Trademark Assets (Cardog / Wikimedia Commons)

---

## 1. Executive Summary & Goals

The Vehicle Brand Logo System provides automatic, high-resolution vector brand emblems for automotive manufacturers retrieved from **NHTSA vPIC API** or registered manually in **PostgreSQL**.

### Key Architectural Tenets:
1. **Automatic Resolution**: When NHTSA vPIC returns raw corporate manufacturer names (e.g., `TOYOTA MOTOR CORPORATION`, `BMW AG`, `MERCEDES-BENZ`), the system normalizes the string to a canonical slug and attaches its approved vector SVG emblem automatically.
2. **Local Vector Assets First**: All 32+ primary market logos are stored locally as SVG files (`mobile/assets/brands/` and `public/assets/brands/`) and embedded as optimized XML in React Native Expo for instant offline rendering without network latency.
3. **No Watermarks / No Scraping**: Strict prohibition of Google Images scraping, Pinterest images, or low-resolution raster graphics. All logos are clean vector SVGs.
4. **Manual Override Protection**: When an Administrator customizes a brand logo in the Admin Console, `logo_source` is set to `manual`. The NHTSA background sync **strictly preserves** manual logos and never overwrites them.
5. **Fail-Safe Fallbacks**: If a brand logo is missing or fails to render, the system never displays a broken image icon or empty box. It displays a calibrated circular badge with the brand's initials and brand accent color.

---

## 2. Architecture & Data Flow

```
   NHTSA vPIC API
         │
         │ Raw Make Name (e.g. "Toyota Motor Corporation")
         ▼
 ┌────────────────────────────────────────────────────────┐
 │            Laravel Backend (BrandLogoResolver)         │
 │  1. Normalize corporate suffixes & clean punctuation   │
 │  2. Match against Arabic/English brand aliases         │
 │  3. Resolve canonical slug ('toyota')                  │
 │  4. Attach logo_url ('/assets/brands/toyota.svg')      │
 │  5. Check manual override lock                         │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │              PostgreSQL: vehicle_makes                 │
 │  - logo_url, logo_source, logo_license, logo_status    │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            │ GET /api/v1/vehicles/makes
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │            React Native Expo (Mobile App)              │
 │                                                        │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │ brandResolver.ts (Offline Mapping & Normalizer)   │  │
 │  └──────────────────────────┬───────────────────────┘  │
 │                             ▼                          │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │ BrandLogo.tsx Component (react-native-svg)       │  │
 │  │ - Vector SVG rendering via SvgXml                │  │
 │  │ - Strict LTR orientation (never flipped in RTL)  │  │
 │  │ - High-contrast initials badge fallback          │  │
 │  └──────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────┘
```

---

## 3. Supported Automotive Brands (32 Core Priority Makes)

All 32 brands are registered with localized names, country of origin, and verified SVG vector definitions:

| # | Brand (EN) | Brand (AR) | Slug | Country | SVG File |
|---|------------|------------|------|---------|----------|
| 1 | Toyota | تويوتا | `toyota` | Japan | `toyota.svg` |
| 2 | Nissan | نيسان | `nissan` | Japan | `nissan.svg` |
| 3 | Hyundai | هيونداي | `hyundai` | South Korea | `hyundai.svg` |
| 4 | Kia | كيا | `kia` | South Korea | `kia.svg` |
| 5 | Honda | هوندا | `honda` | Japan | `honda.svg` |
| 6 | Mitsubishi | ميتسوبيشي | `mitsubishi` | Japan | `mitsubishi.svg` |
| 7 | Mazda | مازدا | `mazda` | Japan | `mazda.svg` |
| 8 | Suzuki | سوزوكي | `suzuki` | Japan | `suzuki.svg` |
| 9 | Isuzu | إيسوزو | `isuzu` | Japan | `isuzu.svg` |
| 10 | Lexus | لكزس | `lexus` | Japan | `lexus.svg` |
| 11 | BMW | بي إم دبليو | `bmw` | Germany | `bmw.svg` |
| 12 | Mercedes-Benz | مرسيدس بنز | `mercedes-benz` | Germany | `mercedes-benz.svg` |
| 13 | Audi | أودي | `audi` | Germany | `audi.svg` |
| 14 | Volkswagen | فولكس فاجن | `volkswagen` | Germany | `volkswagen.svg` |
| 15 | Ford | فورد | `ford` | USA | `ford.svg` |
| 16 | Chevrolet | شفروليه | `chevrolet` | USA | `chevrolet.svg` |
| 17 | Jeep | جيب | `jeep` | USA | `jeep.svg` |
| 18 | Land Rover | لاند روفر | `land-rover` | UK | `land-rover.svg` |
| 19 | Porsche | بورشه | `porsche` | Germany | `porsche.svg` |
| 20 | Volvo | فولفو | `volvo` | Sweden | `volvo.svg` |
| 21 | Changan | شانجان | `changan` | China | `changan.svg` |
| 22 | Geely | جيلي | `geely` | China | `geely.svg` |
| 23 | GAC | جي أيه سي | `gac` | China | `gac.svg` |
| 24 | Chery | شيري | `chery` | China | `chery.svg` |
| 25 | Haval | هافال | `haval` | China | `haval.svg` |
| 26 | Jetour | جيتور | `jetour` | China | `jetour.svg` |
| 27 | MG | إم جي | `mg` | UK / China | `mg.svg` |
| 28 | BYD | بي واي دي | `byd` | China | `byd.svg` |
| 29 | Dongfeng | دونغ فنغ | `dongfeng` | China | `dongfeng.svg` |
| 30 | DFSK | دي إف إس كيه | `dfsk` | China | `dfsk.svg` |
| 31 | FAW | فاو | `faw` | China | `faw.svg` |
| 32 | JAC | جاك | `jac` | China | `jac.svg` |

---

## 4. Normalization Rules & Aliases

NHTSA vPIC returns manufacturer names in uppercase legal formats (e.g. `TOYOTA MOTOR CORPORATION`). The normalizer strips boilerplate suffixes and matches against variant aliases:

```php
// Corporate suffixes stripped automatically:
$patterns = [
    '/\b(motor corporation|motors corporation|automobile co|motor co|holding group|holdings|company|corp|ltd|inc|llc|ag|gmbh|sa)\b/u',
    '/[.,\-_()&]/u',
];
```

### Supported Aliases Examples:
- `Toyota Motor Corporation` $\rightarrow$ `toyota`
- `Mercedes Benz AG`, `Daimler AG` $\rightarrow$ `mercedes-benz`
- `Bayerische Motoren Werke`, `BMW AG` $\rightarrow$ `bmw`
- `Hyundai Motor Company` $\rightarrow$ `hyundai`
- `مرسيدس`, `مرسيدس بنز` $\rightarrow$ `mercedes-benz`
- `هيونداي`, `هونداي` $\rightarrow$ `hyundai`
- `بي إم دبليو`, `بي ام دبليو` $\rightarrow$ `bmw`

---

## 5. Database Schema & Fields

### Added to `vehicle_makes`:
| Column | Type | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `logo_url` | `VARCHAR(500)` | `NULL` | Public path or CDN URL of brand logo |
| `logo_source` | `VARCHAR(50)` | `'auto'` | `'auto'`, `'manual'`, `'nhtsa'`, `'external'` |
| `logo_license` | `VARCHAR(255)` | `'Public Brand Trademark...'` | License and attribution tracking |
| `logo_status` | `VARCHAR(30)` | `'available'` | `'available'`, `'missing'`, `'manual'`, `'external'` |

---

## 6. Admin Manual Override & NHTSA Sync Rules

In the Admin Catalog Console (`Admin -> Vehicles -> Makes`):
1. **View**: Admins see logo previews and status badges (`AVAILABLE` green, `MANUAL` purple, `MISSING` amber).
2. **Replace Logo**: Clicking "Logo" opens the modal to assign a custom SVG or PNG URL.
3. **Lock Mechanism**: Saving a custom logo sets `logo_source = 'manual'`.
4. **NHTSA Sync Protection**: When `php artisan vehicle:sync` or background sync jobs execute, the service checks:
   ```php
   if ($make->isManualLogo()) {
       // PRESERVE MANUAL LOGO — DO NOT OVERWRITE
       continue;
   }
   ```
5. **Reset**: An admin can click "Reset to Auto" to restore the automatic resolver at any time.

---

## 7. Mobile React Native Implementation

- **Component**: [`BrandLogo.tsx`](file:///c:/Users/MT/alalme/mobile/src/components/vehicle/BrandLogo.tsx)
- **Vector Renderer**: Utilizes `react-native-svg` (`SvgXml`) with the exact SVG vector paths.
- **RTL Handling**: Hardcoded `direction: 'ltr'` ensures automotive logos and brand marks are never horizontally flipped or inverted when Arabic RTL mode is active.
- **Fallback**: When an unmapped or custom make is rendered, `BrandLogo` displays a high-contrast badge with the make's initial letter (e.g. `T`, `MB`, `BMW`) and subtle brand accent color.

---

## 8. How to Add a New Brand

To register an additional automotive brand in the future:
1. Add the SVG vector file to `public/assets/brands/{slug}.svg` and `mobile/assets/brands/{slug}.svg`.
2. Add the slug and Arabic/English metadata to `$brandsRegistry` in [`BrandLogoResolver.php`](file:///c:/Users/MT/alalme/backend/app/Services/BrandLogoResolver.php).
3. Add the SVG XML string to `BRAND_SVG_XML` in [`brandSvgData.ts`](file:///c:/Users/MT/alalme/mobile/src/components/vehicle/brandSvgData.ts).
4. Run `php artisan vehicle:sync` or add the make via the Admin Console.
