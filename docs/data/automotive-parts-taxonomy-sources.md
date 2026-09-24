# ALA Auto Parts — Master Automotive Parts Taxonomy Sources & Methodology

This document outlines the architectural sources, standards, and linguistic normalization methodologies used to compile the **ALA Auto Parts Master Automotive Parts Taxonomy**.

---

## 1. Reference Architecture & Standards

The taxonomy structure was designed by synthesizing international automotive engineering standards with regional Middle Eastern marketplace realities.

### A. Public Industry References
- **TecDoc / TecAlliance (Generic Article Taxonomy)**:
  - Standardized reference taxonomy used across European and global independent aftermarket catalogs.
  - Provided baseline structure for functional automotive systems: Braking, Steering, Suspension, Engine Mechanical, Valvetrain, Cooling, Exhaust, and Electrical.
- **Trodo.ae & Regional E-Commerce Catalogs**:
  - Used as a benchmark for marketplace navigation hierarchy and consumer-facing system groupings (17 base systems expanded to 30 systems for ALA).
- **SAE J1930 Standards**:
  - Standard electrical, electronics, and sensor nomenclature (e.g., MAF, MAP, CKP, CMP, TPS, BCM, ECU, TCM, OBD-II).

---

## 2. Categorization Separation & Intellectual Property Distinction

In accordance with Section 35 of the Master Task specification:

### A. Source / Reference Terminology
- International technical descriptions and generic article classifications (e.g., "Disc Brake Pad", "Tie Rod End", "Alternator", "Dual Mass Flywheel") derive from open industry engineering definitions.
- ALA Auto Parts does not claim proprietary ownership over standard international engineering terminology.

### B. ALA's Normalized Taxonomy Architecture
- 3-tier strictly normalized hierarchy: `System (Main Category) 🡒 Subcategory 🡒 Part Type 🡒 Aliases & Keywords`.
- Total scope: **30 Major Systems**, **48 Subcategories**, and **157 Standardized Part Types**.
- Separation of automotive taxonomy from vehicle database fitments (`product_vehicle_fitments`).

### C. ALA-Added Specialized Systems & Categories
The baseline 17 reference systems were expanded to 30 comprehensive systems to accommodate modern vehicle technologies:
1. **ADAS / Driver Assistance Systems (أنظمة مساعدة السائق)**: Blind spot radar, lane keeping windshield cameras, 360-degree cameras, adaptive cruise forward radar.
2. **Safety Systems (أنظمة السلامة)**: Airbag modules, pyrotechnic seat belt pretensioners, perimeter crash sensors, SRS ECUs.
3. **Advanced Starting & Charging (نظم بدء التشغيل والشحن)**: Separate starting motors, starter solenoids/bendix drives, alternators, overrunning decoupler pulleys, AGM/EFB start-stop batteries.
4. **Hybrid & EV Traction Battery Packs (خلايا وبطاريات الهايبرد)**: Modules for Toyota Camry/Prius/Lexus hybrid powertrains.
5. **Periodic Maintenance Service Kits (باقات الصيانة الدورية)**: 10,000 km minor service packs, 40,000–80,000 km major service overhaul kits.
6. **Diagnostics & Specialty Workshop Tools (أجهزة الفحص والمعدات)**: OBD-II scanners, hydraulic jacks, specialty filter wrenches.

---

## 3. Linguistic Research & Regional Arabic Terminology

A major core asset of this taxonomy is the deep indexing of **579 Arabic Aliases** and **357 English Aliases**, incorporating Yemeni, Gulf, and Levant colloquial marketplace terminology:

| Part (English) | Standard Arabic (الفصحى) | Yemeni / Gulf / Market Aliases (اللهجات الدارجة) |
| :--- | :--- | :--- |
| **Brake Pads** | فحمات الفرامل | تيل فرامل، تيل بريك، قماشات فرامل، سفايف بريك قدام |
| **Brake Discs** | أقراص الفرامل | هوبات، ديسكات بريك، صحون فرامل |
| **Brake Calipers** | كليبرات الفرامل | سرج الفرامل، فك الفرامل، بستن كليبر |
| **Brake Booster** | معزز الفرامل | باكم الفرامل، سيرفو بريك |
| **Shock Absorbers** | ممتصات الصدمات | مساعدات، كمساعد، دامبر |
| **Control Arms** | مقصات التعليق | مقص، أذرع شيل، مقصات علوية وسفلية |
| **Ball Joints** | ركب وجوز المقصات | جوزة مقص، ركبة تعليق، بيضة مقص |
| **Steering Rack** | دودة وعارضة التوجيه | دودة دركسون، علبة دركسون، مجمع سكان |
| **Alternator** | مولد التيار المتردد | دينمو كهرباء، جينريتر، مولد شحن |
| **Starter Motor** | محرك بدء التشغيل | سلف، مارش، ستارتر |
| **Spark Plugs** | شمعات الإشعال | بواجي، بوجي إشعال |
| **Fuel Injector** | بخاخات الوقود | رشاشات بنزين، نوزلات، حواقن |
| **Water Pump** | مضخة ماء التبريد | طرمبة موية، واتر بمب |
| **Thermostat** | بلف الحرارة | كوع حرارة، كبسولة حرارة، بلف ماء |
| **Clutch Kit** | طقم القابض (الكلتش) | طقم دبرياج، صحن ودسك وفحامة |
| **Engine Flywheel** | حذافة المحرك | الفولان، حذاف مكينة، ترس الفولان |
| **Driveshaft / CV Axle** | العكوس وأعمدة الدوران | عكس، كباسين، كبالن |
| **Differential** | الدفرنس والتروس التفاضلية | دفرنش، كرونة وبنيون |
| **Throttle Body** | صمام الخانق الإلكتروني | ثروتل، بوابة هواء، دعسة بنزين |
| **Oil Sump** | كرتير زيت المحرك | كرتير، صينية زيت، حوض الزيت |

---

## 4. Normalization Rules Engine

The search normalization algorithm (`services/taxonomySearch.ts`) applies systematic phonetic and morphological transforms:
1. **Diacritics (تشكيل)**: Removal of Harakat `[\u064B-\u065F\u0670]`.
2. **Kashida (تطويل)**: Removal of Tatweel `ـ`.
3. **Alif variants**: Standardizing `[أ, إ, آ, ٱ]` $\rightarrow$ `ا`.
4. **Yaa variants**: Standardizing `[ى, ي]` $\rightarrow$ `ي`.
5. **Taa Marbuta**: Standardizing `ة` $\rightarrow$ `ه`.
6. **Definite Article**: Dynamic stripping of leading prefix `الـ` when query length exceeds 3 characters.
7. **English Case & Plurals**: Lowercase conversion, alphanumeric stripping, and partial/stem matching.

---

## 5. Summary Statistics

- **Total Major Systems**: 30
- **Total Subcategories**: 48
- **Total Part Types**: 157
- **Total Arabic Aliases**: 579
- **Total English Aliases**: 357
- **Total Search Keywords**: 501
- **Integrity Validation**: 0 Errors, 0 Warnings (PASSED)
