const express = require('express');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const DeliveryZone = require('../models/deliveryZone.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, notes, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !shippingAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address with pincode is required'
      });
    }

    // Check if delivery is available to the pincode
    // If multiple zones exist for the pincode, prefer one that matches the area or use the first active one
    
    let deliveryZone;
    if (shippingAddress.area) {
      deliveryZone = await DeliveryZone.findOne({ 
        pincode: shippingAddress.pincode,
        area: { $regex: new RegExp(shippingAddress.area, 'i') }, // Case-insensitive partial match
        isActive: true 
      });
      console.log('Order API: Area-specific zone found:', deliveryZone?.area || 'none');
    }
    
    if (!deliveryZone) {
      deliveryZone = await DeliveryZone.findOne({ 
        pincode: shippingAddress.pincode,
        isActive: true 
      });
      console.log('Order API: General zone found:', deliveryZone?.area || 'none');
    }

    if (!deliveryZone) {
      console.log('Order API: No delivery zone found for pincode:', shippingAddress.pincode);
      return res.status(400).json({
        success: false,
        message: `Delivery not available to pincode ${shippingAddress.pincode}`
      });
    }

    // Validate and process order items
    const processedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (!product.availability) {
        return res.status(400).json({
          success: false,
          message: `Product not available: ${product.name}`
        });
      }

      // Get price based on user role
      let price;
      switch (req.user.role) {
        case 'primary':
          price = product.prices.primary;
          break;
        case 'secondary':
          price = product.prices.secondary;
          break;
        default:
          price = product.prices.standard;
      }

      const itemTotal = item.quantity * price;
      totalAmount += itemTotal;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: price,
        total: itemTotal
      });
    }

    // Add delivery charge
    totalAmount += deliveryZone.deliveryCharge;

    // Calculate estimated delivery date
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryZone.estimatedDeliveryDays);

    // Map payment method to valid enum values
    let validPaymentMethod = 'Cash on Delivery'; // default
    if (paymentMethod) {
      const paymentMethodMap = {
        'cod': 'Cash on Delivery',
        'Cash on Delivery': 'Cash on Delivery',
        'online': 'Online Payment',
        'Online Payment': 'Online Payment',
        'bank': 'Bank Transfer',
        'Bank Transfer': 'Bank Transfer'
      };
      validPaymentMethod = paymentMethodMap[paymentMethod] || 'Cash on Delivery';
      console.log('Order API: Payment method mapping:', { 
        received: paymentMethod, 
        mapped: validPaymentMethod 
      });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: processedItems,
      totalAmount,
      shippingAddress,
      estimatedDelivery,
      notes,
      paymentMethod: validPaymentMethod
    });

    await order.save();

    // Populate product details for response
    await order.populate('items.product', 'name images unit');
    await order.populate('user', 'name email phone');

    // Create notifications for all admin users
    try {
      const adminUsers = await User.find({ role: 'admin' });
      if (adminUsers.length > 0) {
        await Notification.createOrderNotification(order, adminUsers);
        console.log('Order API: Notifications created for', adminUsers.length, 'admin users');
      }
    } catch (notificationError) {
      console.error('Order API: Error creating notifications:', notificationError);
      // Don't fail the order creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        deliveryCharge: deliveryZone.deliveryCharge,
        estimatedDeliveryDays: deliveryZone.estimatedDeliveryDays
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    
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
      message: 'Server error during order creation'
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get orders for the logged-in user
// @access  Private
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const orders = await Order.find(filter)
      .populate('items.product', 'name images unit category')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images unit category description')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    order.status = 'Cancelled';
    await order.save();

    await order.populate('items.product', 'name images unit');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/check-delivery/:pincode
// @desc    Check if delivery is available to a pincode
// @access  Public
router.get('/check-delivery/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;

    const deliveryZone = await DeliveryZone.findOne({ 
      pincode,
      isActive: true 
    });

    if (!deliveryZone) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: 'Delivery not available to this pincode'
        }
      });
    }

    res.json({
      success: true,
      data: {
        available: true,
        deliveryCharge: deliveryZone.deliveryCharge,
        estimatedDeliveryDays: deliveryZone.estimatedDeliveryDays,
        area: deliveryZone.area,
        city: deliveryZone.city,
        specialInstructions: deliveryZone.specialInstructions
      }
    });
  } catch (error) {
    console.error('Check delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
