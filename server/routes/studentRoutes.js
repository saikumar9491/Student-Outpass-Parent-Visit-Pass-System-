const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStudentProfile } = require('../controllers/studentController');

router.get('/profile', protect, authorize('student'), getStudentProfile);

module.exports = router;
