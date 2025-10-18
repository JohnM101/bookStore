// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);

  // -----------------------------------
  // 🔹 Login user (from Login.jsx or Google)
  // -----------------------------------
  const login = async (userData) => {
    try {
      if (!userData) return;

      // ✅ Store token + user persistently
      if (userData.token) {
        localStorage.setItem("token", userData.token);
      }

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsGuest(false);

      console.log("🟢 User logged in:", userData);
    } catch (err) {
      console.error("❌ Error saving user data:", err);
    }
  };

  // -----------------------------------
  // 🔹 Logout user (clears token and user data)
  // -----------------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsGuest(true);
    console.log("🔴 User logged out");
  };

  // -----------------------------------
  // 🔹 Continue as guest
  // -----------------------------------
  const continueAsGuest = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser({ isGuest: true });
    setIsGuest(true);
    console.log("🟠 Continued as guest");
  };

  // -----------------------------------
  // 🔹 Load saved user/token on app start
  // -----------------------------------
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(storedUser);
        setIsGuest(false);
        console.log("🔵 Loaded user from storage:", storedUser);
      } else {
        console.log("🟠 No logged-in user found, using guest mode");
        setUser({ isGuest: true });
        setIsGuest(true);
      }
    } catch (err) {
      console.error("❌ Failed to load stored user:", err);
    }
  }, []);

  // -----------------------------------
  // 🔹 Get JWT token helper (for API calls)
  // -----------------------------------
  const getToken = () => localStorage.getItem("token");

  // -----------------------------------
  // 🔹 Context value for consumers
  // -----------------------------------
  return (
    <UserContext.Provider
      value={{
        user,
        isGuest,
        login,
        logout,
        continueAsGuest,
        getToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the user context
export const useUser = () => useContext(UserContext);
