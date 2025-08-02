const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['order', 'user', 'product', 'system', 'payment', 'contact'],
    required: true,
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Notifications expire after 30 days by default
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create order notification
notificationSchema.statics.createOrderNotification = async function(order, adminUsers) {
  const notifications = [];
  
  for (const admin of adminUsers) {
    const notification = {
      title: `New Order Received`,
      message: `Order #${order.orderNumber} has been placed by ${order.user?.name || 'Customer'} for ₹${order.totalAmount}`,
      type: 'order',
      priority: 'high',
      recipient: admin._id,
      relatedOrder: order._id,
      relatedUser: order.user?._id,
      metadata: {
        orderNumber: order.orderNumber,
        customerName: order.user?.name,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0
      }
    };
    
    notifications.push(notification);
  }
  
  if (notifications.length > 0) {
    await this.insertMany(notifications);
  }
  
  return notifications;
};

// Static method to create user registration notification
notificationSchema.statics.createUserRegistrationNotification = async function(user, adminUsers) {
  const notifications = [];
  
  for (const admin of adminUsers) {
    const notification = {
      title: `New User Registration`,
      message: `${user.name} (${user.email}) has registered as a new customer`,
      type: 'user',
      priority: 'medium',
      recipient: admin._id,
      relatedUser: user._id,
      metadata: {
        userName: user.name,
        userEmail: user.email,
        userRole: user.role
      }
    };
    
    notifications.push(notification);
  }
  
  if (notifications.length > 0) {
    await this.insertMany(notifications);
  }
  
  return notifications;
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
