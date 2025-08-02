const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, email, subject, and message)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create contact entry object
    const contactEntry = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : null,
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // For now, we'll just create notifications for admin users
    // In a real application, you might save to database, send email, etc.

    // Save contact form submission as notification to admin users
    try {
      // Find all admin users
      const adminUsers = await User.find({ role: 'admin' });
      
      if (adminUsers.length > 0) {
        // Create notifications for each admin user
        const notifications = adminUsers.map(admin => ({
          title: `New Contact Form Submission`,
          message: `Subject: ${contactEntry.subject}\n\nMessage: ${contactEntry.message}\n\nFrom: ${contactEntry.name} (${contactEntry.email})${contactEntry.phone ? `\nPhone: ${contactEntry.phone}` : ''}`,
          type: 'contact',
          priority: 'medium',
          recipient: admin._id,
          metadata: {
            contactData: contactEntry,
            contactType: 'form_submission',
            customerName: contactEntry.name,
            customerEmail: contactEntry.email,
            customerPhone: contactEntry.phone,
            subject: contactEntry.subject,
            fullMessage: contactEntry.message
          }
        }));

        // Save all notifications
        await Notification.insertMany(notifications);
        console.log(`Contact form notification sent to ${adminUsers.length} admin(s)`);
      } else {
        console.log('No admin users found to notify about contact form submission');
      }
    } catch (notificationError) {
      console.error('Error creating contact form notifications:', notificationError);
      // Don't fail the contact form submission if notification fails
    }

    res.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: {
        submittedAt: contactEntry.submittedAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your message. Please try again later.'
    });
  }
});

// @route   GET /api/contact/info
// @desc    Get contact information
// @access  Public
router.get('/info', (req, res) => {
  try {
    const contactInfo = {
      businessName: 'Jai Bhavani Cement Agency',
      phone: '+91 8983463892',
      email: 'dashrathpatel7890@gmail.com',
      address: {
        line1: 'After Leo kids School, Anjurphata Road',
        line2: 'near Ratan Talkies, Kamatghar',
        city: 'Bhiwandi',
        state: 'Maharashtra',
        pincode: '421302',
        country: 'India'
      },
      businessHours: {
        weekdays: 'Monday - Sunday',
        hours: '9:00 AM - 7:30 PM'
      },
      services: [
        'Cement Supply',
        'Construction Materials',
        'Bulk Orders',
        'Delivery Services'
      ]
    };

    res.json({
      success: true,
      data: contactInfo
    });

  } catch (error) {
    console.error('Contact info error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch contact information'
    });
  }
});

module.exports = router;
