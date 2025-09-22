import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user, isGuest } = useUser();

  // Fetch cart from backend
  useEffect(() => {
    const fetchCart = async () => {
      if (!isGuest && user?._id) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Failed to fetch cart');
          const data = await response.json();
          setCart(data.map(item => ({
            _id: item._id,
            id: item.productId._id,
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.image,
            quantity: item.quantity,
          })));
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchCart();
  }, [user, isGuest]);

  // Add to cart
  const addToCart = async (product, quantity) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product._id);
      if (existing) {
        return prev.map(i => i.id === product._id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, id: product._id, quantity }];
    });

    if (!isGuest && user?._id) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product._id, quantity }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Update quantity dynamically
  const updateQuantity = async (productId, newQuantity) => {
    if (!isGuest && user?._id) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem('token');

      if (newQuantity <= 0) {
        // Delete item if quantity is 0
        try {
          await fetch(`${API_URL}/api/cart/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          setCart(prev => prev.filter(item => item.id !== productId));
        } catch (err) {
          console.error(err);
        }
        return;
      }

      // Update backend quantity
      try {
        const response = await fetch(`${API_URL}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId, quantity: newQuantity }),
        });
        if (!response.ok) throw new Error('Failed to update quantity');
        setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
      } catch (err) {
        console.error(err);
      }
    } else {
      // Guest user: just update frontend
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const removeFromCart = async (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    if (!isGuest && user?._id) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/cart/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
