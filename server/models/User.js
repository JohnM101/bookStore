// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================
// USER SCHEMA
// ============================
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },

    address: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      telephone: String,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // 🔹 Distinguish Google vs Email users
    loginMethod: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
  },
  { timestamps: true }
);

// ============================
// METHODS
// ============================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================
// MIDDLEWARE
// ============================
userSchema.pre('save', async function (next) {
  // Only hash if password is new or changed
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================
// EXPORT
// ============================
module.exports = mongoose.model('User', userSchema);
