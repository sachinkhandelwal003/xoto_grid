// src/pages/freelancer/components/AccountManagement.jsx
import React from "react";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Typography,
  Row,
  Col,
  Statistic,
  List,
  Divider,
} from "antd";
import {
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AccountManagement = ({ onBack }) => {
  // Dummy data for account profile
  const accountData = {
    companyName: "Landscape Designs LLC",
    contactPerson: "John Smith",
    email: "john@landscapedesigns.com",
    phone: "+1 (555) 123-4567",
    address: "123 Garden Street, Green City, GC 12345",
    taxId: "12-3456789",
    registrationDate: "2023-01-15",
    status: "Active",
  };

  const financialStats = {
    totalEarnings: 125000,
    pendingPayments: 25000,
    completedProjects: 12,
    ongoingProjects: 3,
  };

  const recentTransactions = [
    { id: 1, date: "2024-01-15", description: "Project: Beach Resort", amount: 45000, status: "Paid" },
    { id: 2, date: "2024-01-10", description: "Project: Office Park", amount: 32000, status: "Paid" },
    { id: 3, date: "2024-01-05", description: "Project: Villa Garden", amount: 28000, status: "Pending" },
    { id: 4, date: "2023-12-28", description: "Project: Hotel Landscape", amount: 55000, status: "Paid" },
  ];

  return (
    <div>
      <Button onClick={onBack} style={{ marginBottom: 16 }}>
        Back to Projects
      </Button>

      <Row gutter={16}>
        {/* Company Information */}
        <Col span={8}>
          <Card>
            <Title level={4}>
              <UserOutlined /> Account Profile
            </Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Company">{accountData.companyName}</Descriptions.Item>
              <Descriptions.Item label="Contact">{accountData.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="Email">{accountData.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{accountData.phone}</Descriptions.Item>
              <Descriptions.Item label="Address">{accountData.address}</Descriptions.Item>
              <Descriptions.Item label="Tax ID">{accountData.taxId}</Descriptions.Item>
              <Descriptions.Item label="Registration">
                <CalendarOutlined /> {accountData.registrationDate}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="green">{accountData.status}</Tag>
              </Descriptions.Item>
            </Descriptions>
            <Button type="primary" style={{ marginTop: 16, width: "100%" }}>
              Edit Profile
            </Button>
          </Card>
        </Col>

        {/* Financial Overview */}
        <Col span={16}>
          <Card>
            <Title level={4}>
              <DollarOutlined /> Financial Overview
            </Title>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total Earnings"
                  value={financialStats.totalEarnings}
                  prefix="$"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Pending Payments"
                  value={financialStats.pendingPayments}
                  prefix="$"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Completed Projects"
                  value={financialStats.completedProjects}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Ongoing Projects"
                  value={financialStats.ongoingProjects}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Recent Transactions */}
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>Recent Transactions</Title>
            <List
              dataSource={recentTransactions}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.description}
                    description={
                      <div>
                        <Text type="secondary">{item.date}</Text>
                        <Tag 
                          color={item.status === 'Paid' ? 'green' : 'orange'} 
                          style={{ marginLeft: 8 }}
                        >
                          {item.status}
                        </Tag>
                      </div>
                    }
                  />
                  <div>
                    <Text strong>${item.amount.toLocaleString()}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {/* Bank Information */}
          <Card style={{ marginTop: 16 }}>
            <Title level={5}>Bank Information</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Bank Name">City Bank</Descriptions.Item>
              <Descriptions.Item label="Account Number">**** **** **** 1234</Descriptions.Item>
              <Descriptions.Item label="Routing Number">021000021</Descriptions.Item>
              <Descriptions.Item label="Account Type">Business Checking</Descriptions.Item>
            </Descriptions>
            <Button type="dashed" style={{ marginTop: 8, width: "100%" }}>
              Update Bank Details
            </Button>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Invoices Section */}
      <Card>
        <Title level={4}>Recent Invoices</Title>
        <List
          dataSource={[
            { id: 'INV-001', date: '2024-01-15', project: 'Beach Resort', amount: 45000, status: 'Paid' },
            { id: 'INV-002', date: '2024-01-10', project: 'Office Park', amount: 32000, status: 'Paid' },
            { id: 'INV-003', date: '2024-01-05', project: 'Villa Garden', amount: 28000, status: 'Pending' },
          ]}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type="link">Download</Button>,
                <Button type="link">View</Button>,
              ]}
            >
              <List.Item.Meta
                title={`${item.id} - ${item.project}`}
                description={
                  <div>
                    <Text type="secondary">Date: {item.date}</Text>
                    <Tag 
                      color={item.status === 'Paid' ? 'green' : 'orange'} 
                      style={{ marginLeft: 8 }}
                    >
                      {item.status}
                    </Tag>
                  </div>
                }
              />
              <div>
                <Text strong>${item.amount.toLocaleString()}</Text>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default AccountManagement;