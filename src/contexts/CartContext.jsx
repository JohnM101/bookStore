import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user, isGuest } = useUser();

  // Fetch cart from backend if logged in
  useEffect(() => {
    const fetchCart = async () => {
      if (!isGuest && user && user._id) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/api/cart`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch cart');
          const data = await response.json();

          // Map backend data to include consistent "id" for frontend
          const mappedCart = data.map(item => ({
            _id: item._id,
            id: item.productId._id, 
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image,
            quantity: item.quantity,
          }));
          setCart(mappedCart);
        } catch (err) {
          console.error('Error fetching cart:', err);
        }
      }
    };

    fetchCart();
  }, [user, isGuest]);

  const addToCart = (product, quantity) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevCart, { ...product, id: product._id, quantity }];
      }
    });
  };

  const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  // 1️⃣ Update frontend state immediately
  setCart(prev =>
    prev.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    )
  );

  // 2️⃣ Update backend dynamically
  if (!isGuest && user && user._id) {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
      const token = localStorage.getItem('token');

      // Call backend API to update quantity
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart quantity in backend');
      }

      const data = await response.json();
      console.log('Backend cart updated:', data);
    } catch (err) {
      console.error('Error updating cart quantity:', err);
    }
  }
};

  const removeFromCart = async (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));

    if (!isGuest && user && user._id) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/cart/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to remove cart item from backend:', err);
      }
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
