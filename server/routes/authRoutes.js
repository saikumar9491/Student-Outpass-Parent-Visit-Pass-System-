const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerStudent,
  registerParent,
  loginUser,
  loginAdmin,
  updateProfileImage
} = require('../controllers/authController');

router.post('/register/student', registerStudent);
router.post('/register/parent', registerParent);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.put('/profile-image', protect, updateProfileImage);

module.exports = router;
