// ============================================================================
// api/servicesOrders.ts
// Cart → Checkout → Orders (multi-shop, stock reservation) → Payments.
// Also inventory adjustments/transfers/import and low-stock.
// ============================================================================

import {
  ApiError, CartItem, DeliveryType, Order, OrderItem, OrderShopGroup,
  OrderStatus, Payment, PaymentMethod, PaymentStatus, PriceVisibility, Product, SaleMode,
  Shop, UserRole,
} from '../types';
import { db } from './db';
import { nextId, nowIso, requireAuth, assertPermission, canManageShop, activeShopFor, audit, validate, requireRole } from './security';
import { getSession } from './session';
import { recordMovementLocally } from './services';
import { getCountry } from './services';

// ---------------------------------------------------------------------------
// Cart (persisted per device; multi-shop)
// ---------------------------------------------------------------------------

const CART_KEY = 'ala2_cart';

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items.slice(0, 200)));
}

export const cartService = {
  get(): CartItem[] {
    return loadCart();
  },

  count(): number {
    return loadCart().reduce((n, i) => n + i.quantity, 0);
  },

  add(productId: string, quantity = 1, branchId?: string): CartItem[] {
    const product = db.products.find(p => p.id === productId);
    if (!product || !product.isActive) throw new ApiError({ message: 'Product not found.', status: 404 });
    const qty = Math.max(1, Math.floor(quantity));
    // External (contact-sales) items bypass stock checks; online items respect stock.
    if (product.saleMode !== SaleMode.EXTERNAL && qty > product.quantity) {
      throw new ApiError({ message: `Only ${product.quantity} in stock.`, status: 422 });
    }
    const items = loadCart();
    const existing = items.find(i => i.productId === productId && i.branchId === branchId);
    const unitPrice = product.priceVisibility === PriceVisibility.SHOW_PRICE ? product.price : 0;
    if (existing) {
      existing.quantity = existing.quantity + qty;
      existing.unitPrice = unitPrice;
    } else {
      items.push({
        id: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        productId, shopId: product.shopId, branchId: branchId ?? product.branchId,
        quantity: qty, unitPrice, addedAt: nowIso(),
      });
    }
    saveCart(items);
    return items;
  },

  updateQuantity(itemId: string, quantity: number): CartItem[] {
    const items = loadCart();
    const item = items.find(i => i.id === itemId);
    if (!item) throw new ApiError({ message: 'Cart item not found.', status: 404 });
    const product = db.products.find(p => p.id === item.productId);
    const qty = Math.max(1, Math.floor(quantity));
    if (product && product.saleMode !== SaleMode.EXTERNAL && qty > product.quantity) {
      throw new ApiError({ message: `Only ${product.quantity} in stock.`, status: 422 });
    }
    item.quantity = qty;
    saveCart(items);
    return items;
  },

  remove(itemId: string): CartItem[] {
    saveCart(loadCart().filter(i => i.id !== itemId));
    return loadCart();
  },

  clear(): void {
    saveCart([]);
  },
};

// ---------------------------------------------------------------------------
// Orders (/api/v1/orders)
// ---------------------------------------------------------------------------

function estimatedFee(shop: Shop, deliveryType: DeliveryType): number {
  if (deliveryType === DeliveryType.PICKUP) return 0;
  const country = getCountry(shop.countryId);
  return country?.currency === 'YER' ? 500 : country?.currency === 'SAR' ? 25 : 10;
}

export function createNotification(input: { userId: string; type: any; titleEn: string; titleAr: string; bodyEn: string; bodyAr: string; link?: string }): void {
  if (!db.users.some(u => u.id === input.userId)) return;
  db.notifications = [{
    id: nextId('nt'),
    userId: input.userId,
    type: input.type,
    titleEn: input.titleEn,
    titleAr: input.titleAr,
    bodyEn: input.bodyEn,
    bodyAr: input.bodyAr,
    link: input.link,
    isRead: false,
    createdAt: nowIso(),
  }, ...db.notifications].slice(0, 500);
}

function notifyShopMembers(shopId: string, input: { type: any; titleEn: string; titleAr: string; bodyEn: string; bodyAr: string; link?: string }): void {
  const members = db.users.filter(u =>
    u.status === 'ACTIVE' &&
    (u.shopMemberships ?? []).some(m => m.shopId === shopId && m.isActive),
  );
  // Plus legacy ownerId binding
  const shop = db.shops.find(s => s.id === shopId);
  if (shop && !members.some(u => u.id === shop.ownerId)) {
    const owner = db.users.find(u => u.id === shop.ownerId && u.status === 'ACTIVE');
    if (owner) members.push(owner);
  }
  for (const member of members) createNotification({
    userId: member.id, link: input.link,
    type: input.type, titleEn: input.titleEn, titleAr: input.titleAr, bodyEn: input.bodyEn, bodyAr: input.bodyAr,
  });
}

export const orderService = {
  placeOrder(input: { deliveryType: DeliveryType; deliveryAddressId?: string; notes?: string; paymentMethod: PaymentMethod }): Order {
    const user = requireAuth();
    validate(input, {
      deliveryType: (v: any) => ['PICKUP', 'SHOP_DELIVERY', 'DELIVERY_COMPANY'].includes(v),
      paymentMethod: (v: any) => ['CASH', 'BANK_TRANSFER', 'WALLET', 'CARD'].includes(v),
    }, { deliveryType: 'delivery type', paymentMethod: 'payment method' });

    const items = loadCart();
    if (!items.length) throw new ApiError({ message: 'Your cart is empty.', status: 422 });

    // Validate stock for every online/both-mode line at once.
    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product || !product.isActive) throw new ApiError({ message: 'A product in your cart is no longer available.', status: 410 });
      if (product.saleMode !== SaleMode.EXTERNAL && item.quantity > product.quantity) {
        throw new ApiError({ message: `${product.nameEn}: only ${product.quantity} in stock.`, status: 422 });
      }
    }

    const orderId = nextId('o');
    const now = nowIso();
    const currency = 'YER';
    const groups = new Map<string, OrderShopGroup>();
    const orderItems: OrderItem[] = [];

    let total = 0;
    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId)!;
      const shop = db.shops.find(s => s.id === product.shopId)!;
      if (!shop) continue;
      const unitPrice = product.priceVisibility === PriceVisibility.SHOW_PRICE ? product.price : 0;
      orderItems.push({
        id: nextId('oi'), orderId, productId: product.id,
        partNameEn: product.nameEn, partNameAr: product.nameAr,
        shopId: shop.id, shopNameEn: shop.nameEn, shopNameAr: shop.nameAr,
        branchId: item.branchId,
        quantity: item.quantity, unitPrice, currency, saleMode: product.saleMode,
      });
      const existing = groups.get(shop.id);
      if (existing) {
        existing.subtotal += unitPrice * item.quantity;
        existing.itemsCount += item.quantity;
      } else {
        groups.set(shop.id, {
          id: nextId('og'), shopId: shop.id, shopNameEn: shop.nameEn, shopNameAr: shop.nameAr,
          subtotal: unitPrice * item.quantity, currency, status: OrderStatus.PENDING, itemsCount: item.quantity,
        });
      }
      total += unitPrice * item.quantity;
    }

    const groupList = [...groups.values()];
    const deliveryFee = input.deliveryType === DeliveryType.PICKUP
      ? 0
      : groupList.reduce((sum, g) => sum + estimatedFee(db.shops.find(s => s.id === g.shopId) as Shop, input.deliveryType), 0);
    total += deliveryFee;

    const order: Order = {
      id: orderId, customerId: user.id, status: OrderStatus.PENDING,
      paymentMethod: input.paymentMethod, deliveryType: input.deliveryType,
      deliveryAddressId: input.deliveryAddressId, notes: input.notes,
      subtotal: total - deliveryFee, deliveryFee, total, currency,
      isExternal: orderItems.some(i => i.saleMode === SaleMode.EXTERNAL),
      items: orderItems, shopGroups: groupList, createdAt: now, updatedAt: now,
    };
    db.orders = [order, ...db.orders];

    // Reserve stock + record movements (online lines only).
    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId)!;
      if (product.saleMode === SaleMode.EXTERNAL) continue;
      const qtyAfter = Math.max(0, product.quantity - item.quantity);
      product.quantity = qtyAfter;
      product.stockQuantity = qtyAfter;
      product.soldCount = (product.soldCount ?? 0) + item.quantity;
      db.products = db.products.map(p => (p.id === product.id ? product : p));
      recordMovementLocally({
        productId: product.id, shopId: product.shopId, branchId: product.branchId,
        type: 'OUT', quantityChange: -item.quantity, quantityAfter: qtyAfter,
        reason: 'Sale — order ' + orderId, referenceId: orderId, userId: user.id, date: now,
      });
    }

    // Payments
    const paidImmediately = input.paymentMethod === PaymentMethod.WALLET
      || input.paymentMethod === PaymentMethod.CARD
      || input.paymentMethod === PaymentMethod.BANK_TRANSFER;
    const payments = groupList.map<Payment>(g => ({
      id: nextId('pay'), orderId, userId: user.id,
      method: input.paymentMethod,
      status: paidImmediately ? PaymentStatus.PAID : PaymentStatus.PENDING,
      amount: g.subtotal, currency,
      transactionRef: paidImmediately ? `TXN-${orderId}-${g.shopId.slice(-4)}` : undefined,
      createdAt: now, paidAt: paidImmediately ? now : undefined,
    }));
    db.payments = [...db.payments, ...payments];

    // Notify shops + customer
    for (const g of groupList) {
      notifyShopMembers(g.shopId, {
        type: 'ORDER',
        titleEn: 'New order received',
        titleAr: 'تم استلام طلب جديد',
        bodyEn: `Order ${orderId} (${g.itemsCount} items) — ${g.subtotal} ${g.currency}`,
        bodyAr: `الطلب ${orderId} (${g.itemsCount} أصناف) — ${g.subtotal} ${g.currency}`,
        link: `/shop/orders?order=${orderId}`,
      });
    }
    createNotification({
      userId: user.id, type: 'ORDER',
      titleEn: 'Order placed', titleAr: 'تم إنشاء الطلب',
      bodyEn: `Order ${orderId} is being processed across ${groupList.length} shop(s).`,
      bodyAr: `الطلب ${orderId} قيد المعالجة في ${groupList.length} محلات.`,
      link: `/orders/${orderId}`,
    });

    audit(user.id, 'order.create', 'order', orderId, { total: order.total, groups: groupList.length });
    saveCart([]);
    return order;
  },

  myOrders(): Order[] {
    const user = requireAuth();
    return sortOrders(db.orders.filter(o => o.customerId === user.id));
  },

  getMine(orderId: string): Order {
    const user = requireAuth();
    const order = db.orders.find(o => o.id === orderId && o.customerId === user.id);
    if (!order) throw new ApiError({ message: 'Order not found.', status: 404 });
    return order;
  },

  cancelMine(orderId: string): Order {
    const user = requireAuth();
    const order = db.orders.find(o => o.id === orderId && o.customerId === user.id);
    if (!order) throw new ApiError({ message: 'Order not found.', status: 404 });
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new ApiError({ message: 'This order can no longer be cancelled.', status: 422 });
    }
    order.status = OrderStatus.CANCELLED;
    order.updatedAt = nowIso();
    // Restore stock
    for (const item of order.items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product || item.saleMode === SaleMode.EXTERNAL) continue;
      product.quantity += item.quantity;
      product.stockQuantity += item.quantity;
      db.products = db.products.map(p => (p.id === product.id ? product : p));
      recordMovementLocally({
        productId: product.id, shopId: product.shopId, branchId: product.branchId,
        type: 'IN', quantityChange: item.quantity, quantityAfter: product.quantity,
        reason: 'Order cancellation', referenceId: orderId, userId: user.id, date: nowIso(),
      });
    }
    db.orders = db.orders.map(o => (o.id === orderId ? order : o));
    audit(user.id, 'order.cancel', 'order', orderId);
    return order;
  },

  /** Shop-side orders (owner/employee with orders.view). */
  shopOrders(filters: { shopId?: string; status?: string } = {}): Order[] {
    const user = requireAuth();
    const ctx = activeShopFor(user);
    const shopId = filters.shopId ?? ctx.shopId ?? user.shopMemberships?.find(m => m.role === 'OWNER' && m.isActive)?.shopId;
    if (!shopId || (!canManageShop(user, shopId) && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
      throw new ApiError({ message: 'Forbidden.', status: 403 });
    }
    assertPermission(user, 'orders.view');
    let result = db.orders.filter(o => o.shopGroups.some(g => g.shopId === shopId));
    if (filters.status) result = result.filter(o => o.shopGroups.some(g => g.shopId === shopId && g.status === filters.status));
    return sortOrders(result);
  },

  getShopOrder(orderId: string): { order: Order; group: OrderShopGroup } {
    const user = requireAuth();
    const ctx = activeShopFor(user);
    const shopId = ctx.shopId ?? user.shopMemberships?.find(m => m.role === 'OWNER' && m.isActive)?.shopId;
    const order = db.orders.find(o => o.id === orderId);
    const group = order?.shopGroups.find(g => g.shopId === shopId);
    if (!order || !group || (!canManageShop(user, shopId as string) && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
      throw new ApiError({ message: 'Order not found.', status: 404 });
    }
    assertPermission(user, 'orders.view');
    return { order, group };
  },

  updateShopGroupStatus(orderId: string, groupShopId: string, status: OrderStatus): Order {
    const user = requireAuth();
    assertPermission(user, (status === OrderStatus.CONFIRMED || status === OrderStatus.REJECTED) ? 'orders.confirm' : 'orders.update');
    const order = db.orders.find(o => o.id === orderId);
    const group = order?.shopGroups.find(g => g.shopId === groupShopId);
    if (!order || !group) throw new ApiError({ message: 'Order not found.', status: 404 });
    if (!canManageShop(user, group.shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    group.status = status;
    const allDone = order.shopGroups.every(g => g.status === OrderStatus.COMPLETED
      || g.status === OrderStatus.REJECTED || g.status === OrderStatus.CANCELLED);
    if (allDone) {
      order.status = order.shopGroups.some(g => g.status === OrderStatus.COMPLETED)
        ? OrderStatus.COMPLETED : OrderStatus.CANCELLED;
      order.updatedAt = nowIso();
    }
    // Commission accrual on completion
    if (status === OrderStatus.COMPLETED) {
      const shop = db.shops.find(s => s.id === group.shopId);
      if (shop) {
        const rate = shop.commissionType === 'FIXED'
          ? (shop.commissionValue ?? 0)
          : Math.round(group.subtotal * (shop.commissionValue ?? 0) / 100);
        group.commissionAmount = rate;
      }
    }
    createNotification({
      userId: order.customerId, type: 'ORDER',
      titleEn: 'Order status updated', titleAr: 'تم تحديث حالة الطلب',
      bodyEn: `Your order ${orderId} in shop ${group.shopNameEn} is now ${status}.`,
      bodyAr: `طلبك ${orderId} في محل ${group.shopNameAr} أصبح ${status}.`,
      link: `/orders/${orderId}`,
    });
    db.orders = db.orders.map(o => (o.id === orderId ? order : o));
    audit(user.id, 'order.group_status', 'order', orderId, { shop: group.shopId, status });
    return order;
  },

  adminList(filters: { status?: string; shopId?: string; customerId?: string; page?: number; perPage?: number } = {}): { orders: Order[]; total: number } {
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    let list = db.orders;
    if (filters.status) list = list.filter(o => o.status === filters.status);
    if (filters.shopId) list = list.filter(o => o.shopGroups.some(g => g.shopId === filters.shopId));
    if (filters.customerId) list = list.filter(o => o.customerId === filters.customerId);
    list = sortOrders(list);
    const perPage = filters.perPage ?? 25;
    const page = filters.page ?? 1;
    return { orders: list.slice((page - 1) * perPage, page * perPage), total: list.length };
  },
};

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------------------------------------------------------------------------
// Payments (/api/v1/payments)
// ---------------------------------------------------------------------------

export const paymentService = {
  forOrder(orderId: string): Payment[] {
    const user = requireAuth();
    const order = db.orders.find(o => o.id === orderId);
    if (!order || order.customerId !== user.id) {
      // Allow shop members with payments.view
      assertPermission(user, 'payments.view');
    }
    return db.payments.filter(p => p.orderId === orderId);
  },

  myPayments(): Payment[] {
    const user = requireAuth();
    return db.payments.filter(p => p.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Simulated gateway intent for online orders — returns a client secret style token. */
  createIntent(orderId: string): { paymentRef: string; requiresAction: boolean } {
    const user = requireAuth();
    const order = db.orders.find(o => o.id === orderId && o.customerId === user.id);
    if (!order) throw new ApiError({ message: 'Order not found.', status: 404 });
    return { paymentRef: `pi_${orderId}_${Date.now().toString(36)}`, requiresAction: false };
  },

  confirm(orderId: string, paymentRef: string): Payment[] {
    const user = requireAuth();
    const order = db.orders.find(o => o.id === orderId && o.customerId === user.id);
    if (!order) throw new ApiError({ message: 'Order not found.', status: 404 });
    const now = nowIso();
    db.payments = db.payments.map(p => {
      if (p.orderId !== orderId) return p;
      if (p.status === PaymentStatus.PENDING) {
        return { ...p, status: PaymentStatus.PAID, transactionRef: paymentRef, paidAt: now };
      }
      return p;
    });
    createNotification({
      userId: user.id, type: 'PAYMENT',
      titleEn: 'Payment confirmed', titleAr: 'تم تأكيد الدفع',
      bodyEn: `Payment for order ${orderId} was confirmed.`, bodyAr: `تم تأكيد دفع الطلب ${orderId}.`,
      link: `/orders/${orderId}`,
    });
    audit(user.id, 'payment.confirm', 'order', orderId);
    return db.payments.filter(p => p.orderId === orderId);
  },

  adminAll(): Payment[] {
    requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);
    return [...db.payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

// ---------------------------------------------------------------------------
// Inventory (/api/v1/inventory)
// ---------------------------------------------------------------------------

const MOVEMENT_LIMIT = 5000;

export const inventoryService = {
  movements(shopId?: string, limit = 100): any[] {
    const user = requireAuth();
    const ctx = activeShopFor(user);
    const target = shopId ?? ctx.shopId;
    if (!target) throw new ApiError({ message: 'No shop context.', status: 400 });
    if (!canManageShop(user, target)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    assertPermission(user, 'inventory.view');
    return db.movements
      .filter(m => m.shopId === target)
      .slice(0, Math.min(limit, MOVEMENT_LIMIT));
  },

  lowStock(shopId?: string): Product[] {
    const user = requireAuth();
    const ctx = activeShopFor(user);
    const target = shopId ?? ctx.shopId;
    if (!target) return [];
    assertPermission(user, 'inventory.view');
    const threshold = db.settings.lowStockThreshold ?? 5;
    return sortProducts(db.products.filter(p => p.shopId === target && p.isActive && p.quantity <= threshold));
  },

  adjust(productId: string, delta: number, reason?: string): Product {
    const user = requireAuth();
    assertPermission(user, 'inventory.adjust');
    const product = db.products.find(p => p.id === productId);
    if (!product) throw new ApiError({ message: 'Product not found.', status: 404 });
    if (!canManageShop(user, product.shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    const after = Math.max(0, product.quantity + delta);
    product.quantity = after;
    product.stockQuantity = after;
    db.products = db.products.map(p => (p.id === productId ? product : p));
    recordMovementLocally({
      productId, shopId: product.shopId, branchId: product.branchId,
      type: delta >= 0 ? 'IN' : 'OUT', quantityChange: delta, quantityAfter: after,
      reason: reason ?? 'Manual adjustment', userId: user.id, date: nowIso(),
    });
    audit(user.id, 'inventory.adjust', 'product', productId, { delta, reason });
    return product;
  },

  setQuantity(productId: string, quantity: number): Product {
    const user = requireAuth();
    const product = db.products.find(p => p.id === productId);
    if (!product) throw new ApiError({ message: 'Product not found.', status: 404 });
    if (!canManageShop(user, product.shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    return this.adjust(productId, quantity - product.quantity);
  },

  setMinStock(productId: string, minStock: number): Product {
    const user = requireAuth();
    const product = db.products.find(p => p.id === productId);
    if (!product) throw new ApiError({ message: 'Product not found.', status: 404 });
    if (!canManageShop(user, product.shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    const next = { ...product, minStock: Math.max(0, minStock) };
    db.products = db.products.map(p => (p.id === productId ? next : p));
    return next;
  },

  transfer(productId: string, toBranchId: string, quantity: number): Product {
    const user = requireAuth();
    assertPermission(user, 'inventory.adjust');
    const product = db.products.find(p => p.id === productId);
    if (!product) throw new ApiError({ message: 'Product not found.', status: 404 });
    if (!canManageShop(user, product.shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    if (!db.branches.some(b => b.id === toBranchId && b.shopId === product.shopId)) {
      throw new ApiError({ message: 'Target branch not found.', status: 404 });
    }
    const qty = Math.min(Math.max(1, quantity), product.quantity);
    const after = product.quantity - qty;
    product.quantity = after;
    product.stockQuantity = after;
    product.branchId = toBranchId;
    db.products = db.products.map(p => (p.id === productId ? product : p));
    recordMovementLocally({
      productId, shopId: product.shopId, branchId: toBranchId,
      type: 'TRANSFER', quantityChange: -qty, quantityAfter: after,
      reason: `Transfer to ${toBranchId}`, userId: user.id, date: nowIso(),
    });
    return product;
  },

  /** CSV import: SKU,name_en,name_ar,qty,price,category,manufacturer,condition oem,min_stock */
  importCsv(text: string): { created: number; updated: number; errors: string[] } {
    const user = requireAuth();
    assertPermission(user, 'inventory.import');
    const ctx = activeShopFor(user);
    const shopId = ctx.shopId ?? user.shopMemberships?.find(m => m.role === 'OWNER' && m.isActive)?.shopId;
    if (!shopId || !canManageShop(user, shopId)) throw new ApiError({ message: 'Forbidden.', status: 403 });
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const errors: string[] = [];
    let created = 0;
    let updated = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < 4) { errors.push(`Line ${i + 1}: too few columns`); continue; }
      const [sku, nameEn, nameAr, qty, price] = cols;
      const quantity = parseInt(qty, 10);
      const unitPrice = parseFloat(price || '0');
      if (isNaN(quantity) || isNaN(unitPrice)) { errors.push(`Line ${i + 1}: invalid qty/price`); continue; }
      const existing = db.products.find(p => p.shopId === shopId && (p.partNumber === sku || p.oemNumber === sku) && p.isActive);
      if (existing) {
        existing.quantity += quantity;
        existing.stockQuantity = existing.quantity;
        existing.price = unitPrice;
        existing.nameEn = nameEn || existing.nameEn;
        existing.nameAr = nameAr || existing.nameAr;
        db.products = db.products.map(p => (p.id === existing.id ? existing : p));
        updated++;
      } else {
        const product: any = {
          id: nextId('p'), shopId, manufacturerId: 'mfr1', categoryId: 'c1',
          nameEn: nameEn, nameAr: nameAr || nameEn, carBrand: 'General', carModel: '', yearRange: '',
          partNumber: sku, condition: 'NEW', price: unitPrice, currency: curForShop(shopId),
          priceVisibility: 'SHOW_PRICE', saleMode: 'BOTH', quantity,
          stockQuantity: quantity, minStock: db.settings.lowStockThreshold ?? 5,
          imageUrl: '', fitments: [], soldCount: 0, isActive: true, rating: 0, ratingCount: 0,
          createdAt: nowIso(),
        };
        db.products = [product, ...db.products];
        created++;
      }
    }
    if (created + updated > 0) {
      const products = db.products.filter(p => p.shopId === shopId && p.isActive && p.quantity > 0);
      audit(user.id, 'inventory.import', 'shop', shopId, { created, updated, errors: errors.length });
    }
    return { created, updated, errors };
  },
};

function curForShop(shopId: string): string {
  const shop = db.shops.find(s => s.id === shopId);
  return getCountry(shop?.countryId)?.currency ?? 'YER';
}

function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => (a.quantity - b.quantity) || b.createdAt.localeCompare(a.createdAt));
}

export type { CartItem };