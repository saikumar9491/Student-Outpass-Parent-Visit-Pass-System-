const User = require('../models/User');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register a new student
// @route   POST /api/auth/register/student
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { name, email, password, phone, studentId, department, year, hostel, roomNumber } = req.body;

    if (!name || !email || !password || !phone || !studentId || !department || !year || !hostel || !roomNumber) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if student ID already exists
    const studentIdExists = await Student.findOne({ studentId: studentId.trim() });
    if (studentIdExists) {
      return res.status(400).json({ message: 'Student with this Register/ID number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: 'student'
    });

    // Create Student
    const student = await Student.create({
      userId: user._id,
      studentId: studentId.trim(),
      name,
      email: email.toLowerCase(),
      phone,
      department,
      year,
      hostel,
      roomNumber,
      parentIds: []
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      studentDetails: student
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Server error during student registration', error: error.message });
  }
};

// @desc    Register a new parent
// @route   POST /api/auth/register/parent
// @access  Public
const registerParent = async (req, res) => {
  try {
    const { name, email, password, phone, relationship, studentId } = req.body;

    if (!name || !email || !password || !phone || !relationship || !studentId) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Look up student by studentId
    const student = await Student.findOne({ studentId: studentId.trim() });
    if (!student) {
      return res.status(400).json({ message: `No student found with ID/Register number: ${studentId}. Please ensure the student is registered first.` });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate unique Parent ID
    let parentId = '';
    let parentIdExists = true;
    while (parentIdExists) {
      const randNum = Math.floor(100000 + Math.random() * 900000);
      parentId = `PAR-${randNum}`;
      const existing = await Parent.findOne({ parentId });
      if (!existing) {
        parentIdExists = false;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: 'parent'
    });

    // Create Parent
    const parent = await Parent.create({
      userId: user._id,
      parentId,
      needsPasswordChange: true,
      name,
      email: email.toLowerCase(),
      phone,
      relationship,
      studentIds: [student._id]
    });

    // Link Parent to Student
    student.parentIds.push(user._id);
    await student.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      parentDetails: parent
    });
  } catch (error) {
    console.error('Parent registration error:', error);
    res.status(500).json({ message: 'Server error during parent registration', error: error.message });
  }
};

// @desc    Login student/parent
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // 'email' acts as either Email or Parent ID

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter credentials and password' });
    }

    const loginIdentifier = email.trim();
    let user = null;

    if (loginIdentifier.toUpperCase().startsWith('PAR-')) {
      const parentRecord = await Parent.findOne({ parentId: loginIdentifier.toUpperCase() });
      if (!parentRecord) {
        return res.status(401).json({ message: 'Invalid Parent ID or password' });
      }
      user = await User.findById(parentRecord.userId);
    } else {
      user = await User.findOne({ email: loginIdentifier.toLowerCase() });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email, Parent ID or password' });
    }

    if (user.role === 'admin') {
      return res.status(401).json({ message: 'Admin accounts must use the admin login portal' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email, Parent ID or password' });
    }

    let profileDetails = null;
    if (user.role === 'student') {
      profileDetails = await Student.findOne({ userId: user._id });
    } else if (user.role === 'parent') {
      profileDetails = await Parent.findOne({ userId: user._id }).populate({
        path: 'studentIds',
        select: 'name studentId hostel roomNumber department year collegeData'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id),
      profile: profileDetails
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Login Admin
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body; // 'email' acts as either Email or Admin ID

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter credentials and password' });
    }

    const loginIdentifier = email.trim();
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { phone: loginIdentifier }
      ]
    });

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid credentials or not authorized as admin' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login', error: error.message });
  }
};

module.exports = {
  registerStudent,
  registerParent,
  loginUser,
  loginAdmin
};
