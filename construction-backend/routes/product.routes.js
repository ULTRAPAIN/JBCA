const express = require('express');
const Product = require('../models/product.model');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { sampleProducts } = require('../data/sampleData');

const router = express.Router();

// Helper function to check if database is connected
const isDatabaseConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    // If database is not connected, return sample data
    if (!isDatabaseConnected()) {
      console.log('Database not connected, returning sample data');
      return res.json({
        success: true,
        data: {
          products: sampleProducts,
          pagination: {
            current: 1,
            pages: 1,
            total: sampleProducts.length,
            limit: 10
          }
        }
      });
    }

    const {
      page = 1,
      limit = 10,
      category,
      search,
      availability,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (availability !== undefined) {
      filter.availability = availability === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    
    // If there's an error, also try to return sample data
    console.log('Error occurred, returning sample data as fallback');
    res.json({
      success: true,
      data: {
        products: sampleProducts,
        pagination: {
          current: 1,
          pages: 1,
          total: sampleProducts.length,
          limit: 10
        }
      }
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    // If database is not connected, return sample categories
    if (!isDatabaseConnected()) {
      const categories = [...new Set(sampleProducts.map(p => p.category))];
      return res.json({
        success: true,
        data: {
          categories
        }
      });
    }

    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    
    // Fallback to sample categories
    const categories = [...new Set(sampleProducts.map(p => p.category))];
    res.json({
      success: true,
      data: {
        categories
      }
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    
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

// @route   GET /api/products/:id/price
// @desc    Get product price based on user role
// @access  Private
router.get('/:id/price', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
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

    res.json({
      success: true,
      data: {
        productId: product._id,
        productName: product.name,
        userRole: req.user.role,
        price,
        unit: product.unit
      }
    });
  } catch (error) {
    console.error('Get product price error:', error);
    
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

// @route   POST /api/products/bulk-prices
// @desc    Get prices for multiple products based on user role
// @access  Private
router.post('/bulk-prices', authenticateToken, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    
    const pricesData = products.map(product => {
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

      return {
        productId: product._id,
        productName: product.name,
        price,
        unit: product.unit,
        availability: product.availability,
        stock: product.stock
      };
    });

    res.json({
      success: true,
      data: {
        userRole: req.user.role,
        products: pricesData
      }
    });
  } catch (error) {
    console.error('Get bulk prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
