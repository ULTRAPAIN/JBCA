const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode']
  },
  area: {
    type: String,
    required: [true, 'Area name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  deliveryCharge: {
    type: Number,
    default: 0,
    min: [0, 'Delivery charge cannot be negative']
  },
  estimatedDeliveryDays: {
    type: Number,
    default: 1,
    min: [0, 'Delivery days cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for efficient searching
// Compound unique index to allow multiple areas within same pincode
deliveryZoneSchema.index({ pincode: 1, area: 1 }, { unique: true });
deliveryZoneSchema.index({ city: 1 });
deliveryZoneSchema.index({ isActive: 1 });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
