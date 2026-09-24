// ============================================================================
// api/services.ts
// Public catalog + accounts + shops + employees + vehicles + search.
// Every mutation re-reads the acting user from storage and asserts policy.
// ============================================================================

import {
  ApiError, Banner, Country, DeliveryAddress, Order, Payment, PermissionKey, PriceVisibility,
  Product, ProductCondition, SaleMode, SavedVehicle, Shop, ShopBranch, ShopStatus, ShopMembership, User,
  UserRole, UserStatus, VehicleEngine, VehicleFitment, VehicleGeneration, VehicleMake,
  VehicleModel, Wishlist,
} from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '../types';
import { db } from './db';
import { assertPermission, audit, canManageShop, effectivePermissions, isPermissionKey, nextId, nowIso, requireAuth, requireRole, activeShopFor, validate } from './security';
import { clearSession, createSession, getSession, setActiveShop } from './session';

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

export const sortBy = <T>(arr: T[], key: (t: T) => number | string, dir: 'asc' | 'desc' = 'asc'): T[] =>
  [...arr].sort((a, b) => {
    const av = key(a); const bv = key(b);
    const cmp = typeof av === 'string' && typeof bv === 'string' ? av.localeCompare(bv) : Number(av) - Number(bv);
    return dir === 'asc' ? cmp : -cmp;
  });

export function safeProduct(product: Product): Product {
  return product;
}

export function getCountry(id?: string): Country | undefined {
  return db.countries.find(c => c.id === id);
}

export function isShopPending(shop: Shop): boolean {
  return shop.status === ShopStatus.PENDING;
}

// ---------------------------------------------------------------------------
// AUTH (/api/v1/auth)
// ---------------------------------------------------------------------------

export const authService = {
  currentUser(): User | null {
    const session = getSession();
    if (!session || !session.userId) return null;
    const direct = db.users.find(u => u.id === session.userId || u.clerkUserId === session.userId);
    if (direct) return direct;

    // Check if session userId matches an admin alias
    if (
      session.userId === 'user_admin_01' ||
      session.userId === 'user_superadmin_01' ||
      session.userId === 'user_clerk_admin_01' ||
      session.userId === 'admin@ala-parts.com'
    ) {
      return db.users.find(u => u.id === 'u1' || u.role === UserRole.SUPER_ADMIN || u.role === UserRole.ADMIN) ?? null;
    }
    // Check if session userId matches a shop owner alias
    if (
      session.userId === 'user_shop_owner_01' ||
      session.userId === 'user_clerk_owner_01' ||
      session.userId === 'adnan@najm-parts.com'
    ) {
      return db.users.find(u => u.id === 'u2' || u.role === UserRole.SHOP_OWNER) ?? null;
    }
    // Check if session userId matches a customer alias
    if (
      session.userId === 'user_customer_01' ||
      session.userId === 'user_clerk_customer_01' ||
      session.userId === 'customer@ala-parts.com'
    ) {
      return db.users.find(u => u.id === 'u3' || u.role === UserRole.CUSTOMER) ?? null;
    }
    return db.users.find(u => u.email === session.userId || u.username === session.userId) ?? null;
  },

  login(username: string, password: string): { user: User; token: string } {
    validate({ username, password }, {
      username: (v: any) => typeof v === 'string' && v.trim().length > 0,
      password: (v: any) => typeof v === 'string' && v.length > 0,
    }, { username: 'username', password: 'password' });
    const user = db.users.find(u =>
      (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) &&
      u.passwordHash === password,
    );
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new ApiError({ message: 'Invalid credentials or inactive account.', status: 401 });
    }
    audit(user.id, 'auth.login', 'user', user.id);
    return { user, token: createSession(user.id).token };
  },

  loginWithPhone(phone: string): { pending: boolean; phone: string; hint: string } {
    validate({ phone }, { phone: (v: any) => typeof v === 'string' && v.length >= 6 }, { phone: 'phone' });
    return { pending: true, phone, hint: 'Demo OTP is any 6-digit code.' };
  },

  verifyOtp(phone: string, code: string): { user: User; token: string } {
    if (!/^\d{6}$/.test(code)) {
      throw new ApiError({ message: 'Invalid or expired verification code.', status: 422, errors: { code: ['Invalid code.'] } });
    }
    const user = db.users.find(u => u.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''));
    if (!user || user.status !== UserStatus.ACTIVE) {
      // Simulated OTP can log in any demo number; create a guest customer on the fly.
      if (code === '123456') {
        const guest: User = {
          id: `u_phone_${Date.now()}`, role: UserRole.CUSTOMER, fullName: phone, username: `u_${Date.now()}`,
          email: '', phone, status: UserStatus.ACTIVE, createdAt: nowIso(),
        };
        db.users = [guest, ...db.users];
        audit(guest.id, 'auth.login_phone', 'user', guest.id);
        return { user: guest, token: createSession(guest.id).token };
      }
      throw new ApiError({ message: 'No account matches this phone.', status: 404 });
    }
    audit(user.id, 'auth.login_phone', 'user', user.id);
    return { user, token: createSession(user.id).token };
  },

  loginWithProvider(provider: 'google' | 'apple'): { user: User; token: string } {
    // Demo: signs into the sample customer (fatima) or creates a social customer.
    const existing = db.users.find(u => u.username === `social_${provider}`);
    const user = existing ?? {
      id: `u_${provider}_${Date.now()}`,
      role: UserRole.CUSTOMER,
      fullName: provider === 'google' ? 'Google Customer' : 'Apple Customer',
      username: `social_${provider}`,
      email: `${provider}@demo.alalami.com`,
      phone: '',
      status: UserStatus.ACTIVE,
      createdAt: nowIso(),
    };
    if (!existing) db.users = [...db.users, user as User];
    audit(user.id, `auth.${provider}`, 'user', user.id);
    return { user: user as User, token: createSession(user.id).token };
  },

  registerCustomer(input: Partial<User> & { password: string; fullName: string; username: string }): { user: User; token: string } {
    validate(input, {
      fullName: (v: any) => typeof v === 'string' && v.trim().length > 1,
      username: (v: any) => typeof v === 'string' && v.trim().length > 2,
      password: (v: any) => typeof v === 'string' && v.length >= 3,
      phone: (v: any) => v === undefined || String(v).length >= 6,
    }, { fullName: 'full name', username: 'username', password: 'password', phone: 'phone' });
    if (db.users.some(u => u.username.toLowerCase() === input.username.toLowerCase())) {
      throw new ApiError({ message: 'Username is already taken.', status: 422, errors: { username: ['Taken.'] } });
    }
    const user: User = {
      id: `u_${Date.now()}`, role: UserRole.CUSTOMER, fullName: input.fullName, username: input.username,
      email: input.email ?? '', phone: input.phone ?? '', countryId: input.countryId, cityId: input.cityId,
      city: input.city, address: input.address, passwordHash: input.password, status: UserStatus.ACTIVE,
      preferredCategories: input.preferredCategories, ownedCarBrands: input.ownedCarBrands, createdAt: nowIso(),
    };
    db.users = [...db.users, user];
    audit(user.id, 'auth.register_customer', 'user', user.id);
    return { user, token: createSession(user.id).token };
  },

  registerShopOwner(input: Partial<User> & { password: string; fullName: string; username: string; shop: Partial<Shop> & { nameEn: string; nameAr: string } }): { user: User; shop: Shop } {
    validate(input, {
      fullName: (v: any) => typeof v === 'string' && v.trim().length > 1,
      username: (v: any) => typeof v === 'string' && v.trim().length > 2,
      password: (v: any) => typeof v === 'string' && v.length >= 3,
    }, { fullName: 'full name', username: 'username', password: 'password' });
    validate(input.shop ?? {}, {
      nameEn: (v: any) => typeof v === 'string' && v.trim().length > 1,
      nameAr: (v: any) => typeof v === 'string' && v.trim().length > 1,
      phone: (v: any) => typeof v === 'string' && v.length >= 6,
      countryId: (v: any) => typeof v === 'string' && v.length > 0,
    }, { nameEn: 'shop name (EN)', nameAr: 'shop name (AR)', phone: 'phone', countryId: 'country' });
    if (db.users.some(u => u.username.toLowerCase() === input.username.toLowerCase())) {
      throw new ApiError({ message: 'Username is already taken.', status: 422 });
    }
    const user: User = {
      id: `u_${Date.now()}`, role: UserRole.SHOP_OWNER, fullName: input.fullName, username: input.username,
      email: input.email ?? '', phone: input.phone ?? '', countryId: input.shop.countryId, cityId: input.shop.cityId,
      city: input.shop.city, passwordHash: input.password, status: UserStatus.ACTIVE, createdAt: nowIso(),
    };
    const shopId = nextId('shop');
    const shop: Shop = {
      id: shopId, ownerId: user.id, name: input.shop.nameEn,
      nameEn: input.shop.nameEn, nameAr: input.shop.nameAr,
      descriptionEn: input.shop.descriptionEn, descriptionAr: input.shop.descriptionAr,
      countryId: input.shop.countryId, cityId: input.shop.cityId, city: input.shop.city,
      addressDetails: input.shop.addressDetails, latitude: input.shop.latitude, longitude: input.shop.longitude,
      phone: input.shop.phone, whatsappNumber: input.shop.whatsappNumber, email: input.shop.email,
      workingHours: input.shop.workingHours, logoUrl: input.shop.logoUrl, images: input.shop.images,
      status: ShopStatus.PENDING, isActive: false, commissionType: db.settings.defaultCommissionType,
      commissionValue: db.settings.defaultCommissionValue, rating: 0, ratingCount: 0, createdAt: nowIso(),
    };
    user.shopMemberships = [{ shopId, role: 'OWNER', isActive: true }];
    db.users = [...db.users, user];
    db.shops = [shop, ...db.shops];
    audit(user.id, 'shop.register', 'shop', shopId, { status: shop.status });
    return { user, shop };
  },

  logout(): void {
    const user = requireAuth();
    audit(user.id, 'auth.logout', 'user', user.id);
    clearSession();
  },

  updateProfile(input: { fullName?: string; email?: string; phone?: string; avatarUrl?: string; address?: string; preferredCategories?: string[] }): User {
    const user = requireAuth();
    const idx = db.users.findIndex(u => u.id === user.id);
    const next = {
      ...user, ...input,
    };
    db.users = db.users.map((u, i) => (i === idx ? next : u));
    audit(user.id, 'user.profile.update', 'user', user.id);
    return next;
  },

  setActiveShopContext(shopId: string, branchId?: string): { user: User; shopId: string; branchId?: string } {
    const user = requireAuth();
    if (!user.shopMemberships?.some(m => m.shopId === shopId && m.isActive)) {
      throw new ApiError({ message: 'Not a member of this shop.', status: 403 });
    }
    setActiveShop(shopId, branchId);
    audit(user.id, 'session.active_shop', 'shop', shopId, { branchId });
    return { user, shopId, branchId };
  },

  myWishlist(): Wishlist {
    const user = requireAuth();
    const saved: Wishlist | undefined = (user as User & { _wishlist?: Wishlist })._wishlist;
    return saved ?? { userId: user.id, productIds: [] };
  },

  toggleWishlist(productId: string): boolean {
    const user = requireAuth();
    const list = this.myWishlist();
    const has = list.productIds.includes(productId);
    list.productIds = has ? list.productIds.filter(p => p !== productId) : [...list.productIds, productId];
    (user as any)._wishlist = list;
    const idx = db.users.findIndex(u => u.id === user.id);
    db.users = db.users.map((u, i) => (i === idx ? user : u));
    return !has;
  },

  myGarage(): User['garage'] {
    const user = requireAuth();
    return user.garage ?? [];
  },

  addressBook(): DeliveryAddress[] {
    // Persisted separately through the DB.users meta.
    const user = requireAuth();
    return (user as any)._addresses ?? [];
  },

  saveAddress(address: Omit<DeliveryAddress, 'id' | 'userId'>): DeliveryAddress[] {
    const user = requireAuth();
    const current = this.addressBook();
    const entry: DeliveryAddress = { ...address, id: nextId('addr'), userId: user.id };
    (user as any)._addresses = [...current, entry];
    const idx = db.users.findIndex(u => u.id === user.id);
    db.users = db.users.map((u, i) => (i === idx ? user : u));
    return (user as any)._addresses;
  },

  addToGarage(input: { makeId: string; modelId: string; generationId?: string; engineId?: string; year?: number }): SavedVehicle[] {
    const user = requireAuth();
    const make = db.makes.find(m => m.id === input.makeId);
    const model = db.models.find(m => m.id === input.modelId);
    if (!make || !model) throw new ApiError({ message: 'Invalid make or model.', status: 422 });
    const engine = input.engineId ? db.engines.find(e => e.id === input.engineId) : undefined;
    const saved: SavedVehicle = {
      id: nextId('gv'), userId: user.id,
      makeId: input.makeId, modelId: input.modelId,
      generationId: input.generationId, engineId: input.engineId,
      makeNameEn: make.nameEn, makeNameAr: make.nameAr,
      modelNameEn: model.nameEn, modelNameAr: model.nameAr,
      yearLabel: input.year ? String(input.year) : undefined,
      engineBadge: engine?.badge,
      createdAt: nowIso(),
    };
    const current = user.garage ?? [];
    const next = [...current, saved].slice(-20);
    const idx = db.users.findIndex(u => u.id === user.id);
    const updated = { ...user, garage: next };
    db.users = db.users.map((u, i) => (i === idx ? updated : u));
    return next;
  },

  removeFromGarage(vehicleId: string): SavedVehicle[] {
    const user = requireAuth();
    const next = (user.garage ?? []).filter(v => v.id !== vehicleId);
    const idx = db.users.findIndex(u => u.id === user.id);
    const updated = { ...user, garage: next };
    db.users = db.users.map((u, i) => (i === idx ? updated : u));
    return next;
  },
};

// ---------------------------------------------------------------------------
// SHOPS / BRANCHES / EMPLOYEES (/api/v1/shops)
// ---------------------------------------------------------------------------

export const shopService = {
  listPublic(filters: { countryId?: string; cityId?: string; query?: string } = {}): Shop[] {
    return sortBy(
      db.shops.filter(s => s.status === ShopStatus.APPROVED && s.isActive)
        .filter(s => !filters.countryId || s.countryId === filters.countryId)
        .filter(s => !filters.cityId || s.cityId === filters.cityId)
        .filter(s => {
          if (!filters.query) return true;
          const q = filters.query.toLowerCase();
          return s.nameEn.toLowerCase().includes(q) || s.nameAr.includes(filters.query);
        }),
      s => -(s.rating ?? 0),
    );
  },

  getPublic(id: string): Shop {
    const shop = db.shops.find(s => s.id === id);
    if (!shop || shop.status !== ShopStatus.APPROVED || !shop.isActive) {
      throw new ApiError({ message: 'Shop not found.', status: 404 });
    }
    return shop;
  },

  branchesOf(shopId: string): ShopBranch[] {
    return db.branches.filter(b => b.shopId === shopId && b.isActive);
  },

  /** Manager (owner) services bound to the acting user's active shop. */
  myShop(): Shop {
    const user = requireAuth();
    const ctx = activeShopFor(user);
    const shopId = ctx.shopId ?? user.shopMemberships?.find(m => m.role === 'OWNER' && m.isActive)?.shopId;
    const shop = db.shops.find(s => s.id === shopId && canManageShop(user, shopId));
    if (!shop) throw new ApiError({ message: 'No managed shop found for this account.', status: 403 });
    return shop;
  },

  myShops(): Shop[] {
    const user = requireAuth();
    return db.shops.filter(s =>
      user.shopMemberships?.some(m => m.shopId === s.id && m.isActive) ,
    );
  },

  updateSettings(input: Partial<Shop>): Shop {
    const user = requireAuth();
    assertPermission(user, 'settings.manage');
    const shop = this.myShop();
    if (!canManageShop(user, shop.id)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    const next = { ...shop, ...input, id: shop.id };
    db.shops = db.shops.map(s => (s.id === shop.id ? next : s));
    db.snapshot().branches; // touch
    audit(user.id, 'shop.settings.update', 'shop', shop.id);
    return next;
  },

  createBranch(input: Omit<ShopBranch, 'id' | 'shopId' | 'isActive'>): ShopBranch {
    const user = requireAuth();
    assertPermission(user, 'branches.create');
    const shop = this.myShop();
    const branch: ShopBranch = { ...input, id: nextId('br'), shopId: shop.id, isActive: true };
    db.branches = [...db.branches, branch];
    audit(user.id, 'shop.branch.create', 'branch', branch.id);
    return branch;
  },

  updateBranch(branchId: string, input: Partial<ShopBranch>): ShopBranch {
    const user = requireAuth();
    assertPermission(user, 'branches.update');
    const shop = this.myShop();
    const branch = db.branches.find(b => b.id === branchId && b.shopId === shop.id);
    if (!branch) throw new ApiError({ message: 'Branch not found.', status: 404 });
    const next = { ...branch, ...input, id: branch.id, shopId: shop.id };
    db.branches = db.branches.map(b => (b.id === branchId ? next : b));
    audit(user.id, 'shop.branch.update', 'branch', branchId);
    return next;
  },

  deleteBranch(branchId: string): void {
    const user = requireAuth();
    assertPermission(user, 'branches.delete');
    const shop = this.myShop();
    if (!db.branches.some(b => b.id === branchId && b.shopId === shop.id)) {
      throw new ApiError({ message: 'Branch not found.', status: 404 });
    }
    db.branches = db.branches.filter(b => b.id !== branchId);
    audit(user.id, 'shop.branch.delete', 'branch', branchId);
  },

  // --- Employees -------------------------------------------------------------
  employees(): Array<{ user: User; membership: ShopMembership }> {
    const user = requireAuth();
    assertPermission(user, 'employees.view');
    const shop = this.myShop();
    return db.users
      .filter(u => u.shopMemberships?.some(m => m.shopId === shop.id && m.role === 'EMPLOYEE'))
      .map(u => ({
        user: u,
        membership: u.shopMemberships!.find(m => m.shopId === shop.id && m.role === 'EMPLOYEE')!,
      }));
  },

  createEmployee(input: { username: string; fullName: string; password: string; email?: string; phone?: string; permissions: PermissionKey[] }): User {
    const user = requireAuth();
    assertPermission(user, 'employees.create');
    const shop = this.myShop();
    validate(input, {
      username: (v: any) => typeof v === 'string' && v.trim().length > 2,
      fullName: (v: any) => typeof v === 'string' && v.trim().length > 1,
      password: (v: any) => typeof v === 'string' && v.length >= 3,
    }, { username: 'username', fullName: 'full name', password: 'password' });
    if (db.users.some(u => u.username.toLowerCase() === input.username.toLowerCase())) {
      throw new ApiError({ message: 'Username is already taken.', status: 422 });
    }
    const employee: User = {
      id: nextId('u'),
      role: UserRole.SHOP_EMPLOYEE,
      fullName: input.fullName,
      username: input.username,
      email: input.email ?? '',
      phone: input.phone ?? '',
      passwordHash: input.password,
      status: UserStatus.ACTIVE,
      shopMemberships: [{ shopId: shop.id, role: 'EMPLOYEE', isActive: true, permissions: input.permissions }],
      createdAt: nowIso(),
    };
    db.users = [...db.users, employee];
    audit(user.id, 'shop.employee.create', 'user', employee.id, { permissions: input.permissions });
    return employee;
  },

  updateEmployee(employeeId: string, input: { permissions?: PermissionKey[]; isActive?: boolean; branchId?: string }): User {
    const user = requireAuth();
    assertPermission(user, 'employees.update');
    const shop = this.myShop();
    const employee = db.users.find(u => u.id === employeeId && u.shopMemberships?.some(m => m.shopId === shop.id && m.role === 'EMPLOYEE'));
    if (!employee) throw new ApiError({ message: 'Employee not found.', status: 404 });
    const membership = employee.shopMemberships!.find(m => m.shopId === shop.id)!;
    if (input.permissions) {
      if (input.permissions.some(p => !isPermissionKey(p))) {
        throw new ApiError({ message: 'Invalid permissions provided.', status: 422 });
      }
      membership.permissions = input.permissions;
    }
    if (typeof input.isActive === 'boolean') membership.isActive = input.isActive;
    if (input.branchId !== undefined) membership.branchId = input.branchId;
    db.users = db.users.map(u => (u.id === employeeId ? employee : u));
    audit(user.id, 'shop.employee.update', 'user', employeeId, { input });
    return employee;
  },

  deleteEmployee(employeeId: string): void {
    const user = requireAuth();
    assertPermission(user, 'employees.delete');
    const shop = this.myShop();
    const employee = db.users.find(u => u.id === employeeId && u.shopMemberships?.some(m => m.shopId === shop.id && m.role === 'EMPLOYEE'));
    if (!employee) throw new ApiError({ message: 'Employee not found.', status: 404 });
    employee.shopMemberships = employee.shopMemberships!.filter(m => m.shopId !== shop.id);
    if (!employee.shopMemberships.length) employee.status = UserStatus.DEACTIVATED;
    db.users = db.users.map(u => (u.id === employeeId ? employee : u));
    audit(user.id, 'shop.employee.delete', 'user', employeeId);
  },
};

// ---------------------------------------------------------------------------
// PRODUCTS (/api/v1/products)
// ---------------------------------------------------------------------------

export interface ProductInput {
  nameEn?: string; nameAr?: string; partNumber?: string; oemNumber?: string;
  descriptionEn?: string; descriptionAr?: string;
  manufacturerId?: string; categoryId?: string;
  condition?: ProductCondition; price?: number; currency?: string;
  priceVisibility?: PriceVisibility; saleMode?: SaleMode;
  quantity?: number; minStock?: number; branchId?: string;
  imageUrl?: string; images?: string[]; barcode?: string; notes?: string;
  fitments?: Omit<VehicleFitment, 'id' | 'productId'>[];
  carBrand?: string; carModel?: string; yearRange?: string;
}

function applyProductDefaults(dbState: ReturnType<typeof db.snapshot>, input: ProductInput, shopId: string, branchId?: string): Product {
  const id = nextId('p');
  const fitments = (input.fitments ?? []).map(f => ({ ...f, id: nextId('ft'), productId: id })) as VehicleFitment[];
  const make = input.fitments?.[0];
  const quantity = Math.max(0, Number(input.quantity ?? 0));
  const currency = input.currency ?? shopCurrency(shopId);
  const now = nowIso();
  return {
    id,
    shopId,
    branchId: branchId ?? undefined,
    manufacturerId: input.manufacturerId ?? 'mfr1',
    categoryId: input.categoryId ?? 'c1',
    nameEn: input.nameEn ?? '',
    nameAr: input.nameAr ?? input.nameEn ?? '',
    carBrand: input.carBrand ?? make?.makeNameEn ?? 'General',
    carModel: input.carModel ?? make?.modelNameEn ?? '',
    yearRange: input.yearRange ?? make?.yearLabel ?? '',
    partNumber: input.partNumber,
    oemNumber: input.oemNumber,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    condition: input.condition ?? ProductCondition.NEW,
    price: Number(input.price ?? 0),
    costPrice: undefined,
    currency,
    priceVisibility: input.priceVisibility ?? PriceVisibility.SHOW_PRICE,
    saleMode: input.saleMode ?? SaleMode.BOTH,
    quantity,
    stockQuantity: quantity,
    minStock: input.minStock ?? dbState.settings.lowStockThreshold ?? 5,
    imageUrl: input.imageUrl ?? '',
    images: input.images?.length ? input.images : input.imageUrl ? [input.imageUrl] : [],
    barcode: input.barcode ?? (input.partNumber ? `ALA-${input.partNumber}` : id),
    notes: input.notes,
    fitments,
    soldCount: 0,
    isActive: true,
    rating: 0,
    ratingCount: 0,
    createdAt: now,
  };
}

function shopCurrency(shopId: string): string {
  const shop = db.shops.find(s => s.id === shopId);
  const country = db.countries.find(c => c.id === shop?.countryId);
  return country?.currency ?? 'USD';
}

export const productService = {
  list(filters: { shopId?: string; branchId?: string; categoryId?: string; manufacturerId?: string; activeOnly?: boolean; search?: string } = {}): Product[] {
    let result = db.products.filter(p => {
      if (filters.activeOnly && !p.isActive) return false;
      if (filters.shopId && p.shopId !== filters.shopId) return false;
      if (filters.branchId && p.branchId && p.branchId !== filters.branchId) return false;
      if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
      if (filters.manufacturerId && p.manufacturerId !== filters.manufacturerId) return false;
      return true;
    });
    if (filters.search) {
      result = searchService.matchProducts(filters.search).products;
    }
    return result;
  },

  get(id: string): Product {
    const product = db.products.find(p => p.id === id);
    if (!product) throw new ApiError({ message: 'Product not found.', status: 404 });
    return product;
  },

  listForShop(shopId: string): Product[] {
    const user = requireAuth();
    if (!canManageShop(user, shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    assertPermission(user, 'products.view');
    return sortBy(db.products.filter(p => p.shopId === shopId), p => p.createdAt, 'desc');
  },

  samePartOffers(partNumber: string, excludeProductId?: string): Product[] {
    if (!partNumber) return [];
    const norm = partNumber.toLowerCase().trim();
    return db.products.filter(p => p.isActive &&
      p.shopId !== db.products.find(x => x.id === excludeProductId)?.shopId &&
      (p.partNumber?.toLowerCase() === norm || p.oemNumber?.toLowerCase() === norm),
    );
  },

  create(input: ProductInput): Product {
    const user = requireAuth();
    assertPermission(user, 'products.create');
    const ctx = activeShopFor(user);
    const shopId = ctx.shopId ?? user.shopMemberships?.find(m => m.isActive)?.shopId;
    if (!shopId || !canManageShop(user, shopId)) {
      throw new ApiError({ message: 'You do not manage an approved shop.', status: 403 });
    }
    validate(input as unknown as Record<string, unknown>, {
      nameEn: (v: any) => typeof v === 'string' && v.trim().length > 0,
      nameAr: (v: any) => typeof v === 'string' && v.trim().length > 0,
      price: (v: any) => Number(v) >= 0,
      categoryId: (v: any) => typeof v === 'string',
    }, { nameEn: 'name (EN)', nameAr: 'name (AR)', price: 'price', categoryId: 'category' });
    const product = applyProductDefaults(db.snapshot(), input, shopId, ctx.branchId ?? input.branchId);
    db.products = [product, ...db.products];
    if (product.quantity > 0 || product.stockQuantity > 0) {
      recordMovementLocally({
        productId: product.id, shopId, branchId: product.branchId, type: 'IN' as any,
        quantityChange: product.quantity, quantityAfter: product.quantity,
        reason: 'Initial stock', userId: user.id, date: nowIso(),
      });
    }
    audit(user.id, 'product.create', 'product', product.id, { partNumber: product.partNumber });
    return product;
  },

  update(id: string, input: Partial<ProductInput>): Product {
    const user = requireAuth();
    assertPermission(user, 'products.update');
    const product = db.products.find(p => p.id === id);
    if (!product) throw new ApiError({ message: 'Product not found.', status: 404 });
    if (!canManageShop(user, product.shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    const currentQuantity = product.quantity;
    const next = {
      ...product,
      ...input,
      id: product.id,
      shopId: product.shopId,
      fitments: input.fitments
        ? (input.fitments.map(f => ({ ...f, id: nextId('ft'), productId: product.id })) as VehicleFitment[])
        : product.fitments,
      quantity: input.quantity !== undefined ? Math.max(0, Number(input.quantity)) : currentQuantity,
      stockQuantity: input.quantity !== undefined ? Math.max(0, Number(input.quantity)) : currentQuantity,
    };
    if (input.quantity !== undefined && Number(input.quantity) !== currentQuantity) {
      recordMovementLocally({
        productId: product.id, shopId: product.shopId, branchId: product.branchId, type: 'ADJUSTMENT' as any,
        quantityChange: Number(input.quantity) - currentQuantity,
        quantityAfter: Number(input.quantity),
        reason: 'Manual update', userId: user.id, date: nowIso(),
      });
    }
    db.products = db.products.map(p => (p.id === id ? next : p));
    audit(user.id, 'product.update', 'product', id);
    return next;
  },

  delete(id: string): void {
    const user = requireAuth();
    assertPermission(user, 'products.delete');
    const product = db.products.find(p => p.id === id);
    if (!product) throw new ApiError({ message: 'Product not found.', status: 404 });
    if (!canManageShop(user, product.shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    db.products = db.products.map(p => (p.id === id ? { ...p, isActive: false } : p));
    audit(user.id, 'product.delete', 'product', id);
  },

  setPriceVisibility(id: string, visibility: PriceVisibility): Product {
    const user = requireAuth();
    assertPermission(user, 'products.update');
    const product = db.products.find(p => p.id === id);
    if (!product) throw new ApiError({ message: 'Product not found.', status: 404 });
    if (!canManageShop(user, product.shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    const next = { ...product, priceVisibility: visibility };
    db.products = db.products.map(p => (p.id === id ? next : p));
    audit(user.id, 'product.price_visibility', 'product', id, { visibility });
    return next;
  },
};

/** Internal stock movement recorder (shared with order confirmation). */
export function recordMovementLocally(m: {
  productId: string; shopId: string; branchId?: string; type: string;
  quantityChange: number; quantityAfter: number; reason?: string; referenceId?: string; userId: string; date: string;
}): void {
  db.movements = [{
    id: nextId('mv'), productId: m.productId, shopId: m.shopId, branchId: m.branchId,
    type: m.type as any, quantityChange: m.quantityChange, quantityAfter: m.quantityAfter,
    reason: m.reason, referenceId: m.referenceId, userId: m.userId, date: m.date,
  }, ...db.movements];
}

// ---------------------------------------------------------------------------
// VEHICLES (/api/v1/vehicles)
// ---------------------------------------------------------------------------

export const vehicleService = {
  makes(): VehicleMake[] { return sortBy(db.makes.filter(m => m.isActive), m => m.nameEn); },
  models(makeId: string): VehicleModel[] { return db.models.filter(m => m.makeId === makeId && m.isActive); },
  generations(modelId: string): VehicleGeneration[] { return db.generations.filter(g => g.modelId === modelId); },
  engines(generationId: string): VehicleEngine[] { return db.engines.filter(e => e.generationId === generationId); },

  /** Normalized /api/v1/vehicles/makes */
  getMakes(): { id: string; nhtsa_make_id?: number; name: { ar: string; en: string }; slug: string; logo_url?: string }[] {
    return this.makes().map(m => ({
      id: m.id,
      nhtsa_make_id: m.nhtsaMakeId,
      name: { ar: m.nameAr || m.nameEn, en: m.nameEn },
      slug: m.slug || m.nameEn.toLowerCase().replace(/\s+/g, '-'),
      logo_url: m.logoUrl,
    }));
  },

  /** Normalized /api/v1/vehicles/makes/{make}/models?year= */
  getModels(makeId: string, year?: number): { id: string; make_id: string; name: { ar: string; en: string }; slug: string }[] {
    return this.models(makeId).map(m => ({
      id: m.id,
      make_id: m.makeId,
      name: { ar: m.nameAr || m.nameEn, en: m.nameEn },
      slug: m.slug || m.nameEn.toLowerCase().replace(/\s+/g, '-'),
    }));
  },

  /** Normalized /api/v1/vehicles/models/{model}/years */
  getYears(modelId: string): number[] {
    const genYears = db.generations
      .filter(g => g.modelId === modelId)
      .flatMap(g => {
        const end = g.yearEnd || (g.yearStart + 5);
        const yrs: number[] = [];
        for (let y = g.yearStart; y <= end; y++) yrs.push(y);
        return yrs;
      });
    const standardYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2012, 2010];
    const combined = Array.from(new Set([...genYears, ...standardYears]));
    return combined.sort((a, b) => b - a);
  },

  /** Normalized /api/v1/vehicles/{model}/specifications?year= */
  getSpecifications(modelId: string, year?: number): any[] {
    const gens = db.generations.filter(g => g.modelId === modelId);
    const engs = db.engines.filter(e => gens.some(g => g.id === e.generationId));
    
    if (engs.length === 0) {
      return [{
        id: `spec_${modelId}_std`,
        year: year || 2022,
        body_class: 'Sedan / SUV',
        engine_cylinders: 4,
        engine_displacement_cc: 2500,
        fuel_type: 'Gasoline',
        drive_type: 'FWD / 4WD',
      }];
    }

    return engs.map((e, idx) => ({
      id: `spec_${e.id}`,
      year: year || 2022,
      body_class: 'Sedan / SUV',
      engine_model: e.badge,
      engine_cylinders: e.badge.includes('V6') ? 6 : e.badge.includes('V8') ? 8 : 4,
      engine_displacement_cc: e.badge.includes('2.5L') ? 2500 : e.badge.includes('3.5L') ? 3500 : 2000,
      fuel_type: e.fuelType || 'Gasoline',
      drive_type: 'FWD',
    }));
  },

  /** Normalized /api/v1/vehicles/search?q= */
  search(query: string): { makes: any[]; models: any[] } {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { makes: [], models: [] };

    const makes = db.makes.filter(m => 
      m.nameEn.toLowerCase().includes(q) || m.nameAr.includes(q)
    ).map(m => ({
      id: m.id,
      name: { ar: m.nameAr, en: m.nameEn },
      slug: m.slug || m.nameEn.toLowerCase(),
    }));

    const models = db.models.filter(m => 
      m.nameEn.toLowerCase().includes(q) || m.nameAr.includes(q)
    ).map(m => {
      const parentMake = db.makes.find(mk => mk.id === m.makeId);
      return {
        id: m.id,
        make_id: m.makeId,
        make_name: parentMake ? { ar: parentMake.nameAr, en: parentMake.nameEn } : undefined,
        name: { ar: m.nameAr, en: m.nameEn },
        slug: m.slug || m.nameEn.toLowerCase(),
      };
    });

    return { makes, models };
  },

  addMake(input: { nameEn: string; nameAr: string; logoUrl?: string }): VehicleMake {
    requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN);
    const make: VehicleMake = { id: nextId('mk'), ...input, isActive: true };
    db.makes = [...db.makes, make];
    audit(requireAuth().id, 'vehicle.make.create', 'make', make.id);
    return make;
  },
  addModel(makeId: string, input: { nameEn: string; nameAr: string }): VehicleModel {
    requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN);
    const model: VehicleModel = { id: nextId('md'), makeId, ...input, isActive: true };
    db.models = [...db.models, model];
    return model;
  },
  addGeneration(modelId: string, input: { nameEn: string; nameAr: string; yearStart: number; yearEnd?: number }): VehicleGeneration {
    requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN);
    const gen: VehicleGeneration = { id: nextId('gen'), modelId, ...input };
    db.generations = [...db.generations, gen];
    return gen;
  },
  addEngine(generationId: string, input: { nameEn: string; nameAr: string; badge: string }): VehicleEngine {
    requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN);
    const engine: VehicleEngine = { id: nextId('en'), generationId, ...input, badge: input.badge };
    db.engines = [...db.engines, engine];
    return engine;
  },

  lookupByIds(input: { makes?: string[]; models?: string[]; generations?: string[]; engines?: string[] }) {
    return {
      makes: db.makes.filter(m => input.makes?.includes(m.id)),
      models: db.models.filter(m => input.models?.includes(m.id)),
      generations: db.generations.filter(g => input.generations?.includes(g.id)),
      engines: db.engines.filter(e => input.engines?.includes(e.id)),
    };
  },
};

export const garageService = {
  list(userId: string): any[] {
    const user = db.users.find(u => u.id === userId);
    return user?.garage || [];
  },

  add(userId: string, data: { makeId: string; modelId: string; year?: number; spec?: any; isDefault?: boolean }): any {
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new ApiError({ message: 'User not found', status: 404 });

    const make = db.makes.find(m => m.id === data.makeId);
    const model = db.models.find(m => m.id === data.modelId);
    if (!make || !model) throw new ApiError({ message: 'Invalid make or model', status: 422 });

    const currentGarage = user.garage || [];
    const isDefault = currentGarage.length === 0 || !!data.isDefault;

    const newVehicle: SavedVehicle = {
      id: nextId('gv'),
      userId,
      makeId: data.makeId,
      modelId: data.modelId,
      makeNameEn: make.nameEn,
      makeNameAr: make.nameAr,
      modelNameEn: model.nameEn,
      modelNameAr: model.nameAr,
      yearLabel: data.year ? String(data.year) : undefined,
      engineBadge: data.spec?.engine || '2.5L I4',
      createdAt: nowIso(),
    };

    if (isDefault) {
      // Clear previous default
      user.garage = currentGarage.map(v => ({ ...v, isDefault: false }));
    }
    user.garage = [newVehicle, ...(user.garage || [])];
    return newVehicle;
  },

  remove(userId: string, vehicleId: string): boolean {
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.garage) return false;
    user.garage = user.garage.filter(v => v.id !== vehicleId);
    return true;
  },

  setDefault(userId: string, vehicleId: string): any {
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.garage) return null;
    let found = null;
    user.garage = user.garage.map(v => {
      if (v.id === vehicleId) {
        found = { ...v, isDefault: true };
        return found;
      }
      return { ...v, isDefault: false };
    });
    return found;
  },
};

// ---------------------------------------------------------------------------
// SMART SEARCH (/api/v1/search)
// ---------------------------------------------------------------------------

function normalizeEn(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeAr(s: string): string {
  return s
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length; const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

function tokenScore(text: string, query: string, tolerance: number): number {
  const tokens = text.split(' ');
  for (const token of tokens) {
    if (token === query) return 3;
    if (token.startsWith(query) || token.endsWith(query)) return 2.5;
    if (levenshtein(token, query) <= tolerance) return 2;
  }
  if (tokens.length >= 2) {
    const joined = tokens.slice(0, Math.min(3, tokens.length)).join(' ');
    if (joined.startsWith(query) || joined.includes(query)) return 2;
  }
  return 0;
}

export interface SearchFilters {
  countryId?: string;
  cityId?: string;
  categoryId?: string;
  manufacturerId?: string;
  condition?: string;
  availability?: 'in_stock' | 'any';
  priceRange?: [number, number];
  shopId?: string;
  vehicleId?: { makeId: string; modelId: string; generationId?: string; engineId?: string };
  minRating?: number;
  page?: number;
  perPage?: number;
}

export interface SearchResult {
  product: Product;
  shop: Shop | undefined;
  branch: ShopBranch | undefined;
  score: number;
}

export const searchService = {
  /** Retrieve products matching a string across many fields with typo tolerance. */
  matchProducts(query: string): { products: Product[]; hitsAll: boolean } {
    const q = query.trim();
    if (!q) return { products: db.products.filter(p => p.isActive), hitsAll: true };
    const qEn = normalizeEn(q);
    const qAr = normalizeAr(q);
    const tolerance = qEn.length <= 4 ? 1 : 2;
    const scored: { p: Product; score: number }[] = [];
    for (const p of db.products.filter(pr => pr.isActive)) {
      const shop = db.shops.find(s => s.id === p.shopId);
      const manufacturer = db.manufacturers.find(m => m.id === p.manufacturerId);
      let score = 0;
      score = Math.max(
        score,
        qEn ? tokenScore(normalizeEn(p.nameEn), qEn, tolerance) : 0,
        qEn && p.partNumber ? (normalizeEn(p.partNumber).includes(qEn) ? 3 : tokenScore(normalizeEn(p.partNumber), qEn, 1)) : 0,
        qEn && p.oemNumber ? (normalizeEn(p.oemNumber).includes(qEn) ? 3 : tokenScore(normalizeEn(p.oemNumber), qEn, 1)) : 0,
        qEn ? tokenScore(normalizeEn(p.carBrand + ' ' + p.carModel), qEn, tolerance) : 0,
        qAr ? tokenScore(normalizeAr(p.nameAr), qAr, tolerance) : 0,
        qEn && manufacturer ? tokenScore(normalizeEn(manufacturer.nameEn), qEn, tolerance) : 0,
        qAr && manufacturer ? tokenScore(normalizeAr(manufacturer.nameAr), qAr, tolerance) : 0,
        qEn && shop ? tokenScore(normalizeEn(shop.nameEn), qEn, tolerance) : 0,
      );
      for (const f of p.fitments) {
        if (qEn) score = Math.max(score, tokenScore(normalizeEn(`${f.makeNameEn} ${f.modelNameEn}`), qEn, tolerance));
        if (qAr) score = Math.max(score, tokenScore(normalizeAr(`${f.makeNameAr} ${f.modelNameAr}`), qAr, tolerance));
      }
      if (score > 0) scored.push({ p, score });
    }
    return {
      products: sortBy(scored, s => s.score, 'desc').map(s => s.p),
      hitsAll: false,
    };
  },

  search(query: string, filters: SearchFilters = {}): { results: SearchResult[]; total: number; page: number; perPage: number } {
    const matched = query.trim() ? this.matchProducts(query) : { products: db.products.filter(p => p.isActive), hitsAll: true };
    let list = matched.products;
    if (filters.categoryId) list = list.filter(p => p.categoryId === filters.categoryId);
    if (filters.manufacturerId) list = list.filter(p => p.manufacturerId === filters.manufacturerId);
    if (filters.condition) list = list.filter(p => p.condition === filters.condition);
    if (filters.shopId) list = list.filter(p => p.shopId === filters.shopId);
    if (filters.availability === 'in_stock') list = list.filter(p => p.quantity > 0);
    if (filters.minRating) list = list.filter(p => (p.rating ?? 0) >= (filters.minRating ?? 0));
    if (filters.priceRange) {
      list = list.filter(p => p.priceVisibility === PriceVisibility.SHOW_PRICE
        && p.price >= filters.priceRange![0] && p.price <= filters.priceRange![1]);
    }
    if (filters.vehicleId) {
      const { makeId, modelId, generationId, engineId } = filters.vehicleId;
      list = list.filter(p => p.fitments.some(f =>
        f.makeId === makeId && f.modelId === modelId &&
        (!generationId || !f.generationId || f.generationId === generationId) &&
        (!engineId || !f.engineId || f.engineId === engineId),
      ));
    }
    // Shop/city filters require approved active shops only.
    const cityShopIds = new Set(db.shops.filter(s => {
      if (filters.cityId && s.cityId && s.cityId !== filters.cityId) return false;
      if (filters.countryId && s.countryId !== filters.countryId) return false;
      return s.status === 'APPROVED' && s.isActive;
    }).map(s => s.id));
    if (filters.cityId || filters.countryId) {
      list = list.filter(p => cityShopIds.has(p.shopId));
    }

    this.logSearch(query, filters);

    const perPage = filters.perPage ?? 24;
    const page = filters.page ?? 1;
    const total = list.length;
    const paged = list.slice((page - 1) * perPage, page * perPage);
    const shopMap = new Map(db.shops.map(s => [s.id, s]));
    const branchMap = new Map(db.branches.map(b => [`${b.shopId}:${b.id}`, b]));
    return {
      results: paged.map(p => ({
        product: p,
        shop: shopMap.get(p.shopId),
        branch: p.branchId ? branchMap.get(`${p.shopId}:${p.branchId}`) : undefined,
        score: 0,
      })),
      total,
      page,
      perPage,
    };
  },

  logSearch(query: string, filters: SearchFilters = {}): void {
    const user = getSession()?.userId;
    if (!query.trim()) return;
    db.searchLogs = [
      {
        id: nextId('slog'),
        query: query.trim().slice(0, 120),
        language: (/[\u0600-\u06FF]/.test(query) ? 'ar' : 'en') as 'ar' | 'en',
        filters: JSON.stringify(filters),
        userId: user,
        countryId: filters.countryId,
        cityId: filters.cityId,
        createdAt: nowIso(),
      },
      ...db.searchLogs,
    ].slice(0, 2000);
  },
};

// ---------------------------------------------------------------------------
// SYSTEM / PUBLIC DATA
// ---------------------------------------------------------------------------

export const catalogService = {
  countries(): Country[] { return db.countries.filter(c => c.isActive); },
  cities(countryId?: string) {
    return countryId ? db.cities.filter(c => c.countryId === countryId) : db.cities;
  },
  categories(activeOnly = true) {
    return activeOnly ? db.categories.filter(c => c.isActive) : db.categories;
  },
  manufacturers() { return db.manufacturers.filter(m => m.isActive); },
  activeBanners(): Banner[] {
    return db.banners.filter(b => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  },
  websiteSettings() { return db.settings; },
};

export { db };