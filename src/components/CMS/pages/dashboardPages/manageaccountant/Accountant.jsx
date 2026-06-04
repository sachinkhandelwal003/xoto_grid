import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Form,
  message,
  Switch,
  Popconfirm,
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showToast } from '../../../../../manageApi/utils/toast';
import { showConfirmDialog } from '../../../../../manageApi/utils/sweetAlert';

const { Title } = Typography;

const Accountant = () => {
  const [accountants, setAccountants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch Accountants
  const fetchAccountants = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await apiService.get('/accountant', {
        params: { page, limit: 10, search },
      });
      setAccountants(res.accountants);
      setPagination({
        current: res.pagination.page,
        pageSize: res.pagination.limit,
        total: res.pagination.total,
      });
    } catch (err) {
      showToast(err.message || 'Failed to load accountants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    fetchAccountants(1, value);
  };

  const handleTableChange = (pagination) => {
    fetchAccountants(pagination.current, searchText);
  };

  // Toggle Active Status
  const toggleActive = async (id, currentStatus) => {
    try {
      await apiService.patch(`/accountant/${id}/toggle`);
      showToast(`Accountant ${currentStatus ? 'deactivated' : 'activated'}`, 'success');
      fetchAccountants(pagination.current, searchText);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Delete Accountant
  const deleteAccountant = async (id) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Accountant?',
      text: 'This action cannot be undone.',
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      await apiService.delete(`/accountant/${id}`);
      showToast('Accountant deleted', 'success');
      fetchAccountants(pagination.current, searchText);
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // Create Accountant
  const handleCreate = async (values) => {
    if (values.password !== values.confirm_password) {
      message.error('Passwords do not match');
      return;
    }

    try {
      await apiService.post('/accountant', {
        ...values,
        name: { first_name: values.first_name, last_name: values.last_name },
      });
      showToast('Accountant created successfully', 'success');
      setModalVisible(false);
      form.resetFields();
      fetchAccountants();
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const columns = [
    {
      title: 'Name',
      render: (_, record) => `${record.name.first_name} ${record.name.last_name}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
    },
    {
      title: 'Firm',
      dataIndex: 'firm_name',
      render: (text) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={() => toggleActive(record._id, active)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Delete this accountant?"
            onConfirm={() => deleteAccountant(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card>
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Accountants
            </Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Search by name, email..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearch}
                style={{ width: 250 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Add Accountant
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={accountants}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: false,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Add New Accountant"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Valid email required' }]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="mobile"
            label="Mobile"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item name="firm_name" label="Firm Name">
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6, message: 'Min 6 characters' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            rules={[{ required: true }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Accountant
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Accountant;