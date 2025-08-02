// Simple localStorage-based authentication service
class LocalAuthService {
  constructor() {
    this.initializeUsers();
  }

  // Initialize with demo users including admin
  initializeUsers() {
    const existingUsers = JSON.parse(localStorage.getItem('jaibhavani_users') || '[]');
    
    if (existingUsers.length === 0) {
      const defaultUsers = [
        {
          id: 'admin-001',
          name: 'Admin User',
          email: 'admin@jaibhavani.com',
          password: 'admin123', // In real app, this would be hashed
          role: 'admin',
          isAdmin: true,
          phone: '+91 9999999999',
          address: 'Admin Office, New Delhi',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-001',
          name: 'John Doe',
          email: 'user@example.com',
          password: 'user123',
          role: 'customer',
          isAdmin: false,
          phone: '+91 9876543210',
          address: '123 Main Street, Delhi',
          createdAt: new Date().toISOString()
        }
      ];

      localStorage.setItem('jaibhavani_users', JSON.stringify(defaultUsers));
    }
  }

  // Login user
  async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('jaibhavani_users') || '[]');
        const user = users.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
          // Create session
          const token = 'demo-token-' + Date.now();
          const userData = { ...user };
          delete userData.password; // Remove password from user data

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));

          resolve({
            data: {
              user: userData,
              token: token
            }
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500); // Simulate API delay
    });
  }

  // Register user
  async register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('jaibhavani_users') || '[]');
        
        // Check if user already exists
        const existingUser = users.find(u => 
          u.email.toLowerCase() === userData.email.toLowerCase()
        );

        if (existingUser) {
          reject(new Error('User with this email already exists'));
          return;
        }

        // Create new user
        const newUser = {
          id: 'user-' + Date.now(),
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: 'registered', // Default role - admin needs to assign pricing tier
          isAdmin: false,
          phone: userData.phone || '',
          address: userData.address || '',
          businessName: userData.businessName || '',
          city: userData.city || '',
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('jaibhavani_users', JSON.stringify(users));

        // Auto login after registration
        const token = 'demo-token-' + Date.now();
        const userResponse = { ...newUser };
        delete userResponse.password;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userResponse));

        resolve({
          data: {
            user: userResponse,
            token: token
          }
        });
      }, 500);
    });
  }

  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
        return null;
      }
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Update user profile
  async updateProfile(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('jaibhavani_users') || '[]');
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
          reject(new Error('User not authenticated'));
          return;
        }

        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }

        // Update user data
        users[userIndex] = {
          ...users[userIndex],
          ...userData,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem('jaibhavani_users', JSON.stringify(users));

        // Update current session
        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;
        localStorage.setItem('user', JSON.stringify(updatedUser));

        resolve({
          data: {
            user: updatedUser
          }
        });
      }, 500);
    });
  }

  // Get all users (admin only)
  async getAllUsers() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('jaibhavani_users') || '[]');
        const usersWithoutPasswords = users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });

        resolve({
          data: usersWithoutPasswords
        });
      }, 300);
    });
  }

  // Update user role (admin only)
  async updateUserRole(userId, newRole) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('jaibhavani_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }

        users[userIndex].role = newRole;
        localStorage.setItem('jaibhavani_users', JSON.stringify(users));

        const { password, ...userWithoutPassword } = users[userIndex];
        resolve({
          data: userWithoutPassword
        });
      }, 300);
    });
  }

  // Get all customers (for admin dashboard)
  async getAllCustomers() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('jaibhavani_users') || '[]');
        const customers = users
          .filter(user => !user.isAdmin && user.role !== 'admin')
          .map(user => {
            const { password, ...userWithoutPassword } = user;
            return {
              ...userWithoutPassword,
              _id: userWithoutPassword._id || userWithoutPassword.id, // Ensure _id field
            };
          });

        resolve({
          data: customers
        });
      }, 300);
    });
  }
}

// Create singleton instance
const localAuthService = new LocalAuthService();

export default localAuthService;
