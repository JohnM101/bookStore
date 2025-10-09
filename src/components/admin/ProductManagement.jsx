//ProductManagement.jsx

import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { CATEGORIES } from '../../data/categories';
import '../AdminDashboard.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

const ProductManagement = () => {
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const [formData, setFormData] = useState({
    image: null,
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    countInStock: '',
    seriesTitle: '',
    volumeNumber: '',
    publisher: '',
    format: '',
    slug: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const generateSlug = (name, volume) => {
    if (!name) return '';
    let base = name.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
    if (volume) base += `-vol-${volume}`;
    return base;
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    let updatedData = { ...formData };

    if (name === 'image' && files.length > 0) {
      updatedData.image = files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      updatedData[name] = value;
    }

    // Auto-generate slug
    if ((name === 'name' || name === 'volumeNumber') && !isSlugEdited) {
      updatedData.slug = generateSlug(
        name === 'name' ? value : formData.name,
        name === 'volumeNumber' ? value : formData.volumeNumber
      );
    }

    // Manual slug edit
    if (name === 'slug') {
      setIsSlugEdited(true);
      if (!value) {
        updatedData.slug = generateSlug(formData.name, formData.volumeNumber);
        setIsSlugEdited(false);
      }
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `${API_URL}/api/admin/products/${currentProduct._id}`
        : `${API_URL}/api/admin/products`;
      const method = isEditing ? 'PUT' : 'POST';
      const data = new FormData();
      for (const key in formData) {
        if (key === 'image' && formData[key] instanceof File) data.append('image', formData[key]);
        else data.append(key, formData[key]);
      }
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${user.token}` },
        body: data
      });
      if (!res.ok) throw new Error('Failed to save');
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (p) => {
    setCurrentProduct(p);
    setFormData({
      image: p.image,
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      countInStock: p.countInStock,
      seriesTitle: p.seriesTitle || '',
      volumeNumber: p.volumeNumber || '',
      publisher: p.publisher || '',
      format: p.format || '',
      slug: p.slug || ''
    });
    setImagePreview(p.image);
    setIsEditing(true);
    setIsSlugEdited(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      image: null,
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price: '',
      countInStock: '',
      seriesTitle: '',
      volumeNumber: '',
      publisher: '',
      format: '',
      slug: ''
    });
    setIsSlugEdited(false);
    setImagePreview(null);
    setCurrentProduct(null);
    setIsEditing(false);
    setShowOptional(false);
  };

  const selectedCategory = CATEGORIES.find((c) => c.slug === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="product-form-container">
        <h2>{isEditing ? 'Edit Manga' : 'Add New Manga'}</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Main Image *</label>
            <input type="file" name="image" accept="image/*" onChange={handleInputChange} required={!isEditing} />
            {imagePreview && <div className="image-preview"><img src={imagePreview} alt="preview" /></div>}
          </div>
          <div className="form-group">
            <label>Product Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="One Piece" />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Product Description *</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} required placeholder="Short synopsis of manga..." />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleInputChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Subcategory *</label>
            <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} required>
              <option value="">Select subcategory</option>
              {subcategories.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Price (₱) *</label>
            <input type="number" name="price" step="0.01" value={formData.price} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Stock *</label>
            <input type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} required />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '10px' }}>
            <button type="button" onClick={() => setShowOptional(!showOptional)} style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
              {showOptional ? 'Hide Optional Fields' : 'Add Optional Fields'}
            </button>
          </div>
          {showOptional && (
            <>
              <div className="form-group">
                <label>Series Title</label>
                <input type="text" name="seriesTitle" value={formData.seriesTitle} onChange={handleInputChange} placeholder="One Piece" />
              </div>
              <div className="form-group">
                <label>Volume Number</label>
                <input type="number" name="volumeNumber" value={formData.volumeNumber} onChange={handleInputChange} placeholder="1" />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} placeholder="Shueisha" />
              </div>
              <div className="form-group">
                <label>Format</label>
                <select name="format" value={formData.format} onChange={handleInputChange}>
                  <option value="">Select format</option>
                  <option value="Tankōbon">Tankōbon</option>
                  <option value="Omnibus">Omnibus</option>
                  <option value="Digital">Digital</option>
                </select>
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="Auto-generated from title" />
              </div>
            </>
          )}
          <div className="form-buttons">
            <button type="submit" className="btn-submit">{isEditing ? 'Update Manga' : 'Add Manga'}</button>
            {isEditing && <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="products-list-container">
        <h2>Product List</h2>
        <div className="products-list">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td><img src={p.image} alt={p.name} className="thumbnail" /></td>
                  <td>{p.name}{p.volumeNumber ? ` Vol. ${p.volumeNumber}` : ''}</td>
                  <td>{p.category}</td>
                  <td>₱{p.price.toFixed(2)}</td>
                  <td>{p.countInStock}</td>
                  <td>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
