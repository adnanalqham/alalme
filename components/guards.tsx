import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PermissionKey, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children, roles, permissions }: { children: React.ReactNode; roles?: UserRole[]; permissions?: PermissionKey[] }) {
  const { isAuthenticated, user, permissions: userPerms, effectiveRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (roles && user && !roles.includes(user.role)) {
    // Allow legacy SELLER to access SHOP routes
    const normalized = user.role === UserRole.SELLER ? UserRole.SHOP_OWNER : user.role;
    if (!roles.includes(normalized)) {
      return <Navigate to="/" replace />;
    }
  }
  if (permissions) {
    const hasAll = permissions.every(p => userPerms.includes(p));
    if (!hasAll) return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
      {children}
    </RequireAuth>
  );
}

export function ShopOnly({ children }: { children: React.ReactNode }) {
  const { user, resolution } = useAuth();
  if (resolution.experience === 'SHOP_OWNER_PENDING') {
    return <Navigate to="/shop/pending" replace />;
  }
  return (
    <RequireAuth roles={[UserRole.SHOP_OWNER, UserRole.SHOP_EMPLOYEE, UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
      {children}
    </RequireAuth>
  );
}

export function CustomerOnly({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={[UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SHOP_OWNER, UserRole.SHOP_EMPLOYEE]}>
      {children}
    </RequireAuth>
  );
}

export default RequireAuth;