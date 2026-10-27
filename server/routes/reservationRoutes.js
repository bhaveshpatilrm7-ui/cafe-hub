const express = require('express');
const {
  createReservation,
  getReservations,
  getReservationAvailability,
  updateReservationStatus,
  cancelReservation
} = require('../controllers/reservationController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public route to check table availability for date & slot
router.get('/availability', getReservationAvailability);

// Protected routes below
router.use(protect);

router.get('/my-reservations', getReservations);
router.get('/admin/all', authorize('staff', 'admin'), getReservations);

router.route('/')
  .get(getReservations)
  .post(createReservation);

router.put('/:id/status', authorize('staff', 'admin'), updateReservationStatus);
router.put('/:id/cancel', cancelReservation);

module.exports = router;
