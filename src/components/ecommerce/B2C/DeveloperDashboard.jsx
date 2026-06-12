import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  HomeOutlined, BellOutlined, ArrowUpOutlined, ArrowDownOutlined,
  MessageOutlined, ReloadOutlined, BuildOutlined, LineChartOutlined,
  CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined,
  DashboardOutlined, EyeOutlined, HeartOutlined
} from "@ant-design/icons";
import {
  Card, Row, Col, Select, Button, Typography, Tag,
  Badge, Table, Spin, message, Tabs
} from "antd";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Theme & Branding ──────────────────────────────────────────────────────────
const THEME = {
  primary:      '#5c039b',
  primaryLight: '#f3e8ff',
  primaryMid:   '#9333ea',
  success:      '#16a34a',
  successLight: '#dcfce7',
  info:         '#0369a1',
  infoLight:    '#e0f2fe',
  warning:      '#b45309',
  warningLight: '#fef3c7',
  error:        '#b91c1c',
  errorLight:   '#fee2e2',
  gray:         '#64748b',
  grayLight:    '#f8fafc',
};

const cardStyle = {
  borderRadius: 14,
  border: '1px solid #ede9fe',
  boxShadow: '0 4px 20px rgba(92,3,155,0.03)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// ─── Custom Badge & Status Components ────────────────────────────────────────
const StagePill = ({ stage }) => {
  const map = {
    'new':                  { bg: '#e0f2fe', color: '#0369a1' },
    'contacted':            { bg: '#f3e8ff', color: '#7e22ce' },
    'qualified':            { bg: '#e0f2fe', color: '#0369a1' },
    'in_discussion':        { bg: '#f3e8ff', color: '#7e22ce' },
    'site_visit_scheduled': { bg: '#fef3c7', color: '#b45309' },
    'offer_made':           { bg: '#fef3c7', color: '#b45309' },
    'reserved':             { bg: '#f3e8ff', color: '#7e22ce' },
    'spa_signed':           { bg: '#dcfce7', color: '#16a34a' },
    'completed':            { bg: '#dcfce7', color: '#16a34a' },
    'not_proceeding':        { bg: '#fee2e2', color: '#b91c1c' },
  };
  const s = map[stage] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      fontSize: 11, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 600, whiteSpace: 'nowrap',
      display: 'inline-block', letterSpacing: '0.3px'
    }}>
      {stage?.replace('_', ' ')?.toUpperCase() || 'NEW'}
    </span>
  );
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
    <span style={{
      fontSize: 11, padding: '3px 8px', borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 600,
    }}>
      {text}
    </span>
  );
};

const formatCurrency = (val) => {
  if (!val) return '0 AED';
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(val);
};

// ─── Table Column Configurations ─────────────────────────────────────────────
const leadColumns = [
  {
    title: 'Customer',
    dataIndex: 'customerName',
    key: 'customerName',
    render: (text) => <span className="font-semibold text-gray-800">{text}</span>
  },
  {
    title: 'Project',
    dataIndex: 'projectName',
    key: 'projectName',
    render: (text) => <Tag color="purple">{text}</Tag>
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (text) => <span className="text-gray-500">{text}</span>
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
    render: (text) => <span className="text-gray-500">{text}</span>
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => <StagePill stage={status} />
  },
  {
    title: 'Registered On',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (date) => new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
];

const dealColumns = [
  { 
    title: 'Deal Date', 
    dataIndex: 'date', 
    key: 'date',
    render: (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  },
  { 
    title: 'Unit Reference', 
    dataIndex: 'unit', 
    key: 'unit',
    render: (text) => <span className="font-semibold text-gray-700">{text}</span>
  },
  { 
    title: 'Status', 
    dataIndex: 'status', 
    key: 'status',
    render: (status) => {
      let color = 'gold';
      if (status === 'Sold' || status === 'SPA Signed') color = 'green';
      if (status === 'Reserved') color = 'blue';
      return <Tag color={color}>{status}</Tag>;
    }
  },
  {
    title: 'Sale Value',
    dataIndex: 'price',
    key: 'price',
    render: (price) => <span className="font-bold text-gray-900">{formatCurrency(price)}</span>
  }
];

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

// ─── Main Component ──────────────────────────────────────────────────────────
const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("token");
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

  const getBarChartData = () => {
    if (!dashboardData?.propertyWiseInventory) return [];
    return dashboardData.propertyWiseInventory.map(prop => ({
      propertyName: prop.propertyName,
      available: prop.stats.available,
      reserved: prop.stats.reserved,
      sold: prop.stats.sold + prop.stats.spa_signed
    }));
  };

  const getTopPerformingListing = () => {
    if (!dashboardData?.properties || dashboardData.properties.length === 0) return null;
    const sorted = [...dashboardData.properties].sort((a, b) => {
      const viewsA = a.viewCount || 0;
      const viewsB = b.viewCount || 0;
      return viewsB - viewsA;
    });
    return sorted[0];
  };

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, user?.id, user?._id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => {
      setTimeout(() => setRefreshing(false), 800);
    });
  };

  const getDisplayName = () => {
    if (user?.first_name) return `${user.first_name} ${user.last_name || ""}`;
    if (user?.name) return user.name;
    if (user?.company_name) return user.company_name;
    return "Developer";
  };

  const statsIcons = [
    <BuildOutlined />,
    <LineChartOutlined />,
    <TrophyOutlined />,
    <ClockCircleOutlined />
  ];

  const topListing = getTopPerformingListing();

  return (
    <div style={{ padding: '24px', background: '#faf5ff', minHeight: '100vh', fontFamily: 'inherit' }}>
      <Spin spinning={loading} tip="Loading Dashboard Analytics...">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <DashboardOutlined style={{ color: '#fff', fontSize: 18 }} />
              </div>
              <Title level={3} style={{ margin: 0, color: THEME.primary }}>Developer Portal</Title>
            </div>
            <Text type="secondary">
              Welcome back, {getDisplayName()} 👋 Monitor your projects, live lead registrations and units funnel.
            </Text>
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <Select value={timeRange} style={{ width: 140 }} onChange={setTimeRange} className="rounded-lg shadow-sm">
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
              <Option value="90d">Last 90 Days</Option>
            </Select>

            <Button icon={<HomeOutlined />} onClick={() => navigate("/")} className="rounded-lg">
              Home
            </Button>

            <Button
              icon={<ReloadOutlined spin={refreshing} />}
              loading={refreshing}
              onClick={handleRefresh}
              className="rounded-lg"
            >
              Refresh
            </Button>

            <Badge count={0} color="#7c3aed">
              <Button
                type="primary"
                icon={<MessageOutlined />}
                style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                className="rounded-lg"
              >
                Chats
              </Button>
            </Badge>

            <Button type="primary" icon={<BellOutlined />} style={{ background: THEME.primary, borderColor: THEME.primary }} className="rounded-lg">
              Alerts
            </Button>
          </div>
        </div>

        {/* STATS */}
        <Row gutter={[16, 16]} className="mb-8">
          {dashboardData?.stats?.map((stat, i) => (
            <Col xs={24} sm={12} md={6} lg={6} xl={6} key={i}>
              <Card 
                bordered={false} 
                style={cardStyle} 
                className="hover:scale-[1.02] hover:shadow-lg duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Text type="secondary" className="font-semibold text-gray-500 uppercase tracking-wide text-xs">{stat.label}</Text>
                    <Title level={2} style={{ margin: "6px 0 2px 0", fontWeight: 700, color: '#1e1b4b' }}>{stat.value}</Title>
                  </div>
                  <div style={{
                    background: stat.bg,
                    color: stat.color,
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px"
                  }}>
                    {statsIcons[i]}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  {stat.change !== undefined && stat.change !== 0 ? (
                    <BadgePill 
                      text={`${stat.change > 0 ? '↑' : '↓'} ${Math.abs(stat.change)}% MoM`} 
                      type={stat.change > 0 ? 'up' : 'down'} 
                    />
                  ) : (
                    <span />
                  )}
                  {stat.subtext && (
                    <span className="text-xs text-gray-400 font-medium">{stat.subtext}</span>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* DETAILS SECTION WITH TOP PERFORMING & CHARTS */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={8}>
            <Card title="🏆 Top Listing Performance" style={cardStyle} className="h-full">
              {topListing ? (
                <div className="flex flex-col h-full justify-between py-2">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      {topListing.mainLogo ? (
                        <img 
                          src={topListing.mainLogo} 
                          alt="logo" 
                          style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} 
                        />
                      ) : (
                        <div className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold" style={{ width: 48, height: 48, borderRadius: 10, fontSize: 18 }}>
                          {topListing.projectName?.substring(0, 2).toUpperCase() || "PR"}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg leading-tight">{topListing.projectName || topListing.propertyName}</h4>
                        <span className="text-xs text-gray-400 font-semibold uppercase">{topListing.locality || "Primary Location"}</span>
                      </div>
                    </div>

                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Approval Status</span>
                        <Tag color={topListing.approvalStatus === "approved" ? "success" : "warning"} className="font-semibold uppercase text-[10px]">
                          {topListing.approvalStatus}
                        </Tag>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Listing State</span>
                        <Tag color={topListing.listingStatus === "active" ? "processing" : "default"} className="font-semibold uppercase text-[10px]">
                          {topListing.listingStatus}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                      <EyeOutlined className="text-blue-500 mb-1" style={{ fontSize: '18px' }} />
                      <div className="text-lg font-bold text-gray-800">{topListing.viewCount || 0}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Views</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                      <HeartOutlined className="text-red-500 mb-1" style={{ fontSize: '18px' }} />
                      <div className="text-lg font-bold text-gray-800">{topListing.wishlistCount || 0}</div>
                      <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Shortlists</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <TrophyOutlined style={{ fontSize: "54px", color: "#f59e0b", marginBottom: "16px" }} />
                  <Title level={4} style={{ color: '#1e1b4b', margin: 0 }}>No Listings Yet</Title>
                  <Text type="secondary" className="mt-2 block">Create property listings to start tracking popularity.</Text>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card style={cardStyle} className="h-full">
              <Tabs defaultActiveKey="funnel" className="custom-dashboard-tabs">
                <Tabs.TabPane tab="Sales Funnel Pipeline" key="funnel">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dashboardData?.dealFunnel || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#5c039b" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                      <XAxis dataKey="stage" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip cursor={{ fill: '#f3e8ff', opacity: 0.4 }} />
                      <Bar dataKey="count" fill="url(#funnelGrad)" radius={[6, 6, 0, 0]} name="Registrations" />
                    </BarChart>
                  </ResponsiveContainer>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Inventory Status Breakdown" key="inventory">
                  <div className="flex flex-wrap items-center justify-between">
                    <ResponsiveContainer width="60%" height={280}>
                      <PieChart>
                        <Pie 
                          data={dashboardData?.inventoryStatus || []} 
                          dataKey="value" 
                          outerRadius={95} 
                          innerRadius={50}
                          paddingAngle={3}
                          label
                        >
                          {(dashboardData?.inventoryStatus || []).map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-[35%] flex flex-col gap-2">
                      {(dashboardData?.inventoryStatus || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="w-3 height-3 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length], width: 10, height: 10, display: 'inline-block' }} />
                            <span className="text-xs font-semibold text-gray-600">{item.name}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>

        {/* PROPERTY-WISE INVENTORY IN ONE OVERALL CHART */}
        {dashboardData?.propertyWiseInventory && dashboardData.propertyWiseInventory.length > 0 && (
          <Row gutter={[16, 16]} className="mb-8">
            <Col span={24}>
              <Card title="📊 Property-Wise Inventory Distribution" style={cardStyle}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={getBarChartData()}
                    margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="availGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.95}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                    <XAxis dataKey="propertyName" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="available" stackId="inventoryStack" fill="url(#availGrad)" name="Available" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="reserved" stackId="inventoryStack" fill="url(#resGrad)" name="Reserved" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="sold" stackId="inventoryStack" fill="url(#soldGrad)" name="Sold/SPA Signed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        )}

        {/* DYNAMIC LEADS TABLE */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col span={24}>
            <Card title="✉️ Recent Interest Registrations & Leads" style={cardStyle}>
              <Table 
                columns={leadColumns} 
                dataSource={dashboardData?.recentLeads || []} 
                pagination={{ pageSize: 5 }}
                rowKey="_id"
                bordered={false}
                className="custom-table"
              />
            </Card>
          </Col>
        </Row>

        {/* DEALS CLOSED TABLE */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="🤝 Closed Platform Deals (Xoto GRID)" style={cardStyle}>
              <Table 
                columns={dealColumns} 
                dataSource={dashboardData?.dealsClosed || []} 
                pagination={{ pageSize: 5 }}
                rowKey="key"
                bordered={false}
                className="custom-table"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default DeveloperDashboard;