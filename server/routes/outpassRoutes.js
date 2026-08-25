const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyOutpass,
  getMyOutpasses,
  getOutpassDetails,
  cancelOutpass
} = require('../controllers/studentController');

router.route('/')
  .post(protect, authorize('student'), applyOutpass);

router.route('/my')
  .get(protect, authorize('student'), getMyOutpasses);

router.route('/:id')
  .get(protect, authorize('student', 'admin'), getOutpassDetails)
  .delete(protect, authorize('student'), cancelOutpass);

module.exports = router;
