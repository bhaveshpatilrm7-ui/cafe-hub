const express = require('express');
const {
  getDashboardStats,
  getInventory,
  saveInventory,
  deleteInventory
} = require('../controllers/adminController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/inventory', getInventory);
router.post('/inventory', saveInventory);
router.delete('/inventory/:id', deleteInventory);

module.exports = router;
