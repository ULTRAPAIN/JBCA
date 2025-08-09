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
  ListBulletIcon
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
              <div className="flex space-x-1">
                <button
                  onClick={() => scrollContainer(`category-${categoryKey}`, 'left')}
                  className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => scrollContainer(`category-${categoryKey}`, 'right')}
                  className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                </button>
              </div>
            )}
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
            className="flex overflow-x-auto space-x-4 sm:space-x-6 pb-4 snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
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
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 dark:from-slate-900 dark:via-slate-800 dark:to-red-900 text-white py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4">
              <span className="text-yellow-400 dark:text-amber-400">Construction</span> Materials
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 dark:text-slate-300 mb-4 sm:mb-6 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
              Browse our extensive collection of premium construction materials organized by category
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

        {/* Search and View Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border-t-4 border-yellow-400 dark:border-amber-400 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400 focus:border-yellow-400 dark:focus:border-amber-400"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('category')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'category'
                    ? 'bg-yellow-400 dark:bg-amber-400 text-white dark:text-slate-900'
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
                <span>By Category</span>
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-yellow-400 dark:bg-amber-400 text-white dark:text-slate-900'
                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
                <span>View All</span>
              </button>
            </div>

            {/* Category Filter for View All Mode */}
            {viewMode === 'all' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400 focus:border-yellow-400 dark:focus:border-amber-400"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.key} value={category.key}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {getFilteredProducts().map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
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
