//productPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './categories.css';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

// Helper to normalize image paths
const normalizeImagePath = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityPrompt, setShowQuantityPrompt] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user, isGuest } = useUser();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <div className="loading-container">Loading product details...</div>;
  if (error || !product)
    return (
      <div className="not-found-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')}>Return to Homepage</button>
      </div>
    );

  const imagePath = normalizeImagePath(product.image);

  const handleAddToCartClick = () => {
    setQuantity(1);
    setShowQuantityPrompt(true);
  };

  const confirmAddToCart = async () => {
  if (typeof addToCart !== 'function') {
    console.error('addToCart is not available');
    return;
  }

  try {
    // Call CartContext's addToCart, which updates state and backend
    await addToCart(product, quantity);

    // Close quantity modal and show confirmation
    setShowQuantityPrompt(false);
    setShowConfirmation(true);

    // Hide confirmation automatically after 3 seconds
    setTimeout(() => setShowConfirmation(false), 3000);
  } catch (err) {
    console.error('Error adding to cart:', err);
  }
};

  return (
    <div className="app">
      <div className="product-section">
        <div className="product-detail-container">
          <div className="product-image-container">
            <img
              src={imagePath}
              alt={product.name}
              className="product-detail-image"
              onError={(e) => (e.target.src = '/assets/placeholder.jpg')}
            />
          </div>

          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            <p className="price">₱{product.price.toFixed(2)}</p>
            <div className="rating-container">
              <span className="rating-text">Rating: {product.rating}/5</span>
            </div>
            <p className="product-description">{product.description}</p>

            <div className="product-meta">
              <p>Category: <span>{product.category}</span></p>
              <p>
                Stock: <span>{product.countInStock > 0 ? product.countInStock : 'Out of Stock'}</span>
              </p>
              {product.countInStock > 0 && product.countInStock < 4 && (
                <p className="stock-warning">Only {product.countInStock} left — order soon!</p>
              )}
            </div>

            <div className="product-actions">
              {isGuest ? (
                <div className="guest-message">
                  <p>Please sign in to add items to your cart</p>
                  <Link to="/" className="sign-in-button">Sign In</Link>
                </div>
              ) : product.countInStock > 0 ? (
                <button className="add-to-cart-btn" onClick={handleAddToCartClick}>
                  Add to Cart
                </button>
              ) : (
                <button className="out-of-stock-btn" disabled>Out of Stock</button>
              )}

              {/* Quantity Modal */}
              {showQuantityPrompt && (
                <div className="disclaimer-overlay">
                  <div className="disclaimer-box">
                    <h6 className="disclaimer-header">Select Quantity</h6>
                    <p>User ID: <strong>{isGuest ? 'Guest' : user._id}</strong></p>
                    <p>Product ID: <strong>{productId}</strong></p>
                    <input
                      type="number"
                      min="1"
                      max={product.countInStock}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="quantity-input"
                    />
                    <div className="modal-buttons">
                      <button
                        className="disclaimer-button cancel"
                        onClick={() => setShowQuantityPrompt(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="disclaimer-button"
                        onClick={confirmAddToCart} // ← Use the corrected function
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {/* Confirmation Modal */}
              {showConfirmation && (
                <div className="disclaimer-overlay">
                  <div className="disclaimer-box">
                    <h6 className="disclaimer-header">Success!</h6>
                    <p className="disclaimer-text">{product.name} (x{quantity}) has been added to your cart.</p>
                    <button className="disclaimer-button" onClick={() => setShowConfirmation(false)}>Continue Shopping</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <h2 className="section-heading">You May Also Like</h2>
        <div className="product-grid">{/* Related products here */}</div>

        <hr className="bottom-line" />
      </div>
    </div>
  );
};

export default ProductPage;
