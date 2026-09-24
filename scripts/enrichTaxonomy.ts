/**
 * scripts/enrichTaxonomy.ts
 *
 * Enriches the canonical taxonomy with all specialized parts, subcategories,
 * authentic Yemeni / Gulf / Technical Arabic aliases, English aliases, and search keywords
 * as specified in the ALA Auto Parts Master Parts Taxonomy requirements.
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

function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '')
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEnglish(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const TAXONOMY_PATH = path.join(process.cwd(), 'docs', 'data', 'automotive-parts-taxonomy.json');
const raw = fs.readFileSync(TAXONOMY_PATH, 'utf8');
const root = JSON.parse(raw);
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
      // merge aliases and keywords
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
// 1. FILTERS (cat-filters) ENRICHMENT
// ============================================================================
const catFilters = findCategory('cat-filters');
if (catFilters) {
  const subEngineFilters = ensureSubcategory(catFilters, {
    id: 'sub-engine-filters',
    slug: 'engine-filters',
    name_ar: 'فلاتر المحرك وسوائله',
    name_en: 'Engine Filtration',
    description_ar: 'فلاتر زيت المحرك والهواء والوقود',
    description_en: 'Oil, intake air and fuel purification units'
  });

  const subSpecializedFilters = ensureSubcategory(catFilters, {
    id: 'sub-specialized-filters',
    slug: 'specialized-and-service-filters',
    name_ar: 'فلاتر الأنظمة المساعدة والهيدروليك وأطقم الفلاتر',
    name_en: 'Auxiliary, Hydraulic & Filter Kits',
    description_ar: 'فلاتر الزيت الهيدروليكي والتوجيه المعزز وماء التبريد وأطقم الخدمة المتكاملة',
    description_en: 'Hydraulic, power steering, cooling system filters and service filter kits'
  });

  addPartTypes(subSpecializedFilters, [
    {
      id: 'pt-hydraulic-filter',
      slug: 'hydraulic-filter',
      name_ar: 'فلتر الزيت الهيدروليكي',
      name_en: 'Hydraulic System Filter',
      description_ar: 'فلتر تنقية السائل الهيدروليكي لأنظمة التعليق الهوائي/الهيدروليكي والأنظمة الصناعية',
      description_en: 'High pressure filter element purifying hydraulic fluid',
      aliases_ar: ['صفاية هيدروليك', 'فلتر ضغط هيدروليكي', 'فلتر زيت الرفع'],
      aliases_en: ['Hydraulic Fluid Filter', 'Hydraulic Return Line Filter'],
      search_keywords: ['هيدروليك', 'فلتر هيدروليك', 'hydraulic filter']
    },
    {
      id: 'pt-coolant-filter',
      slug: 'coolant-filter',
      name_ar: 'فلتر سائل التبريد (ماء الرديتر)',
      name_en: 'Coolant Filter',
      description_ar: 'فلتر تنقية مياه التبريد مع مضافات كيميائية لمنع التكلس والصدأ لمحركات الديزل والشاحنات والسيارات الثقيلة',
      description_en: 'Cooling system filter cartridge with supplemental coolant additives (SCA)',
      aliases_ar: ['صفاية رديتر', 'فلتر ماء التبريد', 'فلتر سائل المحرك'],
      aliases_en: ['Coolant Water Filter', 'Radiator Coolant Filter Element'],
      search_keywords: ['فلتر ماء', 'فلتر رديتر', 'coolant filter']
    },
    {
      id: 'pt-power-steering-filter',
      slug: 'power-steering-filter',
      name_ar: 'فلتر نظام التوجيه المعزز (فلتر الدركسون)',
      name_en: 'Power Steering Filter',
      description_ar: 'فلتر مدمج في خزان زيت الدركسون أو على خط الإرجاع لمنع تلف طرمبة الباور والدودة',
      description_en: 'In-line or reservoir filter capturing wear particulates in steering fluid',
      aliases_ar: ['صفاية زيت دركسون', 'فلتر باور ستيرنج', 'فلتر علبة السكان'],
      aliases_en: ['Power Steering Reservoir Filter', 'Steering In-Line Filter'],
      search_keywords: ['فلتر دركسون', 'فلتر باور', 'power steering filter']
    },
    {
      id: 'pt-filter-service-kit',
      slug: 'filter-service-kit',
      name_ar: 'طقم الفلاتر الشامل (بكج الفلاتر)',
      name_en: 'Filter Service Kit',
      description_ar: 'مجموعة متكاملة تجمع فلتر الزيت والهواء والمكيف والوقود المخصصة لصيانة السيارة الدورية',
      description_en: 'Combined maintenance pack containing oil, air, cabin and fuel filters',
      aliases_ar: ['طقم فلاتر صيانة', 'بكج فلاتر', 'طقم صفيات كامل', 'باقة فلاتر'],
      aliases_en: ['Complete Service Filter Kit', 'Tune-up Filter Pack'],
      search_keywords: ['طقم فلاتر', 'بكج فلاتر', 'filter kit']
    }
  ]);
}

// ============================================================================
// 2. ENGINE PARTS (cat-engine-parts) ENRICHMENT
// ============================================================================
const catEngine = findCategory('cat-engine-parts');
if (catEngine) {
  const subBlock = ensureSubcategory(catEngine, {
    id: 'sub-engine-block-piston',
    slug: 'engine-block-piston',
    name_ar: 'البساتم والعمود المرفقي والسلندر',
    name_en: 'Block, Pistons & Crankshaft',
    description_ar: 'المكابس وأذرع التوصيل وعمود الكرنك وسبائك المحرك',
    description_en: 'Pistons, rings, connecting rods, bearings and crankshaft'
  });

  const subValvetrain = ensureSubcategory(catEngine, {
    id: 'sub-cylinder-head-valves',
    slug: 'cylinder-head-valves',
    name_ar: 'رأس السلندر والبلوف ومجموعة الصمامات',
    name_en: 'Cylinder Head & Valvetrain',
    description_ar: 'رأس المحرك والصبابات وعمود الكامات ووجوه السلندر',
    description_en: 'Cylinder heads, intake/exhaust valves, camshafts and head gaskets'
  });

  const subTiming = ensureSubcategory(catEngine, {
    id: 'sub-timing-system',
    slug: 'timing-system',
    name_ar: 'منظومة وسلاسل التايمن والسيور',
    name_en: 'Timing Belts, Chains & Pulleys',
    description_ar: 'سيور وجنازير التايمن وشدادات التوقيت وتوافق الصمامات',
    description_en: 'Camshaft timing chains, belts, tensioners and guides'
  });

  const subLubrication = ensureSubcategory(catEngine, {
    id: 'sub-lubrication-oil-pan',
    slug: 'lubrication-oil-pan',
    name_ar: 'نظام التزييت وكرتير وطلمبة الزيت',
    name_en: 'Lubrication System & Oil Pan',
    description_ar: 'مضخة زيت المحرك وكرتير الزيت وموانع تسرب الكرنك',
    description_en: 'Oil pumps, oil pans, sumps and crankcase seals'
  });

  const subInductionExhaust = ensureSubcategory(catEngine, {
    id: 'sub-engine-induction-turbo',
    slug: 'engine-induction-turbo',
    name_ar: 'سحب الهواء ومجمعات العادم والتيربو',
    name_en: 'Air Induction, Manifolds & Turbocharger',
    description_ar: 'ثلاجة المكينة ومجمع العادم وشاحن التيربو ومكوناته',
    description_en: 'Intake manifolds, exhaust manifolds and turbocharger systems'
  });

  addPartTypes(subBlock, [
    {
      id: 'pt-engine-block',
      slug: 'engine-block',
      name_ar: 'كتلة المحرك (السلندر / بلوك المكينة)',
      name_en: 'Cylinder Engine Block',
      description_ar: 'جسم المحرك الرئيسي المصبوب الحاضن للأسطوانات وعمود الكرنك',
      description_en: 'Cast iron or aluminum engine block casing the cylinders and crank journals',
      aliases_ar: ['بلوك مكينة', 'شورت بلوك', 'سلندر مكينة', 'كتلة السلندرات'],
      aliases_en: ['Short Block', 'Long Block', 'Motor Block'],
      search_keywords: ['بلوك', 'سلندر', 'engine block']
    },
    {
      id: 'pt-engine-flywheel',
      slug: 'engine-flywheel',
      name_ar: 'حذافة المحرك (الفولان)',
      name_en: 'Engine Flywheel',
      description_ar: 'قرص التوازن الفولاذي الثقيل المتصل بنهاية عمود الكرنك المسنن لسلف التشغيل',
      description_en: 'Heavy inertia wheel with starter ring gear bolted to crankshaft',
      aliases_ar: ['فولان مكينة', 'حذاف المكينة', 'ترس الفولان', 'قرص القصور الذاتي'],
      aliases_en: ['Starter Ring Flywheel', 'Manual Flywheel'],
      search_keywords: ['فولان', 'حذاف', 'flywheel']
    }
  ]);

  addPartTypes(subValvetrain, [
    {
      id: 'pt-cylinder-head',
      slug: 'cylinder-head',
      name_ar: 'رأس السلندر (سلندر هيد / رأس المكينة)',
      name_en: 'Engine Cylinder Head',
      description_ar: 'الجزء العلوي الحاضن للصمامات وغرف الاحتراق وعمود الكامات',
      description_en: 'Cast cylinder head assembly containing combustion chambers and valvetrain',
      aliases_ar: ['وش سلندر', 'راس مكينة', 'سلندر هيد'],
      aliases_en: ['Bare Cylinder Head', 'Loaded Cylinder Head'],
      search_keywords: ['راس مكينة', 'سلندر هيد', 'cylinder head']
    },
    {
      id: 'pt-camshaft',
      slug: 'camshaft',
      name_ar: 'عمود الكامات (عمود الحدبات / التايمن)',
      name_en: 'Engine Camshaft',
      description_ar: 'عمود فتح وغلق صمامات السحب والعادم بدقة وفق دورة المحرك',
      description_en: 'Precision ground shaft with lobes actuating intake and exhaust valves',
      aliases_ar: ['عمود تايمن', 'عمود كامات', 'ميل كامات', 'عامود حدبات'],
      aliases_en: ['Intake Camshaft', 'Exhaust Camshaft'],
      search_keywords: ['كامات', 'عمود تايمن', 'camshaft']
    },
    {
      id: 'pt-valve-guides-springs',
      slug: 'valve-guides-springs',
      name_ar: 'موجهات وسبرنجات الصمامات (دلايل وسوست الصباب)',
      name_en: 'Valve Guides, Springs & Seats',
      description_ar: 'الموجهات البرونزية والحديدية والزنبركات الفولاذية لإرجاع الصمامات وإحكام مسارها',
      description_en: 'Precision valve guides, retention springs, retainers and seats',
      aliases_ar: ['دلايل صبابات', 'سوست بلوف', 'سبرنغات صباب', 'قواعد بلوف'],
      aliases_en: ['Valve Springs', 'Valve Guides', 'Valve Keepers'],
      search_keywords: ['سوست بلوف', 'دلايل صباب', 'valve springs']
    },
    {
      id: 'pt-rocker-arms-lifters',
      slug: 'rocker-arms-lifters',
      name_ar: 'عصافير وتكايات الصمامات (الروافع الهيدروليكية)',
      name_en: 'Rocker Arms & Hydraulic Lifters / Tappets',
      description_ar: 'تكايات هيدروليكية وشواكيش نقل حركة الكامات إلى الصمامات مع موازنة الخلوص ذاتياً',
      description_en: 'Hydraulic lash adjusters and roller rocker arms',
      aliases_ar: ['تكايات بلوف', 'عصافير صبابات', 'شواكيش بلوف', 'طواقي صباب'],
      aliases_en: ['Hydraulic Tappets', 'Valve Lifters', 'Rocker Arms'],
      search_keywords: ['تكايات بلوف', 'عصافير صباب', 'lifters', 'rocker arm']
    }
  ]);

  addPartTypes(subTiming, [
    {
      id: 'pt-timing-gears-pulleys',
      slug: 'timing-gears-pulleys',
      name_ar: 'بكرات ومسننات التوقيت (بكرات الكامة والكرنك)',
      name_en: 'Timing Gears & Sprockets',
      description_ar: 'تروس عمود الكرنك والكامات وبكرات ضبط نظام توقيت الصمامات المتغير VVT',
      description_en: 'Camshaft gears, crankshaft sprockets and VVT cam phasers',
      aliases_ar: ['ترس تايمن', 'ترس كامة VVT', 'مسنن عمود كامات'],
      aliases_en: ['Cam Gear', 'VVT Cam Phaser Sprocket', 'Crankshaft Sprocket'],
      search_keywords: ['ترس تايمن', 'ترس كامة', 'timing gear']
    },
    {
      id: 'pt-idler-pulleys',
      slug: 'idler-pulleys',
      name_ar: 'بكرات التوجيه والشداد الثابتة (بكرات وسيطة)',
      name_en: 'Idler & Deflection Pulleys',
      description_ar: 'بكرات حرة الحركة لتوجيه وضبط مسار سيور المحرك وسير التايمن',
      description_en: 'Smooth or grooved idler pulleys guiding accessory and timing belts',
      aliases_ar: ['رمانة سير وسيطة', 'بكرة حرة', 'بكرة شداد ثابتة'],
      aliases_en: ['Accessory Idler Pulley', 'Guide Pulley'],
      search_keywords: ['بكرة وسيطة', 'رمانة سير', 'idler pulley']
    }
  ]);

  addPartTypes(subLubrication, [
    {
      id: 'pt-engine-oil-pump',
      slug: 'engine-oil-pump',
      name_ar: 'مضخة زيت المحرك (طرمبة زيت المكينة)',
      name_en: 'Engine Oil Pump',
      description_ar: 'مضخة تروس ميكانيكية تسحب الزيت من الكرتير وتضخه بضغط عالٍ إلى كافة أجزاء المحرك',
      description_en: 'High pressure positive displacement gear pump lubricating all engine journals',
      aliases_ar: ['طلمبة زيت مكينة', 'طرمبة زيت محرك', 'مضخة تزييت'],
      aliases_en: ['High Flow Oil Pump', 'Rotary Engine Oil Pump'],
      search_keywords: ['طرمبة زيت', 'طلمبة زيت', 'oil pump']
    },
    {
      id: 'pt-engine-oil-pan',
      slug: 'engine-oil-pan',
      name_ar: 'كرتير زيت المحرك (صينية الزيت السفلية)',
      name_en: 'Engine Oil Pan / Sump',
      description_ar: 'حوض تجميع زيت المحرك السفلي مع مسمار الصرة ومانع تسرب الكرتير',
      description_en: 'Steel or cast aluminum lower oil reservoir with drain plug',
      aliases_ar: ['صينية زيت مكينة', 'حوض الزيت', 'كرتير ماكينة'],
      aliases_en: ['Oil Sump Pan', 'Lower Engine Sump'],
      search_keywords: ['كرتير', 'صينية زيت', 'oil pan']
    },
    {
      id: 'pt-crankshaft-oil-seals',
      slug: 'crankshaft-oil-seals',
      name_ar: 'صوف وموانع تسرب الكرنك (الأولسيلات)',
      name_en: 'Crankshaft Front & Rear Oil Seals',
      description_ar: 'موانع تسرب زيت الكرنك الأمامية خلف البكرة والخلفية أمام الفولان لمنع تسريب الزيت',
      description_en: 'Front timing cover and rear main crankshaft radial oil seals',
      aliases_ar: ['صوفة كرنك أمامية', 'صوفة كرنك خلفية', 'أولسيل كرنك', 'لباد زيت كرنك'],
      aliases_en: ['Front Main Seal', 'Rear Main Seal', 'Radial Shaft Seal'],
      search_keywords: ['صوفة كرنك', 'اولسيل', 'oil seal']
    }
  ]);

  addPartTypes(subInductionExhaust, [
    {
      id: 'pt-intake-manifold',
      slug: 'intake-manifold',
      name_ar: 'مجمع سحب الهواء (ثلاجة المحرك / المنفول)',
      name_en: 'Engine Intake Manifold',
      description_ar: 'مجمع توزيع الهواء المفلتر بالتساوي على جميع أسطوانات المحرك',
      description_en: 'Aluminum or composite manifold distributing charge air evenly to intake ports',
      aliases_ar: ['ثلاجة مكينة', 'منفول سحب', 'مانيفولد هواء'],
      aliases_en: ['Inlet Manifold', 'Air Intake Plenum'],
      search_keywords: ['ثلاجة مكينة', 'منفول', 'intake manifold']
    },
    {
      id: 'pt-exhaust-manifold',
      slug: 'exhaust-manifold',
      name_ar: 'مجمع غازات العادم (الهدرز / منفول القزوز)',
      name_en: 'Engine Exhaust Manifold',
      description_ar: 'مجمع تصريف نواتج الاحتراق الساخنة من الأسطوانات وتوجيهها إلى التيربو أو دبة التلوث',
      description_en: 'Heavy-duty cast iron or tubular headers collecting cylinder exhaust gases',
      aliases_ar: ['هدرز مكينة', 'منفول عادم', 'مانيفولد قزوز', 'شكمان مكينة'],
      aliases_en: ['Exhaust Header', 'Cast Exhaust Manifold'],
      search_keywords: ['هدرز', 'منفول عادم', 'exhaust manifold']
    },
    {
      id: 'pt-turbocharger-components',
      slug: 'turbocharger-components',
      name_ar: 'شاحن التيربو ومكوناته (التوربين ومفرغ الضغط)',
      name_en: 'Turbocharger & Actuator Components',
      description_ar: 'الشاحن التوربيني المدار بعادم المحرك لضغط الهواء الإضافي داخل الأسطوانات مع بوابات التنفيس',
      description_en: 'Exhaust-driven turbo assembly, wastegate actuator, blow-off valves and cartridge core',
      aliases_ar: ['تيربو سيارة', 'توربين محرك', 'شاحن توربيني', 'قلب تيربو'],
      aliases_en: ['Turbo Unit', 'Turbo Cartridge CHRA', 'Wastegate Actuator'],
      search_keywords: ['تيربو', 'توربين', 'turbocharger']
    }
  ]);
}

// ============================================================================
// 3. ELECTRICAL SYSTEM (cat-electrical-system) ENRICHMENT
// ============================================================================
const catElectrical = findCategory('cat-electrical-system');
if (catElectrical) {
  const subIgnition = ensureSubcategory(catElectrical, {
    id: 'sub-ignition-system',
    slug: 'ignition-system',
    name_ar: 'منظومة الإشعال وشمعات الاحتراق',
    name_en: 'Ignition & Spark Plugs',
    description_ar: 'شمعات الإشعال والكويلات وأسلاك البواجي وشمعات التسخين',
    description_en: 'Spark plugs, ignition coils, glow plugs and lead sets'
  });

  const subWiringSwitching = ensureSubcategory(catElectrical, {
    id: 'sub-wiring-relays-switches',
    slug: 'wiring-relays-switches',
    name_ar: 'الضفائر والمفاتيح والفيوزات والكتاوت',
    name_en: 'Harnesses, Switches, Fuses & Relays',
    description_ar: 'فيوزات الحماية وعلب الفيوزات والكتاوت وضفائر الأسلاك ومفاتيح التحكم',
    description_en: 'Fuses, relay switches, wiring harnesses, horn and steering column switches'
  });

  addPartTypes(subIgnition, [
    {
      id: 'pt-diesel-glow-plugs',
      slug: 'diesel-glow-plugs',
      name_ar: 'شمعات التسخين لمحركات الديزل (بواجي ديزل)',
      name_en: 'Diesel Glow Plugs',
      description_ar: 'شمعات التسخين الكهربائية المسبقة لغرف احتراق محركات الديزل لضمان سهولة التشغيل على البارد',
      description_en: 'High temperature pencil-type heating elements warming pre-combustion chambers',
      aliases_ar: ['بواجي ديزل', 'شمعات توهج', 'سخانات ديزل', 'شمعة تسخين'],
      aliases_en: ['Glow Plugs', 'Diesel Heater Plugs'],
      search_keywords: ['بواجي ديزل', 'سخانات ديزل', 'glow plugs']
    },
    {
      id: 'pt-ignition-wire-set',
      slug: 'ignition-wire-set',
      name_ar: 'طقم أسلاك البواجي (أسلاك الإشعال)',
      name_en: 'Ignition Spark Plug Wires / Leads Set',
      description_ar: 'كابلات نقل الجهد العالي من الديلكو أو الكويلات إلى شمعات الإشعال المعزولة بالسيليكون',
      description_en: 'High-tension silicone insulated spark plug cable set',
      aliases_ar: ['أسلاك بواجي', 'كابلات إشعال', 'وايرات بوجي'],
      aliases_en: ['HT Lead Set', 'Spark Plug Cables'],
      search_keywords: ['اسلاك بواجي', 'كابلات بواجي', 'spark plug wires']
    }
  ]);

  addPartTypes(subWiringSwitching, [
    {
      id: 'pt-automotive-relays',
      slug: 'automotive-relays',
      name_ar: 'كتاوت ومرحلات كهربائية (الريليهات)',
      name_en: 'Automotive Relays',
      description_ar: 'مفاتيح كهرومغناطيسية للتحكم في تشغيل طرمبة البنزين والمراوح والإنارة والأحمال العالية',
      description_en: 'Standard 4-pin and 5-pin SPDT / SPST automotive switching relays',
      aliases_ar: ['كتاوت سيارة', 'ريليهات', 'مرحل كهرباء', 'كتاوت نور وطرمبة'],
      aliases_en: ['Switching Relay', 'Micro Relay', 'Fuel Pump Relay'],
      search_keywords: ['كتاوت', 'ريليه', 'relay']
    },
    {
      id: 'pt-automotive-fuses-box',
      slug: 'automotive-fuses-box',
      name_ar: 'فيوزات وعلب الفيوزات (قواطع الحماية)',
      name_en: 'Automotive Fuses & Fuse Boxes',
      description_ar: 'فيوزات شفرية ومصهرات أمان لحماية الدوائر الكهربائية من الالتماس والجهد الزائد',
      description_en: 'Blade fuses (Mini, Standard, Maxi) and engine bay distribution fuse blocks',
      aliases_ar: ['فيوزات سيارة', 'علبة فيوزات', 'فيوز مكينة', 'علبة تأمين كهرباء'],
      aliases_en: ['Blade Fuse Pack', 'Engine Fuse Box Assembly'],
      search_keywords: ['فيوزات', 'علبة فيوزات', 'fuses']
    },
    {
      id: 'pt-wiring-harnesses',
      slug: 'wiring-harnesses',
      name_ar: 'ضفائر التوصيل الكهربائي وفيش الحساسات',
      name_en: 'Wiring Harnesses & Connector Pigtails',
      description_ar: 'حزم الأسلاك المعزولة وأفياش الحساسات والمكينة لتوصيل الإشارات والطاقة',
      description_en: 'Engine and chassis wiring harness looms, weatherproof plugs and pigtails',
      aliases_ar: ['ضفيرة مكينة', 'ضفيرة كهرباء', 'أفياش حساسات', 'جدلة أسلاك'],
      aliases_en: ['Engine Wire Loom', 'Sensor Pigtail Connector'],
      search_keywords: ['ضفيرة', 'اسلاك كهرباء', 'wiring harness']
    },
    {
      id: 'pt-car-horns',
      slug: 'car-horns',
      name_ar: 'أبواق وتنبيه السيارة (البوري / الهرن)',
      name_en: 'Car Horns (High & Low Tone)',
      description_ar: 'أبواق التحذير الصوتية ثنائية النغمة الكهرومغناطيسية',
      description_en: 'Dual snail or disc electric acoustic warning horns',
      aliases_ar: ['بوري سيارة', 'هرن', 'كلاكس', 'بوري حلزوني'],
      aliases_en: ['Electric Snail Horn', 'Twin Tone Horns'],
      search_keywords: ['بوري', 'هرن', 'horn']
    },
    {
      id: 'pt-steering-column-switch',
      slug: 'steering-column-switch',
      name_ar: 'مفاتيح التحكم وعصا الإشارات والمساحات',
      name_en: 'Steering Column Multi-Function Switch (Combination Switch)',
      description_ar: 'عصا ذراع التحكم بالأنوار العالية والإشارات ومساحات الزجاج الأمامي والخلفي',
      description_en: 'Stalk control assembly for turn signals, high beams, wiper modes and cruise control',
      aliases_ar: ['ذراع إشارات', 'عصا مساحات', 'مفتاح نور وفليشر', 'سويتش إشارات'],
      aliases_en: ['Turn Signal Stalk Switch', 'Wiper Switch Lever'],
      search_keywords: ['ذراع اشارات', 'عصا مساحات', 'switch']
    },
    {
      id: 'pt-airbag-clock-spring',
      slug: 'airbag-clock-spring',
      name_ar: 'شريحة بوري وعجلة القيادة (كلوك سبرينغ / شريط الإيرباق)',
      name_en: 'Airbag Clock Spring / Spiral Cable',
      description_ar: 'شريط الكابل الحلزوني الدوار لنقل إشارات الوسادة الهوائية والبوري وأزرار الدركسون',
      description_en: 'Rotary contact spiral electrical cable connecting steering wheel controls and airbag',
      aliases_ar: ['شريط ايرباق', 'شريحة بوري', 'حلزون دركسون', 'كلوك سبرنج'],
      aliases_en: ['Spiral Cable Clock Spring', 'Steering Wheel Slip Ring'],
      search_keywords: ['شريحة بوري', 'شريط ايرباق', 'clock spring']
    }
  ]);
}

// ============================================================================
// 4. SUSPENSION SYSTEM (cat-suspension-system) ENRICHMENT
// ============================================================================
const catSuspension = findCategory('cat-suspension-system');
if (catSuspension) {
  const subDampers = ensureSubcategory(catSuspension, {
    id: 'sub-dampers-springs',
    slug: 'dampers-springs',
    name_ar: 'المساعدات واليايات والسست',
    name_en: 'Shock Absorbers & Springs',
    description_ar: 'ممتصات الصدمات الهيدروليكية والغازية واليايات الحلزونية والورقية',
    description_en: 'Struts, dampers, coil springs and leaf springs'
  });

  const subArmsLinks = ensureSubcategory(catSuspension, {
    id: 'sub-control-arms-linkages',
    slug: 'control-arms-linkages',
    name_ar: 'المقصات والركب ومسامير التوازن والشيالات',
    name_en: 'Control Arms & Linkages',
    description_ar: 'أذرع التعليق والمقصات العلوية والسفلية وركب التعليق ومسامير عمود التوازن',
    description_en: 'Wishbones, control arms, ball joints and stabilizer links'
  });

  addPartTypes(subDampers, [
    {
      id: 'pt-leaf-springs',
      slug: 'leaf-springs',
      name_ar: 'ريش ونوابض التعليق الورقية (السست)',
      name_en: 'Suspension Leaf Springs',
      description_ar: 'شرائح النوابض الفولاذية لمركبات البيك أب والدفع الرباعي والحمولات الثقيلة',
      description_en: 'Multi-leaf steel spring packs providing heavy load suspension support',
      aliases_ar: ['سست سيارة', 'صفائح سست', 'ريش تعليق', 'سست شاصي'],
      aliases_en: ['Multi-Leaf Spring Pack', 'Rear Leaf Spring'],
      search_keywords: ['سست', 'ريش تعليق', 'leaf springs']
    },
    {
      id: 'pt-air-suspension-strut',
      slug: 'air-suspension-strut',
      name_ar: 'مساعدات وبالونات التعليق الهوائي (الهيدروليك)',
      name_en: 'Air Suspension Struts & Bags',
      description_ar: 'مساعدات هوائية وبالونات مطاطية مضغوطة بالهواء للسيارات الفاخرة وسيارات الدفع الرباعي',
      description_en: 'Pneumatic air spring strut assemblies and bellows for adaptive height control',
      aliases_ar: ['مساعدات هيدروليك', 'بالونات هواء', 'كمساعد هوائي', 'مساعدات لكزس ومرسيدس هواء'],
      aliases_en: ['Airmatic Strut', 'Pneumatic Spring Bellows'],
      search_keywords: ['مساعدات هيدروليك', 'بالونات هواء', 'air suspension']
    },
    {
      id: 'pt-strut-mount-bearing',
      slug: 'strut-mount-bearing',
      name_ar: 'كراسي وقواعد المساعدات مع الرولمان',
      name_en: 'Strut Mounts & Top Bearings',
      description_ar: 'قواعد التثبيت العلوية للمساعدات في جسم السيارة مع محمل التوجيه الدوراني',
      description_en: 'Upper shock tower mount bushings and integrated thrust steering bearings',
      aliases_ar: ['كراسي مساعدات', 'كرسي كمساعد فوق', 'قاعدة ياي علوية', 'رمان كرسي مساعد'],
      aliases_en: ['Upper Strut Mount', 'Strut Top Bearing Plate'],
      search_keywords: ['كراسي مساعدات', 'كرسي مساعد', 'strut mount']
    }
  ]);

  addPartTypes(subArmsLinks, [
    {
      id: 'pt-stabilizer-bushings',
      slug: 'stabilizer-bushings',
      name_ar: 'جلد وربلات عمود التوازن (بوشات الميزان)',
      name_en: 'Stabilizer / Sway Bar Bushings',
      description_ar: 'جلد مطاطية مقواة تثبت قضيب التوازن في الشاسيه لمنع الأصوات والاهتزازات',
      description_en: 'Split rubber or polyurethane sway bar D-bushings',
      aliases_ar: ['جلد ميزان', 'ربلات عمود توازن', 'جلب قضيب استقرار'],
      aliases_en: ['Anti-Roll Bar Bushing', 'Sway Bar Bushing Kit'],
      search_keywords: ['جلد ميزان', 'بوشات توازن', 'sway bar bushing']
    },
    {
      id: 'pt-suspension-repair-kit',
      slug: 'suspension-repair-kit',
      name_ar: 'أطقم تجديد وإصلاح التعليق الشاملة',
      name_en: 'Suspension Overhaul & Repair Kit',
      description_ar: 'طقم متكامل يجمع جلب المقصات ومسامير التوازن والركب لتجديد عضلات السيارة بالكامل',
      description_en: 'Complete front/rear front-end rebuild kit with arms, joints and links',
      aliases_ar: ['طقم عضلات سيارة', 'طقم مقصات وجلد كامل', 'عدة تجديد سسبنشن'],
      aliases_en: ['Front End Suspension Rebuild Kit', 'Control Arm Hardware Pack'],
      search_keywords: ['طقم عضلات', 'تجديد مقصات', 'suspension kit']
    }
  ]);
}

// ============================================================================
// 5. STEERING SYSTEM (cat-steering-system) ENRICHMENT
// ============================================================================
const catSteering = findCategory('cat-steering-system');
if (catSteering) {
  const subSteeringGear = ensureSubcategory(catSteering, {
    id: 'sub-steering-gear',
    slug: 'steering-gear',
    name_ar: 'علب ومضخات وأذرع التوجيه',
    name_en: 'Steering Racks, Pumps & Tie Rods',
    description_ar: 'دودة الدركسون وطلمبات الهيدروليك ونهايات أذرع التوجيه وجلد الحماية',
    description_en: 'Steering racks, power steering pumps, tie rods and rack gaiters'
  });

  addPartTypes(subSteeringGear, [
    {
      id: 'pt-electric-power-steering-column',
      slug: 'electric-power-steering-column',
      name_ar: 'موتور وعمود التوجيه الكهربائي (EPS)',
      name_en: 'Electric Power Steering (EPS) Motor & Column',
      description_ar: 'محرك المساندة الكهربائي المدمج بعمود عجلة القيادة مع وحدة التحكم التوجيهية',
      description_en: 'Column-mounted electric assist motor with integrated torque sensor and ECU',
      aliases_ar: ['دينمو دركسون كهرباء', 'عمود سكان كهربائي', 'موتور باور كهربائي'],
      aliases_en: ['EPS Assist Motor', 'Electric Steering Column'],
      search_keywords: ['دركسون كهرباء', 'سكان كهربائي', 'eps steering']
    },
    {
      id: 'pt-steering-knuckle',
      slug: 'steering-knuckle',
      name_ar: 'مفصل التوجيه والفلنجة (الشمعدان / ركبة العجل)',
      name_en: 'Steering Knuckle / Spindle',
      description_ar: 'المفصل الفولاذي الحامل لصرة العجلة ومجمع الكليبر ونهايات أذرع التوجيه والمساعد',
      description_en: 'Cast iron knuckle housing wheel hub assembly and linking to control arm and tie rod',
      aliases_ar: ['شمعدان عجلة', 'ركبة دركسون', 'سبندل كفر', 'مفصل محور العجلة'],
      aliases_en: ['Wheel Spindle Knuckle', 'Front Axle Knuckle'],
      search_keywords: ['شمعدان', 'ركبة عجل', 'steering knuckle']
    },
    {
      id: 'pt-steering-shaft-ujoint',
      slug: 'steering-shaft-ujoint',
      name_ar: 'عمود ومفاصل الدركسون (صليب الدودة)',
      name_en: 'Steering Intermediate Shaft & U-Joints',
      description_ar: 'العمود الوسيط الواصل بين مقود السائق ودودة الدركسون مع مفاصل صلبان الحركة المرنة',
      description_en: 'Intermediate universal joint shaft transferring rotation from column to rack',
      aliases_ar: ['صليب دركسون', 'عمود دركسون سفلي', 'مفصل عامود سكان'],
      aliases_en: ['Steering Coupler', 'Intermediate Universal Joint Shaft'],
      search_keywords: ['صليب دركسون', 'عمود دركسون', 'steering shaft']
    }
  ]);
}

// ============================================================================
// 6. ENGINE COOLING (cat-engine-cooling-system) ENRICHMENT
// ============================================================================
const catCooling = findCategory('cat-engine-cooling-system');
if (catCooling) {
  const subCooling = ensureSubcategory(catCooling, {
    id: 'sub-cooling-components',
    slug: 'cooling-components',
    name_ar: 'مكونات دورة التبريد والرديتر والمضخات',
    name_en: 'Cooling Circuit Components',
    description_ar: 'رديتر التبريد ومضخات الماء وبلف الحرارة والمراوح وقرب الاحتياط',
    description_en: 'Radiators, water pumps, thermostats, cooling fans and expansion reservoirs'
  });

  addPartTypes(subCooling, [
    {
      id: 'pt-radiator-cap',
      slug: 'radiator-cap',
      name_ar: 'غطاء الرديتر وقربة الماء المضغوط',
      name_en: 'Radiator & Expansion Tank Pressure Cap',
      description_ar: 'غطاء محكم بصمام ضغط محدد لرفع درجة غليان سائل التبريد وتنظيم تدفق المياه للقربة',
      description_en: 'Calibrated pressure relief radiator cap preventing boilover',
      aliases_ar: ['غطا رديتر', 'سدادة رديتر', 'غطاء قربة ماء ضغط'],
      aliases_en: ['Pressure Radiator Cap', 'Coolant Expansion Tank Cap'],
      search_keywords: ['غطاء رديتر', 'غطا رديتر', 'radiator cap']
    },
    {
      id: 'pt-engine-oil-cooler',
      slug: 'engine-oil-cooler',
      name_ar: 'مبرد زيت المحرك وناقل الحركة (رديتر الزيت)',
      name_en: 'Engine & Transmission Oil Cooler',
      description_ar: 'مبادل حراري يبرد زيت التزييت أو زيت القير بواسطة سائل تبريد المحرك أو تيار الهواء',
      description_en: 'Liquid-to-liquid heat exchanger or auxiliary radiator cooling lubricant',
      aliases_ar: ['مبرد زيت ماكينة', 'سربنتينة زيت قير', 'مبرد زيت قير تماتيك'],
      aliases_en: ['Transmission Fluid Cooler', 'Engine Oil Cooler Core'],
      search_keywords: ['مبرد زيت', 'رديتر زيت', 'oil cooler']
    },
    {
      id: 'pt-cooling-fan-controller',
      slug: 'cooling-fan-controller',
      name_ar: 'منظم وكتاوت سرعة مراوح الرديتر',
      name_en: 'Engine Cooling Fan Control Module',
      description_ar: 'وحدة إلكترونية أو مقاومة للتحكم في سرعات مراوح التبريد بناء على حرارة المحرك وحمل المكيف',
      description_en: 'Pulse-width modulated electronic fan control module',
      aliases_ar: ['كتاوت مروحة تبريد', 'كمبيوتر مروحة رديتر', 'مقاومة مروحة مكينة'],
      aliases_en: ['Fan Relay Controller', 'Pulse Fan Module'],
      search_keywords: ['منظم مروحة', 'كتاوت مروحة', 'fan controller']
    }
  ]);
}

// ============================================================================
// 7. FUEL SYSTEM (cat-fuel-system) ENRICHMENT
// ============================================================================
const catFuel = findCategory('cat-fuel-system');
if (catFuel) {
  const subFuel = ensureSubcategory(catFuel, {
    id: 'sub-fuel-delivery',
    slug: 'fuel-delivery',
    name_ar: 'مضخات وبخاخات وخزانات الوقود',
    name_en: 'Pumps, Injection & Fuel Tanks',
    description_ar: 'طرمبات الوقود وبخاخات الرش ومنظمات الضغط وخزانات الوقود',
    description_en: 'Electric in-tank pumps, high pressure GDI pumps, fuel injectors and fuel tanks'
  });

  addPartTypes(subFuel, [
    {
      id: 'pt-fuel-tank-cap',
      slug: 'fuel-tank-cap',
      name_ar: 'خزان الوقود وغطاء التانكي',
      name_en: 'Fuel Tank & Gas Cap Assembly',
      description_ar: 'خزان البنزين وموانع التسرب وغطاء الإحكام المزود بصمام تفريغ الضغط',
      description_en: 'Fuel tank reservoir and emission sealed tethered fuel cap',
      aliases_ar: ['تانكي بنزين', 'تانك بترول', 'غطاء تانكي سيارة'],
      aliases_en: ['Fuel Filler Gas Cap', 'Automotive Gas Tank'],
      search_keywords: ['تانكي بنزين', 'غطاء تانكي', 'fuel tank']
    },
    {
      id: 'pt-fuel-lines-hoses',
      slug: 'fuel-lines-hoses',
      name_ar: 'خراطيم ومواسير وقود الضغط العالي',
      name_en: 'High Pressure Fuel Lines & Feed Hoses',
      description_ar: 'مواسير فولاذية وخراطيم مطاطية مقواة لنقل البنزين والديزل من الخزان إلى مسطرة البخاخات',
      description_en: 'Rigid steel tubes and reinforced fuel lines resistant to high pressure and ethanol',
      aliases_ar: ['ليات بنزين', 'مواسير وقود', 'هوزات ديزل'],
      aliases_en: ['Fuel Delivery Line', 'Fuel Return Hose'],
      search_keywords: ['ليات بنزين', 'مواسير وقود', 'fuel lines']
    }
  ]);
}

// ============================================================================
// 8. EXHAUST SYSTEM (cat-exhaust-system) ENRICHMENT
// ============================================================================
const catExhaust = findCategory('cat-exhaust-system');
if (catExhaust) {
  const subExhaust = ensureSubcategory(catExhaust, {
    id: 'sub-exhaust-hardware',
    slug: 'exhaust-hardware',
    name_ar: 'شكمانات ودبات البيئة ومسار العادم',
    name_en: 'Mufflers, Catalysts & Exhaust Pipes',
    description_ar: 'كواتم الصوت ودبات التلوث ومواسير العادم وحساسات الشكمان',
    description_en: 'Silencers, catalytic converters, flex pipes and lambda sensors'
  });

  addPartTypes(subExhaust, [
    {
      id: 'pt-diesel-particulate-filter',
      slug: 'diesel-particulate-filter',
      name_ar: 'فلتر جسيمات الديزل (دبة الكربون DPF)',
      name_en: 'Diesel Particulate Filter (DPF)',
      description_ar: 'فلتر السيراميك الحبيبي المصمم لحجز السخام وجزيئات الكربون في سيارات الديزل الحديثة',
      description_en: 'Ceramic honeycomb soot trap trapping particulate matter in diesel exhaust systems',
      aliases_ar: ['فلتر ديزل DPF', 'دبة كربون ديزل', 'مصفي سخام'],
      aliases_en: ['DPF Filter Unit', 'Diesel Soot Filter'],
      search_keywords: ['فلتر ديزل', 'dpf', 'دبة ديزل']
    },
    {
      id: 'pt-exhaust-gaskets-hangers',
      slug: 'exhaust-gaskets-hangers',
      name_ar: 'قازقيتات وجلد شكمان العادم (حمالات الشكمان)',
      name_en: 'Exhaust Flange Gaskets & Rubber Hangers',
      description_ar: 'جوانات الإحكام الحرارية بين وصلات الشكمان والحمالات المطاطية الماصة للاهتزازات',
      description_en: 'Multi-layer exhaust flange gaskets and heavy duty rubber isolation mounting hangers',
      aliases_ar: ['وجه شكمان', 'جلد شكمان', 'كراسي قزوز مطاطية', 'قازقيت مجمع عادم'],
      aliases_en: ['Exhaust Flange Gasket', 'Exhaust Rubber Insulator Mount'],
      search_keywords: ['جلد شكمان', 'وجه شكمان', 'exhaust gasket']
    }
  ]);
}

// ============================================================================
// 9. TRANSMISSION (cat-gearbox-transmission) ENRICHMENT
// ============================================================================
const catTrans = findCategory('cat-gearbox-transmission');
if (catTrans) {
  const subClutch = ensureSubcategory(catTrans, {
    id: 'sub-clutch-mechanisms',
    slug: 'clutch-mechanisms',
    name_ar: 'منظومة القابض والدبرياج',
    name_en: 'Clutch Sets & Hydraulics',
    description_ar: 'صحن ودسك وفحامة الكلتش ومضخات القابض العلوية والسفلية',
    description_en: 'Clutch disc, pressure plates, release bearings and hydraulic cylinders'
  });

  const subTransmissionHardware = ensureSubcategory(catTrans, {
    id: 'sub-transmission-hardware',
    slug: 'transmission-hardware',
    name_ar: 'أجزاء ناقل الحركة اليدوي والآلي ومخ القير',
    name_en: 'Manual & Automatic Transmission Parts',
    description_ar: 'مخ القير وحساسات التعشيق وكراسي القير وعصا الشفتر',
    description_en: 'Valve bodies, torque converters, shifter cables and transmission mounts'
  });

  addPartTypes(subTransmissionHardware, [
    {
      id: 'pt-torque-converter',
      slug: 'torque-converter',
      name_ar: 'محول عزم الدوران (بطيخة / طنجرة القير الأوتوماتيك)',
      name_en: 'Automatic Transmission Torque Converter',
      description_ar: 'القارن الهيدروليكي السائل الذي ينقل عزم المحرك إلى القير الأوتوماتيكي بسلاسة',
      description_en: 'Fluid coupling device transferring rotating power from engine to transmission',
      aliases_ar: ['طنجرة قير', 'بطيخة قير تماتيك', 'تورك كونفرتر'],
      aliases_en: ['Torque Converter Assembly', 'Lock-up Torque Converter'],
      search_keywords: ['طنجرة قير', 'بطيخة قير', 'torque converter']
    },
    {
      id: 'pt-valve-body-solenoids',
      slug: 'valve-body-solenoids',
      name_ar: 'مخ القير ومحابس التعشيق الكهربائية (السولينويد)',
      name_en: 'Transmission Valve Body & Shift Solenoids',
      description_ar: 'اللوحة الهيدروليكية المركزية وصمامات التبديل الإلكترونية المسؤولة عن نقل نمر القير',
      description_en: 'Hydraulic control center directing pressurized ATF to clutches and bands via solenoids',
      aliases_ar: ['مخ قير تماتيك', 'بدي بلف', 'سولينويد جير', 'صمامات كهرباء القير'],
      aliases_en: ['Transmission Valve Body', 'Shift Solenoid Pack'],
      search_keywords: ['مخ قير', 'بدي بلف', 'valve body']
    },
    {
      id: 'pt-transmission-mount',
      slug: 'transmission-mount',
      name_ar: 'كرسي وقاعدة ناقل الحركة (كرسي القير)',
      name_en: 'Transmission Mount / Gearbox Mounting',
      description_ar: 'قاعدة تثبيت علبة التروس بالشاسيه لامتصاص اهتزازات وصدمات نقل الحركة',
      description_en: 'Heavy duty elastomeric isolator bracket supporting transmission assembly',
      aliases_ar: ['كرسي قير', 'قاعدة جير', 'كرسي فتيس', 'مخدة قير'],
      aliases_en: ['Rear Gearbox Mount', 'Automatic Transmission Insulator'],
      search_keywords: ['كرسي قير', 'قاعدة قير', 'transmission mount']
    },
    {
      id: 'pt-gear-shifter-cables',
      slug: 'gear-shifter-cables',
      name_ar: 'عصا وسلك تعشيق القير (واير القير)',
      name_en: 'Gear Shift Selector Cable & Assembly',
      description_ar: 'كابل الربط الميكانيكي بين عصا ناقل الحركة في المقصورة وذراع التعشيق على القير',
      description_en: 'Push-pull control cable translating console shifter movement to transmission range arm',
      aliases_ar: ['واير قير', 'سلك جير', 'عصا تعشيق', 'شفتر قير'],
      aliases_en: ['Shift Linkage Cable', 'Automatic Shifter Cable'],
      search_keywords: ['واير قير', 'سلك قير', 'shifter cable']
    }
  ]);
}

// ============================================================================
// 10. BODY & INTERIOR (cat-body-interior) ENRICHMENT
// ============================================================================
const catBody = findCategory('cat-body-interior');
if (catBody) {
  const subExterior = ensureSubcategory(catBody, {
    id: 'sub-exterior-panels',
    slug: 'exterior-panels',
    name_ar: 'الصدامات والرفارف والكبوت والأبواب',
    name_en: 'Exterior Panels & Bumpers',
    description_ar: 'صدامات السيارة الأمامية والخلفية والكبوت والرفارف والشبك ومرايا الرؤية',
    description_en: 'Bumpers, front grille, hoods, fenders, side mirrors and sheet panels'
  });

  const subInteriorMechanisms = ensureSubcategory(catBody, {
    id: 'sub-interior-and-mechanisms',
    slug: 'interior-and-mechanisms',
    name_ar: 'ماكينات الزجاج وأقفال الأبواب والمقابض',
    name_en: 'Window Regulators, Locks & Handles',
    description_ar: 'رافعات زجاج النوافذ الكهربائية وسنتر لوك الأبواب والمقابض ومساعدات الكبوت',
    description_en: 'Power window regulators, door lock actuators, handles and gas lifters'
  });

  addPartTypes(subExterior, [
    {
      id: 'pt-front-grille',
      slug: 'front-grille',
      name_ar: 'الشبك الأمامي وشبك الرديتر',
      name_en: 'Front Grille & Radiator Grill',
      description_ar: 'الشبك التزييني الأمامي الذي يسمح بتدفق الهواء لتبريد الرديتر مع شعار المركبة',
      description_en: 'Front fascia decorative grille with airflow cooling channels',
      aliases_ar: ['شبك واجهة', 'شبك رديتر', 'جريل أمامي', 'شبك صدام'],
      aliases_en: ['Radiator Grille Assembly', 'Front Center Grille'],
      search_keywords: ['شبك امامي', 'شبك واجهة', 'front grille']
    },
    {
      id: 'pt-engine-hood',
      slug: 'engine-hood',
      name_ar: 'غطاء المحرك (الكبوت)',
      name_en: 'Engine Hood / Bonnet',
      description_ar: 'الغطاء المعدني العلوي لحجرة المحرك مع عازل الحرارة والأقفال',
      description_en: 'Sheet metal front hood panel protecting engine bay',
      aliases_ar: ['كبوت مكينة', 'غطاء محرك', 'بونيت'],
      aliases_en: ['Front Engine Bonnet', 'Steel Hood Panel'],
      search_keywords: ['كبوت', 'غطاء محرك', 'hood']
    },
    {
      id: 'pt-side-view-mirrors',
      slug: 'side-view-mirrors',
      name_ar: 'مرايا الرؤية الجانبية وأغطيتها',
      name_en: 'Side View Mirrors & Housing Covers',
      description_ar: 'مرايا السائق والمعاون الكهربائية مع حساس النقطة العمياء وإشارات الانعطاف المدمجة',
      description_en: 'Power heated folding side rear view mirrors with turn indicators',
      aliases_ar: ['مرايا جانبية', 'مراية باب', 'غطاء مراية', 'زجاج مراية جانبية'],
      aliases_en: ['Door Mirror Assembly', 'Wing Mirror'],
      search_keywords: ['مرايا جانبية', 'مراية', 'side mirror']
    }
  ]);

  addPartTypes(subInteriorMechanisms, [
    {
      id: 'pt-window-regulator',
      slug: 'window-regulator',
      name_ar: 'ماكينة ورافعة زجاج النوافذ (دينمو القزاز)',
      name_en: 'Power Window Regulator & Motor',
      description_ar: 'آلية السلك أو المقص الكهربائية لرفع وخفض زجاج أبواب السيارة بسلاسة',
      description_en: 'Electric cable or scissor mechanism with drive motor raising and lowering door glass',
      aliases_ar: ['ماكينة قزاز', 'دينمو زجاج باب', 'منظم نافذة كهربائي', 'ماكينة رفع قزاز'],
      aliases_en: ['Door Window Lifter Mechanism', 'Power Window Motor and Regulator'],
      search_keywords: ['ماكينة قزاز', 'دينمو قزاز', 'window regulator']
    },
    {
      id: 'pt-door-lock-actuator',
      slug: 'door-lock-actuator',
      name_ar: 'قفل وكالون الباب الكهربائي (سنتر لوك)',
      name_en: 'Door Lock Actuator & Latch Assembly',
      description_ar: 'آلية القفل الإلكترونية المدمجة بالباب لقفل وفتح السيارة بالريموت والمفتاح',
      description_en: 'Integrated motorized door latch locking and unlocking via central security system',
      aliases_ar: ['كالون باب', 'سنتر لوك', 'قفل باب كهربائي', 'موتور قفل الباب'],
      aliases_en: ['Central Door Lock Motor', 'Door Latch Mechanism'],
      search_keywords: ['سنتر لوك', 'كالون باب', 'قفل باب', 'door lock']
    },
    {
      id: 'pt-door-handles',
      slug: 'door-handles',
      name_ar: 'مقابض الأبواب الخارجية والداخلية',
      name_en: 'Exterior & Interior Door Handles',
      description_ar: 'مقابض فتح الأبواب بتشطيب كروم أو مطلي مع حساس فتح البصمة الذكي',
      description_en: 'Outer door pull handles with keyless touch sensors and interior release levers',
      aliases_ar: ['مسكة باب', 'يد باب خارجية', 'مقبض باب داخلي', 'فتاحة باب'],
      aliases_en: ['Outer Door Handle', 'Inner Door Handle Lever'],
      search_keywords: ['مسكة باب', 'يد باب', 'door handle']
    },
    {
      id: 'pt-gas-struts-hood-trunk',
      slug: 'gas-struts-hood-trunk',
      name_ar: 'مساعدات وطلمبات رفع الكبوت والشنطة الغازية',
      name_en: 'Gas Springs / Struts for Hood & Tailgate',
      description_ar: 'مساعدات غازية هيدروليكية لرفع وتثبيت باب الشنطة الخلفية والكبوت بسهولة',
      description_en: 'Pressurized gas charged support struts lifting trunk lids and engine bonnets',
      aliases_ar: ['مساعدات كبوت', 'بستم شنطة', 'مساعد باب خلفي', 'ياي غازي'],
      aliases_en: ['Tailgate Gas Lift Supports', 'Hood Damper Struts'],
      search_keywords: ['مساعدات كبوت', 'بستم شنطة', 'gas struts']
    }
  ]);
}

// ============================================================================
// 11. LIGHTING (cat-lighting) ENRICHMENT
// ============================================================================
const catLighting = findCategory('cat-lighting');
if (catLighting) {
  const subLighting = ensureSubcategory(catLighting, {
    id: 'sub-lamps-bulbs',
    slug: 'lamps-bulbs',
    name_ar: 'المصابيح والأنوار واللمبات وأجهزة الزينون',
    name_en: 'Lamps, Bulbs & Xenon Ballasts',
    description_ar: 'الشمعات والأسطبات وكشافات الضباب ولمبات الهالوجين والـ LED ومحولات الزينون',
    description_en: 'Headlights, taillights, fog lights, LED bulbs and HID ballasts'
  });

  addPartTypes(subLighting, [
    {
      id: 'pt-fog-lights',
      slug: 'fog-lights',
      name_ar: 'كشافات ومصابيح الضباب (الشبورة)',
      name_en: 'Front Fog Light Assemblies',
      description_ar: 'مصابيح الإضاءة المركبة أسفل الصدام الأمامي لتحسين الرؤية في الأجواء الضبابية والترابية',
      description_en: 'Bumper-mounted wide-beam lamps penetrating fog, rain and dust conditions',
      aliases_ar: ['كشافات صدام', 'لمبات شبورة', 'فوانيس ضباب', 'كشافات ضباب سفلية'],
      aliases_en: ['Bumper Fog Lamp', 'Driving Fog Light'],
      search_keywords: ['كشافات ضباب', 'كشافات صدام', 'fog lights']
    },
    {
      id: 'pt-xenon-led-modules',
      slug: 'xenon-led-modules',
      name_ar: 'محولات وأجهزة تشغيل الزينون ووحدات LED',
      name_en: 'Xenon HID Ballasts & LED Control Modules',
      description_ar: 'محولات الجهد العالي الإلكترونية لتشغيل لمبات الزينون ووحدات إضاءة النهاري LED',
      description_en: 'Electronic ballast units and LED driver control power stages',
      aliases_ar: ['محول زينون', 'جهاز شمعة زينون', 'كمبيوتر ليتات LED', 'بالاست زينون'],
      aliases_en: ['HID Xenon Ballast', 'Headlight LED Driver Unit'],
      search_keywords: ['محول زينون', 'جهاز زينون', 'xenon ballast']
    },
    {
      id: 'pt-turn-signal-marker-lights',
      slug: 'turn-signal-marker-lights',
      name_ar: 'إشارات الانعطاف ولمبات الرفرف واللوحة',
      name_en: 'Turn Signals & License Plate Lights',
      description_ar: 'لمبات فليشر الإشارات الجانبية على الرفارف ومصابيح لوحة السيارة والرجوع للخلف',
      description_en: 'Side turn indicators, wing repeater lights, and rear registration plate lights',
      aliases_ar: ['إشارات رفرف', 'لمبات فليشر', 'إضاءة لوحة', 'لمبات ريوس'],
      aliases_en: ['Side Repeater Lamp', 'Number Plate Light'],
      search_keywords: ['اشارات رفرف', 'لمبات فليشر', 'turn signals']
    }
  ]);
}

// ============================================================================
// 12. OILS & FLUIDS (cat-oils-fluids) ENRICHMENT
// ============================================================================
const catOils = findCategory('cat-oils-fluids');
if (catOils) {
  const subOils = ensureSubcategory(catOils, {
    id: 'sub-lubricants-fluids',
    slug: 'lubricants-fluids',
    name_ar: 'زيوت وسوائل المحرك والنواقل ومياه التبريد',
    name_en: 'Engine Oils, Gear Lubes & Coolants',
    description_ar: 'زيوت المحركات التخليقية وزيوت القير وسوائل الفرامل والشحوم ومياه الرديتر',
    description_en: 'Full synthetic lubricants, transmission fluids, brake fluids and greases'
  });

  addPartTypes(subOils, [
    {
      id: 'pt-differential-gear-oil',
      slug: 'differential-gear-oil',
      name_ar: 'زيت الدفرنس وصندوق الدبل (زيت التروس 80W90 / 75W90)',
      name_en: 'Differential & Gear Oil (75W-90 / 80W-90 GL-5)',
      description_ar: 'زيت التروس ذو اللزوجة العالية والضغط الشديد لحماية دفرنس السيارة وصندوق الدبل',
      description_en: 'Extreme pressure hypoid gear lubricant formulated for axles and differentials',
      aliases_ar: ['زيت دفرنش', 'زيت كرونة', 'زيت تروس ثقيل', 'زيت دبل'],
      aliases_en: ['Hypoid Gear Lube', 'Axle Differential Fluid 75W-90'],
      search_keywords: ['زيت دفرنس', 'زيت كرونة', 'gear oil']
    },
    {
      id: 'pt-power-steering-fluid',
      slug: 'power-steering-fluid',
      name_ar: 'سائل وزيت نظام التوجيه المعزز (زيت الدركسون)',
      name_en: 'Power Steering Hydraulic Fluid',
      description_ar: 'زيت هيدروليكي خاص ومقاوم للرغوة لحماية طرمبة الدركسون ودودة التوجيه',
      description_en: 'Anti-wear hydraulic power steering fluid preventing seal degradation and pump whine',
      aliases_ar: ['زيت دركسون', 'زيت باور سكان', 'سائل باور ستيرنج'],
      aliases_en: ['Power Steering Fluid Synthetic', 'Steering Hydraulic Oil'],
      search_keywords: ['زيت دركسون', 'زيت باور', 'power steering fluid']
    },
    {
      id: 'pt-high-temp-grease',
      slug: 'high-temp-grease',
      name_ar: 'شحوم المحامل والتعليق والعكوس (شحم حراري)',
      name_en: 'High-Temperature Wheel Bearing & Chassis Grease',
      description_ar: 'شحم ليثيوم معقد عالي الحرارة لتزييت رمانات العجلات والعكوس ونقاط التعليق',
      description_en: 'Lithium complex extreme-pressure grease for wheel bearings and CV joints',
      aliases_ar: ['شحم رمانات', 'شحم حراري', 'شحم عكوس أزرق', 'شحم صلايب'],
      aliases_en: ['EP Wheel Bearing Grease', 'CV Joint Moly Grease'],
      search_keywords: ['شحم حراري', 'شحم رمانات', 'bearing grease']
    },
    {
      id: 'pt-adblue-diesel-exhaust-fluid',
      slug: 'adblue-diesel-exhaust-fluid',
      name_ar: 'سائل معالجة عادم الديزل (آدبلو / AdBlue DEF)',
      name_en: 'Diesel Exhaust Fluid (AdBlue / DEF)',
      description_ar: 'محلول اليوريا عالي النقاوة لحقن العادم والحد من انبعاثات أكاسيد النيتروجين في محركات الديزل',
      description_en: 'High-purity aqueous urea solution for SCR catalytic reduction in diesel vehicles',
      aliases_ar: ['سائل ادبلو', 'سائل دبة بيئة ديزل', 'محلول يوريا ديزل'],
      aliases_en: ['DEF Fluid', 'AdBlue Urea Solution'],
      search_keywords: ['ادبلو', 'adblue', 'def fluid']
    }
  ]);
}

// ============================================================================
// 13. SENSORS (cat-sensors) ENRICHMENT
// ============================================================================
const catSensors = findCategory('cat-sensors');
if (catSensors) {
  const subSensors = ensureSubcategory(catSensors, {
    id: 'sub-engine-sensors',
    slug: 'engine-sensors',
    name_ar: 'حساسات إدارة المحرك وحقن الوقود',
    name_en: 'Engine Management & Fuel Sensors',
    description_ar: 'حساسات الكرنك والكامات والهواء والضغط ودعسة الثروتل وحرارة المحرك',
    description_en: 'Crank, cam, MAF, MAP, throttle position and temperature sensors'
  });

  addPartTypes(subSensors, [
    {
      id: 'pt-throttle-position-sensor',
      slug: 'throttle-position-sensor',
      name_ar: 'حساس موقع صمام الخانق (حساس الثروتل TPS)',
      name_en: 'Throttle Position Sensor (TPS)',
      description_ar: 'حساس قياس زاوية فتح بوابة الهواء بدقة لنقل رغبة السائق بالتسارع إلى كمبيوتر المحرك',
      description_en: 'Potentiometer or Hall-effect sensor monitoring butterfly valve angle',
      aliases_ar: ['حساس ثروتل', 'حساس دعسة', 'سنسر ثروتل', 'حساس بوابة هواء'],
      aliases_en: ['TPS Sensor', 'Throttle Angle Sensor'],
      search_keywords: ['حساس ثروتل', 'حساس دعسة', 'tps sensor']
    },
    {
      id: 'pt-knock-sensor',
      slug: 'knock-sensor',
      name_ar: 'حساس الصفع والصرقعة (الاهتزاز بالمحرك)',
      name_en: 'Engine Knock / Detonation Sensor',
      description_ar: 'حساس بيزو كهربائي يرصد الاهتزازات الناتجة عن الاحتراق غير المنتظم لتعديل توقيت الإشعال',
      description_en: 'Piezoelectric sensor detecting pre-ignition pinging to delay timing advance',
      aliases_ar: ['حساس صرقعة', 'حساس صفع', 'نوك سنسر', 'حساس تصفيق مكينة'],
      aliases_en: ['Detonation Knock Sensor', 'Engine Ping Sensor'],
      search_keywords: ['حساس صرقعة', 'حساس صفع', 'knock sensor']
    },
    {
      id: 'pt-oil-pressure-sensor',
      slug: 'oil-pressure-sensor',
      name_ar: 'حساس ومفتاح ضغط زيت المحرك (ساعة الزيت)',
      name_en: 'Engine Oil Pressure Sensor / Switch',
      description_ar: 'حساس مراقبة ضغط التزييت داخل القنوات الرئيسية لتحذير السائق فور انخفاض الضغط',
      description_en: 'Pressure transducer or warning switch monitoring engine lube circuit psi',
      aliases_ar: ['ساعة زيت مكينة', 'صباع زيت', 'حساس لمبة الزيت', 'مفتاح ضغط زيت'],
      aliases_en: ['Oil Pressure Sending Unit', 'Oil Pressure Switch'],
      search_keywords: ['ساعة زيت', 'حساس زيت', 'oil pressure sensor']
    }
  ]);
}

// ============================================================================
// RE-CALCULATE METRICS & WRITE TO DISK
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
    version: '1.2.0',
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

console.log('✅ Canonical taxonomy enriched and regenerated successfully!');
console.log('Final Statistics:', finalOutput.metadata.counts);
