const express = require('express');
const router = express.Router();
const { markAttendance, bulkMarkAttendance, getAttendance, getTodaySummary } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getAttendance);
router.post('/', protect, adminOnly, markAttendance);
router.post('/bulk', protect, adminOnly, bulkMarkAttendance);
router.get('/today', protect, getTodaySummary);

module.exports = router;
