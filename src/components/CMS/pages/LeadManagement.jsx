import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Table,
  Tag,
  Space,
  Card,
  Typography,
  Row,
  Col,
  Button,
  Input,
  Select,
  Avatar,
  message
} from "antd";

import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  MessageOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const THEME = {
  primary:    "#5c039b",
  primaryBg:  "rgba(92, 3, 155, 0.08)",
  success:    "#7c3aed",
  successBg:  "rgba(124, 58, 237, 0.08)",
  error:      "#c084fc",
  errorBg:    "rgba(192, 132, 252, 0.08)",
  border:     "#e9d5ff",
  textPrimary:"#140D2A",
  textMuted:  "#8a70a8",
  bg:         "#faf5ff",
};

const AVATAR_COLORS = [
  "#5c039b", "#7c3aed", "#8b5cf6", "#a78bfa",
  "#c084fc", "#d8b4fe", "#6d28d9", "#5b21b6",
  "#4c1d95", "#7e22ce"
];

const roleSlugMap = {
  0: "superadmin", 1: "admin", 2: "customer", 5: "vendor-b2c", 6: "vendor-b2b",
  7: "freelancer", 11: "accountant", 12: "supervisor", 15: "agency", 16: "agent",
  17: "developer", 18: "vault-admin", 22: "vaultagent", 26: "vault-advisor",
  23: "vault-ops", 25: "gridreferralpartner", 21: "vaultpartner", 24: "GridAdvisor"
};

const getInitials = (name="") => name.split(" ").map((w)=>w[0]||"").join("").toUpperCase().slice(0,2);
const getAvatarColor = (name="") => {
  const h = name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const LeadAvatar = ({ name="", size=38 }) => (
  <Avatar size={size} style={{ background: getAvatarColor(name), color: "#ffffff", fontWeight: 700 }}>
    {getInitials(name)}
  </Avatar>
);

const MiniStat = ({ icon, label, value, color }) => (
  <div
    style={{
      background:    "#fff",
      border:        `1.5px solid var(--border)`,
      borderRadius:  12,
      padding:       "16px 20px",
      display:       "flex",
      alignItems:    "center",
      gap:           16,
      boxShadow:     "var(--sh-card)",
    }}
  >
    <div
      style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}12`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--tx)", lineHeight: 1.2 }}>
        {value ?? 0}
      </div>
      <div style={{ fontSize: 12, color: "var(--tx-muted)" }}>{label}</div>
    </div>
  </div>
);

const LeadManagement = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("/agent/lead/get-all-leads");
      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];
      setLeads(list);
    } catch {
      message.error("Failed to fetch leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const getStatusTag = (status) => {
    const norm = status?.trim()?.toLowerCase() || "";
    let styles = {
      background: "rgba(107, 114, 128, 0.08)",
      color: "#6B7280",
    };

    if (norm === "lead") {
      styles = {
        background: "rgba(92, 3, 155, 0.08)",
        color: "#5c039b",
      };
    } else if (norm === "visit") {
      styles = {
        background: "rgba(124, 58, 237, 0.08)",
        color: "#7c3aed",
      };
    } else if (norm === "deal") {
      styles = {
        background: "rgba(219, 39, 119, 0.08)",
        color: "#db2777",
      };
    } else if (norm === "booking") {
      styles = {
        background: "rgba(2, 132, 199, 0.08)",
        color: "#0284c7",
      };
    } else if (norm === "closed") {
      styles = {
        background: "rgba(16, 185, 129, 0.08)",
        color: "#059669",
      };
    } else if (norm === "lost") {
      styles = {
        background: "rgba(239, 68, 68, 0.08)",
        color: "#dc2626",
      };
    }

    const labelMap = {
      lead: "New Lead",
      visit: "Site Visit",
      deal: "In Deal",
      booking: "Booked",
      closed: "Closed",
      lost: "Lost",
    };

    return (
      <Tag
        style={{
          borderRadius: 20,
          border: "none",
          fontWeight: 700,
          fontSize: 11,
          padding: "5px 12px",
          margin: 0,
          ...styles,
        }}
      >
        {labelMap[norm] || norm.toUpperCase() || "UNKNOWN"}
      </Tag>
    );
  };

  const tableData = leads
    .map((l) => ({
      ...l,
      key: l._id,
      leadName: `${l?.name?.first_name || ""} ${l?.name?.last_name || ""}`.trim() || "—",
      email: l?.email || "—",
      phone: l?.phone_number || "—",
      agentName: `${l?.agent?.first_name || ""} ${l?.agent?.last_name || ""}`.trim() || "—",
      createdAtFormatted: new Date(l.createdAt).toLocaleDateString(),
    }))
    .filter((l) => {
      const matchSearch =
        l.leadName.toLowerCase().includes(searchText.toLowerCase()) ||
        l.email.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });

  const columns = [
    {
      title: "Lead Details",
      key: "leadDetails",
      render: (_, r) => (
        <Space>
          <LeadAvatar name={r.leadName} size={38} />
          <div>
            <Text strong style={{ fontFamily: 'Sora, sans-serif', color: "var(--tx)", fontSize: 13 }}>{r.leadName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Agent",
      dataIndex: "agentName",
      key: "agentName",
      render: (text) => (
        <Tag
          style={{
            borderRadius: 20,
            border: "none",
            fontWeight: 700,
            fontSize: 11,
            padding: "3px 10px",
            margin: 0,
            background: "rgba(92, 3, 155, 0.08)",
            color: "#5c039b",
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Property Type",
      key: "propertyType",
      render: (record) => (
        <Text strong style={{ color: "var(--tx)" }}>
          <CompassOutlined style={{ color: "var(--sb-accent)", marginRight: 6 }} /> {record.property_type || "-"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Date",
      dataIndex: "createdAtFormatted",
      key: "date",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          icon={<EyeOutlined />}
          style={{
            borderRadius: 20,
            borderColor: "var(--border)",
            color: "var(--sb-accent)",
            background: "var(--surface)",
            padding: "4px 16px",
            height: "auto",
            fontWeight: 600,
            fontSize: 12
          }}
          onClick={() => navigate(`/dashboard/${roleSlug}/lead-management/${record._id}`)}
        >
          View Lead
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "28px 24px", background: "var(--bg)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        :root {
          --sb-dark:    #14051f;
          --sb-mid:     #2a1247;
          --sb-accent:  #5c039b;
          --bg:         #faf5ff;
          --surface:    #FFFFFF;
          --surface2:   #f5ebff;
          --surface3:   #e9d5ff;
          --border:     #e9d5ff;
          --border2:    #d8b4fe;
          --tx:         #140D2A;
          --tx-sub:     #4B3D6E;
          --tx-muted:   #8a70a8;
          --pur-soft:   #f3e8ff;
          --pur-mid:    #c084fc;
          --sh-card:    0 2px 8px rgba(92,3,155,0.07);
          --rad-sm:     8px;
        }

        .ant-table {
          background: transparent !important;
          font-family: 'Inter', sans-serif !important;
        }
        .ant-table-thead > tr > th {
          background: var(--surface2) !important;
          color: var(--tx-sub) !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          border-bottom: 1.5px solid var(--border) !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid var(--border) !important;
          font-size: 13px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: var(--pur-soft) !important;
        }

        .ant-btn-default:hover {
          border-color: var(--pur-mid) !important;
          background: var(--pur-soft) !important;
          color: var(--sb-accent) !important;
        }

        .ant-input-affix-wrapper {
          border-color: var(--border) !important;
          border-radius: 20px !important;
        }
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused {
          border-color: var(--sb-accent) !important;
          box-shadow: 0 0 0 2px rgba(92, 3, 155, 0.1) !important;
        }
        .ant-input {
          font-family: 'Inter', sans-serif !important;
        }

        .ant-select-selector {
          border-color: var(--border) !important;
          border-radius: 20px !important;
        }
        .ant-select-focused .ant-select-selector, .ant-select-selector:focus {
          border-color: var(--sb-accent) !important;
          box-shadow: 0 0 0 2px rgba(92, 3, 155, 0.1) !important;
        }

        .ant-pagination-item {
          border-color: var(--border) !important;
          background: var(--surface) !important;
          border-radius: var(--rad-sm) !important;
        }
        .ant-pagination-item a {
          color: var(--tx-sub) !important;
        }
        .ant-pagination-item-active {
          background: var(--sb-accent) !important;
          border-color: var(--sb-accent) !important;
        }
        .ant-pagination-item-active a {
          color: #ffffff !important;
        }
        .ant-pagination-prev .ant-pagination-item-link,
        .ant-pagination-next .ant-pagination-item-link {
          border-color: var(--border) !important;
          background: var(--surface) !important;
          border-radius: var(--rad-sm) !important;
          color: var(--tx-sub) !important;
        }
        .ant-pagination-item:hover,
        .ant-pagination-prev:hover .ant-pagination-item-link,
        .ant-pagination-next:hover .ant-pagination-item-link {
          border-color: var(--pur-mid) !important;
          background: var(--pur-soft) !important;
        }
        .ant-pagination-item:hover a {
          color: var(--sb-accent) !important;
        }
        .ant-pagination-disabled .ant-pagination-item-link {
          border-color: var(--border) !important;
          color: var(--tx-muted) !important;
          opacity: 0.5;
          background: var(--surface) !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto", animation: "fadeUp .3s ease" }}>
        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#5c039b,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(92,3,155,.3)" }}>
              <MessageOutlined style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--tx)", margin: 0, fontFamily: "'Sora', sans-serif" }}>Lead Monitoring</h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--tx-sub)", margin: 0, marginLeft: 48, fontWeight: 500 }}>
            Monitor all leads generated by agents, track their statuses, and view complete details.
          </p>
        </div>

        {/* PIPELINE STATS */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <MiniStat icon={<MessageOutlined />} label="Total Leads" value={leads.length} color="var(--sb-accent)" />
          </Col>
          <Col xs={24} sm={6}>
            <MiniStat icon={<CompassOutlined />} label="Site Visits" value={leads.filter((l) => l.status === "visit").length} color="#7c3aed" />
          </Col>
          <Col xs={24} sm={6}>
            <MiniStat icon={<ClockCircleOutlined />} label="Active Deals" value={leads.filter((l) => l.status === "deal").length} color="#db2777" />
          </Col>
          <Col xs={24} sm={6}>
            <MiniStat icon={<CheckCircleOutlined />} label="Successfully Closed" value={leads.filter((l) => l.status === "closed").length} color="#059669" />
          </Col>
        </Row>

        {/* LEAD TABLE WITH FILTERS */}
        <Card
          bordered={false}
          style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid var(--border)", boxShadow: "var(--sh-card)" }}
          bodyStyle={{ padding: 0 }}
        >
          <div
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px", borderBottom: `1px solid var(--border)`, gap: 12,
              background: "#fff"
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Input
                placeholder="Search by Lead Name or Email..."
                prefix={<SearchOutlined style={{ color: "var(--tx-muted)" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 280, borderRadius: 20 }}
              />
              <Select
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                style={{ width: 180 }}
                placeholder="All Statuses"
              >
                <Option value="all">All Statuses</Option>
                <Option value="lead">New Leads</Option>
                <Option value="visit">Site Visits</Option>
                <Option value="deal">In Deal</Option>
                <Option value="booking">Booked</Option>
                <Option value="closed">Closed</Option>
                <Option value="lost">Lost</Option>
              </Select>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default LeadManagement;
