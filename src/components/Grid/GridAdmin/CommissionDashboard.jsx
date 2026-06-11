import { useState, useEffect } from "react";
import {
  Card, Row, Col, Typography, Statistic, Table, Tag, Button, Select, Input, Space, message
} from "antd";
import {
  DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, WalletOutlined,
  ReloadOutlined, SearchOutlined, FilterOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice"; // adjust path if needed

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Xoto Theme ──────────────────────────────────────────────────────────────
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

// ─── Commission status config ────────────────────────────────────────────────
const COMMISSION_STATUS = {
  pending:   { label: "Pending",   icon: <ClockCircleOutlined />, color: T.warning, bg: T.warningLight },
  confirmed: { label: "Confirmed", icon: <CheckCircleOutlined />, color: T.info,    bg: T.infoLight    },
  paid:      { label: "Paid",      icon: <WalletOutlined />,     color: T.success, bg: T.successLight },
};

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminCommissionDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    totalPool: 0,
    pending: 0,
    confirmed: 0,
    paid: 0,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  // ── Fetch commissions from backend ─────────────────────────────────────────
  const fetchCommissions = async (page = 1, limit = 10, status = "all", search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (status !== "all") params.append("status", status); 
      if (search) params.append("search", search);

      const response = await apiService.get(`/commissions?${params}`);
      const res = response.data || response;
      const list = Array.isArray(res.data) ? res.data : [];
      setData(list);
      setStats(res.stats || {});
      setPagination({
        current: res.pagination?.page || page,
        pageSize: res.pagination?.limit || limit,
        total: res.pagination?.total || 0,
      });
    } catch (err) {
      message.error("Failed to load commissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleConfirm = async (record) => {
    try {
      await apiService.put(`/commissions/${record._id}/status`, { status: "confirmed" });
      message.success(`Commission #${record.dealId} confirmed`);
      fetchCommissions(pagination.current, pagination.pageSize, statusFilter, searchText);
    } catch (err) {
      message.error("Failed to confirm commission");
    }
  };

  const handlePay = async (record) => {
    try {
      await apiService.put(`/commissions/${record._id}/status`, { status: "paid" });
      message.success(`Commission #${record.dealId} marked as paid`);
      fetchCommissions(pagination.current, pagination.pageSize, statusFilter, searchText);
    } catch (err) {
      message.error("Failed to update status");
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Deal ID",
      dataIndex: "dealId",
      key: "dealId",
      width: 90,
      render: (text) => <span style={{ fontWeight: 600, color: T.primary }}>{text || "—"}</span>,
    },
    {
      title: "Agent / Agency",
      key: "agent",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.agentName || "—"}</div>
          {record.agencyName && <div style={{ fontSize: 12, color: T.gray }}>{record.agencyName}</div>}
        </div>
      ),
    },
    {
      title: "Referral Partner",
      dataIndex: "partnerName",
      key: "partnerName",
      render: (text) => text || "—",
    },
    {
      title: "Property",
      dataIndex: "propertyName",
      key: "propertyName",
      ellipsis: true,
    },
    {
      title: "Transaction Value",
      dataIndex: "transactionValue",
      key: "transactionValue",
      align: "right",
      render: (val) => `AED ${(val || 0).toLocaleString()}`,
    },
    {
      title: "Comm. %",
      dataIndex: "commissionRate",
      key: "commissionRate",
      align: "center",
      render: (val) => val ? `${val}%` : "—",
    },
    {
      title: "Commission Amount",
      dataIndex: "commissionAmount",
      key: "commissionAmount",
      align: "right",
      render: (val) => (
        <span style={{ fontWeight: 700, color: T.success }}>
          AED {(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "commissionStatus",
      key: "commissionStatus",
      render: (status) => {
        const cfg = COMMISSION_STATUS[status] || COMMISSION_STATUS.pending;
        return (
          <Tag
            style={{
              borderRadius: 12, fontWeight: 600,
              background: cfg.bg, color: cfg.color,
              border: `1px solid ${cfg.color}30`,
            }}
          >
            {cfg.icon} {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 150,
      render: (_, record) => {
        if (record.commissionStatus === "pending") {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handleConfirm(record)}
              style={{ background: T.info, borderColor: T.info, borderRadius: 6 }}
            >
              Confirm
            </Button>
          );
        }
        if (record.commissionStatus === "confirmed") {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handlePay(record)}
              style={{ background: T.success, borderColor: T.success, borderRadius: 6 }}
            >
              Mark Paid
            </Button>
          );
        }
        return null;
      },
    },
  ];

  // ── Stats card configuration ───────────────────────────────────────────────
  const statsCards = [
    {
      key: "totalPool",
      label: "Total Commission Pool",
      icon: <DollarOutlined />,
      color: T.primary,
      bg: T.primaryLight,
    },
    {
      key: "pending",
      label: "Pending",
      icon: <ClockCircleOutlined />,
      color: T.warning,
      bg: T.warningLight,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      icon: <CheckCircleOutlined />,
      color: T.info,
      bg: T.infoLight,
    },
    {
      key: "paid",
      label: "Paid",
      icon: <WalletOutlined />,
      color: T.success,
      bg: T.successLight,
    },
  ];

  return (
    <div style={{ padding: "28px 32px", background: "#faf5ff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ color: T.primary, margin: 0 }}>
            <DollarOutlined style={{ marginRight: 8 }} /> Commission Management
          </Title>
          <Text type="secondary">Approve, track and pay out all commissions</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchCommissions(1, 10, statusFilter, searchText)}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.key}>
            <Card
              bordered={false}
              style={{
                borderRadius: 14,
                border: `1px solid ${T.border}`,
                boxShadow: "0 1px 4px rgba(92,3,155,0.06)",
              }}
              bodyStyle={{ padding: "16px 20px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: T.gray, marginBottom: 4, fontWeight: 500 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>
                    AED {(stats[card.key] || 0).toLocaleString()}
                  </div>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: card.color,
                    fontSize: 20,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card
        bordered={false}
        style={{
          borderRadius: 14, border: `1px solid ${T.border}`,
          marginBottom: 20, padding: "12px 20px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Space wrap>
          <Input
            prefix={<SearchOutlined style={{ color: T.gray }} />}
            placeholder="Search by agent, partner, property..."
            style={{ width: 280, borderRadius: 8 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() => fetchCommissions(1, 10, statusFilter, searchText)}
            allowClear
          />
          <Select
            style={{ width: 150, borderRadius: 8 }}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              fetchCommissions(1, 10, val, searchText);
            }}
          >
            <Option value="all">All Statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="paid">Paid</Option>
          </Select>
          <Button
            type="primary"
            icon={<FilterOutlined />}
            onClick={() => fetchCommissions(1, 10, statusFilter, searchText)}
            style={{ background: T.primary, borderColor: T.primary, borderRadius: 8 }}
          >
            Apply
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, border: `1px solid ${T.border}`, boxShadow: "0 1px 4px rgba(92,3,155,0.06)" }}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchCommissions(page, pageSize, statusFilter, searchText),
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default AdminCommissionDashboard;