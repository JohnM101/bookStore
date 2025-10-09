const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  discountStart: { type: Date },
  discountEnd: { type: Date },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  image: { type: String, required: true },          // main image
  images: [String],                                 // additional gallery images
  author: { type: String },
  publisher: { type: String },
  isbn: { type: String },
  publishedDate: { type: Date },
  language: { type: String },
  pages: { type: Number },
  format: { type: String, enum: ['Paperback', 'Hardcover', 'Ebook'] },
  edition: { type: String },
  sku: { type: String },
  supplier: { type: String },
  reorderLevel: { type: Number },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  countInStock: { type: Number, required: true, default: 0 },
  slug: { type: String },                           // SEO-friendly URL
  metaTitle: { type: String },
  metaDescription: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
