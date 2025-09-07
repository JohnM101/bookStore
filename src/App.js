import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import CreateAccount from './pages/createaccount';
import ForgotPassword from './pages/forgotpassword';
import Homepage from './pages/homepage';
import Profile from './pages/profile';
import Desktop from './pages/desktop';
import Clothing from './pages/clothing';
import Figurines from './pages/figurines';
import Plushies from './pages/plushies';
import Varieties from './pages/varieties';
import ProductPage from './pages/ProductPage';
import Address from './pages/address';
import Wishlist from './pages/wishlist';
import Settings from './pages/settings';
import Payment from './pages/payment';
import Checkout from './pages/checkOut';
import Cart from './pages/Cart';
import SubcategoryPage from './pages/SubcategoryPage';
import AboutFAQs from './pages/AboutFAQs';
import { UserProvider } from './contexts/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './contexts/CartContext';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './styles/Responsive.css';
import './App.css';

const AppLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  const hideNavbarFooter = 
    path.includes('/admin') || 
    path === '/login' || 
    path === '/create-account' || 
    path === '/forgot-password';

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about-faqs" element={<AboutFAQs />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/clothing" element={<Clothing />} />
        <Route path="/figurines" element={<Figurines />} />
        <Route path="/plushies" element={<Plushies />} />
        <Route path="/varieties" element={<Varieties />} />
        <Route path="/:category/:subcategory" element={<SubcategoryPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* User-only routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/address" element={
          <ProtectedRoute>
            <Address />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
      </Routes>
      {!hideNavbarFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <UserProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
