import { useCallback, useEffect, useState } from "react";
import {
  Card, Empty, Progress, Spin, Tag, Tabs, Typography, message,
} from "antd";
import {
  ArrowDownOutlined, ArrowUpOutlined, CalendarOutlined,
  CheckCircleOutlined, FunnelPlotOutlined, RiseOutlined, TeamOutlined,
} from "@ant-design/icons";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const THEME = {
  primary: '#5C039B',
  primaryLight: '#f3e8ff',
};

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

const RANGE_TABS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'annual', label: 'Annual' },
];

const AdvisorLeaderboard = () => {
  const [range, setRange] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get("gridadvisor/me/leaderboard", { params: { range } });
      setData(res?.data || null);
    } catch (err) {
      console.error("Failed to fetch advisor leaderboard", err);
      message.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
  const tenureMonths = data?.advisor?.tenure_months ?? null;

  return (
    <Spin spinning={loading}>
      <div style={{ minHeight: '100vh', background: '#f6f8fb', padding: '16px 20px' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary" style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
            Advisor Performance
          </Text>
          <Title level={3} style={{ margin: '2px 0 4px', fontWeight: 900, color: '#0f172a' }}>
            My Leaderboard & Stats
          </Title>
          <Text type="secondary">
            Your personal performance overview. Score updates as you process and close leads.
            {data?.advisor?.employeeId && (
              <span style={{ marginLeft: 8 }}>
                {/* <Tag color="purple">{data.advisor.employeeId}</Tag> */}
              </span>
            )}
            {data?.advisor?.department && (
              <Tag style={{ marginLeft: 4 }}>{data.advisor.department}</Tag>
            )}
          </Text>
        </div>

        {/* ── Period Tabs ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <Tabs
            activeKey={range}
            onChange={setRange}
            items={RANGE_TABS}
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>

        {/* ── Performance Score Card ───────────────────────────────── */}
        <Card
          style={{ borderRadius: 10, border: '1px solid #e8edf5', boxShadow: '0 6px 20px rgba(15,23,42,0.04)', marginBottom: 20 }}
          bodyStyle={{ padding: 20 }}
        >
          <Title level={5} style={{ margin: '0 0 14px', color: '#0f172a' }}>
            Performance Score
          </Title>

          <div style={{
            background: THEME.primaryLight, border: `1px solid #d8b4fe`,
            borderRadius: 8, padding: '8px 14px', marginBottom: 16, fontSize: 12, color: THEME.primary,
          }}>
            Score = Leads Converted (30%) + Conversion Rate (40%) + Tenure on Platform (30%)
            {tenureMonths !== null && (
              <span style={{ marginLeft: 8, fontWeight: 600 }}>
                · Your tenure: {tenureMonths} month{tenureMonths !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Progress band */}
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
            <Progress
              percent={current.progress_score || 0}
              strokeColor={isUp ? '#16a34a' : '#dc2626'}
              trailColor="#e5e7eb"
            />
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 12 }}>
            <StatCard icon={<TeamOutlined />} label="Total Leads" value={current.total_leads || 0} change={trend.leads_change} />
            <StatCard icon={<CheckCircleOutlined />} label="Conversion Rate" value={`${current.conversion_rate || 0}%`} change={trend.conversion_change} changeSuffix=" pts" />
            <StatCard icon={<RiseOutlined />} label="Converted Leads" value={current.converted_leads || 0} change={trend.converted_change} />
          </div>

          {/* Current vs previous */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            {[
              { label: 'This period', d: current },
              { label: 'Previous period', d: previous },
            ].map(({ label, d }) => (
              <div key={label} style={{ borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', padding: 12 }}>
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>{label}</Text>
                <Text strong style={{ fontSize: 13 }}>
                  {d.total_leads || 0} leads · {d.converted_leads || 0} converted · {d.active_leads || 0} active
                </Text>
              </div>
            ))}
          </div>
        </Card>

        {/* ── My Stats ──────────────────────────────────────────────── */}
        <Card
          style={{ borderRadius: 10, border: '1px solid #e8edf5', boxShadow: '0 6px 20px rgba(15,23,42,0.04)', marginBottom: 20 }}
          bodyStyle={{ padding: 20 }}
        >
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

            {/* Bar chart: Leads by month */}
            <div>
              <Text strong style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 10 }}>
                Leads by Month
              </Text>
              {leadsByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={leadsByMonth} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} width={28} />
                    <Tooltip
                      formatter={(val, name) => [val, name === 'leads' ? 'Leads' : 'Converted']}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="leads" name="Leads" fill={THEME.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="conversions" name="Converted" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No monthly data yet" style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} />
              )}
            </div>

            {/* Donut chart: Lead status breakdown */}
            <div>
              <Text strong style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 10 }}>
                Lead Status Breakdown
              </Text>
              {statusBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="count"
                      nameKey="label"
                      labelLine={false}
                      label={DonutLabel}
                    >
                      {statusBreakdown.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [val, name]}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: 12, lineHeight: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No lead data yet" style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} />
              )}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <FunnelPlotOutlined style={{ color: THEME.primary, fontSize: 16 }} />
              <Text strong style={{ fontSize: 13, color: '#374151' }}>Conversion Funnel</Text>
              {funnelTotal > 0 && (
                <Tag color="purple" style={{ marginLeft: 4 }}>{funnelTotal} leads entered</Tag>
              )}
            </div>
            {funnel.length > 0 ? (
              <div>
                {funnel.map((stage, idx) => (
                  <FunnelBar
                    key={stage.stage}
                    label={stage.label}
                    count={stage.count}
                    total={funnelTotal}
                    color={FUNNEL_COLORS[idx] || '#94a3b8'}
                  />
                ))}
              </div>
            ) : (
              <Empty description="No funnel data yet" />
            )}
          </div>
        </Card>

        {/* ── Activity Trend Chart ──────────────────────────────────── */}
        <Card
          style={{ borderRadius: 10, border: '1px solid #e8edf5', boxShadow: '0 6px 20px rgba(15,23,42,0.04)' }}
          bodyStyle={{ padding: 20 }}
        >
          <Title level={5} style={{ margin: '0 0 16px', color: '#0f172a' }}>
            Activity Trend — {RANGE_TABS.find(t => t.key === range)?.label}
          </Title>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="advisorLeadsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} width={28} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="leads" stroke={THEME.primary} fill="url(#advisorLeadsFill)" strokeWidth={2} name="Leads" />
                <Area type="monotone" dataKey="conversions" stroke="#16a34a" fill="#dcfce720" strokeWidth={2} name="Converted" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No trend data for this period" />
          )}
        </Card>

      </div>
    </Spin>
  );
};

export default AdvisorLeaderboard;
