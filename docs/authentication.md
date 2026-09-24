# ALA Automotive Marketplace — Complete Authentication Architecture with Clerk

This document provides a comprehensive, end-to-end technical reference for the authentication, authorization, and session management system across the **ALA Automotive Marketplace** platform (Web, Mobile Expo, and Laravel REST Backend) powered by **Clerk**.

---

## Table of Contents
1. [Architecture Overview & Separation of Concerns](#1-architecture-overview--separation-of-concerns)
2. [Clerk Dashboard Setup & Configuration](#2-clerk-dashboard-setup--configuration)
3. [Database Schema & Migrations](#3-database-schema--migrations)
4. [Laravel Backend Architecture & Middleware](#4-laravel-backend-architecture--middleware)
5. [User Synchronization & State Lifecycle](#5-user-synchronization--state-lifecycle)
6. [Role-Based Access Control (RBAC) & Permissions](#6-role-based-access-control-rbac--permissions)
7. [Shop Onboarding & Registration Flow](#7-shop-onboarding--registration-flow)
8. [Web Client Architecture (React + Vite)](#8-web-client-architecture-react--vite)
9. [Mobile Client Architecture (React Native + Expo SDK 57)](#9-mobile-client-architecture-react-native--expo-sdk-57)
10. [Hardware-Backed Token Persistence (Expo SecureStore)](#10-hardware-backed-token-persistence-expo-securestore)
11. [Phone OTP & SMS Authentication Flow](#11-phone-otp--sms-authentication-flow)
12. [Email & Password Authentication](#12-email--password-authentication)
13. [OAuth & Social Authentication (Google, Apple)](#13-oauth--social-authentication-google-apple)
14. [Security Best Practices & Hardening](#14-security-best-practices--hardening)
15. [White Premium Automotive UI Guidelines](#15-white-premium-automotive-ui-guidelines)
16. [Developer & QA Modes (`__DEV__` Isolation)](#16-developer--qa-modes-__dev__-isolation)
17. [API Endpoints Reference](#17-api-endpoints-reference)
18. [Troubleshooting, Verification & FAQ](#18-troubleshooting-verification--faq)

---

## 1. Architecture Overview & Separation of Concerns

ALA operates on a strict **Decoupled Identity & Authoritative Business RBAC** model:

```
┌────────────────────────────────────────────────────────┐
│                   CLERK AUTH ENGINE                    │
│  - User Identity, Passwords, SMS OTP, OAuth           │
│  - Session tokens & JWT generation                     │
│  - Multi-Factor Authentication (MFA)                   │
└──────────────────────────┬─────────────────────────────┘
                           │ Bearer JWT (Session Token)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   CLIENT PLATFORMS                     │
│  - Web (React 19 + Vite + ClerkProvider)               │
│  - Mobile (Expo SDK 57 + ClerkProvider + SecureStore)  │
│  - White Premium Automotive UI Design System           │
└──────────────────────────┬─────────────────────────────┘
                           │ Authorization: Bearer <clerk_jwt>
                           ▼
┌────────────────────────────────────────────────────────┐
│                 LARAVEL REST BACKEND                   │
│  - AuthenticateWithClerk Middleware (JWT Verifier)     │
│  - PostgreSQL Database (users & shop_memberships)      │
│  - Authoritative RBAC & Granular Permissions           │
│  - Shop Ownership & Approval State Machine             │
└────────────────────────────────────────────────────────┘
```

### Key Principles:
1. **Clerk owns Identity:** Clerk handles sign-up, sign-in, password encryption, OTP dispatching, OAuth providers, and issuing short-lived signed JWTs.
2. **PostgreSQL owns Business Logic & RBAC:** User roles (`CUSTOMER`, `SHOP_OWNER`, `SHOP_EMPLOYEE`, `ADMIN`, `SUPER_ADMIN`), shop memberships, verification statuses (`APPROVED`, `PENDING`), and permission strings live authoritatively in Laravel's PostgreSQL database.
3. **Clients Never Self-Assign Roles:** The client receives its role and capabilities solely from the backend via token claims or `/api/v1/auth/me`.

---

## 2. Clerk Dashboard Setup & Configuration

To configure your Clerk Application for ALA:

1. **Create Clerk Application:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com).
   - Create an application named `ALA Marketplace`.
2. **Enable Authentication Strategies:**
   - **User Identifiers:** Email address, Phone number (SMS OTP).
   - **Social Providers:** Google, Apple.
   - **Password:** Minimum 8 characters.
3. **Environment Keys:**
   - Copy `Publishable Key` (`pk_test_...` or `pk_live_...`).
   - Copy `Secret Key` (`sk_test_...` or `sk_live_...`).
4. **JWT Templates (Optional for Custom Claims):**
   - Add custom claims for `email`, `phone_number`, and `name` in the default session token.

---

## 3. Database Schema & Migrations

The database migration `2026_09_23_000001_create_users_and_clerk_auth_tables.php` establishes:

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'CUSTOMER', -- SUPER_ADMIN, ADMIN, SHOP_OWNER, SHOP_EMPLOYEE, CUSTOMER
    shop_id UUID NULL,
    shop_name VARCHAR(255) NULL,
    shop_status VARCHAR(50) NULL, -- APPROVED, PENDING, REJECTED, DISABLED
    avatar_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop Memberships (for Staff & Employees)
CREATE TABLE shop_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL, -- OWNER, MANAGER, STAFF
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_shop UNIQUE (user_id, shop_id)
);
```

---

## 4. Laravel Backend Architecture & Middleware

### AuthenticateWithClerk Middleware
Located at `backend/app/Http/Middleware/AuthenticateWithClerk.php`.
- Extracts `Bearer <token>` from the `Authorization` header.
- Uses `ClerkAuthService` to decode and verify claims against Clerk API/JWKS.
- Automatically resolves or auto-provisions the user record in PostgreSQL.
- Attaches `$request->attributes->set('authenticated_user', $user)` for controllers.

### ClerkAuthService
Located at `backend/app/Services/ClerkAuthService.php`.
- Handles JWT payload extraction, signature verification, and Clerk API queries.
- Guarantees role persistence and fetches shop membership permissions for employees.

---

## 5. User Synchronization & State Lifecycle

When a user logs in via Clerk on Web or Mobile:
1. Clerk issues a session JWT.
2. The client calls `POST /api/v1/auth/sync` with `Authorization: Bearer <clerk_jwt>`.
3. Laravel verifies the Clerk user ID, updates any profile changes (name, email, phone), and returns the full canonical user object with their authoritative `role`, `shopStatus`, and `permissions`.
4. The client updates its global `AuthContext` state.

---

## 6. Role-Based Access Control (RBAC) & Permissions

### Role Hierarchy & Capabilities:

| Role | Bottom Tabs Experience | Core Permissions |
|---|---|---|
| `CUSTOMER` | Home, Search, My Car, Orders, Profile | Browse parts, vehicle garage, cart, checkout, view personal orders |
| `SHOP_OWNER` (Approved) | Dashboard, Orders, Products, Inventory, More | Manage inventory, add parts, fulfill orders, view analytics, manage staff |
| `SHOP_OWNER` (Pending) | Pending Approval Screen | View registration status, contact support, edit submitted shop documents |
| `SHOP_EMPLOYEE` | Dashboard, Dynamic tabs by permission, More | `products.view/create/update`, `inventory.view/adjust`, `orders.view/confirm/update` |
| `ADMIN` / `SUPER_ADMIN` | Admin Dashboard, Marketplace, Search, Profile | Approve shops, manage taxonomy, resolve disputes, oversee platform operations |
| `GUEST` | Home, Search, My Car (Prompt), Orders (Prompt), Profile (Login Prompt) | Read-only browsing and part catalog inspection |

---

## 7. Shop Onboarding & Registration Flow

1. Authenticated customer navigates to "Register as a Merchant" (`/merchant/register` or mobile shop registration).
2. Submits shop details (commercial name, tax/cr number, city, contact info).
3. Client sends `POST /api/v1/auth/register-shop`.
4. Backend sets `role = 'SHOP_OWNER'` and `shop_status = 'PENDING'`.
5. Mobile and Web UI dynamically transition to the **Pending Approval** experience.
6. Once an Admin reviews and approves the shop via Admin Dashboard, the backend changes `shop_status = 'APPROVED'`, automatically unlocking the full Shop Merchant dashboard on the next sync.

---

## 8. Web Client Architecture (React + Vite)

- **Entry:** Wrapped in `<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>` in `index.tsx`.
- **Context:** `context/AuthContext.tsx` consumes `useUser()`, `useClerk()`, `useSignIn()`, `useSignUp()`.
- **API Client:** Injects `Authorization: Bearer <clerkToken>` on every Axios/Fetch call.
- **Role Routing:** `App.tsx` conditionally mounts Customer, Merchant, or Admin layouts based on `user.role` and `user.shopStatus`.

---

## 9. Mobile Client Architecture (React Native + Expo SDK 57)

- **Entry:** Wrapped in `<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>` in `mobile/App.tsx`.
- **Context:** `mobile/src/context/AuthContext.tsx` integrates `@clerk/clerk-expo` hooks.
- **Experience Resolver:** Computes `experience` state (`CUSTOMER`, `SHOP_OWNER_APPROVED`, `SHOP_OWNER_PENDING`, `SHOP_EMPLOYEE`, `ADMIN`, `GUEST`).
- **Dynamic Tabs:** `mobile/App.tsx` `MainTabs` dynamically displays tab items matching role permissions.

---

## 10. Hardware-Backed Token Persistence (Expo SecureStore)

Located in `mobile/src/services/tokenCache.ts`:
- Uses `expo-secure-store` to encrypt and persist Clerk authentication tokens on iOS Keychain and Android Keystore.
- Survives app restarts and device reboots without requiring re-authentication.

```typescript
import * as SecureStore from 'expo-secure-store';

export const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  }
};
```

---

## 11. Phone OTP & SMS Authentication Flow

1. User enters phone number (e.g., `777222222`).
2. Client formats to E.164 (`+967777222222`).
3. Calls Clerk's `signIn.create({ identifier: phone })` and `signIn.prepareFirstFactor({ strategy: 'phone_code' })`.
4. Clerk dispatches SMS OTP with a 60-second cooldown timer.
5. User enters 6-digit code.
6. Client calls `signIn.attemptFirstFactor({ strategy: 'phone_code', code })`.
7. On verification, session activates and user synchronizes with backend.

---

## 12. Email & Password Authentication

- Email/Password login uses `signIn.create({ identifier: email, password })`.
- Registration uses `signUp.create({ emailAddress, password, firstName, lastName })`.
- Form inputs validate emails, minimum 6/8-character passwords, and password matching before dispatching.

---

## 13. OAuth & Social Authentication (Google, Apple)

- Supports Google & Apple single-tap sign-in.
- Uses Clerk OAuth redirect flow (`useOAuth` in Expo / Clerk OAuth in React Web).
- Automatic profile information extraction (name, email, avatar).

---

## 14. Security Best Practices & Hardening

1. **Zero Credential Logging:** Passwords, OTP codes, and raw JWT tokens are never output to logs or consoles.
2. **Hardware Security Storage:** Mobile session persistence is restricted to Keychain/Keystore.
3. **Short-Lived JWTs:** Clerk session tokens expire automatically and are rotated seamlessly.
4. **Server-Side Authorization:** Every mutation (creating parts, adjusting inventory, confirming orders) is checked on the backend for matching shop ownership and permission strings.
5. **No Demo Leaks in Production:** All DEV switcher buttons and mock shortcuts are wrapped in `__DEV__` conditions and pruned from release bundles.

---

## 15. White Premium Automotive UI Guidelines

ALA's mobile and web interfaces adhere to luxury automotive design principles:
- **Background:** Pure clean white (`#FFFFFF`) with subtle `#F8FAFC` slate card fills.
- **Primary Navy:** `#010736` (Midnight Navy) for headers, bold titles, and pill CTA buttons.
- **Secondary Navy:** `#22396F` for secondary accents and navigation states.
- **Typography:** Thmanyah Sans (Arabic) / Inter (Technical numbers and codes).
- **Vehicles:** High-definition rendered car visual assets (`assets.cars.onboarding1` / `assets.cars.onboarding2`).
- **Inputs:** Pill-rounded (`borderRadius: 16`), 52px height, clear leading icons, RTL text alignment.

---

## 16. Developer & QA Modes (`__DEV__` Isolation)

For local development and rapid role switching, mock profiles are defined in `DEMO_USERS` inside `AuthContext.tsx`.
- Strictly guarded by `if (__DEV__)`.
- In production (`process.env.NODE_ENV === 'production'`), these blocks are eliminated by tree shaking, and session resolution relies exclusively on real Clerk JWTs and PostgreSQL.

---

## 17. API Endpoints Reference

### Authentication Endpoints

#### `GET /api/v1/auth/me`
- **Headers:** `Authorization: Bearer <clerk_jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": "u_984392842",
      "clerkUserId": "user_2a...",
      "name": "Ahmed Ali",
      "email": "ahmed@barakah.com",
      "phone": "+967777111111",
      "role": "SHOP_OWNER",
      "shopId": "s_01",
      "shopName": "Al-Barakah Auto Parts",
      "shopStatus": "APPROVED",
      "permissions": []
    }
  }
  ```

#### `POST /api/v1/auth/sync`
- **Headers:** `Authorization: Bearer <clerk_jwt>`
- **Body:** `{ "name": "...", "email": "...", "phone": "..." }`
- **Response:** Synchronized user object.

#### `POST /api/v1/auth/register-shop`
- **Headers:** `Authorization: Bearer <clerk_jwt>`
- **Body:**
  ```json
  {
    "shopName": "Al-Najah Modern Parts",
    "commercialRegister": "CR-992817",
    "phone": "+967777888888",
    "city": "Sana'a"
  }
  ```
- **Response:** Updated user with `role: "SHOP_OWNER"` and `shopStatus: "PENDING"`.

---

## 18. Troubleshooting, Verification & FAQ

### Q: Why do I see "Clerk instance not loaded" in Mobile?
**A:** Ensure `App.tsx` has `<ClerkProvider publishableKey={...} tokenCache={tokenCache}>` wrapping the outermost component hierarchy.

### Q: How do I test different roles locally without signing in each time?
**A:** In development mode (`__DEV__`), use the role switcher chips at the bottom of the Login screen to instantly simulate Customer, Merchant, Employee, or Admin accounts.

### Q: How are permissions checked for shop staff?
**A:** Use the helper `hasPermission('permission_name')` from `useAuth()`. It checks if the user is an Admin, Shop Owner, or has that string in their `permissions` array.
