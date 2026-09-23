const mongoose = require('mongoose');

const OptionItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 }
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true
    },
    slug: {
      type: String
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    basePrice: {
      type: Number,
      required: [true, 'Please add a base price']
    },
    discountPercent: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    options: {
      sizes: [OptionItemSchema], // e.g. Small (+0), Medium (+20), Large (+40)
      sugarLevels: [{ type: String }], // e.g. "None", "Less", "Normal", "Extra"
      addOns: [OptionItemSchema] // e.g. Extra Shot (+30), Whipped Cream (+25)
    },
    stockQuantity: {
      type: Number,
      default: 100
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    }
  },
  { timestamps: true }
);

ProductSchema.pre('save', function (next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
