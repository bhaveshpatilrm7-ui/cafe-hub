const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review for a purchased product
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, orderId } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Product ID, rating (1-5), and comment are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Verify user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      'items.product': productId,
      status: { $in: ['Delivered', 'Ready', 'Out for Delivery', 'Completed'] }
    });

    if (!hasPurchased && req.user.role === 'customer') {
      return res.status(403).json({
        success: false,
        error: 'You can only review products that you have ordered and received.'
      });
    }

    // Check duplicate review
    const existing = await Review.findOne({ product: productId, user: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      order: orderId || (hasPurchased ? hasPurchased._id : null),
      rating: Number(rating),
      comment
    });

    // Update Product average rating & review count
    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      product.rating = Math.round(stats[0].avgRating * 10) / 10;
      product.numReviews = stats[0].numReviews;
      await product.save();
    }

    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review (Admin or owner)
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await review.deleteOne();

    // Recalculate product rating
    const product = await Product.findById(productId);
    if (product) {
      const stats = await Review.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
      ]);
      if (stats.length > 0) {
        product.rating = Math.round(stats[0].avgRating * 10) / 10;
        product.numReviews = stats[0].numReviews;
      } else {
        product.rating = 4.5;
        product.numReviews = 0;
      }
      await product.save();
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
