/**
 * scripts/generateTaxonomy.ts
 *
 * Master Automotive Parts Taxonomy Generator for ALA Auto Parts.
 * Builds the canonical 3-level hierarchical parts taxonomy:
 * System (Main Category) -> Subcategory -> Part Type -> Aliases & Search Keywords.
 *
 * Covers 30 major automotive systems with authentic Yemeni, Gulf, and Technical Arabic terminology.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface RawPartType {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  aliases_ar: string[];
  aliases_en: string[];
  search_keywords?: string[];
}

export interface RawSubcategory {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  part_types: RawPartType[];
}

export interface RawCategory {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string;
  description_ar: string;
  description_en: string;
  subcategories: RawSubcategory[];
}

// Helper to normalize Arabic strings for search indices
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize alifs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize yaa
    .replace(/[ىي]/g, 'ي')
    // Normalize taa marbuta
    .replace(/ة/g, 'ه')
    // Remove tatweel / kashida
    .replace(/ـ/g, '')
    // Remove non-alphanumeric except spaces
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeEnglish(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// 30 Major Automotive Systems Definitions
// ---------------------------------------------------------------------------

export const TAXONOMY_DATA: RawCategory[] = [
  // 01. نظام الفرامل (Brake System)
  {
    id: 'cat-brakes',
    slug: 'brake-system',
    name_ar: 'نظام الفرامل',
    name_en: 'Brake System',
    icon: 'Disc',
    description_ar: 'منظومة الفرامل الهيدروليكية والميكانيكية والإلكترونية لسلامة وتوقف المركبة',
    description_en: 'Hydraulic, mechanical and electronic braking systems ensuring vehicle safety and stopping power',
    subcategories: [
      {
        id: 'sub-brake-friction',
        slug: 'brake-friction',
        name_ar: 'أجزاء الاحتكاك والفرملة',
        name_en: 'Brake Friction Components',
        description_ar: 'الفحمات وبطانات وأحذية الاحتكاك للفرامل',
        description_en: 'Friction pads, shoes and lining assemblies',
        part_types: [
          {
            id: 'pt-front-brake-pads',
            slug: 'front-brake-pads',
            name_ar: 'فحمات فرامل أمامية',
            name_en: 'Front Brake Pads',
            description_ar: 'بطانات احتكاك الفرامل الأمامية التي تتحمل النسبة الأكبر من قوة الكبح',
            description_en: 'Front axle friction pads handling the primary stopping load',
            aliases_ar: ['تيل فرامل أمامي', 'تيل بريك أمامي', 'فحمات بريك قدام', 'قماشات فرامل أمامية', 'سفايف بريك قدام', 'بطانات فرامل أمامية'],
            aliases_en: ['Front Brake Pad Set', 'Disc Brake Pads Front', 'Front Ceramic Brake Pads'],
            search_keywords: ['فرامل', 'فحمات', 'تيل', 'سفايف', 'قماشات', 'pads', 'front brake'],
          },
          {
            id: 'pt-rear-brake-pads',
            slug: 'rear-brake-pads',
            name_ar: 'فحمات فرامل خلفية',
            name_en: 'Rear Brake Pads',
            description_ar: 'بطانات فرامل المحور الخلفي لأنظمة الأقراص',
            description_en: 'Rear axle friction pads for disc brake systems',
            aliases_ar: ['تيل فرامل خلفي', 'تيل بريك ورا', 'فحمات بريك خلفية', 'قماشات فرامل خلفية', 'سفايف خلفية'],
            aliases_en: ['Rear Brake Pad Set', 'Disc Brake Pads Rear'],
            search_keywords: ['فرامل خلفية', 'تيل خلفي', 'rear pads'],
          },
          {
            id: 'pt-brake-shoes',
            slug: 'brake-shoes',
            name_ar: 'أحذية فرامل الطبلة',
            name_en: 'Brake Shoes',
            description_ar: 'أقمشة وبطانات احتكاك فرامل الطبلة (الدرام) الخلفية',
            description_en: 'Friction shoes for rear drum brake mechanisms',
            aliases_ar: ['قماشات فرامل طبلة', 'تيل طبلة', 'بطانات فرامل درام', 'شوز فرامل'],
            aliases_en: ['Drum Brake Shoes', 'Rear Brake Shoes', 'Brake Lining Shoes'],
            search_keywords: ['طبلة', 'درام', 'shoes', 'drum brake'],
          },
        ],
      },
      {
        id: 'sub-brake-discs-drums',
        slug: 'brake-discs-drums',
        name_ar: 'أقراص وهوبات الفرامل',
        name_en: 'Brake Discs & Drums',
        description_ar: 'أقراص الهوبات المعدنية وطنابير الفرامل',
        description_en: 'Metal brake discs, rotors and rear drum housings',
        part_types: [
          {
            id: 'pt-front-brake-disc',
            slug: 'front-brake-disc',
            name_ar: 'قرص فرامل أمامي (هوب)',
            name_en: 'Front Brake Disc / Rotor',
            description_ar: 'قرص الفرامل المعدني الدوار المهوى أو المصمت للمحور الأمامي',
            description_en: 'Vented or solid cast iron front brake rotor',
            aliases_ar: ['هوب فرامل أمامي', 'ديسك فرامل أمامي', 'درام فرامل قدام', 'صحن فرامل أمامي'],
            aliases_en: ['Front Brake Rotor', 'Front Brake Disc', 'Vented Brake Rotor'],
            search_keywords: ['هوب', 'ديسك', 'قرص فرامل', 'rotors', 'disc'],
          },
          {
            id: 'pt-rear-brake-disc',
            slug: 'rear-brake-disc',
            name_ar: 'قرص فرامل خلفي (هوب)',
            name_en: 'Rear Brake Disc / Rotor',
            description_ar: 'قرص فرامل المحور الخلفي لسيارات الديسكات الرباعية',
            description_en: 'Rear brake rotor for 4-wheel disc brake systems',
            aliases_ar: ['هوب فرامل خلفي', 'ديسك فرامل ورا', 'صحن فرامل خلفي'],
            aliases_en: ['Rear Brake Rotor', 'Rear Brake Disc', 'Solid Brake Rotor Rear'],
            search_keywords: ['هوب خلفي', 'ديسك خلفي', 'rear rotor'],
          },
          {
            id: 'pt-brake-drum',
            slug: 'brake-drum',
            name_ar: 'طنبورة الفرامل الخلفية (درام)',
            name_en: 'Brake Drum',
            description_ar: 'أسطوانة وطنبورة الفرامل الخلفية المغلقة',
            description_en: 'Enclosed cylindrical brake drum for rear axles',
            aliases_ar: ['طبلة فرامل', 'درام فرامل', 'طنبور فرامل خلفي', 'هوب طبلة'],
            aliases_en: ['Rear Brake Drum', 'Cast Iron Brake Drum'],
            search_keywords: ['طبلة', 'طنبور', 'drum'],
          },
        ],
      },
      {
        id: 'sub-brake-hydraulics',
        slug: 'brake-hydraulics',
        name_ar: 'هيدروليك وكليبرات الفرامل',
        name_en: 'Brake Hydraulics & Calipers',
        description_ar: 'الكليبرات والمضخات والسلندرات المنفذة لقوة الضغط الهيدروليكي',
        description_en: 'Calipers, master cylinders and wheel slave cylinders',
        part_types: [
          {
            id: 'pt-brake-caliper-front',
            slug: 'brake-caliper-front',
            name_ar: 'كليبر فرامل أمامي',
            name_en: 'Front Brake Caliper',
            description_ar: 'فك الفرامل الهيدروليكي الحامل للفحمات والكباسات على الهوب الأمامي',
            description_en: 'Hydraulic clamping assembly holding pads and pistons',
            aliases_ar: ['سلندر فرامل أمامي', 'فك فرامل', 'ملقط فرامل', 'كاليبر فرامل'],
            aliases_en: ['Front Caliper Assembly', 'Brake Piston Caliper'],
            search_keywords: ['كليبر', 'سلندر', 'caliper'],
          },
          {
            id: 'pt-brake-master-cylinder',
            slug: 'brake-master-cylinder',
            name_ar: 'مضخة الفرامل الرئيسية (ماستر)',
            name_en: 'Brake Master Cylinder',
            description_ar: 'أسطوانة ضغط زيت الفرامل الرئيسية المتصلة بدواسة الفرامل ومعزز السيرفو',
            description_en: 'Primary pressure-generating hydraulic cylinder linked to pedal',
            aliases_ar: ['ماستر فرامل', 'طرمبة فرامل رئيسية', 'سلندر فرامل رئيسي', 'مضخة سائل الفرامل'],
            aliases_en: ['Brake Master', 'Main Brake Cylinder'],
            search_keywords: ['ماستر', 'طرمبة فرامل', 'master cylinder'],
          },
          {
            id: 'pt-brake-booster',
            slug: 'brake-booster',
            name_ar: 'معزز الفرامل (سيرفو)',
            name_en: 'Brake Booster / Servo',
            description_ar: 'مضاعف ضغط الفرامل الهوائي المعتمد على تفريغ المحرك (السيرفو)',
            description_en: 'Vacuum power brake booster assisting pedal application',
            aliases_ar: ['سيرفو فرامل', 'بوستر فرامل', 'طنجرة فرامل', 'مساعد دعسة الفرامل'],
            aliases_en: ['Vacuum Brake Booster', 'Brake Servo Unit', 'Power Brake Booster'],
            search_keywords: ['سيرفو', 'بوستر', 'servo', 'booster'],
          },
          {
            id: 'pt-wheel-cylinder',
            slug: 'wheel-cylinder',
            name_ar: 'أسطوانة فرامل العجلة (بستم فرامل)',
            name_en: 'Wheel Brake Cylinder',
            description_ar: 'أسطوانة هيدروليكية صغيرة داخل طبلة الفرامل لدفع أحذية الفرامل',
            description_en: 'Slave hydraulic cylinder inside drum to push brake shoes',
            aliases_ar: ['بستم فرامل خلفي', 'سلندر فرامل العجلة', 'طرمبة فرامل صغيرة'],
            aliases_en: ['Rear Wheel Cylinder', 'Drum Slave Cylinder'],
            search_keywords: ['بستم', 'wheel cylinder'],
          },
          {
            id: 'pt-brake-hose',
            slug: 'brake-hose',
            name_ar: 'خرطوم وليات الفرامل الهيدروليكية',
            name_en: 'Brake Hose / Line',
            description_ar: 'خرطوم مرن مقوى ينقل ضغط الزيت إلى كليبرات العجلات المتحركة',
            description_en: 'Reinforced flexible hydraulic line feeding calipers',
            aliases_ar: ['لي فرامل', 'هوز فرامل', 'بايب فرامل مرن', 'شيلان فرامل'],
            aliases_en: ['Hydraulic Brake Hose', 'Flexible Brake Line'],
            search_keywords: ['لي', 'خرطوم', 'hose', 'line'],
          },
        ],
      },
      {
        id: 'sub-brake-electronics-abs',
        slug: 'brake-electronics-abs',
        name_ar: 'أنظمة ABS وحساسات الفرامل',
        name_en: 'ABS & Electronic Braking',
        description_ar: 'حساسات السرعة وحلقات ومجمعات مانع انغلاق المكابح',
        description_en: 'Anti-lock braking sensors, exciter rings and modules',
        part_types: [
          {
            id: 'pt-abs-sensor',
            slug: 'abs-sensor',
            name_ar: 'حساس مانع الانغلاق (حساس ABS)',
            name_en: 'ABS Wheel Speed Sensor',
            description_ar: 'مستشعر كهرومغناطيسي يقيس سرعة دوران العجلة لمنع انغلاقها أثناء الفرملة',
            description_en: 'Wheel speed sensor providing rotation data to ABS ECU',
            aliases_ar: ['حساس سرعة العجلة', 'حساس اي بي اس', 'سنسر ABS'],
            aliases_en: ['Wheel Speed Sensor', 'ABS Sensor Wire'],
            search_keywords: ['abs', 'حساس فرامل', 'speed sensor'],
          },
          {
            id: 'pt-abs-module',
            slug: 'abs-module',
            name_ar: 'وحدة ومضخة تحكم ABS / ESP',
            name_en: 'ABS Pump & Control Module',
            description_ar: 'المجمع الهيدروليكي والصمامات الكهرومغناطيسية المتحكمة بضغط الفرامل إلكترونياً',
            description_en: 'Hydraulic modulator and ECU controlling individual wheel pressure',
            aliases_ar: ['جهاز ABS', 'طرمبة ABS', 'كمبيوتر ABS', 'بلوك مانع الانغلاق'],
            aliases_en: ['ABS Modulator', 'ABS Hydraulic Unit', 'ESP Pump Module'],
            search_keywords: ['طرمبة abs', 'جهاز abs', 'modulator'],
          },
          {
            id: 'pt-handbrake-cable',
            slug: 'handbrake-cable',
            name_ar: 'سلك وكابل فرامل اليد',
            name_en: 'Handbrake / Parking Brake Cable',
            description_ar: 'كابل فولاذي مشدود ينقل حركة ذراع أو زر الجلنط إلى فرامل التوقف',
            description_en: 'Steel braided cable activating the parking brake mechanism',
            aliases_ar: ['سلك جلنط', 'واير هاندبريك', 'كابل فرامل التوقف', 'واير جلنت'],
            aliases_en: ['Parking Brake Cable', 'Emergency Brake Cable'],
            search_keywords: ['جلنط', 'هاندبريك', 'handbrake', 'cable'],
          },
        ],
      },
    ],
  },

  // 02. الفلاتر (Filters)
  {
    id: 'cat-filters',
    slug: 'filters',
    name_ar: 'الفلاتر',
    name_en: 'Filters',
    icon: 'Filter',
    description_ar: 'جميع أنواع فلاتر التنقية للزيوت والهواء والوقود والمقصورة لحماية أجزاء المركبة',
    description_en: 'Filtration products for engine oil, intake air, cabin, fuel and transmission fluids',
    subcategories: [
      {
        id: 'sub-engine-filters',
        slug: 'engine-filters',
        name_ar: 'فلاتر المحرك وسوائله',
        name_en: 'Engine Filtration',
        description_ar: 'فلاتر زيت المحرك والهواء والوقود',
        description_en: 'Oil, intake air and fuel purification units',
        part_types: [
          {
            id: 'pt-engine-oil-filter',
            slug: 'engine-oil-filter',
            name_ar: 'فلتر زيت المحرك (سيفون)',
            name_en: 'Engine Oil Filter',
            description_ar: 'منقي زيت التزييت من الشوائب والبرادة المعدنية وجزيئات الكربون',
            description_en: 'Spin-on canister or cartridge element purifying lubricating oil',
            aliases_ar: ['سيفون زيت', 'فلتر مكينة', 'منقي زيت المحرك', 'صفاية زيت'],
            aliases_en: ['Oil Filter Element', 'Spin-on Oil Filter', 'Lube Filter'],
            search_keywords: ['سيفون', 'فلتر زيت', 'oil filter', 'سيفون مكينة'],
          },
          {
            id: 'pt-engine-air-filter',
            slug: 'engine-air-filter',
            name_ar: 'فلتر هواء المحرك',
            name_en: 'Engine Air Filter',
            description_ar: 'منقي الهواء الداخل إلى ثلاجة المحرك وغرف الاحتراق من الأتربة والغبار',
            description_en: 'Intake air cleaning filter protecting cylinders from abrasives',
            aliases_ar: ['فلتر شوية', 'صفاية هواء', 'فلتر مكينة هواء'],
            aliases_en: ['Air Cleaner Element', 'Intake Air Filter'],
            search_keywords: ['فلتر هواء', 'صفاية هواء', 'air filter'],
          },
          {
            id: 'pt-cabin-air-filter',
            slug: 'cabin-air-filter',
            name_ar: 'فلتر هواء المقصورة والمكيف',
            name_en: 'Cabin Air Filter / Pollen Filter',
            description_ar: 'منقي هواء تكييف المقصورة من الأتربة وحبوب اللقاح والروائح',
            description_en: 'Pollen and particulate filter purifying air entering vehicle interior',
            aliases_ar: ['فلتر مكيف', 'فلتر غمارة', 'فلتر كابينة', 'فلter بولين'],
            aliases_en: ['A/C Cabin Filter', 'Pollen Filter', 'Dust Filter'],
            search_keywords: ['فلتر مكيف', 'فلتر غمارة', 'cabin filter', 'ac filter'],
          },
          {
            id: 'pt-fuel-filter',
            slug: 'fuel-filter',
            name_ar: 'فلتر الوقود (صفاية بنزين / ديزل)',
            name_en: 'Fuel Filter',
            description_ar: 'منقي البنزين والديزل من الشوائب والماء قبل وصوله إلى البخاخات',
            description_en: 'In-line or tank fuel filter removing sediments and moisture',
            aliases_ar: ['صفاية بنزين', 'فلتر ديزل', 'صفاية بترول', 'فاصل ماء الديزل'],
            aliases_en: ['Gasoline Filter', 'Diesel Fuel Water Separator', 'In-Tank Fuel Filter'],
            search_keywords: ['صفاية بنزين', 'فلتر ديزل', 'fuel filter'],
          },
          {
            id: 'pt-transmission-filter',
            slug: 'transmission-filter',
            name_ar: 'فلتر زيت ناقل الحركة (فلتر القير)',
            name_en: 'Transmission Oil Filter',
            description_ar: 'منقي زيت القير الأوتوماتيكي داخل كرتير ناقل الحركة',
            description_en: 'Automatic transmission fluid filter located in oil pan',
            aliases_ar: ['فلتر جير', 'صفاية قير', 'فلتر زيت الفتيس', 'فلتر قير أوتوماتيك'],
            aliases_en: ['ATF Filter', 'Gearbox Oil Strainer', 'Transmission Sump Filter'],
            search_keywords: ['فلتر قير', 'فلتر جير', 'transmission filter'],
          },
        ],
      },
    ],
  },

  // 03. مجموعة الحركة والتعليق (Drivetrain & Suspension)
  {
    id: 'cat-drivetrain-suspension',
    slug: 'drivetrain-suspension',
    name_ar: 'مجموعة الحركة والتعليق',
    name_en: 'Drivetrain & Suspension',
    icon: 'GitCommit',
    description_ar: 'المكونات الميكانيكية الرابطة بين ناقل الحركة والعجلات وأنظمة امتصاص الارتجاج',
    description_en: 'Mechanical linkage between transmission and wheels including damping assemblies',
    subcategories: [
      {
        id: 'sub-cv-axles',
        slug: 'cv-axles',
        name_ar: 'العكوس وأعمدة الدوران',
        name_en: 'CV Axles & Driveshafts',
        description_ar: 'عكوس الحركة الأمامية والخلفية ومفاصل السرعة المتساوية',
        description_en: 'Constant velocity drive shafts and universal joints',
        part_types: [
          {
            id: 'pt-cv-axle-shaft',
            slug: 'cv-axle-shaft',
            name_ar: 'عمود العكس الكامل (عكس)',
            name_en: 'CV Axle Shaft Assembly',
            description_ar: 'عمود نقل الحركة المفصلي من الدفرنس أو القير إلى سرة العجلة',
            description_en: 'Complete drive axle shaft transferring power to wheel hub',
            aliases_ar: ['عكس كامل', 'كوبلن كامل', 'عمود حركة جانبي', 'اكسل'],
            aliases_en: ['Half Shaft', 'Constant Velocity Shaft', 'Drive Axle'],
            search_keywords: ['عكس', 'كوبلن', 'cv axle', 'axle shaft'],
          },
          {
            id: 'pt-cv-joint-outer',
            slug: 'cv-joint-outer',
            name_ar: 'رأس العكس الخارجي',
            name_en: 'Outer CV Joint',
            description_ar: 'مفصل السرعة الثابتة الخارجي المثبت في هوب وسرة العجلة',
            description_en: 'Wheel-side constant velocity joint with splines',
            aliases_ar: ['راس عكس خارجي', 'كوبلن خارجي', 'مفصل عكس طرفي'],
            aliases_en: ['Outer CV Joint Kit', 'Wheel Side Joint'],
            search_keywords: ['راس عكس', 'كوبلن', 'cv joint'],
          },
          {
            id: 'pt-cv-boot-kit',
            slug: 'cv-boot-kit',
            name_ar: 'جلدة غطاء العكس (كاوتشوك العكس)',
            name_en: 'CV Joint Boot Kit',
            description_ar: 'غطاء مطاطي يحفظ شحم العكس ويمنع تسرب الأتربة والرمال',
            description_en: 'Flexible rubber or thermoplastic dust gaiter with grease and clamps',
            aliases_ar: ['جلدة عكس', 'كاوتشة كوبلن', 'صوفة عكس', 'ربلة عكس'],
            aliases_en: ['Gaiter Kit', 'Drive Shaft Boot'],
            search_keywords: ['جلدة عكس', 'كاوتشة كوبلن', 'boot'],
          },
          {
            id: 'pt-propeller-shaft',
            slug: 'propeller-shaft',
            name_ar: 'عمود الكردان الرئيسي (الشفت)',
            name_en: 'Propeller Shaft / Driveshaft',
            description_ar: 'عمود الدوران الطولي الناقل للعزم من القير إلى الدفرنس الخلفي',
            description_en: 'Longitudinal tubular shaft delivering torque to rear differential',
            aliases_ar: ['عمود كردان', 'شفت الدوران', 'عامود درايف شفت', 'عمود بيشان'],
            aliases_en: ['Cardan Shaft', 'Longitudinal Driveshaft', 'Prop Shaft'],
            search_keywords: ['كردان', 'شفت', 'driveshaft', 'propeller shaft'],
          },
          {
            id: 'pt-center-support-bearing',
            slug: 'center-support-bearing',
            name_ar: 'شيال عمود الكردان (كرسي الشيال)',
            name_en: 'Driveshaft Center Support Bearing',
            description_ar: 'محمل تثبيت مطاطي بمنتصف عمود الكردان لمنع الاهتزازات',
            description_en: 'Rubber-cushioned center support bearing for split drive shafts',
            aliases_ar: ['شيال عمود الدوران', 'كرسي كردان', 'محمل وسط العمود', 'حمالة شفت'],
            aliases_en: ['Center Support Bearing', 'Carrier Bearing'],
            search_keywords: ['شيال', 'كرسي كردان', 'center bearing'],
          },
        ],
      },
    ],
  },

  // 04. نظام التوجيه (Steering System)
  {
    id: 'cat-steering',
    slug: 'steering-system',
    name_ar: 'نظام التوجيه',
    name_en: 'Steering System',
    icon: 'Navigation',
    description_ar: 'منظومة الدركسون والتوجيه الميكانيكية والهيدروليكية والكهربائية',
    description_en: 'Mechanical, hydraulic and electric power steering assemblies and linkages',
    subcategories: [
      {
        id: 'sub-steering-gear',
        slug: 'steering-gear',
        name_ar: 'علبة الدركسون ومضخات التوجيه',
        name_en: 'Steering Rack & Pumps',
        description_ar: 'علب ومضخات الدريكسون الهيدروليكية ومحركات EPS',
        description_en: 'Steering gearboxes, hydraulic pumps and electric assist units',
        part_types: [
          {
            id: 'pt-steering-rack',
            slug: 'steering-rack',
            name_ar: 'علبة الدركسون (الدودة / المسننة)',
            name_en: 'Steering Rack & Pinion',
            description_ar: 'ترس وجريدة التوجيه المسننة التي تحول حركة الطارة إلى دوران العجلات',
            description_en: 'Rack and pinion assembly translating steering wheel motion',
            aliases_ar: ['دودة الدركسون', 'علبة دركسون هيدروليك', 'مسطرة توجيه', 'علبة سكان', 'دودة دركسون'],
            aliases_en: ['Steering Gear', 'Rack and Pinion Unit', 'Power Steering Rack'],
            search_keywords: ['دودة', 'علبة دركسون', 'دركسون', 'steering rack'],
          },
          {
            id: 'pt-power-steering-pump',
            slug: 'power-steering-pump',
            name_ar: 'طرمبة الدركسون (مضخة التوجيه الهيدروليكي)',
            name_en: 'Power Steering Pump',
            description_ar: 'مضخة هيدروليكية تدور بسير المحرك لتسهيل دوران مقود السيارة',
            description_en: 'Vane hydraulic pump generating fluid pressure for steering assist',
            aliases_ar: ['طرمبة باور', 'مضخة دركسون', 'دينمو باور ستيرنج', 'طرمبة سكان'],
            aliases_en: ['Hydraulic Steering Pump', 'Power Steering Vane Pump'],
            search_keywords: ['طرمبة باور', 'طرمبة دركسون', 'steering pump'],
          },
          {
            id: 'pt-tie-rod-end',
            slug: 'tie-rod-end',
            name_ar: 'رأس ذراع الدركسون الخارجي (الجوزة)',
            name_en: 'Tie Rod End (Outer)',
            description_ar: 'مفصل كروي يربط ذراع التوجيه بركبة العجلة لضبط زوايا التوجيه',
            description_en: 'Outer ball joint connecting steering rack to wheel knuckle',
            aliases_ar: ['راس ذراع دركسون', 'جوزة دركسون خارجية', 'طَرَف ذراع التوجيه', 'بيضات الدركسون'],
            aliases_en: ['Outer Tie Rod', 'Track Rod End'],
            search_keywords: ['ذراع دركسون', 'جوزة', 'tie rod'],
          },
          {
            id: 'pt-inner-tie-rod',
            slug: 'inner-tie-rod',
            name_ar: 'ذراع الدركسون الداخلي',
            name_en: 'Inner Tie Rod / Rack End',
            description_ar: 'قضيب التوجيه المحوري المتصل مباشرة بمسننة علبة الدركسون',
            description_en: 'Axial steering rod threaded into rack shaft',
            aliases_ar: ['ذراع دودة داخلي', 'راك اند', 'قضيب توجيه داخلي'],
            aliases_en: ['Axial Joint', 'Rack End Rod'],
            search_keywords: ['ذراع داخلي', 'راك اند', 'inner tie rod'],
          },
        ],
      },
    ],
  },

  // 05. نظام تنظيف الزجاج (Windscreen / Wiper System)
  {
    id: 'cat-wiper-wash',
    slug: 'windscreen-wiper-system',
    name_ar: 'نظام تنظيف ومساحات الزجاج',
    name_en: 'Windscreen & Wiper System',
    icon: 'CloudRain',
    description_ar: 'مساحات ورشاشات ومحركات تنظيف الزجاج الأمامي والخلفي',
    description_en: 'Windshield wiper blades, linkages, washer pumps and reservoirs',
    subcategories: [
      {
        id: 'sub-wiper-hardware',
        slug: 'wiper-hardware',
        name_ar: 'المساحات ومكونات الغسيل',
        name_en: 'Wipers & Washer Hardware',
        description_ar: 'شفرات ومحركات وأذرع المساحات',
        description_en: 'Blades, motors, arms and fluid delivery',
        part_types: [
          {
            id: 'pt-wiper-blade-front',
            slug: 'wiper-blade-front',
            name_ar: 'طقم مساحات زجاج أمامي',
            name_en: 'Front Wiper Blade Set',
            description_ar: 'شفرات مسح مطاطية سيليكونية أو هيكلية للزجاج الأمامي',
            description_en: 'Aerodynamic silicone or rubber wiper blades for windshield',
            aliases_ar: ['مساحات قزاز', 'ريش مساحات', 'شفرات مساحات الزجاج', 'مساحات مطاط'],
            aliases_en: ['Windshield Wiper Blades', 'Aero Wiper Set'],
            search_keywords: ['مساحات', 'ريش', 'wiper blades'],
          },
          {
            id: 'pt-wiper-motor',
            slug: 'wiper-motor',
            name_ar: 'محرك المساحات (دينمو المساحات)',
            name_en: 'Wiper Motor Assembly',
            description_ar: 'محرك كهربائي بتروس تخفيض لتحريك أذرع مساحات الزجاج',
            description_en: 'Electric motor and reduction gearbox driving wiper linkage',
            aliases_ar: ['دينمو مساحات', 'موتور مساحات', 'مكينة مساحات'],
            aliases_en: ['Windscreen Wiper Motor', 'Front Wiper Drive'],
            search_keywords: ['دينمو مساحات', 'wiper motor'],
          },
          {
            id: 'pt-washer-pump',
            slug: 'washer-pump',
            name_ar: 'مضخة ماء المساحات (طرمبة الرشاشات)',
            name_en: 'Windshield Washer Pump',
            description_ar: 'مضخة غاطسة صغيرة في خزان الماء لضخ سائل الغسيل نحو الزجاج',
            description_en: 'Submersible 12V fluid pump delivering washer fluid to spray nozzles',
            aliases_ar: ['طرمبة رشاشات قزاز', 'دينمو ماء مساحات', 'مضخة قربة الماء'],
            aliases_en: ['Washer Fluid Pump', 'Screenwash Motor'],
            search_keywords: ['طرمبة مساحات', 'washer pump'],
          },
        ],
      },
    ],
  },

  // 06. قطع وأجزاء المحرك (Engine Parts)
  {
    id: 'cat-engine-parts',
    slug: 'engine-parts',
    name_ar: 'قطع وأجزاء المحرك',
    name_en: 'Engine Parts & Components',
    icon: 'Cpu',
    description_ar: 'الأجزاء الميكانيكية الداخلية والخارجية المكونة لكتلة المحرك ونظام التوقيت والتزييت',
    description_en: 'Internal combustion components, timing sets, cylinder heads and lubrication hardware',
    subcategories: [
      {
        id: 'sub-engine-block-piston',
        slug: 'engine-block-piston',
        name_ar: 'البساتم والعمود المرفقي والسلندر',
        name_en: 'Block, Pistons & Crankshaft',
        description_ar: 'المكابس وأذرع التوصيل وعمود الكرنك وسبائك المحرك',
        description_en: 'Pistons, rings, connecting rods, bearings and crankshaft',
        part_types: [
          {
            id: 'pt-piston-set',
            slug: 'piston-set',
            name_ar: 'طقم بساتم المحرك (المكابس)',
            name_en: 'Engine Piston Set',
            description_ar: 'مكابس الألومنيوم مع البنوز المتلقية لضغط الاحتراق داخل السلندرات',
            description_en: 'Forged or cast aluminum pistons with wrist pins',
            aliases_ar: ['بساتم مكينة', 'مكابس محرك', 'بستون سيارة'],
            aliases_en: ['Pistons Assembly', 'Engine Pistons with Pins'],
            search_keywords: ['بساتم', 'بستون', 'pistons'],
          },
          {
            id: 'pt-piston-rings',
            slug: 'piston-rings',
            name_ar: 'شنابر البساتم (حلقات المكبس)',
            name_en: 'Piston Ring Set',
            description_ar: 'حلقات الإحكام والضغط ومسح الزيت حول البستن',
            description_en: 'Compression and oil control rings sealing cylinder bore',
            aliases_ar: ['شنابر مكينة', 'رنجات بساتم', 'حلقات البستن', 'شنابر زيت'],
            aliases_en: ['Piston Rings', 'Compression Rings'],
            search_keywords: ['شنابر', 'رنجات', 'piston rings'],
          },
          {
            id: 'pt-crankshaft',
            slug: 'crankshaft',
            name_ar: 'عمود الكرنك (العمود المرفقي)',
            name_en: 'Engine Crankshaft',
            description_ar: 'العمود الرئيسي المحول للحركة الترددية من البساتم إلى حركة دورانية',
            description_en: 'Main rotating shaft converting reciprocating piston stroke to torque',
            aliases_ar: ['عمود مرفقي', 'كرنك مكينة', 'عامود كرنك'],
            aliases_en: ['Forged Crankshaft', 'Engine Crank'],
            search_keywords: ['كرنك', 'crankshaft'],
          },
          {
            id: 'pt-connecting-rod',
            slug: 'connecting-rod',
            name_ar: 'ذراع البستم (البييل / ذراع التوصيل)',
            name_en: 'Connecting Rod',
            description_ar: 'ذراع الربط الفولاذي بين المكبس وعمود الكرنك',
            description_en: 'Connecting rod linking piston to crankshaft journal',
            aliases_ar: ['بييل مكينة', 'ذراع توصيل', 'بييلات', 'ذراع بستن'],
            aliases_en: ['Conrod', 'Engine Connecting Rods'],
            search_keywords: ['بييل', 'ذراع بستم', 'connecting rod'],
          },
          {
            id: 'pt-engine-bearings',
            slug: 'engine-bearings',
            name_ar: 'سبائك الكرنك والبييل (محامل المحرك)',
            name_en: 'Crankshaft & Rod Bearings Set',
            description_ar: 'السبائك المعدنية نصف الدائرية لتقليل احتكاك الكرنك وأذرع البساتم',
            description_en: 'Main and rod plain journal bearings',
            aliases_ar: ['سبائك ثابت ومتحرك', 'سبائك كرنك', 'سبائك بييل', 'كوشنيرات مكينة'],
            aliases_en: ['Main Bearings', 'Rod Bearings', 'Big End Bearings'],
            search_keywords: ['سبائك', 'كوشنيرات', 'bearings'],
          },
        ],
      },
      {
        id: 'sub-timing-system',
        slug: 'timing-system',
        name_ar: 'منظومة وسلاسل التايمن',
        name_en: 'Timing Belts & Chains',
        description_ar: 'سيور وجنازير التايمن وشدادات التوقيت وتوافق الصمامات',
        description_en: 'Camshaft timing chains, belts, tensioners and guides',
        part_types: [
          {
            id: 'pt-timing-chain-kit',
            slug: 'timing-chain-kit',
            name_ar: 'طقم جنزير التايمن (سلسلة التوقيت)',
            name_en: 'Timing Chain Kit',
            description_ar: 'سلسلة التوقيت الفولاذية مع الشداد والدعامات ومسننات الكامات والكرنك',
            description_en: 'Complete timing chain assembly with tensioners and guides',
            aliases_ar: ['جنزير صدر', 'سلسلة تايمن', 'طقم تايمنق شين', 'جنزير مكينة'],
            aliases_en: ['Timing Chain Set', 'Camshaft Drive Chain'],
            search_keywords: ['جنزير تايمن', 'جنزير صدر', 'timing chain'],
          },
          {
            id: 'pt-timing-belt',
            slug: 'timing-belt',
            name_ar: 'سير التايمن (سير الكاتينة / التوقيت)',
            name_en: 'Timing Belt',
            description_ar: 'سير مطاطي مسنن يزامن دوران عمود الكامات مع عمود الكرنك',
            description_en: 'Toothed rubber belt synchronizing crankshaft and camshafts',
            aliases_ar: ['سير كاتينة', 'قايش تايمن', 'حزام التوقيت', 'سير مسنن'],
            aliases_en: ['Camshaft Timing Belt', 'Toothed Belt'],
            search_keywords: ['سير تايمن', 'سير كاتينة', 'timing belt'],
          },
          {
            id: 'pt-timing-belt-tensioner',
            slug: 'timing-belt-tensioner',
            name_ar: 'شداد سير/جنزير التايمن',
            name_en: 'Timing Belt / Chain Tensioner',
            description_ar: 'بكرة شدادة هيدروليكية أو زنبركية لضبط شد سلسلة وسير التوقيت',
            description_en: 'Hydraulic or spring-loaded pulley maintaining timing belt tension',
            aliases_ar: ['بكرة شداد تايمن', 'شداد كاتينة', 'بكرة شداد صدر'],
            aliases_en: ['Hydraulic Tensioner', 'Idler Pulley Tensioner'],
            search_keywords: ['شداد', 'بكرة شداد', 'tensioner'],
          },
        ],
      },
      {
        id: 'sub-cylinder-head-valves',
        slug: 'cylinder-head-valves',
        name_ar: 'رأس السلندر والبلوف والوجيه',
        name_en: 'Cylinder Head & Valves',
        description_ar: 'رأس المحرك والصبابات وعمود الكامات ووجوه السلندر',
        description_en: 'Cylinder heads, intake/exhaust valves, camshafts and head gaskets',
        part_types: [
          {
            id: 'pt-cylinder-head-gasket',
            slug: 'cylinder-head-gasket',
            name_ar: 'وجه رأس السلندر (كازكيت الرأس)',
            name_en: 'Cylinder Head Gasket',
            description_ar: 'جوان إحكام معدني متعدد الطبقات يفصل مسارات الزيت والماء وضغط الاحتراق',
            description_en: 'Multi-layer steel gasket sealing block to cylinder head',
            aliases_ar: ['قازقيت راس', 'جوان وش سلندر', 'كازكيت مكينة', 'وجه راس المكينة'],
            aliases_en: ['MLS Head Gasket', 'Engine Head Gasket'],
            search_keywords: ['وجه راس', 'قازقيت', 'جوان', 'head gasket'],
          },
          {
            id: 'pt-intake-exhaust-valves',
            slug: 'intake-exhaust-valves',
            name_ar: 'صبابات المحرك (بلوف هواء وعادم)',
            name_en: 'Engine Valves (Intake & Exhaust)',
            description_ar: 'صمامات إدخال خليط الهواء والوقود وصمامات تصريف غازات العادم',
            description_en: 'Poppet valves controlling airflow into and exhaust out of cylinders',
            aliases_ar: ['بلوف مكينة', 'صبابات هواء ونار', 'صمامات المحرك'],
            aliases_en: ['Intake Valves', 'Exhaust Valves', 'Engine Poppet Valves'],
            search_keywords: ['بلوف', 'صبابات', 'valves'],
          },
          {
            id: 'pt-valve-cover-gasket',
            slug: 'valve-cover-gasket',
            name_ar: 'وجه غطاء البلوف (جوان غطاء التاكيهات)',
            name_en: 'Valve Cover Gasket / Cam Cover Gasket',
            description_ar: 'مانع تسرب الزيت المطاطي لغطاء الصمامات العلوي',
            description_en: 'Perimeter rubber gasket sealing rocker / valve cover',
            aliases_ar: ['قازقيت غطا بلوف', 'وجه كارتير فوق', 'جوان تاكيهات', 'وجه غطاء الصبابات'],
            aliases_en: ['Rocker Cover Gasket', 'Cam Cover Seal'],
            search_keywords: ['وجه غطاء بلوف', 'قازقيت بلوف', 'valve cover gasket'],
          },
        ],
      },
      {
        id: 'sub-engine-mounts',
        slug: 'engine-mounts',
        name_ar: 'كراسي وقواعد المحرك',
        name_en: 'Engine Mounts',
        description_ar: 'قواعد التثبيت المطاطية والهيدروليكية لامتصاص اهتزازات المحرك',
        description_en: 'Hydraulic and rubber anti-vibration engine mounting brackets',
        part_types: [
          {
            id: 'pt-engine-mount',
            slug: 'engine-mount',
            name_ar: 'كرسي مكينة (قاعدة المحرك)',
            name_en: 'Engine Motor Mount',
            description_ar: 'قاعدة مطاطية مقواة أو هيدروليكية تثبت المحرك بالشاسيه وتمتص الاهتزازات',
            description_en: 'Hydraulic or elastomeric engine isolator mount',
            aliases_ar: ['قاعدة مكينة', 'كرسي محرك هيدروليك', 'مخدة مكينة', 'قاعدة موتور'],
            aliases_en: ['Motor Mount', 'Hydraulic Engine Mount', 'Front/Rear Engine Mount'],
            search_keywords: ['كرسي مكينة', 'قاعدة محرك', 'engine mount'],
          },
        ],
      },
    ],
  },

  // 07. نظام الوقود (Fuel System)
  {
    id: 'cat-fuel-system',
    slug: 'fuel-system',
    name_ar: 'نظام الوقود',
    name_en: 'Fuel System',
    icon: 'Fuel',
    description_ar: 'مضخات وبخاخات وخزانات الوقود ومنظمات الضغط لضمان تدفق البنزين والديزل',
    description_en: 'Fuel pumps, injection rails, nozzles, pressure regulators and fuel delivery hardware',
    subcategories: [
      {
        id: 'sub-fuel-delivery',
        slug: 'fuel-delivery',
        name_ar: 'مضخات وبخاخات الوقود',
        name_en: 'Pumps & Injection',
        description_ar: 'طرمبات الوقود وبخاخات الرش ومنظمات الضغط',
        description_en: 'Electric in-tank pumps, high pressure GDI pumps and fuel injectors',
        part_types: [
          {
            id: 'pt-fuel-pump-assembly',
            slug: 'fuel-pump-assembly',
            name_ar: 'طرمبة بنزين كاملة (عوامة ومضخة الوقود)',
            name_en: 'Fuel Pump Module Assembly',
            description_ar: 'مضخة الوقود الكهربائية الغاطسة بالخزان مع العوامة ومصفاة السحب',
            description_en: 'Complete in-tank fuel delivery module with level sender',
            aliases_ar: ['طرمبة بترول', 'فيول بمب', 'عوامة بنزين مع طرمبة', 'مضخة وقود كهربائية'],
            aliases_en: ['Electric Fuel Pump', 'In-Tank Fuel Module', 'Fuel Sender Unit'],
            search_keywords: ['طرمبة بنزين', 'طرمبة بترول', 'fuel pump'],
          },
          {
            id: 'pt-fuel-injector',
            slug: 'fuel-injector',
            name_ar: 'بخاخ الوقود (حاقن البنزين / الديزل)',
            name_en: 'Fuel Injector Nozzle',
            description_ar: 'صمام كهرومغناطيسي عالي الدقة لرش الوقود برذاذ دقيق داخل غرفة الاحتراق',
            description_en: 'Solenoid or piezo fuel injector delivering atomized spray',
            aliases_ar: ['حاقن وقود', 'نوزل بنزين', 'رشاش بترول', 'بخاخات مكينة'],
            aliases_en: ['Gasoline Injector', 'Common Rail Diesel Injector', 'Fuel Spray Valve'],
            search_keywords: ['بخاخ', 'بخاخات', 'حاقن', 'injector'],
          },
          {
            id: 'pt-high-pressure-fuel-pump',
            slug: 'high-pressure-fuel-pump',
            name_ar: 'طرمبة البنزين ذات الضغط العالي (GDI / الديزل)',
            name_en: 'High Pressure Fuel Pump (HPFP)',
            description_ar: 'مضخة ميكانيكية تعمل بعمود الكامات لتوليد ضغط فائق لمحركات الحقن المباشر',
            description_en: 'Cam-driven high pressure fuel pump for direct injection engines',
            aliases_ar: ['طرمبة حقن مباشر', 'طرمبة ضغط عالي', 'طرمبة ديزل هاي بريشر'],
            aliases_en: ['HPFP', 'Direct Injection Fuel Pump', 'Common Rail Pump'],
            search_keywords: ['طرمبة ضغط عالي', 'hpfp', 'high pressure pump'],
          },
          {
            id: 'pt-throttle-body',
            slug: 'throttle-body',
            name_ar: 'الثروتل بودي (بوابة الهواء / الدعسة)',
            name_en: 'Electronic Throttle Body',
            description_ar: 'بوابة وصمام التحكم بكمية الهواء الداخل للمحرك المتصل بدواسة البنزين',
            description_en: 'Drive-by-wire electronic throttle body controlling engine intake air',
            aliases_ar: ['دعسة البنزين', 'بوابة هواء', 'حساس الثروتل', 'اللهاة'],
            aliases_en: ['Throttle Valve Assembly', 'Electronic Throttle Actuator'],
            search_keywords: ['ثروتل', 'بوابة هواء', 'دعسة', 'throttle body'],
          },
        ],
      },
    ],
  },

  // 08. نظام العادم (Exhaust System)
  {
    id: 'cat-exhaust-system',
    slug: 'exhaust-system',
    name_ar: 'نظام العادم',
    name_en: 'Exhaust System',
    icon: 'Wind',
    description_ar: 'منظومة تفريغ غازات الاحتراق ودبات التلوث وكواتم الصوت وحساسات الشكمان',
    description_en: 'Exhaust piping, catalytic converters, particulate filters, mufflers and emission sensors',
    subcategories: [
      {
        id: 'sub-exhaust-hardware',
        slug: 'exhaust-hardware',
        name_ar: 'مكونات الشكمان والتحكم بالانبعاثات',
        name_en: 'Exhaust Pipes & Emissions',
        description_ar: 'الدبات وفلاتر البيئة وحساسات الأكسجين',
        description_en: 'Catalytic converters, silencers and oxygen sensors',
        part_types: [
          {
            id: 'pt-oxygen-sensor',
            slug: 'oxygen-sensor',
            name_ar: 'حساس الأكسجين (حساس الشكمان / لامبدا)',
            name_en: 'Oxygen Sensor (O2 / Lambda Sensor)',
            description_ar: 'مستشعر يقيس نسبة الأكسجين في غازات العادم لضبط خليط الهواء والوقود',
            description_en: 'Exhaust gas oxygen probe providing feedback to engine computer',
            aliases_ar: ['حساس شكمان', 'حساس صالنسة', 'سنسر اكسجين', 'حساس لمبدا'],
            aliases_en: ['O2 Sensor', 'Upstream Oxygen Sensor', 'Downstream Lambda Probe'],
            search_keywords: ['حساس شكمان', 'حساس اكسجين', 'oxygen sensor', 'o2 sensor'],
          },
          {
            id: 'pt-catalytic-converter',
            slug: 'catalytic-converter',
            name_ar: 'دبة التلوث (المحول الحفاز / فلتر البيئة)',
            name_en: 'Catalytic Converter',
            description_ar: 'وعاء به معادن نبيلة يحول الغازات السامة إلى غازات غير ضارة بالبيئة',
            description_en: 'Emissions device reducing carbon monoxide, hydrocarbons and NOx',
            aliases_ar: ['دبة رصاص', 'فلتر بيئة', 'دبة تلوث شكمان', 'كتالايزر'],
            aliases_en: ['Cat Converter', 'Exhaust Catalytic Purifier'],
            search_keywords: ['دبة تلوث', 'دبة رصاص', 'catalytic converter'],
          },
          {
            id: 'pt-exhaust-muffler',
            slug: 'exhaust-muffler',
            name_ar: 'دبة الشكمان الخلفية (كاتم الصوت)',
            name_en: 'Exhaust Muffler / Silencer',
            description_ar: 'كاتم صوت غازات العادم لخفض الضوضاء الناتجة عن انفجارات السلندرات',
            description_en: 'Acoustic chamber muffling exhaust pressure waves and engine noise',
            aliases_ar: ['شكمان خلفي', 'دبة صوت', 'صالنسة خلفية', 'كنداسة شكمان'],
            aliases_en: ['Rear Silencer', 'Exhaust Muffler Box'],
            search_keywords: ['شكمان', 'كاتم صوت', 'دبة', 'muffler'],
          },
        ],
      },
    ],
  },

  // 09. الأنظمة الكهربائية (Electrical System)
  {
    id: 'cat-electrical',
    slug: 'electrical-system',
    name_ar: 'الأنظمة الكهربائية',
    name_en: 'Electrical System',
    icon: 'Zap',
    description_ar: 'أنظمة التوليد والتشغيل والإشعال والضفائر ووحدات التحكم والحساسات الكهربائية',
    description_en: 'Ignition, power distribution, starter motors, wiring, relays, fuses and switches',
    subcategories: [
      {
        id: 'sub-ignition-system',
        slug: 'ignition-system',
        name_ar: 'منظومة الإشعال والكويلات',
        name_en: 'Ignition System',
        description_ar: 'شمعات الإشعال والكويلات وأسلاك البواجي',
        description_en: 'Spark plugs, ignition coils and high tension leads',
        part_types: [
          {
            id: 'pt-spark-plug',
            slug: 'spark-plug',
            name_ar: 'شمعة الإشعال (بوجي / بواجي)',
            name_en: 'Spark Plug',
            description_ar: 'قطب كهربي عالي الفولتية يولد الشرارة لإشعال خليط البنزين والهواء',
            description_en: 'High voltage electrode igniting the compressed air-fuel mixture',
            aliases_ar: ['بوجي', 'بواجي', 'بلكات إشعال', 'شمعات احتراق', 'بواجي بلاتينيوم', 'بواجي إيريديوم'],
            aliases_en: ['Spark Plugs Set', 'Iridium Spark Plug', 'Platinum Plug'],
            search_keywords: ['بواجي', 'بوجي', 'بلكات', 'spark plug'],
          },
          {
            id: 'pt-ignition-coil',
            slug: 'ignition-coil',
            name_ar: 'كويل الإشعال (ملف الإشعال / بوبينة)',
            name_en: 'Ignition Coil',
            description_ar: 'محول كهربائي يرفع جهد البطارية من 12 فولت إلى آلاف الفولتات للبواجي',
            description_en: 'Induction coil converting battery voltage into spark pulse',
            aliases_ar: ['كويل مكينة', 'بوبينة إشعال', 'ملف شرارة', 'كويلات كهرباء'],
            aliases_en: ['Coil Pack', 'Pencil Ignition Coil', 'COP Ignition Unit'],
            search_keywords: ['كويل', 'كويلات', 'بوبينة', 'ignition coil'],
          },
          {
            id: 'pt-glow-plug',
            slug: 'glow-plug',
            name_ar: 'شمعة التسخين لمحركات الديزل (بوجي تسخين)',
            name_en: 'Diesel Glow Plug',
            description_ar: 'عنصر تسخين كهربائي مسبق لتسهيل اشتعال الديزل في الطقس البارد',
            description_en: 'Heating pencil element assisting diesel cold start ignition',
            aliases_ar: ['بواجي ديزل', 'شمعة تسخين ديزل', 'سخانات ديزل'],
            aliases_en: ['Heater Glow Plug', 'Pre-heating Plug'],
            search_keywords: ['بواجي ديزل', 'سخانات ديزل', 'glow plug'],
          },
        ],
      },
    ],
  },

  // 10. نظام تبريد المحرك (Engine Cooling System)
  {
    id: 'cat-cooling-system',
    slug: 'engine-cooling-system',
    name_ar: 'نظام تبريد المحرك',
    name_en: 'Engine Cooling System',
    icon: 'Thermometer',
    description_ar: 'رديترات ومضخات الماء والثرموستات والمراوح لضبط درجة حرارة تشغيل المحرك',
    description_en: 'Radiators, water pumps, thermostats, expansion tanks and engine cooling fans',
    subcategories: [
      {
        id: 'sub-cooling-components',
        slug: 'cooling-components',
        name_ar: 'أجزاء دورة التبريد والمشعاع',
        name_en: 'Cooling Hardware & Radiators',
        description_ar: 'الرديترات ومضخات الماء والأكواع',
        description_en: 'Radiators, coolant pumps, thermostats and piping',
        part_types: [
          {
            id: 'pt-engine-radiator',
            slug: 'engine-radiator',
            name_ar: 'رديتر ماء المحرك (المشعاع)',
            name_en: 'Engine Coolant Radiator',
            description_ar: 'مبادل حراري من الألومنيوم لتبريد سائل التبريد الساخن بواسطة تيار الهواء',
            description_en: 'Aluminum heat exchanger dissipating engine heat via ambient air flow',
            aliases_ar: ['راديتر مكينة', 'مشعاع ماء', 'رديتر سيارة', 'مبرد ماء'],
            aliases_en: ['Water Radiator', 'Aluminum Radiator Core'],
            search_keywords: ['رديتر', 'راديتر', 'radiator'],
          },
          {
            id: 'pt-water-pump',
            slug: 'water-pump',
            name_ar: 'طرمبة ماء المحرك (مضخة سائل التبريد)',
            name_en: 'Engine Water Pump',
            description_ar: 'مضخة ميكانيكية تدور بسير المحرك لتدوير ماء التبريد بين السلندر والرديتر',
            description_en: 'Centrifugal pump circulating coolant through block and radiator',
            aliases_ar: ['مضخة ماء', 'طرمبة رديتر', 'واتر بمب', 'طلمبة مياه'],
            aliases_en: ['Coolant Water Pump', 'Mechanical Water Pump'],
            search_keywords: ['طرمبة ماء', 'مضخة ماء', 'water pump'],
          },
          {
            id: 'pt-thermostat',
            slug: 'thermostat',
            name_ar: 'بلف الحرارة (منظم حرارة المحرك / الثرموستات)',
            name_en: 'Engine Coolant Thermostat',
            description_ar: 'صمام حراري ينفتح عند وصول المحرك لحرارة التشغيل المثالية لمرور الماء',
            description_en: 'Thermal wax valve regulating coolant flow to radiator',
            aliases_ar: ['ثرموستات ماء', 'كوع حرارة', 'بلف رديتر', 'ثيرموستات'],
            aliases_en: ['Thermostat with Housing', 'Coolant Control Valve'],
            search_keywords: ['بلف حرارة', 'ثرموستات', 'thermostat'],
          },
          {
            id: 'pt-radiator-fan-assembly',
            slug: 'radiator-fan-assembly',
            name_ar: 'مروحة تبريد الرديتر الكهربائية',
            name_en: 'Radiator Cooling Fan Assembly',
            description_ar: 'مروحة كهربائية مع القميص والمحرك لسحب الهواء عبر الرديتر عند التوقف',
            description_en: 'Electric cooling fan with shroud and motor assembly',
            aliases_ar: ['مروحة مكينة', 'دينمو مروحة رديتر', 'مروحة تبريد كاملة'],
            aliases_en: ['Electric Radiator Fan', 'Dual Cooling Fan Assembly'],
            search_keywords: ['مروحة رديتر', 'مروحة تبريد', 'cooling fan'],
          },
        ],
      },
    ],
  },

  // 11. نظام التدفئة والتهوية والتكييف (HVAC)
  {
    id: 'cat-hvac',
    slug: 'heating-ventilation-ac',
    name_ar: 'نظام التدفئة والتهوية والتكييف',
    name_en: 'Heating, Ventilation & Air Conditioning',
    icon: 'Sun',
    description_ar: 'كمبروسرات ومكثفات وثلاجات ومراوح دفع هواء التكييف والتدفئة',
    description_en: 'A/C compressors, condensers, evaporators, heater cores and cabin blower assemblies',
    subcategories: [
      {
        id: 'sub-ac-refrigeration',
        slug: 'ac-refrigeration',
        name_ar: 'دورة غاز التكييف والضاغط',
        name_en: 'A/C Refrigeration Loop',
        description_ar: 'الكمبروسرات والمكثفات والمبخرات',
        description_en: 'Compressors, condensers, evaporators and expansion valves',
        part_types: [
          {
            id: 'pt-ac-compressor',
            slug: 'ac-compressor',
            name_ar: 'كمبروسر المكيف (ضاغط غاز الفريون)',
            name_en: 'A/C Compressor Assembly',
            description_ar: 'ضاغط غاز الفريون المدار بسير المحرك لضغط سائل التبريد وتدويره',
            description_en: 'Belt-driven refrigerant compressor with magnetic clutch',
            aliases_ar: ['كمبروسور مكيف', 'ضاغط مكيف', 'مضخة فريون', 'كمبريسر'],
            aliases_en: ['Air Conditioning Compressor', 'AC Pump'],
            search_keywords: ['كمبروسر', 'ضاغط مكيف', 'ac compressor'],
          },
          {
            id: 'pt-ac-condenser',
            slug: 'ac-condenser',
            name_ar: 'رديتر المكيف (مكثف غاز الفريون / سربنتينة)',
            name_en: 'A/C Condenser',
            description_ar: 'مشعاع تبريد غاز الفريون وتحويله إلى سائل والمثبت أمام رديتر الماء',
            description_en: 'Front-mounted heat exchanger converting high pressure gas to liquid',
            aliases_ar: ['سربنتينة مكيف', 'رديتر فريون', 'مكثف تكييف', 'كوندنسر'],
            aliases_en: ['Air Con Condenser', 'AC Radiator'],
            search_keywords: ['رديتر مكيف', 'سربنتينة', 'ac condenser'],
          },
          {
            id: 'pt-ac-evaporator',
            slug: 'ac-evaporator',
            name_ar: 'ثلاجة المكيف الداخلية (المبخر)',
            name_en: 'A/C Evaporator Core',
            description_ar: 'مبادل تبريد داخلي في طبلون السيارة يمر عبره هواء المقصورة ليتبرد',
            description_en: 'Cabin-mounted cooling core absorbing heat from passenger compartment',
            aliases_ar: ['مبخر تكييف', 'ثلاجة طبلون', 'ثلاجة فريون داخلية'],
            aliases_en: ['Evaporator Coil', 'Cooling Core'],
            search_keywords: ['ثلاجة مكيف', 'مبخر', 'evaporator'],
          },
          {
            id: 'pt-heater-core',
            slug: 'heater-core',
            name_ar: 'رديتر الدفاية الداخلي (سخان المقصورة)',
            name_en: 'Cabin Heater Core',
            description_ar: 'مشعاع صغير يمر به ماء المحرك الساخن لتدفئة مقصورة الركاب في الشتاء',
            description_en: 'Small radiator inside dash transferring engine heat to cabin',
            aliases_ar: ['دفاية مكيف', 'سخان داخلي', 'رديتر تدفئة طبلون'],
            aliases_en: ['Heater Matrix', 'Cabin Heat Exchanger'],
            search_keywords: ['دفاية', 'سخان', 'heater core'],
          },
        ],
      },
    ],
  },

  // 12. علبة التروس وناقل الحركة (Gearbox & Transmission)
  {
    id: 'cat-transmission',
    slug: 'gearbox-transmission',
    name_ar: 'علبة التروس وناقل الحركة',
    name_en: 'Gearbox & Transmission',
    icon: 'Settings',
    description_ar: 'نواقل الحركة الأوتوماتيكية واليدوية والدبل وأطقم الكلتش والتروس الداخلية',
    description_en: 'Automatic, manual and CVT transmissions, transfer cases, clutches and gear internals',
    subcategories: [
      {
        id: 'sub-clutch-mechanisms',
        slug: 'clutch-mechanisms',
        name_ar: 'أطقم القابض والكلتش',
        name_en: 'Clutch Kits & Flywheels',
        description_ar: 'صحن ودزك وبيرنج الكلتش ودولاب الموازنة',
        description_en: 'Friction clutch plates, pressure plates, release bearings and flywheels',
        part_types: [
          {
            id: 'pt-clutch-kit',
            slug: 'clutch-kit',
            name_ar: 'طقم كلتش كامل (صحن + دزك + فحمة)',
            name_en: 'Complete Clutch Kit (Plate + Disc + Bearing)',
            description_ar: 'طقم استبدال القابض الكامل المشتمل على قرص الاحتكاك والدسك ومحمل الفك',
            description_en: 'Three-piece clutch replacement assembly (friction disc, pressure plate, throwout bearing)',
            aliases_ar: ['طقم دبرياج', 'صحن ودسك كلتش', 'طقم قابض كامل', 'كلتش قير عادي'],
            aliases_en: ['3-Piece Clutch Set', 'Manual Transmission Clutch Assembly'],
            search_keywords: ['كلتش', 'دبرياج', 'صحن ودسك', 'clutch kit'],
          },
          {
            id: 'pt-flywheel',
            slug: 'flywheel',
            name_ar: 'دولاب الموازنة (الحذاف / الفولان)',
            name_en: 'Engine Flywheel / Dual Mass Flywheel (DMF)',
            description_ar: 'قرص معدني ثقيل مركب على الكرنك لتخزين القصور الذاتي ونقل العزم للكلتش',
            description_en: 'Heavy rotating disc absorbing torsional vibrations and mating with clutch',
            aliases_ar: ['فولان مكينة', 'حذاف كلتش', 'ترس الفولان', 'دولاب موازنة مزدوج'],
            aliases_en: ['Dual Mass Flywheel', 'Solid Flywheel', 'DMF'],
            search_keywords: ['فولان', 'حذاف', 'flywheel'],
          },
        ],
      },
    ],
  },

  // 13. الهيكل الخارجي والمقصورة (Body & Interior)
  {
    id: 'cat-body-interior',
    slug: 'body-interior',
    name_ar: 'الهيكل الخارجي والمقصورة',
    name_en: 'Body & Interior',
    icon: 'Layout',
    description_ar: 'الصدامات والكبوت والرفارف والأبواب والزجاج والمرايات والتجهيزات الداخلية',
    description_en: 'Body panels, bumpers, hoods, fenders, mirrors, door hardware and cabin trim',
    subcategories: [
      {
        id: 'sub-exterior-panels',
        slug: 'exterior-panels',
        name_ar: 'ألواح الهيكل والصدامات',
        name_en: 'Exterior Panels & Bumpers',
        description_ar: 'الصدامات والكبوت والرفارف والشبك',
        description_en: 'Front/rear bumpers, grilles, hoods and fender panels',
        part_types: [
          {
            id: 'pt-front-bumper',
            slug: 'front-bumper',
            name_ar: 'صدام أمامي كامل',
            name_en: 'Front Bumper Cover Assembly',
            description_ar: 'غطاء الصدام الأمامي المصنوع من البوليمر الماص للصدمات',
            description_en: 'Front impact absorbing fascia panel',
            aliases_ar: ['دعامية أمامية', 'بمبر قدام', 'اكصدام أمامي'],
            aliases_en: ['Front Fascia', 'Front Bumper Shell'],
            search_keywords: ['صدام', 'اكصدام', 'دعامية', 'bumper'],
          },
          {
            id: 'pt-engine-hood',
            slug: 'engine-hood',
            name_ar: 'كبوت السيارة (غطاء المحرك)',
            name_en: 'Engine Hood / Bonnet',
            description_ar: 'الغطاء المعدني أو الألومنيوم الحامي لحجرة المحرك',
            description_en: 'Front hinged engine compartment cover',
            aliases_ar: ['غطا مكينة', 'بونت السيارة', 'كابوت'],
            aliases_en: ['Bonnet Panel', 'Front Hood'],
            search_keywords: ['كبوت', 'كابوت', 'hood', 'bonnet'],
          },
          {
            id: 'pt-side-mirror',
            slug: 'side-mirror',
            name_ar: 'مرآة جانبية كهربائية كاملة',
            name_en: 'Side Door View Mirror Assembly',
            description_ar: 'مرآة الرؤية الجانبية مع إشارة الانعطاف ونظام التعديل والطي الكهربائي',
            description_en: 'Electric folding power side mirror with turn signal indicator',
            aliases_ar: ['مرايا جانبية', 'مراية باب', 'منظرة جانبية'],
            aliases_en: ['Wing Mirror', 'Rearview Side Mirror', 'Power Heated Mirror'],
            search_keywords: ['مرايا', 'مراية جانبية', 'side mirror'],
          },
        ],
      },
    ],
  },

  // 14. الإضاءة (Lighting)
  {
    id: 'cat-lighting',
    slug: 'lighting',
    name_ar: 'الإضاءة',
    name_en: 'Lighting',
    icon: 'SunMedium',
    description_ar: 'الشموع والأنوار الأمامية والخلفية وكشافات الضباب واللمبات الليد والزينون',
    description_en: 'Headlights, tail lamps, fog lights, indicators, LED/Xenon bulbs and modules',
    subcategories: [
      {
        id: 'sub-lamps-bulbs',
        slug: 'lamps-bulbs',
        name_ar: 'الأنوار والمصابيح',
        name_en: 'Lamps & Assemblies',
        description_ar: 'الشموع والاصطبات والأنوار',
        description_en: 'Headlamps, tail lights, fog assemblies and bulbs',
        part_types: [
          {
            id: 'pt-headlight-assembly',
            slug: 'headlight-assembly',
            name_ar: 'شمعة أمامية (نور أمامي كامل)',
            name_en: 'Headlight Assembly / Headlamp',
            description_ar: 'وحدة الإضاءة الأمامية الرئيسية بالعدسات ومصابيح الإشارة والليد النهاري',
            description_en: 'Front main illumination unit with projection lens and DRL',
            aliases_ar: ['فانوس أمامي', 'ضوء أمامي', 'اصطب أمامي', 'شمعة ليد'],
            aliases_en: ['Front Headlamp', 'LED Projector Headlight', 'Xenon Headlight'],
            search_keywords: ['شمعة', 'فانوس', 'نور أمامي', 'headlight'],
          },
          {
            id: 'pt-tail-light-assembly',
            slug: 'tail-light-assembly',
            name_ar: 'اصطب خلفي (نور خلفي كامل)',
            name_en: 'Tail Light Assembly / Rear Lamp',
            description_ar: 'وحدة الإضاءة الخلفية الحمراء المشتملة على أنوار الفرامل والريوس والإشارة',
            description_en: 'Rear combination lamp housing brake, reverse and indicator lights',
            aliases_ar: ['فانوس خلفي', 'اصطب بريك خلفي', 'ضوء خلفي', 'أنوار خلفية'],
            aliases_en: ['Rear Light Cluster', 'Tail Lamp Assembly', 'Brake Light Unit'],
            search_keywords: ['اصطب', 'اصطب خلفي', 'فانوس خلفي', 'tail light'],
          },
          {
            id: 'pt-fog-light',
            slug: 'fog-light',
            name_ar: 'كشاف ضباب أمامي',
            name_en: 'Front Fog Light Assembly',
            description_ar: 'مصباح إضاءة منخفض مثبت أسفل الصدام لاختراق الضباب والغبار',
            description_en: 'Low-mounted auxiliary lamp penetrating fog, rain and dust',
            aliases_ar: ['لمبة ضباب', 'فوج لايت', 'كشافات صدام'],
            aliases_en: ['Driving Fog Lamp', 'Bumper Fog Light'],
            search_keywords: ['كشاف ضباب', 'fog light'],
          },
        ],
      },
    ],
  },

  // 15. الزيوت والسوائل (Oils & Fluids)
  {
    id: 'cat-oils-fluids',
    slug: 'oils-fluids',
    name_ar: 'الزيوت والسوائل',
    name_en: 'Oils & Fluids',
    icon: 'Droplet',
    description_ar: 'زيوت المحرك والقير والدفرنس وسوائل الفرامل والتبريد ومواد التشحيم',
    description_en: 'Engine oils, transmission fluids, brake fluids, coolants, greases and chemical additives',
    subcategories: [
      {
        id: 'sub-lubricants-fluids',
        slug: 'lubricants-fluids',
        name_ar: 'زيوت التشحيم والمحرك',
        name_en: 'Lubricating Oils',
        description_ar: 'زيوت المحركات التخليقية ومياه الرديتر',
        description_en: 'Full synthetic engine oils, gear lubes and coolants',
        part_types: [
          {
            id: 'pt-engine-oil-synthetic',
            slug: 'engine-oil-synthetic',
            name_ar: 'زيت محرك تخليقي بالكامل',
            name_en: 'Fully Synthetic Engine Oil (5W-30 / 5W-40 / 0W-20)',
            description_ar: 'زيت تزييت عالي الأداء معتمد من معهد النفط الأمريكي API للسيارات الحديثة',
            description_en: 'Advanced synthetic lubricant engineered for modern high-stress engines',
            aliases_ar: ['زيت مكينة تخليقي', 'زيت محرك سوبر', 'زيت 5W30', 'زيت بترول'],
            aliases_en: ['Full Synthetic Motor Oil', 'API SP Engine Oil'],
            search_keywords: ['زيت مكينة', 'زيت محرك', 'engine oil'],
          },
          {
            id: 'pt-transmission-fluid',
            slug: 'transmission-fluid',
            name_ar: 'زيت ناقل الحركة الأوتوماتيكي (زيت قير ATF / CVT)',
            name_en: 'Automatic Transmission Fluid (ATF / CVT)',
            description_ar: 'سائل هيدروليكي عالي اللزوجة والتحمل الحراري لنواقل الحركة الأوتوماتيكية',
            description_en: 'Specialized hydraulic fluid for planetary and continuously variable gearboxes',
            aliases_ar: ['زيت قير أوتوماتيك', 'زيت جير ATF', 'زيت فتيس', 'زيت CVT'],
            aliases_en: ['ATF Fluid', 'CVT Fluid', 'Automatic Gearbox Oil'],
            search_keywords: ['زيت قير', 'زيت جير', 'atf', 'transmission fluid'],
          },
          {
            id: 'pt-brake-fluid',
            slug: 'brake-fluid',
            name_ar: 'سائل الفرامل الهيدروليكي (زيت باكم DOT 3 / DOT 4)',
            name_en: 'Brake Fluid (DOT 3 / DOT 4 / DOT 5.1)',
            description_ar: 'سائل غير قابل للانضغاط بنقطة غليان عالية لنقل قوة الضغط في الفرامل',
            description_en: 'Non-compressible glycol ether hydraulic fluid for braking systems',
            aliases_ar: ['زيت بريك', 'زيت باكم', 'زيت فرامل دوت 4'],
            aliases_en: ['DOT4 Hydraulic Brake Fluid', 'Hydraulic Clutch Fluid'],
            search_keywords: ['زيت فرامل', 'زيت باكم', 'brake fluid'],
          },
          {
            id: 'pt-engine-coolant',
            slug: 'engine-coolant',
            name_ar: 'ماء رديتر وسائل تبريد المحرك (أحمر / أخضر)',
            name_en: 'Engine Antifreeze & Coolant',
            description_ar: 'سائل إيثيلين جلايكول مخلوط بمضادات الصدأ والترسبات لرفع نقطة الغليان وحماية الرديتر',
            description_en: 'Ethylene glycol premixed coolant with corrosion inhibitors',
            aliases_ar: ['موية رديتر', 'سائل تبريد أحمر', 'ماء مقطر للرديتر', 'مانع تجمد'],
            aliases_en: ['50/50 Premixed Antifreeze', 'Long Life Coolant'],
            search_keywords: ['ماء رديتر', 'موية رديتر', 'coolant', 'antifreeze'],
          },
        ],
      },
    ],
  },

  // 16. الإكسسوارات ولوازم السيارات (Accessories & Equipment)
  {
    id: 'cat-accessories',
    slug: 'accessories-equipment',
    name_ar: 'الإكسسوارات ولوازم السيارات',
    name_en: 'Accessories & Equipment',
    icon: 'Package',
    description_ar: 'فرشات الأرضيات وأغطية السيارات والمقاعد والشواحن ومستلزمات العناية',
    description_en: 'Car mats, seat covers, sunshades, phone mounts, exterior protection and detailing tools',
    subcategories: [
      {
        id: 'sub-interior-accessories',
        slug: 'interior-accessories',
        name_ar: 'إكسسوارات المقصورة والحماية',
        name_en: 'Interior & Protection',
        description_ar: 'أغطية المقاعد والدعاسات',
        description_en: 'Floor mats, seat covers and sun protection',
        part_types: [
          {
            id: 'pt-floor-mats-set',
            slug: 'floor-mats-set',
            name_ar: 'طقم دعاسات وفرشات أرضية للسيارة',
            name_en: 'All-Weather Floor Mats Set',
            description_ar: 'فرشات مطاطية أو قماشية مصممة بأبعاد أرضية السيارة لحمايتها من الأتربة والسوائل',
            description_en: 'Custom-fit heavy duty rubber or carpet interior floor liners',
            aliases_ar: ['فرشات أرضية', 'دعاسات سيارة', 'وطايات قدم', 'بساط سيارة'],
            aliases_en: ['Rubber Floor Liners', 'Car Carpet Mats'],
            search_keywords: ['دعاسات', 'فرشات', 'floor mats'],
          },
        ],
      },
    ],
  },

  // 17. الأدوات ومعدات الصيانة (Tools & Equipment)
  {
    id: 'cat-tools',
    slug: 'tools-equipment',
    name_ar: 'الأدوات ومعدات الصيانة',
    name_en: 'Tools & Workshop Equipment',
    icon: 'Wrench',
    description_ar: 'أجهزة فحص الأعطال والمفاتيح والروافع الهيدروليكية ومعدات الورش',
    description_en: 'OBD diagnostic tools, socket sets, hydraulic jacks, tire inflators and specialty wrenches',
    subcategories: [
      {
        id: 'sub-mechanic-tools',
        slug: 'mechanic-tools',
        name_ar: 'أدوات الفحص والفك',
        name_en: 'Diagnostic & Hand Tools',
        description_ar: 'أجهزة OBD ومفاتيح الفك',
        description_en: 'OBD scanners, jack stands and hand tool kits',
        part_types: [
          {
            id: 'pt-obd-scanner',
            slug: 'obd-scanner',
            name_ar: 'جهاز فحص كمبيوتر السيارة (قارئ أعطال OBD-II)',
            name_en: 'OBD-II Diagnostic Fault Code Scanner',
            description_ar: 'قارئ أعطال كمبيوتر المحرك وقراءة الحساسات وإطفاء لمبة Check Engine',
            description_en: 'Diagnostic tool retrieving engine DTCs and real-time sensor PIDs',
            aliases_ar: ['كمبيوتر فحص سيارات', 'قارئ أعطال سيارة', 'جهاز سكانر سيارات', 'فاحص OBD2'],
            aliases_en: ['OBD2 Code Reader', 'Diagnostic Scan Tool', 'Engine Check Tool'],
            search_keywords: ['فحص كمبيوتر', 'obd', 'scanner'],
          },
        ],
      },
    ],
  },

  // 18. البطاريات ومنظومة الشحن (Batteries & Charging)
  {
    id: 'cat-batteries',
    slug: 'batteries-charging',
    name_ar: 'البطاريات والشحن',
    name_en: 'Batteries & Charging',
    icon: 'BatteryCharging',
    description_ar: 'بطاريات 12 فولت الحمضية والجافة وبطاريات الهايبرد وشواحن البطارية',
    description_en: '12V starter batteries, AGM/Gel batteries, hybrid battery packs and jump starters',
    subcategories: [
      {
        id: 'sub-starter-batteries',
        slug: 'starter-batteries',
        name_ar: 'بطاريات السيارات الأساسية',
        name_en: 'Starter Batteries',
        description_ar: 'بطاريات الرصاص الحمضية وAGM',
        description_en: '12V starting, lighting and ignition batteries',
        part_types: [
          {
            id: 'pt-car-battery-12v',
            slug: 'car-battery-12v',
            name_ar: 'بطارية سيارة 12 فولت (جافة / سائلة)',
            name_en: '12V Automotive Starter Battery (AGM / EFB / Lead-Acid)',
            description_ar: 'بطارية تيار البدء العالي لتشغيل المحرك وتغذية الشبكة الكهربائية',
            description_en: 'High cold cranking amp 12V starter battery',
            aliases_ar: ['بطارية مكينة', 'بطارية 70 أمبير', 'بطارية 60 أمبير', 'بطارية جافة'],
            aliases_en: ['12V SLI Battery', 'AGM Car Battery', 'Stop-Start Battery'],
            search_keywords: ['بطارية', 'بطاريات', 'battery', 'car battery'],
          },
        ],
      },
    ],
  },

  // 19. الإطارات والعجلات (Tyres & Wheels)
  {
    id: 'cat-tyres-wheels',
    slug: 'tyres-wheels',
    name_ar: 'الإطارات والعجلات',
    name_en: 'Tyres & Wheels',
    icon: 'Disc',
    description_ar: 'كفرات السيارات والجنوط وصواميل العجلات وحساسات ضغط الهواء TPMS',
    description_en: 'Radial passenger tires, alloy wheels, lug nuts and TPMS tire pressure sensors',
    subcategories: [
      {
        id: 'sub-tires-tpms',
        slug: 'tires-tpms',
        name_ar: 'الإطارات ومستشعرات الضغط',
        name_en: 'Tires & Pressure Sensors',
        description_ar: 'الإطارات وحساسات TPMS',
        description_en: 'Radial tires, tire pressure sensors and valve hardware',
        part_types: [
          {
            id: 'pt-tpms-sensor',
            slug: 'tpms-sensor',
            name_ar: 'حساس ضغط هواء الإطار (حساس كفرات TPMS)',
            name_en: 'TPMS Tire Pressure Monitoring Sensor',
            description_ar: 'حساس لاسلكي مثبت داخل بلف الكفر لقياس ضغط الهواء وإرساله للطبلون',
            description_en: 'Valve-mounted RF transmitter broadcasting tyre pressure to ECU',
            aliases_ar: ['حساس كفرات', 'حساس تي بي ام اس', 'سنسر ضغط الإطار', 'بلف حساس'],
            aliases_en: ['TPMS Valve Sensor', 'Tire Pressure Monitor'],
            search_keywords: ['حساس كفرات', 'tpms', 'tire pressure'],
          },
          {
            id: 'pt-alloy-wheel',
            slug: 'alloy-wheel',
            name_ar: 'جنط ألمنيوم (رنق سبائكي)',
            name_en: 'Alloy Wheel Rim',
            description_ar: 'عجلة معدنية مصبوبة من سبائك الألومنيوم خفيفة الوزن وعالية القوة',
            description_en: 'Cast or forged aluminum alloy wheel rim',
            aliases_ar: ['جنوط سيارة', 'رنق ألمنيوم', 'طاسة جنط', 'جنط سبور'],
            aliases_en: ['Aluminum Rim', 'Wheel Rim Assembly'],
            search_keywords: ['جنط', 'جنوط', 'رنق', 'wheels', 'rim'],
          },
        ],
      },
    ],
  },

  // 20. نظام التكييف (Air Conditioning Components)
  {
    id: 'cat-air-conditioning',
    slug: 'air-conditioning-system',
    name_ar: 'نظام التكييف',
    name_en: 'Air Conditioning System',
    icon: 'Wind',
    description_ar: 'مكونات التبريد الدقيقة وبلوف التمدد ومجففات الفريون والخراطيم',
    description_en: 'Expansion valves, dryer canisters, pressure switches, high/low lines and O-rings',
    subcategories: [
      {
        id: 'sub-ac-expansion-lines',
        slug: 'ac-expansion-lines',
        name_ar: 'صمامات ومجففات التكييف',
        name_en: 'Expansion Valves & Driers',
        description_ar: 'بلوف التمدد وفلاتر المجفف',
        description_en: 'TXV expansion valves and receiver driers',
        part_types: [
          {
            id: 'pt-ac-expansion-valve',
            slug: 'ac-expansion-valve',
            name_ar: 'بلف تمدد المكيف (صمام التمدد الحراري TXV)',
            name_en: 'A/C Expansion Valve (TXV)',
            description_ar: 'صمام دقيق يتحكم في انخفاض ضغط الفريون وتحوله من سائل إلى رذاذ بارد في الثلاجة',
            description_en: 'Thermal expansion valve metering liquid refrigerant into evaporator',
            aliases_ar: ['بلف ثلاجة مكيف', 'صمام فريون', 'بلف اكسبانشن'],
            aliases_en: ['Thermal Expansion Valve', 'AC TXV Valve'],
            search_keywords: ['بلف مكيف', 'expansion valve'],
          },
          {
            id: 'pt-ac-receiver-drier',
            slug: 'ac-receiver-drier',
            name_ar: 'فلتر مجفف الفريون (علبة المجفف)',
            name_en: 'A/C Receiver Drier / Desiccant Bag',
            description_ar: 'أسطوانة ممتصة للرطوبة والشوائب لحماية كمبروسر المكيف من التلف',
            description_en: 'Moisture filter canister trapping water in refrigeration circuit',
            aliases_ar: ['مجفف فريون', 'فلتر رديتر المكيف', 'فيلتر تكييف دراير'],
            aliases_en: ['A/C Drier', 'Accumulator Drier'],
            search_keywords: ['مجفف فريون', 'receiver drier'],
          },
        ],
      },
    ],
  },

  // 21. نظام التعليق (Suspension)
  {
    id: 'cat-suspension',
    slug: 'suspension-system',
    name_ar: 'نظام التعليق',
    name_en: 'Suspension System',
    icon: 'Activity',
    description_ar: 'المساعدات واليايات والمقصات والجوزات وجلب التوازن لثبات السيارة وراحتها',
    description_en: 'Shock absorbers, struts, coil springs, control arms, ball joints and sway bar links',
    subcategories: [
      {
        id: 'sub-dampers-springs',
        slug: 'dampers-springs',
        name_ar: 'المساعدات واليايات',
        name_en: 'Shock Absorbers & Springs',
        description_ar: 'ممتصات الصدمات واليايات اللولبية',
        description_en: 'Gas/oil shock absorbers, struts and heavy duty coil springs',
        part_types: [
          {
            id: 'pt-front-shock-absorber',
            slug: 'front-shock-absorber',
            name_ar: 'ممتص صدمات أمامي (مساعد أمامي)',
            name_en: 'Front Shock Absorber / Strut Assembly',
            description_ar: 'مساعد هيدروليكي غازي يمتص صدمات وتعرجات الطريق في مقدمة السيارة',
            description_en: 'Front suspension damper controlling rebound and compression',
            aliases_ar: ['مساعد أمامي', 'مساعدات قدام', 'جامبين أمامي', 'مساعد سيارة', 'دمبر أمامي'],
            aliases_en: ['Front Strut', 'Gas Shock Absorber Front', 'MacPherson Strut'],
            search_keywords: ['مساعدات', 'مساعد أمامي', 'جامبين', 'shock absorber'],
          },
          {
            id: 'pt-rear-shock-absorber',
            slug: 'rear-shock-absorber',
            name_ar: 'ممتص صدمات خلفي (مساعد خلفي)',
            name_en: 'Rear Shock Absorber',
            description_ar: 'مساعدات المحور الخلفي لتثبيت المركبة ومنع تمايلها أثناء القيادة',
            description_en: 'Rear axle shock absorber stabilizing ride height and dampening bounces',
            aliases_ar: ['مساعد خلفي', 'مساعدات ورا', 'جامبين خلفي'],
            aliases_en: ['Rear Strut', 'Rear Gas Damper'],
            search_keywords: ['مساعد خلفي', 'جامبين ورا', 'rear shock'],
          },
          {
            id: 'pt-coil-spring',
            slug: 'coil-spring',
            name_ar: 'ياي التعليق اللولبي (سبرنج / لولب)',
            name_en: 'Suspension Coil Spring',
            description_ar: 'زنبرك فولاذي حلزوني يدعم وزن السيارة ويحدد ارتفاع الهيكل',
            description_en: 'Heavy duty steel helical spring supporting vehicle chassis weight',
            aliases_ar: ['يايات سيارة', 'سبرنجات', 'ياي أمامي', 'ياي خلفي', 'زنبرك تعليق'],
            aliases_en: ['Chassis Spring', 'Helical Suspension Spring'],
            search_keywords: ['يايات', 'سبرنج', 'coil spring'],
          },
        ],
      },
      {
        id: 'sub-control-arms-linkages',
        slug: 'control-arms-linkages',
        name_ar: 'المقصات ومسامير التوازن',
        name_en: 'Control Arms & Stabilizer Links',
        description_ar: 'المقصات العلوية والسفلية ومسامير وجلود التوازن',
        description_en: 'Wishbones, control arms, ball joints and stabilizer bar linkages',
        part_types: [
          {
            id: 'pt-lower-control-arm',
            slug: 'lower-control-arm',
            name_ar: 'مقص أمامي سفلي كامل بالجوزة والجلد',
            name_en: 'Front Lower Control Arm Assembly',
            description_ar: 'ذراع مثلثي يربط ركبة العجلة بالشاسيه ويحدد مسار حركة العجلة الرأسية',
            description_en: 'A-arm wishbone assembly with pressed bushings and ball joint',
            aliases_ar: ['مقص سفلي', 'مقصات تحت', 'ذراع تعليق سفلي', 'مثلث تعليق'],
            aliases_en: ['Lower Wishbone', 'Track Control Arm'],
            search_keywords: ['مقص', 'مقصات', 'مقص سفلي', 'control arm'],
          },
          {
            id: 'pt-ball-joint',
            slug: 'ball-joint',
            name_ar: 'جوزة المقص (مفصل كروي للتعليق)',
            name_en: 'Suspension Ball Joint',
            description_ar: 'مفصل كروي مرن يتيح حركة الدوران والتوجيه لركبة العجلة',
            description_en: 'Pivoting spherical bearing linking control arm to steering knuckle',
            aliases_ar: ['بيضة مقص', 'جوزة سفلية', 'ركبة مقص', 'مفصل مقص'],
            aliases_en: ['Lower Ball Joint', 'Press-in Ball Joint'],
            search_keywords: ['جوزة مقص', 'بيضة مقص', 'ball joint'],
          },
          {
            id: 'pt-sway-bar-link',
            slug: 'sway-bar-link',
            name_ar: 'مسمار التوازن (عمود التوازن الرابط)',
            name_en: 'Sway Bar Link / Stabilizer Link',
            description_ar: 'عمود رابط بمفصلين كرويين يربط عمود التوازن بالمساعد لمنع انقلاب السيارة',
            description_en: 'Anti-roll bar link connecting stabilizer bar to suspension strut',
            aliases_ar: ['مسامير توازن', 'مسمار توازن أمامي', 'عمود توازن', 'زفرة توازن'],
            aliases_en: ['Anti-Roll Bar Link', 'Drop Link'],
            search_keywords: ['مسمار توازن', 'sway bar link', 'stabilizer link'],
          },
        ],
      },
    ],
  },

  // 22. نظام الدفع (Drivetrain)
  {
    id: 'cat-drivetrain',
    slug: 'drivetrain-axles',
    name_ar: 'نظام الدفع والمحاور',
    name_en: 'Drivetrain & Axles',
    icon: 'Disc',
    description_ar: 'الدفرنسات وكرونات العجلات وعكوس المحاور وأقفال الدبل',
    description_en: 'Differentials, final drive gears, axle shafts and transfer case modules',
    subcategories: [
      {
        id: 'sub-differential-gears',
        slug: 'differential-gears',
        name_ar: 'الدفرنس والكرونة',
        name_en: 'Differential & Ring Gear',
        description_ar: 'تروس الكرونة والدفرنس والصلبان',
        description_en: 'Ring and pinion sets, differential carriers and side gears',
        part_types: [
          {
            id: 'pt-differential-assembly',
            slug: 'differential-assembly',
            name_ar: 'مجموعة الدفرنس الكاملة (الدفرنشل)',
            name_en: 'Complete Differential Carrier Assembly',
            description_ar: 'تروس توزيع العزم بين العجلتين للسماح بالدوران بسرعات مختلفة عند المنعطفات',
            description_en: 'Epicyclic gear assembly distributing torque between drive wheels',
            aliases_ar: ['كرونة كاملة', 'دفرنش', 'كارونة دفرنس', 'مجموعة تروس خلفية'],
            aliases_en: ['Rear End Differential', 'Final Drive Carrier'],
            search_keywords: ['دفرنس', 'كرونة', 'differential'],
          },
        ],
      },
    ],
  },

  // 23. نظام القابض (Clutch System)
  {
    id: 'cat-clutch-system',
    slug: 'clutch-system',
    name_ar: 'نظام القابض',
    name_en: 'Clutch System',
    icon: 'Radio',
    description_ar: 'مضخات الكلتش العلوية والسفلية وشوك ودواسات الدبرياج',
    description_en: 'Clutch master and slave cylinders, release forks and hydraulic actuation lines',
    subcategories: [
      {
        id: 'sub-clutch-hydraulics',
        slug: 'clutch-hydraulics',
        name_ar: 'هيدروليك الكلتش والمضخات',
        name_en: 'Clutch Hydraulic Actuation',
        description_ar: 'طرمبات الكلتش العلوية والسفلية',
        description_en: 'Master and slave cylinders',
        part_types: [
          {
            id: 'pt-clutch-master-cylinder',
            slug: 'clutch-master-cylinder',
            name_ar: 'طرمبة كلتش علوية (ماستر الكلتش)',
            name_en: 'Clutch Master Cylinder',
            description_ar: 'أسطوانة هيدروليكية متصلة بدواسة الكلتش لتوليد ضغط تحرير القابض',
            description_en: 'Hydraulic cylinder actuated by clutch pedal',
            aliases_ar: ['ماستر دبرياج علوي', 'طرمبة كلتش فوق', 'سلندر كلتش رئيسي'],
            aliases_en: ['Primary Clutch Cylinder'],
            search_keywords: ['طرمبة كلتش', 'ماستر كلتش', 'clutch master'],
          },
          {
            id: 'pt-clutch-slave-cylinder',
            slug: 'clutch-slave-cylinder',
            name_ar: 'طرمبة كلتش سفلية (سلندر الكلتش المنفذ)',
            name_en: 'Clutch Slave Cylinder / Release Bearing',
            description_ar: 'أسطوانة دفع شوكة الكلتش أو المحمل الهيدروليكي المدمج CSC',
            description_en: 'Concentric slave cylinder engaging clutch release mechanism',
            aliases_ar: ['طرمبة كلتش تحت', 'سلندر دبرياج سفلي', 'فحمة كلتش هيدروليك'],
            aliases_en: ['Concentric Slave Cylinder (CSC)', 'Secondary Clutch Cylinder'],
            search_keywords: ['طرمبة كلتش سفلية', 'clutch slave'],
          },
        ],
      },
    ],
  },

  // 24. نظام بدء التشغيل (Starting System)
  {
    id: 'cat-starting-system',
    slug: 'starting-system',
    name_ar: 'نظام بدء التشغيل',
    name_en: 'Starting System',
    icon: 'PlayCircle',
    description_ar: 'محركات المارش والسلف ودقاقات البدء وتروس البندكس',
    description_en: 'Starter motors, starter solenoids, bendix drives and ignition switches',
    subcategories: [
      {
        id: 'sub-starter-motors',
        slug: 'starter-motors',
        name_ar: 'محركات السلف والمارش',
        name_en: 'Starter Motors & Drives',
        description_ar: 'السلف ودقاق المارش',
        description_en: 'Starter motors and solenoid switches',
        part_types: [
          {
            id: 'pt-starter-motor',
            slug: 'starter-motor',
            name_ar: 'محرك بدء التشغيل (السلف / المارش)',
            name_en: 'Engine Starter Motor Assembly',
            description_ar: 'محرك كهربائي ذو عزم فائق لتدوير حذاف المحرك عند بدء تشغيل السيارة',
            description_en: 'High torque 12V motor cranking the engine flywheel',
            aliases_ar: ['سلف مكينة', 'مارش سيارة', 'موتور ستارت', 'سلف تشغيل'],
            aliases_en: ['Cranking Motor', '12V Starter'],
            search_keywords: ['سلف', 'مارش', 'starter motor'],
          },
          {
            id: 'pt-starter-solenoid',
            slug: 'starter-solenoid',
            name_ar: 'أوتوماتيك ودقاق السلف (مرحل المارش)',
            name_en: 'Starter Solenoid Switch',
            description_ar: 'مفتاح كهرومغناطيسي يدفع ترس البندكس ويوصل تيار البطارية لمحرك السلف',
            description_en: 'Electromagnetic relay engaging pinion gear and bridging high current',
            aliases_ar: ['دقاق سلف', 'اتوماتيك مارش', 'سولينويد سلف'],
            aliases_en: ['Starter Relay Solenoid', 'Engaging Switch'],
            search_keywords: ['دقاق سلف', 'اتوماتيك سلف', 'starter solenoid'],
          },
        ],
      },
    ],
  },

  // 25. نظام الشحن وتوليد الطاقة (Charging System)
  {
    id: 'cat-charging-system',
    slug: 'charging-system',
    name_ar: 'نظام الشحن',
    name_en: 'Charging System',
    icon: 'Battery',
    description_ar: 'مولدات الدينمو ومنظمات الفولتية وبكرات الشحن لتعويض شحن البطارية',
    description_en: 'Alternators, voltage regulators, decoupled pulleys and rectifier bridges',
    subcategories: [
      {
        id: 'sub-alternator-units',
        slug: 'alternator-units',
        name_ar: 'مولدات الدينمو ومنظماتها',
        name_en: 'Alternators & Regulators',
        description_ar: 'الدينمو ومنظم الجهد',
        description_en: 'Alternators and solid state voltage regulators',
        part_types: [
          {
            id: 'pt-alternator',
            slug: 'alternator',
            name_ar: 'مولد التيار المتردد (الدينمو / مولد الشحن)',
            name_en: 'Engine Alternator Assembly',
            description_ar: 'مولد كهربائي يولد تيار شحن البطارية وتغذية أجهزة السيارة أثناء دوران المحرك',
            description_en: 'AC electrical generator driven by accessory belt with built-in rectifier',
            aliases_ar: ['دينمو شحن', 'دينمو كهرباء', 'مولد سيارة', 'دينامو'],
            aliases_en: ['AC Generator', '12V Alternator', 'Charging Generator'],
            search_keywords: ['دينمو', 'دينامو', 'alternator'],
          },
          {
            id: 'pt-voltage-regulator',
            slug: 'voltage-regulator',
            name_ar: 'منظم جهد الدينمو (كتاوت الدينمو)',
            name_en: 'Alternator Voltage Regulator',
            description_ar: 'دائرة إلكترونية تضبط خرج فولتية الدينمو بين 13.8 و 14.4 فولت لحماية البطارية',
            description_en: 'Solid state controller maintaining stable charging voltage',
            aliases_ar: ['كتاوت شحن', 'منظم دينمو', 'ريجوليتر دينامو'],
            aliases_en: ['Internal Voltage Regulator', 'Alternator IC Regulator'],
            search_keywords: ['كتاوت دينمو', 'منظم جهد', 'voltage regulator'],
          },
        ],
      },
    ],
  },

  // 26. أنظمة السلامة (Safety Systems)
  {
    id: 'cat-safety-systems',
    slug: 'safety-systems',
    name_ar: 'أنظمة السلامة',
    name_en: 'Safety Systems',
    icon: 'Shield',
    description_ar: 'الوسائد الهوائية (الإيرباق) وأحزمة الأمان ومشدات الحزام وحساسات التصادم',
    description_en: 'Airbags, pretensioners, seatbelts, collision sensors and supplemental restraint modules',
    subcategories: [
      {
        id: 'sub-airbag-components',
        slug: 'airbag-components',
        name_ar: 'الوسائد الهوائية وأحزمة الأمان',
        name_en: 'Airbag Modules & Restraints',
        description_ar: 'وسائد الإيرباق وأشرطة التوجيه',
        description_en: 'SRS airbags, spiral clock springs and safety belts',
        part_types: [
          {
            id: 'pt-clock-spring',
            slug: 'clock-spring',
            name_ar: 'شريحة بوري وطارة الإيرباق (كلوك سبرنج)',
            name_en: 'Airbag Clock Spring / Spiral Cable',
            description_ar: 'شريط كابل حلزوني ينقل الإشارات الكهربائية للإيرباق والبوري وأزرار الطارة أثناء الدوران',
            description_en: 'Rotary electrical connector preserving wiring connection to steering wheel',
            aliases_ar: ['شريحة دركسون', 'كابل حلزوني', 'شريحة ايرباق', 'ساعة طارة'],
            aliases_en: ['Spiral Cable Assembly', 'Steering Clockspring'],
            search_keywords: ['شريحة بوري', 'شريحة دركسون', 'clock spring'],
          },
          {
            id: 'pt-airbag-module',
            slug: 'airbag-module',
            name_ar: 'كمبيوتر ووحدة تحكم الوسائد الهوائية (SRS Module)',
            name_en: 'Airbag SRS Control Module',
            description_ar: 'وحدة التحكم الإلكترونية المشرفة على تفعيل الوسائد الهوائية عند رصد صدمة',
            description_en: 'Supplemental Restraint System electronic ECU deploying airbags',
            aliases_ar: ['كمبيوتر ايرباق', 'عقل الوسائد الهوائية', 'كنترول SRS'],
            aliases_en: ['SRS ECU', 'Airbag Sensor Computer'],
            search_keywords: ['كمبيوتر ايرباق', 'srs module'],
          },
        ],
      },
    ],
  },

  // 27. أنظمة مساعدة السائق (ADAS / Driver Assistance)
  {
    id: 'cat-adas',
    slug: 'adas-driver-assistance',
    name_ar: 'أنظمة مساعدة السائق',
    name_en: 'ADAS / Driver Assistance',
    icon: 'Eye',
    description_ar: 'حساسات وكاميرات ورادارات الاصطفاف ومراقبة المسار والنقاط العمياء',
    description_en: 'Parking sensors, surround cameras, collision radars, lane assist and blind spot units',
    subcategories: [
      {
        id: 'sub-parking-camera-radar',
        slug: 'parking-camera-radar',
        name_ar: 'حساسات وكاميرات مساعدة السائق',
        name_en: 'Sensors, Cameras & Radars',
        description_ar: 'حساسات الصدام وكاميرات الرجوع',
        description_en: 'Ultrasonic sensors, radar transceivers and parking cameras',
        part_types: [
          {
            id: 'pt-parking-sensor',
            slug: 'parking-sensor',
            name_ar: 'حساس اصطفاف بالصدام (حساس ريوس / باركنج)',
            name_en: 'PDC Parking Distance Control Sensor',
            description_ar: 'مستشعر فوق صوتي يرصد العوائق القريبة من الصدام الأمامي أو الخلفي',
            description_en: 'Ultrasonic distance measuring sensor fitted into bumper',
            aliases_ar: ['حساس ريوس', 'حبة حساس صدام', 'سنسر باركنج', 'حساس خلفي'],
            aliases_en: ['Ultrasonic PDC Sensor', 'Reverse Parking Sensor'],
            search_keywords: ['حساس ريوس', 'حساس باركنج', 'parking sensor', 'pdc'],
          },
          {
            id: 'pt-reverse-camera',
            slug: 'reverse-camera',
            name_ar: 'كاميرا الرجوع للخلف (كاميرا ريوس)',
            name_en: 'Rearview Backup Parking Camera',
            description_ar: 'كاميرا عريضة الزاوية مثبتة بالشنطة لعرض الرؤية الخلفية على شاشة السيارة',
            description_en: 'Wide angle tailgate camera assisting reverse maneuvering',
            aliases_ar: ['كاميرا خلفية', 'كاميرا ريوس', 'كاميرا شنطة'],
            aliases_en: ['Reverse Camera', 'Rear View Camera Assembly'],
            search_keywords: ['كاميرا خلفية', 'كاميرا ريوس', 'rear camera'],
          },
        ],
      },
    ],
  },

  // 28. الحساسات وأجهزة الاستشعار (Sensors)
  {
    id: 'cat-sensors',
    slug: 'sensors',
    name_ar: 'الحساسات',
    name_en: 'Sensors',
    icon: 'Radio',
    description_ar: 'حساسات الكرنك والتيمن والحرارة والضغط وسرعة المركبة وتدفق الهواء',
    description_en: 'Powertrain, chassis, speed, temperature, pressure and position sensors',
    subcategories: [
      {
        id: 'sub-engine-sensors',
        slug: 'engine-sensors',
        name_ar: 'حساسات المحرك وإدارة الوقود',
        name_en: 'Engine Management Sensors',
        description_ar: 'حساسات عمود الكرنك والكامات والهواء',
        description_en: 'Crank, cam, MAF, MAP, knock and coolant temperature sensors',
        part_types: [
          {
            id: 'pt-crankshaft-position-sensor',
            slug: 'crankshaft-position-sensor',
            name_ar: 'حساس الكرنك (حساس موقع العمود المرفقي)',
            name_en: 'Crankshaft Position Sensor (CKP)',
            description_ar: 'مستشعر يحدد زاوية وسرعة دوران الكرنك لتحديد توقيت حقن الوقود والشرارة',
            description_en: 'Engine speed sensor relaying crankshaft rotational position to ECU',
            aliases_ar: ['حساس كرنك', 'سنسر كرنك', 'حساس دورات المحرك RPM'],
            aliases_en: ['Crank Sensor', 'CKP Sensor', 'Engine Speed Sensor'],
            search_keywords: ['حساس كرنك', 'crank sensor', 'crankshaft position'],
          },
          {
            id: 'pt-camshaft-position-sensor',
            slug: 'camshaft-position-sensor',
            name_ar: 'حساس التيمن (حساس عمود الكامات)',
            name_en: 'Camshaft Position Sensor (CMP)',
            description_ar: 'مستشعر يحدد موضع عمود الكامات لتحديد الأسطوانة في شوط الضغط',
            description_en: 'Sensor tracking camshaft position for sequential fuel injection',
            aliases_ar: ['حساس كامات', 'حساس تيمن', 'سنسر كامات'],
            aliases_en: ['Cam Sensor', 'CMP Sensor'],
            search_keywords: ['حساس كامات', 'حساس تيمن', 'camshaft sensor'],
          },
          {
            id: 'pt-mass-air-flow-sensor',
            slug: 'mass-air-flow-sensor',
            name_ar: 'حساس الهواء MAF (حساس تدفق الهواء)',
            name_en: 'Mass Air Flow Sensor (MAF)',
            description_ar: 'مستشعر يقيس كمية وكتلة الهواء الداخل للمحرك لحساب كمية البنزين اللازمة',
            description_en: 'Hot-wire sensor measuring mass of intake air entering engine',
            aliases_ar: ['سنسر هواء', 'حساس ماف', 'حساس قربة الهواء'],
            aliases_en: ['MAF Sensor', 'Air Flow Meter'],
            search_keywords: ['حساس هواء', 'ماف', 'maf sensor'],
          },
          {
            id: 'pt-coolant-temp-sensor',
            slug: 'coolant-temp-sensor',
            name_ar: 'حساس حرارة ماء المحرك (حساس الرديتر)',
            name_en: 'Engine Coolant Temperature Sensor (ECT)',
            description_ar: 'مستشعر حراري يقيس درجة حرارة ماء المحرك لتشغيل المراوح وضبط الاحتراق',
            description_en: 'Thermistor providing coolant temperature data to ECU and cluster',
            aliases_ar: ['حساس حرارة', 'صباح حرارة', 'سنسر حرارة ماء'],
            aliases_en: ['ECT Sensor', 'Temperature Sender Unit'],
            search_keywords: ['حساس حرارة', 'سنسر حرارة', 'temperature sensor'],
          },
        ],
      },
    ],
  },

  // 29. الإلكترونيات ووحدات التحكم (Electronics & Control Modules)
  {
    id: 'cat-electronics',
    slug: 'electronics-control-modules',
    name_ar: 'الإلكترونيات ووحدات التحكم',
    name_en: 'Electronics & Control Modules',
    icon: 'Cpu',
    description_ar: 'كمبيوترات المحرك والجير والبودي ووحدات التحكم المركزية',
    description_en: 'Engine control units (ECU), transmission controllers (TCM) and body computers (BCM)',
    subcategories: [
      {
        id: 'sub-control-units',
        slug: 'control-units',
        name_ar: 'كمبيوترات المركبة',
        name_en: 'Control Units & ECUs',
        description_ar: 'كمبيوتر المحرك والقير',
        description_en: 'Engine and transmission management microcomputers',
        part_types: [
          {
            id: 'pt-engine-control-unit',
            slug: 'engine-control-unit',
            name_ar: 'كمبيوتر المحرك الرئيسي (عقل السيارة / ECU)',
            name_en: 'Engine Control Unit (ECU / ECM)',
            description_ar: 'العقل الإلكتروني المركزي المشرف على إدارة الاحتراق وحقن الوقود والإشعال',
            description_en: 'Main powertrain computer controlling ignition, injection and emissions',
            aliases_ar: ['عقل المكينة', 'كمبيوتر سيارة', 'كنترول محرك', 'اي سي يو'],
            aliases_en: ['Engine Computer', 'ECM Module', 'Powertrain Control Module (PCM)'],
            search_keywords: ['كمبيوتر مكينة', 'عقل سيارة', 'ecu', 'pcm'],
          },
          {
            id: 'pt-transmission-control-module',
            slug: 'transmission-control-module',
            name_ar: 'كمبيوتر القير الأوتوماتيكي (TCM)',
            name_en: 'Transmission Control Module (TCM)',
            description_ar: 'وحدة التحكم المسؤولة عن تبديلات السرعة وتوقيت تعشيق القير الأوتوماتيك',
            description_en: 'Electronic module operating transmission shift solenoids',
            aliases_ar: ['عقل القير', 'كمبيوتر جير', 'كنترول فتيس'],
            aliases_en: ['Transmission Computer', 'TCM Unit'],
            search_keywords: ['كمبيوتر قير', 'عقل قير', 'tcm'],
          },
        ],
      },
    ],
  },

  // 30. قطع الصيانة الدورية والاستهلاكيات (Service & Maintenance)
  {
    id: 'cat-service-maintenance',
    slug: 'service-maintenance',
    name_ar: 'قطع الصيانة الدورية',
    name_en: 'Service & Maintenance Parts',
    icon: 'CheckCircle',
    description_ar: 'السيور الخارجية وجلود البلوف وصوف الزيت وكلبسات التثبيت الاستهلاكية',
    description_en: 'Serpentine drive belts, valve stem seals, oil seals, gaskets, clips and service kits',
    subcategories: [
      {
        id: 'sub-belts-seals',
        slug: 'belts-seals',
        name_ar: 'السيور الخارجية وصوف الزيت',
        name_en: 'Drive Belts & Oil Seals',
        description_ar: 'سيور المكينة الخارجية وصوف منع تسريب الزيت',
        description_en: 'Accessory drive belts, tensioner pulleys and elastomeric shaft seals',
        part_types: [
          {
            id: 'pt-serpentine-drive-belt',
            slug: 'serpentine-drive-belt',
            name_ar: 'سير المحرك الخارجي (سير المكينة / الدينمو والمكيف)',
            name_en: 'Serpentine Accessory Drive Belt (Multi-Ribbed)',
            description_ar: 'سير مطاطي مجدول متعدد الأضلاع يدير الدينمو والكمبروسر وطرمبة الماء والباور',
            description_en: 'Multi-V ribbed belt driving alternator, water pump and AC compressor',
            aliases_ar: ['سير دينمو', 'سير مكينة خارجي', 'قايش دينمو', 'سير مروحة', 'سير مكيف'],
            aliases_en: ['Accessory Belt', 'Fan Belt', 'Poly-V Belt', 'Alternator Belt'],
            search_keywords: ['سير مكينة', 'سير دينمو', 'serpentine belt'],
          },
          {
            id: 'pt-crankshaft-oil-seal-front',
            slug: 'crankshaft-oil-seal-front',
            name_ar: 'صوفة كرنك أمامية (مانع تسريب زيت المحرك)',
            name_en: 'Front Crankshaft Oil Seal',
            description_ar: 'حلقة مطاطية محكمة تمنع خروج زيت المحرك من مقدمة عمود الكرنك',
            description_en: 'Rotary shaft lip seal preventing oil leakage past front crank snout',
            aliases_ar: ['صوفة صدر مكينة', 'أولسيه كرنك أمامي', 'صوفة زيت قدام'],
            aliases_en: ['Front Crank Seal', 'Timing Cover Oil Seal'],
            search_keywords: ['صوفة كرنك', 'صوفة صدر', 'oil seal'],
          },
          {
            id: 'pt-crankshaft-oil-seal-rear',
            slug: 'crankshaft-oil-seal-rear',
            name_ar: 'صوفة كرنك خلفية (صوفة المكينة الكبيرة)',
            name_en: 'Rear Crankshaft Main Oil Seal',
            description_ar: 'صوفة كبيرة بين المحرك والقير تمنع تسرب زيت المحرك على الكلتش أو القير',
            description_en: 'Large radial seal behind flywheel preventing rear crank oil leakage',
            aliases_ar: ['صوفة مكينة خلفية', 'أولسيه كرنك خلفي', 'صوفة جير ومكينة'],
            aliases_en: ['Rear Main Seal', 'Crankshaft Rear Oil Seal'],
            search_keywords: ['صوفة مكينة خلفية', 'صوفة كرنك خلفية', 'rear main seal'],
          },
        ],
      },
    ],
  },
];

// Function to generate the master database collections and JSON output
export function buildTaxonomyOutput() {
  const categoriesList: any[] = [];
  const partTypesList: any[] = [];
  const aliasesList: any[] = [];
  const keywordsList: any[] = [];

  let aliasCounter = 1;
  let keywordCounter = 1;

  TAXONOMY_DATA.forEach((cat, catIdx) => {
    // 1. Top level category
    const categoryRecord = {
      id: cat.id,
      parent_id: null,
      name_ar: cat.name_ar,
      name_en: cat.name_en,
      slug: cat.slug,
      icon: cat.icon,
      image: null,
      description_ar: cat.description_ar,
      description_en: cat.description_en,
      sort_order: catIdx + 1,
      is_active: true,
    };
    categoriesList.push(categoryRecord);

    cat.subcategories.forEach((sub, subIdx) => {
      // 2. Subcategory
      const subRecord = {
        id: sub.id,
        parent_id: cat.id,
        name_ar: sub.name_ar,
        name_en: sub.name_en,
        slug: sub.slug,
        icon: cat.icon,
        image: null,
        description_ar: sub.description_ar,
        description_en: sub.description_en,
        sort_order: subIdx + 1,
        is_active: true,
      };
      categoriesList.push(subRecord);

      sub.part_types.forEach(pt => {
        // 3. Part Type
        const ptRecord = {
          id: pt.id,
          category_id: sub.id,
          system_id: cat.id,
          name_ar: pt.name_ar,
          name_en: pt.name_en,
          slug: pt.slug,
          description_ar: pt.description_ar,
          description_en: pt.description_en,
          is_active: true,
        };
        partTypesList.push(ptRecord);

        // Aliases Arabic
        pt.aliases_ar.forEach(alias => {
          aliasesList.push({
            id: `alias-${aliasCounter++}`,
            part_type_id: pt.id,
            language: 'ar',
            alias,
            normalized_alias: normalizeArabic(alias),
          });
        });

        // Aliases English
        pt.aliases_en.forEach(alias => {
          aliasesList.push({
            id: `alias-${aliasCounter++}`,
            part_type_id: pt.id,
            language: 'en',
            alias,
            normalized_alias: normalizeEnglish(alias),
          });
        });

        // Keywords
        if (pt.search_keywords) {
          pt.search_keywords.forEach(kw => {
            const isAr = /[\u0600-\u06FF]/.test(kw);
            keywordsList.push({
              id: `kw-${keywordCounter++}`,
              part_type_id: pt.id,
              keyword: kw,
              language: isAr ? 'ar' : 'en',
            });
          });
        }
      });
    });
  });

  const canonicalOutput = {
    metadata: {
      title: 'ALA Auto Parts Master Automotive Parts Taxonomy',
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      standards_reference: 'TecDoc / Trodo / SAE J1930 / Regional Yemeni & Gulf Nomenclature',
      counts: {
        total_major_systems: TAXONOMY_DATA.length,
        total_subcategories: categoriesList.filter(c => c.parent_id !== null).length,
        total_part_types: partTypesList.length,
        total_aliases_ar: aliasesList.filter(a => a.language === 'ar').length,
        total_aliases_en: aliasesList.filter(a => a.language === 'en').length,
        total_search_keywords: keywordsList.length,
      },
    },
    hierarchy: TAXONOMY_DATA,
    flat_tables: {
      part_categories: categoriesList,
      part_types: partTypesList,
      part_aliases: aliasesList,
      part_search_keywords: keywordsList,
    },
  };

  return canonicalOutput;
}

// When run directly from CLI
const isDirectRun = process.argv[1] && process.argv[1].includes('generateTaxonomy');
if (isDirectRun) {
  const result = buildTaxonomyOutput();
  const targetDir = path.resolve(process.cwd(), 'docs', 'data');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const jsonPath = path.join(targetDir, 'automotive-parts-taxonomy.json');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`✅ Master taxonomy generated successfully: ${jsonPath}`);
  console.log(`Statistics:`, result.metadata.counts);
}
