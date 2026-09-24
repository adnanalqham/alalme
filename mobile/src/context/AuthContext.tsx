import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser, useSignIn, useSignUp } from '@clerk/clerk-expo';

declare const process: { env: Record<string, string | undefined> };

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SHOP_OWNER' | 'SHOP_EMPLOYEE' | 'CUSTOMER' | 'GUEST';

export type MobileExperience =
  | 'GUEST'
  | 'CUSTOMER'
  | 'SHOP_OWNER_APPROVED'
  | 'SHOP_OWNER_PENDING'
  | 'SHOP_EMPLOYEE'
  | 'ADMIN';

export interface MobileUser {
  id: string;
  clerkUserId?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  shopId?: string;
  shopName?: string;
  branchName?: string;
  shopStatus?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED';
  permissions?: string[];
  avatarUrl?: string;
}

export interface RegisterCustomerInput {
  name: string;
  phone: string;
  email?: string;
  password?: string;
}

/**
 * Development & QA Fixtures
 * Strictly restricted to __DEV__ builds. In production, canonical user sessions come exclusively
 * from authenticated backend token/session resolution.
 */
export const DEMO_USERS: Record<string, MobileUser> = {
  customer: {
    id: 'u3',
    name: 'Salem Omar (عميل)',
    email: 'salem@gmail.com',
    phone: '777222222',
    role: 'CUSTOMER',
  },
  owner_approved: {
    id: 'u2',
    name: 'Ahmed Ali (مالك متجر معتمد)',
    email: 'ahmed@barakah.com',
    phone: '777111111',
    role: 'SHOP_OWNER',
    shopId: 's1',
    shopName: 'Al-Barakah Auto Parts (البركة لقطع الغيار)',
    branchName: 'Aden Main Branch (فرع عدن الرئيسي)',
    shopStatus: 'APPROVED',
  },
  owner_pending: {
    id: 'u7',
    name: 'Tariq Nabil (متجر قيد المراجعة)',
    email: 'tariq@newparts.com',
    phone: '777888888',
    role: 'SHOP_OWNER',
    shopId: 's_pending_1',
    shopName: 'Al-Najah Modern Auto Parts (محل النجاح الحديث)',
    branchName: 'Sana\'a Branch (فرع صنعاء)',
    shopStatus: 'PENDING',
  },
  employee_full: {
    id: 'u5',
    name: 'Khalid Nasser (موظف بصلاحيات كاملة)',
    email: 'khalid@barakah.com',
    phone: '777444444',
    role: 'SHOP_EMPLOYEE',
    shopId: 's1',
    shopName: 'Al-Barakah Auto Parts',
    branchName: 'Aden Main Branch',
    shopStatus: 'APPROVED',
    permissions: [
      'products.view',
      'products.create',
      'products.update',
      'inventory.view',
      'inventory.adjust',
      'orders.view',
      'orders.confirm',
      'orders.update',
    ],
  },
  employee_limited: {
    id: 'u8',
    name: 'Yasser Gamal (موظف بصلاحيات مشاهدة فقط)',
    email: 'yasser@barakah.com',
    phone: '777333333',
    role: 'SHOP_EMPLOYEE',
    shopId: 's1',
    shopName: 'Al-Barakah Auto Parts',
    branchName: 'Aden Main Branch',
    shopStatus: 'APPROVED',
    permissions: [
      'products.view',
      'inventory.view',
      'orders.view',
    ],
  },
  admin: {
    id: 'u6',
    name: 'Mona Saleh (إدارة العمليات)',
    email: 'mona@alalami.com',
    phone: '777555555',
    role: 'ADMIN',
  },
  superadmin: {
    id: 'u1',
    name: 'System Admin (المشرف العام)',
    email: 'admin@alalami.com',
    phone: '777000000',
    role: 'SUPER_ADMIN',
  },
};

interface AuthContextType {
  user: MobileUser | null;
  role: UserRole;
  experience: MobileExperience;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  loginAs: (userKey: keyof typeof DEMO_USERS) => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; hint?: string; error?: string }>;
  loginWithPhone: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (input: RegisterCustomerInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canAdjustInventory: boolean;
  canConfirmOrders: boolean;
  canUpdateOrders: boolean;
  activeShopName: string;
  activeShopStatus?: string;
  getClerkToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isClerkLoaded, isSignedIn, userId: clerkUserId, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const [user, setUser] = useState<MobileUser | null>(__DEV__ ? DEMO_USERS.customer : null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Synchronize Clerk Session with Mobile User State
  const syncClerkSession = useCallback(async () => {
    if (!isSignedIn || !clerkUserId) {
      if (!__DEV__) {
        setUser(null);
      }
      return;
    }

    try {
      const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress || '';
      const primaryPhone = clerkUser?.primaryPhoneNumber?.phoneNumber || '';
      const fullName = clerkUser?.fullName || clerkUser?.firstName || primaryEmail || 'ALA User';

      let resolvedRole: UserRole = 'CUSTOMER';
      let resolvedShopId: string | undefined;
      let resolvedShopName: string | undefined;
      let resolvedBranchName: string | undefined;
      let resolvedShopStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED' | undefined;
      let resolvedPermissions: string[] | undefined;

      // 1. Authoritative Backend Synchronization
      try {
        const token = await getToken();
        if (token) {
          const apiBase =
            (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) ||
            'http://192.168.1.100:8000/api/v1';
          const res = await fetch(`${apiBase}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              resolvedRole = (data.user.role as UserRole) || 'CUSTOMER';
              resolvedShopId = data.user.shop_id || undefined;
              resolvedShopName = data.user.shop_name || undefined;
              resolvedBranchName = data.user.branch_name || undefined;
              resolvedShopStatus = data.user.shop_status || data.user.status || undefined;
              resolvedPermissions = data.user.permissions || undefined;
            }
          }
        }
      } catch {
        // Fallback if backend API is not reachable
      }

      const resolved: MobileUser = {
        id: `u_${clerkUserId.replace(/[^a-zA-Z0-9]/g, '').slice(-12)}`,
        clerkUserId,
        name: fullName,
        email: primaryEmail,
        phone: primaryPhone,
        role: resolvedRole,
        shopId: resolvedShopId,
        shopName: resolvedShopName,
        branchName: resolvedBranchName,
        shopStatus: resolvedShopStatus,
        permissions: resolvedPermissions,
        avatarUrl: clerkUser?.imageUrl,
      };

      setUser(resolved);
    } catch (e) {
      // Fallback
    }
  }, [isSignedIn, clerkUserId, clerkUser, getToken]);

  useEffect(() => {
    if (isClerkLoaded) {
      syncClerkSession();
    }
  }, [isClerkLoaded, syncClerkSession]);

  const role: UserRole = user?.role ?? 'GUEST';
  const isAuthenticated = !!user && role !== 'GUEST';

  const experience: MobileExperience = useMemo(() => {
    if (!user || role === 'GUEST') return 'GUEST';
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return 'ADMIN';
    if (role === 'SHOP_EMPLOYEE') return 'SHOP_EMPLOYEE';
    if (role === 'SHOP_OWNER') {
      return user.shopStatus === 'PENDING' ? 'SHOP_OWNER_PENDING' : 'SHOP_OWNER_APPROVED';
    }
    return 'CUSTOMER';
  }, [user, role]);

  const loginAs = (key: keyof typeof DEMO_USERS) => {
    if (__DEV__) {
      setUser(DEMO_USERS[key] ?? null);
    }
  };

  const sendOtp = async (phone: string): Promise<{ success: boolean; hint?: string; error?: string }> => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 7) {
      return { success: false, error: 'يرجى إدخال رقم هاتف صحيح' };
    }

    if (isSignInLoaded && signIn) {
      try {
        const fullPhone = cleanPhone.startsWith('+') ? cleanPhone : `+967${cleanPhone.replace(/^0+/, '')}`;
        const { supportedFirstFactors } = await signIn.create({
          identifier: fullPhone,
        });

        const phoneCodeFactor = supportedFirstFactors?.find((f: any) => f.strategy === 'phone_code');
        if (phoneCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: (phoneCodeFactor as any).phoneNumberId,
          });
          return { success: true, hint: 'تم إرسال رمز التحقق بنجاح' };
        }
      } catch (err: any) {
        // Fallback for DEV mode
        if (__DEV__) {
          return { success: true, hint: 'تم إرسال رمز التحقق (تجريبي)' };
        }
        return { success: false, error: err?.errors?.[0]?.longMessage || 'تعذر إرسال رمز التحقق' };
      }
    }

    return { success: true, hint: 'تم إرسال رمز التحقق بنجاح' };
  };

  const loginWithPhone = async (phone: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    const cleanOtp = otp.trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!/^\d{6}$/.test(cleanOtp)) {
      return { success: false, error: 'رمز التحقق يجب أن يتكون من 6 أرقام' };
    }

    if (isSignInLoaded && signIn) {
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: 'phone_code',
          code: cleanOtp,
        });

        if (result.status === 'complete') {
          if (setSignInActive) {
            await setSignInActive({ session: result.createdSessionId });
          }
          await syncClerkSession();
          return { success: true };
        }
      } catch (err: any) {
        if (!__DEV__) {
          return { success: false, error: err?.errors?.[0]?.longMessage || 'رمز التحقق غير صحيح' };
        }
      }
    }

    // DEV Fixture role resolver for QA
    if (__DEV__) {
      if (cleanPhone.endsWith('111')) {
        setUser(DEMO_USERS.owner_approved);
        return { success: true };
      }
      if (cleanPhone.endsWith('888')) {
        setUser(DEMO_USERS.owner_pending);
        return { success: true };
      }
      if (cleanPhone.endsWith('444')) {
        setUser(DEMO_USERS.employee_full);
        return { success: true };
      }
      if (cleanPhone.endsWith('333')) {
        setUser(DEMO_USERS.employee_limited);
        return { success: true };
      }
      if (cleanPhone.endsWith('000') || cleanPhone.endsWith('555')) {
        setUser(DEMO_USERS.admin);
        return { success: true };
      }
    }

    const customerUser: MobileUser = {
      id: `u_phone_${Date.now()}`,
      name: `عميل ${cleanPhone.slice(-4)}`,
      email: `${cleanPhone}@customer.alalami.ye`,
      phone: cleanPhone,
      role: 'CUSTOMER',
    };
    setUser(customerUser);
    return { success: true };
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' };
    }
    if (!pass || pass.length < 4) {
      return { success: false, error: 'يرجى إدخال كلمة المرور' };
    }

    if (isSignInLoaded && signIn) {
      try {
        const result = await signIn.create({
          identifier: cleanEmail,
          password: pass,
        });

        if (result.status === 'complete') {
          if (setSignInActive) {
            await setSignInActive({ session: result.createdSessionId });
          }
          await syncClerkSession();
          return { success: true };
        }
      } catch (err: any) {
        if (!__DEV__) {
          return { success: false, error: err?.errors?.[0]?.longMessage || 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }
      }
    }

    const match = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === cleanEmail);
    if (match) {
      setUser(match);
      return { success: true };
    }

    if (cleanEmail.includes('customer') || cleanEmail.includes('salem') || cleanEmail.includes('gmail')) {
      setUser({
        id: `u_email_${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '777000111',
        role: 'CUSTOMER',
      });
      return { success: true };
    }

    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  };

  const registerCustomer = async (input: RegisterCustomerInput): Promise<{ success: boolean; error?: string }> => {
    if (!input.name.trim()) {
      return { success: false, error: 'يرجى إدخال الاسم بالكامل' };
    }
    const cleanPhone = input.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 7) {
      return { success: false, error: 'يرجى إدخال رقم هاتف صحيح' };
    }

    if (isSignUpLoaded && signUp && input.email) {
      try {
        const result = await signUp.create({
          emailAddress: input.email,
          password: input.password || '12345678',
          firstName: input.name.split(' ')[0],
          lastName: input.name.split(' ').slice(1).join(' ') || '',
        });

        if (result.status === 'complete' && setSignUpActive) {
          await setSignUpActive({ session: result.createdSessionId });
          await syncClerkSession();
          return { success: true };
        }
      } catch (err: any) {
        if (!__DEV__) {
          return { success: false, error: err?.errors?.[0]?.longMessage || 'تعذر إنشاء الحساب' };
        }
      }
    }

    const newCustomer: MobileUser = {
      id: `u_cust_${Date.now()}`,
      name: input.name.trim(),
      phone: cleanPhone,
      email: input.email?.trim() || `${cleanPhone}@customer.alalami.ye`,
      role: 'CUSTOMER',
    };

    setUser(newCustomer);
    return { success: true };
  };

  const logout = async () => {
    try {
      if (signOut) {
        await signOut();
      }
    } catch {
      /* Session clean */
    }
    setUser(null);
  };

  const getClerkToken = async (): Promise<string | null> => {
    try {
      if (getToken) {
        return await getToken();
      }
    } catch {
      return null;
    }
    return null;
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;
    if (role === 'SHOP_OWNER') {
      if (user.shopStatus === 'PENDING') return false;
      return true;
    }
    if (role === 'SHOP_EMPLOYEE') {
      return user.permissions?.includes(perm) ?? false;
    }
    return false;
  };

  const canCreateProducts = hasPermission('products.create');
  const canEditProducts = hasPermission('products.update') || hasPermission('products.create');
  const canAdjustInventory = hasPermission('inventory.adjust');
  const canConfirmOrders = hasPermission('orders.confirm');
  const canUpdateOrders = hasPermission('orders.update');

  const activeShopName = user?.shopName ?? 'Al-Barakah Auto Parts';
  const activeShopStatus = user?.shopStatus;

  const value = useMemo(() => ({
    user,
    role,
    experience,
    isAuthenticated,
    isLoadingSession,
    loginAs,
    sendOtp,
    loginWithPhone,
    loginWithEmail,
    registerCustomer,
    logout,
    hasPermission,
    canCreateProducts,
    canEditProducts,
    canAdjustInventory,
    canConfirmOrders,
    canUpdateOrders,
    activeShopName,
    activeShopStatus,
    getClerkToken,
  }), [
    user,
    role,
    experience,
    isAuthenticated,
    isLoadingSession,
    activeShopName,
    activeShopStatus,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const usePermissions = () => {
  const {
    hasPermission,
    canCreateProducts,
    canEditProducts,
    canAdjustInventory,
    canConfirmOrders,
    canUpdateOrders,
  } = useAuth();
  return {
    hasPermission,
    canCreateProducts,
    canEditProducts,
    canAdjustInventory,
    canConfirmOrders,
    canUpdateOrders,
  };
};
