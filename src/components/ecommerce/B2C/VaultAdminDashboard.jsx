import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";
import {
  Users, UserCheck, FolderOpen, TrendingUp, Clock, Handshake,
  Building2, AlertCircle, RefreshCw, Calendar, Target, Award,
  Zap, Shield, Activity, DollarSign, ArrowUpRight, Layers,
} from "lucide-react";
import {
  Spin, message, Tabs, Badge, Button, Tag, Alert, DatePicker,
  Segmented, Statistic, Card, Row, Col, Progress, Space, Avatar,
} from "antd";
import dayjs from "dayjs";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { RangePicker } = DatePicker;

/* ─── Brand Colors ───────────────────────────────────────────── */
const BRAND          = "#5C039B";
const BRAND_GRADIENT = "linear-gradient(135deg, #5C039B 0%, #8B5CF6 100%)";
const PIE_COLORS     = [BRAND, "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

/* ─── Helpers ────────────────────────────────────────────────── */
const formatCurrency = (v) => {
  if (!v && v !== 0) return "AED 0";
  if (v >= 1_000_000_000) return `AED ${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000)     return `AED ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `AED ${(v / 1_000).toFixed(0)}K`;
  return `AED ${v.toLocaleString()}`;
};

const fmtLabel = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

const fmtChartDate = (ds, filter) => {
  const d = new Date(ds);
  if (filter === "week")  return d.toLocaleDateString("en-US", { weekday: "short" });
  if (filter === "today") return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ─── Reusable Stat Card ─────────────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, colorTheme = "purple", suffix = "", trend, loading }) => {
  const themes = {
    purple: "text-[#5C039B] bg-[#5C039B]/10 border-[#5C039B]/20",
    green:  "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue:   "text-blue-600 bg-blue-50 border-blue-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    red:    "text-red-600 bg-red-50 border-red-100",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
  };
  const cls = themes[colorTheme] || themes.purple;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all duration-300 group hover:border-[#5C039B]/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 ${cls}`}>
          {loading ? <Spin size="small" /> : <Icon size={22} />}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 group-hover:text-[#5C039B] transition-colors">
            {loading ? "—" : typeof value === "number" ? value.toLocaleString() : (value ?? 0)}
          </span>
          {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
        </div>
        {trend && <p className="text-xs text-gray-400 mt-2">{trend}</p>}
      </div>
    </div>
  );
};

/* ─── Custom Tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, suffix = "", prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-4 py-3 text-sm">
      <p className="font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || BRAND }} className="font-bold text-base">
          {prefix}{p.value?.toLocaleString()}{suffix}
        </p>
      ))}
    </div>
  );
};

/* ─── Pipeline Status Cell ───────────────────────────────────── */
const PipelineCell = ({ label, count, accent }) => (
  <div
    className={`p-3 rounded-xl text-center transition-all ${count > 0 ? "shadow-sm border" : "bg-gray-50 opacity-60"}`}
    style={count > 0 ? { background: `${accent}0d`, borderColor: `${accent}30` } : {}}
  >
    <div className="text-xl font-bold" style={{ color: count > 0 ? accent : "#CBD5E1" }}>{count}</div>
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-1 leading-tight">{label}</div>
  </div>
);

/* ═══════════════════ MAIN COMPONENT ════════════════════════ */
const VaultAdminDashboard = () => {
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState("month");
  const [dateRange,  setDateRange]  = useState(null);

  /* ── API Fetch ── */
  const fetchStats = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const params = new URLSearchParams();
      if (timeFilter !== "custom") {
        params.set("range", timeFilter);
      } else if (dateRange?.[0] && dateRange?.[1]) {
        params.set("fromDate", dateRange[0].format("YYYY-MM-DD"));
        params.set("toDate",   dateRange[1].format("YYYY-MM-DD"));
      }

      const res = await apiService.get(`/vault/statistics/admin/stats?${params.toString()}`);

      if (res?.data) {
        setStats(res.data);
      } else {
        message.error("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      message.error(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeFilter, dateRange]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ── Derived Data ── */
  const kpis   = stats?.kpis              ?? {};
  const graphs  = stats?.graphs            ?? {};
  const ops    = stats?.opsMonitoring      ?? {};
  const adv    = stats?.advisorMonitoring  ?? {};

  /* Build unified date set for timeline (merge leads + cases dates) */
  const allDates = [...new Set([
    ...(graphs.leadsOverTime ?? []).map((d) => d.date),
    ...(graphs.casesOverTime ?? []).map((d) => d.date),
  ])].sort();

  const timelineData = allDates.map((date) => ({
    name: fmtChartDate(date, timeFilter),
    Leads: (graphs.leadsOverTime ?? []).find((d) => d.date === date)?.count ?? 0,
    Cases: (graphs.casesOverTime ?? []).find((d) => d.date === date)?.count ?? 0,
  }));

  const leadsOverTimeData = (graphs.leadsOverTime ?? []).map((d) => ({
    name: fmtChartDate(d.date, timeFilter),
    Leads: d.count,
  }));

  const disbursementData = (graphs.disbursementsOverTime ?? []).map((d) => ({
    name: fmtChartDate(d.date, timeFilter),
    "Amount (M)": +(d.totalAmount / 1_000_000).toFixed(2),
    Count: d.count,
  }));

  /* ── Loading screen ── */
  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center flex-col gap-4">
        <Spin size="large" />
        <p style={{ color: BRAND }} className="font-semibold tracking-wide">Loading VAULT Intelligence…</p>
      </div>
    );
  }

  /* ══════════════════ TAB ITEMS ══════════════════ */
  const tabItems = [

    /* ─── OVERVIEW ─────────────────────────────── */
    {
      key: "overview",
      label: <span className="flex items-center gap-2"><TrendingUp size={15} /> Overview</span>,
      children: (
        <div className="space-y-6">

          {/* KPI Row */}
          <Row gutter={[16, 16]}>
            {[
              { title: "Total Leads",     value: kpis.totalLeads,             icon: Target,       colorTheme: "blue",   trend: `Conversion: ${(kpis.leadToCaseConversionRate ?? 0).toFixed(1)}%` },
              { title: "Active Cases",    value: kpis.activeCases,            icon: FolderOpen,   colorTheme: "orange" },
              { title: "Disbursed Cases", value: kpis.disbursedCases,         icon: DollarSign,   colorTheme: "green" },
              { title: "Pending Cases",   value: kpis.pendingCases,           icon: Clock,        colorTheme: "yellow" },
              { title: "SLA Breached",    value: kpis.slaBreachedLeads,       icon: AlertCircle,  colorTheme: "red" },
            ].map((p) => (
              <Col key={p.title} xs={24} sm={12} lg={5}>
                <StatCard {...p} loading={loading} />
              </Col>
            ))}
          </Row>

          {/* SLA Alert Banner */}
          {kpis.slaBreachedLeads > 0 && !loading && (
            <Alert
              message={<span className="font-bold">SLA Breach Alert</span>}
              description={`${kpis.slaBreachedLeads} lead${kpis.slaBreachedLeads > 1 ? "s" : ""} have exceeded the standard processing timeframe. Immediate attention required.`}
              type="error"
              showIcon
              action={<Button size="small" danger>Review Queue</Button>}
              className="rounded-xl"
            />
          )}

          {/* Activity Timeline + Ops Monitoring */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card className="rounded-2xl shadow-sm" bordered={false}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 m-0">Activity Timeline</h3>
                    <p className="text-xs text-gray-400 mt-1 m-0">Leads &amp; Cases trend</p>
                  </div>
                  <Tag color="purple">{timeFilter}</Tag>
                </div>
                {timelineData.length === 0
                  ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data for this period</div>
                  : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                        <Line type="monotone" dataKey="Leads" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 3 }} />
                        <Line type="monotone" dataKey="Cases" stroke={BRAND}   strokeWidth={2.5} dot={{ fill: BRAND,    r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )
                }
              </Card>
            </Col>

            {/* Ops + Advisor side panels */}
            <Col xs={24} lg={8}>
              <div className="flex flex-col gap-4 h-full">
                <Card className="rounded-2xl shadow-sm" bordered={false}>
                  <h3 className="text-sm font-bold text-gray-700 mb-4 m-0 uppercase tracking-wider">Ops Monitoring</h3>
                  <Row gutter={[12, 12]}>
                    {[
                      { label: "Queue",  value: ops.queueCount,  color: BRAND     },
                      { label: "Urgent", value: ops.urgentCount, color: "#EF4444" },
                    ].map(({ label, value, color }) => (
                      <Col key={label} span={12}>
                        <div className="rounded-xl p-4 text-center" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                          <div className="text-2xl font-black" style={{ color }}>{value ?? 0}</div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mt-1">{label}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>

                <Card className="rounded-2xl shadow-sm" bordered={false}>
                  <h3 className="text-sm font-bold text-gray-700 mb-4 m-0 uppercase tracking-wider">Advisor Monitoring</h3>
                  <Row gutter={[12, 12]}>
                    {[
                      { label: "Available",  value: adv.availableAdvisors,  color: "#10B981" },
                      { label: "Overloaded", value: adv.overloadedAdvisors, color: "#F59E0B" },
                    ].map(({ label, value, color }) => (
                      <Col key={label} span={12}>
                        <div className="rounded-xl p-4 text-center" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                          <div className="text-2xl font-black" style={{ color }}>{value ?? 0}</div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mt-1">{label}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </div>
            </Col>
          </Row>

          {/* Lead Funnel + Source Distribution */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card className="rounded-2xl shadow-sm" bordered={false}>
                <h3 className="text-base font-bold text-gray-900 mb-5 m-0">Lead Funnel</h3>
                <Space direction="vertical" className="w-full" size="large">
                  {[
                    { label: "New",       count: stats?.leadStatus?.new,       color: "#3B82F6" },
                    { label: "Contacted", count: stats?.leadStatus?.contacted,  color: "#8B5CF6" },
                    { label: "Qualified", count: stats?.leadStatus?.qualified,  color: BRAND },
                    { label: "Disbursed", count: stats?.leadStatus?.disbursed,  color: "#10B981" },
                  ].map(({ label, count, color }) => {
                    const total = kpis.totalLeads || 1;
                    const pct   = Math.min(100, Math.round(((count ?? 0) / total) * 100));
                    return (
                      <div key={label}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">{label}</span>
                          <span className="text-sm font-bold text-gray-900">
                            {count ?? 0} <span className="text-gray-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <Progress percent={pct} strokeColor={color} showInfo={false} />
                      </div>
                    );
                  })}
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card className="rounded-2xl shadow-sm" bordered={false}>
                <h3 className="text-base font-bold text-gray-900 mb-2 m-0">Lead Source Distribution</h3>
                {(graphs.leadsBySource ?? []).length === 0
                  ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No source data</div>
                  : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={graphs.leadsBySource}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={90}
                          paddingAngle={5} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {(graphs.leadsBySource ?? []).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )
                }
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },

    /* ─── LEADS ─────────────────────────────────── */
    {
      key: "leads",
      label: <span className="flex items-center gap-2"><UserCheck size={15} /> Leads Management</span>,
      children: (
        <div className="space-y-6">

          <Row gutter={[16, 16]}>
            {[
              { title: "Total Leads",     value: kpis.totalLeads,                                           icon: Target,       colorTheme: "blue" },
              { title: "Conversion Rate", value: `${(kpis.leadToCaseConversionRate ?? 0).toFixed(1)}%`,     icon: Zap,          colorTheme: "green" },
              { title: "Disbursed",       value: kpis.disbursedCases,                                       icon: DollarSign,   colorTheme: "purple" },
              { title: "SLA Breached",    value: kpis.slaBreachedLeads,                                     icon: AlertCircle,  colorTheme: "red" },
            ].map((p) => (
              <Col key={p.title} xs={24} sm={12} lg={6}>
                <StatCard {...p} loading={loading} />
              </Col>
            ))}
          </Row>

          {/* Lead Status Breakdown */}
          <Card className="rounded-2xl shadow-sm" bordered={false}>
            <h3 className="text-base font-bold text-gray-900 mb-4 m-0">Lead Status Breakdown</h3>
            <Row gutter={[10, 10]}>
              {Object.entries(stats?.leadStatus ?? {}).map(([key, count], i) => (
                <Col key={key} xs={12} sm={8} md={6} lg={4}>
                  <div
                    className={`p-4 rounded-xl text-center transition-all hover:scale-105 cursor-pointer ${count > 0 ? "border" : "bg-gray-50 opacity-60"}`}
                    style={count > 0 ? { background: `${PIE_COLORS[i % PIE_COLORS.length]}0d`, borderColor: `${PIE_COLORS[i % PIE_COLORS.length]}30` } : {}}
                  >
                    <div className="text-2xl font-black" style={{ color: count > 0 ? PIE_COLORS[i % PIE_COLORS.length] : "#CBD5E1" }}>{count}</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-2">{fmtLabel(key)}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Leads Over Time */}
          <Card className="rounded-2xl shadow-sm" bordered={false}>
            <h3 className="text-base font-bold text-gray-900 mb-4 m-0">Leads Over Time</h3>
            {leadsOverTimeData.length === 0
              ? <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data for this period</div>
              : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={leadsOverTimeData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Leads" stroke="#3B82F6" strokeWidth={2.5} fill="url(#leadGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )
            }
          </Card>
        </div>
      ),
    },

    /* ─── APPLICATIONS ──────────────────────────── */
    {
      key: "applications",
      label: <span className="flex items-center gap-2"><FolderOpen size={15} /> Applications</span>,
      children: (
        <div className="space-y-6">

          <Row gutter={[16, 16]}>
            {[
              { title: "Active Cases",  value: kpis.activeCases,                        icon: FolderOpen,  colorTheme: "orange" },
              { title: "Disbursed",     value: kpis.disbursedCases,                     icon: DollarSign,  colorTheme: "green"  },
              { title: "Pending",       value: kpis.pendingCases,                       icon: Clock,       colorTheme: "yellow" },
              { title: "At Bank",       value: stats?.caseStatus?.bankApplication ?? 0, icon: Building2,   colorTheme: "blue"   },
            ].map((p) => (
              <Col key={p.title} xs={24} sm={12} lg={6}>
                <StatCard {...p} loading={loading} />
              </Col>
            ))}
          </Row>

          {/* Case Pipeline */}
          <Card className="rounded-2xl shadow-sm" bordered={false}>
            <h3 className="text-base font-bold text-gray-900 mb-4 m-0">Application Pipeline</h3>
            <Row gutter={[10, 10]}>
              {Object.entries(stats?.caseStatus ?? {}).map(([key, count]) => {
                const accent =
                  key === "disbursed"                           ? "#10B981" :
                  key === "rejected" || key === "lost"          ? "#EF4444" :
                  key === "bankApplication"                     ? "#3B82F6" : BRAND;
                return (
                  <Col key={key} xs={12} sm={8} md={6} lg={4} xl={3}>
                    <PipelineCell label={fmtLabel(key)} count={count} accent={accent} />
                  </Col>
                );
              })}
            </Row>
          </Card>

          {/* Disbursement Chart + Summary */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card className="rounded-2xl shadow-sm" bordered={false}>
                <h3 className="text-base font-bold text-gray-900 mb-4 m-0">
                  Disbursement Volume <span className="text-gray-400 font-normal text-sm">(AED Millions)</span>
                </h3>
                {disbursementData.length === 0
                  ? <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No disbursements in this period</div>
                  : (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={disbursementData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="disbGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip suffix=" M AED" />} />
                        <Area type="monotone" dataKey="Amount (M)" stroke="#10B981" strokeWidth={2.5} fill="url(#disbGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )
                }
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <div className="flex flex-col gap-4 h-full">
                <Card className="rounded-2xl shadow-sm flex-1" bordered={false}>
                  <div className="text-center py-4">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                      style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}
                    >
                      <DollarSign className="text-white" size={36} />
                    </div>
                    <Statistic
                      title="Cases Disbursed"
                      value={loading ? "—" : (kpis.disbursedCases ?? 0)}
                      valueStyle={{ color: "#10B981", fontSize: 36, fontWeight: 800 }}
                    />
                    <p className="text-gray-400 text-sm mt-2 mb-4">Successfully completed</p>
                    <Button
                      type="primary"
                      className="rounded-xl px-8 w-full"
                      style={{ background: BRAND_GRADIENT, border: "none" }}
                    >
                      View Report
                    </Button>
                  </div>
                </Card>

                <Card className="rounded-2xl shadow-sm" bordered={false}>
                  <Row gutter={12}>
                    {[
                      { label: "At Bank",  value: stats?.caseStatus?.bankApplication ?? 0, color: "#3B82F6" },
                      { label: "Rejected", value: stats?.caseStatus?.rejected ?? 0,        color: "#EF4444" },
                    ].map(({ label, value, color }) => (
                      <Col key={label} span={12}>
                        <div
                          className="rounded-xl p-4 text-center"
                          style={{ background: `${color}0d`, border: `1px solid ${color}25` }}
                        >
                          <div className="text-2xl font-black" style={{ color }}>{value}</div>
                          <div className="text-xs font-semibold text-gray-500 uppercase mt-1">{label}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      ),
    },

    /* ─── NETWORK ───────────────────────────────── */
    {
      key: "network",
      label: <span className="flex items-center gap-2"><Users size={15} /> Network</span>,
      children: (
        <div className="space-y-6">

          <Row gutter={[16, 16]}>
            {[
              { title: "Referral Partners", value: kpis.totalFreelanceAgents, icon: Handshake,  color: BRAND     },
              { title: "Partners",          value: kpis.totalPartners,        icon: Building2,  color: "#3B82F6" },
              { title: "Advisors",          value: kpis.totalAdvisors,        icon: Users,      color: "#10B981" },
              { title: "Ops Executives",    value: kpis.totalOpsExecutives,   icon: Shield,     color: "#F59E0B" },
            ].map(({ title, value, icon: Icon, color }) => (
              <Col key={title} xs={24} sm={12} lg={6}>
                <Card className="rounded-2xl shadow-sm text-center hover:shadow-md transition-all" bordered={false}>
                  <Avatar size={64} icon={<Icon size={28} />} style={{ backgroundColor: color }} className="mx-auto mb-3" />
                  <Statistic
                    title={title}
                    value={loading ? "—" : (value ?? 0)}
                    valueStyle={{ color, fontSize: 32, fontWeight: 800 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Network Breakdown */}
          <Card className="rounded-2xl shadow-sm" bordered={false}>
            {(() => {
              const total =
                (kpis.totalFreelanceAgents ?? 0) +
                (kpis.totalPartners        ?? 0) +
                (kpis.totalAdvisors        ?? 0) +
                (kpis.totalOpsExecutives   ?? 0);
              return (
                <>
                  <h3 className="text-base font-bold text-gray-900 mb-5 m-0">Total Network: {total}</h3>
                  <Space direction="vertical" className="w-full" size="large">
                    {[
                      { label: "Referral Partners", value: kpis.totalFreelanceAgents, color: BRAND     },
                      { label: "Partners",          value: kpis.totalPartners,        color: "#3B82F6" },
                      { label: "Advisors",          value: kpis.totalAdvisors,        color: "#10B981" },
                      { label: "Ops Executives",    value: kpis.totalOpsExecutives,   color: "#F59E0B" },
                    ].map(({ label, value, color }) => {
                      const pct = total > 0 ? Math.round(((value ?? 0) / total) * 100) : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">{label}</span>
                            <span className="text-sm font-bold text-gray-900">
                              {value ?? 0} <span className="text-gray-400 font-normal">({pct}%)</span>
                            </span>
                          </div>
                          <Progress percent={pct} strokeColor={color} showInfo={false} />
                        </div>
                      );
                    })}
                  </Space>
                </>
              );
            })()}
          </Card>

          {/* Advisor + Ops Monitoring detail */}
          <Row gutter={[16, 16]}>
            {[
              { label: "Available Advisors",  value: adv.availableAdvisors,  color: "#10B981", icon: UserCheck    },
              { label: "Overloaded Advisors", value: adv.overloadedAdvisors, color: "#EF4444", icon: AlertCircle  },
              { label: "Ops Queue",           value: ops.queueCount,         color: BRAND,     icon: Layers       },
              { label: "Urgent Items",        value: ops.urgentCount,        color: "#F59E0B", icon: Zap          },
            ].map(({ label, value, color, icon: Icon }) => (
              <Col key={label} xs={24} sm={12} lg={6}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                  <div
                    className="rounded-xl w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    {loading
                      ? <div className="w-10 h-6 bg-gray-100 rounded animate-pulse" />
                      : <div className="text-2xl font-black" style={{ color }}>{value ?? 0}</div>
                    }
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">{label}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
  ];

  /* ══════════════════ RENDER ══════════════════ */
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
                  <Activity className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight m-0">VAULT Intelligence</h1>
              </div>
              <p className="text-sm text-gray-400 font-medium ml-[52px] m-0">Real-time metrics &amp; operational overview</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Segmented
                options={[
                  { label: "Today",  value: "today"  },
                  { label: "Week",   value: "week"   },
                  { label: "Month",  value: "month"  },
                  { label: "Custom", value: "custom" },
                ]}
                value={timeFilter}
                onChange={setTimeFilter}
                className="font-semibold"
              />

              {timeFilter === "custom" && (
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="rounded-lg"
                  placeholder={["Start Date", "End Date"]}
                />
              )}

              <Button
                icon={<RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />}
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

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={tabItems}
        className="vault-tabs"
        tabBarStyle={{ marginBottom: 24 }}
      />

      {/* Scoped Styles */}
      <style>{`
        .vault-tabs .ant-tabs-ink-bar { background: ${BRAND}; height: 3px; border-radius: 3px 3px 0 0; }
        .vault-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: ${BRAND} !important; font-weight: 700; }
        .vault-tabs .ant-tabs-tab:hover { color: ${BRAND}; }
        .vault-tabs .ant-tabs-tab { font-size: 13px; font-weight: 600; color: #64748B; padding: 10px 0; margin-right: 28px; }
        .ant-progress-bg { height: 8px !important; border-radius: 99px !important; }
        .ant-card { border-radius: 16px !important; }
        .ant-segmented-item-selected { color: ${BRAND} !important; font-weight: 700; }
      `}</style>
    </div>
  );
};

export default VaultAdminDashboard;