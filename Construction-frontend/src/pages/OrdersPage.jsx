import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { 
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  EyeIcon,
  ShoppingBagIcon 
} from '@heroicons/react/24/outline';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('OrdersPage: Fetching user orders...');
      const response = await ordersAPI.getMyOrders();
      console.log('OrdersPage: Orders response:', response.data);
      
      // Backend returns: { success: true, data: { orders: [...], pagination: {...} } }
      const ordersData = response.data?.data?.orders || [];
      console.log('OrdersPage: Extracted orders:', ordersData);
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', err);
      setOrders([]); // Ensure orders is always an array
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      case 'out for delivery':
        return <TruckIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'out for delivery':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading orders..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <XCircleIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">Oops! Something went wrong</h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <Button 
              onClick={fetchOrders}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="mx-auto h-32 w-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-xl">
              <ShoppingBagIcon className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              No <span className="text-indigo-600 dark:text-indigo-400">Orders</span> Yet
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Start shopping for premium construction materials to see your orders here
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto mb-8"></div>
            <Link to="/products">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-12 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            My <span className="text-indigo-600 dark:text-indigo-400">Orders</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400">
            Track and manage your construction material orders
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto mt-4"></div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {Array.isArray(orders) && orders.length > 0 ? (
            orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-slate-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
              {/* Simplified Order Display */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)} shadow-sm`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Order Summary Line */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 dark:text-slate-300 mb-1 font-medium">
                          {order.items && order.items.length > 0 ? (
                            order.items.length === 1 ? (
                              `${order.items[0].product?.name || 'Product'} (Qty: ${order.items[0].quantity})`
                            ) : order.items.length === 2 ? (
                              `${order.items[0].product?.name || 'Product'}, ${order.items[1].product?.name || 'Product'}`
                            ) : (
                              `${order.items[0].product?.name || 'Product'}, ${order.items[1].product?.name || 'Product'} & ${order.items.length - 2} more`
                            )
                          ) : 'No items found'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''} • {order.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <Link to={`/orders/${order._id}`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center space-x-2 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-500 font-medium shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>View Details</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status Messages */}
                {order.status.toLowerCase() === 'processing' && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        Your order is being processed. We'll update you once it's confirmed.
                      </p>
                    </div>
                  </div>
                )}
                
                {order.status.toLowerCase() === 'out for delivery' && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TruckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        Your order is on the way! It should arrive soon.
                      </p>
                    </div>
                  </div>
                )}
                
                {order.status.toLowerCase() === 'delivered' && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        Order delivered successfully! Thank you for your business.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))) : (
            <div className="text-center py-16">
              <div className="mx-auto h-32 w-32 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center mb-8 shadow-xl">
                <ShoppingBagIcon className="h-16 w-16 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                Start shopping for premium construction materials to see your orders here
              </p>
              <Link to="/products">
                <Button className="bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white font-bold px-12 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-lg">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link to="/products">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white font-bold px-12 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
