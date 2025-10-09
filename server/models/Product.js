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
  rating: { type: Number },
  countInStock: { type: Number, required: true, default: 0 }, // <-- ADD THIS
});


module.exports = mongoose.model('Product', productSchema);
