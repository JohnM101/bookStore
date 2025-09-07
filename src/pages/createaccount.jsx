import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import './Login.css';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state variables for password visibility and focus
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!formData.firstName) newErrors.firstName = "First Name is required.";
    if (!formData.lastName) newErrors.lastName = "Last Name is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long, include at least one letter, one number, and one symbol.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone Number is required.";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // Handle password field focus
  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  // Handle password field blur
  const handlePasswordBlur = () => {
    setTimeout(() => {
      if (!document.activeElement.classList.contains('password-toggle')) {
        setPasswordFocused(false);
      }
    }, 10);
  };

  // Handle confirm password field focus
  const handleConfirmPasswordFocus = () => {
    setConfirmPasswordFocused(true);
  };

  // Handle confirm password field blur
  const handleConfirmPasswordBlur = () => {
    setTimeout(() => {
      if (!document.activeElement.classList.contains('password-toggle')) {
        setConfirmPasswordFocused(false);
      }
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create a user object with the registration data
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password, // This will be hashed on the server
        phoneNumber: formData.phoneNumber,
        registrationDate: new Date().toISOString(),
        role: 'user' // Default role for new accounts
      };
      
      // Send registration data to backend
      const response = await fetch('https://bookstore-0hqj.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }
      
      // If registration is successful, create a user object for the frontend
      // Important: Use all data from the backend response first, then add/override specific properties
      const frontendUserData = {
        ...data.user, // Include ALL user data from the backend response
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        isLoggedIn: true,
        token: data.token, // Make sure to store the token
        registrationDate: data.user?.registrationDate || new Date().toISOString(),
        address: data.user?.address || {}
      };
      
      // Store user data and log them in
      login(frontendUserData);
      
      // Also store token separately if your auth system needs it
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Navigate to root route instead of home-page
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        submit: error.message || 'Failed to create account. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Modified renderInput to handle all fields consistently
  const renderInput = (name, type, placeholder) => {
  if (type === 'password') {
    const isPassword = name === 'password';
    const isFocused = isPassword ? passwordFocused : confirmPasswordFocused;
    const showPass = isPassword ? showPassword : showConfirmPassword;
    const toggleVisibility = () => {
      if (isPassword) {
        setShowPassword(!showPassword);
      } else {
        setShowConfirmPassword(!showConfirmPassword);
      }
    };
    const handleFocus = isPassword ? handlePasswordFocus : handleConfirmPasswordFocus;
    const handleBlur = isPassword ? handlePasswordBlur : handleConfirmPasswordBlur;

    return (
      <div className="input-group">
        <label htmlFor={name}>{placeholder}</label>
        <div className="password-group">
          <input
            type={showPass ? "text" : "password"}
            id={name}
            name={name}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="new-password"
            className="form-input"
          />
          {isFocused && (
            <button 
              type="button" 
              className="password-toggle" 
              onClick={toggleVisibility}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          )}
        </div>
        {errors[name] && <span className="error">{errors[name]}</span>}
      </div>
    );
  }
  
  return (
    <div className="input-group">
      <label htmlFor={name}>{placeholder}</label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        className="form-input"
      />
      {errors[name] && <span className="error">{errors[name]}</span>}
    </div>
  );
};

  return (
    <div className="login-container">
      <img src="/assets/anime-logo.png" alt="Side Logo" className="background-logo" />
      <div className="login-box">
        <div className="login-left">
          <h2>CREATE ACCOUNT</h2>
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          <form onSubmit={handleSubmit}>
  <div className="form-fields">
    {renderInput('firstName', 'text', 'First Name')}
    {renderInput('lastName', 'text', 'Last Name')}
    {renderInput('email', 'email', 'Email')}
    {renderInput('phoneNumber', 'tel', 'Phone Number')}
    {renderInput('password', 'password', 'Password')}
    {renderInput('confirmPassword', 'password', 'Confirm Password')}
  </div>
  <button type="submit" className="sign-in" disabled={isLoading}>
    {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER'}
  </button>
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

export default CreateAccount;
