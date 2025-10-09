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
  const [showMore, setShowMore] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', subcategory: '',
    countInStock: '', image: null, images: [], subtitle: '', author: '',
    publisher: '', isbn: '', language: '', pages: '', format: '', edition: '',
    sku: '', supplier: '', reorderLevel: '', discountPrice: '', discountStart: '',
    discountEnd: '', publishedDate: '', slug: '', metaTitle: '', metaDescription: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);

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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      setFormData({ ...formData, image: files[0] });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else if (name === 'images' && files.length > 0) {
      setFormData({ ...formData, images: files });
      const previews = Array.from(files).map((f) => URL.createObjectURL(f));
      setGalleryPreview(previews);
    } else setFormData({ ...formData, [name]: value });
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
        if (key === 'images' && formData[key].length > 0) {
          Array.from(formData[key]).forEach((file) => data.append('images', file));
        } else if (key === 'image' && formData[key] instanceof File) {
          data.append('image', formData[key]);
        } else {
          data.append(key, formData[key]);
        }
      }
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${user.token}` },
        body: data,
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
    setFormData({ ...p, image: p.image, images: p.images || [] });
    setImagePreview(p.image);
    setGalleryPreview(p.images || []);
    setIsEditing(true);
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
      name: '', description: '', price: '', category: '', subcategory: '',
      countInStock: '', image: null, images: [], subtitle: '', author: '',
      publisher: '', isbn: '', language: '', pages: '', format: '', edition: '',
      sku: '', supplier: '', reorderLevel: '', discountPrice: '', discountStart: '',
      discountEnd: '', publishedDate: '', slug: '', metaTitle: '', metaDescription: ''
    });
    setImagePreview(null);
    setGalleryPreview([]);
    setIsEditing(false);
    setCurrentProduct(null);
    setShowMore(false);
  };

  const selectedCategory = CATEGORIES.find((c) => c.slug === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="product-form-container">
        <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="product-form">

          {/* ==== Required Fields ==== */}
          <div className="form-group">
            <label>Main Image *</label>
            <input type="file" name="image" accept="image/*" onChange={handleInputChange} required={!isEditing} />
            {imagePreview && <div className="image-preview"><img src={imagePreview} alt="preview" /></div>}
          </div>

          <div className="form-group">
            <label>Product Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter product name" required />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter product description" required />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleInputChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Subcategory *</label>
            <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} required>
              <option value="">Select subcategory</option>
              {subcategories.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
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

          {/* ==== Optional Fields Toggle ==== */}
          <div className="form-group" style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {showMore ? 'Hide Optional Details' : 'Add Optional Details'}
            </button>
          </div>

          {/* ==== Optional Fields ==== */}
          {showMore && (
            <>
              <div className="form-group">
                <label>Subtitle</label>
                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Author</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Publisher</label>
                <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>ISBN</label>
                <input type="text" name="isbn" value={formData.isbn} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Additional Images</label>
                <input type="file" name="images" accept="image/*" multiple onChange={handleInputChange} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                  {galleryPreview.map((img, i) => (
                    <img key={i} src={img} alt="Gallery" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ==== Buttons ==== */}
          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
            {isEditing && (
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ==== Product List ==== */}
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
              {products.length === 0 ? (
                <tr><td colSpan="6" className="no-products">No products available</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.image} alt={p.name} className="product-thumbnail" /></td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>₱{p.price}</td>
                    <td>{p.countInStock}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
