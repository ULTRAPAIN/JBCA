import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import localAuthService from '../../services/localAuthService';
import productService from '../../services/productService';
import CustomerManagement from '../../components/admin/CustomerManagement';
import NotificationManagement from './NotificationManagement';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  CogIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  BellIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  PlusIcon,
  XMarkIcon,
  StarIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Orders');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // Order management states
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const [successMessage, setSuccessMessage] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState(new Set());
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [editOrderData, setEditOrderData] = useState({
    estimatedDelivery: '',
    notes: '',
    trackingNumber: ''
  });

  // Product management states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'Bags',
    category: 'Cement',
    stock: '',
    weight: '',
    size: '', // Added size field for products like bricks
    images: [],
    imageMethod: 'upload', // 'upload' or 'url'
    imageUrl: ''
  });

  // Pricing management states
  const [pricingData, setPricingData] = useState([]);

  // Load real data from order service
  useEffect(() => {
    loadRealData();
  }, []);

  // Update pricing data when products change
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('AdminDashboard: Setting up pricing data from products:', products);
      setPricingData(
        products.map(product => {
          console.log('AdminDashboard: Product pricing data:', {
            name: product.name,
            price: product.price,
            prices: product.prices
          });
          return {
            ...product,
            // Always use product.price as the regular price (standard price from database)
            prices: {
              regular: product.price || 0, // Main product price is always the regular price
              secondary: product.prices?.secondary || 0,
              primary: product.prices?.primary || 0
            }
          };
        })
      );
    }
  }, [products]);

  // Handle tab parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      // Refresh data when switching to orders tab
      if (tabParam === 'orders') {
        console.log('AdminDashboard: Switching to orders tab, refreshing data...');
        loadRealData();
      }
    }
  }, [location.search]);

  // Add window focus listener to refresh data when user comes back
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'orders') {
        console.log('AdminDashboard: Window focused, refreshing orders...');
        loadRealData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab]);

  // Reload products function
  const reloadProducts = async () => {
    try {
      console.log('AdminDashboard: Reloading products...');
      const productsResponse = await productService.getAllProductsForAdmin();
      setProducts(productsResponse);
      console.log('AdminDashboard: Products reloaded successfully, count:', productsResponse?.length);
    } catch (error) {
      console.error('AdminDashboard: Error reloading products:', error);
    }
  };

  const loadRealData = async () => {
    try {
      // Debug authentication state
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('AdminDashboard: Auth debug - Token exists:', !!token);
      console.log('AdminDashboard: Auth debug - User exists:', !!user);
      if (user) {
        try {
          const userData = JSON.parse(user);
          console.log('AdminDashboard: Auth debug - User role:', userData.role);
          console.log('AdminDashboard: Auth debug - User email:', userData.email);
        } catch (e) {
          console.error('AdminDashboard: Auth debug - Failed to parse user data:', e);
        }
      }
      
      // Get real orders from the order service (now async)
      console.log('AdminDashboard: Loading real orders data...');
      
      // First, let's test a simple API call to see if authentication is working
      try {
        console.log('AdminDashboard: Testing admin API access...');
        const testResponse = await fetch('http://localhost:5000/api/admin/orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('AdminDashboard: Test API response status:', testResponse.status);
        const testText = await testResponse.text();
        console.log('AdminDashboard: Test API response text:', testText);
      } catch (testError) {
        console.error('AdminDashboard: Test API call failed:', testError);
      }
      
      const response = await adminAPI.getAllOrders();
      console.log('AdminDashboard: Admin API orders response:', response.data);
      
      // Extract orders from the response structure: { success: true, data: { orders: [...], pagination: {...}, stats: {...} } }
      const ordersArray = response.data?.data?.orders || [];
      console.log('AdminDashboard: Extracted orders array:', ordersArray);
      console.log('AdminDashboard: Orders array length:', ordersArray.length);
      
      // Debug estimated delivery dates
      ordersArray.forEach((order, index) => {
        if (order.estimatedDelivery) {
          console.log(`AdminDashboard: Order ${index} (${order._id}) has estimatedDelivery:`, order.estimatedDelivery);
        }
      });
      
      // Calculate stats from orders
      const stats = {
        totalOrders: ordersArray.length,
        totalCustomers: new Set(ordersArray.map(order => order.user?.email || order.customerEmail)).size,
        totalRevenue: ordersArray.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0),
        pendingOrders: ordersArray.filter(order => order.status?.toLowerCase() === 'processing').length
      };
      
      setOrders(ordersArray);
      setStats(stats);
      
      // Load all registered customers (not just those with orders)
      try {
        const customersResponse = await localAuthService.getAllCustomers();
        const allCustomers = customersResponse.data;
        
        // Enhance customer data with order information
        const enhancedCustomers = allCustomers.map(customer => {
          const customerOrders = ordersArray.filter(order => 
            order.user?.email === customer.email || order.customerEmail === customer.email
          );
          const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
          
          return {
            ...customer,
            totalOrders: customerOrders.length,
            totalSpent: totalSpent,
            joinDate: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A',
            lastOrder: customerOrders.length > 0 ? customerOrders[customerOrders.length - 1].orderDate : 'No orders'
          };
        });
        
        setCustomers(enhancedCustomers);
      } catch (error) {
        console.error('Error loading customers:', error);
        // Fallback: Extract unique customers from orders (old method)
        const uniqueCustomers = [];
        const customerMap = new Map();
        
        ordersArray.forEach(order => {
          const customerEmail = order.user?.email || order.customerEmail;
          const customerName = order.user?.name || order.customerName;
          const customerPhone = order.user?.phone || order.customerPhone;
          
          if (!customerMap.has(customerEmail)) {
            customerMap.set(customerEmail, {
              id: customerMap.size + 1,
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              role: 'customer', // Default for existing orders
              totalOrders: 1,
              totalSpent: order.totalAmount || order.total || 0,
              joinDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.orderDate || 'N/A')
            });
          } else {
            const customer = customerMap.get(customerEmail);
            customer.totalOrders += 1;
            customer.totalSpent += (order.totalAmount || order.total || 0);
          }
        });
        
        setCustomers(Array.from(customerMap.values()));
      }
      
      // Load products from product service
      try {
        console.log('AdminDashboard: Loading products from API...');
        const productsResponse = await productService.getAllProductsForAdmin();
        console.log('AdminDashboard: Products response:', productsResponse);
        setProducts(productsResponse);
        console.log('AdminDashboard: Products set successfully, count:', productsResponse?.length);
      } catch (error) {
        console.error('AdminDashboard: Error loading products:', error);
        console.log('AdminDashboard: Trying fallback with regular getAllProducts...');
        try {
          const fallbackResponse = await productService.getAllProducts();
          console.log('AdminDashboard: Fallback products response:', fallbackResponse);
          setProducts(fallbackResponse);
        } catch (fallbackError) {
          console.error('AdminDashboard: Fallback also failed:', fallbackError);
          console.log('AdminDashboard: Using demo products as final fallback');
          // Fallback to demo products
          const demoProducts = [
            { id: 'prod-001', name: 'Premium Cement', price: 450, unit: 'per bag', category: 'Cement', stock: 500, description: 'High-quality cement for construction' },
            { id: 'prod-002', name: 'Steel Rods', price: 65, unit: 'per piece', category: 'Other', stock: 1000, description: 'Durable steel rods for reinforcement' },
            { id: 'prod-003', name: 'Construction Sand', price: 800, unit: 'per ton', category: 'Sand & Aggregates', stock: 50, description: 'Fine quality sand for construction' },
            { id: 'prod-004', name: 'Bricks', price: 8, unit: 'per piece', category: 'Bricks & Blocks', stock: 10000, description: 'Red clay bricks for building' },
            { id: 'prod-005', name: 'Stone Aggregate', price: 1200, unit: 'per bag', category: 'Stone Aggregates', stock: 200, description: 'Ready-to-use stone aggregate mix' }
          ];
          setProducts(demoProducts);
        }
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback empty data
      setOrders([]);
      setCustomers([]);
      setProducts([]);
      setStats({
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        pendingOrders: 0
      });
    }
  };

  // Pricing management functions
  const updateProductPricing = async (productId, priceType, newPrice) => {
    try {
      const updatedPricing = pricingData.map(product => 
        (product._id || product.id) === productId 
          ? {
              ...product,
              prices: {
                ...product.prices,
                [priceType]: parseFloat(newPrice) || 0
              }
            }
          : product
      );
      setPricingData(updatedPricing);

      // Update backend with complete product data from database
      const productToUpdate = updatedPricing.find(p => (p._id || p.id) === productId);
      
      // Prepare update data with all existing fields from database
      const updateData = {
        name: productToUpdate.name,
        description: productToUpdate.description,
        category: productToUpdate.category,
        unit: productToUpdate.unit,
        price: productToUpdate.price || productToUpdate.prices?.regular || 0,
        stock: productToUpdate.stock,
        prices: productToUpdate.prices
      };

      // Only add weight if it exists in the database - don't assume values
      if (productToUpdate.weight !== undefined && productToUpdate.weight !== null) {
        updateData.weight = productToUpdate.weight;
      }

      await productService.updateProduct(productId, updateData);

    } catch (error) {
      console.error('Error updating product pricing:', error);
      alert('Failed to update pricing: ' + error.message);
    }
  };

  const calculateDiscount = (regularPrice, discountedPrice) => {
    if (!regularPrice || !discountedPrice) return 0;
    return ((regularPrice - discountedPrice) / regularPrice * 100).toFixed(1);
  };

  const updateCustomerRole = async (customerId, newRole) => {
    try {
      await localAuthService.updateUserRole(customerId, newRole);
      
      // Update local state
      setCustomers(customers.map(customer => 
        customer.id === customerId ? { ...customer, role: newRole } : customer
      ));
      
      alert(`Customer role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating customer role:', error);
      alert('Failed to update customer role');
    }
  };

  // Product management functions
  const handleAddProduct = async () => {
    try {
      // Enhanced validation
      if (!newProduct.name?.trim()) {
        alert('Product name is required');
        return;
      }
      if (!newProduct.description?.trim()) {
        alert('Product description is required');
        return;
      }
      if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
        alert('Please enter a valid price greater than 0');
        return;
      }
      if (!newProduct.stock || parseInt(newProduct.stock) < 0) {
        alert('Please enter a valid stock quantity (0 or greater)');
        return;
      }
      if (!newProduct.category) {
        alert('Please select a category');
        return;
      }
      if (!newProduct.unit) {
        alert('Please select a unit');
        return;
      }
      // Size validation - check if size is required for bricks and blocks
      if (newProduct.category === 'Bricks & Blocks' && !newProduct.size?.trim()) {
        alert('Size/dimensions are required for Bricks & Blocks products');
        return;
      }

      // Convert images array to single image for productService compatibility
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        weight: newProduct.weight ? parseFloat(newProduct.weight) : undefined,
        size: newProduct.size?.trim() || undefined, // Include size field
        image: newProduct.images && newProduct.images.length > 0 ? newProduct.images[0] : null
      };
      // Remove images array to avoid confusion
      delete productData.images;

      console.log('AdminDashboard: Adding product with data:', productData);
      const response = await productService.addProduct(productData);
      console.log('AdminDashboard: Product added successfully:', response);
      
      // Reload products from server instead of manually updating state
      await reloadProducts();
      
      setShowAddProductModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        unit: 'Bags',
        category: 'Cement',
        stock: '',
        weight: '',
        size: '', // Added size field to reset
        images: [],
        imageMethod: 'upload',
        imageUrl: ''
      });
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      
      // Show more specific error messages
      let errorMessage = 'Failed to add product';
      if (error.response?.data?.errors) {
        errorMessage += ':\n' + error.response.data.errors.join('\n');
      } else if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleEditProduct = (product) => {
    // Ensure all form fields have default values to prevent controlled/uncontrolled input issues
    setEditingProduct({
      ...product,
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category || 'Cement',
      unit: product.unit || 'Bags',
      weight: product.weight || '',
      size: product.size || '',
      availability: product.availability !== undefined ? product.availability : true,
      images: product.image ? [product.image] : [],
      image: product.image || '',
      imageMethod: product.image ? 'url' : 'upload',
      imageUrl: product.image || '',
      prices: product.prices || {
        primary: '',
        secondary: ''
      }
    });
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = async () => {
    try {
      // Extract the actual product data from the editing product structure
      const productToUpdate = editingProduct.product || editingProduct;
      
      if (!editingProduct.name || !editingProduct.price) {
        alert('Please fill in all required fields (Name and Price)');
        return;
      }

      // Category-specific validation
      if (editingProduct.category === 'Bricks & Blocks' && !editingProduct.size) {
        alert('Size is required for Bricks & Blocks products');
        return;
      }

      // Prepare product data using the form values (editingProduct top-level properties)
      const productData = {
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        unit: editingProduct.unit,
        price: parseFloat(editingProduct.price),
        stock: editingProduct.stock ? parseInt(editingProduct.stock) : 0,
        availability: editingProduct.availability !== undefined ? editingProduct.availability : true,
        weight: editingProduct.weight ? parseFloat(editingProduct.weight) : undefined,
        size: editingProduct.size || undefined
      };

      // Handle image - priority: new upload > URL input > existing image
      if (editingProduct.imageMethod === 'upload' && editingProduct.images && editingProduct.images.length > 0) {
        productData.image = editingProduct.images[0];
      } else if (editingProduct.imageMethod === 'url' && editingProduct.imageUrl) {
        productData.image = editingProduct.imageUrl;
      } else if (editingProduct.image) {
        productData.image = editingProduct.image;
      }

      // Handle pricing if it exists
      if (editingProduct.prices) {
        productData.prices = {
          standard: parseFloat(editingProduct.price),
          primary: editingProduct.prices.primary ? parseFloat(editingProduct.prices.primary) : parseFloat(editingProduct.price) * 0.9,
          secondary: editingProduct.prices.secondary ? parseFloat(editingProduct.prices.secondary) : parseFloat(editingProduct.price) * 0.95
        };
      }

      console.log('AdminDashboard: Updating product with data:', productData);
      const response = await productService.updateProduct(productToUpdate._id || productToUpdate.id, productData);
      
      // Reload products to get fresh data
      await reloadProducts();
      
      setShowEditProductModal(false);
      setEditingProduct(null);
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    console.log('AdminDashboard: Deleting product with ID:', productId);
    
    // Check if this is a demo product (no real ID)
    if (!productId || productId.startsWith('temp-')) {
      // For demo products, just remove from local state
      setProducts(products.filter((_, index) => `temp-${index}` !== productId));
      alert('Demo product removed locally!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      console.log('AdminDashboard: Product deleted successfully');
      
      // Reload products from server instead of manually updating state
      await reloadProducts();
      
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('AdminDashboard: Error deleting product:', error);
      alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateProductPrice = async (productId, newPrice) => {
    try {
      // Find the product to get all its existing data
      const productToUpdate = products.find(p => (p._id || p.id) === productId);
      
      if (!productToUpdate) {
        throw new Error('Product not found');
      }

      // Prepare complete update data with all required fields from database
      const updateData = {
        name: productToUpdate.name,
        description: productToUpdate.description,
        category: productToUpdate.category,
        unit: productToUpdate.unit,
        price: newPrice,
        stock: productToUpdate.stock
      };

      // Only add weight if it exists in the database - don't assume values
      if (productToUpdate.weight !== undefined && productToUpdate.weight !== null) {
        updateData.weight = productToUpdate.weight;
      }

      // Include existing pricing tiers if they exist
      if (productToUpdate.prices) {
        updateData.prices = productToUpdate.prices;
      }

      await productService.updateProduct(productId, updateData);
      
      // Update local state
      setProducts(products.map(product => 
        (product._id || product.id) === productId ? { ...product, price: newPrice } : product
      ));
    } catch (error) {
      console.error('Error updating product price:', error);
      alert('Failed to update product price: ' + error.message);
    }
  };

  // Categories and units for dropdowns
  const categories = [
    'Cement',
    'Bricks & Blocks',
    'Sand & Aggregates', 
    'Stone Aggregates',
    'Tiles & Flooring',
    'Roofing Materials',
    'Plumbing Supplies',
    'Electrical Supplies',
    'Roof and Tiles Bonding',
    'Doors & Windows',
    'Other'
  ];

  const units = [
    'Bags',
    'Tons',
    'Pieces',
    'Square Feet',
    'Cubic Feet',
    'Meters',
    'Kilograms',
    'Liters',
    'Boxes'
  ];

  // Image handling functions
  const handleImageUpload = (files, isEditing = false) => {
    const imagePromises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      if (isEditing) {
        setEditingProduct(prev => ({
          ...prev,
          images: [...(prev.images || []), ...images]
        }));
      } else {
        setNewProduct(prev => ({
          ...prev,
          images: [...(prev.images || []), ...images]
        }));
      }
    });
  };

  const removeImage = (index, isEditing = false) => {
    if (isEditing) {
      setEditingProduct(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const addImageUrl = (url, isEditing = false) => {
    if (!url.trim()) return;
    
    if (isEditing) {
      setEditingProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), url]
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), url]
      }));
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', icon: ClockIcon },
      confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', icon: CheckCircleIcon },
      delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', icon: CheckCircleIcon },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', icon: XCircleIcon }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Order management helper functions
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
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
        return <ClockIcon className="h-5 w-5 text-gray-500 dark:text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'out for delivery':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('AdminDashboard: Updating order status', { orderId, newStatus });
      
      // Add order to updating set
      setUpdatingOrders(prev => new Set(prev).add(orderId));
      
      // Call the backend API to update the order status
      const response = await adminAPI.updateOrder(orderId, { status: newStatus });
      console.log('AdminDashboard: Status update response:', response.data);
      
      // Clear any existing errors and show success message
      setError(null);
      setSuccessMessage(`Order status updated to "${newStatus}" successfully!`);
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
      
      // Add visual feedback for the updated order
      setRecentlyUpdated(prev => new Set(prev).add(orderId));
      setTimeout(() => {
        setRecentlyUpdated(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }, 3000);
      
      // Update the order in the local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
    } catch (err) {
      console.error('Error updating order status:', err);
      
      // Show error message to user
      if (err.response?.status === 401) {
        setError('Authentication required to update order status. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required to update orders.');
      } else if (err.response?.status === 404) {
        setError('Order not found.');
      } else {
        setError(`Failed to update order status: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      // Remove order from updating set
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleEditOrder = (order) => {
    console.log('AdminDashboard: Opening edit modal for order:', order);
    console.log('AdminDashboard: Order estimated delivery:', order.estimatedDelivery);
    
    setEditingOrder(order);
    setEditOrderData({
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : '',
      notes: order.adminNotes || '',
      trackingNumber: order.trackingNumber || ''
    });
    setShowEditOrderModal(true);
    
    console.log('AdminDashboard: Edit form data set to:', {
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : '',
      notes: order.adminNotes || '',
      trackingNumber: order.trackingNumber || ''
    });
  };

  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return;

    try {
      setUpdatingOrders(prev => new Set(prev).add(editingOrder._id));
      setError(null);

      const updateData = {
        estimatedDelivery: editOrderData.estimatedDelivery ? new Date(editOrderData.estimatedDelivery).toISOString() : null,
        adminNotes: editOrderData.notes,
        trackingNumber: editOrderData.trackingNumber
      };

      console.log('AdminDashboard: Updating order details:', updateData);
      console.log('AdminDashboard: Original editOrderData:', editOrderData);
      console.log('AdminDashboard: Order ID:', editingOrder._id);
      
      const response = await adminAPI.updateOrder(editingOrder._id, updateData);
      console.log('AdminDashboard: Order update response:', response.data);
      
      // Verify the response contains the updated data
      if (response.data?.data?.order) {
        console.log('AdminDashboard: Updated order from response:', response.data.data.order);
        console.log('AdminDashboard: Updated estimatedDelivery:', response.data.data.order.estimatedDelivery);
      }

      // Close modal first
      setShowEditOrderModal(false);
      setEditingOrder(null);

      // Force multiple refresh strategies
      console.log('AdminDashboard: Starting aggressive refresh sequence...');
      
      // Strategy 1: Immediate local state update with server data
      const updatedOrder = response.data?.data?.order || {
        ...editingOrder,
        estimatedDelivery: updateData.estimatedDelivery,
        adminNotes: updateData.adminNotes,
        trackingNumber: updateData.trackingNumber
      };

      setOrders(prevOrders => {
        const newOrders = prevOrders.map(order => 
          order._id === editingOrder._id ? updatedOrder : order
        );
        console.log('AdminDashboard: Updated orders array:', newOrders);
        return newOrders;
      });

      // Cross-component notification
      localStorage.setItem('orderUpdated', editingOrder._id);
      localStorage.setItem('orderRefreshTime', Date.now().toString());
      
      // Refresh data to ensure consistency
      setTimeout(async () => {
        console.log('AdminDashboard: Refreshing data...');
        await loadRealData();
        localStorage.removeItem('orderUpdated');
        localStorage.removeItem('orderRefreshTime');
      }, 1000);

      // Visual feedback
      setSuccessMessage('Order details updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);

      setRecentlyUpdated(prev => new Set(prev).add(editingOrder._id));
      setTimeout(() => {
        setRecentlyUpdated(prev => {
          const newSet = new Set(prev);
          newSet.delete(editingOrder._id);
          return newSet;
        });
      }, 5000);

    } catch (err) {
      console.error('AdminDashboard: Error updating order details:', err);
      setError(`Failed to update order details: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingOrder._id);
        return newSet;
      });
    }
  };

  const handleCancelOrderEdit = () => {
    setShowEditOrderModal(false);
    setEditingOrder(null);
    setEditOrderData({
      estimatedDelivery: '',
      notes: '',
      trackingNumber: ''
    });
  };

  const renderDashboard = () => (
    <div className="space-y-4 mobile-md:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mobile-md:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-slate-800 p-3 mobile-md:p-4 lg:p-6 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-yellow-200 dark:border-slate-600 transition-colors duration-300">
          <div className="flex flex-col mobile-lg:flex-row mobile-lg:items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-lg shadow mb-2 mobile-lg:mb-0 mobile-lg:mr-3 self-start">
              <ShoppingBagIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">Total Orders</p>
              <p className="text-lg mobile-md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-3 mobile-md:p-4 lg:p-6 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-yellow-200 dark:border-slate-600 transition-colors duration-300">
          <div className="flex flex-col mobile-lg:flex-row mobile-lg:items-center">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-lg shadow mb-2 mobile-lg:mb-0 mobile-lg:mr-3 self-start">
              <UsersIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">Total Customers</p>
              <p className="text-lg mobile-md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-3 mobile-md:p-4 lg:p-6 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-yellow-200 dark:border-slate-600 transition-colors duration-300">
          <div className="flex flex-col mobile-lg:flex-row mobile-lg:items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-amber-400 dark:to-orange-500 rounded-lg shadow mb-2 mobile-lg:mb-0 mobile-lg:mr-3 self-start">
              <CurrencyRupeeIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">Total Revenue</p>
              <p className="text-lg mobile-md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-slate-100">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-3 mobile-md:p-4 lg:p-6 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-yellow-200 dark:border-slate-600 transition-colors duration-300">
          <div className="flex flex-col mobile-lg:flex-row mobile-lg:items-center">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-amber-500 dark:to-orange-600 rounded-lg shadow mb-2 mobile-lg:mb-0 mobile-lg:mr-3 self-start">
              <ClockIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs mobile-md:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">Pending Orders</p>
              <p className="text-lg mobile-md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-yellow-200 dark:border-slate-600 transition-colors duration-300">
        <div className="px-3 mobile-md:px-4 lg:px-6 py-3 mobile-md:py-4 border-b border-yellow-200 dark:border-slate-600 bg-gradient-to-r from-yellow-50 to-red-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <h3 className="text-base mobile-md:text-lg font-medium text-gray-900 dark:text-slate-100">Recent Orders</h3>
        </div>
        <div className="p-3 mobile-md:p-4 lg:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                {orders.slice(0, 5).map((order) => (
                  <tr 
                    key={order._id || order.id} 
                    onClick={() => navigate(`/admin/orders/${order._id || order.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-200"
                  >
                    <td className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-4 whitespace-nowrap text-xs mobile-md:text-sm font-medium text-gray-900 dark:text-slate-100">
                      #{order.orderNumber || order._id?.slice(-6) || order.id}
                    </td>
                    <td className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-4 whitespace-nowrap text-xs mobile-md:text-sm text-gray-900 dark:text-slate-100">
                      {order.user?.name || order.customerName || 'N/A'}
                    </td>
                    <td className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-4 whitespace-nowrap text-xs mobile-md:text-sm text-gray-900 dark:text-slate-100">
                      ₹{(order.totalAmount || order.total || 0).toLocaleString()}
                    </td>
                    <td className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-3 mobile-md:px-4 lg:px-6 py-2 mobile-md:py-4 whitespace-nowrap text-xs mobile-md:text-sm text-gray-500 dark:text-slate-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order.orderDate || 'N/A')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => {
    const filteredOrders = statusFilter 
      ? orders.filter(order => order.status?.toLowerCase() === statusFilter.toLowerCase())
      : orders;

    return (
    <div className="space-y-4 mobile-md:space-y-6">
      {/* Header */}
      <div className="mb-4 mobile-md:mb-6 lg:mb-8">
        <h1 className="text-xl mobile-md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1 mobile-md:mb-2">Order Management</h1>
        <p className="text-sm mobile-md:text-base text-gray-600 dark:text-slate-400">Manage and track all customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/20 mb-4 mobile-md:mb-6 p-3 mobile-md:p-4 lg:p-6 border border-gray-100 dark:border-slate-600 transition-colors duration-300">
        <div className="flex flex-col mobile-md:flex-row mobile-md:items-end gap-3 mobile-md:gap-4 lg:justify-between">
          <div className="flex-1">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full mobile-md:w-auto border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 dark:bg-slate-700 dark:text-slate-100"
            >
              <option value="">All Orders</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3 mobile-md:p-4 mb-4 mobile-md:mb-6">
          <p className="text-sm mobile-md:text-base text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md p-3 mobile-md:p-4 mb-4 mobile-md:mb-6">
          <p className="text-sm mobile-md:text-base text-green-800 dark:text-green-300">{successMessage}</p>
        </div>
      )}

      {/* Stats Summary */}
      {orders.length > 0 && (
        <div className="mb-4 mobile-md:mb-6 lg:mb-8 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/20 p-3 mobile-md:p-4 lg:p-6 border border-gray-100 dark:border-slate-600 transition-colors duration-300">
          <h3 className="text-base mobile-md:text-lg font-medium text-gray-900 dark:text-slate-100 mb-3 mobile-md:mb-4">Order Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mobile-md:gap-4">
            <div className="text-center">
              <p className="text-xl mobile-md:text-2xl font-bold text-blue-600 dark:text-blue-400">{orders.length}</p>
              <p className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-400">Total Orders</p>
            </div>
            <div className="text-center">
              <p className="text-xl mobile-md:text-2xl font-bold text-green-600 dark:text-green-400">
                {orders.filter(o => o.status?.toLowerCase() === 'delivered').length}
              </p>
              <p className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-400">Delivered</p>
            </div>
            <div className="text-center">
              <p className="text-xl mobile-md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {orders.filter(o => o.status?.toLowerCase() === 'processing').length}
              </p>
              <p className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-400">Processing</p>
            </div>
            <div className="text-center">
              <p className="text-xl mobile-md:text-2xl font-bold text-purple-600 dark:text-amber-400">
                {formatCurrency(orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0))}
              </p>
              <p className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-400">Total Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 mobile-md:py-12 lg:py-16 bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900/20 border border-gray-100 dark:border-slate-600 transition-colors duration-300">
          <ShoppingBagIcon className="mx-auto h-16 w-16 mobile-md:h-20 mobile-md:w-20 lg:h-24 lg:w-24 text-gray-400 dark:text-slate-500 mb-4 mobile-md:mb-6" />
          <h2 className="text-lg mobile-md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2 mobile-md:mb-4">
            No Orders Found
          </h2>
          <p className="text-sm mobile-md:text-base text-gray-600 dark:text-slate-400">
            {statusFilter ? `No orders with status "${statusFilter}" found.` : 'No orders have been placed yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow dark:shadow-slate-900/20 overflow-hidden sm:rounded-lg border border-gray-100 dark:border-slate-600 transition-colors duration-300">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="divide-y divide-gray-200 dark:divide-slate-600">
              {filteredOrders.map((order) => (
                <div 
                  key={`${order._id}-${order.estimatedDelivery || 'no-date'}`} 
                  className={`p-3 mobile-md:p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 ${
                    recentlyUpdated.has(order._id) ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          #{order.orderNumber || order._id?.slice(-6)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${getStatusColor(order.status)} ${
                      recentlyUpdated.has(order._id) ? 'ring-2 ring-green-400 shadow-lg' : ''
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Customer:</span>
                      <div className="font-medium text-gray-900 dark:text-slate-100">{order.user?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Amount:</span>
                      <div className="font-bold text-gray-900 dark:text-slate-100">{formatCurrency(order.totalAmount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Date:</span>
                      <div className="text-gray-900 dark:text-slate-100">{formatDate(order.createdAt)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Est. Delivery:</span>
                      <div className={`${recentlyUpdated.has(order._id) ? 'text-green-600 font-semibold animate-pulse' : 'text-gray-900 dark:text-slate-100'}`}>
                        {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : 'Not set'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={updatingOrders.has(order._id)}
                      className={`w-full px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 ${
                        updatingOrders.has(order._id) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600"
                      >
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 dark:border-slate-600 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600"
                      >
                        <PencilIcon className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/6">
                    ORDER ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/4">
                    CUSTOMER
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/8">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/6">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/6">
                    DATE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/4">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                {filteredOrders.map((order) => (
                  <tr 
                    key={`${order._id}-${order.estimatedDelivery || 'no-date'}`} 
                    className={`hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 ${
                      recentlyUpdated.has(order._id) ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400' : ''
                    }`}
                    data-order-id={order._id}
                    data-estimated-delivery={order.estimatedDelivery || ''}
                  >
                    {/* Order ID */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            #{order.orderNumber || order._id?.slice(-6)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                        {order.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400 truncate">
                        {order.user?.email || 'N/A'}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-slate-100">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${getStatusColor(order.status)} ${
                        recentlyUpdated.has(order._id) ? 'ring-2 ring-green-400 shadow-lg' : ''
                      }`}>
                        {order.status}
                      </span>
                      {updatingOrders.has(order._id) && (
                        <div className="text-xs text-blue-600 mt-1">Updating...</div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      <div className="text-sm text-gray-900 dark:text-slate-100">
                        {formatDate(order.createdAt)}
                      </div>
                      {order.estimatedDelivery && (
                        <div className={`text-xs ${recentlyUpdated.has(order._id) ? 'text-green-600 font-semibold animate-pulse' : 'text-gray-500 dark:text-slate-400'}`}>
                          Est: {formatDate(order.estimatedDelivery)}
                        </div>
                      )}
                      {!order.estimatedDelivery && (
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          No delivery date set
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-sm font-medium">
                      <div className="space-y-2">
                        {/* Status Update Dropdown */}
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updatingOrders.has(order._id)}
                          className={`w-full px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400 ${
                            updatingOrders.has(order._id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                            className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 dark:border-slate-600 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-amber-400"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="flex-1 inline-flex items-center justify-center px-2 py-1 border border-gray-300 dark:border-slate-600 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-amber-400"
                          >
                            <PencilIcon className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expandable Order Details */}
          <div className="border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 p-3 mobile-md:p-4">
            <div className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-400">
              <strong>Order Management:</strong> Use the dropdown to update order status or click "View Details" to see detailed information including shipping address and order items.
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };

  const renderCustomers = () => (
    <div className="space-y-4 mobile-md:space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-yellow-200 dark:border-slate-600 transition-colors duration-300">
        <div className="px-3 mobile-md:px-4 lg:px-6 py-3 mobile-md:py-4 border-b border-yellow-200 dark:border-slate-600 bg-gradient-to-r from-yellow-50 to-red-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <h3 className="text-base mobile-md:text-lg font-medium text-gray-900 dark:text-slate-100">Customer Management</h3>
          <p className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-300 mt-1">Manage customer roles and pricing tiers</p>
        </div>
        <div className="p-3 mobile-md:p-4 lg:p-6">
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="space-y-3 mobile-md:space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mobile-md:p-4 border border-gray-200 dark:border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm mobile-md:text-base font-medium text-gray-900 dark:text-slate-100">{customer.name}</div>
                      {customer.businessName && (
                        <div className="text-xs mobile-md:text-sm text-gray-500 dark:text-slate-400">{customer.businessName}</div>
                      )}
                    </div>
                    <select 
                      value={customer.role}
                      onChange={(e) => updateCustomerRole(customer.id, e.target.value)}
                      className={`px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded text-xs font-medium ${
                        customer.role === 'primary' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        customer.role === 'secondary' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        'bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-300'
                      }`}
                    >
                      <option value="registered">Registered</option>
                      <option value="secondary">Secondary</option>
                      <option value="primary">Primary</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs mobile-md:text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Email:</span>
                      <div className="text-gray-900 dark:text-slate-100 truncate">{customer.email}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Phone:</span>
                      <div className="text-gray-900 dark:text-slate-100">{customer.phone}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Orders:</span>
                      <div className="text-gray-900 dark:text-slate-100">{customer.totalOrders}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Total Spent:</span>
                      <div className="text-gray-900 dark:text-slate-100">₹{customer.totalSpent.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      Joined: {customer.joinDate}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-xs px-2 py-1 text-yellow-600 dark:text-amber-400 hover:text-yellow-900 dark:hover:text-amber-300 border border-yellow-300 dark:border-amber-500 rounded">View</button>
                      <button className="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 border border-red-300 dark:border-red-500 rounded">Contact</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{customer.name}</div>
                      {customer.businessName && (
                        <div className="text-xs text-gray-500 dark:text-slate-400">{customer.businessName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-slate-100">{customer.email}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={customer.role}
                        onChange={(e) => updateCustomerRole(customer.id, e.target.value)}
                        className={`px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded text-xs font-medium ${
                          customer.role === 'primary' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          customer.role === 'secondary' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                          'bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-300'
                        }`}
                      >
                        <option value="registered">Registered</option>
                        <option value="secondary">Secondary</option>
                        <option value="primary">Primary</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">{customer.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">₹{customer.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{customer.joinDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-yellow-600 dark:text-amber-400 hover:text-yellow-900 dark:hover:text-amber-300 mr-3">View</button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Contact</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            
          {customers.length === 0 && (
            <div className="text-center py-6 mobile-md:py-8 text-gray-500 dark:text-slate-400">
              <p className="text-sm mobile-md:text-base">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => {
    // Extract unique categories from products for filtering
    const categories = ['All', ...new Set((products || []).map(product => product.category).filter(Boolean))];
    
    // Filter products based on selected category
    const filteredProducts = selectedCategory === 'All' 
      ? products 
      : products.filter(product => product.category === selectedCategory);

    return (
      <div className="space-y-4 mobile-md:space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-yellow-200 dark:border-slate-600 transition-colors duration-300">
          <div className="px-3 mobile-md:px-4 lg:px-6 py-3 mobile-md:py-4 border-b border-yellow-200 dark:border-slate-600 bg-gradient-to-r from-yellow-50 to-red-50 dark:from-amber-900/20 dark:to-orange-900/20 flex flex-col mobile-lg:flex-row mobile-lg:justify-between mobile-lg:items-center gap-3">
            <div>
              <h3 className="text-base mobile-md:text-lg font-medium text-gray-900 dark:text-slate-100">Product Management</h3>
            </div>
            <button 
              onClick={() => setShowAddProductModal(true)}
              className="px-3 mobile-md:px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 dark:from-amber-500 dark:to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-red-600 dark:hover:from-amber-600 dark:hover:to-orange-600 shadow dark:shadow-slate-900/30 flex items-center justify-center space-x-2 text-sm mobile-md:text-base"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Category Filter Tags */}
          {categories.length > 1 && (
            <div className="px-3 mobile-md:px-4 lg:px-6 py-3 border-b border-gray-200 dark:border-slate-600">
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs mobile-md:text-sm font-medium transition-all duration-200 border ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-yellow-500 to-red-500 dark:from-amber-500 dark:to-orange-500 text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 mobile-md:p-4 lg:p-6">
            {/* Mobile Horizontal Scroll Layout */}
            <div className="md:hidden">
              {(filteredProducts && filteredProducts.length > 0) ? (
                <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                  {filteredProducts.filter(product => product).map((product, index) => {
                    const productId = product._id || product.id || `temp-${index}`;
                    
                    return (
                      <div key={productId} className="flex-shrink-0 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/20 border border-gray-200 dark:border-slate-600 overflow-hidden">
                        {/* Product Image */}
                        <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center p-4">
                          <img
                            src={
                              product.image || 
                              (product.images && product.images.length > 0 ? product.images[0] : null) ||
                              '/placeholder-product.svg'
                            }
                            alt={product.name || 'Product'}
                            className="w-full h-full object-contain rounded-lg"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.svg';
                            }}
                          />
                        </div>
                        
                        {/* Product Content */}
                        <div className="p-4 space-y-3">
                          {/* Product Title & Description */}
                          <div className="space-y-2">
                            <h4 className="text-base font-bold text-gray-900 dark:text-slate-100 line-clamp-1">{product.name || 'Unnamed Product'}</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{product.description || 'No description available'}</p>
                          </div>
                          
                          {/* Product Info Grid */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Category</p>
                              <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{product.category || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Stock</p>
                              <p className="font-medium text-gray-900 dark:text-slate-100">{product.stock || 0}</p>
                            </div>
                            {product.unit && (
                              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 col-span-2">
                                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Unit</p>
                                <p className="font-medium text-gray-900 dark:text-slate-100">{product.unit}</p>
                              </div>
                            )}
                          </div>

                          {/* Price Section */}
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-yellow-200 dark:border-amber-700/30">
                            <label className="block text-xs font-medium text-yellow-700 dark:text-amber-300 mb-2">Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-yellow-700 dark:text-amber-300">₹</span>
                              <input
                                type="number"
                                value={product.price || 0}
                                onChange={(e) => updateProductPrice(productId, parseFloat(e.target.value))}
                                className="w-full pl-8 pr-3 py-2 border border-yellow-300 dark:border-amber-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 pt-2">
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg py-2.5 px-3 transition-all duration-200 flex items-center justify-center space-x-2"
                              title="Edit Product"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(productId)}
                              className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg py-2.5 px-3 transition-all duration-200 flex items-center justify-center space-x-2"
                              title="Delete Product"
                              disabled={!product._id && !product.id}
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 mobile-md:py-8 text-gray-500 dark:text-slate-400">
                  <p className="text-sm mobile-md:text-base">
                    {selectedCategory === 'All' ? 'No products found' : `No products found in "${selectedCategory}" category`}
                  </p>
                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    className="mt-2 text-yellow-600 dark:text-amber-400 hover:text-yellow-800 dark:hover:text-amber-300 transition-colors duration-200 text-sm mobile-md:text-base"
                  >
                    Add your first product
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden md:block">
              <div className="grid gap-3 mobile-md:gap-4 lg:gap-6">
                {(filteredProducts && filteredProducts.length > 0) ? (
                  filteredProducts.filter(product => product).map((product, index) => {
                    const productId = product._id || product.id || `temp-${index}`;
                    
                    return (
                      <div key={productId} className="border border-gray-200 dark:border-slate-600 rounded-lg p-3 mobile-md:p-4 lg:p-6 hover:shadow-md dark:hover:shadow-slate-900/30 transition-shadow bg-white dark:bg-slate-800">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                          <div className="flex flex-col mobile-lg:flex-row space-y-3 mobile-lg:space-y-0 mobile-lg:space-x-4 flex-1">
                            {/* Product Image */}
                            <div className="w-16 h-16 mobile-md:w-20 mobile-md:h-20 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center self-start">
                              <img
                                src={
                                  product.image || 
                                  (product.images && product.images.length > 0 ? product.images[0] : null) ||
                                  '/placeholder-product.svg'
                                }
                                alt={product.name || 'Product'}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.svg';
                                }}
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base mobile-md:text-lg font-semibold text-gray-900 dark:text-slate-100 truncate">{product.name || 'Unnamed Product'}</h4>
                              <p className="text-sm mobile-md:text-base text-gray-600 dark:text-slate-400 mb-2 line-clamp-2">{product.description || 'No description'}</p>
                              <div className="flex flex-col mobile-md:flex-row mobile-md:items-center mobile-md:space-x-4 space-y-1 mobile-md:space-y-0 text-xs mobile-md:text-sm text-gray-600 dark:text-slate-400">
                                <span>Category: <span className="font-medium text-gray-900 dark:text-slate-100">{product.category || 'N/A'}</span></span>
                                <span>Stock: <span className="font-medium text-gray-900 dark:text-slate-100">{product.stock || 0}</span></span>
                                {product.unit && <span>Unit: <span className="font-medium text-gray-900 dark:text-slate-100">{product.unit}</span></span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 lg:mt-0 lg:text-right flex flex-col mobile-lg:flex-row lg:flex-col items-start mobile-lg:items-center lg:items-end space-y-2 mobile-lg:space-y-0 mobile-lg:space-x-3 lg:space-x-0 lg:space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-400">Price:</span>
                              <input
                                type="number"
                                value={product.price || 0}
                                onChange={(e) => updateProductPrice(productId, parseFloat(e.target.value))}
                                className="w-20 mobile-md:w-24 px-2 py-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded text-xs mobile-md:text-sm focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400"
                              />
                              <span className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-400">₹</span>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 mobile-md:p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                                title="Edit Product"
                              >
                                <PencilIcon className="h-3 w-3 mobile-md:h-4 mobile-md:w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(productId)}
                                className="p-1.5 mobile-md:p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                                title="Delete Product"
                                disabled={!product._id && !product.id}
                              >
                                <TrashIcon className="h-3 w-3 mobile-md:h-4 mobile-md:w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 mobile-md:py-8 text-gray-500 dark:text-slate-400">
                    <p className="text-sm mobile-md:text-base">
                      {selectedCategory === 'All' ? 'No products found' : `No products found in "${selectedCategory}" category`}
                    </p>
                    <button 
                      onClick={() => setShowAddProductModal(true)}
                      className="mt-2 text-yellow-600 dark:text-amber-400 hover:text-yellow-800 dark:hover:text-amber-300 transition-colors duration-200 text-sm mobile-md:text-base"
                    >
                      Add your first product
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pricing Management Component
  const renderPricing = () => {
    // Filter pricing data based on selected category
    const filteredPricingData = selectedCategory === 'All' 
      ? pricingData 
      : pricingData.filter(product => product.category === selectedCategory);

    // Extract unique categories for filtering
    const categories = ['All', ...new Set(products.map(product => product.category).filter(Boolean))];

    return (
      <div className="space-y-4 mobile-md:space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-yellow-200 dark:border-slate-600 transition-colors duration-300">
          <div className="px-3 mobile-md:px-4 lg:px-6 py-3 mobile-md:py-4 border-b border-yellow-200 dark:border-slate-600 bg-gradient-to-r from-yellow-50 to-red-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <h3 className="text-base mobile-md:text-lg font-medium text-gray-900 dark:text-slate-100">Pricing Management</h3>
            <p className="text-xs mobile-md:text-sm text-gray-600 dark:text-slate-300 mt-1">Set different prices for Regular, Secondary, and Primary customers</p>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="px-3 mobile-md:px-4 lg:px-6 py-3 border-b border-gray-200 dark:border-slate-600">
              <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs mobile-md:text-sm font-medium transition-all duration-200 border ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-yellow-500 to-red-500 dark:from-amber-500 dark:to-orange-500 text-white border-transparent shadow-md'
                        : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 mobile-md:p-4 lg:p-6">
            {filteredPricingData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                <CurrencyRupeeIcon className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                <p className="text-sm mobile-md:text-base">
                  {selectedCategory === 'All' ? 'No products available for pricing' : `No products found in "${selectedCategory}" category`}
                </p>
              </div>
            ) : (
              <div className="space-y-4 mobile-md:space-y-6">
                {filteredPricingData.map((product, index) => {
                  const productId = product._id || product.id || `temp-${index}`;
                  
                  return (
                    <div key={productId} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 mobile-md:p-6 border border-gray-200 dark:border-slate-600">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                        {/* Product Info */}
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img
                              src={product.image || '/placeholder-product.svg'}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.svg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base mobile-md:text-lg font-semibold text-gray-900 dark:text-slate-100 truncate">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mb-2">
                              {product.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs mobile-md:text-sm text-gray-500 dark:text-slate-400">
                              <span>Category: <span className="font-medium text-gray-900 dark:text-slate-100">{product.category}</span></span>
                              <span>Stock: <span className="font-medium text-gray-900 dark:text-slate-100">{product.stock}</span></span>
                              <span>Unit: <span className="font-medium text-gray-900 dark:text-slate-100">{product.unit}</span></span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Grid - Mobile Horizontal Scroll, Desktop Grid */}
                        {/* Mobile Layout with Horizontal Scroll */}
                        <div className="md:hidden">
                          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                            {/* Regular Customer Price */}
                            <div className="flex-shrink-0 w-48 bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                              <div className="text-center">
                                <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <UsersIcon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                                </div>
                                <h5 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">Regular</h5>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600 dark:text-slate-400">₹</span>
                                  <input
                                    type="number"
                                    value={product.prices?.regular || 0}
                                    onChange={(e) => updateProductPricing(productId, 'regular', e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Secondary Customer Price */}
                            <div className="flex-shrink-0 w-48 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                              <div className="text-center">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <StarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Secondary</h5>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                                  {calculateDiscount(product.prices?.regular, product.prices?.secondary)}% off
                                </p>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-blue-600 dark:text-blue-400">₹</span>
                                  <input
                                    type="number"
                                    value={product.prices?.secondary || 0}
                                    onChange={(e) => updateProductPricing(productId, 'secondary', e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Primary Customer Price */}
                            <div className="flex-shrink-0 w-48 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                              <div className="text-center">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <StarIcon className="h-4 w-4 text-green-600 dark:text-green-400 fill-current" />
                                </div>
                                <h5 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">Primary</h5>
                                <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                                  {calculateDiscount(product.prices?.regular, product.prices?.primary)}% off
                                </p>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-green-600 dark:text-green-400">₹</span>
                                  <input
                                    type="number"
                                    value={product.prices?.primary || 0}
                                    onChange={(e) => updateProductPricing(productId, 'primary', e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-green-300 dark:border-green-600 bg-white dark:bg-slate-800 text-green-900 dark:text-green-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tablet and Desktop Grid Layout */}
                        <div className="hidden md:grid md:grid-cols-3 gap-4 lg:w-96">
                          {/* Regular Customer Price */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                                <UsersIcon className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                              </div>
                              <h5 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-3">Regular</h5>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600 dark:text-slate-400">₹</span>
                                <input
                                  type="number"
                                  value={product.prices?.regular || 0}
                                  onChange={(e) => updateProductPricing(productId, 'regular', e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Secondary Customer Price */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <StarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Secondary</h5>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                                {calculateDiscount(product.prices?.regular, product.prices?.secondary)}% off
                              </p>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-blue-600 dark:text-blue-400">₹</span>
                                <input
                                  type="number"
                                  value={product.prices?.secondary || 0}
                                  onChange={(e) => updateProductPricing(productId, 'secondary', e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Primary Customer Price */}
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                            <div className="text-center">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <StarIcon className="h-4 w-4 text-green-600 dark:text-green-400 fill-current" />
                              </div>
                              <h5 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">Primary</h5>
                              <p className="text-xs text-green-600 dark:text-green-400 mb-2">
                                {calculateDiscount(product.prices?.regular, product.prices?.primary)}% off
                              </p>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-green-600 dark:text-green-400">₹</span>
                                <input
                                  type="number"
                                  value={product.prices?.primary || 0}
                                  onChange={(e) => updateProductPricing(productId, 'primary', e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 border border-green-300 dark:border-green-600 bg-white dark:bg-slate-800 text-green-900 dark:text-green-100 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add Product Modal Component
  const renderAddProductModal = () => {
    if (!showAddProductModal) return null;

    return (
      <div className="fixed inset-0 bg-white bg-opacity-40 dark:bg-slate-900 dark:bg-opacity-40 backdrop-blur-sm flex items-start justify-center z-50 p-3 mobile-md:p-4 pt-8 mobile-md:pt-12">
        <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-600 transition-colors duration-300">
          <div className="flex justify-between items-center p-4 mobile-md:p-6 border-b border-gray-200 dark:border-slate-600">
            <h3 className="text-base mobile-md:text-lg font-semibold text-gray-900 dark:text-slate-100">Add New Product</h3>
            <button 
              onClick={() => setShowAddProductModal(false)}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6" />
            </button>
          </div>
          
          <div className="p-4 mobile-md:p-6 space-y-3 mobile-md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder="Enter product description"
              />
            </div>
            
            <div className="grid grid-cols-1 mobile-lg:grid-cols-2 gap-3 mobile-md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Stock *</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 mobile-lg:grid-cols-2 gap-3 mobile-md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                >
                  <option value="Cement">Cement</option>
                  <option value="Sand & Aggregates">Sand & Aggregates</option>
                  <option value="Bricks & Blocks">Bricks & Blocks</option>
                  <option value="Stone Aggregates">Stone Aggregates</option>
                  <option value="Roof and Tiles Bonding">Roof and Tiles Bonding</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Unit *</label>
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                >
                  <option value="Bags">Bags</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Kilograms">Kilograms</option>
                  <option value="Tons">Tons</option>
                  <option value="Square Feet">Square Feet</option>
                  <option value="Cubic Feet">Cubic Feet</option>
                  <option value="Meters">Meters</option>
                  <option value="Inches">Inches</option>
                  <option value="Liters">Liters</option>
                  <option value="Boxes">Boxes</option>
                </select>
              </div>
            </div>

            {/* Size Field - For products like bricks that are measured by dimensions */}
            {['Bricks & Blocks', 'Tools & Equipment'].includes(newProduct.category) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Size/Dimensions
                  {newProduct.category === 'Bricks & Blocks' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={newProduct.size}
                  onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                  placeholder="e.g., 6 inch x 4 inch, 24 inch x 8 inch x 4 inch"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Enter dimensions for this product (e.g., length x width x height)
                </p>
              </div>
            )}

            {/* Weight Field - Optional for all products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Weight (kg) (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={newProduct.weight}
                onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder={['Bricks & Blocks'].includes(newProduct.category) ? "Enter weight per piece (optional)" : "Enter weight in kilograms"}
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {['Bricks & Blocks'].includes(newProduct.category) 
                  ? 'Optional - weight per piece in kilograms' 
                  : `Required for ${['Cement', 'Sand & Aggregates', 'Stone Aggregates', 'Roof and Tiles Bonding'].includes(newProduct.category) ? 'this category' : ''} 
                     ${['Bags', 'Kilograms', 'Tons'].includes(newProduct.unit) ? 'this unit type' : ''}`
                }
              </p>
            </div>

            {/* Image Upload Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Product Image</label>
              
              {/* Image Input Method Toggle */}
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="imageMethod"
                    value="upload"
                    checked={newProduct.imageMethod !== 'url'}
                    onChange={() => setNewProduct({...newProduct, imageMethod: 'upload', images: []})}
                    className="mr-2 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Upload File</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="imageMethod"
                    value="url"
                    checked={newProduct.imageMethod === 'url'}
                    onChange={() => setNewProduct({...newProduct, imageMethod: 'url', images: []})}
                    className="mr-2 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Image URL</span>
                </label>
              </div>

              {/* File Upload Option */}
              {newProduct.imageMethod !== 'url' && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Create a preview URL for the image
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewProduct({...newProduct, images: [event.target.result]});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Upload a product image (JPG, PNG, GIF supported)
                  </p>
                </div>
              )}

              {/* URL Input Option */}
              {newProduct.imageMethod === 'url' && (
                <div>
                  <input
                    type="url"
                    placeholder="https://example.com/product-image.jpg"
                    value={newProduct.imageUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      setNewProduct({
                        ...newProduct, 
                        imageUrl: url,
                        images: url ? [url] : []
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Enter a direct link to the product image (e.g., from your website or cloud storage)
                  </p>
                </div>
              )}
              
              {/* Image Preview */}
              {newProduct.images && newProduct.images.length > 0 && (
                <div className="mt-3">
                  <div className="relative inline-block">
                    <img 
                      src={newProduct.images[0]} 
                      alt="Product preview" 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-slate-600"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.svg';
                        e.target.className += ' opacity-50';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setNewProduct({
                        ...newProduct, 
                        images: [], 
                        imageUrl: newProduct.imageMethod === 'url' ? '' : newProduct.imageUrl
                      })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {newProduct.imageMethod === 'url' ? 'Image from URL' : 'Uploaded image'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-600">
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 text-sm mobile-md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddProduct}
                disabled={
                  !newProduct.name || 
                  !newProduct.price || 
                  !newProduct.stock ||
                  ((['Cement', 'Sand & Aggregates', 'Stone Aggregates', 'Roof and Tiles Bonding'].includes(newProduct.category) || 
                    ['Bags', 'Kilograms', 'Tons'].includes(newProduct.unit)) && 
                   (!newProduct.weight || parseFloat(newProduct.weight) <= 0))
                }
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 dark:from-amber-500 dark:to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-red-600 dark:hover:from-amber-600 dark:hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm mobile-md:text-base"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Order Modal Component
  const renderEditOrderModal = () => {
    if (!showEditOrderModal || !editingOrder) return null;

    return (
      <div className="fixed inset-0 bg-white bg-opacity-40 dark:bg-slate-900 dark:bg-opacity-40 backdrop-blur-sm flex items-start justify-center z-50 p-3 mobile-md:p-4 pt-8 mobile-md:pt-12">
        <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-600 transition-colors duration-300">
          <div className="flex justify-between items-center p-4 mobile-md:p-6 border-b border-gray-200 dark:border-slate-600">
            <h3 className="text-base mobile-md:text-lg font-semibold text-gray-900 dark:text-slate-100">
              Edit Order #{editingOrder.orderNumber || editingOrder._id?.slice(-6)}
            </h3>
            <button 
              onClick={handleCancelOrderEdit}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6" />
            </button>
          </div>
          
          <div className="p-4 mobile-md:p-6 space-y-4">
            {/* Order Information Display */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Customer:</span>
                <span className="font-medium text-gray-900 dark:text-slate-100">{editingOrder.user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-slate-100">{formatCurrency(editingOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(editingOrder.status)}`}>
                  {editingOrder.status}
                </span>
              </div>
            </div>

            {/* Estimated Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={editOrderData.estimatedDelivery}
                onChange={(e) => setEditOrderData({...editOrderData, estimatedDelivery: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
              />
            </div>
            
            {/* Tracking Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={editOrderData.trackingNumber}
                onChange={(e) => setEditOrderData({...editOrderData, trackingNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder="Enter tracking number"
              />
            </div>
            
            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Admin Notes
              </label>
              <textarea
                value={editOrderData.notes}
                onChange={(e) => setEditOrderData({...editOrderData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder="Add notes for this order..."
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-600">
              <button 
                onClick={handleCancelOrderEdit}
                className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 text-sm mobile-md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveOrderEdit}
                disabled={updatingOrders.has(editingOrder._id)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm mobile-md:text-base"
              >
                {updatingOrders.has(editingOrder._id) ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Product Modal Component  
  const renderEditProductModal = () => {
    if (!showEditProductModal || !editingProduct) return null;

    return (
      <div className="fixed inset-0 bg-white bg-opacity-40 dark:bg-slate-900 dark:bg-opacity-40 backdrop-blur-sm flex items-start justify-center z-50 p-3 mobile-md:p-4 pt-8 mobile-md:pt-12">
        <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-600 transition-colors duration-300">
          <div className="flex justify-between items-center p-4 mobile-md:p-6 border-b border-gray-200 dark:border-slate-600">
            <h3 className="text-base mobile-md:text-lg font-semibold text-gray-900 dark:text-slate-100">Edit Product</h3>
            <button 
              onClick={() => setShowEditProductModal(false)}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200"
            >
              <XMarkIcon className="h-5 w-5 mobile-md:h-6 mobile-md:w-6" />
            </button>
          </div>
          
          <div className="p-4 mobile-md:p-6 space-y-3 mobile-md:space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                value={editingProduct.name || ''}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder="Enter product name"
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder="Enter product description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category *</label>
              <select
                value={editingProduct.category || 'Cement'}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
              >
                <option value="Cement">Cement</option>
                <option value="Bricks & Blocks">Bricks & Blocks</option>
                <option value="Sand & Aggregates">Sand & Aggregates</option>
                <option value="Stone Aggregates">Stone Aggregates</option>
                <option value="Tiles & Flooring">Tiles & Flooring</option>
                <option value="Roofing Materials">Roofing Materials</option>
                <option value="Plumbing Supplies">Plumbing Supplies</option>
                <option value="Electrical Supplies">Electrical Supplies</option>
                <option value="Roof and Tiles Bonding">Roof and Tiles Bonding</option>
                <option value="Doors & Windows">Doors & Windows</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Price and Unit Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={editingProduct.price || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Unit *</label>
                <select
                  value={editingProduct.unit || 'Bags'}
                  onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                >
                  <option value="Bags">Bags</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Kilograms">Kilograms</option>
                  <option value="Tons">Tons</option>
                  <option value="Square Feet">Square Feet</option>
                  <option value="Cubic Feet">Cubic Feet</option>
                  <option value="Meters">Meters</option>
                  <option value="Inches">Inches</option>
                  <option value="Liters">Liters</option>
                  <option value="Boxes">Boxes</option>
                </select>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={editingProduct.stock || ''}
                onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder="Enter stock quantity"
              />
            </div>

            {/* Weight (optional for all products) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Weight (kg) (Optional)
              </label>
              <input
                type="number"
                value={editingProduct.weight || ''}
                onChange={(e) => setEditingProduct({...editingProduct, weight: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                placeholder="Enter weight in kg"
              />
            </div>

            {/* Size (conditional for dimensional products) */}
            {(editingProduct.category === 'Bricks & Blocks' || 
              editingProduct.category === 'Tiles & Flooring' ||
              editingProduct.category === 'Hardware & Tools') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Size/Dimensions {editingProduct.category === 'Bricks & Blocks' ? '*' : ''}
                </label>
                <input
                  type="text"
                  value={editingProduct.size || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, size: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                  placeholder="e.g., 6 inch x 4 inch, 2x2 feet"
                />
              </div>
            )}

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Product Image</label>
              
              {/* Image Method Selection */}
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={editingProduct.imageMethod === 'upload'}
                    onChange={() => setEditingProduct({...editingProduct, imageMethod: 'upload', imageUrl: ''})}
                    className="mr-2 text-yellow-500 focus:ring-yellow-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Upload File</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={editingProduct.imageMethod === 'url'}
                    onChange={() => setEditingProduct({...editingProduct, imageMethod: 'url', images: []})}
                    className="mr-2 text-yellow-500 focus:ring-yellow-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Image URL</span>
                </label>
              </div>

              {/* File Upload */}
              {editingProduct.imageMethod === 'upload' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditingProduct({...editingProduct, images: [reader.result], imageUrl: ''});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                />
              )}

              {/* URL Input */}
              {editingProduct.imageMethod === 'url' && (
                <input
                  type="url"
                  value={editingProduct.imageUrl || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value, images: []})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-amber-400 focus:border-yellow-500 dark:focus:border-amber-400 text-sm mobile-md:text-base"
                  placeholder="Enter image URL"
                />
              )}

              {/* Current Image Preview */}
              {(editingProduct.image || editingProduct.imageUrl || (editingProduct.images && editingProduct.images.length > 0)) && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Current Image:</p>
                  <img 
                    src={editingProduct.imageUrl || editingProduct.images?.[0] || editingProduct.image} 
                    alt="Product" 
                    className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-slate-600"
                  />
                </div>
              )}
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.availability !== false}
                  onChange={(e) => setEditingProduct({...editingProduct, availability: e.target.checked})}
                  className="mr-2 text-yellow-500 focus:ring-yellow-400 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Available for Purchase</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-600">
              <button 
                onClick={() => setShowEditProductModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200 text-sm mobile-md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 dark:from-amber-500 dark:to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-red-600 dark:hover:from-amber-600 dark:hover:to-orange-600 transition-colors duration-200 text-sm mobile-md:text-base"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Mobile-First Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">Manage your business</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        {/* Stats Overview - Always visible */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.totalOrders}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.totalCustomers}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Revenue</p>
                <p className="text-lg font-bold text-gray-900 dark:text-slate-100">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <CurrencyRupeeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.pendingOrders}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setActiveTab('Overview')}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <Squares2X2Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('Orders')}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Orders</span>
            </button>
            
            <button
              onClick={() => {
                console.log('Products button clicked!');
                setActiveTab('Products');
              }}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <ShoppingBagIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Products</span>
            </button>
            
            <button
              onClick={() => setActiveTab('Customers')}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Customers</span>
            </button>
            
            <button
              onClick={() => setActiveTab('Pricing')}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <CurrencyRupeeIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Pricing</span>
            </button>
            
            <button
              onClick={() => setActiveTab('Notifications')}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Notifications</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'Overview' ? (
          /* Recent Activity */
          <div className="space-y-6">
            {/* Recent Orders */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('Orders')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order._id || order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          #{order.orderNumber || order._id?.slice(-6) || order.id}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-slate-400">
                          {order.user?.name || order.customerName || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          ₹{(order.totalAmount || order.total || 0).toLocaleString()}
                        </p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab Content */
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
            <div className="p-4">
              {/* Back Button for mobile */}
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setActiveTab('Overview')}
                  className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
              
              {/* Content based on active tab */}
              {activeTab === 'Orders' && (
                <>
                  {renderOrders()}
                  {renderEditOrderModal()}
                </>
              )}
              {activeTab === 'Products' && (
                <>
                  {renderProducts()}
                  {renderAddProductModal()}
                  {renderEditProductModal()}
                </>
              )}
              {activeTab === 'Customers' && <CustomerManagement />}
              {activeTab === 'Pricing' && renderPricing()}
              {activeTab === 'Notifications' && <NotificationManagement />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
