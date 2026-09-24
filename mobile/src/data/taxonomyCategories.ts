export interface PartTypeItem {
  id: string;
  nameAr: string;
  nameEn: string;
  searchQuery: string;
}

export interface SubcategoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  partTypes: PartTypeItem[];
}

export interface MainCategoryItem {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  iconName: string;
  subcategories: SubcategoryItem[];
}

export const MASTER_CATEGORIES: MainCategoryItem[] = [
  {
    id: 'cat-brakes',
    slug: 'brakes',
    nameAr: 'منظومة الفرامل',
    nameEn: 'Brake System',
    iconName: 'car-brake-alert',
    subcategories: [
      {
        id: 'sub-friction',
        nameAr: 'أجزاء الاحتكاك والفرملة',
        nameEn: 'Brake Friction',
        partTypes: [
          { id: 'pt-1', nameAr: 'فحمات فرامل أمامية', nameEn: 'Front Brake Pads', searchQuery: 'فحمات فرامل امامية' },
          { id: 'pt-2', nameAr: 'فحمات فرامل خلفية', nameEn: 'Rear Brake Pads', searchQuery: 'فحمات فرامل خلفية' },
          { id: 'pt-3', nameAr: 'أحذية فرامل الطبلة (قماشات)', nameEn: 'Brake Shoes', searchQuery: 'قماشات فرامل' },
        ],
      },
      {
        id: 'sub-rotors',
        nameAr: 'أقراص وهوبات الفرامل',
        nameEn: 'Discs & Rotors',
        partTypes: [
          { id: 'pt-4', nameAr: 'قرص فرامل أمامي (هوب)', nameEn: 'Front Brake Rotor', searchQuery: 'هوب فرامل امامي' },
          { id: 'pt-5', nameAr: 'قرص فرامل خلفي (هوب)', nameEn: 'Rear Brake Rotor', searchQuery: 'هوب فرامل خلفي' },
          { id: 'pt-6', nameAr: 'طنبورة فرامل (درام)', nameEn: 'Brake Drum', searchQuery: 'طنبورة فرامل' },
        ],
      },
      {
        id: 'sub-hydraulics',
        nameAr: 'المنظومة الهيدروليكية',
        nameEn: 'Hydraulics & Calipers',
        partTypes: [
          { id: 'pt-7', nameAr: 'كليبر الفرامل (مقص)', nameEn: 'Brake Caliper', searchQuery: 'كليبر فرامل' },
          { id: 'pt-8', nameAr: 'أسطوانة الفرامل الرئيسية (ماستر)', nameEn: 'Master Cylinder', searchQuery: 'ماستر فرامل' },
          { id: 'pt-9', nameAr: 'زيت الفرامل الهيدروليكي', nameEn: 'Brake Fluid', searchQuery: 'زيت فرامل' },
        ],
      },
    ],
  },
  {
    id: 'cat-engine',
    slug: 'engine',
    nameAr: 'المحرك والميكانيكا',
    nameEn: 'Engine & Mechanical',
    iconName: 'engine',
    subcategories: [
      {
        id: 'sub-timing',
        nameAr: 'سير التايمن والسيور',
        nameEn: 'Timing & Belts',
        partTypes: [
          { id: 'pt-10', nameAr: 'سير التايمن (سير الكاتينة)', nameEn: 'Timing Belt', searchQuery: 'سير تايمن' },
          { id: 'pt-11', nameAr: 'جنزير المحرك والشدادات', nameEn: 'Timing Chain Kit', searchQuery: 'جنزير محرك' },
          { id: 'pt-12', nameAr: 'سير المجموعة والمكيف', nameEn: 'Serpentine Belt', searchQuery: 'سير مكينة' },
        ],
      },
      {
        id: 'sub-gaskets',
        nameAr: 'الجوانات والوجوه',
        nameEn: 'Gaskets & Seals',
        partTypes: [
          { id: 'pt-13', nameAr: 'وجه رأس السلندر (كازكيت)', nameEn: 'Head Gasket', searchQuery: 'وجه راس سلندر' },
          { id: 'pt-14', nameAr: 'وجه غطاء البلوف', nameEn: 'Valve Cover Gasket', searchQuery: 'وجه غطاء بلوف' },
          { id: 'pt-15', nameAr: 'صوفة كرانك أمامية وخلفية', nameEn: 'Crankshaft Seal', searchQuery: 'صوفة كرانك' },
        ],
      },
      {
        id: 'sub-mounts',
        nameAr: 'كراسي المحرك والقير',
        nameEn: 'Engine Mounts',
        partTypes: [
          { id: 'pt-16', nameAr: 'كرسي مكينة أمامي/يمين', nameEn: 'Front Engine Mount', searchQuery: 'كرسي مكينة' },
          { id: 'pt-17', nameAr: 'كرسي قير هيدروليكي', nameEn: 'Transmission Mount', searchQuery: 'كرسي قير' },
        ],
      },
    ],
  },
  {
    id: 'cat-suspension',
    slug: 'suspension',
    nameAr: 'التعليق والمساعدات',
    nameEn: 'Suspension & Steering',
    iconName: 'car-esp',
    subcategories: [
      {
        id: 'sub-struts',
        nameAr: 'المساعدات واليايات',
        nameEn: 'Shocks & Struts',
        partTypes: [
          { id: 'pt-18', nameAr: 'مساعد صدمات أمامي (جامبين)', nameEn: 'Front Shock Absorber', searchQuery: 'مساعدات امامية' },
          { id: 'pt-19', nameAr: 'مساعد صدمات خلفي', nameEn: 'Rear Shock Absorber', searchQuery: 'مساعدات خلفية' },
          { id: 'pt-20', nameAr: 'كرسي مساعد أمامي ومحمل', nameEn: 'Strut Mount Bearing', searchQuery: 'كرسي مساعد' },
        ],
      },
      {
        id: 'sub-arms',
        nameAr: 'المقصات والجلب',
        nameEn: 'Control Arms & Bushings',
        partTypes: [
          { id: 'pt-21', nameAr: 'مقص سفلي أمامي مع الركبة', nameEn: 'Lower Control Arm', searchQuery: 'مقص سفلي' },
          { id: 'pt-22', nameAr: 'جلبة مقص كوتشوك', nameEn: 'Control Arm Bushing', searchQuery: 'جلب مقصات' },
          { id: 'pt-23', nameAr: 'مسمار التوازن والميزان', nameEn: 'Sway Bar Link', searchQuery: 'مسمار توازن' },
        ],
      },
      {
        id: 'sub-steering-parts',
        nameAr: 'أذرعة ومجمع الدركسون',
        nameEn: 'Tie Rods & Steering',
        partTypes: [
          { id: 'pt-24', nameAr: 'ذراع دركسون خارجي (طارة)', nameEn: 'Outer Tie Rod End', searchQuery: 'ذراع دركسون خارجي' },
          { id: 'pt-25', nameAr: 'طرمبة باور دركسون', nameEn: 'Power Steering Pump', searchQuery: 'طرمبة دركسون' },
        ],
      },
    ],
  },
  {
    id: 'cat-filters',
    slug: 'filters',
    nameAr: 'الفلاتر والصيانة',
    nameEn: 'Filters & Servicing',
    iconName: 'filter-variant',
    subcategories: [
      {
        id: 'sub-air-oil',
        nameAr: 'فلاتر الهواء والزيوت',
        nameEn: 'Air & Oil Filtration',
        partTypes: [
          { id: 'pt-26', nameAr: 'فلتر زيت محرك أصلي', nameEn: 'Engine Oil Filter', searchQuery: 'فلتر زيت' },
          { id: 'pt-27', nameAr: 'فلتر هواء المكينة', nameEn: 'Engine Air Filter', searchQuery: 'فلتر هواء' },
          { id: 'pt-28', nameAr: 'فلتر مكيف الغمارة كربون', nameEn: 'Cabin Air Filter', searchQuery: 'فلتر مكيف' },
          { id: 'pt-29', nameAr: 'فلتر بنزين / ديزل', nameEn: 'Fuel Filter', searchQuery: 'فلتر بنزين' },
        ],
      },
      {
        id: 'sub-fluids',
        nameAr: 'الزيوت والسوائل المعتمدة',
        nameEn: 'Fluids & Lubricants',
        partTypes: [
          { id: 'pt-30', nameAr: 'زيت محرك تخليقي 5W-30', nameEn: 'Engine Oil 5W-30', searchQuery: 'زيت محرك' },
          { id: 'pt-31', nameAr: 'زيت قير أوتوماتيك ATF / CVT', nameEn: 'ATF / CVT Fluid', searchQuery: 'زيت قير' },
          { id: 'pt-32', nameAr: 'ماء رديتر مبرد أصلي 50/50', nameEn: 'Coolant Antifreeze', searchQuery: 'ماء رديتر' },
        ],
      },
    ],
  },
  {
    id: 'cat-electrical',
    slug: 'electrical',
    nameAr: 'الكهرباء والبطاريات',
    nameEn: 'Electrical & Battery',
    iconName: 'car-battery',
    subcategories: [
      {
        id: 'sub-power',
        nameAr: 'توليد الطاقة والبدء',
        nameEn: 'Starting & Charging',
        partTypes: [
          { id: 'pt-33', nameAr: 'دينامو شحن أصلي (مولد)', nameEn: 'Alternator', searchQuery: 'دينامو' },
          { id: 'pt-34', nameAr: 'سلف تشغيل المحرك (مارش)', nameEn: 'Starter Motor', searchQuery: 'سلف' },
          { id: 'pt-35', nameAr: 'بطارية سيارة جافة 70AH', nameEn: 'Car Battery 70Ah', searchQuery: 'بطارية' },
        ],
      },
      {
        id: 'sub-sensors',
        nameAr: 'الحساسات الإلكترونية',
        nameEn: 'Engine Sensors',
        partTypes: [
          { id: 'pt-36', nameAr: 'حساس شكمان أكسجين O2', nameEn: 'Oxygen O2 Sensor', searchQuery: 'حساس اكسجين' },
          { id: 'pt-37', nameAr: 'حساس كرانك وسيراميك', nameEn: 'Crankshaft Sensor', searchQuery: 'حساس كرانك' },
          { id: 'pt-38', nameAr: 'حساس هواء MAF', nameEn: 'Mass Air Flow Sensor', searchQuery: 'حساس هواء' },
        ],
      },
    ],
  },
  {
    id: 'cat-ignition',
    slug: 'ignition',
    nameAr: 'نظام الإشعال والبواجي',
    nameEn: 'Ignition & Plugs',
    iconName: 'flash',
    subcategories: [
      {
        id: 'sub-spark',
        nameAr: 'شمعات الاحتراق والكويلات',
        nameEn: 'Plugs & Coils',
        partTypes: [
          { id: 'pt-39', nameAr: 'بواجي إيريديوم ليزر (طقم)', nameEn: 'Laser Iridium Spark Plugs', searchQuery: 'بواجي' },
          { id: 'pt-40', nameAr: 'كويل إشعال كهربائي أصلي', nameEn: 'Ignition Coil', searchQuery: 'كويل' },
          { id: 'pt-41', nameAr: 'أسلاك بواجي سيليكون', nameEn: 'Spark Plug Wire Set', searchQuery: 'اسلاك بواجي' },
        ],
      },
    ],
  },
  {
    id: 'cat-cooling',
    slug: 'cooling',
    nameAr: 'التبريد والتكييف',
    nameEn: 'Cooling & AC',
    iconName: 'snowflake',
    subcategories: [
      {
        id: 'sub-radiator',
        nameAr: 'نظام تبريد المحرك',
        nameEn: 'Radiator & Water Pump',
        partTypes: [
          { id: 'pt-42', nameAr: 'رديتر ماء محرك ألمنيوم', nameEn: 'Engine Radiator', searchQuery: 'رديتر' },
          { id: 'pt-43', nameAr: 'طرمبة ماء تبريد (مضخة)', nameEn: 'Water Pump', searchQuery: 'طرمبة ماء' },
          { id: 'pt-44', nameAr: 'بلف حرارة ثرموستات', nameEn: 'Thermostat', searchQuery: 'بلف حرارة' },
        ],
      },
      {
        id: 'sub-ac',
        nameAr: 'تكييف الهواء والكمبروسر',
        nameEn: 'Air Conditioning',
        partTypes: [
          { id: 'pt-45', nameAr: 'كمبروسر مكيف أصلي', nameEn: 'AC Compressor', searchQuery: 'كمبروسر' },
          { id: 'pt-46', nameAr: 'سربنتينة مكيف أمامية (مكثف)', nameEn: 'AC Condenser', searchQuery: 'سربنتينة مكيف' },
          { id: 'pt-47', nameAr: 'ثلاجة مكيف داخلية (مبخر)', nameEn: 'AC Evaporator Core', searchQuery: 'ثلاجة مكيف' },
        ],
      },
    ],
  },
  {
    id: 'cat-body',
    slug: 'body',
    nameAr: 'الهيكل والبودي الخارجي',
    nameEn: 'Body & Exterior',
    iconName: 'car-door',
    subcategories: [
      {
        id: 'sub-bumpers',
        nameAr: 'الصدامات والشبك',
        nameEn: 'Bumpers & Grilles',
        partTypes: [
          { id: 'pt-48', nameAr: 'صدام أمامي مع فتحات الكشافات', nameEn: 'Front Bumper', searchQuery: 'صدام امامي' },
          { id: 'pt-49', nameAr: 'شبك واجهة كروم / نيكل', nameEn: 'Front Grille', searchQuery: 'شبك واجهة' },
          { id: 'pt-50', nameAr: 'بطانة صدام ورفرف بلاستيك', nameEn: 'Fender Liner', searchQuery: 'بطانة رفرف' },
        ],
      },
      {
        id: 'sub-mirrors-lights',
        nameAr: 'المرايا والإضاءة',
        nameEn: 'Mirrors & Lighting',
        partTypes: [
          { id: 'pt-51', nameAr: 'شمعة إضاءة أمامية LED / زينون', nameEn: 'Headlight Assembly', searchQuery: 'شمعة امامية' },
          { id: 'pt-52', nameAr: 'إسطب خلفي أصلي', nameEn: 'Tail Light Assembly', searchQuery: 'اسطب خلفي' },
          { id: 'pt-53', nameAr: 'مراية جانبية كهربائية مع إشارة', nameEn: 'Side View Mirror', searchQuery: 'مراية جانبية' },
        ],
      },
    ],
  },
];
