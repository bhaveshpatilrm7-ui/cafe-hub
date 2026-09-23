const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

CategorySchema.pre('save', function (next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-0]/g, '-').replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
