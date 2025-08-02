// Database-backed user management service
import { adminAPI } from './api';

class UserService {
  // Get all customers (admin only)
  async getAllCustomers() {
    try {
      console.log('UserService: Fetching all customers from database...');
      const response = await adminAPI.getAllUsers();
      
      console.log('UserService: Raw API response:', response);
      const users = response.data.data.users || response.data.users || [];
      console.log('UserService: Extracted users:', users);
      
      // Filter out admin users to get only customers
      const customers = users.filter(user => user.role !== 'admin');
      console.log('UserService: Filtered customers:', customers);
      
      return {
        data: customers
      };
    } catch (error) {
      console.error('UserService: Error fetching customers:', error);
      throw error;
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId, newRole) {
    try {
      console.log('UserService: Updating user role...', { userId, newRole });
      const response = await adminAPI.updateUserRole(userId, newRole);
      console.log('UserService: Role update response:', response);
      
      return response.data;
    } catch (error) {
      console.error('UserService: Error updating user role:', error);
      throw error;
    }
  }

  // Get user by ID (admin only)
  async getUserById(userId) {
    try {
      // Since there's no specific getUserById endpoint, we'll get all users and filter
      const allUsersResponse = await this.getAllUsers();
      const users = allUsersResponse.data.users || [];
      const user = users.find(u => u._id === userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        data: user
      };
    } catch (error) {
      console.error('UserService: Error fetching user by ID:', error);
      throw error;
    }
  }

  // Get all users (admin only) - includes admins
  async getAllUsers(params = {}) {
    try {
      console.log('UserService: Fetching all users from database...', params);
      const response = await adminAPI.getAllUsers(params);
      
      console.log('UserService: All users API response:', response);
      return response.data;
    } catch (error) {
      console.error('UserService: Error fetching all users:', error);
      throw error;
    }
  }

  // Search users by name or email
  async searchUsers(searchTerm, params = {}) {
    try {
      const searchParams = {
        ...params,
        search: searchTerm
      };
      
      return await this.getAllUsers(searchParams);
    } catch (error) {
      console.error('UserService: Error searching users:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role, params = {}) {
    try {
      const roleParams = {
        ...params,
        role: role
      };
      
      return await this.getAllUsers(roleParams);
    } catch (error) {
      console.error('UserService: Error fetching users by role:', error);
      throw error;
    }
  }
}

// Create singleton instance
const userService = new UserService();
export default userService;
