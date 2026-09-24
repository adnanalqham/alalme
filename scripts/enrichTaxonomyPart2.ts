/**
 * scripts/enrichTaxonomyPart2.ts
 *
 * Part 2 of the taxonomy enrichment for ALA Auto Parts.
 * Adds deep subcategories and parts for:
 * - HVAC & Air Conditioning
 * - Batteries, Starting & Charging
 * - Safety & ADAS
 * - Tyres & Wheels
 * - Drivetrain & Axles
 * - Clutch System
 * - Electronics & Control Modules
 * - Accessories, Tools & Service Maintenance
 */

import * as fs from 'fs';
import * as path from 'path';

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

const TAXONOMY_PATH = path.join(process.cwd(), 'docs', 'data', 'automotive-parts-taxonomy.json');
const root = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf8'));
const categories: Category[] = root.hierarchy;

function findCategory(idOrSlug: string): Category | undefined {
  return categories.find(c => c.id === idOrSlug || c.slug === idOrSlug);
}

function ensureSubcategory(cat: Category, sub: { id: string; slug: string; name_ar: string; name_en: string; description_ar: string; description_en: string }): Subcategory {
  let existing = cat.subcategories.find(s => s.id === sub.id || s.slug === sub.slug);
  if (!existing) {
    existing = { ...sub, part_types: [] };
    cat.subcategories.push(existing);
  }
  return existing;
}

function addPartTypes(sub: Subcategory, items: PartType[]) {
  for (const item of items) {
    const idx = sub.part_types.findIndex(p => p.id === item.id || p.slug === item.slug);
    if (idx >= 0) {
      const existing = sub.part_types[idx];
      existing.aliases_ar = Array.from(new Set([...existing.aliases_ar, ...item.aliases_ar]));
      existing.aliases_en = Array.from(new Set([...existing.aliases_en, ...item.aliases_en]));
      existing.search_keywords = Array.from(new Set([...existing.search_keywords, ...item.search_keywords]));
    } else {
      sub.part_types.push(item);
    }
  }
}

// ============================================================================
// 1. HVAC & AC (cat-heating-ventilation-ac & cat-air-conditioning-system)
// ============================================================================
const catHvac = findCategory('cat-heating-ventilation-ac');
if (catHvac) {
  const subHvacRefrig = ensureSubcategory(catHvac, {
    id: 'sub-ac-refrigeration',
    slug: 'ac-refrigeration',
    name_ar: 'كمبروسرات ومكثفات وثلاجات المكيف',
    name_en: 'AC Compressors, Condensers & Evaporators',
    description_ar: 'كمبروسرات التكييف ورديتر المكيف وثلاجة المقصورة وبلوف الفريون',
    description_en: 'A/C compressors, condenser radiators, cabin evaporator cores and expansion valves'
  });

  const subCabinVent = ensureSubcategory(catHvac, {
    id: 'sub-cabin-ventilation-heater',
    slug: 'cabin-ventilation-heater',
    name_ar: 'دفايات المقصورة ومراوح البلاور وموزعات الهواء',
    name_en: 'Cabin Heater Cores, Blower Motors & Flaps',
    description_ar: 'رديتر الدفاية الداخلي وموتور مروحة البلاور ومقاومة السرعات وديناموهات القسامات',
    description_en: 'Heater matrix cores, interior blower fans, resistors and blend door actuators'
  });

  addPartTypes(subHvacRefrig, [
    {
      id: 'pt-ac-compressor-clutch',
      slug: 'ac-compressor-clutch',
      name_ar: 'كلتش وبكرة كمبروسر المكيف الكهرومغناطيسي',
      name_en: 'A/C Compressor Clutch & Pulley Assembly',
      description_ar: 'القابض الكهرومغناطيسي مع الملف والبلية لتعشيق كمبروسر التكييف عند الحاجة',
      description_en: 'Electromagnetic clutch coil, bearing and hub assembly engaging A/C compressor',
      aliases_ar: ['كلتش كمبروسر', 'بكرة كباس', 'ملف مغناطيس مكيف', 'رمان بكرة كمبروسر'],
      aliases_en: ['Compressor Magnetic Clutch', 'A/C Clutch Coil & Pulley'],
      search_keywords: ['كلتش كمبروسر', 'بكرة مكيف', 'ac clutch']
    },
    {
      id: 'pt-ac-receiver-drier',
      slug: 'ac-receiver-drier',
      name_ar: 'فلتر ومجفف الفريون (دراير المكيف)',
      name_en: 'A/C Receiver Drier / Desiccant Accumulator',
      description_ar: 'أسطوانة تنقية وتجفيف غاز الفريون من الرطوبة والشوائب لحماية الكمبروسر',
      description_en: 'Filter desiccant canister capturing moisture and debris from A/C refrigerant loop',
      aliases_ar: ['دراير مكيف', 'فلتر فريون', 'مجفف غاز تكييف', 'دبة فريون كابينة'],
      aliases_en: ['Receiver Drier Bottle', 'A/C Accumulator Desiccant'],
      search_keywords: ['دراير مكيف', 'فلتر فريون', 'receiver drier']
    }
  ]);

  addPartTypes(subCabinVent, [
    {
      id: 'pt-heater-core',
      slug: 'heater-core',
      name_ar: 'رديتر التدفئة الداخلي (ثلاجة السخان)',
      name_en: 'Cabin Interior Heater Core',
      description_ar: 'مبادل حراري داخلي يستمد حرارة ماء المحرك لتدفئة مقصورة القيادة في الشتاء',
      description_en: 'Miniature radiator matrix utilizing engine coolant heat to warm interior air',
      aliases_ar: ['رديتر دفاية', 'سخان مكيف', 'مبرد تدفئة كابينة', 'ثلاجة سخان'],
      aliases_en: ['Heater Matrix Core', 'Interior Heating Radiator'],
      search_keywords: ['رديتر دفاية', 'سخان مكيف', 'heater core']
    },
    {
      id: 'pt-blower-motor-resistor',
      slug: 'blower-motor-resistor',
      name_ar: 'مقاومة ومعدل سرعات مروحة المكيف (ريزستور البلاور)',
      name_en: 'HVAC Blower Motor Resistor / Control Module',
      description_ar: 'مقاومة خزفية أو منظم إلكتروني للتحكم في درجات سرعة دفع هواء المكيف داخل المقصورة',
      description_en: 'Stepped resistor pack or pulse controller varying blower fan motor speed',
      aliases_ar: ['مقاومة مكيف', 'ريزستور مروحة', 'منظم سرعة هواء كابينة', 'كتاوت بلاور'],
      aliases_en: ['Blower Resistor Pack', 'Final Stage Fan Resistor'],
      search_keywords: ['مقاومة مكيف', 'منظم مروحة', 'blower resistor']
    },
    {
      id: 'pt-hvac-blend-door-actuator',
      slug: 'hvac-blend-door-actuator',
      name_ar: 'دينمو وقسام بوابات توزيع الهواء والتكييف',
      name_en: 'HVAC Air Blend Door Actuator Motor',
      description_ar: 'محرك كهربائي صغير يحرك بوابات توجيه الهواء بين الأقدام والوجه والزجاج وتعديل الحرارة',
      description_en: 'Stepper motor actuator positioning HVAC flapper doors for temperature and mode control',
      aliases_ar: ['دينمو قسام مكيف', 'موتور بوابات هواء', 'قسام تكييف', 'أكتويتر هواء'],
      aliases_en: ['Blend Door Motor', 'Air Mix Flap Actuator'],
      search_keywords: ['دينمو قسام', 'قسام مكيف', 'blend door actuator']
    }
  ]);
}

// Dedicated AC Category (cat-air-conditioning-system)
const catAcDedicated = findCategory('cat-air-conditioning-system');
if (catAcDedicated) {
  const subAcLines = ensureSubcategory(catAcDedicated, {
    id: 'sub-ac-expansion-lines',
    slug: 'ac-expansion-lines',
    name_ar: 'خراطيم وحساسات وغازات التبريد',
    name_en: 'AC Refrigerant Lines & Gases',
    description_ar: 'ليات ضغط الفريون وحساسات ضغط التكييف وغازات التبريد R134a و R1234yf',
    description_en: 'A/C refrigerant lines, high/low pressure switches and refrigerant cans'
  });

  addPartTypes(subAcLines, [
    {
      id: 'pt-ac-refrigerant-gas',
      slug: 'ac-refrigerant-gas',
      name_ar: 'غاز الفريون وشحنات التبريد (R134a / R1234yf)',
      name_en: 'A/C Refrigerant Gas (R-134a / R-1234yf)',
      description_ar: 'أسطوانات غاز التبريد عالية النقاوة مع زيت التبريد PAG لشحن منظومات التكييف',
      description_en: 'Automotive grade fluorocarbon refrigerant cylinders for climate recharge',
      aliases_ar: ['غاز فريون', 'دبة فريون 134', 'غاز مكيف سيارة', 'شحنة تبريد'],
      aliases_en: ['R134a Refrigerant Can', 'Eco-friendly R1234yf Gas'],
      search_keywords: ['غاز فريون', 'فريون مكيف', 'refrigerant r134a']
    }
  ]);
}

// ============================================================================
// 2. BATTERIES, STARTING & CHARGING
// ============================================================================
const catBatteries = findCategory('cat-batteries-charging');
if (catBatteries) {
  const subStarterBatteries = ensureSubcategory(catBatteries, {
    id: 'sub-starter-batteries',
    slug: 'starter-batteries',
    name_ar: 'بطاريات السيارات السائلة والجافة والهايبرد',
    name_en: 'Automotive Starter & Hybrid Batteries',
    description_ar: 'بطاريات الرصاص الحمضية وبطاريات AGM و EFB وبطاريات خلايا الهايبرد',
    description_en: 'Lead-acid, AGM, EFB and hybrid vehicle high voltage battery packs'
  });

  addPartTypes(subStarterBatteries, [
    {
      id: 'pt-agm-efb-battery',
      slug: 'agm-efb-battery',
      name_ar: 'بطاريات AGM و EFB للسيارات الحديثة و Start-Stop',
      name_en: 'AGM & EFB Advanced Start-Stop Batteries',
      description_ar: 'بطاريات الألياف الزجاجية الماصة العالية التحمل المصممة للسيارات المزودة بنظام الإيقاف والتشغيل الذكي',
      description_en: 'Absorbent Glass Mat (AGM) and Enhanced Flooded (EFB) high cyclic batteries',
      aliases_ar: ['بطارية اي جي ام', 'بطارية ستارت ستوب', 'بطارية فايبر', 'بطارية جافة متطورة'],
      aliases_en: ['AGM Start-Stop Battery', 'Heavy Duty EFB Car Battery'],
      search_keywords: ['بطارية agm', 'بطارية ستارت ستوب', 'agm battery']
    },
    {
      id: 'pt-hybrid-ev-traction-battery',
      slug: 'hybrid-ev-traction-battery',
      name_ar: 'بطاريات الجهد العالي وخلايا الهايبرد والسيارات الكهربائية',
      name_en: 'Hybrid & EV High Voltage Traction Battery Packs',
      description_ar: 'حزم وخلايا بطاريات النيكل والليثيوم ذات الجهد العالي لسيارات الهايبرد مثل كامري وبريوس ولكزس',
      description_en: 'High voltage NiMH and Lithium-ion traction battery modules for hybrid powertrains',
      aliases_ar: ['بطارية هايبرد', 'خلايا بطارية كامري هايبرد', 'بطارية بريوس', 'بطارية سيارة كهربائية'],
      aliases_en: ['High Voltage Hybrid Pack', 'EV Traction Battery Cells'],
      search_keywords: ['بطارية هايبرد', 'خلايا هايبرد', 'hybrid battery']
    }
  ]);
}

const catStarting = findCategory('cat-starting-system');
if (catStarting) {
  const subStarters = ensureSubcategory(catStarting, {
    id: 'sub-starter-motors',
    slug: 'starter-motors',
    name_ar: 'محركات بدء التشغيل والسلف والتروس',
    name_en: 'Starters, Drives & Solenoids',
    description_ar: 'سلف السيارة وموتور المارش ودقمة السلف وتروس البندكس ومفاتيح الإشعال',
    description_en: 'Starter motors, solenoid switches, bendix drives and ignition starter switches'
  });

  addPartTypes(subStarters, [
    {
      id: 'pt-starter-bendix-drive',
      slug: 'starter-bendix-drive',
      name_ar: 'ترس بندكس السلف (ترس التعشيق للمارش)',
      name_en: 'Starter Motor Bendix Pinion Drive',
      description_ar: 'الترس الميكانيكي المنزلق الذي يتعشق مع أسنان حذافة المحرك لبدء دورانه ثم يرتد',
      description_en: 'Overrunning clutch pinion gear engaging with the flywheel ring gear during cranking',
      aliases_ar: ['ترس سلف', 'بندكس مارش', 'ترس بينيون سلف'],
      aliases_en: ['Bendix Starter Drive Gear', 'Overrunning Starter Clutch'],
      search_keywords: ['ترس سلف', 'بندكس', 'starter bendix']
    },
    {
      id: 'pt-ignition-starter-switch',
      slug: 'ignition-starter-switch',
      name_ar: 'مفتاح وسويتش تشغيل المحرك (دقمة السويتش / زر البصمة)',
      name_en: 'Ignition Starter Switch & Push-Start Button',
      description_ar: 'المفتاح الكهربائي الأسطواني خلف أسطوانة المفتاح أو زر تشغيل المحرك بالبصمة',
      description_en: 'Rotary ignition lock cylinder electrical switch and push button start contacts',
      aliases_ar: ['دقمة سويتش', 'سويتش تشغيل', 'زر بصمة تشغيل', 'مفتاح كونتاكت'],
      aliases_en: ['Ignition Starter Switch', 'Push-to-Start Button'],
      search_keywords: ['دقمة سويتش', 'سويتش تشغيل', 'ignition switch']
    }
  ]);
}

const catCharging = findCategory('cat-charging-system');
if (catCharging) {
  const subAlternators = ensureSubcategory(catCharging, {
    id: 'sub-alternator-units',
    slug: 'alternator-units',
    name_ar: 'مولدات الكهرباء والدينموهات والبكرات',
    name_en: 'Alternators & Regulators',
    description_ar: 'دينمو الكهرباء ومنظم الجهد وفحمات الدينمو وبكرة الكلتش الحرة',
    description_en: 'Alternators, voltage regulators, diode rectifiers and overrunning pulleys'
  });

  addPartTypes(subAlternators, [
    {
      id: 'pt-alternator-freewheel-pulley',
      slug: 'alternator-freewheel-pulley',
      name_ar: 'بكرة الدينمو الحرة ذات الكلتش (طنبورة أحادية الاتجاه)',
      name_en: 'Overrunning Alternator Decoupler / Clutch Pulley (OAP / OAD)',
      description_ar: 'بكرة دينمو مزودة بكلتش ذي اتجاه واحد لامتصاص صدمات سير المحرك وإطالة عمر الدينمو',
      description_en: 'One-way overrunning freewheel clutch pulley dampening crankshaft vibrations',
      aliases_ar: ['بكرة دينمو كلتش', 'طنبورة دينمو كلتش', 'بكرة حرة للمولد'],
      aliases_en: ['Overrunning Alternator Pulley', 'OAP Freewheel Pulley'],
      search_keywords: ['بكرة دينمو', 'طنبورة دينمو', 'alternator pulley']
    },
    {
      id: 'pt-battery-terminals-cables',
      slug: 'battery-terminals-cables',
      name_ar: 'أصابع وكابلات توصيل البطارية والتأريض',
      name_en: 'Battery Terminals & Heavy Duty Ground Cables',
      description_ar: 'أصابع البطارية النحاسية المقاومة للأكسدة وكابلات القطب الموجب والسالب للتأريض',
      description_en: 'Heavy gauge copper battery post clamps, positive starter leads and engine ground straps',
      aliases_ar: ['أصابع بطارية', 'كابل أرضي مكينة', 'فيش قطب بطارية'],
      aliases_en: ['Battery Terminal Clamp Pair', 'Braided Ground Strap Cable'],
      search_keywords: ['اصابع بطارية', 'كابل بطارية', 'battery terminals']
    }
  ]);
}

// ============================================================================
// 3. SAFETY & ADAS
// ============================================================================
const catSafety = findCategory('cat-safety-systems');
if (catSafety) {
  const subAirbags = ensureSubcategory(catSafety, {
    id: 'sub-airbag-components',
    slug: 'airbag-components',
    name_ar: 'الوسائد الهوائية وحساسات الصدمات وأحزمة الأمان',
    name_en: 'Airbags, Pretensioners & Crash Sensors',
    description_ar: 'وسائد الأمان الهوائية وأحزمة الأمان وحساسات الاصطدام ووحدة تحكم SRS',
    description_en: 'Airbag modules, seatbelt tensioners, crash impact sensors and SRS control modules'
  });

  addPartTypes(subAirbags, [
    {
      id: 'pt-seat-belt-pretensioner',
      slug: 'seat-belt-pretensioner',
      name_ar: 'أحزمة الأمان وآليات الشد المسبق (شدادات الحزام)',
      name_en: 'Seat Belt Pretensioners & Assemblies',
      description_ar: 'آليات شد حزام الأمان النارية أو الميكانيكية التي تشد الراكب فور وقوع الاصطدام',
      description_en: 'Pyrotechnic buckle and retractor seat belt pretensioners restraining occupants',
      aliases_ar: ['شداد حزام أمان', 'حزام أمان كامل', 'بكرة حزام أمان نارية'],
      aliases_en: ['Pyrotechnic Seatbelt Retractor', 'Front Seat Belt Tensioner'],
      search_keywords: ['حزام امان', 'شداد حزام', 'seat belt']
    },
    {
      id: 'pt-airbag-crash-sensor',
      slug: 'airbag-crash-sensor',
      name_ar: 'حساسات الاصطدام والصدمات (حساسات الإيرباق الأمامية والجانبية)',
      name_en: 'Airbag Crash & Impact Sensors',
      description_ar: 'حساسات تسارع وتباطؤ مثبتة على الشاسيه والواجهة والأبواب لتحفيز انتفاخ الوسائد فوراً',
      description_en: 'Chassis, front crossmember and B-pillar mounted crash impact deceleration sensors',
      aliases_ar: ['حساس صدمة ايرباق', 'حساس تصادم شاصي', 'سنسر صدمة أمامي'],
      aliases_en: ['Front Impact Crash Sensor', 'Side Airbag Sensor'],
      search_keywords: ['حساس صدمة', 'حساس تصادم', 'crash sensor']
    }
  ]);
}

const catAdas = findCategory('cat-adas-driver-assistance');
if (catAdas) {
  const subAdas = ensureSubcategory(catAdas, {
    id: 'sub-parking-camera-radar',
    slug: 'parking-camera-radar',
    name_ar: 'حساسات الركن والكاميرات والرادارات الذكية',
    name_en: 'Parking Sensors, Cameras & Radars',
    description_ar: 'حساسات الصدام الخلفي والأمامي وكاميرات الرؤية ورادارات النقطة العمياء ومثبت السرعة التكيفي',
    description_en: 'Ultrasonic park assist sensors, reverse cameras, blind spot radars and adaptive cruise modules'
  });

  addPartTypes(subAdas, [
    {
      id: 'pt-blind-spot-radar-sensor',
      slug: 'blind-spot-radar-sensor',
      name_ar: 'رادارات وحساسات النقطة العمياء (الزوايا الميتة)',
      name_en: 'Blind Spot Detection (BSD) Radar Sensors',
      description_ar: 'رادارات ميكروويف مدمجة خلف الصدام الخلفي لرصد السيارات القادمة في المسارات المجاورة وتحذير السائق',
      description_en: 'Rear quarter panel radar sensors detecting vehicles entering driver blind spots',
      aliases_ar: ['رادار نقطة عمياء', 'حساس زاوية ميتة', 'سنسر نقطة عمياء صدام ورا'],
      aliases_en: ['Blind Spot Radar Module', 'Side Assist Radar'],
      search_keywords: ['نقطة عمياء', 'رادار نقطة عمياء', 'blind spot radar']
    },
    {
      id: 'pt-adaptive-cruise-front-radar',
      slug: 'adaptive-cruise-front-radar',
      name_ar: 'رادار مثبت السرعة التكيفي والتحذير من التصادم (رادار الصدام الأمامي)',
      name_en: 'Front Radar / Adaptive Cruise Control (ACC) Sensor',
      description_ar: 'رادار مليمتري أمامي خلف الشعار أو الشبك لحساب المسافة مع المركبة الأمامية والفرملة التلقائية',
      description_en: 'Millimeter-wave forward looking radar for autonomous emergency braking and ACC',
      aliases_ar: ['رادار صدام أمامي', 'رادار مثبت سرعة', 'حساس فرامل طوارئ أمامي'],
      aliases_en: ['Forward Collision Radar Unit', 'ACC Distance Sensor'],
      search_keywords: ['رادار صدام', 'رادار امامي', 'adaptive cruise radar']
    },
    {
      id: 'pt-lane-departure-windshield-camera',
      slug: 'lane-departure-windshield-camera',
      name_ar: 'كاميرا الزجاج الأمامي لتحديد المسار ومساعدة السائق',
      name_en: 'Lane Departure & Forward Facing Windshield Camera',
      description_ar: 'كاميرا بصرية مدمجة خلف المرآة الوسطية لقراءة خطوط المسار وشواخص المرور والمشاة',
      description_en: 'Multi-function windshield camera recognizing lane markings and speed signs',
      aliases_ar: ['كاميرا مسار', 'كاميرا بربريز أمامية', 'كاميرا خطوط الطريق'],
      aliases_en: ['Windshield Driver Assist Camera', 'Lane Keeping Camera'],
      search_keywords: ['كاميرا مسار', 'كاميرا زجاج', 'lane departure camera']
    }
  ]);
}

// ============================================================================
// 4. TYRES & WHEELS (cat-tyres-wheels)
// ============================================================================
const catWheels = findCategory('cat-tyres-wheels');
if (catWheels) {
  const subTyres = ensureSubcategory(catWheels, {
    id: 'sub-tires-tpms',
    slug: 'tires-tpms',
    name_ar: 'الإطارات والجنوط وحساسات ضغط الهواء TPMS',
    name_en: 'Tyres, Wheels & TPMS Sensors',
    description_ar: 'كفرات السيارات وجنوط الألمنيوم والحديد وبلوف حساسات الهواء ومسامير الجنوط',
    description_en: 'Tyres, alloy rims, steel wheels, tire pressure sensors and lug hardware'
  });

  addPartTypes(subTyres, [
    {
      id: 'pt-alloy-wheels-rims',
      slug: 'alloy-wheels-rims',
      name_ar: 'جنوط الألمنيوم والسبائك الرياضية (الرنجات)',
      name_en: 'Alloy Wheels / Light Metal Rims',
      description_ar: 'جنوط سبائك الألومنيوم والمغنيسيوم بمقاسات مختلفة بتصاميم رياضية وفاخرة',
      description_en: 'Cast and forged aluminum alloy wheel rims for passenger and off-road vehicles',
      aliases_ar: ['جنوط المنيوم', 'رنجات سبائك', 'جنط سبور', 'عجلات المنيوم'],
      aliases_en: ['Alloy Rims', 'Sport Wheels Set'],
      search_keywords: ['جنوط', 'رنجات', 'alloy wheels']
    },
    {
      id: 'pt-steel-wheels-rims',
      slug: 'steel-wheels-rims',
      name_ar: 'جنوط الحديد والصلب التقليدية وعجلات السبير',
      name_en: 'Steel Wheels & Spare Wheel Rims',
      description_ar: 'جنوط فولاذية شديدة المتانة والاستحمال ومثالية لسيارات النقل وسيارات الطرق الوعرة والسبير',
      description_en: 'Stamped heavy gauge steel wheel rims and compact donut spare wheels',
      aliases_ar: ['جنوط حديد', 'رنجات فولاذ', 'جنط سبير', 'طاسة جنط'],
      aliases_en: ['Steel Wheel Rim', 'Spare Wheel Donut'],
      search_keywords: ['جنوط حديد', 'جنط سبير', 'steel wheels']
    },
    {
      id: 'pt-wheel-lug-nuts-studs',
      slug: 'wheel-lug-nuts-studs',
      name_ar: 'صواميل ومسامير العجلات وأطقم أمان الجنط',
      name_en: 'Wheel Lug Nuts, Studs & Wheel Lock Sets',
      description_ar: 'صواميل تثبيت الجنوط الفولاذية والكروم ومسامير الصرة وصواميل الحماية من السرقة',
      description_en: 'Grade 10.9 wheel studs, chrome lug nuts and anti-theft locking wheel nut sets',
      aliases_ar: ['صواميل جنوط', 'مسامير كفرات', 'براغي عجل', 'صواميل سرقة أمان'],
      aliases_en: ['Wheel Lug Nut Set', 'Wheel Stud Bolt', 'Locking Lug Nuts'],
      search_keywords: ['صواميل كفرات', 'مسامير جنط', 'lug nuts']
    },
    {
      id: 'pt-wheel-spacers',
      slug: 'wheel-spacers',
      name_ar: 'مباعدات وفلنجات توسيع العجلات (التباريز)',
      name_en: 'Wheel Spacers & Hub Centric Adapters',
      description_ar: 'فلنجات ألومنيوم تضاف بين صرة العجلة والجنط لتوسيع مسار المركبة وتعديل المظهر الخارجي',
      description_en: 'Precision hubcentric forged aluminum spacers widening vehicle track width',
      aliases_ar: ['تباريز جنوط', 'سبيسرات كفرات', 'فلنجات توسيع'],
      aliases_en: ['Hubcentric Wheel Spacers', 'Wheel Adapter Spacers'],
      search_keywords: ['تباريز', 'سبيسرات', 'wheel spacers']
    }
  ]);
}

// ============================================================================
// 5. DRIVETRAIN & AXLES (cat-drivetrain-axles)
// ============================================================================
const catDrivetrain = findCategory('cat-drivetrain-axles');
if (catDrivetrain) {
  const subDiff = ensureSubcategory(catDrivetrain, {
    id: 'sub-differential-gears',
    slug: 'differential-gears',
    name_ar: 'الدفرنسات والكورونا وصناديق الدبل',
    name_en: 'Differentials, Ring/Pinion & Transfer Cases',
    description_ar: 'مجموعات الدفرنس الأمامية والخلفية وتروس الكورونا والترنسفير بوكس للدفع الرباعي',
    description_en: 'Differential carriers, ring and pinion gear sets, limited slip differentials and transfer cases'
  });

  addPartTypes(subDiff, [
    {
      id: 'pt-transfer-case-components',
      slug: 'transfer-case-components',
      name_ar: 'صندوق الدبل وقير التوزيع للدفع الرباعي (الترنسفير بوكس)',
      name_en: '4WD Transfer Case & Actuator Components',
      description_ar: 'صندوق نقل وتوزيع العزم بين المحور الأمامي والخلفي لمركبات الدفع الرباعي 4x4 مع موتور التعشيق',
      description_en: 'Four-wheel drive transfer case assembly, shift motor actuator and chain drive',
      aliases_ar: ['قير دبل', 'صندوق دبل', 'ترنسفير بوكس', 'دينمو دبل 4x4'],
      aliases_en: ['4x4 Transfer Case Assembly', 'Transfer Case Shift Motor'],
      search_keywords: ['قير دبل', 'صندوق دبل', 'transfer case']
    },
    {
      id: 'pt-ring-pinion-gear-set',
      slug: 'ring-pinion-gear-set',
      name_ar: 'تروس الكورونا والبنيون للدفرنس',
      name_en: 'Differential Ring & Pinion Gear Set',
      description_ar: 'الترس التاجي والترس المخروطي المسؤولان عن تحويل اتجاه الدوران وتخفيض السرعة للمحاور',
      description_en: 'Matched hypoid ring gear and drive pinion set determining axle final drive ratio',
      aliases_ar: ['كورونا وبنيون', 'تروس دفرنش', 'ترس تاجي ومخروطي'],
      aliases_en: ['Differential Crown Wheel & Pinion', 'Ring and Pinion Set'],
      search_keywords: ['كورونا وبنيون', 'تروس دفرنس', 'ring and pinion']
    }
  ]);
}

// ============================================================================
// 6. CLUTCH SYSTEM (cat-clutch-system)
// ============================================================================
const catClutch = findCategory('cat-clutch-system');
if (catClutch) {
  const subClutchHyd = ensureSubcategory(catClutch, {
    id: 'sub-clutch-hydraulics',
    slug: 'clutch-hydraulics',
    name_ar: 'مضخات وأسطوانات وسلندرات الكلتش',
    name_en: 'Clutch Master & Slave Cylinders',
    description_ar: 'علبة الكلتش العلوية والسفلية ومواسير ضغط الدبرياج',
    description_en: 'Clutch master cylinder, slave concentric release cylinder and hydraulic lines'
  });

  addPartTypes(subClutchHyd, [
    {
      id: 'pt-clutch-cable',
      slug: 'clutch-cable',
      name_ar: 'كابل وسلك الكلتش الميكانيكي (واير الدبرياج)',
      name_en: 'Manual Clutch Operating Cable',
      description_ar: 'سلك فولاذي مرن ينقل حركة دواسة الدبرياج إلى شوكة الكلتش في السيارات غير الهيدروليكية',
      description_en: 'Heavy duty steel stranded control cable actuating clutch release fork',
      aliases_ar: ['واير كلتش', 'سلك دبرياج', 'كابل دواسة كلتش'],
      aliases_en: ['Clutch Release Cable', 'Clutch Linkage Cable'],
      search_keywords: ['واير كلتش', 'سلك دبرياج', 'clutch cable']
    }
  ]);
}

// ============================================================================
// 7. ELECTRONICS & CONTROL MODULES (cat-electronics-control-modules)
// ============================================================================
const catElec = findCategory('cat-electronics-control-modules');
if (catElec) {
  const subEcu = ensureSubcategory(catElec, {
    id: 'sub-control-units',
    slug: 'control-units',
    name_ar: 'كمبيوترات المحرك والقير والهيكل والعدادات',
    name_en: 'Engine, Transmission & Body ECUs',
    description_ar: 'كمبيوتر المحرك ECU وكمبيوتر القير TCM ووحدة الهيكل BCM وعدادات الطبلون',
    description_en: 'Engine ECUs, transmission TCMs, body control modules and instrument clusters'
  });

  addPartTypes(subEcu, [
    {
      id: 'pt-body-control-module-bcm',
      slug: 'body-control-module-bcm',
      name_ar: 'كمبيوتر الهيكل والمقصورة (وحدة BCM)',
      name_en: 'Body Control Module (BCM)',
      description_ar: 'الوحدة الإلكترونية المركزية لإدارة أنوار السيارة والسنتر لوك والمساحات والنوافذ والأمان',
      description_en: 'Central electronic control module managing lighting, locks, wipers and interior circuits',
      aliases_ar: ['كمبيوتر البدي', 'عقل السيارة الداخلي', 'وحدة BCM', 'كمبيوتر هيكل السيارة'],
      aliases_en: ['BCM Unit', 'Body Computer'],
      search_keywords: ['كمبيوتر بدي', 'bcm', 'كمبيوتر سيارة']
    },
    {
      id: 'pt-instrument-cluster-display',
      slug: 'instrument-cluster-display',
      name_ar: 'عدادات الطبلون والشاشات الرقمية للسيارة',
      name_en: 'Instrument Gauge Cluster & Digital Displays',
      description_ar: 'لوحة عدادات السرعة وRPM وحرارة المحرك ومستوى البنزين والشاشات الرقمية التفاعلية',
      description_en: 'Digital or analog gauge speedometer cluster displaying vehicle speed, rpm and alerts',
      aliases_ar: ['طبلون عدادات', 'عداد سرعة', 'ساعة طبلون', 'شاشة عدادات'],
      aliases_en: ['Speedometer Cluster', 'Digital Dash Display'],
      search_keywords: ['طبلون عدادات', 'عداد سرعة', 'instrument cluster']
    }
  ]);
}

// ============================================================================
// 8. ACCESSORIES, TOOLS & SERVICE
// ============================================================================
const catTools = findCategory('cat-tools-equipment');
if (catTools) {
  const subTools = ensureSubcategory(catTools, {
    id: 'sub-mechanic-tools',
    slug: 'mechanic-tools',
    name_ar: 'معدات الميكانيكا وأجهزة الفحص والروافع',
    name_en: 'Automotive Workshop Tools & Scanners',
    description_ar: 'أجهزة فحص الأعطال OBD والروافع ومفاتيح الفلاتر ومعدات صيانة السيارات',
    description_en: 'OBD diagnostic tools, hydraulic jacks, torque wrenches and specialty service tools'
  });

  addPartTypes(subTools, [
    {
      id: 'pt-obd2-diagnostic-scanner',
      slug: 'obd2-diagnostic-scanner',
      name_ar: 'أجهزة فحص وتشخيص أعطال السيارات (كمبيوتر كشف الأعطال OBD-II)',
      name_en: 'OBD-II Diagnostic Scanner & Code Reader',
      description_ar: 'أجهزة الكشف وقراءة ومسح أكواد الأعطال للمحرك والقير والإيرباق والـ ABS عبر منفذ الفحص',
      description_en: 'Handheld or tablet automotive scan tool diagnosing trouble codes across all ECUs',
      aliases_ar: ['كمبيوتر فحص سيارات', 'سكانر OBD2', 'قارئ اعطال سيارة', 'جهاز لانش وتيل'],
      aliases_en: ['OBD2 Diagnostic Scanner', 'Fault Code Reader'],
      search_keywords: ['كمبيوتر فحص', 'سكانر اعطال', 'obd2 scanner']
    },
    {
      id: 'pt-hydraulic-floor-jack',
      slug: 'hydraulic-floor-jack',
      name_ar: 'عفريتة وروافع سيارة هيدروليكية وحوامل الأمان (جك رفع)',
      name_en: 'Hydraulic Floor Jack & Jack Stands',
      description_ar: 'روافع هيدروليكية تمساح وقواعد حديدية آمنة لرفع وتثبيت السيارة أثناء أعمال الصيانة',
      description_en: 'Heavy duty trolley floor jack and ratchet safety jack stands supporting raised vehicle',
      aliases_ar: ['عفريتة تمساح', 'جك رفع سيارة', 'كوريك هيدروليك', 'حوامل جاك ستاند'],
      aliases_en: ['Trolley Floor Jack', 'Jack Stands Pair'],
      search_keywords: ['عفريتة', 'جك رفع', 'floor jack']
    }
  ]);
}

const catService = findCategory('cat-service-maintenance');
if (catService) {
  const subService = ensureSubcategory(catService, {
    id: 'sub-belts-seals',
    slug: 'belts-seals',
    name_ar: 'حزم وبكجات الصيانة الدورية الشاملة',
    name_en: 'Periodic Maintenance Service Kits',
    description_ar: 'حزم الصيانة الخفيفة والكبرى ومجموعات الوردات والأولسيلات الاستهلاكية',
    description_en: 'Minor 10k and major 40k/80k km comprehensive maintenance packs'
  });

  addPartTypes(subService, [
    {
      id: 'pt-minor-service-kit',
      slug: 'minor-service-kit',
      name_ar: 'بكج الصيانة الدورية الخفيفة (10,000 كم)',
      name_en: '10,000 KM Minor Service Maintenance Pack',
      description_ar: 'باقة تشمل زيت المحرك التخليقي وفلتر الزيت وفلتر الهواء ووردة الصرة لصيانة كل 10 آلاف كم',
      description_en: 'Complete minor service bundle containing engine oil, oil filter and air filter',
      aliases_ar: ['بكج صيانة 10 الاف', 'طقم غيار زيت وسيفون', 'باقة صيانة دورية'],
      aliases_en: ['Minor Service Kit', '10K Oil & Filter Service Pack'],
      search_keywords: ['بكج صيانة', 'غيار زيت', 'service kit']
    },
    {
      id: 'pt-major-service-kit',
      slug: 'major-service-kit',
      name_ar: 'بكج الصيانة الكبرى الشاملة (40,000 - 80,000 كم)',
      name_en: 'Major Service Maintenance Pack (Belts, Plugs, Filters & Fluids)',
      description_ar: 'باقة صيانة شاملة تجمع البواجي وفلتر البنزين وسير المكينة وزيوت الفرامل والقير وماء الرديتر',
      description_en: 'Comprehensive overhaul service bundle including spark plugs, accessory belts, fluids and all filters',
      aliases_ar: ['بكج صيانة كبرى', 'طقم تجديد شامل', 'صيانة 80 الف'],
      aliases_en: ['Major Service Tune-up Kit', 'Comprehensive 40K Service Pack'],
      search_keywords: ['صيانة كبرى', 'بكج صيانة شاملة', 'major service kit']
    }
  ]);
}

// ============================================================================
// FINAL METRICS & SAVE
// ============================================================================

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
    version: '2.0.0',
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

console.log('🎉 Full Master Taxonomy generated and saved to docs/data/automotive-parts-taxonomy.json');
console.log('Final Master Statistics:', finalOutput.metadata.counts);
