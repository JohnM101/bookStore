// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaShoppingCart, FaUser, FaSignInAlt } from 'react-icons/fa';
import { CATEGORIES } from '../data/categories';
import './Navbar.css';

// Normalize strings for URLs
const normalizeSlug = (str) => str?.toLowerCase().replace(/\s+/g, '-').trim();

const Navbar = () => {
  const { user } = useUser();
  const userIsGuest = !user || user.isGuest;

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src="/assets/logo.png" alt="Brand Logo" />
        </Link>
      </div>

      <ul className="nav-links">
        {CATEGORIES.map(category => (
          <li key={category.slug}>
            <Link to={`/${normalizeSlug(category.slug)}`}>{category.name.toUpperCase()}</Link>
            <ul className="dropdown-menu">
              {category.subcategories.map(sub => (
                <li key={sub.slug}>
                  <Link to={`/${normalizeSlug(category.slug)}/${normalizeSlug(sub.slug)}`}>
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

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
