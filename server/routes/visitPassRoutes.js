const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  requestVisitPass,
  getMyVisitRequests,
  getVisitPassDetails
} = require('../controllers/parentController');

router.route('/')
  .post(protect, authorize('parent'), requestVisitPass);

router.route('/my')
  .get(protect, authorize('parent'), getMyVisitRequests);

router.route('/:id')
  .get(protect, authorize('parent', 'student', 'admin'), getVisitPassDetails);

module.exports = router;
