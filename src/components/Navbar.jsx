// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaShoppingCart, FaUser, FaSignInAlt, FaTachometerAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, isAdmin } = useUser();
  
  // Check if user is guest (not logged in or has isGuest property)
  const userIsGuest = !user || user.isGuest;

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src="/assets/logo.png" alt="Brand Logo" />
        </Link>
      </div>
      
      <ul className="nav-links">
        <li>
          <Link to="/desktop">DESKTOP</Link>
          <ul className="dropdown-menu">
            <li><Link to="/desktop/mousepad">Mousepads</Link></li>
            <li><Link to="/desktop/deskorganizers">Desk Organizers</Link></li>
            <li><Link to="/desktop/wallart">Wall Art</Link></li>
            <li><Link to="/desktop/desklamps">Desk Lamps</Link></li>
            <li><Link to="/desktop/coasters">Coasters</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/figurines">FIGURINES</Link>
          <ul className="dropdown-menu">
            <li><Link to="/figurines/figures">Scaled Figures</Link></li>
            <li><Link to="/figurines/nendoroids">Nendoroids</Link></li>
            <li><Link to="/figurines/acrylic">Acrylic Stands</Link></li>
            <li><Link to="/figurines/mini">Mini Figurines</Link></li>
            <li><Link to="/figurines/gacha">Gachapons</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/plushies">PLUSHIES</Link>
          <ul className="dropdown-menu">
            <li><Link to="/plushies/animal">Animal Plushies</Link></li>
            <li><Link to="/plushies/character">Character Plushies</Link></li>
            <li><Link to="/plushies/keychain">Keychain Plushies</Link></li>
            <li><Link to="/plushies/pillow">Pillow Plushies</Link></li>
            <li><Link to="/plushies/blanket">Blanket Plushies</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/clothing">CLOTHING</Link>
          <ul className="dropdown-menu">
            <li><Link to="/clothing/t-shirts">T-Shirts</Link></li>
            <li><Link to="/clothing/hoodies">Hoodies</Link></li>
            <li><Link to="/clothing/accessories">Accessories</Link></li>
            <li><Link to="/clothing/cosplay">Cosplays</Link></li>
            <li><Link to="/clothing/socks">Socks</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/varieties">VARIETIES</Link>
          <ul className="dropdown-menu">
            <li><Link to="/varieties/manga">Manga</Link></li>
            <li><Link to="/varieties/dvd">Anime DVDs and Blurays</Link></li>
            <li><Link to="/varieties/books">Art Books</Link></li>
            <li><Link to="/varieties/novels">Light Novels</Link></li>
            <li><Link to="/varieties/games">Videogames</Link></li>
          </ul>
        </li>
      </ul>
      
      <div className="navbar-icons">
        <Link to="/cart" className="nav-icon">
          <FaShoppingCart />
          <span>Cart</span>
        </Link>
        
        {/* Show sign in button for guests or profile for logged in users */}
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
