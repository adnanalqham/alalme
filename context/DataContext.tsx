import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Banner, CarBrand, Category, City, ContactMessage, Country, ExternalSalesRequest, InboxMessage,
  Manufacturer, Notification, Order, Part, Payment, Product, ProductCondition, Review, Sale,
  Shop, ShopBranch, StockMovement, User, UserStatus, VehicleEngine, VehicleFitment,
  VehicleGeneration, VehicleMake, VehicleModel, WebsiteSettings,
} from '../types';
import { db, dbInfo, legacyService, notificationService } from '../api';
import { nextId, nowIso } from '../api';
import { DEFAULT_SETTINGS } from '../constants';

interface DataContextType {
  // ---- current snapshot (new model) ---------------------------------------
  products: Product[];
  orders: Order[];
  payments: Payment[];
  reviews: Review[];
  notifications: Notification[];
  banners: Banner[];
  movements: StockMovement[];
  countries: Country[];
  cities: City[];
  branches: ShopBranch[];
  makes: VehicleMake[];
  models: VehicleModel[];
  generations: VehicleGeneration[];
  engines: VehicleEngine[];
  manufacturers: Manufacturer[];
  fitments: VehicleFitment[];

  refreshData: () => void;
  version: number;
  hasInit: boolean;
  dbInfo: () => { version: string; seeded: boolean };
  resetAllData: () => void;
  unreadComplaints: number;
  unreadOrders: number;

  // ---- legacy names (existing UI) ------------------------------------------
  users: User[];
  shops: Shop[];
  parts: Part[];
  sales: Sale[];
  brands: CarBrand[];
  categories: Category[];
  stockMovements: StockMovement[];
  websiteSettings: WebsiteSettings;
  settings: WebsiteSettings;
  externalRequests: ExternalSalesRequest[];
  contactMessages: ContactMessage[];
  inboxMessages: InboxMessage[];

  addPart: (part: Part) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
  recordSale: (sale: Sale) => void;
  toggleUserStatus: (id: string) => void;
  resetUserPassword: (id: string) => string;

  addBrand: (brand: CarBrand) => void;
  updateBrand: (brand: CarBrand) => void;
  deleteBrand: (id: string) => void;

  addCategory: (category: Category) => void;
  toggleCategoryStatus: (id: string) => void;
  deleteCategory: (id: string) => void;

  updateSettings: (settings: WebsiteSettings) => void;
  addShop: (shop: Shop, owner: User) => void;
  updateShop: (shop: Shop) => void;
  deleteShop: (shopId: string) => void;

  submitExternalRequest: (req: Omit<ExternalSalesRequest, 'id' | 'createdAt'>) => void;
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt'>) => void;
  sendInboxMessage: (msg: { receiverId: string; title: string; body: string; type?: InboxMessage['type']; attachmentUrl?: string }) => void;
  markMessageAsRead: (msgId: string) => void;

  markNotificationRead: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Legacy ↔ new model mapping
// ---------------------------------------------------------------------------

function toPart(p: Product): Part {
  return {
    id: p.id,
    shopId: p.shopId,
    brandId: p.brandId,
    manufacturerId: p.manufacturerId,
    categoryId: p.categoryId,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    carBrand: p.carBrand,
    carModel: p.carModel,
    yearRange: p.yearRange,
    partNumber: p.partNumber,
    oemNumber: p.oemNumber,
    condition: p.condition === ProductCondition.NEW ? 'New' : 'Used',
    rating: p.rating ?? 0,
    price: p.price,
    costPrice: p.costPrice,
    currency: p.currency,
    stockQuantity: p.stockQuantity,
    imageUrl: p.imageUrl,
    images: p.images,
    soldCount: p.soldCount ?? 0,
    isActive: p.isActive,
    fitments: p.fitments,
  } as Part;
}

function toBrand(m: VehicleMake): CarBrand {
  return { id: m.id, nameEn: m.nameEn, nameAr: m.nameAr, logoUrl: m.logoUrl };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState(() => db.snapshot());
  const [version, setVersion] = useState(0);
  const [hasInit] = useState(true);

  const refreshData = useCallback(() => {
    setSnapshot(db.snapshot());
    setVersion(v => v + 1);
  }, []);

  const data = snapshot;

  const addPart = (part: Part) => {
    const product: Product = {
      id: part.id || nextId('p'),
      shopId: part.shopId,
      branchId: undefined,
      manufacturerId: part.manufacturerId || 'mfr1',
      categoryId: part.categoryId || 'c1',
      nameEn: part.nameEn,
      nameAr: part.nameAr || part.nameEn,
      carBrand: part.carBrand,
      carModel: part.carModel,
      yearRange: part.yearRange,
      partNumber: part.partNumber,
      oemNumber: part.oemNumber,
      condition: part.condition === 'New' ? ProductCondition.NEW : ProductCondition.USED,
      price: part.price,
      costPrice: part.costPrice,
      currency: part.currency,
      priceVisibility: 'SHOW_PRICE' as any,
      saleMode: 'BOTH' as any,
      quantity: part.stockQuantity,
      stockQuantity: part.stockQuantity,
      minStock: 5,
      imageUrl: part.imageUrl,
      images: part.images?.length ? part.images : part.imageUrl ? [part.imageUrl] : [],
      fitments: part.fitments ?? [],
      soldCount: part.soldCount ?? 0,
      isActive: true,
      rating: 5,
      ratingCount: 0,
      createdAt: nowIso(),
    };
    db.products = [product, ...data.products];
    if (product.stockQuantity > 0) {
      db.movements = [{
        id: nextId('mv'), productId: product.id, shopId: product.shopId, type: 'IN' as any,
        quantityChange: product.stockQuantity, quantityAfter: product.stockQuantity,
        reason: 'Initial Stock', userId: data.users.find(u => u.shopId === part.shopId)?.id ?? '', date: nowIso(),
      }, ...db.movements];
    }
    refreshData();
  };

  const updatePart = (updatedPart: Part) => {
    db.products = data.products.map(p => {
      if (p.id !== updatedPart.id) return p;
      const next: Product = {
        ...p,
        nameEn: updatedPart.nameEn, nameAr: updatedPart.nameAr,
        price: updatedPart.price, costPrice: updatedPart.costPrice, currency: updatedPart.currency,
        categoryId: updatedPart.categoryId, carBrand: updatedPart.carBrand,
        carModel: updatedPart.carModel, yearRange: updatedPart.yearRange,
        partNumber: updatedPart.partNumber,
        imageUrl: updatedPart.imageUrl, images: updatedPart.images,
      };
      if (updatedPart.stockQuantity !== p.quantity) {
        next.quantity = updatedPart.stockQuantity;
        next.stockQuantity = updatedPart.stockQuantity;
        db.movements = [{
          id: nextId('mv'), productId: p.id, shopId: p.shopId, type: 'ADJUSTMENT' as any,
          quantityChange: updatedPart.stockQuantity - p.quantity,
          quantityAfter: updatedPart.stockQuantity,
          reason: 'Manual Adjustment', userId: '', date: nowIso(),
        }, ...db.movements];
      }
      return next;
    });
    refreshData();
  };

  const deletePart = (id: string) => {
    db.products = data.products.filter(p => p.id !== id);
    refreshData();
  };

  const recordSale = (sale: Sale) => {
    db.sales = [...data.sales, sale];
    db.products = data.products.map(p => {
      if (p.id !== sale.partId) return p;
      const stock = Math.max(0, p.stockQuantity - sale.quantity);
      db.movements = db.movements; // touch
      return { ...p, stockQuantity: stock, quantity: stock, soldCount: (p.soldCount ?? 0) + sale.quantity };
    });
    const product = data.products.find(p => p.id === sale.partId);
    if (product) {
      db.movements = [{
        id: nextId('mv'), productId: sale.partId, shopId: sale.sellerId, type: 'SALE' as any,
        quantityChange: -sale.quantity, quantityAfter: Math.max(0, product.stockQuantity - sale.quantity),
        reason: `Sale to user ${sale.buyerId}`, userId: sale.sellerId, date: sale.date,
      }, ...db.movements];
    }
    refreshData();
  };

  const toggleUserStatus = (id: string) => {
    db.users = data.users.map(u => {
      if (u.id !== id) return u;
      const status = u.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
      return { ...u, status };
    });
    refreshData();
  };

  const resetUserPassword = (id: string): string => {
    const temp = Math.random().toString(36).slice(-8);
    db.users = data.users.map(u => u.id === id ? { ...u, passwordHash: temp, mustChangePassword: true } : u);
    refreshData();
    return temp;
  };

  const addBrand = (brand: CarBrand) => {
    db.makes = [...data.makes, { id: brand.id, nameEn: brand.nameEn, nameAr: brand.nameAr, logoUrl: brand.logoUrl, isActive: true }];
    refreshData();
  };

  const updateBrand = (b: CarBrand) => {
    db.makes = data.makes.map(m => m.id === b.id ? { ...m, nameEn: b.nameEn, nameAr: b.nameAr, logoUrl: b.logoUrl } : m);
    refreshData();
  };

  const deleteBrand = (id: string) => {
    db.makes = data.makes.filter(m => m.id !== id);
    refreshData();
  };

  const addCategory = (c: Category) => {
    db.categories = [...data.categories, { ...c, id: c.id || nextId('cat'), isActive: true }];
    refreshData();
  };

  const toggleCategoryStatus = (id: string) => {
    db.categories = data.categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    refreshData();
  };

  const deleteCategory = (id: string) => {
    db.categories = data.categories.filter(c => c.id !== id);
    refreshData();
  };

  const updateSettings = (settings: WebsiteSettings) => {
    db.settings = { ...settings };
    refreshData();
  };

  const addShop = (shop: Shop, owner: User) => {
    db.users = [...data.users, owner];
    db.shops = [...data.shops, shop];
    refreshData();
  };

  const updateShop = (shop: Shop) => {
    db.shops = data.shops.map(s => s.id === shop.id ? { ...shop } : s);
    refreshData();
  };

  const deleteShop = (shopId: string) => {
    const shop = data.shops.find(s => s.id === shopId);
    db.shops = data.shops.filter(s => s.id !== shopId);
    if (shop) {
      db.users = data.users.map(u => u.id === shop.ownerId ? { ...u, status: UserStatus.DEACTIVATED } : u);
    }
    refreshData();
  };

  const submitExternalRequest = (req: Omit<ExternalSalesRequest, 'id' | 'createdAt'>) => {
    legacyService.submitExternalRequest(req);
    refreshData();
  };

  const submitContactMessage = (msg: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    legacyService.submitContactMessage(msg);
    refreshData();
  };

  const sendInboxMessage = (msg: any) => {
    legacyService.sendInboxMessage(msg);
    refreshData();
  };

  const markMessageAsRead = (msgId: string) => {
    legacyService.markRead(msgId);
    refreshData();
  };

  const markNotificationRead = (id: string) => {
    notificationService.markRead(id);
    refreshData();
  };

  const value: DataContextType = {
    products: (data.products || []).filter(p => p.isActive),
    orders: data.orders || [],
    payments: data.payments || [],
    reviews: data.reviews || [],
    notifications: data.notifications || [],
    banners: data.banners || [],
    movements: data.movements || [],
    countries: data.countries || [],
    cities: data.cities || [],
    branches: data.branches || [],
    makes: data.makes || [],
    models: data.models || [],
    generations: data.generations || [],
    engines: data.engines || [],
    manufacturers: data.manufacturers || [],
    fitments: data.fitments || [],

    refreshData,
    version,
    hasInit,
    dbInfo: () => dbInfo(),
    resetAllData: () => {
      db.persistAll(db.snapshot());
      refreshData();
    },
    unreadComplaints: (data.complaints || []).filter(c => c.status === 'OPEN' || c.status === 'REVIEWING').length,
    unreadOrders: (data.orders || []).filter(o => (o.shopGroups || []).some(g => g.status === 'PENDING')).length,

    users: data.users || [],
    shops: data.shops || [],
    parts: (data.products || []).filter(p => p.isActive).map(toPart),
    sales: data.sales || [],
    brands: (data.makes || []).map(toBrand),
    categories: data.categories || [],
    stockMovements: (data.movements || []).map(m => ({ ...m, partId: m.productId, note: m.reason })),
    websiteSettings: data.settings || DEFAULT_SETTINGS,
    settings: data.settings || DEFAULT_SETTINGS,
    externalRequests: data.externalRequests || [],
    contactMessages: data.contactMessages || [],
    inboxMessages: data.inboxMessages || [],

    addPart, updatePart, deletePart, recordSale, toggleUserStatus, resetUserPassword,
    addBrand, updateBrand, deleteBrand,
    addCategory, toggleCategoryStatus, deleteCategory,
    updateSettings, addShop, updateShop, deleteShop,
    submitExternalRequest, submitContactMessage, sendInboxMessage, markMessageAsRead,
    markNotificationRead,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};