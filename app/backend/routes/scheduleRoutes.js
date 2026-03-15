const express = require('express');
const router = express.Router();
const {
  getSchedules, getTimetableNames, createSchedule,
  bulkCreateSchedules, updateSchedule, deleteSchedule, deleteTimetable
} = require('../controllers/scheduleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// IMPORTANT: specific named routes MUST come before /:id param routes
router.get('/timetables', protect, adminOnly, getTimetableNames);
router.post('/bulk', protect, adminOnly, bulkCreateSchedules);
router.delete('/timetable/:name', protect, adminOnly, deleteTimetable);

router.route('/').get(protect, getSchedules).post(protect, adminOnly, createSchedule);
router.route('/:id').put(protect, adminOnly, updateSchedule).delete(protect, adminOnly, deleteSchedule);

module.exports = router;
