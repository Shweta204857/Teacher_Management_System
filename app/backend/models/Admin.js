const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'admin' },
}, { timestamps: true });

// Only hash if it's not already a bcrypt hash
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password.startsWith('$2')) return next(); // already hashed
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.matchPassword = async function (entered) {
  // Handle both plain text (from mongosh seed) and bcrypt hashes
  if (this.password.startsWith('$2')) {
    return bcrypt.compare(entered, this.password);
  }
  // Plain text — compare directly then auto-upgrade
  if (entered === this.password) {
    this.password = await bcrypt.hash(entered, 10);
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Admin', adminSchema);
