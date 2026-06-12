import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  HomeOutlined, ArrowUpOutlined, ArrowDownOutlined,
  ReloadOutlined, BuildOutlined, LineChartOutlined,
  CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined,
  DashboardOutlined, FireOutlined, FileSearchOutlined
} from "@ant-design/icons";
import {
  Card, Row, Col, Select, Button, Typography, Tag,
  Table, Spin, message, Tabs, Empty
} from "antd";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const THEME = {
  primary:      '#5c039b',
  primaryLight: '#f3e8ff',
  success:      '#16a34a',
  successLight: '#dcfce7',
  info:         '#0369a1',
  infoLight:    '#e0f2fe',
  warning:      '#b45309',
  warningLight: '#fef3c7',
  error:        '#b91c1c',
  errorLight:   '#fee2e2',
};

const cardStyle = {
  borderRadius: 12,
  border: '1px solid #f1f5f9',
  boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
};

const BadgePill = ({ text, type }) => {
  const styles = {
    up:   { bg: '#dcfce7', color: '#15803d' },
    down: { bg: '#fee2e2', color: '#b91c1c' },
    warn: { bg: '#fef3c7', color: '#b45309' },
    info: { bg: '#e0f2fe', color: '#0369a1' },
  };
  const s = styles[type] || styles.info;
  return (
    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 500 }}>
      {text}
    </span>
  );
};

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

// Deals closed columns — date + unit reference only (PRD §9.1, §9.4)
const dealColumns = [
  {
    title: 'Deal Date',
    dataIndex: 'date',
    key: 'date',
    render: (date) => (
      <span style={{ color: '#64748b' }}>
        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    )
  },
  {
    title: 'Unit Reference',
    dataIndex: 'unit',
    key: 'unit',
    render: (text) => <span style={{ fontWeight: 500, color: '#334155' }}>{text}</span>
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const color = status === 'Sold' || status === 'SPA Signed' ? 'success' : status === 'Reserved' ? 'processing' : 'default';
      return <Tag color={color}>{status}</Tag>;
    }
  }
];

// Aggregated interest by project — no customer PII (PRD §9.4)
const interestColumns = [
  {
    title: 'Project',
    dataIndex: 'projectName',
    key: 'projectName',
    render: (text) => <span style={{ fontWeight: 500, color: '#334155' }}>{text}</span>
  },
  {
    title: 'Total Interest Registrations',
    dataIndex: 'totalInterest',
    key: 'totalInterest',
    render: (val) => (
      <span style={{ fontWeight: 600, color: THEME.primary }}>{val}</span>
    )
  }
];

// Pending approvals columns (PRD §9.1)
const pendingColumns = [
  {
    title: 'Project',
    dataIndex: 'projectName',
    key: 'projectName',
    render: (text) => <span style={{ fontWeight: 500, color: '#334155' }}>{text}</span>
  },
  {
    title: 'Approval Status',
    dataIndex: 'approvalStatus',
    key: 'approvalStatus',
    render: (status) => {
      const colorMap = { pending: 'warning', changes_requested: 'error', rejected: 'error' };
      return <Tag color={colorMap[status] || 'default'}>{status?.replace('_', ' ')}</Tag>;
    }
  },
  {
    title: 'Submitted On',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date) => (
      <span style={{ color: '#64748b' }}>
        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    )
  }
];

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("grid_token") || localStorage.getItem("token");
    if (!token) return;
    try {
      setLoading(true);
      const res = await apiService.get("/properties/developer/dashboard");
      if (res?.status === "success" || res?.data) {
        const data = res?.data?.data || res?.data;
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      message.error(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("grid_token") || localStorage.getItem("token");
    if (token) fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setTimeout(() => setRefreshing(false), 800));
  };

  const getDisplayName = () => {
    if (user?.first_name) return `${user.first_name} ${user.last_name || ""}`.trim();
    if (user?.name) return user.name;
    if (user?.company_name) return user.company_name;
    return "Developer";
  };

  const getBarChartData = () =>
    (dashboardData?.propertyWiseInventory || []).map(prop => ({
      name: prop.propertyName?.length > 16 ? prop.propertyName.substring(0, 16) + '…' : prop.propertyName,
      available: prop.stats.available,
      reserved: prop.stats.reserved,
      sold: (prop.stats.sold || 0) + (prop.stats.spa_signed || 0)
    }));

  const statsIcons = [<BuildOutlined />, <LineChartOutlined />, <TrophyOutlined />, <ClockCircleOutlined />];
  const top = dashboardData?.topPerformingListing;

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      <Spin spinning={loading} tip="Loading Dashboard…">

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DashboardOutlined style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <Title level={4} style={{ margin: 0, color: THEME.primary, fontWeight: 500 }}>Developer Portal</Title>
            </div>
            <Text type="secondary" style={{ fontSize: 14 }}>Welcome back, {getDisplayName()} — monitor projects, interest registrations and unit pipeline.</Text>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Select value={timeRange} style={{ width: 140 }} onChange={setTimeRange}>
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
              <Option value="90d">Last 90 Days</Option>
            </Select>
            <Button icon={<HomeOutlined />} onClick={() => navigate("/")}>Home</Button>
            <Button icon={<ReloadOutlined spin={refreshing} />} onClick={handleRefresh}>Refresh</Button>
          </div>
        </div>

        {/* STAT CARDS — PRD §9.1 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          {(dashboardData?.stats || []).map((stat, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
              <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 600, color: '#334155', marginTop: 4 }}>{stat.value}</div>
                  </div>
                  <div style={{ background: stat.bg, color: stat.color, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {statsIcons[i]}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  {stat.change !== undefined && stat.change !== 0 ? (
                    <BadgePill text={`${stat.change > 0 ? '↑' : '↓'} ${Math.abs(stat.change)}% MoM`} type={stat.change > 0 ? 'up' : 'down'} />
                  ) : <span />}
                  {stat.subtext && <span style={{ fontSize: 11, color: '#94a3b8' }}>{stat.subtext}</span>}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* TOP PERFORMING LISTING + CHARTS — PRD §9.1 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={8}>
            <Card
              title={<span style={{ fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}><TrophyOutlined style={{ color: THEME.warning }} /> Top Listing by Interest</span>}
              style={{ ...cardStyle, height: '100%' }}
            >
              {top ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: THEME.primary, fontWeight: 700 }}>
                      {top.projectName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{top.projectName}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Highest Interest Volume</div>
                    </div>
                  </div>
                  <div style={{ background: THEME.primaryLight, borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 700, color: THEME.primary }}>{top.interestCount}</div>
                    <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 2 }}>Total Interest Registrations</div>
                  </div>
                </div>
              ) : (
                <Empty description="No interest registrations yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card style={{ ...cardStyle, height: '100%' }} bodyStyle={{ paddingTop: 12 }}>
              <Tabs defaultActiveKey="funnel">
                <Tabs.TabPane tab="Sales Funnel" key="funnel">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={dashboardData?.dealFunnel || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="count" fill={THEME.primary} radius={[4, 4, 0, 0]} name="Count" barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Inventory Breakdown" key="inventory">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ResponsiveContainer width="60%" height={260}>
                      <PieChart>
                        <Pie data={dashboardData?.inventoryStatus || []} dataKey="value" outerRadius={90} innerRadius={55} paddingAngle={2} stroke="none">
                          {(dashboardData?.inventoryStatus || []).map((_, idx) => (
                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ width: '38%' }}>
                      {(dashboardData?.inventoryStatus || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length], display: 'inline-block' }} />
                            <span style={{ fontSize: 12, color: '#64748b' }}>{item.name}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        {/* PROPERTY-WISE INVENTORY CHART */}
        {(dashboardData?.propertyWiseInventory || []).length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col span={24}>
              <Card title={<span style={{ fontWeight: 500, color: '#334155' }}>Property-Wise Inventory Distribution</span>} style={cardStyle}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={getBarChartData()} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} iconType="circle" />
                    <Bar dataKey="available" stackId="a" fill="#60a5fa" name="Available" barSize={32} />
                    <Bar dataKey="reserved" stackId="a" fill="#fbbf24" name="Reserved" />
                    <Bar dataKey="sold" stackId="a" fill="#34d399" name="Sold / SPA" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        )}

        {/* INTEREST REGISTRATIONS BY PROJECT — aggregated, no PII (PRD §9.4) */}
        <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LineChartOutlined style={{ color: THEME.info }} /> Interest Registrations by Project
                </span>
              }
              style={cardStyle}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={interestColumns}
                dataSource={dashboardData?.interestByProject || []}
                rowKey="propertyId"
                pagination={{ pageSize: 5, size: 'small' }}
                size="small"
                bordered={false}
                locale={{ emptyText: <Empty description="No registrations yet" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              />
            </Card>
          </Col>

          {/* PENDING APPROVAL LISTINGS — PRD §9.1 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span style={{ fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileSearchOutlined style={{ color: THEME.error }} /> Pending Admin Approval
                </span>
              }
              style={cardStyle}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={pendingColumns}
                dataSource={dashboardData?.pendingListings || []}
                rowKey="propertyId"
                pagination={{ pageSize: 5, size: 'small' }}
                size="small"
                bordered={false}
                locale={{ emptyText: <Empty description="No listings pending approval" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              />
            </Card>
          </Col>
        </Row>

        {/* DEALS CLOSED — date + unit reference only (PRD §9.1) */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title={
                <span style={{ fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleOutlined style={{ color: THEME.success }} /> Deals Closed via Platform
                </span>
              }
              style={cardStyle}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                columns={dealColumns}
                dataSource={dashboardData?.dealsClosed || []}
                rowKey="key"
                pagination={{ pageSize: 5, size: 'small' }}
                size="small"
                bordered={false}
                locale={{ emptyText: <Empty description="No closed deals yet" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              />
            </Card>
          </Col>
        </Row>

      </Spin>
    </div>
  );
};

export default DeveloperDashboard;
