// src/contexts/UserContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (emailOrUserData, password) => {
    if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
      const userData = {
        ...emailOrUserData,
        _id: emailOrUserData._id || emailOrUserData.id,
        isLoggedIn: true,
        isGuest: false,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) localStorage.setItem('token', userData.token);
      return true;
    }

    try {
      const API_URL = process.env.REACT_APP_RENDER_URL || 'https://bookstore-0hqj.onrender.com';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUserData, password }),
      });

      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();

      const userData = {
        ...data,
        _id: data._id || data.id,
        isLoggedIn: true,
        isGuest: false,
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
      isLoggedIn: true,
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

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        setUser,
        loading,
        continueAsGuest,
        hasRole,
        isAdmin: () => hasRole('admin'),
        isUser: () => hasRole('user'),
        isGuest: () => hasRole('guest') || !user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
