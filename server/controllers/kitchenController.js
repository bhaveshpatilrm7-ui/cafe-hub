const Order = require('../models/Order');

// @desc    Get active kitchen orders (Pending, Confirmed, Preparing, Ready)
// @route   GET /api/kitchen/orders
// @access  Private/Staff/Admin
exports.getKitchenOrders = async (req, res, next) => {
  try {
    const activeStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready'];
    const orders = await Order.find({ status: { $in: activeStatuses } })
      .populate('user', 'name phone')
      .sort({ createdAt: 1 }); // Oldest first for queue priority

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};
