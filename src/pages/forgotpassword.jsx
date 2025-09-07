import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending a password reset email
    window.alert("A password reset email has been sent to " + email);
    // Redirect to the login page
    navigate('/');
  };

  return (
    <div className="login-container">
      <img
        src="/assets/anime-logo.png"
        alt="Side Logo"
        className="background-logo"
      />

      <div className="login-box">
        <div className="login-left">
          <h2>RESET YOUR PASSWORD</h2>
          <form onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <button type="submit" className="sign-in">SUBMIT</button>
          </form>
          <div className="back-to-login">
            <Link to="/login" className="auth-link">Back to Login</Link>
          </div>
        </div>
        <div className="login-right">
          <img src="/assets/logo.png" alt="Logo" className="logo-image" />
          <img src="/assets/anime-slogan.png" alt="Slogan" className="slogan-image" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
