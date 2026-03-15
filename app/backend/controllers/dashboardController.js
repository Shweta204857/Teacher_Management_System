const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Schedule = require('../models/Schedule');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ status: 'Active' });
    const todayAttendance = await Attendance.find({ date: today });
    const presentToday = todayAttendance.filter(r => r.status === 'Present').length;
    const absentToday = todayAttendance.filter(r => r.status === 'Absent').length;
    const totalSchedules = await Schedule.countDocuments();
    const recentTeachers = await Teacher.find().select('-password').sort({ createdAt: -1 }).limit(5);
    const todaySchedules = await Schedule.find().populate('teacher', 'name subject photo').limit(6);

    res.json({
      totalTeachers,
      activeTeachers,
      presentToday,
      absentToday,
      totalSchedules,
      recentTeachers,
      todaySchedules,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
