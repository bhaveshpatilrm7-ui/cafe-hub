const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema(
  {
    reservationNumber: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    timeSlot: {
      type: String, // e.g. "18:00 - 19:30"
      required: true
    },
    partySize: {
      type: Number,
      required: true,
      min: 1
    },
    specialRequest: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', ReservationSchema);
