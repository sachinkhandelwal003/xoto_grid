import { useState, useEffect, useCallback } from "react";
import {
  Card, Row, Col, Typography, Statistic, Table, Tag, Button,
  Select, Input, Space, message, DatePicker, Tooltip,
} from "antd";
import {
  DollarOutlined, ClockCircleOutlined, CheckCircleOutlined,
  WalletOutlined, ReloadOutlined, SearchOutlined, FilterOutlined,
  DownloadOutlined, TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  primary:      "#5c039b",
  primaryLight: "#f3e8ff",
  success:      "#16a34a",
  successLight: "#dcfce7",
  warning:      "#b45309",
  warningLight: "#fef3c7",
  info:         "#2563eb",
  infoLight:    "#dbeafe",
  gray:         "#64748b",
  border:       "#ede9fe",
};

const COMMISSION_STATUS = {
  pending:   { label: "Pending",   color: T.warning, bg: T.warningLight, icon: <ClockCircleOutlined /> },
  confirmed: { label: "Confirmed", color: T.info,    bg: T.infoLight,    icon: <CheckCircleOutlined /> },
  paid:      { label: "Paid",      color: T.success, bg: T.successLight, icon: <WalletOutlined /> },
};

const DEAL_TYPE_CFG = {
  sale:  { label: "Sale",  color: "#7c3aed", bg: "#f5f3ff" },
  lease: { label: "Lease", color: "#9a3412", bg: "#fff7ed" },
};

const fmt = (n) => `AED ${(n || 0).toLocaleString("en-AE")}`;

// ─── Export helper ─────────────────────────────────────────────────────────────
const exportCSV = async (filters) => {
  try {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "all") params.set("commissionStatus", filters.status);
    if (filters.dealType)   params.set("dealType", filters.dealType);
    if (filters.agentType)  params.set("agentType", filters.agentType);
    if (filters.dateFrom)   params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo)     params.set("dateTo", filters.dateTo);
    if (filters.search)     params.set("search", filters.search);

    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("grid_token") || localStorage.getItem("token");
    const url = `${base}/deal-records/export?${params.toString()}`;

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `commission_report_${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    message.success("CSV exported successfully");
  } catch {
    message.error("Export failed. Please try again.");
  }
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, icon, color, bg, value, sub }) => (
  <Card
    bordered={false}
    style={{ borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: "0 1px 4px rgba(92,3,155,0.06)" }}
    bodyStyle={{ padding: "16px 20px" }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 12, color: T.gray, marginBottom: 4, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, fontSize: 20,
      }}>
        {icon}
      </div>
    </div>
  </Card>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminCommissionDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [exporting, setExp]     = useState(false);
  const [data, setData]         = useState([]);
  const [stats, setStats]       = useState({ totalPool: 0, pending: 0, confirmed: 0, paid: 0 });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const [filters, setFilters] = useState({
    status:    "all",
    dealType:  "",
    agentType: "",
    search:    "",
    dateFrom:  null,
    dateTo:    null,
  });

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const fetchCommissions = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (filters.status !== "all") params.append("status",    filters.status);
      if (filters.dealType)         params.append("dealType",  filters.dealType);
      if (filters.agentType)        params.append("agentType", filters.agentType);
      if (filters.search)           params.append("search",    filters.search);
      if (filters.dateFrom)         params.append("dateFrom",  filters.dateFrom);
      if (filters.dateTo)           params.append("dateTo",    filters.dateTo);

      const response = await apiService.get(`/commissions?${params}`);
      const res = response.data || response;
      setData(Array.isArray(res.data) ? res.data : []);
      setStats(res.stats || { totalPool: 0, pending: 0, confirmed: 0, paid: 0 });
      setPagination({
        current:  res.pagination?.page  || page,
        pageSize: res.pagination?.limit || limit,
        total:    res.pagination?.total || 0,
      });
    } catch {
      message.error("Failed to load commissions");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchCommissions(1, pagination.pageSize); }, [filters]);

  const handleStatusAction = async (record, newStatus) => {
    try {
      await apiService.put(`/commissions/${record._id}/status`, { status: newStatus });
      message.success(`Commission ${newStatus === "confirmed" ? "confirmed" : "marked as paid"}`);
      fetchCommissions(pagination.current, pagination.pageSize);
    } catch {
      message.error("Action failed");
    }
  };

  const handleExport = async () => {
    setExp(true);
    await exportCSV(filters);
    setExp(false);
  };

  const handleRowClick = (record) => {
    if (record.dealRecordId) {
      navigate(`/dashboard/admin/deal-records/${record.dealRecordId}`);
    } else {
      message.info("Deal record detail not available");
    }
  };

  const handleDateChange = (dates) => {
    setFilters(f => ({
      ...f,
      dateFrom: dates?.[0] ? dates[0].startOf("day").toISOString() : null,
      dateTo:   dates?.[1] ? dates[1].endOf("day").toISOString()   : null,
    }));
  };

  const handleReset = () => {
    setFilters({ status: "all", dealType: "", agentType: "", search: "", dateFrom: null, dateTo: null });
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Deal Ref",
      dataIndex: "dealId",
      key: "dealId",
      width: 100,
      render: (text, record) => (
        <div>
          <span style={{ fontWeight: 700, color: T.primary, cursor: "pointer" }}
            onClick={() => handleRowClick(record)}>
            {text || "—"}
          </span>
          {record.dealType && (
            <div style={{ marginTop: 2 }}>
              <Tag style={{
                fontSize: 10, padding: "0 5px", lineHeight: "16px",
                background: DEAL_TYPE_CFG[record.dealType]?.bg || "#f5f5f5",
                color: DEAL_TYPE_CFG[record.dealType]?.color || "#555",
                border: "none", borderRadius: 4,
              }}>
                {DEAL_TYPE_CFG[record.dealType]?.label || record.dealType}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Agent / Advisor",
      key: "agent",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{record.agentName || "—"}</div>
          {record.agencyName && (
            <div style={{ fontSize: 11, color: T.gray }}>{record.agencyName}</div>
          )}
        </div>
      ),
    },
    {
      title: "Referral Partner",
      key: "referral",
      render: (_, record) => {
        if (!record.partnerName) return <span style={{ color: "#ccc" }}>—</span>;
        const refStatus = record.referralCommissionStatus;
        const refCfg = refStatus ? COMMISSION_STATUS[refStatus] : null;
        return (
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{record.partnerName}</div>
            {record.referralAmount > 0 && (
              <div style={{ fontSize: 11, color: T.success, fontWeight: 700 }}>
                {fmt(record.referralAmount)}
              </div>
            )}
            {refCfg && (
              <Tag style={{
                fontSize: 10, padding: "0 5px", lineHeight: "16px",
                background: refCfg.bg, color: refCfg.color,
                border: `1px solid ${refCfg.color}30`, borderRadius: 4,
              }}>
                {refCfg.label}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Property",
      dataIndex: "propertyName",
      key: "propertyName",
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontSize: 13 }}>{text || "—"}</div>
          {record.propertySubType && (
            <div style={{ fontSize: 11, color: T.gray, textTransform: "capitalize" }}>
              {record.propertySubType.replace(/_/g, " ")}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Transaction Value",
      dataIndex: "transactionValue",
      key: "transactionValue",
      align: "right",
      render: (val) => <span style={{ fontSize: 13 }}>{fmt(val)}</span>,
    },
    {
      title: "Commission",
      key: "commission",
      align: "right",
      render: (_, record) => (
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: T.success, fontSize: 14 }}>
            {fmt(record.commissionAmount)}
          </div>
          {record.commissionRate && (
            <div style={{ fontSize: 11, color: T.gray }}>{record.commissionRate}%</div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "commissionStatus",
      key: "commissionStatus",
      width: 110,
      render: (status) => {
        const cfg = COMMISSION_STATUS[status] || COMMISSION_STATUS.pending;
        return (
          <Tag style={{
            borderRadius: 12, fontWeight: 600, fontSize: 11,
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.color}30`,
          }}>
            {cfg.icon} {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Closed",
      dataIndex: "closedAt",
      key: "closedAt",
      width: 90,
      render: (v) => v ? (
        <span style={{ fontSize: 11, color: T.gray }}>
          {dayjs(v).format("DD MMM YY")}
        </span>
      ) : "—",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space size={4}>
          {record.commissionStatus === "pending" && (
            <Button size="small" type="primary"
              onClick={(e) => { e.stopPropagation(); handleStatusAction(record, "confirmed"); }}
              style={{ background: T.info, borderColor: T.info, borderRadius: 6, fontSize: 11 }}>
              Confirm
            </Button>
          )}
          {record.commissionStatus === "confirmed" && (
            <Button size="small" type="primary"
              onClick={(e) => { e.stopPropagation(); handleStatusAction(record, "paid"); }}
              style={{ background: T.success, borderColor: T.success, borderRadius: 6, fontSize: 11 }}>
              Mark Paid
            </Button>
          )}
          <Tooltip title="View Details">
            <Button size="small" icon={<SearchOutlined />}
              onClick={(e) => { e.stopPropagation(); handleRowClick(record); }}
              style={{ borderRadius: 6 }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Stats cards ───────────────────────────────────────────────────────────────
  const statCards = [
    { label: "Total Pool",  icon: <DollarOutlined />,      color: T.primary, bg: T.primaryLight, value: fmt(stats.totalPool) },
    { label: "Pending",     icon: <ClockCircleOutlined />, color: T.warning, bg: T.warningLight, value: fmt(stats.pending),   sub: "Awaiting confirmation" },
    { label: "Confirmed",   icon: <CheckCircleOutlined />, color: T.info,    bg: T.infoLight,    value: fmt(stats.confirmed), sub: "Awaiting payment" },
    { label: "Paid",        icon: <WalletOutlined />,      color: T.success, bg: T.successLight, value: fmt(stats.paid),      sub: "Disbursed" },
  ];

  return (
    <div style={{ padding: "28px 32px", background: "#faf5ff", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <Title level={3} style={{ color: T.primary, margin: 0 }}>
            <DollarOutlined style={{ marginRight: 8 }} />Commission Ledger
          </Title>
          <Text type="secondary">
            Track, confirm and pay all commissions · {pagination.total} records
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />}
            onClick={() => fetchCommissions(1, pagination.pageSize)}>
            Refresh
          </Button>
          <Button
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExport}
            style={{ background: T.primary, borderColor: T.primary, color: "#fff", borderRadius: 8 }}
          >
            Export CSV
          </Button>
        </Space>
      </div>

      {/* ── Stats ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.label}>
            <StatCard {...c} />
          </Col>
        ))}
      </Row>

      {/* ── Filters ── */}
      <Card bordered={false}
        style={{ borderRadius: 14, border: `1px solid ${T.border}`, marginBottom: 20 }}
        bodyStyle={{ padding: "14px 20px" }}>
        <Row gutter={[10, 10]} align="middle">
          <Col xs={24} sm={10} md={7}>
            <Input
              prefix={<SearchOutlined style={{ color: T.gray }} />}
              placeholder="Search agent, partner, property..."
              value={filters.search}
              onChange={(e) => setF("search", e.target.value)}
              onPressEnter={() => fetchCommissions(1, pagination.pageSize)}
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Select style={{ width: "100%" }} value={filters.status}
              onChange={(v) => setF("status", v)}>
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="paid">Paid</Option>
            </Select>
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Select style={{ width: "100%" }} value={filters.dealType}
              onChange={(v) => setF("dealType", v)} placeholder="Deal Type">
              <Option value="">All Types</Option>
              <Option value="sale">Sale</Option>
              <Option value="lease">Lease</Option>
            </Select>
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Select style={{ width: "100%" }} value={filters.agentType}
              onChange={(v) => setF("agentType", v)} placeholder="Agent Type">
              <Option value="">All Roles</Option>
              <Option value="agent">Agent</Option>
              <Option value="advisor">Advisor</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY"
              onChange={handleDateChange}
              placeholder={["From Date", "To Date"]} />
          </Col>

          <Col xs={12} sm={4} md={2}>
            <Button onClick={handleReset} style={{ borderRadius: 8 }}>Reset</Button>
          </Col>
        </Row>
      </Card>

      {/* ── Table ── */}
      <Card bordered={false}
        style={{ borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: "0 1px 4px rgba(92,3,155,0.06)" }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1300 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: record.dealRecordId ? "pointer" : "default" },
          })}
          rowClassName={(_, i) => i % 2 === 0 ? "" : "comm-row-alt"}
          pagination={{
            current:        pagination.current,
            pageSize:       pagination.pageSize,
            total:          pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal:      (t) => `${t} total records`,
            onChange: (page, size) => {
              setPagination(p => ({ ...p, current: page, pageSize: size }));
              fetchCommissions(page, size);
            },
          }}
        />
      </Card>

      <style>{`
        .comm-row-alt { background: #faf5ff; }
        .comm-row-alt:hover td { background: #f3e8ff !important; }
      `}</style>
    </div>
  );
};

export default AdminCommissionDashboard;
