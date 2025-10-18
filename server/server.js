// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// ====== Load Environment Variables ======
dotenv.config();

// ====== Connect to MongoDB ======
connectDB();

// ====== Configure Cloudinary ======
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// ====== Middleware ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for your frontend
app.use(
  cors({
    origin: ['https://book-store-azure-chi.vercel.app', 'http://localhost:3000'],
    credentials: true,
  })
);

// ====== Static Uploads (if needed) ======
app.use('/uploads', express.static('uploads'));

// ====== Routes ======
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/addToCartRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cms/banners', require('./routes/cmsBannerRoutes'));

// === Import middlewares AFTER connecting DB ===
const { protect, admin } = require('./middleware/authMiddleware');

// === Admin route (protected) ===
app.use('/api/admin', protect, admin, require('./routes/adminRoutes'));

// === Auth route (the ONLY source for auth logic) ===
app.use('/api/auth', require('./routes/authRoutes'));

// ====== Create Admin User if Missing ======
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
    });

    console.log('🎉 Admin user created successfully:', adminEmail);
  } catch (err) {
    console.error('❌ Error creating admin user:', err);
  }
};
createAdminUser();

// ====== Serve React Frontend in Production ======
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// ====== Start Server ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
