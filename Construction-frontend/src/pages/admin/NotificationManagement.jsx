import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import { 
  BellIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  EyeIcon,
  ShoppingBagIcon,
  UserIcon,
  CubeIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, order, user, product, system
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [filter, typeFilter, page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filter === 'unread') params.isRead = false;
      if (filter === 'read') params.isRead = true;
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await notificationService.getNotifications(params);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await notificationService.markAsRead(notification._id);
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Trigger notification refresh event for navbar
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      }

      // Navigate based on notification type
      if (notification.type === 'order' && notification.relatedOrder) {
        navigate(`/admin/dashboard?tab=orders&orderId=${notification.relatedOrder._id}`);
      } else if (notification.type === 'user' && notification.relatedUser) {
        navigate(`/admin/dashboard?tab=customers&userId=${notification.relatedUser._id}`);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Trigger notification refresh event for navbar
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      // Trigger notification refresh event for navbar
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      // Recalculate unread count
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Trigger notification refresh event for navbar
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationService.clearReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconClass = `h-6 w-6 ${priority === 'high' || priority === 'urgent' 
      ? 'text-red-500' 
      : priority === 'medium' 
        ? 'text-yellow-500' 
        : 'text-blue-500'
    }`;

    switch (type) {
      case 'order':
        return <ShoppingBagIcon className={iconClass} />;
      case 'user':
        return <UserIcon className={iconClass} />;
      case 'product':
        return <CubeIcon className={iconClass} />;
      case 'contact':
        return <ChatBubbleLeftRightIcon className={iconClass} />;
      default:
        return <ExclamationCircleIcon className={iconClass} />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      low: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4 mobile-md:space-y-6">
      {/* Header */}
      <div className="flex flex-col mobile-lg:flex-row mobile-lg:items-center mobile-lg:justify-between space-y-3 mobile-lg:space-y-0">
        <div>
          <h1 className="text-xl mobile-md:text-2xl font-bold text-gray-900 dark:text-slate-100">Notifications</h1>
          <p className="text-sm mobile-md:text-base text-gray-600 dark:text-slate-300 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
          </p>
        </div>
        <div className="flex flex-col mobile-md:flex-row items-stretch mobile-md:items-center space-y-2 mobile-md:space-y-0 mobile-md:space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center justify-center space-x-2 px-3 mobile-md:px-4 py-2 bg-blue-600 dark:bg-amber-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-amber-600 transition-colors duration-200 text-sm mobile-md:text-base"
            >
              <CheckCircleIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5" />
              <span>Clear Read</span>
            </button>
          )}
          <button
            onClick={handleClearRead}
            className="flex items-center justify-center space-x-2 px-3 mobile-md:px-4 py-2 bg-gray-600 dark:bg-slate-600 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-slate-700 transition-colors duration-200 text-sm mobile-md:text-base"
          >
            <TrashIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5" />
            <span>Clear Read</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 p-3 mobile-md:p-4 transition-colors duration-300">
        <div className="flex flex-col mobile-lg:flex-row mobile-lg:items-center space-y-3 mobile-lg:space-y-0 mobile-lg:space-x-6">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5 text-gray-400 dark:text-slate-400" />
            <span className="text-sm mobile-md:text-base font-medium text-gray-700 dark:text-slate-300">Filters:</span>
          </div>
          
          <div className="flex flex-col mobile-md:flex-row space-y-3 mobile-md:space-y-0 mobile-md:space-x-4 flex-1">
            {/* Read Status Filter */}
            <div className="flex flex-col mobile-md:flex-row mobile-md:items-center space-y-1 mobile-md:space-y-0 mobile-md:space-x-2">
              <label className="text-sm text-gray-600 dark:text-slate-300 mobile-md:whitespace-nowrap">Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full mobile-md:w-auto border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex flex-col mobile-md:flex-row mobile-md:items-center space-y-1 mobile-md:space-y-0 mobile-md:space-x-2">
              <label className="text-sm text-gray-600 dark:text-slate-300 mobile-md:whitespace-nowrap">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full mobile-md:w-auto border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
              >
                <option value="all">All Types</option>
                <option value="order">Orders</option>
                <option value="user">Users</option>
                <option value="product">Products</option>
                <option value="contact">Contact Forms</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 transition-colors duration-300">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-amber-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-slate-300">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 dark:text-red-400">
            <ExclamationCircleIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
            <button
              onClick={loadNotifications}
              className="mt-4 px-4 py-2 bg-blue-600 dark:bg-amber-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-amber-600"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <BellIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-slate-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No notifications</h3>
            <p className="text-gray-600 dark:text-slate-300">
              {filter === 'unread' 
                ? "You don't have any unread notifications" 
                : filter === 'read'
                  ? "You don't have any read notifications"
                  : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-600">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 mobile-md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-150 ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-amber-900/20 border-l-4 border-l-blue-500 dark:border-l-amber-400' : ''
                }`}
              >
                <div className="flex items-start space-x-3 mobile-md:space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col mobile-lg:flex-row mobile-lg:items-start mobile-lg:justify-between space-y-2 mobile-lg:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col mobile-md:flex-row mobile-md:items-center space-y-2 mobile-md:space-y-0 mobile-md:space-x-3 mb-2">
                          <h3 className={`text-base mobile-md:text-lg font-medium ${!notification.isRead ? 'text-gray-900 dark:text-slate-100' : 'text-gray-700 dark:text-slate-300'}`}>
                            {notification.title}
                          </h3>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className={`text-sm ${!notification.isRead ? 'text-gray-800 dark:text-slate-200' : 'text-gray-600 dark:text-slate-400'} mb-3 leading-relaxed`}>
                          {notification.message}
                        </p>
                        <div className="flex flex-col mobile-md:flex-row mobile-md:items-center mobile-md:justify-between space-y-2 mobile-md:space-y-0">
                          <p className="text-xs text-gray-400 dark:text-slate-500 order-2 mobile-md:order-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 order-1 mobile-md:order-2">
                            {notification.relatedOrder && (
                              <span className="text-xs text-blue-600 dark:text-amber-600 bg-blue-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                                Order #{notification.relatedOrder.orderNumber}
                              </span>
                            )}
                            {notification.relatedUser && (
                              <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                User: {notification.relatedUser.name}
                              </span>
                            )}
                            {notification.type === 'contact' && notification.metadata && (
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                                  Contact: {notification.metadata.customerName}
                                </span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                  {notification.metadata.customerEmail}
                                </span>
                                {notification.metadata.customerPhone && (
                                  <span className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 px-2 py-1 rounded">
                                    {notification.metadata.customerPhone}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-1 mobile-md:space-x-2 ml-0 mobile-lg:ml-4 flex-shrink-0 mt-2 mobile-lg:mt-0">
                        {!notification.isRead && (
                          <>
                            <button
                              onClick={(e) => handleMarkAsRead(notification._id, e)}
                              className="text-blue-600 dark:text-amber-400 hover:text-blue-800 dark:hover:text-amber-300 p-2 mobile-md:p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-amber-900/20 transition-colors duration-200"
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5" />
                            </button>
                            <div className="w-2 h-2 bg-blue-500 dark:bg-amber-400 rounded-full flex-shrink-0"></div>
                          </>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                          className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 mobile-md:p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                          title="Delete notification"
                        >
                          <TrashIcon className="h-4 w-4 mobile-md:h-5 mobile-md:w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 mobile-md:px-6 py-3 mobile-md:py-4 border-t border-gray-200 dark:border-slate-600 flex flex-col mobile-md:flex-row mobile-md:items-center mobile-md:justify-between space-y-3 mobile-md:space-y-0">
            <div className="text-sm text-gray-700 dark:text-slate-300 text-center mobile-md:text-left">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center justify-center mobile-md:justify-end space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 mobile-md:px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 min-w-[80px]"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 mobile-md:px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 min-w-[80px]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;
