/**
 * scripts/reorganizeSubcategories.ts
 *
 * Organizes the 30 major automotive systems into natural 2-4 subcategories each,
 * creating a deep, professional 3-level taxonomy hierarchy for ALA Auto Parts:
 * Main System -> Subcategory -> Part Type -> Aliases & Keywords
 */

import * as fs from 'fs';
import * as path from 'path';

const TAXONOMY_PATH = path.join(process.cwd(), 'docs', 'data', 'automotive-parts-taxonomy.json');
const root = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf8'));

interface PartType {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  aliases_ar: string[];
  aliases_en: string[];
  search_keywords: string[];
}

interface Subcategory {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  part_types: PartType[];
}

interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  icon: string;
  description_ar: string;
  description_en: string;
  subcategories: Subcategory[];
}

const categories: Category[] = root.hierarchy;

// Helper to pull all part types from a category
function getAllPartTypes(cat: Category): PartType[] {
  const list: PartType[] = [];
  const seen = new Set<string>();
  for (const sub of cat.subcategories) {
    for (const pt of sub.part_types) {
      if (!seen.has(pt.id)) {
        seen.add(pt.id);
        list.push(pt);
      }
    }
  }
  return list;
}

// 1. Steering System (cat-steering-system)
const catSteering = categories.find(c => c.id === 'cat-steering-system');
if (catSteering) {
  const all = getAllPartTypes(catSteering);
  catSteering.subcategories = [
    {
      id: 'sub-steering-racks-pumps',
      slug: 'steering-racks-pumps',
      name_ar: 'علب ومضخات التوجيه الهيدروليكية والكهربائية',
      name_en: 'Steering Racks, Power Pumps & EPS',
      description_ar: 'دودة الدركسون وطلمبات الهيدروليك وأعمدة ومحركات التوجيه الكهربائي',
      description_en: 'Steering racks, power steering pumps and electric power steering columns',
      part_types: all.filter(p => p.id.includes('rack') || p.id.includes('pump') || p.id.includes('eps') || p.id.includes('column') || p.id.includes('electric-power'))
    },
    {
      id: 'sub-steering-linkages-boots',
      slug: 'steering-linkages-boots',
      name_ar: 'أذرع ونهايات التوجيه والمفاصل والجلد',
      name_en: 'Tie Rods, Knuckles, Boots & Couplers',
      description_ar: 'نهايات أذرع التوجيه الداخلية والخارجية والشمعدان وجلد الدودة وصلبان التوجيه',
      description_en: 'Inner/outer tie rods, steering knuckles, rack gaiters and universal steering couplers',
      part_types: all.filter(p => !p.id.includes('rack') && !p.id.includes('pump') && !p.id.includes('eps') && !p.id.includes('column') && !p.id.includes('electric-power'))
    }
  ];
}

// 2. Windscreen & Wiper System (cat-windscreen-wiper-system)
const catWiper = categories.find(c => c.id === 'cat-windscreen-wiper-system');
if (catWiper) {
  const all = getAllPartTypes(catWiper);
  catWiper.subcategories = [
    {
      id: 'sub-wiper-blades-arms',
      slug: 'wiper-blades-arms',
      name_ar: 'شفرات ومساحات وأذرع الزجاج',
      name_en: 'Wiper Blades, Arms & Linkages',
      description_ar: 'شفرات مساحات الزجاج الأمامية والخلفية وأذرع وماكينات التحريك',
      description_en: 'Windshield wiper blades, arms and mechanical linkages',
      part_types: all.filter(p => p.id.includes('blade') || p.id.includes('arm'))
    },
    {
      id: 'sub-wiper-motors-washers',
      slug: 'wiper-motors-washers',
      name_ar: 'دينمو ومضخات وخزانات غسيل الزجاج',
      name_en: 'Wiper Motors, Washer Pumps & Reservoirs',
      description_ar: 'محرك دينمو المساحات وطلمبات رش الماء وقرب وخزانات مياه الغسيل',
      description_en: 'Wiper electric motors, washer fluid pumps and fluid reservoirs',
      part_types: all.filter(p => !p.id.includes('blade') && !p.id.includes('arm'))
    }
  ];
}

// 3. Fuel System (cat-fuel-system)
const catFuel = categories.find(c => c.id === 'cat-fuel-system');
if (catFuel) {
  const all = getAllPartTypes(catFuel);
  catFuel.subcategories = [
    {
      id: 'sub-fuel-pumps-tanks',
      slug: 'fuel-pumps-tanks',
      name_ar: 'مضخات وخزانات وعوامات الوقود',
      name_en: 'Fuel Pumps, Tanks & Level Senders',
      description_ar: 'طرمبات البنزين الغاطسة وطلمبات الضغط العالي وخزانات الوقود وعوامات القياس',
      description_en: 'In-tank fuel pumps, high-pressure GDI pumps, fuel tanks and level senders',
      part_types: all.filter(p => p.id.includes('pump') || p.id.includes('tank') || p.id.includes('level') || p.id.includes('cap') || p.id.includes('line'))
    },
    {
      id: 'sub-fuel-injection-metering',
      slug: 'fuel-injection-metering',
      name_ar: 'بخاخات ومساطر الوقود وبوابات الخانق',
      name_en: 'Fuel Injectors, Fuel Rails & Throttle Bodies',
      description_ar: 'بخاخات البنزين والديزل ومساطر التوزيع ومنظمات ضغط الوقود وبوابات الثروتل',
      description_en: 'Electronic fuel injectors, fuel distribution rails and electronic throttle bodies',
      part_types: all.filter(p => !p.id.includes('pump') && !p.id.includes('tank') && !p.id.includes('level') && !p.id.includes('cap') && !p.id.includes('line'))
    }
  ];
}

// 4. Exhaust System (cat-exhaust-system)
const catExhaust = categories.find(c => c.id === 'cat-exhaust-system');
if (catExhaust) {
  const all = getAllPartTypes(catExhaust);
  catExhaust.subcategories = [
    {
      id: 'sub-mufflers-pipes',
      slug: 'mufflers-pipes',
      name_ar: 'الشكمانات وكواتم الصوت ومواسير العادم',
      name_en: 'Mufflers, Exhaust Pipes & Flex Pipes',
      description_ar: 'دبات الشكمان الخلفية والوسطية والرنان ومواسير العادم المرنة وحمالات التثبيت',
      description_en: 'Exhaust silencers, center resonators, flexible downpipes and mounting hangers',
      part_types: all.filter(p => p.id.includes('muffler') || p.id.includes('pipe') || p.id.includes('gasket') || p.id.includes('hanger'))
    },
    {
      id: 'sub-emission-catalysts',
      slug: 'emission-catalysts',
      name_ar: 'أنظمة الانبعاثات ودبات التلوث وفلاتر الديزل والحساسات',
      name_en: 'Catalytic Converters, DPF & Oxygen Sensors',
      description_ar: 'دبات الرصاص ومحولات العادم وفلاتر جزيئات الديزل DPF وحساسات الأكسجين والشكمان',
      description_en: 'Catalytic converters, diesel particulate filters and lambda oxygen sensors',
      part_types: all.filter(p => !p.id.includes('muffler') && !p.id.includes('pipe') && !p.id.includes('gasket') && !p.id.includes('hanger'))
    }
  ];
}

// 5. Engine Cooling (cat-engine-cooling-system)
const catCooling = categories.find(c => c.id === 'cat-engine-cooling-system');
if (catCooling) {
  const all = getAllPartTypes(catCooling);
  catCooling.subcategories = [
    {
      id: 'sub-radiators-fans-coolers',
      slug: 'radiators-fans-coolers',
      name_ar: 'المبردات والرديترات والمراوح ومبردات الزيت',
      name_en: 'Radiators, Cooling Fans & Oil Coolers',
      description_ar: 'رديتر الماء ومراوح التبريد والإنتركولر ومبردات زيت المحرك والقير',
      description_en: 'Engine radiators, electric cooling fans, intercoolers and oil coolers',
      part_types: all.filter(p => p.id.includes('radiator') || p.id.includes('fan') || p.id.includes('cooler') || p.id.includes('intercooler'))
    },
    {
      id: 'sub-water-pumps-thermostats',
      slug: 'water-pumps-thermostats',
      name_ar: 'مضخات الماء وبلف الحرارة والخراطيم والقرب',
      name_en: 'Water Pumps, Thermostats, Hoses & Tanks',
      description_ar: 'طرمبات ماء التبريد وكوع وبلف الحرارة وخراطيم الرديتر وقرب الماء الاحتياطية',
      description_en: 'Engine water pumps, thermostats, coolant hoses and expansion tanks',
      part_types: all.filter(p => !p.id.includes('radiator') && !p.id.includes('fan') && !p.id.includes('cooler') && !p.id.includes('intercooler'))
    }
  ];
}

// 6. Lighting (cat-lighting)
const catLighting = categories.find(c => c.id === 'cat-lighting');
if (catLighting) {
  const all = getAllPartTypes(catLighting);
  catLighting.subcategories = [
    {
      id: 'sub-headlights-taillights',
      slug: 'headlights-taillights',
      name_ar: 'الشمعات الأمامية والأسطبات الخلفية وكشافات الضباب',
      name_en: 'Headlights, Taillights & Fog Lights',
      description_ar: 'مجموعات الشمعات الأمامية وأسطبات الإنارة الخلفية وفوانيس الضباب وإشارات الرفرف',
      description_en: 'Complete headlight units, rear tail lamp clusters and fog lamps',
      part_types: all.filter(p => p.id.includes('headlight') || p.id.includes('tail') || p.id.includes('fog') || p.id.includes('signal'))
    },
    {
      id: 'sub-bulbs-ballasts-modules',
      slug: 'bulbs-ballasts-modules',
      name_ar: 'اللمبات ومحولات الزينون ووحدات إضاءة LED',
      name_en: 'Bulbs, Xenon Ballasts & LED Modules',
      description_ar: 'لمبات الهالوجين والزينون والـ LED وأجهزة تشغيل الزينون ومحولات الإضاءة',
      description_en: 'Halogen, Xenon HID and LED replacement bulbs, ballasts and control units',
      part_types: all.filter(p => !p.id.includes('headlight') && !p.id.includes('tail') && !p.id.includes('fog') && !p.id.includes('signal'))
    }
  ];
}

// 7. Oils & Fluids (cat-oils-fluids)
const catOils = categories.find(c => c.id === 'cat-oils-fluids');
if (catOils) {
  const all = getAllPartTypes(catOils);
  catOils.subcategories = [
    {
      id: 'sub-engine-transmission-oils',
      slug: 'engine-transmission-oils',
      name_ar: 'زيوت المحركات ونواقل الحركة والدفرنس',
      name_en: 'Engine, Transmission & Gear Oils',
      description_ar: 'زيوت المحرك التخليقية وزيوت القير الأوتوماتيكي والعادي وزيوت التروس والدفرنس',
      description_en: 'Synthetic engine lubricants, automatic transmission fluids and hypoid gear oils',
      part_types: all.filter(p => p.id.includes('engine-oil') || p.id.includes('transmission-fluid') || p.id.includes('differential-gear-oil') || p.id.includes('gear-oil'))
    },
    {
      id: 'sub-hydraulic-brake-coolant-fluids',
      slug: 'hydraulic-brake-coolant-fluids',
      name_ar: 'سوائل الفرامل والدركسون ومياه التبريد ومحلول AdBlue',
      name_en: 'Brake Fluids, Power Steering, Coolants & AdBlue',
      description_ar: 'سائل الفرامل DOT4 وزيت الدركسون المعزز وماء الرديتر المركز ومحلول معالجة عادم الديزل',
      description_en: 'DOT brake fluids, hydraulic steering oils, concentrated coolants and DEF urea solutions',
      part_types: all.filter(p => !p.id.includes('engine-oil') && !p.id.includes('transmission-fluid') && !p.id.includes('differential-gear-oil') && !p.id.includes('gear-oil'))
    }
  ];
}

// 8. Tyres & Wheels (cat-tyres-wheels)
const catWheels = categories.find(c => c.id === 'cat-tyres-wheels');
if (catWheels) {
  const all = getAllPartTypes(catWheels);
  catWheels.subcategories = [
    {
      id: 'sub-tyres-and-rims',
      slug: 'tyres-and-rims',
      name_ar: 'الكفرات والإطارات والجنوط والرنجات',
      name_en: 'Tyres, Alloy Rims & Steel Wheels',
      description_ar: 'إطارات الركاب والدفع الرباعي وجنوط الألمنيوم والجنوط الفولاذية والسبير',
      description_en: 'Passenger and SUV tyres, forged alloy wheels and steel rims',
      part_types: all.filter(p => p.id.includes('passenger-car-tire') || p.id.includes('alloy') || p.id.includes('steel') || p.id.includes('tyre'))
    },
    {
      id: 'sub-wheel-hardware-tpms',
      slug: 'wheel-hardware-tpms',
      name_ar: 'حساسات ضغط الإطارات وصواميل ومباعدات العجلات',
      name_en: 'TPMS Sensors, Lug Hardware & Wheel Spacers',
      description_ar: 'حساسات TPMS وبلوف الهواء وصواميل ومسامير العجلات وتباريز توسيع المسار',
      description_en: 'Tire pressure monitoring sensors, lug nuts, wheel studs and hubcentric spacers',
      part_types: all.filter(p => !p.id.includes('passenger-car-tire') && !p.id.includes('alloy') && !p.id.includes('steel') && !p.id.includes('tyre'))
    }
  ];
}

// 9. Drivetrain & Suspension Joint Category (cat-drivetrain-suspension)
const catJoint = categories.find(c => c.id === 'cat-drivetrain-suspension');
if (catJoint) {
  const all = getAllPartTypes(catJoint);
  catJoint.subcategories = [
    {
      id: 'sub-axle-shafts-cv-joints',
      slug: 'axle-shafts-cv-joints',
      name_ar: 'العكوس ورؤوس العكوس وأعمدة الدوران',
      name_en: 'CV Axles, Driveshafts & Universal Joints',
      description_ar: 'العكوس الكاملة ورؤوس العكوس الداخلية والخارجية وأعمدة الكردان وجلد العكوس',
      description_en: 'Constant velocity drive axles, outer/inner CV joints, prop shafts and boots',
      part_types: all.filter(p => p.id.includes('cv') || p.id.includes('drive-shaft') || p.id.includes('driveshaft') || p.id.includes('propeller'))
    },
    {
      id: 'sub-wheel-bearings-hubs',
      slug: 'wheel-bearings-hubs',
      name_ar: 'محامل وسرر وفلنجات العجلات ومساميرها',
      name_en: 'Wheel Bearings, Hub Assemblies & Hardware',
      description_ar: 'رمان بلي العجلات وصرر وفلنجات العجلات الكاملة ومسامير التثبيت',
      description_en: 'Wheel bearing hub assemblies, wheel flanges and mounting hardware',
      part_types: all.filter(p => !p.id.includes('cv') && !p.id.includes('drive-shaft') && !p.id.includes('driveshaft') && !p.id.includes('propeller'))
    }
  ];
}

// 10. Safety Systems (cat-safety-systems)
const catSafety = categories.find(c => c.id === 'cat-safety-systems');
if (catSafety) {
  const all = getAllPartTypes(catSafety);
  catSafety.subcategories = [
    {
      id: 'sub-airbags-modules',
      slug: 'airbags-modules',
      name_ar: 'الوسائد الهوائية ووحدات التحكم المركزية SRS',
      name_en: 'Airbag Cushions & SRS Control Modules',
      description_ar: 'وسائد الأمان الهوائية للسائق والمعاون والستائر ووحدة التحكم المركزية بالوسائد',
      description_en: 'Driver, passenger, curtain airbag units and main SRS airbag diagnostic computers',
      part_types: all.filter(p => p.id.includes('airbag-module') || p.id.includes('control') || p.id.includes('srs'))
    },
    {
      id: 'sub-seatbelts-crash-sensors',
      slug: 'seatbelts-crash-sensors',
      name_ar: 'أحزمة الأمان وحساسات الاصطدام والشاصيه',
      name_en: 'Seatbelts, Pretensioners & Impact Sensors',
      description_ar: 'أحزمة الأمان مع آليات الشد المسبق النارية وحساسات الصدمات الأمامية والجانبية',
      description_en: 'Seatbelt pretensioner reels, buckles and perimeter chassis deceleration crash sensors',
      part_types: all.filter(p => !p.id.includes('airbag-module') && !p.id.includes('control') && !p.id.includes('srs'))
    }
  ];
}

// 11. ADAS (cat-adas-driver-assistance)
const catAdas = categories.find(c => c.id === 'cat-adas-driver-assistance');
if (catAdas) {
  const all = getAllPartTypes(catAdas);
  catAdas.subcategories = [
    {
      id: 'sub-parking-assist-cameras',
      slug: 'parking-assist-cameras',
      name_ar: 'حساسات الركن وكاميرات الرؤية المحيطية 360',
      name_en: 'Ultrasonic Park Assist & Surround Cameras',
      description_ar: 'حساسات الاصطفاف بالموجات فوق الصوتية وكاميرات الرجوع للخلف والرؤية المحيطية',
      description_en: 'Ultrasonic parking distance sensors and 360-degree reverse backup camera modules',
      part_types: all.filter(p => p.id.includes('parking') || p.id.includes('camera') || p.id.includes('reverse'))
    },
    {
      id: 'sub-radars-lane-assist',
      slug: 'radars-lane-assist',
      name_ar: 'رادارات النقطة العمياء ومثبت السرعة وكاميرات المسار',
      name_en: 'Radars, Blind Spot & Lane Keeping Assist',
      description_ar: 'رادارات النقطة العمياء ورادار التحذير من التصادم الأمامي وكاميرات مراقبة خطوط السير',
      description_en: 'Blind spot detection microwave sensors, forward collision radar modules and windshield cameras',
      part_types: all.filter(p => !p.id.includes('parking') && !p.id.includes('camera') && !p.id.includes('reverse'))
    }
  ];
}

// 12. Tools (cat-tools-equipment)
const catTools = categories.find(c => c.id === 'cat-tools-equipment');
if (catTools) {
  const all = getAllPartTypes(catTools);
  catTools.subcategories = [
    {
      id: 'sub-diagnostic-scanners',
      slug: 'diagnostic-scanners',
      name_ar: 'أجهزة فحص وتشخيص أعطال السيارات OBD-II',
      name_en: 'Automotive OBD-II Diagnostic Scanners',
      description_ar: 'أجهزة الكشف وقراءة ومسح أكواد الأعطال للمحرك والقير والأنظمة الإلكترونية',
      description_en: 'Handheld code readers, tablet diagnostic systems and ECU programming tools',
      part_types: all.filter(p => p.id.includes('obd') || p.id.includes('scanner') || p.id.includes('diagnostic'))
    },
    {
      id: 'sub-lifting-workshop-tools',
      slug: 'lifting-workshop-tools',
      name_ar: 'معدات الرفع وروافع السيارات ومفاتيح الصيانة',
      name_en: 'Lifting Jacks, Wrenches & Specialty Tools',
      description_ar: 'العفاريت الهيدروليكية وحوامل الأمان ومفاتيح فك الفلاتر ومضخات تفريغ الهواء',
      description_en: 'Hydraulic floor jacks, jack stands, oil filter wrenches and brake service bleeders',
      part_types: all.filter(p => !p.id.includes('obd') && !p.id.includes('scanner') && !p.id.includes('diagnostic'))
    }
  ];
}

// 13. Accessories (cat-accessories-equipment)
const catAccess = categories.find(c => c.id === 'cat-accessories-equipment');
if (catAccess) {
  const all = getAllPartTypes(catAccess);
  catAccess.subcategories = [
    {
      id: 'sub-interior-comfort-protection',
      slug: 'interior-comfort-protection',
      name_ar: 'إكسسوارات المقصورة والدواسات والمقاعد والستائر',
      name_en: 'Interior Comfort, Floor Mats & Seat Covers',
      description_ar: 'دعاسات الأرضية المطاطية وتلبيسات المقاعد وعوازل الشمس للنوافذ وحوامل الهواتف',
      description_en: 'All-weather floor mats, protective seat covers, sunshades and smartphone car mounts',
      part_types: all
    }
  ];
}

// Recalculate metrics
let totalMajorSystems = categories.length;
let totalSubcategories = 0;
let totalPartTypes = 0;
let totalAliasesAr = 0;
let totalAliasesEn = 0;
let totalSearchKeywords = 0;

for (const cat of categories) {
  totalSubcategories += cat.subcategories.length;
  for (const sub of cat.subcategories) {
    totalPartTypes += sub.part_types.length;
    for (const pt of sub.part_types) {
      totalAliasesAr += (pt.aliases_ar || []).length;
      totalAliasesEn += (pt.aliases_en || []).length;
      totalSearchKeywords += (pt.search_keywords || []).length;
    }
  }
}

const finalOutput = {
  metadata: {
    title: 'ALA Auto Parts Master Automotive Parts Taxonomy',
    version: '2.5.0',
    generated_at: new Date().toISOString(),
    standards_reference: 'TecDoc / Trodo / SAE J1930 / Regional Yemeni & Gulf Nomenclature',
    counts: {
      total_major_systems: totalMajorSystems,
      total_subcategories: totalSubcategories,
      total_part_types: totalPartTypes,
      total_aliases_ar: totalAliasesAr,
      total_aliases_en: totalAliasesEn,
      total_search_keywords: totalSearchKeywords
    }
  },
  hierarchy: categories
};

fs.writeFileSync(TAXONOMY_PATH, JSON.stringify(finalOutput, null, 2), 'utf8');

console.log('🌟 Taxonomy Reorganization Completed Successfully!');
console.log('New Master Statistics:', finalOutput.metadata.counts);
