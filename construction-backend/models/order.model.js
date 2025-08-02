const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  priceAtPurchase: {
    type: Number,
    required: [true, 'Price at purchase is required'],
    min: [0, 'Price cannot be negative']
  },
  total: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true
    // Removed required: true since it's auto-generated in pre-save hook
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['Processing', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Online Payment', 'Bank Transfer'],
    default: 'Cash on Delivery'
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  trackingNumber: {
    type: String,
    maxlength: [100, 'Tracking number cannot exceed 100 characters']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  trackingHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.quantity * item.priceAtPurchase;
  });
  
  // Calculate total amount
  this.totalAmount = this.items.reduce((sum, item) => sum + item.total, 0);
  
  next();
});

// Add tracking entry when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.trackingHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: `Order status changed to ${this.status}`
    });
  }
  next();
});

// Index for efficient querying
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
// Note: orderNumber index is automatically created due to unique: true

module.exports = mongoose.model('Order', orderSchema);
