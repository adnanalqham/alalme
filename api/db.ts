// ============================================================================
// api/db.ts
// In-browser persistence layer that mirrors the PostgreSQL schema. Data is
// seeded once and persisted under a single localStorage key. Swapping this
// module for a real Laravel backend keeps service signatures unchanged.
// ============================================================================

import {
  AuditLog, Banner, Category, City, Complaint, ContactMessage, Country, ExternalSalesRequest,
  InboxMessage, Manufacturer, Notification, Order, OrderStatus, Payment, PriceVisibility,
  Product, ProductCondition, Review, Sale, SaleMode, SearchLog, Shop, ShopBranch,
  ShopStatus, StockMovement, StockMovementType, User, UserRole, UserStatus,
  VehicleEngine, VehicleFitment, VehicleGeneration, VehicleMake, VehicleModel,
  WebsiteSettings, CommissionType,
} from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const DB_KEY = 'ala2_db_v1';
const SEED_KEY = 'ala2_seeded_v1';

export interface Database {
  version: number;
  countries: Country[];
  cities: City[];
  users: User[];
  shops: Shop[];
  branches: ShopBranch[];
  components: never[];
  categories: Category[];
  manufacturers: Manufacturer[];
  makes: VehicleMake[];
  models: VehicleModel[];
  generations: VehicleGeneration[];
  engines: VehicleEngine[];
  fitments: VehicleFitment[];
  products: Product[];
  movements: StockMovement[];
  sales: Sale[];
  orders: Order[];
  payments: Payment[];
  reviews: Review[];
  complaints: Complaint[];
  notifications: Notification[];
  banners: Banner[];
  searchLogs: SearchLog[];
  auditLogs: AuditLog[];
  externalRequests: ExternalSalesRequest[];
  contactMessages: ContactMessage[];
  inboxMessages: InboxMessage[];
  settings: WebsiteSettings;
}

// ---------------------------------------------------------------------------
// Seeds
// ---------------------------------------------------------------------------

const YE = 'c_ye';
const SA = 'c_sa';
const AE = 'c_ae';

function seedCountries(): Country[] {
  return [
    { id: YE, code: 'YE', nameEn: 'Yemen', nameAr: 'اليمن', currency: 'YER', currencySymbol: 'ر.ي', phonePrefix: '+967', isActive: true },
    { id: SA, code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية', currency: 'SAR', currencySymbol: 'ر.س', phonePrefix: '+966', isActive: true },
    { id: AE, code: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات', currency: 'AED', currencySymbol: 'د.إ', phonePrefix: '+971', isActive: true },
  ];
}

function seedCities(): City[] {
  return [
    { id: 'ct_sanaa', countryId: YE, nameEn: "Sana'a", nameAr: 'صنعاء' },
    { id: 'ct_aden', countryId: YE, nameEn: 'Aden', nameAr: 'عدن' },
    { id: 'ct_taiz', countryId: YE, nameEn: 'Taiz', nameAr: 'تعز' },
    { id: 'ct_hodeidah', countryId: YE, nameEn: 'Hodeidah', nameAr: 'الحديدة' },
    { id: 'ct_riyadh', countryId: SA, nameEn: 'Riyadh', nameAr: 'الرياض' },
    { id: 'ct_jeddah', countryId: SA, nameEn: 'Jeddah', nameAr: 'جدة' },
    { id: 'ct_dammam', countryId: SA, nameEn: 'Dammam', nameAr: 'الدمام' },
    { id: 'ct_dubai', countryId: AE, nameEn: 'Dubai', nameAr: 'دبي' },
    { id: 'ct_abudhabi', countryId: AE, nameEn: 'Abu Dhabi', nameAr: 'أبوظبي' },
    { id: 'ct_sharjah', countryId: AE, nameEn: 'Sharjah', nameAr: 'الشارقة' },
  ];
}

function seedUsers(): User[] {
  return [
    {
      id: 'u1', role: UserRole.SUPER_ADMIN, fullName: 'System Admin', username: 'ad',
      email: 'admin@alalami.com', phone: '777000000', countryId: YE, cityId: 'ct_sanaa', city: "Sana'a",
      passwordHash: '123', status: UserStatus.ACTIVE, createdAt: '2023-01-01T08:00:00Z',
    },
    {
      id: 'u2', role: UserRole.SHOP_OWNER, fullName: 'Ahmed Ali', username: 'ahmed_parts',
      email: 'ahmed@barakah.com', phone: '777111111', countryId: YE, cityId: 'ct_aden', city: 'Aden',
      passwordHash: 'seller123', status: UserStatus.ACTIVE,
      shopMemberships: [{ shopId: 's1', role: 'OWNER', isActive: true, branchId: 'b1' }],
      createdAt: '2023-02-01T08:00:00Z',
    },
    {
      id: 'u3', role: UserRole.CUSTOMER, fullName: 'Salem Omar', username: 'salem99',
      email: 'salem@gmail.com', phone: '777222222', countryId: YE, cityId: 'ct_taiz', city: 'Taiz',
      passwordHash: 'cust123', status: UserStatus.ACTIVE,
      preferredCategories: ['c1', 'c2'], createdAt: '2023-03-01T08:00:00Z',
    },
    {
      id: 'u4', role: UserRole.SHOP_OWNER, fullName: 'Yasser Hassan', username: 'yasser',
      email: 'yasser@sanaaparts.com', phone: '777333333', countryId: YE, cityId: 'ct_sanaa', city: "Sana'a",
      passwordHash: 'owner123', status: UserStatus.ACTIVE,
      shopMemberships: [{ shopId: 's2', role: 'OWNER', isActive: true }],
      createdAt: '2023-04-01T08:00:00Z',
    },
    {
      id: 'u5', role: UserRole.SHOP_EMPLOYEE, fullName: 'Khalid Nasser', username: 'khalid',
      email: 'khalid@barakah.com', phone: '777444444', countryId: YE, cityId: 'ct_aden', city: 'Aden',
      passwordHash: 'employee123', status: UserStatus.ACTIVE,
      shopMemberships: [{
        shopId: 's1', role: 'EMPLOYEE', isActive: true,
        permissions: ['products.view', 'products.create', 'inventory.view', 'inventory.adjust', 'orders.view'],
      }],
      createdAt: '2023-05-01T08:00:00Z',
    },
    {
      id: 'u6', role: UserRole.ADMIN, fullName: 'Mona Saleh', username: 'admin1',
      email: 'mona@alalami.com', phone: '777555555', countryId: SA, cityId: 'ct_riyadh', city: 'Riyadh',
      passwordHash: 'admin123', status: UserStatus.ACTIVE, createdAt: '2023-06-01T08:00:00Z',
    },
    {
      id: 'u7', role: UserRole.CUSTOMER, fullName: 'Fatima Ahmed', username: 'fatima',
      email: 'fatima@gmail.com', phone: '777666666', countryId: SA, cityId: 'ct_jeddah', city: 'Jeddah',
      passwordHash: 'cust321', status: UserStatus.ACTIVE, createdAt: '2023-07-01T08:00:00Z',
    },
  ];
}

function seedShops(): Shop[] {
  return [
    {
      id: 's1', ownerId: 'u2', name: 'Al-Barakah Auto Parts',
      nameEn: 'Al-Barakah Auto Parts', nameAr: 'البركة لقطع غيار السيارات',
      descriptionEn: 'Specialized in Toyota and Hyundai parts.', descriptionAr: 'متخصصون في قطع تويوتا وهونداي.',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Toyota_EU.svg/2560px-Toyota_EU.svg.png',
      countryId: YE, cityId: 'ct_aden', city: 'Aden', addressDetails: 'Main Street, near Crater',
      latitude: 12.7855, longitude: 45.0187, phone: '777111111', whatsappNumber: '777111111',
      email: 'shop@barakah.com', workingHours: '08:00 AM - 09:00 PM',
      services: ['Brakes', 'Suspension', 'Electrical'], status: ShopStatus.APPROVED,
      commissionType: CommissionType.PERCENT, commissionValue: 5, isActive: true,
      rating: 4.7, ratingCount: 24, createdAt: '2023-01-01T10:00:00Z',
    },
    {
      id: 's2', ownerId: 'u4', name: "Sana'a Parts Center",
      nameEn: "Sana'a Parts Center", nameAr: 'مركز صنعاء لقطع الغيار',
      descriptionEn: 'Engine & cooling parts specialist.', descriptionAr: 'متخصصون في محركات وأنظمة التبريد.',
      countryId: YE, cityId: 'ct_sanaa', city: "Sana'a", addressDetails: 'Hadda Road, Sana\'a',
      latitude: 15.3483, longitude: 44.2075, phone: '777333333', whatsappNumber: '777333333',
      workingHours: '09:00 AM - 10:00 PM', services: ['Engine', 'Cooling'],
      status: ShopStatus.APPROVED, commissionType: CommissionType.PERCENT, commissionValue: 8,
      isActive: true, rating: 4.4, ratingCount: 12, createdAt: '2023-03-15T10:00:00Z',
    },
    {
      id: 's3', ownerId: 'u7', name: 'Mountain Auto Supply',
      nameEn: 'Mountain Auto Supply', nameAr: 'ماونتن لقطع الغيار',
      descriptionEn: 'General spare parts trader.', descriptionAr: 'تاجر قطع غيار عام.',
      countryId: YE, cityId: 'ct_taiz', city: 'Taiz', phone: '777777777',
      status: ShopStatus.PENDING, commissionType: CommissionType.PERCENT, commissionValue: 5,
      isActive: false, createdAt: '2026-09-01T10:00:00Z',
    },
  ];
}

function seedBranches(): ShopBranch[] {
  return [
    { id: 'b1', shopId: 's1', nameEn: 'Al-Barakah Main', nameAr: 'البركة الرئيسي', countryId: YE, cityId: 'ct_aden', city: 'Aden', addressDetails: 'Main Street, Crater', phone: '777111111', whatsappNumber: '777111111', workingHours: '08-21', isActive: true },
    { id: 'b2', shopId: 's1', nameEn: 'Al-Barakah Khormaksar', nameAr: 'البركة خور مكسر', countryId: YE, cityId: 'ct_aden', city: 'Aden', addressDetails: 'Khormaksar Market', phone: '777111112', isActive: true },
    { id: 'b3', shopId: 's2', nameEn: 'Sana\'a Center Hadda', nameAr: 'مركز صنعاء - حدة', countryId: YE, cityId: 'ct_sanaa', city: "Sana'a", addressDetails: 'Hadda Road', phone: '777333333', isActive: true },
  ];
}

function seedCategories(): Category[] {
  const names: [string, string][] = [
    ['Engine', 'المحرك'], ['Brakes', 'الفرامل'], ['Suspension', 'نظام التعليق'], ['Body', 'الهيكل'],
    ['Electrical', 'كهرباء'], ['Interior', 'داخلي'], ['Lights', 'أضواء'], ['Accessories', 'إكسسوارات'],
    ['Tires', 'إطارات'], ['Batteries', 'بطاريات'], ['Filters', 'فلاتر'], ['Transmission', 'ناقل الحركة'],
    ['Cooling', 'تبريد'], ['Steering', 'التهديد'], ['Exhaust', 'العادم'],
  ];
  return names.map(([en, ar], i) => ({ id: `c${i + 1}`, nameEn: en, nameAr: ar, isActive: true }));
}

function seedManufacturers(): Manufacturer[] {
  const names: [string, string][] = [
    ['Bosch', 'بوش'], ['Denso', 'دينسو'], ['NGK', 'NGK'], ['Brembo', 'بريمبو'], ['Textar', 'تيكستار'],
    ['Valeo', 'فاليو'], ['Garret', 'غاريت'], ['Torco', 'توركو'], ['Mann Filter', 'مان فلاتر'], ['Genuine OEM', 'وكيل أصلي'],
  ];
  return names.map(([en, ar], i) => ({ id: `mfr${i + 1}`, nameEn: en, nameAr: ar, isActive: true }));
}

function seedMakes(): VehicleMake[] {
  const makes: [string, string][] = [
    ['Toyota', 'تويوتا'], ['Hyundai', 'هونداي'], ['Kia', 'كيا'], ['Honda', 'هوندا'],
    ['Nissan', 'نيسان'], ['Chevrolet', 'شيفروليه'], ['Ford', 'فورد'], ['Mitsubishi', 'ميتسوبيشي'],
  ];
  return makes.map(([en, ar], i) => ({
    id: `mk${i + 1}`, nameEn: en, nameAr: ar,
    logoUrl: en === 'Toyota'
      ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Toyota_EU.svg/2560px-Toyota_EU.svg.png'
      : en === 'Hyundai'
        ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png'
        : en === 'Nissan'
          ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_logo.png/600px-Nissan_logo.png'
          : '',
    yearStart: 1990, isActive: true,
  }));
}

function seedModels(): VehicleModel[] {
  const defs: [string, number, string, string][] = [
    ['mk1', 1, 'Camry', 'كامري'], ['mk1', 2, 'Corolla', 'كورولا'], ['mk1', 3, 'Land Cruiser', 'لاندكروزر'],
    ['mk2', 4, 'Sonata', 'سوناتا'], ['mk2', 5, 'Elantra', 'إلنترا'], ['mk2', 6, 'Tucson', 'توسان'],
    ['mk3', 7, 'Cerato', 'سيراتو'], ['mk3', 8, 'Sportage', 'سبورتاج'],
    ['mk4', 9, 'Civic', 'سيفيك'], ['mk4', 10, 'Accord', 'أكورد'],
    ['mk5', 11, 'Sunny', 'صني'], ['mk5', 12, 'Patrol', 'باترول'],
    ['mk6', 13, 'Spark', 'سبارك'], ['mk6', 14, 'Silverado', 'سلفرادو'],
    ['mk7', 15, 'Focus', 'فوكس'], ['mk7', 16, 'Taurus', 'طورس'],
  ];
  return defs.map(([makeId, i, en, ar]) => ({ id: `md${i}`, makeId, nameEn: en, nameAr: ar, isActive: true }));
}

function seedGenerations(): VehicleGeneration[] {
  const defs: [string, number, number, string, string][] = [
    ['md1', 1, 2015, 'XV50 (2012-2017)', 'XV50 (2012-2017)'], ['md1', 2, 2018, 'XV70 (2018-2023)', 'XV70 (2018-2023)'],
    ['md2', 3, 2014, 'E170 (2014-2019)', 'E170 (2014-2019)'], ['md2', 4, 2020, 'E210 (2020+)', 'E210 (2020+)'],
    ['md4', 5, 2014, 'LF (2015-2018)', 'LF (2015-2018)'], ['md4', 6, 2019, 'DN8 (2019+)', 'DN8 (2019+)'],
    ['md5', 7, 2016, 'AD (2016-2020)', 'AD (2016-2020)'], ['md5', 8, 2021, 'CN7 (2021+)', 'CN7 (2021+)'],
    ['md11', 9, 2013, 'B18 (2013-2019)', 'B18 (2013-2019)'], ['md11', 10, 2020, 'B18 (2020+)', 'B18 (2020+)'],
    ['md12', 11, 2010, 'Y62 (2010+)', 'Y62 (2010+)'],
  ];
  return defs.map(([modelId, i, start, en, ar]) => ({
    id: `gen${i}`, modelId, nameEn: en, nameAr: ar, yearStart: start, yearEnd: start + 6,
  }));
}

function seedEngines(): VehicleEngine[] {
  const defs: [string, number, string, string, string][] = [
    ['gen1', 1, '2.5L I4', '2.5 لتر', 'GASOLINE'], ['gen2', 2, '2.5L I4', '2.5 لتر', 'GASOLINE'],
    ['gen3', 3, '1.8L I4', '1.8 لتر', 'GASOLINE'], ['gen4', 4, '1.8L I4', '1.8 لتر', 'GASOLINE'],
    ['gen5', 5, '2.0L I4', '2.0 لتر', 'GASOLINE'], ['gen6', 6, '2.5L I4', '2.5 لتر', 'GASOLINE'],
    ['gen7', 7, '1.6L I4', '1.6 لتر', 'GASOLINE'], ['gen8', 8, '1.6L I4', '1.6 لتر', 'GASOLINE'],
    ['gen9', 9, '1.5L I4', '1.5 لتر', 'GASOLINE'], ['gen10', 10, '1.5L I4', '1.5 لتر', 'GASOLINE'],
    ['gen11', 11, '4.0L V6', '4.0 لتر', 'GASOLINE'],
  ];
  return defs.map(([generationId, i, badge, ar, fuel]) => ({
    id: `en${i}`, generationId, nameEn: badge, nameAr: ar, badge, fuelType: fuel as VehicleEngine['fuelType'],
  }));
}

function seedProducts(): Product[] {
  const now = new Date().toISOString();
  const P = (p: Partial<Product> & Pick<Product, 'id' | 'shopId' | 'manufacturerId' | 'categoryId' | 'nameEn' | 'nameAr' | 'carBrand' | 'carModel' | 'yearRange' | 'condition' | 'price' | 'currency' | 'imageUrl' | 'fitments'>): Product => ({
    branchId: undefined,
    partNumber: undefined,
    oemNumber: undefined,
    saleMode: SaleMode.BOTH,
    priceVisibility: PriceVisibility.SHOW_PRICE,
    minStock: 5,
    barcode: undefined,
    notes: undefined,
    quantity: 10,
    stockQuantity: 10,
    costPrice: Math.round(p.price * 0.6),
    images: [p.imageUrl],
    brandId: 'mk1',
    isActive: true,
    soldCount: 0,
    createdAt: now,
    ...p,
  });
  return [
    P({
      id: 'p1', shopId: 's1', manufacturerId: 'mfr4', categoryId: 'c2', nameEn: 'Toyota Camry Brake Pads', nameAr: 'فحمات فرامل تويوتا كامري',
      carBrand: 'Toyota', carModel: 'Camry', yearRange: '2018-2022', condition: ProductCondition.NEW, price: 35, currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80',
      partNumber: '04465-48140', oemNumber: '04465-48140', barcode: '6901234567890',
      quantity: 20, stockQuantity: 20, soldCount: 5,
      fitments: [
        { id: 'ft1', productId: 'p1', makeId: 'mk1', modelId: 'md1', generationId: 'gen1', engineId: 'en1', makeNameEn: 'Toyota', makeNameAr: 'تويوتا', modelNameEn: 'Camry', modelNameAr: 'كامري', yearLabel: '2015-2023', engineBadge: '2.5L I4' },
        { id: 'ft2', productId: 'p1', makeId: 'mk1', modelId: 'md1', generationId: 'gen2', engineId: 'en2', makeNameEn: 'Toyota', makeNameAr: 'تويوتا', modelNameEn: 'Camry', modelNameAr: 'كامري', yearLabel: '2018-2023', engineBadge: '2.5L I4' },
      ],
    }),
    P({
      id: 'p2', shopId: 's1', manufacturerId: 'mfr1', categoryId: 'c7', nameEn: 'Hyundai Sonata Headlight', nameAr: 'شمعة أمامية هونداي سوناتا',
      carBrand: 'Hyundai', carModel: 'Sonata', yearRange: '2015-2019', condition: ProductCondition.USED, price: 45, currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1504215680905-41940179c463?auto=format&fit=crop&q=80',
      partNumber: '92101-L2000', oemNumber: '92101-L2000', priceVisibility: PriceVisibility.HIDE_PRICE, saleMode: SaleMode.EXTERNAL,
      quantity: 2, stockQuantity: 2, soldCount: 1,
      fitments: [
        { id: 'ft3', productId: 'p2', makeId: 'mk2', modelId: 'md4', generationId: 'gen5', engineId: 'en5', makeNameEn: 'Hyundai', makeNameAr: 'هونداي', modelNameEn: 'Sonata', modelNameAr: 'سوناتا', yearLabel: '2015-2019', engineBadge: '2.0L I4' },
      ],
    }),
    P({
      id: 'p3', shopId: 's2', manufacturerId: 'mfr2', categoryId: 'c1', nameEn: 'Nissan Patrol Oil Filter', nameAr: 'فلتر زيت نيسان باترول',
      carBrand: 'Nissan', carModel: 'Patrol', yearRange: '2010+', condition: ProductCondition.OEM, price: 18, currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80',
      partNumber: '15208-65F00', oemNumber: '15208-65F00', quantity: 35, stockQuantity: 35, soldCount: 8,
      fitments: [{ id: 'ft4', productId: 'p3', makeId: 'mk5', modelId: 'md12', generationId: 'gen11', engineId: 'en11', makeNameEn: 'Nissan', makeNameAr: 'نيسان', modelNameEn: 'Patrol', modelNameAr: 'باترول', yearLabel: '2010+', engineBadge: '4.0L V6' }],
    }),
    P({
      id: 'p4', shopId: 's2', manufacturerId: 'mfr3', categoryId: 'c5', nameEn: 'Toyota Corolla Spark Plugs (4pcs)', nameAr: 'بوجيهات تويوتا كورولا (4 قطع)',
      carBrand: 'Toyota', carModel: 'Corolla', yearRange: '2014-2019', condition: ProductCondition.NEW, price: 28, currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f8b03673b?auto=format&fit=crop&q=80',
      partNumber: '90919-01259', oemNumber: '90919-01259', quantity: 40, stockQuantity: 40, soldCount: 12,
      fitments: [{ id: 'ft5', productId: 'p4', makeId: 'mk1', modelId: 'md2', generationId: 'gen3', engineId: 'en3', makeNameEn: 'Toyota', makeNameAr: 'تويوتا', modelNameEn: 'Corolla', modelNameAr: 'كورولا', yearLabel: '2014-2019', engineBadge: '1.8L I4' }],
    }),
    P({
      id: 'p5', shopId: 's1', manufacturerId: 'mfr6', categoryId: 'c13', nameEn: 'Hyundai Elantra Radiator', nameAr: 'رادياتير هونداي إلنترا',
      carBrand: 'Hyundai', carModel: 'Elantra', yearRange: '2016-2020', condition: ProductCondition.AFTERMARKET, price: 68, currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f8b03673b?auto=format&fit=crop&q=80',
      partNumber: '25310-F2000', oemNumber: '25310-F2000', quantity: 6, stockQuantity: 6,
      fitments: [{ id: 'ft6', productId: 'p5', makeId: 'mk2', modelId: 'md5', generationId: 'gen7', engineId: 'en7', makeNameEn: 'Hyundai', makeNameAr: 'هونداي', modelNameEn: 'Elantra', modelNameAr: 'إلنترا', yearLabel: '2016-2020', engineBadge: '1.6L I4' }],
    }),
    P({
      id: 'p6', shopId: 's2', manufacturerId: 'mfr5', categoryId: 'c3', nameEn: 'Toyota Land Cruiser Shock Absorbers (Front, Pair)', nameAr: 'مساعدات أمامية تويوتا لاندكروزر (زوج)',
      carBrand: 'Toyota', carModel: 'Land Cruiser', yearRange: '2016-2021', condition: ProductCondition.NEW, price: 120, currency: 'USD',
      priceVisibility: PriceVisibility.HIDE_PRICE, saleMode: SaleMode.BOTH,
      imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80',
      partNumber: '48510-69595', oemNumber: '48510-69595', quantity: 4, stockQuantity: 4,
      fitments: [{ id: 'ft7', productId: 'p6', makeId: 'mk1', modelId: 'md3', makeNameEn: 'Toyota', makeNameAr: 'تويوتا', modelNameEn: 'Land Cruiser', modelNameAr: 'لاندكروزر', yearLabel: '2016-2021' }],
    }),
    P({
      id: 'p7', shopId: 's1', manufacturerId: 'mfr1', categoryId: 'c10', nameEn: 'Car Battery 60Ah (Bosch)', nameAr: 'بطارية سيارة 60 أمبير (بوش)',
      carBrand: 'Bosch', carModel: 'Universal', yearRange: 'Universal', condition: ProductCondition.AFTERMARKET, price: 95, currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1562664377-709f2c337eb2?auto=format&fit=crop&q=80',
      partNumber: 'B60-80-12', quantity: 15, stockQuantity: 15, fitments: [],
    }),
    P({
      id: 'p8', shopId: 's2', manufacturerId: 'mfr9', categoryId: 'c11', nameEn: 'Kia Sportage Air Filter', nameAr: 'فلتر هواء كيا سبورتاج',
      carBrand: 'Kia', carModel: 'Sportage', yearRange: '2016-2022', condition: ProductCondition.NEW, price: 14, currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80',
      partNumber: '28113-2S500', oemNumber: '28113-2S500', quantity: 25, stockQuantity: 25,
      fitments: [{ id: 'ft8', productId: 'p8', makeId: 'mk3', modelId: 'md8', generationId: 'gen7', engineId: 'en7', makeNameEn: 'Kia', makeNameAr: 'كيا', modelNameEn: 'Sportage', modelNameAr: 'سبورتاج', yearLabel: '2016-2022', engineBadge: '2.0L I4' }],
    }),
    P({
      id: 'p9', shopId: 's1', manufacturerId: 'mfr7', categoryId: 'c14', nameEn: 'Nissan Sunny Steering Rack', nameAr: 'طرمبة دركسون نيسان صني',
      carBrand: 'Nissan', carModel: 'Sunny', yearRange: '2013-2019', condition: ProductCondition.REFURBISHED, price: 85, currency: 'USD',
      priceVisibility: PriceVisibility.HIDE_PRICE, saleMode: SaleMode.EXTERNAL,
      imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f8b03673b?auto=format&fit=crop&q=80',
      partNumber: '49001-4M400', oemNumber: '49001-4M400', quantity: 3, stockQuantity: 3,
      fitments: [{ id: 'ft9', productId: 'p9', makeId: 'mk5', modelId: 'md11', generationId: 'gen9', engineId: 'en9', makeNameEn: 'Nissan', makeNameAr: 'نيسان', modelNameEn: 'Sunny', modelNameAr: 'صني', yearLabel: '2013-2019', engineBadge: '1.5L I4' }],
    }),
  ];
}

function seedMovements(): StockMovement[] {
  const mk = (id: string, productId: string, shopId: string, type: StockMovementType, quantityChange: number, quantityAfter: number, reason: string, userId: string, date: string): StockMovement =>
    ({ id, productId, shopId, branchId: shopId === 's1' ? 'b1' : 'b3', type, quantityChange, quantityAfter, reason, userId, date });
  return [
    mk('m1', 'p1', 's1', StockMovementType.IN, 25, 25, 'Initial stock', 'u2', '2023-10-01T09:00:00Z'),
    mk('m2', 'p1', 's1', StockMovementType.OUT, -5, 20, 'Sold to customers', 'u2', '2023-11-01T09:00:00Z'),
    mk('m3', 'p3', 's2', StockMovementType.IN, 40, 40, 'Initial stock', 'u4', '2023-11-10T09:00:00Z'),
    mk('m4', 'p3', 's2', StockMovementType.ADJUSTMENT, -5, 35, 'Damaged during stocktake', 'u4', '2023-12-01T09:00:00Z'),
  ];
}

function seedOrders(): Order[] {
  return [];
}

function seedBanners(): Banner[] {
  return [
    {
      id: 'bn1', titleEn: 'New arrivals at Al-Barakah', titleAr: 'وصل حديثاً في البركة', subtitleEn: 'Brake kits & electrical', subtitleAr: 'طقم فرامل وكهرباء',
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80', link: '/search', position: 'HOME_TOP', isActive: true, sortOrder: 1,
    },
    {
      id: 'bn2', titleEn: 'Trusted shops all over Yemen', titleAr: 'محلات موثوقة في كل اليمن', subtitleEn: 'Compare offers safely', subtitleAr: 'قارن العروض بأمان',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80', link: '/shops', position: 'HOME_MID', isActive: true, sortOrder: 2,
    },
  ];
}

function seedSales(): Sale[] {
  return [];
}

// ---------------------------------------------------------------------------
// DB access
// ---------------------------------------------------------------------------

export function emptyDB(): Database {
  return {
    version: 1,
    countries: [],
    cities: [],
    users: [],
    shops: [],
    branches: [],
    components: [],
    categories: [],
    manufacturers: [],
    makes: [],
    models: [],
    generations: [],
    engines: [],
    fitments: [],
    products: [],
    movements: [],
    sales: [],
    orders: [],
    payments: [],
    reviews: [],
    complaints: [],
    notifications: [],
    banners: [],
    searchLogs: [],
    auditLogs: [],
    externalRequests: [],
    contactMessages: [],
    inboxMessages: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function seedDB(): Database {
  const db = emptyDB();
  db.countries = seedCountries();
  db.cities = seedCities();
  db.users = seedUsers();
  db.shops = seedShops();
  db.branches = seedBranches();
  db.categories = seedCategories();
  db.manufacturers = seedManufacturers();
  db.makes = seedMakes();
  db.models = seedModels();
  db.generations = seedGenerations();
  db.engines = seedEngines();
  db.products = seedProducts();
  db.movements = seedMovements();
  db.sales = seedSales();
  db.orders = seedOrders();
  db.banners = seedBanners();
  applyDerived(db);
  return db;
}

/** Persist derived cross-references (shop rating, product rating). */
function applyDerived(db: Database): void {
  const reviews = db.reviews.filter(r => r.status === 'APPROVED');
  for (const shop of db.shops) {
    const rs = reviews.filter(r => r.shopId === shop.id);
    if (rs.length) {
      shop.rating = Math.round((rs.reduce((a, r) => a + r.rating, 0) / rs.length) * 10) / 10;
      shop.ratingCount = rs.length;
    }
  }
}

export function sanitizeDB(raw: any): Database {
  const seeded = seedDB();
  if (!raw || typeof raw !== 'object') return seeded;

  return {
    version: 1,
    countries: Array.isArray(raw.countries) && raw.countries.length ? raw.countries : seeded.countries,
    cities: Array.isArray(raw.cities) && raw.cities.length ? raw.cities : seeded.cities,
    users: Array.isArray(raw.users) && raw.users.length ? raw.users : seeded.users,
    shops: Array.isArray(raw.shops) ? raw.shops : seeded.shops,
    branches: Array.isArray(raw.branches) ? raw.branches : seeded.branches,
    components: [],
    categories: Array.isArray(raw.categories) && raw.categories.length ? raw.categories : seeded.categories,
    manufacturers: Array.isArray(raw.manufacturers) ? raw.manufacturers : seeded.manufacturers,
    makes: Array.isArray(raw.makes) && raw.makes.length ? raw.makes : seeded.makes,
    models: Array.isArray(raw.models) ? raw.models : seeded.models,
    generations: Array.isArray(raw.generations) ? raw.generations : seeded.generations,
    engines: Array.isArray(raw.engines) ? raw.engines : seeded.engines,
    fitments: Array.isArray(raw.fitments) ? raw.fitments : seeded.fitments,
    products: Array.isArray(raw.products) ? raw.products : seeded.products,
    movements: Array.isArray(raw.movements) ? raw.movements : seeded.movements,
    sales: Array.isArray(raw.sales) ? raw.sales : seeded.sales,
    orders: Array.isArray(raw.orders)
      ? raw.orders.map((o: any) => ({ ...o, shopGroups: Array.isArray(o.shopGroups) ? o.shopGroups : [] }))
      : seeded.orders,
    payments: Array.isArray(raw.payments) ? raw.payments : seeded.payments,
    reviews: Array.isArray(raw.reviews) ? raw.reviews : seeded.reviews,
    complaints: Array.isArray(raw.complaints) ? raw.complaints : seeded.complaints,
    notifications: Array.isArray(raw.notifications) ? raw.notifications : seeded.notifications,
    banners: Array.isArray(raw.banners) ? raw.banners : seeded.banners,
    searchLogs: Array.isArray(raw.searchLogs) ? raw.searchLogs : seeded.searchLogs,
    auditLogs: Array.isArray(raw.auditLogs) ? raw.auditLogs : seeded.auditLogs,
    externalRequests: Array.isArray(raw.externalRequests) ? raw.externalRequests : seeded.externalRequests,
    contactMessages: Array.isArray(raw.contactMessages) ? raw.contactMessages : seeded.contactMessages,
    inboxMessages: Array.isArray(raw.inboxMessages) ? raw.inboxMessages : seeded.inboxMessages,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(raw.settings || {}),
      logoUrl: (raw.settings?.logoUrl && raw.settings.logoUrl !== '/logo.svg') ? raw.settings.logoUrl : '/logo.png',
      appNameAr: raw.settings?.appNameAr || DEFAULT_SETTINGS.appNameAr || 'العالمي',
      appNameEn: raw.settings?.appNameEn || DEFAULT_SETTINGS.appNameEn || 'ALALAMI',
    },
  };
}

export function loadDB(): Database {
  if (localStorage.getItem(SEED_KEY) === null) {
    const seeded = seedDB();
    localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    localStorage.setItem(SEED_KEY, '1');
    return seeded;
  }
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return seedDB();
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeDB(parsed);
    // If parsed was missing settings or other fields, persist back sanitized
    if (!parsed?.settings || !parsed?.complaints || !parsed?.payments || !parsed?.fitments) {
      localStorage.setItem(DB_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return seedDB();
  }
}

function persist(map: (db: Database) => void): void {
  const db = loadDB();
  map(db);
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export const db = {
  get countries() { return loadDB().countries; },
  get cities() { return loadDB().cities; },
  get users() { return loadDB().users; },
  get shops() { return loadDB().shops; },
  get branches() { return loadDB().branches; },
  get categories() { return loadDB().categories; },
  get manufacturers() { return loadDB().manufacturers; },
  get makes() { return loadDB().makes; },
  get models() { return loadDB().models; },
  get generations() { return loadDB().generations; },
  get engines() { return loadDB().engines; },
  get fitments() { return loadDB().fitments; },
  get products() { return loadDB().products; },
  get movements() { return loadDB().movements; },
  get sales() { return loadDB().sales; },
  get orders() { return loadDB().orders; },
  get payments() { return loadDB().payments; },
  get reviews() { return loadDB().reviews; },
  get complaints() { return loadDB().complaints; },
  get notifications() { return loadDB().notifications; },
  get banners() { return loadDB().banners; },
  get searchLogs() { return loadDB().searchLogs; },
  get auditLogs() { return loadDB().auditLogs; },
  get externalRequests() { return loadDB().externalRequests; },
  get contactMessages() { return loadDB().contactMessages; },
  get inboxMessages() { return loadDB().inboxMessages; },
  get settings() { return loadDB().settings; },

  set countries(v) { persist(d => { d.countries = v; }); },
  set cities(v) { persist(d => { d.cities = v; }); },
  set users(v) { persist(d => { d.users = v; }); },
  set shops(v) { persist(d => { d.shops = v; }); },
  set branches(v) { persist(d => { d.branches = v; }); },
  set categories(v) { persist(d => { d.categories = v; }); },
  set manufacturers(v) { persist(d => { d.manufacturers = v; }); },
  set makes(v) { persist(d => { d.makes = v; }); },
  set models(v) { persist(d => { d.models = v; }); },
  set generations(v) { persist(d => { d.generations = v; }); },
  set engines(v) { persist(d => { d.engines = v; }); },
  set fitments(v) { persist(d => { d.fitments = v; }); },
  set products(v) { persist(d => { d.products = v; }); },
  set movements(v) { persist(d => { d.movements = v; }); },
  set sales(v) { persist(d => { d.sales = v; }); },
  set orders(v) { persist(d => { d.orders = v; }); },
  set payments(v) { persist(d => { d.payments = v; }); },
  set reviews(v) { persist(d => { d.reviews = v; applyDerived(d); }); },
  set complaints(v) { persist(d => { d.complaints = v; }); },
  set notifications(v) { persist(d => { d.notifications = v; }); },
  set banners(v) { persist(d => { d.banners = v; }); },
  set searchLogs(v) { persist(d => { d.searchLogs = v; }); },
  set auditLogs(v) { persist(d => { d.auditLogs = v; }); },
  set externalRequests(v) { persist(d => { d.externalRequests = v; }); },
  set contactMessages(v) { persist(d => { d.contactMessages = v; }); },
  set inboxMessages(v) { persist(d => { d.inboxMessages = v; }); },
  set settings(v) { persist(d => { d.settings = v; }); },

  /** Full snapshot for a reactive UI store. */
  snapshot(): Database {
    return loadDB();
  },

  persistAll(next: Database) {
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    localStorage.setItem(SEED_KEY, '1');
  },
};

export function resetDB(): void {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(SEED_KEY);
  loadDB();
}