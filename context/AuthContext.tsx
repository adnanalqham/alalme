import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { useSafeClerk } from '../components/SafeClerkProvider';
import { ApiError, EffectiveRole, PermissionKey, ROLE_DEFAULT_PERMISSIONS, User, UserRole, UserStatus } from '../types';
import { authService } from '../api';
import { resolveUserExperience, UserExperienceResolution } from '../services/roleResolution';
import SplashScreen from '../components/SplashScreen';
import ErrorScreen from '../components/ErrorScreen';

interface AuthContextType {
  user: User | null;
  /** Legacy signature — returns true on success. Use loginFull for the error envelope. */
  login: (username: string, password: string) => Promise<boolean>;
  /** Real login — throws ApiError with a safe message on failure. */
  loginFull: (username: string, password: string) => Promise<User>;
  loginWithPhone: (phone: string) => Promise<{ pending: boolean; phone: string; hint: string }>;
  verifyOtp: (phone: string, code: string) => Promise<User>;
  loginWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  register: (user: User) => Promise<void>;
  registerShopOwner: (input: any) => Promise<User>;
  isAdmin: boolean;
  isSeller: boolean;
  isAuthenticated: boolean;
  effectiveRole: EffectiveRole;
  permissions: PermissionKey[];
  hasPermission: (permission: PermissionKey) => boolean;
  resolution: UserExperienceResolution;
  /** Active shop context for shop roles. */
  activeShopId?: string;
  activeBranchId?: string;
  setActiveShop: (shopId: string, branchId?: string) => void;
  refresh: () => void;
  lastError?: string;
  isClerkLoaded: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isClerkLoaded,
    isSignedIn,
    clerkUserId,
    getToken,
    clerkUser,
    signOut,
    signIn,
    isSignInLoaded,
    signUp,
    isSignUpLoaded,
  } = useSafeClerk();

  const [alaUser, setAlaUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [lastError, setLastError] = useState<string | undefined>();
  const [activeShopIdState, setActiveShopIdState] = useState<string | undefined>();
  const [activeBranchIdState, setActiveBranchIdState] = useState<string | undefined>();

  // Synchronize Clerk Session with ALA User Record and Backend RBAC
  const syncClerkSession = useCallback(async () => {
    if (!isSignedIn || !clerkUserId) {
      setAlaUser(null);
      localStorage.removeItem('clerk_token');
      localStorage.removeItem('ala_auth_token');
      localStorage.removeItem('ala_current_user');
      setIsAuthReady(true);
      return;
    }

    try {
      const token = await getToken();
      if (token) {
        localStorage.setItem('clerk_token', token);
        localStorage.setItem('ala_auth_token', token);
      }
      const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress;
      const primaryPhone = clerkUser?.primaryPhoneNumber?.phoneNumber;
      const fullName = clerkUser?.fullName || clerkUser?.firstName || primaryEmail || 'ALA User';

      let resolvedRole = UserRole.CUSTOMER;
      let resolvedStatus = UserStatus.ACTIVE;
      let resolvedShopId: string | undefined;
      let resolvedBranchId: string | undefined;

      // 1. Authoritative Backend Synchronization with Laravel
      if (token) {
        try {
          const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
          const res = await fetch(`${apiBase}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              resolvedRole = (data.user.role as UserRole) || UserRole.CUSTOMER;
              resolvedStatus = (data.user.status as UserStatus) || UserStatus.ACTIVE;
              resolvedShopId = data.user.shop_id || undefined;
              resolvedBranchId = data.user.branch_id || undefined;
            }
          }
        } catch (backendErr) {
          console.warn('[Auth Diagnostics] Backend /auth/me check failed:', backendErr);
        }
      }

      // 2. Build verified user identity from Clerk + backend
      const u: User = {
        id: `u_${clerkUserId.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`,
        clerkUserId,
        role: resolvedRole,
        fullName,
        name: fullName,
        username: clerkUser?.username || `u_${clerkUserId.slice(-6)}`,
        email: primaryEmail || '',
        phone: primaryPhone || '',
        status: resolvedStatus,
        avatarUrl: clerkUser?.imageUrl,
        createdAt: clerkUser?.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      };

      if (resolvedShopId) {
        setActiveShopIdState(resolvedShopId);
      }
      if (resolvedBranchId) {
        setActiveBranchIdState(resolvedBranchId);
      }

      setAlaUser(u);
      setIsAuthReady(true);
    } catch (e) {
      console.warn('[Auth Diagnostics] Failed to sync session:', e);
      setAlaUser(null);
      setIsAuthReady(true);
    }
  }, [isSignedIn, clerkUserId, clerkUser, getToken]);

  useEffect(() => {
    if (isClerkLoaded) {
      syncClerkSession();
    }
  }, [isClerkLoaded, syncClerkSession]);

  useEffect(() => {
    // If auth resolution exceeds 6 seconds (e.g. offline or unresponsive network),
    // show the user-friendly error screen instead of hanging.
    const timer = setTimeout(() => {
      if (!isAuthReady) {
        console.warn('[Auth Diagnostics] Auth resolution timed out after 6000ms');
        setAuthError(true);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [isAuthReady]);

  const refresh = useCallback(() => {
    syncClerkSession();
  }, [syncClerkSession]);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      setLastError(undefined);
      if (isSignInLoaded && signIn && (usernameOrEmail.includes('@') || usernameOrEmail.length >= 4)) {
        try {
          const result = await signIn.create({
            identifier: usernameOrEmail,
            password,
          });

          if (result.status === 'complete') {
            await syncClerkSession();
            return true;
          }
        } catch (clerkErr) {
          // Fall through to local fallback
        }
      }

      // Fallback service layer authentication (e.g. for demo accounts like 'ad' / '123')
      const { user: u } = authService.login(usernameOrEmail, password);
      setAlaUser(u);
      return true;
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.message || 'Login failed.';
      setLastError(msg);
      return false;
    }
  };

  const loginFull = async (usernameOrEmail: string, password: string): Promise<User> => {
    setLastError(undefined);
    if (isSignInLoaded && signIn && (usernameOrEmail.includes('@') || usernameOrEmail.length >= 4)) {
      try {
        const result = await signIn.create({
          identifier: usernameOrEmail,
          password,
        });
        if (result.status === 'complete') {
          await syncClerkSession();
          const u = authService.currentUser();
          if (u) return u;
        }
      } catch (err: any) {
        // Check if matching local demo user exists
        try {
          const { user: localUser } = authService.login(usernameOrEmail, password);
          setAlaUser(localUser);
          return localUser;
        } catch {
          const msg = err?.errors?.[0]?.longMessage || err?.message || 'Invalid credentials.';
          throw new ApiError({ message: msg, status: 401 });
        }
      }
    }

    const { user: u } = authService.login(usernameOrEmail, password);
    setAlaUser(u);
    return u;
  };

  const loginWithPhone = async (phone: string): Promise<{ pending: boolean; phone: string; hint: string }> => {
    if (isSignInLoaded && signIn) {
      try {
        const { supportedFirstFactors } = await signIn.create({
          identifier: phone,
        });
        const isPhoneCode = supportedFirstFactors?.find((f: any) => f.strategy === 'phone_code');
        if (isPhoneCode) {
          await signIn.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: (isPhoneCode as any).phoneNumberId,
          });
          return { pending: true, phone, hint: 'تم إرسال رمز التحقق عبر SMS' };
        }
      } catch (e) {
        // Fallback to local auth contract
      }
    }

    return authService.loginWithPhone(phone);
  };

  const verifyOtp = async (phone: string, code: string): Promise<User> => {
    if (isSignInLoaded && signIn) {
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: 'phone_code',
          code,
        });
        if (result.status === 'complete') {
          await syncClerkSession();
          const u = authService.currentUser();
          if (u) return u;
        }
      } catch (err: any) {
        const msg = err?.errors?.[0]?.longMessage || 'Invalid or expired OTP code.';
        throw new ApiError({ message: msg, status: 422 });
      }
    }

    const { user: u } = authService.verifyOtp(phone, code);
    setAlaUser(u);
    return u;
  };

  const loginWithProvider = async (provider: 'google' | 'apple'): Promise<void> => {
    if (isSignInLoaded && signIn) {
      await signIn.authenticateWithRedirect({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_apple',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
      return;
    }

    const { user: u } = authService.loginWithProvider(provider);
    setAlaUser(u);
  };

  const logout = async (): Promise<void> => {
    try {
      if (signOut) {
        await signOut();
      }
      authService.logout();
      localStorage.removeItem('clerk_token');
      localStorage.removeItem('ala_auth_token');
    } catch {
      /* Session clean */
    }
    setAlaUser(null);
  };

  const register = async (newUser: User): Promise<void> => {
    if (isSignUpLoaded && signUp && newUser.email) {
      try {
        await signUp.create({
          emailAddress: newUser.email,
          password: newUser.passwordHash || '12345678',
          firstName: newUser.fullName.split(' ')[0] || newUser.fullName,
          lastName: newUser.fullName.split(' ').slice(1).join(' ') || '',
        });
      } catch (e) {
        // Fallback
      }
    }

    const { user: u } = authService.registerCustomer({
      username: newUser.username,
      fullName: newUser.fullName,
      password: newUser.passwordHash || '123456',
      email: newUser.email,
      phone: newUser.phone,
      countryId: newUser.countryId,
      cityId: newUser.cityId,
      city: newUser.city,
      address: newUser.address,
      preferredCategories: newUser.preferredCategories,
      ownedCarBrands: newUser.ownedCarBrands,
    });
    setAlaUser(u);
  };

  const registerShopOwner = async (input: any): Promise<User> => {
    const { user: u } = authService.registerShopOwner(input);
    setAlaUser(u);
    return u;
  };

  const setActiveShop = (shopId: string, branchId?: string) => {
    setActiveShopIdState(shopId);
    setActiveBranchIdState(branchId);
    const res = authService.setActiveShopContext(shopId, branchId);
    setAlaUser(res.user);
  };

  const permissions: PermissionKey[] = alaUser ? effectivePerms(alaUser) : [];
  const role = alaUser?.role === UserRole.SELLER ? UserRole.SHOP_OWNER : alaUser?.role;

  const value: AuthContextType = {
    user: alaUser,
    login,
    loginFull,
    loginWithPhone,
    verifyOtp,
    loginWithProvider,
    logout,
    register,
    registerShopOwner,
    isAdmin: !!alaUser && (alaUser.role === UserRole.ADMIN || alaUser.role === UserRole.SUPER_ADMIN),
    isSeller: !!alaUser && (role === UserRole.SHOP_OWNER),
    isAuthenticated: !!alaUser && alaUser.status === UserStatus.ACTIVE,
    effectiveRole: (alaUser ? role : 'GUEST') as EffectiveRole,
    permissions,
    hasPermission: (p: PermissionKey) => permissions.includes(p),
    resolution: resolveUserExperience(alaUser),
    activeShopId: activeShopIdState ?? alaUser?.shopMemberships?.find(m => m.isActive)?.shopId ?? alaUser?.shopId,
    activeBranchId: activeBranchIdState ?? alaUser?.shopMemberships?.find(m => m.isActive)?.branchId,
    setActiveShop,
    refresh,
    lastError,
    isClerkLoaded,
    isAuthReady,
  };

  if (authError) {
    return <ErrorScreen onRetry={() => window.location.reload()} />;
  }

  if (!isAuthReady) {
    return <SplashScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function effectivePerms(u: User): PermissionKey[] {
  const roleKey = u.role === UserRole.SELLER ? UserRole.SHOP_OWNER : u.role;
  const defaults = ROLE_DEFAULT_PERMISSIONS[roleKey] ?? [];
  const overrides: PermissionKey[] = [];
  for (const m of u.shopMemberships ?? []) {
    if (m.permissions) for (const p of m.permissions) if (!overrides.includes(p)) overrides.push(p);
  }
  return Array.from(new Set([...defaults, ...overrides]));
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const usePermissions = () => {
  const { permissions, hasPermission, effectiveRole, isSeller, isAdmin } = useAuth();
  return {
    permissions,
    hasPermission,
    canViewProducts: hasPermission('products.view'),
    canCreateProducts: hasPermission('products.create'),
    canEditProducts: hasPermission('products.update'),
    canDeleteProducts: hasPermission('products.delete'),
    canViewInventory: hasPermission('inventory.view'),
    canAdjustInventory: hasPermission('inventory.adjust'),
    canImportInventory: hasPermission('inventory.import'),
    canViewOrders: hasPermission('orders.view'),
    canUpdateOrders: hasPermission('orders.update'),
    canConfirmOrders: hasPermission('orders.confirm'),
    canManageEmployees: hasPermission('employees.view') || hasPermission('employees.create') || hasPermission('employees.update'),
    canManageBranches: hasPermission('branches.view') || hasPermission('branches.create') || hasPermission('branches.update'),
    canViewReports: hasPermission('reports.view'),
    canManageSettings: hasPermission('settings.manage'),
    canManageCommissions: hasPermission('commissions.manage'),
  };
};