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

    const handleEmailChange = (e) => {
        setEmailInput(e.target.value);
    }; 

    const handlePasswordFocus = () => {
        setPasswordFocused(true);
    };

    const handlePasswordBlur = (e) => {
        // Add a small delay to check if the click was on the password toggle button
        setTimeout(() => {
            if (!document.activeElement.classList.contains('password-toggle')) {
                setPasswordFocused(false);
            }
        }, 10);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Make sure to add the async keyword here
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        const email = event.target.email.value;
        const password = event.target.password.value;
        
        // Special case for admin login - bypass normal validation
        if (email === 'admin' && password === 'admin') {
            // Create admin user data directly without backend check
            const adminData = {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin',
                phone: 'N/A',
                phoneNumber: 'N/A',
                role: 'admin',
                isLoggedIn: true,
                isGuest: false,
                token: 'admin-token',
                registrationDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                coupons: 0,
                reviews: 0
            };
            
            // Log in as admin and redirect
            await login(adminData);
            navigate('/admin');
            return;
        }
        
        if (email && password) {
            try {
                // Connect to your backend to authenticate
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bookstore-0hqj.onrender.com';
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                
                // Get the full user data including token from your server
                const data = await response.json();
                
                console.log("Data received from API:", data); // Debug log
                
                // Create a comprehensive user object with all fields from the API response
                const userData = {
                    ...data.user, // Include all user data from the API response
                    isLoggedIn: true,
                    isGuest: false,
                    role: data.user?.role || 'user',
                    token: data.token,
                    // Make sure all these properties exist explicitly
                    firstName: data.user?.firstName || data.firstName || 'User',
                    lastName: data.user?.lastName || data.lastName || '',
                    email: data.user?.email || email || '',
                    // Handle phone in multiple formats
                    phone: data.user?.phone || data.user?.phoneNumber || data.phone || data.phoneNumber || '',
                    phoneNumber: data.user?.phoneNumber || data.user?.phone || data.phoneNumber || data.phone || '',
                    // Handle registration date in multiple formats
                    registrationDate: data.user?.registrationDate || data.user?.createdAt || data.registrationDate || data.createdAt || new Date().toISOString(),
                    createdAt: data.user?.createdAt || data.user?.registrationDate || data.createdAt || data.registrationDate || new Date().toISOString()
                };
                
                // If key stats are missing, add default values
                if (userData.coupons === undefined) {
                    userData.coupons = 0;
                }
                if (userData.reviews === undefined) {
                    userData.reviews = 0;
                }
                
                console.log("User data before login:", userData); // Debug log
                
                // Call the login function with the complete user data
                const success = await login(userData);
                
                if (success) {
                    if (userData.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                } else {
                    setError('Login failed. Please try again.');
                }
            } catch (error) {
                setError('Invalid email or password. Please try again.');
                console.error('Login error:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setError('Email and password are required');
            setLoading(false);
        }
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
                            <Link to="/forgot-password" className="auth-link forgot-password">
                                Forgot Password?
                            </Link>
                        </div>
                        
                        <div className="login-options">
                            <button type="submit" className="sign-in" disabled={loading}>
                                {loading ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>
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
                <div className="login-right">
                    <img src="/assets/logo.png" alt="Logo" className="logo-image" />
                    <img src="/assets/anime-slogan.png" alt="Slogan" className="slogan-image" />
                </div>
            </div>
        </div>
    );
};

export default Login;
