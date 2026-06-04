import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card, Typography, Avatar, Button, Tag, Input, Modal, Row, Col, Tooltip, Tabs, Popconfirm, message
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined,
  CheckCircleOutlined, CloseCircleOutlined, EnvironmentOutlined,
  IdcardOutlined, FileTextOutlined, TrophyOutlined,
  TeamOutlined, EyeOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import CustomTable from "../../CMS/pages/custom/CustomTable"
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

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

const getInitials = (name="") => name.split(" ").map((w)=>w[0]||"").join("").toUpperCase().slice(0,2);
const getAvatarColor = (name="") => {
  const h = name.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

const normalizeAgent = (a, idx, page, limit) => ({
  ...a,
  key:       a._id,
  sno:       (page - 1) * limit + idx + 1,
  name:      a.fullName || `${a.first_name || ""} ${a.last_name || ""}`.trim() || "—",
  fullName:  a.fullName || `${a.first_name || ""} ${a.last_name || ""}`.trim() || "—",
  phone:     a.phone || a.phone_number || "—",
  email:     a.email || "—",
  location:  a.location || a.operating_city || a.country || "—",
  city:      a.operating_city || a.city || a.country || "—",
  country:   a.country || "UAE",
  avatar:    a.profile_photo || null,
  profile_photo: a.profile_photo || null,
  status:    a.is_active ?? a.status ?? true,
  is_active: a.is_active ?? a.status ?? true,
  specialization: a.specialization || "",
  experience: a.experience_years || a.experience || 0,
  experience_years: a.experience_years || a.experience || 0,
  reraNumber: a.rera_number || "",
  rera_number: a.rera_number || "",
  idProof: a.id_proof || null,
  id_proof: a.id_proof || null,
  reraCertificate: a.rera_certificate || null,
  rera_certificate: a.rera_certificate || null,
  agencyApprovalStatus: a.agencyApprovalStatus || "pending",
  adminApprovalStatus: a.adminApprovalStatus || "pending",
});

const AgentAvatar = ({ name="", src, size=40 }) => (
  <div style={{ position:"relative", display:"inline-block", flexShrink:0 }}>
    {src
      ? <Avatar src={src} size={size} style={{ border: "2px solid #ffffff" }} />
      : <Avatar size={size} style={{ background: getAvatarColor(name), color: "#ffffff", fontWeight: 700, border: "2px solid #ffffff" }}>{getInitials(name)}</Avatar>
    }
  </div>
);

const StatusPill = ({ active }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, border:"1px solid", background:active?"rgba(16, 185, 129, 0.08)":"rgba(239, 68, 68, 0.08)", borderColor:active?"rgba(16, 185, 129, 0.2)":"rgba(239, 68, 68, 0.2)", color:active?"#059669":"#dc2626" }}>
    {active ? "Active" : "Inactive"}
  </span>
);

const ApprovalStatusTag = ({ status }) => {
  const map = {
    approved: { color: "success", label: "Approved" },
    declined: { color: "error", label: "Declined" },
    pending: { color: "warning", label: "Pending" },
  };
  const s = map[status] || map.pending;
  return <Tag color={s.color}>{s.label}</Tag>;
};

const getSpecializationTag = (spec) => {
  if (!spec) return <span style={{ color: "var(--pur-mid)", fontSize: 12 }}>--</span>;
  const text = spec.trim();
  const lower = text.toLowerCase();

  let styles = {
    background: "rgba(92, 3, 155, 0.08)",
    color: "#5c039b",
  };

  if (lower.includes("commercial")) {
    styles = {
      background: "rgba(219, 39, 119, 0.08)",
      color: "#db2777",
    };
  } else if (lower.includes("industrial")) {
    styles = {
      background: "rgba(124, 58, 237, 0.08)",
      color: "#7c3aed",
    };
  } else if (lower.includes("residential")) {
    styles = {
      background: "rgba(92, 3, 155, 0.08)",
      color: "#5c039b",
    };
  } else {
    styles = {
      background: "rgba(192, 132, 252, 0.08)",
      color: "#c084fc",
    };
  }

  return (
    <Tag style={{ borderRadius: 20, border: "none", fontWeight: 700, fontSize: 11, padding: "3px 10px", margin: 0, ...styles }}>
      {text}
    </Tag>
  );
};


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

const DetailRow = ({ icon, label, value, valueStyle = {} }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--pur-soft)', color: 'var(--sb-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--tx)', fontWeight: 500, wordBreak: 'break-word', ...valueStyle }}>
        {value ?? <span style={{ color: 'var(--pur-mid)' }}>—</span>}
      </div>
    </div>
  </div>
);

const ModalSection = ({ title, icon, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid var(--pur-soft)` }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--sb-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
        {icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--sb-accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);

const ViewAgentModal = ({ open, onClose, agent, onApprove, onDecline }) => {
  if (!agent) return null;
  const isActive = agent.is_active ?? agent.status ?? true;
  const isPending = agent.agencyApprovalStatus === "pending";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      closable={true}
      width={640}
      centered
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--pur-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserOutlined style={{ color: 'var(--sb-accent)', fontSize: 14 }} />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--tx)', fontFamily: 'Sora, sans-serif' }}>Agent Profile Details</span>
        </div>
      }
      styles={{
        content: { borderRadius: 16, padding: "24px" }
      }}
    >
      <div style={{ marginTop: 20 }}>
        {/* Profile Overview Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--surface2)', borderRadius: 12, marginBottom: 20, border: '1px solid var(--border)' }}>
          <AgentAvatar name={agent.name} src={agent.avatar} size={60} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)', fontFamily: 'Sora, sans-serif' }}>{agent.name}</div>
            <div style={{ fontSize: 12, color: 'var(--tx-muted)', marginTop: 2 }}>{agent.email}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <StatusPill active={isActive} />
            <ApprovalStatusTag status={agent.agencyApprovalStatus} />
          </div>
        </div>

        {/* Details Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <ModalSection title="Contact Info" icon={<PhoneOutlined />}>
            <DetailRow icon={<MailOutlined />} label="Email Address" value={agent.email} />
            <DetailRow icon={<PhoneOutlined />} label="Phone Number" value={agent.phone} />
            <DetailRow icon={<EnvironmentOutlined />} label="Operating City" value={agent.city} />
          </ModalSection>

          <ModalSection title="Professional Details" icon={<TrophyOutlined />}>
            <DetailRow icon={<TrophyOutlined />} label="Experience" value={agent.experience ? `${agent.experience} Years` : "—"} />
            <DetailRow icon={<FileTextOutlined />} label="Specialization" value={agent.specialization} />
            <DetailRow icon={<IdcardOutlined />} label="RERA License" value={agent.reraNumber ? <>{agent.reraNumber} <span style={{ color: 'var(--sb-accent)', fontWeight: 'bold' }}>✓</span></> : "Not Registered"} />
          </ModalSection>
        </div>

        {/* Documents Section */}
        {(agent.idProof || agent.reraCertificate) && (
          <ModalSection title="Verified Documents" icon={<FileTextOutlined />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {agent.idProof && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-sub)' }}>🪪 ID Proof Document</span>
                  <a href={agent.idProof} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: 'var(--sb-accent)', color: '#fff', textDecoration: 'none' }}>View</a>
                </div>
              )}
              {agent.reraCertificate && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-sub)' }}>📜 RERA License Certificate</span>
                  <a href={agent.reraCertificate} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: 'var(--sb-accent)', color: '#fff', textDecoration: 'none' }}>View</a>
                </div>
              )}
            </div>
          </ModalSection>
        )}

        {/* Footer Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          {isPending && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  onApprove(agent._id);
                  onClose();
                }}
                style={{ background: THEME.success, borderColor: THEME.success, borderRadius: 20 }}
              >
                Approve Agent
              </Button>
              <Button 
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  onDecline(agent);
                }}
                style={{ 
                  background: THEME.errorBg, 
                  borderColor: THEME.error, 
                  color: THEME.error, 
                  borderRadius: 20,
                  fontWeight: 600
                }}
              >
                Decline Agent
              </Button>
            </div>
          )}
          <Button onClick={onClose} style={{ borderRadius: 20, borderColor: 'var(--border)', color: 'var(--tx-sub)', marginLeft: isPending ? 'auto' : 0 }}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const AgencyAgentList = () => {
  const [agents,    setAgents]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalResults: 0, itemsPerPage: 20,
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const searchTimeout = useRef(null);

  const fetchAgents = useCallback(async (
    page = 1, limit = 20, searchVal = "", tab = activeTab
  ) => {
    setLoading(true);
    try {
      let url = `/agency/agents?page=${page}&limit=${limit}`;
      if (tab && tab !== "all") url += `&status=${tab}`;
      if (searchVal?.trim())    url += `&search=${encodeURIComponent(searchVal.trim())}`;

      const res  = await apiService.get(url);
      const data = res?.data.data || res;

      const mapped = (data?.data || []).map((a, i) =>
        normalizeAgent(a, i, page, limit)
      );

      setAgents(mapped);
      setPagination({
        currentPage:  page,
        totalPages:   data?.pagination?.pages || 1,
        totalResults: data?.pagination?.total || mapped.length,
        itemsPerPage: data?.pagination?.limit || limit,
      });
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAgents(1, pagination.itemsPerPage, search, activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() =>
      fetchAgents(1, pagination.itemsPerPage, val, activeTab), 500
    );
  };

  const handleView = (agent) => {
    setSelectedAgent(agent);
    setViewModalOpen(true);
  };

  const handleApprove = async (agentId) => {
    try {
      await apiService.patch(`/agency/agents/${agentId}/approve`);
      message.success("Agent approved successfully!");
      fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to approve agent");
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      message.warning("Please provide a reason for declining");
      return;
    }
    try {
      await apiService.patch(`/agency/agents/${selectedAgent._id}/decline`, { reason: declineReason });
      message.success("Agent declined successfully!");
      setDeclineModalOpen(false);
      setSelectedAgent(null);
      setDeclineReason("");
      fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to decline agent");
    }
  };

  const openDeclineModal = (agent) => {
    setSelectedAgent(agent);
    setDeclineReason("");
    setDeclineModalOpen(true);
  };

  const handleSuspend = async (agentId) => {
    setActionLoading(true);
    try {
      await apiService.patch(`/agency/agents/${agentId}/suspend`, {});
      message.success("Agent suspended successfully!");
      fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to suspend agent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async (agentId) => {
    setActionLoading(true);
    try {
      await apiService.patch(`/agency/agents/${agentId}/unsuspend`);
      message.success("Agent unsuspended successfully!");
      fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab);
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to unsuspend agent");
    } finally {
      setActionLoading(false);
    }
  };

  const total = agents.length;
  const pending = agents.filter(a => a.agencyApprovalStatus === "pending").length;
  const approved = agents.filter(a => a.agencyApprovalStatus === "approved").length;

  const columns = [
    {
      key: "name", title: "Agent", sortable: true,
      render: (_, agent) => (
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <AgentAvatar name={agent.name} src={agent.avatar} size={38} />
          <div>
            <Text strong style={{ fontFamily: 'Sora, sans-serif', color: 'var(--tx)', fontSize: 13 }}>{agent.name}</Text>
            <div style={{ fontSize:11, color:"var(--tx-muted)", display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
              <MailOutlined style={{ fontSize:10, color:"var(--sb-accent)" }} />
              <span>{agent.email||"--"}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "phone", title: "Contact",
      render: (_, agent) => (
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <div style={{ fontSize:12, color:"var(--tx-sub)", display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
            <PhoneOutlined style={{ color:"var(--sb-accent)", fontSize:11 }} />
            {agent.phone ? <a href={`tel:${agent.phone}`} style={{ color:"inherit", textDecoration:"none" }}>{agent.phone}</a> : "--"}
          </div>
        </div>
      ),
    },
    {
      key: "city", title: "City", sortable: true,
      render: (_, agent) => (
        <div>
          <div style={{ fontSize:12, color:"var(--tx-sub)", display:"flex", alignItems:"center", gap:5, fontWeight:600 }}>
            <EnvironmentOutlined style={{ color:"var(--sb-accent)", fontSize:11 }} />{agent.city||"--"}
          </div>
        </div>
      ),
    },
    {
      key: "specialization", title: "Specialization", sortable: true,
      render: (val, agent) => getSpecializationTag(agent.specialization),
    },
    {
      key: "agencyApproval", title: "Agency Approval",
      render: (_, agent) => <ApprovalStatusTag status={agent.agencyApprovalStatus} />,
    },
    {
      key: "actions", title: "Actions",
      render: (_, agent) => (
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />}
              onClick={()=>handleView(agent)}
              style={{ width:34, height:34, borderRadius:"50%", border:"1px solid var(--border)", color:"var(--sb-accent)", background:"var(--surface)" }}
            />
          </Tooltip>
          {agent.agencyApprovalStatus === "pending" && (
            <>
              <Tooltip title="Approve Agent">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(agent._id)}
                  style={{ width:34, height:34, borderRadius:"50%", border:"1px solid #10b981", color:"#10b981", background:"rgba(16,185,129,0.08)" }}
                />
              </Tooltip>
              <Tooltip title="Decline Agent">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => openDeclineModal(agent)}
                  style={{ width:34, height:34, borderRadius:"50%", border:"1px solid #ef4444", color:"#ef4444", background:"rgba(239,68,68,0.08)" }}
                />
              </Tooltip>
            </>
          )}
          {agent.agencyApprovalStatus === "approved" && (
            agent.status ? (
              <Tooltip title="Suspend Agent">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleSuspend(agent._id)}
                  loading={actionLoading}
                  style={{ width:34, height:34, borderRadius:"50%", border:"1px solid #d97706", color:"#d97706", background:"rgba(217,119,6,0.08)" }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Unsuspend Agent">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleUnsuspend(agent._id)}
                  loading={actionLoading}
                  style={{ width:34, height:34, borderRadius:"50%", border:"1px solid #10b981", color:"#10b981", background:"rgba(16,185,129,0.08)" }}
                />
              </Tooltip>
            )
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding:"28px 24px", background:"var(--bg)", minHeight:"100vh", fontFamily:"'Inter',sans-serif" }}>
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
          --sh-sm:  0 1px 3px rgba(92,3,155,0.07), 0 1px 2px rgba(0,0,0,0.04);
          --sh-md:  0 4px 16px rgba(92,3,155,0.11), 0 2px 4px rgba(0,0,0,0.04);
          --sh-lg:  0 14px 40px rgba(92,3,155,0.15), 0 4px 8px rgba(0,0,0,0.06);
          --sh-card:0 2px 8px rgba(92,3,155,0.07);
          --rad:    12px;
          --rad-sm: 8px;
          --rad-xs: 6px;
        }

        /* Customize CustomTable inside our theme */
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

        /* Action View Button Hover */
        .ant-btn-text:hover {
          border-color: var(--pur-mid) !important;
          background: var(--pur-soft) !important;
          color: var(--sb-accent) !important;
        }

        /* Search input theme overrides */
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

        /* Refresh Button theme overrides */
        .ant-btn:not(.ant-btn-text) {
          border-color: var(--border) !important;
        }
        .ant-btn:not(.ant-btn-text):hover {
          border-color: var(--sb-accent) !important;
          color: var(--sb-accent) !important;
        }

        /* Pagination Style overrides */
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

      <div style={{ maxWidth: 1300, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, gap:10, flexWrap:"wrap", animation:"fadeUp .3s ease" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#5c039b,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 16px rgba(92,3,155,.3)" }}><TeamOutlined style={{ color:"#fff", fontSize:18 }} /></div>
              <h1 style={{ fontSize:24, fontWeight:800, color:"var(--tx)", margin:0, fontFamily:"'Sora', sans-serif" }}>Agent Team</h1>
            </div>
            <p style={{ fontSize:13, color:"var(--tx-sub)", margin:0, marginLeft:48, fontWeight:500 }}>Manage and monitor your partner's real estate agents</p>
          </div>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          {[
            { icon: <TeamOutlined />, label: "Total Agents", value: total, color: "var(--sb-accent)" },
            { icon: <CheckCircleOutlined />, label: "Approved", value: approved, color: "var(--success)" },
            { icon: <ClockCircleOutlined />, label: "Pending", value: pending, color: "#d97706" },
          ].map((stat, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <MiniStat {...stat} />
            </Col>
          ))}
        </Row>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: 20 }}
          items={[
            { key: 'all', label: 'All Agents' },
            { key: 'pending', label: 'Pending Approval' },
            { key: 'approved', label: 'Approved' },
            { key: 'declined', label: 'Declined' },
          ]}
        />

        {/* Table Card */}
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
                placeholder="Search name, email, phone..."
                prefix={<FiSearch style={{ color: "var(--tx-muted)" }} />}
                value={search}
                onChange={handleSearch}
                allowClear
                onClear={() => { setSearch(""); fetchAgents(1, pagination.itemsPerPage, "", activeTab); }}
                style={{ width: 260, borderRadius: 20 }}
              />
              <Button
                icon={<FiRefreshCw size={14} />}
                onClick={() => fetchAgents(pagination.currentPage, pagination.itemsPerPage, search, activeTab)}
                style={{ borderRadius: 20 }}
              >
                Refresh
              </Button>
            </div>
          </div>

          <CustomTable
            columns={columns}
            data={agents}
            loading={loading}
            totalItems={pagination.totalResults}
            currentPage={pagination.currentPage}
            onPageChange={(page, limit) => fetchAgents(page, limit, search, activeTab)}
            scroll={{ x: 1050 }}
            showSearch={false}
          />
        </Card>
      </div>

      <ViewAgentModal 
        open={viewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        agent={selectedAgent}
        onApprove={handleApprove}
        onDecline={openDeclineModal}
      />

      {/* Decline Modal */}
      <Modal
        title="Decline Agent"
        open={declineModalOpen}
        onOk={handleDecline}
        onCancel={() => {
          setDeclineModalOpen(false);
          setSelectedAgent(null);
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

export default AgencyAgentList;
