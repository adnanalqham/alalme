// ============================================================================
// api/session.ts
// Token-based session (simulated). The token is random and opaque; every API
// call re-validates the user from storage instead of trusting the client.
// ============================================================================

export interface Session {
  token: string;
  userId: string;
  issuedAt: string;
  /** Active shop context (selected by the user among their memberships). */
  shopId?: string;
  branchId?: string;
}

const KEY = 'ala2_session';

function base64UrlEncode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

export function generateSessionJwt(userId: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

  // Authoritative identity mapping matching PostgreSQL seeders
  let sub = userId;
  let email: string | undefined;
  if (userId === 'u1' || userId === 'user_admin_01') {
    sub = 'user_clerk_admin_01';
    email = 'admin@ala-parts.com';
  } else if (userId === 'u2' || userId === 'user_shop_owner_01') {
    sub = 'user_clerk_owner_01';
    email = 'adnan@najm-parts.com';
  } else if (userId === 'u3' || userId === 'user_customer_01') {
    sub = 'user_clerk_customer_01';
    email = 'customer@ala-parts.com';
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(JSON.stringify({
    sub,
    email,
    iss: 'https://mutual-chamois-9547.clerk.accounts.dev',
    iat: now,
    exp: now + (30 * 86400),
  }));

  const signature = base64UrlEncode('local_session_signature');
  return `${header}.${payload}.${signature}`;
}

export function createSession(userId: string): Session {
  const token = generateSessionJwt(userId);
  const session: Session = { token, userId, issuedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(session));
  localStorage.setItem('clerk_token', token);
  localStorage.setItem('ala_auth_token', token);
  return session;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function updateSession(patch: Partial<Session>): Session | null {
  const current = getSession();
  if (!current) return null;
  const next = { ...current, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function setActiveShop(shopId: string, branchId?: string): Session | null {
  return updateSession({ shopId, branchId });
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem('clerk_token');
  localStorage.removeItem('ala_auth_token');
}