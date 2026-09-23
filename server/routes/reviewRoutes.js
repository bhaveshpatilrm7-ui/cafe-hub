const express = require('express');
const {
  getProductReviews,
  addReview,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
