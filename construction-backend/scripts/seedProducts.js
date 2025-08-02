const mongoose = require('mongoose');
const Product = require('../models/product.model');
require('dotenv').config();

const seedProducts = [
  {
    name: 'Portland Cement - OPC 53',
    description: 'High-quality Ordinary Portland Cement Grade 53 for construction projects.',
    category: 'Cement',
    unit: 'Bags',
    price: 350,
    prices: {
      standard: 350,
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
      standard: 320,
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
      standard: 45,
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
      standard: 55,
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
      standard: 65,
      primary: 60,
      secondary: 62
    },
    stock: 120,
    image: 'https://images.unsplash.com/photo-1581092162290-1b5be9b3c8e5?w=400',
    images: ['https://images.unsplash.com/photo-1581092162290-1b5be9b3c8e5?w=400'],
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
      standard: 8,
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
      standard: 25,
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
      standard: 40,
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

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert seed data
    const insertedProducts = await Product.insertMany(seedProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
