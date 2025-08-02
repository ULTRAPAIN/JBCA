const express = require('express');
const Order = require('../models/order.model');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all orders for admin
router.get('/admin', auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email role')
      .populate('items.product')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const orderData = {
      user: req.user.id,
      items: req.body.items,
      total: req.body.total,
      status: 'pending',
      orderDate: new Date(),
      deliveryDate: req.body.deliveryDate,
      deliveryAddress: req.body.deliveryAddress,
      paymentMethod: req.body.paymentMethod || 'pending',
      notes: req.body.notes
    };

    const order = new Order(orderData);
    await order.save();

    // Populate the created order before returning
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email role')
      .populate('items.product');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email role').populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
