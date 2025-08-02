// Notification API service
import api from './api';

class NotificationService {
  // Get notifications for authenticated user
  async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/notifications?${queryParams}`);
      console.log('Notification service response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error fetching notifications:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error fetching unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error deleting notification:', error);
      throw error;
    }
  }

  // Clear all read notifications
  async clearReadNotifications() {
    try {
      const response = await api.delete('/notifications/clear-read');
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error clearing read notifications:', error);
      throw error;
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      const response = await api.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      console.error('NotificationService: Error clearing all notifications:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;
