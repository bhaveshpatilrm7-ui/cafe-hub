const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Notification = require('../models/Notification');

// Generate reservation number
const generateReservationNumber = () => {
  return `RSV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
};

// @desc    Create table reservation
// @route   POST /api/reservations
// @access  Private
exports.createReservation = async (req, res, next) => {
  try {
    const { tableId, date, timeSlot, partySize, specialRequest } = req.body;

    if (!tableId || !date || !timeSlot || !partySize) {
      return res.status(400).json({ success: false, error: 'Please provide table, date, time slot, and party size' });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    if (table.capacity < Number(partySize)) {
      return res.status(400).json({
        success: false,
        error: `Selected table capacity (${table.capacity}) is smaller than party size (${partySize})`
      });
    }

    // Check for double booking
    const existingConflict = await Reservation.findOne({
      table: tableId,
      date,
      timeSlot,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingConflict) {
      return res.status(400).json({
        success: false,
        error: 'This table is already reserved for the selected date and time slot. Please choose another table or time.'
      });
    }

    const reservationNumber = generateReservationNumber();

    const reservation = await Reservation.create({
      reservationNumber,
      user: req.user.id,
      table: tableId,
      date,
      timeSlot,
      partySize,
      specialRequest,
      status: 'Pending'
    });

    await reservation.populate(['table', 'user']);

    // Notification
    await Notification.create({
      user: req.user.id,
      title: 'Reservation Requested',
      message: `Table reservation request #${reservationNumber} received for ${date} at ${timeSlot}.`,
      type: 'reservation',
      link: '/reservations'
    });

    res.status(201).json({
      success: true,
      message: 'Table reservation created successfully!',
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reservations (User own or Admin/Staff all)
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.user = req.user.id;
    }

    const { status, date } = req.query;
    if (status) query.status = status;
    if (date) query.date = date;

    const reservations = await Reservation.find(query)
      .populate('table')
      .populate('user', 'name email phone')
      .sort({ date: -1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update reservation status (Staff / Admin)
// @route   PUT /api/reservations/:id/status
// @access  Private/Staff/Admin
exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid reservation status' });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    reservation.status = status;
    await reservation.save();

    await Notification.create({
      user: reservation.user,
      title: `Reservation ${status}`,
      message: `Your reservation #${reservation.reservationNumber} for ${reservation.date} is now ${status}.`,
      type: 'reservation',
      link: '/reservations'
    });

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel reservation (Customer if Pending)
// @route   PUT /api/reservations/:id/cancel
// @access  Private
exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user.id && req.user.role === 'customer') {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled',
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};
