// src/components/CMS/pages/VaultPartnerDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card, Row, Col, Select, Button, Typography, Tag, Avatar, List,
  Skeleton, Badge, Space, Statistic, Progress, Tabs, Empty, Tooltip,
  Table, Divider, Spin, Alert, message
} from "antd";
import {
  UserAddOutlined, WalletOutlined, RocketOutlined,
  BellOutlined, ArrowUpOutlined, ArrowDownOutlined,
  SafetyCertificateOutlined, PlusOutlined, TeamOutlined,
  FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined,
  DollarOutlined, ReloadOutlined, TrophyOutlined, UserOutlined,
  RiseOutlined, FallOutlined, PieChartOutlined, LineChartOutlined
} from "@ant-design/icons";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// Brand colors
const BRAND = "#5C039B";
const BRAND_GRADIENT = "linear-gradient(135deg, #5C039B 0%, #8B5CF6 100%)";
const CHART_COLORS = {
  primary: "#5C039B",
  secondary: "#03A4F4",
  success: "#10B981",
  warning: "#F97316",
  danger: "#EF4444",
  purple: "#8B5CF6",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  pink: "#EC4899",
  indigo: "#6366F1",
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.warning,
  CHART_COLORS.success,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.cyan,
  CHART_COLORS.pink,
];

// Helper functions
const formatCurrency = (value) => {
  if (!value && value !== 0) return "AED 0";
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
  return `AED ${value?.toLocaleString() || 0}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dayjs(dateStr).format("DD MMM YYYY");
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  return dayjs(dateStr).format("DD MMM");
};

const getLeadStatusColor = (status) => {
  const map = {
    new: CHART_COLORS.blue,
    contacted: CHART_COLORS.secondary,
    qualified: CHART_COLORS.primary,
    collectingDocuments: CHART_COLORS.warning,
    applicationOpened: CHART_COLORS.cyan,
    disbursed: CHART_COLORS.success,
    lost: CHART_COLORS.danger,
  };
  return map[status] || CHART_COLORS.gray;
};

const getLeadStatusTag = (status) => {
  const display = status?.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()) || status;
  let color = "default";
  if (status === "qualified") color = "purple";
  else if (status === "disbursed") color = "success";
  else if (status === "lost") color = "error";
  else if (status === "contacted") color = "orange";
  else if (status === "new") color = "blue";
  else if (status === "collectingDocuments") color = "gold";
  else if (status === "applicationOpened") color = "cyan";
  return <Tag color={color}>{display}</Tag>;
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || BRAND }} className="font-bold text-base">
          {p.name}: {p.value?.toLocaleString()}{suffix}
        </p>
      ))}
    </div>
  );
};

const VaultPartnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [timeRange, setTimeRange] = useState("month");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchStats = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("range", timeRange);
      const response = await apiService.get(`/vault/statistics/partner/stats?${params.toString()}`);

      if (response?.data) {
        setStats(response.data);
      } else {
        message.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Failed to fetch partner stats:", error);
      message.error(error?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Extract data from API response
  const partnerInfo = stats?.partnerInfo || {};
  const kpis = stats?.kpis || {};
  const leadStatus = stats?.leadStatus || {};
  const caseStatus = stats?.caseStatus || {};
  const commissions = stats?.commissions || {};
  const performance = stats?.performance || {};
  const graphs = stats?.graphs || {};
  const agentsSummary = stats?.agentsSummary || {};

  // Prepare lead status data for pie chart
  const leadStatusData = Object.entries(leadStatus)
    .filter(([_, value]) => value > 0)
    .map(([key, value], idx) => ({
      name: key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),
      originalKey: key,
      value: value,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    }));

  // Prepare case status data for pie chart
  const caseStatusData = Object.entries(caseStatus)
    .filter(([_, value]) => value > 0)
    .map(([key, value], idx) => ({
      name: key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()),
      originalKey: key,
      value: value,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    }));

  // Prepare leads over time data
  const leadsOverTimeData = (graphs.leadsOverTime || []).map((d) => ({
    name: formatShortDate(d.date),
    Leads: d.count,
    date: d.date,
  }));

  // Prepare commissions over time data
  const commissionsOverTimeData = (graphs.commissionsOverTime || []).map((d) => ({
    name: formatShortDate(d.date),
    Commission: d.totalCommission || 0,
    date: d.date,
  }));

  // Partner summary stats cards
  const partnerStats = [
    {
      title: "Total Leads",
      value: kpis.totalLeads || 0,
      icon: <UserAddOutlined />,
      color: CHART_COLORS.blue,
      bg: "#eff6ff",
      suffix: "",
    },
    {
      title: "Qualified Leads",
      value: leadStatus.qualified || 0,
      icon: <CheckCircleOutlined />,
      color: CHART_COLORS.primary,
      bg: "#f5f0ff",
      suffix: "",
    },
    {
      title: "Active Cases",
      value: kpis.activeCases || 0,
      icon: <FileTextOutlined />,
      color: CHART_COLORS.warning,
      bg: "#fffbeb",
      suffix: "",
    },
    {
      title: "Total Commission",
      value: formatCurrency(kpis.totalCommissionEarned || 0),
      icon: <WalletOutlined />,
      color: CHART_COLORS.success,
      bg: "#ecfdf5",
      suffix: "",
    },
  ];

  // Loading state
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-col gap-4">
        <Spin size="large" />
        <p style={{ color: BRAND }} className="font-semibold tracking-wide">Loading Partner Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f9f6ff", minHeight: "100vh", padding: "32px 28px" }}>
      <style>{`
        .vpp-stat-card {
          border-radius: 18px !important;
          border: 1px solid #f0e8ff !important;
          box-shadow: 0 4px 14px rgba(92,3,155,0.04) !important;
          transition: all 0.2s;
        }
        .vpp-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(92,3,155,0.1) !important;
        }
        .vpp-chart-card {
          border-radius: 20px !important;
          border: 1px solid #f0e8ff !important;
          box-shadow: 0 4px 20px rgba(92,3,155,0.06) !important;
        }
        .ant-select-selector {
          border-radius: 10px !important;
          border-color: #e8dff5 !important;
        }
        .ant-btn-primary {
          background: ${BRAND} !important;
          border-color: ${BRAND} !important;
          border-radius: 30px !important;
        }
        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: ${BRAND} !important;
        }
        .ant-tabs-ink-bar {
          background: ${BRAND} !important;
        }
        .ant-progress-bg {
          border-radius: 99px !important;
        }
      `}</style>

      <div className="vpp">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: "#1a0533" }}>
              Partner Portal
              <Badge status="processing" color={CHART_COLORS.success} style={{ marginLeft: 12 }} />
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Welcome back, <strong>{partnerInfo.name || "Partner"}</strong>. Here's your partnership overview.
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="purple" style={{ borderRadius: 20 }}>
                {partnerInfo.partnerCategory === "company" ? "Company Partner" : "Individual Partner"}
              </Tag>
              <Tag color={partnerInfo.status === "active" ? "green" : "red"} style={{ borderRadius: 20, marginLeft: 8 }}>
                {partnerInfo.status || "active"}
              </Tag>
              {partnerInfo.joinedAt && (
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                  Joined: {formatDate(partnerInfo.joinedAt)}
                </Text>
              )}
            </div>
          </div>

          <Space size="middle">
            <Select value={timeRange} style={{ width: 140 }} onChange={setTimeRange} size="large">
              <Option value="today">Today</Option>
              <Option value="week">This Week</Option>
              <Option value="month">This Month</Option>
            </Select>
            <Button
              size="large"
              icon={<ReloadOutlined className={refreshing ? "animate-spin" : ""} />}
              onClick={() => fetchStats(true)}
              loading={refreshing}
              style={{ borderRadius: 30, borderColor: "#e8dff5" }}
            >
              Sync
            </Button>
            {/* <Button size="large" icon={<BellOutlined />} style={{ borderRadius: 30, borderColor: "#e8dff5" }}>
              Notifications
            </Button> */}
          </Space>
        </div>

        {/* Commission Tier Banner */}
        {partnerInfo.commissionTier && (
          <Card className="vpp-chart-card" style={{ marginBottom: 24, background: BRAND_GRADIENT, border: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <Text style={{ color: "white", opacity: 0.8, fontSize: 13 }}>Your Commission Structure</Text>
                <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
                  <div>
                    <Text style={{ color: "white", fontSize: 28, fontWeight: 700 }}>{partnerInfo.commissionTier.below5M}%</Text>
                    <Text style={{ color: "white", opacity: 0.7, marginLeft: 8, fontSize: 13 }}>Below AED 5M</Text>
                  </div>
                  <div>
                    <Text style={{ color: "white", fontSize: 28, fontWeight: 700 }}>{partnerInfo.commissionTier.above5M}%</Text>
                    <Text style={{ color: "white", opacity: 0.7, marginLeft: 8, fontSize: 13 }}>Above AED 5M</Text>
                  </div>
                </div>
              </div>
              <Button icon={<TrophyOutlined />} style={{ borderRadius: 30, background: "white", color: BRAND, border: "none", fontWeight: 500 }}>
                View Commission Details
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          {partnerStats.map((stat, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card bordered={false} className="vpp-stat-card" bodyStyle={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {stat.title}
                    </Text>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#1a0533", marginTop: 4, lineHeight: 1.2 }}>
                      {stat.value}
                    </div>
                  </div>
                  <Avatar shape="square" size={48} icon={stat.icon}
                    style={{ backgroundColor: stat.bg, color: stat.color, borderRadius: 14 }}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Tabs Section */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="vpp-tabs"
          style={{ marginBottom: 24 }}
          items={[
            {
              key: "overview",
              label: <span><LineChartOutlined /> Overview</span>,
              children: (
                <Row gutter={[20, 20]}>
                  {/* Leads Over Time Chart */}
                  <Col xs={24} lg={14}>
                    <Card bordered={false} className="vpp-chart-card"
                      title={<span style={{ fontSize: 16, fontWeight: 700, color: BRAND }}>Leads Trend</span>}>
                      {leadsOverTimeData.length === 0 ? (
                        <Empty description="No lead data available for this period" className="py-12" />
                      ) : (
                        <ResponsiveContainer width="100%" height={320}>
                          <AreaChart data={leadsOverTimeData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={BRAND} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={BRAND} stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="Leads" stroke={BRAND} strokeWidth={2.5} fill="url(#leadGrad)" name="New Leads" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </Card>
                  </Col>

                  {/* Commission Summary */}
                  <Col xs={24} lg={10}>
                    <Card bordered={false} className="vpp-chart-card"
                      title={<span style={{ fontSize: 16, fontWeight: 700, color: BRAND }}>Commission Summary</span>}>
                      <div style={{ textAlign: "center", padding: "16px" }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: CHART_COLORS.success }}>
                          {formatCurrency(commissions.totalEarned || 0)}
                        </div>
                        <Text type="secondary">Total Earned</Text>
                        <Divider style={{ margin: "16px 0" }} />
                        <Row gutter={16}>
                          <Col span={12}>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 20, fontWeight: 700, color: CHART_COLORS.warning }}>
                                {formatCurrency(commissions.pending || 0)}
                              </div>
                              <Text type="secondary" style={{ fontSize: 12 }}>Pending</Text>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 20, fontWeight: 700, color: CHART_COLORS.success }}>
                                {formatCurrency(commissions.confirmed || 0)}
                              </div>
                              <Text type="secondary" style={{ fontSize: 12 }}>Confirmed</Text>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Col>

                  {/* Performance Metrics */}
                  <Col xs={24}>
                    <Card bordered={false} className="vpp-chart-card"
                      title={<span style={{ fontSize: 16, fontWeight: 700, color: BRAND }}>Performance Metrics</span>}>
                      <Row gutter={[24, 24]}>
                        <Col xs={12} sm={6}>
                          <div style={{ textAlign: "center" }}>
                            <Progress
                              type="circle"
                              percent={kpis.conversionRate || performance.conversionRate || 0}
                              strokeColor={BRAND}
                              width={100}
                              format={(percent) => `${percent || 0}%`}
                            />
                            <div style={{ marginTop: 12, fontWeight: 600 }}>Conversion Rate</div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: CHART_COLORS.primary }}>
                              {performance.totalLeadsSubmitted || kpis.totalLeads || 0}
                            </div>
                            <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>Total Leads Submitted</div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: CHART_COLORS.success }}>
                              {performance.totalSuccessfulDisbursals || kpis.totalDisbursed || 0}
                            </div>
                            <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>Successful Disbursals</div>
                          </div>
                        </Col>
                        <Col xs={12} sm={6}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: CHART_COLORS.warning }}>
                              {agentsSummary.totalAgents || 0}
                            </div>
                            <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>Total Agents</div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: "leads",
              label: <span><PieChartOutlined /> Leads & Cases</span>,
              children: (
                <Row gutter={[20, 20]}>
                  {/* Lead Status Distribution */}
                  <Col xs={24} lg={12}>
                    <Card bordered={false} className="vpp-chart-card"
                      title={<span style={{ fontSize: 16, fontWeight: 700, color: BRAND }}>Lead Status Distribution</span>}>
                      {leadStatusData.length === 0 ? (
                        <Empty description="No lead data available" className="py-12" />
                      ) : (
                        <ResponsiveContainer width="100%" height={320}>
                          <PieChart>
                            <Pie
                              data={leadStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {leadStatusData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={40} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </Card>
                  </Col>

                  {/* Case Status Distribution */}
                  <Col xs={24} lg={12}>
                    <Card bordered={false} className="vpp-chart-card"
                      title={<span style={{ fontSize: 16, fontWeight: 700, color: BRAND }}>Case Status Distribution</span>}>
                      {caseStatusData.length === 0 ? (
                        <Empty description="No case data available" className="py-12" />
                      ) : (
                        <ResponsiveContainer width="100%" height={320}>
                          <PieChart>
                            <Pie
                              data={caseStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={false}
                            >
                              {caseStatusData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={40} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: "agents",
              label: <span><TeamOutlined /> Agents Network</span>,
              children: (
                <Row gutter={[20, 20]}>
                  <Col xs={24} sm={8}>
                    <Card bordered={false} className="vpp-stat-card">
                      <Statistic
                        title="Total Agents"
                        value={agentsSummary.totalAgents || 0}
                        prefix={<TeamOutlined />}
                        valueStyle={{ color: BRAND }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card bordered={false} className="vpp-stat-card">
                      <Statistic
                        title="Active Agents"
                        value={agentsSummary.activeAgents || 0}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: CHART_COLORS.success }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card bordered={false} className="vpp-stat-card">
                      <Statistic
                        title="Pending Agents"
                        value={agentsSummary.pendingAgents || 0}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: CHART_COLORS.warning }}
                      />
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Card
                      bordered={false}
                      className="vpp-chart-card"
                      title={<span style={{ fontSize: 16, fontWeight: 700, color: BRAND }}>Agent Performance</span>}
                    >
                      <Empty description="No agent data available yet" className="py-12" />
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />

        {/* Quick Actions */}
        {/* <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} sm={8}>
            <Button
              block
              size="large"
              icon={<PlusOutlined />}
              className="h-14 text-base font-medium rounded-xl"
              style={{ backgroundColor: "#f5f0ff", color: BRAND, borderColor: "#e8dff5" }}
              onClick={() => navigate("/partner/refer-lead")}
            >
              Refer New Lead
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              block
              size="large"
              icon={<WalletOutlined />}
              className="h-14 text-base font-medium rounded-xl"
              style={{ backgroundColor: "#f5f0ff", color: BRAND, borderColor: "#e8dff5" }}
              onClick={() => navigate("/partner/commissions")}
            >
              View Commissions
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              block
              size="large"
              type="primary"
              icon={<TeamOutlined />}
              className="h-14 text-base font-medium rounded-xl"
              style={{ background: BRAND_GRADIENT, border: "none" }}
              onClick={() => navigate("/partner/agents")}
            >
              Manage Agents
            </Button>
          </Col>
        </Row> */}
      </div>
    </div>
  );
};

export default VaultPartnerDashboard;