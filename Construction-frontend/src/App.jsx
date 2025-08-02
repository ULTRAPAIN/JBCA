import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
// import AuthDebugger from './components/common/AuthDebugger';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import NotificationsPage from './pages/NotificationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import UserManagement from './pages/admin/UserManagement';
import DeliveryZoneManagement from './pages/admin/DeliveryZoneManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />
            
            <main className="pt-16 sm:pt-20 md:pt-24 lg:pt-20 xl:pt-20 pb-20 md:pb-0">{/* Added bottom padding for mobile nav */}
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Admin Panel - Protected Route */}
              <Route path="/admin" element={
                <ErrorBoundary>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ErrorBoundary>
              } />
              
              <Route path="/admin/dashboard" element={
                <ErrorBoundary>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ErrorBoundary>
              } />

              {/* Protected Routes - Authenticated Users Only */}
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />

              {/* Admin Routes - Admin Only */}
              <Route path="/admin/products" element={
                <AdminRoute>
                  <ProductManagement />
                </AdminRoute>
              } />
              
              {/* Redirect /admin/orders to dashboard orders tab */}
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <Navigate to="/admin/dashboard?tab=orders" replace />
                </AdminRoute>
              } />
              
              <Route path="/admin/orders/:id" element={
                <AdminRoute>
                  <OrderDetailPage />
                </AdminRoute>
              } />
              
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              
              <Route path="/admin/delivery-zones" element={
                <AdminRoute>
                  <DeliveryZoneManagement />
                </AdminRoute>
              } />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </main>
            
            {/* Auth debugger for development - temporarily disabled */}
            {/* <AuthDebugger /> */}
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
