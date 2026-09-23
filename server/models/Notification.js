const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['order', 'reservation', 'inventory', 'system'],
      default: 'system'
    },
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
