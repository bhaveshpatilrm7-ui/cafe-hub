const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

// Generate unique readable order number
const generateOrderNumber = () => {
  const prefix = 'CAF';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}-${random}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'COD', couponCode, notes, paymentReference } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine || !shippingAddress.phone) {
      return res.status(400).json({ success: false, error: 'Complete shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Your cart is empty' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Verify each product, price and stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found` });
      }

      if (!product.isAvailable || product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for '${product.name}'. Available: ${product.stockQuantity}`
        });
      }

      let unitPrice = product.basePrice;
      if (product.discountPercent > 0) {
        unitPrice = unitPrice * (1 - product.discountPercent / 100);
      }
      if (item.size && item.size.price) {
        unitPrice += item.size.price;
      }
      if (item.addOns && item.addOns.length > 0) {
        const addOnsSum = item.addOns.reduce((s, a) => s + (a.price || 0), 0);
        unitPrice += addOnsSum;
      }

      unitPrice = Math.round(unitPrice * 100) / 100;
      const itemTotal = Math.round((unitPrice * item.quantity) * 100) / 100;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: unitPrice,
        size: item.size,
        sugarLevel: item.sugarLevel,
        addOns: item.addOns,
        itemTotal
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    // Server-side Coupon validation
    let discount = 0;
    const effectiveCouponCode = couponCode || cart.couponCode;
    if (effectiveCouponCode) {
      const coupon = await Coupon.findOne({ code: effectiveCouponCode.toUpperCase(), isActive: true });
      if (coupon && new Date(coupon.expiryDate) > new Date() && subtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.min(discount, subtotal);
        discount = Math.round(discount * 100) / 100;

        // Increment usage limit
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const tax = Math.round((subtotal * 0.05) * 100) / 100; // 5% GST
    const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery above 500
    const totalAmount = Math.max(0, Math.round((subtotal + tax + deliveryFee - discount) * 100) / 100);

    // Deduct stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    const orderNumber = generateOrderNumber();

    const isCod = paymentMethod === 'COD';
    const order = await Order.create({
      orderNumber,
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      paymentVerificationStatus: 'Pending',
      paymentAmount: isCod ? 0 : totalAmount,
      amountDue: totalAmount,
      paymentCompletedVia: isCod ? '' : 'UPI',
      paymentReference: paymentReference ? String(paymentReference).trim() : '',
      subtotal,
      tax,
      deliveryFee,
      discount,
      couponCode: effectiveCouponCode || '',
      totalAmount,
      status: 'Pending',
      notes: notes || '',
      statusHistory: [{ status: 'Pending', comment: `Order placed successfully via ${paymentMethod}` }]
    });

    // Clear Cart
    cart.items = [];
    cart.couponCode = '';
    cart.discountAmount = 0;
    cart.subtotal = 0;
    cart.tax = 0;
    cart.deliveryFee = 0;
    cart.grandTotal = 0;
    await cart.save();

    // Create Notification
    await Notification.create({
      user: req.user.id,
      title: 'Order Placed!',
      message: `Your order #${orderNumber} has been placed successfully.`,
      type: 'order',
      link: `/orders/${order._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user orders or all orders (Staff/Admin)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (req.user.role === 'customer') {
      query.user = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image category');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.user._id.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (Staff / Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Staff/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      comment: comment || `Status updated to ${status}`
    });

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    await order.save();

    // Create Notification for user
    await Notification.create({
      user: order.user,
      title: `Order Update: #${order.orderNumber}`,
      message: `Your order is now ${status}.`,
      type: 'order',
      link: `/orders/${order._id}`
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order (Customer if Pending)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role === 'customer') {
      return res.status(401).json({ success: false, error: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'Pending' && req.user.role === 'customer') {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled as it is already being prepared or processed'
      });
    }

    order.status = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      comment: 'Cancelled by customer'
    });

    // Restore inventory stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or Reject payment for an order (Admin / Staff)
// @route   PUT /api/orders/:id/verify-payment
// @access  Private/Staff/Admin
exports.verifyPayment = async (req, res, next) => {
  try {
    const { action } = req.body; // 'verify' or 'reject'
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (action === 'verify') {
      order.paymentStatus = 'Paid';
      order.paymentVerificationStatus = 'Verified';
      order.statusHistory.push({
        status: order.status,
        comment: 'Payment verified and confirmed by admin'
      });
    } else if (action === 'reject') {
      order.paymentStatus = 'Failed';
      order.paymentVerificationStatus = 'Rejected';
      order.statusHistory.push({
        status: order.status,
        comment: 'Payment rejected by admin'
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action. Use verify or reject.' });
    }

    await order.save();

    await Notification.create({
      user: order.user,
      title: `Payment Update for #${order.orderNumber}`,
      message: action === 'verify' ? 'Your UPI payment has been verified and confirmed!' : 'Your UPI payment verification was rejected.',
      type: 'order',
      link: `/orders/${order._id}`
    });

    res.status(200).json({
      success: true,
      message: action === 'verify' ? 'Payment verified successfully' : 'Payment rejected',
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Pay existing COD order bill online via UPI
// @route   PUT /api/orders/:id/pay-online
// @access  Private
exports.payCodBillOnline = async (req, res, next) => {
  try {
    const { paymentReference } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to pay for this order' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, error: 'Cannot pay for a cancelled order' });
    }

    if (order.paymentStatus === 'Paid' || order.amountDue === 0) {
      return res.status(400).json({ success: false, error: 'Order bill has already been paid' });
    }

    // Update existing order (DO NOT CREATE NEW ORDER, DO NOT REDUCE STOCK AGAIN, DO NOT TOUCH CART)
    order.paymentStatus = 'Paid';
    order.paymentVerificationStatus = 'Verified';
    order.paymentAmount = order.totalAmount;
    order.amountDue = 0;
    order.paymentCompletedVia = 'UPI';
    if (paymentReference) {
      order.paymentReference = String(paymentReference).trim();
    }
    order.statusHistory.push({
      status: order.status,
      comment: `Paid online via UPI${paymentReference ? ` (Ref: ${paymentReference})` : ''}`
    });

    await order.save();

    await Notification.create({
      user: order.user,
      title: `Bill Paid for #${order.orderNumber}`,
      message: `Your payment of ₹${order.totalAmount} was completed successfully online via UPI!`,
      type: 'order',
      link: `/orders/${order._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Bill paid online via UPI successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
};
