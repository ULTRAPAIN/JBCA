import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon,
  ShoppingBagIcon 
} from '@heroicons/react/24/outline';

const CartPage = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal,
    getCartCount 
  } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inputValues, setInputValues] = useState({});

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setLoading(true);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    setLoading(true);
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    setLoading(true);
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  const getEffectivePrice = (item) => {
    return item.price || 0;
  };

  const getItemTotal = (item) => {
    return getEffectivePrice(item) * item.quantity;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50 dark:from-slate-900 dark:to-slate-800 py-4 sm:py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <div className="mx-auto h-24 w-24 sm:h-32 sm:w-32 bg-gradient-to-br from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-xl dark:shadow-slate-900/50">
              <ShoppingBagIcon className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4 leading-tight">
              Your cart is <span className="text-red-600 dark:text-red-400">empty</span>
            </h2>
            <p className="text-sm sm:text-lg md:text-xl text-gray-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto leading-relaxed">
              Start shopping to add premium construction materials to your cart
            </p>
            <Link to="/products" className="w-full max-w-xs sm:max-w-none sm:w-auto">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 hover:from-yellow-500 hover:to-red-600 dark:hover:from-amber-500 dark:hover:to-orange-600 text-white font-bold px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl dark:shadow-slate-900/50 transform hover:scale-105 transition-all duration-200 rounded-lg"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50 dark:from-slate-900 dark:to-slate-800 py-4 sm:py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-2 sm:mb-4">
            Shopping <span className="text-red-600 dark:text-red-400">Cart</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-slate-300">
            ({cartCount} items) - Premium construction materials
          </p>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 mx-auto mt-2 sm:mt-4"></div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-12 space-y-6 lg:space-y-0">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-600 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 px-4 sm:px-6 lg:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl lg:text-lg font-bold text-white">Cart Items</h2>
              </div>
              <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200 dark:divide-slate-600">
                    {cartItems.map((item) => {
                      const effectivePrice = getEffectivePrice(item);
                      const itemTotal = getItemTotal(item);
                      const hasDiscount = user && (user.role === 'primary' || user.role === 'secondary') && item.product.prices;
                      
                      return (
                        <li key={item.product._id} className="py-4 sm:py-6 lg:py-6">
                          <div className="flex flex-col lg:flex-row lg:items-center hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 rounded-lg px-2 sm:px-4 lg:px-4 py-3 lg:py-4">
                            {/* Mobile Layout */}
                            <div className="flex lg:hidden w-full">
                              {/* Product Image and Basic Info */}
                              <div className="flex-shrink-0 w-20 h-20 border-2 border-yellow-200 dark:border-amber-400 rounded-lg overflow-hidden shadow-md dark:shadow-slate-900/30">
                                {item.product.images && item.product.images.length > 0 ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-full h-full object-center object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                    <span className="text-gray-500 dark:text-slate-400 text-xs font-medium">No Image</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="ml-3 flex-1">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                                  <Link to={`/products/${item.product._id}`} className="hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200">
                                    {item.product.name}
                                  </Link>
                                </h3>
                                <p className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                                  ₹{itemTotal.toFixed(2)}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                    ₹{effectivePrice.toFixed(2)}/{item.product.unit || 'unit'}
                                  </span>
                                  <span className="text-xs bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-400 px-2 py-1 rounded">
                                    {item.product.category}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Desktop/Laptop Layout */}
                            <div className="hidden lg:flex w-full lg:items-center lg:gap-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0 w-24 h-24 border-2 border-yellow-200 dark:border-amber-400 rounded-lg overflow-hidden shadow-md dark:shadow-slate-900/30">
                                {item.product.images && item.product.images.length > 0 ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-full h-full object-center object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                    <span className="text-gray-500 dark:text-slate-400 text-xs font-medium">No Image</span>
                                  </div>
                                )}
                              </div>

                              {/* Product Info - Takes up remaining space */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                                  <Link to={`/products/${item.product._id}`} className="hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200">
                                    {item.product.name}
                                  </Link>
                                </h3>
                                
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  {hasDiscount && item.product.prices && (
                                    <span className="text-sm text-gray-500 dark:text-slate-400 line-through bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                      ₹{(item.product.prices.registered || item.product.prices.standard || item.product.price).toFixed(2)}
                                    </span>
                                  )}
                                  <span className="text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                    ₹{effectivePrice.toFixed(2)} per {item.product.unit || 'unit'}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-block bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
                                    {item.product.category}
                                  </span>
                                  {hasDiscount && item.product.prices && (
                                    <span className="text-xs bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 text-white px-3 py-1 rounded-full font-bold shadow dark:shadow-slate-900/30">
                                      {user.role === 'primary' ? 'Primary' : 'Secondary'} Pricing
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Price Display */}
                              <div className="flex-shrink-0 text-right">
                                <p className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                                  ₹{itemTotal.toFixed(2)}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                                <div className="flex items-center space-x-1 bg-gray-50 dark:bg-slate-700 rounded-lg p-1.5">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                    disabled={loading || item.quantity <= 1}
                                    className="flex items-center justify-center p-1.5 rounded-md bg-white dark:bg-slate-600 border border-red-300 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm dark:shadow-slate-900/30"
                                  >
                                    <MinusIcon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                  </button>
                                  
                                  <input
                                    type="number"
                                    min="1"
                                    max={item.product.stock || 999}
                                    value={inputValues[item.product._id] !== undefined ? inputValues[item.product._id] : item.quantity}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setInputValues(prev => ({
                                        ...prev,
                                        [item.product._id]: value
                                      }));
                                      
                                      const newQuantity = parseInt(value);
                                      if (!isNaN(newQuantity) && newQuantity >= 1) {
                                        handleUpdateQuantity(item.product._id, newQuantity);
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const value = e.target.value;
                                      setInputValues(prev => {
                                        const newValues = { ...prev };
                                        delete newValues[item.product._id];
                                        return newValues;
                                      });
                                      
                                      if (value === '' || parseInt(value) < 1) {
                                        handleUpdateQuantity(item.product._id, 1);
                                      }
                                    }}
                                    className="text-gray-900 dark:text-slate-100 font-semibold text-base min-w-[2.5ch] w-12 text-center bg-white dark:bg-slate-600 px-1.5 py-1.5 rounded-md border border-gray-200 dark:border-slate-500 focus:border-blue-400 dark:focus:border-amber-400 focus:outline-none"
                                  />
                                  
                                  <button
                                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                    disabled={loading || item.quantity >= item.product.stock}
                                    className="flex items-center justify-center p-1.5 rounded-md bg-white dark:bg-slate-600 border border-green-300 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm dark:shadow-slate-900/30"
                                  >
                                    <PlusIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemoveItem(item.product._id)}
                                  disabled={loading}
                                  className="flex items-center justify-center space-x-1 font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-sm dark:shadow-slate-900/30 text-sm"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>

                            {/* Mobile Quantity Controls */}
                            <div className="flex items-center justify-between mt-3 lg:hidden">
                              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                  disabled={loading || item.quantity <= 1}
                                  className="flex items-center justify-center p-1.5 rounded-lg bg-white dark:bg-slate-600 border-2 border-red-300 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm dark:shadow-slate-900/30"
                                >
                                  <MinusIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                                </button>
                                
                                <input
                                  type="number"
                                  min="1"
                                  max={item.product.stock || 999}
                                  value={inputValues[item.product._id] !== undefined ? inputValues[item.product._id] : item.quantity}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setInputValues(prev => ({
                                      ...prev,
                                      [item.product._id]: value
                                    }));
                                    
                                    const newQuantity = parseInt(value);
                                    if (!isNaN(newQuantity) && newQuantity >= 1) {
                                      handleUpdateQuantity(item.product._id, newQuantity);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const value = e.target.value;
                                    setInputValues(prev => {
                                      const newValues = { ...prev };
                                      delete newValues[item.product._id];
                                      return newValues;
                                    });
                                    
                                    if (value === '' || parseInt(value) < 1) {
                                      handleUpdateQuantity(item.product._id, 1);
                                    }
                                  }}
                                  className="text-gray-900 dark:text-slate-100 font-bold text-base min-w-[3ch] w-12 text-center bg-white dark:bg-slate-600 px-1 py-1.5 rounded-lg border-2 border-gray-200 dark:border-slate-500 focus:border-blue-400 dark:focus:border-amber-400 focus:outline-none"
                                />
                                
                                <button
                                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                  disabled={loading || item.quantity >= item.product.stock}
                                  className="flex items-center justify-center p-1.5 rounded-lg bg-white dark:bg-slate-600 border-2 border-green-300 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400 dark:hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm dark:shadow-slate-900/30"
                                >
                                  <PlusIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveItem(item.product._id)}
                                disabled={loading}
                                className="ml-3 flex items-center justify-center space-x-1 font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-sm dark:shadow-slate-900/30 text-xs"
                              >
                                <TrashIcon className="h-3 w-3" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Clear Cart Button */}
              <div className="border-t-2 border-gray-200 dark:border-slate-600 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 bg-gray-50 dark:bg-slate-700">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={loading}
                  className="w-full text-red-600 dark:text-red-400 border-2 border-red-300 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-300 font-semibold py-2.5 lg:py-3 transition-all duration-200 text-sm lg:text-base"
                >
                  {loading ? <Loading size="sm" /> : 'Clear Cart'}
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-600 overflow-hidden lg:col-span-4 rounded-xl h-fit lg:sticky lg:top-6">
            <div className="bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 px-4 sm:px-6 lg:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl lg:text-lg font-bold text-white">Order Summary</h2>
            </div>
            
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-6">
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-200 dark:border-slate-600">
                  <dt className="text-base lg:text-lg font-medium text-gray-700 dark:text-slate-300">Subtotal</dt>
                  <dd className="text-base lg:text-lg font-bold text-gray-900 dark:text-slate-100">
                    ₹{cartTotal.toFixed(2)}
                  </dd>
                </div>

                {user && (user.role === 'primary' || user.role === 'secondary') && (
                  <div className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-amber-900/20 border-2 border-green-300 dark:border-green-400 rounded-lg p-3 lg:p-4 shadow-sm dark:shadow-slate-900/30">
                    <p className="text-xs lg:text-sm text-green-800 dark:text-green-300">
                      <span className="font-bold text-green-900 dark:text-green-200">
                        🎉 {user.role === 'primary' ? 'Primary' : 'Secondary'} Customer Discount Applied!
                      </span>
                      <br />
                      <span className="text-green-700 dark:text-green-300">You're saving with exclusive pricing rates.</span>
                    </p>
                  </div>
                )}

                <div className="border-t-2 border-yellow-200 dark:border-amber-400 pt-4 lg:pt-6">
                  <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-red-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 lg:p-4 rounded-lg">
                    <dt className="text-lg lg:text-xl font-bold text-gray-900 dark:text-slate-100">Order Total</dt>
                    <dd className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                      ₹{cartTotal.toFixed(2)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-6 border-t-2 border-gray-100 dark:border-slate-600">
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-red-500 dark:from-amber-400 dark:to-orange-500 hover:from-yellow-500 hover:to-red-600 dark:hover:from-amber-500 dark:hover:to-orange-600 text-white font-bold py-3 lg:py-4 text-base lg:text-lg shadow-lg hover:shadow-xl dark:shadow-slate-900/50 transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                {loading ? (
                  <Loading size="sm" text="Processing..." />
                ) : isAuthenticated ? (
                  '🛒 Proceed to Checkout'
                ) : (
                  '🔐 Login to Checkout'
                )}
              </Button>

              <div className="mt-4 lg:mt-6 flex justify-center text-xs lg:text-sm text-center text-gray-500 dark:text-slate-400">
                <p>
                  or{' '}
                  <Link to="/products" className="text-red-600 dark:text-red-400 font-semibold hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200">
                    Continue Shopping
                    <span aria-hidden="true"> →</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
