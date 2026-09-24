// ============================================================================
// services/adminApi.ts
// Authoritative Admin API Client for ALA Control Center
// Connects to real Laravel backend endpoints with PostgreSQL persistence
// ============================================================================

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

async function getActiveToken(): Promise<string | null> {
  // 1. Try active Clerk session
  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      const token = await clerk.session.getToken();
      if (token) {
        localStorage.setItem('clerk_token', token);
        return token;
      }
    }
  } catch {
    // ignore
  }

  // 2. Check localStorage
  const stored = localStorage.getItem('clerk_token') || localStorage.getItem('ala_auth_token');
  if (stored) return stored;

  // 3. Check Clerk __session cookie
  try {
    if (typeof document !== 'undefined' && document.cookie) {
      const parts = document.cookie.split(';');
      for (const p of parts) {
        const [k, v] = p.trim().split('=');
        if (k === '__session' && v) {
          return decodeURIComponent(v);
        }
      }
    }
  } catch {
    // ignore
  }

  // 4. Check ala2_session
  try {
    const ala2 = localStorage.getItem('ala2_session');
    if (ala2) {
      const parsed = JSON.parse(ala2);
      if (parsed?.token) return parsed.token;
    }
  } catch {
    // ignore
  }

  return null;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getActiveToken();
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {
      // ignore json parse error
    }
    const err = new Error(errorMsg) as any;
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export const adminApi = {
  // --- Dashboard ---
  getDashboard: (params?: { days?: number }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/dashboard${q ? `?${q}` : ''}`);
  },

  // --- Roles Management (Section 3, 4, 8, 14) ---
  getRoles: () => fetchWithAuth('/admin/roles'),
  getRole: (id: string | number) => fetchWithAuth(`/admin/roles/${id}`),
  createRole: (data: { name: string; display_name: string; description?: string; status?: string; permissions?: string[] }) =>
    fetchWithAuth('/admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string | number, data: { display_name?: string; description?: string; status?: string; permissions?: string[] }) =>
    fetchWithAuth(`/admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRole: (id: string | number) =>
    fetchWithAuth(`/admin/roles/${id}`, { method: 'DELETE' }),
  duplicateRole: (id: string | number) =>
    fetchWithAuth(`/admin/roles/${id}/duplicate`, { method: 'POST' }),
  getRolePermissions: (id: string | number) =>
    fetchWithAuth(`/admin/roles/${id}/permissions`),
  syncRolePermissions: (id: string | number, permissions: string[]) =>
    fetchWithAuth(`/admin/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) }),

  // --- Permissions & Matrix (Section 5, 6, 15) ---
  getPermissions: (params?: { module?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/permissions${q ? `?${q}` : ''}`);
  },
  getPermissionMatrix: () => fetchWithAuth('/admin/permissions/matrix'),

  // --- User Access & Overrides (Section 9, 10, 11, 16) ---
  getUsers: (params?: { search?: string; role?: string; status?: string; page?: number }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/users${q ? `?${q}` : ''}`);
  },
  getUser: (id: string) => fetchWithAuth(`/admin/users/${id}`),
  getUserAccess: (id: string) => fetchWithAuth(`/admin/users/${id}/access`),
  updateUserRole: (id: string, role: string) =>
    fetchWithAuth(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  updateUserPermissions: (id: string, data: { additional_permissions?: string[]; denied_permissions?: string[]; reason?: string }) =>
    fetchWithAuth(`/admin/users/${id}/permissions`, { method: 'PUT', body: JSON.stringify(data) }),
  suspendUser: (id: string, reason?: string) =>
    fetchWithAuth(`/admin/users/${id}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) }),
  activateUser: (id: string) =>
    fetchWithAuth(`/admin/users/${id}/activate`, { method: 'POST' }),

  // --- Shops & Approvals (Section 17, 18) ---
  getShops: (params?: { search?: string; status?: string; city?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/shops${q ? `?${q}` : ''}`);
  },
  getShop: (id: string) => fetchWithAuth(`/admin/shops/${id}`),
  getShopApprovals: () => fetchWithAuth('/admin/shop-approvals'),
  approveShop: (id: string) => fetchWithAuth(`/admin/shops/${id}/approve`, { method: 'POST' }),
  rejectShop: (id: string, reason: string) =>
    fetchWithAuth(`/admin/shops/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  suspendShop: (id: string, reason?: string) =>
    fetchWithAuth(`/admin/shops/${id}/suspend`, { method: 'POST', body: JSON.stringify({ reason }) }),
  reactivateShop: (id: string) => fetchWithAuth(`/admin/shops/${id}/reactivate`, { method: 'POST' }),

  // --- Employees (Section 19) ---
  getEmployees: (params?: { shop_id?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/employees${q ? `?${q}` : ''}`);
  },

  // --- Products (Section 21) ---
  getProducts: (params?: { search?: string; category?: string; shop_id?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/products${q ? `?${q}` : ''}`);
  },
  disableProduct: (id: string) => fetchWithAuth(`/admin/products/${id}/disable`, { method: 'POST' }),
  enableProduct: (id: string) => fetchWithAuth(`/admin/products/${id}/enable`, { method: 'POST' }),

  // --- Orders (Section 22) ---
  getOrders: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/orders${q ? `?${q}` : ''}`);
  },
  getOrder: (id: string) => fetchWithAuth(`/admin/orders/${id}`),

  // --- Inventory (Section 23) ---
  getInventory: (params?: { low_stock?: boolean; out_of_stock?: boolean; shop_id?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/inventory${q ? `?${q}` : ''}`);
  },

  // --- Reports (Section 24) ---
  getReportsSummary: (params?: { from?: string; to?: string; shop_id?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/reports/summary${q ? `?${q}` : ''}`);
  },
  getReportsSales: (params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/reports/sales${q ? `?${q}` : ''}`);
  },
  getReportsShops: () => fetchWithAuth('/admin/reports/shops'),

  // --- Commissions (Section 25) ---
  getCommissions: () => fetchWithAuth('/admin/commissions'),
  createCommission: (data: any) => fetchWithAuth('/admin/commissions', { method: 'POST', body: JSON.stringify(data) }),
  updateCommission: (id: string | number, data: any) =>
    fetchWithAuth(`/admin/commissions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCommission: (id: string | number) => fetchWithAuth(`/admin/commissions/${id}`, { method: 'DELETE' }),

  // --- Audit Logs (Section 26) ---
  getAuditLogs: (params?: { entity_type?: string; action?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/audit-logs${q ? `?${q}` : ''}`);
  },

  // --- Geography (Section 2, 27) ---
  getCountries: () => fetchWithAuth('/admin/geography/countries'),
  createCountry: (data: any) => fetchWithAuth('/admin/geography/countries', { method: 'POST', body: JSON.stringify(data) }),
  updateCountry: (id: string, data: any) => fetchWithAuth(`/admin/geography/countries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCities: (params?: { country_id?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/geography/cities${q ? `?${q}` : ''}`);
  },
  createCity: (data: any) => fetchWithAuth('/admin/geography/cities', { method: 'POST', body: JSON.stringify(data) }),
  updateCity: (id: string, data: any) => fetchWithAuth(`/admin/geography/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // --- Settings (Section 27) ---
  getSettings: (group?: string) => fetchWithAuth(`/admin/settings${group ? `?group=${group}` : ''}`),
  updateSettings: (settings: Array<{ key: string; value: any; group?: string }>) =>
    fetchWithAuth('/admin/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),
};
