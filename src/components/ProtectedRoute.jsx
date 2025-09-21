// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  // For admin-only routes
  if (adminOnly) {
    return isAdmin() ? children : <Navigate to="/" />;
  }

  // For regular protected routes (any logged-in user)
  return user && !user.isGuest ? children : <Navigate to="/" />;
};

export default ProtectedRoute;

