const bcrypt  = require('bcryptjs');
const Teacher = require('../models/Teacher');

/* ── GET all teachers ──────────────────────────────────────── */
const getTeachers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name:      { $regex: search, $options: 'i' } },
          { teacherId: { $regex: search, $options: 'i' } },
          { subject:   { $regex: search, $options: 'i' } },
          { email:     { $regex: search, $options: 'i' } },
          { department:{ $regex: search, $options: 'i' } },
        ],
      };
    }
    const teachers = await Teacher.find(query).select('-password').sort({ createdAt: -1 });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET single teacher ────────────────────────────────────── */
const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select('-password');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── POST create teacher ───────────────────────────────────── */
const createTeacher = async (req, res) => {
  try {
    const { email, teacherId, password } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required' });

    const emailExists = await Teacher.findOne({ email: email.toLowerCase() });
    if (emailExists) return res.status(400).json({ message: 'Email already in use' });

    const idExists = await Teacher.findOne({ teacherId });
    if (idExists) return res.status(400).json({ message: 'Teacher ID already in use' });

    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/${req.file.filename}`;

    // Use model.create — the pre-save hook will hash the password
    const teacher = await Teacher.create(data);
    const result  = teacher.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── PUT update teacher ────────────────────────────────────── */
const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const updates = { ...req.body };
    if (req.file) updates.photo = `/uploads/${req.file.filename}`;

    // Handle password separately through the model so the hook fires
    if (updates.password && updates.password.trim() !== '') {
      teacher.password = updates.password; // pre-save will hash it
      await teacher.save();
    }
    delete updates.password; // don't pass plain text to findByIdAndUpdate

    const updated = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── DELETE teacher ────────────────────────────────────────── */
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher };
