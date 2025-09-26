// src/pages/MangaCategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './categories.css';

const RENDER_URL = process.env.REACT_APP_RENDER_URL;

const MangaCategoryPage = ({ baseCategory, heading }) => {
  const navigate = useNavigate();
  const { subcategory } = useParams(); // e.g. "adventure" or undefined
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || RENDER_URL;

        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.token : null;

        const response = await fetch(`${API_URL}/api/admin/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch products');

        const allProducts = await response.json();

        // ✅ Filter products by baseCategory + subcategory
        const filteredProducts = allProducts.filter((product) => {
          if (subcategory) {
            return (
              product.category === baseCategory &&
              product.subcategory === subcategory
            );
          } else {
            return product.category === baseCategory;
          }
        });

        setProductsData(filteredProducts);

        // ✅ Build subcategory list from products
        const allSubcats = allProducts
          .filter((product) => product.category === baseCategory)
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

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

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
          {subcategory ? ` – ${subcategory.toUpperCase()}` : ''}
        </h2>

        {/* ✅ Subcategory navigation */}
        <div className="subcategory-nav">
          <Link
            to={`/${baseCategory}`}
            className={!subcategory ? 'active-subcat' : ''}
          >
            All
          </Link>
          {subcategories.map((sc) => (
            <Link
              key={sc}
              to={`/${baseCategory}/${sc}`}
              className={subcategory === sc ? 'active-subcat' : ''}
            >
              {sc.charAt(0).toUpperCase() + sc.slice(1)}
            </Link>
          ))}
        </div>

        <div className="sorting-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="default">Default</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
          </select>
        </div>

        <div className="product-grid">
          {getSortedProducts().length > 0 ? (
            getSortedProducts().map((product) => (
              <div
                key={product._id || product.id}
                className="product-card"
                onClick={() =>
                  navigate(`/product/${product._id || product.id}`)
                }
              >
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p className="price">₱{product.price.toFixed(2)}</p>
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
