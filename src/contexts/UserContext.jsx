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

  const login = async (emailOrUserData, password) => {
    // Case 1: admin bypass or direct object login
    if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
      const userData = {
        ...emailOrUserData,
        _id: emailOrUserData._id || 'guest-001', // ensure _id exists
        isLoggedIn: true,
        isGuest: false,
        registrationDate: emailOrUserData.registrationDate || new Date().toISOString()
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) localStorage.setItem('token', userData.token);
      return true;
    }

    // Case 2: normal login with email & password
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUserData, password })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();

      // Backend returns user fields directly (_id, firstName, email, etc.)
      const userData = {
        ...data,
        _id: data._id,
        isLoggedIn: true,
        isGuest: false,
        registrationDate: data.createdAt || new Date().toISOString()
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
      _id: 'guest-001',
      isGuest: true,
      isLoggedIn: false,
      role: 'guest',
      name: 'Guest',
      registrationDate: new Date().toISOString()
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
    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
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
        hasRole
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
