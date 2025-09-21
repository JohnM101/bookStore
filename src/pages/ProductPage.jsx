import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './categories.css';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

// Helper function to normalize image paths
const normalizeImagePath = (path) => {
  if (!path) return '';
  // Check if the path is already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise ensure path starts with a slash
  return path.startsWith('/') ? path : `/${path}`;
};

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isGuest } = useUser();
  
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
  
  // Normalize the image path
  const imagePath = normalizeImagePath(product.image);

  const handleAddToCart = () => {
    if (typeof addToCart === 'function') {
      addToCart(product, 1);
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
                e.target.src = "/assets/placeholder.jpg"; // Fallback image
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
              <p>In Stock: <span>{product.inStock ? "Yes" : "No"}</span></p>
            </div>
            
            <div className="product-actions">
  {isGuest ? (
    <div className="guest-message">
  <p>Please sign in to add items to your cart</p>
  <Link to="/" className="sign-in-button">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
    Sign In
  </Link>
</div>
  ) : (
    product.inStock ? (
      <button 
        className="add-to-cart-btn" 
        onClick={handleAddToCart}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>     Add to Cart
      </button>
    ) : (
      <button className="out-of-stock-btn" disabled>
        Out of Stock
      </button>
    )
  )}
  {showConfirmation && (
    <div className="disclaimer-overlay">
      <div className="disclaimer-box">
        <img src="/assets/logo.png" alt="Logo" className="disclaimer-logo" />
        <h6 className="disclaimer-header">Success!</h6>
        <p className="disclaimer-text">{product.name} has been added to your cart.</p>
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
          {/* Map through related products here */}
        </div>
        <hr className="bottom-line" />
      </div>
    </div>
  );
};

export default ProductPage;
