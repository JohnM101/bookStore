import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './homepage.css';

const Homepage = () => {
  const banners = ['/assets/Banner 2.png', '/assets/Banner 3.png', '/assets/Banner 4.png', '/assets/Banner 5.png'];
  const [current, setCurrent] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Starting to fetch products...');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
        
        // Get user and token from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.token : null;
        
        // Include the token in your request headers
        const response = await fetch(`${API_URL}/api/admin/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        console.log('Products from API:', products);
        console.log('Number of products received:', products.length);
        
        // Organize products by category
        const categorizedProducts = products.reduce((acc, product) => {
          const category = product.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(product);
          return acc;
        }, {});
        
        console.log('Categorized products:', categorizedProducts);
        console.log('Categories found:', Object.keys(categorizedProducts));
        
        setProductData(categorizedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (showDisclaimer) {
    return (
      <div className="disclaimer-overlay">
        <div className="disclaimer-box">
          <img src="/assets/logo.png" alt="Logo" className="disclaimer-logo" />
          <h6 className="disclaimer-header">Disclaimer!</h6>
          <p className="disclaimer-text">This is for educational purposes only.</p>
          <button className="disclaimer-button" onClick={() => setShowDisclaimer(false)}>Proceed</button>
        </div>
      </div>
    );
  }

  //Loading Indicator
  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  const renderProductSection = (title, products) => {
    if (!products || products.length === 0) return null;
    
    return (
      <div className={`product-section ${title.toLowerCase()}-section`}>
        <h2>{title.toUpperCase()} ──────────────────────────────────</h2>
        <div className="product-list">
          {products.slice(0, 4).map((product, index) => (
            <div 
              className="product-card" 
              key={product._id} // Use MongoDB _id
              onClick={() => navigate(`/product/${product._id}`)} // Use MongoDB _id
            >
              <img src={product.image} alt={product.name} />
              <p className="product-name">{product.name}</p>
              <p className="product-subtitle">{product.description.substring(0, 30)}...</p>
              <p className="price">₱{product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <Link to={`/${title.toLowerCase()}`} className="view-all">View All</Link>
      </div>
    );
  };  
  

  return (
    <div className="app">      

      {/* Carousel */}
      <div className="carousel">
        <img src={banners[current]} alt={`Banner ${current + 1}`} />
      </div>

      {Object.entries(productData).map(([title, products]) => renderProductSection(title, products))}
    </div>
  );
};

export default Homepage;
