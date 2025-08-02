import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ProductsPage = () => {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'all'
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const categories = [
    { key: 'Cement', name: 'Cement', icon: '🏗️' },
    { key: 'Steel & Iron', name: 'Steel & Iron', icon: '⚙️' },
    { key: 'Bricks & Blocks', name: 'Bricks & Blocks', icon: '🧱' },
    { key: 'Sand & Aggregates', name: 'Sand & Aggregates', icon: '🏔️' }, 
    { key: 'Concrete', name: 'Concrete', icon: '🏭' },
    { key: 'Tiles & Flooring', name: 'Tiles & Flooring', icon: '🔲' },
    { key: 'Roofing Materials', name: 'Roofing Materials', icon: '🏠' },
    { key: 'Plumbing Supplies', name: 'Plumbing Supplies', icon: '🔧' },
    { key: 'Electrical Supplies', name: 'Electrical Supplies', icon: '⚡' },
    { key: 'Hardware & Tools', name: 'Hardware & Tools', icon: '🔨' },
    { key: 'Paints & Finishes', name: 'Paints & Finishes', icon: '🎨' },
    { key: 'Doors & Windows', name: 'Doors & Windows', icon: '🚪' },
    { key: 'Other', name: 'Other', icon: '📦' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getAllProducts();
      setAllProducts(response || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group products by category
  const groupedProducts = React.useMemo(() => {
    let filteredProducts = allProducts;

    // Apply search filter
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Group by category
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat.key] = filteredProducts.filter(product => 
        product.category === cat.key || 
        (product.category && product.category.toLowerCase() === cat.key.toLowerCase())
      );
    });

    // Add products that don't match any specific category to "Other"
    const uncategorized = filteredProducts.filter(product => {
      const productCategory = product.category || 'Other';
      return !categories.some(cat => 
        productCategory === cat.key || 
        productCategory.toLowerCase() === cat.key.toLowerCase()
      );
    });
    
    if (uncategorized.length > 0) {
      grouped['Other'] = [...(grouped['Other'] || []), ...uncategorized];
    }

    // Remove empty categories
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
  }, [allProducts, searchTerm]);

  // Get filtered products for "View All" mode
  const getFilteredProducts = () => {
    let filtered = allProducts;

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category === selectedCategory ||
        (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    return filtered;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const scrollContainer = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleCategoryExpansion = (categoryKey) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const CategorySection = ({ categoryKey, categoryData, products }) => {
    const isExpanded = expandedCategories.has(categoryKey);
    const displayProducts = isExpanded ? products : products.slice(0, 6);

    if (products.length === 0) return null;

    return (
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl sm:text-3xl">{categoryData.icon}</span>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-slate-100">
                {categoryData.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400">
                {products.length} product{products.length > 1 ? 's' : ''} available
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {products.length > 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleCategoryExpansion(categoryKey)}
                className="flex items-center space-x-1"
              >
                <EyeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isExpanded ? 'Show Less' : `View All ${products.length}`}
                </span>
                <span className="sm:hidden">
                  {isExpanded ? 'Less' : 'All'}
                </span>
              </Button>
            )}
            
            <div className="flex space-x-1">
              <button
                onClick={() => scrollContainer(`category-${categoryKey}`, 'left')}
                className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-600"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-slate-300" />
              </button>
              <button
                onClick={() => scrollContainer(`category-${categoryKey}`, 'right')}
                className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-600"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {isExpanded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div 
            id={`category-${categoryKey}`}
            className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {displayProducts.map((product) => (
              <div key={product._id} className="flex-none w-72 sm:w-80 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedUnit, priceRange, sortBy, pagination.currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getAllProducts();
      let products = response; // productService returns data directly, not wrapped in .data
      
      // Apply filters
      if (searchTerm) {
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedCategory) {
        products = products.filter(product => product.category === selectedCategory);
      }
      
      if (selectedUnit) {
        products = products.filter(product => product.unit === selectedUnit);
      }
      
      if (priceRange.min) {
        products = products.filter(product => product.price >= parseFloat(priceRange.min));
      }
      
      if (priceRange.max) {
        products = products.filter(product => product.price <= parseFloat(priceRange.max));
      }
      
      // Apply sorting
      products.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case '-name':
            return b.name.localeCompare(a.name);
          case 'price':
            return a.price - b.price;
          case '-price':
            return b.price - a.price;
          case '-createdAt':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'createdAt':
            return new Date(a.createdAt) - new Date(b.createdAt);
          default:
            return 0;
        }
      });
      
      // Apply pagination
      const totalProducts = products.length;
      const totalPages = Math.ceil(totalProducts / pagination.limit);
      const startIndex = (pagination.currentPage - 1) * pagination.limit;
      const paginatedProducts = products.slice(startIndex, startIndex + pagination.limit);
      
      setProducts(paginatedProducts);
      setPagination(prev => ({
        ...prev,
        totalPages,
        totalProducts
      }));
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'unit':
        setSelectedUnit(value);
        break;
      case 'priceMin':
        setPriceRange(prev => ({ ...prev, min: value }));
        break;
      case 'priceMax':
        setPriceRange(prev => ({ ...prev, max: value }));
        break;
      case 'sort':
        setSortBy(value);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedUnit('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 dark:from-slate-900 dark:via-slate-800 dark:to-red-900 text-white py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
              <span className="text-yellow-400 dark:text-amber-400">Construction</span> Materials
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 dark:text-slate-300 mb-4 sm:mb-6 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
              Browse our extensive collection of premium construction materials
            </p>
            <div className="w-16 sm:w-20 md:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto"></div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Special Pricing Alert */}
        {user && user.role !== 'registered' && user.role !== 'admin' && (
          <div className="bg-gradient-to-r from-yellow-50 to-red-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-yellow-400 dark:border-amber-400 rounded-lg p-6 mb-8 shadow-lg dark:shadow-slate-900/30">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-400 dark:bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-white dark:text-slate-900 font-bold text-lg">★</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-gray-900 dark:text-slate-100 font-semibold">
                  <span className="text-red-600 dark:text-red-400">
                    {user.role === 'primary' ? 'Primary Customer' : 'Secondary Customer'} Pricing Active
                  </span>
                  {' '}- You're getting special discounted rates on all products!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Access Banner */}
        {user && user.role === 'admin' && (
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-amber-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg p-6 mb-8 shadow-lg dark:shadow-slate-900/30">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-500 dark:bg-red-400 rounded-full flex items-center justify-center">
                  <span className="text-white dark:text-slate-900 font-bold text-lg">🔧</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-gray-900 dark:text-slate-100 font-semibold">
                  <span className="text-red-600 dark:text-red-400">Administrator Access</span>
                  {' '}- You have full access to all products and pricing information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border-t-2 sm:border-t-4 border-yellow-400 dark:border-amber-400 p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-slate-300 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400 focus:border-yellow-400 dark:focus:border-amber-400 text-sm sm:text-base lg:text-lg"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 border-yellow-400 dark:border-amber-400 text-yellow-600 dark:text-amber-400 hover:bg-yellow-50 dark:hover:bg-amber-900/20 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </Button>
            
            {(selectedCategory || selectedUnit || priceRange.min || priceRange.max) && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="text-sm sm:text-base w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Unit
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => handleFilterChange('unit', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
                >
                  <option value="">All Units</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Price Range (₹)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-blue-500 dark:focus:border-amber-400"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-700 dark:text-slate-300">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalProducts)} of{' '}
            {pagination.totalProducts} products
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" text="Loading products..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchProducts}>
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-slate-400 text-lg mb-4">No products found</p>
            <p className="text-gray-400 dark:text-slate-500 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>

            {getPageNumbers().map((page) => (
              <Button
                key={page}
                variant={page === pagination.currentPage ? 'primary' : 'outline'}
                onClick={() => handlePageChange(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
