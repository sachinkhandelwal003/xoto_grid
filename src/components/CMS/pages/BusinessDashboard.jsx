import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaShoppingCart, FaHeart, FaClock, FaFileAlt, FaCalendarCheck, FaCheckCircle, FaUser, FaFile } from 'react-icons/fa';
import axios from 'axios';
import { showToast } from '../../../manageApi/utils/toast';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

// Placeholder data for business dashboard
const businessStats = [
  { label: 'Total Sales', value: 'AED5,000', change: '+10%', icon: FaShoppingCart, trend: 'up' },
  { label: 'Pending Orders', value: '8', change: '+3', icon: FaClock, trend: 'up' },
  { label: 'Customer Reviews', value: '25', change: '+5', icon: FaHeart, trend: 'up' },
  { label: 'Active Listings', value: '15', change: '-2', icon: FaFileAlt, trend: 'down' },
];

const businessOrders = [
  { action: 'Received order #1234', user: 'Customer X', time: '5 mins ago', icon: FaShoppingCart, color: 'text-blue-500' },
  { action: 'Shipped order #1233', user: 'You', time: '2 hours ago', icon: FaCheckCircle, color: 'text-green-500' },
  { action: 'Customer requested refund #1232', user: 'Customer Y', time: '4 hours ago', icon: FaFileAlt, color: 'text-red-500' },
  { action: 'Scheduled delivery for #1231', user: 'You', time: '6 hours ago', icon: FaCalendarCheck, color: 'text-yellow-500' },
  { action: 'Completed order #1230', user: 'You', time: '1 day ago', icon: FaCheckCircle, color: 'text-indigo-500' },
];

const BusinessDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState({ orders: [], stats: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
    fetchBusinessData();
  }, [token]);

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/business/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinessData({
        orders: response.data.orders || businessOrders,
        stats: response.data.stats || businessStats,
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch dashboard data', 'error');
      setBusinessData({
        orders: businessOrders,
        stats: businessStats,
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Animation variants for Framer Motion
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
          <div className="space-x-4">
            <Button
              variant="contained"
              startIcon={<FaUser />}
              onClick={() => navigate('/business/profile')}
              sx={{ backgroundColor: '#0288d1', '&:hover': { backgroundColor: '#0277bd' } }}
            >
              View Profile
            </Button>
            <Button
              variant="outlined"
              startIcon={<FaFile />}
              onClick={() => navigate('/business/documents')}
              sx={{ borderColor: '#0288d1', color: '#0288d1', '&:hover': { borderColor: '#0277bd', color: '#0277bd' } }}
            >
              Manage Documents
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnimatePresence>
            {businessData.stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg ${
                      stat.trend === 'up' ? 'bg-green-50' : stat.trend === 'down' ? 'bg-red-50' : 'bg-gray-50'
                    } flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`${
                        stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                      } text-xl`}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center">
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">vs last week</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders Summary */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Orders Pipeline</h2>
              <select className="mt-2 sm:mt-0 px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
              </select>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              {/* Placeholder for Chart */}
              <div className="text-center">
                <svg className="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="mt-2 text-gray-500">Orders pipeline visualization</p>
              </div>
            </div>
          </motion.div>

          {/* Order Sources */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Sources</h2>
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 mb-6">
                {/* Placeholder for Pie Chart */}
                <svg className="w-40 h-40 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div className="w-full space-y-3">
                {[
                  { source: 'Justdial Listings', percentage: 60, color: 'bg-blue-500' },
                  { source: 'Direct Orders', percentage: 25, color: 'bg-green-500' },
                  { source: 'Referrals', percentage: 10, color: 'bg-purple-500' },
                  { source: 'Other', percentage: 5, color: 'bg-gray-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${item.color}`} />
                      <p className="text-sm text-gray-600">{item.source}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All Activity</button>
          </div>
          <div className="space-y-4">
            {businessData.orders.map((item, i) => (
              <div key={i} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} bg-opacity-10 mr-3`}>
                  <item.icon className={`${item.color} text-lg`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {item.user} <span className="font-normal text-gray-600">{item.action}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-ellipsis-v"></i>
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessDashboard;