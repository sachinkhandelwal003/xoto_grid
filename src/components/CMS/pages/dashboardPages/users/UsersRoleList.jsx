// src/pages/admin/UsersRoleList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Switch,
  Popconfirm,
  Card,
  Typography,
  Tabs,
  Avatar,
  Row,
  Col,
  Statistic,
  Space,
  Divider,
  Badge
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  DeleteOutlined,
  TeamOutlined,
  SafetyCertificateFilled,
  CheckCircleOutlined,
  StopOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import CustomTable from '../../../pages/custom/CustomTable';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';

const { Option } = Select;
const { Title, Text } = Typography;

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

// --- COUNTRY DATA CONFIGURATION ---
const COUNTRY_CODES = [
  { code: 'AE', dial: '+971', flag: '🇦🇪', len: 9, name: 'UAE' },
  { code: 'IN', dial: '+91', flag: '🇮🇳', len: 10, name: 'India' },
  { code: 'US', dial: '+1', flag: '🇺🇸', len: 10, name: 'USA' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', len: 10, name: 'UK' },
  { code: 'SA', dial: '+966', flag: '🇸🇦', len: 9, name: 'Saudi Arabia' },
  { code: 'QA', dial: '+974', flag: '🇶🇦', len: 8, name: 'Qatar' },
];

const UsersRoleList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState(''); // ✅ still used for API calls
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const stats = useMemo(() => {
    return {
      total: totalUsers,
      active: users.filter(u => u.isActive).length,
      rolesCount: roles.length
    };
  }, [totalUsers, users, roles]);

  // ✅ Flatten users for CustomTable search (objects skip hotey hain)
  const flattenUsersForSearch = (list = []) => {
    return list.map((u) => {
      const first = u?.name?.first_name || "";
      const last = u?.name?.last_name || "";
      const fullName = `${first} ${last}`.trim();

      const email = u?.email || "";
      const mobile = u?.mobile || "";

      const roleName = u?.role?.name || "";
      const statusText = u?.isActive ? "Active" : "Inactive";

      return {
        ...u,

        // ✅ flat searchable fields
        __search_name: fullName,
        __search_first: first,
        __search_last: last,
        __search_email: email,
        __search_mobile: mobile,
        __search_role: roleName,
        __search_status: statusText,
      };
    });
  };

  // --- API CALLS ---
  const fetchRoles = async () => {
    try {
      const res = await apiService.get('/roles', { params: { limit: 100 } });
      const allRoles = res.roles || [];
      const allowedNames = ['Supervisor', 'Accountant'];
      const teamRoles = allRoles.filter(r => allowedNames.includes(r.name));
      setRoles(teamRoles);
    } catch (err) {
      showToast('Failed to load roles', 'error');
    }
  };

  const fetchUsers = async (page = 1, limit = 10, roleId = null, search = '') => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        role: roleId === 'all' ? undefined : roleId,
        search: search || undefined
      };

      const res = await apiService.get('/users', params);

      // ✅ IMPORTANT: flatten before setting
      setUsers(flattenUsersForSearch(res.data || []));

      setTotalUsers(res.pagination?.total || 0);
      setCurrentPage(res.pagination?.page || page);
      setItemsPerPage(res.pagination?.limit || limit);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers(1, 10, 'all');
  }, []);

  // ✅ keep tab/search working for backend calls (if backend supports)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, itemsPerPage, activeTab, searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchText]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page, pageSize) => {
    fetchUsers(page, pageSize, activeTab, searchText);
  };

  const toggleStatus = async (id, current) => {
    try {
      await apiService.patch(`/users/${id}/toggle`);
      showToast(`User ${current ? 'deactivated' : 'activated'}`, 'success');
      fetchUsers(currentPage, itemsPerPage, activeTab, searchText);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiService.delete(`/users/${id}`);
      showToast('User deleted', 'success');
      fetchUsers(currentPage, itemsPerPage, activeTab, searchText);
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const handleCreate = async (values) => {
    if (values.password !== values.confirm_password) {
      form.setFields([{ name: 'confirm_password', errors: ['Passwords do not match'] }]);
      return;
    }

    const fullMobile = `${values.country_code}${values.mobile}`;

    try {
      await apiService.post('/users/register', {
        name: { first_name: values.first_name, last_name: values.last_name },
        email: values.email,
        mobile: fullMobile,
        password: values.password,
        confirm_password: values.confirm_password,
        role: values.role,
      });

      showToast('User created successfully', 'success');
      setModalVisible(false);
      form.resetFields();
      fetchUsers(currentPage, itemsPerPage, activeTab, searchText);
    } catch (err) {
      const backendErrors = err.response?.data?.errors || [];
      if (backendErrors.length > 0) {
        const fieldErrors = backendErrors.map(item => {
          let field = item.field;
          if (field === 'name.first_name') field = 'first_name';
          if (field === 'name.last_name') field = 'last_name';
          return { name: field, errors: [item.message] };
        });
        form.setFields(fieldErrors);
      } else {
        showToast('Registration failed', 'error');
      }
    }
  };

  // --- COLUMNS ---
  const columns = [
    {
      key: 'user',
      title: 'Team Member',
      render: (_, r) => (
        <Space>
          <Avatar
            size="large"
            style={{ backgroundColor: THEME.primary, verticalAlign: 'middle' }}
          >
            {r.name?.first_name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-bold text-gray-800">
              {r.name?.first_name} {r.name?.last_name}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <MailOutlined /> {r.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_, r) => (
        <div className="text-gray-600">
          <PhoneOutlined className="mr-2" /> {r.mobile}
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (_, r) => {
        let color = 'default';
        if (r.role?.name === 'Supervisor') color = 'geekblue';
        if (r.role?.name === 'Accountant') color = 'purple';

        return (
          <Tag color={color} style={{ borderRadius: 12, padding: '2px 10px', fontWeight: 500 }}>
            {r.role?.name || 'N/A'}
          </Tag>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, r) => (
        <Space>
          <Switch
            checked={r.isActive}
            onChange={() => toggleStatus(r._id, r.isActive)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<StopOutlined />}
            style={{ backgroundColor: r.isActive ? THEME.success : undefined }}
          />
          <span className="text-xs text-gray-500">{r.isActive ? 'Active' : 'Inactive'}</span>
        </Space>
      ),
    },
    {
      key: 'actions',
      title: 'Action',
      align: 'center',
      render: (_, r) => (
        <Popconfirm
          title="Delete Member?"
          description="This action cannot be undone."
          onConfirm={() => deleteUser(r._id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <UsergroupAddOutlined /> All Members
          <Badge count={totalUsers} style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />
        </span>
      )
    },
    ...roles.map(role => ({
      key: role._id,
      label: (
        <span>
          <SafetyCertificateFilled /> {role.name}
        </span>
      )
    }))
  ];

  // --- COUNTRY SELECTOR COMPONENT (DEFAULT UAE) ---
  const prefixSelector = (
    <Form.Item name="country_code" noStyle initialValue="+971">
      <Select
        style={{ width: 90 }}
        popupMatchSelectWidth={false}
        optionLabelProp="label"
      >
        {COUNTRY_CODES.map(country => (
          <Option key={country.code} value={country.dial} label={country.dial}>
            <Space>
              <span>{country.flag}</span>
              <span>{country.name} ({country.dial})</span>
            </Space>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header & Stats */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Title level={3} style={{ margin: 0 }}>Team Management</Title>
            <Text type="secondary">Manage Supervisors, Accountants, and other staff.</Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setModalVisible(true);
            }}
            style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
          >
            Add Team Member
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
              <Statistic
                title="Total Members"
                value={stats.total}
                prefix={<TeamOutlined style={{ color: THEME.primary }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
              <Statistic
                title="Active Members"
                value={stats.active}
                prefix={<CheckCircleOutlined style={{ color: THEME.success }} />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Table */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        {/* ✅ Removed top search bar (CustomTable ka search use hoga) */}

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          size="large"
          tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
          items={tabItems}
        />

        <div className="p-0">
          <CustomTable
            columns={columns}
            data={users}
            loading={loading}
            totalItems={totalUsers}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      {/* Create User Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <UserOutlined style={{ color: THEME.primary }} />
            Add Team Member
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
        destroyOnClose
        centered
      >
        <Divider className="my-4" />
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined className="text-gray-400" />} size="large" placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined className="text-gray-400" />} size="large" placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined className="text-gray-400" />} size="large" placeholder="john@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.country_code !== currentValues.country_code}
              >
                {({ getFieldValue }) => {
                  const countryDial = getFieldValue('country_code') || '+971';
                  const country = COUNTRY_CODES.find(c => c.dial === countryDial);
                  const requiredLen = country ? country.len : 10;

                  return (
                    <Form.Item
                      name="mobile"
                      label="Mobile Number"
                      rules={[
                        { required: true, message: 'Please enter mobile number' },
                        {
                          validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            if (!/^\d+$/.test(value)) {
                              return Promise.reject(new Error('Only digits allowed'));
                            }
                            if (value.length !== requiredLen) {
                              return Promise.reject(new Error(`${country?.name || 'This country'} requires exactly ${requiredLen} digits`));
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <Input
                        addonBefore={prefixSelector}
                        style={{ width: '100%' }}
                        size="large"
                        placeholder={`${requiredLen} digits`}
                        maxLength={requiredLen}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="role" label="Assign Role" rules={[{ required: true }]}>
            <Select placeholder="Select role" size="large">
              {roles.map(r => (
                <Option key={r._id} value={r._id}>
                  <Space>
                    <SafetyCertificateFilled style={{ color: THEME.secondary }} />
                    {r.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]} style={{ marginBottom: 0 }}>
                  <Input.Password prefix={<LockOutlined className="text-gray-400" />} size="large" placeholder="••••••" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="confirm_password" label="Confirm Password" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                  <Input.Password prefix={<LockOutlined className="text-gray-400" />} size="large" placeholder="••••••" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ backgroundColor: THEME.primary, borderColor: THEME.primary }}
            >
              Create Member
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersRoleList;
