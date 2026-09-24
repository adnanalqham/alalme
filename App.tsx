import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import ShopLayout from './components/layout/ShopLayout';
import AdminLayout from './components/layout/AdminLayout';
import { RequireAuth, AdminOnly, ShopOnly, CustomerOnly } from './components/guards';

import Home from './pages/Home';
import Search from './pages/Search';
import PartDetails from './pages/PartDetails';
import ShopList from './pages/ShopList';
import ShopDetail from './pages/ShopDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ExternalRequest from './pages/ExternalRequest';
import ContactUs from './pages/ContactUs';
import Inbox from './pages/Inbox';

import SellerDashboard from './pages/seller/SellerDashboard';
import ShopDashboard from './pages/shop/ShopDashboard';
import ShopProducts from './pages/shop/ShopProducts';
import ShopInventory from './pages/shop/ShopInventory';
import ShopOrders from './pages/shop/ShopOrders';
import ShopEmployees from './pages/shop/ShopEmployees';
import ShopBranches from './pages/shop/ShopBranches';
import ShopReports from './pages/shop/ShopReports';
import ShopSettings from './pages/shop/ShopSettings';
import ShopPending from './pages/shop/ShopPending';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminShops from './pages/admin/AdminShops';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCatalog from './pages/admin/AdminCatalog';
import AdminReviews from './pages/admin/AdminReviews';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminBanners from './pages/admin/AdminBanners';
import AdminReports from './pages/admin/AdminReports';
import AdminAudit from './pages/admin/AdminAudit';
import AdminRoles from './pages/admin/AdminRoles';
import AdminRoleDetail from './pages/admin/AdminRoleDetail';
import AdminPermissions from './pages/admin/AdminPermissions';
import AdminRoleMatrix from './pages/admin/AdminRoleMatrix';
import AdminUserAccess from './pages/admin/AdminUserAccess';
import AdminShopApprovals from './pages/admin/AdminShopApprovals';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCommissions from './pages/admin/AdminCommissions';
import AdminGeography from './pages/admin/AdminGeography';
import AdminSettings from './pages/admin/AdminSettings';

const Forbidden: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center px-6">
    <div className="text-6xl font-extrabold text-primary">403</div>
    <p className="text-gray-500 text-sm">Access denied · الوصول مرفوض</p>
    <a href="#/" className="rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold">Home</a>
  </div>
);

const NotFound: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center px-6">
    <div className="text-6xl font-extrabold text-primary">404</div>
    <p className="text-gray-500 text-sm">Page not found · الصفحة غير موجودة</p>
    <a href="#/" className="rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold">Home</a>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public site (navbar + footer shell) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/part/:id" element={<PartDetails />} />
          <Route path="/shops" element={<ShopList />} />
          <Route path="/shops/:id" element={<ShopDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CustomerOnly><Checkout /></CustomerOnly>} />
          <Route path="/orders" element={<CustomerOnly><Orders /></CustomerOnly>} />
          <Route path="/orders/:id" element={<CustomerOnly><OrderDetail /></CustomerOnly>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
          <Route path="/external-request" element={<ExternalRequest />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Legacy compat routes */}
          <Route path="/seller/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
          <Route path="/seller" element={<RequireAuth><SellerDashboard /></RequireAuth>} />
          <Route path="/admin/inbox" element={<AdminOnly><Inbox /></AdminOnly>} />
          <Route path="/shop/pending" element={<RequireAuth><ShopPending /></RequireAuth>} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Shop panel */}
        <Route path="/shop" element={<ShopOnly><ShopLayout /></ShopOnly>}>
          <Route index element={<Navigate to="/shop/dashboard" replace />} />
          <Route path="dashboard" element={<ShopDashboard />} />
          <Route path="products" element={<ShopProducts />} />
          <Route path="products/new" element={<ShopProducts />} />
          <Route path="products/:id/edit" element={<ShopProducts />} />
          <Route path="inventory" element={<ShopInventory />} />
          <Route path="orders" element={<ShopOrders />} />
          <Route path="employees" element={<ShopEmployees />} />
          <Route path="branches" element={<ShopBranches />} />
          <Route path="reports" element={<ShopReports />} />
          <Route path="settings" element={<ShopSettings />} />
          <Route path="*" element={<Navigate to="/shop/dashboard" replace />} />
        </Route>

        {/* Admin panel */}
        <Route path="/admin" element={<AdminOnly><AdminLayout /></AdminOnly>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="shops" element={<AdminShops />} />
          <Route path="shops/approvals" element={<AdminShopApprovals />} />
          <Route path="employees" element={<AdminEmployees />} />

          {/* Access Control (Section 3, 4, 5, 8, 9, 10, 11, 14, 15) */}
          <Route path="access" element={<Navigate to="/admin/access/roles" replace />} />
          <Route path="access/roles" element={<AdminRoles />} />
          <Route path="access/roles/:id" element={<AdminRoleDetail />} />
          <Route path="access/permissions" element={<AdminPermissions />} />
          <Route path="access/matrix" element={<AdminRoleMatrix />} />
          <Route path="access/users" element={<AdminUserAccess />} />
          <Route path="access/users/:id" element={<AdminUserAccess />} />

          {/* Catalog & Products */}
          <Route path="catalog" element={<AdminCatalog />} />
          <Route path="catalog/products" element={<AdminCatalog />} />
          <Route path="catalog/categories" element={<AdminCatalog />} />
          <Route path="catalog/manufacturers" element={<AdminCatalog />} />
          <Route path="catalog/vehicles" element={<AdminCatalog />} />
          <Route path="products" element={<AdminCatalog />} />

          {/* Orders */}
          <Route path="orders" element={<AdminOrders />} />

          {/* Centralized Operations */}
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="coupons" element={<AdminDashboard />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="audit" element={<AdminAudit />} />

          {/* Geography */}
          <Route path="geography" element={<AdminGeography />} />
          <Route path="geography/countries" element={<AdminGeography />} />
          <Route path="geography/cities" element={<AdminGeography />} />

          {/* Settings */}
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;