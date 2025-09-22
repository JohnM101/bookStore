// CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user, isGuest } = useUser();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
  const token = localStorage.getItem('token');

  // Fetch cart from backend when user changes or page reloads
  useEffect(() => {
    const fetchCart = async () => {
      if (!isGuest && user && user._id) {
        try {
          const response = await fetch(`${API_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Failed to fetch cart');

          const data = await response.json();

          // Map backend data safely
          const mappedCart = data
            .filter(item => item.productId) // skip if productId missing
            .map(item => ({
              _id: item._id,          // cart item id
              id: item.productId._id, // product id
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

  // Add item to cart locally and optionally sync backend
  const addToCart = async (product, quantity) => {
  // Sync to backend
  if (!isGuest && user && user._id) {
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product._id, quantity }),
      });
      if (!res.ok) throw new Error('Failed to add to cart');

      const data = await res.json();

      // Refetch the cart to get the latest quantities
      const cartRes = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = await cartRes.json();
      const mappedCart = cartData
        .filter(item => item.productId)
        .map(item => ({
          _id: item._id,
          id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          quantity: item.quantity,
        }));
      setCart(mappedCart);

    } catch (err) {
      console.error('Failed to add to backend cart:', err);
    }
  } else {
    // For guests, just update local state
    setCart(prev => {
      const existing = prev.find(item => item.id === product._id);
      if (existing) {
        return prev.map(item =>
          item.id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, id: product._id, quantity }];
    });
  }
};

  // Update quantity dynamically
  const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  // Update backend first
  if (!isGuest && user && user._id) {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (!response.ok) throw new Error('Failed to update cart quantity');

      // Refetch the cart
      const cartRes = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = await cartRes.json();
      const mappedCart = cartData
        .filter(item => item.productId)
        .map(item => ({
          _id: item._id,
          id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          quantity: item.quantity,
        }));
      setCart(mappedCart);

    } catch (err) {
      console.error('Error updating cart quantity:', err);
    }
  } else {
    // Guest: just update local state
    setCart(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  }
};

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));

    if (!isGuest && user && user._id) {
      try {
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
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
