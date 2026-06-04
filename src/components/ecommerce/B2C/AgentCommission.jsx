import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Space
} from "antd";
import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentCommission() {
  const navigate = useNavigate();

  const commissions = [
    {
      key: 1,
      client: "Rahul Mehta",
      project: "Sky Tower",
      amount: 45000,
      status: "Pending",
      date: "20 Feb 2026"
    },
    {
      key: 2,
      client: "Ali Hassan",
      project: "Downtown View",
      amount: 38000,
      status: "Paid",
      date: "15 Feb 2026"
    }
  ];

  const total = commissions.reduce((sum, c) => sum + c.amount, 0);
  const paid = commissions
    .filter((c) => c.status === "Paid")
    .reduce((sum, c) => sum + c.amount, 0);
  const pending = total - paid;

  const getStatusColor = (status) => {
    if (status === "Paid") return "green";
    if (status === "Pending") return "orange";
    return "default";
  };

  const columns = [
    {
      title: "Client",
      dataIndex: "client"
    },
    {
      title: "Project",
      dataIndex: "project"
    },
    {
      title: "Commission",
      dataIndex: "amount",
      render: (amount) => `₹${amount.toLocaleString()}`
    },
    {
      title: "Date",
      dataIndex: "date"
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          className="px-3 py-1 rounded-full text-sm"
        >
          {status}
        </Tag>
      )
    },
    {
      title: "Action",
      render: (record) => (
        <Button
          type="primary"
          ghost
          onClick={() =>
            navigate(`/dashboard/agent/commission/${record.key}`)
          }
          className="rounded-lg"
        >
          View Details
        </Button>
      )
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-1">
          Commission Dashboard
        </Title>
        <Text type="secondary">
          Track your earnings and payment status
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Total Commission"
              value={total}
              prefix="₹"
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Paid"
              value={paid}
              prefix={<CheckCircleOutlined />}
              suffix="₹"
              valueStyle={{ color: "#16a34a", fontWeight: 600 }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Pending"
              value={pending}
              prefix={<ClockCircleOutlined />}
              suffix="₹"
              valueStyle={{ color: "#f59e0b", fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Section */}
      <Card
        bordered={false}
        className="shadow-lg rounded-2xl"
        bodyStyle={{ padding: "24px" }}
      >
        <Space className="mb-4">
          <Title level={4} className="!mb-0">
            Commission History
          </Title>
        </Space>

        <Table
          columns={columns}
          dataSource={commissions}
          pagination={{ pageSize: 5 }}
          rowKey="key"
        />
      </Card>
    </div>
  );
}