const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  verifyPayment,
  payCodBillOnline
} = require('../controllers/orderController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/status', authorize('staff', 'admin'), updateOrderStatus);
router.put('/:id/verify-payment', authorize('staff', 'admin'), verifyPayment);
router.put('/:id/pay-online', payCodBillOnline);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
