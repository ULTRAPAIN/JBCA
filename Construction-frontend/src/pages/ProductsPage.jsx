import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile sidebar toggle

  const categories = [
    { key: 'Cement', name: 'Cement', icon: '🏗️' },
    { key: 'Bricks & Blocks', name: 'Bricks & Blocks', icon: '🧱' },
    { key: 'Sand & Aggregates', name: 'Sand & Aggregates', icon: '🏔️' }, 
    { key: 'Stone Aggregates', name: 'Stone Aggregates', icon: '🏭' },
    { key: 'Tiles & Flooring', name: 'Tiles & Flooring', icon: '🔲' },
    { key: 'Roofing Materials', name: 'Roofing Materials', icon: '🏠' },
    { key: 'Plumbing Supplies', name: 'Plumbing Supplies', icon: '🔧' },
    { key: 'Electrical Supplies', name: 'Electrical Supplies', icon: '⚡' },
    { key: 'Roof and Tiles Bonding', name: 'Roof and Tiles Bonding', icon: '🎨' },
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
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Group by category
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat.key] = filteredProducts.filter(product => {
        const productCategory = product.category || 'Other';
        return productCategory === cat.key || 
               productCategory.toLowerCase() === cat.key.toLowerCase() ||
               (cat.key === 'Other' && !categories.slice(0, -1).some(c => 
                 productCategory === c.key || productCategory.toLowerCase() === c.key.toLowerCase()
               ));
      });
    });

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
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => {
        const productCategory = product.category || 'Other';
        return productCategory === selectedCategory ||
               productCategory.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    return filtered;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const scrollContainer = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
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
    const displayProducts = isExpanded ? products : products.slice(0, 8);

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
            {products.length > 8 && (
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
            
            {!isExpanded && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => scrollContainer(`category-${categoryKey}`, 'left')}
                  className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 min-w-[36px] min-h-[36px]"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => scrollContainer(`category-${categoryKey}`, 'right')}
                  className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 min-w-[36px] min-h-[36px]"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                </button>
              </div>
            )}
          </div>
        </div>

        {isExpanded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div 
            id={`category-${categoryKey}`}
            className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 snap-x snap-mandatory smooth-scroll scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {displayProducts.map((product) => (
              <div key={product._id} className="flex-none w-80 sm:w-96 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <Loading size="lg" variant="building" text="Loading products..." showLogo={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 dark:from-slate-900 dark:via-slate-800 dark:to-red-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              <span className="text-yellow-400 dark:text-amber-400">Construction</span> Materials
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 dark:text-slate-300 mb-4 sm:mb-6 max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-0">
              Browse our extensive collection of premium construction materials
            </p>
            <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto"></div>
          </div>
        </div>
      </section>

      {/* Main Content Area with Sidebar */}
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

        {/* Mobile Search and Filter Bar */}
        <div className="lg:hidden bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 p-4 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400 focus:border-yellow-400 dark:focus:border-amber-400"
            />
          </div>

          {/* Filter and View Mode Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Filter Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg text-gray-700 dark:text-slate-300 transition-colors"
            >
              <FunnelIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('category')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'category'
                    ? 'bg-yellow-400 dark:bg-amber-400 text-white dark:text-slate-900'
                    : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                <Squares2X2Icon className="h-3 w-3" />
                <span>Category</span>
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-yellow-400 dark:bg-amber-400 text-white dark:text-slate-900'
                    : 'text-gray-600 dark:text-slate-300'
                }`}
              >
                <ListBulletIcon className="h-3 w-3" />
                <span>All</span>
              </button>
            </div>
          </div>

          {/* Category Dropdown for Mobile - Separate Row */}
          {viewMode === 'all' && (
            <div className="mb-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.key} value={category.key}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Results Count */}
          <div className="pt-3 border-t border-gray-200 dark:border-slate-600">
            <p className="text-xs text-gray-500 dark:text-slate-400 text-center">
              {viewMode === 'all' 
                ? `${getFilteredProducts().length} products found`
                : `${Object.values(groupedProducts).flat().length} products in ${Object.keys(groupedProducts).length} categories`
              }
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar - Filters (Desktop Only) */}
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center">
                  <FunnelIcon className="h-5 w-5 mr-2 text-yellow-500 dark:text-amber-400" />
                  Filters
                </h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400 focus:border-yellow-400 dark:focus:border-amber-400"
                  />
                </div>
              </div>

              {/* View Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                  View Mode
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setViewMode('category')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'category'
                        ? 'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-200 border border-yellow-300 dark:border-amber-600'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                    <span>By Category</span>
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'all'
                        ? 'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-200 border border-yellow-300 dark:border-amber-600'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                    <span>View All</span>
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                  Categories
                </label>
                <div className="space-y-1 max-h-80 overflow-y-auto smooth-scroll">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === ''
                        ? 'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-200'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                        selectedCategory === category.key
                          ? 'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-200'
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {viewMode === 'all' 
                    ? `${getFilteredProducts().length} products found`
                    : `${Object.values(groupedProducts).flat().length} products in ${Object.keys(groupedProducts).length} categories`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
              <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-xl overflow-y-auto smooth-scroll">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center">
                      <FunnelIcon className="h-5 w-5 mr-2 text-yellow-500 dark:text-amber-400" />
                      Filters
                    </h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                    </button>
                  </div>
                  {/* View Mode */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                      View Mode
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setViewMode('category');
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'category'
                            ? 'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-200 border border-yellow-300 dark:border-amber-600'
                            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Squares2X2Icon className="h-4 w-4" />
                        <span>By Category</span>
                      </button>
                      <button
                        onClick={() => {
                          setViewMode('all');
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'all'
                            ? 'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-200 border border-yellow-300 dark:border-amber-600'
                            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <ListBulletIcon className="h-4 w-4" />
                        <span>View All</span>
                      </button>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                      Categories
                    </label>
                    <div className="space-y-1 max-h-80 overflow-y-auto smooth-scroll">
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === ''
                            ? 'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-200'
                            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map(category => (
                        <button
                          key={category.key}
                          onClick={() => {
                            setSelectedCategory(category.key);
                            setSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === category.key
                              ? 'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-200'
                              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {/* Content */}
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</p>
                <Button onClick={fetchProducts}>
                  Try Again
                </Button>
              </div>
            ) : viewMode === 'category' ? (
              // Category View with Horizontal Scrolling
              <div>
                {Object.keys(groupedProducts).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-slate-400 text-lg mb-4">No products found</p>
                    <p className="text-gray-400 dark:text-slate-500">
                      Try adjusting your search terms
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedProducts).map(([categoryKey, products]) => {
                    const categoryData = categories.find(cat => cat.key === categoryKey);
                    return (
                      <CategorySection
                        key={categoryKey}
                        categoryKey={categoryKey}
                        categoryData={categoryData}
                        products={products}
                      />
                    );
                  })
                )}
              </div>
            ) : (
              // Grid View for All Products
              <div>
                {getFilteredProducts().length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-slate-400 text-lg mb-4">No products found</p>
                    <p className="text-gray-400 dark:text-slate-500">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                    {getFilteredProducts().map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;
