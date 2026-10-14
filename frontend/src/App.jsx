import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AdminProducts from './pages/AdminProducts';
import { getCurrentCustomer } from './services/api';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) {
    return <div className="py-16 text-center text-gray-600">Checking your session...</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ user, loading, children }) => {
  if (loading) {
    return <div className="py-16 text-center text-gray-600">Checking administrator access...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? children : <Navigate to="/products" replace />;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getCurrentCustomer();
        setCurrentUser(data.customer || data.user || data);
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <Router>
      <CartProvider user={currentUser}>
        <WishlistProvider user={currentUser}>
          <div className="min-h-screen flex flex-col bg-transparent text-slate-900">
            <Navbar user={currentUser} onLogout={() => setCurrentUser(null)} />

            <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
              <Routes>
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/wishlist" element={<ProtectedRoute user={currentUser} loading={authLoading}><Wishlist /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute user={currentUser} loading={authLoading}><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute user={currentUser} loading={authLoading}><Checkout user={currentUser} /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute user={currentUser} loading={authLoading}><Orders /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute user={currentUser} loading={authLoading}><OrderDetails /></ProtectedRoute>} />
                <Route path="/order-success/:id" element={<ProtectedRoute user={currentUser} loading={authLoading}><OrderDetails success /></ProtectedRoute>} />
                <Route path="/admin/products" element={<AdminRoute user={currentUser} loading={authLoading}><AdminProducts /></AdminRoute>} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/login"
                  element={<Login onLoginSuccess={(user) => setCurrentUser(user)} />}
                />
                <Route
                  path="/home"
                  element={<ProtectedRoute user={currentUser} loading={authLoading}><Home onUserLoaded={(user) => setCurrentUser(user)} /></ProtectedRoute>}
                />
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="*" element={<Navigate to="/products" replace />} />
              </Routes>
            </main>
          </div>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
