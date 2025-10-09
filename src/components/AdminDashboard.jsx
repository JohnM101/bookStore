// src/components/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import UserManagement from './admin/UserManagement';
import OrderManagement from './admin/OrderManagement';
import ProductManagement from './admin/ProductManagement'; // ✅ Updated product management
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { isAdmin, logout } = useUser();
  const navigate = useNavigate();

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin()) navigate('/');
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAdmin()) return <div>Access Denied</div>;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          <ul>
            <li><Link to="/admin/products">Products</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/orders">Orders</Link></li>
          </ul>
        </nav>
        <div className="admin-logout">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-content">
        <Routes>
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/" element={<div>Welcome to Admin Dashboard</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
