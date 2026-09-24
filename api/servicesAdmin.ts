// ============================================================================
// api/servicesAdmin.ts
// Reviews, complaints, notifications, banners, platform admin, reports,
// and legacy inbox (external requests + contact messages).
// ============================================================================

import {
  ApiError, Banner, Complaint, ContactMessage, ExternalSalesRequest, InboxMessage, InboxType,
  Notification, OrderStatus, PaymentStatus, ReportFilters, ReportSummary, Review, Shop,
  ShopStatus, User, UserRole, UserStatus, CommissionType,
} from '../types';
import { db } from './db';
import { nextId, nowIso, requireAuth, requireRole, assertPermission, audit, validate } from './security';
import { createNotification } from './servicesOrders';
import { orderService } from './servicesOrders';
import { sortBy } from './services';

// ---------------------------------------------------------------------------
// Reviews (/api/v1/reviews)
// ---------------------------------------------------------------------------

function recomputeShopRating(shopId: string): void {
  const approved = db.reviews.filter(r => r.shopId === shopId && r.status === 'APPROVED' && !r.productId);
  const shop = db.shops.find(s => s.id === shopId);
  if (!shop) return;
  if (!approved.length) {
    shop.rating = 0;
    shop.ratingCount = 0;
  } else {
    shop.rating = Math.round((approved.reduce((n, r) => n + r.rating, 0) / approved.length) * 10) / 10;
    shop.ratingCount = approved.length;
  }
  db.shops = db.shops.map(s => (s.id === shopId ? shop : s));
}

export const reviewService = {
  forShop(shopId: string): Review[] {
    const shop = db.shops.find(s => s.id === shopId);
    if (!shop || shop.status !== ShopStatus.APPROVED) throw new ApiError({ message: 'Shop not found.', status: 404 });
    return sortBy(db.reviews.filter(r => r.shopId === shopId && r.status === 'APPROVED'), r => r.createdAt, 'desc');
  },

  forProduct(productId: string): Review[] {
    const product = db.products.find(p => p.id === productId);
    if (!product) return [];
    const shopReviews = db.reviews.filter(r => r.shopId === product.shopId && r.status === 'APPROVED' && r.productId !== productId);
    const productReviews = db.reviews.filter(r => r.productId === productId && r.status === 'APPROVED');
    return sortBy([...shopReviews, ...productReviews], r => r.createdAt, 'desc');
  },

  create(input: { shopId: string; productId?: string; rating: number; comment: string; orderId?: string }): Review {
    const user = requireAuth();
    validate(input, {
      shopId: (v: any) => typeof v === 'string',
      rating: (v: any) => Number(v) >= 1 && Number(v) <= 5,
      comment: (v: any) => typeof v === 'string' && v.trim().length > 2,
    }, { shopId: 'shop', rating: 'rating', comment: 'comment' });
    const purchaseVerified = db.orders.some(o =>
      o.customerId === user.id &&
      (o.shopGroups.some(g => g.shopId === input.shopId && g.status === OrderStatus.COMPLETED)),
    );
    if (!purchaseVerified) {
      throw new ApiError({ message: 'You can only review shops you purchased from.', status: 403 });
    }
    const review: Review = {
      id: nextId('rv'), shopId: input.shopId, productId: input.productId,
      userId: user.id, userName: user.fullName, rating: input.rating,
      comment: input.comment.trim(), status: 'PENDING', createdAt: nowIso(), orderId: input.orderId,
    };
    db.reviews = [review, ...db.reviews];
    createNotification({
      userId: user.id, type: 'SYSTEM',
      titleEn: 'Review submitted', titleAr: 'تم إرسال التقييم',
      bodyEn: 'Your review is pending moderation.', bodyAr: 'تقييمك قيد المراجعة.',
      link: '/profile',
    });
    audit(user.id, 'review.create', 'review', review.id, { shopId: input.shopId, rating: input.rating });
    return review;
  },

  moderationList(status?: string): Review[] {
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    assertPermission(requireAuth(), 'reviews.moderate');
    let list = db.reviews;
    if (status) list = list.filter(r => r.status === status);
    return sortBy(list, r => r.createdAt, 'desc');
  },

  setStatus(reviewId: string, status: 'APPROVED' | 'REJECTED'): Review {
    const user = requireAuth();
    assertPermission(user, 'reviews.moderate');
    const review = db.reviews.find(r => r.id === reviewId);
    if (!review) throw new ApiError({ message: 'Review not found.', status: 404 });
    review.status = status;
    db.reviews = db.reviews.map(r => (r.id === reviewId ? review : r));
    recomputeShopRating(review.shopId);
    audit(user.id, 'review.moderate', 'review', reviewId, { status });
    return review;
  },
};

// ---------------------------------------------------------------------------
// Complaints (/api/v1/complaints)
// ---------------------------------------------------------------------------

export const complaintService = {
  create(input: { shopId?: string; subject: string; message: string }): Complaint {
    const user = requireAuth();
    validate(input, {
      subject: (v: any) => typeof v === 'string' && v.trim().length > 1,
      message: (v: any) => typeof v === 'string' && v.trim().length > 3,
    }, { subject: 'subject', message: 'message' });
    const complaint: Complaint = {
      id: nextId('cp'), userId: user.id, userName: user.fullName,
      shopId: input.shopId, subject: input.subject, message: input.message,
      status: 'OPEN', createdAt: nowIso(),
    };
    db.complaints = [complaint, ...db.complaints];
    audit(user.id, 'complaint.create', 'complaint', complaint.id);
    return complaint;
  },

  listMine(): Complaint[] {
    const user = requireAuth();
    return sortBy(db.complaints.filter(c => c.userId === user.id), c => c.createdAt, 'desc');
  },

  adminList(status?: string): Complaint[] {
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    let list = db.complaints;
    if (status) list = list.filter(c => c.status === status);
    return sortBy(list, c => c.createdAt, 'desc');
  },

  updateStatus(complaintId: string, status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'CLOSED'): Complaint {
    const user = requireAuth();
    assertPermission(user, 'complaints.moderate');
    const complaint = db.complaints.find(c => c.id === complaintId);
    if (!complaint) throw new ApiError({ message: 'Complaint not found.', status: 404 });
    complaint.status = status;
    db.complaints = db.complaints.map(c => (c.id === complaintId ? complaint : c));
    createNotification({
      userId: complaint.userId, type: 'SYSTEM',
      titleEn: 'Complaint updated', titleAr: 'تم تحديث الشكوى',
      bodyEn: `Your complaint is now ${status}.`, bodyAr: `شكواك الآن ${status}.`,
      link: '/profile/complaints',
    });
    audit(user.id, 'complaint.update', 'complaint', complaintId, { status });
    return complaint;
  },
};

// ---------------------------------------------------------------------------
// Notifications (/api/v1/notifications)
// ---------------------------------------------------------------------------

export const notificationService = {
  listMine(): Notification[] {
    const user = requireAuth();
    return db.notifications.filter(n => n.userId === user.id);
  },

  unreadCount(): number {
    const session = requireAuth();
    return db.notifications.filter(n => n.userId === session.id && !n.isRead).length;
  },

  markRead(notificationId: string): Notification[] {
    const user = requireAuth();
    db.notifications = db.notifications.map(n =>
      (n.id === notificationId && n.userId === user.id) ? { ...n, isRead: true } : n,
    );
    return db.notifications.filter(n => n.userId === user.id);
  },

  markAllRead(): void {
    const user = requireAuth();
    db.notifications = db.notifications.map(n =>
      n.userId === user.id ? { ...n, isRead: true } : n,
    );
  },

  sendToAll(input: { type: any; titleEn: string; titleAr: string; bodyEn: string; bodyAr: string; link?: string }): number {
    const user = requireAuth();
    assertPermission(user, 'notifications.send');
    const ids = db.users.filter(u => u.status === UserStatus.ACTIVE).map(u => u.id);
    for (const id of ids) createNotification({ userId: id, ...input });
    audit(user.id, 'notification.broadcast', 'user', '', { count: ids.length });
    return ids.length;
  },
};

// ---------------------------------------------------------------------------
// Banners (/api/v1/banners)
// ---------------------------------------------------------------------------

export const bannerService = {
  adminList(): Banner[] {
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    return db.banners;
  },

  create(input: Omit<Banner, 'id'>): Banner {
    const user = requireAuth();
    assertPermission(user, 'banners.manage');
    const banner: Banner = { ...input, id: nextId('bn') };
    db.banners = [...db.banners, banner];
    audit(user.id, 'banner.create', 'banner', banner.id);
    return banner;
  },

  update(bannerId: string, input: Partial<Banner>): Banner {
    const user = requireAuth();
    assertPermission(user, 'banners.manage');
    const banner = db.banners.find(b => b.id === bannerId);
    if (!banner) throw new ApiError({ message: 'Banner not found.', status: 404 });
    const next = { ...banner, ...input, id: bannerId };
    db.banners = db.banners.map(b => (b.id === bannerId ? next : b));
    audit(user.id, 'banner.update', 'banner', bannerId);
    return next;
  },

  toggle(bannerId: string): Banner {
    const user = requireAuth();
    assertPermission(user, 'banners.manage');
    const banner = db.banners.find(b => b.id === bannerId);
    if (!banner) throw new ApiError({ message: 'Banner not found.', status: 404 });
    banner.isActive = !banner.isActive;
    db.banners = db.banners.map(b => (b.id === bannerId ? banner : b));
    return banner;
  },

  remove(bannerId: string): void {
    const user = requireAuth();
    assertPermission(user, 'banners.manage');
    db.banners = db.banners.filter(b => b.id !== bannerId);
    audit(user.id, 'banner.delete', 'banner', bannerId);
  },
};

// ---------------------------------------------------------------------------
// Platform admin (/api/v1/admin)
// ---------------------------------------------------------------------------

export const adminService = {
  dashboard(): { totals: Record<string, number> } {
    const user = requireAuth();
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    const totals = {
      users: db.users.length,
      activeUsers: db.users.filter(u => u.status === UserStatus.ACTIVE).length,
      shops: db.shops.length,
      pendingShops: db.shops.filter(s => s.status === ShopStatus.PENDING).length,
      approvedShops: db.shops.filter(s => s.status === ShopStatus.APPROVED).length,
      products: db.products.filter(p => p.isActive).length,
      orders: db.orders.length,
      pendingOrders: db.orders.filter(o => o.shopGroups.some(g => g.status === OrderStatus.PENDING)).length,
      revenue: db.orders.reduce((sum, o) => sum + o.total, 0),
      commissions: db.orders.reduce((sum, o) => sum + o.shopGroups.reduce((s, g) => s + (g.commissionAmount ?? 0), 0), 0),
      pendingReviews: db.reviews.filter(r => r.status === 'PENDING').length,
      openComplaints: db.complaints.filter(c => c.status === 'OPEN' || c.status === 'REVIEWING').length,
    };
    audit(user.id, 'admin.dashboard', 'system', '');
    return { totals };
  },

  users(filters: { role?: string; status?: string; search?: string; page?: number; perPage?: number } = {}): { users: User[]; total: number } {
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    let list = db.users;
    if (filters.role) list = list.filter(u => u.role === filters.role);
    if (filters.status) list = list.filter(u => u.status === filters.status);
    if (filters.search) list = list.filter(u =>
      u.username.toLowerCase().includes(filters.search!.toLowerCase()) ||
      u.fullName.toLowerCase().includes(filters.search!.toLowerCase()) ||
      u.email.toLowerCase().includes(filters.search!.toLowerCase()),
    );
    const perPage = filters.perPage ?? 25;
    const page = filters.page ?? 1;
    return { users: list.slice((page - 1) * perPage, page * perPage), total: list.length };
  },

  setUserStatus(userId: string, status: UserStatus): User {
    const user = requireAuth();
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    if (userId === user.id) throw new ApiError({ message: 'You cannot change your own status.', status: 422 });
    const target = db.users.find(u => u.id === userId);
    if (!target) throw new ApiError({ message: 'User not found.', status: 404 });
    target.status = status;
    db.users = db.users.map(u => (u.id === userId ? target : u));
    audit(user.id, 'admin.user.status', 'user', userId, { status });
    return target;
  },

  resetPassword(userId: string): string {
    const user = requireAuth();
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    const temp = Math.random().toString(36).slice(-8);
    const target = db.users.find(u => u.id === userId);
    if (!target) throw new ApiError({ message: 'User not found.', status: 404 });
    target.passwordHash = temp;
    target.mustChangePassword = true;
    db.users = db.users.map(u => (u.id === userId ? target : u));
    audit(user.id, 'admin.user.password_reset', 'user', userId);
    return temp;
  },

  shops(): Shop[] {
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    return sortBy(db.shops, s => s.createdAt, 'desc');
  },

  approveShop(shopId: string, note?: string): Shop {
    const user = requireAuth();
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    const shop = db.shops.find(s => s.id === shopId);
    if (!shop) throw new ApiError({ message: 'Shop not found.', status: 404 });
    shop.status = ShopStatus.APPROVED;
    shop.isActive = true;
    shop.approvalNote = note;
    db.shops = db.shops.map(s => (s.id === shopId ? shop : s));
    createNotification({
      userId: shop.ownerId, type: 'SYSTEM',
      titleEn: 'Shop approved', titleAr: 'تم اعتماد محلّك',
      bodyEn: `Congratulations, ${shop.nameEn} is now live on the marketplace.`,
      bodyAr: `تهانينا، ${shop.nameAr} أصبح متاحاً في السوق الآن.`,
      link: '/shop/dashboard',
    });
    audit(user.id, 'admin.shop.approve', 'shop', shopId);
    return shop;
  },

  rejectShop(shopId: string, note: string): Shop {
    const user = requireAuth();
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    const shop = db.shops.find(s => s.id === shopId);
    if (!shop) throw new ApiError({ message: 'Shop not found.', status: 404 });
    shop.status = ShopStatus.REJECTED;
    shop.isActive = false;
    shop.approvalNote = note;
    db.shops = db.shops.map(s => (s.id === shopId ? shop : s));
    createNotification({
      userId: shop.ownerId, type: 'SYSTEM',
      titleEn: 'Shop was not approved', titleAr: 'لم يتم اعتماد المحل',
      bodyEn: note || 'Please update your shop details and re-submit.', bodyAr: note || 'يرجى تحديث بيانات المحل وإعادة التقديم.',
      link: '/shop/dashboard',
    });
    audit(user.id, 'admin.shop.reject', 'shop', shopId, { note });
    return shop;
  },

  setShopStatus(shopId: string, status: ShopStatus, note?: string): Shop {
    const user = requireAuth();
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    const shop = db.shops.find(s => s.id === shopId);
    if (!shop) throw new ApiError({ message: 'Shop not found.', status: 404 });
    shop.status = status;
    shop.isActive = status === ShopStatus.APPROVED;
    if (note) shop.approvalNote = note;
    db.shops = db.shops.map(s => (s.id === shopId ? shop : s));
    audit(user.id, 'admin.shop.status', 'shop', shopId, { status });
    return shop;
  },

  setCommission(shopId: string, type: CommissionType, value: number): Shop {
    const user = requireAuth();
    assertPermission(user, 'commissions.manage');
    const shop = db.shops.find(s => s.id === shopId);
    if (!shop) throw new ApiError({ message: 'Shop not found.', status: 404 });
    if (value < 0 || (type === CommissionType.PERCENT && value > 100)) {
      throw new ApiError({ message: 'Invalid commission value.', status: 422 });
    }
    shop.commissionType = type;
    shop.commissionValue = value;
    db.shops = db.shops.map(s => (s.id === shopId ? shop : s));
    audit(user.id, 'admin.commission.set', 'shop', shopId, { type, value });
    return shop;
  },

  auditLog(): any[] {
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    assertPermission(requireAuth(), 'audit.view');
    return api.routes().audit;
  },
};

// ---------------------------------------------------------------------------
// Categories / manufacturers (platform-managed)
// ---------------------------------------------------------------------------

export const catalogAdminService = {
  addCategory(input: { nameEn: string; nameAr: string; imageUrl?: string }): any {
    const user = requireAuth();
    assertPermission(user, 'categories.manage');
    validate(input, { nameEn: (v: any) => v?.length > 0, nameAr: (v: any) => v?.length > 0 }, { nameEn: 'name (EN)', nameAr: 'name (AR)' });
    const category = { id: nextId('cat'), ...input, isActive: true };
    db.categories = [...db.categories, category];
    audit(user.id, 'catalog.category.create', 'category', category.id);
    return category;
  },
  updateCategory(id: string, input: Partial<any>): any {
    const user = requireAuth();
    assertPermission(user, 'categories.manage');
    db.categories = db.categories.map(c => c.id === id ? { ...c, ...input, id } : c);
    return db.categories.find(c => c.id === id);
  },
  toggleCategory(id: string): any {
    const user = requireAuth();
    assertPermission(user, 'categories.manage');
    db.categories = db.categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    return db.categories.find(c => c.id === id);
  },
  removeCategory(id: string): void {
    const user = requireAuth();
    assertPermission(user, 'categories.manage');
    db.categories = db.categories.filter(c => c.id !== id);
  },
  addManufacturer(input: { nameEn: string; nameAr: string }): any {
    const user = requireAuth();
    assertPermission(user, 'manufacturers.manage');
    const mfr = { id: nextId('mfr'), ...input, isActive: true };
    db.manufacturers = [...db.manufacturers, mfr];
    audit(user.id, 'catalog.manufacturer.create', 'manufacturer', mfr.id);
    return mfr;
  },
  updateManufacturer(id: string, input: Partial<any>): any {
    const user = requireAuth();
    assertPermission(user, 'manufacturers.manage');
    db.manufacturers = db.manufacturers.map(m => m.id === id ? { ...m, ...input, id } : m);
    return db.manufacturers.find(m => m.id === id);
  },
  toggleManufacturer(id: string): any {
    const user = requireAuth();
    assertPermission(user, 'manufacturers.manage');
    db.manufacturers = db.manufacturers.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m);
    return db.manufacturers.find(m => m.id === id);
  },
};

// ---------------------------------------------------------------------------
// Reports (/api/v1/reports)
// ---------------------------------------------------------------------------

function inRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export const reportService = {
  summary(filters: ReportFilters = {}): ReportSummary {
    const user = requireAuth();
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SHOP_OWNER);
    assertPermission(user, 'reports.view');

    const shops = db.shops.filter(s => !filters.shopId || s.id === filters.shopId);
    const shopIds = new Set(shops.map(s => s.id));
    const orders = db.orders.filter(o =>
      o.shopGroups.some(g => shopIds.has(g.shopId)) &&
      inRange(o.createdAt, filters.from, filters.to),
    );
    const customers = new Set(orders.map(o => o.customerId));

    const shopPerformance = shops.map(shop => {
      const shopOrders = orders.filter(o => o.shopGroups.some(g => g.shopId === shop.id));
      const completed = shopOrders
        .flatMap(o => o.shopGroups)
        .filter(g => g.shopId === shop.id && g.status === OrderStatus.COMPLETED);
      return {
        shopId: shop.id,
        shopName: shop.nameEn,
        orders: shopOrders.length,
        revenue: completed.reduce((sum, g) => sum + g.subtotal, 0),
        commission: completed.reduce((sum, g) => sum + (g.commissionAmount ?? 0), 0),
        rating: shop.rating ?? 0,
      };
    });

    const byMonth = new Map<string, { revenue: number; orders: number }>();
    for (const o of orders) {
      const key = o.createdAt.slice(0, 7);
      const e = byMonth.get(key) ?? { revenue: 0, orders: 0 };
      e.orders += 1;
      e.revenue += o.total;
      byMonth.set(key, e);
    }

    const searchCounts = new Map<string, number>();
    for (const s of db.searchLogs.filter(l => inRange(l.createdAt, filters.from, filters.to))) {
      searchCounts.set(s.query, (searchCounts.get(s.query) ?? 0) + 1);
    }

    const vehicleCounts = new Map<string, number>();
    for (const f of db.products.flatMap(p => p.fitments)) {
      const label = `${f.makeNameEn} ${f.modelNameEn}`;
      vehicleCounts.set(label, (vehicleCounts.get(label) ?? 0) + 1);
    }

    const methodCounts = new Map<string, number>();
    for (const o of orders) {
      methodCounts.set(o.paymentMethod, (methodCounts.get(o.paymentMethod) ?? 0) + 1);
    }
    const categoryCounts = new Map<string, number>();
    const productCategory = new Map<string, string>(db.products.map(p => [p.id, p.categoryId] as [string, string]));
    for (const item of orders.flatMap(o => o.items)) {
      const categoryId = productCategory.get(item.productId);
      const categoryLabel = categoryId ? (db.categories.find(c => c.id === categoryId)?.nameEn ?? 'General') : 'General';
      categoryCounts.set(categoryLabel, (categoryCounts.get(categoryLabel) ?? 0) + 1);
    }

    return {
      activeUsers: db.users.filter(u => u.status === UserStatus.ACTIVE).length,
      approvedShops: db.shops.filter(s => s.status === ShopStatus.APPROVED).length,
      products: db.products.filter(p => p.isActive).length,
      orders: orders.length,
      sales: orders.reduce((sum, o) => sum + o.total, 0),
      commissions: orders.reduce((sum, o) => sum + o.shopGroups.reduce((s, g) => s + (g.commissionAmount ?? 0), 0), 0),
      payments: db.payments.filter(p => p.status === PaymentStatus.PAID &&
        orders.some(o => o.id === p.orderId)).length,
      popularSearches: [...searchCounts.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([query, count]) => ({ query, count })),
      popularVehicles: [...vehicleCounts.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([label, count]) => ({ label, count })),
      shopPerformance: sortBy(shopPerformance, sp => sp.revenue, 'desc'),
      salesByMonth: [...byMonth.entries()].sort().map(([month, v]) => ({ month, ...v })),
      methodBreakdown: [...methodCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
      categoryBreakdown: [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
    };
  },

  shopSummary(shopId: string, filters: ReportFilters = {}): ReportSummary {
    const user = requireAuth();
    const membership = user.shopMemberships?.some(m => m.shopId === shopId);
    if (!membership && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ApiError({ message: 'Forbidden.', status: 403 });
    }
    return this.summary({ ...filters, shopId });
  },

  topProducts(shopId: string, limit = 10): any[] {
    requireAuth();
    const products = db.products.filter(p => p.shopId === shopId);
    return sortBy(products, p => p.soldCount ?? 0, 'desc').slice(0, limit)
      .map(p => ({ productId: p.id, nameEn: p.nameEn, nameAr: p.nameAr, sold: p.soldCount ?? 0 }));
  },
};

// ---------------------------------------------------------------------------
// Legacy inbox + contact (kept for preserved pages: ExternalRequest / ContactUs / Inbox)
// ---------------------------------------------------------------------------

export const legacyService = {
  submitExternalRequest(req: Omit<ExternalSalesRequest, 'id' | 'createdAt'>): ExternalSalesRequest {
    validate(req, {
      customerName: (v: any) => v?.length > 1,
      customerPhone: (v: any) => v?.length > 5,
      description: (v: any) => v?.length > 3,
    }, { customerName: 'name', customerPhone: 'phone', description: 'description' });
    const request: ExternalSalesRequest = { ...req, id: nextId('xr'), createdAt: nowIso() };
    db.externalRequests = [request, ...db.externalRequests];
    this.broadcast({
      type: InboxType.EXTERNAL_REQUEST, title: `New external request: ${request.carModel}`,
      body: request.description, attachmentUrl: request.imageUrl, requestId: request.id,
    });
    return request;
  },

  submitContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt'>): ContactMessage {
    validate(msg, {
      name: (v: any) => v?.length > 1,
      email: (v: any) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v ?? ''),
      message: (v: any) => v?.length > 3,
    }, { name: 'name', email: 'email', message: 'message' });
    const message: ContactMessage = { ...msg, id: nextId('cm'), createdAt: nowIso() };
    db.contactMessages = [message, ...db.contactMessages];
    this.broadcast({ type: InboxType.CONTACT_MSG, title: `Contact: ${message.name}`, body: message.message, requestId: message.id });
    return message;
  },

  broadcast(msg: { type: InboxType; title: string; body: string; attachmentUrl?: string; requestId?: string }): void {
    const admins = db.users.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN);
    const now = nowIso();
    const added: InboxMessage[] = admins.map(u => ({
      id: nextId('im'), senderId: 'system', receiverId: u.id,
      type: msg.type, title: msg.title, body: msg.body,
      attachmentUrl: msg.attachmentUrl, requestId: msg.requestId, isRead: false, createdAt: now,
    }));
    db.inboxMessages = [...added, ...db.inboxMessages];
  },

  inbox(): InboxMessage[] {
    const user = requireAuth();
    return db.inboxMessages.filter(m => m.receiverId === user.id || m.senderId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  unreadInboxCount(): number {
    const user = requireAuth();
    return db.inboxMessages.filter(m => m.receiverId === user.id && !m.isRead).length;
  },

  markRead(msgId: string): void {
    const user = requireAuth();
    db.inboxMessages = db.inboxMessages.map(m => (m.id === msgId && m.receiverId === user.id) ? { ...m, isRead: true } : m);
  },

  sendInboxMessage(msg: { receiverId: string; title: string; body: string; type?: InboxType; attachmentUrl?: string }): InboxMessage {
    const user = requireAuth();
    const message: InboxMessage = {
      id: nextId('im'), senderId: user.id, receiverId: msg.receiverId,
      type: msg.type ?? InboxType.REPLY, title: msg.title, body: msg.body,
      attachmentUrl: msg.attachmentUrl, isRead: false, createdAt: nowIso(),
    };
    db.inboxMessages = [message, ...db.inboxMessages];
    return message;
  },
};

// ---------------------------------------------------------------------------
// Proxy for /api routes — centralized request facade
// ---------------------------------------------------------------------------

export const api = {
  auth: () => import('./services'),
  orders: () => orderService,
  reviews: reviewService,
  complaints: complaintService,
  notifications: notificationService,
  banners: bannerService,
  admin: adminService,
  catalog: catalogAdminService,
  reports: reportService,
  legacy: legacyService,
  routes(): { audit: any[] } {
    return { audit: db.auditLogs };
  },
};

export function dbInfo(): { version: string; seeded: boolean } {
  const seeded = localStorage.getItem('ala2_seeded_v1') === '1';
  return { version: '1.0.0', seeded };
}
