import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Upload,
  message,
} from "antd";
import {
  Archive,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  RefreshCw,
  Search,
  UploadCloud,
  UserRound,
  Users,
} from "lucide-react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const UPLOAD_API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`;

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
  danger: "#DC2626",
};

const SECTIONS = {
  developer: {
    label: "Developers",
    title: "Developer Agreements",
    subtitle: "Commercial and onboarding agreements for developers.",
    icon: Building2,
    agreementType: "commercial_agreement",
  },
  agent: {
    label: "Agents",
    title: "Agent Agreements",
    subtitle: "A2A and onboarding agreements for agents.",
    icon: UserRound,
    agreementType: "agent_a2a_agreement",
  },
  agency: {
    label: "Partners",
    title: "Partner  Agreements",
    subtitle: "Master agreements for  partners.",
    icon: Users,
    agreementType: "agency_master_agreement",
  },
};

const AGREEMENT_TYPES = [
  { value: "main_agreement", label: "Main Agreement" },
  { value: "commercial_agreement", label: "Commercial Agreement" },
  { value: "commission_schedule", label: "Commission Schedule" },
  { value: "agency_master_agreement", label: "Agency Master Agreement" },
  { value: "agent_a2a_agreement", label: "Agent A2A Agreement" },
  { value: "addendum", label: "Addendum" },
  { value: "other", label: "Other" },
];

const STATUS_STYLE = {
  uploaded: { color: T.info, bg: "#DBEAFE", label: "Uploaded", icon: Clock3 },
  verified: { color: T.success, bg: "#DCFCE7", label: "Verified", icon: CheckCircle2 },
  changes_requested: { color: T.warning, bg: "#FEF3C7", label: "Changes Requested", icon: Clock3 },
  archived: { color: T.muted, bg: "#F1F5F9", label: "Archived", icon: Archive },
};

const getUploadUrl = (data) =>
  data?.file?.url ||
  data?.data?.url ||
  data?.url ||
  data?.fileUrl ||
  "";

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
    <Tag
      style={{
        border: 0,
        borderRadius: 999,
        background: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        padding: "4px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Icon size={13} />
      {cfg.label}
    </Tag>
  );
};

const Agreement = () => {
  const [activeType, setActiveType] = useState("developer");
  const [targets, setTargets] = useState({ developer: [], agent: [], agency: [] });
  const [agreements, setAgreements] = useState({ developer: [], agent: [], agency: [] });
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ developer: {}, agent: {}, agency: {} });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [form] = Form.useForm();

  const currentSection = SECTIONS[activeType];

  const fetchTargets = useCallback(async (type = activeType, query = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        targetType: type,
        includeAll: "true",
        page: "1",
        limit: "100",
      });
      if (query) params.set("search", query);
      const res = await apiService.get(`/agreements/upload-options?${params.toString()}`);
      const section = res?.data?.[type] || {};
      setTargets((prev) => ({ ...prev, [type]: section.data || [] }));
    } catch {
      message.error("Failed to load agreement upload list");
    } finally {
      setLoading(false);
    }
  }, [activeType, search]);

  const fetchAgreements = useCallback(async (type = activeType, page = 1, limit = 10) => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ targetType: type, page, limit });
      const res = await apiService.get(`/agreements?${params.toString()}`);
      setAgreements((prev) => ({ ...prev, [type]: normalizeList(res) }));
      setPagination((prev) => ({
        ...prev,
        [type]: normalizePagination(res),
      }));
    } catch {
      message.error("Failed to load uploaded agreements");
    } finally {
      setHistoryLoading(false);
    }
  }, [activeType]);

  useEffect(() => {
    fetchTargets(activeType, search);
    fetchAgreements(activeType);
  }, [activeType, fetchAgreements, fetchTargets, search]);

  const stats = useMemo(() => {
    const list = agreements[activeType] || [];
    return {
      targets: targets[activeType]?.length || 0,
      uploaded: list.length,
      verified: list.filter((item) => item.status === "verified").length,
    };
  }, [activeType, agreements, targets]);

  const openUploadModal = (target) => {
    setSelectedTarget(target);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({
      title: `${target.name || currentSection.label} Agreement`,
      agreementType: currentSection.agreementType,
    });
    setModalOpen(true);
  };

  const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(UPLOAD_API, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Document upload failed");
    }

    const data = await res.json();
    const url = getUploadUrl(data);
    if (!url) {
      throw new Error("Upload API did not return a file URL");
    }
    return url;
  };

  const handleSubmit = async (values) => {
    if (!selectedTarget) return;

    const rawFile = fileList?.[0]?.originFileObj;
    if (!rawFile && !values.documentUrl) {
      message.error("Please choose a document or paste a live URL");
      return;
    }

    setSaving(true);
    try {
      const documentUrl = values.documentUrl || await uploadDocument(rawFile);
      await apiService.post("/agreements", {
        targetType: activeType,
        targetId: selectedTarget._id,
        title: values.title,
        agreementType: values.agreementType,
        documents: documentUrl,
        effectiveDate: values.effectiveDate?.format("YYYY-MM-DD"),
        expiryDate: values.expiryDate?.format("YYYY-MM-DD"),
        notes: values.notes || "",
      });

      message.success("Agreement uploaded successfully");
      setModalOpen(false);
      setFileList([]);
      fetchTargets(activeType, search);
      fetchAgreements(activeType);
    } catch (err) {
      message.error(err?.message || "Failed to upload agreement");
    } finally {
      setSaving(false);
    }
  };

  const getLifecycleStatus = (row) => {
    if (row.targetType === "agency" || activeType === "agency") {
      if (row.isSuspended) return "Suspended";
      if (row.onboardingStatus) return row.onboardingStatus;
      if (row.isActive === true) return "Active";
      if (row.isActive === false) return "Inactive";
    }
    return row.onboardingStatus || row.agencyApprovalStatus || row.adminApprovalStatus || row.accountStatus || "-";
  };

  const handleVerifyAgreement = async (record) => {
    Modal.confirm({
      title: "Verify agreement?",
      content: "This will mark the agreement as verified and update the linked record status.",
      okText: "Verify",
      okButtonProps: { style: { background: T.success, borderColor: T.success } },
      onOk: async () => {
        setVerifyingId(record._id);
        try {
          await apiService.patch(`/agreements/${record._id}`, { status: "verified" });
          message.success("Agreement verified successfully");
          await Promise.all([
            fetchAgreements(activeType, pagination[activeType]?.page || 1, pagination[activeType]?.limit || 10),
            fetchTargets(activeType, search),
          ]);
        } catch (err) {
          message.error(err?.message || "Failed to verify agreement");
        } finally {
          setVerifyingId(null);
        }
      },
    });
  };

  const targetColumns = [
    {
      title: currentSection.label,
      dataIndex: "name",
      key: "name",
      render: (name, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.avatar}>{name?.[0]?.toUpperCase() || "X"}</div>
          <div>
            <div style={styles.strong}>{name || "-"}</div>
            <div style={styles.meta}>{row.email || row.phone || "-"}</div>
          </div>
        </div>
      ),
    },
    {
      title: activeType === "agency" ? "Account Status" : "Onboarding",
      key: "onboarding",
      render: (_, row) => {
        const value = getLifecycleStatus(row);
        const color = ["completed", "approved", "active"].includes(String(value).toLowerCase())
          ? "green"
          : value === "-"
            ? "default"
            : "gold";
        return <Tag color={color}>{String(value).replace(/_/g, " ")}</Tag>;
      },
    },
    {
      title: "Agreement Status",
      dataIndex: "agreementStatus",
      key: "agreementStatus",
      render: (status) => status ? <Tag color="purple">{status}</Tag> : <Tag>Not Uploaded</Tag>,
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, row) => (
        <Button
          type="primary"
          icon={<UploadCloud size={15} />}
          onClick={() => openUploadModal(row)}
          style={styles.primaryBtn}
        >
          Upload
        </Button>
      ),
    },
  ];

  const agreementColumns = [
    {
      title: "Agreement",
      key: "agreement",
      render: (_, row) => (
        <div>
          <div style={styles.strong}>{row.title || "Agreement"}</div>
          <div style={styles.meta}>{AGREEMENT_TYPES.find((t) => t.value === row.agreementType)?.label || row.agreementType}</div>
        </div>
      ),
    },
    {
      title: "Party",
      key: "party",
      render: (_, row) => {
        const party = row.developerId || row.agentId || row.agencyId || {};
        const name = party.companyName || party.fullName || [party.first_name, party.last_name].filter(Boolean).join(" ") || party.name;
        return (
          <div>
            <div style={styles.strong}>{name || "-"}</div>
            <div style={styles.meta}>{party.email || party.primaryContactEmail || party.phone_number || "-"}</div>
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
      title: "Documents",
      key: "documents",
      width: 130,
      render: (_, row) => {
        const doc = row.documents?.[0];
        if (!doc?.url) return "-";
        return (
          <Tooltip title="Open document">
            <Button
              href={doc.url}
              target="_blank"
              icon={<ExternalLink size={14} />}
              style={styles.iconBtn}
            >
              View
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, row) => (
        row.status === "verified" ? (
          <StatusTag status="verified" />
        ) : (
          <Button
            type="primary"
            icon={<CheckCircle2 size={14} />}
            loading={verifyingId === row._id}
            onClick={() => handleVerifyAgreement(row)}
            style={{ ...styles.primaryBtn, background: T.success, borderColor: T.success }}
          >
            Verify
          </Button>
        )
      ),
    },
  ];

  const tabItems = Object.entries(SECTIONS).map(([key, section]) => {
    const Icon = section.icon;
    return {
      key,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon size={16} />
          {section.label}
        </span>
      ),
      children: (
        <div style={styles.section}>
          <div style={styles.sectionHead}>
            <div>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              <p style={styles.sectionSub}>{section.subtitle}</p>
            </div>
            <Space wrap>
              <Input
                allowClear
                prefix={<Search size={15} color={T.muted} />}
                placeholder={`Search ${section.label.toLowerCase()}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 260 }}
              />
              <Button
                icon={<RefreshCw size={15} />}
                onClick={() => {
                  fetchTargets(key, search);
                  fetchAgreements(key);
                }}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Available for upload</span>
              <strong style={styles.statValue}>{stats.targets}</strong>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Uploaded agreements</span>
              <strong style={styles.statValue}>{stats.uploaded}</strong>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Verified</span>
              <strong style={styles.statValue}>{stats.verified}</strong>
            </div>
          </div>

          <div style={styles.tableBlock}>
            <div style={styles.blockTitle}>
              <FileText size={17} />
              Upload Agreements
            </div>
            <Table
              rowKey="_id"
              loading={loading}
              columns={targetColumns}
              dataSource={targets[key] || []}
              pagination={{ pageSize: 8 }}
              locale={{ emptyText: <Empty description="No records found" /> }}
              scroll={{ x: 780 }}
            />
          </div>

          <div style={styles.tableBlock}>
            <div style={styles.blockTitle}>
              <Archive size={17} />
              Uploaded History
            </div>
            <Table
              rowKey="_id"
              loading={historyLoading}
              columns={agreementColumns}
              dataSource={agreements[key] || []}
              pagination={{
                current: pagination[key]?.page || 1,
                pageSize: pagination[key]?.limit || 10,
                total: pagination[key]?.total || 0,
                onChange: (page, pageSize) => fetchAgreements(key, page, pageSize),
              }}
              locale={{ emptyText: <Empty description="No agreements uploaded yet" /> }}
              scroll={{ x: 900 }}
            />
          </div>
        </div>
      ),
    };
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Agreements</h1>
          <p style={styles.subtitle}>Upload and track onboarding agreements for developers, agents, and partner.</p>
        </div>
      </div>

      <Spin spinning={false}>
        <div style={styles.shell}>
          <Tabs activeKey={activeType} onChange={setActiveType} items={tabItems} />
        </div>
      </Spin>

      <Modal
        title={`Upload ${currentSection.title}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Upload Agreement"
        confirmLoading={saving}
        width={720}
      >
        <div style={styles.modalTarget}>
          <div style={styles.avatar}>{selectedTarget?.name?.[0]?.toUpperCase() || "X"}</div>
          <div>
            <div style={styles.strong}>{selectedTarget?.name || "-"}</div>
            <div style={styles.meta}>{selectedTarget?.email || selectedTarget?.phone || "-"}</div>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Agreement Title" rules={[{ required: true, message: "Title is required" }]}>
            <Input placeholder="Agreement title" />
          </Form.Item>

          <Form.Item name="agreementType" label="Agreement Type" rules={[{ required: true, message: "Agreement type is required" }]}>
            <Select options={AGREEMENT_TYPES} />
          </Form.Item>

          <div style={styles.twoCol}>
            <Form.Item name="effectiveDate" label="Effective Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="expiryDate" label="Expiry Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item label="Agreement Document">
            <Upload
              maxCount={1}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: list }) => setFileList(list)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            >
              <Button icon={<UploadCloud size={15} />}>Choose File</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="documentUrl" label="Live URL">
            <Input placeholder="Optional: paste URL if already uploaded" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Internal notes" />
          </Form.Item>
        </Form>
      </Modal>
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    color: T.text,
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 0,
  },
  subtitle: {
    margin: "6px 0 0",
    color: T.muted,
    fontSize: 14,
  },
  shell: {
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: 18,
    boxShadow: "0 8px 28px rgba(74, 2, 124, 0.08)",
  },
  section: {
    paddingTop: 8,
  },
  sectionHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: T.text,
    letterSpacing: 0,
  },
  sectionSub: {
    margin: "4px 0 0",
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
  tableBlock: {
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 18,
    background: "#FFFFFF",
  },
  blockTitle: {
    height: 46,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 14px",
    borderBottom: `1px solid ${T.border}`,
    color: T.text,
    fontWeight: 800,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    color: "#FFFFFF",
    fontWeight: 800,
    background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primary2} 100%)`,
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
  primaryBtn: {
    background: T.primary,
    borderColor: T.primary,
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  modalTarget: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    marginBottom: 16,
    background: "#FCFAFF",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
};

export default Agreement;
