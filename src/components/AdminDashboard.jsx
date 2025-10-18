//src/components/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import UserManagement from './admin/UserManagement';
import OrderManagement from './admin/OrderManagement';
import ProductManagement from './admin/ProductManagement';
import CategoryManagement from './admin/CategoryManagement'; // ✅ NEW import
import './AdminDashboard.css';
import BannerManagement from './admin/BannerManagement';

const AdminDashboard = () => {
  const { isAdmin, logout } = useUser();
  const navigate = useNavigate();

  // Redirect non-admin users to home
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
      alert('Access denied — admin only');
    }
  }, [isAdmin, navigate]);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAdmin()) return <div>Access Denied</div>;

  return (
    <div className="admin-dashboard">
      {/* === Sidebar === */}
      <div className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          <ul>
            <li>
              <Link to="/admin/products">Products</Link>
            </li>
            <li>
              <Link to="/admin/categories">Categories</Link> {/* ✅ NEW LINK */}
            </li>
            <li>
              <Link to="/admin/users">Users</Link>
            </li>
            <li>
              <Link to="/admin/orders">Orders</Link>
            </li>
            <li>
              <Link to="/admin/banners">Banners</Link>
            </li>
          </ul>
        </nav>

        <div className="admin-logout">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* === Main Content === */}
      <div className="admin-content">
        <Routes>
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/categories" element={<CategoryManagement />} /> {/* ✅ NEW ROUTE */}
          <Route path="/users" element={<UserManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/banners" element={<BannerManagement />} />
          <Route path="/" element={<div>Welcome to Admin Dashboard</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
