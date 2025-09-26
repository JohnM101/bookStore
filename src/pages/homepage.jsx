import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './homepage.css';

const Homepage = () => {
  const banners = [
    '/assets/Banner 2.png',
    '/assets/Banner 3.png',
    '/assets/Banner 4.png',
    '/assets/Banner 5.png'
  ];
  const [current, setCurrent] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user details from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Check disclaimer flag on first render
  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
        const token = user ? user.token : null;

        const response = await fetch(`${API_URL}/api/admin/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch products');

        const products = await response.json();
        const categorizedProducts = products.reduce((acc, product) => {
          const category = product.category;
          if (!acc[category]) acc[category] = [];
          acc[category].push(product);
          return acc;
        }, {});

        setProductData(categorizedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleProceed = () => {
    localStorage.setItem('hasSeenDisclaimer', 'true');
    setShowDisclaimer(false);
  };

  const renderProductSection = (title, products) => {
    if (!products || products.length === 0) return null;

    return (
      <div className={`product-section ${title.toLowerCase()}-section`}>
        <h2>{title.toUpperCase()} ──────────────────────────────────</h2>
        <div className="product-list">
          {products.slice(0, 4).map((product) => (
            <div
              className="product-card"
              key={product._id}
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img src={product.image} alt={product.name} />
              <p className="product-name">{product.name}</p>
              <p className="product-subtitle">
                {product.description.substring(0, 30)}...
              </p>
              <p className="price">₱{product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <Link to={`/${title.toLowerCase()}`} className="view-all">
          View All
        </Link>
      </div>
    );
  };

  return (
    <div className="app">
      {/* Navbar stays mounted */}
      <Navbar />

      {/* Disclaimer overlay only if needed */}
      {showDisclaimer && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-box">
            <img src="/assets/logo.png" alt="Logo" className="disclaimer-logo" />
            <h6 className="disclaimer-header">Welcome!</h6>
            {user ? (
              <>
                <p className="disclaimer-text">
                  Hello <strong>{user.firstName} {user.lastName}</strong> ({user.email}) 👋
                </p>
                <p className="disclaimer-text">
                  This bookstore is for educational purposes only.
                </p>
              </>
            ) : (
              <p className="disclaimer-text">
                This bookstore is for educational purposes only.
              </p>
            )}
            <button className="disclaimer-button" onClick={handleProceed}>
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* Carousel */}
      <div className="carousel">
        <img src={banners[current]} alt={`Banner ${current + 1}`} />
      </div>

      {/* Product Sections */}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        Object.entries(productData).map(([title, products]) =>
          renderProductSection(title, products)
        )
      )}
    </div>
  );
};

export default Homepage;
