# API Contract — `/api/v1`

The front-end talks to a service layer in `api/` that implements this contract
against an in-browser persistence engine (`localStorage`, seeded demo data).
Every module mirrors the planned Laravel routes 1:1, so the same front-end can
be pointed at a real backend by swapping `api/index.ts` for HTTP clients.

Base path: `/api/v1`. All endpoints return JSON. All require `Authorization:
Bearer <token>` unless marked **public**. Errors are `{ message, status, errors? }`.

## Auth — `authService` (`api/services.ts`)

| Method | Endpoint | Notes |
| --- | --- | --- |
| `login({ usernameOrEmail, password })` | `POST /auth/login` | returns `{ user, token }` |
| `loginWithPhone({ phone })` | `POST /auth/login/phone` | returns `{ pending, phone, hint }` |
| `verifyOtp({ phone, code })` | `POST /auth/verify-otp` | any 6-digit code; `123456` → guest session |
| `loginWithProvider({ provider })` | `POST /auth/social` | provider: `google` / `apple` (demo) |
| `registerCustomer(input)` | `POST /auth/register` | prefers `preferredCategories`, `ownedCarBrands` |
| `registerShopOwner(input)` | `POST /auth/register/shop-owner` | creates shop in `PENDING`, needs admin approval |
| `logout()` | `POST /auth/logout` | clears session |
| `me()` | `GET /auth/me` | current user incl. `shopMemberships` |
| `setActiveShopContext(shopId, branchId?)` | `POST /auth/active-shop` | switches shop permission context |
| `myWishlist()` | `GET /auth/wishlist` | returns `{ productIds }` |
| `toggleWishlist(productId)` | `POST /auth/wishlist/toggle` | |
| `myGarage()` | `GET /auth/garage` | user vehicles (`SavedVehicle[]`) |
| `addToGarage(input)` / `removeFromGarage(id)` | `POST/DELETE /auth/garage` | |
| `addressBook()` / `saveAddress(input)` | `GET/POST /auth/addresses` | |
| `myComplaints()` | `GET /auth/complaints` | |

Permissions are resolved per request via `effectivePermissions(user)` = role
defaults ∪ `shopMemberships[].permissions`, then asserted by each endpoint
(e.g. `products.manage`, `orders.view`, `commissions.manage`).

## Catalog — `catalogService` (`api/services.ts`)

| Method | Endpoint |
| --- | --- |
| `categories()` | `GET /catalog/categories` (public) |
| `manufacturers()` | `GET /catalog/manufacturers` (public) |
| `vehicles()` | `GET /catalog/vehicles` (public, full tree) |

## Vehicles — `vehicleService`

| Method | Endpoint |
| --- | --- |
| `makes()` · `models(makeId)` · `generations(modelId)` · `engines(generationId)` | `GET /vehicles/*` (public) |
| `addMake` / `addModel` / `addGeneration` / `addEngine` | `POST /vehicles/*` (admin `vehicles.manage`) |

## Shop discovery & public storefront

| Method | Endpoint |
| --- | --- |
| `shopService.listPublic(filters)` | `GET /shops` (public) |
| `shopService.getPublic(id)` | `GET /shops/{id}` (public) |
| `shopService.branchesOf(shopId)` | `GET /shops/{id}/branches` (public) |

## Search — `searchService`

| Method | Endpoint |
| --- | --- |
| `search(filters)` | `GET /search` (public) |

filters: `q, countryId, cityId?, categoryId, vehicle (make/model/generation/engine),
condition?, inStockOnly?, minPrice, maxPrice, sort ('new'|'popular'|'price_asc'|'price_desc'), page, perPage`.
Returns `{ items, total, facets }`.

## Products — `productService`

| Method | Endpoint |
| --- | --- |
| `get(id)` | `GET /products/{id}` |
| `samePartOffers(id)` | `GET /products/{id}/offers` (same part across shops) |
| `related(id)` | `GET /products/{id}/related` |
| `listForShop(shopId)` | `GET /products?shopId=` (manager) |
| `create(input)` / `update(id, input)` / `delete(id)` | manager CRUD (`products.manage`) |

`ProductInput` includes `nameEn/nameAr, brandId?, categoryId, partNumber, images[],
condition, price, priceVisibility ('SHOW_PRICE'|'HIDE_PRICE'), saleMode
('ONLINE'|'EXTERNAL'|'BOTH'), stock, minStock, fitments[]`.

## Reviews — `reviewService`

| Method | Endpoint |
| --- | --- |
| `forShop(shopId)` · `forProduct(productId)` | `GET /reviews?...` (public approved only) |
| `create(input)` | `POST /reviews` — requires a **completed** order with that shop |
| `moderationList(status?)` | `GET /admin/reviews` (admin) |
| `setStatus(id, 'APPROVED'\|'REJECTED')` | `PATCH /admin/reviews/{id}` |

## Complaints — `complaintService`

| Method | Endpoint |
| --- | --- |
| `create(input)` | `POST /complaints` |
| `listMine()` | `GET /complaints/mine` |
| `adminList(status?)` | `GET /admin/complaints` |
| `updateStatus(id, status)` | `PATCH /admin/complaints/{id}` |

## Orders — `orderService` (`api/servicesOrders.ts`)

| Method | Endpoint |
| --- | --- |
| `placeOrder(input)` | `POST /orders` — groups cart by shop, computes delivery + commissions |
| `myOrders({ status? })` | `GET /orders/mine` |
| `getMine(id)` | `GET /orders/{id}` |
| `cancelMine(id)` | `POST /orders/{id}/cancel` |
| `adminList(filters)` | `GET /admin/orders` |
| `shopOrders(filters)` | `GET /orders/shop` |
| `updateShopGroupStatus(orderId, groupId, status, note?)` | `PATCH /orders/{id}/groups/{gid}` (manager) |
| `getShopOrder(orderId)` | `GET /shop/orders/{id}` (manager) |

Order lifecycle: `PENDING → CONFIRMED → PREPARING → READY → COMPLETED` | `REJECTED`/`CANCELLED`.

## Payments — `paymentService`

| Method | Endpoint |
| --- | --- |
| `forOrder(orderId)` | `GET /payments?order=` (owner / `payments.view`) |
| `myPayments()` | `GET /payments/mine` |
| `createIntent(orderId)` | `POST /payments/intent` (simulated gateway token) |
| `confirm(orderId, ref)` | `POST /payments/confirm` |
| `adminAll()` | `GET /admin/payments` |

Methods: `CASH | BANK_TRANSFER | WALLET | CARD`. Status: `PENDING | PAID | FAILED | REFUNDED`.

## Inventory — `inventoryService`

| Method | Endpoint |
| --- | --- |
| `movements(shopId?, limit=100)` | `GET /inventory/movements` |
| `lowStock(shopId?)` | `GET /inventory/low-stock` (notifies when min stock breached) |
| `adjust(productId, delta, reason)` | `POST /inventory/adjust` |
| `setMinStock(productId, min)` | `PATCH /inventory/min-stock` |
| `transfer(productId, fromBranch, toBranch, qty)` | `POST /inventory/transfer` |
| `importCsv(rows)` | `POST /inventory/import` |

## Shop manager — `shopService`

| Method | Endpoint |
| --- | --- |
| `myShop()` · `myShops()` | `GET /shops/mine` |
| `updateSettings(input)` | `PATCH /shops/mine` (`settings.manage`) |
| `branchesOf(shopId)` | `GET /shops/{id}/branches` |
| `createBranch(input)` / `deleteBranch(id)` | manager CRUD |
| `employees()` / `createEmployee(input)` / `updateEmployee(id, input)` | `GET/POST/PATCH /shops/mine/employees` (`team.manage`) |

## Admin — `adminService`, `catalogAdminService`

| Method | Permission |
| --- | --- |
| `adminService.dashboard()` → `{ totals }` | ADMIN / SUPER_ADMIN |
| `adminService.users(filters)` · `setUserStatus` · `resetPassword` | ADMIN |
| `adminService.shops()` · `approveShop` · `rejectShop` · `setShopStatus` | ADMIN |
| `adminService.setCommission(shopId, type, value)` | `commissions.manage` |
| `adminService.auditLog()` | `audit.view` |
| `catalogAdminService.addCategory/update/toggle/remove` | `categories.manage` |
| `catalogAdminService.addManufacturer/update/toggle` | `manufacturers.manage` |

## Notifications — `notificationService`

| Method | Endpoint |
| --- | --- |
| `listMine()` · `unreadCount()` | `GET /notifications/mine` |
| `markRead(id)` · `markAllRead()` | `POST /notifications/{id}/read` |
| `sendToAll(input)` | `POST /admin/notifications/broadcast` (`notifications.send`) |

## Banners — `bannerService`

| Method | Endpoint |
| --- | --- |
| `adminList()` | `GET /admin/banners` |
| `create(input)` · `update(id, input)` · `toggle(id)` · `remove(id)` | `banners.manage` |

Banner positions: `HOME_TOP | HOME_MID | SHOP`.

## Reports — `reportService`

| Method | Endpoint |
| --- | --- |
| `summary(filters)` | `GET /reports/summary` (ADMIN/SUPER_ADMIN/SHOP_OWNER, `reports.view`) |
| `shopSummary(shopId, filters)` | `GET /reports/shops/{id}` (shop members/admin) |
| `topProducts(shopId, limit)` | `GET /reports/shops/{id}/top-products` |

`ReportSummary`: `{ activeUsers, approvedShops, products, orders, sales, commissions,
payments, popularSearches, popularVehicles, shopPerformance, salesByMonth,
methodBreakdown, categoryBreakdown }`.

## Persistence & seeding

- Keys: `ala2_db_v1` (data), `ala2_seeded_v1` (seed marker), `ala2_session` (session), `ala2_cart` (cart), `ala2_lang_v1` (language).
- `db.ts` bootstraps demo data (countries, categories, manufacturers, vehicles, 2 shops with branches/products/inventory/members, demo users, sample orders/payments/reviews/complaints/notifications/banners).
- The interface (`PersistedState`) matches what an ORM-fuelled Laravel backend would expose, keeping the swap path short.