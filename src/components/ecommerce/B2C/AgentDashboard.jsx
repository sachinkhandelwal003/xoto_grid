import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  PercentageOutlined,
  FileTextOutlined,
  PlusOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Tag,
  Avatar,
  List,
  Spin,
  message,
  Progress,
  Table,
  Empty,
  Statistic,
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";


const { Title, Text } = Typography;
const { Option } = Select;

// 💎 Ultra Premium Tooltip
const UltraTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] text-white px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(92,3,155,0.4)] flex items-center gap-4 border border-gray-700 transform -translate-y-2">
        <span className="text-gray-400 font-medium tracking-widest uppercase text-xs">
          {label}
        </span>
        <div className="w-px h-6 bg-gray-600"></div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#d8b4fe] to-[#c084fc]">
            {payload[0].value}
          </span>
          <span className="text-gray-400 text-xs ml-1">
            {payload[0].dataKey === "leads" ? "Leads" : "Deals"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// ✨ Pulsing Dot
const PulsingDot = (props) => {
  const { cx, cy } = props;
  return (
    <svg x={cx - 15} y={cy - 15} width={30} height={30} className="overflow-visible">
      <circle cx="15" cy="15" r="12" fill="#5C039B" className="animate-ping opacity-40" />
      <circle cx="15" cy="15" r="7" fill="#fff" stroke="#5C039B" strokeWidth="3" className="shadow-lg" />
    </svg>
  );
};

// Status badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    new: { color: "blue" },
    contacted: { color: "cyan" },
    in_discussion: { color: "orange" },
    site_visit_scheduled: { color: "purple" },
    offer_made: { color: "gold" },
    qualified: { color: "green" },
    completed: { color: "success" },
    not_proceeding: { color: "error" },
  };
  const config = statusConfig[status] || { color: "default" };
  return <Tag color={config.color}>{status?.toUpperCase()}</Tag>;
};

const AgentDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get("agent/dashboard", { range: timeRange });
      const data = res?.data;
      if (data) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to fetch agent dashboard", err);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!dashboardData) {
    return <Spin spinning={loading} />;
  }

  const {
    agent_name,
    profile_completion,
    stats,
    active_requirement_leads,
    active_listings,
    presentations_generated,
    commission_earned,
    leads_trend = [],
    deals_closed = [],
    leads_preview = [],
    activity_feed = [],
    conversion_rate,
    lead_status_breakdown = [],
    monthly_leads = [],
    recent_clients = [],
  } = dashboardData;

  const kpiCards = [
    {
      title: "Active Requirement Leads",
      value: active_requirement_leads,
      icon: <TeamOutlined />,
      color: "#5C039B",
      bg: "#f4e8ff",
    },
   {
      title: "Presentations Generated",
      value: presentations_generated,
      icon: <FileTextOutlined />,
      color: "#059669",
      bg: "#ecfdf5",
    },
    {
      title: "Commission Earned",
      value: commission_earned,
      icon: <DollarOutlined />,
      color: "#d97706",
      bg: "#fffbeb",
      muted: profile_completion < 100,
    },
  ];

  return (
    <Spin spinning={loading}>
      <div className="agent-dashboard min-h-screen bg-[#f6f8fb] px-3 py-4 sm:px-5 lg:px-6">
        <style>{`
          .agent-dashboard {
            color: #0f172a;
          }

          .agent-dashboard .ant-card {
            border: 1px solid #e8edf5 !important;
            border-radius: 10px !important;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04) !important;
            height: 100%;
          }

          .agent-dashboard .ant-card-body {
            height: 100%;
            padding: 18px !important;
          }

          .agent-dashboard .ant-row.mb-8,
          .agent-dashboard .ant-row.mb-6 {
            margin-bottom: 18px !important;
          }

          .agent-dashboard .ant-statistic-title {
            color: #64748b;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0;
            margin-bottom: 6px;
          }

          .agent-dashboard .ant-statistic-content {
            line-height: 1.15;
          }

          .agent-dashboard .ant-card-head {
            min-height: 48px;
            border-bottom: 1px solid #edf2f7;
            padding: 0 18px;
          }

          .agent-dashboard .ant-card-head-title {
            padding: 13px 0;
          }

          .agent-dashboard .ant-list-item {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .agent-dashboard .ant-table {
            font-size: 13px;
          }

          .agent-dashboard .ant-table-thead > tr > th {
            background: #f8fafc !important;
            color: #475569;
            font-size: 12px;
            font-weight: 700;
            padding: 10px 12px !important;
          }

          .agent-dashboard .ant-table-tbody > tr > td {
            padding: 11px 12px !important;
          }

          .agent-dashboard .dashboard-chart-card .ant-card-body {
            display: flex;
            flex-direction: column;
          }

          .agent-dashboard .dashboard-chart {
            flex: 1;
            min-height: 260px;
          }

          @media (max-width: 768px) {
            .agent-dashboard .ant-card-body {
              padding: 14px !important;
            }

            .agent-dashboard .ant-row.mb-8,
            .agent-dashboard .ant-row.mb-6 {
              margin-bottom: 14px !important;
            }

            .agent-dashboard .dashboard-mobile-stack {
              align-items: flex-start !important;
              flex-direction: column;
            }
          }
        `}</style>
        
        {/* ========== WELCOME SECTION ========== */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={16}>
            <Card className="border-0">
              <div className="dashboard-mobile-stack flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Title level={2} className="m-0" style={{ fontWeight: 800, color: "#0f172a" }}>
                    Welcome back, {agent_name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: "15px", marginTop: "8px", display: "block" }}>
                    Track leads, listings, presentations, and conversion performance.
                  </Text>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={timeRange}
                    onChange={setTimeRange}
                    style={{ width: 150 }}
                  >
                    <Option value="7d">Last 7 Days</Option>
                    <Option value="30d">Last 30 Days</Option>
                    <Option value="90d">Last 90 Days</Option>
                  </Select>
                  <Avatar
                    size={48}
                    style={{
                      backgroundColor: "#5C039B",
                      fontSize: "20px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {agent_name?.charAt(0)}
                  </Avatar>
                </div>
              </div>
            </Card>
          </Col>

          {/* Profile Completion */}
          <Col xs={24} md={8}>
            <Card className="border-0">
              <Statistic
                title="Profile Completion"
                value={profile_completion}
                suffix="%"
                valueStyle={{ color: "#5C039B", fontSize: "26px", fontWeight: 800 }}
              />
              <Progress
                percent={profile_completion}
                strokeColor={{ "0%": "#5C039B", "100%": "#9D4EDD" }}
                className="mt-3"
              />
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: "6px" }}>
                Complete your profile to unlock all features
              </Text>
            </Card>
          </Col>
        </Row>

        {/* ========== KEY STATS BAR ========== */}
        <Row gutter={[16, 16]} className="mb-8">
          {kpiCards.map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <Card
                bordered={false}
                className="transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  opacity: item.muted ? 0.72 : 1,
                  pointerEvents: item.muted ? "none" : "auto",
                }}
              >
                <div className="flex h-full items-start justify-between gap-3">
                  <Statistic
                    title={item.title}
                    value={item.value}
                    valueStyle={{ color: item.color, fontSize: "24px", fontWeight: 800 }}
                  />
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    {item.icon}
                  </div>
                </div>
                {item.muted && (
                  <Text type="secondary" style={{ fontSize: "11px", display: "block", marginTop: "6px" }}>
                    Complete profile to unlock
                  </Text>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* ========== MAIN CHARTS ROW ========== */}
        <Row gutter={[24, 24]} className="mb-8">
          
          {/* Leads Velocity Chart */}
          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              className="dashboard-chart-card"
              style={{
                boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
                background: "#ffffff",
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
                    Leads Velocity
                  </Title>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {timeRange === "7d"
                      ? "7-Day traction overview"
                      : timeRange === "30d"
                      ? "30-Day traction overview"
                      : "90-Day traction overview"}
                  </Text>
                </div>
                <Tag
                  color="#5C039B"
                  style={{
                    borderRadius: "20px",
                    padding: "6px 16px",
                    fontWeight: 600,
                    fontSize: "13px",
                    border: "none",
                  }}
                >
                  Live
                </Tag>
              </div>

              <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leads_trend} margin={{ top: 34, right: 14, left: -18, bottom: 8 }}>
                  <defs>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5C039B" />
                      <stop offset="50%" stopColor="#9D4EDD" />
                      <stop offset="100%" stopColor="#d8b4fe" />
                    </linearGradient>
                    <linearGradient id="areaFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9D4EDD" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#9D4EDD" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={15}
                    interval="preserveStartEnd"
                    minTickGap={18}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                    allowDecimals={false}
                    domain={[0, (dataMax) => Math.max(1, dataMax + 1)]}
                  />
                  <Tooltip content={<UltraTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "5 5" }} />
                  <Area
                    type="natural"
                    dataKey="leads"
                    stroke="url(#lineColor)"
                    strokeWidth={5}
                    fill="url(#areaFade)"
                    activeDot={<PulsingDot />}
                  />
                </AreaChart>
              </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Deals Closed Chart */}
          <Col xs={24} lg={8}>
            <Card bordered={false} className="dashboard-chart-card" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
              <div className="mb-6">
                <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
                  Deals Closed
                </Title>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Monthly conversions
                </Text>
              </div>

              <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deals_closed} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="deals" radius={[8, 8, 8, 8]} barSize={28}>
                    {deals_closed.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === deals_closed.length - 1 ? "#5C039B" : "#e2e8f0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* ========== MY STATS ROW ========== */}
        <Row gutter={[24, 24]} className="mb-8">
          
          {/* Lead Status Breakdown */}
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="rounded-2xl" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
              <Title level={4} style={{ margin: "0 0 16px 0", fontWeight: 800, color: "#0f172a" }}>
                Lead Status
              </Title>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={lead_status_breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {lead_status_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} leads`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-col gap-2">
                {lead_status_breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: item.color,
                        }}
                      />
                      <Text style={{ fontSize: "12px" }}>{item.status}</Text>
                    </div>
                    <Text strong>{item.value}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Monthly Leads Growth */}
          <Col xs={24} sm={12} lg={9}>
            <Card bordered={false} className="rounded-2xl" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
              <Title level={4} style={{ margin: "0 0 16px 0", fontWeight: 800, color: "#0f172a" }}>
                Leads Trend (Month-on-Month)
              </Title>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthly_leads} margin={{ top: 32, right: 22, left: -18, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.7} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    domain={[0, (dataMax) => Math.max(1, dataMax + 1)]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="natural"
                    dataKey="leads"
                    stroke="#5C039B"
                    strokeWidth={3}
                    dot={{ fill: "#5C039B", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Conversion Rate Card */}
          <Col xs={24} sm={12} lg={9}>
            <Card bordered={false} className="rounded-2xl" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
              <Statistic
                title="Conversion Rate"
                value={conversion_rate}
                suffix="%"
                prefix={<PercentageOutlined style={{ color: "#10b981" }} />}
                valueStyle={{ color: "#10b981", fontSize: "32px", fontWeight: 800 }}
              />
              <Progress
                percent={conversion_rate}
                strokeColor={{
                  "0%": "#ef4444",
                  "50%": "#f59e0b",
                  "100%": "#10b981",
                }}
                size="large"
                className="mt-6"
              />
              <div className="mt-8 space-y-3">
                <div className="flex justify-between">
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Total Leads:
                  </Text>
                  <Text strong>{stats?.total || 0}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Completed:
                  </Text>
                  <Text strong style={{ color: "#10b981" }}>{stats?.completed || 0}</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* ========== MY LEADS PREVIEW ========== */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24}>
            <Card
              bordered={false}
              className="rounded-2xl"
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}
              title={
                <span style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>
                  My Latest Leads
                </span>
              }
            >
              {leads_preview && leads_preview.length > 0 ? (
                <Table
                  dataSource={leads_preview}
                  columns={[
                    {
                      title: "Lead Name",
                      dataIndex: "name",
                      key: "name",
                      render: (text) => <Text strong>{text}</Text>,
                    },
                    {
                      title: "Type",
                      dataIndex: "type",
                      key: "type",
                      render: (text) => <Text type="secondary">{text}</Text>,
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => <StatusBadge status={status} />,
                    },
                    {
                      title: "Date",
                      dataIndex: "date",
                      key: "date",
                      render: (text) => <Text type="secondary" style={{ fontSize: "12px" }}>{text}</Text>,
                    },
                  ]}
                  pagination={false}
                  rowKey="id"
                  size="small"
                />
              ) : (
                <Empty description="No leads yet" />
              )}
            </Card>
          </Col>
        </Row>

        {/* ========== ACTIVITY FEED ========== */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              className="rounded-2xl"
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}
              title={
                <span style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>
                  Recent Activity
                </span>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={activity_feed}
                renderItem={(item) => (
                  <List.Item className="border-b pb-4">
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: "#5C039B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.icon === "team" && <TeamOutlined />}
                          {item.icon === "file-text" && <FileTextOutlined />}
                          {item.icon === "check" && <CheckOutlined />}
                        </Avatar>
                      }
                      title={<Text strong>{item.message}</Text>}
                      description={
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <ClockCircleOutlined style={{ marginRight: "4px" }} />
                          {item.time}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* QUICK ACTIONS */}
          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              className="rounded-2xl"
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}
              title={
                <span style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>
                  Quick Actions
                </span>
              }
            >
              <div className="space-y-3">
                <Button
                  size="large"
                  block
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/dashboard/agent/CreateAgent-Lead")}
                  style={{
                    background: "linear-gradient(135deg, #5C039B 0%, #9D4EDD 100%)",
                    borderColor: "transparent",
                    fontWeight: 600,
                    height: "48px",
                    borderRadius: "8px",
                  }}
                >
                  Add Requirement Lead
                </Button>
                <Button
                  size="large"
                  block
                  icon={<FireOutlined />}
                  onClick={() => navigate("/dashboard/agent/agent-projects")}
                  style={{
                    fontWeight: 600,
                    height: "48px",
                    borderRadius: "8px",
                    borderColor: "#3b82f6",
                    color: "#3b82f6",
                  }}
                >
                  Browse Properties
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* ========== RECENT CLIENTS ========== */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card
              bordered={false}
              className="rounded-2xl"
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}
              title={
                <span style={{ fontWeight: 800, fontSize: "16px", color: "#0f172a" }}>
                  Recent Clients
                </span>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={recent_clients}
                renderItem={(item) => (
                  <List.Item className="hover:bg-slate-50 transition-colors rounded-xl px-4 py-3 border-b-0 mb-2">
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={48}
                          style={{
                            backgroundColor: "#f3e8ff",
                            color: "#5C039B",
                            fontWeight: 800,
                            fontSize: "18px",
                          }}
                        >
                          {item.name.charAt(0)}
                        </Avatar>
                      }
                      title={
                        <Text strong style={{ fontSize: "16px", color: "#1e293b" }}>
                          {item.title}
                        </Text>
                      }
                      description={
                        <div className="flex justify-between text-sm mt-1">
                          <Text type="secondary" style={{ fontWeight: 500 }}>
                            {item.name}
                          </Text>
                          <Text type="secondary" style={{ color: "#94a3b8", fontWeight: 500 }}>
                            {item.time}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default AgentDashboard;
