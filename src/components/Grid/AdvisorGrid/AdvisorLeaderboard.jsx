import { useCallback, useEffect, useState } from "react";
import {
  Card, Empty, Progress, Spin, Tag, Tabs, Typography, message,
  Table, Avatar, Radio, Space, Tooltip, Pagination, Divider,
} from "antd";
import {
  ArrowDownOutlined, ArrowUpOutlined, CalendarOutlined,
  CheckCircleOutlined, FunnelPlotOutlined, RiseOutlined, TeamOutlined,
  TrophyOutlined, CrownOutlined, StarOutlined, UserOutlined,
  SafetyCertificateOutlined, FieldTimeOutlined,
} from "@ant-design/icons";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ReTooltip,
  XAxis, YAxis, Legend,
} from "recharts";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

// ─── Theme ──────────────────────────────────────────────────────────────────
const THEME = {
  primary: '#5C039B',
  primaryLight: '#f3e8ff',
  gold: '#f59e0b',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const trendTag = (value, suffix = "%") => {
  const isUp = Number(value || 0) >= 0;
  return (
    <Tag color={isUp ? "green" : "red"} style={{ margin: 0, fontSize: 12 }}>
      {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value || 0)}{suffix}
    </Tag>
  );
};

const StatCard = ({ icon, label, value, change, changeSuffix = "%" }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
    border: '1px solid #edf2f7', borderRadius: 10, background: '#f8fafc',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 8, background: THEME.primaryLight,
      color: THEME.primary, fontSize: 18, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ minWidth: 0 }}>
      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{label}</Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <Text strong style={{ fontSize: 20, color: '#0f172a', lineHeight: 1.2 }}>{value}</Text>
        {change !== undefined && trendTag(change, changeSuffix)}
      </div>
    </div>
  </div>
);

const RADIAN = Math.PI / 180;
const DonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const FunnelBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 13 }}>{label}</Text>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Text strong style={{ fontSize: 13 }}>{count}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{pct}%</Text>
        </div>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

const FUNNEL_COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#f97316', '#16a34a'];

// ─── RANK BADGE ──────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  if (rank === 1) return <CrownOutlined style={{ color: '#f59e0b', fontSize: 20 }} />;
  if (rank === 2) return <TrophyOutlined style={{ color: '#94a3b8', fontSize: 18 }} />;
  if (rank === 3) return <TrophyOutlined style={{ color: '#d97706', fontSize: 18 }} />;
  return <span style={{ fontWeight: 700, color: '#64748b', fontSize: 14 }}>#{rank}</span>;
};

// ─── PERSONAL STATS COMPONENT ──────────────────────────────────────────────
const PersonalStats = ({ data, range, setRange, rangeTabs, loading }) => {
  const current = data?.current || {};
  const previous = data?.previous || {};
  const trend = data?.trend || {};
  const chartData = data?.performance_trend || [];
  const leadsByMonth = data?.leads_by_month || [];
  const statusBreakdown = data?.lead_status_breakdown || [];
  const funnel = data?.conversion_funnel || [];
  const momIncrease = data?.mom_increase ?? null;
  const isUp = trend.direction !== "down";
  const funnelTotal = funnel[0]?.count || 0;
  const isAdvisor = data?.agent?.role === 'advisor';
  const tenureMonths = data?.agent?.tenure_months ?? null;

  return (
    <Spin spinning={loading}>
      <div>
        {/* Period Tabs */}
        <div style={{ marginBottom: 20 }}>
          <Tabs
            activeKey={range}
            onChange={setRange}
            items={rangeTabs}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>

        {/* Performance Score Card */}
        <Card style={{ borderRadius: 10, border: '1px solid #e8edf5', boxShadow: '0 6px 20px rgba(15,23,42,0.04)', marginBottom: 20 }} bodyStyle={{ padding: 20 }}>
          <Title level={5} style={{ margin: '0 0 16px', color: '#0f172a' }}>
            Performance Score
          </Title>
          <div style={{
            background: THEME.primaryLight, border: `1px solid #d8b4fe`,
            borderRadius: 8, padding: '8px 14px', marginBottom: 16, fontSize: 12, color: THEME.primary,
          }}>
            Score = Deals Closed (30%) + Conversion Rate (40%) + {isAdvisor ? 'Response Time (30%)' : 'Tenure (30%)'}
            {isAdvisor ? (
              <span style={{ marginLeft: 8, fontWeight: 600 }}>
                · Faster response → higher score
              </span>
            ) : (
              tenureMonths !== null && (
                <span style={{ marginLeft: 8, fontWeight: 600 }}>
                  · Your tenure: {tenureMonths} month{tenureMonths !== 1 ? 's' : ''}
                </span>
              )
            )}
          </div>
          <div style={{
            border: `1px solid ${isUp ? '#bbf7d0' : '#fecaca'}`,
            background: isUp ? '#f0fdf4' : '#fef2f2',
            borderRadius: 10, padding: 14, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <div>
                <Text strong style={{ color: isUp ? '#166534' : '#991b1b' }}>
                  {isUp ? 'Performance trending up' : 'Performance trending down'}
                </Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  vs previous {data?.days_window || 30} days
                </Text>
              </div>
              {trendTag(trend.progress_change || 0, ' pts')}
            </div>
            <Progress percent={current.progress_score || 0} strokeColor={isUp ? '#16a34a' : '#dc2626'} trailColor="#e5e7eb" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 12 }}>
            <StatCard icon={<TeamOutlined />} label="Total Leads" value={current.total_leads || 0} change={trend.leads_change} />
            <StatCard icon={<CheckCircleOutlined />} label="Conversion Rate" value={`${current.conversion_rate || 0}%`} change={trend.conversion_change} changeSuffix=" pts" />
            <StatCard icon={<RiseOutlined />} label="Closed Deals" value={current.completed_deals || 0} change={trend.deals_change} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <div style={{ borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', padding: 12 }}>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>This period</Text>
              <Text strong style={{ fontSize: 13 }}>{current.total_leads || 0} leads · {current.completed_deals || 0} closed · {current.in_progress_leads || 0} in progress</Text>
            </div>
            <div style={{ borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', padding: 12 }}>
              <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Previous period</Text>
              <Text strong style={{ fontSize: 13 }}>{previous.total_leads || 0} leads · {previous.completed_deals || 0} closed · {previous.in_progress_leads || 0} in progress</Text>
            </div>
          </div>
        </Card>

        {/* My Stats */}
        <Card style={{ borderRadius: 10, border: '1px solid #e8edf5', boxShadow: '0 6px 20px rgba(15,23,42,0.04)', marginBottom: 20 }} bodyStyle={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            <Title level={5} style={{ margin: 0, color: '#0f172a' }}>My Stats</Title>
            {momIncrease !== null && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: momIncrease >= 0 ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${momIncrease >= 0 ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: 8, padding: '6px 12px',
              }}>
                <CalendarOutlined style={{ color: momIncrease >= 0 ? '#16a34a' : '#dc2626' }} />
                <Text style={{ fontSize: 13, color: momIncrease >= 0 ? '#166534' : '#991b1b' }}>
                  MoM: {momIncrease >= 0 ? '+' : ''}{momIncrease}% leads vs last month
                </Text>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div>
              <Text strong style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 10 }}>Leads by Month</Text>
              {leadsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={leadsByMonth} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} width={28} />
                    <ReTooltip formatter={(val, name) => [val, name === 'leads' ? 'Leads' : 'Closed']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="leads" name="Leads" fill={THEME.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="conversions" name="Closed" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <Empty description="No monthly data yet" style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} />}
            </div>
            <div>
              <Text strong style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 10 }}>Lead Status Breakdown</Text>
              {statusBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="count" nameKey="label" labelLine={false} label={DonutLabel}>
                      {statusBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <ReTooltip formatter={(val, name) => [val, name]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, lineHeight: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Empty description="No lead data yet" style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} />}
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FunnelPlotOutlined style={{ color: THEME.primary, fontSize: 16 }} />
              <Text strong style={{ fontSize: 13, color: '#374151' }}>Conversion Funnel</Text>
              {funnelTotal > 0 && <Tag color="purple" style={{ marginLeft: 4 }}>{funnelTotal} total leads entered</Tag>}
            </div>
            {funnel.length > 0 ? (
              funnel.map((stage, idx) => (
                <FunnelBar key={stage.stage} label={stage.label} count={stage.count} total={funnelTotal} color={FUNNEL_COLORS[idx] || '#94a3b8'} />
              ))
            ) : <Empty description="No funnel data yet" />}
          </div>
        </Card>

        {/* Trend Chart */}
        <Card style={{ borderRadius: 10, border: '1px solid #e8edf5', boxShadow: '0 6px 20px rgba(15,23,42,0.04)' }} bodyStyle={{ padding: 20 }}>
          <Title level={5} style={{ margin: '0 0 16px', color: '#0f172a' }}>
            Activity Trend — {rangeTabs.find(t => t.key === range)?.label}
          </Title>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} width={28} />
                <ReTooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="leads" stroke={THEME.primary} fill="url(#leadsFill)" strokeWidth={2} name="Leads" />
                <Area type="monotone" dataKey="conversions" stroke="#16a34a" fill="#dcfce720" strokeWidth={2} name="Closed" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Empty description="No trend data for this period" />}
        </Card>
      </div>
    </Spin>
  );
};

// ─── LEADERBOARD TABLE COMPONENT ──────────────────────────────────────────
const LeaderboardTable = ({ data, loading, type, currentUserId, myRank }) => {
  const tableData = data.map(item => ({
    ...item,
    userId: item._id,
    isCurrentUser: item.isCurrentUser || (item._id === currentUserId),
  }));

  const baseColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => <RankBadge rank={rank} />,
    },
    {
      title: 'Advisor',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            {record.isCurrentUser && <Tag color="purple" style={{ marginLeft: 8 }}>You</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Total Leads',
      dataIndex: 'totalLeads',
      key: 'totalLeads',
      sorter: (a, b) => a.totalLeads - b.totalLeads,
    },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (val) => `${val || 0}%`,
      sorter: (a, b) => (a.conversionRate || 0) - (b.conversionRate || 0),
    },
    {
      title: 'Deals Closed',
      dataIndex: 'dealsClosed',
      key: 'dealsClosed',
      sorter: (a, b) => a.dealsClosed - b.dealsClosed,
    },
    {
      title: 'Response Time (avg)',
      dataIndex: 'avgResponseTimeHrs',
      key: 'avgResponseTimeHrs',
      render: (val) => val != null ? `${val.toFixed(1)} hrs` : '—',
      sorter: (a, b) => (a.avgResponseTimeHrs || 0) - (b.avgResponseTimeHrs || 0),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (val) => <Text strong style={{ color: THEME.primary }}>{val || 0}</Text>,
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
      defaultSortOrder: 'descend',
    },
  ];

  const trustColumns = [
    ...baseColumns,
    {
      title: 'Trust Score',
      dataIndex: 'trustScore',
      key: 'trustScore',
      render: (val) => <Text strong style={{ color: '#f59e0b' }}>{val || 0}</Text>,
      sorter: (a, b) => (a.trustScore || 0) - (b.trustScore || 0),
    },
    {
      title: 'Compliance',
      dataIndex: 'complianceStatus',
      key: 'complianceStatus',
      render: (val) => {
        const colorMap = { compliant: 'green', flagged: 'red', incomplete: 'orange' };
        return <Tag color={colorMap[val] || 'default'}>{val?.toUpperCase() || '—'}</Tag>;
      },
    },
  ];

  const finalColumns = type === 'trust' ? trustColumns : baseColumns;

  return (
    <Spin spinning={loading}>
      {myRank && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f3e8ff', borderRadius: 8, border: '1px solid #d8b4fe' }}>
          <Text strong>My Rank: #{myRank.rank}</Text>
          <Text type="secondary" style={{ marginLeft: 16 }}>Score: {myRank.score}</Text>
        </div>
      )}
      <Table
        dataSource={tableData}
        columns={finalColumns}
        rowKey="_id"
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} advisors` }}
        rowClassName={(record) => record.isCurrentUser ? 'highlight-row' : ''}
        style={{ marginTop: 16 }}
      />
      <style>{`
        .highlight-row {
          background: #f3e8ff !important;
          border-left: 4px solid #5C039B;
        }
        .highlight-row td:first-child {
          border-left: 4px solid #5C039B;
        }
      `}</style>
    </Spin>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const AdvisorLeaderboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.code === '1' || user?.role?.code === '18'; // admin or super admin
  const currentUserId = user?.id;

  const [range, setRange] = useState('monthly');
  const [view, setView] = useState('myStats');
  const [loading, setLoading] = useState(false);
  const [personalData, setPersonalData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [topConvertersData, setTopConvertersData] = useState([]);
  const [trustData, setTrustData] = useState([]);
  const [myRank, setMyRank] = useState(null);

  const rangeTabs = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'annual', label: 'Annual' },
  ];

  // ── Fetch personal stats ──────────────────────────────────────────────────
  const fetchPersonalData = useCallback(async () => {
    try {
      const res = await apiService.get('/gridadvisor/me/leaderboard', { params: { range } });
      setPersonalData(res?.data || null);
    } catch (err) {
      console.error('Failed to fetch personal stats', err);
      message.error('Failed to load personal performance data');
    }
  }, [range]);

  // ── Fetch leaderboard data (filtered to advisors only) ──────────────────
  const fetchLeaderboard = useCallback(async (type = 'global') => {
    setLoading(true);
    try {
      let endpoint = 'grid/leaderboard';
      if (type === 'topConverters') endpoint = 'grid/leaderboard/top-converters';
      else if (type === 'trust') endpoint = 'grid/leaderboard/trust';

      // ✅ PRD requirement: for advisors, we must filter to advisors only.
      const params = { range, role: 'advisor' };
      const res = await apiService.get(endpoint, { params });
      const { data, myRank: rankInfo, pagination } = res?.data || {};

      if (type === 'global') {
        setLeaderboardData(data || []);
        setMyRank(rankInfo || null);
      } else if (type === 'topConverters') {
        setTopConvertersData(data || []);
        setMyRank(rankInfo || null);
      } else if (type === 'trust') {
        setTrustData(data || []);
        setMyRank(null);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} leaderboard`, err);
      message.error(`Failed to load ${type} data`);
    } finally {
      setLoading(false);
    }
  }, [range]);

  // ── Effect: fetch data when view or range changes ────────────────────────
  useEffect(() => {
    if (view === 'myStats') {
      fetchPersonalData();
    } else {
      fetchLeaderboard(view);
    }
  }, [view, range, fetchPersonalData, fetchLeaderboard]);

  const handleViewChange = (e) => {
    setView(e.target.value);
    setLoading(true);
  };

  const getActiveData = () => {
    if (view === 'global') return leaderboardData;
    if (view === 'topConverters') return topConvertersData;
    if (view === 'trust') return trustData;
    return [];
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fb', padding: '16px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
          Advisor Performance & Leaderboard
        </Text>
        <Title level={3} style={{ margin: '2px 0 4px', fontWeight: 900, color: '#0f172a' }}>
          {view === 'myStats' ? 'My Stats & Performance' : 
           view === 'global' ? 'Global Advisor Leaderboard' :
           view === 'topConverters' ? 'Top Converters (Advisors)' : 'Trust Ranking'}
        </Title>
        <Text type="secondary">
          {view === 'myStats' ? 'Your personal performance overview. Score is based on deals closed, conversion rate, and response time.' :
           view === 'global' ? 'Ranking of all Xoto advisors based on composite score. Higher score → priority lead assignment.' :
           view === 'topConverters' ? 'Advisors ranked by leads-to-completed conversion ratio.' :
           'Trust ranking based on compliance, reliability, and platform tenure (admin only).'}
        </Text>
      </div>

      {/* View Switcher */}
      <div style={{ marginBottom: 20 }}>
        <Radio.Group value={view} onChange={handleViewChange} buttonStyle="solid">
          <Radio.Button value="myStats">My Stats</Radio.Button>
          <Radio.Button value="global">Leaderboard</Radio.Button>
          <Radio.Button value="topConverters">Top Converters</Radio.Button>
          {isAdmin && <Radio.Button value="trust">Trust Ranking</Radio.Button>}
        </Radio.Group>
      </div>

      {/* Render based on view */}
      {view === 'myStats' ? (
        <PersonalStats
          data={personalData}
          range={range}
          setRange={setRange}
          rangeTabs={rangeTabs}
          loading={loading || !personalData}
        />
      ) : (
        <div>
          <Tabs
            activeKey={range}
            onChange={setRange}
            items={rangeTabs}
            tabBarStyle={{ marginBottom: 0 }}
          />
          <Divider style={{ margin: '8px 0 0' }} />
          <LeaderboardTable
            data={getActiveData()}
            loading={loading}
            type={view}
            currentUserId={currentUserId}
            myRank={myRank}
          />
        </div>
      )}
    </div>
  );
};

export default AdvisorLeaderboard;