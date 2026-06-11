import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { notification, Modal, Input } from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  primary:     "#7C3AED",
  primaryDark: "#5B21B6",
  primaryLight:"#A78BFA",
  bg:          "#FAF8FF",
  border:      "#E9E2FF",
  text:        "#1E1B3B",
  textMuted:   "#6B5B9B",
  white:       "#FFFFFF",
  success:     "#10B981",
  warning:     "#F59E0B",
  error:       "#EF4444",
  suspended:   "#F97316",
};

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:      { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  inactive:    { bg: "#F1F5F9", color: "#475569", label: "Inactive" },
  suspended:   { bg: "#FEF3C7", color: "#92400E", label: "Suspended" },
  deactivated: { bg: "#FEE2E2", color: "#991B1B", label: "Deactivated" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconBan = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4.5 4.5l11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M4 10l4.5 4.5L16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="13" rx="2" stroke={C.textMuted} strokeWidth="1.4"/>
    <path d="M2 7l8 5 8-5" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconPhone = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M3 3h4l2 4-2.5 1.5a11 11 0 005 5L13 11l4 2v4a1 1 0 01-1 1C6.4 18 2 13.6 2 4a1 1 0 011-1z" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconBuilding = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="3" width="16" height="15" rx="1.5" stroke={C.textMuted} strokeWidth="1.4"/>
    <path d="M7 18V12h6v6" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M6 7h2M12 7h2M6 11h2M12 11h2" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={C.textMuted} strokeWidth="1.4"/>
    <path d="M10 6v4l3 3" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="7" r="4" stroke={C.textMuted} strokeWidth="1.4"/>
    <path d="M2 18c0-4 3.6-7 8-7s8 3 8 7" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={C.primary} strokeWidth="1.4"/>
    <circle cx="10" cy="10" r="4" stroke={C.primary} strokeWidth="1.4"/>
    <circle cx="10" cy="10" r="1.5" fill={C.primary}/>
  </svg>
);
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.5l-4.9 2.7.9-5.5-4-3.9 5.6-.8z" stroke={C.primary} strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${C.bg} 0%, #F0EBFF 100%)`,
    padding: "36px 24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: { maxWidth: 1000, margin: "0 auto" },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    background: C.white,
    color: C.textMuted,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 24,
    transition: "all 0.15s ease",
    outline: "none",
  },
  heroCard: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: "28px 32px",
    marginBottom: 20,
    boxShadow: "0 4px 24px rgba(124,58,237,0.08)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },
  heroLeft: { display: "flex", alignItems: "center", gap: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: "50%",
    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 26, fontWeight: 700, color: C.white,
    flexShrink: 0, userSelect: "none",
    boxShadow: "0 6px 20px rgba(124,58,237,0.25)",
  },
  heroName: { fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 },
  heroMeta: { display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8 },
  metaItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textMuted },
  empId: {
    fontFamily: "monospace", fontSize: 13, fontWeight: 700,
    background: "#F3E8FF", color: C.primary,
    padding: "4px 12px", borderRadius: 8,
    display: "inline-block", marginBottom: 4,
  },
  heroActions: { display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 20 },
  card: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(124,58,237,0.05)",
  },
  cardHeader: {
    padding: "16px 22px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", gap: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: 600, color: C.text },
  cardBody: { padding: "20px 22px" },
  row: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "10px 0",
    borderBottom: `1px solid #F5F3FF`,
  },
  rowLabel: { fontSize: 12, color: C.textMuted, fontWeight: 500 },
  rowValue: { fontSize: 13, color: C.text, fontWeight: 500, textAlign: "right", maxWidth: "60%" },
  chip: {
    padding: "4px 12px", borderRadius: 20,
    fontSize: 11, fontWeight: 500,
    border: `1.5px solid ${C.border}`,
    background: "#F5F3FF", color: C.primary,
    display: "inline-block", margin: "3px",
  },
  chipEmpty: { fontSize: 12, color: C.textMuted, fontStyle: "italic" },
  progressBar: {
    height: 8, borderRadius: 6, background: "#F1F5F9",
    overflow: "hidden", flex: 1,
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px", borderRadius: 10,
    border: "1.5px solid", fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s ease",
    outline: "none", background: "transparent",
  },
  skeletonLine: {
    height: 14, borderRadius: 6,
    background: "linear-gradient(90deg, #f0ebff 25%, #e9e2ff 50%, #f0ebff 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6, display: "block",
  },
};

// ─── Small Helpers ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
      {cfg.label}
    </span>
  );
};

const InfoRow = ({ label, value, children }) => (
  <div style={S.row}>
    <span style={S.rowLabel}>{label}</span>
    <span style={S.rowValue}>{children || value || <span style={{ color: C.textMuted, fontStyle: "italic" }}>Not set</span>}</span>
  </div>
);

const SectionCard = ({ icon, title, children }) => (
  <div style={S.card}>
    <div style={S.cardHeader}>
      {icon}
      <span style={S.cardTitle}>{title}</span>
    </div>
    <div style={S.cardBody}>{children}</div>
  </div>
);

const ChipList = ({ items }) =>
  items?.length > 0
    ? <div>{items.map(i => <span key={i} style={S.chip}>{i}</span>)}</div>
    : <span style={S.chipEmpty}>None selected</span>;

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" }) : "—";
const formatDateTime = (d) => d ? new Date(d).toLocaleString("en-AE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never";

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const Skeleton = () => (
  <>
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div style={{ ...S.heroCard, flexDirection: "column" }}>
      {[80, 200, 140].map((w, i) => (
        <div key={i} style={{ ...S.skeletonLine, width: w }} />
      ))}
    </div>
    <div style={S.grid2}>
      {[1, 2].map(i => (
        <div key={i} style={S.card}>
          <div style={S.cardBody}>
            {[100, 160, 130, 80].map((w, j) => (
              <div key={j} style={{ ...S.skeletonLine, width: w }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdvisorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [suspendModal, setSuspendModal] = useState({ open: false, action: "suspend", reason: "" });
  const [suspending, setSuspending] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const notify = (type, msg, desc) => api[type]({ message: msg, description: desc, placement: "topRight", duration: 4 });

useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(`/GridAdvisor/${id}`);
        
        
        
        // Try all possible response structures
        const advisorData = 
          res.data?.data?.advisor ||   // { data: { advisor: {} } }
          res.data?.data ||             // { data: {} }
          res.data?.advisor ||          // { advisor: {} }
          res.data;                     // {}
          
        
        setAdvisor(advisorData);
        
      } catch (err) {
        console.error("FETCH ERROR 👉", err);
        notify("error", "Failed to load advisor", err?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ── Suspend / Reinstate ──
  const handleSuspendConfirm = async () => {
    const { action, reason } = suspendModal;
    setSuspending(true);
    try {
      const res = await apiService.patch(`/GridAdvisor/${id}/suspend`, {
        action,
        ...(action === "suspend" && { reason }),
      });
      notify(
        "success",
        action === "suspend" ? "Advisor Suspended" : "Advisor Reinstated",
        action === "suspend" ? "Advisor has lost access." : "Advisor can now log in."
      );
      // Optimistically update local status
      setAdvisor(prev => ({
        ...prev,
        status: res.data.data.status,
        deactivationReason: res.data.data.deactivationReason,
        deactivatedAt: res.data.data.deactivatedAt,
      }));
      setSuspendModal({ open: false, action: "suspend", reason: "" });
    } catch (err) {
      notify("error", "Action Failed", err?.response?.data?.message || "Something went wrong");
    } finally {
      setSuspending(false);
    }
  };

  // ── Profile completion pct color ──
  const pctColor = (pct) => pct === 100 ? C.success : pct >= 50 ? C.warning : C.error;

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <div style={{ ...S.backBtn, width: 90, height: 36, borderRadius: 10, background: "#F0EBFF" }} />
          <Skeleton />
        </div>
      </div>
    );
  }


if (!advisor) return (
  <div style={{ padding: 40, textAlign: "center", color: "red" }}>
    No advisor data found. Check console for API response structure.
  </div>
);

  const initials = `${advisor.firstName?.[0] || ""}${advisor.lastName?.[0] || ""}`.toUpperCase();
  const pct = advisor.profileCompletion?.percentage ?? 0;

  return (
    <>
      {contextHolder}
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .detail-page { animation: fadeUp 0.3s ease; }
        .back-btn:hover { background: #F5F3FF !important; color: ${C.primary} !important; }
      `}</style>

      <div style={S.page} className="detail-page">
        <div style={S.container}>

          {/* ── Back Button ── */}
         <button
  className="back-btn"
  style={S.backBtn}
  onClick={() => navigate(-1)}
>
  <IconBack /> Back to Advisors
</button>

          {/* ── Hero Card ── */}
          <div style={S.heroCard}>
            <div style={S.heroLeft}>
              <div style={S.avatar}>{initials}</div>
              <div>
                
                <div style={S.heroName}>{advisor.firstName} {advisor.lastName}</div>
                <StatusBadge status={advisor.status} />
                <div style={S.heroMeta}>
                  <span style={S.metaItem}><IconMail /> {advisor.email}</span>
                  <span style={S.metaItem}><IconPhone /> {advisor.phone}</span>
                  {advisor.department && (
                    <span style={S.metaItem}><IconBuilding /> {advisor.department}</span>
                  )}
                  <span style={S.metaItem}><IconClock /> Last login: {formatDateTime(advisor.lastLoginAt)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={S.heroActions}>
              {advisor.status === "suspended" ? (
                <button
                  style={{ ...S.actionBtn, borderColor: "#BBF7D0", color: C.success }}
                  onClick={() => setSuspendModal({ open: true, action: "unsuspend", reason: "" })}
                >
                  <IconCheck /> Reinstate
                </button>
              ) : advisor.status !== "deactivated" ? (
                <button
                  style={{ ...S.actionBtn, borderColor: "#FED7AA", color: C.suspended }}
                  onClick={() => setSuspendModal({ open: true, action: "suspend", reason: "" })}
                >
                  <IconBan /> Suspend
                </button>
              ) : null}
            </div>
          </div>

          {/* ── Profile Completion Bar ── */}
          {/* <div style={{
            ...S.card, marginBottom: 20, padding: 0,
          }}>
            <div style={{ ...S.cardBody, padding: "16px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>PROFILE COMPLETION</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: pctColor(pct) }}>{pct}%</span>
              </div>
              <div style={S.progressBar}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: `linear-gradient(90deg, ${pctColor(pct)}, ${pctColor(pct)}CC)`,
                  borderRadius: 6, transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                {[
                  { label: "Basic Info", done: advisor.profileCompletion?.basicInfo },
                  { label: "Identity",   done: advisor.profileCompletion?.identity },
                  { label: "Bank Details", done: advisor.profileCompletion?.bankDetails },
                ].map(({ label, done }) => (
                  <span key={label} style={{
                    fontSize: 11, fontWeight: 600,
                    color: done ? C.success : C.textMuted,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: done ? C.success : C.border,
                      display: "inline-block",
                    }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div> */}

          {/* ── Two-col grid ── */}
          <div style={S.grid2}>

            {/* Contact & Identity */}
            <SectionCard icon={<IconUser />} title="Contact & Identity">
              <InfoRow label="First Name"   value={advisor.firstName} />
              <InfoRow label="Last Name"    value={advisor.lastName} />
              <InfoRow label="Email"        value={advisor.email} />
              <InfoRow label="Phone"        value={advisor.phone} />
              <InfoRow label="Nationality"  value={advisor.nationality} />
              <InfoRow label="Location"     value={advisor.location} />
              <InfoRow label="Department"   value={advisor.department} />
              <InfoRow label="Role"         value={advisor.role} />
              <InfoRow label="Must Reset PW">
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                  background: advisor.mustResetPassword ? "#FEF3C7" : "#D1FAE5",
                  color: advisor.mustResetPassword ? "#92400E" : "#065F46",
                }}>
                  {advisor.mustResetPassword ? "Yes" : "No"}
                </span>
              </InfoRow>
            </SectionCard>

            {/* Performance */}
            <SectionCard icon={<IconStar />} title="Performance & Workload">
              <InfoRow label="Composite Score"    value={advisor.leaderboard?.compositeScore ?? 0} />
              <InfoRow label="Deals Closed"       value={advisor.leaderboard?.dealsClosedCount ?? 0} />
              <InfoRow label="Conversion Rate"    value={`${advisor.leaderboard?.conversionRate ?? 0}%`} />
              <InfoRow label="Avg Response Time"  value={advisor.leaderboard?.avgResponseTimeHrs != null ? `${advisor.leaderboard.avgResponseTimeHrs}h` : "—"} />
              <InfoRow label="Active Leads"       value={advisor.workload?.activeLeadsCount ?? 0} />
              <InfoRow label="Active Applications" value={advisor.workload?.activeApplicationsCount ?? 0} />
              <InfoRow label="Total Leads"        value={advisor.workload?.totalLeadsAssigned ?? 0} />
              <InfoRow label="Deals Completed"    value={advisor.workload?.totalDealsCompleted ?? 0} />
            </SectionCard>

          </div>

          {/* ── Specialisation ── */}
          <SectionCard icon={<IconTarget />} title="Specialisation">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Property Types
                </div>
                <ChipList items={advisor.specialisation?.propertyTypes} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Listing Types
                </div>
                <ChipList items={advisor.specialisation?.listingTypes} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Preferred Locations
                </div>
                <ChipList items={advisor.specialisation?.locations} />
              </div>
            </div>
          </SectionCard>

          {/* ── Audit ── */}
          <div style={{ ...S.card, marginTop: 20 }}>
            <div style={S.cardHeader}>
              <IconClock />
              <span style={S.cardTitle}>Audit & Timeline</span>
            </div>
            <div style={{ ...S.cardBody, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                { label: "Created At",    value: formatDateTime(advisor.createdAt) },
                { label: "Last Login",    value: formatDateTime(advisor.lastLoginAt) },
                { label: "Updated At",    value: formatDateTime(advisor.updatedAt) },
                {
                  label: "Created By",
                  value: advisor.createdBy
                    ? `${advisor.createdBy.firstName || ""} ${advisor.createdBy.lastName || ""}`.trim() || advisor.createdBy.email
                    : "—",
                },
                ...(advisor.status === "suspended" || advisor.status === "deactivated" ? [
                  { label: "Suspended At",    value: formatDate(advisor.deactivatedAt) },
                  { label: "Suspension Reason", value: advisor.deactivationReason || "—" },
                ] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{
                  padding: "14px 16px",
                  background: "#FAF8FF",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Suspend / Reinstate Modal ── */}
      <Modal
        open={suspendModal.open}
        onCancel={() => setSuspendModal(p => ({ ...p, open: false }))}
        onOk={handleSuspendConfirm}
        confirmLoading={suspending}
        title={
          <span style={{ color: C.text, fontWeight: 700 }}>
            {suspendModal.action === "suspend" ? "⚠️ Suspend Advisor" : "✅ Reinstate Advisor"}
          </span>
        }
        okText={suspendModal.action === "suspend" ? "Suspend" : "Reinstate"}
        okButtonProps={{
          style: {
            background: suspendModal.action === "suspend" ? C.suspended : C.success,
            borderColor: suspendModal.action === "suspend" ? C.suspended : C.success,
          },
        }}
        width={460}
      >
        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}>
          {suspendModal.action === "suspend"
            ? `Suspending ${advisor.firstName} ${advisor.lastName} will immediately revoke their access.`
            : `Reinstating ${advisor.firstName} ${advisor.lastName} will restore full access.`
          }
        </p>
        {suspendModal.action === "suspend" && (
          <div>
            <label style={S.modalLabel}>
              Reason <span style={{ color: C.textMuted, fontWeight: 400 }}>(optional)</span>
            </label>
            <Input.TextArea
              rows={3}
              placeholder="e.g. Violation of company policy..."
              value={suspendModal.reason}
              onChange={e => setSuspendModal(p => ({ ...p, reason: e.target.value }))}
              style={{ borderRadius: 10, fontSize: 13 }}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdvisorDetail;