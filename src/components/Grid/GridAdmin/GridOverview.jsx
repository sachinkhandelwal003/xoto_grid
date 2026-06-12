import React, { useState, useEffect } from "react";
import {
  Card, Row, Col, Select, DatePicker, Button, Spin, Empty, Tooltip, Statistic
} from "antd";
import {
  ReloadOutlined, RiseOutlined, HomeOutlined, EyeOutlined,
  HeartOutlined, TeamOutlined, BarChartOutlined, ArrowUpOutlined, ArrowDownOutlined
} from "@ant-design/icons";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend
} from "recharts";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const P       = "#5C039B";
const PM      = "#7C3AED";
const PL      = "#F5F0FF";
const COLORS  = ["#5C039B","#7C3AED","#3B82F6","#10B981","#F59E0B","#EF4444","#EC4899","#6B7280"];

/* ── Stat Card ── */
const StatCard = ({ label, value, prefix = "", suffix = "", color = P, bg = PL, icon, change, tip }) => (
  <Tooltip title={tip}>
    <div style={{ background: bg, borderRadius: 14, padding: "18px 20px", border: "1px solid #ede9f6", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
        <span style={{ fontSize: 20, color }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>
        {prefix}{typeof value === "number" ? value.toLocaleString() : (value ?? "—")}{suffix}
      </div>
      {change !== undefined && (
        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: change >= 0 ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
          {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(change)}% vs last period
        </div>
      )}
    </div>
  </Tooltip>
);

export default function GridOverview() {
  const [loading, setLoading]   = useState(false);
  const [data, setData]         = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [period, setPeriod]     = useState("monthly");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (dateRange?.[0]) params.append("dateFrom", dateRange[0].format("YYYY-MM-DD"));
      if (dateRange?.[1]) params.append("dateTo",   dateRange[1].format("YYYY-MM-DD"));

      const res = await apiService.get(`/properties/analytics/overview?${params}`);
      if (res?.success) setData(res.data);
    } catch (err) {
      console.error("Overview fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('grid_token') || localStorage.getItem('token');
    if (token) fetchData();
  }, [period]);

  /* ── Fallback demo data when API returns nothing ── */
  const stats = data?.stats || {
    totalListings: 0, activeListings: 0, pendingApproval: 0,
    totalViews: 0, totalWishlisted: 0, totalLeads: 0,
    newThisMonth: 0, soldThisMonth: 0,
  };

  const trendData   = data?.trend   || [];
  const statusData  = data?.byStatus|| [];
  const typeData    = data?.byType  || [];
  const topProps    = data?.topProperties || [];

  return (
    <div style={{ background: "#F4F0FA", minHeight: "100vh", padding: "28px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a0533", margin: 0 }}>Overview</h1>
            <p style={{ fontSize: 13, color: "#8B7BAE", margin: "4px 0 0" }}>
              High-level snapshot of your property listings and engagement.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Select value={period} onChange={setPeriod} style={{ width: 130 }}>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ borderRadius: 8 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              style={{ borderRadius: 8, borderColor: "#ede9f6", color: P }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, flexDirection: "column", gap: 16 }}>
            <Spin size="large" />
            <span style={{ color: "#8B7BAE", fontSize: 13 }}>Loading overview data...</span>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
              {[
                { label: "Total Listings",    value: stats.totalListings,    icon: <HomeOutlined />,   color: P,         bg: PL,         tip: "All properties ever created" },
                { label: "Active Listings",   value: stats.activeListings,   icon: <RiseOutlined />,   color: "#059669", bg: "#ecfdf5",  tip: "Currently approved & active" },
                { label: "Pending Approval",  value: stats.pendingApproval,  icon: <BarChartOutlined />,color: "#d97706", bg: "#fffbeb", tip: "Awaiting admin review" },
                { label: "Total Views",       value: stats.totalViews,       icon: <EyeOutlined />,    color: "#2563eb", bg: "#eff6ff",  tip: "Total listing page views" },
                { label: "Total Wishlisted",  value: stats.totalWishlisted,  icon: <HeartOutlined />,  color: "#db2777", bg: "#fdf2f8",  tip: "Times saved by customers" },
                { label: "Leads Generated",   value: stats.totalLeads,       icon: <TeamOutlined />,   color: "#7c3aed", bg: "#f5f3ff",  tip: "Leads linked to properties" },
                { label: "New This Month",    value: stats.newThisMonth,     icon: <RiseOutlined />,   color: "#0891b2", bg: "#ecfeff",  tip: "Listings added this month" },
                { label: "Sold This Month",   value: stats.soldThisMonth,    icon: <BarChartOutlined />,color: "#16a34a", bg: "#f0fdf4", tip: "Units marked sold this month" },
              ].map(s => (
                <Col xs={12} sm={8} md={6} lg={3} key={s.label}>
                  <StatCard {...s} />
                </Col>
              ))}
            </Row>

            {/* ── Trend + Status Breakdown ── */}
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
              <Col xs={24} lg={15}>
                <Card
                  title={<span style={{ fontWeight: 700, color: P }}>Listing Activity Trend</span>}
                  bordered={false}
                  style={{ borderRadius: 16, border: "1px solid #ede9f6", height: "100%" }}
                >
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={PM} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={PM} stopOpacity={0}    />
                          </linearGradient>
                          <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                        <ChartTooltip contentStyle={{ borderRadius: 8, border: "1px solid #ede9f6" }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="newListings" stroke={PM}        strokeWidth={2.5} fill="url(#newGrad)"  name="New Listings" />
                        <Area type="monotone" dataKey="views"       stroke="#3b82f6"   strokeWidth={2.5} fill="url(#viewGrad)" name="Views"        />
                        <Area type="monotone" dataKey="leads"       stroke="#10b981"   strokeWidth={2}   fill="none"           name="Leads"        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="No trend data available" style={{ padding: 60 }} />
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={9}>
                <Card
                  title={<span style={{ fontWeight: 700, color: P }}>Listings by Status</span>}
                  bordered={false}
                  style={{ borderRadius: 16, border: "1px solid #ede9f6", height: "100%" }}
                >
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={90}
                          paddingAngle={3} dataKey="count"
                          nameKey="status"
                        >
                          {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <ChartTooltip contentStyle={{ borderRadius: 8 }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="No status data" style={{ padding: 60 }} />
                  )}
                </Card>
              </Col>
            </Row>

            {/* ── Property Type Breakdown + Top Properties ── */}
            <Row gutter={[20, 20]}>
              <Col xs={24} lg={10}>
                <Card
                  title={<span style={{ fontWeight: 700, color: P }}>Listings by Property Type</span>}
                  bordered={false}
                  style={{ borderRadius: 16, border: "1px solid #ede9f6" }}
                >
                  {typeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={typeData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                        <YAxis dataKey="type" type="category" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} width={90} />
                        <ChartTooltip contentStyle={{ borderRadius: 8 }} />
                        <Bar dataKey="count" fill={PM} radius={[0, 6, 6, 0]} name="Count">
                          {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="No type data" style={{ padding: 40 }} />
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={14}>
                <Card
                  title={<span style={{ fontWeight: 700, color: P }}>Top Performing Properties</span>}
                  bordered={false}
                  style={{ borderRadius: 16, border: "1px solid #ede9f6" }}
                >
                  {topProps.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {topProps.map((prop, i) => (
                        <div key={prop._id || i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: i % 2 === 0 ? "#faf8ff" : "#fff", borderRadius: 10, border: "1px solid #f0ebff" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: PL, color: P, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a0533", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {prop.propertyName || prop.projectName || "Untitled"}
                            </div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{prop.area || prop.locality || "—"}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}><EyeOutlined /> {(prop.viewCount || 0).toLocaleString()}</div>
                            <div style={{ fontSize: 11, color: "#db2777" }}><HeartOutlined /> {prop.wishlistCount || 0}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="No property data available" style={{ padding: 40 }} />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
}