const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// =================== Cloudinary Configuration ===================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bookstore-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({ storage });

// =================== Helper Function ===================
const generateSlug = (name, volumeNumber) => {
  if (!name) return '';
  let base = name.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
  if (volumeNumber) base += `-vol-${volumeNumber}`;
  return base;
};

// =================== PRODUCT ROUTES ===================

// GET all products
router.get('/products', protect, admin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET single product
router.get('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Fetch product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// CREATE product
router.post(
  '/products',
  protect,
  admin,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'albumImages' }]),
  async (req, res) => {
    try {
      const { body, files } = req;

      if (!files || !files.image) {
        return res.status(400).json({ message: 'Main image is required' });
      }

      const {
        name,
        description,
        category,
        subcategory,
        price,
        countInStock,
        seriesTitle,
        volumeNumber,
        publisher,
        format,
        slug,
      } = body;

      const slugValue = slug?.trim() || generateSlug(name, volumeNumber);
      const mainImage = files.image[0].path;
      const albumImages = files.albumImages ? files.albumImages.map((f) => f.path) : [];

      const product = new Product({
        name,
        description,
        category,
        subcategory,
        price: parseFloat(price),
        countInStock: parseInt(countInStock),
        image: mainImage,
        albumImages,
        seriesTitle,
        volumeNumber: volumeNumber ? parseInt(volumeNumber) : undefined,
        publisher,
        format,
        slug: slugValue,
      });

      const saved = await product.save();
      res.status(201).json(saved);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// UPDATE product (main + album)
router.put(
  '/products/:id',
  protect,
  admin,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'albumImages' }]),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const { body, files } = req;
      const slugValue = body.slug?.trim() || generateSlug(body.name, body.volumeNumber);

      const existingAlbumImages = body.existingAlbumImages ? JSON.parse(body.existingAlbumImages) : [];
      const removedAlbumImages = body.removedAlbumImages ? JSON.parse(body.removedAlbumImages) : [];
      const newAlbumImages = files?.albumImages ? files.albumImages.map((f) => f.path) : [];

      // ✅ Delete removed Cloudinary images
      for (const url of removedAlbumImages) {
        try {
          const filename = url.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(`bookstore-products/${filename}`);
        } catch (err) {
          console.warn(`⚠️ Failed to delete Cloudinary image: ${url}`, err.message);
        }
      }

      // ✅ Update data
      const updateData = {
        name: body.name,
        description: body.description,
        category: body.category,
        subcategory: body.subcategory,
        price: parseFloat(body.price),
        countInStock: parseInt(body.countInStock),
        seriesTitle: body.seriesTitle,
        volumeNumber: body.volumeNumber ? parseInt(body.volumeNumber) : undefined,
        publisher: body.publisher,
        format: body.format,
        slug: slugValue,
        albumImages: [...existingAlbumImages, ...newAlbumImages],
      };

      // ✅ Replace main image if uploaded
      if (files?.image && files.image[0]) {
        updateData.image = files.image[0].path;
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json(updated);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE product (also cleanup Cloudinary)
router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // ✅ Delete all product images from Cloudinary
    const allImages = [product.image, ...(product.albumImages || [])];
    for (const url of allImages) {
      try {
        const filename = url.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`bookstore-products/${filename}`);
      } catch (err) {
        console.warn(`⚠️ Failed to delete image: ${url}`, err.message);
      }
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// =================== ADMIN USER / ORDER MANAGEMENT ===================
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
