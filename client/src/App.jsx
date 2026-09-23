import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/order-confirmation/:orderId" element={
                      <ProtectedRoute>
                        <OrderConfirmationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/:orderId" element={
                      <ProtectedRoute>
                        <OrderDetailsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />

                    {/* Staff & Kitchen Protected Route */}
                    <Route path="/kitchen" element={
                      <ProtectedRoute allowedRoles={['staff', 'admin']}>
                        <KitchenDashboardPage />
                      </ProtectedRoute>
                    } />

                    {/* Admin Protected Route */}
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
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
