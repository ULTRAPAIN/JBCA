import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ordersAPI, adminAPI } from '../services/api';
import orderService from '../services/orderService';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { 
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const isNewOrder = location.state?.newOrder;
  const isAdminRoute = location.pathname.includes('/admin/');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Listen for order updates from admin dashboard
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'orderUpdated' && e.newValue === id) {
        console.log('OrderDetailPage: Order updated, refreshing...');
        fetchOrder();
        // Clear the flag
        localStorage.removeItem('orderUpdated');
      }
    };

    const handleFocus = () => {
      console.log('OrderDetailPage: Window focused, refreshing order data...');
      fetchOrder();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  const fetchOrder = async () => {
    try {
      // Use admin API if accessing from admin route, otherwise use customer API
      const response = isAdminRoute 
        ? await adminAPI.getOrderById(id)
        : await ordersAPI.getById(id);
      
      // Handle different response structures
      const orderData = response.data?.data?.order || response.data?.data || response.data;
      
      setOrder(orderData);
    } catch (err) {
      console.error('OrderDetailPage: Error fetching order:', err);
      console.error('OrderDetailPage: Error response:', err.response);
      console.error('OrderDetailPage: Error status:', err.response?.status);
      console.error('OrderDetailPage: Error data:', err.response?.data);
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (!isAdminRoute) return;
    
    try {
      setUpdating(true);
      setError(null);
      
      console.log('OrderDetailPage: Updating order status to:', newStatus);
      const response = await adminAPI.updateOrder(order._id, { status: newStatus });
      console.log('OrderDetailPage: Status update response:', response.data);
      
      // Update local order state
      setOrder(prev => ({ ...prev, status: newStatus }));
      setSuccessMessage(`Order status updated to "${newStatus}" successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      console.error('OrderDetailPage: Error updating status:', err);
      setError(`Failed to update order status: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const canCancelOrder = (order) => {
    // Orders can only be cancelled if they are in 'Processing' or 'Confirmed' status
    return ['processing', 'confirmed'].includes(order.status.toLowerCase());
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!order) return;

    setCancellingOrder(true);
    try {
      await orderService.cancelOrder(order._id);
      
      // Update the order in the local state
      setOrder(prev => ({ ...prev, status: 'Cancelled' }));
      
      setShowCancelModal(false);
      setSuccessMessage('Order cancelled successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError(`Failed to cancel order: ${err.response?.data?.message || err.message}`);
      setShowCancelModal(false);
    } finally {
      setCancellingOrder(false);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  const getStatusIcon = (status) => {
    if (!status) return <ClockIcon className="h-6 w-6 text-gray-500 dark:text-slate-400" />;
    
    switch (status.toLowerCase()) {
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />;
      case 'out for delivery':
        return <TruckIcon className="h-6 w-6 text-purple-500 dark:text-purple-400" />;
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />;
      case 'cancelled':
        return <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500 dark:text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-600';
    
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-600';
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-600';
      case 'out for delivery':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-600';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-600';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-600';
      default:
        return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderTimeline = () => {
    if (!order || !order.status) return [];
    
    const timeline = [
      { status: 'processing', label: 'Order Placed', completed: true },
      { status: 'confirmed', label: 'Order Confirmed', completed: order.status.toLowerCase() !== 'processing' },
      { status: 'out for delivery', label: 'Out for Delivery', completed: ['out for delivery', 'delivered'].includes(order.status.toLowerCase()) },
      { status: 'delivered', label: 'Delivered', completed: order.status.toLowerCase() === 'delivered' },
    ];

    if (order.status.toLowerCase() === 'cancelled') {
      return [
        { status: 'processing', label: 'Order Placed', completed: true },
        { status: 'cancelled', label: 'Order Cancelled', completed: true },
      ];
    }

    return timeline;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-300">
        <Loading size="lg" variant="crane" text="Loading order details..." showLogo={true} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-300 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => navigate(isAdminRoute ? '/admin/dashboard?tab=orders' : '/orders')}>
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-300 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-slate-400 mb-4">Order not found</p>
            <Button onClick={() => navigate(isAdminRoute ? '/admin/dashboard?tab=orders' : '/orders')}>
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-colors duration-300 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Success Message for New Orders */}
        {isNewOrder && (
          <div className="mb-6 sm:mb-8 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded-xl p-4 sm:p-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-medium text-green-800 dark:text-green-200">
                  Order Placed Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-1 text-sm sm:text-base">
                  Thank you for your order. We'll process it and keep you updated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-sm">
            <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 sm:mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded-xl p-3 sm:p-4 shadow-lg backdrop-blur-sm">
            <p className="text-green-800 dark:text-green-200 text-sm sm:text-base">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(isAdminRoute ? '/admin/dashboard?tab=orders' : '/orders')}
            className="mb-3 sm:mb-4 flex items-center space-x-2 text-xs sm:text-sm px-3 sm:px-4 py-2 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Back to {isAdminRoute ? 'Order Management' : 'Orders'}</span>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 break-all">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            
            <div className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 rounded-lg border ${getStatusColor(order.status)} self-start sm:self-auto`}>
              {getStatusIcon(order.status)}
              <span className="font-medium text-sm sm:text-base">
                {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Unknown Status'}
              </span>
            </div>
          </div>

          {/* Admin Status Update Controls */}
          {isAdminRoute && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg shadow-sm backdrop-blur-sm">
              <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">Admin Controls</h3>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <label htmlFor="status-update" className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Update Status:
                </label>
                <select
                  id="status-update"
                  value={order.status}
                  onChange={(e) => updateOrderStatus(e.target.value)}
                  disabled={updating}
                  className={`px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    updating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="Processing">Processing</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {updating && (
                  <span className="text-sm text-blue-600 dark:text-blue-400">Updating...</span>
                )}
              </div>
            </div>
          )}

          {/* Customer Cancel Order Controls */}
          {!isAdminRoute && order && canCancelOrder(order) && (
            <div className="mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">Order Cancellation</h3>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    {order.status.toLowerCase() === 'processing' 
                      ? 'You can cancel this order free of charge as it hasn\'t been confirmed yet.'
                      : order.status.toLowerCase() === 'confirmed'
                      ? 'This order has been confirmed. Cancellation may be subject to fees.'
                      : 'This order is being delivered. Emergency cancellation may incur charges.'}
                  </p>
                </div>
                <Button
                  onClick={handleCancelOrder}
                  disabled={cancellingOrder}
                  variant="outline"
                  className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-500 whitespace-nowrap"
                >
                  {cancellingOrder ? (
                    <div className="flex items-center space-x-2">
                      <Loading size="sm" />
                      <span>Cancelling...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <XCircleIcon className="h-4 w-4" />
                      <span>Cancel Order</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Timeline */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-slate-100 mb-4 sm:mb-6">Order Status</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {getOrderTimeline().map((step, index) => (
              <div key={step.status} className="flex items-center">
                <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400' 
                    : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600'
                }`}>
                  {step.completed ? (
                    <CheckCircleIcon className="h-3 w-3 sm:h-5 sm:w-5 text-green-500 dark:text-green-400" />
                  ) : (
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-300 dark:bg-slate-500 rounded-full"></div>
                  )}
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className={`text-sm sm:text-base font-medium ${
                    step.completed ? 'text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-6">
          {/* Order Items */}
          <div className="lg:col-span-7">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Order Items</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 sm:space-x-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-center object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                          <span className="text-gray-400 dark:text-slate-500 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-slate-100 truncate">
                        {item.product?.name || 'Product not found'}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                          {item.quantity} {item.product?.unit || 'units'} × ₹{item.priceAtPurchase.toFixed(2)}
                        </span>
                        <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-slate-100">
                          ₹{item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-slate-400 text-center">No items found</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary & Details - Compact Layout */}
          <div className="lg:col-span-5">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-slate-100 mb-3 sm:mb-4">Order Summary</h2>
              
              {/* Total Amount - Prominent */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 sm:p-4 mb-4 border border-amber-200 dark:border-amber-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-slate-300">Total Amount</span>
                  <span className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-amber-200 dark:border-amber-700">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Est. Delivery</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">{formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="mb-4">
                <div className="flex items-start space-x-2 mb-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Delivery Address</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 ml-6">
                  <p className="break-words">{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                </div>
              </div>

              {/* Payment & Order Details */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">Payment</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{order.paymentMethod}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                    <span className="text-sm text-gray-600 dark:text-slate-400">Order Date</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">Notes</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 break-words bg-gray-50 dark:bg-slate-700 p-2 rounded-md">{order.notes}</p>
                </div>
              )}

              {/* Contact Support - Compact */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs sm:text-sm"
                  onClick={() => navigate('/contact')}
                >
                  <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 text-center mb-2">
                Cancel Order
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-6">
                Are you sure you want to cancel order <span className="font-semibold text-gray-900 dark:text-slate-100">#{order.orderNumber}</span>?
              </p>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                      Cancellation Policy
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      {order.status.toLowerCase() === 'processing' 
                        ? 'This order can be cancelled free of charge as it hasn\'t been confirmed yet.'
                        : order.status.toLowerCase() === 'confirmed'
                        ? 'This order has been confirmed. Cancellation may be subject to fees.'
                        : 'This order is being delivered. Emergency cancellation may incur charges.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={closeCancelModal}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Keep Order
                </Button>
                <Button
                  onClick={confirmCancelOrder}
                  disabled={cancellingOrder}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {cancellingOrder ? (
                    <div className="flex items-center justify-center">
                      <Loading size="sm" className="mr-2" />
                      Cancelling...
                    </div>
                  ) : (
                    'Cancel Order'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
