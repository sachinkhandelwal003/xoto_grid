import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, FunnelChart, Funnel, LabelList, Legend
} from 'recharts';
import { Card, Row, Col, Typography, Tag, Statistic, Spin, Badge, Avatar, List, Progress, Tabs, Button, Space, message } from 'antd';
import {
  UserOutlined, HomeOutlined, DollarOutlined,
  RiseOutlined, FallOutlined, PhoneOutlined,
  MailOutlined, CheckCircleOutlined, EditOutlined,
  CalendarOutlined, ClockCircleOutlined, TrophyOutlined,
  DashboardOutlined, SearchOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// ─── Theme ────────────────────────────────────────────────────────────────────
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

// ─── Sub-components ────────────────────────────────────────────────────────────

const StagePill = ({ stage }) => {
  const map = {
    'new':         { bg: '#e0f2fe', color: '#0369a1' },
    'contacted':   { bg: '#f3e8ff', color: '#7e22ce' },
    'qualified':   { bg: '#e0f2fe', color: '#0369a1' },
    'in_discussion': { bg: '#f3e8ff', color: '#7e22ce' },
    'site_visit_scheduled': { bg: '#fef3c7', color: '#b45309' },
    'offer_made': { bg: '#fef3c7', color: '#b45309' },
    'reserved': { bg: '#f3e8ff', color: '#7e22ce' },
    'spa_signed': { bg: '#dcfce7', color: '#16a34a' },
    'completed': { bg: '#dcfce7', color: '#16a34a' },
    'not_proceeding': { bg: '#fee2e2', color: '#b91c1c' },
  };
  const s = map[stage] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      fontSize: 11, padding: '2px 10px', borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {stage?.replace('_', ' ') || 'New'}
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
      fontSize: 11, padding: '2px 8px', borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 500,
    }}>
      {text}
    </span>
  );
};

const cardStyle = {
  borderRadius: 14,
  border: '1px solid #ede9fe',
  boxShadow: '0 1px 4px rgba(92,3,155,0.06)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── API Base URL (adjust as needed) ──────────────────────────────────────────
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Main Component ───────────────────────────────────────────────────────────
const GridAdvisorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ── Fetch Dashboard Data ────────────────────────────────────────────────────
  const fetchDashboard = async () => {
    try {
      const response = await apiService.get('/gridadvisor/me/dashboard');
      // apiService returns the top-level { status, data } object from the backend
      const payload = response.data || response;
      // payload now contains { advisor, stats, leaderboard, recentLeads, recentActivity, charts }
      setDashboardData(payload);
    } catch (err) {
      message.error('Failed to load dashboard');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── WebSocket Connection & Event Listeners ──────────────────────────────────
  useEffect(() => {
    fetchDashboard();
  }, []);

  const agentName = dashboardData?.advisor?.firstName 
    ? `${dashboardData.advisor.firstName} ${dashboardData.advisor.lastName}` 
    : user?.name || 'Sarah Khan';

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const recentLeads = dashboardData?.recentLeads || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const leadsByMonth = dashboardData?.charts?.leadsByMonth || [];
  const commissionOverTime = dashboardData?.charts?.commissionOverTime || [];
  const leadStatusBreakdown = dashboardData?.charts?.leadStatusBreakdown || [];
  const conversionFunnel = dashboardData?.charts?.conversionFunnel || [];
  const stats = dashboardData?.stats || {
    activeLeads: 0,
    presentations: 0,
    dealsClosed: 0,
    conversionRate: 0
  };

  return (
    <div style={{ padding: '20px', background: '#faf5ff', minHeight: '100vh', fontFamily: 'inherit' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <DashboardOutlined style={{ color: '#fff', fontSize: 18 }} />
            </div>
            <Title level={3} style={{ margin: 0, color: THEME.primary, fontSize: 24 }}>My Dashboard</Title>
          </div>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Welcome back, {agentName} — here's your activity for today
          </Text>
        </div>
        <Space>
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 8 }}
            onClick={() => navigate('/dashboard/GridAdvisor/property-catalogue')}
          >
            Browse Properties
          </Button>
          <Button 
            icon={<FileTextOutlined />} 
            style={{ borderRadius: 8 }}
            onClick={() => navigate('/dashboard/GridAdvisor/gridAdvisorLeads')}
          >
            View Leads
          </Button>
        </Space>
      </div>

      {/* ── Stats Bar ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Active Leads</Text>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: THEME.primaryLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.primary, fontSize: 16
              }}>
                <UserOutlined />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 4 }}>
              {stats.activeLeads}
            </div>
            <BadgePill text="+5 this week" type="up" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            hoverable
            style={{ ...cardStyle, cursor: 'pointer' }}
            bodyStyle={{ padding: '18px 20px' }}
            onClick={() => navigate('/dashboard/GridAdvisor/presentations')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Presentations Generated</Text>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: THEME.infoLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.info, fontSize: 16
              }}>
                <FileTextOutlined />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 4 }}>
              {stats.presentations}
            </div>
            <BadgePill text="12 this week" type="info" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Deals Closed</Text>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: THEME.successLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.success, fontSize: 16
              }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 4 }}>
              {stats.dealsClosed}
            </div>
            <BadgePill text="This month" type="up" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={cardStyle} bodyStyle={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Conversion Rate</Text>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: THEME.warningLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: THEME.warning, fontSize: 16
              }}>
                <RiseOutlined />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: 4 }}>
              {stats.conversionRate}%
            </div>
            <Progress percent={stats.conversionRate} size="small" strokeColor={THEME.primary} />
          </Card>
        </Col>
      </Row>

      {/* ── Middle Row: My Leads + Recent Activity ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        {/* My Leads */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={cardStyle}
            title={<span style={{ fontSize: 15, fontWeight: 600, color: THEME.primary }}>My Leads — Latest 5</span>}
            extra={
              <a 
                style={{ fontSize: 13, color: THEME.primary, cursor: 'pointer' }} 
                onClick={() => navigate('/dashboard/GridAdvisor/gridAdvisorLeads')}
              >
                View All →
              </a>
            }
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Client', 'Property', 'Stage', 'Budget'].map(h => (
                    <th key={h} style={{
                      fontSize: 11, color: '#9ca3af', fontWeight: 600, paddingBottom: 12,
                      paddingRight: 12, textAlign: 'left',
                      borderBottom: '1px solid #f3e8ff', textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead, i) => (
                  <tr key={i} style={{ transition: 'background 0.15s', cursor: 'pointer' }}>
                    <td style={{ padding: '12px 12px 12px 0', borderBottom: i < recentLeads.length - 1 ? '1px solid #faf5ff' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: lead.avatarBg || '#ddd6fe',
                          color: lead.avatarColor || '#4c1d95',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, flexShrink: 0
                        }}>
                          {lead.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{lead.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{lead.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', color: '#6b7280', fontSize: 13, borderBottom: i < recentLeads.length - 1 ? '1px solid #faf5ff' : 'none' }}>
                      {lead.property}
                    </td>
                    <td style={{ padding: '12px 12px 12px 0', borderBottom: i < recentLeads.length - 1 ? '1px solid #faf5ff' : 'none' }}>
                      <StagePill stage={lead.stage} />
                    </td>
                    <td style={{ padding: '12px 0', fontWeight: 600, color: THEME.primary, borderBottom: i < recentLeads.length - 1 ? '1px solid #faf5ff' : 'none' }}>
                      {lead.budget}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{ ...cardStyle, height: '100%' }}
            title={<span style={{ fontSize: 15, fontWeight: 600, color: THEME.primary }}>Recent Activity</span>}
          >
            <List
              dataSource={recentActivity}
              renderItem={(item, i) => (
                <List.Item style={{
                  padding: '12px 0',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid #faf5ff' : 'none',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: item.iconBg, color: item.iconColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15
                    }}>
                      {item.iconKey === 'inbox' && <UserOutlined />}
                      {item.iconKey === 'home' && <HomeOutlined />}
                      {item.iconKey === 'check' && <CheckCircleOutlined />}
                      {item.iconKey === 'edit' && <EditOutlined />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{item.text}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ClockCircleOutlined style={{ fontSize: 10 }} />
                        {item.time}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* ── My Stats Charts ── */}
      <Row gutter={[16, 16]}>
        {/* Leads by Month */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={cardStyle}
            title={<span style={{ fontSize: 15, fontWeight: 600, color: THEME.primary }}>Leads by Month</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leadsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6ff" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: 'rgba(92, 3, 155, 0.05)' }} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(92,3,155,0.12)' }} />
                <Bar dataKey="leads" fill={THEME.primary} radius={[4, 4, 0, 0]} name="Leads" />
                <Bar dataKey="closed" fill={THEME.success} radius={[4, 4, 0, 0]} name="Closed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Commission Over Time */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={cardStyle}
            title={<span style={{ fontSize: 15, fontWeight: 600, color: THEME.primary }}>Commission Over Time</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={commissionOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.success} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={THEME.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6ff" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(92,3,155,0.12)' }} formatter={(val) => [`₹${val.toLocaleString()}`, 'Commission']} />
                <Area type="monotone" dataKey="commission" stroke={THEME.success} fillOpacity={1} fill="url(#colorComm)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Lead Status Breakdown */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={cardStyle}
            title={<span style={{ fontSize: 15, fontWeight: 600, color: THEME.primary }}>Lead Status Breakdown</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={leadStatusBreakdown}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {leadStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(92,3,155,0.12)' }} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Conversion Funnel */}
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={cardStyle}
            title={<span style={{ fontSize: 15, fontWeight: 600, color: THEME.primary }}>Conversion Funnel</span>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <FunnelChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(92,3,155,0.12)' }} />
                <Funnel dataKey="value" data={conversionFunnel} isAnimationActive>
                  <LabelList position="right" fill="#374151" fontSize={11} dataKey="stage" />
                  {conversionFunnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GridAdvisorDashboard;
