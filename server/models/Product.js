const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Helper function to normalize strings to slugs
const toSlug = (str) => str?.toLowerCase().replace(/\s+/g, '-').trim();

const productSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  subcategory: String,
  price: { type: Number, required: true },
  image: String,
  slug: { type: String, unique: true },
}, { timestamps: true });

// Pre-save hook to generate slug and normalize category/subcategory
productSchema.pre('save', function(next) {
  if (this.name) {
    this.slug = toSlug(this.name);
  }
  if (this.category) {
    this.category = toSlug(this.category);
  }
  if (this.subcategory) {
    this.subcategory = toSlug(this.subcategory);
  }
  next();
});

// Optional: pre-update hook for findOneAndUpdate
productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.name) update.slug = toSlug(update.name);
  if (update.category) update.category = toSlug(update.category);
  if (update.subcategory) update.subcategory = toSlug(update.subcategory);
  next();
});

module.exports = mongoose.model('Product', productSchema);
