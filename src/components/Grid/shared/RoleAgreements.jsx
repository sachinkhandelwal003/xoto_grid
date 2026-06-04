import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Space, Spin, Table, Tag, Tooltip, message } from "antd";
import {
  Archive,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  RefreshCw,
  UserRound,
  Users,
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const T = {
  primary: "#4A027C",
  primary2: "#7C3AED",
  bg: "#FAF8FF",
  panel: "#FFFFFF",
  border: "#E9E2FF",
  text: "#1E1B3B",
  muted: "#6B5B9B",
  success: "#16A34A",
  warning: "#B45309",
  info: "#2563EB",
};

const CONFIG = {
  developer: {
    title: "Developer Agreements",
    subtitle: "Commercial agreements uploaded by Xoto Admin for your developer account.",
    icon: Building2,
  },
  agency: {
    title: "Agency Agreements",
    subtitle: "Partner agency agreements and master documents uploaded by Xoto Admin.",
    icon: Users,
  },
  agent: {
    title: "Agent Agreements",
    subtitle: "A2A and onboarding agreements uploaded by Xoto Admin for your agent account.",
    icon: UserRound,
  },
};

const STATUS_STYLE = {
  uploaded: { color: T.info, bg: "#DBEAFE", label: "Uploaded", icon: Clock3 },
  verified: { color: T.success, bg: "#DCFCE7", label: "Verified", icon: CheckCircle2 },
  changes_requested: { color: T.warning, bg: "#FEF3C7", label: "Changes Requested", icon: Clock3 },
  archived: { color: T.muted, bg: "#F1F5F9", label: "Archived", icon: Archive },
};

const TYPE_LABEL = {
  main_agreement: "Main Agreement",
  commercial_agreement: "Commercial Agreement",
  commission_schedule: "Commission Schedule",
  agency_master_agreement: "Agency Master Agreement",
  agent_a2a_agreement: "Agent A2A Agreement",
  addendum: "Addendum",
  other: "Other",
};

const fmtDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const normalizeList = (res) => {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

const normalizePagination = (res) => res?.pagination || res?.data?.pagination || {};

const StatusTag = ({ status }) => {
  const cfg = STATUS_STYLE[status] || STATUS_STYLE.uploaded;
  const Icon = cfg.icon;
  return (
    <Tag style={styles.statusTag(cfg)}>
      <Icon size={13} />
      {cfg.label}
    </Tag>
  );
};

const getParty = (row) => row.developerId || row.agencyId || row.agentId || {};

const partyName = (party) =>
  party.companyName ||
  party.fullName ||
  [party.first_name, party.last_name].filter(Boolean).join(" ") ||
  party.name ||
  "-";

const partyContact = (party) =>
  party.email || party.primaryContactEmail || party.phone_number || party.primaryContactPhone || "-";

const RoleAgreements = ({ type }) => {
  const cfg = CONFIG[type] || CONFIG.agent;
  const Icon = cfg.icon;
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchAgreements = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      const res = await apiService.get(`/agreements/my?${params.toString()}`);
      setAgreements(normalizeList(res));
      setPagination(normalizePagination(res));
    } catch {
      message.error("Failed to load agreements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  const stats = useMemo(() => ({
    total: agreements.length,
    verified: agreements.filter((item) => item.status === "verified").length,
    uploaded: agreements.filter((item) => item.status !== "archived").length,
  }), [agreements]);

  const columns = [
    {
      title: "Agreement",
      key: "agreement",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.fileIcon}>
            <FileText size={18} />
          </div>
          <div>
            <div style={styles.strong}>{row.title || "Agreement"}</div>
            <div style={styles.meta}>{TYPE_LABEL[row.agreementType] || row.agreementType || "Agreement"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Account",
      key: "party",
      render: (_, row) => {
        const party = getParty(row);
        return (
          <div>
            <div style={styles.strong}>{partyName(party)}</div>
            <div style={styles.meta}>{partyContact(party)}</div>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: "Effective",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      render: fmtDate,
    },
    {
      title: "Expiry",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: fmtDate,
    },
    {
      title: "Documents",
      key: "documents",
      width: 140,
      render: (_, row) => {
        const docs = row.documents || [];
        if (!docs.length) return "-";
        return (
          <Space wrap>
            {docs.slice(0, 2).map((doc, index) => (
              <Tooltip title={doc.name || "Open document"} key={doc._id || doc.url || index}>
                <Button
                  href={doc.url}
                  target="_blank"
                  icon={<ExternalLink size={14} />}
                  style={styles.iconBtn}
                >
                  View
                </Button>
              </Tooltip>
            ))}
            {docs.length > 2 && <Tag>+{docs.length - 2}</Tag>}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <div style={styles.headerIcon}>
            <Icon size={22} />
          </div>
          <div>
            <h1 style={styles.title}>{cfg.title}</h1>
            <p style={styles.subtitle}>{cfg.subtitle}</p>
          </div>
        </div>
        <Button icon={<RefreshCw size={15} />} onClick={() => fetchAgreements(pagination.page || 1, pagination.limit || 10)}>
          Refresh
        </Button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Agreements</span>
          <strong style={styles.statValue}>{stats.total}</strong>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Active Documents</span>
          <strong style={styles.statValue}>{stats.uploaded}</strong>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Verified</span>
          <strong style={styles.statValue}>{stats.verified}</strong>
        </div>
      </div>

      <div style={styles.shell}>
        <div style={styles.blockTitle}>
          <Archive size={17} />
          Agreement Library
        </div>
        <Spin spinning={loading}>
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={agreements}
            pagination={{
              current: pagination.page || 1,
              pageSize: pagination.limit || 10,
              total: pagination.total || 0,
              onChange: fetchAgreements,
            }}
            locale={{ emptyText: <Empty description="No agreements uploaded yet" /> }}
            scroll={{ x: 920 }}
          />
        </Spin>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: T.bg,
    padding: 24,
    color: T.text,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  titleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    color: "#FFFFFF",
    background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
  },
  title: {
    margin: 0,
    color: T.text,
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: 0,
  },
  subtitle: {
    margin: "5px 0 0",
    color: T.muted,
    fontSize: 13,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },
  statBox: {
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: 14,
    background: "#FFFFFF",
  },
  statLabel: {
    color: T.muted,
    fontSize: 12,
    fontWeight: 700,
    display: "block",
    marginBottom: 6,
  },
  statValue: {
    color: T.primary,
    fontSize: 24,
    lineHeight: 1,
  },
  shell: {
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 8px 28px rgba(74, 2, 124, 0.08)",
  },
  blockTitle: {
    height: 48,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 14px",
    borderBottom: `1px solid ${T.border}`,
    color: T.text,
    fontWeight: 800,
  },
  fileIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    color: T.primary,
    background: "#F3E8FF",
    flexShrink: 0,
  },
  strong: {
    fontWeight: 800,
    color: T.text,
  },
  meta: {
    color: T.muted,
    fontSize: 12,
    marginTop: 2,
  },
  statusTag: (cfg) => ({
    border: 0,
    borderRadius: 999,
    background: cfg.bg,
    color: cfg.color,
    fontWeight: 700,
    padding: "4px 10px",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  }),
  iconBtn: {
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
};

export default RoleAgreements;
