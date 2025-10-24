// ============================================================
// ✅ server/models/Product.js — Final Variant-Only Schema
// ============================================================
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  format: String,
  price: Number,
  countInStock: Number,
  isbn: String,
  trimSize: String,
  pages: Number,
  mainImage: String,
  albumImages: [String],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: String,
    subcategory: String,
    seriesTitle: String,
    volumeNumber: Number,
    publisher: String,
    author: String,
    authorBio: String,
    slug: { type: String, required: true, unique: true },
    publicationDate: Date,
    age: String,
    variants: [variantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
