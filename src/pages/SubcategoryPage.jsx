// src/pages/SubcategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import './categories.css';

const SubcategoryPage = () => {
  const navigate = useNavigate();
  const { categorySlug, subcategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Find category and subcategory objects
  const category = CATEGORIES.find(c => c.slug === categorySlug);
  const subcategory = category?.subcategories.find(sc => sc.slug === subcategorySlug);

  // Display titles
  const categoryTitle = category?.name || '';
  const subcategoryTitle = subcategory?.name || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

        // Get user token from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token || null;

        const response = await fetch(`${API_URL}/api/admin/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch products');

        const allProducts = await response.json();

        // Filter products by categorySlug and subcategorySlug
        const filteredProducts = allProducts.filter(
          product => product.category === categorySlug && product.subcategory === subcategorySlug
        );

        setProducts(filteredProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    if (category && subcategory) {
      fetchProducts();
    } else {
      setLoading(false);
      setError('Category or subcategory not found.');
    }
  }, [categorySlug, subcategorySlug, category, subcategory]);

  if (!category || !subcategory) {
    return <div className="error-message">Category or Subcategory Not Found</div>;
  }

  return (
    <div className="app">
      <div className="product-section">
        <h2 className="section-heading">{categoryTitle}: {subcategoryTitle}</h2>

        {loading && <p className="loading">Loading products...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="product-grid">
          {!loading && products.length > 0 ? (
            products.map(product => (
              <div
                key={product._id || product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product._id || product.id}`)}
              >
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.name || 'Product image'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/placeholder-image.png';
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">
                    ₱{product.price?.toFixed(2) || 'Price unavailable'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="no-products">No products found in this subcategory.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryPage;
