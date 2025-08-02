const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/user.model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Users that should be in the database (based on localStorage data)
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@jaibhavani.com',
    password: 'admin123',
    role: 'admin',
    phone: '9999999999',
    address: 'Admin Office, New Delhi'
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'user123',
    role: 'registered',
    phone: '9876543210',
    address: '123 Main Street, Delhi'
  },
  {
    name: 'Bhavani Magaram Patel',
    email: 'bhavani@example.com',
    password: 'bhavani123',
    role: 'primary',
    phone: '9876543211',
    address: 'Gujarat, India',
    businessType: 'Construction'
  },
  {
    name: 'Dashrath Magaram Patel',
    email: 'dashrath@example.com',
    password: 'dashrath123',
    role: 'secondary',
    phone: '9876543212',
    address: 'Gujarat, India',
    businessType: 'Construction'
  }
];

const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding...');

    // Clear existing users (optional - remove if you want to keep existing data)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users
    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`User ${userData.email} already exists, skipping...`);
          continue;
        }

        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
      } catch (userError) {
        console.error(`❌ Error creating user ${userData.email}:`, userError.message);
      }
    }

    console.log('🎉 User seeding completed!');
    console.log('\n📧 Demo Login Credentials:');
    console.log('Admin: admin@jaibhavani.com / admin123');
    console.log('John Doe: user@example.com / user123');
    console.log('Bhavani: bhavani@example.com / bhavani123');
    console.log('Dashrath: dashrath@example.com / dashrath123');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

// Run the seeding
const runSeed = async () => {
  await connectDB();
  await seedUsers();
  mongoose.disconnect();
  console.log('Database connection closed');
};

// Run if called directly
if (require.main === module) {
  runSeed().catch(console.error);
}

module.exports = { seedUsers };
