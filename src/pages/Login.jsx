// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, continueAsGuest } = useUser();
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Admin bypass
      if (emailInput === 'admin' && password === 'admin') {
        const adminData = {
          _id: 'admin-001',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin',
          phone: 'N/A',
          role: 'admin',
          token: 'admin-token',
          registrationDate: new Date().toISOString()
        };
        await login(adminData);
        navigate('/admin');
        return;
      }

      // Normal login
      const success = await login(emailInput, password);
      if (success) navigate('/');
      else setError('Invalid email or password');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>LOGIN</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
          />

          <label>Password</label>
          <div className="password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/create-account">Create Account</Link>
          <button
            onClick={() => {
              continueAsGuest();
              navigate('/');
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
