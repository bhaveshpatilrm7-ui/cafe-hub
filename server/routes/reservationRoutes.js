const express = require('express');
const {
  createReservation,
  getReservations,
  updateReservationStatus,
  cancelReservation
} = require('../controllers/reservationController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getReservations)
  .post(createReservation);

router.put('/:id/status', authorize('staff', 'admin'), updateReservationStatus);
router.put('/:id/cancel', cancelReservation);

module.exports = router;
