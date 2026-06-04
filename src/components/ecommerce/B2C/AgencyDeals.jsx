import React from "react";
import { Card, Typography, Row, Col, Tag } from "antd";

const { Title } = Typography;

export default function AgencyDeals() {
  const dealsData = {
    Lead: [
      {
        client: "John Doe",
        project: "Palm Heights",
        amount: "$450k",
      },
    ],
    Visit: [
      {
        client: "Sarah Smith",
        project: "Skyline Towers",
        amount: "$520k",
      },
    ],
    Negotiation: [],
    Booking: [],
    Closed: [
      {
        client: "Ali Khan",
        project: "Palm Heights",
        amount: "$480k",
      },
    ],
  };

  const renderDeals = (deals) =>
    deals.map((deal, index) => (
      <Card
        key={index}
        size="small"
        style={{ marginBottom: 10 }}
      >
        <p><b>Client:</b> {deal.client}</p>
        <p><b>Project:</b> {deal.project}</p>
        <Tag color="blue">{deal.amount}</Tag>
      </Card>
    ));

  return (
    <div style={{ padding: 20 }}>
      <Title level={4}>Deals Pipeline</Title>

      <Row gutter={16}>
        {Object.keys(dealsData).map((stage) => (
          <Col span={4} key={stage}>
            <Card title={stage} bordered={false}>
              {renderDeals(dealsData[stage])}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
