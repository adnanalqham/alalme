import { User, UserRole, UserStatus, ShopStatus, PermissionKey, EffectiveRole } from '../types';
import { db } from '../api/db';

export type UserExperienceType =
  | 'GUEST'
  | 'CUSTOMER'
  | 'SHOP_OWNER_APPROVED'
  | 'SHOP_OWNER_PENDING'
  | 'SHOP_EMPLOYEE'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export interface UserExperienceResolution {
  experience: UserExperienceType;
  effectiveRole: EffectiveRole;
  shopStatus?: ShopStatus;
  shopId?: string;
  defaultRoute: string;
  canAccessShopPanel: boolean;
  canAccessAdminPanel: boolean;
}

/**
 * Centralized Role & Experience Resolution Engine for ALA Platform
 * Resolves user role, account status, shop approval status, and target navigation.
 */
export function resolveUserExperience(user: User | null): UserExperienceResolution {
  if (!user || user.status !== UserStatus.ACTIVE) {
    return {
      experience: 'GUEST',
      effectiveRole: 'GUEST',
      defaultRoute: '/',
      canAccessShopPanel: false,
      canAccessAdminPanel: false,
    };
  }

  // Super Admin & Admin
  if (user.role === UserRole.SUPER_ADMIN) {
    return {
      experience: 'SUPER_ADMIN',
      effectiveRole: UserRole.SUPER_ADMIN,
      defaultRoute: '/admin',
      canAccessShopPanel: true,
      canAccessAdminPanel: true,
    };
  }

  if (user.role === UserRole.ADMIN) {
    return {
      experience: 'ADMIN',
      effectiveRole: UserRole.ADMIN,
      defaultRoute: '/admin',
      canAccessShopPanel: true,
      canAccessAdminPanel: true,
    };
  }

  // Shop Employee
  if (user.role === UserRole.SHOP_EMPLOYEE) {
    const membership = user.shopMemberships?.find(m => m.role === 'EMPLOYEE' && m.isActive);
    const shop = membership ? db.shops.find(s => s.id === membership.shopId) : undefined;
    const isShopApproved = shop?.status === ShopStatus.APPROVED;

    return {
      experience: 'SHOP_EMPLOYEE',
      effectiveRole: UserRole.SHOP_EMPLOYEE,
      shopStatus: shop?.status,
      shopId: shop?.id,
      defaultRoute: isShopApproved ? '/shop/dashboard' : '/',
      canAccessShopPanel: isShopApproved,
      canAccessAdminPanel: false,
    };
  }

  // Shop Owner (including legacy SELLER alias)
  if (user.role === UserRole.SHOP_OWNER || user.role === UserRole.SELLER) {
    const shopId = user.shopMemberships?.find(m => m.role === 'OWNER' && m.isActive)?.shopId ?? user.shopId;
    const shop = shopId ? db.shops.find(s => s.id === shopId) : undefined;

    if (shop?.status === ShopStatus.APPROVED) {
      return {
        experience: 'SHOP_OWNER_APPROVED',
        effectiveRole: UserRole.SHOP_OWNER,
        shopStatus: ShopStatus.APPROVED,
        shopId: shop.id,
        defaultRoute: '/shop/dashboard',
        canAccessShopPanel: true,
        canAccessAdminPanel: false,
      };
    }

    // Pending or other status
    return {
      experience: 'SHOP_OWNER_PENDING',
      effectiveRole: UserRole.SHOP_OWNER,
      shopStatus: shop?.status ?? ShopStatus.PENDING,
      shopId: shop?.id,
      defaultRoute: '/shop/pending',
      canAccessShopPanel: false,
      canAccessAdminPanel: false,
    };
  }

  // Customer
  return {
    experience: 'CUSTOMER',
    effectiveRole: UserRole.CUSTOMER,
    defaultRoute: '/',
    canAccessShopPanel: false,
    canAccessAdminPanel: false,
  };
}
