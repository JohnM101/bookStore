// ============================================================
// ✅ server/routes/productRoutes.js — Final Fixed Version
// ============================================================
const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

/**
 * ============================================================
 * 🧠 GET /api/products
 * Fetch all products — each variant appears as its own entry
 * ============================================================
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const expandedProducts = [];

    for (const p of products) {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          expandedProducts.push({
            _id: `${p._id}-${v._id}`,
            parentId: p._id,
            name: p.name,
            description: p.description,
            category: p.category,
            subcategory: p.subcategory,
            slug: p.slug,
            format: v.format || "Standard",
            price: v.price,
            countInStock: v.countInStock,
            mainImage: v.mainImage || null,
            albumImages: v.albumImages?.length ? v.albumImages : [],
            isbn: v.isbn,
            trimSize: v.trimSize,
            pages: v.pages,
            seriesTitle: p.seriesTitle,
            volumeNumber: p.volumeNumber,
            publisher: p.publisher,
            author: p.author,
            age: p.age,
            publicationDate: p.publicationDate,
            variantsCount: p.variants.length,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          });
        });
      } else {
        expandedProducts.push({
          _id: p._id,
          parentId: p._id,
          name: p.name,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory,
          slug: p.slug,
          format: "Standard",
          price: p.price || 0,
          countInStock: p.countInStock || 0,
          mainImage: null,
          albumImages: [],
          isbn: "",
          trimSize: "",
          pages: 0,
          seriesTitle: p.seriesTitle,
          volumeNumber: p.volumeNumber,
          publisher: p.publisher,
          author: p.author,
          age: p.age,
          publicationDate: p.publicationDate,
          variantsCount: 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });
      }
    }

    res.json(expandedProducts);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ============================================================
 * 🧠 GET /api/products/category/:slug
 * Fetch all products for a category/subcategory
 * ============================================================
 */
router.get("/category/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const products = await Product.find({
      $or: [{ category: slug }, { subcategory: slug }],
    }).sort({ createdAt: -1 });

    if (!products.length)
      return res.status(404).json({ message: "No products found" });

    const expandedProducts = [];

    for (const p of products) {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          expandedProducts.push({
            _id: `${p._id}-${v._id}`,
            parentId: p._id,
            name: p.name,
            description: p.description,
            category: p.category,
            subcategory: p.subcategory,
            slug: p.slug,
            format: v.format,
            price: v.price,
            countInStock: v.countInStock,
            mainImage: v.mainImage || null,
            albumImages: v.albumImages?.length ? v.albumImages : [],
            isbn: v.isbn,
            trimSize: v.trimSize,
            pages: v.pages,
            seriesTitle: p.seriesTitle,
            volumeNumber: p.volumeNumber,
            publisher: p.publisher,
            author: p.author,
            age: p.age,
            publicationDate: p.publicationDate,
            variantsCount: p.variants.length,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          });
        });
      } else {
        expandedProducts.push({
          _id: p._id,
          parentId: p._id,
          name: p.name,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory,
          slug: p.slug,
          format: "Standard",
          price: p.price || 0,
          countInStock: p.countInStock || 0,
          mainImage: null,
          albumImages: [],
          isbn: "",
          trimSize: "",
          pages: 0,
          seriesTitle: p.seriesTitle,
          volumeNumber: p.volumeNumber,
          publisher: p.publisher,
          author: p.author,
          age: p.age,
          publicationDate: p.publicationDate,
          variantsCount: 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });
      }
    }

    res.json(expandedProducts);
  } catch (error) {
    console.error("❌ Error fetching category products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * ============================================================
 * 🧠 GET /api/products/:id
 * Fetch single product by Mongo ID or slug
 * ============================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const product = await Product.findOne(isObjectId ? { _id: id } : { slug: id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      seriesTitle: product.seriesTitle,
      volumeNumber: product.volumeNumber,
      publisher: product.publisher,
      slug: product.slug,
      author: product.author,
      authorBio: product.authorBio,
      publicationDate: product.publicationDate,
      age: product.age,
      variants:
        product.variants?.map((v) => ({
          _id: v._id,
          format: v.format,
          price: v.price,
          countInStock: v.countInStock,
          isbn: v.isbn,
          trimSize: v.trimSize,
          pages: v.pages,
          mainImage: v.mainImage,
          albumImages: v.albumImages || [],
        })) || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
