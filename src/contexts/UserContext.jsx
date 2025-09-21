// src/contexts/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (emailOrUserData, password) => {
    if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
      // Direct user object (admin or bypass)
      const userData = {
        ...emailOrUserData,
        id: emailOrUserData._id || emailOrUserData.id || null
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) localStorage.setItem('token', userData.token);
      return true;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUserData, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const userData = {
        ...data.user,
        id: data.user._id, // ensure id exists
        isLoggedIn: true,
        token: data.token
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (data.token) localStorage.setItem('token', data.token);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const continueAsGuest = () => {
    const guestData = {
      isGuest: true,
      role: 'guest',
      name: 'Guest',
      coupons: 0,
      reviews: 0
    };
    setUser(guestData);
    localStorage.setItem('user', JSON.stringify(guestData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  const isGuest = () => hasRole('guest') || !user;

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      setUser,
      loading,
      continueAsGuest,
      hasRole,
      isGuest // pass the function, not boolean
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
