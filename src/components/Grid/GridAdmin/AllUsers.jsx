import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card, Typography, Avatar, Space, Tag, Tabs, Tooltip, Button,
  Modal, Input, Row, Col, message, notification, Spin,
  Drawer, Divider, Dropdown, Segmented, Popconfirm,
} from "antd";
import {
  UserOutlined, TeamOutlined, HomeOutlined,
  SafetyCertificateOutlined, ShopOutlined,
  MailOutlined, PhoneOutlined, EyeOutlined,
  UsergroupAddOutlined, ApartmentOutlined,
  CheckCircleOutlined, StopOutlined, EnvironmentOutlined,
  DollarOutlined, MoreOutlined, FileTextOutlined,
  BuildOutlined, CalendarOutlined,
} from "@ant-design/icons";
import { FiEye, FiSearch, FiRefreshCw, FiShield, FiUsers, FiTrendingUp } from "react-icons/fi";

import { apiService } from "../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../CMS/pages/custom/CustomTable";

const { Title, Text } = Typography;

// ─── Tab Config ──────────────────────────────────────────────────
const USER_TABS = [
  { key: "customers", label: "Customers", icon: <UserOutlined />, endpoint: "/customer/all", viewPath: "/dashboard/admin/customers", comingSoon: true },
  { key: "agents", label: "Agents", icon: <TeamOutlined />, endpoint: "/agency/admin/agents", viewPath: "/dashboard/admin/agent-list" },
  { key: "developers", label: "Developers", icon: <HomeOutlined />, endpoint: "/developer/get-all-developers", viewPath: "/dashboard/admin/developers" },
  { key: "advisors", label: "Xoto Advisors", icon: <SafetyCertificateOutlined />, endpoint: "/gridadvisor", viewPath: "/dashboard/admin/advisors" },
  { key: "partners", label: "Partners", icon: <ShopOutlined />, endpoint: "/agency/admin/agencies", viewPath: "/dashboard/admin/agency-list" },
  { key: "referral-partners", label: "Referral Partners", icon: <UsergroupAddOutlined />, endpoint: "/referral", viewPath: "/dashboard/admin/agency-list" },
];

// ─── Helpers ─────────────────────────────────────────────────────
const STATUS_COLOR = {
  active: "success", approved: "success",
  pending: "warning",
  inactive: "error", rejected: "error", suspended: "error",
};
const statusTag = (status) => {
  if (!status || status === "—") return <Text type="secondary">—</Text>;
  const key = String(status).toLowerCase();
  return <Tag color={STATUS_COLOR[key] || "default"}>{String(status).replace(/^./, c => c.toUpperCase())}</Tag>;
};
const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};
const normalizeUser = (raw, tabKey) => {
  const name = raw.fullName || raw.name || raw.partnerName ||
    [raw.firstName || raw.first_name, raw.lastName || raw.last_name].filter(Boolean).join(" ") ||
    raw.companyName || "Unnamed";
  const email = raw.email || raw.officialEmailId || raw.contactEmail || "—";
  const phone = raw.phone || raw.phone_number || raw.contactNumber || raw.mobile || "—";
  const status = raw.adminApprovalStatus || raw.accountStatus || raw.status || raw.approvalStatus || raw.kycStatus || "—";
  const role = typeof raw.role === "object" ? raw.role?.name : raw.role || raw.userType || raw.designation;
  const createdAt = raw.createdAt || raw.created_at;
  const avatar = raw.profile_photo || raw.profilePhoto || raw.logo || raw.profileImage || "";
  const id = raw._id || raw.id;
  const employeeId = raw.employeeId || raw.employee_id;
  return { id, key: id, name, email, phone, status, role, createdAt, avatar, employeeId, tabKey, raw };
};
const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
};

// ─── Agency / Partner theme ──────────────────────────────────────
const THEME = {
  primary: "#4A027C",
  primaryLight: "#6D28D9",
  primaryBg: "#F5F0FF",
  success: "#059669",
  successBg: "#ECFDF5",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  neutral: "#6B7280",
  border: "#E5E7EB",
  cardBg: "#FFFFFF",
  pageBg: "#F9FAFB",
  text: "#111827",
  textLight: "#6B7280",
};

const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{
    background: THEME.cardBg,
    border: `1px solid ${THEME.border}`,
    borderRadius: 12,
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    flex: 1,
    minWidth: 160,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10,
      background: bg, color, display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: 20,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: THEME.text, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 12, color: THEME.textLight, marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
    <div style={{
      width: 34, height: 34, borderRadius: 8,
      background: THEME.primaryBg, color: THEME.primary,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, fontSize: 15,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 11, color: THEME.textLight, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: THEME.text, marginTop: 1 }}>{value}</div>
    </div>
  </div>
);

// ─── AllUsers Component ──────────────────────────────────────────
const AllUsers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "agents");

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  // ── Generic tabs state ────────────────────────────────────────
  const [tabState, setTabState] = useState({});
  const [timerByTab, setTimerByTab] = useState({});

  // ── Referral Partners state ────────────────────────────────────
  const [referralPartners, setReferralPartners] = useState([]);
  const [referralPagination, setReferralPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralQuery, setReferralQuery] = useState({ page: 1, limit: 10, search: "", status: "" });
  const [suspendModal, setSuspendModal] = useState({ open: false, partner: null, action: "suspend", reason: "" });
  const [suspending, setSuspending] = useState(false);

  // ── Agency (Partners) specific state ──────────────────────────
  const [agencies, setAgencies] = useState([]);
  const [agencyLoading, setAgencyLoading] = useState(false);
  const [agencySearch, setAgencySearch] = useState("");
  const [agencyStatusFilter, setAgencyStatusFilter] = useState("all");
  const [agencyPagination, setAgencyPagination] = useState({
    currentPage: 1, totalPages: 1, totalResults: 0, itemsPerPage: 10,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [agencyDetails, setAgencyDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const agencySearchTimeout = useRef(null);

  // ── Generic fetch (now with status filter) ────────────────────
  const fetchTab = useCallback(async (tabKey, page = 1, limit = 10, search = "", status = "all") => {
    const tab = USER_TABS.find(t => t.key === tabKey);
    if (!tab || tab.comingSoon) return;

    setTabState(prev => ({ ...prev, [tabKey]: { ...prev[tabKey], loading: true, data: prev[tabKey]?.data || [] } }));

    try {
      const queryParams = { page, limit, search: search || undefined };
      if (status && status !== "all") queryParams.status = status;

      const res = await apiService.get(tab.endpoint, queryParams);

      const list =
        (Array.isArray(res?.data) && res.data) ||
        (Array.isArray(res?.data?.data) && res.data.data) ||
        (Array.isArray(res?.data?.advisors) && res.data.advisors) ||
        (Array.isArray(res?.data?.developers) && res.data.developers) ||
        (Array.isArray(res?.data?.agents) && res.data.agents) ||
        (Array.isArray(res?.data?.agencies) && res.data.agencies) ||
        (Array.isArray(res?.data?.referrals) && res.data.referrals) ||
        (Array.isArray(res?.data?.partners) && res.data.partners) ||
        (Array.isArray(res) && res) || [];

      const total = res?.pagination?.totalItems || res?.total || res?.data?.total || list.length;
      const normalized = list.map(u => normalizeUser(u, tabKey));

      setTabState(prev => ({
        ...prev,
        [tabKey]: { data: normalized, page, limit, total, search, status, loading: false },
      }));
    } catch (err) {
      console.error(`[AllUsers] fetch error:`, err);
      message.error(`Failed to load ${tab.label}.`);
      setTabState(prev => ({ ...prev, [tabKey]: { ...prev[tabKey], loading: false } }));
    }
  }, []);

  // Initial fetch for generic tabs (only when data not present)
  useEffect(() => {
    const tab = USER_TABS.find(t => t.key === activeTab);
    if (tab?.comingSoon || activeTab === "referral-partners" || activeTab === "partners") return;
    const current = tabState[activeTab] || {};
    if (!current.data) fetchTab(activeTab, 1, 10, "", "all");
  }, [activeTab]);

  // Debounced search + status change for generic tabs
  useEffect(() => {
    const tab = USER_TABS.find(t => t.key === activeTab);
    if (!tab || tab.comingSoon || activeTab === "referral-partners" || activeTab === "partners") return;
    const current = tabState[activeTab] || {};
    if (timerByTab[activeTab]) clearTimeout(timerByTab[activeTab]);
    const timer = setTimeout(() => {
      fetchTab(activeTab, current.page || 1, current.limit || 10, current.search || "", current.status || "all");
    }, 400);
    setTimerByTab(prev => ({ ...prev, [activeTab]: timer }));
    return () => { if (timerByTab[activeTab]) clearTimeout(timerByTab[activeTab]); };
  }, [activeTab, tabState[activeTab]?.search, tabState[activeTab]?.page, tabState[activeTab]?.status]);

  // ── Handlers for generic tabs ─────────────────────────────────
  const handleGenericSearch = (val) => {
    setTabState(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], search: val, page: 1 },
    }));
  };

  const handleGenericStatusChange = (status) => {
    setTabState(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], status, page: 1 },
    }));
  };

  const handleGenericPageChange = (page, limit) => {
    setTabState(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], page, limit },
    }));
  };

  const handleGenericRefresh = () => {
    const current = tabState[activeTab] || {};
    fetchTab(activeTab, 1, current.limit || 10, current.search || "", current.status || "all");
  };

  // ── Referral Partners logic ──────────────────────────────────
  const fetchReferralPartners = useCallback(async (params = { page: 1, limit: 10, search: "", status: "" }) => {
    setReferralLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", params.page);
      if (params.limit) query.set("limit", params.limit);
      if (params.search) query.set("search", params.search);
      if (params.status && params.status !== "all") query.set("status", params.status);

      const res = await apiService.get(`/referral?${query.toString()}`);

      const partnersData = res?.data?.partners || [];
      const paginationData = res?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

      setReferralPartners(partnersData);
      setReferralPagination(paginationData);
    } catch (err) {
      notification.error({
        message: "Failed to load partners",
        description: err?.response?.data?.message || "Something went wrong",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setReferralLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "referral-partners") {
      fetchReferralPartners(referralQuery);
    }
  }, [activeTab, referralQuery]);

  const handleReferralSearch = (val) => {
    setReferralQuery(prev => ({ ...prev, page: 1, search: val }));
  };

  const handleReferralStatusChange = (status) => {
    setReferralQuery(prev => ({ ...prev, page: 1, status }));
  };

  const handleReferralRefresh = () => {
    fetchReferralPartners(referralQuery);
  };

  const openSuspendModal = (partner, action) => {
    setSuspendModal({ open: true, partner, action, reason: "" });
  };

  const handleSuspendConfirm = async () => {
    const { partner, action, reason } = suspendModal;
    setSuspending(true);
    try {
      await apiService.put(`/referral/${partner._id}/suspend`, { action, ...(action === "suspend" && { reason }) });
      notification.success({
        message: action === "suspend" ? "Partner Suspended" : "Partner Reinstated",
        description: `${partner.firstName} ${partner.lastName} has been ${action === "suspend" ? "suspended" : "reinstated"}.`,
        placement: "topRight",
        duration: 4,
      });
      setSuspendModal({ open: false, partner: null, action: "suspend", reason: "" });
      fetchReferralPartners(referralQuery);
    } catch (err) {
      notification.error({
        message: "Action Failed",
        description: err?.response?.data?.message || "Something went wrong",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setSuspending(false);
    }
  };

  const referralColumns = [
    {
      key: "name",
      title: "Partner",
      sortable: true,
      render: (_, row) => (
        <Space size="middle">
          <Avatar
            size={42}
            src={row.profileImage || ""}
            icon={!row.profileImage && <UserOutlined />}
            style={{ backgroundColor: "#7C3AED", color: "#fff", fontWeight: 600 }}
          >
            {!row.profileImage && getInitials(`${row.firstName || ""} ${row.lastName || ""}`)}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: 14, color: "#1f2937" }}>
              {row.firstName} {row.lastName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{row.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (val) => <span style={{ fontSize: 13, color: "#1f2937" }}>{val || "—"}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (val) => {
        const cfg = {
          active: { bg: "#D1FAE5", color: "#065F46", label: "Active" },
          inactive: { bg: "#F1F5F9", color: "#475569", label: "Inactive" },
          suspended: { bg: "#FEF3C7", color: "#92400E", label: "Suspended" },
          deactivated: { bg: "#FEE2E2", color: "#991B1B", label: "Deactivated" },
        }[val] || { bg: "#F1F5F9", color: "#475569", label: val || "Inactive" };
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: cfg.bg, color: cfg.color, letterSpacing: "0.03em", textTransform: "capitalize",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <Button size="small" style={{ borderColor: "#E9E2FF", color: "#7C3AED", borderRadius: 8 }}
            onClick={() => navigate(`/dashboard/admin/referral-partners/${row._id}`)}>
            <EyeOutlined /> View
          </Button>
          {row.status === "suspended" ? (
            <Button size="small" style={{ borderColor: "#BBF7D0", color: "#10B981", borderRadius: 8 }}
              onClick={() => openSuspendModal(row, "unsuspend")}>✓ Reinstate</Button>
          ) : row.status !== "deactivated" ? (
            <Button size="small" style={{ borderColor: "#FED7AA", color: "#F97316", borderRadius: 8 }}
              onClick={() => openSuspendModal(row, "suspend")}>⛔ Suspend</Button>
          ) : null}
        </div>
      ),
    },
  ];

  const referralStats = {
    total: referralPagination.total,
    active: referralPartners.filter(p => p.status === "active").length,
    suspended: referralPartners.filter(p => p.status === "suspended").length,
    inactive: referralPartners.filter(p => p.status === "inactive" || p.status === "deactivated").length,
  };

  // ── Agency (Partners) logic ─────────────────────────────────
  const fetchAgencies = useCallback(async (page = 1, limit = 10, searchVal = "", status = agencyStatusFilter) => {
    setAgencyLoading(true);
    try {
      let url = `/agency/admin/agencies?page=${page}&limit=${limit}`;
      if (status && status !== "all") url += `&status=${status}`;
      if (searchVal?.trim()) url += `&search=${encodeURIComponent(searchVal.trim())}`;

      const res = await apiService.get(url);
      if (res) {
        const mappedData = (res.data || []).map((a, i) => ({
          ...a,
          _id: a._id || a.id,
          key: a._id || a.id,
          sno: (page - 1) * limit + i + 1,
        }));
        setAgencies(mappedData);
        setAgencyPagination({
          currentPage: res.pagination?.currentPage || page,
          totalPages: res.pagination?.totalPages || 1,
          totalResults: res.pagination?.totalItems || mappedData.length,
          itemsPerPage: res.pagination?.limit || limit,
        });
      } else {
        setAgencies([]);
      }
    } catch (err) {
      message.error("Failed to fetch agencies.");
      setAgencies([]);
    } finally {
      setAgencyLoading(false);
    }
  }, [agencyStatusFilter]);

  useEffect(() => {
    if (activeTab === "partners") {
      fetchAgencies(1, agencyPagination.itemsPerPage, agencySearch, agencyStatusFilter);
    }
  }, [activeTab, agencyStatusFilter, fetchAgencies]);

  const handleAgencySearch = (e) => {
    const val = e.target.value;
    setAgencySearch(val);
    clearTimeout(agencySearchTimeout.current);
    agencySearchTimeout.current = setTimeout(() => {
      fetchAgencies(1, agencyPagination.itemsPerPage, val, agencyStatusFilter);
    }, 500);
  };

  const toggleActiveStatus = async (record, activate) => {
    const id = record?._id || record?.id;
    if (!id) { message.error("Invalid agency ID."); return; }
    setActionLoading(true);
    try {
      await apiService.put(`/agency/admin/agencies/${id}/${activate ? "activate" : "suspend"}`);
      message.success(`Agency ${activate ? "activated" : "suspended"} successfully.`);
      setAgencies(prev =>
        prev.map(a => (a._id || a.id) === id ? { ...a, isActive: activate, isSuspended: !activate } : a)
      );
      if (agencyDetails && (agencyDetails._id || agencyDetails.id) === id) {
        setAgencyDetails(prev => ({ ...prev, isActive: activate, isSuspended: !activate }));
      }
    } catch (err) {
      message.error(err?.response?.data?.message || "Failed to update agency status.");
    } finally {
      setActionLoading(false);
    }
  };

  const openAgencyDrawer = async (record) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    setAgencyDetails(record);
    try {
      const id = record._id || record.id;
      const res = await apiService.get(`/agency/admin/agencies/${id}`);
      const fetched = res?.data || res;
      if (fetched && typeof fetched === "object" && !Array.isArray(fetched)) {
        setAgencyDetails(prev => ({ ...prev, ...fetched }));
      }
    } catch (err) {
      console.error("Drawer fetch error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const agencyDropdownItems = (record) => [
    {
      key: "view",
      icon: <FiEye style={{ color: THEME.primary }} />,
      label: <span style={{ fontSize: 13 }}>View Details</span>,
      onClick: () => openAgencyDrawer(record),
    },
    { type: "divider" },
    {
      key: record.isSuspended ? "activate" : "suspend",
      icon: record.isSuspended ? <CheckCircleOutlined style={{ color: THEME.success }} /> : <StopOutlined style={{ color: THEME.error }} />,
      label: (
        <span style={{ fontSize: 13, color: record.isSuspended ? THEME.success : THEME.error }}>
          {record.isSuspended ? "Activate Agency" : "Suspend Agency"}
        </span>
      ),
      onClick: () => toggleActiveStatus(record, !!record.isSuspended),
    },
  ];

  const agencyColumns = [
    {
      key: "companyName",
      title: "Agency",
      width: 280,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            size={42}
            src={r.logo || r.profilePhoto}
            icon={<ApartmentOutlined />}
            style={{
              background: THEME.primaryBg,
              color: THEME.primary,
              fontWeight: 700,
              flexShrink: 0,
              border: `1.5px solid ${THEME.border}`,
            }}
          >
            {r.companyName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: THEME.text, lineHeight: 1.3 }}>
              {r.companyName || "Unnamed Agency"}
            </div>
            <div style={{ fontSize: 12, color: THEME.textLight, marginTop: 2 }}>
              <MailOutlined style={{ marginRight: 3 }} />
              {r.primaryContactEmail || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "primaryContactPhone",
      title: "Contact",
      width: 190,
      render: (_, r) => (
        <div>
          <div style={{ fontSize: 13, color: THEME.text, fontWeight: 500 }}>
            <PhoneOutlined style={{ marginRight: 5, color: THEME.primary }} />
            {r.primaryContactPhone || "—"}
          </div>
          <div style={{ fontSize: 12, color: THEME.textLight, marginTop: 3 }}>
            {r.primaryContactName || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "reraRegistrationNumber",
      title: "RERA No.",
      width: 160,
      render: (_, r) => (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: r.reraRegistrationNumber ? THEME.primaryBg : "#F3F4F6",
          padding: "4px 10px", borderRadius: 6,
          fontSize: 12, fontWeight: 600,
          color: r.reraRegistrationNumber ? THEME.primary : THEME.textLight,
        }}>
          <SafetyCertificateOutlined />
          {r.reraRegistrationNumber || "Not set"}
        </div>
      ),
    },
    {
      key: "subscriptionTier",
      title: "Tier",
      width: 110,
      render: (_, r) => {
        const tierColors = {
          basic: { bg: "#F3F4F6", color: "#374151" },
          standard: { bg: "#EFF6FF", color: "#1D4ED8" },
          premium: { bg: "#FDF4FF", color: "#7E22CE" },
        };
        const t = tierColors[r.subscriptionTier] || tierColors.basic;
        return (
          <span style={{
            background: t.bg, color: t.color,
            padding: "4px 12px", borderRadius: 20,
            fontSize: 12, fontWeight: 600,
            textTransform: "capitalize",
          }}>
            {r.subscriptionTier || "basic"}
          </span>
        );
      },
    },
    {
      key: "isActive",
      title: "Status",
      width: 120,
      render: (_, r) => {
        if (r.isSuspended) return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: THEME.errorBg, color: THEME.error,
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            <StopOutlined style={{ fontSize: 10 }} /> Suspended
          </span>
        );
        if (r.isActive) return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: THEME.successBg, color: THEME.success,
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            <CheckCircleOutlined style={{ fontSize: 10 }} /> Active
          </span>
        );
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: THEME.warningBg, color: THEME.warning,
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            Inactive
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      width: 80,
      render: (_, r) => (
        <Dropdown menu={{ items: agencyDropdownItems(r) }} trigger={["click"]} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{ borderRadius: 8, color: THEME.textLight, width: 34, height: 34, padding: 0 }} />
        </Dropdown>
      ),
    },
  ];

  // ── Generic columns (unchanged) ───────────────────────────────
  const fullColumns = [
    {
      title: "User", key: "name", sortable: true, render: (_, r) => (
        <Space size="middle">
          <Avatar size={42} src={r.avatar || null} icon={!r.avatar && <UserOutlined />}
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontWeight: "bold" }}>
            {!r.avatar && getInitials(r.name)}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: 15, color: "#1f2937" }}>{r.name}</Text>
            {r.employeeId && <Text type="secondary" style={{ fontSize: 12 }}>ID: {r.employeeId}</Text>}
          </div>
        </Space>
      ),
    },
    {
      title: "Contact Info", key: "email", sortable: true, render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 13 }}><MailOutlined style={{ color: "#6b7280", marginRight: 6 }} />{r.email}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}><PhoneOutlined style={{ color: "#6b7280", marginRight: 6 }} />{r.phone}</Text>
        </Space>
      ),
    },
    {
      title: "Role / Type", key: "role", sortable: true, render: (_, r) =>
        r.role ? <Tag color="purple" style={{ borderRadius: 20 }}>{r.role}</Tag> : <Text type="secondary">—</Text>,
    },
    { title: "Status", key: "status", render: (_, r) => statusTag(r.status) },
    {
      title: "Joined", key: "createdAt", sortable: true, render: (_, r) =>
        <Text style={{ fontSize: 13, color: "#6b7280" }}>{fmtDate(r.createdAt)}</Text>,
    },
    {
      title: "Actions", key: "actions", render: (_, r) => (
        <Tooltip title="View Full Profile">
          <Button type="primary" icon={<EyeOutlined />}
            onClick={() => navigate(`${USER_TABS.find(t => t.key === activeTab).viewPath}/${r.id}`)}
            style={{ background: "#5c039b", borderColor: "#5c039b", borderRadius: 6 }}>View</Button>
        </Tooltip>
      ),
    },
  ];

  const currentTabConfig = USER_TABS.find(t => t.key === activeTab);

  // ── Render Referral Partners tab ──────────────────────────────
  if (activeTab === "referral-partners") {
    return (
      <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ padding: 10, background: "#f3e8ff", borderRadius: 10, color: "#5c039b" }}>
            <UsergroupAddOutlined style={{ fontSize: 24 }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: "#1f2937" }}>All Users</Title>
            <Text type="secondary" style={{ fontSize: 15 }}>Unified directory of every user type on the platform.</Text>
          </div>
        </div>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 12 }}
          items={USER_TABS.map(t => ({
            key: t.key,
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {t.icon} {t.label}
                {t.key === "referral-partners"
                  ? <Tag style={{ marginLeft: 4 }}>{referralPagination.total}</Tag>
                  : tabState[t.key]?.total !== undefined && <Tag style={{ marginLeft: 4 }}>{tabState[t.key].total}</Tag>}
              </span>
            ),
          }))}
        />

        {/* Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {[
            { label: "Total Partners", value: referralStats.total, dot: "#7C3AED" },
            { label: "Active", value: referralStats.active, dot: "#10B981" },
            { label: "Suspended", value: referralStats.suspended, dot: "#F97316" },
            { label: "Inactive / Off", value: referralStats.inactive, dot: "#94A3B8" },
          ].map(({ label, value, dot }) => (
            <Col xs={24} sm={12} md={6} key={label}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, marginRight: 6 }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>{label}</Text>
                    <Title level={3} style={{ margin: "4px 0 0", color: "#1f2937" }}>{referralLoading ? "—" : value}</Title>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Table Card with Toolbar */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 0 }}>
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px", borderBottom: "1px solid #f0f0f0",
            background: "#FAFAFA", gap: 12,
          }}>
            <Segmented
              options={[
                { label: "All", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
                { label: "Deactivated", value: "deactivated" },
              ]}
              value={referralQuery.status || "all"}
              onChange={handleReferralStatusChange}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <Input
                placeholder="Search partners..."
                prefix={<FiSearch style={{ color: THEME.textLight }} />}
                value={referralQuery.search}
                onChange={(e) => handleReferralSearch(e.target.value)}
                allowClear
                onClear={() => handleReferralSearch("")}
                style={{ width: 240, borderRadius: 8 }}
              />
              <Button icon={<FiRefreshCw />} onClick={handleReferralRefresh} style={{ borderRadius: 8 }}>
                Refresh
              </Button>
            </div>
          </div>

          <div style={{ padding: "0 0 24px 0" }}>
            <CustomTable
              columns={referralColumns}
              data={referralPartners}
              loading={referralLoading}
              totalItems={referralPagination.total}
              currentPage={referralPagination.page}
              itemsPerPage={referralPagination.limit}
              onPageChange={(page, limit) => setReferralQuery(prev => ({ ...prev, page, limit }))}
              showSearch={false}
            />
          </div>
        </Card>

        <Modal open={suspendModal.open} onCancel={() => setSuspendModal(p => ({ ...p, open: false }))}
          onOk={handleSuspendConfirm} confirmLoading={suspending}
          title={<span style={{ color: "#1f2937", fontWeight: 700 }}>{suspendModal.action === "suspend" ? "⚠️ Suspend Partner" : "✅ Reinstate Partner"}</span>}
          okText={suspendModal.action === "suspend" ? "Suspend" : "Reinstate"}
          okButtonProps={{ style: { background: suspendModal.action === "suspend" ? "#F97316" : "#10B981", borderColor: suspendModal.action === "suspend" ? "#F97316" : "#10B981" } }}
          width={460}>
          {suspendModal.partner && (
            <div>
              <p style={{ color: "#6B5B9B", fontSize: 13, marginBottom: 16 }}>
                {suspendModal.action === "suspend"
                  ? `You are about to suspend ${suspendModal.partner.firstName} ${suspendModal.partner.lastName}. They will lose access immediately.`
                  : `You are about to reinstate ${suspendModal.partner.firstName} ${suspendModal.partner.lastName}. They will regain full access.`
                }
              </p>
              {suspendModal.action === "suspend" && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#1f2937", marginBottom: 6, display: "block" }}>
                    Reason <span style={{ color: "#6B5B9B", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <Input.TextArea rows={3} placeholder="e.g. Violation of company policy..."
                    value={suspendModal.reason} onChange={e => setSuspendModal(p => ({ ...p, reason: e.target.value }))}
                    style={{ borderRadius: 10, fontSize: 13 }} />
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // ── Partners / Agencies tab (AgencyList UI) ──────────────────
  if (activeTab === "partners") {
    return (
      <div style={{ padding: "24px 28px", background: THEME.pageBg, minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: THEME.primaryBg, color: THEME.primary,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>
              <BuildOutlined />
            </div>
            <Title level={3} style={{ margin: 0, color: THEME.text, fontWeight: 700 }}>
              Partner Management
            </Title>
          </div>
          <Text style={{ color: THEME.textLight, fontSize: 14, marginLeft: 48 }}>
            Review, manage and monitor all real estate agencies on the platform.
          </Text>
        </div>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 20 }}
          items={USER_TABS.map(t => ({
            key: t.key,
            label: (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {t.icon} {t.label}
                {t.key === "partners"
                  ? <Tag style={{ marginLeft: 4 }}>{agencyPagination.totalResults}</Tag>
                  : tabState[t.key]?.total !== undefined && <Tag style={{ marginLeft: 4 }}>{tabState[t.key].total}</Tag>}
              </span>
            ),
          }))}
        />

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard icon={<FiUsers />} label="Total Agencies" value={agencyPagination.totalResults}
            color={THEME.primary} bg={THEME.primaryBg} />
          <StatCard icon={<FiTrendingUp />} label="Active Agencies"
            value={agencies.filter(a => a.isActive && !a.isSuspended).length}
            color={THEME.success} bg={THEME.successBg} />
          <StatCard icon={<FiShield />} label="Suspended Agencies"
            value={agencies.filter(a => a.isSuspended).length}
            color={THEME.error} bg={THEME.errorBg} />
        </div>

        {/* Table Card */}
        <Card bordered={false} style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: `1px solid ${THEME.border}` }}
          bodyStyle={{ padding: 0 }}>
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px", borderBottom: `1px solid ${THEME.border}`,
            background: "#FAFAFA", gap: 12,
          }}>
            <Segmented options={[
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Suspended", value: "suspended" },
            ]} value={agencyStatusFilter}
              onChange={(val) => { setAgencyStatusFilter(val); setAgencyPagination(prev => ({ ...prev, currentPage: 1 })); }}
              style={{ background: THEME.border }} />

            <div style={{ display: "flex", gap: 10 }}>
              <Input placeholder="Search by name, email, phone..." prefix={<FiSearch style={{ color: THEME.textLight }} />}
                value={agencySearch} onChange={handleAgencySearch} allowClear
                onClear={() => { setAgencySearch(""); fetchAgencies(1, agencyPagination.itemsPerPage, "", agencyStatusFilter); }}
                style={{ width: 280, borderRadius: 8, fontSize: 13 }} />
              <Button icon={<FiRefreshCw />}
                onClick={() => fetchAgencies(agencyPagination.currentPage, agencyPagination.itemsPerPage, agencySearch, agencyStatusFilter)}
                style={{ borderRadius: 8 }}>Refresh</Button>
            </div>
          </div>

          <CustomTable
            columns={agencyColumns}
            data={agencies}
            loading={agencyLoading}
            totalItems={agencyPagination.totalResults}
            currentPage={agencyPagination.currentPage}
            itemsPerPage={agencyPagination.itemsPerPage}
            onPageChange={(page, limit) => fetchAgencies(page, limit, agencySearch, agencyStatusFilter)}
            showSearch={false}
          />
        </Card>

        {/* Detail Drawer (unchanged) */}
        <Drawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setAgencyDetails(null); }}
          width={440} title={null} styles={{ body: { padding: 0, background: THEME.pageBg } }} destroyOnClose>
          {detailLoading && !agencyDetails ? (
            <div style={{ padding: 80, textAlign: "center" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: THEME.textLight }}>Loading agency details…</div>
            </div>
          ) : agencyDetails ? (
            <div>
              {/* ... drawer content same as before ... */}
              <div style={{
                background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
                padding: "32px 28px 70px", position: "relative",
              }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Avatar size={88} src={agencyDetails.logo || agencyDetails.profilePhoto}
                    icon={<ApartmentOutlined />}
                    style={{
                      border: "3px solid rgba(255,255,255,0.9)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                      background: "#fff", color: THEME.primary, fontSize: 34, fontWeight: 700,
                    }}>
                    {agencyDetails.companyName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </div>
              </div>

              <div style={{ padding: "0 24px", marginTop: -30 }}>
                <div style={{
                  background: THEME.cardBg, borderRadius: 14,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                  padding: "24px 22px 20px", textAlign: "center",
                  border: `1px solid ${THEME.border}`,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: THEME.text }}>
                    {agencyDetails.companyName || "Unnamed Agency"}
                  </div>
                  <div style={{ fontSize: 13, color: THEME.textLight, marginTop: 3 }}>
                    <MailOutlined style={{ marginRight: 4 }} />{agencyDetails.primaryContactEmail}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    {agencyDetails.isSuspended ? (
                      <Tag color="error" style={{ borderRadius: 20, padding: "2px 12px" }}>Suspended</Tag>
                    ) : (
                      <Tag color="success" style={{ borderRadius: 20, padding: "2px 12px" }}>Active</Tag>
                    )}
                    <Tag color="purple" style={{ borderRadius: 20, padding: "2px 12px", textTransform: "capitalize" }}>
                      {agencyDetails.subscriptionTier || "basic"}
                    </Tag>
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 24px 0" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { label: "Deals", value: agencyDetails.totalDeals || 0 },
                    { label: "Leads", value: agencyDetails.totalLeads || 0 },
                    { label: "Presentations", value: agencyDetails.presentationsUsed || 0 },
                  ].map((s, i) => (
                    <div key={i} style={{
                      flex: 1, background: THEME.cardBg, borderRadius: 12, padding: "14px 12px",
                      textAlign: "center", border: `1px solid ${THEME.border}`,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 20, color: THEME.primary }}>{s.value?.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: THEME.textLight, marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: THEME.textLight, fontWeight: 700, marginBottom: 16 }}>
                  Agency Details
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <DetailRow icon={<MailOutlined />} label="Email" value={agencyDetails.primaryContactEmail || "—"} />
                  <DetailRow icon={<PhoneOutlined />} label="Phone" value={agencyDetails.primaryContactPhone || "—"} />
                  <DetailRow icon={<EnvironmentOutlined />} label="City" value={agencyDetails.address?.city || "—"} />
                  <DetailRow icon={<EnvironmentOutlined />} label="Country" value={agencyDetails.address?.country || "—"} />
                  <DetailRow icon={<DollarOutlined />} label="Subscription" value={agencyDetails.subscriptionTier || "basic"} />
                  <DetailRow icon={<TeamOutlined />} label="Presentations" value={`${agencyDetails.presentationsUsed || 0} used / ${agencyDetails.presentationQuota || 0} quota`} />
                  <DetailRow icon={<DollarOutlined />} label="Commission" value={`AED ${(agencyDetails.commissionEarned || 0).toLocaleString()}`} />
                  <DetailRow icon={<CalendarOutlined />} label="Joined" value={
                    agencyDetails.createdAt
                      ? new Date(agencyDetails.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })
                      : "—"
                  } />
                </div>

                {(agencyDetails.tradeLicenceUrl || agencyDetails.reraLicenceUrl || agencyDetails.letterOfAuthorityUrl) && (
                  <>
                    <Divider style={{ margin: "20px 0 14px" }} />
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: THEME.textLight, fontWeight: 700, marginBottom: 12 }}>
                      Legal Documents
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { url: agencyDetails.tradeLicenceUrl, label: "Trade License" },
                        { url: agencyDetails.reraLicenceUrl, label: "RERA License" },
                        { url: agencyDetails.letterOfAuthorityUrl, label: "Letter of Authority" },
                      ].filter(d => d.url).map((doc, i) => (
                        <a key={i} href={doc.url} target="_blank" rel="noreferrer" style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "9px 14px", borderRadius: 8, background: THEME.primaryBg,
                          color: THEME.primary, fontSize: 13, fontWeight: 500,
                          textDecoration: "none", border: `1px solid ${THEME.primaryBg}`,
                        }}>
                          <FileTextOutlined />{doc.label}
                        </a>
                      ))}
                    </div>
                  </>
                )}

                <Divider style={{ margin: "24px 0 16px" }} />
                {agencyDetails.isSuspended ? (
                  <Popconfirm title="Activate this agency?" description="The agency will regain full platform access."
                    onConfirm={() => toggleActiveStatus(agencyDetails, true)}
                    okText="Yes, Activate" cancelText="Cancel"
                    okButtonProps={{ style: { background: THEME.success, borderColor: THEME.success } }}>
                    <Button block type="primary" size="large" icon={<CheckCircleOutlined />} loading={actionLoading}
                      style={{ background: THEME.success, borderColor: THEME.success, borderRadius: 10, fontWeight: 600, height: 44 }}>
                      Activate Agency
                    </Button>
                  </Popconfirm>
                ) : (
                  <Popconfirm title="Suspend this agency?" description="All affiliated agents will lose platform access."
                    onConfirm={() => toggleActiveStatus(agencyDetails, false)}
                    okText="Yes, Suspend" cancelText="Cancel"
                    okButtonProps={{ danger: true }}>
                    <Button block danger size="large" icon={<StopOutlined />} loading={actionLoading}
                      style={{ borderRadius: 10, fontWeight: 600, height: 44 }}>
                      Suspend Agency
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </div>
          ) : null}
        </Drawer>

        <style>{`
          .ant-segmented-item-selected {
            background-color: ${THEME.primary} !important;
            color: #fff !important;
          }
          .ant-segmented-item:hover:not(.ant-segmented-item-selected) {
            color: ${THEME.primary} !important;
          }
        `}</style>
      </div>
    );
  }

  // ── Generic tabs with filters ─────────────────────────────────
  const current = tabState[activeTab] || {};
  const users = current.data || [];
  const totalUsers = current.total || 0;
  const currentPage = current.page || 1;
  const itemsPerPage = current.limit || 10;
  const loading = current.loading || false;
  const currentSearch = current.search || "";
  const currentStatus = current.status || "all";

  const activeCount = users.filter(u => ["active", "approved"].includes(String(u.status).toLowerCase())).length;
  const pendingCount = users.filter(u => String(u.status).toLowerCase() === "pending").length;

  const stats = [
    { title: `Total ${currentTabConfig?.label || "Users"}`, value: totalUsers, icon: <UsergroupAddOutlined />, color: "#5c039b", bg: "#f3e8ff" },
    { title: "Active / Approved", value: activeCount, icon: <UserOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Pending", value: pendingCount, icon: <TeamOutlined />, color: "#d97706", bg: "#fef3c7" },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ padding: 10, background: "#f3e8ff", borderRadius: 10, color: "#5c039b" }}>
          <UsergroupAddOutlined style={{ fontSize: 24 }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>All Users</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>Unified directory of every user type on the platform.</Text>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 12 }}
        items={USER_TABS.map(t => ({
          key: t.key,
          label: (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {t.icon} {t.label}
              {tabState[t.key]?.total !== undefined && <Tag style={{ marginLeft: 4 }}>{tabState[t.key].total}</Tag>}
            </span>
          ),
        }))}
      />

      {currentTabConfig?.comingSoon ? (
        <Card bordered={false} style={{ borderRadius: 12, textAlign: "center", padding: "60px 24px" }}>
          <Title level={4} style={{ color: "#9ca3af" }}>Customer directory coming soon</Title>
          <Text type="secondary">Endpoint to be confirmed for the customer list.</Text>
        </Card>
      ) : (
        <>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            {stats.map((stat, i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: stat.bg, color: stat.color,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                      {stat.icon}
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.title}</Text>
                      <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>{stat.value}</Title>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }} bodyStyle={{ padding: 0 }}>
            {/* Filter Toolbar */}
            <div style={{
              display: "flex", flexWrap: "wrap", alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px", borderBottom: "1px solid #f0f0f0",
              background: "#FAFAFA", gap: 12,
            }}>
              <Segmented
                options={[
                  { label: "All", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Pending", value: "pending" },
                  { label: "Inactive", value: "inactive" },
                  { label: "Suspended", value: "suspended" },
                ]}
                value={currentStatus}
                onChange={handleGenericStatusChange}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <Input
                  placeholder={`Search ${currentTabConfig?.label || "users"}...`}
                  prefix={<FiSearch style={{ color: THEME.textLight }} />}
                  value={currentSearch}
                  onChange={(e) => handleGenericSearch(e.target.value)}
                  allowClear
                  onClear={() => handleGenericSearch("")}
                  style={{ width: 260, borderRadius: 8 }}
                />
                <Button icon={<FiRefreshCw />} onClick={handleGenericRefresh} style={{ borderRadius: 8 }}>
                  Refresh
                </Button>
              </div>
            </div>

            <div style={{ padding: "0 0 24px 0" }}>
              <CustomTable
                columns={fullColumns}
                data={users}
                loading={loading}
                totalItems={totalUsers}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={handleGenericPageChange}
                showSearch={false}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AllUsers;