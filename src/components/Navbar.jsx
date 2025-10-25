// ============================================================
// ✅ src/components/Navbar.jsx
// ============================================================
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { FaShoppingCart, FaUser, FaSignInAlt } from "react-icons/fa";
import "./Navbar.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bookstore-0hqj.onrender.com";

// ✅ Normalize strings for URLs
const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, "-").trim();

const Navbar = () => {
  const { user } = useUser();
  const userIsGuest = !user || user.isGuest;

  const [categories, setCategories] = useState([]);
  const [staticPages, setStaticPages] = useState([]);
  const [loading, setLoading] = useState(true);

  // === Fetch both categories and static pages ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const [catRes, pagesRes] = await Promise.all([
          fetch(`${API_URL}/api/categories`),
          fetch(`${API_URL}/api/static-pages?active=true`),
        ]);

        const catData = await catRes.json();
        const pageData = await pagesRes.json();

        // ✅ Sort categories alphabetically
        const sortedCategories = catData
          .map((cat) => ({
            ...cat,
            subcategories: (cat.subcategories || []).sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        // ✅ Sort static pages alphabetically by title
        const sortedPages = (pageData || []).sort((a, b) =>
          a.title.localeCompare(b.title)
        );

        setCategories(sortedCategories);
        setStaticPages(sortedPages);
      } catch (error) {
        console.error("❌ Failed to fetch categories or pages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

      {/* === Dynamic Links === */}
      <ul className="nav-links">
        {/* 🟢 Categories Section */}
        {categories.length > 0 ? (
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
                        to={`/${normalizeSlug(category.slug)}/${normalizeSlug(
                          sub.slug
                        )}`}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
        ) : (
          <li className="no-categories">No Categories Found</li>
        )}

        {/* 🟠 Static Pages Section (About, Contact, etc.) */}
        {staticPages.length > 0 && (
          <>
            <li className="separator">|</li>
            {staticPages.map((page) => (
              <li key={page.slug}>
                <Link to={`/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
          </>
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
