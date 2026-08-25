const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getParentProfile,
  changeParentPassword,
  getChildCollegeData
} = require('../controllers/parentController');

router.get('/profile', protect, authorize('parent'), getParentProfile);
router.put('/change-password', protect, authorize('parent'), changeParentPassword);
router.get('/child-data/:studentId', protect, authorize('parent'), getChildCollegeData);

module.exports = router;
