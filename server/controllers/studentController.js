const User = require('../models/User');
const Student = require('../models/Student');
const Outpass = require('../models/Outpass');
const { lazyCheckOutpass } = require('../utils/lazyCheck');

// @desc    Get logged in student profile
// @route   GET /api/students/profile
// @access  Private (Student)
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: 'parentIds',
      select: 'name email phone role'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Apply for outpass
// @route   POST /api/outpasses
// @access  Private (Student)
const applyOutpass = async (req, res) => {
  try {
    const { destination, purpose, outingDate, expectedReturnDate, emergencyContact, remarks } = req.body;

    if (!destination || !purpose || !outingDate || !expectedReturnDate || !emergencyContact) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const start = new Date(outingDate);
    const end = new Date(expectedReturnDate);

    if (start >= end) {
      return res.status(400).json({ message: 'Expected return time must be after outing time' });
    }

    // Give a small 5 minutes buffer for current time checks to prevent clock drift issues
    const nowBuffer = new Date();
    nowBuffer.setMinutes(nowBuffer.getMinutes() - 5);
    if (start < nowBuffer) {
      return res.status(400).json({ message: 'Outing time cannot be in the past' });
    }

    // Business rule: A student can't open a second outpass while one is already approved/active or pending for an overlapping period.
    const overlappingOutpass = await Outpass.findOne({
      studentId: student._id,
      status: { $in: ['PENDING', 'APPROVED'] },
      outingDate: { $lt: end },
      expectedReturnDate: { $gt: start }
    });

    if (overlappingOutpass) {
      return res.status(400).json({
        message: 'You already have an active or pending outpass request that overlaps with this time period.'
      });
    }

    const outpass = await Outpass.create({
      studentId: student._id,
      destination,
      purpose,
      outingDate: start,
      expectedReturnDate: end,
      emergencyContact,
      remarks,
      status: 'PENDING'
    });

    res.status(201).json(outpass);
  } catch (error) {
    console.error('Apply outpass error:', error);
    res.status(500).json({ message: 'Server error processing outpass application', error: error.message });
  }
};

// @desc    Get all outpasses for logged in student
// @route   GET /api/outpasses/my
// @access  Private (Student)
const getMyOutpasses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const outpasses = await Outpass.find({ studentId: student._id }).sort({ createdAt: -1 });

    // Perform lazy expiration check
    const checkedOutpasses = await Promise.all(outpasses.map(lazyCheckOutpass));

    res.json(checkedOutpasses);
  } catch (error) {
    console.error('Get my outpasses error:', error);
    res.status(500).json({ message: 'Server error retrieving outpasses' });
  }
};

// @desc    Get outpass details by ID
// @route   GET /api/outpasses/:id
// @access  Private (Student, Admin)
const getOutpassDetails = async (req, res) => {
  try {
    const outpass = await Outpass.findById(req.params.id).populate({
      path: 'studentId',
      select: 'name studentId department year hostel roomNumber email phone'
    });

    if (!outpass) {
      return res.status(404).json({ message: 'Outpass request not found' });
    }

    // Check authorization: must be the student who owns the outpass, or an admin
    const student = await Student.findOne({ userId: req.user._id });
    const isOwner = student && outpass.studentId._id.toString() === student._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this outpass' });
    }

    // Perform lazy check
    const checkedOutpass = await lazyCheckOutpass(outpass);

    res.json(checkedOutpass);
  } catch (error) {
    console.error('Get outpass details error:', error);
    res.status(500).json({ message: 'Server error retrieving outpass details' });
  }
};

// @desc    Cancel a pending outpass request
// @route   DELETE /api/outpasses/:id
// @access  Private (Student)
const cancelOutpass = async (req, res) => {
  try {
    const outpass = await Outpass.findById(req.params.id);

    if (!outpass) {
      return res.status(404).json({ message: 'Outpass request not found' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student || outpass.studentId.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this outpass' });
    }

    if (outpass.status !== 'PENDING') {
      return res.status(400).json({ message: `Cannot cancel a pass that is already ${outpass.status}` });
    }

    outpass.status = 'CANCELLED';
    await outpass.save();

    res.json({ message: 'Outpass request cancelled successfully', outpass });
  } catch (error) {
    console.error('Cancel outpass error:', error);
    res.status(500).json({ message: 'Server error cancelling outpass' });
  }
};

module.exports = {
  getStudentProfile,
  applyOutpass,
  getMyOutpasses,
  getOutpassDetails,
  cancelOutpass
};
