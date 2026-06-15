import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Row, Col, Select, DatePicker, Button, Spin, Empty,
  Space, Progress, message, Tooltip
} from "antd";
import {
  ReloadOutlined, SearchOutlined, FilterOutlined,
  FileExcelOutlined, FilePdfOutlined, EyeOutlined,
  HeartOutlined, HomeOutlined, BarChartOutlined, EditOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, LineChart, Line
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

const APPROVAL_COLORS = {
  approved:  { color: "#059669", bg: "#ecfdf5" },
  pending:   { color: "#d97706", bg: "#fffbeb" },
  rejected:  { color: "#dc2626", bg: "#fef2f2" },
  draft:     { color: "#6b7280", bg: "#f3f4f6" },
};

export default function GridListingReports() {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(false);
  const [data, setData]           = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [filters, setFilters]     = useState({
    propertySubType: "", approvalStatus: "", saleStatus: "",
    area: "", period: "monthly", developerId: ""
  });
  const [developers, setDevelopers] = useState([]);

  /* ── Load developer dropdown ── */
  useEffect(() => {
    apiService.get("/developer/all?limit=100")
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setDevelopers(list);
      })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      if (dateRange?.[0]) params.append("dateFrom", dateRange[0].format("YYYY-MM-DD"));
      if (dateRange?.[1]) params.append("dateTo",   dateRange[1].format("YYYY-MM-DD"));

      const res = await apiService.get(`/properties/analytics/listings?${params}`);
      if (res?.success) setData(res.data);
    } catch (err) {
      console.error("Listing reports fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, dateRange]);

  useEffect(() => { fetchData(); }, []);

  const handleExport = async (format) => {
    try {
      message.loading({ content: `Generating ${format.toUpperCase()}...`, key: "exp" });
      const params = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), format });
      const res = await apiService.get(`/properties/analytics/listings/export?${params}`, { responseType: "blob" });
      const blob = new Blob([res], { type: format === "pdf" ? "application/pdf" : "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `listing_report_${dayjs().format("YYYYMMDD")}.${format}`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      message.success({ content: "Exported!", key: "exp" });
    } catch { message.error({ content: "Export failed", key: "exp" }); }
  };

  /* ── Data ── */
  const summary       = data?.summary       || {};
  const trendData     = data?.trend         || [];
  const bySubType     = data?.bySubType     || [];
  const byApproval    = data?.byApproval    || [];
  const bySaleStatus  = data?.bySaleStatus  || [];
  const byArea        = data?.byArea        || [];
  const topViewed     = data?.topViewed     || [];
  const topWishlisted = data?.topWishlisted || [];
  const records       = data?.records       || [];

  return (
    <div style={{ background: "#F4F0FA", minHeight: "100vh", padding: "28px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a0533", margin: 0 }}>Listing Reports</h1>
            <p style={{ fontSize: 13, color: "#8B7BAE", margin: "4px 0 0" }}>
              Track listing performance, views, wishlists and sale status across properties.
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
            <Col xs={12} sm={8} md={6} lg={3}>
              <Select placeholder="Sub Type" value={filters.propertySubType || undefined} onChange={v => setFilters(p => ({ ...p, propertySubType: v || "" }))} allowClear style={{ width: "100%" }}>
                <Option value="off_plan">Off-Plan</Option>
                <Option value="secondary">Secondary</Option>
                <Option value="rental">Rental</Option>
                <Option value="commercial">Commercial</Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={6} lg={3}>
              <Select placeholder="Approval" value={filters.approvalStatus || undefined} onChange={v => setFilters(p => ({ ...p, approvalStatus: v || "" }))} allowClear style={{ width: "100%" }}>
                <Option value="approved">Approved</Option>
                <Option value="pending">Pending</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="draft">Draft</Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={6} lg={3}>
              <Select placeholder="Sale Status" value={filters.saleStatus || undefined} onChange={v => setFilters(p => ({ ...p, saleStatus: v || "" }))} allowClear style={{ width: "100%" }}>
                <Option value="Available">Available</Option>
                <Option value="Reserved">Reserved</Option>
                <Option value="Sold">Sold</Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={6} lg={3}>
              <Select placeholder="Developer" value={filters.developerId || undefined} onChange={v => setFilters(p => ({ ...p, developerId: v || "" }))} allowClear style={{ width: "100%" }}>
                {developers.map(d => <Option key={d._id} value={d._id}>{d.name || d.companyName || "—"}</Option>)}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} lg={3}>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button size="small" type="text" danger onClick={() => { setFilters({ propertySubType: "", approvalStatus: "", saleStatus: "", area: "", period: "monthly", developerId: "" }); setDateRange(null); }}>Reset</Button>
                <Button size="small" type="primary" icon={<SearchOutlined />} onClick={fetchData} style={{ background: P, borderColor: P }}>Apply</Button>
              </div>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, flexDirection: "column", gap: 16 }}>
            <Spin size="large" />
            <span style={{ color: "#8B7BAE", fontSize: 13 }}>Loading listing data...</span>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
              {[
                { label: "Total Listings",    value: summary.totalListings   || 0, color: P,         bg: PL        },
                { label: "Active / Approved", value: summary.activeListings  || 0, color: "#059669", bg: "#ecfdf5" },
                { label: "Total Views",       value: summary.totalViews      || 0, color: "#2563eb", bg: "#eff6ff" },
                { label: "Total Wishlisted",  value: summary.totalWishlisted || 0, color: "#db2777", bg: "#fdf2f8" },
                { label: "Available",         value: summary.available       || 0, color: "#0891b2", bg: "#ecfeff" },
                { label: "Reserved",          value: summary.reserved        || 0, color: "#d97706", bg: "#fffbeb" },
                { label: "Sold",              value: summary.sold            || 0, color: "#16a34a", bg: "#f0fdf4" },
                { label: "Avg Views/Listing", value: summary.avgViews != null ? summary.avgViews.toFixed(1) : "—", color: "#7c3aed", bg: "#f5f3ff" },
              ].map(s => (
                <Col xs={12} sm={8} md={6} lg={3} key={s.label}>
                  <div style={{ background: s.bg, borderRadius: 14, padding: "16px 18px", border: "1px solid #ede9f6", height: "100%" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* ── Trend + Sub Type ── */}
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
              <Col xs={24} lg={15}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>Listing Activity Trend</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6" }}>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={270}>
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="addedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={PM}      stopOpacity={0.35} />
                            <stop offset="95%" stopColor={PM}      stopOpacity={0}    />
                          </linearGradient>
                          <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                        <ChartTooltip contentStyle={{ borderRadius: 8, border: "1px solid #ede9f6" }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="added"  stroke={PM}       strokeWidth={2.5} fill="url(#addedGrad)" name="New Listings" />
                        <Area type="monotone" dataKey="sold"   stroke="#10b981"  strokeWidth={2}   fill="url(#soldGrad)"  name="Sold"         />
                        <Line type="monotone" dataKey="views"  stroke="#3b82f6"  strokeWidth={2}   dot={false}            name="Views"        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <Empty description="No trend data" style={{ padding: 60 }} />}
                </Card>
              </Col>

              <Col xs={24} lg={9}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>By Property Sub-Type</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6" }}>
                  {bySubType.length > 0 ? (
                    <ResponsiveContainer width="100%" height={270}>
                      <PieChart>
                        <Pie data={bySubType} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="count" nameKey="subType">
                          {bySubType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <ChartTooltip contentStyle={{ borderRadius: 8 }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <Empty description="No sub-type data" style={{ padding: 60 }} />}
                </Card>
              </Col>
            </Row>

            {/* ── Approval Status + Sale Status + Area ── */}
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
              <Col xs={24} md={8}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>By Approval Status</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6", height: "100%" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0" }}>
                    {byApproval.length > 0 ? byApproval.map((item, i) => {
                      const sc = APPROVAL_COLORS[item.status] || { color: "#6b7280", bg: "#f3f4f6" };
                      const total = byApproval.reduce((s, x) => s + (x.count || 0), 0);
                      const pct   = total > 0 ? Math.round((item.count / total) * 100) : 0;
                      return (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.color }}>
                              {String(item.status || "—").toUpperCase()}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>{item.count}</span>
                          </div>
                          <Progress percent={pct} strokeColor={sc.color} trailColor="#f1f5f9" showInfo={false} strokeWidth={8} />
                        </div>
                      );
                    }) : <Empty description="No approval data" style={{ padding: 30 }} />}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>By Sale Status</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6", height: "100%" }}>
                  {bySaleStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={bySaleStatus} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="count" nameKey="status">
                          {bySaleStatus.map((_, i) => <Cell key={i} fill={["#10b981","#f59e0b","#ef4444"][i] || COLORS[i]} />)}
                        </Pie>
                        <ChartTooltip contentStyle={{ borderRadius: 8 }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <Empty description="No sale status data" style={{ padding: 40 }} />}
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card title={<span style={{ fontWeight: 700, color: P }}>Top Areas by Listings</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6", height: "100%" }}>
                  {byArea.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "6px 0" }}>
                      {byArea.slice(0, 6).map((item, i) => {
                        const maxCount = byArea[0]?.count || 1;
                        const pct = Math.round((item.count / maxCount) * 100);
                        return (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{item.area || "—"}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: P }}>{item.count}</span>
                            </div>
                            <Progress percent={pct} strokeColor={COLORS[i % COLORS.length]} trailColor="#f1f5f9" showInfo={false} strokeWidth={7} />
                          </div>
                        );
                      })}
                    </div>
                  ) : <Empty description="No area data" style={{ padding: 40 }} />}
                </Card>
              </Col>
            </Row>

            {/* ── Top Viewed + Top Wishlisted ── */}
            <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
              <Col xs={24} lg={12}>
                <Card title={<span style={{ fontWeight: 700, color: P }}><EyeOutlined /> Top Viewed Listings</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6" }}>
                  {topViewed.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {topViewed.slice(0, 7).map((prop, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: i % 2 === 0 ? "#faf8ff" : "#fff", borderRadius: 10, border: "1px solid #f0ebff" }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: PL, color: P, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a0533", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {prop.propertyName || prop.projectName || "—"}
                            </div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{prop.area || "—"}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>
                            <EyeOutlined style={{ marginRight: 4 }} />{(prop.viewCount || 0).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <Empty description="No view data" style={{ padding: 40 }} />}
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title={<span style={{ fontWeight: 700, color: P }}><HeartOutlined /> Top Wishlisted Listings</span>} bordered={false} style={{ borderRadius: 16, border: "1px solid #ede9f6" }}>
                  {topWishlisted.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {topWishlisted.slice(0, 7).map((prop, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: i % 2 === 0 ? "#fff8fb" : "#fff", borderRadius: 10, border: "1px solid #fce7f3" }}>
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#fdf2f8", color: "#db2777", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1a0533", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {prop.propertyName || prop.projectName || "—"}
                            </div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{prop.area || "—"}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#db2777", flexShrink: 0 }}>
                            <HeartOutlined style={{ marginRight: 4 }} />{(prop.wishlistCount || 0).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <Empty description="No wishlist data" style={{ padding: 40 }} />}
                </Card>
              </Col>
            </Row>

            {/* ── All Listings Table ── */}
            <Card
              title={<span style={{ fontWeight: 700, color: P }}>All Listing Records ({records.length})</span>}
              bordered={false}
              style={{ borderRadius: 16, border: "1px solid #ede9f6" }}
            >
              <CustomTable
                data={records}
                showSearch
                columns={[
                  {
                    key: "propertyName", title: "Property",
                    render: (_, r) => (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1a0533" }}>{r.propertyName || r.projectName || "—"}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.area || r.locality || ""}</div>
                      </div>
                    ),
                  },
                  {
                    key: "propertySubType", title: "Type",
                    render: (v) => (
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: PL, color: P }}>
                        {String(v || "—").replace(/_/g, " ").toUpperCase()}
                      </span>
                    ),
                  },
                  {
                    key: "approvalStatus", title: "Approval",
                    render: (v) => {
                      const sc = APPROVAL_COLORS[v] || { color: "#6b7280", bg: "#f3f4f6" };
                      return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: sc.bg, color: sc.color }}>{v || "—"}</span>;
                    },
                  },
                  {
                    key: "saleStatus", title: "Sale Status",
                    render: (v) => {
                      const clr = v === "Sold" ? "#16a34a" : v === "Reserved" ? "#d97706" : "#0891b2";
                      const bg  = v === "Sold" ? "#f0fdf4" : v === "Reserved" ? "#fffbeb" : "#ecfeff";
                      return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, background: bg, color: clr }}>{v || "Available"}</span>;
                    },
                  },
                  {
                    key: "price", title: "Price",
                    render: (_, r) => {
                      const from = r.priceRange?.from || r.price_min || r.price;
                      const to   = r.priceRange?.to   || r.price_max;
                      if (!from) return "—";
                      return <span style={{ fontWeight: 700, fontSize: 12, color: P }}>AED {Number(from).toLocaleString()}{to && to !== from ? ` – ${Number(to).toLocaleString()}` : ""}</span>;
                    },
                  },
                  {
                    key: "viewCount", title: "Views",
                    render: (v) => <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}><EyeOutlined style={{ marginRight: 4 }} />{(v || 0).toLocaleString()}</span>,
                  },
                  {
                    key: "wishlistCount", title: "Wishlisted",
                    render: (v) => <span style={{ fontSize: 12, color: "#db2777", fontWeight: 600 }}><HeartOutlined style={{ marginRight: 4 }} />{v || 0}</span>,
                  },
                  {
                    key: "createdAt", title: "Created",
                    render: (v) => v ? <span style={{ fontSize: 11, color: "#6b7280" }}>{dayjs(v).format("DD MMM YYYY")}</span> : "—",
                  },
                  {
                    key: "actions", title: "Actions", sortable: false,
                    render: (_, r) => {
                      const subType = r.propertySubType;
                      if (subType === "secondary") {
                        return (
                          <Tooltip title="Edit Secondary Property">
                            <Button
                              size="small" type="primary" ghost icon={<EditOutlined />}
                              onClick={() => navigate(`/create-secondary-plans/${r._id}`)}
                              style={{ borderRadius: 6 }}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                        );
                      }
                      if (subType === "rental") {
                        return (
                          <Tooltip title="Edit Rental Property">
                            <Button
                              size="small" type="primary" ghost icon={<EditOutlined />}
                              onClick={() => navigate(`/rental/properties/edit/${r._id}`)}
                              style={{ borderRadius: 6 }}
                            >
                              Edit
                            </Button>
                          </Tooltip>
                        );
                      }
                      return <span style={{ fontSize: 11, color: "#9ca3af" }}>—</span>;
                    },
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