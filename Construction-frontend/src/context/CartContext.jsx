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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Clear cart when user logs out or a different user logs in
  useEffect(() => {
    if (!isAuthenticated) {
      // User logged out - clear cart
      dispatch({ type: 'CLEAR_CART' });
      setCurrentUserId(null);
    } else if (user && user._id !== currentUserId) {
      // Different user logged in - clear cart for new user
      dispatch({ type: 'CLEAR_CART' });
      setCurrentUserId(user._id);
    }
  }, [isAuthenticated, user, currentUserId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

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
