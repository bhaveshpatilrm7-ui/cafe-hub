const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
  clearCart
} = require('../controllers/cartController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.delete('/clear', clearCart);

module.exports = router;
