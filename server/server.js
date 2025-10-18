// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load env variables
dotenv.config();

// Connect MongoDB
connectDB();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: ['https://book-store-azure-chi.vercel.app', 'http://localhost:3000'],
    credentials: true,
  })
);

// Static uploads
app.use('/uploads', express.static('uploads'));

// Import middleware
const { protect, admin } = require('./middleware/authMiddleware');

// Routes
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/addToCartRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cms/banners', require('./routes/cmsBannerRoutes'));
app.use('/api/admin', protect, admin, require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // ✅ Handles register/login/google-login

// Auto-create admin user
const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@example.com';
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('✅ Admin user already exists');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);

    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      loginMethod: 'email',
    });

    console.log('🎉 Admin user created successfully:', adminEmail);
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
  }
};
createAdminUser();

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



// =========================
// TEMPORARY ROUTE to fix passwords (remove after running)
// =========================
app.get('/api/admin/fix-passwords', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const users = await User.find({});
    let fixedCount = 0;

    for (const user of users) {
      if (user.loginMethod === 'google') continue;

      // Reset admin password
      if (user.email === 'admin@example.com') {
        user.password = 'admin'; // pre-save hook will hash it
        await user.save();
        fixedCount++;
        continue;
      }

      // Reset any corrupted or double-hashed passwords
      if (!user.password.startsWith('$2') || user.password.length !== 60) {
        user.password = 'password123'; // pre-save hook will hash
        await user.save();
        fixedCount++;
      }
    }

    res.json({ message: `✅ Fixed ${fixedCount} users` });
  } catch (err) {
    console.error('Fix password error:', err);
    res.status(500).json({ message: 'Failed to fix passwords' });
  }
});
