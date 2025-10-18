// src/components/admin/BannerManagement.jsx
// src/components/admin/BannerManagement.jsx
import React, { useEffect, useState } from 'react';
import '../AdminDashboard.css';

const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://bookstore-0hqj.onrender.com';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: '', imageUrl: '', order: 0 });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all banners
  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cms/banners`);
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      console.error('Error fetching banners:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 🔹 Handle input change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 🔹 Create or update banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `${API_URL}/api/cms/banners/${editId}`
      : `${API_URL}/api/cms/banners`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to save banner');
      await res.json();

      setForm({ title: '', imageUrl: '', order: 0 });
      setEditId(null);
      fetchBanners();
    } catch (err) {
      console.error('Error saving banner:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit a banner
  const handleEdit = (banner) => {
    setEditId(banner._id);
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      order: banner.order,
    });
  };

  // 🔹 Delete a banner
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await fetch(`${API_URL}/api/cms/banners/${id}`, { method: 'DELETE' });
      fetchBanners();
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  // 🔹 Toggle Active/Inactive
  const toggleActive = async (id, isActive) => {
    try {
      await fetch(`${API_URL}/api/cms/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchBanners();
    } catch (err) {
      console.error('Error toggling banner state:', err);
    }
  };

  return (
    <div className="admin-section">
      <h2>Banner Management</h2>

      {/* === FORM === */}
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Banner Title"
          required
        />
        <input
          type="text"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          required
        />
        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
          placeholder="Display Order"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : editId ? 'Update Banner' : 'Add Banner'}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setForm({ title: '', imageUrl: '', order: 0 });
              setEditId(null);
            }}
            className="cancel-btn"
          >
            Cancel
          </button>
        )}
      </form>

      {/* === BANNER LIST === */}
      <div className="admin-list">
        {banners.length === 0 ? (
          <p>No banners found.</p>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="admin-item">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="banner-thumb"
              />
              <div className="banner-info">
                <h4>{banner.title}</h4>
                <p>Order: {banner.order}</p>
                <p>Status: {banner.isActive ? 'Active ✅' : 'Inactive ❌'}</p>
              </div>
              <div className="banner-actions">
                <button onClick={() => handleEdit(banner)}>Edit</button>
                <button onClick={() => toggleActive(banner._id, banner.isActive)}>
                  {banner.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(banner._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BannerManagement;
