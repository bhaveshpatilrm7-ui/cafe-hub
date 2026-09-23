const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Please specify full name for address']
    },
    phone: {
      type: String,
      required: [true, 'Please specify phone number']
    },
    addressLine: {
      type: String,
      required: [true, 'Please specify street address']
    },
    city: {
      type: String,
      required: [true, 'Please specify city']
    },
    state: {
      type: String,
      required: [true, 'Please specify state']
    },
    postalCode: {
      type: String,
      required: [true, 'Please specify postal code']
    },
    addressType: {
      type: String,
      enum: ['Home', 'Work', 'Other'],
      default: 'Home'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Address', AddressSchema);
