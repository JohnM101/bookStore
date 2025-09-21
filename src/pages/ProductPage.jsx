// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import './categories.css';

// API helper function to add item to cart DB
export const addToCartDB = async (userId, productId, quantity, token, API_URL) => {
  try {
    const cartData = {
      userId,
      productId,
      quantity
    };

    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cartData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add to Cart: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to Cart:", error);
    throw error;
  }
};

// Helper function to normalize image paths
const normalizeImagePath = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isGuest } = useUser();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

  // Fetch product data from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, API_URL]);

  if (loading) return <div className="loading-container">Loading product details...</div>;
  if (error || !product)
    return (
      <div className="not-found-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')}>Return to Homepage</button>
      </div>
    );

  const imagePath = normalizeImagePath(product.image);

  // Handle Add to Cart button click
  const handleAddToCart = async () => {
    if (isGuest) {
      console.error("Guest cannot add to cart");
      return;
    }
    if (!user || !user._id || !user.token) {
      console.error("User not logged in");
      return;
    }

    try {
      // 1. Send product to database cart collection
      await addToCartDB(user._id, product._id, 1, user.token, API_URL);

      // 2. Update local CartContext
      if (typeof addToCart === 'function') {
        addToCart(product, 1);
      }

      // 3. Show confirmation overlay
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  return (
    <div className="app">
      <div className="product-section">
        <div className="product-detail-container">
          {/* Product Image */}
          <div className="product-image-container">
            <img
              src={imagePath}
              alt={product.name}
              className="product-detail-image"
              onError={(e) => (e.target.src = '/assets/placeholder.jpg')}
            />
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            <p className="price">₱{product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            <p>Category: <span>{product.category}</span></p>
            <p>
              Stock: <span>{product.countInStock > 0 ? product.countInStock : 'Out of Stock'}</span>
            </p>
            {product.countInStock > 0 && product.countInStock < 4 && (
              <p className="stock-warning">Only {product.countInStock} left — order soon!</p>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              {isGuest ? (
                <div className="guest-message">
                  <p>Please sign in to add items to your cart</p>
                  <Link to="/" className="sign-in-button">Sign In</Link>
                </div>
              ) : product.countInStock > 0 ? (
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              ) : (
                <button className="out-of-stock-btn" disabled>Out of Stock</button>
              )}

              {showConfirmation && (
                <div className="disclaimer-overlay">
                  <div className="disclaimer-box">
                    <h6 className="disclaimer-header">Success!</h6>
                    <p className="disclaimer-text">{product.name} has been added to your cart.</p>
                    <button className="disclaimer-button" onClick={() => setShowConfirmation(false)}>
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Placeholder for Related Products */}
        <h2 className="section-heading">You May Also Like</h2>
        <div className="product-grid"></div>
        <hr className="bottom-line" />
      </div>
    </div>
  );
};

export default ProductPage;
