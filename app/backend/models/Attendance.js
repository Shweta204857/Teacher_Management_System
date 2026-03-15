const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
