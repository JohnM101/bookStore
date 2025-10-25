// ============================================================
// ✅ src/components/admin/StaticPageManagement.jsx
// ============================================================
import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import "../AdminDashboard.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bookstore-0hqj.onrender.com";

const StaticPageManagement = () => {
  const { user } = useUser();
  const [pages, setPages] = useState([]);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    isActive: true,
  });
  const [editingPage, setEditingPage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_URL}/api/static-pages`, {}, user.token);
      const data = await res.json();
      setPages(data);
    } catch (err) {
      console.error("❌ Error fetching pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchPages();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingPage ? "PUT" : "POST";
    const url = editingPage
      ? `${API_URL}/api/static-pages/${editingPage._id}`
      : `${API_URL}/api/static-pages`;

    try {
      const res = await fetchWithAuth(
        url,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
        user.token
      );
      if (!res.ok) throw new Error("Failed to save page");
      fetchPages();
      resetForm();
    } catch (err) {
      console.error("❌ Save failed:", err);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content,
      isActive: page.isActive,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this page?")) return;
    try {
      const res = await fetchWithAuth(
        `${API_URL}/api/static-pages/${id}`,
        { method: "DELETE" },
        user.token
      );
      if (!res.ok) throw new Error("Failed to delete");
      fetchPages();
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  const resetForm = () => {
    setFormData({ slug: "", title: "", content: "", isActive: true });
    setEditingPage(null);
  };

  if (loading) return <div className="loading">Loading pages...</div>;

  return (
    <div className="admin-container">
      <h2>📄 Manage Static Pages</h2>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Slug (unique)</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group full-width">
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            rows="6"
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-submit">
            {editingPage ? "Update Page" : "Add Page"}
          </button>
          {editingPage && (
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3>Existing Pages</h3>
      <table className="products-table">
        <thead>
          <tr>
            <th>Slug</th>
            <th>Title</th>
            <th>Active</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p._id}>
              <td>{p.slug}</td>
              <td>{p.title}</td>
              <td>{p.isActive ? "✅" : "❌"}</td>
              <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
              <td className="actions">
                <button className="btn-edit" onClick={() => handleEdit(p)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaticPageManagement;
