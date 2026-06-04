// pages/packages/PackageManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Card,
  Space,
  Tag,
  Tooltip,
  Spin,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Row,
  Col,
  Alert,
  Badge,
  Popconfirm,
  notification,
  Divider,
  Avatar,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { packageService } from './packages.service';
import { showToast } from '../../../../manageApi/utils/toast';
import { showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Purple Theme Colors
const PURPLE_THEME = {
  primary: '#722ed1',
  primaryLight: '#9254de',
  primaryLighter: '#d3adf7',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  dark: '#1f2937',
  gray: '#6b7280',
  light: '#f8fafc'
};

// Package color themes
const PACKAGE_COLORS = {
  Essentials: {
    primary: '#1890ff',
    light: '#e6f7ff',
    icon: '📦',
    badge: 'blue'
  },
  Premium: {
    primary: '#722ed1',
    light: '#f9f0ff',
    icon: '✨',
    badge: 'purple'
  },
  Luxe: {
    primary: '#531dab',
    light: '#f3e8ff',
    icon: '💎',
    badge: 'purple'
  },
  Tshibare: {
    primary: '#fa8c16',
    light: '#fff7e6',
    icon: '👑',
    badge: 'orange'
  }
};

// Currencies (simplified)
const CURRENCIES = [
  { value: 'USD', label: 'USD', symbol: '$' },
  { value: 'EUR', label: 'EUR', symbol: '€' },
  { value: 'AED', label: 'AED', symbol: 'د.إ' }
];

const Packages = () => {
  const { token } = useSelector(s => s.auth);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [features, setFeatures] = useState(['', '', '']); // Start with 3 required features

  // Permission check
  const canManagePackages = true; // Replace with actual permission check

  /* -------------------------- FETCH DATA -------------------------- */
  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await packageService.getPackages();
      setPackages(response.packages || []);
    } catch (err) {
      console.error('Fetch packages error:', err);
      notification.error({
        message: 'Failed to load packages',
        description: err.response?.data?.message || 'Please try again later',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchPackages();
    }
  }, [token, fetchPackages]);

  /* -------------------------- FORM HANDLERS -------------------------- */
  const handleCreatePackage = async (values) => {
    if (!canManagePackages) {
      showToast('You do not have permission to create packages', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Process features array
      const processedFeatures = values.features
        .filter(f => f && f.trim().length > 0)
        .map(f => f.trim());

      if (processedFeatures.length < 3) {
        throw new Error('At least 3 features are required');
      }

      const packageData = {
        ...values,
        features: processedFeatures,
        price: parseFloat(values.price)
      };

      const response = await packageService.createPackage(packageData);
      
      notification.success({
        message: 'Package Created',
        description: `${response.package.name} package has been created successfully`,
        placement: 'topRight',
        style: {
          background: PURPLE_THEME.primaryBg,
          borderLeft: `4px solid ${PURPLE_THEME.primary}`
        }
      });

      setModalVisible(false);
      form.resetFields();
      setFeatures(['', '', '']);
      fetchPackages();
    } catch (err) {
      const errorMessage = err.response?.data?.errors?.[0]?.message || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to create package';
      
      notification.error({
        message: 'Creation Failed',
        description: errorMessage,
        placement: 'topRight'
      });
      
      if (err.response?.data?.errors) {
        const errors = {};
        err.response.data.errors.forEach(error => {
          errors[error.field] = { errors: [new Error(error.message)] };
        });
        form.setFields(errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePackage = async (values) => {
    if (!canManagePackages) {
      showToast('You do not have permission to update packages', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Process features array
      const processedFeatures = values.features
        .filter(f => f && f.trim().length > 0)
        .map(f => f.trim());

      if (processedFeatures.length < 3) {
        throw new Error('At least 3 features are required');
      }

      const packageData = {
        ...values,
        features: processedFeatures,
        price: parseFloat(values.price)
      };

      const response = await packageService.updatePackage(selectedPackage._id, packageData);
      
      notification.success({
        message: 'Package Updated',
        description: `${response.package.name} package has been updated successfully`,
        placement: 'topRight',
        style: {
          background: PURPLE_THEME.primaryBg,
          borderLeft: `4px solid ${PURPLE_THEME.primary}`
        }
      });

      setEditModalVisible(false);
      setSelectedPackage(null);
      fetchPackages();
    } catch (err) {
      const errorMessage = err.response?.data?.errors?.[0]?.message || 
                          err.response?.data?.message || 
                          'Failed to update package';
      
      notification.error({
        message: 'Update Failed',
        description: errorMessage,
        placement: 'topRight'
      });
      
      if (err.response?.data?.errors) {
        const errors = {};
        err.response.data.errors.forEach(error => {
          errors[error.field] = { errors: [new Error(error.message)] };
        });
        editForm.setFields(errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (pkg) => {
    showSuccessAlert(
      'Confirm Deactivation',
      `Are you sure you want to deactivate "${pkg.name}" package? This will make it unavailable for new customers.`,
      'warning',
      true
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await packageService.deletePackage(pkg._id);
          notification.success({
            message: 'Package Deactivated',
            description: `${pkg.name} has been deactivated successfully`,
            placement: 'topRight',
            style: {
              background: PURPLE_THEME.primaryBg,
              borderLeft: `4px solid ${PURPLE_THEME.primary}`
            }
          });
          fetchPackages();
        } catch (err) {
          notification.error({
            message: 'Deactivation Failed',
            description: err.response?.data?.message || 'Failed to deactivate package',
            placement: 'topRight'
          });
        }
      }
    });
  };

  const handleRestorePackage = async (pkg) => {
    try {
      await packageService.restorePackage(pkg._id);
      notification.success({
        message: 'Package Restored',
        description: `${pkg.name} has been restored successfully`,
        placement: 'topRight',
        style: {
          background: PURPLE_THEME.primaryBg,
          borderLeft: `4px solid ${PURPLE_THEME.primary}`
        }
      });
      fetchPackages();
    } catch (err) {
      notification.error({
        message: 'Restoration Failed',
        description: err.response?.data?.message || 'Failed to restore package',
        placement: 'topRight'
      });
    }
  };

  /* -------------------------- FEATURE MANAGEMENT -------------------------- */
  const addFeature = () => {
    if (features.length < 10) {
      setFeatures([...features, '']);
    }
  };

  const removeFeature = (index) => {
    if (features.length > 3) {
      const newFeatures = features.filter((_, i) => i !== index);
      setFeatures(newFeatures);
    }
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    form.setFieldsValue({ features: newFeatures });
  };

  /* -------------------------- PACKAGE CARD COMPONENT -------------------------- */
  const PackageCard = ({ pkg }) => {
    const colors = PACKAGE_COLORS[pkg.name] || PACKAGE_COLORS.Premium;
    const currency = CURRENCIES.find(c => c.value === pkg.currency);
    
    return (
      <Card
        style={{
          borderRadius: '12px',
          border: `1px solid ${colors.light}`,
          background: 'white',
          height: '100%',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar 
              size={48}
              style={{ 
                background: colors.primary,
                color: 'white',
                fontSize: '20px'
              }}
            >
              {colors.icon}
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0, color: colors.primary }}>
                {pkg.name}
              </Title>
              {pkg.slug && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {pkg.slug}
                </Text>
              )}
            </div>
          </div>
          {pkg.popular && (
            <Badge count="Popular" style={{ background: PURPLE_THEME.error }} />
          )}
        </div>

        {/* Price Section */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '8px' }}>
            <Text style={{ fontSize: '12px', color: PURPLE_THEME.gray, marginRight: '4px' }}>
              {currency?.symbol}
            </Text>
            <Title level={2} style={{ margin: 0, color: PURPLE_THEME.dark }}>
              {pkg.price.toLocaleString()}
            </Title>
            <Text style={{ fontSize: '14px', color: PURPLE_THEME.gray, marginLeft: '4px' }}>
              {pkg.currency}
            </Text>
          </div>
          
          <Paragraph 
            type="secondary" 
            style={{ 
              fontSize: '14px', 
              margin: 0,
              minHeight: '40px'
            }}
          >
            {pkg.description}
          </Paragraph>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Features */}
        <div style={{ marginBottom: '20px' }}>
          <Text strong style={{ display: 'block', marginBottom: '12px', color: PURPLE_THEME.dark }}>
            Features ({pkg.features?.length || 0})
          </Text>
          <ul style={{ 
            paddingLeft: '20px', 
            margin: 0,
            maxHeight: '100px',
            overflow: 'auto'
          }}>
            {pkg.features?.slice(0, 3).map((feature, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                <Text style={{ fontSize: '13px', color: PURPLE_THEME.dark }}>
                  <CheckCircleOutlined style={{ color: colors.primary, marginRight: '8px' }} />
                  {feature}
                </Text>
              </li>
            ))}
            {pkg.features?.length > 3 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                +{pkg.features.length - 3} more features...
              </Text>
            )}
          </ul>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <Tag color={pkg.isActive ? 'green' : 'red'} style={{ borderRadius: '12px' }}>
            {pkg.isActive ? 'Active' : 'Inactive'}
          </Tag>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Order: {pkg.order}
          </Text>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPackage(pkg);
                setViewModalVisible(true);
              }}
              size="small"
              block
            >
              View
            </Button>
          </Tooltip>
          {canManagePackages && (
            <>
              <Tooltip title="Edit Package">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    editForm.setFieldsValue({
                      ...pkg,
                      features: pkg.features || ['', '', '']
                    });
                    setFeatures(pkg.features || ['', '', '']);
                    setEditModalVisible(true);
                  }}
                  size="small"
                  type="primary"
                />
              </Tooltip>
              <Tooltip title={pkg.isActive ? 'Deactivate' : 'Activate'}>
                {pkg.isActive ? (
                  <Popconfirm
                    title={`Deactivate ${pkg.name}?`}
                    description="This will make it unavailable for new customers."
                    onConfirm={() => handleDeletePackage(pkg)}
                    okText="Deactivate"
                    cancelText="Cancel"
                    okType="danger"
                  >
                    <Button
                      icon={<CloseCircleOutlined />}
                      size="small"
                      danger
                    />
                  </Popconfirm>
                ) : (
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleRestorePackage(pkg)}
                    size="small"
                    type="primary"
                  />
                )}
              </Tooltip>
            </>
          )}
        </div>
      </Card>
    );
  };

  /* -------------------------- MODALS -------------------------- */
  const renderCreateModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={40}
            style={{ 
              background: PURPLE_THEME.primary,
              color: 'white'
            }}
            icon={<PlusOutlined />}
          />
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: PURPLE_THEME.dark }}>
            Create New Package
          </span>
        </div>
      }
      open={modalVisible}
      onCancel={() => {
        setModalVisible(false);
        form.resetFields();
        setFeatures(['', '', '']);
      }}
      footer={null}
      width={600}
      destroyOnClose
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreatePackage}
        initialValues={{
          currency: 'AED',
          popular: false,
          order: 0
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Package Name"
              name="name"
              rules={[
                { required: true, message: 'Please select package name' },
                { 
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!['Essentials', 'Premium', 'Luxe', 'Tshibare'].includes(value)) {
                      return Promise.reject(new Error('Invalid package name'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Select 
                placeholder="Select package type"
                size="large"
                showSearch
              >
                {Object.keys(PACKAGE_COLORS).map(name => (
                  <Option key={name} value={name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{PACKAGE_COLORS[name].icon}</span>
                      <span>{name}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Price"
              name="price"
              rules={[
                { required: true, message: 'Please enter price' },
                { 
                  validator: (_, value) => {
                    if (!value || isNaN(value) || value <= 0) {
                      return Promise.reject(new Error('Price must be a positive number'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                placeholder="0.00"
                style={{ width: '100%' }}
                size="large"
                min={0}
                step={0.01}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Currency"
              name="currency"
              rules={[{ required: true, message: 'Please select currency' }]}
            >
              <Select size="large">
                {CURRENCIES.map(currency => (
                  <Option key={currency.value} value={currency.value}>
                    {currency.symbol} {currency.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  label="Popular"
                  name="popular"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Order"
                  name="order"
                >
                  <InputNumber 
                    min={0} 
                    max={100} 
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please enter description' },
            { min: 10, message: 'Description must be at least 10 characters' },
            { max: 500, message: 'Description cannot exceed 500 characters' }
          ]}
        >
          <TextArea
            placeholder="Describe the package benefits and value..."
            rows={3}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          label="Features"
          required
          extra="Add at least 3 features describing package benefits"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px' }}>
                <Form.Item
                  name={['features', index]}
                  initialValue={feature}
                  rules={[
                    { required: true, message: 'Feature is required' },
                    { min: 5, message: 'Feature must be at least 5 characters' }
                  ]}
                  noStyle
                >
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    prefix={<CheckCircleOutlined style={{ color: PURPLE_THEME.primary }} />}
                  />
                </Form.Item>
                {features.length > 3 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeFeature(index)}
                  />
                )}
              </div>
            ))}
            {features.length < 10 && (
              <Button
                type="dashed"
                onClick={addFeature}
                icon={<PlusOutlined />}
                style={{ width: 'fit-content' }}
              >
                Add Feature
              </Button>
            )}
          </div>
        </Form.Item>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Button
            onClick={() => {
              setModalVisible(false);
              form.resetFields();
              setFeatures(['', '', '']);
            }}
            style={{ marginRight: '8px' }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<PlusOutlined />}
          >
            Create Package
          </Button>
        </div>
      </Form>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={40}
            style={{ 
              background: PURPLE_THEME.primary,
              color: 'white'
            }}
            icon={<EditOutlined />}
          />
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: PURPLE_THEME.dark }}>
            Edit {selectedPackage?.name} Package
          </span>
        </div>
      }
      open={editModalVisible}
      onCancel={() => {
        setEditModalVisible(false);
        setSelectedPackage(null);
      }}
      footer={null}
      width={600}
      destroyOnClose
      maskClosable={false}
    >
      {selectedPackage && (
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdatePackage}
        >
          <Alert
            message="Editing Package"
            description="Changes will be applied immediately."
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Package Name"
                name="name"
              >
                <Select disabled size="large">
                  {Object.keys(PACKAGE_COLORS).map(name => (
                    <Option key={name} value={name}>
                      {name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Price"
                name="price"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value || isNaN(value) || value <= 0) {
                        return Promise.reject(new Error('Price must be a positive number'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Currency"
                name="currency"
              >
                <Select size="large">
                  {CURRENCIES.map(currency => (
                    <Option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Row gutter={[16, 0]}>
                <Col span={12}>
                  <Form.Item
                    label="Popular"
                    name="popular"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Order"
                    name="order"
                  >
                    <InputNumber min={0} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'Description is required' },
              { min: 10, message: 'Description must be at least 10 characters' },
              { max: 500, message: 'Description cannot exceed 500 characters' }
            ]}
          >
            <TextArea
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="Features"
            required
            extra="At least 3 features are required"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.map((feature, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px' }}>
                  <Form.Item
                    name={['features', index]}
                    initialValue={feature}
                    rules={[
                      { required: true, message: 'Feature is required' },
                      { min: 5, message: 'Feature must be at least 5 characters' }
                    ]}
                    noStyle
                  >
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...features];
                        newFeatures[index] = e.target.value;
                        setFeatures(newFeatures);
                      }}
                      prefix={<CheckCircleOutlined style={{ color: PURPLE_THEME.primary }} />}
                    />
                  </Form.Item>
                  {features.length > 3 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeFeature(index)}
                    />
                  )}
                </div>
              ))}
              {features.length < 10 && (
                <Button
                  type="dashed"
                  onClick={addFeature}
                  icon={<PlusOutlined />}
                  style={{ width: 'fit-content' }}
                >
                  Add Feature
                </Button>
              )}
            </div>
          </Form.Item>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setSelectedPackage(null);
              }}
              style={{ marginRight: '8px' }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<EditOutlined />}
            >
              Update Package
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );

  const renderViewModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={48}
            style={{ 
              background: selectedPackage ? 
                PACKAGE_COLORS[selectedPackage.name]?.primary || PURPLE_THEME.primary : 
                PURPLE_THEME.primary,
              color: 'white',
              fontSize: '20px'
            }}
          >
            {selectedPackage ? PACKAGE_COLORS[selectedPackage.name]?.icon || '📦' : '📦'}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0, color: PURPLE_THEME.dark }}>
              {selectedPackage?.name} Package Details
            </Title>
            <Text type="secondary">
              ID: {selectedPackage?._id}
            </Text>
          </div>
        </div>
      }
      open={viewModalVisible}
      onCancel={() => setViewModalVisible(false)}
      footer={null}
      width={600}
    >
      {selectedPackage && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
            <Col span={12}>
              <Text strong>Price:</Text>
              <div style={{ fontSize: '18px', color: PURPLE_THEME.dark }}>
                {CURRENCIES.find(c => c.value === selectedPackage.currency)?.symbol}
                {selectedPackage.price.toLocaleString()} {selectedPackage.currency}
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Status:</Text>
              <div>
                <Tag color={selectedPackage.isActive ? 'green' : 'red'}>
                  {selectedPackage.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
            <Col span={12}>
              <Text strong>Order:</Text>
              <div>{selectedPackage.order}</div>
            </Col>
            <Col span={12}>
              <Text strong>Popular:</Text>
              <div>
                {selectedPackage.popular ? (
                  <Tag color="red">Yes</Tag>
                ) : (
                  <Tag>No</Tag>
                )}
              </div>
            </Col>
          </Row>

          <div style={{ marginBottom: '20px' }}>
            <Text strong>Description:</Text>
            <Paragraph style={{ marginTop: '8px' }}>
              {selectedPackage.description}
            </Paragraph>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Text strong>Features ({selectedPackage.features?.length || 0}):</Text>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              {selectedPackage.features?.map((feature, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <Text>
                    <CheckCircleOutlined style={{ 
                      color: PACKAGE_COLORS[selectedPackage.name]?.primary || PURPLE_THEME.primary, 
                      marginRight: '8px' 
                    }} />
                    {feature}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            borderTop: `1px solid ${PURPLE_THEME.primaryLighter}` 
          }}>
            <Text type="secondary">
              Created: {new Date(selectedPackage.createdAt).toLocaleDateString()} • 
              Updated: {new Date(selectedPackage.updatedAt).toLocaleDateString()}
            </Text>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Button onClick={() => setViewModalVisible(false)}>
              Close
            </Button>
          </div>
        </>
      )}
    </Modal>
  );

  /* -------------------------- RENDER -------------------------- */
  if (loading && packages.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  const filteredPackages = packages.filter(pkg => {
    switch (activeTab) {
      case 'active': return pkg.isActive;
      case 'inactive': return !pkg.isActive;
      case 'popular': return pkg.popular;
      default: return true;
    }
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '24px',
      background: PURPLE_THEME.light
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <Title 
              level={2} 
              style={{ 
                margin: 0, 
                color: PURPLE_THEME.dark
              }}
            >
              Package Management
            </Title>
            <Paragraph style={{ color: PURPLE_THEME.gray, marginTop: '4px' }}>
              Create and manage service packages
            </Paragraph>
          </div>
          <Space>
            {canManagePackages && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                size="large"
                style={{ background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary }}
              >
                Create Package
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPackages}
              loading={loading}
              size="large"
            >
              Refresh
            </Button>
          </Space>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: `1px solid ${PURPLE_THEME.primaryLighter}`,
          paddingBottom: '8px'
        }}>
          <Button
            type={activeTab === 'all' ? 'primary' : 'default'}
            onClick={() => setActiveTab('all')}
            style={activeTab === 'all' ? { background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary } : {}}
          >
            All ({packages.length})
          </Button>
          <Button
            type={activeTab === 'active' ? 'primary' : 'default'}
            onClick={() => setActiveTab('active')}
            style={activeTab === 'active' ? { background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary } : {}}
          >
            Active ({packages.filter(p => p.isActive).length})
          </Button>
          <Button
            type={activeTab === 'inactive' ? 'primary' : 'default'}
            onClick={() => setActiveTab('inactive')}
            style={activeTab === 'inactive' ? { background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary } : {}}
          >
            Inactive ({packages.filter(p => !p.isActive).length})
          </Button>
          <Button
            type={activeTab === 'popular' ? 'primary' : 'default'}
            onClick={() => setActiveTab('popular')}
            style={activeTab === 'popular' ? { background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary } : {}}
          >
            Popular ({packages.filter(p => p.popular).length})
          </Button>
        </div>

        {/* Package Grid */}
        {filteredPackages.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredPackages
              .sort((a, b) => a.order - b.order)
              .map(pkg => (
                <Col key={pkg._id} xs={24} sm={12} md={8} lg={6}>
                  <PackageCard pkg={pkg} />
                </Col>
              ))}
          </Row>
        ) : (
          <Card
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '8px'
            }}
          >
            <ShoppingOutlined style={{ fontSize: '48px', color: PURPLE_THEME.gray, marginBottom: '16px' }} />
            <Title level={4} style={{ color: PURPLE_THEME.dark, marginBottom: '8px' }}>
              No Packages Found
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
              {activeTab === 'all' 
                ? 'No packages have been created yet.' 
                : `No ${activeTab} packages found.`}
            </Paragraph>
            {canManagePackages && activeTab === 'all' && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                size="large"
                style={{ background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary }}
              >
                Create First Package
              </Button>
            )}
          </Card>
        )}

        {/* Modals */}
        {renderCreateModal()}
        {renderEditModal()}
        {renderViewModal()}
      </div>
    </div>
  );
};

export default Packages;