// src/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import UserManagement from './admin/UserManagement';
import OrderManagement from './admin/OrderManagement';
import { FaSignOutAlt } from 'react-icons/fa';
import { CATEGORIES } from '../data/categories';
import './AdminDashboard.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

const convertToUrlFormat = (subcategoryName) => {
  // Lowercase and remove non-alphanumeric characters for URL
  return subcategoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    image: null,
    countInStock: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setTableKey(prev => prev + 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image' && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (name === 'category') {
      setFormData({ ...formData, category: value, subcategory: '' });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'price' || name === 'countInStock' ? parseFloat(value) : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `${API_URL}/api/admin/products/${currentProduct._id}`
        : `${API_URL}/api/admin/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('description', formData.description);
      productData.append('price', formData.price);
      productData.append('category', formData.category);
      productData.append('subcategory', formData.subcategory);
      productData.append('countInStock', formData.countInStock);

      if (formData.image instanceof File) {
        productData.append('image', formData.image);
      } else if (isEditing && currentProduct.image) {
        productData.append('imageUrl', currentProduct.image);
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${user.token}` },
        body: productData
      });

      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} product`);
      resetForm();
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory || '',
      image: product.image,
      countInStock: product.countInStock || 0
    });
    setImagePreview(product.image);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      image: null,
      countInStock: ''
    });
    setImagePreview(null);
    setCurrentProduct(null);
    setIsEditing(false);
  };

  if (loading) return <div className="loading">Loading...</div>;

  const selectedCategory = CATEGORIES.find(c => c.slug === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <div className="admin-container">
      <div className="product-form-container">
        <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input type="number" id="price" name="price" step="0.01" value={formData.price} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subcategory">Subcategory</label>
            <select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory || ''}
              onChange={handleInputChange}
              required
              disabled={!formData.category}
            >
              <option value="" disabled>Select a subcategory</option>
              {subcategories.map(sub => (
                <option key={sub.slug} value={sub.slug}>{sub.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image</label>
            <input type="file" id="image" name="image" accept="image/*" onChange={handleInputChange} required={!isEditing} />
            {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Preview" /></div>}
          </div>

          <div className="form-group">
            <label htmlFor="countInStock">Count In Stock</label>
            <input type="number" id="countInStock" name="countInStock" value={formData.countInStock} onChange={handleInputChange} />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">{isEditing ? 'Update Product' : 'Add Product'}</button>
            {isEditing && <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="products-list-container">
        <h2>Product List</h2>
        <div className="products-list">
          <table key={tableKey}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(product => (
                  <tr key={product._id}>
                    <td><img src={product.image} alt={product.name} className="product-thumbnail" /></td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.subcategory}</td>
                    <td>₱{product.price.toFixed(2)}</td>
                    <td>{product.countInStock}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(product._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="no-products">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { isAdmin, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) navigate('/');
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAdmin()) return <div>Access Denied</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Dashboard</h2>
        <nav>
          <ul>
            <li><Link to="/admin/products">Products</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/orders">Orders</Link></li>
          </ul>
        </nav>
        <div className="admin-logout">
          <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> Logout</button>
        </div>
      </div>

      <div className="admin-content">
        <Routes>
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/" element={<div>Welcome to Admin Dashboard</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
