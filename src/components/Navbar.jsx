//src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaShoppingCart, FaUser, FaSignInAlt } from 'react-icons/fa';
import './Navbar.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

// Normalize strings for URLs
const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, '-').trim();

const Navbar = () => {
  const { user } = useUser();
  const userIsGuest = !user || user.isGuest;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // === Fetch and sort categories ===
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        let data = await res.json();

        // ✅ Sort categories alphabetically by name
        data = data
          .map((cat) => ({
            ...cat,
            // ✅ Sort subcategories alphabetically too
            subcategories: (cat.subcategories || []).sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCategories(data);
      } catch (error) {
        console.error('❌ Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <nav className="navbar">
        <div className="logo">
          <Link to="/">
            <img src="/assets/logo.png" alt="Brand Logo" />
          </Link>
        </div>
        <div className="loading-categories">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      {/* === Logo === */}
      <div className="logo">
        <Link to="/">
          <img src="/assets/logo.png" alt="Brand Logo" />
        </Link>
      </div>

      {/* === Dynamic Categories (alphabetically ordered) === */}
      <ul className="nav-links">
        {categories.length === 0 ? (
          <li className="no-categories">No Categories Found</li>
        ) : (
          categories.map((category) => (
            <li key={category.slug}>
              <Link to={`/${normalizeSlug(category.slug)}`}>
                {category.name.toUpperCase()}
              </Link>

              {category.subcategories && category.subcategories.length > 0 && (
                <ul className="dropdown-menu">
                  {category.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        to={`/${normalizeSlug(category.slug)}/${normalizeSlug(sub.slug)}`}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
        )}
      </ul>

      {/* === Icons === */}
      <div className="navbar-icons">
        <Link to="/cart" className="nav-icon">
          <FaShoppingCart />
          <span>Cart</span>
        </Link>

        {userIsGuest ? (
          <Link to="/login" className="sign-in-button">
            <FaSignInAlt />
            <span>Sign In</span>
          </Link>
        ) : (
          <Link to="/profile" className="nav-icon">
            <FaUser />
            <span>Profile</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
