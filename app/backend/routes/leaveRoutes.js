const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, reviewLeave, cancelLeave } = require('../controllers/leaveController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// IMPORTANT: named routes before /:id
router.get('/my', protect, getMyLeaves);
router.put('/:id/review', protect, adminOnly, reviewLeave);

router.route('/').get(protect, adminOnly, getAllLeaves).post(protect, applyLeave);
router.route('/:id').delete(protect, cancelLeave);

module.exports = router;
