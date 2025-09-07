const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path'); // <-- Add this
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');


// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Body parser
app.use(express.json());

;// Enable CORS
app.use(cors({
  origin: ['https://anime-you-one.vercel.app', 'http://localhost:3000']
}))

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Since we're using Cloudinary, we don't need local uploads
// but we can keep it for backward compatibility if needed
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes')); // Add this line

// Update your admin routes to use authentication middleware
const { protect, admin } = require('./middleware/authMiddleware');
app.use('/api/admin', protect, admin, adminRoutes);

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    // Match the exact admin email
    const adminExists = await User.findOne({ email: 'admin' });
    
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin',
        password: 'admin',
        role: 'admin'
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};


createAdminUser();


// ---------- SERVE REACT BUILD IN PRODUCTION ----------
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
