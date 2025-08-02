import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline';

const ProductInfoCard = ({ product }) => {
  const { isAuthenticated, getUserPriceTier } = useAuth();
  
  const priceTier = getUserPriceTier();
  const price = product.prices[priceTier];
  const discount = priceTier !== 'registered' ? product.prices.registered - price : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getRoleDiscount = () => {
    const registeredPrice = product.prices.registered;
    const currentPrice = price;
    const discountPercent = ((registeredPrice - currentPrice) / registeredPrice) * 100;
    return discountPercent > 0 ? discountPercent.toFixed(0) : 0;
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-102 border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Discount Badge */}
      {isAuthenticated && priceTier !== 'registered' && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            {getRoleDiscount()}% OFF
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-3xl">📦</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
        
        {/* View Details Button - Appears on Hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Link 
            to={`/products/${product._id}`}
            className="bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
          {product.name}
        </h3>

        {/* Product Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Specifications - Compact */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price Section - Compact */}
        <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold text-gray-800">
                {formatPrice(price)}
              </span>
              <span className="text-gray-600 text-xs font-medium">
                /{product.unit}
              </span>
            </div>
            {discount > 0 && (
              <span className="text-gray-500 text-xs line-through">
                {formatPrice(product.prices.registered)}
              </span>
            )}
          </div>
          
          {/* Special Pricing Badge - Compact */}
          {isAuthenticated && priceTier !== 'registered' && (
            <div className="flex items-center space-x-1 mt-1">
              <CheckBadgeIcon className="h-3 w-3 text-amber-600" />
              <span className="text-amber-700 text-xs font-medium">
                {priceTier === 'primary' ? 'Primary pricing' : 'Secondary pricing'}
              </span>
            </div>
          )}
          
          {/* Guest User Message - Compact */}
          {!isAuthenticated && (
            <div className="flex items-center space-x-1 text-amber-700 text-xs mt-1">
              <ClockIcon className="h-3 w-3" />
              <span className="font-medium">Login for better pricing</span>
            </div>
          )}
        </div>

        {/* Stock Status - Compact */}
        <div className="mb-3">
          {product.availability && product.stock > 0 ? (
            <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded text-green-700 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">In Stock ({product.stock})</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-red-50 px-2 py-1 rounded text-red-700 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* View Product Button - Compact */}
        <Link to={`/products/${product._id}`}>
          <button className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm">
            <EyeIcon className="h-4 w-4" />
            <span>View Details</span>
          </button>
        </Link>

        {/* Additional Info for Non-authenticated Users - Compact */}
        {!isAuthenticated && (
          <div className="text-center mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs font-medium">
              🏷️ Register for special pricing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfoCard;
