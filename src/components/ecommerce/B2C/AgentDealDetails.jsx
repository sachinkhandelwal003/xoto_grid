import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Steps,
  Button,
  Divider,
  Space,
  Statistic
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function AgentDealDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dummy data (replace with API later)
  const deal = {
    client: "Rahul Mehta",
    project: "Sky Tower",
    unit: "Unit 1204 - 2BHK",
    amount: 14000000,
    commission: 45000,
    stage: 2,
    bookingDate: "10 Feb 2026",
    handoverDate: "30 Dec 2026"
  };

  const isCommissionPaid = deal.stage === 4;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          <Title level={2} className="!mb-0">
            Deal Details
          </Title>
        </Space>

        <Tag
          color={isCommissionPaid ? "green" : "blue"}
          icon={
            isCommissionPaid
              ? <CheckCircleOutlined />
              : <ClockCircleOutlined />
          }
          className="px-4 py-1 rounded-full text-sm"
        >
          {isCommissionPaid ? "Commission Paid" : "Active Deal"}
        </Tag>
      </div>

      <Row gutter={[24, 24]}>

        {/* LEFT SECTION */}
        <Col xs={24} lg={14}>
          <Card bordered={false} className="shadow-lg rounded-2xl">

            <Title level={4}>Client & Property Info</Title>
            <Divider />

            <Row gutter={[16, 16]}>

              <Col span={12}>
                <Text type="secondary">Client</Text>
                <div className="font-medium text-base">
                  {deal.client}
                </div>
              </Col>

              <Col span={12}>
                <Text type="secondary">Project</Text>
                <div className="font-medium text-base">
                  {deal.project}
                </div>
              </Col>

              <Col span={12}>
                <Text type="secondary">Unit</Text>
                <div className="font-medium text-base">
                  {deal.unit}
                </div>
              </Col>

              <Col span={12}>
                <Text type="secondary">Booking Date</Text>
                <div className="font-medium text-base">
                  {deal.bookingDate}
                </div>
              </Col>

              <Col span={12}>
                <Text type="secondary">Expected Handover</Text>
                <div className="font-medium text-base">
                  {deal.handoverDate}
                </div>
              </Col>

            </Row>

            <Divider />

            <Row gutter={[24, 24]}>

              <Col span={12}>
                <Statistic
                  title="Deal Value"
                  value={deal.amount}
                  prefix="₹"
                />
              </Col>

              <Col span={12}>
                <Statistic
                  title="Commission"
                  value={deal.commission}
                  prefix="₹"
                  valueStyle={{ color: "#16a34a", fontWeight: 600 }}
                />
              </Col>

            </Row>

          </Card>
        </Col>

        {/* RIGHT SECTION - PROGRESS */}
        <Col xs={24} lg={10}>
          <Card bordered={false} className="shadow-lg rounded-2xl">

            <Title level={4}>Deal Progress</Title>
            <Divider />

            <Steps
              current={deal.stage}
              direction="vertical"
              size="small"
            >
              <Steps.Step title="Booked" />
              <Steps.Step title="Deposit Paid" />
              <Steps.Step title="Contract Signed" />
              <Steps.Step title="Commission Pending" />
              <Steps.Step title="Commission Paid" />
            </Steps>

            <Divider />

            <Button
              type="primary"
              size="large"
              block
              disabled={isCommissionPaid}
              className="rounded-xl h-11"
            >
              {isCommissionPaid
                ? "Commission Already Paid"
                : "Mark Commission Paid"}
            </Button>

          </Card>
        </Col>

      </Row>

    </div>
  );
}