import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useResponsive } from '../../hooks/useResponsive';
import productService from '../../services/productService';
import Button from '../common/Button';
import { ShoppingCartIcon, PlusIcon, MinusIcon, EyeIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const { isAuthenticated, getUserPriceTier, user, isAdmin } = useAuth();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { isMobile, isTablet, getTextSize } = useResponsive();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const userRole = user?.role || 'standard';
  const priceInfo = productService.getPriceTierInfo(product, userRole);
  const productId = product._id || product.id;
  const currentQuantity = getItemQuantity(productId);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${productId}` } } });
      return;
    }

    setIsLoading(true);
    try {
      addToCart(product, quantity, priceInfo.displayPrice);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getDiscountPercent = () => {
    if (!priceInfo.hasDifferentPrice || priceInfo.savings <= 0) return null;
    return Math.round((priceInfo.savings / priceInfo.regularPrice) * 100);
  };

  const discount = priceInfo.hasDifferentPrice && priceInfo.savings > 0
    ? Math.round((priceInfo.savings / priceInfo.regularPrice) * 100)
    : null;

  // Get category with fallback logic
  const getProductCategory = () => {
    if (product.category) {
      return product.category.toLowerCase();
    }
    
    // Try to detect category from product name
    const name = product.name?.toLowerCase() || '';
    if (name.includes('cement')) return 'cement';
    if (name.includes('steel') || name.includes('iron')) return 'steel';
    if (name.includes('concrete')) return 'concrete';
    if (name.includes('block')) return 'blocks';
    if (name.includes('brick')) return 'bricks';
    if (name.includes('sand') || name.includes('aggregate')) return 'sand & aggregates';
    
    return 'construction material';
  };

  const category = getProductCategory();

  // Get category icon
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'cement': return '🏗️';
      case 'steel': case 'steel & iron': return '⚡';
      case 'concrete': return '🧱';
      case 'blocks': case 'bricks & blocks': return '📦';
      case 'bricks': return '🧱';
      case 'sand & aggregates': return '🏔️';
      case 'tiles': case 'tiles & flooring': return '🔲';
      case 'roofing': case 'roofing materials': return '🏠';
      case 'plumbing': case 'plumbing supplies': return '🔧';
      case 'electrical': case 'electrical supplies': return '⚡';
      case 'hardware': case 'hardware & tools': return '🔨';
      case 'paints': case 'paints & finishes': return '🎨';
      case 'doors': case 'doors & windows': return '🚪';
      default: return '🏗️';
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-slate-900/50 hover:shadow-2xl dark:hover:shadow-slate-900/70 overflow-hidden transition-all duration-500 transform hover:scale-105 border border-gray-100 dark:border-slate-600 h-full flex flex-col">
      
      {/* Product Type Badge */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 dark:from-amber-400 dark:to-orange-500 text-white dark:text-slate-900 text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg flex items-center space-x-1">
          <span className="text-xs sm:text-sm">{getCategoryIcon(category)}</span>
          <span className="capitalize hidden sm:inline text-xs">{category}</span>
        </div>
      </div>

      {/* Discount Badge */}
      {discount && (userRole === 'primary' || userRole === 'secondary') && (
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
          <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full shadow-lg">
            {discount}% OFF
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-40 sm:h-48 lg:h-52 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 overflow-hidden flex-shrink-0">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.svg'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 bg-white dark:bg-slate-100"
          onError={(e) => {
            e.target.src = '/placeholder-product.svg';
          }}
        />
        
        {/* Quick View Button - Appears on Hover */}
        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Link to={`/products/${productId}`}>
            <button className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-800 dark:text-slate-200 p-2 sm:p-2.5 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all duration-200">
              <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        
        {/* Product Name */}
        <h3 className={`${getTextSize('text-base')} font-bold text-gray-900 dark:text-slate-100 mb-1 line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300`}>
          {product.name}
        </h3>

        {/* Product Description */}
        <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1 leading-relaxed">
          {product.description}
        </p>

        {/* Compact Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1.5 text-xs">
              {Object.entries(product.specifications).slice(0, 2).map(([key, value], index) => (
                <div key={key} className="bg-gray-50 dark:bg-slate-700 rounded px-2 py-0.5 flex items-center space-x-1 min-w-0">
                  <span className="text-gray-500 dark:text-slate-400 font-medium truncate">{key}:</span>
                  <span className="text-gray-800 dark:text-slate-200 font-semibold truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Price Section */}
        <div className="mb-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-orange-200 dark:border-amber-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-gray-900 dark:text-slate-100">
                {formatPrice(priceInfo.displayPrice)}
              </span>
              <span className="text-gray-600 dark:text-slate-400 text-xs ml-1">/{product.unit}</span>
            </div>
            {priceInfo.hasDifferentPrice && (userRole === 'primary' || userRole === 'secondary') && (
              <span className="text-gray-500 dark:text-slate-500 text-xs line-through">
                {formatPrice(priceInfo.regularPrice)}
              </span>
            )}
          </div>
          
          {/* Compact Pricing Message */}
          {isAuthenticated && priceInfo.hasDifferentPrice && priceInfo.savings > 0 && (userRole === 'primary' || userRole === 'secondary') && (
            <p className="text-orange-700 dark:text-amber-400 text-xs font-medium mt-0.5">
              {userRole === 'primary' ? '🏆 Primary' : '⭐ Special'}
            </p>
          )}
          
          {/* Admin Price Display */}
          {userRole === 'admin' && (
            <p className="text-blue-700 dark:text-blue-400 text-xs font-medium mt-0.5">
              👑 Admin
            </p>
          )}
        </div>

        {/* Compact Stock Status - Only show to admins */}
        {isAdmin() && (
          <div className="mb-2">
            {product.stock > 0 ? (
              <div className="flex items-center space-x-1 text-green-700 dark:text-green-400 text-xs">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">In Stock ({product.stock})</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-700 dark:text-red-400 text-xs">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span className="font-medium">Out of Stock</span>
              </div>
            )}
          </div>
        )}

        {/* Compact Action Section */}
        <div className="mt-auto">
          {(isAdmin() ? product.stock > 0 : true) ? (
            currentQuantity > 0 ? (
              // Already in cart - Compact version
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-600/50 rounded-lg shadow-sm">
                  <span className="text-xs font-semibold text-green-800 dark:text-green-300">In Cart: {currentQuantity}</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleQuantityChange(currentQuantity - 1)}
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-600/40 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-110"
                    >
                      <MinusIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleQuantityChange(currentQuantity + 1)}
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-600/40 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-110"
                    >
                      <PlusIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <Link to={`/products/${productId}`} className="block">
                  <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-500 dark:hover:to-purple-600 text-white font-bold py-2 px-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-xs h-9 flex items-center justify-center transform hover:scale-[1.02]">
                    <EyeIcon className="h-3 w-3 mr-1.5" />
                    View Details
                  </button>
                </Link>
              </div>
            ) : (
              // Not in cart - Simplified version
              <div className="space-y-1.5">
                {/* Ultra Compact Quantity Selector */}
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-700 dark:to-slate-600 rounded-lg border border-gray-200 dark:border-slate-500 shadow-sm">
                  <span className="text-xs font-medium text-gray-700 dark:text-slate-300">Qty:</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-600/40 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-110"
                    >
                      <MinusIcon className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={isAdmin() ? product.stock : 999}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-10 px-1 py-0.5 text-center border border-gray-300 dark:border-slate-400 bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 rounded-md text-xs focus:ring-2 focus:ring-orange-400 dark:focus:ring-amber-400 focus:border-orange-400 dark:focus:border-amber-400 font-semibold shadow-sm"
                    />
                    <button
                      onClick={() => setQuantity(isAdmin() ? Math.min(product.stock, quantity + 1) : quantity + 1)}
                      className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/50 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-600/40 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-110"
                    >
                      <PlusIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Ultra Compact Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5">
                  <Button
                    onClick={handleAddToCart}
                    loading={isLoading}
                    disabled={false}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-amber-400 dark:to-orange-400 hover:from-yellow-500 hover:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500 text-white font-bold py-2 px-1 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex items-center justify-center h-9 transform hover:scale-[1.02]"
                  >
                    <ShoppingCartIcon className="h-3 w-3 mr-1" />
                    {isAuthenticated ? 'Add' : 'Login'}
                  </Button>
                  
                  <Link to={`/products/${productId}`} className="block">
                    <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 hover:from-indigo-600 hover:to-purple-700 dark:hover:from-indigo-500 dark:hover:to-purple-600 text-white font-bold py-2 px-1 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-xs flex items-center justify-center h-9 transform hover:scale-[1.02]">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      Details
                    </button>
                  </Link>
                </div>
              </div>
            )
          ) : (
            // Out of stock - Only show to admins
            isAdmin() && (
              <div className="p-1.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600/50 rounded-md text-center">
                <p className="text-red-700 dark:text-red-400 font-medium text-xs">Out of Stock</p>
              </div>
            )
          )}
        </div>

        {/* Ultra Compact Login Prompt */}
        {!isAuthenticated && (
          <Link to="/login" className="block mt-1.5">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600/50 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors duration-200 cursor-pointer">
              <p className="text-blue-700 dark:text-blue-400 text-xs font-medium text-center">
                🔐 Login to buy this product
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
