import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import CustomTable from '../custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { FiPlus } from 'react-icons/fi';

const VendorRejected = () => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({ status: 2 }); // Default filter to rejected

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  // Fetch rejected vendors
  const fetchVendors = async (page = 1, itemsPerPage = 10, filters = { status: 2 }) => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage, status: 2 }; // Always filter by status: 2
      if (filters.search) params.search = filters.search;
      if (filters.businessType) params.businessType = filters.businessType;
      const response = await apiService.get('/vendor', params);
      
      setVendors(response.vendors || []);
      setPagination({
        currentPage: response.pagination.currentPage || 1,
        totalPages: response.pagination.totalPages || 1,
        totalResults: response.pagination.totalRecords || 0,
        itemsPerPage: response.pagination.perPage || 10,
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch rejected vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page, itemsPerPage) => {
    fetchVendors(page, itemsPerPage, filters);
  };

  // Handle filter change
  const handleFilter = (newFilters) => {
    const updatedFilters = { ...newFilters, status: 2 }; // Ensure status: 2 is always applied
    setFilters(updatedFilters);
    fetchVendors(1, pagination.itemsPerPage, updatedFilters);
  };

  // Initial data fetch
  useEffect(() => {
    fetchVendors(pagination.currentPage, pagination.itemsPerPage, filters);
  }, []);

  // Rejected vendor table columns
  const vendorColumns = [
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
      render: (value) => <span className="text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'shopName',
      title: 'Shop Name',
      sortable: true,
      filterable: true,
      render: (value) => <span className="font-medium text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'businessType',
      title: 'Business Type',
      sortable: true,
      render: (value) => <span className="text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'taxId',
      title: 'Tax ID',
      sortable: true,
      render: (value) => <span className="text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'rejectionReason',
      title: 'Rejection Reason',
      sortable: false,
      render: (value) => <span className="text-gray-900">{value || '--'}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: () =>  <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-600">
      Rejected
    </span>, // Always rejected
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
        <Link
          to={`/dashboard/vendors/${item._id}`}
          className="text-blue-600 hover:underline"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Rejected Vendors</h1>
        <Link
          // to="/sawtar/cms/vendor/request"
          className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-1 px-2 transition-colors duration-200"
        >
          <FiPlus className="text-lg" />
          Vendor Requests
        </Link>
      </div>
      <CustomTable
        columns={vendorColumns}
        data={vendors}
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

export default VendorRejected;