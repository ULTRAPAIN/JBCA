import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import orderService from '../../services/orderService';
import { 
  EyeIcon, 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      console.log('CustomerManagement: Loading customers from database...');
      
      const customersResponse = await userService.getAllCustomers();
      console.log('CustomerManagement: Customers response:', customersResponse);
      
      const allCustomers = customersResponse.data;
      console.log('CustomerManagement: All customers data:', allCustomers);
      
      // Enhance customer data with order information
      const enhancedCustomers = await Promise.all(
        allCustomers.map(async (customer) => {
          try {
            // Get all orders and filter by customer ID
            const allOrders = await orderService.getAllOrders();
            const customerOrders = allOrders.filter(order => 
              order.user?._id === customer._id || order.user?.id === customer._id
            );
            
            const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
            
            return {
              ...customer,
              totalOrders: customerOrders.length,
              totalSpent: totalSpent,
              joinDate: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A',
              lastOrder: customerOrders.length > 0 
                ? new Date(Math.max(...customerOrders.map(o => new Date(o.orderDate || o.createdAt)))).toLocaleDateString()
                : 'No orders'
            };
          } catch (error) {
            console.log('CustomerManagement: Error enhancing customer:', customer.name, error);
            return {
              ...customer,
              totalOrders: 0,
              totalSpent: 0,
              joinDate: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A',
              lastOrder: 'No orders'
            };
          }
        })
      );
      
      console.log('CustomerManagement: Enhanced customers:', enhancedCustomers);
      setCustomers(enhancedCustomers);
    } catch (error) {
      console.error('CustomerManagement: Error loading customers:', error);
      // Set empty array on error to show empty state
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customer) => {
    try {
      setSelectedCustomer(customer);
      // Load customer's orders - get all orders and filter by customer ID
      const allOrders = await orderService.getAllOrders();
      const customerOrders = allOrders.filter(order => 
        order.user?._id === customer._id || order.user?.id === customer._id
      );
      setCustomerOrders(customerOrders);
      setShowCustomerModal(true);
    } catch (error) {
      console.error('Error loading customer details:', error);
      setCustomerOrders([]);
      setShowCustomerModal(true);
    }
  };

  const handleContactCustomer = (customer) => {
    // Create a contact modal or redirect to email/phone
    const subject = `Regarding your account at Jai Bhavani Cement Agency`;
    const body = `Dear ${customer.name},\n\nWe hope you are doing well.\n\nBest regards,\nJai Bhavani Cement Agency Team`;
    
    if (customer.email) {
      window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else if (customer.phone) {
      window.location.href = `tel:${customer.phone}`;
    } else {
      alert('No contact information available for this customer.');
    }
  };

  const updateCustomerRole = async (customerId, newRole) => {
    try {
      await userService.updateUserRole(customerId, newRole);
      // Reload customers to reflect the change
      loadCustomers();
      alert('Customer role updated successfully!');
    } catch (error) {
      console.error('Error updating customer role:', error);
      alert('Error updating customer role. Please try again.');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'primary': return 'bg-green-100 text-green-800';
      case 'secondary': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-3 mobile-md:p-4 md:p-6">
      <div className="mb-4 mobile-md:mb-6">
        <h2 className="text-xl mobile-md:text-2xl font-bold text-gray-800 dark:text-slate-100 mb-3 mobile-md:mb-4">Customer Management</h2>
        
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-transparent text-sm mobile-md:text-base"
          />
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-amber-400"></div>
                </div>
              ) : searchTerm ? (
                <p className="text-gray-500 dark:text-slate-400">No customers found matching "{searchTerm}"</p>
              ) : (
                <div>
                  <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-slate-100">No customers found</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Customers will appear here once they register and place orders.</p>
                </div>
              )}
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div 
                key={customer._id || customer.id} 
                className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/20 border border-gray-200 dark:border-slate-600 p-4 transition-colors duration-300"
              >
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0 h-10 w-10 mobile-md:h-12 mobile-md:w-12">
                      <div className="h-full w-full rounded-full bg-blue-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6 text-blue-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="text-sm mobile-md:text-base font-medium text-gray-900 dark:text-slate-100 truncate">
                        {customer.name}
                      </h3>
                      <p className="text-xs mobile-md:text-sm text-gray-500 dark:text-slate-400 truncate">
                        {customer.email}
                      </p>
                      {customer.phone && (
                        <p className="text-xs mobile-md:text-sm text-gray-500 dark:text-slate-400">
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Role Badge */}
                  <div className="flex-shrink-0 ml-3">
                    <select
                      value={customer.role || 'registered'}
                      onChange={(e) => updateCustomerRole(customer._id || customer.id, e.target.value)}
                      className="px-2 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 w-full min-w-[90px] text-center"
                    >
                      <option value="registered">Registered</option>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </select>
                  </div>
                </div>

                {/* Customer Stats */}
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                    <div className="flex items-center justify-center mb-1">
                      <ShoppingBagIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                    </div>
                    <p className="text-xs mobile-md:text-sm font-medium text-gray-900 dark:text-slate-100">
                      {customer.totalOrders || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Orders</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                    <div className="flex items-center justify-center mb-1">
                      <CurrencyRupeeIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                    </div>
                    <p className="text-xs mobile-md:text-sm font-medium text-gray-900 dark:text-slate-100">
                      ₹{customer.totalSpent?.toFixed(0) || '0'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Spent</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                    <div className="flex items-center justify-center mb-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                    </div>
                    <p className="text-xs mobile-md:text-sm font-medium text-gray-900 dark:text-slate-100">
                      {customer.joinDate || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Joined</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewCustomer(customer)}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-xs mobile-md:text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 flex items-center justify-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleContactCustomer(customer)}
                    className="flex-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg text-xs mobile-md:text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-200 flex items-center justify-center"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    Contact
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/20 border border-gray-200 dark:border-slate-600 overflow-hidden transition-colors duration-300">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                    {loading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-amber-400"></div>
                      </div>
                    ) : searchTerm ? (
                      `No customers found matching "${searchTerm}"`
                    ) : (
                      <div>
                        <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium">No customers found</p>
                        <p className="text-sm">Customers will appear here once they register and place orders.</p>
                        <p className="text-xs text-blue-600 mt-2">Debug: Total customers loaded: {customers.length}</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id || customer.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-blue-600 dark:text-amber-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{customer.name}</div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500 dark:text-slate-400">{customer.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={customer.role || 'registered'}
                        onChange={(e) => updateCustomerRole(customer._id || customer.id, e.target.value)}
                        className="px-2 py-1 text-xs font-semibold rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400"
                      >
                        <option value="registered">Registered</option>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <ShoppingBagIcon className="h-4 w-4 mr-1 text-gray-400 dark:text-slate-500" />
                        {customer.totalOrders || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <CurrencyRupeeIcon className="h-4 w-4 mr-1 text-gray-400 dark:text-slate-500" />
                        {customer.totalSpent?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400 dark:text-slate-500" />
                        {customer.joinDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleContactCustomer(customer)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 flex items-center"
                        >
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 mobile-md:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-600">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600 p-4 mobile-md:p-6 flex justify-between items-center">
              <h3 className="text-lg mobile-md:text-xl font-bold text-gray-800 dark:text-slate-100">Customer Details</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 mobile-md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mobile-md:gap-6">
                {/* Customer Info */}
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-3">Customer Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Name:</span>
                      <p className="text-sm mobile-md:text-base text-gray-900 dark:text-slate-100">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Email:</span>
                      <p className="text-sm mobile-md:text-base text-gray-900 dark:text-slate-100 break-all">{selectedCustomer.email}</p>
                    </div>
                    {selectedCustomer.phone && (
                      <div>
                        <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Phone:</span>
                        <p className="text-sm mobile-md:text-base text-gray-900 dark:text-slate-100">{selectedCustomer.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Role:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedCustomer.role || 'registered')}`}>
                        {(selectedCustomer.role || 'registered').charAt(0).toUpperCase() + (selectedCustomer.role || 'registered').slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Join Date:</span>
                      <p className="text-sm mobile-md:text-base text-gray-900 dark:text-slate-100">{selectedCustomer.joinDate}</p>
                    </div>
                    <div>
                      <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Last Order:</span>
                      <p className="text-sm mobile-md:text-base text-gray-900 dark:text-slate-100">{selectedCustomer.lastOrder}</p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-3">Order Summary</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Total Orders:</span>
                      <p className="text-sm mobile-md:text-base text-gray-900 dark:text-slate-100">{customerOrders.length}</p>
                    </div>
                    <div>
                      <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Total Spent:</span>
                      <p className="text-sm mobile-md:text-base text-gray-900 dark:text-slate-100">₹{customerOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400">Average Order:</span>
                      <p className="text-sm mobile-md:text-base text-gray-900 dark:text-slate-100">₹{customerOrders.length > 0 ? (customerOrders.reduce((sum, order) => sum + order.total, 0) / customerOrders.length).toFixed(2) : '0.00'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              {customerOrders.length > 0 && (
                <div className="mt-4 mobile-md:mt-6">
                  <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-3">Recent Orders</h4>
                  
                  {/* Mobile Order Cards */}
                  <div className="md:hidden space-y-3">
                    {customerOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-slate-400">Order ID</p>
                            <p className="text-sm text-gray-900 dark:text-slate-100">#{order._id?.slice(-8) || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-600 dark:text-slate-400">Total</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">₹{order.total.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-slate-400">Date</p>
                            <p className="text-sm text-gray-900 dark:text-slate-100">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Status</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                              order.status === 'out-for-delivery' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                              'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                            }`}>
                              {order.status === 'out-for-delivery' ? 'Out for Delivery' : order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Order ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Date</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                        {customerOrders.slice(0, 5).map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-slate-100">{order._id?.slice(-8) || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                order.status === 'out-for-delivery' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                              }`}>
                                {order.status === 'out-for-delivery' ? 'Out for Delivery' : order.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-slate-100">₹{order.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
