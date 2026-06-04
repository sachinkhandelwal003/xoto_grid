import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiRefreshCw, FiEye, FiCheck, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import CustomTable from '../../custom/CustomTable';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';

const VendorB2B = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [activeTab, setActiveTab] = useState('approved'); // 'approved', 'pending', or 'rejected'
  const [filters, setFilters] = useState({
    status: 1, // Default to approved
    search: '',
    businessType: '',
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  // Fetch B2B vendors
  const fetchVendors = useCallback(
    async (page = 1, itemsPerPage = 10, filters = {}) => {
      setLoading(true);
      try {
        let status;
        if (activeTab === 'approved') status = 1;
        else if (activeTab === 'pending') status = 0;
        else if (activeTab === 'rejected') status = 2;

        const params = {
          page,
          limit: itemsPerPage,
          status,
          role: 'Vendor-B2B', // Filter for B2B vendors
        };

        if (filters.search) params.search = filters.search;
        if (filters.businessType) params.businessType = filters.businessType;

        const response = await apiService.get('/vendor/b2b', params);

        setVendors(response.vendors || []);
        setPagination({
          currentPage: response.pagination?.currentPage || response.page || 1,
          totalPages: response.pagination?.totalPages || response.totalPages || 1,
          totalResults: response.pagination?.totalRecords || response.total || 0,
          itemsPerPage: response.pagination?.perPage || response.limit || 10,
        });
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to fetch B2B vendors', 'error');
        setVendors([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    let newStatus;
    if (tab === 'approved') newStatus = 1;
    else if (tab === 'pending') newStatus = 0;
    else if (tab === 'rejected') newStatus = 2;

    setFilters((prev) => ({ ...prev, status: newStatus }));
  };

  // Handle page change
  const handlePageChange = (page, itemsPerPage) => {
    fetchVendors(page, itemsPerPage, filters);
  };

  // Handle filter change
  const handleFilter = (newFilters) => {
    let status;
    if (activeTab === 'approved') status = 1;
    else if (activeTab === 'pending') status = 0;
    else if (activeTab === 'rejected') status = 2;

    const updatedFilters = { ...newFilters, status };
    setFilters(updatedFilters);
    fetchVendors(1, pagination.itemsPerPage, updatedFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchVendors(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [activeTab, refreshTrigger, fetchVendors]);

  // Open reject modal
  const openRejectModal = (vendor) => {
    setSelectedVendor(vendor);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Close reject modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedVendor(null);
    setRejectionReason('');
  };

  // Update vendor status
  const handleStatusUpdate = async (vendorId, newStatus, reason = '') => {
    try {
      const data = { status: newStatus };
      if (reason) data.rejectionReason = reason;

      await apiService.put(`/vendor/b2b/${vendorId}/status`, data);
      showToast(`B2B vendor status updated successfully`, 'success');
      fetchVendors(pagination.currentPage, pagination.itemsPerPage, filters);
      closeRejectModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update vendor status', 'error');
    }
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (vendorId, categoryIndex) => {
    setExpandedCategories(prev => {
      const key = `${vendorId}-${categoryIndex}`;
      return {
        ...prev,
        [key]: !prev[key]
      };
    });
  };

  // Table columns for B2B vendors
  const vendorColumns = [
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'business_details.business_name',
      title: 'Business Name',
      sortable: true,
      filterable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900">{item.business_details?.business_name || '--'}</div>
          {item.full_name && (
            <div className="text-xs text-gray-500">Owner: {item.full_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'business_details.business_type',
      title: 'Business Type',
      sortable: true,
      render: (value, item) => (
        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
          {item.business_details?.business_type || '--'}
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
            <span className="text-xs text-green-600">Verified</span>
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
      key: 'business_details.categories',
      title: 'Categories & Subcategories',
      sortable: false,
      render: (value, item) => {
        const categories = item.business_details?.categories || [];
        
        if (categories.length === 0) {
          return '--';
        }
        
        return (
          <div className="space-y-2">
            {categories.map((category, index) => {
              const key = `${item._id}-${index}`;
              const isExpanded = expandedCategories[key];
              const subcategories = category.sub_categories || [];
              
              return (
                <div key={key} className="border rounded-md p-2">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleCategoryExpansion(item._id, index)}
                  >
                    <span className="font-medium text-sm">{category.name}</span>
                    {subcategories.length > 0 && (
                      isExpanded ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                  
                  {isExpanded && subcategories.length > 0 && (
                    <div className="mt-2 pl-2 border-t pt-2">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Subcategories:</div>
                      <div className="flex flex-wrap gap-1">
                        {subcategories.map((subcategory, subIndex) => (
                          <span
                            key={subIndex}
                            className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800"
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
          1: { class: 'bg-green-100 text-green-800', text: 'Approved' },
          2: { class: 'bg-red-100 text-red-800', text: 'Rejected' },
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
      render: (value,item) => (
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
            // to={`/sawtar/cms/vendors/b2b/${item._id}`}
            className="text-blue-600 hover:text-blue-800 p-1 rounded"
            title="View Details"
          >
            <FiEye className="text-lg" />
          </Link>
          {activeTab === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate(item._id, 1)}
                className="text-green-600 hover:text-green-800 p-1 rounded"
                title="Approve Vendor"
              >
                <FiCheck className="text-lg" />
              </button>
              <button
                onClick={() => openRejectModal(item)}
                className="text-red-600 hover:text-red-800 p-1 rounded"
                title="Reject Vendor"
              >
                <FiX className="text-lg" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">B2B Vendor Management</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200"
            title="Refresh data"
          >
            <FiRefreshCw className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            // to="/sawtar/cms/vendor/b2b/request"
            className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-1 px-3 transition-colors duration-200"
          >
            <FiPlus className="text-lg" />
            B2B Vendor Requests
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabChange('approved')}
              className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${
                activeTab === 'approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved B2B Vendors
            </button>
            <button
              onClick={() => handleTabChange('pending')}
              className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending B2B Requests
            </button>
            <button
              onClick={() => handleTabChange('rejected')}
              className={`py-4 px-6 text-center font-medium text-sm border-b-2 ${
                activeTab === 'rejected'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejected B2B Vendors
            </button>
          </nav>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total B2B Vendors</div>
          <div className="text-2xl font-bold text-gray-900">{pagination.totalResults}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            {activeTab === 'approved' ? vendors.length : '-'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {activeTab === 'pending' ? vendors.length : '-'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Rejected</div>
          <div className="text-2xl font-bold text-red-600">
            {activeTab === 'rejected' ? vendors.length : '-'}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <CustomTable
          columns={vendorColumns}
          data={vendors}
          totalItems={pagination.totalResults}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onFilter={handleFilter}
          loading={loading}
          filters={[
            {
              key: 'search',
              type: 'text',
              placeholder: 'Search by email or business name...',
            },
            {
              key: 'businessType',
              type: 'select',
              placeholder: 'All business types',
              options: [
                { value: '', label: 'All Types' },
                { value: 'Private Limited', label: 'Private Limited' },
                { value: 'Partnership', label: 'Partnership' },
                { value: 'Corporation', label: 'Corporation' },
              ],
            },
          ]}
          emptyMessage={
            activeTab === 'approved'
              ? 'No approved B2B vendors found.'
              : activeTab === 'pending'
              ? 'No pending B2B vendor requests.'
              : 'No rejected B2B vendors found.'
          }
        />
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Reject B2B Vendor</h2>
            <p className="mb-2">
              Vendor: {selectedVendor.business_details?.business_name || 'Unknown'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
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
                onClick={() => handleStatusUpdate(selectedVendor._id, 2, rejectionReason)}
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

export default VendorB2B;