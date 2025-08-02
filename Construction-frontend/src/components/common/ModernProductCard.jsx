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
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer overflow-hidden border border-gray-100 h-80 sm:h-96 lg:h-[28rem] xl:h-96 flex flex-col"
      onClick={handleCardClick}
    >
      {/* Product Type Badge */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg flex items-center space-x-1">
          <span className="text-xs sm:text-sm">{getCategoryIcon(category)}</span>
          <span className="capitalize text-xs sm:text-sm hidden sm:inline">{category}</span>
        </div>
      </div>

      {/* Product Image - Responsive Height */}
      <div className="relative h-48 sm:h-56 lg:h-64 xl:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 bg-white"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
              <div className="text-6xl mb-2">🏗️</div>
              <span className="text-gray-500 text-sm">Product Image</span>
            </div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Product Title Only - Simplified */}
      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-center">
        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 text-center line-clamp-2 px-1">
          {product.name}
        </h3>
      </div>

      {/* Hover Information Panel - Responsive Height and Positioning */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-red-900 via-red-800 to-orange-700 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out p-3 sm:p-4 h-64 sm:h-72 lg:h-80 xl:h-72">
        {/* Product Name in Hover */}
        <h4 className="text-base sm:text-lg font-bold mb-2 text-center line-clamp-1">{product.name}</h4>
        
        {/* Description in Hover */}
        <p className="text-red-100 text-xs sm:text-sm mb-2 sm:mb-3 text-center line-clamp-2">
          {product.description}
        </p>

        {/* Product Properties/Specifications Grid - Enhanced */}
        {specs.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
            {specs.slice(0, 3).map(([key, value], index) => (
              <div key={key} className="text-center">
                <div className="bg-white/25 backdrop-blur-sm rounded-lg p-1 sm:p-2 hover:bg-white/30 transition-all duration-200 min-h-[60px] sm:min-h-[80px] flex flex-col justify-center">
                  {/* Icon based on specification type */}
                  <div className="text-sm sm:text-xl mb-0.5 sm:mb-1">
                    {key.toLowerCase().includes('strength') ? '💪' : 
                     key.toLowerCase().includes('density') ? '📦' : 
                     key.toLowerCase().includes('leak') || key.toLowerCase().includes('proof') ? '🛡️' : 
                     key.toLowerCase().includes('grade') ? '⭐' : 
                     key.toLowerCase().includes('size') || key.toLowerCase().includes('diameter') ? '📏' : 
                     key.toLowerCase().includes('length') ? '📏' : 
                     key.toLowerCase().includes('weight') || key.toLowerCase().includes('pack') ? '⚖️' : 
                     key.toLowerCase().includes('type') ? '🏷️' : '⚡'}
                  </div>
                  <div className="text-xs font-semibold text-red-100 mb-0.5 sm:mb-1 line-clamp-1">
                    {key}
                  </div>
                  <div className="text-xs text-white font-bold line-clamp-1">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback when no specifications available */
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
            <div className="text-center">
              <div className="bg-white/25 backdrop-blur-sm rounded-lg p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-xl mb-0.5 sm:mb-1">{getCategoryIcon(category)}</div>
                <div className="text-xs font-semibold text-red-100 mb-0.5 sm:mb-1">Category</div>
                <div className="text-xs text-white font-bold capitalize">{category}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/25 backdrop-blur-sm rounded-lg p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-xl mb-0.5 sm:mb-1">📦</div>
                <div className="text-xs font-semibold text-red-100 mb-0.5 sm:mb-1">Unit</div>
                <div className="text-xs text-white font-bold">{product.unit || 'Piece'}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/25 backdrop-blur-sm rounded-lg p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] flex flex-col justify-center">
                <div className="text-sm sm:text-xl mb-0.5 sm:mb-1">✨</div>
                <div className="text-xs font-semibold text-red-100 mb-0.5 sm:mb-1">Quality</div>
                <div className="text-xs text-white font-bold">Premium</div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Properties indicator */}
        {specs.length > 3 && (
          <div className="text-center mb-2 sm:mb-3">
            <span className="text-xs text-red-200 bg-white/20 px-2 py-1 rounded-full">
              +{specs.length - 3} more properties
            </span>
          </div>
        )}

        {/* View Detail Button - Always visible at bottom */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
          <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm">
            View Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernProductCard;
