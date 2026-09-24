# ALA Automotive Marketplace — Complete Admin Control Center

This document describes the architecture, database schema, security model, and API endpoints for the **ALA Admin Control Center**.

---

## 1. High-Level Architecture

The Admin Control Center enforces an authoritative server-side security architecture:

```
Super Admin / Admin User (Clerk Identity)
                 ↓
      Clerk Bearer JWT Token
                 ↓
     AuthenticateWithClerk Middleware
                 ↓
        User Identity Resolved
                 ↓
      RequireRole Middleware (ADMIN, SUPER_ADMIN)
                 ↓
    Authoritative Permission Check: $user->canAccess('...')
                 ↓
   Effective Permissions Resolution (PostgreSQL)
```

- **Clerk** is the authentication provider (verifies cryptographic identity).
- **Laravel** is the sole business and authorization authority. Client tokens or frontend state cannot escalate privileges.
- **PostgreSQL** stores roles, permissions, scopes, and user-specific grant/deny overrides.

---

## 2. Roles Model & Hierarchy

The system defines 7 production system roles:

| Role Name | Display Name (Arabic) | Display Name (English) | Protected (`is_system`) | Description |
|-----------|------------------------|-------------------------|--------------------------|-------------|
| `SUPER_ADMIN` | مدير النظام الأعلى | Super Administrator | **Yes** | Unrestricted access across all modules; manages admins. |
| `ADMIN` | مدير المنصة | Platform Administrator | **Yes** | Manages catalog, orders, shops, users, reports, and audit. |
| `SHOP_OWNER` | مالك متجر قطع غيار | Shop Owner | **Yes** | Manages shop branches, staff, products, and fulfillment. |
| `SHOP_EMPLOYEE` | موظف متجر | Shop Employee | **Yes** | Fulfills orders and manages inventory within shop scope. |
| `CUSTOMER` | عميل / مشتري | Customer | **Yes** | Explores catalog, searches by VIN/make, places orders. |
| `MECHANIC` | فني / ورشة سيارات | Certified Mechanic | **Yes** | Specialized account for professional garages. |
| `DELIVERY` | مندوب توصيل | Courier / Delivery Agent | **Yes** | Order shipping and delivery tracking. |

### Hierarchy Rules:
1. `SUPER_ADMIN` can only be created, assigned, or removed by another `SUPER_ADMIN`.
2. The last active `SUPER_ADMIN` in the system cannot be demoted, deactivated, or deleted.
3. Protected system roles (`is_system = true`) cannot be deleted or have their machine identifiers changed.
4. Admins can create and duplicate custom roles (e.g., `inventory_manager`, `support_lead`, `finance_auditor`).

---

## 3. Granular Permissions & Scopes

The platform registers **81 permissions** across **21 core modules**:

### Modules:
1. `users` — Platform user management and role assignment.
2. `shops` — Shop registration, verification, and suspension.
3. `employees` — Shop staff delegation and branch assignments.
4. `products` — Spare parts catalog items and pricing.
5. `categories` — Taxonomy and automotive spare-part categories.
6. `manufacturers` — OEM and aftermarket parts manufacturers.
7. `vehicles` — Makes, models, year ranges, and fitment engine.
8. `inventory` — Centralized multi-branch stock levels and adjustments.
9. `orders` — Marketplace multi-vendor checkout and fulfillment.
10. `payments` — Transaction reconciliation and payouts.
11. `reviews` — Customer parts and merchant rating moderation.
12. `complaints` — Customer-vendor dispute arbitration.
13. `coupons` — Promotional codes and discount rules.
14. `banners` — Hero slides, mobile adverts, and promos.
15. `notifications` — System-wide broadcast alerts.
16. `reports` — Sales, revenue, customer, and merchant analytics.
17. `commissions` — Merchant commission rates (percentage / fixed).
18. `audit_logs` — Immutable security and action audit trail.
19. `geography` — Countries, currencies, calling codes, and cities.
20. `settings` — Central marketplace configuration parameters.
21. `general` — General platform access.

### Scopes:
Each permission specifies a strict operational scope:
- **`PLATFORM`**: Global access across the entire marketplace (e.g. `users.view`, `shops.approve`).
- **`SHOP`**: Scoped strictly to the authenticated user's shop (`products.update`, `orders.confirm`).
- **`BRANCH`**: Limited to a specific merchant branch (`inventory.adjust`).
- **`OWN`**: Scoped only to the user's personal resources (`me.vehicles`, `orders.view`).
- **`ASSIGNED`**: Scoped to orders or tickets specifically assigned to this operator.

---

## 4. User Permission Overrides & Effective Resolution

### The Effective Permission Formula:
$$\text{Effective Permissions} = (\text{Role Permissions} + \text{User Additional (Granted) Permissions}) - \text{User Denied Permissions}$$

### Implementation:
- **Inherited (Role)**: Base permissions defined on the role assigned to the user.
- **Additional (Granted)**: Stored in `user_permissions` table where `is_granted = true`. Grants specific elevated abilities to an individual employee or manager without changing their role.
- **Denied**: Stored in `user_permissions` table where `is_granted = false`. Explicitly denies an inherited role permission for that specific user.
- **Super Admin Exception**: A `SUPER_ADMIN` automatically receives 100% of all registered system permissions (`81/81`).

The user's effective permissions are recomputed server-side on every request and returned by:
- `GET /api/v1/auth/me`
- `GET /api/v1/admin/users/{id}/access`
- `GET /api/v1/admin/users/{id}/permissions`

---

## 5. Admin API Endpoints

All admin endpoints require `role:ADMIN,SUPER_ADMIN` and check specific permissions:

### Access Control & Roles:
- `GET /api/v1/admin/roles` — List all roles with user and permission counts.
- `POST /api/v1/admin/roles` — Create a new role with machine name and display name.
- `GET /api/v1/admin/roles/{id}` — Get single role details.
- `PUT /api/v1/admin/roles/{id}` — Update role display name and description.
- `DELETE /api/v1/admin/roles/{id}` — Delete custom role (guarded against system roles).
- `POST /api/v1/admin/roles/{id}/duplicate` — Duplicate role and its permission set.
- `GET /api/v1/admin/roles/{id}/permissions` — List permissions assigned to role.
- `PUT /api/v1/admin/roles/{id}/permissions` — Sync role permissions.

### Permissions & Matrix:
- `GET /api/v1/admin/permissions` — List all 81 permissions (filterable by module and scope).
- `GET /api/v1/admin/permissions/matrix` — Return 2D matrix of modules vs actions.

### User Access & Overrides:
- `GET /api/v1/admin/users` — List platform users with search and role filters.
- `GET /api/v1/admin/users/{id}/access` — Detailed permission resolution breakdown.
- `PUT /api/v1/admin/users/{id}/role` — Authoritative role assignment.
- `PUT /api/v1/admin/users/{id}/permissions` — Apply user-level grant/deny overrides.
- `POST /api/v1/admin/users/{id}/suspend` — Suspend user account with reason.
- `POST /api/v1/admin/users/{id}/activate` — Reactivate user account.

### Shop Approvals & Shops:
- `GET /api/v1/admin/shop-approvals` — Pending merchant applications queue.
- `POST /api/v1/admin/shops/{id}/approve` — Approve merchant and activate owner account.
- `POST /api/v1/admin/shops/{id}/reject` — Reject application with required audit reason.
- `POST /api/v1/admin/shops/{id}/suspend` — Suspend shop.
- `POST /api/v1/admin/shops/{id}/reactivate` — Reactivate shop.

### Staff & Inventory:
- `GET /api/v1/admin/employees` — Global directory of all merchant employees.
- `GET /api/v1/admin/inventory` — Global inventory monitor with low/out-of-stock filters.

### Commissions & Geography:
- `GET /api/v1/admin/commissions` — Shop commission rules list.
- `POST /api/v1/admin/commissions` — Create shop commission rule.
- `PUT /api/v1/admin/commissions/{id}` — Update commission rule.
- `DELETE /api/v1/admin/commissions/{id}` — Remove commission rule.
- `GET /api/v1/admin/geography/countries` — List countries with currency and calling codes.
- `POST /api/v1/admin/geography/countries` — Add new country.
- `PUT /api/v1/admin/geography/countries/{id}` — Toggle active status or update country.
- `GET /api/v1/admin/geography/cities` — List serviceable cities.
- `POST /api/v1/admin/geography/cities` — Add new city.
- `PUT /api/v1/admin/geography/cities/{id}` — Update city.

### Platform Settings:
- `GET /api/v1/admin/settings` — Get settings grouped by section.
- `PUT /api/v1/admin/settings` — Update platform settings with audit log.

### Audit Trail:
- `GET /api/v1/admin/audit-logs` — Immutable audit log query.

---

## 6. Security Guarantees & Test Results

The test suite in `backend/tests/admin_rbac_security_test.php` verifies:

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| CUSTOMER calls `/api/v1/admin/roles` | `403 Forbidden` | **PASSED** |
| SHOP_OWNER calls `/api/v1/admin/roles` | `403 Forbidden` | **PASSED** |
| Spoofed `X-Role: SUPER_ADMIN` header as CUSTOMER | `403 Forbidden` (Authority remains in DB) | **PASSED** |
| SUPER_ADMIN calls `/api/v1/admin/roles` | `200 OK` | **PASSED** |
| Permissions Matrix API | `200 OK` (21 modules rendered) | **PASSED** |
| `GET /api/v1/auth/me` | Returns 81 server-resolved effective permissions | **PASSED** |
| Formula: Role + Additional - Denied | Accurately removes denied permission | **PASSED** |
| Protected System Roles | Protected against accidental deletion | **PASSED** |
| Super Admin 100% privilege | Receives 81/81 system permissions | **PASSED** |
