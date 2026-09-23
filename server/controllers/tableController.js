const Table = require('../models/Table');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
exports.getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.status(200).json({ success: true, count: tables.length, data: tables });
  } catch (err) {
    next(err);
  }
};

// @desc    Create table (Admin)
// @route   POST /api/tables
// @access  Private/Admin
exports.createTable = async (req, res, next) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, data: table });
  } catch (err) {
    next(err);
  }
};

// @desc    Update table (Admin)
// @route   PUT /api/tables/:id
// @access  Private/Admin
exports.updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!table) return res.status(404).json({ success: false, error: 'Table not found' });
    res.status(200).json({ success: true, data: table });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete table (Admin)
// @route   DELETE /api/tables/:id
// @access  Private/Admin
exports.deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, error: 'Table not found' });
    await table.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
