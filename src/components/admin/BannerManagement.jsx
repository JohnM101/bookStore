// src/components/admin/BannerManagement.jsx
// ============================================================
// ✅ BannerManagement.jsx (Fixed with Token Header + Admin Auth)
// ============================================================
import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../../contexts/UserContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import "../AdminDashboard.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bookstore-0hqj.onrender.com";

const BannerManagement = () => {
  const { user } = useUser();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    image: null,
    title: "",
    link: "",
    isActive: true,
  });

  // ============================================================
  // 🔹 Fetch banners (admin protected)
  // ============================================================
  const fetchBanners = async () => {
    try {
      if (!user?.token) {
        console.warn("⚠️ Token not ready, skipping banner fetch...");
        return;
      }
      setLoading(true);
      const res = await fetchWithAuth(
        `${API_URL}/api/cms/banners`,
        {},
        user.token
      );

      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      console.error("❌ Error fetching banners:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔹 Lifecycle: load once token is ready
  // ============================================================
  useEffect(() => {
    if (user?.token) {
      fetchBanners();
    }
  }, [user]);

  // ============================================================
  // 🔹 Handle form input changes
  // ============================================================
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file" && files?.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ============================================================
  // 🔹 Submit (create or update)
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isEditing
        ? `${API_URL}/api/cms/banners/${currentBanner._id}`
        : `${API_URL}/api/cms/banners`;
      const method = isEditing ? "PUT" : "POST";
      const data = new FormData();

      if (formData.image instanceof File) {
        data.append("image", formData.image);
      }

      data.append("title", formData.title);
      data.append("link", formData.link);
      data.append("isActive", formData.isActive);

      const res = await fetchWithAuth(url, { method, body: data }, user.token);

      if (!res.ok) throw new Error("Failed to save banner");
      await fetchBanners();
      resetForm();
    } catch (err) {
      console.error("❌ Banner save failed:", err);
      alert("Failed to save banner. Please try again.");
    }
  };

  // ============================================================
  // 🔹 Edit existing banner
  // ============================================================
  const handleEdit = (banner) => {
    setIsEditing(true);
    setCurrentBanner(banner);
    setFormData({
      image: banner.image,
      title: banner.title,
      link: banner.link,
      isActive: banner.isActive,
    });
    setImagePreview(banner.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ============================================================
  // 🔹 Delete banner
  // ============================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetchWithAuth(
        `${API_URL}/api/cms/banners/${id}`,
        { method: "DELETE" },
        user.token
      );
      if (!res.ok) throw new Error("Failed to delete banner");
      await fetchBanners();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete banner.");
    }
  };

  // ============================================================
  // 🔹 Toggle banner active/inactive
  // ============================================================
  const toggleActive = async (id, currentStatus) => {
    try {
      const res = await fetchWithAuth(
        `${API_URL}/api/cms/banners/${id}/toggle`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        },
        user.token
      );

      if (!res.ok) throw new Error("Failed to toggle banner status");
      await fetchBanners();
    } catch (err) {
      console.error("❌ Toggle failed:", err);
      alert("Failed to update banner status.");
    }
  };

  // ============================================================
  // 🔹 Reset form
  // ============================================================
  const resetForm = () => {
    setIsEditing(false);
    setCurrentBanner(null);
    setFormData({
      image: null,
      title: "",
      link: "",
      isActive: true,
    });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ============================================================
  // 🔹 Render
  // ============================================================
  if (loading) return <div className="loading">Loading banners...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-container">
      <h2>🖼️ Banner Management</h2>

      {/* === Form Section === */}
      <form onSubmit={handleSubmit} className="banner-form">
        <div className="form-group">
          <label>Banner Image *</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
            ref={fileInputRef}
            required={!isEditing}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Link *</label>
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
            />
            Active
          </label>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-submit">
            {isEditing ? "Update Banner" : "Add Banner"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn-cancel"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* === Banners Table === */}
      <div className="banners-list">
        <h3>Existing Banners</h3>
        {banners.length === 0 ? (
          <div className="no-banners">No banners found.</div>
        ) : (
          <table className="banners-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Link</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner._id}>
                  <td>
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="banner-thumb"
                    />
                  </td>
                  <td>{banner.title}</td>
                  <td>{banner.link}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        banner.isActive ? "active" : "inactive"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(banner.createdAt).toLocaleDateString()}</td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(banner)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-toggle"
                      onClick={() =>
                        toggleActive(banner._id, banner.isActive)
                      }
                    >
                      {banner.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(banner._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BannerManagement;
