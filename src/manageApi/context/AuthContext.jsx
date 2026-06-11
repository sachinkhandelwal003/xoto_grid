// src/context/AuthProvider.jsxfsfsd
import React, { createContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import {
  loginUser,
  logoutUser,
  refreshToken,
  rehydrateAuthState,
  fetchMyPermissions,
} from '../store/authSlice';


export const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';


export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const hasFetchedPermissions = useRef(false);

  // Rehydrate auth state on app mount
  useEffect(() => {
    dispatch(rehydrateAuthState());
  }, [dispatch]);

  // Fetch permissions once after successful authentication
  useEffect(() => {
    if (isAuthenticated && token && !hasFetchedPermissions.current) {
      hasFetchedPermissions.current = true;
      dispatch(fetchMyPermissions()).unwrap().catch(() => {});
    }

    if (!isAuthenticated) {
      hasFetchedPermissions.current = false;
    }
  }, [isAuthenticated, token, dispatch]);

  // Auto token refresh logic
  useEffect(() => {
  if (!token) return;

  const checkAndRefresh = () => {
    try {
      const decoded = jwtDecode(token);
      const timeUntilExpiry = decoded.exp * 1000 - Date.now();

      if (timeUntilExpiry < 5 * 60 * 1000) {
        dispatch(refreshToken());
      }
    } catch (err) {
      console.error('Invalid token, logging out');
      dispatch(logoutUser());
    }
  };

  checkAndRefresh();
  const id = setInterval(checkAndRefresh, 60 * 1000);

  return () => clearInterval(id);
}, [token, dispatch]);


  // Enhanced login function that accepts dynamic endpoint
// Enhanced login function that accepts dynamic endpoint AND full payload
const login = async (endpoint, credentials) => {
  const fullEndpoint = `${API_BASE}${endpoint}`;

  // Use credentials directly — don't force email/password structure
  return await dispatch(
    loginUser({
      payload: credentials,        // ← Now supports { mobile }, { email, password }, etc.
      endpoint: fullEndpoint,
    })
  ).unwrap();
};


  // Logout with optional backend call
  const logout = async (logoutEndpoint = '/auth/logout') => {
    hasFetchedPermissions.current = false;
    const fullEndpoint = `${API_BASE}${logoutEndpoint}`;
    
    try {
      await dispatch(logoutUser(fullEndpoint));
    } catch (err) {
      // Even if backend fails, clear local state
      dispatch(logoutUser());
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,    // Now supports dynamic endpoints
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;