// ============================================================================
// ALALAMI — Automotive Parts Marketplace · Domain Types
// Mirrors the PostgreSQL schema documented in the project specification.
// ============================================================================

// ---------------------------------------------------------------------------
// Roles & Permissions (RBAC)
// ---------------------------------------------------------------------------

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SHOP_OWNER = 'SHOP_OWNER',
  SHOP_EMPLOYEE = 'SHOP_EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  /** @deprecated legacy alias kept for existing UI — maps to SHOP_OWNER. */
  SELLER = 'SELLER',
}

export type EffectiveRole =
  | UserRole.SUPER_ADMIN
  | UserRole.ADMIN
  | UserRole.SHOP_OWNER
  | UserRole.SHOP_EMPLOYEE
  | UserRole.CUSTOMER
  | UserRole.SELLER
  | 'GUEST';

export type PermissionKey =
  | 'products.view'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'inventory.view'
  | 'inventory.adjust'
  | 'inventory.import'
  | 'orders.view'
  | 'orders.update'
  | 'orders.confirm'
  | 'employees.view'
  | 'employees.create'
  | 'employees.update'
  | 'employees.delete'
  | 'branches.view'
  | 'branches.create'
  | 'branches.update'
  | 'branches.delete'
  | 'reports.view'
  | 'payments.view'
  | 'settings.manage'
  | 'customers.view'
  | 'reviews.moderate'
  | 'banners.manage'
  | 'complaints.moderate'
  | 'vehicles.manage'
  | 'categories.manage'
  | 'manufacturers.manage'
  | 'commissions.manage'
  | 'notifications.send'
  | 'audit.view';

export interface PermissionDefinition {
  key: PermissionKey;
  labelEn: string;
  labelAr: string;
  group: 'products' | 'inventory' | 'orders' | 'employees' | 'branches' | 'settings' | 'admin' | 'reports';
}

export const PERMISSIONS: PermissionDefinition[] = [
  { key: 'products.view', labelEn: 'View products', labelAr: 'عرض المنتجات', group: 'products' },
  { key: 'products.create', labelEn: 'Add products', labelAr: 'إضافة منتجات', group: 'products' },
  { key: 'products.update', labelEn: 'Edit products', labelAr: 'تعديل المنتجات', group: 'products' },
  { key: 'products.delete', labelEn: 'Delete products', labelAr: 'حذف المنتجات', group: 'products' },
  { key: 'inventory.view', labelEn: 'View inventory', labelAr: 'عرض المخزون', group: 'inventory' },
  { key: 'inventory.adjust', labelEn: 'Adjust stock', labelAr: 'تعديل المخزون', group: 'inventory' },
  { key: 'inventory.import', labelEn: 'Import stock (Excel/CSV)', labelAr: 'استيراد المخزون', group: 'inventory' },
  { key: 'orders.view', labelEn: 'View orders', labelAr: 'عرض الطلبات', group: 'orders' },
  { key: 'orders.update', labelEn: 'Update orders', labelAr: 'تحديث الطلبات', group: 'orders' },
  { key: 'orders.confirm', labelEn: 'Confirm orders', labelAr: 'تأكيد الطلبات', group: 'orders' },
  { key: 'employees.view', labelEn: 'View employees', labelAr: 'عرض الموظفين', group: 'employees' },
  { key: 'employees.create', labelEn: 'Add employees', labelAr: 'إضافة موظفين', group: 'employees' },
  { key: 'employees.update', labelEn: 'Edit employees & permissions', labelAr: 'تعديل الموظفين والصلاحيات', group: 'employees' },
  { key: 'employees.delete', labelEn: 'Delete employees', labelAr: 'حذف الموظفين', group: 'employees' },
  { key: 'branches.view', labelEn: 'View branches', labelAr: 'عرض الفروع', group: 'branches' },
  { key: 'branches.create', labelEn: 'Add branches', labelAr: 'إضافة فروع', group: 'branches' },
  { key: 'branches.update', labelEn: 'Edit branches', labelAr: 'تعديل الفروع', group: 'branches' },
  { key: 'branches.delete', labelEn: 'Delete branches', labelAr: 'حذف الفروع', group: 'branches' },
  { key: 'reports.view', labelEn: 'View reports', labelAr: 'عرض التقارير', group: 'reports' },
  { key: 'payments.view', labelEn: 'View payments', labelAr: 'عرض المدفوعات', group: 'settings' },
  { key: 'settings.manage', labelEn: 'Manage shop settings', labelAr: 'إدارة إعدادات المحل', group: 'settings' },
  { key: 'customers.view', labelEn: 'View customers', labelAr: 'عرض العملاء', group: 'admin' },
  { key: 'reviews.moderate', labelEn: 'Moderate reviews', labelAr: 'إدارة التقييمات', group: 'admin' },
  { key: 'banners.manage', labelEn: 'Manage banners', labelAr: 'إدارة البنرات', group: 'admin' },
  { key: 'complaints.moderate', labelEn: 'Moderate complaints', labelAr: 'إدارة الشكاوى', group: 'admin' },
  { key: 'vehicles.manage', labelEn: 'Manage vehicles', labelAr: 'إدارة السيارات', group: 'admin' },
  { key: 'categories.manage', labelEn: 'Manage categories', labelAr: 'إدارة الفئات', group: 'admin' },
  { key: 'manufacturers.manage', labelEn: 'Manage manufacturers', labelAr: 'إدارة الشركات المصنعة', group: 'admin' },
  { key: 'commissions.manage', labelEn: 'Manage commissions', labelAr: 'إدارة العمولات', group: 'admin' },
  { key: 'notifications.send', labelEn: 'Send notifications', labelAr: 'إرسال الإشعارات', group: 'admin' },
  { key: 'audit.view', labelEn: 'View audit log', labelAr: 'عرض سجل التدقيق', group: 'admin' },
];

/** Permission keys granted by default to each stored role. */
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  [UserRole.SUPER_ADMIN]: PERMISSIONS.map(p => p.key),
  [UserRole.ADMIN]: PERMISSIONS.map(p => p.key),
  [UserRole.SHOP_OWNER]: [
    'products.view', 'products.create', 'products.update', 'products.delete',
    'inventory.view', 'inventory.adjust', 'inventory.import',
    'orders.view', 'orders.update', 'orders.confirm',
    'employees.view', 'employees.create', 'employees.update', 'employees.delete',
    'branches.view', 'branches.create', 'branches.update', 'branches.delete',
    'reports.view', 'payments.view', 'settings.manage',
  ],
  [UserRole.SHOP_EMPLOYEE]: [
    'products.view', 'inventory.view', 'orders.view',
  ],
  [UserRole.CUSTOMER]: [],
  [UserRole.SELLER]: [
    'products.view', 'products.create', 'products.update', 'products.delete',
    'inventory.view', 'inventory.adjust', 'inventory.import',
    'orders.view', 'orders.update', 'orders.confirm',
    'employees.view', 'employees.create', 'employees.update', 'employees.delete',
    'branches.view', 'branches.create', 'branches.update', 'branches.delete',
    'reports.view', 'payments.view', 'settings.manage',
  ],
};

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSIONS.map(p => p.key);

// ---------------------------------------------------------------------------
// Location model (multi-country)
// ---------------------------------------------------------------------------

export interface Country {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  isActive: boolean;
}

export interface City {
  id: string;
  countryId: string;
  nameEn: string;
  nameAr: string;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export interface User {
  id: string;
  clerkUserId?: string;
  role: UserRole;
  fullName: string;
  name?: string;
  username: string;
  email: string;
  phone: string;
  countryId?: string;
  cityId?: string;
  city?: string;
  address?: string;
  passwordHash?: string;
  status: UserStatus;
  mustChangePassword?: boolean;
  avatarUrl?: string;
  /** Shop membership(s) — a user can belong to a shop in a given capacity. */
  shopMemberships?: ShopMembership[];
  /** @deprecated legacy single-shop binding (existing seller UI). */
  shopId?: string;
  /** Saved vehicles (garage). */
  garage?: SavedVehicle[];
  preferredCategories?: string[];
  ownedCarBrands?: string[];
  wallet?: { balance: number; currency?: string };
  createdAt?: string;
}

export interface ShopMembership {
  shopId: string;
  role: 'OWNER' | 'EMPLOYEE';
  /** null = not bound to a specific branch. */
  branchId?: string;
  isActive: boolean;
  /** Custom permission overrides for this membership (employee custom permissions). */
  permissions?: PermissionKey[];
}

// ---------------------------------------------------------------------------
// Shop / branches / employees
// ---------------------------------------------------------------------------

export enum ShopStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISABLED = 'DISABLED',
}

export enum CommissionType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export interface Shop {
  id: string;
  ownerId: string;
  /** Legacy single display name. */
  name: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  logoUrl?: string;
  coverUrl?: string;
  images?: string[];
  countryId: string;
  cityId?: string;
  city?: string;
  addressDetails?: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  workingHours?: string;
  services?: string[];
  status: ShopStatus;
  approvalNote?: string;
  commissionType?: CommissionType;
  commissionValue?: number;
  isActive: boolean;
  rating?: number;
  ratingCount?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface ShopBranch {
  id: string;
  shopId: string;
  nameEn: string;
  nameAr: string;
  countryId?: string;
  cityId?: string;
  city?: string;
  addressDetails?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsappNumber?: string;
  workingHours?: string;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Vehicle hierarchy — Make → Model → Generation → Engine
// ---------------------------------------------------------------------------

export interface VehicleMake {
  id: string;
  nhtsaMakeId?: number;
  nameEn: string;
  nameAr: string;
  slug?: string;
  logoUrl?: string;
  yearStart?: number;
  isActive: boolean;
  source?: 'nhtsa' | 'manual' | 'other';
}

export interface VehicleModel {
  id: string;
  makeId: string;
  nhtsaModelId?: number;
  nameEn: string;
  nameAr: string;
  slug?: string;
  isActive: boolean;
  source?: 'nhtsa' | 'manual' | 'other';
}

export interface VehicleModelYear {
  id: string;
  modelId: string;
  year: number;
  source?: string;
}

export interface VehicleSpec {
  id: string;
  modelId: string;
  yearId?: string;
  makeId: string;
  modelName: string;
  modelYear: number;
  trim?: string;
  series?: string;
  bodyClass?: string;
  doors?: number;
  engineModel?: string;
  engineCylinders?: number;
  engineDisplacementCc?: number;
  engineHp?: number;
  fuelType?: string;
  driveType?: string;
  transmissionStyle?: string;
  transmissionSpeeds?: string;
}

export interface UserVehicle {
  id: string;
  userId: string;
  makeId: string;
  modelId: string;
  yearId?: string;
  vehicleSpecId?: string;
  nickname?: string;
  vin?: string;
  isDefault: boolean;
  make?: { id: string; nameEn: string; nameAr: string };
  model?: { id: string; nameEn: string; nameAr: string };
  year?: number;
  specification?: Partial<VehicleSpec> & { engine?: string };
  createdAt?: string;
}

export interface VehicleAlias {
  id: string;
  entityType: 'make' | 'model';
  entityId: string;
  language: 'ar' | 'en';
  alias: string;
  normalizedAlias: string;
}

export interface VehicleGeneration {
  id: string;
  modelId: string;
  nameEn: string;
  nameAr: string;
  yearStart: number;
  yearEnd?: number;
}

export interface VehicleEngine {
  id: string;
  generationId: string;
  nameEn: string;
  nameAr: string;
  /** e.g. 2.4L I4, badge like "2.5L" */
  badge: string;
  fuelType?: 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
}

/** A product ↔ vehicle compatibility link. */
export interface VehicleFitment {
  id: string;
  productId: string;
  makeId: string;
  modelId: string;
  generationId?: string;
  engineId?: string;
  /** Denormalized breadcrumbs for fast search. */
  makeNameEn: string;
  makeNameAr: string;
  modelNameEn: string;
  modelNameAr: string;
  yearLabel?: string;
  engineBadge?: string;
}

export interface SavedVehicle {
  id: string;
  userId: string;
  makeId: string;
  modelId: string;
  generationId?: string;
  engineId?: string;
  nickname?: string;
  makeNameEn: string;
  makeNameAr: string;
  modelNameEn: string;
  modelNameAr: string;
  yearLabel?: string;
  engineBadge?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Catalog — categories, manufacturers, products
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  imageUrl?: string;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Master Automotive Parts Taxonomy (3-Tier Normalized Domain Models)
// ---------------------------------------------------------------------------

export interface PartCategory {
  id: string;
  parentId?: string | null;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartType {
  id: string;
  categoryId: string; // references subcategory PartCategory.id
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  sortOrder: number;
  isActive: boolean;
  aliasesAr?: string[];
  aliasesEn?: string[];
  searchKeywords?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PartAlias {
  id: string;
  partTypeId: string;
  language: 'ar' | 'en';
  alias: string;
  normalizedAlias: string;
  createdAt?: string;
}

export interface PartSearchKeyword {
  id: string;
  partTypeId: string;
  keyword: string;
  normalizedKeyword: string;
  language: 'ar' | 'en';
  createdAt?: string;
}

export interface TaxonomySearchResult {
  partType: PartType;
  category?: PartCategory;
  subcategory?: PartCategory;
  matchedOn: 'name_ar' | 'name_en' | 'alias_ar' | 'alias_en' | 'keyword';
  matchValue: string;
  score: number;
}

/** @deprecated legacy brand record (existing UI) — backed by vehicle makes. */
export interface CarBrand {
  id: string;
  nameEn: string;
  nameAr: string;
  logoUrl?: string;
}

/** @deprecated legacy part record (existing UI) — presentational view over Product. */
export interface Part {
  id: string;
  shopId: string;
  brandId?: string;
  manufacturerId?: string;
  categoryId: string;
  nameEn: string;
  nameAr: string;
  carBrand: string;
  carModel: string;
  yearRange: string;
  partNumber?: string;
  oemNumber?: string;
  condition: string; // 'New' | 'Used' | OEM codes (display string)
  rating: number;
  price: number;
  costPrice?: number;
  currency: string;
  stockQuantity: number;
  imageUrl: string;
  images?: string[];
  soldCount: number;
  isActive?: boolean;
  fitments?: VehicleFitment[];
  [key: string]: any;
}

/** @deprecated legacy sale record (existing UI) — transactional snapshot. */
export interface Sale {
  id: string;
  partId: string;
  sellerId: string;
  buyerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
}

export interface Manufacturer {
  id: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

export enum ProductCondition {
  NEW = 'NEW',
  USED = 'USED',
  OEM = 'OEM',
  AFTERMARKET = 'AFTERMARKET',
  REFURBISHED = 'REFURBISHED',
}

export enum PriceVisibility {
  SHOW_PRICE = 'SHOW_PRICE',
  HIDE_PRICE = 'HIDE_PRICE',
}

export enum SaleMode {
  ONLINE = 'ONLINE',
  EXTERNAL = 'EXTERNAL',
  BOTH = 'BOTH',
}

export interface Product {
  id: string;
  shopId: string;
  branchId?: string;
  brandId?: string; // legacy brand ref
  manufacturerId: string;
  categoryId: string;
  subcategoryId?: string;
  partTypeId?: string;
  nameEn: string;
  nameAr: string;
  /** Legacy convenience fields. */
  carBrand: string;
  carModel: string;
  yearRange: string;
  partNumber?: string;
  oemNumber?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  condition: ProductCondition;
  price: number;
  costPrice?: number;
  currency: string;
  priceVisibility: PriceVisibility;
  saleMode: SaleMode;
  quantity: number; // stock at listed branch
  stockQuantity: number; // legacy alias
  minStock?: number;
  imageUrl: string;
  images?: string[];
  barcode?: string;
  notes?: string;
  fitments: VehicleFitment[];
  tags?: string[];
  viewsCount?: number;
  salesCount?: number;
  soldCount: number;
  isActive: boolean;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SearchResult {
  product: Product;
  shop: Shop | undefined;
  branch: ShopBranch | undefined;
  score: number;
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  TRANSFER = 'TRANSFER',
  SALE = 'SALE', // legacy alias handled by OUT
  RESTOCK = 'RESTOCK', // legacy alias handled by IN
}

export interface StockMovement {
  id: string;
  productId: string;
  shopId: string;
  branchId?: string;
  type: StockMovementType;
  quantityChange: number;
  quantityAfter: number;
  reason?: string;
  referenceId?: string;
  userId: string;
  date: string;
  /** @deprecated legacy alias (existing admin UI). */
  partId?: string;
  /** @deprecated legacy alias (existing admin UI). */
  note?: string;
}

// ---------------------------------------------------------------------------
// Cart (multi-shop)
// ---------------------------------------------------------------------------

export interface CartItem {
  id: string;
  productId: string;
  shopId: string;
  branchId?: string;
  quantity: number;
  unitPrice: number;
  addedAt: string;
}

// ---------------------------------------------------------------------------
// Orders & order lifecycle
// ---------------------------------------------------------------------------

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CARD = 'CARD',
}

export enum DeliveryType {
  PICKUP = 'PICKUP',
  SHOP_DELIVERY = 'SHOP_DELIVERY',
  DELIVERY_COMPANY = 'DELIVERY_COMPANY',
}

export interface DeliveryAddress {
  id: string;
  userId: string;
  label?: string;
  countryId: string;
  cityId?: string;
  city?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  partNameEn: string;
  partNameAr: string;
  shopId: string;
  shopNameEn: string;
  shopNameAr: string;
  branchId?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  saleMode: SaleMode;
}

export interface OrderShopGroup {
  id: string;
  shopId: string;
  shopNameEn: string;
  shopNameAr: string;
  subtotal: number;
  currency: string;
  status: OrderStatus;
  commissionAmount?: number;
  itemsCount: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  deliveryAddressId?: string;
  notes?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  isExternal: boolean;
  items: OrderItem[];
  shopGroups: OrderShopGroup[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionRef?: string;
  createdAt: string;
  paidAt?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Shop commission
// ---------------------------------------------------------------------------

export interface ShopCommission {
  id: string;
  shopId: string;
  type: CommissionType;
  value: number;
  updatedBy: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Communication & moderation
// ---------------------------------------------------------------------------

export enum InboxType {
  EXTERNAL_REQUEST = 'EXTERNAL_REQUEST',
  CONTACT_MSG = 'CONTACT_MSG',
  SYSTEM = 'SYSTEM',
  REPLY = 'REPLY',
}

export interface InboxMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: InboxType;
  title: string;
  body: string;
  attachmentUrl?: string;
  requestId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ExternalSalesRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  carBrandId: string;
  carModel: string;
  modelYear: string;
  description: string;
  notes?: string;
  imageUrl: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  shopId: string;
  productId?: string;
  userId: string;
  userName: string;
  rating: number; // 1..5
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  orderId?: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  shopId?: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export enum NotificationType {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  INVENTORY = 'INVENTORY',
  MESSAGE = 'MESSAGE',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  imageUrl: string;
  link?: string;
  position: 'HOME_TOP' | 'HOME_MID' | 'SHOP';
  isActive: boolean;
  sortOrder: number;
}

export interface SearchLog {
  id: string;
  query: string;
  language: 'en' | 'ar';
  filters?: string;
  userId?: string;
  countryId?: string;
  cityId?: string;
  results?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  meta?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Website / platform settings
// ---------------------------------------------------------------------------

export interface WebsiteSettings {
  appNameEn: string;
  appNameAr: string;
  logoUrl: string;
  defaultLanguage: 'en' | 'ar';
  contactPhone: string;
  contactEmail: string;
  contactAddressEn: string;
  contactAddressAr: string;
  workingHoursEn: string;
  workingHoursAr: string;
  facebookUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
  tiktokUrl: string;
  youtubeUrl: string;
  footerTextEn: string;
  footerTextAr: string;
  /** Per-platform default commission applied to new shops. */
  defaultCommissionType?: CommissionType;
  defaultCommissionValue?: number;
  lowStockThreshold?: number;
  currency?: string;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface ReportFilters {
  from?: string;
  to?: string;
  countryId?: string;
  cityId?: string;
  shopId?: string;
}

export interface ReportSummary {
  activeUsers: number;
  approvedShops: number;
  products: number;
  orders: number;
  sales: number;
  commissions: number;
  payments: number;
  popularSearches: { query: string; count: number }[];
  popularVehicles: { label: string; count: number }[];
  shopPerformance: {
    shopId: string;
    shopName: string;
    orders: number;
    revenue: number;
    commission: number;
    rating: number;
  }[];
  salesByMonth: { month: string; revenue: number; orders: number }[];
  methodBreakdown: { name: string; value: number }[];
  categoryBreakdown: { name: string; value: number }[];
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export interface Wishlist {
  userId: string;
  productIds: string[];
}

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  [key: string]: { en: string; ar: string };
}

// ---------------------------------------------------------------------------
// API error — consistent error envelope (matches Laravel API contract)
// ---------------------------------------------------------------------------

export interface ApiErrorPayload {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
    this.errors = payload.errors;
  }
}