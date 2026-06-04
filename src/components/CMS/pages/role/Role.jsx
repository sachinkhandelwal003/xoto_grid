import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Space,
  Tag,
  Popconfirm,
  Tooltip,
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Divider,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import CustomTable from '../../pages/custom/CustomTable';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../manageApi/utils/toast';
import { showConfirmDialog, showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1", // Purple
  secondary: "#1890ff", // Blue
  success: "#52c41a",
  warning: "#faad14",
  bgLight: "#f9f0ff", // Light Purple BG
};

const Role = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [roles, setRoles] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState({ roles: false, platforms: false });
  const [isModalOpen, setIsModalOpen] = useState({ role: false, platform: false });
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');

  const [rolePagination, setRolePagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 20,
  });
  const [platformPagination, setPlatformPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({ roles: {}, platforms: {} });

  const { control, handleSubmit, reset, setError, clearErrors, formState: { errors } } = useForm({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      category: '',
      isSuperAdmin: false,
      parentRole: '',
    },
  });

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  // Fetch roles
  const fetchRoles = async (page = 1, itemsPerPage = 20, filters = {}) => {
    setLoading((prev) => ({ ...prev, roles: true }));
    try {
      const params = { page, limit: itemsPerPage };
      if (filters.category) params.category = filters.category;
      if (filters.isActive !== undefined) params.isActive = filters.isActive;

      const response = await apiService.get('/roles', params);
      setRoles(response.roles || []);
      setRolePagination({
        currentPage: response.pagination.currentPage || 1,
        totalPages: response.pagination.totalPages || 1,
        totalResults: response.pagination.totalRecords || 0,
        itemsPerPage: response.pagination.perPage || 20,
      });
    } catch (error) {
      console.error('Fetch roles error:', error);
      showToast(error.response?.data?.message || 'Failed to fetch roles', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, roles: false }));
    }
  };

  // Fetch platforms
  const fetchPlatforms = async (page = 1, itemsPerPage = 10, filters = {}) => {
    setLoading((prev) => ({ ...prev, platforms: true }));
    try {
      const params = { page, limit: itemsPerPage };
      if (filters.isActive !== undefined) params.isActive = filters.isActive;

      const response = await apiService.get('/platform', params);
      setPlatforms(response.platforms || []);
      setPlatformPagination({
        currentPage: response.pagination.currentPage || 1,
        totalPages: response.pagination.totalPages || 1,
        totalResults: response.pagination.totalRecords || 0,
        itemsPerPage: response.pagination.perPage || 10,
      });
    } catch (error) {
      console.error('Fetch platforms error:', error);
      showToast(error.response?.data?.message || 'Failed to fetch platforms', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, platforms: false }));
    }
  };

  // Handle page change
  const handlePageChange = (type, page, itemsPerPage) => {
    if (type === 'roles') {
      fetchRoles(page, itemsPerPage, filters.roles);
    } else {
      fetchPlatforms(page, itemsPerPage, filters.platforms);
    }
  };

  // Handle filter change
  const handleFilter = (type, newFilters) => {
    setFilters((prev) => ({ ...prev, [type]: newFilters }));
    if (type === 'roles') {
      fetchRoles(1, rolePagination.itemsPerPage, newFilters);
    } else {
      fetchPlatforms(1, platformPagination.itemsPerPage, newFilters);
    }
  };

  // Open modal for adding/editing
  const openModal = (type, item = null) => {
    setEditingItem(item);
    reset({
      code: item?.code || '',
      name: item?.name || '',
      description: item?.description || '',
      category: item?.category?._id || '',
      isSuperAdmin: item?.isSuperAdmin || false,
      parentRole: item?.parentRole?._id || '',
    });
    clearErrors();
    setIsModalOpen((prev) => ({ ...prev, [type]: true }));
  };

  // Handle modal cancel
  const handleCancel = (type) => {
    setIsModalOpen((prev) => ({ ...prev, [type]: false }));
    reset();
    clearErrors();
  };

  // Submit form (create or update)
  const onSubmit = async (values) => {
    const isRole = activeTab === 'roles';
    const endpoint = isRole ? '/roles' : '/platform';
    const id = editingItem?._id;
    try {
      setSubmitting(true);
      if (editingItem) {
        await apiService.put(`${endpoint}/${id}`, values);
        showSuccessAlert('Success', `${isRole ? 'Role' : 'Platform'} updated successfully`);
      } else {
        await apiService.post(endpoint, values);
        showSuccessAlert('Success', `${isRole ? 'Role' : 'Platform'} created successfully`);
      }
      setIsModalOpen((prev) => ({ ...prev, [activeTab]: false }));
      reset();
      if (isRole) {
        fetchRoles(rolePagination.currentPage, rolePagination.itemsPerPage, filters.roles);
      } else {
        fetchPlatforms(platformPagination.currentPage, platformPagination.itemsPerPage, filters.platforms);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          setError(err.field, { type: 'manual', message: err.message });
        });
        showErrorAlert('Error', 'Please correct the errors in the form');
      } else {
        showErrorAlert('Error', error.response?.data?.message || `Failed to save ${isRole ? 'role' : 'platform'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Soft delete
  const handleSoftDelete = async (type, item) => {
    const result = await showConfirmDialog(
      'Confirm Soft Delete',
      `Are you sure you want to soft delete the ${type === 'roles' ? 'role' : 'platform'} "${item.name}"? It will be marked as inactive.`,
      'Delete'
    );

    if (result.isConfirmed) {
      try {
        const endpoint = type === 'roles' ? `/roles/${item._id}` : `/platform/${item._id}`;
        await apiService.delete(endpoint);
        showSuccessAlert('Success', `${type === 'roles' ? 'Role' : 'Platform'} soft deleted successfully`);
        if (type === 'roles') {
          fetchRoles(rolePagination.currentPage, rolePagination.itemsPerPage, filters.roles);
        } else {
          fetchPlatforms(platformPagination.currentPage, platformPagination.itemsPerPage, filters.platforms);
        }
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || `Failed to soft delete ${type === 'roles' ? 'role' : 'platform'}`);
      }
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (type, item) => {
    const result = await showConfirmDialog(
      'Confirm Permanent Delete',
      `Are you sure you want to permanently delete the ${type === 'roles' ? 'role' : 'platform'} "${item.name}"? This action cannot be undone.`,
      'Delete Permanently',
      'error'
    );

    if (result.isConfirmed) {
      try {
        const endpoint = type === 'roles' ? `/roles/${item._id}/permanent` : `/platform/${item._id}/permanent`;
        await apiService.delete(endpoint);
        showSuccessAlert('Success', `${type === 'roles' ? 'Role' : 'Platform'} permanently deleted successfully`);
        if (type === 'roles') {
          fetchRoles(rolePagination.currentPage, rolePagination.itemsPerPage, filters.roles);
        } else {
          fetchPlatforms(platformPagination.currentPage, platformPagination.itemsPerPage, filters.platforms);
        }
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || `Failed to permanently delete ${type === 'roles' ? 'role' : 'platform'}`);
      }
    }
  };

  // Restore
  const handleRestore = async (type, item) => {
    const result = await showConfirmDialog(
      'Confirm Restore',
      `Are you sure you want to restore the ${type === 'roles' ? 'role' : 'platform'} "${item.name}"? It will be marked as active.`,
      'Restore'
    );

    if (result.isConfirmed) {
      try {
        const endpoint = type === 'roles' ? `/roles/${item._id}/restore` : `/platform/${item._id}/restore`;
        await apiService.put(endpoint);
        showSuccessAlert('Success', `${type === 'roles' ? 'Role' : 'Platform'} restored successfully`);
        if (type === 'roles') {
          fetchRoles(rolePagination.currentPage, rolePagination.itemsPerPage, filters.roles);
        } else {
          fetchPlatforms(platformPagination.currentPage, platformPagination.itemsPerPage, filters.platforms);
        }
      } catch (error) {
        showErrorAlert('Error', error.response?.data?.message || `Failed to restore ${type === 'roles' ? 'role' : 'platform'}`);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRoles(rolePagination.currentPage, rolePagination.itemsPerPage, filters.roles);
    fetchPlatforms(platformPagination.currentPage, platformPagination.itemsPerPage, filters.platforms);
  }, []);

  // Role table columns
  const roleColumns = useMemo(
    () => [
      {
        key: 'code',
        title: 'Code',
        sortable: true,
        filterable: false,
        render: (value) => <Tag color="purple">{value}</Tag>,
      },
      {
        key: 'name',
        title: 'Name',
        sortable: true,
        filterable: false,
        render: (value) => <span className="font-semibold text-gray-800">{value}</span>,
      },
      {
        key: 'category.name',
        title: 'Platform/Category',
        sortable: true,
        filterable: true,
        filterKey: 'category',
        filterOptions: platforms
          .filter((p) => p.isActive)
          .map((p) => ({ value: p._id, label: p.name })),
        render: (value, item) => (
             item.category ? 
             <Badge status="processing" text={item.category.name} color={THEME.primary} /> : 
             <span className="text-gray-400">--</span>
        ),
      },
      {
        key: 'description',
        title: 'Description',
        render: (value) => <span className="text-gray-500 text-sm truncate max-w-xs block">{value || '--'}</span>,
      },
      {
        key: 'isSuperAdmin',
        title: 'Privilege',
        render: (value) => (
          value ? <Tag icon={<SafetyCertificateOutlined />} color="gold">Super Admin</Tag> : <span className="text-gray-400">Standard</span>
        ),
      },
      {
        key: 'isActive',
        title: 'Status',
        sortable: true,
        filterable: true,
        filterKey: 'isActive',
        filterOptions: [
          { value: true, label: 'Active' },
          { value: false, label: 'Inactive' },
        ],
        render: (value) => (
          <Tag color={value ? 'success' : 'error'} style={{ borderRadius: 10 }}>
            {value ? 'Active' : 'Inactive'}
          </Tag>
        ),
      },
      {
        key: 'actions',
        title: 'Actions',
        render: (value, item) => (
          <Space size="small">
            <Tooltip title="Edit Role">
              <Button
                size="small"
                shape="circle"
                icon={<EditOutlined style={{ color: THEME.primary }} />}
                style={{ borderColor: THEME.primary }}
                onClick={() => openModal('role', item)}
              />
            </Tooltip>
            {item.isActive ? (
              <Popconfirm
                title="Soft Delete"
                description="Mark this role as inactive?"
                onConfirm={() => handleSoftDelete('roles', item)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Popconfirm>
            ) : (
              <Space size={2}>
                <Tooltip title="Restore">
                    <Popconfirm
                        title="Restore Role"
                        description="Activate this role again?"
                        onConfirm={() => handleRestore('roles', item)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                        size="small"
                        shape="circle"
                        icon={<UndoOutlined style={{ color: THEME.success }} />}
                        style={{ borderColor: THEME.success }}
                        />
                    </Popconfirm>
                </Tooltip>
                <Tooltip title="Delete Permanently">
                    <Popconfirm
                        title="Delete Permanently"
                        description="This action cannot be undone."
                        onConfirm={() => handlePermanentDelete('roles', item)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                        size="small"
                        shape="circle"
                        icon={<DeleteOutlined />}
                        danger
                        type="primary"
                        />
                    </Popconfirm>
                </Tooltip>
              </Space>
            )}
          </Space>
        ),
      },
    ],
    [platforms]
  );

  // Platform table columns
  const platformColumns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Platform Name',
        sortable: true,
        filterable: false,
        render: (value) => <span className="font-semibold text-gray-800">{value}</span>,
      },
      {
        key: 'description',
        title: 'Description',
        render: (value) => <span className="text-gray-500">{value || '--'}</span>,
      },
      {
        key: 'isActive',
        title: 'Status',
        sortable: true,
        filterable: true,
        filterKey: 'isActive',
        filterOptions: [
          { value: true, label: 'Active' },
          { value: false, label: 'Inactive' },
        ],
        render: (value) => (
            <Tag color={value ? 'success' : 'error'} style={{ borderRadius: 10 }}>
              {value ? 'Active' : 'Inactive'}
            </Tag>
        ),
      },
      {
        key: 'createdAt',
        title: 'Created Date',
        sortable: true,
        render: (value) => (
          <span className="text-gray-500 text-xs">{value ? new Date(value).toLocaleDateString() : '--'}</span>
        ),
      },
      {
        key: 'actions',
        title: 'Actions',
        render: (value, item) => (
          <Space size="small">
            <Tooltip title="Edit Platform">
              <Button
                size="small"
                shape="circle"
                icon={<EditOutlined style={{ color: THEME.primary }} />}
                style={{ borderColor: THEME.primary }}
                onClick={() => openModal('platform', item)}
              />
            </Tooltip>
            {item.isActive ? (
              <Popconfirm
                title="Soft Delete"
                description="Mark this platform as inactive?"
                onConfirm={() => handleSoftDelete('platforms', item)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  danger
                />
              </Popconfirm>
            ) : (
              <Space size={2}>
                <Tooltip title="Restore">
                    <Popconfirm
                        title="Restore Platform"
                        onConfirm={() => handleRestore('platforms', item)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                        size="small"
                        shape="circle"
                        icon={<UndoOutlined style={{ color: THEME.success }} />}
                        style={{ borderColor: THEME.success }}
                        />
                    </Popconfirm>
                </Tooltip>
                <Tooltip title="Delete Permanently">
                    <Popconfirm
                        title="Delete Permanently"
                        onConfirm={() => handlePermanentDelete('platforms', item)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                        size="small"
                        shape="circle"
                        icon={<DeleteOutlined />}
                        danger
                        type="primary"
                        />
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
        <Title level={3} style={{ marginBottom: 16 }}>Role & Platform Management</Title>
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
                    <Statistic 
                        title="Total Roles" 
                        value={rolePagination.totalResults} 
                        prefix={<TeamOutlined style={{ color: THEME.primary }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.secondary }}>
                    <Statistic 
                        title="Total Platforms" 
                        value={platformPagination.totalResults} 
                        prefix={<AppstoreOutlined style={{ color: THEME.secondary }} />} 
                    />
                </Card>
            </Col>
        </Row>
      </div>

      {/* 2. Main Content Card with Tabs */}
      <Card 
        bordered={false} 
        className="shadow-md rounded-lg"
        bodyStyle={{ padding: 0 }}
      >
        <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            size="large"
            tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16 }}
            items={[
            {
                label: <span><TeamOutlined /> Roles</span>,
                key: 'roles',
                children: (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex flex-col">
                            <span className="font-semibold text-lg">System Roles</span>
                            <span className="text-gray-500 text-xs">Manage user roles and permissions</span>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => openModal('role')}
                            size="large"
                            style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
                        >
                            Add New Role
                        </Button>
                    </div>
                    <CustomTable
                        columns={roleColumns}
                        data={roles}
                        totalItems={rolePagination.totalResults}
                        currentPage={rolePagination.currentPage}
                        itemsPerPage={rolePagination.itemsPerPage}
                        onPageChange={(page, itemsPerPage) => handlePageChange('roles', page, itemsPerPage)}
                        onFilter={(filters) => handleFilter('roles', filters)}
                        loading={loading.roles}
                    />
                </div>
                ),
            },
            {
                label: <span><AppstoreOutlined /> Platforms</span>,
                key: 'platforms',
                children: (
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex flex-col">
                            <span className="font-semibold text-lg">Platforms / Categories</span>
                            <span className="text-gray-500 text-xs">Define system platforms</span>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => openModal('platform')}
                            size="large"
                            style={{ backgroundColor: THEME.secondary, borderColor: THEME.secondary }}
                        >
                            Add Platform
                        </Button>
                    </div>
                    <CustomTable
                        columns={platformColumns}
                        data={platforms}
                        totalItems={platformPagination.totalResults}
                        currentPage={platformPagination.currentPage}
                        itemsPerPage={platformPagination.itemsPerPage}
                        onPageChange={(page, itemsPerPage) => handlePageChange('platforms', page, itemsPerPage)}
                        onFilter={(filters) => handleFilter('platforms', filters)}
                        loading={loading.platforms}
                    />
                </div>
                ),
            },
            ]}
        />
      </Card>

      {/* Role Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-purple-800">
                {editingItem ? <EditOutlined /> : <PlusOutlined />} 
                {editingItem ? 'Edit Role' : 'Create New Role'}
            </div>
        }
        open={isModalOpen.role}
        onCancel={() => handleCancel('role')}
        footer={null}
        destroyOnClose
        maskClosable={false}
        width={600}
      >
        <Divider className="my-3" />
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit)}
          className="mt-4"
        >
          <Row gutter={16}>
             <Col span={12}>
                <Controller
                    name="code"
                    control={control}
                    rules={{ required: 'Please enter role code' }}
                    render={({ field }) => (
                    <Form.Item
                        label="Role Code"
                        required
                        validateStatus={errors.code ? 'error' : ''}
                        help={errors.code?.message}
                    >
                        <Input {...field} placeholder="e.g. SUPER_ADMIN" />
                    </Form.Item>
                    )}
                />
             </Col>
             <Col span={12}>
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Please enter role name' }}
                    render={({ field }) => (
                    <Form.Item
                        label="Role Name"
                        required
                        validateStatus={errors.name ? 'error' : ''}
                        help={errors.name?.message}
                    >
                        <Input {...field} placeholder="e.g. Super Administrator" />
                    </Form.Item>
                    )}
                />
             </Col>
          </Row>
          
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Please select a category' }}
            render={({ field }) => (
              <Form.Item
                label="Platform / Category"
                required
                validateStatus={errors.category ? 'error' : ''}
                help={errors.category?.message}
              >
                <Select
                  {...field}
                  placeholder="Select category"
                  loading={loading.platforms}
                  disabled={loading.platforms}
                >
                  {platforms
                    .filter((p) => p.isActive)
                    .map((platform) => (
                      <Option key={platform._id} value={platform._id}>
                        {platform.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            )}
          />
          <Controller
            name="parentRole"
            control={control}
            render={({ field }) => (
              <Form.Item
                label="Parent Role (Optional)"
                validateStatus={errors.parentRole ? 'error' : ''}
                help={errors.parentRole?.message}
              >
                <Select
                  {...field}
                  placeholder="Select parent role"
                  allowClear
                  loading={loading.roles}
                  disabled={loading.roles}
                >
                  {roles
                    .filter((r) => r.isActive)
                    .map((role) => (
                      <Option key={role._id} value={role._id}>
                        {role.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Form.Item label="Description">
                <TextArea {...field} rows={3} placeholder="Brief description of the role..." />
              </Form.Item>
            )}
          />
          <Controller
            name="isSuperAdmin"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Form.Item className="bg-purple-50 p-3 rounded border border-purple-100">
                <Checkbox checked={value} onChange={(e) => onChange(e.target.checked)}>
                   <span className="font-medium text-purple-900">Grant Super Admin Privileges</span>
                   <p className="text-xs text-gray-500 pl-6 m-0">This grants full access to all system features.</p>
                </Checkbox>
              </Form.Item>
            )}
          />
          <Form.Item className="text-right mt-6">
            <Space>
              <Button onClick={() => handleCancel('role')}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
              >
                {editingItem ? 'Update Role' : 'Create Role'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Platform Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-blue-800">
                {editingItem ? <EditOutlined /> : <PlusOutlined />} 
                {editingItem ? 'Edit Platform' : 'Add New Platform'}
            </div>
        }
        open={isModalOpen.platform}
        onCancel={() => handleCancel('platform')}
        footer={null}
        destroyOnClose
        maskClosable={false}
        width={500}
      >
        <Divider className="my-3" />
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit)}
          className="mt-4"
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Please enter platform name' }}
            render={({ field }) => (
              <Form.Item
                label="Platform Name"
                required
                validateStatus={errors.name ? 'error' : ''}
                help={errors.name?.message}
              >
                <Input {...field} placeholder="e.g. Web Admin, Mobile App" />
              </Form.Item>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Form.Item label="Description">
                <TextArea {...field} rows={3} placeholder="Description of the platform..." />
              </Form.Item>
            )}
          />
          <Form.Item className="text-right mt-6">
            <Space>
              <Button onClick={() => handleCancel('platform')}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ backgroundColor: THEME.secondary, borderColor: THEME.secondary }}
              >
                {editingItem ? 'Update Platform' : 'Create Platform'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Role;