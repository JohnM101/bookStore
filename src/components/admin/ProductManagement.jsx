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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [tableKey, setTableKey] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    author: '',
    publisher: '',
    isbn: '',
    publishedDate: '',
    language: '',
    price: '',
    discountPrice: '',
    countInStock: '',
    sku: '',
    category: '',
    subcategory: '',
    image: null,
    images: [],
    slug: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setProducts(data);
      setTableKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
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
      const previews = Array.from(files).map((file) => URL.createObjectURL(file));
      setGalleryPreview(previews);
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

      if (!res.ok) throw new Error('Failed to save product');
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      ...formData,
      ...product,
      image: product.image,
      images: product.images || [],
    });
    setImagePreview(product.image);
    setGalleryPreview(product.images || []);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      author: '',
      publisher: '',
      isbn: '',
      publishedDate: '',
      language: '',
      price: '',
      discountPrice: '',
      countInStock: '',
      sku: '',
      category: '',
      subcategory: '',
      image: null,
      images: [],
      slug: '',
      metaTitle: '',
      metaDescription: ''
    });
    setImagePreview(null);
    setGalleryPreview([]);
    setCurrentProduct(null);
    setIsEditing(false);
  };

  const selectedCategory = CATEGORIES.find((c) => c.slug === formData.category);
  const subcategories = selectedCategory?.subcategories || [];

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="product-form-container">
        <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
        <form className="product-form" onSubmit={handleSubmit}>
          {/* --- Book Info --- */}
          <h3 className="section-title">📘 Book Info</h3>
          <div className="form-group">
            <label>Book Title *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Author *</label>
            <input type="text" name="author" value={formData.author} onChange={handleInputChange} required />
          </div>
          <div className="form-group full-width">
            <label>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} required />
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
            <label>Published Date</label>
            <input type="date" name="publishedDate" value={formData.publishedDate?.slice(0, 10)} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Language</label>
            <input type="text" name="language" value={formData.language} onChange={handleInputChange} />
          </div>

          {/* --- Pricing --- */}
          <h3 className="section-title">💰 Pricing</h3>
          <div className="form-group">
            <label>Regular Price *</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Discount Price</label>
            <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} />
          </div>

          {/* --- Inventory --- */}
          <h3 className="section-title">📦 Inventory</h3>
          <div className="form-group">
            <label>Count in Stock *</label>
            <input type="number" name="countInStock" value={formData.countInStock} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} />
          </div>

          {/* --- Categorization --- */}
          <h3 className="section-title">🏷️ Categorization</h3>
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleInputChange} required>
              <option value="">Select Category</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Subcategory *</label>
            <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} required>
              <option value="">Select Subcategory</option>
              {subcategories.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* --- Media --- */}
          <h3 className="section-title">🖼️ Media</h3>
          <div className="form-group">
            <label>Main Product Image *</label>
            <input type="file" name="image" accept="image/*" onChange={handleInputChange} required={!isEditing} />
            {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Preview" /></div>}
          </div>
          <div className="form-group">
            <label>Additional Images</label>
            <input type="file" name="images" accept="image/*" multiple onChange={handleInputChange} />
            <div className="gallery-preview">
              {galleryPreview.map((img, i) => (
                <img key={i} src={img} alt="Preview" className="gallery-thumb" />
              ))}
            </div>
          </div>

          {/* --- Advanced SEO Toggle --- */}
          <button
            type="button"
            className="btn-toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced Fields ▲' : 'Show Advanced Fields ▼'}
          </button>

          {showAdvanced && (
            <>
              <h3 className="section-title">🔍 SEO</h3>
              <div className="form-group">
                <label>Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Meta Title</label>
                <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label>Meta Description</label>
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} />
              </div>
            </>
          )}

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

      {/* --- Product List --- */}
      <div className="products-list-container">
        <h2>📚 Products</h2>
        <div className="products-list">
          <table key={tableKey}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Author</th>
                <th>Price</th>
                <th>Stock</th>
                <th>SKU</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-products">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img src={p.image} alt={p.name} className="product-thumbnail" />
                    </td>
                    <td>{p.name}</td>
                    <td>{p.author}</td>
                    <td>₱{p.price}</td>
                    <td>{p.countInStock}</td>
                    <td>{p.sku}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => handleEdit(p)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(p._id)}>
                        Delete
                      </button>
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
