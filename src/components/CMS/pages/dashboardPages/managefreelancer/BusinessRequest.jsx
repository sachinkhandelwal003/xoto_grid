import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaSyncAlt, FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import CustomTable from '../../custom/CustomTable';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';

const BusinessRequest = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved', 'pending', 'rejected', 'suspended'
  const [filters, setFilters] = useState({
    search: '',
    store_type: '',
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  // Fetch businesses
  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      let status;
      if (activeTab === 'approved') status = 1;
      else if (activeTab === 'pending') status = 0;
      else if (activeTab === 'rejected') status = 2;
      else if (activeTab === 'suspended') status = 3;

      const params = { role: 'Business' }; // Filter for business role
      if (status !== undefined) params.status = status;
      if (filters.search) params.search = filters.search;
      if (filters.store_type) params.store_type = filters.store_type;

      const response = await apiService.get('/business', params);

      setBusinesses(response.businesses || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch businesses', 'error');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchBusinesses();
  };

  // Handle filter change
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchBusinesses();
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchBusinesses();
  }, [activeTab, refreshTrigger, fetchBusinesses]);

  // Open reject modal
  const openRejectModal = (business) => {
    setSelectedBusiness(business);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Close reject modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedBusiness(null);
    setRejectionReason('');
  };

  // Update business status
  const handleStatusUpdate = async (businessId, newStatus, reason = '') => {
    try {
      const data = { status: newStatus };
      if (reason) data.rejection_reason = reason;

      await apiService.put(`/business/${businessId}/status`, data);
      showToast(`Business status updated successfully`, 'success');
      fetchBusinesses();
      closeRejectModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update business status', 'error');
    }
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (businessId, categoryIndex) => {
    setExpandedCategories((prev) => {
      const key = `${businessId}-${categoryIndex}`;
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  // Table columns for businesses
  const businessColumns = [
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'store_details.store_name',
      title: 'Business Name',
      sortable: true,
      filterable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900">{item.store_details?.store_name || '--'}</div>
          {item.full_name && (
            <div className="text-xs text-gray-500">Owner: {item.full_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'store_details.store_type',
      title: 'Business Type',
      sortable: true,
      render: (value, item) => (
        <span className="px-2 py-1 text-xs font-medium rounded bg-teal-100 text-teal-800">
          {item.store_details?.store_type || '--'}
        </span>
      ),
    },
    {
      key: 'mobile',
      title: 'Mobile',
      sortable: false,
      render: (value, item) => (
        <div>
          <div className="text-gray-900">{value || '--'}</div>
          {item.is_mobile_verified && (
            <span className="text-xs text-teal-600">Verified</span>
          )}
        </div>
      ),
    },
    {
      key: 'registration.gstin',
      title: 'GSTIN',
      sortable: true,
      render: (value, item) => <span className="text-gray-900">{item.registration?.gstin || '--'}</span>,
    },
    {
      key: 'registration.pan_number',
      title: 'PAN Number',
      sortable: true,
      render: (value, item) => <span className="text-gray-900">{item.registration?.pan_number || '--'}</span>,
    },
    {
      key: 'store_details.categories',
      title: 'Categories & Subcategories',
      sortable: false,
      render: (value, item) => {
        const categories = item.store_details?.categories || [];
        if (categories.length === 0) {
          return '--';
        }
        return (
          <div className="space-y-2">
            {categories.map((category, index) => {
              const key = `${item._id}-${index}`;
              const isExpanded = expandedCategories[key];
              const subcategories = category.subcategories || [];
              return (
                <div key={key} className="border rounded-md p-2 bg-gray-50">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleCategoryExpansion(item._id, index)}
                  >
                    <span className="font-medium text-sm text-gray-900">{category.name}</span>
                    {subcategories.length > 0 && (
                      isExpanded ? <FaChevronUp className="text-teal-600" /> : <FaChevronDown className="text-teal-600" />
                    )}
                  </div>
                  {isExpanded && subcategories.length > 0 && (
                    <div className="mt-2 pl-2 border-t pt-2">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Subcategories:</div>
                      <div className="flex flex-wrap gap-1">
                        {subcategories.map((subcategory, subIndex) => (
                          <span
                            key={subIndex}
                            className="px-2 py-1 text-xs rounded bg-teal-100 text-teal-800"
                          >
                            {subcategory}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'status_info.status',
      title: 'Status',
      sortable: true,
      render: (value, item) => {
        const statusConfig = {
          0: { class: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
          1: { class: 'bg-teal-100 text-teal-800', text: 'Approved' },
          2: { class: 'bg-red-100 text-red-800', text: 'Rejected' },
          3: { class: 'bg-gray-100 text-gray-800', text: 'Suspended' },
        };
        const config = statusConfig[item.status_info.status] || statusConfig[0];
        return (
          <div>
            <span className={`px-2 py-1 text-xs font-medium rounded ${config.class}`}>
              {config.text}
            </span>
            {item.status_info.status === 2 && item.status_info?.rejection_reason && (
              <div className="text-xs text-gray-500 mt-1">
                Reason: {item.status_info.rejection_reason}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'meta.created_at',
      title: 'Registered At',
      sortable: true,
      render: (value, item) => (
        <span className="text-gray-900">
          {item.meta.created_at ? new Date(item.meta.created_at).toLocaleDateString('en-GB') : '--'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, item) => (
        <div className="flex space-x-2">
          <Link
            // to={`/sawtar/cms/business/request/${item._id}`}
            className="text-teal-600 hover:text-teal-800 p-1 rounded"
            title="View Details"
          >
            <FaEye className="text-lg" />
          </Link>
          {activeTab === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate(item._id, 1)}
                className="text-teal-600 hover:text-teal-800 p-1 rounded"
                title="Approve Business"
              >
                <FaCheckCircle className="text-lg" />
              </button>
              <button
                onClick={() => openRejectModal(item)}
                className="text-red-600 hover:text-red-800 p-1 rounded"
                title="Reject Business"
              >
                <FaTimesCircle className="text-lg" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Business Registration Management</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 text-white hover:text-gray-200 p-2 rounded-full hover:bg-teal-800"
              title="Refresh data"
            >
              <FaSyncAlt className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              // to="/sawtar/cms/business/request"
              className="flex items-center gap-2 bg-white text-teal-600 hover:bg-teal-100 font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              <FaBuilding className="text-lg" />
              New Business Request
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['approved', 'pending', 'rejected', 'suspended'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Businesses
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <CustomTable
          columns={businessColumns}
          data={businesses}
          onFilter={handleFilter}
          loading={loading}
          filters={[
            {
              key: 'search',
              type: 'text',
              placeholder: 'Search by email or business name...',
            },
            {
              key: 'store_type',
              type: 'select',
              placeholder: 'All business types',
              options: [
                { value: '', label: 'All Types' },
                { value: 'Individual / Sole Proprietor', label: 'Individual / Sole Proprietor' },
                { value: 'Private Limited', label: 'Private Limited' },
                { value: 'Partnership', label: 'Partnership' },
                { value: 'LLP', label: 'LLP' },
                { value: 'Public Limited', label: 'Public Limited' },
                { value: 'Others', label: 'Others' },
              ],
            },
          ]}
          emptyMessage={
            activeTab === 'approved'
              ? 'No approved businesses found.'
              : activeTab === 'pending'
              ? 'No pending business requests.'
              : activeTab === 'rejected'
              ? 'No rejected businesses found.'
              : 'No suspended businesses found.'
          }
          rowClassName="hover:bg-teal-50 transition-colors duration-150"
        />
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-transform duration-300 ease-out translate-x-0"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Reject Business</h2>
            <p className="mb-2 text-gray-600">
              Business: {selectedBusiness.store_details?.store_name || 'Unknown'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                rows="4"
                placeholder="Provide a reason for rejection..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedBusiness._id, 2, rejectionReason)}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded-md text-white ${
                  !rejectionReason.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessRequest;