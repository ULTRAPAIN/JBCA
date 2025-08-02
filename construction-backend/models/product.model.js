const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  image: {
    type: String,
    required: false // Allow products without images
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Cement', 'Bricks & Blocks', 'Sand & Aggregates', 'Stone Aggregates', 'Tiles & Flooring', 'Roofing Materials', 'Plumbing Supplies', 'Electrical Supplies', 'Roof and Tiles Bonding', 'Doors & Windows', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  prices: {
    standard: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    primary: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    secondary: {
      type: Number,
      min: [0, 'Price cannot be negative']
    }
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['Bags', 'Tons', 'Pieces', 'Square Feet', 'Cubic Feet', 'Meters', 'Inches', 'Kilograms', 'Liters', 'Boxes']
  },
  weight: {
    type: Number,
    required: false, // Make weight optional for all products
    min: [0, 'Weight cannot be negative']
  },
  availability: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  specifications: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for efficient searching
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ availability: 1 });

module.exports = mongoose.model('Product', productSchema);
