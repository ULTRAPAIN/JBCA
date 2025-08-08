import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, deliveryZonesAPI } from '../services/api';
import orderService from '../services/orderService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import OpenStreetMapPicker from '../components/maps/OpenStreetMapPicker';
import { 
  CreditCardIcon,
  BanknotesIcon,
  TruckIcon,
  CheckCircleIcon,
  MapPinIcon,
  GlobeAltIcon,
  MapIcon,
  XCircleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryZones, setDeliveryZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  
  const [orderData, setOrderData] = useState({
    deliveryAddress: user?.address || '',
    phone: user?.phone || '',
    paymentMethod: 'cod',
    notes: '',
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    fetchDeliveryZones();
  }, [cartItems, navigate]);

  useEffect(() => {
    if (selectedZone) {
      const zone = deliveryZones.find(z => z._id === selectedZone);
      console.log('setDeliveryFee debug - Zone found:', zone);
      const feeValue = zone ? (zone.deliveryCharge || zone.deliveryFee || 0) : 0;
      console.log('setDeliveryFee debug - Fee value:', feeValue, 'Is valid number:', Number.isFinite(feeValue));
      setDeliveryFee(Number(feeValue) || 0);
    }
  }, [selectedZone, deliveryZones]);

  const fetchDeliveryZones = async () => {
    try {
      const response = await deliveryZonesAPI.getAll();
      const zones = response.data.data || response.data;
      setDeliveryZones(zones);
      
      // Auto-select the first active zone
      if (zones && zones.length > 0 && !selectedZone) {
        const firstActiveZone = zones.find(z => z.isActive) || zones[0];
        setSelectedZone(firstActiveZone._id);
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      // Fallback to default delivery zones if API is not available
      const defaultZones = [
        {
          _id: 'zone1',
          name: 'Kalher',
          area: 'Kalher', 
          pincode: '421302',
          deliveryCharge: 60,
          estimatedDeliveryDays: 0,
          isActive: true
        },
        {
          _id: 'zone2', 
          name: 'Kasheli',
          area: 'Kasheli',
          pincode: '421302', 
          deliveryCharge: 60,
          estimatedDeliveryDays: 0,
          isActive: true
        },
        {
          _id: 'zone3',
          name: 'Dapoda',
          area: 'Dapoda',
          pincode: '421302',
          deliveryCharge: 75,
          estimatedDeliveryDays: 0,
          isActive: true
        },
        {
          _id: 'zone4',
          name: 'Purna',
          area: 'Purna',
          pincode: '421302',
          deliveryCharge: 70,
          estimatedDeliveryDays: 0,
          isActive: true
        }
      ];
      setDeliveryZones(defaultZones);
      
      // Auto-select the first zone as fallback
      if (!selectedZone) {
        setSelectedZone('zone1');
      }
      
      console.log('Using fallback delivery zones');
    }
  };

  const handleInputChange = (e) => {
    setOrderData({
      ...orderData,
      [e.target.name]: e.target.value,
    });
  };

  const handleZoneChange = (e) => {
    setSelectedZone(e.target.value);
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Use Nominatim (OpenStreetMap) for reverse geocoding - free service
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            const locationData = {
              lat: latitude,
              lng: longitude,
              address: data.display_name
            };
            setSelectedMapLocation(locationData);
            setOrderData(prev => ({
              ...prev,
              deliveryAddress: data.display_name,
              coordinates: { lat: latitude, lng: longitude }
            }));
          } else {
            // Fallback - just set coordinates
            const locationData = {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            };
            setSelectedMapLocation(locationData);
            setOrderData(prev => ({
              ...prev,
              coordinates: { lat: latitude, lng: longitude }
            }));
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          // Still set coordinates even if address lookup fails
          const locationData = {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          setSelectedMapLocation(locationData);
          setOrderData(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude }
          }));
        }
        
        // Auto-check delivery availability for current location
        if (selectedMapLocation) {
          checkDeliveryAvailability(selectedMapLocation);
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location. Please enter address manually.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  const handleMapLocationSelect = (locationData) => {
    setSelectedMapLocation(locationData);
    setCoordinates({ lat: locationData.lat, lng: locationData.lng });
    setOrderData(prev => ({
      ...prev,
      deliveryAddress: locationData.address,
      coordinates: { lat: locationData.lat, lng: locationData.lng }
    }));
    
    // Auto-check delivery availability and suggest zone
    checkDeliveryAvailability(locationData);
    setShowMapPicker(false);
  };

  const openMapPicker = () => {
    setShowMapPicker(true);
  };

  const closeMapPicker = () => {
    setShowMapPicker(false);
  };

  const checkDeliveryAvailability = async (location) => {
    // Check if delivery is available to the selected location
    try {
      if (deliveryZones.length > 0) {
        // Simple distance-based zone selection logic
        // In a real implementation, you would check coordinates against zone boundaries
        
        // For demonstration, auto-select a zone based on basic logic
        let suggestedZone = deliveryZones[0]; // Default to first zone
        
        // Simple heuristic - you can enhance this with proper geofencing
        if (location.address && typeof location.address === 'string') {
          const address = location.address.toLowerCase();
          
          // Check for keywords to suggest appropriate zones
          if (address.includes('center') || address.includes('downtown') || address.includes('main')) {
            suggestedZone = deliveryZones.find(z => z.name && z.name.toLowerCase().includes('center')) || deliveryZones[0];
          } else if (address.includes('suburb') || address.includes('outskirt') || address.includes('outer')) {
            suggestedZone = deliveryZones.find(z => z.name && z.name.toLowerCase().includes('suburb')) || deliveryZones[1] || deliveryZones[0];
          } else {
            // Default to extended region for unknown areas
            suggestedZone = deliveryZones.find(z => z.name && z.name.toLowerCase().includes('extended')) || deliveryZones[2] || deliveryZones[0];
          }
        }
        
        if (suggestedZone && suggestedZone.isActive) {
          setSelectedZone(suggestedZone._id);
          setError('');
          
          // Show a helpful message about the suggested zone
          setTimeout(() => {
            setError(`Delivery zone "${suggestedZone.name || suggestedZone.area || 'Selected'}" has been auto-selected for your location. You can change it if needed.`);
            setTimeout(() => setError(''), 5000); // Clear after 5 seconds
          }, 500);
        } else {
          setError('Delivery not available to this location. Please contact us for custom delivery options.');
        }
      }
    } catch (err) {
      console.error('Error checking delivery availability:', err);
      setError('Unable to check delivery availability. Please select a delivery zone manually.');
    }
  };

  const getEffectivePrice = (product) => {
    if (!product) {
      console.warn('getEffectivePrice: Product is null or undefined');
      return 0;
    }
    
    // Check for different possible price field names and handle various pricing structures
    if (!user) {
      const price = product.prices?.registered || product.price || 0;
      console.log('getEffectivePrice: No user, returning price:', price, 'for product:', product.name);
      return Number(price) || 0;
    }
    
    // Role-based pricing logic
    let effectivePrice = 0;
    switch (user.role) {
      case 'admin':
        effectivePrice = product.prices?.registered || product.price || 0;
        break;
      case 'primary':
        effectivePrice = product.prices?.primary || product.prices?.registered || product.price || 0;
        break;
      case 'secondary':
        effectivePrice = product.prices?.secondary || product.prices?.registered || product.price || 0;
        break;
      default:
        effectivePrice = product.prices?.registered || product.price || 0;
        break;
    }
    
    const finalPrice = Number(effectivePrice) || 0;
    console.log('getEffectivePrice: User role:', user.role, 'Product:', product.name, 'Price:', finalPrice, 'Raw price data:', product.prices);
    return finalPrice;
  };

  const getItemTotal = (item) => {
    if (!item || !item.product || typeof item.quantity !== 'number') {
      console.warn('getItemTotal: Invalid item data:', item);
      return 0;
    }
    const price = getEffectivePrice(item.product);
    const total = price * item.quantity;
    console.log('getItemTotal: Product:', item.product.name, 'Price:', price, 'Quantity:', item.quantity, 'Total:', total);
    return Number(total) || 0;
  };

  const validateForm = () => {
    if (!orderData.deliveryAddress.trim()) {
      setError('Delivery address is required');
      return false;
    }
    if (!orderData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!selectedZone) {
      setError('Please select a delivery zone');
      return false;
    }
    if (!/^[0-9]{10}$/.test(orderData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const subtotal = calculateSubtotal();
      const total = subtotal + deliveryFee;

      // Validate totals before proceeding
      if (!subtotal || isNaN(subtotal) || subtotal <= 0) {
        throw new Error('Invalid subtotal calculated. Please check your cart items.');
      }
      
      if (!total || isNaN(total) || total <= 0) {
        throw new Error('Invalid total amount calculated.');
      }
      
      console.log('CheckoutPage: Calculated totals - Subtotal:', subtotal, 'Delivery Fee:', deliveryFee, 'Total:', total);

      // Prepare order data for the backend API
      const submitOrderData = {
        items: cartItems
          .filter(item => item && item.product && item.product._id)
          .map(item => {
            const priceAtPurchase = getEffectivePrice(item.product);
            const itemTotal = getItemTotal(item);
            
            // Validate that we have valid numbers
            if (!priceAtPurchase || isNaN(priceAtPurchase) || priceAtPurchase <= 0) {
              console.error('Invalid priceAtPurchase for item:', item.product.name, priceAtPurchase);
              throw new Error(`Invalid price for product: ${item.product.name}`);
            }
            
            if (!itemTotal || isNaN(itemTotal) || itemTotal <= 0) {
              console.error('Invalid itemTotal for item:', item.product.name, itemTotal);
              throw new Error(`Invalid total for product: ${item.product.name}`);
            }
            
            return {
              product: item.product._id,
              quantity: item.quantity,
              priceAtPurchase: priceAtPurchase,
              total: itemTotal,
            };
          }),
        totalAmount: total,
        shippingAddress: {
          street: orderData.deliveryAddress,
          area: deliveryZones.find(z => z._id === selectedZone)?.area || '',
          city: 'Bhiwandi',
          state: 'Maharashtra',
          pincode: deliveryZones.find(z => z._id === selectedZone)?.pincode || '421302',
          country: 'India',
          ...(coordinates && {
            coordinates: {
              lat: coordinates.lat,
              lng: coordinates.lng
            }
          })
        },
        notes: orderData.notes || '',
        paymentMethod: orderData.paymentMethod || 'Cash on Delivery'
      };
      
      console.log('CheckoutPage: Prepared order data:', submitOrderData);

      // Create order using local service
      const createdOrder = await orderService.createOrder(submitOrderData);
      console.log('CheckoutPage: Created order response:', createdOrder);
      
      // Extract order ID - handle different response structures
      const orderId = createdOrder.orderNumber || createdOrder._id || createdOrder.id || 'Unknown';
      
      // Clear cart after successful order
      await clearCart();
      
      // Show success message and redirect
      alert(`Order ${orderId} placed successfully! Your order is now with the admin for processing.`);
      navigate('/orders', { 
        state: { newOrder: true, orderId: orderId } 
      });
      
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error('Order placement error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals with user-specific pricing
  const calculateSubtotal = () => {
    const validItems = cartItems.filter(item => item && item.product && item.product._id);
    console.log('calculateSubtotal: Valid cart items:', validItems.length);
    
    const subtotal = validItems.reduce((total, item) => {
      const itemTotal = getItemTotal(item);
      console.log('calculateSubtotal: Adding item total:', itemTotal, 'Running total:', total + itemTotal);
      return total + itemTotal;
    }, 0);
    
    console.log('calculateSubtotal: Final subtotal:', subtotal);
    return Number(subtotal) || 0;
  };

  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee;
  
  // Debug total calculation
  console.log('Final total calculation debug:', {
    subtotal,
    deliveryFee,
    total,
    isSubtotalValid: Number.isFinite(subtotal),
    isDeliveryFeeValid: Number.isFinite(deliveryFee),
    isTotalValid: Number.isFinite(total)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-4 sm:py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-amber-400 dark:to-orange-500 bg-clip-text text-transparent mb-2 sm:mb-4">
              Checkout
            </h1>
            <p className="text-gray-600 dark:text-slate-300 text-base sm:text-lg">Complete your order and get your materials delivered</p>
          </div>

          <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start space-y-6 lg:space-y-0">
            {/* Order Form */}
            <div className="space-y-6 sm:space-y-8">
              {/* Delivery Information */}
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-600 p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 sm:mb-8 flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-amber-400 dark:to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                    <TruckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  Delivery Information
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Delivery Address *
                      </label>
                    </div>
                    <textarea
                      name="deliveryAddress"
                      value={orderData.deliveryAddress}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Enter your complete delivery address or use location picker"
                      className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 text-sm sm:text-base"
                    />
                    
                    {/* Location Buttons */}
                    <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="flex-1 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-400/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        {locationLoading ? 'Getting Location...' : 'Current Location'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={openMapPicker}
                        className="flex-1 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-400/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Pick on Map
                      </button>
                    </div>

                    {/* Location Status Display */}
                    {coordinates && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-400/30 rounded-lg">
                        <div className="flex items-center text-green-700 dark:text-green-300 mb-1">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          <span className="font-medium text-sm">Location Selected</span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                        </p>
                      </div>
                    )}

                    {/* Auto-selected Location Display */}
                    {selectedMapLocation && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-400/30 rounded-lg">
                        <div className="flex items-center text-blue-700 dark:text-blue-300 mb-1">
                          <MapIcon className="h-4 w-4 mr-2" />
                          <span className="font-medium text-sm">Map Location Selected</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {selectedMapLocation.address}
                        </p>
                      </div>
                    )}
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={orderData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                    className="rounded-lg sm:rounded-xl text-sm sm:text-base"
                  />

                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-3 space-y-1 sm:space-y-0">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Delivery Zone *
                      </label>
                    </div>
                    <select
                      value={selectedZone}
                      onChange={handleZoneChange}
                      required
                      className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-sm sm:text-base"
                    >
                      <option value="">Select delivery zone</option>
                      {deliveryZones.map(zone => (
                        <option key={zone._id} value={zone._id}>
                          {zone.area || zone.name} - ₹{zone.deliveryCharge || zone.deliveryFee || 0} delivery fee
                          {zone.description ? ` (${zone.description})` : ''}
                        </option>
                      ))}
                    </select>
                    
                    {selectedZone && (
                      <div className="mt-2 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-400/30">
                        <div className="flex items-center text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                          <TruckIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="break-words">
                            Delivery fee: ₹{deliveryZones.find(z => z._id === selectedZone)?.deliveryCharge || deliveryZones.find(z => z._id === selectedZone)?.deliveryFee || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 sm:mb-3">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={orderData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any special instructions for delivery..."
                      className="block w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-slate-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-slate-900/20 border border-gray-100 dark:border-slate-700 p-4 sm:p-6 lg:p-8 backdrop-blur-sm transition-colors duration-300">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 sm:mb-8 flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 dark:from-amber-400 dark:to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                    <CreditCardIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  Payment Method
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <div className="relative">
                    <input
                      id="cod"
                      name="paymentMethod"
                      type="radio"
                      value="cod"
                      checked={orderData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="cod"
                      className={`block p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 ${
                        orderData.paymentMethod === 'cod'
                          ? 'border-blue-500 dark:border-amber-400 bg-blue-50 dark:bg-amber-900/20 ring-2 ring-blue-200 dark:ring-amber-400/30'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full border-2 mr-2 sm:mr-3 flex-shrink-0 ${
                          orderData.paymentMethod === 'cod' 
                            ? 'border-blue-500 dark:border-amber-400 bg-blue-500 dark:bg-amber-400' 
                            : 'border-gray-300 dark:border-slate-600'
                        }`}>
                          {orderData.paymentMethod === 'cod' && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                          )}
                        </div>
                        <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm sm:text-base">Cash on Delivery (COD)</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">Pay when your order is delivered</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="relative opacity-60">
                    <input
                      id="online"
                      name="paymentMethod"
                      type="radio"
                      value="online"
                      disabled
                      className="sr-only"
                    />
                    <label className="block p-3 sm:p-4 border-2 border-gray-200 dark:border-slate-600 rounded-lg sm:rounded-xl cursor-not-allowed">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-slate-600 mr-2 sm:mr-3 flex-shrink-0"></div>
                        <CreditCardIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-600 dark:text-slate-400 text-sm sm:text-base">Online Payment</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-500">Coming Soon</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg sm:rounded-xl border border-blue-200 dark:border-slate-600">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-amber-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-blue-800 dark:text-slate-300 font-medium">
                      Secure and convenient - Pay when your order is delivered to your doorstep
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg dark:shadow-slate-900/20 border border-gray-100 dark:border-slate-700 p-4 sm:p-6 lg:p-8 backdrop-blur-sm transition-colors duration-300">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100 mb-6 sm:mb-8 flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 dark:from-amber-400 dark:to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                    <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  Cancellation Policy
                </h2>

                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 dark:text-green-400 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm sm:text-base mb-1">
                        Free Cancellation - Processing Stage
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                        You can cancel your order free of charge while it's being processed (before admin confirmation).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm sm:text-base mb-1">
                        Limited Cancellation - After Confirmation
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                        Once confirmed by admin, cancellation is possible but may be subject to fees. Contact support for assistance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 dark:text-red-400 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm sm:text-base mb-1">
                        No Cancellation - Out for Delivery & Delivered
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                        Once your order is out for delivery or delivered, cancellation is not available. Please contact support for any issues.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-slate-600">
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-amber-400 mr-2 sm:mr-3 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-blue-800 dark:text-slate-300 font-medium">
                        Need help? Contact our support team at any time for cancellation assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg dark:shadow-slate-900/20">
                  <div className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 dark:bg-red-400 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs sm:text-sm font-bold">!</span>
                    </div>
                    <div className="text-red-800 dark:text-red-300 font-medium text-sm sm:text-base leading-relaxed">{error}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="mt-6 sm:mt-8 lg:mt-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl dark:shadow-slate-900/20 border border-gray-100 dark:border-slate-700 p-4 sm:p-6 lg:p-8 lg:sticky lg:top-8 backdrop-blur-sm transition-colors duration-300">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Order Summary</h2>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-amber-400 dark:to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold">{cartItems.length}</span>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {cartItems.filter(item => item && item.product && item.product._id).map((item) => {
                    const effectivePrice = getEffectivePrice(item.product);
                    const itemTotal = getItemTotal(item);
                    
                    return (
                      <div key={item.product._id} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-600">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-200 dark:border-slate-600 rounded-lg sm:rounded-xl overflow-hidden shadow-md">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name || 'Product'}
                                className="w-full h-full object-center object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-500 flex items-center justify-center">
                                <span className="text-gray-500 dark:text-slate-400 text-xs font-medium">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 truncate mb-1">
                              {item.product.name || 'Unknown Product'}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mb-2">
                              Qty: <span className="font-semibold">{item.quantity}</span> × ₹<span className="font-semibold">{(effectivePrice || 0).toFixed(2)}</span>
                            </p>
                            {user && (user.role === 'primary' || user.role === 'secondary') && 
                              effectivePrice < (item.product.prices?.registered || item.product.price || 0) && (
                              <div className="flex items-center text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md w-fit">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Discount Applied
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right sm:text-right ml-auto">
                          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
                            ₹{(itemTotal || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-2 border-gray-200 dark:border-slate-600 pt-4 sm:pt-6 mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between text-sm sm:text-base">
                    <dt className="font-medium text-gray-600 dark:text-slate-400">Subtotal</dt>
                    <dd className="font-bold text-gray-900 dark:text-slate-100 text-base sm:text-lg">₹{(subtotal || 0).toFixed(2)}</dd>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm sm:text-base">
                    <dt className="font-medium text-gray-600 dark:text-slate-400">Delivery Fee</dt>
                    <dd className="font-bold text-gray-900 dark:text-slate-100 text-base sm:text-lg">₹{(deliveryFee || 0).toFixed(2)}</dd>
                  </div>
                  
                  <div className="border-t-2 border-gray-300 dark:border-slate-600 pt-3 sm:pt-4 flex items-center justify-between">
                    <dt className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">Total</dt>
                    <dd className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-amber-400 dark:to-orange-500 bg-clip-text text-transparent">
                      ₹{(total || 0).toFixed(2)}
                    </dd>
                  </div>
                </div>

                {user && (user.role === 'primary' || user.role === 'secondary') && (
                  <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg sm:rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                        <CheckCircleIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-bold text-green-800 dark:text-green-300 mb-1">
                          {user.role === 'primary' ? 'Premium' : 'Business'} Customer Benefits
                        </p>
                        <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                          Special discounts have been applied to your order
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || (subtotal === 0)}
                  className="w-full mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-amber-500 dark:to-orange-600 hover:from-blue-700 hover:to-purple-700 dark:hover:from-amber-600 dark:hover:to-orange-700 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loading size="sm" className="mr-2 sm:mr-3" />
                      <span className="text-base sm:text-lg">Placing your order...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                      <span className="text-base sm:text-lg">Place Order</span>
                    </div>
                  )}
                </Button>

                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-slate-700 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 text-center leading-relaxed">
                    🔒 By placing this order, you agree to our{' '}
                    <span className="font-semibold text-gray-800 dark:text-slate-300">Terms of Service</span> and{' '}
                    <span className="font-semibold text-gray-800 dark:text-slate-300">Privacy Policy</span>.
                    <br className="hidden sm:block" />
                    <span className="block sm:inline mt-1 sm:mt-0">Your payment information is secure and protected.</span>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* OpenStreetMap Picker Modal */}
      {showMapPicker && (
        <OpenStreetMapPicker
          onLocationSelect={handleMapLocationSelect}
          onClose={closeMapPicker}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
