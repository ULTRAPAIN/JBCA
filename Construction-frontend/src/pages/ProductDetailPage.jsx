import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  MinusIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getUserPriceTier, user, isAdmin } = useAuth();
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const priceTier = getUserPriceTier();
  const currentQuantity = product ? getItemQuantity(product._id) : 0;

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.getById(id);
      
      // Backend returns: { success: true, data: { product: productData } }
      let productData = response.data.data?.product || response.data.product || response.data.data || response.data;
      
      if (!productData) {
        throw new Error('No product data found in response');
      }
      
      if (!productData._id && !productData.id) {
        throw new Error('Product data missing ID field');
      }
      
      setProduct(productData);
    } catch (err) {
      console.error('Error fetching product:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 404) {
        setError(`Product with ID "${id}" not found`);
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load product details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await productsAPI.getAll({ 
        category: product.category, 
        limit: 4,
        exclude: product._id 
      });
      setRelatedProducts(response.data.data.products || []);
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    if (!product || !product.prices) {
      console.error('Product data not available');
      return;
    }

    setIsAddingToCart(true);
    try {
      const price = priceTier === 'admin' 
        ? (product.prices?.registered || product.price || 0)
        : (product.prices?.[priceTier] || product.prices?.registered || product.price || 0);
      
      if (!price) {
        console.error('Price not available for selected tier');
        return;
      }
      await addToCart(product, quantity, price);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 0 && product?._id) {
      updateQuantity(product._id, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getDiscount = () => {
    if (!product || !product.prices) return 0;
    
    // Admin users see regular price - no discount
    if (priceTier === 'admin' || priceTier === 'standard') return 0;
    
    const standardPrice = product.prices?.registered || product.prices?.standard || product.price || 0;
    const currentPrice = product.prices?.[priceTier] || 0;
    
    if (!standardPrice || !currentPrice || currentPrice >= standardPrice) return 0;
    
    return ((standardPrice - currentPrice) / standardPrice) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-20">
            <Loading size="lg" text="Loading product details..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle different price structures
  const price = priceTier === 'admin' 
    ? (product?.prices?.registered || product?.price || 0)
    : (product?.prices?.[priceTier] || product?.prices?.registered || product?.price || 0);
  const discount = getDiscount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile-Optimized Breadcrumb */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <nav className="flex items-center space-x-1 xs:space-x-2 text-xs xs:text-sm text-gray-600 dark:text-slate-400 overflow-hidden">
            <Link to="/" className="hover:text-red-600 dark:hover:text-amber-400 transition-colors duration-200 truncate">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="hover:text-red-600 dark:hover:text-amber-400 transition-colors duration-200 truncate">Products</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-slate-100 font-medium truncate">
              {product?.name || 'Product Details'}
            </span>
          </nav>
        </div>

        {/* Mobile-Optimized Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-sm xs:text-base px-3 py-2 xs:px-4 xs:py-2"
            size="sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Mobile-First Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-4">
            {/* Main Image - Better mobile aspect ratio */}
            <div className="aspect-square xs:aspect-[4/3] sm:aspect-square bg-white dark:bg-slate-800 rounded-lg xs:rounded-xl shadow-lg dark:shadow-slate-900/30 overflow-hidden border border-gray-200 dark:border-slate-600 transition-colors duration-300">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain xs:object-cover p-2 xs:p-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-700">
                  <span className="text-gray-400 dark:text-slate-500 text-4xl xs:text-5xl sm:text-6xl">📦</span>
                </div>
              )}
            </div>

            {/* Image Thumbnails - Mobile Responsive */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 xs:space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index 
                        ? 'border-yellow-400 dark:border-amber-400 shadow-md scale-105' 
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6">
            {/* Category Badge - Mobile Friendly */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 xs:px-3 xs:py-1 rounded-full text-xs xs:text-sm font-semibold bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-500 dark:to-orange-500 text-white">
                {product.category}
              </span>
            </div>

            {/* Product Title - Mobile Typography */}
            <div>
              <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2 leading-tight">
                {product?.name || 'Product Name Not Available'}
              </h1>
              <div className="w-16 xs:w-20 sm:w-24 h-0.5 xs:h-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500"></div>
            </div>

            {/* Product Description - Mobile Optimized */}
            <div className="prose prose-sm xs:prose-base dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-sm xs:text-base sm:text-lg">
                {product?.description || 'Product description not available.'}
              </p>
            </div>

            {/* Pricing - Mobile Layout */}
            <div className="bg-white dark:bg-slate-800 rounded-lg xs:rounded-xl shadow-lg dark:shadow-slate-900/30 p-4 xs:p-6 border border-gray-200 dark:border-slate-600 transition-colors duration-300">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 mb-4">
                <div className="flex flex-col xs:flex-row xs:items-baseline xs:space-x-2">
                  <span className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100">
                    {formatPrice(price)}
                  </span>
                  <span className="text-gray-600 dark:text-slate-400 text-sm xs:text-base sm:text-lg">per {product?.unit || 'unit'}</span>
                </div>
                {discount > 0 && (priceTier === 'primary' || priceTier === 'secondary') && (
                  <div className="flex flex-col xs:items-end">
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 xs:px-3 xs:py-1 rounded-full text-xs xs:text-sm font-bold mb-1 xs:mb-2 w-fit">
                      {discount.toFixed(0)}% OFF
                    </div>
                    <span className="text-gray-500 dark:text-slate-400 text-sm xs:text-base sm:text-lg line-through">
                      {formatPrice(product.prices?.registered || product.prices?.standard || product.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Special Pricing Message */}
              {isAuthenticated && priceTier !== 'standard' && priceTier !== 'admin' && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-amber-600 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckBadgeIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-amber-800 dark:text-amber-200 font-semibold">
                      {priceTier === 'primary' ? '🏆 Primary Customer Pricing Active' : '⭐ Secondary Customer Pricing Active'}
                    </span>
                  </div>
                </div>
              )}

              {/* Admin Access Message */}
              {isAuthenticated && priceTier === 'admin' && (
                <div className="bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-900/20 dark:to-amber-900/20 border border-red-200 dark:border-red-600 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckBadgeIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-200 font-semibold">
                      🔧 Administrator Access - Full Product Information
                    </span>
                  </div>
                </div>
              )}

              {!isAuthenticated && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">🔐 Login to see personalized pricing and place orders</p>
                </div>
              )}
            </div>

            {/* Stock Status - Mobile Optimized - Only show to admins */}
            {isAdmin() && (
              <div>
                {product?.availability && product?.stock > 0 ? (
                  <div className="flex items-center space-x-2 xs:space-x-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-lg p-3 xs:p-4">
                    <div className="w-2 h-2 xs:w-3 xs:h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="text-green-800 dark:text-green-200 font-semibold text-sm xs:text-base sm:text-lg leading-tight">
                      In Stock ({product.stock} {product?.unit || 'unit'}s available)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 xs:space-x-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg p-3 xs:p-4">
                    <div className="w-2 h-2 xs:w-3 xs:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-red-800 dark:text-red-200 font-semibold text-sm xs:text-base sm:text-lg leading-tight">Out of Stock</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Mobile Optimized */}
            <div className="bg-white dark:bg-slate-800 rounded-lg xs:rounded-xl shadow-lg dark:shadow-slate-900/30 p-4 xs:p-6 border border-gray-200 dark:border-slate-600 transition-colors duration-300">
              {(isAdmin() ? (product?.availability && product?.stock > 0) : product?.availability) ? (
                currentQuantity > 0 ? (
                  // Already in cart - show quantity controls and share - Mobile Optimized
                  <div className="space-y-3 xs:space-y-4">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 p-3 xs:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-600 rounded-lg">
                      <span className="font-semibold text-green-800 dark:text-green-200 text-sm xs:text-base">In Cart:</span>
                      <div className="flex items-center justify-center xs:justify-end space-x-2 xs:space-x-3">
                        <button
                          onClick={() => handleQuantityChange(currentQuantity - 1)}
                          className="p-2 xs:p-2.5 rounded-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="h-4 w-4 xs:h-5 xs:w-5 text-red-600 dark:text-red-400" />
                        </button>
                        <span className="px-3 xs:px-4 py-2 xs:py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg font-bold text-gray-800 dark:text-slate-100 min-w-[50px] xs:min-w-[60px] text-center text-sm xs:text-base">
                          {currentQuantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(currentQuantity + 1)}
                          className="p-2 xs:p-2.5 rounded-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="h-4 w-4 xs:h-5 xs:w-5 text-green-600 dark:text-green-400" />
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product?.name || 'Product',
                            text: `Check out this product: ${product?.name || 'Product'}`,
                            url: window.location.href,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(window.location.href).then(() => {
                            alert('Product link copied to clipboard!');
                          }).catch(() => {
                            prompt('Copy this link:', window.location.href);
                          });
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-3 xs:py-3 px-4 xs:px-6 touch-manipulation"
                    >
                      <ShareIcon className="h-4 w-4 xs:h-5 xs:w-5" />
                      <span className="text-sm xs:text-base">Share Product</span>
                    </Button>
                  </div>
                ) : (
                  // Not in cart - show add to cart form - Mobile Optimized
                  <div className="space-y-3 xs:space-y-4">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4 p-3 xs:p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <label className="font-semibold text-gray-800 dark:text-slate-200 text-sm xs:text-base">Quantity:</label>
                      <div className="flex items-center justify-center xs:justify-end space-x-2 xs:space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-2 xs:p-2.5 rounded-full bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 touch-manipulation"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={isAdmin() ? (product?.stock || 999) : 999}
                          value={inputValue !== '' ? inputValue : quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            setInputValue(value);
                            const newQuantity = parseInt(value);
                            if (!isNaN(newQuantity) && newQuantity >= 1) {
                              setQuantity(newQuantity);
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            setInputValue('');
                            if (value === '' || parseInt(value) < 1) {
                              setQuantity(1);
                            }
                          }}
                          className="w-16 xs:w-20 px-2 xs:px-3 py-2 text-center border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-yellow-400 dark:focus:ring-amber-400 focus:border-yellow-400 dark:focus:border-amber-400 font-semibold text-sm xs:text-base touch-manipulation"
                        />
                        <button
                          onClick={() => setQuantity(isAdmin() ? Math.min(product?.stock || 999, quantity + 1) : quantity + 1)}
                          className="p-2 xs:p-2.5 rounded-full bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 touch-manipulation"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col xs:flex-row gap-3 xs:space-x-3">
                      <Button 
                        onClick={handleAddToCart}
                        loading={isAddingToCart}
                        disabled={!isAuthenticated}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-500 dark:to-orange-500 hover:from-yellow-500 hover:to-red-600 dark:hover:from-amber-600 dark:hover:to-orange-600 text-white font-bold py-3 xs:py-3 px-4 xs:px-6 text-base xs:text-lg shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation flex items-center justify-center"
                      >
                        <ShoppingCartIcon className="h-4 w-4 xs:h-5 xs:w-5 mr-2" />
                        <span className="truncate">{isAuthenticated ? 'Add to Cart' : 'Login to Purchase'}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: product?.name || 'Product',
                              text: `Check out this product: ${product?.name || 'Product'}`,
                              url: window.location.href,
                            }).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(window.location.href).then(() => {
                              alert('Product link copied to clipboard!');
                            }).catch(() => {
                              prompt('Copy this link:', window.location.href);
                            });
                          }
                        }}
                        className="xs:flex-none px-3 xs:px-4 py-3 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 touch-manipulation flex items-center justify-center"
                        aria-label="Share product"
                      >
                        <ShareIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                // Out of stock - only show to admins - Mobile Optimized
                isAdmin() && (
                  <div className="space-y-3 xs:space-y-4">
                    <div className="p-3 xs:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg text-center">
                      <span className="text-red-800 dark:text-red-200 font-semibold text-sm xs:text-base">This product is currently out of stock</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product?.name || 'Product',
                            text: `Check out this product: ${product?.name || 'Product'}`,
                            url: window.location.href,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(window.location.href).then(() => {
                            alert('Product link copied to clipboard!');
                          }).catch(() => {
                            prompt('Copy this link:', window.location.href);
                          });
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-3 xs:py-3 px-4 xs:px-6 touch-manipulation"
                    >
                      <ShareIcon className="h-4 w-4 xs:h-5 xs:w-5" />
                      <span className="text-sm xs:text-base">Share Product</span>
                    </Button>
                  </div>
                )
              )}
            </div>

            {/* Features - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-4">
              <div className="text-center p-2 xs:p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors duration-300">
                <TruckIcon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-yellow-600 dark:text-amber-400 mx-auto mb-1 xs:mb-2" />
                <p className="text-xs xs:text-sm font-semibold text-gray-800 dark:text-slate-200 leading-tight">Fast Delivery</p>
              </div>
              <div className="text-center p-2 xs:p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors duration-300">
                <ShieldCheckIcon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-red-600 dark:text-red-400 mx-auto mb-1 xs:mb-2" />
                <p className="text-xs xs:text-sm font-semibold text-gray-800 dark:text-slate-200 leading-tight">Quality Assured</p>
              </div>
              <div className="text-center p-2 xs:p-3 sm:p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors duration-300">
                <StarIcon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-gray-600 dark:text-slate-400 mx-auto mb-1 xs:mb-2" />
                <p className="text-xs xs:text-sm font-semibold text-gray-800 dark:text-slate-200 leading-tight">Top Rated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications - Mobile Optimized */}
        {product?.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6 lg:mb-8">
              Product <span className="text-red-600 dark:text-amber-400">Specifications</span>
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-lg xs:rounded-xl shadow-lg dark:shadow-slate-900/30 p-4 xs:p-6 sm:p-8 border border-gray-200 dark:border-slate-600 transition-colors duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex flex-col xs:flex-row xs:justify-between xs:items-center p-3 xs:p-4 bg-gray-50 dark:bg-slate-700 rounded-lg gap-1 xs:gap-0">
                    <span className="font-semibold text-gray-800 dark:text-slate-200 capitalize text-sm xs:text-base">{key}:</span>
                    <span className="text-gray-700 dark:text-slate-300 font-medium text-sm xs:text-base break-words">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Products - Horizontal Scrolling Mobile Optimized */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
                Related <span className="text-red-600 dark:text-amber-400">Products</span>
              </h2>
              
              {/* Scroll Controls - Hidden on mobile, visible on larger screens */}
              <div className="hidden sm:flex space-x-1">
                <button
                  onClick={() => {
                    const container = document.getElementById('related-products-scroll');
                    if (container) {
                      container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
                  aria-label="Scroll left"
                >
                  <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('related-products-scroll');
                    if (container) {
                      container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
                  aria-label="Scroll right"
                >
                  <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
            
            {/* Horizontal Scrolling Container */}
            <div 
              id="related-products-scroll"
              className="flex overflow-x-auto space-x-3 xs:space-x-4 sm:space-x-6 pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitScrollbar: { display: 'none' }
              }}
            >
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  key={relatedProduct._id} 
                  to={`/products/${relatedProduct._id}`}
                  className="group flex-none w-48 xs:w-56 sm:w-64 lg:w-72 bg-white dark:bg-slate-800 rounded-lg xs:rounded-xl shadow-lg dark:shadow-slate-900/30 hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-slate-600 overflow-hidden touch-manipulation snap-start"
                >
                  {/* Optimized Image Container */}
                  <div className="aspect-square bg-gray-100 dark:bg-slate-700 overflow-hidden relative">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-contain xs:object-cover p-2 xs:p-0 group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 dark:text-slate-500 text-3xl xs:text-4xl">📦</span>
                      </div>
                    )}
                    
                    {/* Quick view indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-800 dark:text-slate-200 p-1.5 rounded-full shadow-lg">
                        <EyeIcon className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-3 xs:p-4">
                    <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors duration-300 text-sm xs:text-base leading-tight">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-base xs:text-lg font-bold text-gray-800 dark:text-slate-200">
                      {formatPrice(
                        priceTier === 'admin' 
                          ? (relatedProduct?.prices?.primary || relatedProduct?.prices?.secondary || relatedProduct?.prices?.standard || relatedProduct?.price || 0)
                          : (relatedProduct?.prices?.[priceTier] || relatedProduct?.prices?.standard || relatedProduct?.price || 0)
                      )}
                    </p>
                    
                    {/* Category Badge */}
                    {relatedProduct.category && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded-full">
                          {relatedProduct.category}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              
              {/* View All Products Card */}
              <Link 
                to="/products"
                className="group flex-none w-48 xs:w-56 sm:w-64 lg:w-72 bg-gradient-to-br from-yellow-50 to-red-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-dashed border-yellow-300 dark:border-amber-600 rounded-lg xs:rounded-xl transition-all duration-300 transform hover:scale-105 touch-manipulation snap-start flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-16 h-16 bg-yellow-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-200 dark:group-hover:bg-amber-800/50 transition-colors duration-300">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-red-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                  View All Products
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Explore our complete catalog
                </p>
              </Link>
            </div>
            
            {/* Mobile scroll indicator */}
            <div className="sm:hidden flex justify-center mt-2">
              <div className="flex space-x-1">
                {relatedProducts.slice(0, 4).map((_, index) => (
                  <div key={index} className="w-2 h-2 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
