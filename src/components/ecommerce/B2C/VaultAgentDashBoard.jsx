import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Legend
} from 'recharts';
import {
  RiUserAddLine, RiMoneyDollarCircleLine, RiFileTextLine,
  RiTrophyLine, RiCalculatorLine, RiArrowUpLine, RiArrowDownLine,
  RiRefreshLine, RiWalletLine, RiCheckDoubleLine, RiUserStarLine,
  RiAlertLine, RiTimeLine
} from 'react-icons/ri';
import {
  Card, Row, Col, Statistic, Tag, List, Avatar, Button, Typography,
  Spin, Alert, Select, Empty, Segmented, Progress, Space, Badge
} from 'antd';
import dayjs from 'dayjs';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;

/* ─── Brand Colors ───────────────────────────────────────────── */
const BRAND = '#5C039B';
const BRAND_GRADIENT = 'linear-gradient(135deg, #5C039B 0%, #8B5CF6 100%)';
const COLORS = {
  primary: '#5C039B',
  secondary: '#03A4F4',
  success: '#10B981',
  warning: '#F97316',
  danger: '#EF4444',
  gray: '#6B7280',
  purple: '#8B5CF6',
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.success, COLORS.danger, COLORS.purple, '#F59E0B'];

/* ─── Helpers ────────────────────────────────────────────────── */
const formatCurrency = (value) => {
  if (!value && value !== 0) return 'AED 0';
  if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`;
  return `AED ${value?.toLocaleString() || 0}`;
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  return dayjs(dateStr).format('DD MMM');
};

const getStatusColor = (status) => {
  const map = {
    'New': COLORS.secondary,
    'contacted': COLORS.warning,
    'qualified': COLORS.primary,
    'collectingDocuments': COLORS.purple,
    'applicationCreated': '#3B82F6',
    'disbursed': COLORS.success,
    'notProceeding': COLORS.danger,
  };
  return map[status] || COLORS.gray;
};

const getStatusTag = (status) => {
  const display = status?.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()) || status;
  let color = 'default';
  if (status === 'New') color = 'blue';
  else if (status === 'contacted') color = 'orange';
  else if (status === 'qualified') color = 'purple';
  else if (status === 'collectingDocuments') color = 'geekblue';
  else if (status === 'applicationCreated') color = 'cyan';
  else if (status === 'disbursed') color = 'green';
  else if (status === 'notProceeding') color = 'red';
  return <Tag color={color}>{display}</Tag>;
};

/* ─── Custom Tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
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

/* ═══════════════════ MAIN AGENT DASHBOARD ═════════════════════ */
const VaultAgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');
  const [error, setError] = useState(null);

  /* ── API Fetch ── */
  const fetchStats = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('range', timeFilter);
      const res = await apiService.get(`/vault/statistics/agent/stats?${params.toString()}`);

      if (res?.data) {
        setStats(res.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Agent dashboard error:', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ── Derived Data ── */
  const kpis = stats?.kpis || {};
  const leadStatus = stats?.leadStatus || {};
  const earnings = stats?.earnings || {};
  const graphs = stats?.graphs || {};
  const recentLeads = stats?.recentLeads || [];
  const performance = stats?.performance || {};

  /* Prepare chart data */
  const leadsOverTimeData = (graphs.leadsOverTime || []).map((d) => ({
    name: formatShortDate(d.date),
    Leads: d.count,
    date: d.date,
  }));

  const commissionTrendData = (graphs.commissionTrend || []).map((d) => ({
    name: formatShortDate(d.date),
    Commission: d.totalCommission || 0,
    date: d.date,
  }));

  /* Lead status pie data */
  const pieData = Object.entries(leadStatus)
    .filter(([_, value]) => value > 0)
    .map(([key, value], idx) => ({
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      value: value,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    }));

  /* Loading state */
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-col gap-4">
        <Spin size="large" />
        <p style={{ color: BRAND }} className="font-semibold tracking-wide">Loading Vault Agent Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 md:p-8 font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <RiUserStarLine className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight m-0">Vault Agent Portal</h1>
              </div>
              <p className="text-sm text-gray-400 font-medium ml-[52px] m-0">Your mortgage referral performance at a glance</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                options={[
                  { label: 'Today', value: 'today' },
                  { label: 'Week', value: 'week' },
                  { label: 'Month', value: 'month' },
                ]}
                value={timeFilter}
                onChange={setTimeFilter}
                className="font-semibold"
              />
              <Button
                icon={<RiRefreshLine size={15} className={refreshing ? 'animate-spin' : ''} />}
                onClick={() => fetchStats(true)}
                loading={refreshing}
                className="rounded-lg px-5"
              >
                Sync
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          showIcon
          closable
          className="mb-6 rounded-xl"
          onClose={() => setError(null)}
        />
      )}

      {/* KPI Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title={<span className="text-gray-500 text-xs uppercase tracking-wide">Total Referrals</span>}
              value={kpis.totalLeads || 0}
              prefix={<RiUserAddLine className="text-[#5C039B]" size={18} />}
              valueStyle={{ color: BRAND, fontWeight: 700, fontSize: 32 }}
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <Badge status="processing" /> All time referrals
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title={<span className="text-gray-500 text-xs uppercase tracking-wide">Qualified Leads</span>}
              value={kpis.qualifiedLeads || 0}
              prefix={<RiCheckDoubleLine className="text-[#8B5CF6]" size={18} />}
              valueStyle={{ color: COLORS.purple, fontWeight: 700, fontSize: 32 }}
            />
            <Progress
              percent={kpis.totalLeads ? Math.round(((kpis.qualifiedLeads || 0) / kpis.totalLeads) * 100) : 0}
              size="small"
              strokeColor={COLORS.purple}
              showInfo={false}
              className="mt-2"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title={<span className="text-gray-500 text-xs uppercase tracking-wide">Total Commission</span>}
              value={formatCurrency(kpis.totalCommissionEarned || 0)}
              prefix={<RiMoneyDollarCircleLine className="text-[#10B981]" size={18} />}
              valueStyle={{ color: COLORS.success, fontWeight: 700, fontSize: 28 }}
            />
            <div className="text-xs text-gray-400 mt-1">Confirmed earnings</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            <Statistic
              title={<span className="text-gray-500 text-xs uppercase tracking-wide">Pending Payout</span>}
              value={formatCurrency(kpis.pendingCommission || 0)}
              prefix={<RiWalletLine className="text-[#F97316]" size={18} />}
              valueStyle={{ color: COLORS.warning, fontWeight: 700, fontSize: 28 }}
            />
            <Tag color="orange" className="mt-2 text-xs">Awaiting disbursement</Tag>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Lead Status Breakdown - Pie Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="font-bold text-gray-800">Referral Pipeline</span>}
            bordered={false}
            className="rounded-2xl shadow-sm h-full"
            extra={<Tag color="purple">{timeFilter}</Tag>}
          >
            {pieData.length === 0 ? (
              <Empty description="No leads data available" className="py-12" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Leads']} />
                  <Legend verticalAlign="bottom" height={40} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Performance Metrics */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="font-bold text-gray-800">Performance Scorecard</span>}
            bordered={false}
            className="rounded-2xl shadow-sm h-full"
          >
            <Row gutter={[16, 24]}>
              <Col span={12}>
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">Qualification Rate</Text>
                  <div className="text-3xl font-bold mt-2" style={{ color: COLORS.primary }}>
                    {((kpis.conversionRate ?? 0) || performance.qualificationRate || 0).toFixed(1)}%
                  </div>
                  <Progress
                    percent={((kpis.conversionRate ?? 0) || performance.qualificationRate || 0)}
                    size="small"
                    strokeColor={COLORS.primary}
                    showInfo={false}
                    className="mt-2"
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">Disbursement Rate</Text>
                  <div className="text-3xl font-bold mt-2" style={{ color: COLORS.success }}>
                    {((performance.disbursementRate ?? 0)).toFixed(1)}%
                  </div>
                  <Progress
                    percent={(performance.disbursementRate ?? 0)}
                    size="small"
                    strokeColor={COLORS.success}
                    showInfo={false}
                    className="mt-2"
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">Avg Commission / Case</Text>
                  <div className="text-xl font-bold mt-2" style={{ color: COLORS.warning }}>
                    {formatCurrency(performance.avgCommissionPerCase || 0)}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 rounded-xl bg-gray-50">
                  <Text className="text-gray-500 text-xs uppercase tracking-wide">Disbursed Cases</Text>
                  <div className="text-xl font-bold mt-2" style={{ color: COLORS.success }}>
                    {kpis.disbursedLeads || 0}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        {/* Leads Over Time */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="font-bold text-gray-800">Referrals Trend</span>}
            bordered={false}
            className="rounded-2xl shadow-sm"
          >
            {leadsOverTimeData.length === 0 ? (
              <Empty description="No referral data for this period" className="py-12" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={leadsOverTimeData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={BRAND} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Leads" stroke={BRAND} strokeWidth={2.5} fill="url(#leadGrad)" name="New Referrals" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Commission Trend */}
        <Col xs={24} lg={12}>
          <Card
            title={<span className="font-bold text-gray-800">Commission Trend</span>}
            bordered={false}
            className="rounded-2xl shadow-sm"
          >
            {commissionTrendData.length === 0 ? (
              <Empty description="No commission data available" className="py-12" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={commissionTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `AED ${v/1000}K`} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Commission']} labelFormatter={(label) => `Date: ${label}`} />
                  <Line type="monotone" dataKey="Commission" stroke={COLORS.success} strokeWidth={2.5} dot={{ fill: COLORS.success, r: 4 }} name="Commission Earned" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Leads Section */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card
            title={<span className="font-bold text-gray-800">Recent Referrals</span>}
            bordered={false}
            className="rounded-2xl shadow-sm"
            extra={<Button type="link" className="text-[#5C039B]">View All</Button>}
          >
            {recentLeads.length === 0 ? (
              <Empty description="No recent referrals found" className="py-12" />
            ) : (
              <List
                dataSource={recentLeads}
                renderItem={(lead) => (
                  <List.Item
                    className="hover:bg-gray-50 rounded-xl transition-colors px-4"
                    actions={[
                      getStatusTag(lead.currentStatus),
                      <Text className="text-xs text-gray-400">
                        <RiTimeLine className="inline mr-1" size={12} />
                        {dayjs(lead.createdAt).format('DD MMM YYYY')}
                      </Text>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ background: BRAND_GRADIENT }}
                          icon={<RiUserAddLine size={18} />}
                        />
                      }
                      title={<Text strong className="text-gray-800">{lead.customerName || 'Customer'}</Text>}
                      description={
                        <Space split={<span className="text-gray-300">•</span>}>
                          <Text className="text-xs text-gray-500">
                            Mobile: {lead.mobileNumber || 'N/A'}
                          </Text>
                          <Text className="text-xs font-semibold" style={{ color: COLORS.success }}>
                            {formatCurrency(lead.propertyValue)}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      {/* <Row gutter={[16, 16]} className="mt-8">
        <Col xs={24} sm={8}>
          <Button
            block
            size="large"
            icon={<RiCalculatorLine size={18} />}
            className="h-14 text-base font-medium border-[#5C039B] text-[#5C039B] hover:bg-[#5C039B] hover:text-white rounded-xl"
          >
            Mortgage Calculator
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button
            block
            size="large"
            icon={<RiTrophyLine size={18} />}
            className="h-14 text-base font-medium border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white rounded-xl"
          >
            Leaderboard
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button
            block
            size="large"
            type="primary"
            icon={<RiUserAddLine size={18} />}
            className="h-14 text-base font-medium rounded-xl"
            style={{ background: BRAND_GRADIENT, border: 'none' }}
          >
            Refer New Lead
          </Button>
        </Col>
      </Row> */}

      {/* Scoped Styles */}
      <style jsx>{`
        .ant-card { border-radius: 16px !important; }
        .ant-statistic-title { margin-bottom: 8px !important; }
        .ant-progress-bg { border-radius: 99px !important; }
      `}</style>
    </div>
  );
};

export default VaultAgentDashboard;