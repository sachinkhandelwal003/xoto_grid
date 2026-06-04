
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiShoppingBag,
  FiImage,
  FiFileText,FiClock ,FiCheck ,FiX 
} from 'react-icons/fi';
import { Button, Card, Statistic, Tabs, Tag, Select as AntdSelect, Collapse } from 'antd';
import CustomTable from '../../custom/CustomTable'; // Adjust path as needed
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';
import { format } from 'date-fns';

const { Option } = AntdSelect;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const STATUS_MAP = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const AllVendorProductB2C = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    verification_status: '',
    search: '',
    category_id: '',
    date_filter: '',
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [categories, setCategories] = useState([]);

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const response = await apiService.get('/categories');
      setCategories(response.categories || []);
    } catch (error) {
      showToast('Failed to fetch categories', 'error');
    }
  };

  // Fetch all products (no vendor_id filter)
  const fetchProducts = useCallback(
    async (page = 1, itemsPerPage = 10, filters = {}) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: itemsPerPage,
        };

        if (filters.verification_status) params.verification_status = filters.verification_status;
        if (filters.search) params.search = filters.search;
        if (filters.category_id) params.category_id = filters.category_id;
        if (filters.date_filter) params.date_filter = filters.date_filter;

        const response = await apiService.get('/products', params);

        const rawProducts = response.products || [];
        setProducts(rawProducts.map((p) => ({ ...p, key: p._id })));
        setPagination({
          currentPage: response.pagination?.page || 1,
          totalPages: Math.ceil((response.pagination?.total || 0) / (response.pagination?.limit || 10)) || 1,
          totalResults: response.pagination?.total || 0,
          itemsPerPage: response.pagination?.limit || 10,
        });
        setStats({
          total: response.stats?.total || 0,
          pending: response.stats?.pending || response.stats?.today || 0,
          approved: response.stats?.approved || response.stats?.month || 0,
          rejected: response.stats?.rejected || response.stats?.week || 0,
        });
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    fetchCategories();
    fetchProducts(pagination.currentPage, pagination.itemsPerPage, filters);
  }, [token, activeTab, refreshTrigger, fetchProducts]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      verification_status: tab === 'all' ? '' : tab,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change
  const handlePageChange = (page, itemsPerPage) => {
    setPagination((prev) => ({ ...prev, currentPage: page, itemsPerPage: itemsPerPage || prev.itemsPerPage }));
    fetchProducts(page, itemsPerPage || pagination.itemsPerPage, filters);
  };

  // Handle filter change
  const handleFilter = (newFilters) => {
    const updatedFilters = { ...newFilters, verification_status: filters.verification_status };
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchProducts(1, pagination.itemsPerPage, updatedFilters);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Update active/inactive status
  const handleActiveStatusChange = async (product_id, newStatus) => {
    try {
      await apiService.put(`/products/${product_id}`, { status: newStatus });
      showToast(`Product active status updated to ${newStatus}`, 'success');
      setProducts((prev) =>
        prev.map((item) => (item._id === product_id ? { ...item, status: newStatus } : item))
      );
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update active status', 'error');
      fetchProducts(pagination.currentPage, pagination.itemsPerPage, filters);
    }
  };

  // Add SNO to data
  const dataWithSno = useMemo(() => {
    return products.map((item, index) => ({
      ...item,
      sno: (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
    }));
  }, [products, pagination.currentPage, pagination.itemsPerPage]);

  // Table columns
  const productColumns = [
    {
      key: 'sno',
      title: 'S.No',
      render: (value, item) => <div className="font-medium text-gray-900">{item.sno}</div>,
    },
    {
      key: 'name',
      title: 'Product Name',
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900">{item.name || '--'}</div>
          <div className="text-sm text-gray-500">{item.product_code || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'vendor',
      title: 'Vendor',
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900">{item.vendor?.full_name || '--'}</div>
          <div className="text-sm text-gray-500">{item.vendor?.email || '--'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      render: (value, item) => <div className="text-gray-900">{item.category?.name || '--'}</div>,
    },
    {
      key: 'stock',
      title: 'In Stock',
      render: (value, item) => <div className="text-gray-900">{item.stock?.total_quantity || '--'}</div>,
    },
    {
      key: 'pricing.sale_price',
      title: 'Sale Price',
      render: (value, item) => (
        <div className="font-medium text-gray-900">
          {item.pricing?.sale_price > 0
            ? `${item.pricing.currency.symbol} ${item.pricing.sale_price.toFixed(2)}`
            : item.pricing?.final_price
            ? `${item.pricing.currency.symbol} ${item.pricing.final_price.toFixed(2)}`
            : '--'}
        </div>
      ),
    },
  
    {
      key: 'verification_status.status',
      title: 'Verification Status',
      render: (value, item) => {
        const statusConfig = {
          pending: { color: 'warning', text: 'Pending' },
          approved: { color: 'success', text: 'Approved' },
          rejected: { color: 'error', text: 'Rejected' },
        };

        const config = statusConfig[item.verification_status?.status] || statusConfig.pending;

        return (
          <div>
            <Tag color={config.color}>{config.text}</Tag>
            {item.verification_status?.status === 'rejected' && item.verification_status?.rejection_reason && (
              <div className="text-sm text-gray-500 mt-1">
                Reason: {item.verification_status.rejection_reason}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Active Status',
      render: (value, item) => (
        <AntdSelect
          value={item.status}
          onChange={(newValue) => handleActiveStatusChange(item._id, newValue)}
          style={{ width: 120 }}
          className={item.status === STATUS_MAP.ACTIVE ? 'text-green-700' : 'text-red-700'}
        >
          <Option value={STATUS_MAP.ACTIVE} className="text-green-700">
            Active
          </Option>
          <Option value={STATUS_MAP.INACTIVE} className="text-red-700">
            Inactive
          </Option>
        </AntdSelect>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (value, item) => (
        <div className="text-gray-900">
          {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy') : '--'}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, item) => (
        <div className="flex space-x-2">
          <Button
            type="link"
            icon={<FiEye />}
            // href={`/sawtar/cms/vendor/b2c/product/review/${item._id}`}
            title="View Details"
          />
          <Button
            type="link"
            icon={<FiShoppingBag />}
            // href={`/sawtar/cms/products/inventory/${item._id}`}
            title="Manage Inventory"
            className="text-purple-600"
          />
        </div>
      ),
    },
  ];

  // Expandable row for asset verification details
  const expandedRowRender = (item) => {
    const documentFields = ['product_invoice', 'product_certificate', 'quality_report'];
    const documents = documentFields
      .filter((field) => item.documents[field])
      .map((field) => ({
        type: field,
        ...item.documents[field],
      }));
    const images = item.color_variants.flatMap((variant) =>
      variant.images.map((img) => ({
        type: `Image (${variant.color_name})`,
        ...img,
      }))
    );

    return (
      <Collapse>
        <Panel header="Asset Verification Details" key="assets">
          {documents.map((doc) => (
            <div key={doc._id} className="mb-2">
              <div className="flex items-center">
                <FiFileText className="mr-2" />
                <span>{doc.type}: </span>
                <Tag color={doc.verified ? 'green' : 'red'} className="ml-2">
                  {doc.verified ? 'Verified' : 'Not Verified'}
                </Tag>
              </div>
              {!doc.verified && doc.reason && (
                <div className="text-sm text-gray-500 ml-6">
                  Reason: {doc.reason}
                  {doc.suggestion && <div>Suggestion: {doc.suggestion}</div>}
                </div>
              )}
            </div>
          ))}
          {images.map((img) => (
            <div key={img._id} className="mb-2">
              <div className="flex items-center">
                <FiImage className="mr-2" />
                <span>{img.type}: {img.alt_text}</span>
                <Tag color={img.verified ? 'green' : 'red'} className="ml-2">
                  {img.verified ? 'Verified' : 'Not Verified'}
                </Tag>
              </div>
              {!img.verified && img.reason && (
                <div className="text-sm text-gray-500 ml-6">
                  Reason: {img.reason}
                  {img.suggestion && <div>Suggestion: {img.suggestion}</div>}
                </div>
              )}
            </div>
          ))}
          {item.three_d_model && (
            <div className="mb-2">
              <div className="flex items-center">
                <FiFileText className="mr-2" />
                <span>3D Model</span>
                <Tag color={item.three_d_model.verified ? 'green' : 'red'} className="ml-2">
                  {item.three_d_model.verified ? 'Verified' : 'Not Verified'}
                </Tag>
              </div>
              {!item.three_d_model.verified && item.three_d_model.reason && (
                <div className="text-sm text-gray-500 ml-6">
                  Reason: {item.three_d_model.reason}
                  {item.three_d_model.suggestion && <div>Suggestion: {item.three_d_model.suggestion}</div>}
                </div>
              )}
            </div>
          )}
        </Panel>
      </Collapse>
    );
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto">
        <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: '16px 24px' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">All B2C Vendor Products</h1>
              <p className="text-gray-500 mt-1">
                View all products with vendor details |{' '}
                {/* <Link to="/sawtar/cms/products" className="text-blue-600 hover:underline">
                  Go to Products Page
                </Link> */}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleRefresh}
                icon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
                loading={loading}
                className="flex items-center gap-2"
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<FiPlus />}
                href="/sawtar/cms/products/add"
                className="flex items-center gap-2"
              >
                Add Product
              </Button>
            </div>
          </div>
        </Card>

        <Tabs activeKey={activeTab} onChange={handleTabChange} className="mb-6">
          <TabPane tab="All Products" key="all" />
          <TabPane tab="Pending Requests" key="pending" />
          <TabPane tab="Approved Products" key="approved" />
          <TabPane tab="Rejected Products" key="rejected" />
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-md border-0 rounded-xl">
            <Statistic
              title="Total Products"
              value={stats.total}
              prefix={<FiShoppingBag className="text-blue-600" />}
              valueStyle={{ color: '#3f51b5', fontWeight: 500 }}
            />
          </Card>
          <Card className="shadow-md border-0 rounded-xl">
            <Statistic
              title="Pending"
              value={stats.pending}
              prefix={<FiClock className="text-yellow-600" />}
              valueStyle={{ color: '#ff9800', fontWeight: 500 }}
            />
          </Card>
          <Card className="shadow-md border-0 rounded-xl">
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<FiCheck className="text-green-600" />}
              valueStyle={{ color: '#4caf50', fontWeight: 500 }}
            />
          </Card>
          <Card className="shadow-md border-0 rounded-xl">
            <Statistic
              title="Rejected"
              value={stats.rejected}
              prefix={<FiX className="text-red-600" />}
              valueStyle={{ color: '#f44336', fontWeight: 500 }}
            />
          </Card>
        </div>

        <CustomTable
          columns={productColumns}
          data={dataWithSno}
          totalItems={pagination.totalResults}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onFilter={handleFilter}
          loading={loading}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => record.documents || record.color_variants.length > 0 || record.three_d_model,
          }}
          filters={[
            {
              key: 'search',
              type: 'text',
              placeholder: 'Search by name or description...',
            },
            {
              key: 'category_id',
              type: 'select',
              placeholder: 'All Categories',
              options: [{ value: '', label: 'All Categories' }, ...categories.map((cat) => ({ value: cat._id, label: cat.name }))],
            },
            {
              key: 'date_filter',
              type: 'select',
              placeholder: 'All Dates',
              options: [
                { value: '', label: 'All Dates' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'new', label: 'Last 24 Hours' },
              ],
            },
          ]}
          emptyMessage={
            activeTab === 'all'
              ? 'No products found.'
              : activeTab === 'pending'
              ? 'No pending product requests found.'
              : activeTab === 'approved'
              ? 'No approved products found.'
              : 'No rejected products found.'
          }
        />
      </div>
    </div>
  );
};

export default AllVendorProductB2C;
