import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';

const ModernProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Get role-based pricing info
  const userRole = user?.role || 'standard';
  
  // Get the appropriate price based on user role
  const getDisplayPrice = () => {
    if (!product) return 0;
    
    // If prices object exists, use it
    if (product.prices) {
      switch (userRole) {
        case 'admin':
          return product.prices.registered || product.prices.regular || product.price || 0;
        case 'primary':
          return product.prices.primary || product.prices.registered || product.prices.regular || product.price || 0;
        case 'secondary': 
          return product.prices.secondary || product.prices.registered || product.prices.regular || product.price || 0;
        default:
          return product.prices.registered || product.prices.regular || product.price || 0;
      }
    }
    
    // Fallback to single price
    return product.price || 0;
  };
  
  const displayPrice = getDisplayPrice();
  const regularPrice = product?.prices?.registered || product?.prices?.regular || product?.price || 0;
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const handleShare = async (e) => {
    e.stopPropagation(); // Prevent card click
    const productUrl = `${window.location.origin}/products/${product._id}`;
    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} from Jai Bhavani Cement Agency`,
      url: productUrl
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(productUrl);
          // You might want to show a toast notification here
          alert('Product link copied to clipboard!');
        } else {
          // Final fallback
          prompt('Copy this product link:', productUrl);
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(productUrl);
        alert('Product link copied to clipboard!');
      } catch (clipboardError) {
        prompt('Copy this product link:', productUrl);
      }
    }
  };

  // Get specifications for display (first 3)
  const specs = product.specifications ? Object.entries(product.specifications).slice(0, 3) : [];

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
    <div 
      className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col h-[400px] sm:h-[420px] md:h-[440px]"
      onClick={handleCardClick}
    >
      {/* Product Type Badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center space-x-1">
          <span className="text-xs">{getCategoryIcon(category)}</span>
          <span className="capitalize text-xs">{category}</span>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative h-40 sm:h-44 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 overflow-hidden flex-shrink-0">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 bg-white dark:bg-slate-100 p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600">
            <div className="text-center">
              <div className="text-6xl mb-2">🏗️</div>
              <span className="text-gray-500 dark:text-slate-400 text-sm">Product Image</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info and Actions Section */}
      <div className="flex-1 flex flex-col">
        {/* Product Name */}
        <div className="p-3 pb-2 h-14 flex items-center">
          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>

        {/* Price Display */}
        {isAuthenticated && displayPrice > 0 && (
          <div className="px-3 pb-2 h-14 flex items-center">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-2 border border-red-200 dark:border-red-600/30 w-full">
              <div className="flex items-center justify-between">
                <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                  {formatPrice(displayPrice)}
                </span>
                {/* Discount indicator if applicable */}
                {userRole === 'primary' || userRole === 'secondary' ? (
                  <span className="text-green-600 dark:text-green-400 text-xs font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    Special Price
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Key Specifications */}
        <div className="px-3 pb-3 h-20 flex items-center">
          {specs.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 w-full">
              {specs.slice(0, 2).map(([key, value], index) => (
                <div key={key} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 border border-gray-200 dark:border-slate-600">
                  <div className="text-xs text-gray-500 dark:text-slate-400 uppercase font-medium tracking-wide mb-1">
                    {key.length > 8 ? key.substring(0, 8) + '...' : key}
                  </div>
                  <div className="text-xs font-bold text-gray-900 dark:text-slate-100 line-clamp-1">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback info when no specs */
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 border border-gray-200 dark:border-slate-600">
                <div className="text-xs text-gray-500 dark:text-slate-400 uppercase font-medium tracking-wide mb-1">
                  CATEGORY
                </div>
                <div className="text-xs font-bold text-gray-900 dark:text-slate-100 capitalize">
                  {category}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 border border-gray-200 dark:border-slate-600">
                <div className="text-xs text-gray-500 dark:text-slate-400 uppercase font-medium tracking-wide mb-1">
                  UNIT
                </div>
                <div className="text-xs font-bold text-gray-900 dark:text-slate-100">
                  {product.unit || 'Piece'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto p-3 pt-2 pb-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCardClick}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-500 dark:to-orange-500 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center space-x-2"
            >
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Share button */}
            <button 
              onClick={handleShare}
              className="p-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProductCard;
