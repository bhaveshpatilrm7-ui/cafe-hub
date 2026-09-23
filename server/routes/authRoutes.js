const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  getUsers,
  updateUserRoleStatus
} = require('../controllers/authController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Admin user management routes
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUserRoleStatus);

module.exports = router;
