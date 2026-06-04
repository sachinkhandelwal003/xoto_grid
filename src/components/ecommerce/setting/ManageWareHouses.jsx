import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiPlus, FiRefreshCw, FiEdit, FiTrash2, FiMapPin, 
  FiSmartphone, FiMail, FiUser, FiSearch, FiPackage, 
  FiCheckCircle, FiXCircle 
} from 'react-icons/fi';
import { 
  Button, Modal, Form, Input, InputNumber, Select, 
  Row, Col, Alert, Badge, Space, Tooltip, Statistic, Card 
} from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../../manageApi/utils/sweetAlert';
import CustomTable from '../../../components/CMS/pages/custom/CustomTable';

const { Option } = Select;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const ManageWarehouses = () => {
  const { user } = useSelector((state) => state.auth);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
  });

  // Modal & Form State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]); // Array of { field, message }
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- FETCH DATA ---
  const fetchWarehouses = useCallback(async (page = 1, pageSize = 10, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        vendor_id: user.id,
        ...currentFilters,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) delete params[key];
      });
      
      const response = await apiService.get('/vendor/warehouses', { params });
      
      setWarehouses(response.warehouses || []);
      setPagination({
        current: response.pagination?.page || 1,
        pageSize: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      showErrorAlert('Error', error.response?.data?.message || 'Failed to fetch warehouses');
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, [user.id, filters]);

  useEffect(() => {
    if (user.id) {
      fetchWarehouses(pagination.current, pagination.pageSize, filters);
    }
  }, [user.id, refreshTrigger, fetchWarehouses]);

  // --- HANDLERS ---
  const handleTableChange = (newPage, newPageSize) => {
    setPagination(prev => ({ ...prev, current: newPage, pageSize: newPageSize }));
    fetchWarehouses(newPage, newPageSize, filters);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchWarehouses(1, pagination.pageSize, filters);
  };

  const clearFilters = () => {
    const resetFilters = { search: '', city: '', state: '' };
    setFilters(resetFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchWarehouses(1, pagination.pageSize, resetFilters);
  };

  // --- MODAL & CRUD ---
  const showModal = (warehouse = null) => {
    setServerErrors([]);
    setEditingWarehouse(warehouse);
    
    if (warehouse) {
      form.setFieldsValue({
        ...warehouse,
        mobile: {
          country_code: warehouse.mobile?.country_code || '+91',
          number: warehouse.mobile?.number || '',
        },
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        active: true,
        country: 'India',
        mobile: { country_code: '+91' },
        capacity_units: 1000,
      });
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setServerErrors([]);

    try {
      const payload = {
        ...values,
        mobile: {
          country_code: values.mobile?.country_code || '+91',
          number: values.mobile?.number,
        },
      };

      if (editingWarehouse) {
        await apiService.put(`/vendor/warehouses/${editingWarehouse._id}`, payload);
        showSuccessAlert('Success', 'Warehouse updated successfully');
      } else {
        await apiService.post('/vendor/warehouses', payload);
        showSuccessAlert('Success', 'Warehouse created successfully');
      }

      setIsModalVisible(false);
      handleRefresh();
    } catch (error) {
      const res = error.response?.data;

      if (res?.errors && Array.isArray(res.errors)) {
        const errors = res.errors;
        setServerErrors(errors);

        // Map server errors to AntD form fields
        const fieldErrors = errors.map(err => {
          const fieldName = err.field;

          if (fieldName.startsWith('mobile.')) {
            const subField = fieldName.split('.')[1]; // 'number' or 'country_code'
            return {
              name: ['mobile', subField],
              errors: [err.message],
            };
          }

          return {
            name: fieldName,
            errors: [err.message],
          };
        });

        form.setFields(fieldErrors);

        // Scroll to first error
        setTimeout(() => {
          const firstError = errors[0];
          let selector = `[name="${firstError.field}"]`;

          if (firstError.field.includes('.')) {
            const parts = firstError.field.split('.');
            selector = `[name="${parts[0]}[${parts[1]}]"]`;
          }

          const el = document.querySelector(selector);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

      } else {
        const msg = res?.message || 'Failed to save warehouse. Please try again.';
        showErrorAlert('Error', msg);
        setServerErrors([{ field: 'general', message: msg }]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirmDialog(
      'Delete Warehouse',
      'Are you sure you want to delete this warehouse? This action cannot be undone.',
      'Yes, Delete'
    );

    if (result.isConfirmed) {
      try {
        await apiService.delete(`/vendor/warehouses/${id}`);
        showSuccessAlert('Deleted', 'Warehouse deleted successfully');
        handleRefresh();
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to delete warehouse');
      }
    }
  };

  const handleStatusToggle = async (warehouse) => {
    try {
      await apiService.put(`/vendor/warehouses/${warehouse._id}`, {
        active: !warehouse.active,
      });
      showSuccessAlert('Success', 'Status updated successfully');
      handleRefresh();
    } catch (error) {
      showErrorAlert('Error', 'Failed to update status');
    }
  };

  // --- COLUMNS ---
  const columns = useMemo(() => [
    {
      title: 'Warehouse Info',
      width: 250,
      render: (_, r) => (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
             <FiPackage size={20} />
          </div>
          <div>
            <div className="font-semibold text-gray-800">{r.name}</div>
            <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded inline-block mt-1">
              {r.code}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <FiUser size={10} /> {r.contact_person}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Details',
      width: 250,
      render: (_, r) => (
        <div className="text-sm space-y-1">
          {r.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiMail className="text-blue-500" /> {r.email}
            </div>
          )}
          {r.mobile?.number && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiSmartphone className="text-green-500" /> 
              {r.mobile.country_code} {r.mobile.number}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      width: 250,
      render: (_, r) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <FiMapPin className="text-red-500 mt-1 flex-shrink-0" />
            <div>
              <div>{r.address}</div>
              <div className="text-xs text-gray-400">
                {[r.city, r.state, r.country].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity_units',
      width: 150,
      render: (val) => (
        <div className="font-medium text-gray-700">
           {val ? val.toLocaleString() : 0} <span className="text-xs text-gray-400">units</span>
        </div>
      ),
    },
    {
      title: 'Status',
      width: 120,
      render: (_, r) => (
        <Badge
          status={r.active ? 'success' : 'error'}
          text={
            <span className={r.active ? 'text-green-600 font-medium' : 'text-red-500'}>
              {r.active ? 'Active' : 'Inactive'}
            </span>
          }
        />
      ),
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: 150,
      render: (_, r) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              shape="circle"
              icon={<FiEdit className="text-blue-600" />}
              onClick={() => showModal(r)}
            />
          </Tooltip>
          <Tooltip title={r.active ? "Deactivate" : "Activate"}>
             <Button 
                type="text"
                shape="circle"
                icon={r.active ? <FiXCircle className="text-orange-500"/> : <FiCheckCircle className="text-green-500"/>}
                onClick={() => handleStatusToggle(r)}
             />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              shape="circle"
              danger
              icon={<FiTrash2 />}
              onClick={() => handleDelete(r._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER & STATS */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 m-0">Manage Warehouses</h1>
                <p className="text-gray-500 m-0">Create, edit and manage your storage locations</p>
            </div>
            <div className="flex gap-2">
                <Button 
                    icon={<FiRefreshCw className={loading ? 'animate-spin' : ''}/>} 
                    onClick={handleRefresh}
                    size="large"
                >
                    Refresh
                </Button>
                <Button 
                    type="primary" 
                    icon={<FiPlus />} 
                    onClick={() => showModal()}
                    size="large"
                    style={{ backgroundColor: THEME.primary }}
                >
                    Add Warehouse
                </Button>
            </div>
        </div>

        <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
                    <Statistic 
                        title="Total Warehouses" 
                        value={pagination.total} 
                        prefix={<FiPackage />} 
                        valueStyle={{ color: THEME.primary }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
                    <Statistic 
                        title="Active Locations" 
                        value={warehouses.filter(w => w.active).length} 
                        prefix={<FiCheckCircle />} 
                        valueStyle={{ color: THEME.success }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
                    <Statistic 
                        title="Inactive Locations" 
                        value={warehouses.filter(w => !w.active).length} 
                        prefix={<FiXCircle />} 
                        valueStyle={{ color: THEME.warning }}
                    />
                </Card>
            </Col>
        </Row>
      </div>

      {/* MAIN TABLE CARD */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        
        <div className="p-4 border-b border-gray-100 bg-white rounded-t-lg">
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={8}>
                    <Input 
                        prefix={<FiSearch className="text-gray-400" />}
                        placeholder="Search Name or Code..." 
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        onPressEnter={applyFilters}
                        allowClear
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Input 
                        placeholder="Filter by City" 
                        value={filters.city}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                        onPressEnter={applyFilters}
                    />
                </Col>
                <Col xs={12} md={6}>
                    <Input 
                        placeholder="Filter by State" 
                        value={filters.state}
                        onChange={(e) => handleFilterChange('state', e.target.value)}
                        onPressEnter={applyFilters}
                    />
                </Col>
                <Col xs={24} md={4} className="flex justify-end gap-2">
                    <Button type="primary" ghost onClick={applyFilters} block>Filter</Button>
                    <Button onClick={clearFilters} block>Clear</Button>
                </Col>
            </Row>
        </div>

        <div className="p-0">
             <CustomTable
                columns={columns}
                data={warehouses}
                loading={loading}
                totalItems={pagination.total}
                currentPage={pagination.current}
                itemsPerPage={pagination.pageSize}
                onPageChange={handleTableChange}
                scroll={{ x: 1000 }}
             />
        </div>
      </Card>

      {/* MODAL */}
      <Modal
        title={editingWarehouse ? 'Edit Warehouse Details' : 'Add New Warehouse'}
        open={isModalVisible}
        onCancel={() => {
            setIsModalVisible(false);
            setServerErrors([]);
            form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
        maskClosable={false}
      >
      

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            active: true,
            mobile: { country_code: '+91' },
            country: 'India'
          }}
        >
          {/* Basic Info */}
          <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-100">
            <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
              <FiPackage /> Basic Information
            </h3>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="Warehouse Name" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="e.g. Main Hub" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="code" label="Warehouse Code" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="e.g. WH-MUM-01" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="capacity_units" label="Storage Capacity (Units)">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                {editingWarehouse && (
                  <Form.Item name="active" label="Status">
                    <Select>
                      <Option value={true}>Active</Option>
                      <Option value={false}>Inactive</Option>
                    </Select>
                  </Form.Item>
                )}
              </Col>
            </Row>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-100">
            <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
              <FiUser /> Contact Details
            </h3>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="contact_person" label="Contact Person Name" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="Manager Name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="email" 
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Required' },
                    { type: 'email', message: 'Invalid email' }
                  ]}
                >
                  <Input placeholder="manager@example.com" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Mobile Number" required style={{ marginBottom: 0 }}>
                  <Input.Group compact>
                    <Form.Item name={['mobile', 'country_code']} noStyle rules={[{ required: true, message: 'Required' }]}>
                      <Select style={{ width: '30%' }}>
                        <Option value="+91">+91 (IND)</Option>
                        <Option value="+1">+1 (USA)</Option>
                        <Option value="+44">+44 (UK)</Option>
                        <Option value="+971">+971 (UAE)</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item 
                      name={['mobile', 'number']} 
                      noStyle 
                      rules={[
                        { required: true, message: 'Required' },
                        { pattern: /^\d+$/, message: 'Digits only' }
                      ]}
                    >
                      <Input style={{ width: '70%' }} placeholder="9876543210" />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Location Info */}
          <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-100">
            <h3 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
              <FiMapPin /> Location Details
            </h3>
            <Form.Item name="address" label="Street Address" rules={[{ required: true, message: 'Required' }]}>
              <Input.TextArea rows={2} placeholder="Building No, Street Name, Area" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="city" label="City" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="Mumbai" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="state" label="State" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="Maharashtra" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Required' }]}>
                  <Input placeholder="India" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setIsModalVisible(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              style={{ backgroundColor: THEME.primary }}
            >
              {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageWarehouses;