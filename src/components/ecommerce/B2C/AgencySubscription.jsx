import React, { useState } from "react";
import { Card, Typography, Row, Col, Button, Tag, Table } from "antd";

const { Title, Text } = Typography;

const AgencySubscription = () => {
  const [currentPlan] = useState("Pro Plan");

  const plans = [
    {
      name: "Basic",
      price: "₹ 2,999 / month",
      features: ["5 Agents", "Basic CRM", "Commission Tracking"],
    },
    {
      name: "Pro",
      price: "₹ 7,999 / month",
      features: ["Unlimited Agents", "Advanced Analytics", "Branch System"],
    },
    {
      name: "Enterprise",
      price: "Custom Pricing",
      features: ["Multi-Branch", "Priority Support", "Custom Integration"],
    },
  ];

  const invoices = [
    { key: 1, month: "March 2026", amount: "₹ 7,999", status: "Paid" },
    { key: 2, month: "February 2026", amount: "₹ 7,999", status: "Paid" },
  ];

  const invoiceColumns = [
    { title: "Month", dataIndex: "month" },
    { title: "Amount", dataIndex: "amount" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) =>
        status === "Paid" ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="red">Pending</Tag>
        ),

    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Subscription & Billing</Title>

      {/* Current Plan */}
      <Card bordered={false} style={{ marginBottom: 20 }}>
        <Text>Current Plan:</Text>
        <Title level={3} style={{ color: "#4F46E5" }}>
          {currentPlan}
        </Title>
        <Tag color="green">Active</Tag>
      </Card>

      {/* Plans */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {plans.map((plan) => (
          <Col span={8} key={plan.name}>
            <Card bordered={false}>
              <Title level={5}>{plan.name} Plan</Title>
              <Title level={4}>{plan.price}</Title>
              {plan.features.map((f, i) => (
                <Text key={i} style={{ display: "block" }}>
                  ✔ {f}
                </Text>
              ))}
              <Button type="primary" style={{ marginTop: 15 }}>
                Choose Plan
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Invoice History */}
      <Card bordered={false}>
        <Title level={5}>Invoice History</Title>
        <Table
          columns={invoiceColumns}
          dataSource={invoices}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AgencySubscription;  