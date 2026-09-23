const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    name: String,
    price: { type: Number, default: 0 }
  },
  sugarLevel: {
    type: String,
    default: 'Normal'
  },
  addOns: [
    {
      name: String,
      price: Number
    }
  ],
  unitPrice: {
    type: Number,
    required: true
  },
  itemTotal: {
    type: Number,
    required: true
  }
});

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [CartItemSchema],
    couponCode: {
      type: String,
      default: ''
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
