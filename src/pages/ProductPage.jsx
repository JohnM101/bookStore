// ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './categories.css';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

const normalizeImagePath = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
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

  const { user, isGuest, loading: userLoading } = useUser();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
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
  }, [productId]);

  if (loading || userLoading) return <div className="loading-container">Loading...</div>;
  if (error || !product) return (
    <div className="not-found-container">
      <h2>Product Not Found</h2>
      <p>The product you're looking for doesn't exist or has been removed.</p>
      <button onClick={() => navigate('/')}>Return to Homepage</button>
    </div>
  );

  const imagePath = normalizeImagePath(product.image);

  const handleAddToCartClick = () => {
    setQuantity(1);
    setShowQuantityPrompt(true);
  };

  const confirmAddToCart = () => {
    if (typeof addToCart === 'function') {
      addToCart(product, quantity);

      console.log('Adding to cart:', {
        userID: user && user.id ? user.id : 'Guest',
        productID: productId,
        quantity
      });

      setShowQuantityPrompt(false);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000);
    } else {
      console.error("addToCart is not available or not a function");
    }
  };

  return (
    <div className="app">
      <div className="product-section">
        <div className="product-detail-container">
          <div className="product-image-container">
            <img src={imagePath} alt={product.name} className="product-detail-image" onError={(e) => e.target.src="/assets/placeholder.jpg"} />
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="price">₱{product.price.toFixed(2)}</p>
            <p>{product.description}</p>

            <div className="product-actions">
              {isGuest() ? (
                <div>Please sign in to add items to your cart</div>
              ) : (
                product.countInStock > 0 ? (
                  <button onClick={handleAddToCartClick}>Add to Cart</button>
                ) : (
                  <button disabled>Out of Stock</button>
                )
              )}

              {showQuantityPrompt && (
                <div className="disclaimer-overlay">
                  <div className="disclaimer-box">
                    <h6>Select Quantity</h6>
                    <p>User ID: <strong>{!isGuest() && user.id ? user.id : 'Guest'}</strong></p>
                    <p>Product ID: <strong>{productId}</strong></p>
                    <input type="number" min="1" max={product.countInStock} value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                    <div>
                      <button onClick={() => setShowQuantityPrompt(false)}>Cancel</button>
                      <button onClick={confirmAddToCart}>Confirm</button>
                    </div>
                  </div>
                </div>
              )}

              {showConfirmation && (
                <div className="disclaimer-overlay">
                  <div className="disclaimer-box">
                    <h6>Success!</h6>
                    <p>{product.name} (x{quantity}) added to cart.</p>
                    <button onClick={() => setShowConfirmation(false)}>Continue Shopping</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
