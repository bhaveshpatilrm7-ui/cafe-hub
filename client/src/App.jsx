import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './components/HomePage';
import MenuPage from './components/MenuPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import OrderDetailsPage from './components/OrderDetailsPage';
import WishlistPage from './components/WishlistPage';
import ReservationsPage from './components/ReservationsPage';
import ProfilePage from './components/ProfilePage';
import KitchenDashboardPage from './components/KitchenDashboardPage';
import AdminDashboardPage from './components/AdminDashboardPage';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="app-container">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/reservations" element={<ReservationsPage />} />

                    {/* Customer Protected Routes */}
                    <Route path="/checkout" element={
                      <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/order-confirmation/:orderId" element={
                      <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                        <OrderConfirmationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/:orderId" element={
                      <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                        <OrderDetailsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                      <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                        <WishlistPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />

                    {/* Staff Protected Routes */}
                    <Route path="/staff" element={
                      <ProtectedRoute allowedRoles={['staff', 'admin']}>
                        <KitchenDashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff/kitchen" element={
                      <ProtectedRoute allowedRoles={['staff', 'admin']}>
                        <KitchenDashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff/orders" element={
                      <ProtectedRoute allowedRoles={['staff', 'admin']}>
                        <KitchenDashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff/reservations" element={
                      <ProtectedRoute allowedRoles={['staff', 'admin']}>
                        <ReservationsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/staff/inventory" element={
                      <ProtectedRoute allowedRoles={['staff', 'admin']}>
                        <KitchenDashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/kitchen" element={<Navigate to="/staff/kitchen" replace />} />

                    {/* Admin Protected Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="users" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/staff" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="users" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/products" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="products" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/categories" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="categories" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="orders" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/inventory" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="inventory" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/coupons" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="coupons" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/reservations" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="reservations" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/analytics" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="overview" />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/settings" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage initialTab="overview" />
                      </ProtectedRoute>
                    } />

                    {/* 404 Fallback */}
                    <Route path="*" element={
                      <div className="page-wrapper container text-center py-12">
                        <h1>404 - Page Not Found</h1>
                        <p className="mt-4">The page you are looking for does not exist.</p>
                      </div>
                    } />
                  </Routes>
                </main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
