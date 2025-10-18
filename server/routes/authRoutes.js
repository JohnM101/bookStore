// server/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ===== JWT Helper =====
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, isAdmin: user.role === 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

// ==========================
// REGISTER (EMAIL)
// ==========================
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'User already exists' });

    // Model pre-save hook hashes password
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'user',
      loginMethod: 'email',
    });

    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// LOGIN (EMAIL)
// ==========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🟢 Login attempt:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ No user found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Prevent Google users from password login
    if (user.loginMethod === 'google') {
      return res
        .status(400)
        .json({ message: 'Please log in using Google instead.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    console.log('✅ Login success:', email);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// GOOGLE LOGIN
// ==========================
router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name: firstName, family_name: lastName, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      const hashedGooglePassword = await bcrypt.hash(googleId, 10);
      user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedGooglePassword,
        role: 'user',
        loginMethod: 'google',
      });
    }

    const jwtToken = generateToken(user);

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: jwtToken,
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Google login failed' });
  }
});

// ==========================
// GET PROFILE
// ==========================
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
