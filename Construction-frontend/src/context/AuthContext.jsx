import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import localAuthService from '../services/localAuthService';

// Auth Context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  const initializeAuth = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData && typeof userData === 'object' && userData.email) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: userData, token }
            });
          } else {
            throw new Error('Invalid user data');
          }
        } catch (parseError) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      // Use backend API for registration
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data.data.user;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Get user price tier
  const getUserPriceTier = () => {
    if (!state.user) return 'registered';
    return state.user.role === 'admin' ? 'admin' :
           state.user.role === 'primary' ? 'primary' : 
           state.user.role === 'secondary' ? 'secondary' : 'registered';
  };

  // Check if user has admin access
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  // Check if user has privileged access
  const isPrivileged = () => {
    return ['admin', 'primary', 'secondary'].includes(state.user?.role);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    getUserPriceTier,
    isAdmin,
    isPrivileged,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
