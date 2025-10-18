//src/components/admin/ProductManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import '../AdminDashboard.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

const ProductManagement = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const albumInputRef = useRef(null);

  const [formData, setFormData] = useState({
    image: null,
    albumImages: [],
    existingAlbumImages: [],
    removedAlbumImages: [],
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error('❌ Fetch products failed:', err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('❌ Fetch categories failed:', err);
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
    const updatedData = { ...formData };

    if (name === 'image' && files.length > 0) {
      updatedData.image = files[0];
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      updatedData[name] = value;
    }

    // Auto slug generation
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

  const handleAddAlbumImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData({
      ...formData,
      albumImages: [...formData.albumImages, ...newPreviews]
    });

    if (albumInputRef.current) albumInputRef.current.value = '';
  };

  const handleRemoveNewAlbumImage = (index) => {
    const updated = [...formData.albumImages];
    updated.splice(index, 1);
    setFormData({ ...formData, albumImages: updated });
  };

  const handleRemoveExistingAlbumImage = (index) => {
    const removed = formData.existingAlbumImages[index];
    const updatedExisting = formData.existingAlbumImages.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      existingAlbumImages: updatedExisting,
      removedAlbumImages: [...(formData.removedAlbumImages || []), removed]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isEditing
        ? `${API_URL}/api/admin/products/${currentProduct._id}`
        : `${API_URL}/api/admin/products`;
      const method = isEditing ? 'PUT' : 'POST';
      const data = new FormData();

      if (formData.image instanceof File) data.append('image', formData.image);

      formData.albumImages.forEach(imgObj => {
        if (imgObj.file instanceof File) data.append('albumImages', imgObj.file);
      });

      data.append('existingAlbumImages', JSON.stringify(formData.existingAlbumImages));
      data.append('removedAlbumImages', JSON.stringify(formData.removedAlbumImages || []));

      Object.keys(formData).forEach((key) => {
        if (['image', 'albumImages', 'existingAlbumImages', 'removedAlbumImages'].includes(key)) return;
        data.append(key, formData[key]);
      });

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${user.token}` },
        body: data,
      });

      if (!res.ok) throw new Error('Failed to save product');
      await fetchProducts();
      resetForm();
    } catch (err) {
      console.error('❌ Save failed:', err);
    }
  };

  const handleEdit = (p) => {
    setCurrentProduct(p);
    setFormData({
      image: p.image,
      albumImages: [],
      existingAlbumImages: p.albumImages || [],
      removedAlbumImages: [],
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
    setShowOptional(true);
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
      console.error('❌ Delete failed:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      image: null,
      albumImages: [],
      existingAlbumImages: [],
      removedAlbumImages: [],
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
    setImagePreview(null);
    setIsEditing(false);
    setShowOptional(false);
    setCurrentProduct(null);
    setIsSlugEdited(false);
  };

  const selectedCategory = categories.find((c) => c.slug === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="product-form-container">
        <div className="form-header">
          <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          {/* ✅ NEW BUTTON */}
          <button
            type="button"
            className="btn-category-nav"
            onClick={() => navigate('/admin/categories')}
          >
            + Add New Category
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {/* === Main Image === */}
          <div className="form-group">
            <label>Main Image *</label>
            <input type="file" name="image" accept="image/*" onChange={handleInputChange} required={!isEditing} />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          {/* === Basic Info === */}
          <div className="form-group">
            <label>Product Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} required />
          </div>

          {/* === Category Dropdown === */}
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleInputChange} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* === Subcategory Dropdown === */}
          <div className="form-group">
            <label>Subcategory *</label>
            <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} required>
              <option value="">Select subcategory</option>
              {subcategories.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* === Pricing & Stock === */}
          <div className="form-group">
            <label>Price (₱)*</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} required />
          </div>

          {/* === Optional Fields Toggle === */}
          <div className="form-group" style={{ gridColumn: 'span 2', textAlign: 'center' }}>
            <button type="button" onClick={() => setShowOptional(!showOptional)} className="btn-submit">
              {showOptional ? 'Hide Optional Fields' : 'Show Optional Fields'}
            </button>
          </div>

          {/* === Optional Fields === */}
          {showOptional && (
            <>
              <div className="form-group">
                <label>Series Title</label>
                <input type="text" name="seriesTitle" value={formData.seriesTitle} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Volume</label>
                <input type="number" name="volumeNumber" value={formData.volumeNumber} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input type="text" name="publisher" value={formData.publisher} onChange={handleInputChange} />
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

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="Auto-generated from title"
                />
              </div>

              {/* === Album Images === */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Album Images</label>

                <div className="album-preview">
                  {formData.existingAlbumImages.map((src, i) => (
                    <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={src} alt={`album-${i}`} style={{ width: 80, height: 80, borderRadius: 8, margin: 5 }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingAlbumImage(i)}
                        style={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {formData.albumImages.map((img, i) => (
                    <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={img.preview} alt={`new-${i}`} style={{ width: 80, height: 80, borderRadius: 8, margin: 5 }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewAlbumImage(i)}
                        style={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => albumInputRef.current.click()}
                  className="btn-submit"
                  style={{ marginTop: '10px' }}
                >
                  Add Photo
                </button>

                <input
                  type="file"
                  name="albumImages"
                  accept="image/*"
                  multiple
                  ref={albumInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAddAlbumImages}
                />
              </div>
            </>
          )}

          {/* === Submit === */}
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

      {/* === Product List === */}
      <div className="products-list-container">
        <h2>Product List</h2>
        {products.length === 0 ? (
          <div className="no-products">No products found.</div>
        ) : (
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
                {products.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.image} alt={p.name} className="product-thumbnail" /></td>
                    <td>{p.name}{p.volumeNumber ? ` Vol. ${p.volumeNumber}` : ''}</td>
                    <td>{p.category}</td>
                    <td>₱{p.price.toFixed(2)}</td>
                    <td>{p.countInStock}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
