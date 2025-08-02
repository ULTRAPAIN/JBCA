const mongoose = require('mongoose');
const DeliveryZone = require('../models/deliveryZone.model');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_crm');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const defaultDeliveryZones = [
  {
    pincode: '421302',
    area: 'Kalher',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    deliveryCharge: 60,
    estimatedDeliveryDays: 0,
    isActive: true
  },
  {
    pincode: '421302',
    area: 'Kasheli',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    deliveryCharge: 60,
    estimatedDeliveryDays: 0,
    isActive: true
  },
  {
    pincode: '421302',
    area: 'Dapoda',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    deliveryCharge: 75,
    estimatedDeliveryDays: 0,
    isActive: true,
    specialInstructions: 'Industrial and warehousing area.'
  },
  {
    pincode: '421302',
    area: 'Purna',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    deliveryCharge: 70,
    estimatedDeliveryDays: 0,
    isActive: true
  },
  {
    pincode: '421302',
    area: 'Anjurphata',
    city: 'Bhiwandi',
    state: 'Maharashtra',
    deliveryCharge: 80,
    estimatedDeliveryDays: 0,
    isActive: false, // Example of an inactive zone
    specialInstructions: 'Service temporarily unavailable.'
  }
];

const seedDeliveryZones = async () => {
  try {
    await connectDB();
    
    console.log('Dropping existing delivery zones collection to reset indexes...');
    try {
      await mongoose.connection.db.dropCollection('deliveryzones');
      console.log('Collection dropped successfully');
    } catch (err) {
      console.log('Collection does not exist or already dropped');
    }
    
    console.log('Creating delivery zones with new schema...');
    const createdZones = await DeliveryZone.insertMany(defaultDeliveryZones);
    
    console.log(`✅ Successfully created ${createdZones.length} delivery zones:`);
    createdZones.forEach(zone => {
      console.log(`  - ${zone.area} (${zone.pincode}): ₹${zone.deliveryCharge}, ${zone.estimatedDeliveryDays} days`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding delivery zones:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDeliveryZones();
