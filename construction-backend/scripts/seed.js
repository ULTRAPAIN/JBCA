const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/user.model');
const Product = require('../models/product.model');
const DeliveryZone = require('../models/deliveryZone.model');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@jaibhavani.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210'
  },
  {
    name: 'Primary Customer',
    email: 'primary@example.com',
    password: 'password123',
    role: 'primary',
    phone: '9876543211',
    addresses: [{
      type: 'shipping',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true
    }]
  },
  {
    name: 'Secondary Customer',
    email: 'secondary@example.com',
    password: 'password123',
    role: 'secondary',
    phone: '9876543212'
  },
  {
    name: 'Regular Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'registered',
    phone: '9876543213'
  }
];

const products = [
  {
    name: 'OPC 53 Grade Cement',
    description: 'High-quality Ordinary Portland Cement Grade 53 for all construction needs. Perfect for residential and commercial projects.',
    images: [
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      'https://images.unsplash.com/photo-1581092160607-ee67b2f4b2c5?w=400'
    ],
    category: 'Cement',
    prices: {
      standard: 450,
      primary: 430,
      secondary: 440
    },
    unit: 'bag',
    weight: 50,
    availability: true,
    stock: 100,
    specifications: {
      'Grade': '53',
      'Type': 'OPC',
      'Weight': '50 kg',
      'Brand': 'Premium'
    }
  },
  {
    name: 'PPC Cement',
    description: 'Portland Pozzolana Cement with enhanced durability and strength. Eco-friendly option for sustainable construction.',
    images: [
      'https://images.unsplash.com/photo-1581092335878-85a8e48e9e8e?w=400'
    ],
    category: 'Cement',
    prices: {
      standard: 420,
      primary: 400,
      secondary: 410
    },
    unit: 'bag',
    weight: 50,
    availability: true,
    stock: 150,
    specifications: {
      'Grade': '43',
      'Type': 'PPC',
      'Weight': '50 kg',
      'Brand': 'EcoFriendly'
    }
  },
  {
    name: 'River Sand',
    description: 'Natural river sand, washed and graded. Perfect for concrete mixing and plastering work.',
    images: [
      'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400'
    ],
    category: 'Sand',
    prices: {
      standard: 1500,
      primary: 1400,
      secondary: 1450
    },
    unit: 'cubic_meter',
    availability: true,
    stock: 50,
    specifications: {
      'Type': 'River Sand',
      'Grade': 'Fine',
      'Moisture Content': '<5%'
    }
  },
  {
    name: 'Construction Sand',
    description: 'High-quality construction sand suitable for all masonry and concrete work.',
    images: [
      'https://images.unsplash.com/photo-1581092335633-2e8b6d87f0a4?w=400'
    ],
    category: 'Sand',
    prices: {
      standard: 1300,
      primary: 1200,
      secondary: 1250
    },
    unit: 'cubic_meter',
    availability: true,
    stock: 75,
    specifications: {
      'Type': 'Construction Sand',
      'Grade': 'Medium',
      'Silt Content': '<3%'
    }
  },
  {
    name: '20mm Aggregate',
    description: 'Crushed stone aggregate 20mm size for concrete preparation and road construction.',
    images: [
      'https://images.unsplash.com/photo-1581092162290-1b5be9b3c8e5?w=400'
    ],
    category: 'Gravel',
    prices: {
      standard: 1800,
      primary: 1700,
      secondary: 1750
    },
    unit: 'cubic_meter',
    availability: true,
    stock: 30,
    specifications: {
      'Size': '20mm',
      'Type': 'Crushed Stone',
      'Grade': 'Premium'
    }
  },
  {
    name: 'Red Clay Bricks',
    description: 'Traditional red clay bricks, kiln-fired for strength and durability.',
    images: [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400'
    ],
    category: 'Bricks',
    prices: {
      standard: 8,
      primary: 7.5,
      secondary: 7.8
    },
    unit: 'piece',
    weight: 3,
    availability: true,
    stock: 10000,
    specifications: {
      'Type': 'Clay Brick',
      'Size': '230x110x75mm',
      'Compressive Strength': '7.5 N/mm²'
    }
  },
  {
    name: 'TMT Steel Bars 12mm',
    description: 'High-grade TMT steel bars 12mm diameter. Earthquake resistant and corrosion resistant.',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'
    ],
    category: 'Steel',
    prices: {
      standard: 65,
      primary: 62,
      secondary: 63.5
    },
    unit: 'kg',
    availability: true,
    stock: 500,
    specifications: {
      'Diameter': '12mm',
      'Grade': 'Fe500',
      'Length': '12m',
      'Brand': 'Premium TMT'
    }
  }
];

const deliveryZones = [
  {
    pincode: '400001',
    area: 'Fort',
    city: 'Mumbai',
    state: 'Maharashtra',
    deliveryCharge: 100,
    estimatedDeliveryDays: 1
  },
  {
    pincode: '400002',
    area: 'Kalbadevi',
    city: 'Mumbai',
    state: 'Maharashtra',
    deliveryCharge: 100,
    estimatedDeliveryDays: 1
  },
  {
    pincode: '400003',
    area: 'Dhobi Talao',
    city: 'Mumbai',
    state: 'Maharashtra',
    deliveryCharge: 100,
    estimatedDeliveryDays: 1
  },
  {
    pincode: '400051',
    area: 'Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    deliveryCharge: 150,
    estimatedDeliveryDays: 2
  },
  {
    pincode: '400052',
    area: 'Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    deliveryCharge: 150,
    estimatedDeliveryDays: 2
  },
  {
    pincode: '411001',
    area: 'Pune City',
    city: 'Pune',
    state: 'Maharashtra',
    deliveryCharge: 200,
    estimatedDeliveryDays: 3
  },
  {
    pincode: '411002',
    area: 'Shivajinagar',
    city: 'Pune',
    state: 'Maharashtra',
    deliveryCharge: 200,
    estimatedDeliveryDays: 3
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await DeliveryZone.deleteMany({});

    // Seed users
    console.log('Seeding users...');
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    // Seed products
    console.log('Seeding products...');
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.name}`);
    }

    // Seed delivery zones
    console.log('Seeding delivery zones...');
    for (const zoneData of deliveryZones) {
      const zone = new DeliveryZone(zoneData);
      await zone.save();
      console.log(`Created delivery zone: ${zone.pincode} - ${zone.area}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Test Credentials:');
    console.log('Admin: admin@jaibhavani.com / admin123');
    console.log('Primary Customer: primary@example.com / password123');
    console.log('Secondary Customer: secondary@example.com / password123');
    console.log('Regular Customer: customer@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
