const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  countInStock: { type: Number, required: true, default: 0 },
  image: { type: String, required: true },      // main image
  seriesTitle: { type: String },               // optional
  volumeNumber: { type: Number },              // optional
  publisher: { type: String },                 // optional
  format: { type: String, enum: ['Tankōbon', 'Omnibus', 'Digital'] }, // optional
  slug: { type: String },                      // optional SEO-friendly URL
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
