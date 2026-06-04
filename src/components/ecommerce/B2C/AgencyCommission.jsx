import React, { useState } from "react";
import { Card, Row, Col, Typography, Table, Tag, Button } from "antd";

const { Title, Text } = Typography;

const AgencyCommission = () => {
  const [commissions, setCommissions] = useState([
    {
      key: 1,
      agent: "Rahul Sharma",
      project: "Palm Residency",
      amount: 25000,
      status: "Pending",
    },
    {
      key: 2,
      agent: "Priya Mehta",
      project: "Skyline Towers",
      amount: 18000,
      status: "Paid",
    },
  ]);

  const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);
  const pendingAmount = commissions
    .filter((c) => c.status === "Pending")
    .reduce((sum, c) => sum + c.amount, 0);

  const paidAmount = commissions
    .filter((c) => c.status === "Paid")
    .reduce((sum, c) => sum + c.amount, 0);

  const markAsPaid = (key) => {
    setCommissions(
      commissions.map((c) =>
        c.key === key ? { ...c, status: "Paid" } : c
      )
    );
  };

  const columns = [
    {
      title: "Agent",
      dataIndex: "agent",
    },
    {
      title: "Project",
      dataIndex: "project",
    },
    {
      title: "Commission",
      dataIndex: "amount",
      render: (val) => `₹ ${val.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === "Paid" ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
    {
      title: "Action",
      render: (_, record) =>
        record.status === "Pending" ? (
          <Button type="primary" onClick={() => markAsPaid(record.key)}>
            Mark Paid
          </Button>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Commission & Payout</Title>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card bordered={false}>
            <Text>Total Commission</Text>
            <Title level={3}>₹ {totalCommission.toLocaleString()}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Text>Pending Payout</Text>
            <Title level={3} style={{ color: "#fa8c16" }}>
              ₹ {pendingAmount.toLocaleString()}
            </Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Text>Paid Amount</Text>
            <Title level={3} style={{ color: "#52c41a" }}>
              ₹ {paidAmount.toLocaleString()}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card bordered={false}>
        <Table columns={columns} dataSource={commissions} pagination={false} />
      </Card>
    </div>
  );
};

export default AgencyCommission;