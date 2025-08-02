const express = require('express');
const DeliveryZone = require('../models/deliveryZone.model');

const router = express.Router();

// @route   GET /api/delivery-zones
// @desc    Get all active delivery zones
// @access  Public
router.get('/', async (req, res) => {
  try {
    const deliveryZones = await DeliveryZone.find({ isActive: true })
      .select('name area pincode deliveryCharge estimatedDeliveryDays')
      .sort({ deliveryCharge: 1 });

    res.json({
      success: true,
      data: deliveryZones
    });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery zones'
    });
  }
});

// @route   GET /api/delivery-zones/check/:pincode
// @desc    Check if delivery is available for a pincode and return all available areas
// @access  Public
router.get('/check/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    const deliveryZones = await DeliveryZone.find({ 
      pincode: pincode,
      isActive: true 
    }).select('area name deliveryCharge estimatedDeliveryDays');

    if (deliveryZones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not available to this pincode',
        available: false
      });
    }

    res.json({
      success: true,
      available: true,
      data: deliveryZones
    });
  } catch (error) {
    console.error('Error checking delivery availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check delivery availability'
    });
  }
});

module.exports = router;
