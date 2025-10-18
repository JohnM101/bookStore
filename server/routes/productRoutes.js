// server/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ✅ Helper: normalize strings to lowercase-slug style
const normalize = (str) =>
  str?.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();

// ✅ GET /api/products
// Supports query parameters: ?slug=, ?category=, ?subcategory=
router.get("/", async (req, res) => {
  try {
    const { slug, category, subcategory } = req.query;

    // 1️⃣ If slug exists, return one specific product
    if (slug) {
      const product = await Product.findOne({ slug: normalize(slug) });
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      return res.json([product]); // return array for frontend compatibility
    }

    // 2️⃣ If category/subcategory filters exist
    const filter = {};
    if (category) filter.category = normalize(category);
    if (subcategory) filter.subcategory = normalize(subcategory);

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET /api/products/:id — find by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) return res.json(product);
    res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ POST /api/products — create new product with slug generation
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Product with this name already exists." });
    }
    res.status(400).json({ message: error.message });
  }
});

// ✅ PUT /api/products/:id — update product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ DELETE /api/products/:id — delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
