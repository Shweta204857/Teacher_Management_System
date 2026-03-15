const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  leaveType: {
    type: String,
    enum: ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Personal Leave', 'Other'],
    required: true,
  },
  fromDate: { type: Date, required: true },
  toDate:   { type: Date, required: true },
  totalDays: { type: Number, required: true },
  reason:   { type: String, required: true },
  isPaid:   { type: Boolean, default: true }, // auto-set based on remaining paid leaves
  paidDaysUsed: { type: Number, default: 0 },
  unpaidDaysUsed: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  adminRemarks: { type: String, default: '' },
  reviewedAt: { type: Date },
  reviewedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
