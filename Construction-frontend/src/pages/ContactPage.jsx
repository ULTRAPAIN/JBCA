import React, { useState } from 'react';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon,
  BuildingStorefrontIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import contactService from '../services/contactService';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Submit the contact form to the backend
      const response = await contactService.submitContactForm(formData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(response.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      
      // Handle different types of errors
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Please check your input and try again.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to send message. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      info: '+91 8983463892',
      subInfo: 'Mon-Sun 9:00 AM - 7:30 PM'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      info: 'dashrathpatel7890@gmail.com',
      subInfo: 'We reply within 24 hours'
    },
    {
      icon: MapPinIcon,
      title: 'Address',
      info: 'Jai Bhavani Cement Agency',
      subInfo: 'After Leo kids School, Anjurphata Road, near Ratan Talkies, Kamatghar, Bhiwandi, Maharashtra 421302'
    },
    {
      icon: ClockIcon,
      title: 'Business Hours',
      info: 'Monday - Sunday',
      subInfo: '9:00 AM - 7:30 PM'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Hero Section - Mobile Optimized */}
      <section className="bg-gradient-to-r from-gray-800 via-gray-900 to-black dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 mobile-md:py-16 sm:py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 mobile-md:px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 mobile-md:h-20 mobile-md:w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 rounded-full flex items-center justify-center mb-6 mobile-md:mb-8 shadow-xl animate-pulse">
              <BuildingStorefrontIcon className="h-8 w-8 mobile-md:h-10 mobile-md:w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <h1 className="text-2xl mobile-md:text-3xl mobile-lg:text-4xl sm:text-5xl font-bold text-white mb-4 mobile-md:mb-6">
              Contact <span className="text-yellow-400 dark:text-amber-400">Us</span>
            </h1>
            <p className="text-sm mobile-md:text-base mobile-lg:text-lg sm:text-xl text-gray-300 dark:text-slate-300 max-w-3xl mx-auto px-4">
              Get in touch with <span className="text-red-400 dark:text-orange-400 font-semibold">Jai Bhavani Cement Agency</span> for all your construction material needs
            </p>
            <div className="w-16 mobile-md:w-20 sm:w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto mt-6 mobile-md:mt-8"></div>
          </div>
        </div>
      </section>

      {/* Contact Information - Mobile Optimized */}
      <section className="py-8 mobile-md:py-12 sm:py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 mobile-md:px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 mobile-lg:grid-cols-2 lg:grid-cols-4 gap-4 mobile-md:gap-6 lg:gap-8">
            {contactInfo.map((contact, index) => (
              <div 
                key={index} 
                className="text-center p-4 mobile-md:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-slate-700 dark:to-slate-600 rounded-xl shadow-lg dark:shadow-slate-900/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-slate-600"
              >
                <div className="mx-auto h-12 w-12 mobile-md:h-16 mobile-md:w-16 bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 rounded-full flex items-center justify-center mb-4 mobile-md:mb-6 shadow-lg">
                  <contact.icon className="h-6 w-6 mobile-md:h-8 mobile-md:w-8 text-white" />
                </div>
                <h3 className="text-lg mobile-md:text-xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                  {contact.title}
                </h3>
                <p className="text-sm mobile-md:text-base text-gray-700 dark:text-slate-300 font-semibold mb-1">
                  {contact.info}
                </p>
                <p className="text-xs mobile-md:text-sm text-gray-500 dark:text-slate-400">
                  {contact.subInfo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section - Mobile Optimized */}
      <section className="py-8 mobile-md:py-12 sm:py-16 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 mobile-md:px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mobile-md:gap-12">
            
            {/* Contact Form - Mobile Optimized */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl dark:shadow-slate-900/20 p-4 mobile-md:p-6 sm:p-8 border-t-4 border-yellow-400 dark:border-amber-400 transition-colors duration-300">
              <div className="text-center mb-6 mobile-md:mb-8">
                <h2 className="text-xl mobile-md:text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-3 mobile-md:mb-4">
                  Send us a <span className="text-yellow-600 dark:text-amber-400">Message</span>
                </h2>
                <p className="text-sm mobile-md:text-base text-gray-600 dark:text-slate-400">
                  We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 mb-6 rounded-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                        ✅ Message sent successfully! We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                        ❌ {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mobile-md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mobile-md:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs mobile-md:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 mobile-md:mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="border-gray-300 dark:border-slate-600 focus:border-yellow-400 dark:focus:border-amber-400 focus:ring-yellow-400 dark:focus:ring-amber-400 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 text-sm mobile-md:text-base"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs mobile-md:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 mobile-md:mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="border-gray-300 dark:border-slate-600 focus:border-yellow-400 dark:focus:border-amber-400 focus:ring-yellow-400 dark:focus:ring-amber-400 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 text-sm mobile-md:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mobile-md:gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-xs mobile-md:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 mobile-md:mb-2">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className="border-gray-300 dark:border-slate-600 focus:border-yellow-400 dark:focus:border-amber-400 focus:ring-yellow-400 dark:focus:ring-amber-400 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 text-sm mobile-md:text-base"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs mobile-md:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 mobile-md:mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400 focus:border-yellow-400 dark:focus:border-amber-400 dark:bg-slate-700 dark:text-slate-100 text-sm mobile-md:text-base"
                    >
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="bulk-order">Bulk Order</option>
                      <option value="pricing">Pricing Information</option>
                      <option value="delivery">Delivery Inquiry</option>
                      <option value="account-upgrade">Account Upgrade</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs mobile-md:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1 mobile-md:mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message here..."
                    className="block w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400 focus:border-yellow-400 dark:focus:border-amber-400 resize-none dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 text-sm mobile-md:text-base"
                  />
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-500 dark:to-orange-600 hover:from-yellow-500 hover:to-red-600 dark:hover:from-amber-600 dark:hover:to-orange-700 text-white font-bold py-2.5 mobile-md:py-3 px-4 mobile-md:px-6 text-sm mobile-md:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <EnvelopeIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5 mr-2" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* Additional Information - Mobile Optimized */}
            <div className="space-y-6 mobile-md:space-y-8">
              {/* Why Choose Us */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/20 p-4 mobile-md:p-6 sm:p-8 border-l-4 border-yellow-400 dark:border-amber-400 transition-colors duration-300">
                <h3 className="text-lg mobile-md:text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4 mobile-md:mb-6">
                  Why Choose <span className="text-red-600 dark:text-orange-400">Jai Bhavani</span>?
                </h3>
                <div className="space-y-3 mobile-md:space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 dark:bg-amber-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm mobile-md:text-base text-gray-800 dark:text-slate-200">Quality Materials</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-xs mobile-md:text-sm">Premium construction supplies from trusted brands</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 dark:bg-orange-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm mobile-md:text-base text-gray-800 dark:text-slate-200">Competitive Pricing</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-xs mobile-md:text-sm">Best rates with special discounts for bulk orders</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 dark:bg-amber-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm mobile-md:text-base text-gray-800 dark:text-slate-200">Fast Delivery</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-xs mobile-md:text-sm">Quick and reliable delivery to your construction site</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 dark:bg-orange-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-sm mobile-md:text-base text-gray-800 dark:text-slate-200">Expert Support</h4>
                      <p className="text-gray-600 dark:text-slate-400 text-xs mobile-md:text-sm">Professional guidance for all your construction needs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-gradient-to-br from-yellow-50 to-red-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl shadow-lg dark:shadow-slate-900/20 p-4 mobile-md:p-6 sm:p-8 border border-yellow-200 dark:border-amber-700 transition-colors duration-300">
                <h3 className="text-lg mobile-md:text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4 mobile-md:mb-6">
                  Business <span className="text-yellow-600 dark:text-amber-400">Information</span>
                </h3>
                <div className="space-y-3 mobile-md:space-y-4 text-xs mobile-md:text-sm">
                  <div>
                    <h4 className="font-semibold text-sm mobile-md:text-base text-gray-800 dark:text-slate-200 mb-1 mobile-md:mb-2">Established</h4>
                    <p className="text-gray-600 dark:text-slate-400">Serving the construction industry for over 15 years</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mobile-md:text-base text-gray-800 dark:text-slate-200 mb-1 mobile-md:mb-2">Service Area</h4>
                    <p className="text-gray-600 dark:text-slate-400">Covering major cities and surrounding areas</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mobile-md:text-base text-gray-800 dark:text-slate-200 mb-1 mobile-md:mb-2">Specialization</h4>
                    <p className="text-gray-600 dark:text-slate-400">Cement, Steel, Bricks, and Construction Materials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
