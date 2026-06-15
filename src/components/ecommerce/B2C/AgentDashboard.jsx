import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import {
  TeamOutlined, HomeOutlined, DollarOutlined, PercentageOutlined,
  FileTextOutlined, PlusOutlined, FireOutlined, ClockCircleOutlined,
  CheckOutlined, BellOutlined, AppstoreAddOutlined,
} from "@ant-design/icons";
import {
  Card, Row, Col, Select, Button, Typography, Tag,
  Avatar, List, Spin, message, Progress, Table, Empty, Badge,
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Text } = Typography;
const { Option } = Select;

const THEME = {
  primary:      '#5C039B',
  primaryLight: '#f3e8ff',
  green:        '#10b981',
  amber:        '#f59e0b',
  blue:         '#3b82f6',
  red:          '#ef4444',
  text:         '#0f172a',
  sub:          '#64748b',
  border:       '#e8edf5',
  bg:           '#f6f8fb',
};

const STATUS_CONFIG = {
  new:                   { color: '#3b82f6',  label: 'New'           },
  contacted:             { color: '#06b6d4',  label: 'Contacted'     },
  in_discussion:         { color: '#f59e0b',  label: 'In Discussion' },
  site_visit_scheduled:  { color: '#8b5cf6',  label: 'Site Visit'    },
  offer_made:            { color: '#f97316',  label: 'Offer Made'    },
  qualified:             { color: '#10b981',  label: 'Qualified'     },
  completed:             { color: '#16a34a',  label: 'Completed'     },
  not_proceeding:        { color: '#ef4444',  label: 'Not Proceeding'},
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: '#94a3b8', label: status || '—' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      background: cfg.color + '18', color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      fontSize: 11, fontWeight: 500,
    }}>
      {cfg.label}
    </span>
  );
};

const KpiCard = ({ title, value, icon, color, bg, locked }) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 10, border: `1px solid ${THEME.border}`,
      boxShadow: '0 2px 12px rgba(15,23,42,0.05)',
      opacity: locked ? 0.65 : 1,
    }}
    bodyStyle={{ padding: 18 }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <Text style={{ display: 'block', fontSize: 12, color: THEME.sub, fontWeight: 500, marginBottom: 6 }}>
          {title}
        </Text>
        <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1.1 }}>
          {locked ? <span style={{ fontSize: 14, color: THEME.sub }}>Complete profile to unlock</span> : (value ?? 0)}
        </div>
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 8, background: bg,
        color, fontSize: 18, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

const SectionLabel = ({ children }) => (
  <Text style={{ display: 'block', fontSize: 11, fontWeight: 600, color: THEME.sub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
    {children}
  </Text>
);

const CardTitle = ({ children }) => (
  <span style={{ fontSize: 15, fontWeight: 600, color: THEME.text }}>{children}</span>
);

const ChartTooltipStyle = {
  borderRadius: 8, border: 'none',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  fontSize: 12,
};

const AgentDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get("agent/dashboard", { params: { range: timeRange } });
      if (res?.data) setData(res.data);
    } catch (err) {
      console.error("Agent dashboard fetch failed", err);
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const {
    agent_name           = 'Agent',
    profile_completion   = 0,
    stats                = {},
    active_requirement_leads = 0,
    active_listings      = 0,
    presentations_generated  = 0,
    commission_earned    = 0,
    leads_trend          = [],
    deals_closed         = [],
    leads_preview        = [],
    activity_feed        = [],
    conversion_rate      = 0,
    lead_status_breakdown = [],
    monthly_leads        = [],
    recent_clients       = [],
  } = data || {};

  const profileComplete = profile_completion >= 100;

  const kpiCards = [
    { title: 'Active Requirement Leads', value: active_requirement_leads, icon: <TeamOutlined />,     color: THEME.primary, bg: THEME.primaryLight },
    { title: 'Active Listings',          value: active_listings,          icon: <HomeOutlined />,      color: '#0ea5e9',     bg: '#f0f9ff'          },
    { title: 'Presentations Generated',  value: presentations_generated,  icon: <FileTextOutlined />,  color: THEME.green,   bg: '#ecfdf5'          },
    { title: 'Commission Earned (AED)',  value: commission_earned,        icon: <DollarOutlined />,    color: THEME.amber,   bg: '#fffbeb', locked: !profileComplete },
  ];

  const leadsTableCols = [
    {
      title: 'Lead',
      dataIndex: 'name',
      render: (t) => <Text style={{ fontSize: 13 }}>{t || '—'}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (t) => <Text style={{ fontSize: 12, color: THEME.sub }}>{t || '—'}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: (t) => <Text style={{ fontSize: 12, color: THEME.sub }}>{t || '—'}</Text>,
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ background: THEME.bg, minHeight: '100vh', padding: '20px 24px' }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} md={16}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <Text style={{ fontSize: 11, fontWeight: 600, color: THEME.sub, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Agent Dashboard
                  </Text>
                  <div style={{ fontSize: 22, fontWeight: 700, color: THEME.text, marginTop: 2, marginBottom: 4 }}>
                    Welcome back, {agent_name} 👋
                  </div>
                  <Text style={{ fontSize: 13, color: THEME.sub }}>
                    Track your leads, listings, presentations and conversions.
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Select value={timeRange} onChange={setTimeRange} style={{ width: 140 }} size="middle">
                    <Option value="7d">Last 7 Days</Option>
                    <Option value="30d">Last 30 Days</Option>
                    <Option value="90d">Last 90 Days</Option>
                  </Select>
                  <Avatar size={44} style={{ backgroundColor: THEME.primary, fontSize: 18, fontWeight: 600 }}>
                    {agent_name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </div>
              </div>
            </Card>
          </Col>

          {/* Profile Completion */}
          <Col xs={24} md={8}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <Text style={{ fontSize: 12, color: THEME.sub, fontWeight: 500, display: 'block', marginBottom: 4 }}>
                    Profile Completion
                  </Text>
                  <div style={{ fontSize: 28, fontWeight: 700, color: THEME.primary, lineHeight: 1 }}>
                    {profile_completion}%
                  </div>
                </div>
                {profileComplete && (
                  <Tag color="green" style={{ fontWeight: 500, fontSize: 11 }}>Complete</Tag>
                )}
              </div>
              <Progress
                percent={profile_completion}
                strokeColor={{ '0%': THEME.primary, '100%': '#9D4EDD' }}
                trailColor="#e8edf5"
                showInfo={false}
              />
              <Text style={{ fontSize: 11, color: THEME.sub, display: 'block', marginTop: 6 }}>
                {profileComplete ? 'All features unlocked.' : 'Complete your profile to unlock commission tracking.'}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {kpiCards.map(k => (
            <Col xs={24} sm={12} lg={6} key={k.title}>
              <KpiCard {...k} />
            </Col>
          ))}
        </Row>

        {/* ── Charts ─────────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>

          {/* Leads Velocity */}
          <Col xs={24} lg={16}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <SectionLabel>Leads Activity</SectionLabel>
                  <CardTitle>Leads Velocity</CardTitle>
                  <Text style={{ fontSize: 12, color: THEME.sub, display: 'block', marginTop: 2 }}>
                    {timeRange === '7d' ? '7-day' : timeRange === '30d' ? '30-day' : '90-day'} traction
                  </Text>
                </div>
                <Badge dot color={THEME.green}>
                  <Tag style={{ borderRadius: 20, fontSize: 11, fontWeight: 500, color: THEME.green, border: `1px solid ${THEME.green}30`, background: '#ecfdf5', margin: 0 }}>
                    Live
                  </Tag>
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={leads_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="agentAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={THEME.primary} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: THEME.sub, fontSize: 11 }} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dx={-6} allowDecimals={false} domain={[0, d => Math.max(1, d + 1)]} />
                  <Tooltip contentStyle={ChartTooltipStyle} />
                  <Area type="monotone" dataKey="leads" stroke={THEME.primary} strokeWidth={2.5} fill="url(#agentAreaFill)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Deals Closed */}
          <Col xs={24} lg={8}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)', height: '100%' }}>
              <div style={{ marginBottom: 16 }}>
                <SectionLabel>Conversions</SectionLabel>
                <CardTitle>Deals Closed</CardTitle>
                <Text style={{ fontSize: 12, color: THEME.sub, display: 'block', marginTop: 2 }}>Monthly</Text>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={deals_closed} margin={{ top: 10, right: 6, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: THEME.sub, fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={ChartTooltipStyle} />
                  <Bar dataKey="deals" radius={[5, 5, 0, 0]} barSize={24}>
                    {deals_closed.map((_, i) => (
                      <Cell key={i} fill={i === deals_closed.length - 1 ? THEME.primary : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* ── My Stats ───────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>

          {/* Lead Status Donut */}
          <Col xs={24} sm={12} lg={7}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)', height: '100%' }}>
              <SectionLabel>Distribution</SectionLabel>
              <CardTitle>Lead Status</CardTitle>
              {lead_status_breakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={lead_status_breakdown} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={2} dataKey="value">
                        {lead_status_breakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color || STATUS_CONFIG[entry.status]?.color || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={v => [`${v} leads`]} contentStyle={ChartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {lead_status_breakdown.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color || '#94a3b8', flexShrink: 0 }} />
                          <Text style={{ fontSize: 12, color: THEME.sub }}>{STATUS_CONFIG[item.status]?.label || item.status}</Text>
                        </div>
                        <Text style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{item.value}</Text>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Empty description="No data yet" style={{ marginTop: 24 }} />
              )}
            </Card>
          </Col>

          {/* Monthly Leads Line Chart */}
          <Col xs={24} sm={12} lg={10}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)', height: '100%' }}>
              <SectionLabel>Month on Month</SectionLabel>
              <CardTitle>Leads Growth</CardTitle>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthly_leads} margin={{ top: 20, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: THEME.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, d => Math.max(1, d + 1)]} />
                  <Tooltip contentStyle={ChartTooltipStyle} />
                  <Line type="monotone" dataKey="leads" stroke={THEME.primary} strokeWidth={2.5} dot={{ fill: THEME.primary, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Conversion Rate */}
          <Col xs={24} sm={12} lg={7}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)', height: '100%' }}>
              <SectionLabel>Performance</SectionLabel>
              <CardTitle>Conversion Rate</CardTitle>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '14px 0 8px' }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: THEME.green, lineHeight: 1 }}>{conversion_rate}</span>
                <span style={{ fontSize: 16, color: THEME.sub }}>%</span>
              </div>
              <Progress
                percent={conversion_rate}
                strokeColor={{ '0%': THEME.red, '50%': THEME.amber, '100%': THEME.green }}
                trailColor="#e8edf5"
                showInfo={false}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
                {[
                  { label: 'Total Leads',  value: stats?.total     || 0, color: THEME.text  },
                  { label: 'In Progress',  value: stats?.active    || 0, color: THEME.amber },
                  { label: 'Completed',    value: stats?.completed || 0, color: THEME.green },
                  { label: 'Not Proceeding', value: stats?.not_proceeding || 0, color: THEME.red },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: THEME.sub }}>{label}</Text>
                    <Text style={{ fontSize: 13, fontWeight: 600, color }}>{value}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* ── My Leads Preview ───────────────────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}
              title={<CardTitle>My Latest Leads</CardTitle>}
              extra={
                <Button type="link" size="small" style={{ color: THEME.primary, fontWeight: 500, padding: 0 }}
                  onClick={() => navigate('/dashboard/agent/GridAgent-lead')}>
                  View all →
                </Button>
              }
            >
              {leads_preview.length > 0 ? (
                <Table
                  dataSource={leads_preview}
                  columns={leadsTableCols}
                  pagination={false}
                  rowKey="id"
                  size="small"
                  style={{ fontSize: 13 }}
                />
              ) : (
                <Empty description="No leads yet" />
              )}
            </Card>
          </Col>
        </Row>

        {/* ── Activity Feed + Quick Actions ──────────────────────────────── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>

          {/* Recent Activity */}
          <Col xs={24} lg={14}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)', height: '100%' }}
              title={<CardTitle>Recent Activity</CardTitle>}>
              {activity_feed.length > 0 ? (
                <List
                  dataSource={activity_feed}
                  renderItem={item => (
                    <List.Item style={{ paddingLeft: 0, paddingRight: 0, borderBottom: '1px solid #f1f5f9' }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar size={36} style={{ background: THEME.primaryLight, color: THEME.primary, fontSize: 15 }}>
                            {item.icon === 'team'      && <TeamOutlined />}
                            {item.icon === 'file-text' && <FileTextOutlined />}
                            {item.icon === 'check'     && <CheckOutlined />}
                            {item.icon === 'bell'      && <BellOutlined />}
                            {!item.icon               && <BellOutlined />}
                          </Avatar>
                        }
                        title={<Text style={{ fontSize: 13, fontWeight: 500, color: THEME.text }}>{item.message}</Text>}
                        description={
                          <Text style={{ fontSize: 11, color: THEME.sub }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />{item.time}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No recent activity" />
              )}
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} lg={10}>
            <Card bordered={false} bodyStyle={{ padding: 20 }}
              style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)', height: '100%' }}
              title={<CardTitle>Quick Actions</CardTitle>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button
                  size="large" block type="primary" icon={<PlusOutlined />}
                  onClick={() => navigate('/dashboard/agent/CreateAgent-Lead')}
                  style={{ background: `linear-gradient(135deg, ${THEME.primary} 0%, #9D4EDD 100%)`, border: 'none', fontWeight: 500, height: 46, borderRadius: 8 }}
                >
                  Add Requirement Lead
                </Button>
                <Button
                  size="large" block icon={<AppstoreAddOutlined />}
                  onClick={() => navigate('/dashboard/agent/agent-projects')}
                  style={{ fontWeight: 500, height: 46, borderRadius: 8, borderColor: '#0ea5e9', color: '#0ea5e9' }}
                >
                  Add Listing
                </Button>
                <Button
                  size="large" block icon={<FireOutlined />}
                  onClick={() => navigate('/dashboard/agent/agent-projects')}
                  style={{ fontWeight: 500, height: 46, borderRadius: 8, borderColor: THEME.blue, color: THEME.blue }}
                >
                  Browse Properties
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* ── Recent Clients ─────────────────────────────────────────────── */}
        {recent_clients.length > 0 && (
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card bordered={false} bodyStyle={{ padding: 20 }}
                style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, boxShadow: '0 2px 12px rgba(15,23,42,0.05)' }}
                title={<CardTitle>Recent Clients</CardTitle>}>
                <List
                  dataSource={recent_clients}
                  renderItem={item => (
                    <List.Item style={{ paddingLeft: 0, paddingRight: 0, borderBottom: '1px solid #f1f5f9' }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar size={40} style={{ background: THEME.primaryLight, color: THEME.primary, fontWeight: 600, fontSize: 16 }}>
                            {item.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        }
                        title={<Text style={{ fontSize: 13, fontWeight: 500, color: THEME.text }}>{item.title || item.name}</Text>}
                        description={
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                            <Text style={{ fontSize: 12, color: THEME.sub }}>{item.name}</Text>
                            <Text style={{ fontSize: 11, color: '#94a3b8' }}>{item.time}</Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        )}

      </div>
    </Spin>
  );
};

export default AgentDashboard;
