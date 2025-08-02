// Admin Authentication Service
class AdminAuthService {
  constructor() {
    // List of admin email addresses
    this.adminEmails = [
      'admin@jaibhavani.com',
      'owner@jaibhavani.com',
      'manager@jaibhavani.com'
    ];
  }

  // Check if user is admin
  isAdmin(user) {
    if (!user) {
      return false;
    }
    
    if (!user.email) {
      console.log('AdminAuthService: User has no email:', user);
      return false;
    }

    const userEmail = user.email.toLowerCase();
    const isAdminEmail = this.adminEmails.includes(userEmail);
    const isAdminRole = user.role === 'admin';
    
    // User is admin if they have admin role OR their email is in admin list
    const result = isAdminRole || isAdminEmail;
    
    return result;
  }

  // Check if current logged-in user is admin
  isCurrentUserAdmin() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return false;
      
      const user = JSON.parse(userData);
      return this.isAdmin(user);
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Add new admin email
  addAdmin(email) {
    const normalizedEmail = email.toLowerCase();
    if (!this.adminEmails.includes(normalizedEmail)) {
      this.adminEmails.push(normalizedEmail);
      this.saveAdminList();
    }
  }

  // Remove admin email
  removeAdmin(email) {
    const normalizedEmail = email.toLowerCase();
    const index = this.adminEmails.indexOf(normalizedEmail);
    if (index > -1) {
      this.adminEmails.splice(index, 1);
      this.saveAdminList();
    }
  }

  // Save admin list to localStorage
  saveAdminList() {
    localStorage.setItem('jaibhavani_admin_emails', JSON.stringify(this.adminEmails));
  }

  // Load admin list from localStorage
  loadAdminList() {
    try {
      const savedList = localStorage.getItem('jaibhavani_admin_emails');
      if (savedList) {
        this.adminEmails = JSON.parse(savedList);
      }
    } catch (error) {
      console.error('Error loading admin list:', error);
    }
  }

  // Get all admin emails
  getAdminEmails() {
    return [...this.adminEmails];
  }

  // Initialize admin account (for demo purposes)
  initializeDefaultAdmin() {
    // Create a default admin account in localStorage if it doesn't exist
    const existingUsers = JSON.parse(localStorage.getItem('jaibhavani_users') || '[]');
    
    const adminExists = existingUsers.some(user => 
      user.email === 'admin@jaibhavani.com'
    );

    if (!adminExists) {
      const adminUser = {
        id: 'admin-001',
        name: 'Admin User',
        email: 'admin@jaibhavani.com',
        password: 'admin123', // In real app, this would be hashed
        role: 'admin',
        isAdmin: true,
        createdAt: new Date().toISOString()
      };

      existingUsers.push(adminUser);
      localStorage.setItem('jaibhavani_users', JSON.stringify(existingUsers));
    }
  }

  // Check admin permissions for specific actions
  canManageProducts() {
    return this.isCurrentUserAdmin();
  }

  canManageOrders() {
    return this.isCurrentUserAdmin();
  }

  canManageUsers() {
    return this.isCurrentUserAdmin();
  }

  canViewAnalytics() {
    return this.isCurrentUserAdmin();
  }
}

// Create singleton instance
const adminAuthService = new AdminAuthService();

// Initialize default admin on first load
adminAuthService.loadAdminList();
adminAuthService.initializeDefaultAdmin();

export default adminAuthService;
