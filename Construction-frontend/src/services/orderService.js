import api, { adminAPI, ordersAPI } from './api';

class OrderService {
  // Create a new order
  async createOrder(orderData) {
    try {
      console.log('OrderService: Creating order with data:', orderData);
      const response = await ordersAPI.create(orderData);
      console.log('OrderService: Order creation response:', response.data);
      
      // Handle different response structures
      if (response.data?.success && response.data?.data?.order) {
        console.log('OrderService: Found order in data.data.order');
        return response.data.data.order;
      } else if (response.data?.data) {
        console.log('OrderService: Found order in data.data');
        return response.data.data;
      } else if (response.data) {
        console.log('OrderService: Found order in data');
        return response.data;
      } else {
        console.log('OrderService: Returning full response');
        return response;
      }
    } catch (error) {
      console.error('OrderService: Error creating order:', error);
      console.error('OrderService: Error response:', error.response?.data);
      throw error;
    }
  }

  // Get user's orders
  async getUserOrders() {
    try {
      const response = await ordersAPI.getMyOrders();
      return response.data;
    } catch (error) {
      console.error('Error getting user orders:', error);
      throw error;
    }
  }

  // Get all orders (admin only)
  async getAllOrders() {
    try {
      console.log('OrderService: Getting all orders via adminAPI...');
      const response = await adminAPI.getAllOrders();
      console.log('OrderService: Admin orders response:', response);
      
      // Handle different response structures
      if (response.data?.success && response.data?.data) {
        console.log('OrderService: Found data.data structure');
        return response.data.data.orders || [];
      } else if (response.data && Array.isArray(response.data)) {
        console.log('OrderService: Found direct array structure');
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('OrderService: Found data array structure');
        return response.data.data;
      } else {
        console.log('OrderService: Unknown response structure, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Error getting all orders:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Return empty array instead of throwing to prevent dashboard crash
      return [];
    }
  }

  // Get a single order by ID
  async getOrder(orderId) {
    try {
      const response = await ordersAPI.getById(orderId);
      return response.data;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  }

  // Update order status (admin only)
  async updateOrderStatus(orderId, status) {
    try {
      console.log('OrderService: Updating order status via adminAPI...', { orderId, status });
      const response = await adminAPI.updateOrder(orderId, { status });
      console.log('OrderService: Order status update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Cancel an order (user)
  async cancelOrder(orderId) {
    try {
      console.log('OrderService: Cancelling order...', orderId);
      const response = await ordersAPI.cancel(orderId);
      console.log('OrderService: Order cancellation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Delete order (admin only)
  async deleteOrder(orderId) {
    try {
      console.log('OrderService: Deleting order via adminAPI...', orderId);
      const response = await api.delete(`/admin/orders/${orderId}`);
      console.log('OrderService: Order delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Calculate total price based on user role and pricing structure
  calculateItemPrice(product, userRole = 'standard') {
    // Admin always sees regular price
    if (userRole === 'admin') {
      return product.prices?.registered || product.price;
    }
    
    // For primary customers: use primary price if set, otherwise regular price
    if (userRole === 'primary') {
      return (product.prices && product.prices.primary) ? product.prices.primary : (product.prices?.registered || product.price);
    }
    
    // For secondary customers: use secondary price if set, otherwise regular price
    if (userRole === 'secondary') {
      return (product.prices && product.prices.secondary) ? product.prices.secondary : (product.prices?.registered || product.price);
    }
    
    // For standard/registered customers: always regular price
    return product.prices?.registered || product.price;
  }

  // Calculate order total with role-based pricing
  calculateOrderTotal(items, userRole = 'standard') {
    return items.reduce((total, item) => {
      const price = this.calculateItemPrice(item.product, userRole);
      return total + (price * item.quantity);
    }, 0);
  }

  // Generate order number
  generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }
}

export default new OrderService();
