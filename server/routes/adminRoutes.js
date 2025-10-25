// ============================================================
// ✅ server/routes/adminRoutes.js — Fixed CastError (AlbumImages Sanitization)
// ============================================================
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

// ============================================================
// 🔧 CLOUDINARY CONFIG
// ============================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bookstore-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });

// ============================================================
// 🧠 Helper: Slug & Sanitizer
// ============================================================
const generateSlug = (name) =>
  name
    ?.toLowerCase()
    ?.trim()
    ?.replace(/[^\w\s-]/g, "")
    ?.replace(/\s+/g, "-")
    ?.replace(/--+/g, "-") || "";

// ✅ Clean up albumImages: keep only string URLs
const sanitizeAlbumImages = (images = []) => {
  return images
    .map((img) => {
      if (typeof img === "string" && img.startsWith("http")) return img;
      if (img?.preview && typeof img.preview === "string" && img.preview.startsWith("http"))
        return img.preview;
      return null;
    })
    .filter(Boolean);
};

// ============================================================
// 🟢 CREATE PRODUCT
// ============================================================
router.post("/products", protect, admin, upload.any(), async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || [];

    const slugValue = body.slug?.trim() || generateSlug(body.name);

    let variants = [];
    if (body.variants) {
      try {
        variants = JSON.parse(body.variants);
      } catch {
        variants = [];
      }
    }

    // ✅ Attach Cloudinary images and clean data
    variants = variants.map((variant, idx) => {
      const main = files.find((f) => f.fieldname === `variantMainImages_${idx}`);
      const albums = files.filter((f) => f.fieldname === `variantAlbumImages_${idx}`);

      const uploadedUrls = albums.map((a) => a.path);
      const cleanedAlbums = [
        ...sanitizeAlbumImages(variant.albumImages),
        ...uploadedUrls,
      ];

      return {
        format: variant.format,
        price: variant.price,
        countInStock: variant.countInStock,
        isbn: variant.isbn,
        trimSize: variant.trimSize,
        pages: variant.pages,
        mainImage: main ? main.path : sanitizeAlbumImages([variant.mainImage])[0] || "",
        albumImages: [...new Set(cleanedAlbums)],
      };
    });

    // ✅ In product creation
    const product = new Product({
      name: body.name,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory,
      seriesTitle: body.seriesTitle,
      volumeNumber: body.volumeNumber,
      publisher: body.publisher,
      slug: slugValue,
      author: body.author,
      authorBio: body.authorBio,
      publicationDate: body.publicationDate || null,
      age: body.age,
      variants,
      status: body.status || "Active", // ✅ added
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Failed to create product", error: error.message });
  }
});

// ============================================================
// 🟠 UPDATE PRODUCT — Final Safe Version
// ============================================================
router.put("/products/:id", protect, admin, upload.any(), async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || [];

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });

    const slugValue = body.slug?.trim() || generateSlug(body.name);

    // ✅ Parse variants safely (fallback to existing)
    let variants = [];
    try {
      variants = JSON.parse(body.variants);
      if (!Array.isArray(variants) || variants.length === 0)
        variants = existing.variants;
    } catch {
      variants = existing.variants;
    }

    // ✅ Clean and merge each variant’s images
    variants = variants.map((variant, idx) => {
      const main = files.find((f) => f.fieldname === `variantMainImages_${idx}`);
      const albums = files.filter((f) => f.fieldname === `variantAlbumImages_${idx}`);

      const dbVariant = existing.variants[idx] || {};
      const dbAlbums = Array.isArray(dbVariant.albumImages)
        ? dbVariant.albumImages
        : [];

      const uploadedUrls = albums.map((a) => a.path);
      const frontendAlbums = sanitizeAlbumImages(variant.albumImages);
      const mergedAlbums = [...new Set([...dbAlbums, ...frontendAlbums, ...uploadedUrls])];

      return {
        format: variant.format || dbVariant.format,
        price: variant.price ?? dbVariant.price,
        countInStock: variant.countInStock ?? dbVariant.countInStock,
        isbn: variant.isbn || dbVariant.isbn,
        trimSize: variant.trimSize || dbVariant.trimSize,
        pages: variant.pages || dbVariant.pages,
        mainImage: main
          ? main.path
          : sanitizeAlbumImages([variant.mainImage])[0] ||
            dbVariant.mainImage ||
            "",
        albumImages: mergedAlbums.filter(Boolean),
      };
    });

    // ✅ In product update
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        description: body.description,
        category: body.category,
        subcategory: body.subcategory,
        seriesTitle: body.seriesTitle,
        volumeNumber: body.volumeNumber,
        publisher: body.publisher,
        slug: slugValue,
        author: body.author,
        authorBio: body.authorBio,
        publicationDate: body.publicationDate || null,
        age: body.age,
        variants,
        status: body.status || existing.status, // ✅ added
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
});


// ============================================================
// 🟣 GET PRODUCTS
// ============================================================
router.get("/products", protect, admin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ============================================================
// 🔴 DELETE PRODUCT
// ============================================================
router.delete("/products/:id", protect, admin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// ============================================================
// ✅ GET ALL USERS
// ============================================================
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ============================================================
// ✅ GET ALL ORDERS
// ============================================================
router.get("/orders", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;
