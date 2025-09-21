// CartContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Add export here
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const updateQuantity = (productId, newQuantity) => {
        // If quantity becomes zero or negative, remove the item
        if (newQuantity <= 0) {
          removeFromCart(productId);
          return;
        }
        
        // Update the cart state using your cart state setter
        setCart(prevCart => 
          prevCart.map(item => 
            (item.id === productId || item._id === productId) ? {...item, quantity: newQuantity} : item
          )
        );
      };

    const addToCart = (product, quantity) => {
        // Ensure the product has a consistent id property
        const productWithConsistentId = {
            ...product,
            id: product._id || product.id // Use _id if available, otherwise use id
        };

        setCart(prevCart => {
            // Check for existing item using both id and _id to be safe
            const existingItem = prevCart.find(item => 
                (item.id === productWithConsistentId.id) || 
                (item._id && item._id === productWithConsistentId._id)
            );
            
            if (existingItem) {
                return prevCart.map(item =>
                    (item.id === productWithConsistentId.id || 
                    (item._id && item._id === productWithConsistentId._id))
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, { ...productWithConsistentId, quantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => 
            item.id !== productId && (item._id ? item._id !== productId : true)
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);