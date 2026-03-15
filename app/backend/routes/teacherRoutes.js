const express = require('express');
const router = express.Router();
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, getTeachers)
  .post(protect, adminOnly, upload.single('photo'), createTeacher);

router.route('/:id')
  .get(protect, getTeacher)
  .put(protect, adminOnly, upload.single('photo'), updateTeacher)
  .delete(protect, adminOnly, deleteTeacher);

module.exports = router;
