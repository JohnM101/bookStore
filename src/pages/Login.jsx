// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

const API_URL = process.env.REACT_APP_RENDER_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login, continueAsGuest } = useUser();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleEmailChange = (e) => setEmailInput(e.target.value);
  const handlePasswordFocus = () => setPasswordFocused(true);
  const handlePasswordBlur = () => setTimeout(() => setPasswordFocused(false), 10);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // -------------------------
  // Email/Password Login
  // -------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      // Admin shortcut
      if (email === 'admin' && password === 'admin') {
        const adminData = {
          _id: 'admin-id',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin',
          phone: 'N/A',
          role: 'admin',
          isLoggedIn: true,
          isGuest: false,
          token: 'admin-token',
          createdAt: new Date().toISOString(),
        };
        await login(adminData);
        navigate('/admin');
        return;
      }

      // Email/password login
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();

      if (!data.token) throw new Error('Token not received');

      // Fetch profile
      const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });

      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileRes.json();

      const userData = {
        ...profileData,
        token: data.token,
        isLoggedIn: true,
        isGuest: false,
      };

      await login(userData);

      if (userData.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Google Login
  // -------------------------
  const handleGoogleLogin = async (credentialResponse) => {
  setLoading(true);
  setError('');

  try {
    const res = await fetch(`${API_URL}/api/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    if (!res.ok) throw new Error('Google login failed');
    const data = await res.json();

    await login(data); // save user in context
    navigate('/'); // redirect after login
  } catch (err) {
    console.error('Google login error:', err);
    setError('Google login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-container">
      <img src="/assets/anime-logo.png" alt="Side Logo" className="background-logo" />
      <div className="login-box">
        {/* Left Box: Form */}
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
              onChange={handleEmailChange}
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                autoComplete="current-password"
                required
              />
              {passwordFocused && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>

            <div className="forgot">
              <Link to="/forgot-password" className="auth-link forgot-password">
                Forgot Password?
              </Link>
            </div>

            <div className="login-options">
              <button type="submit" className="sign-in" disabled={loading}>
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </button>

              <div className="google-login">
                <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError('Google login failed. Please try again.')}
                useOneTap
                />
              </div>
            </div>

            <div className="create-account">
              <Link to="/create-account" className="auth-link create-account-btn">
                Create Account
              </Link>
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
          </form>
        </div>

        {/* Right Box: Images */}
        <div className="login-right">
          <img src="/assets/logo.png" alt="Logo" className="logo-image" />
          <img src="/assets/anime-slogan.png" alt="Slogan" className="slogan-image" />
        </div>
      </div>
    </div>
  );
};

export default Login;
