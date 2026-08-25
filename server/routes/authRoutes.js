const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerParent,
  loginUser,
  loginAdmin
} = require('../controllers/authController');

router.post('/register/student', registerStudent);
router.post('/register/parent', registerParent);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);

module.exports = router;
