import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './categories.css';

const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, '-').trim();

const MangaCategoryPage = ({ baseCategory, heading }) => {
  const navigate = useNavigate();
  const { subcategory } = useParams();
  const [productsData, setProductsData] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bookstore-0hqj.onrender.com";

        // Fetch from public products route
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const allProducts = await res.json();

        const baseCatNorm = normalizeSlug(baseCategory);
        const subCatNorm = normalizeSlug(subcategory);

        const filteredProducts = allProducts.filter((product) => {
          const productCat = normalizeSlug(product.category);
          const productSub = normalizeSlug(product.subcategory);
          return subCatNorm
            ? productCat === baseCatNorm && productSub === subCatNorm
            : productCat === baseCatNorm;
        });

        setProductsData(filteredProducts);

        const uniqueSubcats = [
          ...new Set(
            allProducts
              .filter(p => normalizeSlug(p.category) === baseCatNorm)
              .map(p => p.subcategory)
              .filter(Boolean)
          )
        ];
        setSubcategories(uniqueSubcats);

      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [baseCategory, subcategory]);

  const handleSortChange = (e) => setSortOption(e.target.value);
  const getSortedProducts = () => {
    switch (sortOption) {
      case 'price-low-to-high': return [...productsData].sort((a, b) => a.price - b.price);
      case 'price-high-to-low': return [...productsData].sort((a, b) => b.price - a.price);
      default: return productsData;
    }
  };

  const CATEGORY_COLORS = {
    'kids-manga': { bg: '#fce4ec', text: '#c2185b' },
    'young-boys-manga': { bg: '#e3f2fd', text: '#1976d2' },
    'young-girls-manga': { bg: '#fff3e0', text: '#ef6c00' },
  };

  const renderProductSection = (slug, products) => {
    if (!products || products.length === 0) return <p className="no-products">No products found.</p>;
    const bgColor = CATEGORY_COLORS[slug]?.bg || '#ccc';
    const textColor = CATEGORY_COLORS[slug]?.text || '#fff';

    return (
      <div className={`product-section ${slug}-section`} style={{ '--section-color': bgColor, '--section-text-color': textColor }}>
        <div className="product-grid">
          {products.map(product => (
            <div
              className="product-card"
              key={product._id || product.id}
              onClick={() => navigate(`/product/${product.slug || product.parentId || product._id}`)}
            >
              <img src={product.image} alt={product.name} onError={(e) => { e.target.onerror = null; e.target.src = '/assets/placeholder-image.png'; }} />
              <p className="product-name">{product.name}</p>
              <p className="product-subtitle">{product.description?.substring(0, 30)}...</p>
              <p className="price">₱{product.price?.toFixed(2) || 'N/A'}</p>
            </div>

          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="app">
      <h2 className="section-heading">
        {heading} {subcategory ? `– ${subcategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}` : ''}
      </h2>

      <div className="subcategory-nav">
        <Link to={`/${baseCategory}`} className={!subcategory ? 'active-subcat' : ''}>All</Link>
        {subcategories.map(sc => (
          <Link
            key={sc}
            to={`/${baseCategory}/${normalizeSlug(sc)}`}
            className={normalizeSlug(subcategory) === normalizeSlug(sc) ? 'active-subcat' : ''}
          >
            {sc}
          </Link>
        ))}
      </div>

      <div className="sorting-controls">
        <label htmlFor="sort-select">Sort by:</label>
        <select id="sort-select" value={sortOption} onChange={handleSortChange}>
          <option value="default">Default</option>
          <option value="price-low-to-high">Price: Low to High</option>
          <option value="price-high-to-low">Price: High to Low</option>
        </select>
      </div>

      {renderProductSection(baseCategory, getSortedProducts())}

      <hr className="bottom-line" />
    </div>
  );
};

export default MangaCategoryPage;
