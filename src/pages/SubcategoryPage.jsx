import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './categories.css';

const SubcategoryPage = () => {
    const navigate = useNavigate();
    const { category, subcategory } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    let categoryTitle = '';
    let subcategoryTitle = '';
    
    // Set category title based on URL parameter
    switch (category) {
        case 'desktop':
            categoryTitle = 'DESKTOP';
            break;
        case 'figurines':
            categoryTitle = 'FIGURINES';
            break;
        case 'plushies':
            categoryTitle = 'PLUSHIES';
            break;
        case 'clothing':
            categoryTitle = 'CLOTHING';
            break;
        case 'varieties':
            categoryTitle = 'VARIETIES';
            break;
        default:
            categoryTitle = '';
    }
    
    // Format subcategory title (convert from kebab-case to title case)
    subcategoryTitle = subcategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Starting to fetch products...');
                //const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://animeyoubackend.onrender.com';
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com'
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
                
                const allProducts = await response.json();
                console.log('All products from API:', allProducts);
                console.log('Number of products received:', allProducts.length);
                
                // Filter products by category and subcategory
                const filteredProducts = allProducts.filter(product => 
                    product.category === category && 
                    product.subcategory === subcategory
                );
                
                console.log(`Filtered products for ${category}/${subcategory}:`, filteredProducts);
                console.log('Number of filtered products:', filteredProducts.length);
                
                setProducts(filteredProducts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again later.');
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [category, subcategory]);

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
                                    <p className="product-price">₱{product.price?.toFixed(2) || 'Price unavailable'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && !window.location.pathname.includes('/admin') && <p className="no-products">No products found in this subcategory.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubcategoryPage;
