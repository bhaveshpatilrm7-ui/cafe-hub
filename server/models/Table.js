const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1
    },
    location: {
      type: String,
      enum: ['Indoor', 'Terrace', 'Private Booth', 'Window View'],
      default: 'Indoor'
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Maintenance'],
      default: 'Available'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', TableSchema);
