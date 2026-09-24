// ============================================================================
// api/security.ts
// RBAC + custom permissions. Mirrors the Laravel Policy layer: every service
// re-resolves the acting user from storage and asserts permissions here,
// so the frontend can never grant itself rights by hiding buttons.
// ============================================================================

import { ApiError, PERMISSIONS, PermissionKey, ROLE_DEFAULT_PERMISSIONS, User, UserRole } from '../types';
import { getSession, type Session } from './session';
import { db } from './db';

let idSequence = 0;
export const nextId = (prefix: string) => `${prefix}_${++idSequence}_${Date.now().toString(36)}`;

export const nowIso = () => new Date().toISOString();

export function audit(userId: string, action: string, entityType?: string, entityId?: string, meta?: unknown) {
  const logs = db.auditLogs;
  logs.unshift({
    id: nextId('aud'),
    userId,
    action,
    entityType,
    entityId,
    meta: meta ? JSON.stringify(meta) : undefined,
    createdAt: nowIso(),
  });
  db.auditLogs = logs.slice(0, 500);
}

export function requireAuth(): User {
  const session = getSession();
  if (!session) {
    throw new ApiError({ message: 'Unauthenticated.', status: 401 });
  }
  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    throw new ApiError({ message: 'Session user not found.', status: 401 });
  }
  if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
    throw new ApiError({ message: 'Account is not active.', status: 403 });
  }
  return user;
}

export function requireRole(...roles: UserRole[]): User {
  const user = requireAuth();
  if (!roles.includes(user.role)) {
    throw new ApiError({ message: 'Role not allowed for this action.', status: 403 });
  }
  return user;
}

/** Effective granted permission keys (permission-based, not role-name based). */
export function effectivePermissions(user: User): PermissionKey[] {
  const activeShopMembership = user.shopMemberships?.find(m => m.isActive);
  if (activeShopMembership?.permissions) {
    return activeShopMembership.permissions as PermissionKey[];
  }
  return ROLE_DEFAULT_PERMISSIONS[user.role] ?? [];
}

export function hasPermission(user: User, permission: PermissionKey): boolean {
  return effectivePermissions(user).includes(permission);
}

export function assertPermission(user: User, permission: PermissionKey): void {
  if (!hasPermission(user, permission)) {
    throw new ApiError({ message: `Missing permission: ${permission}.`, status: 403 });
  }
}

/** Can this user perform shop-level operations within `shopId`? */
export function canManageShop(user: User, shopId: string | undefined | null): boolean {
  if (!shopId) return false;
  if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) return true;
  const membership = user.shopMemberships?.find(m => m.shopId === shopId && m.isActive);
  if (!membership) return false;
  const shop = db.shops.find(s => s.id === shopId);
  if (!shop || shop.status !== 'APPROVED') return false;
  return true;
}

/** Which shop should this user operate against (explicit active shop context). */
export function activeShopFor(user: User): { shopId?: string; branchId?: string } {
  const session = getSession();
  if (session?.shopId && user.shopMemberships?.some(m => m.shopId === session.shopId && m.isActive)) {
    return { shopId: session.shopId, branchId: session.branchId };
  }
  return {};
}

export function isPermissionKey(value: string): value is PermissionKey {
  return PERMISSIONS.some(p => p.key === value);
}

/** Server-style validation helper. */
export function validate(payload: Record<string, unknown>, rules: Record<string, (v: any) => boolean>, labels: Record<string, string>) {
  const errors: Record<string, string[]> = {};
  for (const [field, test] of Object.entries(rules)) {
    if (!test(payload[field])) {
      errors[field] = [`${labels[field] ?? field} is invalid.`];
    }
  }
  if (Object.keys(errors).length > 0) {
    throw new ApiError({ message: 'The given data was invalid.', status: 422, errors });
  }
}

export { getSession, type Session };