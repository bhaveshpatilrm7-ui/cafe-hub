const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Notification = require('../models/Notification');

// Generate reservation number
const generateReservationNumber = () => {
  return `RSV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// @desc    Create table reservation
// @route   POST /api/reservations
// @access  Private
exports.createReservation = async (req, res, next) => {
  try {
    const {
      table,
      tableId,
      date,
      timeSlot,
      partySize,
      guestCount,
      guests,
      specialRequest,
      specialRequests
    } = req.body;

    const targetTableId = tableId || table;
    if (!targetTableId) {
      return res.status(400).json({ success: false, error: 'Please select a table' });
    }

    if (!mongoose.Types.ObjectId.isValid(targetTableId)) {
      return res.status(400).json({ success: false, error: 'Invalid table ID. Please select a valid table' });
    }

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, error: 'Please provide a reservation date' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayDateStr = `${year}-${month}-${day}`;

    if (date < todayDateStr) {
      return res.status(400).json({ success: false, error: 'Reservation date cannot be in the past' });
    }

    if (!timeSlot || typeof timeSlot !== 'string') {
      return res.status(400).json({ success: false, error: 'Please select a time slot' });
    }

    if (date === todayDateStr) {
      const timeMatch = timeSlot.match(/^(\d{2}):(\d{2})/);
      if (timeMatch) {
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;
        if (timeMatch[0] < currentTimeStr) {
          return res.status(400).json({
            success: false,
            error: 'The selected time slot has already passed for today. Please select a future time slot.'
          });
        }
      }
    }

    const rawPartySize = partySize !== undefined ? partySize : (guestCount !== undefined ? guestCount : guests);
    const numPartySize = Number(rawPartySize);
    if (rawPartySize === undefined || rawPartySize === null || rawPartySize === '' || isNaN(numPartySize) || numPartySize < 1) {
      return res.status(400).json({ success: false, error: 'Please provide a valid party size (at least 1 guest)' });
    }

    const tableDoc = await Table.findById(targetTableId);
    if (!tableDoc) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    if (tableDoc.capacity < numPartySize) {
      return res.status(400).json({
        success: false,
        error: `Selected table capacity (${tableDoc.capacity}) is smaller than party size (${numPartySize})`
      });
    }

    // Check for double booking
    const existingConflict = await Reservation.findOne({
      table: targetTableId,
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
    const targetSpecialRequest = (specialRequest || specialRequests || '').trim();

    const reservation = await Reservation.create({
      reservationNumber,
      user: req.user.id,
      table: targetTableId,
      date,
      timeSlot,
      partySize: numPartySize,
      specialRequest: targetSpecialRequest,
      status: 'Pending'
    });

    await reservation.populate(['table', 'user']);

    // Notification
    try {
      await Notification.create({
        user: req.user.id,
        title: 'Reservation Requested',
        message: `Table reservation request #${reservationNumber} received for ${date} at ${timeSlot}.`,
        type: 'reservation',
        link: '/reservations'
      });
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Table Reserved Successfully!',
      data: reservation
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'This table is already reserved for the selected date and time slot. Please choose another table or time.'
      });
    }
    next(err);
  }
};

// @desc    Get booked table IDs for date and timeSlot
// @route   GET /api/reservations/availability
// @access  Public
exports.getReservationAvailability = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.query;
    if (!date || !timeSlot) {
      return res.status(200).json({ success: true, bookedTableIds: [] });
    }

    const activeReservations = await Reservation.find({
      date,
      timeSlot,
      status: { $in: ['Pending', 'Confirmed'] }
    }).select('table');

    const bookedTableIds = activeReservations.map(r => r.table.toString());

    res.status(200).json({
      success: true,
      bookedTableIds
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
    await reservation.populate(['table', 'user']);

    try {
      await Notification.create({
        user: reservation.user._id || reservation.user,
        title: `Reservation ${status}`,
        message: `Your reservation #${reservation.reservationNumber} for ${reservation.date} is now ${status}.`,
        type: 'reservation',
        link: '/reservations'
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr.message);
    }

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
    await reservation.populate(['table', 'user']);

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled',
      data: reservation
    });
  } catch (err) {
    next(err);
  }
};
