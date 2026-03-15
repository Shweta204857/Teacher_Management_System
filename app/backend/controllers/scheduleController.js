const Schedule = require('../models/Schedule');

const getSchedules = async (req, res) => {
  try {
    const { teacherId, timetableName } = req.query;
    const query = {};
    if (teacherId) query.teacher = teacherId;
    if (timetableName) query.timetableName = timetableName;
    const schedules = await Schedule.find(query)
      .populate('teacher', 'name teacherId subject photo department')
      .sort({ day: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTimetableNames = async (req, res) => {
  try {
    const names = await Schedule.distinct('timetableName');
    res.json(names.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    const populated = await Schedule.findById(schedule._id)
      .populate('teacher', 'name teacherId subject department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const bulkCreateSchedules = async (req, res) => {
  try {
    const { schedules } = req.body;
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ message: 'No schedules provided' });
    }
    const created = await Schedule.insertMany(schedules);
    const ids = created.map(s => s._id);
    const populated = await Schedule.find({ _id: { $in: ids } })
      .populate('teacher', 'name teacherId subject department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('teacher', 'name teacherId subject department');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const { name } = req.params;
    await Schedule.deleteMany({ timetableName: decodeURIComponent(name) });
    res.json({ message: 'Timetable deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSchedules, getTimetableNames, createSchedule, bulkCreateSchedules, updateSchedule, deleteSchedule, deleteTimetable };
