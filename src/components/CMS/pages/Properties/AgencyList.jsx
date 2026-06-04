import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card, Typography, Avatar, Space, message, Button,
  Popconfirm, Tag, Input, Drawer, Divider, Dropdown, Segmented
} from "antd";
import {
  ApartmentOutlined, MailOutlined, PhoneOutlined,
  CheckCircleOutlined, StopOutlined, EnvironmentOutlined,
  DollarOutlined, MoreOutlined, TeamOutlined, FileTextOutlined,
  BuildOutlined, SafetyCertificateOutlined, CalendarOutlined
} from "@ant-design/icons";
import { FiEye, FiSearch, FiRefreshCw, FiShield, FiUsers, FiTrendingUp } from "react-icons/fi";

import CustomTable from "../../pages/custom/CustomTable";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const THEME = {
  primary:    "#4A027C",
  primaryLight:"#6D28D9",
  primaryBg:  "#F5F0FF",
  success:    "#059669",
  successBg:  "#ECFDF5",
  error:      "#DC2626",
  errorBg:    "#FEF2F2",
  warning:    "#D97706",
  warningBg:  "#FFFBEB",
  neutral:    "#6B7280",
  border:     "#E5E7EB",
  cardBg:     "#FFFFFF",
  pageBg:     "#F9FAFB",
  text:       "#111827",
  textLight:  "#6B7280",
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
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

// ── Detail Row ────────────────────────────────────────────────────────────────
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

// ── Main Component ────────────────────────────────────────────────────────────
const AgencyList = () => {
  const [agencies, setAgencies]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [activeTab, setActiveTab]   = useState("all");
  const [stats, setStats]           = useState({ total: 0, active: 0, suspended: 0 });

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalResults: 0, itemsPerPage: 10,
  });

  const [drawerOpen, setDrawerOpen]           = useState(false);
  const [agencyDetails, setAgencyDetails]     = useState(null);
  const [detailLoading, setDetailLoading]     = useState(false);
  const [actionLoading, setActionLoading]     = useState(false);

  const searchTimeout = useRef(null);

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const fetchAgencies = useCallback(async (
    page = 1, limit = 10, searchVal = "", status = activeTab
  ) => {
    setLoading(true);
    try {
      let url = `/agency/admin/agencies?page=${page}&limit=${limit}`;
      if (status && status !== "all") url += `&status=${status}`;
      if (searchVal?.trim())          url += `&search=${encodeURIComponent(searchVal.trim())}`;

      const res = await apiService.get(url);

      if (res) {
        const mappedData = (res.data || []).map((a, i) => ({
          ...a,
           _id: a._id || a.id,
          key: a._id || a.id,
          sno: (page - 1) * limit + i + 1,
        }));

        setAgencies(mappedData);
        setPagination({
          currentPage:  res.pagination?.currentPage || page,
          totalPages:   res.pagination?.totalPages  || 1,
          totalResults: res.pagination?.totalItems  || mappedData.length,
          itemsPerPage: res.pagination?.limit       || limit,
        });

        // derive stats from current full fetch (all tab)
        if (status === "all" && !searchVal) {
          setStats(prev => ({ ...prev, total: res.pagination?.totalItems || mappedData.length }));
        }
      } else {
        setAgencies([]);
      }
    } catch (err) {
      message.error("Failed to fetch agencies.");
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAgencies(1, pagination.itemsPerPage, search, activeTab);
  }, [activeTab]);

  // ── SEARCH ─────────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchAgencies(1, pagination.itemsPerPage, val, activeTab);
    }, 500);
  };

  // ── SUSPEND / ACTIVATE ─────────────────────────────────────────────────────
  const toggleActiveStatus = async (record, activate) => {
    const id = record?._id || record?.id;
      console.log("toggleActiveStatus called, id:", id, "record:", record);
    if (!id) { message.error("Invalid agency ID."); return; }

    setActionLoading(true);
    try {
      await apiService.put(
        `/agency/admin/agencies/${id}/${activate ? "activate" : "suspend"}`
      );
      message.success(`Agency ${activate ? "activated" : "suspended"} successfully.`);

      setAgencies(prev =>
        prev.map(a =>
          (a._id || a.id) === id
            ? { ...a, isActive: activate, isSuspended: !activate }
            : a
        )
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

  // ── DRAWER ─────────────────────────────────────────────────────────────────
  const openDrawer = async (record) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    setAgencyDetails(record);

    try {
      const id  = record._id || record.id;
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

  // ── DROPDOWN ───────────────────────────────────────────────────────────────
  const getDropdownItems = (record) => [
    
    {
      key: "view",
      icon: <FiEye style={{ color: THEME.primary }} />,
      label: <span style={{ fontSize: 13 }}>View Details</span>,
      onClick: () => openDrawer(record),
    },
    { type: "divider" },
    {
      key: record.isSuspended ? "activate" : "suspend",
      icon: record.isSuspended
        ? <CheckCircleOutlined style={{ color: THEME.success }} />
        : <StopOutlined style={{ color: THEME.error }} />,
      label: (
        <span style={{ fontSize: 13, color: record.isSuspended ? THEME.success : THEME.error }}>
          {record.isSuspended ? "Activate Agency" : "Suspend Agency"}
        </span>
      ),
      onClick: () => toggleActiveStatus(record, !!record.isSuspended),
    },
  ];

  // ── COLUMNS ────────────────────────────────────────────────────────────────
  const columns = [
    {
      key:   "companyName",
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
              color:      THEME.primary,
              fontWeight: 700,
              flexShrink: 0,
              border:     `1.5px solid ${THEME.border}`,
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
      key:   "primaryContactPhone",
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
      key:   "reraRegistrationNumber",
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
      key:   "subscriptionTier",
      title: "Tier",
      width: 110,
      render: (_, r) => {
        const tierColors = {
          basic:    { bg: "#F3F4F6", color: "#374151" },
          standard: { bg: "#EFF6FF", color: "#1D4ED8" },
          premium:  { bg: "#FDF4FF", color: "#7E22CE" },
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
      key:   "isActive",
      title: "Status",
      width: 120,
      render: (_, r) => {
        if (r.isSuspended) return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
            background: THEME.errorBg, color: THEME.error,
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            <StopOutlined style={{ fontSize: 10 }} /> Suspended
          </span>
        );
        if (r.isActive) return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
            background: THEME.successBg, color: THEME.success,
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            <CheckCircleOutlined style={{ fontSize: 10 }} /> Active
          </span>
        );
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
            background: THEME.warningBg, color: THEME.warning,
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            Inactive
          </span>
        );
      },
    },
    {
      key:    "actions",
      title:  "Actions",
      width:  80,
      render: (_, r) => (
        <Dropdown
          menu={{ items: getDropdownItems(r) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
            style={{
              borderRadius: 8,
              color: THEME.textLight,
              width: 34, height: 34, padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          />
        </Dropdown>
      ),
    },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px 28px", background: THEME.pageBg, minHeight: "100vh" }}>

      {/* HEADER */}
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

      {/* STAT CARDS */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard icon={<FiUsers />}     label="Total Agencies"     value={pagination.totalResults} color={THEME.primary}  bg={THEME.primaryBg} />
        <StatCard icon={<FiTrendingUp />} label="Active Agencies"   value={agencies.filter(a => a.isActive && !a.isSuspended).length} color={THEME.success} bg={THEME.successBg} />
        <StatCard icon={<FiShield />}    label="Suspended Agencies" value={agencies.filter(a => a.isSuspended).length} color={THEME.error}   bg={THEME.errorBg} />
      </div>

      {/* TABLE CARD */}
      <Card
        bordered={false}
        style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: `1px solid ${THEME.border}` }}
        bodyStyle={{ padding: 0 }}
      >
        {/* TOOLBAR */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px", borderBottom: `1px solid ${THEME.border}`,
          background: "#FAFAFA", gap: 12,
        }}>
          <Segmented
            options={[
              { label: "All",       value: "all"       },
              { label: "Active",    value: "active"    },
              { label: "Suspended", value: "suspended" },
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setPagination(prev => ({ ...prev, currentPage: 1 }));
            }}
            style={{ background: THEME.border }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <Input
              placeholder="Search by name, email, phone..."
              prefix={<FiSearch style={{ color: THEME.textLight }} />}
              value={search}
              onChange={handleSearch}
              allowClear
              onClear={() => {
                setSearch("");
                fetchAgencies(1, pagination.itemsPerPage, "", activeTab);
              }}
              style={{ width: 280, borderRadius: 8, fontSize: 13 }}
            />
            <Button
              icon={<FiRefreshCw />}
              onClick={() => fetchAgencies(pagination.currentPage, pagination.itemsPerPage, search, activeTab)}
              style={{ borderRadius: 8 }}
            >
              Refresh
            </Button>
          </div>
        </div>

        <CustomTable
          columns={columns}
          data={agencies}
          loading={loading}
          totalItems={pagination.totalResults}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={(page, limit) => fetchAgencies(page, limit, search, activeTab)}
          showSearch={false}
        />
      </Card>

      {/* DETAIL DRAWER */}
   <Drawer
  open={drawerOpen}
  onClose={() => { setDrawerOpen(false); setAgencyDetails(null); }}
  width={440}
  title={null}
  styles={{ body: { padding: 0, background: THEME.pageBg } }}
  destroyOnClose
>
  {detailLoading && !agencyDetails ? (
    <div style={{ padding: 80, textAlign: "center" }}>
      <Spin size="large" />
      <div style={{ marginTop: 16, color: THEME.textLight }}>Loading agency details…</div>
    </div>
  ) : agencyDetails ? (
    <div>
      {/* ── Purple gradient banner ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
          padding: "32px 28px 70px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar
            size={88}
            src={agencyDetails.logo || agencyDetails.profilePhoto}
            icon={<ApartmentOutlined />}
            style={{
              border: "3px solid rgba(255,255,255,0.9)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              background: "#fff",
              color: THEME.primary,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {agencyDetails.companyName?.charAt(0)?.toUpperCase()}
          </Avatar>
        </div>
      </div>

      {/* ── Floating info card (subtle overlap) ── */}
      <div style={{ padding: "0 24px", marginTop: -30 }}>
        <div
          style={{
            background: THEME.cardBg,
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
            padding: "24px 22px 20px",
            textAlign: "center",
            border: `1px solid ${THEME.border}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18, color: THEME.text }}>
            {agencyDetails.companyName || "Unnamed Agency"}
          </div>
          <div style={{ fontSize: 13, color: THEME.textLight, marginTop: 3 }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {agencyDetails.primaryContactEmail}
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

      {/* ── Mini stats row ── */}
      <div style={{ padding: "16px 24px 0" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Deals", value: agencyDetails.totalDeals || 0 },
            { label: "Leads", value: agencyDetails.totalLeads || 0 },
            { label: "Presentations", value: agencyDetails.presentationsUsed || 0 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: THEME.cardBg,
                borderRadius: 12,
                padding: "14px 12px",
                textAlign: "center",
                border: `1px solid ${THEME.border}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 20, color: THEME.primary }}>
                {s.value?.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: THEME.textLight, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detailed fields ── */}
      <div style={{ padding: "20px 24px" }}>
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: THEME.textLight,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Agency Details
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <DetailRow icon={<MailOutlined />}        label="Email"        value={agencyDetails.primaryContactEmail || "—"} />
          <DetailRow icon={<PhoneOutlined />}       label="Phone"        value={agencyDetails.primaryContactPhone || "—"} />
          <DetailRow icon={<EnvironmentOutlined />} label="City"         value={agencyDetails.address?.city     || "—"} />
          <DetailRow icon={<EnvironmentOutlined />} label="Country"      value={agencyDetails.address?.country  || "—"} />
          <DetailRow icon={<DollarOutlined />}      label="Subscription" value={agencyDetails.subscriptionTier || "basic"} />
          <DetailRow icon={<TeamOutlined />}        label="Presentations" value={`${agencyDetails.presentationsUsed || 0} used / ${agencyDetails.presentationQuota || 0} quota`} />
          <DetailRow icon={<DollarOutlined />}      label="Commission"   value={`AED ${(agencyDetails.commissionEarned || 0).toLocaleString()}`} />
          <DetailRow
            icon={<CalendarOutlined />}
            label="Joined"
            value={
              agencyDetails.createdAt
                ? new Date(agencyDetails.createdAt).toLocaleDateString("en-AE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
            }
          />
        </div>

        {/* Legal Documents (only if URLs exist) */}
        {(agencyDetails.tradeLicenceUrl || agencyDetails.reraLicenceUrl || agencyDetails.letterOfAuthorityUrl) && (
          <>
            <Divider style={{ margin: "20px 0 14px" }} />
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: THEME.textLight,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Legal Documents
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { url: agencyDetails.tradeLicenceUrl,      label: "Trade License"       },
                { url: agencyDetails.reraLicenceUrl,       label: "RERA License"        },
                { url: agencyDetails.letterOfAuthorityUrl, label: "Letter of Authority" },
              ]
                .filter((d) => d.url)
                .map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "9px 14px",
                      borderRadius: 8,
                      background: THEME.primaryBg,
                      color: THEME.primary,
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: "none",
                      border: `1px solid ${THEME.primaryBg}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <FileTextOutlined />
                    {doc.label}
                  </a>
                ))}
            </div>
          </>
        )}

        <Divider style={{ margin: "24px 0 16px" }} />

        {/* ── Action button ── */}
        {agencyDetails.isSuspended ? (
          <Popconfirm
            title="Activate this agency?"
            description="The agency will regain full platform access."
            onConfirm={() => toggleActiveStatus(agencyDetails, true)}
            okText="Yes, Activate"
            cancelText="Cancel"
            okButtonProps={{ style: { background: THEME.success, borderColor: THEME.success } }}
          >
            <Button
              block
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={actionLoading}
              style={{
                background: THEME.success,
                borderColor: THEME.success,
                borderRadius: 10,
                fontWeight: 600,
                height: 44,
              }}
            >
              Activate Agency
            </Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Suspend this agency?"
            description="All affiliated agents will lose platform access."
            onConfirm={() => toggleActiveStatus(agencyDetails, false)}
            okText="Yes, Suspend"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              block
              danger
              size="large"
              icon={<StopOutlined />}
              loading={actionLoading}
              style={{ borderRadius: 10, fontWeight: 600, height: 44 }}
            >
              Suspend Agency
            </Button>
          </Popconfirm>
        )}
      </div>
    </div>
  ) : null}
</Drawer>

      {/* SEGMENTED STYLES */}
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
};

export default AgencyList;