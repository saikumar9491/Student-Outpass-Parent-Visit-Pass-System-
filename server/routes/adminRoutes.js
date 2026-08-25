const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOutpasses,
  getAllVisitPasses,
  approveOutpass,
  rejectOutpass,
  approveVisitPass,
  rejectVisitPass,
  getUsersList,
  createStudentByAdmin,
  createParentByAdmin,
  deleteUserByAdmin
} = require('../controllers/adminController');

// All admin routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/outpasses', getAllOutpasses);
router.get('/visit-passes', getAllVisitPasses);
router.put('/outpasses/:id/approve', approveOutpass);
router.put('/outpasses/:id/reject', rejectOutpass);
router.put('/visit-passes/:id/approve', approveVisitPass);
router.put('/visit-passes/:id/reject', rejectVisitPass);
router.get('/users', getUsersList);
router.post('/users/student', createStudentByAdmin);
router.post('/users/parent', createParentByAdmin);
router.delete('/users/:id', deleteUserByAdmin);

module.exports = router;
