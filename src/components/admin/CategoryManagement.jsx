// src/components/admin/CategoryManagement.jsx
import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import '../AdminDashboard.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

const CategoryManagement = () => {
  const { user } = useUser();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', subcategories: [] });
  const [subName, setSubName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // === FETCH ALL CATEGORIES ===
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      let data = await res.json();

      // ✅ Ensure subcategories are always sorted alphabetically
      data = data.map((cat) => ({
        ...cat,
        subcategories: (cat.subcategories || []).sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }));

      setCategories(data);
    } catch (err) {
      console.error('❌ Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // === GENERATE SLUG ===
  const generateSlug = (str) =>
    str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();

  // === HANDLE SUBCATEGORY ADD/REMOVE ===
  const handleAddSub = () => {
    if (!subName.trim()) return;
    const newSub = { name: subName.trim(), slug: generateSlug(subName.trim()) };

    // prevent duplicate subs
    if (form.subcategories.some((s) => s.slug === newSub.slug)) return;

    // ✅ Keep subcategories sorted by name after adding
    const updatedSubs = [...form.subcategories, newSub].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setForm({
      ...form,
      subcategories: updatedSubs,
    });
    setSubName('');
  };

  const handleRemoveSub = (slug) => {
    const updatedSubs = form.subcategories
      .filter((s) => s.slug !== slug)
      .sort((a, b) => a.name.localeCompare(b.name));

    setForm({
      ...form,
      subcategories: updatedSubs,
    });
  };

  // === SUBMIT FORM (ADD / UPDATE) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = generateSlug(form.name);

    // ✅ Always ensure subcategories are sorted before sending to backend
    const sortedSubcategories = [...form.subcategories].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const payload = { ...form, slug, subcategories: sortedSubcategories };

    try {
      const url = editingCategory
        ? `${API_URL}/api/categories/${editingCategory._id}`
        : `${API_URL}/api/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save category');

      setForm({ name: '', slug: '', subcategories: [] });
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('❌ Save failed:', err);
    }
  };

  // === EDIT CATEGORY ===
  const handleEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      // ✅ Sort subcategories when editing
      subcategories: (category.subcategories || []).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    });
  };

  // === DELETE CATEGORY ===
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchCategories();
    } catch (err) {
      console.error('❌ Delete failed:', err);
    }
  };

  // === CANCEL EDIT ===
  const handleCancel = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', subcategories: [] });
    setSubName('');
  };

  if (loading) return <div className="loading">Loading categories...</div>;

  return (
    <div className="admin-container">
      {/* === CATEGORY FORM === */}
      <div className="product-form-container">
        <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>

        <form onSubmit={handleSubmit}>
          {/* Category name */}
          <div className="form-group">
            <label>Category Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                })
              }
              required
            />
          </div>

          {/* Subcategories */}
          <div className="form-group">
            <label>Subcategories</label>
            <div className="subcategory-list">
              {form.subcategories.map((sub) => (
                <div key={sub.slug} className="subcategory-item">
                  {sub.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveSub(sub.slug)}
                    className="remove-sub-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="subcategory-add">
              <input
                type="text"
                placeholder="Add subcategory name"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
              />
              <button type="button" onClick={handleAddSub}>
                Add
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editingCategory ? 'Update Category' : 'Add Category'}
            </button>
            {editingCategory && (
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* === CATEGORY LIST === */}
      <div className="products-list-container">
        <h2>Existing Categories</h2>

        {categories.length === 0 ? (
          <div className="no-products">No categories found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Subcategories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>

                  {/* ✅ Numbered vertical list of subcategories */}
                  <td>
                    {c.subcategories?.length > 0 ? (
                      <ol className="subcategory-numbered-list">
                        {c.subcategories.map((s, index) => (
                          <li key={s.slug}>{s.name}</li>
                        ))}
                      </ol>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="actions">
                    <button className="btn-edit" onClick={() => handleEdit(c)}>
                      Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(c._id)}>
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

export default CategoryManagement;
