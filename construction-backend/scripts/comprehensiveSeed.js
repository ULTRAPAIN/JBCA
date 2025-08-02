const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/user.model');
const Product = require('../models/product.model');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Sample users with different roles
const users = [
  {
    name: 'Admin User',
    email: 'admin@jaibhavani.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210'
  },
  {
    name: 'John Doe',
    email: 'primary@example.com',
    password: 'password123',
    role: 'primary',
    phone: '9876543211'
  },
  {
    name: 'Jane Smith',
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

// Sample products with role-based pricing
const products = [
  {
    name: 'Portland Cement - OPC 53',
    description: 'High-quality Ordinary Portland Cement Grade 53 for construction projects.',
    category: 'Cement',
    unit: 'Bags',
    price: 350,
    prices: {
      registered: 350,
      primary: 320,
      secondary: 330
    },
    stock: 100,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
    images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'],
    availability: true,
    weight: 50,
    specifications: {
      'Grade': '53',
      'Type': 'OPC',
      'Weight': '50 kg'
    }
  },
  {
    name: 'PPC Cement',
    description: 'Portland Pozzolana Cement for durability and workability.',
    category: 'Cement',
    unit: 'Bags',
    price: 320,
    prices: {
      registered: 320,
      primary: 290,
      secondary: 300
    },
    stock: 80,
    image: 'https://images.unsplash.com/photo-1581092160607-ee67b2f4b2c5?w=400',
    images: ['https://images.unsplash.com/photo-1581092160607-ee67b2f4b2c5?w=400'],
    availability: true,
    weight: 50,
    specifications: {
      'Grade': '43',
      'Type': 'PPC',
      'Weight': '50 kg'
    }
  },
  {
    name: 'Construction Sand',
    description: 'Fine quality river sand for construction and masonry work.',
    category: 'Sand & Aggregates',
    unit: 'Tons',
    price: 45,
    prices: {
      registered: 45,
      primary: 40,
      secondary: 42
    },
    stock: 200,
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400',
    images: ['https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400'],
    availability: true,
    specifications: {
      'Type': 'River Sand',
      'Grade': 'Fine'
    }
  },
  {
    name: 'Aggregate Stone',
    description: 'Crushed stone aggregate for concrete mixing.',
    category: 'Sand & Aggregates',
    unit: 'Tons',
    price: 55,
    prices: {
      registered: 55,
      primary: 50,
      secondary: 52
    },
    stock: 150,
    image: 'https://images.unsplash.com/photo-1581092335878-85a8e48e9e8e?w=400',
    images: ['https://images.unsplash.com/photo-1581092335878-85a8e48e9e8e?w=400'],
    availability: true,
    specifications: {
      'Size': '20mm',
      'Type': 'Crushed Stone'
    }
  },
  {
    name: 'Steel TMT Bars',
    description: 'High-strength thermo-mechanically treated steel bars.',
    category: 'Other',
    unit: 'Pieces',
    price: 65,
    prices: {
      registered: 65,
      primary: 60,
      secondary: 62
    },
    stock: 120,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'],
    availability: true,
    weight: 12,
    specifications: {
      'Diameter': '12mm',
      'Grade': 'Fe500',
      'Length': '12m'
    }
  },
  {
    name: 'Red Bricks',
    description: 'Standard fired clay bricks for construction.',
    category: 'Bricks & Blocks',
    unit: 'Pieces',
    price: 8,
    prices: {
      registered: 8,
      primary: 7,
      secondary: 7.5
    },
    stock: 500,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400'],
    availability: true,
    weight: 3.5,
    specifications: {
      'Type': 'Clay Brick',
      'Size': '230x110x75mm'
    }
  },
  {
    name: 'Concrete Blocks',
    description: 'Lightweight concrete blocks for modern construction.',
    category: 'Bricks & Blocks',
    unit: 'Pieces',
    price: 25,
    prices: {
      registered: 25,
      primary: 22,
      secondary: 23
    },
    stock: 300,
    image: 'https://images.unsplash.com/photo-1581092335633-2e8b6d87f0a4?w=400',
    images: ['https://images.unsplash.com/photo-1581092335633-2e8b6d87f0a4?w=400'],
    availability: true,
    weight: 15,
    specifications: {
      'Type': 'Concrete Block',
      'Size': '400x200x200mm'
    }
  },
  {
    name: 'Construction Gravel',
    description: 'Coarse gravel for drainage and concrete applications.',
    category: 'Sand & Aggregates',
    unit: 'Tons',
    price: 40,
    prices: {
      registered: 40,
      primary: 35,
      secondary: 37
    },
    stock: 180,
    image: 'https://images.unsplash.com/photo-1581092162607-ee67b2f4b2c5?w=400',
    images: ['https://images.unsplash.com/photo-1581092162607-ee67b2f4b2c5?w=400'],
    availability: true,
    specifications: {
      'Size': '10-15mm',
      'Type': 'Crushed Gravel'
    }
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});

    // Seed users
    console.log('👥 Creating users...');
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    // Seed products
    console.log('📦 Creating products...');
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created product: ${product.name} - Standard: ₹${product.price}, Primary: ₹${product.prices.primary}, Secondary: ₹${product.prices.secondary}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Test Credentials:');
    console.log('🔑 Admin: admin@jaibhavani.com / admin123');
    console.log('🥇 Primary Customer: primary@example.com / password123');
    console.log('🥈 Secondary Customer: secondary@example.com / password123');
    console.log('👤 Registered Customer: customer@example.com / password123');
    
    console.log('\n💰 Pricing Structure:');
    console.log('• Registered customers see base prices');
    console.log('• Primary customers get best discounts (up to 20% off)');
    console.log('• Secondary customers get moderate discounts (up to 10% off)');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

seedDatabase();
