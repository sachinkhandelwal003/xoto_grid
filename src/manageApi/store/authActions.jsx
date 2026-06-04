
import axios from 'axios';
import { loginStart, loginSuccess, loginFailure, logout } from './authSlice';

axios.defaults.baseURL = 'http://localhost:5000/api';

export const loginUser = (email, password, endpoint) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await axios.post(endpoint, { email, password });
    const { token, user, message } = response.data;

    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    dispatch(loginSuccess({ user, token }));
    return { success: true, user, message };
  } catch (error) {
    const errorResponse = error.response?.data || { message: 'Network error', errors: [] };
    dispatch(loginFailure(errorResponse));
    return {
      success: false,
      message: errorResponse.message || 'Login failed',
      errors: errorResponse.errors || []
    };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await axios.post('/auth/logout');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch(logout());
  } catch (error) {
    console.warn('Logout error:', error);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch(logout());
  }
};
