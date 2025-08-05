import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Cart Context
const CartContext = createContext();

// Initial state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity, price } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product._id === product._id);

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { product, quantity, price }];
      }

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const newItems = state.items.map(item =>
        item.product._id === productId 
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0);

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'REMOVE_FROM_CART': {
      const { productId } = action.payload;
      const newItems = state.items.filter(item => item.product._id !== productId);

      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || [],
        total: calculateTotal(action.payload.items || []),
        itemCount: calculateItemCount(action.payload.items || []),
      };

    default:
      return state;
  }
};

// Helper functions
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const calculateItemCount = (items) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Track the current user ID for cart session management
  const [currentUserId, setCurrentUserId] = React.useState(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Generate user-specific cart key
  const getCartKey = (userId) => {
    return userId ? `cart_${userId}` : 'cart_guest';
  };

  // Clean up old cart data when switching users
  const cleanupOldCart = (oldUserId) => {
    if (oldUserId) {
      const oldCartKey = getCartKey(oldUserId);
      localStorage.removeItem(oldCartKey);
    }
    // Also clean up any generic 'cart' key from old implementation
    localStorage.removeItem('cart');
  };

  // Load cart from localStorage on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const newUserId = user._id || user.id;
      
      // If switching users, clean up old cart
      if (currentUserId && currentUserId !== newUserId) {
        console.log('Switching users, cleaning up old cart');
        cleanupOldCart(currentUserId);
      }
      
      // User is authenticated - load their specific cart
      const userCartKey = getCartKey(newUserId);
      const savedCart = localStorage.getItem(userCartKey);
      
      console.log(`Loading cart for user ${newUserId}:`, savedCart ? 'Found saved cart' : 'No saved cart');
      
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          if (cartData && cartData.items && Array.isArray(cartData.items)) {
            dispatch({ type: 'LOAD_CART', payload: cartData });
            console.log('Cart loaded successfully:', cartData.items.length, 'items');
          } else {
            console.log('Invalid cart data structure, clearing cart');
            dispatch({ type: 'CLEAR_CART' });
          }
        } catch (error) {
          console.error('Error loading user cart from localStorage:', error);
          dispatch({ type: 'CLEAR_CART' });
        }
      } else {
        // No saved cart for this user - start fresh
        console.log('No saved cart found, starting fresh');
        dispatch({ type: 'CLEAR_CART' });
      }
      
      setCurrentUserId(newUserId);
      setIsInitialized(true);
    } else if (!isAuthenticated && isInitialized) {
      // User logged out - clean up and clear cart
      console.log('User logged out, clearing cart');
      if (currentUserId) {
        cleanupOldCart(currentUserId);
      }
      dispatch({ type: 'CLEAR_CART' });
      setCurrentUserId(null);
    }
  }, [isAuthenticated, user]);

  // Save cart to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (isInitialized && isAuthenticated && currentUserId && state.items) {
      const userCartKey = getCartKey(currentUserId);
      const cartData = {
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(userCartKey, JSON.stringify(cartData));
      console.log(`Cart saved for user ${currentUserId}:`, state.items.length, 'items');
    }
  }, [state, currentUserId, isAuthenticated, isInitialized]);

  // Add item to cart
  const addToCart = (product, quantity = 1, price) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, quantity, price },
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, quantity },
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { productId },
    });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    
    // Also clear from localStorage if user is authenticated
    if (isAuthenticated && currentUserId) {
      const userCartKey = getCartKey(currentUserId);
      localStorage.removeItem(userCartKey);
    }
  };

  // Get item quantity by product ID
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  // Get total cart value
  const getCartTotal = () => {
    return state.total;
  };

  // Get total cart count
  const getCartCount = () => {
    return state.itemCount;
  };

  const value = {
    ...state,
    cartItems: state.items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    isInCart,
    getCartTotal,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
