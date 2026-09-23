const Address = require('../models/Address');

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // If first address or isDefault requested true, reset other defaults
    const addressCount = await Address.countDocuments({ user: req.user.id });
    if (addressCount === 0 || req.body.isDefault) {
      req.body.isDefault = true;
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const address = await Address.create(req.body);

    res.status(201).json({
      success: true,
      data: address
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this address' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user.id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await address.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address || address.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      data: address
    });
  } catch (err) {
    next(err);
  }
};
