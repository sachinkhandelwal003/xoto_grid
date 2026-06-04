import React, { useState } from 'react';
import { 
  Card, Row, Col, Typography, Button, Table, Tag, Space, 
  Modal, Form, Input, InputNumber, Switch, Divider, message, Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleFilled, 
  RocketOutlined, 
  CrownOutlined, 
  ThunderboltOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const THEME = {
  primary: '#722ed1',
  pro: '#1890ff',
  enterprise: '#f5222d',
  success: '#52c41a'
};

// --- STATIC DUMMY DATA FOR PLANS ---
const mockPlans = [
  {
    key: '1',
    name: 'Starter / Free',
    price: 0,
    duration: 'Forever',
    activeUsers: 120,
    features: ['5 Properties Listing', 'Basic Leads Access', 'Xobia AI Support'],
    isPopular: false,
    status: true,
  },
  {
    key: '2',
    name: 'Agent Pro',
    price: 499,
    duration: 'Monthly',
    activeUsers: 85,
    features: ['Unlimited Properties', 'Priority Leads', 'AI Presentation Gen', 'CRM Access'],
    isPopular: true,
    status: true,
  },
  {
    key: '3',
    name: 'Agency Elite',
    price: 1999,
    duration: 'Yearly',
    activeUsers: 12,
    features: ['Multi-Agent Support', 'XOTO Blitz Campaigns', 'Dedicated Account Manager', 'Custom Reports'],
    isPopular: false,
    status: true,
  }
];

const SubscriptionPlans = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: 'Plan Name', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
    { title: 'Price (AED)', dataIndex: 'price', key: 'price', render: (p) => <Text strong>{p === 0 ? 'Free' : `AED ${p.toLocaleString()}`}</Text> },
    { title: 'Billing', dataIndex: 'duration', key: 'duration' },
    { title: 'Subscribed Users', dataIndex: 'activeUsers', key: 'users', render: (u) => <Tag color="blue">{u} Agents</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Switch checked={s} size="small" /> },
    { 
      title: 'Action', 
      key: 'action', 
      render: () => (
        <Space>
          <Button icon={<EditOutlined />} size="small" />
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Space>
      ) 
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2}>Subscription Plans</Title>
          <Text type="secondary">Manage Agent and Agency membership tiers and feature access.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large" 
          onClick={() => setModalVisible(true)}
          style={{ backgroundColor: THEME.primary }}
        >
          Create New Plan
        </Button>
      </div>

      {/* PLAN PREVIEW CARDS */}
      <Row gutter={[24, 24]} className="mb-10">
        {mockPlans.map((plan) => (
          <Col xs={24} md={8} key={plan.key}>
            <Card 
              className={`shadow-md hover:shadow-lg transition-all border-t-4 ${plan.isPopular ? 'scale-105' : ''}`}
              style={{ borderRadius: '16px', borderColor: plan.key === '3' ? THEME.enterprise : plan.key === '2' ? THEME.pro : THEME.primary }}
            >
              {plan.isPopular && <Tag color="gold" className="mb-2">Most Popular</Tag>}
              <div className="text-center">
                {plan.key === '1' && <RocketOutlined style={{ fontSize: '32px', color: THEME.primary }} />}
                {plan.key === '2' && <ThunderboltOutlined style={{ fontSize: '32px', color: THEME.pro }} />}
                {plan.key === '3' && <CrownOutlined style={{ fontSize: '32px', color: THEME.enterprise }} />}
                
                <Title level={4} className="mt-2">{plan.name}</Title>
                <div className="my-4">
                  <Text style={{ fontSize: '28px', fontWeight: 'bold' }}>AED {plan.price}</Text>
                  <Text type="secondary"> / {plan.duration}</Text>
                </div>
              </div>
              
              <Divider />
              
              <ul className="list-none p-0">
                {plan.features.map(f => (
                  <li key={f} className="mb-2">
                    <CheckCircleFilled style={{ color: THEME.success, marginRight: '8px' }} /> {f}
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MASTER PLAN TABLE */}
      <Card title="Plan Inventory Management" bordered={false} className="shadow-sm rounded-xl">
        <Table columns={columns} dataSource={mockPlans} pagination={false} />
      </Card>

      {/* CREATE/EDIT MODAL */}
      <Modal
        title="Plan Configuration"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>Cancel</Button>,
          <Button key="save" type="primary" style={{ backgroundColor: THEME.primary }}>Save Plan</Button>
        ]}
      >
        <Form layout="vertical" form={form} initialValues={{ duration: 'monthly' }}>
          <Form.Item label="Plan Name" required><Input placeholder="e.g. Pro Monthly" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Price (AED)" required><InputNumber className="w-full" min={0} /></Form.Item></Col>
            <Col span={12}>
              <Form.Item label="Billing Period">
                <Switch checkedChildren="Yearly" unCheckedChildren="Monthly" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Features (One per line)"><Input.TextArea rows={4} placeholder="Feature 1&#10;Feature 2" /></Form.Item>
          <Form.Item label="Mark as Popular" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionPlans;