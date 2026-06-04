import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Space
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AgentDeals() {

  const navigate = useNavigate();

  const deals = [
    {
      key: 1,
      client: "Rahul Mehta",
      project: "Sky Tower",
      amount: 14000000,
      status: "Booked"
    },
    {
      key: 2,
      client: "Ali Hassan",
      project: "Downtown View",
      amount: 11000000,
      status: "Contract Signed"
    },
    {
      key: 3,
      client: "Neha Gupta",
      project: "Marina Heights",
      amount: 9500000,
      status: "Commission Pending"
    }
  ];

  const getStatusColor = (status) => {
    if (status === "Booked") return "blue";
    if (status === "Contract Signed") return "green";
    if (status === "Commission Pending") return "orange";
    return "default";
  };

  // Summary calculations
  const totalDeals = deals.length;
  const signedDeals = deals.filter(d => d.status === "Contract Signed").length;
  const pendingCommission = deals.filter(d => d.status === "Commission Pending").length;

  const columns = [
    { title: "Client", dataIndex: "client" },
    { title: "Project", dataIndex: "project" },
    {
      title: "Deal Value",
      dataIndex: "amount",
      render: (amount) => `₹${amount.toLocaleString()}`
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          className="px-3 py-1 rounded-full"
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
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(`/dashboard/agent/deals/${record.key}`)
          }
          className="rounded-lg"
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!mb-1">
          Deals Management
        </Title>
        <Text type="secondary">
          Track all your client deals and progress
        </Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Total Deals"
              value={totalDeals}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Contracts Signed"
              value={signedDeals}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#16a34a" }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-md rounded-2xl">
            <Statistic
              title="Commission Pending"
              value={pendingCommission}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Section */}
      <Card
        bordered={false}
        className="shadow-lg rounded-2xl mb-6"
      >
        <Space>
          <Input.Search
            placeholder="Search client or project"
            style={{ width: 250 }}
          />
          <Select defaultValue="all" style={{ width: 180 }}>
            <Option value="all">All Status</Option>
            <Option value="booked">Booked</Option>
            <Option value="signed">Contract Signed</Option>
            <Option value="pending">Commission Pending</Option>
          </Select>
        </Space>
      </Card>

      {/* Deals Table */}
      <Card
        bordered={false}
        className="shadow-lg rounded-2xl"
      >
        <Table
          columns={columns}
          dataSource={deals}
          pagination={{ pageSize: 5 }}
          rowKey="key"
        />
      </Card>

    </div>
  );
}