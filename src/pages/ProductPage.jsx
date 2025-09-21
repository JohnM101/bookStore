// ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './categories.css';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

// Helper function to normalize image paths
const normalizeImagePath = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return path.startsWith('/') ? path : `/${path}`;
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showQuantityPrompt, setShowQuantityPrompt] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isGuest } = useUser(); // extract user object

  console.log('Adding to cart:', {
  userID: isGuest ? 'Guest' : user.id,
  productID: productId,
  quantity,
});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
        const response = await fetch(`${API_URL}/api/products/${productId}`);

        if (!response.ok) {
          throw new Error('Product not found');
        }

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
  }, [productId]);

  if (loading) {
    return <div className="loading-container">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="not-found-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')}>Return to Homepage</button>
      </div>
    );
  }

  const imagePath = normalizeImagePath(product.image);

  const handleAddToCartClick = () => {
    setQuantity(1); // reset default quantity
    setShowQuantityPrompt(true);
  };

  const confirmAddToCart = () => {
    if (typeof addToCart === 'function') {
      addToCart(product, quantity);

      // Debug: log userID, productID, quantity
      console.log('Adding to cart:', {
        userID: user && user.id ? user.id : 'Guest',
        productID: productId,
        quantity,
      });

      setShowQuantityPrompt(false);
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    } else {
      console.error("addToCart is not available or not a function");
    }
  };

  return (
    <div className="app">
      {/* Product Details Section */}
      <div className="product-section">
        <div className="product-detail-container">
          <div className="product-image-container">
            <img
              src={imagePath}
              alt={product.name}
              className="product-detail-image"
              onError={(e) => {
                console.error("Failed to load image:", imagePath);
                e.target.src = "/assets/placeholder.jpg"; // fallback image
              }}
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
                Stock: <span>{product.countInStock > 0 ? `${product.countInStock}` : "Out of Stock"}</span>
              </p>
              {product.countInStock > 0 && product.countInStock < 4 && (
                <p className="stock-warning">Only {product.countInStock} left — order soon!</p>
              )}
            </div>

            {/* Product Action Buttons */}
            <div className="product-actions">
              {isGuest ? (
                <div className="guest-message">
                  <p>Please sign in to add items to your cart</p>
                  <Link to="/" className="sign-in-button">
                    Sign In
                  </Link>
                </div>
              ) : (
                product.countInStock > 0 ? (
                  <button className="add-to-cart-btn" onClick={handleAddToCartClick}>
                    Add to Cart
                  </button>
                ) : (
                  <button className="out-of-stock-btn" disabled>Out of Stock</button>
                )
              )}

              {/* Quantity Prompt Modal */}
              {showQuantityPrompt && (
                <div className="disclaimer-overlay">
                  <div className="disclaimer-box">
                    <h6 className="disclaimer-header">Select Quantity</h6>

                    {/* Display logged-in user ID and product ID */}
                    {!isGuest && user && user.id ? (
                      <p>User ID: <strong>{user.id}</strong></p>
                    ) : (
                      <p>User ID: <strong>Guest</strong></p>
                    )}
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
                      <button className="disclaimer-button cancel" onClick={() => setShowQuantityPrompt(false)}>Cancel</button>
                      <button className="disclaimer-button" onClick={confirmAddToCart}>Confirm</button>
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

        {/* Related Products Section */}
        <h2 className="section-heading">You May Also Like</h2>
        <div className="product-grid">
          {/* Related products go here */}
        </div>

        <hr className="bottom-line" />
      </div>
    </div>
  );
};

export default ProductPage;
