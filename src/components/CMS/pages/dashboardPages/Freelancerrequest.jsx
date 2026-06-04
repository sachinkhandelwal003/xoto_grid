import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import CustomTable from '../../pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';
import { FiCheck, FiX } from 'react-icons/fi';

const Freelancerrequest = () => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const [freelancerRequests, setFreelancerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({});

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  // Fetch freelancer requests
  const fetchFreelancerRequests = async (page = 1, itemsPerPage = 10, filters = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };
      if (filters.status !== undefined) params.status = filters.status;
      const response = await apiService.get('/freelancer/requests', params);
      setFreelancerRequests(response.requests || []);
      setPagination({
        currentPage: response.pagination.currentPage || 1,
        totalPages: response.pagination.totalPages || 1,
        totalResults: response.pagination.totalRecords || 0,
        itemsPerPage: response.pagination.perPage || 10,
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch freelancer requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page, itemsPerPage) => {
    fetchFreelancerRequests(page, itemsPerPage, filters);
  };

  // Handle filter change
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchFreelancerRequests(1, pagination.itemsPerPage, newFilters);
  };

  // Handle approve action
  const handleApprove = async (item) => {
    const result = await showConfirmDialog(
      'Confirm Approve',
      `Are you sure you want to approve the freelancer request for "${item.customerId?.name || item._id}"?`,
      'Approve'
    );
    if (result.isConfirmed) {
      try {
        await apiService.put(`/freelancer/requests/${item._id}/approve`);
        showSuccessAlert('Success', `Freelancer request for "${item.customerId?.name || item._id}" approved successfully`);
        fetchFreelancerRequests(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to approve freelancer request');
      }
    }
  };

  // Handle reject action
  const handleReject = async (item) => {
    const result = await showConfirmDialog(
      'Confirm Reject',
      `Are you sure you want to reject the freelancer request for "${item.customerId?.name || item._id}"? Please provide a reason.`,
      'Reject',
      true, // Enable input
      'Rejection Reason'
    );
    if (result.isConfirmed && result.value) {
      try {
        await apiService.put(`/freelancer/requests/${item._id}/reject`, { rejectionReason: result.value });
        showSuccessAlert('Success', `Freelancer request for "${item.customerId?.name || item._id}" rejected successfully`);
        fetchFreelancerRequests(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to reject freelancer request');
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFreelancerRequests(pagination.currentPage, pagination.itemsPerPage, filters);
  }, []);

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Freelancer request table columns
  const freelancerRequestColumns = [
    {
      key: 'customerId.name',
      title: 'Customer Name',
      sortable: true,
      filterable: true,
      render: (value, item) => <span className="font-medium text-gray-900">{item.customerId?.name || '--'}</span>,
    },
    {
      key: 'customerId.email',
      title: 'Customer Email',
      sortable: true,
      render: (value, item) => <span className="text-gray-900">{item.customerId?.email || '--'}</span>,
    },
    {
      key: 'skills',
      title: 'Skills',
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'hourlyRate',
      title: 'Hourly Rate ($)',
      sortable: true,
      render: (value) => <span className="text-gray-900">{value ? `$${value}` : '--'}</span>,
    },
    {
      key: 'portfolio',
      title: 'Portfolio',
      render: (value) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {value ? 'View Portfolio' : '--'}
        </a>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { value: '0', label: 'Pending' },
        { value: '1', label: 'Approved' },
        { value: '2', label: 'Rejected' },
      ],
      render: (value) => (
        <span className="text-gray-900">
          {value === 0 ? 'Pending' : value === 1 ? 'Approved' : value === 2 ? 'Rejected' : '--'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Submitted At',
      sortable: true,
      render: (value) => <span className="text-gray-900">{value ? new Date(value).toLocaleDateString() : '--'}</span>,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, item) => (
        <div className="flex gap-2">
          {item.status === 0 ? (
            <>
              <button
                onClick={() => handleApprove(item)}
                className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                title="Approve"
              >
                <FiCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReject(item)}
                className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="Reject"
              >
                <FiX className="h-4 w-4" />
              </button>
            </>
          ) : (
            '--'
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Freelancer Requests</h1>
      </div>
      <CustomTable
        columns={freelancerRequestColumns}
        data={freelancerRequests}
        totalItems={pagination.totalResults}
        currentPage={pagination.currentPage}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        loading={loading}
      />
    </div>
  );
};

export default Freelancerrequest;