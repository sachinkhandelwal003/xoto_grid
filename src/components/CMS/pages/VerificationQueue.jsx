import React, { useState } from 'react';
import { 
  Table, Tag, Space, Card, Typography, Row, Col, Statistic, 
  Button, Modal, Badge, Avatar, Divider, Tooltip, Empty, Descriptions 
} from 'antd';
import { 
 
  ClockCircleOutlined, 
  SafetyCertificateOutlined,
  EyeOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileProtectOutlined,
  MailOutlined,
  IdcardOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const THEME = {
  primary: '#722ed1',
  success: '#52c41a',
  error: '#f5222d',
  warning: '#faad14',
};

// --- STATIC DUMMY DATA FOR PENDING KYC ---
const mockPendingUsers = [
  {
    key: '1',
    name: 'Vikram Mehta',
    type: 'Agent',
    email: 'vikram.pro@gmail.com',
    reraNumber: 'RERA-123456',
    appliedOn: '2026-02-19',
    docs: [
      { name: 'RERA License', url: '#', status: 'ready' },
      { name: 'Emirates ID', url: '#', status: 'ready' }
    ]
  },
  {
    key: '2',
    name: 'Select Properties',
    type: 'Agency',
    email: 'hr@selectprops.ae',
    reraNumber: 'OR-5500',
    appliedOn: '2026-02-20',
    docs: [
      { name: 'Trade License', url: '#', status: 'ready' },
      { name: 'VAT Certificate', url: '#', status: 'ready' }
    ]
  },
  {
    key: '3',
    name: 'Zaid Al-Sayed',
    type: 'Agent',
    email: 'zaid.dubai@realestate.com',
    reraNumber: 'RERA-998877',
    appliedOn: '2026-02-18',
    docs: [
      { name: 'RERA License', url: '#', status: 'ready' }
    ]
  }
];

const VerificationQueue = () => {
  const [viewModal, setViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openAudit = (record) => {
    setSelectedUser(record);
    setViewModal(true);
  };

  const columns = [
    {
      title: 'Applicant',
      key: 'user',
      render: (_, r) => (
  <Space>
    {/* ✅ Yahan bhi icon update kar diya */}
    <Avatar icon={<UserAddOutlined />} style={{ backgroundColor: THEME.primary }} />
    <div>
      <Text strong className="block">{r.name}</Text>
      <Text type="secondary" style={{ fontSize: '11px' }}>{r.email}</Text>
    </div>
  </Space>
)
    },
    {
      title: 'Role',
      dataIndex: 'type',
      key: 'type',
      render: (t) => <Tag color={t === 'Agency' ? 'purple' : 'blue'}>{t.toUpperCase()}</Tag>
    },
    {
      title: 'RERA / License No.',
      dataIndex: 'reraNumber',
      key: 'rera',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Pending Since',
      dataIndex: 'appliedOn',
      key: 'date',
      render: (date) => (
        <Space>
          <ClockCircleOutlined style={{ color: THEME.warning }} />
          {date}
        </Space>
      )
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost 
          icon={<EyeOutlined />} 
          onClick={() => openAudit(record)}
        >
          Review Documents
        </Button>
      )
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-8">
        <Title level={2}><SafetyCertificateOutlined /> Verification Queue</Title>
        <Text type="secondary">Review and approve new Agent/Agency registrations to grant platform access.</Text>
      </div>

      {/* KYC STATS SNAPSHOT */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Total Pending Requests" value={12} prefix={<ClockCircleOutlined style={{ color: THEME.warning }} />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Verified This Week" value={45} prefix={<CheckCircleOutlined style={{ color: THEME.success }} />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Avg. Approval Time" value="4.5h" prefix={<FileProtectOutlined style={{ color: THEME.primary }} />} />
          </Card>
        </Col>
      </Row>

      {/* MASTER QUEUE TABLE */}
      <Card bordered={false} className="shadow-md rounded-xl overflow-hidden">
        <Table columns={columns} dataSource={mockPendingUsers} pagination={{ pageSize: 10 }} />
      </Card>

      {/* AUDIT MODAL */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IdcardOutlined style={{ color: THEME.primary }} />
            <span>KYC Audit: {selectedUser?.name}</span>
          </div>
        }
        open={viewModal}
        onCancel={() => setViewModal(false)}
        width={750}
        footer={[
          <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={() => setViewModal(false)}>Reject Application</Button>,
          <Button key="approve" type="primary" icon={<CheckCircleOutlined />} style={{ backgroundColor: THEME.success, borderColor: THEME.success }}>Verify & Approve</Button>
        ]}
      >
        {selectedUser ? (
          <div className="py-2">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Full Name">{selectedUser.name}</Descriptions.Item>
              <Descriptions.Item label="Email"><MailOutlined /> {selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="License No.">{selectedUser.reraNumber}</Descriptions.Item>
              <Descriptions.Item label="Applied Date">{selectedUser.appliedOn}</Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Submitted Documents</Divider>
            <Row gutter={[16, 16]}>
              {selectedUser.docs.map((doc, i) => (
                <Col span={12} key={i}>
                  <Card size="small" hoverable style={{ background: '#f9f9f9', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <FileProtectOutlined style={{ fontSize: '20px', color: THEME.primary }} />
                        <Text strong>{doc.name}</Text>
                      </Space>
                      <Button type="link">View File</Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <Space>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary">Admin Tip: Please cross-check the RERA Number with the official Land Department portal before approving.</Text>
              </Space>
            </div>
          </div>
        ) : <Empty />}
      </Modal>
    </div>
  );
};

export default VerificationQueue;