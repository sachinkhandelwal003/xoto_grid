import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Row, Col, Select, DatePicker, Button, Spin, Empty,
  Tag, Space, message
} from "antd";
import {
  ReloadOutlined, SearchOutlined, FilterOutlined,
  FileExcelOutlined, FilePdfOutlined, UserOutlined, ArrowUpOutlined
} from "@ant-design/icons";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, LineChart, Line, FunnelChart, Funnel, LabelList
} from "recharts";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../common/CustomTable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const P      = "#5C039B";
const PM     = "#7C3AED";
const PL     = "#F5F0FF";
const COLORS = ["#5C039B","#7C3AED","#3B82F6","#10B981","#F59E0B","#EF4444","#EC4899","#6B7280"];

const STATUS_COLORS = {
  New:         { color: "#2563eb", bg: "#eff6ff" },
  Contacted:   { color: "#d97706", bg: "#fffbeb" },
  Qualified:   { color: "#059669", bg: "#ecfdf5" },
  Converted:   { color: P,         bg: PL        },
  Lost:        { color: "#dc2626", bg: "#fef2f2" },
};

export default function GridLeadReports() {
  const [loading, setLoading]     = useState(false);
  const [data, setData]           = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filters, setFilters]     = useState({ propertyId: "", source: "", status: "", period: "monthly" });
  const [properties, setProperties] = useState([]);

  /* ── Load property dropdown ── */
  useEffect(() => {
    apiService.get("/properties/?limit=100&approvalStatus=approved")
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setProperties(list);
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      if (dateRange?.[0]) params.append("dateFrom", dateRange[0].format("YYYY-MM-DD"));
      if (dateRange?.[1]) params.append("dateTo",   dateRange[1].format("YYYY-MM-DD"));

      const res = await apiService.get(`/properties/analytics/leads?${params}`);
      if (res?.success) setData(res.data);
    } catch (err) {
      console.error("Lead reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, dateRange]);

  useEffect(() => { fetchData(); }, []);

  const handleExport = async (format) => {
    try {
      message.loading({ content: `Generating ${format.toUpperCase()}...`, key: "exp" });
      const params = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), format });
      const res = await apiService.get(`/properties/analytics/leads/export?${params}`, { responseType: "blob" });
      const blob = new Blob([res], { type: format === "pdf" ? "application/pdf" : "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `lead_report_${dayjs().format("YYYYMMDD")}.${format}`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      message.success({ content: "Exported!", key: "exp" });
    } catch { message.error({ content: "Export failed", key: "exp" }); }
  };

  /* ── Data ── */
  const summary      = data?.summary      || {};
  const volumeData   = data?.volumeTrend  || [];
  const sourceData   = data?.bySource     || [];
  const statusDist   = data?.byStatus     || [];
  const funnelData   = data?.funnel       || [];
  const topPropLeads = data?.topProperties|| [];
  const leadRecords  = data?.records      || [];

  return (
    <div style={{ background: "#F4F0FA", minHeight: "100vh", padding: "28px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a0533", margin: 0 }}>Lead Reports</h1>
            <p style={{ fontSize: 13, color: "#8B7BAE", margin: "4px 0 0" }}>
              Analyse lead volume, sources, conversion and property-level breakdown.
            </p>
          </div>
          <Space>
            <Button icon={<FileExcelOutlined />} onClick={() => handleExport("csv")}
              style={{ borderRadius: 10, borderColor: "#bbf7d0", color: "#16a34a", background: "#f0fdf4" }}>
              Export CSV
            </Button>
            <Button type="primary" icon={<FilePdfOutlined />} onClick={() => handleExport("pdf")}
              style={{ borderRadius: 10, background: "#dc2626", borderColor: "#dc2626" }}>
              Export PDF
            </Button>
          </Space>
        </div>

        {/* ── Filters ── */}
        <Card
          size="small"
          title={<span style={{ fontWeight: 700, color: P }}><FilterOutlined /> Filters</span>}
          style={{ marginBottom: 20, borderRadius: 16, border: "1px solid #ede9f6" }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={6} lg={4}>
              <Select placeholder="Period" value={filters.period} onChange={v => setFilters(p => ({ ...p, period: v }))} style={{ width: "100%" }}>
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="yearly">Yearly</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5}>
              <RangePicker value={dateRange} onChange={setDateRange} style={{ width: "100%" }} />
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Select placeholder="Property" value={filters.propertyId || undefined} onChange={v => setFilters(p => ({ ...p, propertyId: v || "" }))} allowClear style={{ width: "100%" }}>
                {properties.map(pr => (
                  <Option key={pr._id} value={pr._id}>{pr.propertyName || pr.projectName || "Untitled"}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={8} md={6} lg={3}>
              <Select placeholder="Lead Source" value={filters.source || undefined} onChange={v => setFilters(p => ({ ...p, source: v || "" }))} allowClear style={{ width: "100%" }}>
                <Option value="website">Website</Option>
                <Option value="referral">Referral</Option>
                <Option value="agent">Agent</Option>
                <Option value="advisor">Advisor</Option>
                <Option value="walk_in">Walk-In</Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={6} lg={3}>
              <Select placeholder="Status" value={filters.status || undefined} onChange={v => setFilters(p => ({ ...p, status: v || "" }))} allowClear style={{ width: "100%" }}>
                <Option value="New">New</Option>
                <Option value="Contacted">Contacted</Option>
                <Option value="Qualified">Qualified</Option>
                <Option value="Converted">Converted</Option>
                <Option value="Lost">Lost</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} lg={5}>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button size="small" type="text" danger onClick={() => { setFilters({ propertyId: "", source: "", status: "", period: "monthly" }); setDateRange(null); }}>Reset</Button>
                <Button size="small" type="primary" icon={<SearchOutlined />} onClick={fetchData} style={{ background: P, borderColor: P }}>Apply</Button>
              </div>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, flexDirection: "column", gap: 16 }}>
            <Spin size="large" />
            <span style={{ color: "#8B7BAE", fontSize: 13 }}>Loading lead data...</span>
          </div>
        ) : (
          <>
            {/* ── Summary KPIs ── */}
            <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
              {[
                { label: "Total Leads",        value: summary.totalLeads     || 0, color: P,         bg: PL        },
                { label: "New Leads",          value: summary.newLeads       || 0, color: "#2563eb", bg: "#eff6ff" },
                { label: "Qualified",          value: summary.qualified      || 0, color: "#059669", bg: "#ecfdf5" },
                { label: "Converted",          value: summary.converted      || 0, color: "#7c3aed", bg: "#f5f3ff" },
                { label: "Conversion Rate",    value: summary.conversionRate  != null ? `${summary.conversionRate}%` : "—", color: "#0891b2", bg: "#ecfeff" },
                { label: "Avg Response Time",  value: summary.avgResponseHrs  != null ? `${summary.avgResponseHrs}h` : "—", color: "#d97706", bg: "#fffbeb" },
              ].map(s => (
                <Col xs={12} sm={8} md={4} key={s.label}>
                  <div style={{ background: s.bg, borderRadius: 14, padding: "16px 18px", border: "1px solid #ede9f6" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* ── Volume Trend + Source Breakdown ── */}
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
              <Col xs={24} lg={15}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>Lead Volume Trend</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6" }}>
                  {volumeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={270}>
                      <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={PM} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={PM} stopOpacity={0}    />
                          </linearGradient>
                          <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                        <ChartTooltip contentStyle={{ borderRadius: 8, border: "1px solid #ede9f6" }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="total"     stroke={PM}       strokeWidth={2.5} fill="url(#totalGrad)" name="Total Leads"  />
                        <Area type="monotone" dataKey="converted" stroke="#10b981"  strokeWidth={2}   fill="url(#convGrad)"  name="Converted"    />
                        <Line type="monotone" dataKey="lost"      stroke="#ef4444"  strokeWidth={2}   dot={false}            name="Lost"         />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <Empty description="No trend data" style={{ padding: 60 }} />}
                </Card>
              </Col>

              <Col xs={24} lg={9}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>Leads by Source</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6" }}>
                  {sourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={270}>
                      <PieChart>
                        <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="count" nameKey="source">
                          {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <ChartTooltip contentStyle={{ borderRadius: 8 }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <Empty description="No source data" style={{ padding: 60 }} />}
                </Card>
              </Col>
            </Row>

            {/* ── Status Distribution + Top Properties by Lead ── */}
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
              <Col xs={24} lg={11}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>Lead Status Distribution</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6" }}>
                  {statusDist.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={statusDist} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                        <YAxis dataKey="status" type="category" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} width={80} />
                        <ChartTooltip contentStyle={{ borderRadius: 8 }} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Count">
                          {statusDist.map((entry, i) => {
                            const sc = STATUS_COLORS[entry.status] || {};
                            return <Cell key={i} fill={sc.color || COLORS[i % COLORS.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Empty description="No status data" style={{ padding: 40 }} />}
                </Card>
              </Col>

              <Col xs={24} lg={13}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>Top Properties by Lead Count</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6" }}>
                  {topPropLeads.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={topPropLeads} margin={{ left: -10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                        <ChartTooltip contentStyle={{ borderRadius: 8 }} />
                        <Bar dataKey="leads" fill={PM} radius={[4, 4, 0, 0]} name="Leads">
                          {topPropLeads.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Empty description="No property data" style={{ padding: 40 }} />}
                </Card>
              </Col>
            </Row>

            {/* ── Lead Records Table ── */}
            <Card
              title={<span style={{ fontWeight: 700, color: P }}>All Lead Records ({leadRecords.length})</span>}
              bordered={false}
              style={{ borderRadius: 16, border: "1px solid #ede9f6" }}
            >
              <CustomTable
                data={leadRecords}
                showSearch
                columns={[
                  {
                    key: "customerName", title: "Customer",
                    render: (_, r) => (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1a0533" }}>{r.customerName || "—"}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.email || ""}</div>
                      </div>
                    ),
                  },
                  {
                    key: "propertyName", title: "Property",
                    render: (_, r) => (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12, color: P }}>{r.propertyName || "—"}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.area || ""}</div>
                      </div>
                    ),
                  },
                  {
                    key: "source", title: "Source",
                    render: (v) => (
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: PL, color: P }}>
                        {String(v || "—").replace(/_/g, " ").toUpperCase()}
                      </span>
                    ),
                  },
                  {
                    key: "status", title: "Status",
                    render: (v) => {
                      const sc = STATUS_COLORS[v] || { color: "#6b7280", bg: "#f3f4f6" };
                      return (
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: sc.bg, color: sc.color }}>
                          {v || "—"}
                        </span>
                      );
                    },
                  },
                  {
                    key: "assignedTo", title: "Assigned To",
                    render: (v) => <span style={{ fontSize: 12 }}>{v || "—"}</span>,
                  },
                  {
                    key: "createdAt", title: "Date",
                    render: (v) => v ? <span style={{ fontSize: 11, color: "#6b7280" }}>{dayjs(v).format("DD MMM YYYY")}</span> : "—",
                  },
                ]}
              />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}