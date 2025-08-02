const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

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

// Sample notifications for different user roles
const createSampleNotifications = async () => {
  try {
    console.log('🔄 Creating sample notifications...');

    // Get users with different roles
    const primaryUser = await User.findOne({ role: 'primary' });
    const secondaryUser = await User.findOne({ role: 'secondary' });
    const registeredUser = await User.findOne({ role: 'registered' });

    if (!primaryUser || !secondaryUser || !registeredUser) {
      console.log('❌ Required users not found. Please run user seeding first.');
      return;
    }

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('🗑️ Cleared existing notifications');

    // Notifications for Primary User
    const primaryNotifications = [
      {
        recipient: primaryUser._id,
        type: 'account',
        priority: 'high',
        title: 'Account Upgraded to Primary',
        message: 'Congratulations! Your account has been upgraded to Primary Customer with exclusive pricing benefits and priority support.',
        isRead: false
      },
      {
        recipient: primaryUser._id,
        type: 'order',
        priority: 'medium',
        title: 'Order Confirmation',
        message: 'Your order #ORD-2024001 for 50 bags of Portland Cement has been confirmed and will be processed soon.',
        isRead: false
      },
      {
        recipient: primaryUser._id,
        type: 'info',
        priority: 'low',
        title: 'New Product Available',
        message: 'Check out our new high-grade cement perfect for construction projects. Special pricing for Primary customers!',
        isRead: true
      },
      {
        recipient: primaryUser._id,
        type: 'order',
        priority: 'high',
        title: 'Order Shipped',
        message: 'Your order #ORD-2024001 has been shipped and will arrive within 2-3 business days. Track your order for updates.',
        isRead: false
      }
    ];

    // Notifications for Secondary User
    const secondaryNotifications = [
      {
        recipient: secondaryUser._id,
        type: 'account',
        priority: 'medium',
        title: 'Welcome to Jai Bhavani Cement Agency',
        message: 'Welcome! Your account has been created as a Secondary Customer. Enjoy competitive pricing and reliable service.',
        isRead: false
      },
      {
        recipient: secondaryUser._id,
        type: 'info',
        priority: 'low',
        title: 'Payment Methods Available',
        message: 'You can now pay using multiple methods including cash on delivery, bank transfer, and online payment.',
        isRead: true
      },
      {
        recipient: secondaryUser._id,
        type: 'order',
        priority: 'medium',
        title: 'Order Delivered',
        message: 'Your order #ORD-2024002 for 25 bags of OPC Cement has been successfully delivered. Thank you for your business!',
        isRead: false
      }
    ];

    // Notifications for Registered User
    const registeredNotifications = [
      {
        recipient: registeredUser._id,
        type: 'account',
        priority: 'medium',
        title: 'Account Registration Successful',
        message: 'Welcome to Jai Bhavani Cement Agency! Your account has been successfully created. Start exploring our products.',
        isRead: false
      },
      {
        recipient: registeredUser._id,
        type: 'info',
        priority: 'low',
        title: 'First Order Discount',
        message: 'Get 5% off on your first order! Use code WELCOME5 at checkout. Valid for orders above ₹10,000.',
        isRead: false
      },
      {
        recipient: registeredUser._id,
        type: 'info',
        priority: 'low',
        title: 'Quality Assurance',
        message: 'All our cement products come with quality certification and are tested for strength and durability.',
        isRead: true
      },
      {
        recipient: registeredUser._id,
        type: 'order',
        priority: 'medium',
        title: 'Order Placed',
        message: 'Your order #ORD-2024003 for 10 bags of PPC Cement has been placed successfully. You will receive updates soon.',
        isRead: false
      }
    ];

    // Insert all notifications with timestamps
    const allNotifications = [
      ...primaryNotifications.map(notif => ({
        ...notif,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last 7 days
      })),
      ...secondaryNotifications.map(notif => ({
        ...notif,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      })),
      ...registeredNotifications.map(notif => ({
        ...notif,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }))
    ];

    await Notification.insertMany(allNotifications);

    console.log('✅ Sample notifications created successfully!');
    console.log(`📊 Created ${primaryNotifications.length} notifications for Primary user`);
    console.log(`📊 Created ${secondaryNotifications.length} notifications for Secondary user`);
    console.log(`📊 Created ${registeredNotifications.length} notifications for Registered user`);
    console.log(`📊 Total notifications: ${allNotifications.length}`);

    // Show unread counts
    const primaryUnread = await Notification.countDocuments({ 
      recipient: primaryUser._id, 
      isRead: false 
    });
    const secondaryUnread = await Notification.countDocuments({ 
      recipient: secondaryUser._id, 
      isRead: false 
    });
    const registeredUnread = await Notification.countDocuments({ 
      recipient: registeredUser._id, 
      isRead: false 
    });

    console.log(`🔔 Unread notifications:`);
    console.log(`   Primary user: ${primaryUnread}`);
    console.log(`   Secondary user: ${secondaryUnread}`);
    console.log(`   Registered user: ${registeredUnread}`);

  } catch (error) {
    console.error('❌ Error creating sample notifications:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await createSampleNotifications();
  } catch (error) {
    console.error('❌ Error in main execution:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
main();
