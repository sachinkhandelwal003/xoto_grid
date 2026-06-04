import React, { useState } from 'react';
import { 
  Table, Tag, Space, Card, Typography, Row, Col, Statistic, 
  Button, Modal, Tabs, Divider, Tooltip, Badge, Image 
} from 'antd';
import { 
  CheckCircleOutlined, 
  DollarCircleOutlined, 
  FileDoneOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const THEME = {
  primary: '#722ed1',
  success: '#52c41a',
  pending: '#faad14',
  revenue: '#00b96b'
};

// --- STATIC DUMMY DATA ---
const closedDealsData = [
  {
    key: '1',
    dealId: 'DL-9901',
    property: 'Ellington One River Point',
    agent: 'Rahul Sharma',
    developer: 'Ellington',
    price: 1482000,
    closeDate: '2026-02-18',
    status: 'Verified',
    documents: ['Booking Form', 'ID Copy', 'SPA']
  },
  {
    key: '2',
    dealId: 'DL-9902',
    property: 'Jumeirah Living Residences',
    agent: 'Anjali Gupta',
    developer: 'Select Group',
    price: 3200000,
    closeDate: '2026-02-15',
    status: 'Pending Review',
    documents: ['Booking Form', 'ID Copy']
  }
];

const commissionData = [
  {
    key: 'c1',
    dealId: 'DL-9901',
    agent: 'Rahul Sharma',
    totalCommission: 74100, // 5% of 1.48M
    agentCut: 59280, // 80%
    xotoCut: 14820, // 20%
    payoutStatus: 'Paid',
    paidDate: '2026-02-19'
  },
  {
    key: 'c2',
    dealId: 'DL-9855',
    agent: 'Suresh Mehra',
    totalCommission: 50000,
    agentCut: 40000,
    xotoCut: 10000,
    payoutStatus: 'Processing',
    paidDate: '-'
  }
];

const DealCommissionManager = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [viewModal, setViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openDetails = (record) => {
    setSelectedItem(record);
    setViewModal(true);
  };

  // --- COLUMNS FOR DEALS ---
  const dealColumns = [
    { title: 'Deal ID', dataIndex: 'dealId', key: 'dealId', render: text => <Text code>{text}</Text> },
    { title: 'Property', dataIndex: 'property', key: 'property', render: text => <Text strong>{text}</Text> },
    { title: 'Agent', dataIndex: 'agent', key: 'agent' },
    { title: 'Sale Price', dataIndex: 'price', key: 'price', render: val => `AED ${val.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => (
      <Tag color={s === 'Verified' ? 'green' : 'orange'} icon={s === 'Verified' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>{s}</Tag>
    )},
    { title: 'Action', key: 'action', render: (_, record) => (
      <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>Review</Button>
    )}
  ];

  // --- COLUMNS FOR COMMISSIONS ---
  const commissionColumns = [
    { title: 'Deal ID', dataIndex: 'dealId', key: 'dealId' },
    { title: 'Agent Name', dataIndex: 'agent', key: 'agent' },
    { title: 'Total Comm.', dataIndex: 'totalCommission', key: 'total', render: val => `AED ${val.toLocaleString()}` },
    { title: 'Agent Payout', dataIndex: 'agentCut', key: 'agentCut', render: val => <Text type="success">AED {val.toLocaleString()}</Text> },
    { title: 'Xoto Grid Cut', dataIndex: 'xotoCut', key: 'xotoCut', render: val => <Text type="warning">AED {val.toLocaleString()}</Text> },
    { title: 'Status', dataIndex: 'payoutStatus', key: 'pStatus', render: s => (
      <Badge status={s === 'Paid' ? 'success' : 'processing'} text={s} />
    )},
    { title: 'Action', key: 'action', render: () => <Button size="small" icon={<DownloadOutlined />}>Invoice</Button> }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Title level={2}><FileDoneOutlined /> Post-Sale & Commission Operations</Title>
      <Text type="secondary">Verify closed deals and manage agent commission distributions.</Text>

      {/* OVERVIEW STATS */}
      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Deals Pending Review" value={14} prefix={<ClockCircleOutlined style={{color: THEME.pending}} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Total Closed Revenue (MTD)" value={4500000} prefix="AED " valueStyle={{color: THEME.revenue}} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Xoto Net Revenue" value={85000} prefix={<DollarCircleOutlined style={{color: THEME.primary}} />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-md rounded-xl">
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <TabPane tab={<span><FileProtectOutlined /> Verified Deals</span>} key="1">
            <Table columns={dealColumns} dataSource={closedDealsData} pagination={{ pageSize: 5 }} />
          </TabPane>
          <TabPane tab={<span><DollarCircleOutlined /> Commission Settlements</span>} key="2">
            <Table columns={commissionColumns} dataSource={commissionData} pagination={{ pageSize: 5 }} />
          </TabPane>
        </Tabs>
      </Card>

      {/* DETAIL MODAL */}
      <Modal
        title={`Deal Audit: ${selectedItem?.dealId}`}
        open={viewModal}
        onCancel={() => setViewModal(false)}
        width={700}
        footer={[
          <Button key="back" onClick={() => setViewModal(false)}>Close</Button>,
          <Button key="approve" type="primary" style={{backgroundColor: THEME.success}}>Approve & Release Commission</Button>
        ]}
      >
        {selectedItem && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Property Detail</Text>
                <Title level={5}><ShopOutlined /> {selectedItem.property}</Title>
              </Col>
              <Col span={12}>
                <Text type="secondary">Closing Agent</Text>
                <Title level={5}><User自由 Outlined /> {selectedItem.agent}</Title>
              </Col>
            </Row>
            <Divider />
            <Title level={5}>Closing Documents (KYC)</Title>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {selectedItem.documents.map(doc => (
                <Card size="small" style={{width: 150, textAlign: 'center', background: '#f5f5f5'}} key={doc}>
                  <FileDoneOutlined style={{fontSize: 24, color: THEME.primary}} />
                  <div style={{fontSize: 12, marginTop: 5}}>{doc}</div>
                  <Button type="link" size="small">View</Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DealCommissionManager;