import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Table, Tag, Statistic, Avatar, Timeline, Spin, message } from "antd";
import {
  TeamOutlined,
  UserOutlined,
  RiseOutlined,
  DollarOutlined
} from "@ant-design/icons";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

/* ---------- Styles & Theme ---------- */

const THEME = {
  primary: "#5c039b",
  primary2: "#7c3aed",
  bg: "#faf5ff",
  surface: "#ffffff",
  surface2: "#f5ebff",
  soft: "#f3e8ff",
  border: "#e9d5ff",
  border2: "#d8b4fe",
  text: "#140D2A",
  subText: "#4B3D6E",
  muted: "#8a70a8",
  success: "#059669",
  successBg: "rgba(16, 185, 129, 0.08)",
  danger: "#dc2626",
  dangerBg: "rgba(239, 68, 68, 0.08)",
  shadow: "0 2px 8px rgba(92, 3, 155, 0.07)"
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: THEME.bg,
    padding: "28px 24px",
    fontFamily: "'Inter', sans-serif"
  },
  header: {
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap"
  },
  card: {
    borderRadius: "14px",
    border: `1.5px solid ${THEME.border}`,
    boxShadow: THEME.shadow,
    transition: "transform 0.2s",
    overflow: "hidden",
    background: THEME.surface
  },
  iconContainer: (color) => ({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: color === THEME.success ? THEME.successBg : THEME.soft,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  }),
  trendUp: { color: THEME.success, fontSize: "12px", fontWeight: 600 },
  trendDown: { color: THEME.danger, fontSize: "12px", fontWeight: 600 }
};

/* ---------- Custom Tooltip ---------- */

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: THEME.surface, padding: "10px 12px", border: `1px solid ${THEME.border}`, borderRadius: "8px", boxShadow: THEME.shadow }}>
        <p style={{ margin: 0, fontWeight: "bold", color: THEME.text }}>{label}</p>
        <p style={{ margin: 0, color: payload[0].color }}>
          {payload[0].name}: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const getAgentName = (agent) =>
  agent?.fullName ||
  `${agent?.first_name || ""} ${agent?.last_name || ""}`.trim() ||
  "Unnamed Agent";

const formatCurrency = (value) => `AED ${(value || 0).toLocaleString()}`;

export default function AgencyDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState([
    {
      title: "Total Agents",
      value: 0,
      icon: <TeamOutlined />,
      color: THEME.primary,
      trend: null,
      trendStatus: null
    },
    {
      title: "Active Leads",
      value: 0,
      icon: <UserOutlined />,
      color: THEME.primary2,
      trend: null,
      trendStatus: null
    },
    {
      title: "Total Listings",
      value: 0,
      icon: <RiseOutlined />,
      color: THEME.success,
      trend: null,
      trendStatus: null
    },
    {
      title: "Revenue Generated",
      value: "$0",
      icon: <DollarOutlined />,
      color: THEME.primary,
      trend: null,
      trendStatus: null
    }
  ]);

  const [topAgents, setTopAgents] = useState([]);
  const [activities, setActivities] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("agency/dashboard");
      const data = res?.data;
      if (!data) return;

      setDashboardData(data);

      const newStats = [
        {
          title: "Total Agents",
          value: data.stats.active_agents || 0,
          icon: <TeamOutlined />,
          color: THEME.primary,
          trend: null,
          trendStatus: null
        },
        {
          title: "Active Leads",
          value: data.stats.active_leads || 0,
          icon: <UserOutlined />,
          color: THEME.primary2,
          trend: null,
          trendStatus: null
        },
        {
          title: "Total Listings",
          value: data.stats.total_listings || 0,
          icon: <RiseOutlined />,
          color: THEME.success,
          trend: null,
          trendStatus: null
        },
        {
          title: "Revenue Generated",
          value: formatCurrency(data.stats.total_commission),
          icon: <DollarOutlined />,
          color: THEME.primary,
          trend: null,
          trendStatus: null
        }
      ];

      setStats(newStats);

      const rankedAgents = Array.isArray(data.top_agents) && data.top_agents.length > 0
        ? data.top_agents
        : data.top_agent
          ? [data.top_agent]
          : [];

      setTopAgents(rankedAgents.map((agent, index) => ({
        key: agent._id || String(index),
        rank: index + 1,
        name: getAgentName(agent),
        deals: agent.totalLeads || 0,
        converted: agent.convertedLeads || 0,
        revenue: formatCurrency(agent.commissionEarned),
        status: "Active"
      })));

      const recentActivities = (data.recent_activity || []).map((item) => {
        if (item.type === 'lead') {
          const leadName = item.contact_info?.name
            ? `${item.contact_info.name.first_name || ''} ${item.contact_info.name.last_name || ''}`.trim()
            : 'Unknown Lead';
          return {
            text: `New lead: ${leadName}`,
            time: new Date(item.createdAt).toLocaleString(),
            color: THEME.primary2
          };
        } else if (item.type === 'listing') {
          const listingName = item.propertyName || item.projectName || 'New Listing';
          const agentName = item.created_by_agent
            ? `${item.created_by_agent.first_name || ''} ${item.created_by_agent.last_name || ''}`.trim()
            : 'Agent';
          return {
            text: `${agentName} created listing: ${listingName}`,
            time: new Date(item.createdAt).toLocaleString(),
            color: THEME.success
          };
        } else if (item.first_name && item.last_name) {
          return {
            text: `${item.first_name} ${item.last_name} updated their profile`,
            time: new Date(item.updatedAt).toLocaleString(),
            color: THEME.primary
          };
        } else {
          return {
            text: `New activity`,
            time: new Date(item.createdAt || item.updatedAt).toLocaleString(),
            color: THEME.primary2
          };
        }
      });
      setActivities(recentActivities);

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const columns = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 56,
      render: (rank) => (
        <Tag style={{ backgroundColor: THEME.soft, color: THEME.primary, border: "none", borderRadius: 20, fontWeight: 800, margin: 0 }}>
          {rank}
        </Tag>
      )
    },
    {
      title: "Agent",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar style={{ backgroundColor: THEME.primary }} icon={<UserOutlined />} />
          <Text strong style={{ color: THEME.text }}>{name}</Text>
        </div>
      )
    },
    { title: "Deals", dataIndex: "deals", key: "deals", sorter: (a, b) => a.deals - b.deals },
    { title: "Converted", dataIndex: "converted", key: "converted", sorter: (a, b) => a.converted - b.converted },
    { 
      title: "Revenue", 
      dataIndex: "revenue", 
      key: "revenue",
      render: (text) => <Text strong style={{ color: THEME.text }}>{text}</Text>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Active"
          ? <Tag style={{ backgroundColor: THEME.successBg, color: THEME.success, border: "none", borderRadius: 20, fontWeight: 700, padding: "4px 12px" }}>Active</Tag>
          : <Tag style={{ backgroundColor: THEME.dangerBg, color: THEME.danger, border: "none", borderRadius: 20, fontWeight: 700, padding: "4px 12px" }}>Inactive</Tag>
    }
  ];

  return (
    <div style={styles.container}>
      <style>{`
        .agency-dashboard-page .ant-card-head {
          border-bottom: 1.5px solid ${THEME.border} !important;
          background: ${THEME.surface} !important;
        }

        .agency-dashboard-page .ant-card-head-title {
          color: ${THEME.text} !important;
          font-family: 'Sora', sans-serif !important;
          font-weight: 800 !important;
        }

        .agency-dashboard-page .ant-statistic-content {
          color: ${THEME.text} !important;
          font-family: 'Sora', sans-serif !important;
        }

        .agency-dashboard-page .ant-table {
          background: transparent !important;
        }

        .agency-dashboard-page .ant-table-thead > tr > th {
          background: ${THEME.surface2} !important;
          color: ${THEME.subText} !important;
          font-weight: 700 !important;
          border-bottom: 1.5px solid ${THEME.border} !important;
        }

        .agency-dashboard-page .ant-table-tbody > tr > td {
          border-bottom: 1px solid ${THEME.border} !important;
        }

        .agency-dashboard-page .ant-table-tbody > tr:hover > td {
          background: ${THEME.soft} !important;
        }

        .agency-dashboard-page .ant-timeline-item-tail {
          border-inline-start-color: ${THEME.border} !important;
        }
      `}</style>
      <Spin spinning={loading}>
        <div className="agency-dashboard-page">
        {/* ---------- Header ---------- */}
        <div style={styles.header}>
          <div>
            <Title level={2} style={{ margin: 0, color: THEME.primary, fontFamily: "Sora, sans-serif", fontWeight: 800 }}>Dashboard</Title>
            <Text style={{ color: THEME.muted, fontWeight: 500 }}>
              Welcome back, {dashboardData?.agency?.companyName || "Agency"}
            </Text>
          </div>
          <div>
            <Tag style={{ backgroundColor: THEME.soft, color: THEME.primary, border: `1px solid ${THEME.border2}`, borderRadius: 20, padding: "6px 14px", fontSize: "13px", fontWeight: 700 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Tag>
          </div>
        </div>

        {/* ---------- Stats Cards ---------- */}
        <Row gutter={[16, 16]}>
          {stats.map((item, index) => (
            <Col key={index} xs={24} sm={12} lg={6}>
              <Card style={styles.card} hoverable>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text style={{ fontSize: "13px", color: THEME.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>{item.title}</Text>
                    <div style={{ marginTop: "8px" }}>
                      <Statistic
                        value={item.value}
                        valueStyle={{ fontSize: "24px", fontWeight: 800, margin: 0, color: THEME.text }}
                      />
                    </div>
                  </Col>
                  <Col>
                    <div style={styles.iconContainer(item.color)}>
                      {item.icon}
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ---------- Charts ---------- */}
        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          <Col xs={24} lg={14}>
            <Card
              title="Presentation Balance"
              style={styles.card}
              extra={<span style={{ color: THEME.primary, fontWeight: 700 }}>Quota: {(dashboardData?.agency?.presentationQuota || 0).toLocaleString()}</span>}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={[
                  { name: 'Used', value: dashboardData?.agency?.presentationsUsed || 0 },
                  { name: 'Remaining', value: dashboardData?.agency?.presentationBalance || 0 }
                ]}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.45}/>
                      <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: THEME.muted, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: THEME.muted, fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={THEME.primary} fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Lead Pipeline" style={styles.card}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { stage: "Total Leads", count: dashboardData?.stats?.total_leads || 0 },
                  { stage: "Active", count: dashboardData?.stats?.active_leads || 0 },
                  { stage: "Closed", count: dashboardData?.stats?.total_deals || 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.border} />
                  <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: THEME.muted, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: THEME.muted, fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: THEME.soft}} />
                  <Bar dataKey="count" fill={THEME.primary2} radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* ---------- Agents + Activity ---------- */}
        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          <Col xs={24} lg={14}>
            <Card title="Top Performing Agents" style={styles.card}>
              <Table
                columns={columns}
                dataSource={topAgents}
                pagination={false}
                scroll={{ x: true }}
                size="middle"
              />
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Recent Activity" style={styles.card}>
              <Timeline
                items={activities.map((item, i) => ({
                  color: item.color,
                  children: (
                    <div key={i}>
                      <Text strong style={{ color: THEME.text }}>{item.text}</Text>
                      <br />
                      <Text style={{ fontSize: "12px", color: THEME.muted }}>{item.time}</Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>
        </Row>
        </div>
      </Spin>
    </div>
  );
}
