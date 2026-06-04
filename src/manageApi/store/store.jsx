import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logoutUser } from './authSlice';
import axios from 'axios';
import productsReducer from './productsSlice.jsx';
// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
  },
});

// Set up Axios interceptor after store creation
axios.defaults.baseURL = 'http://localhost:5000';

// Add a request interceptor to include the token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, logout the user
      store.dispatch(logoutUser());
    }
    return Promise.reject(error);
  }
);