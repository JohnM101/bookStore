// src/pages/MangaCategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './categories.css';

const RENDER_URL = process.env.REACT_APP_RENDER_URL;

const MangaCategoryPage = ({ baseCategory, heading }) => {
  const navigate = useNavigate();
  const { subcategory } = useParams(); // e.g., "adventure" or undefined
  const [productsData, setProductsData] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');

  // Normalize strings for comparison
  const normalize = (str) => str?.toLowerCase().replace(/\s+/g, '-').trim();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || RENDER_URL;

        // Try fetching with token if available, else fetch public
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token || '';

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${API_URL}/api/admin/products`, { headers });

        if (!response.ok) throw new Error('Failed to fetch products');

        const allProducts = await response.json();
        console.log("All products fetched:", allProducts);

        // Filter products by category & optional subcategory
        const filteredProducts = allProducts.filter((product) => {
          const productCat = normalize(product.category);
          const productSub = normalize(product.subcategory);
          const baseCat = normalize(baseCategory);
          const subCat = normalize(subcategory);

          if (subCat) {
            return productCat === baseCat && productSub === subCat;
          } else {
            return productCat === baseCat;
          }
        });

        console.log("Filtered products:", filteredProducts);
        setProductsData(filteredProducts);

        // Build subcategory list dynamically
        const allSubcats = allProducts
          .filter((product) => normalize(product.category) === normalize(baseCategory))
          .map((product) => product.subcategory)
          .filter(Boolean);

        setSubcategories([...new Set(allSubcats)]);

      } catch (err) {
        console.error(`Failed to fetch products for ${baseCategory}:`, err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [baseCategory, subcategory]);

  const handleSortChange = (e) => setSortOption(e.target.value);

  const getSortedProducts = () => {
    switch (sortOption) {
      case 'price-low-to-high':
        return [...productsData].sort((a, b) => a.price - b.price);
      case 'price-high-to-low':
        return [...productsData].sort((a, b) => b.price - a.price);
      default:
        return productsData;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="app">
      <div className="product-section">
        <h2 className="section-heading">
          {heading}
          {subcategory ? ` – ${subcategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}` : ''}
        </h2>

        {/* Subcategory navigation */}
        <div className="subcategory-nav">
          <Link to={`/${baseCategory}`} className={!subcategory ? 'active-subcat' : ''}>
            All
          </Link>
          {subcategories.map((sc) => (
            <Link
              key={sc}
              to={`/${baseCategory}/${normalize(sc)}`}
              className={normalize(subcategory) === normalize(sc) ? 'active-subcat' : ''}
            >
              {sc}
            </Link>
          ))}
        </div>

        {/* Sorting controls */}
        <div className="sorting-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select id="sort-select" value={sortOption} onChange={handleSortChange}>
            <option value="default">Default</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
          </select>
        </div>

        {/* Product grid */}
        <div className="product-grid">
          {getSortedProducts().length > 0 ? (
            getSortedProducts().map((product) => (
              <div
                key={product._id || product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product._id || product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => { e.target.onerror = null; e.target.src = '/assets/placeholder-image.png'; }}
                />
                <h3>{product.name}</h3>
                <p className="price">₱{product.price?.toFixed(2) || 'N/A'}</p>
              </div>
            ))
          ) : (
            <p className="no-products">No products available at the moment.</p>
          )}
        </div>
        <hr className="bottom-line" />
      </div>
      <div style={{ height: '200px' }}></div>
    </div>
  );
};

export default MangaCategoryPage;
