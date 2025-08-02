const express = require('express');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const DeliveryZone = require('../models/deliveryZone.model');
const Notification = require('../models/notification.model');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// ================== PRODUCT MANAGEMENT ==================

// @route   POST /api/admin/products
// @desc    Create a new product
// @access  Admin
router.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update a product
// @access  Admin
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ================== ORDER MANAGEMENT ==================

// @route   GET /api/admin/orders
// @desc    Get all orders
// @access  Admin
router.get('/orders', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (userId) {
      filter.user = userId;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const orders = await Order.find(filter)
      .populate('user', 'name email phone role')
      .populate('items.product', 'name category unit')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    // Get order statistics
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        },
        stats: stats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get specific order by ID
// @access  Admin
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone role')
      .populate('items.product', 'name category unit');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get admin order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/orders/:id
// @desc    Update order details (status, notes, estimated delivery, tracking)
// @access  Admin
router.put('/orders/:id', async (req, res) => {
  try {
    const { status, notes, estimatedDelivery, trackingNumber } = req.body;
    
    // Get original order to check for status changes
    const originalOrder = await Order.findById(req.params.id).populate('user', 'name email');
    if (!originalOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    // If status is being changed to delivered, set actualDelivery date
    if (status === 'Delivered') {
      updateData.actualDelivery = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('user', 'name email phone')
    .populate('items.product', 'name category unit');

    // Create notification for customer if order status changed
    if (status && status !== originalOrder.status && order.user) {
      try {
        const statusMessages = {
          'Pending': 'Your order is pending confirmation',
          'Confirmed': 'Your order has been confirmed and will be processed soon',
          'Processing': 'Your order is being processed',
          'Shipped': 'Your order has been shipped and is on the way',
          'Delivered': 'Your order has been delivered successfully',
          'Cancelled': 'Your order has been cancelled'
        };
        
        const notification = new Notification({
          title: `Order Status Update`,
          message: `${statusMessages[status] || `Order status changed to ${status}`} - Order #${order.orderNumber}`,
          type: 'order',
          priority: status === 'Delivered' ? 'high' : 'medium',
          recipient: order.user._id,
          relatedOrder: order._id,
          metadata: {
            orderNumber: order.orderNumber,
            oldStatus: originalOrder.status,
            newStatus: status,
            totalAmount: order.totalAmount
          }
        });
        
        await notification.save();
        console.log('Admin: Created order status notification for customer');
      } catch (notificationError) {
        console.error('Admin: Error creating order status notification:', notificationError);
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ================== USER MANAGEMENT ==================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['registered', 'primary', 'secondary', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Get original user to check for role changes
    const originalUser = await User.findById(req.params.id);
    if (!originalUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    // Create notification for customer if role changed (and it's not an admin change)
    if (role !== originalUser.role && role !== 'admin') {
      try {
        const roleMessages = {
          'registered': 'Your account role has been updated to Registered Customer',
          'primary': 'Your account has been upgraded to Primary Customer with special pricing benefits',
          'secondary': 'Your account has been upgraded to Secondary Customer with wholesale pricing'
        };
        
        const notification = new Notification({
          title: `Account Role Updated`,
          message: roleMessages[role] || `Your account role has been changed to ${role}`,
          type: 'user',
          priority: role === 'primary' || role === 'secondary' ? 'high' : 'medium',
          recipient: user._id,
          relatedUser: user._id,
          metadata: {
            oldRole: originalUser.role,
            newRole: role,
            userName: user.name,
            userEmail: user.email
          }
        });
        
        await notification.save();
        console.log('Admin: Created role change notification for customer');
      } catch (notificationError) {
        console.error('Admin: Error creating role change notification:', notificationError);
      }
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ================== DELIVERY ZONE MANAGEMENT ==================

// @route   POST /api/admin/delivery-zones
// @desc    Add a serviceable pincode
// @access  Admin
router.post('/delivery-zones', async (req, res) => {
  try {
    const deliveryZone = new DeliveryZone(req.body);
    await deliveryZone.save();

    res.status(201).json({
      success: true,
      message: 'Delivery zone added successfully',
      data: {
        deliveryZone
      }
    });
  } catch (error) {
    console.error('Add delivery zone error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Pincode already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/delivery-zones
// @desc    Get all delivery zones
// @access  Admin
router.get('/delivery-zones', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      city,
      state,
      isActive,
      sortBy = 'pincode',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const deliveryZones = await DeliveryZone.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryZone.countDocuments(filter);

    res.json({
      success: true,
      data: {
        deliveryZones,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get delivery zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/delivery-zones/:id
// @desc    Update delivery zone
// @access  Admin
router.put('/delivery-zones/:id', async (req, res) => {
  try {
    const deliveryZone = await DeliveryZone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!deliveryZone) {
      return res.status(404).json({
        success: false,
        message: 'Delivery zone not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery zone updated successfully',
      data: {
        deliveryZone
      }
    });
  } catch (error) {
    console.error('Update delivery zone error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/delivery-zones/:id
// @desc    Delete delivery zone
// @access  Admin
router.delete('/delivery-zones/:id', async (req, res) => {
  try {
    const deliveryZone = await DeliveryZone.findByIdAndDelete(req.params.id);

    if (!deliveryZone) {
      return res.status(404).json({
        success: false,
        message: 'Delivery zone not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery zone deleted successfully'
    });
  } catch (error) {
    console.error('Delete delivery zone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ================== DASHBOARD ANALYTICS ==================

// @route   GET /api/admin/dashboard
// @desc    Get dashboard analytics
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get basic counts
    const [totalUsers, totalProducts, totalOrders, totalDeliveryZones] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      DeliveryZone.countDocuments({ isActive: true })
    ]);

    // Get order statistics for the period
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get order status distribution
    const statusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalDeliveryZones
        },
        periodStats: {
          period: parseInt(period),
          orders: orderStats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
        },
        statusDistribution,
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
