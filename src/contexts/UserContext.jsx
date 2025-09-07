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

  // Updated login function that handles both cases
  const login = async (emailOrUserData, password) => {
    // Case 1: If a user object is passed directly (e.g., for admin bypass or registration)
    if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
      const userData = emailOrUserData;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Store token separately if provided
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      return true;
    }
    
    // Case 2: If email and password are provided, authenticate with the server
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: emailOrUserData, 
          password 
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Create a comprehensive user object with all fields from the API
      const userData = {
        ...data.user, // Include all user data from response
        isLoggedIn: true,
        token: data.token // Make sure token is included
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store token separately if needed
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
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

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Update user data
  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');
  
  // Check if user is a regular user
  const isUser = () => hasRole('user');
  
  // Check if user is a guest
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
      isAdmin,
      isUser,
      isGuest: isGuest() // Call the function here to return a boolean instead of the function reference
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
