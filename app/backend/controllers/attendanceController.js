const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { teacherId, date, status } = req.body;
    if (!teacherId || !date || !status)
      return res.status(400).json({ message: 'teacherId, date, and status are required' });

    const existing = await Attendance.findOne({ teacher: teacherId, date });
    if (existing) {
      existing.status = status;
      existing.markedBy = req.user._id;
      await existing.save();
      return res.json(existing);
    }

    const record = await Attendance.create({ teacher: teacherId, date, status, markedBy: req.user._id });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Bulk mark attendance
const bulkMarkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !records || !Array.isArray(records))
      return res.status(400).json({ message: 'date and records[] are required' });

    const results = [];
    for (const r of records) {
      const existing = await Attendance.findOne({ teacher: r.teacherId, date });
      if (existing) {
        existing.status = r.status;
        await existing.save();
        results.push(existing);
      } else {
        const rec = await Attendance.create({ teacher: r.teacherId, date, status: r.status, markedBy: req.user._id });
        results.push(rec);
      }
    }
    res.json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get attendance records
const getAttendance = async (req, res) => {
  try {
    const { date, teacherId, month } = req.query;
    let query = {};
    if (date) query.date = date;
    if (teacherId) query.teacher = teacherId;
    if (month) query.date = { $regex: `^${month}` };

    const records = await Attendance.find(query)
      .populate('teacher', 'name teacherId subject photo')
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get today's summary
const getTodaySummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await Attendance.find({ date: today }).populate('teacher', 'name');
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leave = records.filter(r => r.status === 'Leave').length;
    res.json({ date: today, present, absent, leave, total: records.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markAttendance, bulkMarkAttendance, getAttendance, getTodaySummary };
