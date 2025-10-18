//pages/homepage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './homepage.css';

// Define dynamic colors for categories
const CATEGORY_COLORS = {
  'kids-manga': { bg: '#f87171', text: '#fff' },
  'young-boys-manga': { bg: '#60a5fa', text: '#fff' },
  'young-girls-manga': { bg: '#34d399', text: '#fff' },
};

const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, '-').trim();

const Homepage = () => {
  const [banners, setBanners] = useState([]); // 🔥 dynamic banners from DB
  const [current, setCurrent] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  const API_URL =
    process.env.REACT_APP_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://bookstore-0hqj.onrender.com';

  // ✅ Fetch CMS banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cms/banners`);
        const data = await res.json();
        const activeBanners = data
          .filter((banner) => banner.isActive)
          .sort((a, b) => a.order - b.order)
          .map((b) => b.imageUrl);
        setBanners(activeBanners);
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };
    fetchBanners();
  }, [API_URL]);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, [API_URL]);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!localStorage.getItem('hasSeenDisclaimer')) setShowDisclaimer(true);
  }, []);

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error('Failed to fetch products');

        const products = await response.json();

        const categorizedProducts = products.reduce((acc, product) => {
          const categorySlug = normalizeSlug(product.category);
          if (!acc[categorySlug]) acc[categorySlug] = [];
          acc[categorySlug].push(product);
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
  }, [API_URL]);

  // ✅ Auto-slide banners every 4 seconds
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(
      () => setCurrent((prev) => (prev + 1) % banners.length),
      4000
    );
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleProceed = () => {
    localStorage.setItem('hasSeenDisclaimer', 'true');
    setShowDisclaimer(false);
  };

  const getCategoryName = (slug) => {
    const cat = categories.find((c) => c.slug === slug);
    return cat ? cat.name : slug;
  };

  const renderProductSection = (slug, products) => {
    if (!products || products.length === 0) return null;

    const bgColor = CATEGORY_COLORS[slug]?.bg || '#ccc';
    const textColor = CATEGORY_COLORS[slug]?.text || '#fff';

    return (
      <div
        key={slug}
        className={`product-section ${slug}-section`}
        style={{ '--section-color': bgColor, '--section-text-color': textColor }}
      >
        <h2>{getCategoryName(slug).toUpperCase()} ──────────────────────────────</h2>
        <div className="product-list">
          {products.slice(0, 4).map((product) => (
            <div
              className="product-card"
              key={product._id || product.id}
              onClick={() => navigate(`/product/${product.slug}`)}
            >
              <img src={product.image} alt={product.name} />
              <p className="product-name">{product.name}</p>
              <p className="product-subtitle">
                {product.description?.substring(0, 30)}...
              </p>
              <p className="price">₱{product.price?.toFixed(2) || 'N/A'}</p>
            </div>
          ))}
        </div>
        <Link to={`/${slug}`} className="view-all">
          View All
        </Link>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="app">
      <Navbar />

      {showDisclaimer && (
        <div className="disclaimer-overlay">
          <div className="disclaimer-box">
            <img src="/assets/logo.png" alt="Logo" className="disclaimer-logo" />
            <h6 className="disclaimer-header">Welcome!</h6>
            {user ? (
              <>
                <p className="disclaimer-text">
                  Hello <strong>{user.firstName} {user.lastName}</strong> (
                  {user.email}) 👋
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

      {/* ✅ Carousel Section */}
      <div className="carousel">
        {banners.length > 0 ? (
          <img
            src={banners[current]}
            alt={`Banner ${current + 1}`}
            className="banner-image"
          />
        ) : (
          <img
            src="/assets/default-banner.png"
            alt="Default Banner"
            className="banner-image"
          />
        )}
      </div>

      {Object.entries(productData).map(([slug, products]) =>
        renderProductSection(slug, products)
      )}
    </div>
  );
};

export default Homepage;
