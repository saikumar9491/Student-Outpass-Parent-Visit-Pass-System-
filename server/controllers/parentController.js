const User = require('../models/User');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const VisitPass = require('../models/VisitPass');
const { lazyCheckVisitPass } = require('../utils/lazyCheck');
const bcrypt = require('bcryptjs');

// @desc    Get logged in parent profile with linked students
// @route   GET /api/parents/profile
// @access  Private (Parent)
const getParentProfile = async (req, res) => {
  try {
    const parent = await Parent.findOne({ userId: req.user._id }).populate({
      path: 'studentIds',
      select: 'name studentId department year hostel roomNumber email phone'
    });

    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    res.json(parent);
  } catch (error) {
    console.error('Get parent profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Request a visit pass
// @route   POST /api/visit-passes
// @access  Private (Parent)
const requestVisitPass = async (req, res) => {
  try {
    const {
      studentId,
      visitorName,
      relationship,
      phone,
      visitDate,
      arrivalTime,
      departureTime,
      purpose,
      visitorCount,
      visitorNames,
      idProofType,
      idProofNumber
    } = req.body;

    if (!studentId || !visitorName || !relationship || !phone || !visitDate || !arrivalTime || !departureTime || !purpose || !idProofType || !idProofNumber) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const parent = await Parent.findOne({ userId: req.user._id });
    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    // Verify student is linked to this parent
    if (!parent.studentIds.includes(studentId)) {
      return res.status(400).json({ message: 'Selected student is not linked to your parent account' });
    }

    const selectedVisitDate = new Date(visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedVisitDate < today) {
      return res.status(400).json({ message: 'Visit date cannot be in the past' });
    }

    // Business rule: A parent can't submit a duplicate visit request for the same student/date/time.
    // We check if a request for the same student on the same day is already pending or approved
    const startOfDay = new Date(visitDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(visitDate);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicateVisit = await VisitPass.findOne({
      studentId,
      visitDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['PENDING', 'APPROVED'] }
    });

    if (duplicateVisit) {
      return res.status(400).json({
        message: 'A visit request is already pending or approved for this student on the selected date.'
      });
    }

    const visitPass = await VisitPass.create({
      parentId: parent._id,
      studentId,
      visitorName,
      relationship,
      phone,
      visitDate: selectedVisitDate,
      arrivalTime,
      departureTime,
      purpose,
      visitorCount: visitorCount || 1,
      visitorNames: visitorNames || [],
      idProofType,
      idProofNumber,
      status: 'PENDING'
    });

    res.status(201).json(visitPass);
  } catch (error) {
    console.error('Request visit pass error:', error);
    res.status(500).json({ message: 'Server error requesting visit pass', error: error.message });
  }
};

// @desc    Get all visit passes requested by logged in parent
// @route   GET /api/visit-passes/my
// @access  Private (Parent)
const getMyVisitRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'parent') {
      const parent = await Parent.findOne({ userId: req.user._id });
      if (!parent) {
        return res.status(404).json({ message: 'Parent profile not found' });
      }
      query = { parentId: parent._id };
    } else if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      query = { studentId: student._id };
    } else {
      return res.status(403).json({ message: 'Not authorized for this resource' });
    }

    const visitRequests = await VisitPass.find(query)
      .populate({
        path: 'studentId',
        select: 'name studentId hostel roomNumber'
      })
      .populate({
        path: 'parentId',
        select: 'name parentId relationship phone'
      })
      .sort({ createdAt: -1 });

    // Perform lazy checks
    const checkedVisits = await Promise.all(visitRequests.map(lazyCheckVisitPass));

    res.json(checkedVisits);
  } catch (error) {
    console.error('Get my visit requests error:', error);
    res.status(500).json({ message: 'Server error retrieving visit requests' });
  }
};

// @desc    Get visit pass details by ID
// @route   GET /api/visit-passes/:id
// @access  Private (Parent, Student, Admin)
const getVisitPassDetails = async (req, res) => {
  try {
    const visitPass = await VisitPass.findById(req.params.id)
      .populate({
        path: 'studentId',
        select: 'name studentId department year hostel roomNumber email phone userId'
      })
      .populate({
        path: 'parentId',
        select: 'name email phone relationship userId'
      });

    if (!visitPass) {
      return res.status(404).json({ message: 'Visit pass request not found' });
    }

    // Authorization check
    const isParentOwner = req.user.role === 'parent' && visitPass.parentId.userId.toString() === req.user._id.toString();
    const isStudentChild = req.user.role === 'student' && visitPass.studentId.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isParentOwner && !isStudentChild && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this visit pass details' });
    }

    // Perform lazy check
    const checkedPass = await lazyCheckVisitPass(visitPass);

    res.json(checkedPass);
  } catch (error) {
    console.error('Get visit pass details error:', error);
    res.status(500).json({ message: 'Server error retrieving visit pass details' });
  }
};

const changeParentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Mark needsPasswordChange as false
    await Parent.findOneAndUpdate(
      { userId: req.user._id },
      { needsPasswordChange: false }
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change parent password error:', error);
    res.status(500).json({ message: 'Server error updating password' });
  }
};

const getChildCollegeData = async (req, res) => {
  try {
    const parent = await Parent.findOne({ userId: req.user._id });
    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    const studentId = req.params.studentId;
    
    // Check if parent is authorized to view this student
    if (!parent.studentIds.map(id => id.toString()).includes(studentId)) {
      return res.status(403).json({ message: 'Unauthorized to view this child details' });
    }

    const student = await Student.findById(studentId).select('name studentId department year hostel roomNumber collegeData');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get child college data error:', error);
    res.status(500).json({ message: 'Server error retrieving child data' });
  }
};

module.exports = {
  getParentProfile,
  requestVisitPass,
  getMyVisitRequests,
  getVisitPassDetails,
  changeParentPassword,
  getChildCollegeData
};
