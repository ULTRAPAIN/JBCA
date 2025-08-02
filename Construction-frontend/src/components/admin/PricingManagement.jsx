import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';

const PricingManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handlePriceUpdate = async (priceType, newPrice) => {
    if (!selectedProduct) return;

    setSaving(true);
    try {
      const updatedProduct = {
        ...selectedProduct,
        prices: {
          ...selectedProduct.prices,
          [priceType]: parseFloat(newPrice)
        }
      };

      // If updating registered price, also update the main price field
      if (priceType === 'registered') {
        updatedProduct.price = parseFloat(newPrice);
      }

      await productService.updateProduct(selectedProduct._id, updatedProduct);
      
      // Update local state
      setSelectedProduct(updatedProduct);
      setProducts(products.map(p => p._id === selectedProduct._id ? updatedProduct : p));
      
      alert('Price updated successfully!');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Error updating price. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateDiscount = (registeredPrice, rolePrice) => {
    if (!registeredPrice || !rolePrice) return 0;
    return Math.round(((registeredPrice - rolePrice) / registeredPrice) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-slate-900/20 border border-gray-100 dark:border-slate-600 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-slate-100">Pricing Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-300">Select Product</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductSelect(product)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedProduct?._id === product._id
                    ? 'bg-blue-50 dark:bg-amber-900/20 border-blue-300 dark:border-amber-400'
                    : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-slate-100">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 dark:text-slate-100">₹{product.price}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Registered Price</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Details */}
        <div>
          {selectedProduct ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-slate-300">
                Pricing for {selectedProduct.name}
              </h3>
              
              <div className="space-y-4">
                {/* Registered Price */}
                <div className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Registered Price (Regular Customers)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-slate-400">₹</span>
                    <input
                      type="number"
                      value={selectedProduct.prices?.registered || selectedProduct.price}
                      onChange={(e) => handlePriceUpdate('registered', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-amber-400 focus:border-transparent"
                      step="0.01"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Primary Price */}
                <div className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Primary Customer Price
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-slate-400">₹</span>
                    <input
                      type="number"
                      value={selectedProduct.prices?.primary || selectedProduct.price}
                      onChange={(e) => handlePriceUpdate('primary', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                      step="0.01"
                      disabled={saving}
                    />
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Discount: {calculateDiscount(
                      selectedProduct.prices?.registered || selectedProduct.price,
                      selectedProduct.prices?.primary || selectedProduct.price
                    )}%
                  </p>
                </div>

                {/* Secondary Price */}
                <div className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Secondary Customer Price
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-slate-400">₹</span>
                    <input
                      type="number"
                      value={selectedProduct.prices?.secondary || selectedProduct.price}
                      onChange={(e) => handlePriceUpdate('secondary', e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      step="0.01"
                      disabled={saving}
                    />
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Discount: {calculateDiscount(
                      selectedProduct.prices?.registered || selectedProduct.price,
                      selectedProduct.prices?.secondary || selectedProduct.price
                    )}%
                  </p>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="mt-6 p-4 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-2">Pricing Summary</h4>
                <div className="space-y-1 text-sm text-gray-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Registered Customers:</span>
                    <span>₹{selectedProduct.prices?.registered || selectedProduct.price}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Primary Customers:</span>
                    <span>₹{selectedProduct.prices?.primary || selectedProduct.price}</span>
                  </div>
                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                    <span>Secondary Customers:</span>
                    <span>₹{selectedProduct.prices?.secondary || selectedProduct.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-slate-400 py-12">
              <p>Select a product to manage its pricing</p>
            </div>
          )}
        </div>
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg flex items-center space-x-2 border border-gray-200 dark:border-slate-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-amber-400"></div>
            <span className="text-gray-900 dark:text-slate-100">Updating prices...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagement;
