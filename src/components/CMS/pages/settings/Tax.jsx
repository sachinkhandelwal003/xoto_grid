// src/components/CMS/pages/taxes/Taxes.jsx
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
  PercentageOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  StopOutlined
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

const Tax = () => {
  const { token } = useSelector((state) => state.auth);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
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
      taxName: '',
      rate: '',
      status: true,
    },
  });

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    fetchTaxes();
  }, [token]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const activeCount = taxes.filter(t => t.status === 1).length;
    const avgRate = taxes.length > 0 
      ? (taxes.reduce((acc, curr) => acc + curr.rate, 0) / taxes.length).toFixed(1) 
      : 0;
    return {
      total: pagination.totalResults,
      active: activeCount,
      avgRate: avgRate
    };
  }, [taxes, pagination.totalResults]);

  const fetchTaxes = async (page = 1, itemsPerPage = 10, filters = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };

      if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
        params.status = Number(filters.status);
      }

      const response = await apiService.get('/setting/tax', params);

      setTaxes(response.taxes || []);
      setPagination({
        currentPage: response.pagination.currentPage || 1,
        totalPages: response.pagination.totalPages || 1,
        totalResults: response.pagination.totalRecords || 0,
        itemsPerPage: response.pagination.perPage || 10,
      });
    } catch (error) {
      console.error('Fetch taxes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters) => {
    if (!newFilters || Object.keys(newFilters).length === 0 || newFilters.status === undefined || newFilters.status === '') {
      setFilters({});
      fetchTaxes(1, pagination.itemsPerPage, {});
    } else {
      const formattedFilters = {
        ...newFilters,
        status: newFilters.status === true || newFilters.status === '1' ? 1
          : newFilters.status === false || newFilters.status === '0' ? 0
          : undefined,
      };

      setFilters(formattedFilters);
      fetchTaxes(1, pagination.itemsPerPage, formattedFilters);
    }
  };

  const handlePageChange = (page, itemsPerPage) => {
    fetchTaxes(page, itemsPerPage, filters);
  };

  const openEditTax = (tax) => {
    setEditingTax(tax);
    reset({
      taxName: tax.taxName,
      rate: tax.rate.toString(),
      status: tax.status === 1,
    });
    clearErrors();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTax(null);
    reset();
    clearErrors();
  };

  const handleSaveTax = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        taxName: data.taxName,
        rate: parseFloat(data.rate),
        status: data.status ? 1 : 0,
      };
      let response;
      if (editingTax) {
        response = await apiService.put(`/setting/tax/${editingTax._id}`, payload);
        setTaxes(taxes.map((t) => (t._id === editingTax._id ? response.tax : t)));
        showSuccessAlert('Success', 'Tax updated successfully');
      } else {
        response = await apiService.post('/setting/tax', payload);
        setTaxes([...taxes, response.tax]);
        showSuccessAlert('Success', 'Tax created successfully');
      }
      setIsModalOpen(false);
      setEditingTax(null);
      reset();
      clearErrors();
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          setError(err.field, { type: 'manual', message: err.message });
        });
        showErrorAlert('Error', 'Please correct the errors in the form');
      } else {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to save tax');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoftDeleteTax = async (taxId) => {
    const result = await showConfirmDialog(
      'Confirm Soft Delete',
      'Are you sure you want to soft delete this tax? It will be marked as inactive.',
      'Delete'
    );

    if (result.isConfirmed) {
      try {
        await apiService.delete(`/setting/tax/${taxId}`);
        setTaxes(taxes.map((t) => (t._id === taxId ? { ...t, status: 0 } : t)));
        showSuccessAlert('Success', 'Tax soft deleted successfully');
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to soft delete tax');
      }
    }
  };

  const handlePermanentDeleteTax = async (taxId) => {
    const result = await showConfirmDialog(
      'Confirm Permanent Delete',
      'Are you sure you want to permanently delete this tax? This action cannot be undone.',
      'Delete Permanently',
      'error'
    );

    if (result.isConfirmed) {
      try {
        await apiService.delete(`/setting/tax/${taxId}/permanent`);
        setTaxes(taxes.filter((t) => t._id !== taxId));
        showSuccessAlert('Success', 'Tax permanently deleted successfully');
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to permanently delete tax');
      }
    }
  };

  const handleRestoreTax = async (taxId) => {
    const result = await showConfirmDialog(
      'Confirm Restore',
      'Are you sure you want to restore this tax? It will be marked as active.',
      'Restore'
    );

    if (result.isConfirmed) {
      try {
        await apiService.put(`/setting/tax/${taxId}/restore`);
        setTaxes(taxes.map((t) => (t._id === taxId ? { ...t, status: 1 } : t)));
        showSuccessAlert('Success', 'Tax restored successfully');
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || 'Failed to restore tax');
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'taxName',
        title: 'Tax Name',
        sortable: true,
        render: (value) => <span className="font-semibold text-gray-800">{value}</span>,
      },
      {
        key: 'rate',
        title: 'Rate',
        sortable: true,
        render: (value) => (
            <Tag color="purple" style={{ fontSize: '13px' }}>
                {value.toFixed(2)}%
            </Tag>
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
        key: 'createdAt',
        title: 'Created At',
        sortable: true,
        render: (value) => (
          <span className="text-gray-500 text-xs">{value ? new Date(value).toLocaleDateString() : '--'}</span>
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
                onClick={() => openEditTax(record)}
              />
            </Tooltip>
            {record.status === 1 ? (
              <Popconfirm
                title="Soft Delete"
                description="Mark as inactive?"
                onConfirm={() => handleSoftDeleteTax(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" shape="circle" icon={<DeleteOutlined />} danger />
              </Popconfirm>
            ) : (
              <Space size={2}>
                <Tooltip title="Restore">
                    <Popconfirm
                        title="Restore Tax"
                        onConfirm={() => handleRestoreTax(record._id)}
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
                        onConfirm={() => handlePermanentDeleteTax(record._id)}
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
                <Title level={3} style={{ margin: 0 }}>Tax Rules</Title>
                <Text type="secondary">Configure tax rates for invoices and products.</Text>
            </div>
            <Space>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchTaxes(pagination.currentPage, pagination.itemsPerPage, filters)}
                    size="large"
                >
                    Refresh
                </Button>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingTax(null);
                        reset();
                        setIsModalOpen(true);
                    }}
                    size="large"
                    style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
                >
                    Add Tax
                </Button>
            </Space>
        </div>

        <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
                    <Statistic 
                        title="Total Tax Rules" 
                        value={stats.total} 
                        prefix={<FileProtectOutlined style={{ color: THEME.primary }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
                    <Statistic 
                        title="Active Rules" 
                        value={stats.active} 
                        prefix={<CheckCircleOutlined style={{ color: THEME.success }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
                    <Statistic 
                        title="Average Rate" 
                        value={stats.avgRate} 
                        suffix="%"
                        prefix={<PercentageOutlined style={{ color: THEME.warning }} />} 
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
            <PercentageOutlined style={{ fontSize: '20px', color: THEME.primary }} />
            <span className="font-semibold text-lg text-gray-700">Tax Rates List</span>
        </div>
        <CustomTable
            columns={columns}
            data={taxes}
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
                {editingTax ? <EditOutlined /> : <PlusOutlined />}
                {editingTax ? 'Edit Tax Rule' : 'Add New Tax Rule'}
            </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        maskClosable={false}
        width={500}
      >
        <Divider className="my-3" />
        <Form layout="vertical" onFinish={handleSubmit(handleSaveTax)} className="mt-4">
          <Row gutter={16}>
             <Col span={12}>
                <Controller
                    name="taxName"
                    control={control}
                    rules={{
                    required: 'Please input the tax name!',
                    maxLength: { value: 50, message: 'Tax name cannot exceed 50 characters' },
                    pattern: {
                        value: /^[a-zA-Z0-9\s\-&]+$/,
                        message: 'Letters, numbers, spaces, hyphens only',
                    },
                    }}
                    render={({ field }) => (
                    <Form.Item
                        label="Tax Name"
                        required
                        validateStatus={formErrors.taxName ? 'error' : ''}
                        help={formErrors.taxName?.message}
                    >
                        <Input {...field} placeholder="e.g. VAT, GST" size="large" />
                    </Form.Item>
                    )}
                />
             </Col>
             <Col span={12}>
                <Controller
                    name="rate"
                    control={control}
                    rules={{
                    required: 'Please input the tax rate!',
                    validate: (value) =>
                        parseFloat(value) >= 0 && parseFloat(value) <= 100
                        ? true
                        : 'Rate must be between 0 and 100',
                    }}
                    render={({ field }) => (
                    <Form.Item
                        label="Rate (%)"
                        required
                        validateStatus={formErrors.rate ? 'error' : ''}
                        help={formErrors.rate?.message}
                    >
                        <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            size="large" 
                            suffix="%" 
                        />
                    </Form.Item>
                    )}
                />
             </Col>
          </Row>

          <div className="bg-gray-50 p-4 rounded-lg mt-2 border border-gray-100">
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
                        <span className="text-xs text-gray-500">Enable or disable this tax rule</span>
                    </div>
                  </Form.Item>
                )}
              />
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
                {editingTax ? 'Update Tax' : 'Create Tax'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tax;