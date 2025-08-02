import api, { adminAPI } from './api';

class ProductService {
  constructor() {
    this.baseURL = '/products';
    this.adminBaseURL = '/admin/products';
  }

  async getAllProducts(params = {}) {
    try {
      // Set a high limit to get all products
      const allParams = { limit: 1000, ...params };
      const response = await api.get(this.baseURL, { params: allParams });
      return response.data.data.products; // Extract products array from the response
    } catch (error) {
      console.error('ProductService: Error fetching products:', error);
      throw error;
    }
  }

  // Admin method to get all products for management
  async getAllProductsForAdmin(params = {}) {
    try {
      console.log('ProductService: Fetching all products for admin...');
      // For admin, we can use the regular products endpoint but with admin token
      // Set a high limit to get all products
      const allParams = { limit: 1000, ...params };
      const response = await api.get(this.baseURL, { params: allParams });
      console.log('ProductService: Admin products response:', response.data);
      return response.data.data.products;
    } catch (error) {
      console.error('ProductService: Error fetching products for admin:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async addProduct(productData) {
    try {
      // Transform frontend data structure to backend format
      const backendData = this.transformToBackendFormat(productData);
      
      const response = await adminAPI.createProduct(backendData);
      return response.data.data;
    } catch (error) {
      console.error('ProductService: Error adding product:', error);
      console.error('ProductService: Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('ProductService: Error status:', error.response?.status);
      console.error('ProductService: Error details:', JSON.stringify({
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      }, null, 2));
      
      // Log the exact validation errors if they exist
      if (error.response?.data?.errors) {
        console.error('ProductService: Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
      
      throw error;
    }
  }

  async updateProduct(id, productData) {
    try {
      console.log('ProductService: Updating product via admin API...');
      // Transform frontend data structure to backend format
      const backendData = this.transformToBackendFormat(productData);
      const response = await adminAPI.updateProduct(id, backendData);
      return response.data.data;
    } catch (error) {
      console.error('ProductService: Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      console.log('ProductService: Deleting product via admin API...');
      await adminAPI.deleteProduct(id);
      return true;
    } catch (error) {
      console.error('ProductService: Error deleting product:', error);
      throw error;
    }
  }

  async updateStock(id, newStock) {
    try {
      const response = await api.patch(`${this.baseURL}/${id}`, { stock: newStock });
      return response.data.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }

  async getProductsByCategory(category) {
    try {
      const response = await api.get(this.baseURL, { 
        params: { category } 
      });
      return response.data.data.products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      const response = await api.get(this.baseURL, { 
        params: { search: query } 
      });
      return response.data.data.products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Transform frontend data structure to backend format
  transformToBackendFormat(productData) {
    console.log('ProductService: Transforming product data:', JSON.stringify(productData, null, 2));
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.category || !productData.unit || !productData.price) {
      throw new Error('Missing required fields: name, description, category, unit, and price are required');
    }

    // Check if weight is required for the selected unit
    if ((productData.unit === 'Bags' || productData.unit === 'Pieces') && (!productData.weight || parseFloat(productData.weight) <= 0)) {
      throw new Error('Weight is required and must be greater than 0 for Bags and Pieces units');
    }

    const backendData = {
      name: String(productData.name).trim(),
      description: String(productData.description).trim(),
      category: String(productData.category),
      unit: String(productData.unit),
      price: parseFloat(productData.price) || 0,
      stock: parseInt(productData.stock) || 0,
      availability: true
    };

    // Add weight if it's provided and unit requires it
    if (productData.weight && (productData.unit === 'Bags' || productData.unit === 'Pieces')) {
      backendData.weight = parseFloat(productData.weight);
    }

    // Validate price and stock are positive numbers
    if (backendData.price <= 0) {
      throw new Error('Price must be a positive number');
    }
    if (backendData.stock < 0) {
      throw new Error('Stock cannot be negative');
    }

    // Handle single image or images array - but only if they exist
    if (productData.image) {
      backendData.image = productData.image;
      backendData.images = [productData.image];
    } else if (productData.images && productData.images.length > 0) {
      backendData.image = productData.images[0];
      backendData.images = productData.images;
    }
    // Don't include image fields if no images provided

    // Handle pricing structure
    if (productData.prices && (productData.prices.primary || productData.prices.secondary)) {
      const basePrice = parseFloat(productData.price);
      backendData.prices = {
        standard: basePrice, // Use 'standard' as the backend expects
        // Only set primary/secondary if actually provided by user
        ...(productData.prices.primary && { primary: parseFloat(productData.prices.primary) }),
        ...(productData.prices.secondary && { secondary: parseFloat(productData.prices.secondary) })
      };
    } else {
      // Create basic pricing structure with only standard price
      const price = parseFloat(productData.price);
      backendData.prices = {
        standard: price
        // Don't auto-generate primary/secondary prices
      };
    }

    console.log('ProductService: Transformed backend data:', JSON.stringify(backendData, null, 2));
    return backendData;
  }

  // Calculate display price based on user role
  getDisplayPrice(product, userRole = 'standard') {
    // Admin always sees regular price
    if (userRole === 'admin') {
      return product.price;
    }
    
    // For primary customers: use primary price if set, otherwise regular price
    if (userRole === 'primary') {
      return (product.prices && product.prices.primary) ? product.prices.primary : product.price;
    }
    
    // For secondary customers: use secondary price if set, otherwise regular price
    if (userRole === 'secondary') {
      return (product.prices && product.prices.secondary) ? product.prices.secondary : product.price;
    }
    
    // For standard/registered customers: always regular price
    return product.price;
  }

  // Get price tier info for display
  getPriceTierInfo(product, userRole = 'standard') {
    const displayPrice = this.getDisplayPrice(product, userRole);
    const regularPrice = product.price;
    
    return {
      displayPrice,
      regularPrice,
      hasDifferentPrice: displayPrice !== regularPrice,
      tier: userRole === 'admin' ? 'Regular' : 
            userRole === 'primary' ? 'Primary' : 
            userRole === 'secondary' ? 'Secondary' : 'Standard',
      savings: regularPrice - displayPrice
    };
  }
}

const productService = new ProductService();
export default productService;
