const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    },
    unit: {
      type: String,
      required: true,
      default: 'kg'
    },
    minThreshold: {
      type: Number,
      required: true,
      default: 10
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock'
    },
    lastRestocked: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Pre-save to auto-update status based on threshold
InventorySchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Inventory', InventorySchema);
