const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const Inventory = require('../models/Inventory');

// @desc    Get complete admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay } });

    // Revenue calculations (excluding cancelled orders)
    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueAgg.length > 0 ? Math.round(totalRevenueAgg[0].total) : 0;

    const todayRevenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const todayRevenue = todayRevenueAgg.length > 0 ? Math.round(todayRevenueAgg[0].total) : 0;

    // Low stock products count
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
    });

    // Pending reservations count
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });

    // Orders status distribution for chart
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Monthly revenue over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthly = monthlyRevenue.map(item => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: Math.round(item.revenue),
      orders: item.orders
    }));

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: '$items.itemTotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalOrders,
          todayOrders,
          totalRevenue,
          todayRevenue,
          totalProducts,
          lowStockCount,
          pendingReservations
        },
        charts: {
          ordersByStatus: ordersByStatus.map(o => ({ name: o._id, count: o.count })),
          monthlyRevenue: formattedMonthly,
          topProducts: topProducts.map(p => ({ name: p._id, quantity: p.totalQuantity, sales: Math.round(p.totalSales) }))
        },
        recentOrders
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get inventory items
// @route   GET /api/admin/inventory
// @access  Private/Admin
exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find().sort({ status: 1, item: 1 });
    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (err) {
    next(err);
  }
};

// @desc    Create / Update inventory item
// @route   POST /api/admin/inventory
// @access  Private/Admin
exports.saveInventory = async (req, res, next) => {
  try {
    const { id, item, category, quantity, unit, minThreshold } = req.body;

    let inventory;
    if (id) {
      inventory = await Inventory.findByIdAndUpdate(id, { item, category, quantity, unit, minThreshold }, { new: true, runValidators: true });
    } else {
      inventory = await Inventory.create({ item, category, quantity, unit, minThreshold });
    }

    res.status(200).json({ success: true, data: inventory });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/admin/inventory/:id
// @access  Private/Admin
exports.deleteInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ success: false, error: 'Item not found' });
    await inventory.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
