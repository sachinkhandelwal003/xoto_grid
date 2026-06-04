import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, Modal, Input } from "antd";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../pages/custom/CustomTable";
import {
  Card, Typography, Avatar, Row, Col, Space, message,
  Tooltip, Button, Badge, Tag
} from "antd";
import {
  UserOutlined, EyeOutlined, UsergroupAddOutlined,
  CheckCircleOutlined, ClockCircleOutlined, MailOutlined,
  PhoneOutlined, CloseCircleOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

// ── Normalize agent (handles both old and new field names) ──────────────
const normalizeAgent = (a) => ({
  ...a,
  key: a._id,
  fullName: a.fullName || `${a.first_name || ""} ${a.last_name || ""}`.trim() || "—",
  phone: a.phone || a.phone_number || "—",
  email: a.email || "—",
  location: a.location || a.operating_city || a.country || "—",
  agencyApprovalStatus: a.agencyApprovalStatus || a.agencyApprovalStatus || "pending",
  adminApprovalStatus: a.adminApprovalStatus || "pending",
  profile_photo: a.profile_photo || a.profilePhoto || a.logo || "",
});

const statusTag = (status) => {
  const map = {
    approved: { color: "success", label: "Approved" },
    declined: { color: "error", label: "Declined" },
    pending: { color: "warning", label: "Pending" },
  };
  const s = map[status] || map.pending;
  return <Tag color={s.color}>{s.label}</Tag>;
};

const AgentList = () => {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // Decline modal
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────
  const fetchAgents = async (page = currentPage, limit = itemsPerPage) => {
    setLoading(true);
    try {
      // Assumes you have an admin route that returns agents with new fields
const res = await apiService.get(`/agency/admin/agents?page=${page}&limit=${limit}`);
      const data = res?.data?.data || res?.data || res || [];
      const total = res?.data?.pagination?.totalItems || res?.data?.total || res?.total || data.length;
      const normalized = data
        .map(normalizeAgent)
        .filter(agent => agent.agencyApprovalStatus === "approved");
      setAgents(normalized);
      setTotalItems(total);
    } catch {
      message.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents(1, itemsPerPage);
  }, []);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchAgents(page, size);
  };

  // ── Admin Approve ─────────────────────────────────────────────────────
  const handleAdminApprove = async (agentId) => {
    const agent = agents.find(a => a._id === agentId || a.id === agentId);
    if (agent?.agencyApprovalStatus !== "approved") {
      message.warning("Agency must approve this agent before admin approval.");
      return;
    }

    try {
await apiService.put(`/agency/admin/agents/${agentId}/approve`);
      message.success("Agent approved by admin");
      fetchAgents(currentPage, itemsPerPage);
    } catch (err) {
      message.error(err?.response?.data?.message || "Approval failed");
    }
  };

  // ── Admin Decline (with reason modal) ─────────────────────────────────
  const openDeclineModal = (agentId) => {
    setSelectedAgentId(agentId);
    setDeclineReason("");
    setDeclineModalOpen(true);
  };

  const handleAdminDecline = async () => {
    if (!declineReason.trim()) {
      message.warning("Please provide a reason for declining");
      return;
    }
    try {
await apiService.put(`/agency/admin/agents/${selectedAgentId}/decline`, { reason: declineReason });
      message.success("Agent declined");
      setDeclineModalOpen(false);
      setSelectedAgentId(null);
      fetchAgents(currentPage, itemsPerPage);
    } catch (err) {
      message.error(err?.response?.data?.message || "Decline failed");
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────
  const approvedAgents = agents.filter(a => a.adminApprovalStatus === "approved").length;
  const pendingApprovals = agents.filter(a => a.adminApprovalStatus === "pending").length;

  const stats = [
    {
      title: "Total Agents",
      value: totalItems,
      icon: <UsergroupAddOutlined />,
      color: "#2563eb",
      bg: "#dbeafe",
    },
    {
      title: "Admin Approved",
      value: approvedAgents,
      icon: <CheckCircleOutlined />,
      color: "#059669",
      bg: "#d1fae5",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals,
      icon: <ClockCircleOutlined />,
      color: "#d97706",
      bg: "#fef3c7",
    },
  ];

  const filteredAgents = agents.filter((agent) => {
    if (activeTab === "approved") return agent.adminApprovalStatus === "approved";
    if (activeTab === "rejected") return agent.adminApprovalStatus === "declined";
    return true;
  });

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Agent Profile",
      key: "fullName",
      sortable: true,
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            size={42}
            src={record.profile_photo || null}
            icon={!record.profile_photo && <UserOutlined />}
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontWeight: "bold" }}
          >
            {!record.profile_photo && record.fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: 15, color: "#1f2937", textTransform: "capitalize" }}>
              {record.fullName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {(record._id || record.id)?.slice(-6).toUpperCase()}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info",
      key: "email",
      sortable: true,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 13 }}>
            <MailOutlined style={{ color: "#6b7280", marginRight: 6 }} />{record.email}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <PhoneOutlined style={{ color: "#6b7280", marginRight: 6 }} />
            {record.phone}
          </Text>
        </Space>
      ),
    },
    {
      title: "Location",
      key: "location",
      sortable: true,
      render: (_, record) => (
        <Text style={{ textTransform: "capitalize" }}>{record.location}</Text>
      ),
    },
    {
      title: "Agency Approval",
      key: "agencyApprovalStatus",
      render: (_, record) => statusTag(record.agencyApprovalStatus),
    },
    {
      title: "Admin Status",
      key: "adminApprovalStatus",
      render: (_, record) => {
        if (record.adminApprovalStatus === "pending") {
          const canAdminApprove = record.agencyApprovalStatus === "approved";
          return (
            <Space>
              <Tooltip title={canAdminApprove ? "Approve agent" : "Agency approval is required first"}>
                <span>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    disabled={!canAdminApprove}
                    onClick={() => handleAdminApprove(record._id)}
                  >
                    Approve
                  </Button>
                </span>
              </Tooltip>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => openDeclineModal(record._id)}
              >
                Decline
              </Button>
            </Space>
          );
        }
        return statusTag(record.adminApprovalStatus);
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="View Full Profile">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => {
                const currentPath = window.location.pathname;
                const newPath = currentPath.replace('agent-list', `agents/${record._id}`);
                navigate(newPath);
              }}
              style={{ background: "#5c039b", borderColor: "#5c039b", borderRadius: 6 }}
            >
              View
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ padding: 10, background: "#f3e8ff", borderRadius: 10, color: "#5c039b" }}>
          <UsergroupAddOutlined style={{ fontSize: 24 }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>Agent Management</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Manage all registered platform agents. Approve or decline pending agents.
          </Text>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} md={8} key={i}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: stat.bg, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>{stat.value}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        style={{ marginBottom: 20 }}
        items={[
          { key: "all", label: "All Agents" },
          { key: "approved", label: "Admin Approved" },
          { key: "rejected", label: "Admin Declined" },
        ]}
      />

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 0 }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Registered Agents Directory</Title>
        </div>
        <div style={{ padding: "0 0 24px 0" }}>
          <CustomTable
            columns={columns}
            data={filteredAgents}
            loading={loading}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            showSearch={true}
          />
        </div>
      </Card>

      {/* Decline Reason Modal */}
      <Modal
        title="Decline Agent"
        open={declineModalOpen}
        onOk={handleAdminDecline}
        onCancel={() => {
          setDeclineModalOpen(false);
          setSelectedAgentId(null);
          setDeclineReason("");
        }}
        okText="Decline"
        okButtonProps={{ danger: true }}
      >
        <Text>Please provide a reason for declining this agent:</Text>
        <Input.TextArea
          rows={4}
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          style={{ marginTop: 10 }}
          placeholder="Reason..."
        />
      </Modal>
    </div>
  );
};

export default AgentList;
