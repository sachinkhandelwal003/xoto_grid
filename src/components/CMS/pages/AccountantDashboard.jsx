import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Statistic,
  Spin,
  Alert,
  Progress,
  Table,
  Empty,
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const PURPLE_THEME = {
  primary: "#722ed1",
  primaryBg: "#f9f0ff",
  success: "#52c41a",
  warning: "#faad14",
  info: "#1890ff",
  error: "#f5222d",
};

const AccountantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.auth?.user);

  const fromDate = dayjs().startOf("month").format("DD-MM-YYYY");
  const toDate = dayjs().add(1, "day").format("DD-MM-YYYY");

  useEffect(() => {
    if (user?.id || user?._id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiService.get("/dashboard/view/accountant", {
        accountant_id: user?.id || user?._id,
        from: fromDate,
        to: toDate,
      });

      if (res.success) setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- CHART DATA (Bills Timeline) ---------- */
  const timelineData =
    data?.recent_bills?.map((bill) => ({
      name: dayjs(bill.createdAt).format("DD MMM"),
      total: bill.price,
    })) || [];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );

  if (error)
    return <Alert message="Error" description={error} type="error" showIcon />;

  /* ---------- STATS CARDS ---------- */
  const statsCards = [
    {
      label: "Total Projects",
      value: data?.total_projects,
      icon: <ProjectOutlined />,
      color: PURPLE_THEME.primary,
      bg: PURPLE_THEME.primaryBg,
    },
    {
      label: "Total Bills",
      value: data?.total_bills,
      icon: <FileTextOutlined />,
      color: PURPLE_THEME.info,
      bg: "#e6f7ff",
    },
    {
      label: "Collected Amount",
      value: `AED${data?.collected_amount?.toLocaleString() || 0}`,
      icon: <DollarOutlined />,
      color: PURPLE_THEME.success,
      bg: "#f6ffed",
    },
    {
      label: "Pending Amount",
      value: `AED${data?.pending_amount?.toLocaleString() || 0}`,
      icon: <ClockCircleOutlined />,
      color: PURPLE_THEME.warning,
      bg: "#fff7e6",
    },
  ];

  /* ---------- TABLE COLUMNS ---------- */
  const billColumns = [
    {
      title: "Project",
      dataIndex: ["project_id", "title"],
      render: (t, r) => (
        <>
          <Text strong style={{ color: PURPLE_THEME.primary }}>
            {t}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            Code: {r.project_id?.Code}
          </Text>
        </>
      ),
    },
    {
      title: "Customer",
      dataIndex: ["customer_id", "name"],
      render: (n) => (
        <Text className="text-xs">
          {n?.first_name} {n?.last_name}
        </Text>
      ),
    },
    {
      title: "Amount",
      dataIndex: "price",
      render: (p) => <Text strong>AED{p.toLocaleString()}</Text>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (d) => (
        <Text className="text-xs">
          <CalendarOutlined /> {dayjs(d).format("DD MMM, YYYY")}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_paid",
      render: (paid) => (
        <Tag color={paid ? "green" : "orange"}>
          {paid ? "PAID" : "PENDING"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <Title level={2} style={{ margin: 0 }}>
          Accountant Dashboard
        </Title>
        <Text type="secondary">
          Financial overview & billing performance
        </Text>
      </div>

      {/* STATS */}
      <Row gutter={[16, 16]} className="mb-8">
        {statsCards.map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-xl">
              <Statistic
                title={<Text type="secondary">{s.label}</Text>}
                value={s.value || 0}
                prefix={
                  <span
                    className="p-2 rounded-lg mr-2"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.icon}
                  </span>
                }
              />
              <div className="mt-2">
                <Tag color="green">
                  <ArrowUpOutlined /> Live
                </Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHART */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col span={24}>
          <Card
            title="Billing Timeline"
            bordered={false}
            className="shadow-sm rounded-xl"
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="billFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={PURPLE_THEME.primary}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={PURPLE_THEME.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={PURPLE_THEME.primary}
                  strokeWidth={3}
                  fill="url(#billFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Recent Bills"
            bordered={false}
            className="shadow-sm rounded-xl"
          >
            <Table
              columns={billColumns}
              dataSource={data?.recent_bills || []}
              rowKey="_id"
              pagination={false}
              locale={{ emptyText: <Empty description="No bills found" /> }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountantDashboard;
