import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import {
  Typography, Avatar, Spin, Button, Modal, Input, message, Row, Col,
} from "antd";
import {
  UserOutlined, ArrowLeftOutlined, MailOutlined, PhoneOutlined,
  EnvironmentOutlined, StarOutlined, FileProtectOutlined,
  IdcardOutlined, CheckCircleOutlined, CloseCircleOutlined,
  BankOutlined, TrophyOutlined, TeamOutlined, BarChartOutlined,
  ExclamationCircleOutlined, EyeOutlined, FileTextOutlined,
  CalendarOutlined, GlobalOutlined, ApartmentOutlined,
  SafetyCertificateOutlined, FlagOutlined,UndoOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ── Theme ──────────────────────────────────────────────────────────────────
const T = {
  primary:     "#4A027C",
  primaryLight:"#7C3AED",
  primaryBg:   "#F5F0FF",
  primaryMid:  "#EDE9FE",
  success:     "#059669",
  successBg:   "#ECFDF5",
  error:       "#DC2626",
  errorBg:     "#FEF2F2",
  warning:     "#D97706",
  warningBg:   "#FFFBEB",
  info:        "#2563EB",
  infoBg:      "#DBEAFE",
  border:      "#E5E7EB",
  borderLight: "#F3F4F6",
  cardBg:      "#FFFFFF",
  pageBg:      "#F8F9FB",
  text:        "#0F172A",
  textSub:     "#475569",
  textMuted:   "#94A3B8",
};

// ── Status Badge ───────────────────────────────────────────────────────────
const Badge = ({ status, prefix }) => {
  const map = {
    approved: { bg: T.successBg, color: T.success, dot: "#34D399", label: "Approved"  },
    declined: { bg: T.errorBg,   color: T.error,   dot: "#F87171", label: "Declined"  },
    pending:  { bg: T.warningBg, color: T.warning, dot: "#FCD34D", label: "Pending"   },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.bg, color: s.color,
      padding: "5px 12px", borderRadius: 20,
      fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {prefix} {s.label}
    </span>
  );
};

// ── Metric Card ────────────────────────────────────────────────────────────
const MetricCard = ({ icon, label, value, color, bg }) => (
  <div style={{
    background: T.cardBg,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: "20px 22px",
    display: "flex", alignItems: "center", gap: 16,
    position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: -12, right: -12,
      width: 70, height: 70, borderRadius: "50%",
      background: bg, opacity: 0.35,
    }} />
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, flexShrink: 0, position: "relative",
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T.text, lineHeight: 1.2, marginTop: 2 }}>{value}</div>
    </div>
  </div>
);

// ── Info Row ───────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 12,
    padding: "11px 0",
    borderBottom: `1px solid ${T.borderLight}`,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: T.primaryBg, color: T.primary,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: T.text, fontWeight: 500, wordBreak: "break-word" }}>
        {value || <span style={{ color: T.textMuted, fontStyle: "italic" }}>Not provided</span>}
      </div>
    </div> 
  </div>
);

// ── Section Card ───────────────────────────────────────────────────────────
const SectionCard = ({ title, icon, children, style = {} }) => (
  <div style={{
    background: T.cardBg,
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    overflow: "hidden",
    ...style,
  }}>
    <div style={{
      padding: "13px 18px",
      borderBottom: `1px solid ${T.border}`,
      background: T.borderLight,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ color: T.primary, fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.textSub }}>
        {title}
      </span>
    </div>
    <div style={{ padding: "4px 18px 8px" }}>
      {children}
    </div>
  </div>
);

// ── Document Card ──────────────────────────────────────────────────────────
const DocCard = ({ title, url }) => {
  if (!url) return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px", borderRadius: 10,
      background: T.borderLight,
      border: `2px dashed ${T.border}`,
    }}>
      <FileTextOutlined style={{ color: T.textMuted, fontSize: 18 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.textMuted }}>{title}</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>Not uploaded</div>
      </div>
    </div>
  );

  return (
    <div
      onClick={() => window.open(url, "_blank")}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderRadius: 10, cursor: "pointer",
        background: T.primaryBg,
        border: `1px solid ${T.primaryMid}`,
        transition: "all 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = T.primaryMid;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,2,124,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = T.primaryBg;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 8,
          background: T.cardBg, border: `1px solid ${T.primaryMid}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FileTextOutlined style={{ fontSize: 17, color: T.primary }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>{title}</div>
          <div style={{ fontSize: 11, color: T.primaryLight }}>Click to view</div>
        </div>
      </div>
      <EyeOutlined style={{ color: T.primary, fontSize: 16 }} />
    </div>
  );
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const AgentDetail = () => {
  // id aur agentId dono ko nikal kar check karenge
  const params = useParams();
  const activeId = params.agentId || params.id; 
  
  const navigate    = useNavigate();

  const [agent, setAgent]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal]   = useState(false);
  const [reason, setReason]             = useState("");
  const [reasonError, setReasonError]   = useState("");

  const fetchAgent = async () => {
    setLoading(true);
    try {
      // Yahan agentId ki jagah activeId pass karein
      const res = await apiService.get(`/agency/admin/agents/${activeId}`);
      setAgent(res?.data?.data || res?.data || res);
    } catch {
      message.error("Failed to load agent details");
    } finally {
      setLoading(false);
    }
  };

  // Yahan bhi activeId use karein
  useEffect(() => { 
    if (activeId) fetchAgent(); 
  }, [activeId]);

  const handleApprove = async () => {
    if (agent?.agencyApprovalStatus !== "approved") {
      message.warning("Agency must approve this agent before admin approval.");
      return;
    }

    setActionLoading(true);
    try {
      await apiService.put(`/agency/admin/agents/${agentId}/approve`);
      message.success("Agent approved successfully");
      fetchAgent();
    } catch (err) { message.error(err?.response?.data?.message || "Approval failed"); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!reason.trim()) { setReasonError("Rejection reason is required."); return; }
    setActionLoading(true);
    try {
      await apiService.put(`/agency/admin/agents/${agentId}/decline`, { reason: reason.trim() });
      message.success("Agent declined");
      setRejectModal(false);
      setReason("");
      fetchAgent();
    } catch { message.error("Decline failed"); }
    finally { setActionLoading(false); }
  };
  const handleReset = async () => {
  setActionLoading(true);
  try {
    await apiService.put(`/agency/admin/agents/${agentId}/reset`);
    message.success("Agent reset for re‑approval");
    fetchAgent();
  } catch (err) {
    message.error(err?.response?.data?.message || "Reset failed");
  } finally {
    setActionLoading(false);
  }
};


  // ── Loading ──────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.pageBg }}>
      <Spin size="large" />
    </div>
  );

  if (!agent) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: T.pageBg }}>
      <ExclamationCircleOutlined style={{ fontSize: 48, color: T.textMuted }} />
      <Text style={{ color: T.textMuted }}>Agent not found</Text>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const adminStatus  = agent.adminApprovalStatus  || "pending";
  const agencyStatus = agent.agencyApprovalStatus || "pending";
  const adminPending = adminStatus === "pending";
  const canAdminApprove = agencyStatus === "approved";
  const isDeclined   = adminStatus === "declined";
  const joinedDate   = agent.createdAt
    ? new Date(agent.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div style={{ padding: "24px 28px", background: T.pageBg, minHeight: "100vh" }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ borderRadius: 8, border: `1px solid ${T.border}`, fontWeight: 600, height: 38 }}
          >
            Back
          </Button>
          <div>
            <Title level={4} style={{ margin: 0, color: T.text, fontWeight: 800 }}>Agent Profile</Title>
            <Text style={{ color: T.textMuted, fontSize: 12 }}>ID: <code style={{ background: T.borderLight, padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{agent._id}</code></Text>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {adminPending && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={actionLoading}
              disabled={!canAdminApprove}
              onClick={handleApprove}
              title={canAdminApprove ? "Approve agent" : "Agency approval is required first"}
              style={{ background: T.success, borderColor: T.success, borderRadius: 8, fontWeight: 700, height: 40 }}
            >
              Approve Agent
            </Button>
          )}
        {!isDeclined && (
  <Button
    danger
    icon={<CloseCircleOutlined />}
    onClick={() => { setReason(""); setReasonError(""); setRejectModal(true); }}
    style={{ borderRadius: 8, fontWeight: 700, height: 40 }}
  >
    Decline
  </Button>
)}

{isDeclined && (
  <Button
    type="default"
    icon={<UndoOutlined />}
    onClick={handleReset}
    loading={actionLoading}
    style={{
      borderRadius: 8,
      fontWeight: 700,
      height: 40,
      borderColor: T.warning,
      color: T.warning,
    }}
  >
    Reset for Re‑approval
  </Button>
)}
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div style={{
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        border: `1px solid ${T.border}`,
        background: T.cardBg,
        boxShadow: "0 2px 16px rgba(74,2,124,0.07)",
      }}>
        {/* Gradient top */}
        <div style={{
          height: 100,
          background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryLight} 60%, #A78BFA 100%)`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: -30, left: 60, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        </div>

        <div style={{ padding: "0 28px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: -44 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
              <Avatar
                size={88}
                src={agent.profile_photo || null}
                icon={<UserOutlined />}
                style={{
                  border: "4px solid #fff",
                  boxShadow: "0 6px 20px rgba(74,2,124,0.2)",
                  background: T.primaryBg, color: T.primary,
                  fontSize: 32, fontWeight: 800, flexShrink: 0,
                }}
              >
                {!agent.profile_photo && agent.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div style={{ paddingBottom: 6 }}>
                <Title level={3} style={{ margin: 0, color: T.text, fontWeight: 800, textTransform: "capitalize" }}>
                  {agent.fullName || `${agent.first_name} ${agent.last_name}` || "—"}
                </Title>
                <Text style={{ color: T.textSub, fontSize: 13 }}>
                  {agent.specialization || "Agent"} · {agent.operating_city || "—"}
                </Text>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  <Badge status={agencyStatus} prefix="Agency" />
                  <Badge status={adminStatus}  prefix="Admin"  />
                  {agent.isFlagged && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.warningBg, color: T.warning, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      <FlagOutlined style={{ fontSize: 11 }} /> Flagged
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick info pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 6 }}>
              <span style={{ background: T.borderLight, color: T.textSub, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <CalendarOutlined /> Joined {joinedDate}
              </span>
              <span style={{ background: T.primaryBg, color: T.primary, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <ApartmentOutlined /> {agent.agency?.companyName || "No Agency"}
              </span>
            </div>
          </div>

          {/* Decline note */}
          {agent.adminDeclineNote && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: T.errorBg, border: `1px solid #FECACA`, borderRadius: 10, display: "flex", gap: 10 }}>
              <ExclamationCircleOutlined style={{ color: T.error, fontSize: 15, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: T.error, fontSize: 12, marginBottom: 2 }}>Admin Decline Reason</div>
                <div style={{ color: "#7F1D1D", fontSize: 13 }}>{agent.adminDeclineNote}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {[
          { icon: <BarChartOutlined />, label: "Presentations",  value: agent.presentationsGenerated ?? 0, color: T.info,    bg: T.infoBg    },
          { icon: <TeamOutlined />,     label: "Active Leads",   value: agent.activeLeads ?? 0,            color: T.primary, bg: T.primaryBg },
          { icon: <TrophyOutlined />,   label: "Deals Closed",   value: agent.dealsClosedCount ?? 0,       color: T.success, bg: T.successBg },
          { icon: <BankOutlined />,     label: "Commission (AED)", value: (agent.commissionEarned ?? 0).toLocaleString(), color: T.warning, bg: T.warningBg },
        ].map((m, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <MetricCard {...m} />
          </Col>
        ))}
      </Row>

      {/* ── DETAILS + DOCS ── */}
      <Row gutter={[14, 14]}>

        {/* Personal Info */}
        <Col xs={24} lg={14}>
          <SectionCard title="Personal & Contact Info" icon={<UserOutlined />}>
            <InfoRow icon={<MailOutlined />}             label="Email"           value={agent.email} />
            <InfoRow icon={<PhoneOutlined />}            label="Phone"           value={agent.country_code ? `${agent.country_code} ${agent.phone_number}` : agent.phone_number} />
            <InfoRow icon={<EnvironmentOutlined />}      label="Operating City"  value={agent.operating_city} />
            <InfoRow icon={<GlobalOutlined />}           label="Country"         value={agent.country} />
            <InfoRow icon={<StarOutlined />}             label="Specialization"  value={agent.specialization} />
            <InfoRow icon={<ApartmentOutlined />}        label="Agency"          value={agent.agency?.companyName} />
            <InfoRow icon={<SafetyCertificateOutlined />} label="RERA Card No."  value={agent.reraCardNumber} />
            <InfoRow icon={<CalendarOutlined />}         label="Joined"          value={joinedDate} />
          </SectionCard>
        </Col>

        {/* Right column */}
        <Col xs={24} lg={10}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Documents */}
            <SectionCard title="Documents" icon={<FileProtectOutlined />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0" }}>
                <DocCard title="Emirates ID"       url={agent.emiratesIdUrl} />
                <DocCard title="RERA Certificate"  url={agent.reraCardUrl}   />
              </div>
            </SectionCard>

            {/* Approval Timeline */}
            <SectionCard title="Approval Timeline" icon={<CalendarOutlined />}>
              <InfoRow
                icon={<CheckCircleOutlined />}
                label="Agency Approved At"
                value={agent.agencyApprovedAt ? new Date(agent.agencyApprovedAt).toLocaleString("en-AE") : null}
              />
              <InfoRow
                icon={<CheckCircleOutlined />}
                label="Admin Approved At"
                value={agent.adminApprovedAt ? new Date(agent.adminApprovedAt).toLocaleString("en-AE") : null}
              />
              {agent.agencyDeclineNote && (
                <InfoRow icon={<CloseCircleOutlined />} label="Agency Decline Note" value={agent.agencyDeclineNote} />
              )}
            </SectionCard>

            {/* Platform Access */}
            <div style={{
              background: agent.canAccessPlatform ? T.successBg : T.warningBg,
              border: `1px solid ${agent.canAccessPlatform ? "#A7F3D0" : "#FDE68A"}`,
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: agent.canAccessPlatform ? "#D1FAE5" : "#FEF3C7",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                color: agent.canAccessPlatform ? T.success : T.warning, flexShrink: 0,
              }}>
                {agent.canAccessPlatform ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: agent.canAccessPlatform ? T.success : T.warning }}>
                  {agent.canAccessPlatform ? "Platform Access Granted" : "Platform Access Restricted"}
                </div>
                <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
                  {agent.canAccessPlatform
                    ? "Agent is fully approved and active"
                    : "Awaiting agency + admin approval"}
                </div>
              </div>
            </div>

          </div>
        </Col>
      </Row>

      {/* ── DECLINE MODAL ── */}
      <Modal
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CloseCircleOutlined style={{ color: T.error }} />
            <span style={{ fontWeight: 700 }}>Decline Agent</span>
          </div>
        }
        footer={null}
        centered
        destroyOnClose
        width={480}
        styles={{ content: { borderRadius: 14 } }}
      >
        <div style={{ padding: "8px 0 0" }}>
          <Text style={{ fontSize: 13, color: T.textSub }}>
            Please provide a reason for declining this agent. This will be saved and visible to admin.
          </Text>
          <div style={{ marginTop: 12 }}>
            <Text strong style={{ fontSize: 13 }}>
              Reason <span style={{ color: T.error }}>*</span>
            </Text>
            <TextArea
              rows={4}
              placeholder="e.g. Incomplete documentation, invalid RERA certificate..."
              value={reason}
              onChange={e => { setReason(e.target.value); setReasonError(""); }}
              style={{ marginTop: 8, borderRadius: 8, borderColor: reasonError ? T.error : T.border, fontSize: 13 }}
            />
            {reasonError && (
              <Text style={{ color: T.error, fontSize: 12, marginTop: 4, display: "block" }}>{reasonError}</Text>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Button onClick={() => setRejectModal(false)} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button
              danger
              loading={actionLoading}
              onClick={handleReject}
              icon={<CloseCircleOutlined />}
              style={{ borderRadius: 8, fontWeight: 700 }}
            >
              Confirm Decline
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AgentDetail;
