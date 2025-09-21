//Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: { type: String },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  rating: { type: Number },
  sizes: [String] // For clothing items
});

module.exports = mongoose.model('Product', productSchema);
