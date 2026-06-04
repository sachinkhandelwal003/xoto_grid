import React from "react";
import { Card, Row, Col, Typography, Tag, Progress, Table, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

const AgencyAgentDetails = () => {
  const { id } = useParams();

  // Dummy Data (later backend se replace karenge)
  const agent = {
    id,
    name: "Rahul Sharma",
    email: "rahul@test.com",
    phone: "+91 9876543210",
    leads: 20,
    deals: 5,
    revenue: 120000,
  };

  const conversion = ((agent.deals / agent.leads) * 100).toFixed(1);

  const recentDeals = [
    { key: 1, project: "Palm Residency", amount: 30000, status: "Closed" },
    { key: 2, project: "Skyline Towers", amount: 45000, status: "Closed" },
  ];

  const columns = [
    {
      title: "Project",
      dataIndex: "project",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (val) => `₹ ${val.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <Tag color="green">{status}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header Card */}
      <Card bordered={false} style={{ marginBottom: 20 }}>
        <Row align="middle" gutter={20}>
          <Col>
            <Avatar size={80} icon={<UserOutlined />} style={{ background: "#4F46E5" }} />
          </Col>
          <Col>
            <Title level={4} style={{ marginBottom: 0 }}>
              {agent.name}
            </Title>
            <Text type="secondary">{agent.email}</Text>
            <br />
            <Text type="secondary">{agent.phone}</Text>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Text>Total Leads</Text>
            <Title level={3}>{agent.leads}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Text>Total Deals</Text>
            <Title level={3}>{agent.deals}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Text>Total Revenue</Text>
            <Title level={3}>₹ {agent.revenue.toLocaleString()}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Text>Conversion</Text>
            <Progress percent={parseFloat(conversion)} />
          </Card>
        </Col>
      </Row>

      {/* Recent Deals */}
      <Card bordered={false}>
        <Title level={5}>Recent Deals</Title>
        <Table columns={columns} dataSource={recentDeals} pagination={false} />
      </Card>
    </div>
  );
};

export default AgencyAgentDetails;