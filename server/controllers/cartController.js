const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Helper to recalculate cart totals safely on server
const recalculateCart = async (cart) => {
  let subtotal = 0;

  for (let item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    let unitPrice = product.basePrice;
    if (product.discountPercent > 0) {
      unitPrice = unitPrice * (1 - product.discountPercent / 100);
    }

    if (item.size && item.size.price) {
      unitPrice += item.size.price;
    }

    if (item.addOns && item.addOns.length > 0) {
      const addOnsTotal = item.addOns.reduce((sum, a) => sum + (a.price || 0), 0);
      unitPrice += addOnsTotal;
    }

    item.unitPrice = Math.round(unitPrice * 100) / 100;
    item.itemTotal = Math.round((item.unitPrice * item.quantity) * 100) / 100;
    subtotal += item.itemTotal;
  }

  cart.subtotal = Math.round(subtotal * 100) / 100;

  // Recalculate coupon discount if active
  if (cart.couponCode) {
    const coupon = await Coupon.findOne({ code: cart.couponCode, isActive: true });
    if (coupon && new Date(coupon.expiryDate) > new Date() && cart.subtotal >= coupon.minOrderAmount) {
      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (cart.subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else if (coupon.discountType === 'fixed') {
        discount = coupon.discountValue;
      }
      cart.discountAmount = Math.min(Math.round(discount * 100) / 100, cart.subtotal);
    } else {
      cart.couponCode = '';
      cart.discountAmount = 0;
    }
  } else {
    cart.discountAmount = 0;
  }

  const tax = cart.subtotal > 0 ? Math.round((cart.subtotal * 0.05) * 100) / 100 : 0;
  const deliveryFee = cart.subtotal > 0 ? (cart.subtotal > 500 ? 0 : 40) : 0;

  cart.tax = tax;
  cart.deliveryFee = deliveryFee;
  cart.grandTotal = cart.subtotal > 0
    ? Math.max(0, Math.round((cart.subtotal + tax + deliveryFee - cart.discountAmount) * 100) / 100)
    : 0;

  await cart.save();
  return cart;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    } else {
      cart = await recalculateCart(cart);
      cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, sugarLevel, addOns } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (!product.isAvailable || product.stockQuantity <= 0) {
      return res.status(400).json({ success: false, error: 'Product is currently out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if exact item exists (same size, sugar, addOns)
    const existingIndex = cart.items.findIndex(item => {
      const matchProduct = item.product.toString() === productId;
      const matchSize = (item.size?.name || '') === (size?.name || '');
      const matchSugar = (item.sugarLevel || '') === (sugarLevel || '');
      const addOnsA = (item.addOns || []).map(a => a.name).sort().join(',');
      const addOnsB = (addOns || []).map(a => a.name).sort().join(',');
      return matchProduct && matchSize && matchSugar && addOnsA === addOnsB;
    });

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        size,
        sugarLevel,
        addOns: addOns || [],
        unitPrice: product.basePrice,
        itemTotal: product.basePrice * Number(quantity)
      });
    }

    await recalculateCart(cart);
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    await recalculateCart(cart);
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeCartItem = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);

    await recalculateCart(cart);
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply coupon code
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Please provide a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or inactive coupon code' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, error: 'Coupon has expired' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    if (cart.subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
      });
    }

    cart.couponCode = coupon.code;
    await recalculateCart(cart);
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove coupon
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.couponCode = '';
      cart.discountAmount = 0;
      await recalculateCart(cart);
      cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.couponCode = '';
      cart.discountAmount = 0;
      cart.subtotal = 0;
      cart.tax = 0;
      cart.deliveryFee = 0;
      cart.grandTotal = 0;
      await cart.save();
    }
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};
