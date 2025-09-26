import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const API_URL = process.env.REACT_APP_RENDER_URL || 'https://bookstore-0hqj.onrender.com';

const Login = () => {
  const navigate = useNavigate();
  const { login, continueAsGuest } = useUser();
  const [emailInput, setEmailInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = e.target.email.value;
    const password = e.target.password.value;

    // Admin shortcut (dev only)
    if (email === 'admin' && password === 'admin') {
      await login({
        _id: 'admin-id',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin',
        role: 'admin',
        isLoggedIn: true,
        isGuest: false,
        token: 'admin-token',
      });
      navigate('/admin');
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) throw new Error('Invalid credentials');
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) throw new Error('Google login failed');
      const data = await res.json();
      await login(data); // Login via context
      navigate('/');
    } catch {
      setError('Google login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <img src="/assets/anime-logo.png" alt="Side Logo" className="background-logo" />
      <div className="login-box">
        <div className="login-left">
          <h2>LOGIN</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type={emailInput === 'admin' ? 'text' : 'email'}
              id="email"
              placeholder="Email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <div className="password-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setTimeout(() => setPasswordFocused(false), 10)}
                autoComplete="current-password"
                required
              />
              {passwordFocused && (
                <button type="button" className="password-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>
            <div className="forgot">
              <Link to="/forgot-password" className="auth-link forgot-password">Forgot Password?</Link>
            </div>
            <button type="submit" className="sign-in" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOG IN'}
            </button>
          </form>
          <div className="google-login">
            <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError('Google login failed.')} useOneTap />
          </div>
          <div className="create-account">
            <Link to="/create-account" className="auth-link create-account-btn">Create Account</Link>
            <a
              href="#"
              className="auth-link"
              onClick={(e) => {
                e.preventDefault();
                continueAsGuest();
                navigate('/');
              }}
            >
              Continue as Guest
            </a>
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

export default Login;
