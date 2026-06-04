// src/components/CMS/pages/currencies/Currencies.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  Typography,
  Popconfirm,
  Tooltip,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UndoOutlined,
  GlobalOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  StopOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import CustomTable from '../../pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';
import { useForm, Controller } from 'react-hook-form';

const { Title, Text } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1", // Purple
  secondary: "#1890ff", // Blue
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const Currency = () => {
  const { token } = useSelector((state) => state.auth);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({});

  const { control, handleSubmit, reset, setError, clearErrors, formState: { errors: formErrors } } = useForm({
    defaultValues: {
      code: '',
      name: '',
      symbol: '',
      exchangeRate: '',
      isDefault: false,
      status: true,
    },
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    fetchCurrencies();
  }, [token]);

  // --- STATS CALCULATION (Based on current page data for UI demo) ---
  const stats = useMemo(() => {
    return {
      total: pagination.totalResults,
      active: currencies.filter(c => c.status === 1).length,
      defaultCode: currencies.find(c => c.isDefault)?.code || 'N/A'
    };
  }, [currencies, pagination.totalResults]);

  const fetchCurrencies = async (page = 1, itemsPerPage = 10, filters = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };

      if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
        params.status = Number(filters.status);
      }

      if (filters.isDefault !== undefined && filters.isDefault !== null && filters.isDefault !== '') {
        params.isDefault = filters.isDefault === true || filters.isDefault === 'true';
      }

      const response = await apiService.get('/setting/currency', params);

      setCurrencies(response.currencies || []);
      setPagination({
        currentPage: response.pagination.currentPage || 1,
        totalPages: response.pagination.totalPages || 1,
        totalResults: response.pagination.totalRecords || 0,
        itemsPerPage: response.pagination.perPage || 10,
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch currencies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters) => {
    if (!newFilters || Object.keys(newFilters).length === 0) {
      setFilters({});
      fetchCurrencies(1, pagination.itemsPerPage, {});
      return;
    }

    const formattedFilters = {
      ...newFilters,
      status:
        newFilters.status === true || newFilters.status === '1'
          ? 1
          : newFilters.status === false || newFilters.status === '0'
          ? 0
          : undefined,
      isDefault:
        newFilters.isDefault === true || newFilters.isDefault === 'true'
          ? true
          : newFilters.isDefault === false || newFilters.isDefault === 'false'
          ? false
          : undefined,
    };

    setFilters(formattedFilters);
    fetchCurrencies(1, pagination.itemsPerPage, formattedFilters);
  };

  const handlePageChange = (page, itemsPerPage) => {
    fetchCurrencies(page, itemsPerPage, filters);
  };

  const openEditCurrency = (currency) => {
    setEditingCurrency(currency);
    reset({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchangeRate: currency.exchangeRate.toString(),
      isDefault: currency.isDefault,
      status: currency.status === 1,
    });
    clearErrors();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCurrency(null);
    reset();
    clearErrors();
  };

  const handleSaveCurrency = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        code: data.code.toUpperCase(),
        name: data.name,
        symbol: data.symbol,
        exchangeRate: parseFloat(data.exchangeRate),
        isDefault: data.isDefault,
        status: data.status ? 1 : 0,
      };
      let response;
      if (editingCurrency) {
        response = await apiService.put(`/setting/currency/${editingCurrency._id}`, payload);
        setCurrencies(currencies.map((c) => (c._id === editingCurrency._id ? response.currency : c)));
        showSuccessAlert('Success', 'Currency updated successfully');
      } else {
        response = await apiService.post('/setting/currency', payload);
        setCurrencies([...currencies, response.currency]);
        showSuccessAlert('Success', 'Currency created successfully');
      }
      setIsModalOpen(false);
      setEditingCurrency(null);
      reset();
      clearErrors();
      // Refresh to ensure defaults are handled correctly on backend
      fetchCurrencies(pagination.currentPage, pagination.itemsPerPage, filters);
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          setError(err.field, { type: 'manual', message: err.message });
        });
        showErrorAlert('Error', 'Please correct the errors in the form');
      } else {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to save currency');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoftDeleteCurrency = async (currencyId) => {
    const result = await showConfirmDialog(
      'Confirm Soft Delete',
      'Are you sure you want to soft delete this currency? It will be marked as inactive.',
      'Delete'
    );

    if (result.isConfirmed) {
      try {
        await apiService.delete(`/setting/currency/${currencyId}`);
        setCurrencies(currencies.map((c) => (c._id === currencyId ? { ...c, status: 0 } : c)));
        showSuccessAlert('Success', 'Currency soft deleted successfully');
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to soft delete currency');
      }
    }
  };

  const handlePermanentDeleteCurrency = async (currencyId) => {
    const result = await showConfirmDialog(
      'Confirm Permanent Delete',
      'Are you sure you want to permanently delete this currency? This action cannot be undone.',
      'Delete Permanently',
      'error'
    );

    if (result.isConfirmed) {
      try {
        await apiService.delete(`/setting/currency/${currencyId}/permanent`);
        setCurrencies(currencies.filter((c) => c._id !== currencyId));
        showSuccessAlert('Success', 'Currency permanently deleted successfully');
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to permanently delete currency');
      }
    }
  };

  const handleRestoreCurrency = async (currencyId) => {
    const result = await showConfirmDialog(
      'Confirm Restore',
      'Are you sure you want to restore this currency? It will be marked as active.',
      'Restore'
    );

    if (result.isConfirmed) {
      try {
        await apiService.put(`/setting/currency/${currencyId}/restore`);
        setCurrencies(currencies.map((c) => (c._id === currencyId ? { ...c, status: 1 } : c)));
        showSuccessAlert('Success', 'Currency restored successfully');
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to restore currency');
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        title: 'Currency Code',
        sortable: true,
        render: (value) => <Tag color="purple" style={{ fontSize: '13px', fontWeight: 600 }}>{value}</Tag>,
      },
      {
        key: 'name',
        title: 'Name',
        sortable: true,
        render: (value) => <span className="font-medium text-gray-800">{value}</span>,
      },
      {
        key: 'symbol',
        title: 'Symbol',
        render: (value) => (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold">
                {value}
            </div>
        ),
        width: 100,
        align: 'center'
      },
      {
        key: 'exchangeRate',
        title: 'Exchange Rate',
        sortable: true,
        render: (value) => <span className="text-gray-900 font-mono">{value.toFixed(4)}</span>,
      },
      {
        key: 'isDefault',
        title: 'Default',
        sortable: true,
        filterable: true,
        filterKey: 'isDefault',
        filterOptions: [
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ],
        render: (value) => (
          value ? 
          <Tag color="gold" icon={<StarFilled />}>Default</Tag> : 
          <span className="text-gray-400">-</span>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        sortable: true,
        filterable: true,
        filterKey: 'status',
        filterOptions: [
          { value: 1, label: 'Active' },
          { value: 0, label: 'Inactive' },
        ],
        render: (value) => (
          <Badge 
            status={value === 1 ? 'success' : 'error'} 
            text={value === 1 ? 'Active' : 'Inactive'} 
          />
        ),
      },
      {
        key: 'actions',
        title: 'Actions',
        align: 'center',
        render: (value, record) => (
          <Space size="small">
            <Tooltip title="Edit">
              <Button
                size="small"
                shape="circle"
                icon={<EditOutlined style={{ color: THEME.primary }} />}
                style={{ borderColor: THEME.primary }}
                onClick={() => openEditCurrency(record)}
              />
            </Tooltip>
            {record.status === 1 ? (
              <Popconfirm
                title="Soft Delete"
                description="Mark as inactive?"
                onConfirm={() => handleSoftDeleteCurrency(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" shape="circle" icon={<DeleteOutlined />} danger />
              </Popconfirm>
            ) : (
              <Space size={2}>
                <Tooltip title="Restore">
                    <Popconfirm
                        title="Restore"
                        onConfirm={() => handleRestoreCurrency(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button size="small" shape="circle" icon={<UndoOutlined />} className="text-green-600 border-green-600" />
                    </Popconfirm>
                </Tooltip>
                <Tooltip title="Delete Forever">
                    <Popconfirm
                        title="Permanent Delete"
                        description="Cannot be undone."
                        onConfirm={() => handlePermanentDeleteCurrency(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button size="small" shape="circle" icon={<DeleteOutlined />} danger type="primary" />
                    </Popconfirm>
                </Tooltip>
              </Space>
            )}
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      
      {/* 1. Header & Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <Title level={3} style={{ margin: 0 }}>Currency Management</Title>
                <Text type="secondary">Manage global currencies and exchange rates.</Text>
            </div>
            <Space>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchCurrencies(pagination.currentPage, pagination.itemsPerPage, filters)}
                    size="large"
                >
                    Refresh
                </Button>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingCurrency(null);
                        reset();
                        setIsModalOpen(true);
                    }}
                    size="large"
                    style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
                >
                    Add Currency
                </Button>
            </Space>
        </div>

        <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
                    <Statistic 
                        title="Total Currencies" 
                        value={stats.total} 
                        prefix={<GlobalOutlined style={{ color: THEME.primary }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
                    <Statistic 
                        title="Active Currencies" 
                        value={stats.active} 
                        prefix={<CheckCircleOutlined style={{ color: THEME.success }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
                    <Statistic 
                        title="Default Currency" 
                        value={stats.defaultCode} 
                        prefix={<StarFilled style={{ color: THEME.warning }} />} 
                    />
                </Card>
            </Col>
        </Row>
      </div>

      {/* 2. Main Table Card */}
      <Card 
        bordered={false} 
        className="shadow-md rounded-lg"
        bodyStyle={{ padding: 0 }}
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <DollarOutlined style={{ fontSize: '20px', color: THEME.primary }} />
            <span className="font-semibold text-lg text-gray-700">Currency List</span>
        </div>
        <CustomTable
            columns={columns}
            data={currencies}
            totalItems={pagination.totalResults}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onFilter={handleFilter}
            loading={loading}
        />
      </Card>

      {/* 3. Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-purple-800">
                {editingCurrency ? <EditOutlined /> : <PlusOutlined />}
                {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
            </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        maskClosable={false}
        width={650}
      >
        <Divider className="my-3" />
        <Form layout="vertical" onFinish={handleSubmit(handleSaveCurrency)} className="mt-4">
          <Row gutter={16}>
             <Col span={12}>
                <Controller
                    name="name"
                    control={control}
                    rules={{
                    required: 'Please input the currency name!',
                    maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
                    }}
                    render={({ field }) => (
                    <Form.Item
                        label="Currency Name"
                        required
                        validateStatus={formErrors.name ? 'error' : ''}
                        help={formErrors.name?.message}
                    >
                        <Input {...field} placeholder="e.g. United States Dollar" size="large" />
                    </Form.Item>
                    )}
                />
             </Col>
             <Col span={12}>
                <Controller
                    name="code"
                    control={control}
                    rules={{
                    required: 'Please input the currency code!',
                    pattern: {
                        value: /^[A-Z]{3}$/,
                        message: 'Code must be a 3-letter ISO code (e.g., USD)',
                    },
                    }}
                    render={({ field }) => (
                    <Form.Item
                        label="ISO Code"
                        required
                        validateStatus={formErrors.code ? 'error' : ''}
                        help={formErrors.code?.message}
                    >
                        <Input {...field} placeholder="e.g. USD" size="large" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                    )}
                />
             </Col>
          </Row>

          <Row gutter={16}>
             <Col span={12}>
                <Controller
                    name="symbol"
                    control={control}
                    rules={{ required: 'Please input the currency symbol!' }}
                    render={({ field }) => (
                    <Form.Item
                        label="Symbol"
                        required
                        validateStatus={formErrors.symbol ? 'error' : ''}
                        help={formErrors.symbol?.message}
                    >
                        <Input {...field} placeholder="e.g. $" size="large" />
                    </Form.Item>
                    )}
                />
             </Col>
             <Col span={12}>
                <Controller
                    name="exchangeRate"
                    control={control}
                    rules={{
                    required: 'Please input the exchange rate!',
                    validate: (value) =>
                        parseFloat(value) > 0 ? true : 'Exchange rate must be positive',
                    }}
                    render={({ field }) => (
                    <Form.Item
                        label="Exchange Rate"
                        required
                        validateStatus={formErrors.exchangeRate ? 'error' : ''}
                        help={formErrors.exchangeRate?.message}
                    >
                        <Input {...field} type="number" step="0.0001" placeholder="1.0000" size="large" prefix={<GlobalOutlined className="text-gray-400" />} />
                    </Form.Item>
                    )}
                />
             </Col>
          </Row>

          <div className="bg-gray-50 p-4 rounded-lg mt-2 border border-gray-100">
              <Row gutter={16}>
                <Col span={12}>
                    <Controller
                        name="isDefault"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                        <Form.Item label="Set as Default" style={{ marginBottom: 0 }}>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={value}
                                    onChange={onChange}
                                    checkedChildren={<StarFilled />}
                                    unCheckedChildren={<StarOutlined />}
                                />
                                <span className="text-xs text-gray-500">Use this currency by default</span>
                            </div>
                        </Form.Item>
                        )}
                    />
                </Col>
                <Col span={12}>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                        <Form.Item label="Status" style={{ marginBottom: 0 }}>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={value}
                                    onChange={onChange}
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                />
                                <span className="text-xs text-gray-500">Enable/Disable currency</span>
                            </div>
                        </Form.Item>
                        )}
                    />
                </Col>
              </Row>
          </div>

          <Form.Item className="text-right mt-6 mb-0">
            <Space>
              <Button onClick={handleCancel} size="large">Cancel</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                size="large"
                style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
              >
                {editingCurrency ? 'Update Currency' : 'Add Currency'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Currency;