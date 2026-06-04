import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { notification, Modal, Input } from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../components/CMS/pages/custom/CustomTable";

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
  inactive:    "#94A3B8",
};

const STATUS_CONFIG = {
  active:      { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  inactive:    { bg: "#F1F5F9", color: "#475569", label: "Inactive" },
  suspended:   { bg: "#FEF3C7", color: "#92400E", label: "Suspended" },
  deactivated: { bg: "#FEE2E2", color: "#991B1B", label: "Deactivated" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: cfg.bg,
      color: cfg.color,
      letterSpacing: "0.03em",
      textTransform: "capitalize",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.color, display: "inline-block",
      }} />
      {cfg.label}
    </span>
  );
};

const Avatar = ({ firstName, lastName, size = 36 }) => {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "RP";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryLight} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: C.white,
      flexShrink: 0, userSelect: "none",
    }}>
      {initials}
    </div>
  );
};

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1V13M1 7H13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" stroke={C.primary} strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="3" stroke={C.primary} strokeWidth="1.5"/>
  </svg>
);
const IconBan = ({ color = C.suspended }) => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
    <path d="M4.5 4.5l11 11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
    <path d="M4 10l4.5 4.5L16 6" stroke={C.success} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPartners = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={C.primary} strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="9" cy="7" r="4" stroke={C.primary} strokeWidth="1.5"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={C.primaryLight} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const S = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${C.bg} 0%, #F0EBFF 100%)`,
    padding: "36px 24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: { maxWidth: 1200, margin: "0 auto" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  heading: { fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: 0 },
  subheading: { fontSize: 13, color: C.textMuted, marginTop: 4, marginBottom: 0 },
  btnCreate: {
    height: 42,
    padding: "0 20px",
    borderRadius: 12,
    border: "none",
    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
    color: C.white,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    outline: "none",
    boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: "18px 20px",
    boxShadow: "0 2px 10px rgba(124,58,237,0.05)",
  },
  statValue: { fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.1 },
  statLabel: { fontSize: 12, color: C.textMuted, marginTop: 4, fontWeight: 500 },
  statDot: {
    width: 8, height: 8, borderRadius: "50%",
    display: "inline-block", marginRight: 6,
  },
  tableWrap: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(124,58,237,0.07)",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 12px",
    borderRadius: 8,
    border: "1.5px solid",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    background: "transparent",
    outline: "none",
  },
  modalLabel: {
    fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6, display: "block",
  },
};

const AllReferralPartners = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10, search: "", status: "" });

  const [suspendModal, setSuspendModal] = useState({ open: false, partner: null, action: "suspend", reason: "" });
  const [suspending, setSuspending] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const notify = (type, msg, desc) => api[type]({ message: msg, description: desc, placement: "topRight", duration: 4 });

  const fetchPartners = useCallback(async (params = queryParams) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.limit) query.set("limit", params.limit);

      const res = await apiService.get(`/referral?${query.toString()}`);
      
      const responseData   = res;
      const partnersData   = responseData?.data?.partners || [];
      const paginationData = responseData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
      
      setPartners(partnersData);
      setPagination(paginationData);
    } catch (err) {
      notify("error", "Failed to load partners", err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => { fetchPartners(); }, []);

  const handleFilter = useCallback((filters) => {
    const newParams = {
      ...queryParams,
      page: 1,
      search: filters.search || "",
      status: filters.status || "",
    };
    setQueryParams(newParams);
    fetchPartners(newParams);
  }, [queryParams]);

  const handlePageChange = useCallback((page, limit) => {
    const newParams = { ...queryParams, page, limit };
    setQueryParams(newParams);
    fetchPartners(newParams);
  }, [queryParams]);

  const openSuspendModal = (partner, action) => {
    setSuspendModal({ open: true, partner, action, reason: "" });
  };

  const handleSuspendConfirm = async () => {
    const { partner, action, reason } = suspendModal;
    setSuspending(true);
    try {
      await apiService.put(`/referral/${partner._id}/suspend`, {
        action,
        ...(action === "suspend" && { reason }),
      });
      notify(
        "success",
        action === "suspend" ? "Partner Suspended" : "Partner Reinstated",
        `${partner.firstName} ${partner.lastName} has been ${action === "suspend" ? "suspended" : "reinstated"}.`
      );
      setSuspendModal({ open: false, partner: null, action: "suspend", reason: "" });
      fetchPartners();
    } catch (err) {
      notify("error", "Action Failed", err?.response?.data?.message || "Something went wrong");
    } finally {
      setSuspending(false);
    }
  };

  const stats = {
    total:      pagination.total,
    active:     partners.filter(p => p.status === "active").length,
    suspended:  partners.filter(p => p.status === "suspended").length,
    inactive:   partners.filter(p => p.status === "inactive" || p.status === "deactivated").length,
  };

  const columns = [
    {
      key: "name",
      title: "Partner",
      sortable: true,
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar firstName={row.firstName} lastName={row.lastName} />
          <div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>
              {row.firstName} {row.lastName}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (val) => <span style={{ fontSize: 13, color: C.text }}>{val || "—"}</span>,
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      filterKey: "status",
      filterOptions: [
        { value: "active",      label: "Active" },
        { value: "inactive",    label: "Inactive" },
        { value: "suspended",   label: "Suspended" },
        { value: "deactivated", label: "Deactivated" },
      ],
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button
            style={{
              ...S.actionBtn,
              borderColor: C.border,
              color: C.primary,
            }}
            onClick={() => {
              const basePath = location.pathname.replace(/\/referral-partners$/, "");
              navigate(`${basePath}/referral-partners/${row._id}`);
            }}
          >
            <IconEye /> View
          </button>

          {row.status === "suspended" ? (
            <button
              style={{ ...S.actionBtn, borderColor: "#BBF7D0", color: C.success }}
              onClick={() => openSuspendModal(row, "unsuspend")}
            >
              <IconCheck /> Reinstate
            </button>
          ) : row.status !== "deactivated" ? (
            <button
              style={{ ...S.actionBtn, borderColor: "#FED7AA", color: C.suspended }}
              onClick={() => openSuspendModal(row, "suspend")}
            >
              <IconBan /> Suspend
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .page-fade { animation: fadeUp 0.3s ease; }
        .btn-create:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(124,58,237,0.4) !important;
        }
      `}</style>

      <div style={S.page} className="page-fade">
        <div style={S.container}>
          <div style={S.topBar}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <IconPartners />
                <h1 style={S.heading}>Referral Partners</h1>
              </div>
              <p style={S.subheading}>
                Manage referral partners — view, suspend, and track performance
              </p>
            </div>
          </div>

          <div style={S.statsRow}>
            {[
              { label: "Total Partners",   value: pagination.total, dot: C.primary   },
              { label: "Active",           value: stats.active,     dot: C.success   },
              { label: "Suspended",        value: stats.suspended,  dot: C.suspended },
              { label: "Inactive / Off",   value: stats.inactive,   dot: C.inactive  },
            ].map(({ label, value, dot }) => (
              <div key={label} style={S.statCard}>
                <div style={S.statValue}>{loading ? "—" : value}</div>
                <div style={S.statLabel}>
                  <span style={{ ...S.statDot, background: dot }} />
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div style={S.tableWrap}>
            <CustomTable
              columns={columns}
              data={partners}
              totalItems={pagination.total}
              currentPage={pagination.page}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onFilter={handleFilter}
              loading={loading}
              showSearch={true}
            />
          </div>
        </div>
      </div>

      <Modal
        open={suspendModal.open}
        onCancel={() => setSuspendModal(p => ({ ...p, open: false }))}
        onOk={handleSuspendConfirm}
        confirmLoading={suspending}
        title={
          <span style={{ color: C.text, fontWeight: 700 }}>
            {suspendModal.action === "suspend" ? "⚠️ Suspend Partner" : "✅ Reinstate Partner"}
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
        {suspendModal.partner && (
          <div>
            <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}>
              {suspendModal.action === "suspend"
                ? `You are about to suspend ${suspendModal.partner.firstName} ${suspendModal.partner.lastName}. They will lose access immediately.`
                : `You are about to reinstate ${suspendModal.partner.firstName} ${suspendModal.partner.lastName}. They will regain full access.`
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
          </div>
        )}
      </Modal>
    </>
  );
};

export default AllReferralPartners;
