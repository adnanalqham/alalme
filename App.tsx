
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import PartDetails from './pages/PartDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ExternalRequest from './pages/ExternalRequest';
import ContactUs from './pages/ContactUs';
import Inbox from './pages/Inbox';
import SellerDashboard from './pages/seller/SellerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: UserRole[] }> = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/part/:id" element={<PartDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Public forms */}
            <Route path="/external-request" element={<ExternalRequest />} />
            <Route path="/contact" element={<ContactUs />} />
            
            {/* Protected Routes */}
            
            {/* Shared Inbox Route */}
            <Route 
              path="/inbox" 
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              } 
            />

            {/* Admin Inbox */}
            <Route 
              path="/admin/inbox" 
              element={
                <ProtectedRoute roles={[UserRole.ADMIN]}>
                  <Inbox />
                </ProtectedRoute>
              } 
            />

            {/* Seller Inbox */}
            <Route 
              path="/seller/inbox" 
              element={
                <ProtectedRoute roles={[UserRole.SELLER]}>
                  <Inbox />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/seller" 
              element={
                <ProtectedRoute roles={[UserRole.SELLER]}>
                  <SellerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute roles={[UserRole.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <div className="p-10 text-center text-xl text-primary">Customer Profile Placeholder</div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
