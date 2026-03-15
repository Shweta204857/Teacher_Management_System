const Leave = require('../models/Leave');
const Teacher = require('../models/Teacher');

// Teacher: Apply for leave
const applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const teacherId = req.user._id;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (to < from) return res.status(400).json({ message: 'End date must be after start date' });

    // Calculate total days (excluding weekends optional — keeping simple here)
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.round((to - from) / msPerDay) + 1;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const paidLeft = teacher.paidLeavesRemaining;
    let paidDaysUsed = 0;
    let unpaidDaysUsed = 0;
    let isPaid = false;

    if (paidLeft >= totalDays) {
      paidDaysUsed = totalDays;
      isPaid = true;
    } else if (paidLeft > 0) {
      paidDaysUsed = paidLeft;
      unpaidDaysUsed = totalDays - paidLeft;
      isPaid = false;
    } else {
      unpaidDaysUsed = totalDays;
      isPaid = false;
    }

    const leave = await Leave.create({
      teacher: teacherId,
      leaveType,
      fromDate: from,
      toDate: to,
      totalDays,
      reason,
      isPaid,
      paidDaysUsed,
      unpaidDaysUsed,
      status: 'Pending',
    });

    const populated = await Leave.findById(leave._id).populate('teacher', 'name teacherId subject photo paidLeavesRemaining');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: Get own leaves
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ teacher: req.user._id })
      .populate('teacher', 'name teacherId subject photo paidLeavesRemaining')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all leaves
const getAllLeaves = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const leaves = await Leave.find(filter)
      .populate('teacher', 'name teacherId subject photo paidLeavesRemaining department')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Approve or Reject leave
const reviewLeave = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave already reviewed' });
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks || '';
    leave.reviewedAt = new Date();
    leave.reviewedBy = req.user.name || 'Admin';
    await leave.save();

    // If approved, deduct paid leaves from teacher
    if (status === 'Approved' && leave.paidDaysUsed > 0) {
      await Teacher.findByIdAndUpdate(leave.teacher, {
        $inc: { paidLeavesRemaining: -leave.paidDaysUsed },
      });
    }

    // If rejected after approval was given (shouldn't happen here but safety)
    const populated = await Leave.findById(leave._id)
      .populate('teacher', 'name teacherId subject photo paidLeavesRemaining department');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: Cancel pending leave
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised' });
    }
    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot cancel a reviewed leave' });
    }
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, reviewLeave, cancelLeave };
