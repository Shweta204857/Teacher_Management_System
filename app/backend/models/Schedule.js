const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  section: { type: String, default: '' }, // e.g. "A", "B"
  semester: { type: String, default: '' }, // e.g. "IV"
  timetableName: { type: String, default: '' }, // e.g. "B.Tech CSE 2025-26"
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
