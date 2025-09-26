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
          <Link to="/kidsManga">KIDS MANGA</Link>
          <ul className="dropdown-menu">
            <li><Link to="/kidsManga/adventure">Adventure</Link></li>
            <li><Link to="/kidsManga/animalSliceOfLife">Animal Slice of Life</Link></li>
            <li><Link to="/kidsManga/comedy">Comedy</Link></li>
            <li><Link to="/kidsManga/fantasy">Fantasy</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/youngBoysManga">YOUNG BOYS MANGA</Link>
          <ul className="dropdown-menu">
            <li><Link to="/youngBoysManga/actionFighting">Action Fighting</Link></li>
            <li><Link to="/youngBoysManga/adventure">Adventure</Link></li>
            <li><Link to="/youngBoysManga/fantasySupernatural">Fantasy Supernatural</Link></li>
            <li><Link to="/youngBoysManga/sportsCompetition">Sports Competition</Link></li>
          </ul>
        </li>
        <li>
          <Link to="/youngGirlsManga">YOUNG GIRLS MANGA</Link>
          <ul className="dropdown-menu">
            <li><Link to="/youngGirlsManga/dramaSliceOfLife">Drama-Slice of Life</Link></li>
            <li><Link to="/youngGirlsManga/magicalGirlFantasy">Magical Girl Fantasy</Link></li>
            <li><Link to="/youngGirlsManga/romance">Romance</Link></li>
            <li><Link to="/youngGirlsManga/schoolLifeFriendship">School Life Friendship</Link></li>
          </ul>
        </li>
        {/* <li>
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
        </li> */}
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
