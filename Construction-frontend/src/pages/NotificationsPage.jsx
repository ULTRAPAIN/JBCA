import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
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
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const NotificationsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications();
      console.log('Notifications response:', response); // Debug log
      const notificationsData = response?.data?.notifications || response?.notifications || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    setActionLoading(prev => ({ ...prev, [notificationId]: true }));
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const deleteNotification = async (notificationId) => {
    setActionLoading(prev => ({ ...prev, [notificationId]: true }));
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  const markAllAsRead = async () => {
    setActionLoading(prev => ({ ...prev, 'markAll': true }));
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, 'markAll': false }));
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(prev => ({ ...prev, 'clearAll': true }));
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, 'clearAll': false }));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBagIcon className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <UserIcon className="h-5 w-5 text-green-500" />;
      case 'product':
        return <CubeIcon className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        <Loading size="lg" variant="simple" text="Loading notifications..." showLogo={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-red-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-16 md:pt-20 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* Back button and title */}
          <div className="flex items-center mb-4 sm:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-slate-800/50 rounded-lg transition-all duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <BellIcon className="h-6 w-6 text-red-500 dark:text-amber-400" />
              {unreadCount > 0 && (
                <span className="bg-red-500 dark:bg-amber-500 text-white dark:text-slate-900 text-xs rounded-full px-2 py-1 font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Filter Buttons - Mobile First */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-red-500 to-yellow-500 dark:from-amber-400 dark:to-orange-400 text-white dark:text-slate-900 shadow-lg transform scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-slate-600'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-red-500 to-yellow-500 dark:from-amber-400 dark:to-orange-400 text-white dark:text-slate-900 shadow-lg transform scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-slate-600'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'read'
                    ? 'bg-gradient-to-r from-red-500 to-yellow-500 dark:from-amber-400 dark:to-orange-400 text-white dark:text-slate-900 shadow-lg transform scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-slate-600'
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                disabled={actionLoading.markAll}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {actionLoading.markAll ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    <span>Marking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    <span>Mark All Read</span>
                  </>
                )}
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                onClick={clearAllNotifications}
                disabled={actionLoading.clearAll}
                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {actionLoading.clearAll ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    <span>Clear All</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center flex-wrap gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-400 flex-1 min-w-0">{error}</span>
              <Button
                onClick={loadNotifications}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-100 to-yellow-100 dark:from-red-900/30 dark:to-yellow-900/30 rounded-2xl mb-4">
                <BellIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 dark:text-amber-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">
                {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications found.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 sm:p-6 rounded-xl border transition-all duration-200 backdrop-blur-sm hover:shadow-lg ${
                  notification.isRead
                    ? 'bg-white/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700'
                    : 'bg-gradient-to-r from-blue-50 via-red-50 to-yellow-50 dark:from-blue-900/20 dark:via-red-900/20 dark:to-yellow-900/20 border-red-200 dark:border-red-500/30 ring-1 ring-red-200 dark:ring-red-500/30 shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-slate-100 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-red-500 dark:bg-amber-400 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            disabled={actionLoading[notification._id]}
                            className="p-1.5 sm:p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                            title="Mark as read"
                          >
                            {actionLoading[notification._id] ? (
                              <Loading size="xs" />
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          disabled={actionLoading[notification._id]}
                          className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          title="Delete notification"
                        >
                          {actionLoading[notification._id] ? (
                            <Loading size="xs" />
                          ) : (
                            <TrashIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-slate-500">
                      <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>{formatDate(notification.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
