import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user, isGuest } = useUser();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
  const token = localStorage.getItem('token');

  // Fetch cart on page load or user change
  useEffect(() => {
    const fetchCart = async () => {
      if (!isGuest && user?._id) {
        try {
          const res = await fetch(`${API_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch cart');
          const data = await res.json();
          const mappedCart = data
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
          console.error('Error fetching cart:', err);
        }
      }
    };
    fetchCart();
  }, [user, isGuest]);

  // -------------------------------
  // Add to Cart (ProductPage)
  // -------------------------------
  const addToCart = async (product, quantity) => {
    if (!isGuest && user?._id) {
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product._id, quantity }),
        });
        if (!res.ok) throw new Error('Failed to add to cart');

        // Refetch cart to get updated quantities
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
      // Guest user: just update local state
      setCart(prev => {
        const existing = prev.find(item => item.id === product._id);
        if (existing) {
          return prev.map(item =>
            item.id === product._id
              ? { ...item, quantity: Math.min(item.quantity + quantity, product.countInStock) }
              : item
          );
        }
        return [...prev, { ...product, id: product._id, quantity }];
      });
    }
  };

  // -------------------------------
  // Update quantity (Cart increment/decrement)
  // -------------------------------
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (!isGuest && user?._id) {
      try {
        const res = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity: newQuantity }),
        });
        if (!res.ok) throw new Error('Failed to update cart quantity');

        // Refetch cart
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

  // -------------------------------
  // Remove item from cart
  // -------------------------------
  const removeFromCart = async (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));

    if (!isGuest && user?._id) {
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
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
