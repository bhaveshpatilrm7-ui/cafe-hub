const express = require('express');
const {
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.post('/validate', validateCoupon);

router.use(protect);

router.route('/')
  .get(authorize('admin'), getCoupons)
  .post(authorize('admin'), createCoupon);

router.route('/:id')
  .put(authorize('admin'), updateCoupon)
  .delete(authorize('admin'), deleteCoupon);

module.exports = router;
