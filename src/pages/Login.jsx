import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        const email = event.target.email.value;
        const password = event.target.password.value;

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
                registrationDate: new Date().toISOString(),
            };
            await login(adminData);
            navigate('/admin');
            return;
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';

            // 1. Login to get token
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) throw new Error('Login failed');
            const data = await response.json();

            if (!data.token) throw new Error('Token not received');

            // 2. Fetch full profile to get _id and all details
            const profileRes = await fetch(`${API_URL}/api/users/profile`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });

            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();

            // 3. Build complete user object
            const userData = {
                ...profileData,
                token: data.token,
                isLoggedIn: true,
                isGuest: false,
            };

            console.log("Complete user data:", userData);

            // 4. Login via context
            const success = await login(userData);

            if (success) {
                if (userData.role === 'admin') navigate('/admin');
                else navigate('/');
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
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
                            onChange={handleEmailChange}
                            required
                        />
                        <label htmlFor="password">Password</label>
                        <div className="password-group">
                            <input
                                type={showPassword ? "text" : "password"}
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
                            <Link to="/forgot-password" className="auth-link forgot-password">Forgot Password?</Link>
                        </div>
                        <div className="login-options">
                            <button type="submit" className="sign-in" disabled={loading}>
                                {loading ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>
                        </div>
                        <div className="create-account">
                            <Link to="/create-account" className="auth-link create-account-btn">Create Account</Link>
                            <a
                                href="#"
                                className="auth-link"
                                onClick={(e) => { e.preventDefault(); continueAsGuest(); navigate('/'); }}
                            >
                                Continue as Guest
                            </a>
                        </div>
                    </form>
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
