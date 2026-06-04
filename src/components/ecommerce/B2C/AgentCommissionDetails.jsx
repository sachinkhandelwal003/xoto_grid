import {
  Card,
  Typography,
  Tag,
  Button,
  Row,
  Col,
  Divider,
  Descriptions,
  Space
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentCommissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Static Data (later replace with API using id)
  const commission = {
    client: "Rahul Mehta",
    project: "Sky Tower",
    propertyUnit: "Unit 1204 - 2BHK",
    saleAmount: 4500000,
    commissionRate: "1%",
    commissionAmount: 45000,
    status: "Pending",
    bookingDate: "10 Feb 2026",
    paymentDue: "28 Feb 2026"
  };

  const isPaid = commission.status === "Paid";

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          <Title level={3} className="!mb-0">
            Commission Details
          </Title>
        </Space>

        <Tag
          color={isPaid ? "green" : "orange"}
          icon={isPaid ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          className="px-4 py-1 text-sm rounded-full"
        >
          {commission.status}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>

        {/* Left Main Card */}
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-lg rounded-2xl">

            <Title level={4}>Transaction Overview</Title>
            <Divider />

            <Descriptions column={1} size="middle">

              <Descriptions.Item label="Client">
                {commission.client}
              </Descriptions.Item>

              <Descriptions.Item label="Project">
                {commission.project}
              </Descriptions.Item>

              <Descriptions.Item label="Unit">
                {commission.propertyUnit}
              </Descriptions.Item>

              <Descriptions.Item label="Total Sale Value">
                ₹{commission.saleAmount.toLocaleString()}
              </Descriptions.Item>

              <Descriptions.Item label="Commission Rate">
                {commission.commissionRate}
              </Descriptions.Item>

              <Descriptions.Item label="Commission Amount">
                <Text strong>
                  ₹{commission.commissionAmount.toLocaleString()}
                </Text>
              </Descriptions.Item>

            </Descriptions>

          </Card>
        </Col>

        {/* Right Summary Card */}
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-lg rounded-2xl">

            <Title level={5}>Payment Info</Title>
            <Divider />

            <div className="space-y-4">

              <div>
                <Text type="secondary">Booking Date</Text><br />
                <Text strong>{commission.bookingDate}</Text>
              </div>

              <div>
                <Text type="secondary">Payment Due</Text><br />
                <Text strong>{commission.paymentDue}</Text>
              </div>

              <Divider />

              <Button
                type="primary"
                size="large"
                block
                disabled={isPaid}
                className="rounded-xl h-11"
              >
                {isPaid ? "Payment Received" : "Mark as Received"}
              </Button>

            </div>

          </Card>
        </Col>

      </Row>

    </div>
  );
}