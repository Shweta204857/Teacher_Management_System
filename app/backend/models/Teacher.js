const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  teacherId:        { type: String, required: true, unique: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:            { type: String, required: true },
  gender:           { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dob:              { type: Date },
  address:          { type: String },
  qualification:    { type: String, required: true },
  subject:          { type: String, required: true },
  department:       { type: String },
  experience:       { type: String },
  joiningDate:      { type: Date, default: Date.now },
  salary:           { type: Number, default: 0 },
  photo:            { type: String, default: '' },
  password:         { type: String, required: true },
  role:             { type: String, default: 'teacher' },
  status:           { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
  designation:      { type: String, default: '' },
  areaOfInterest:   { type: String, default: '' },
  emergencyContact: { type: String },
  bloodGroup:       { type: String },
  nationalId:       { type: String },
  paidLeavesRemaining: { type: Number, default: 10 },
}, { timestamps: true });

// Only hash if not already a bcrypt hash
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password.startsWith('$2')) return next(); // already hashed
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

teacherSchema.methods.matchPassword = async function (entered) {
  // Handle both plain text (from mongosh seed) and bcrypt hashes
  if (this.password.startsWith('$2')) {
    return bcrypt.compare(entered, this.password);
  }
  // Plain text — compare then auto-upgrade to bcrypt
  if (entered === this.password) {
    this.password = await bcrypt.hash(entered, 10);
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('Teacher', teacherSchema);
