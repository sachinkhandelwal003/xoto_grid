// src/pages/Leads/AdvisorMyLeads.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Button, Tag, message, Space, DatePicker, Select, Input,
  Tooltip, Badge, Drawer, Modal, Form, Tabs, Progress, Alert
} from "antd";
import {
  EyeOutlined, SearchOutlined, FilterOutlined, ClearOutlined,
  ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined,
  UploadOutlined, PhoneOutlined, EditOutlined, ClockCircleOutlined,
  WarningOutlined, UserOutlined, FileTextOutlined, DollarOutlined,
  InfoCircleOutlined, CalculatorOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import CustomTable from "../../../CMS/pages/custom/CustomTable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// ─── Brand ─────────────────────────────────────────────────────────────────
const P = "#5C039B";
const PM = "#7C3AED";
const PL = "#F5F0FF";
const PB = "#E9D5FF";

const roleSlugMap = {
  '0': 'superadmin', '1': 'admin', '2': "customer", '5': 'vendor-b2c',
  '6': 'vendor-b2b', '7': 'freelancer', '11': 'accountant', '12': 'supervisor',
  '15': "agency", '16': "agent", '17': "developer", '18': "vault-admin",
  '22': "vaultagent", '21': "vaultpartner", '26': "vault-advisor", '23': "vault-ops",
};

// ─── Static config ──────────────────────────────────────────────────────────
const STATUS_CFG = {
  "New": { color: "blue", bg: "#EFF6FF", text: "#1D4ED8", icon: <FileTextOutlined />, order: 0 },
  "Assigned": { color: "purple", bg: "#F5F0FF", text: "#6D28D9", icon: <UserOutlined />, order: 1 },
  "Contacted": { color: "orange", bg: "#FFF7ED", text: "#C2410C", icon: <PhoneOutlined />, order: 2 },
  "Qualified": { color: "geekblue", bg: "#EEF2FF", text: "#4338CA", icon: <CheckCircleOutlined />, order: 3 },
  "Collecting Documents": { color: "cyan", bg: "#ECFEFF", text: "#0E7490", icon: <UploadOutlined />, order: 4 },
  "Application Created": { color: "volcano", bg: "#FFF5F3", text: "#C2410C", icon: <EditOutlined />, order: 6 },
  "Not Proceeding": { color: "red", bg: "#FEF2F2", text: "#B91C1C", icon: <CloseCircleOutlined />, order: 99 },
  "Disbursed": { color: "success", bg: "#ECFDF5", text: "#065F46", icon: <DollarOutlined />, order: 100 },
};

const STATUSES = Object.keys(STATUS_CFG);

const fmt = (n) => (n ? Number(n).toLocaleString("en-AE") : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

const BUSINESS_HOURS_SLA_MS = 4 * 60 * 60 * 1000;

// Get SLA status display
const getSLAStatus = (assignedAt, currentStatus, slaDeadline) => {
  if (!assignedAt) return null;
  if (currentStatus === "Contacted") return { status: "completed", text: "✓ SLA Met", color: "#10B981" };
  
  const now = new Date();
  const deadline = slaDeadline ? new Date(slaDeadline) : new Date(new Date(assignedAt).getTime() + BUSINESS_HOURS_SLA_MS);
  const remaining = deadline - now;
  
  if (remaining < 0) {
    const overdue = Math.abs(Math.floor(remaining / (1000 * 60 * 60)));
    return { status: "breached", text: `Breached by ${overdue}h`, color: "#EF4444" };
  }
  
  const hoursLeft = Math.floor(remaining / (1000 * 60 * 60));
  const minutesLeft = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (remaining < 30 * 60 * 1000) {
    return { status: "urgent", text: `${hoursLeft}h ${minutesLeft}m left`, color: "#F59E0B" };
  }
  
  return { status: "on_track", text: `${hoursLeft}h ${minutesLeft}m left`, color: "#6B7280" };
};

// Get time remaining formatted
const getTimeRemaining = (assignedAt, slaDeadline) => {
  if (!assignedAt) return null;
  const deadline = slaDeadline ? new Date(slaDeadline) : new Date(new Date(assignedAt).getTime() + BUSINESS_HOURS_SLA_MS);
  const remaining = deadline - new Date();
  
  if (remaining <= 0) return "Expired";
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const INIT_FILTERS = { search: "", status: "", eligibilityStatus: "", documentProgress: "" };

// ══════════════════════════════════════════════════════════════════════════
const AdvisorLeads = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

  // ─── Data state ─────────────────────────────────────────────────────────
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [activeTab, setActiveTab] = useState("assigned");
  const [summary, setSummary] = useState({});

  // ─── Filter state ────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(INIT_FILTERS);
  const [applied, setApplied] = useState(INIT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ─── Status update modal state ──────────────────────────────────────────
  const [statusModal, setStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const activeCount = Object.entries(applied).filter(([, v]) => v !== "" && v !== undefined).length;

  // Filter data based on active tab
  const filteredData = data.filter(lead => {
    if (activeTab === "assigned") return lead.currentStatus === "Assigned";
    if (activeTab === "contacted") return lead.currentStatus === "Contacted";
    if (activeTab === "qualified") return lead.currentStatus === "Qualified";
    if (activeTab === "collecting") return lead.currentStatus === "Collecting Documents";
    if (activeTab === "disbursed") return lead.currentStatus === "Disbursed";
    if (activeTab === "all") return true;
    return true;
  });

  const stats = {
    assigned: data.filter(r => r.currentStatus === "Assigned").length,
    contacted: data.filter(r => r.currentStatus === "Contacted").length,
    qualified: data.filter(r => r.currentStatus === "Qualified").length,
    collecting: data.filter(r => r.currentStatus === "Collecting Documents").length,
    disbursed: data.filter(r => r.currentStatus === "Disbursed").length,
    total: data.length
  };

  // ─── Fetch leads ─────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (page = currentPage, limit = itemsPerPage, f = applied) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit });
      if (f.search) params.set("search", f.search);
      if (f.status) params.set("status", f.status);
      if (f.eligibilityStatus) params.set("eligibilityStatus", f.eligibilityStatus);
      if (f.documentProgress) params.set("documentProgress", f.documentProgress);

      const res = await apiService.get(`/vault/lead/advisor/my-leads?${params.toString()}`);
      const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      const total = res?.data?.total || res?.data?.totalItems || list.length;
      setData(list);
      setTotalItems(total);
      setSummary(res?.data?.summary || {});
    } catch {
      message.error("Failed to load your leads.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, applied]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Auto-refresh SLA timers every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (data.some(lead => lead.assignedTo?.advisorId && lead.currentStatus !== "Contacted")) {
        fetchLeads(currentPage, itemsPerPage, applied);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [data, currentPage, itemsPerPage, applied, fetchLeads]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
    fetchLeads(page, size, applied);
  };

  const applyFilters = () => {
    setApplied({ ...filters });
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, filters);
    setDrawerOpen(false);
  };

  const resetFilters = () => {
    setFilters(INIT_FILTERS);
    setApplied(INIT_FILTERS);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, INIT_FILTERS);
    setDrawerOpen(false);
  };

  const handleSearchEnter = () => {
    const f = { ...applied, search: filters.search };
    setApplied(f);
    setCurrentPage(1);
    fetchLeads(1, itemsPerPage, f);
  };

  const handleViewDetail = (id) => {
    if (id) navigate(`/dashboard/${roleSlug}/vault/lead/${id}`);
    else message.warning("Lead ID not available");
  };

  // Navigate to Add Documents page - ONLY for Contacted leads that are eligible
  const handleAddDocs = (leadId) => {
    if (!leadId) return message.warning("Lead ID not available");
    navigate(`/dashboard/${roleSlug}/vault/lead/${leadId}/documents`);
  };

  // Navigate to Check Eligibility page
  const handleCheckEligibility = (leadId) => {
    if (!leadId) return message.warning("Lead ID not available");
    navigate(`/dashboard/${roleSlug}/vault/lead/${leadId}/eligibility`);
  };

  // ─── Open status update modal ───────────────────────────────────────────
  const openStatusModal = (record, status) => {
    setStatusTarget(record);
    setSelectedStatus(status);
    setStatusNotes("");
    setStatusModal(true);
  };

  // ─── Handle Contact status update ────────────────────────────────────────
  const handleContactUpdate = async () => {
    if (!statusTarget?._id) return;

    setStatusLoading(true);
    try {
      const response = await apiService.put(
        `/vault/lead/advisor/lead/${statusTarget._id}/status`,
        {
          status: "Contacted",
          notes: statusNotes.trim() || undefined,
        }
      );

      const sla = response?.data?.data?.sla;
      if (sla?.breached) {
        message.warning(`Lead contacted but SLA was BREACHED! Response time: ${sla.responseTimeHours} hours`);
      } else {
        message.success(`Lead marked as Contacted! Response time: ${sla?.responseTimeHours || 0} hours (Within SLA ✅)`);
      }

      setStatusModal(false);
      setStatusTarget(null);
      setStatusNotes("");
      fetchLeads(currentPage, itemsPerPage, applied);

    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to update status";
      message.error(errorMsg);
    } finally {
      setStatusLoading(false);
    }
  };

  // ─── Handle Qualified status update (only after documents verified AND eligibility checked) ──────
  const handleQualifyUpdate = async () => {
    if (!statusTarget?._id) return;

    // Check document verification percentage
    const docProgress = getDocumentProgress(statusTarget);
    const isReadyForQualify = docProgress === 100;
    
    // Check if eligibility is checked and true
    const isEligibilityChecked = statusTarget?.eligibility?.checked === true;
    const isEligible = statusTarget?.eligibility?.isEligible === true;

    if (!isReadyForQualify) {
      message.error(`Cannot qualify: Document collection is only ${docProgress}% complete. Please upload all documents first.`);
      return;
    }

    if (!isEligibilityChecked) {
      message.error(`Cannot qualify: Eligibility check not performed. Please check eligibility first.`);
      return;
    }

    if (!isEligible) {
      message.error(`Cannot qualify: Customer is not eligible. Please review eligibility details.`);
      return;
    }

    setStatusLoading(true);
    try {
      await apiService.put(
        `/vault/lead/advisor/lead/${statusTarget._id}/status`,
        {
          status: "Qualified",
          notes: statusNotes.trim() || undefined,
        }
      );

      message.success(`Lead marked as Qualified! Customer account created.`);

      setStatusModal(false);
      setStatusTarget(null);
      setStatusNotes("");
      fetchLeads(currentPage, itemsPerPage, applied);

    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to update status";
      message.error(errorMsg);
    } finally {
      setStatusLoading(false);
    }
  };

  // Get document progress percentage
  const getDocumentProgress = (lead) => {
    const docCollection = lead?.documentCollection || {};
    return docCollection.collectionPercentage || 0;
  };

  // Get document verification status
const getDocumentVerificationStatus = (lead) => {
  const docCollection = lead?.documentCollection || {};
  const uploaded = docCollection.documentsUploaded || 0;
  const verified = docCollection.documentsVerified || 0;
  const total = docCollection.totalDocumentsRequired || 7;
  
  return {
    percentage: docCollection.collectionPercentage || 0,
    verifiedPercentage: docCollection.verificationPercentage || 0,
    uploaded,
    verified,
    total,
    isComplete: (docCollection.collectionPercentage || 0) === 100,
    isVerified: (docCollection.verificationPercentage || 0) === 100,
    allVerified: verified === total && total > 0
  };
};

  // Get eligibility status display
  const getEligibilityStatus = (lead) => {
    const eligibility = lead?.eligibility || {};
    if (!eligibility.checked) {
      return { status: "not_checked", text: "Not Checked", color: "#9CA3AF", icon: <WarningOutlined /> };
    }
    if (eligibility.isEligible) {
      return { status: "eligible", text: "Eligible", color: "#10B981", icon: <CheckCircleOutlined /> };
    }
    return { status: "not_eligible", text: "Not Eligible", color: "#EF4444", icon: <CloseCircleOutlined /> };
  };

  // Get action buttons based on lead status
  // ✅ UPDATE getActionButtons function
const getActionButtons = (lead, leadId, currentStatus) => {
  const docStatus = getDocumentVerificationStatus(lead);
  const eligibilityStatus = getEligibilityStatus(lead);
  const canContact = currentStatus === "Assigned";
  const canAddDocs = currentStatus === "Contacted" && eligibilityStatus.status === "eligible";
  const canCheckEligibility = currentStatus === "Contacted";
  
  // ✅ UPDATED: canQualify requires docs to be VERIFIED (100% verification)
 // Inside getActionButtons function, update the canQualify condition:
const canQualify = currentStatus === "Contacted" && 
                  docStatus.isVerified &&           // ALL documents VERIFIED by Ops
                  eligibilityStatus.status === "eligible";

  // ✅ Tooltip message for disabled qualify button
 const getQualifyTooltip = () => {
  if (!docStatus.isComplete) {
    return `Cannot qualify: Document upload is only ${docStatus.percentage}% complete. Please upload all documents first.`;
  }
  if (docStatus.isComplete && !docStatus.isVerified) {
    return `⚠️ Cannot qualify: All ${docStatus.total} documents are uploaded but NOT VERIFIED yet.\nPlease wait for Ops team to verify documents.\nVerified: ${docStatus.verified}/${docStatus.total}`;
  }
  if (!eligibilityStatus.checked) {
    return "Cannot qualify: Please check eligibility first.";
  }
  if (!eligibilityStatus.eligible) {
    return "Cannot qualify: Customer is not eligible.";
  }
  return "Mark lead as Qualified (after all documents verified and eligibility confirmed)";
};

  return (
    <Space size={4} wrap>
      {/* View Details Button */}
      <Tooltip title="View Details">
        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(leadId)} style={{ color: P }} size="small">
          View
        </Button>
      </Tooltip>

      {/* Contact Button - Only for Assigned leads */}
      {canContact && (
        <Tooltip title="Mark lead as Contacted (starts document collection)">
          <Button
            size="small"
            icon={<PhoneOutlined />}
            onClick={() => openStatusModal(lead, "Contacted")}
            style={{
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              color: "#C2410C",
              borderColor: "#FED7AA",
              background: "#FFF7ED",
            }}
          >
            Contact
          </Button>
        </Tooltip>
      )}

      {/* Add Documents Button - ONLY for Contacted leads that are ELIGIBLE */}
      {canAddDocs && (
        <Tooltip title="Upload Documents for this Lead">
          <Button
            size="small"
            icon={<UploadOutlined />}
            onClick={() => handleAddDocs(leadId)}
            style={{ background: P, borderColor: P, borderRadius: 6, fontWeight: 600, fontSize: 11, color: "white" }}
          >
            {docStatus.isVerified ? "✅ Docs Verified" : docStatus.isComplete ? "📄 Docs Uploaded (Pending Verification)" : `📄 Add Docs (${docStatus.percentage}%)`}
          </Button>
        </Tooltip>
      )}

      {/* Check Eligibility Button */}
      {canCheckEligibility && (
        <Tooltip 
          title={eligibilityStatus.status === "not_checked" 
            ? "Check customer eligibility (DBR & LTV calculation)" 
            : eligibilityStatus.status === "eligible" 
              ? "Customer is eligible ✓" 
              : "Customer is not eligible ✗"}
        >
          <Button
            size="small"
            icon={<CalculatorOutlined />}
            onClick={() => handleCheckEligibility(leadId)}
            style={{
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: eligibilityStatus.status === "not_checked" ? "#F59E0B" : eligibilityStatus.status === "eligible" ? "#10B981" : "#EF4444",
              borderColor: eligibilityStatus.status === "not_checked" ? "#F59E0B" : eligibilityStatus.status === "eligible" ? "#10B981" : "#EF4444",
              color: "white",
            }}
          >
            {eligibilityStatus.status === "not_checked" 
              ? "Check Eligibility" 
              : eligibilityStatus.status === "eligible" 
                ? `✓ Eligible (${lead?.eligibility?.eligibilityScore || 0}%)` 
                : "✗ Not Eligible"}
          </Button>
        </Tooltip>
      )}

      {/* Qualify Button - Disabled with disclaimer when documents not verified */}
      {currentStatus === "Contacted" && (
        <Tooltip title={getQualifyTooltip()}>
          <Button
            size="small"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => canQualify && openStatusModal(lead, "Qualified")}
            disabled={!canQualify}
            style={{
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: canQualify ? "#4338CA" : "#9CA3AF",
              borderColor: canQualify ? "#4338CA" : "#9CA3AF",
              opacity: canQualify ? 1 : 0.6,
            }}
          >
            Qualify
          </Button>
        </Tooltip>
      )}
    </Space>
  );
};

  // ─── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: "customerInfo",
      title: "Client",
      width: 220,
      render: (_, r) => {
        const ci = r?.customerInfo || {};
        return (
          <div>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{ci.fullName || "—"}</div>
            {ci.email && <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{ci.email}</div>}
            {ci.mobileNumber && <div style={{ fontSize: 11, color: "#6B7280" }}>{ci.mobileNumber}</div>}
          </div>
        );
      },
    },
    {
      key: "propertyDetails",
      title: "Property",
      width: 180,
      render: (_, r) => {
        const pd = r?.propertyDetails || {};
        const addr = [pd.propertyAddress?.building, pd.propertyAddress?.area, pd.propertyAddress?.city].filter(Boolean).join(", ");
        return (
          <div>
            <div style={{ fontSize: 13, color: "#374151" }}>
              {pd.propertyType || "—"}{pd.propertySubtype ? ` • ${pd.propertySubtype}` : ""}
            </div>
            {addr && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{addr}</div>}
          </div>
        );
      },
    },
    {
      key: "loanAmount",
      title: "Loan Amount",
      width: 120,
      render: (_, r) => {
        const amt = r?.propertyDetails?.loanAmountRequired;
        return amt ? (
          <span style={{ fontWeight: 600, color: "#059669", fontSize: 13 }}>AED {fmt(amt)}</span>
        ) : <span style={{ color: "#D1D5DB" }}>—</span>;
      },
    },
    {
      key: "eligibilityStatus",
      title: "Eligibility",
      width: 120,
      render: (_, r) => {
        const eligibility = r?.eligibility || {};
        if (!eligibility.checked) {
          return (
            <Tag icon={<WarningOutlined />} color="warning" style={{ borderRadius: 20 }}>
              Not Checked
            </Tag>
          );
        }
        if (eligibility.isEligible) {
          return (
            <Tooltip title={`Score: ${eligibility.eligibilityScore || 0}% • Risk: ${eligibility.riskGrade || "Good"}`}>
              <Tag icon={<CheckCircleOutlined />} color="success" style={{ borderRadius: 20 }}>
                Eligible ({eligibility.eligibilityScore || 0}%)
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tooltip title={eligibility.eligibilityNotes || "Customer not eligible"}>
            <Tag icon={<CloseCircleOutlined />} color="error" style={{ borderRadius: 20 }}>
              Not Eligible
            </Tag>
          </Tooltip>
        );
      },
    },
    {
  key: "documentProgress",
  title: "Documents",
  width: 160,
  render: (_, r) => {
    const docStatus = getDocumentVerificationStatus(r);
    
    // Show different colors based on status
    let progressColor = "#9CA3AF";
    let progressText = "";
    
    if (!docStatus.isComplete && docStatus.percentage > 0) {
      progressColor = "#F59E0B"; // Orange - Uploading
      progressText = "Uploading...";
    } else if (docStatus.isComplete && !docStatus.isVerified) {
      progressColor = "#3B82F6"; // Blue - Uploaded, pending verification
      progressText = "Pending Verification";
    } else if (docStatus.isVerified) {
      progressColor = "#10B981"; // Green - Verified
      progressText = "Verified ✅";
    } else {
      progressText = "Not Started";
    }
    
    return (
      <div style={{ width: "100%" }}>
        <Tooltip title={`${docStatus.uploaded}/${docStatus.total} uploaded • ${docStatus.verified}/${docStatus.total} verified`}>
          <Progress 
            percent={docStatus.percentage} 
            size="small" 
            strokeColor={progressColor}
            format={(percent) => `${percent}%`}
          />
        </Tooltip>
        <div style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", marginTop: 2 }}>
          {docStatus.isVerified ? (
            <span style={{ color: "#10B981" }}>
              <CheckCircleOutlined /> {docStatus.verified}/{docStatus.total} Verified
            </span>
          ) : docStatus.isComplete ? (
            <span style={{ color: "#3B82F6" }}>
              <InfoCircleOutlined /> {docStatus.uploaded}/{docStatus.total} Uploaded (Pending Verification)
            </span>
          ) : (
            <span>{docStatus.uploaded}/{docStatus.total} Uploaded</span>
          )}
        </div>
      </div>
    );
  },
},
    {
      key: "currentStatus",
      title: "Status",
      width: 140,
      render: (_, r) => {
        const val = r?.currentStatus;
        if (!val) return <span style={{ color: "#D1D5DB" }}>—</span>;
        const cfg = STATUS_CFG[val] || { bg: "#F3F4F6", text: "#374151", icon: <FileTextOutlined /> };
        return (
          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.text, whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {cfg.icon} {val}
          </span>
        );
      },
    },
    {
      key: "slaStatus",
      title: "SLA",
      width: 100,
      render: (_, r) => {
        const assigned = r?.assignedTo;
        if (!assigned?.advisorId) return <span style={{ color: "#9CA3AF" }}>—</span>;
        
        const slaInfo = getSLAStatus(assigned.assignedAt, r?.currentStatus, r?.sla?.deadline);
        const timeRemaining = getTimeRemaining(assigned.assignedAt, r?.sla?.deadline);
        
        if (!slaInfo) return <span style={{ color: "#9CA3AF" }}>—</span>;
        
        return (
          <Tooltip title={`Assigned: ${new Date(assigned.assignedAt).toLocaleString()}\nDeadline: ${new Date(r?.sla?.deadline).toLocaleString()}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {slaInfo.status === "breached" && <WarningOutlined style={{ color: slaInfo.color }} />}
              {slaInfo.status === "urgent" && <ClockCircleOutlined style={{ color: slaInfo.color }} />}
              {slaInfo.status === "on_track" && <ClockCircleOutlined style={{ color: slaInfo.color }} />}
              {slaInfo.status === "completed" && <CheckCircleOutlined style={{ color: slaInfo.color }} />}
              <span style={{ fontSize: 11, color: slaInfo.color, fontWeight: slaInfo.status === "breached" ? 600 : 400 }}>
                {slaInfo.status === "breached" ? "BREACHED" : timeRemaining}
              </span>
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      width: 320,
      align: "center",
      fixed: "right",
      render: (_, r) => {
        const leadId = r?._id;
        const currentStatus = r?.currentStatus;
        return getActionButtons(r, leadId, currentStatus);
      },
    },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: "#F4F0FA", minHeight: "100vh", padding: "28px 24px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .vll-input .ant-input, .vll-select .ant-select-selector, .vll-date .ant-picker { border-radius: 10px !important; border-color: #E8DFF5 !important; font-size: 13px; }
        .vll-input .ant-input:focus, .vll-select .ant-select-focused .ant-select-selector, .vll-date .ant-picker-focused { border-color: ${P} !important; box-shadow: 0 0 0 3px rgba(92,3,155,0.1) !important; }
        .vll-table .ant-table-thead > tr > th { background: #FAF8FF !important; color: ${P} !important; font-weight: 700 !important; border-bottom: 1px solid #EDE4FF !important; font-size: 12px !important; }
        .vll-table .ant-table-tbody > tr:hover > td { background: #F5F0FF !important; }
        .vll-table .ant-table-tbody > tr > td { border-bottom: 1px solid #F5F0FF; }
        .vll-table .ant-pagination-item-active { border-color: ${P} !important; background: ${P} !important; }
        .vll-table .ant-pagination-item-active a { color: white !important; }
        .vll-drawer .ant-drawer-header { background: linear-gradient(135deg, #2D0058, #5B1AA0); }
        .vll-drawer .ant-drawer-title { color: white !important; font-weight: 700 !important; }
        .vll-drawer .ant-drawer-close { color: rgba(255,255,255,0.8) !important; }
        .vll-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(92,3,155,0.1) !important; }
        .ant-tabs-tab-active { color: ${P} !important; }
        .ant-tabs-ink-bar { background: ${P} !important; }
      `}</style>

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a0533", margin: 0 }}>My Leads</h1>
          <p style={{ fontSize: 13, color: "#8B7BAE", margin: "3px 0 0" }}>
            Your assigned mortgage pipeline — {loading ? "loading..." : `${totalItems.toLocaleString()} lead${totalItems !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button icon={<ReloadOutlined />} onClick={() => fetchLeads(currentPage, itemsPerPage, applied)} loading={loading}
            style={{ borderRadius: 10, borderColor: "#E8DFF5", color: P }} />
          <Badge count={activeCount} color={P} size="small">
            <Button icon={<FilterOutlined />} onClick={() => setDrawerOpen(true)}
              style={{ borderRadius: 10, background: activeCount > 0 ? PL : "white", borderColor: activeCount > 0 ? P : "#E8DFF5", color: activeCount > 0 ? P : "#374151", fontWeight: activeCount > 0 ? 700 : 400 }}>
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
          </Badge>
          {activeCount > 0 && (
            <Button icon={<ClearOutlined />} onClick={resetFilters}
              style={{ borderRadius: 10, borderColor: "#FECACA", color: "#DC2626", background: "#FEF2F2" }}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* SLA DISCLAIMER - Shows on Assigned Tab only */}
      {activeTab === "assigned" && (
        <Alert
          message={
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <InfoCircleOutlined style={{ fontSize: 18, color: P }} />
              <span>
                <strong>SLA Requirement:</strong> Each assigned lead <strong>MUST be contacted within 4 hours</strong> of assignment. 
                Click <strong>"Contact"</strong> after contacting the customer.
              </span>
            </div>
          }
          type="info"
          showIcon={false}
          style={{ 
            marginBottom: 16, 
            borderRadius: 12, 
            background: PL, 
            border: `1px solid ${PB}`,
            color: "#1a0533"
          }}
        />
      )}

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 18 }}>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Assigned</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#6D28D9", lineHeight: 1 }}>{stats.assigned}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>needs contact</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Contacted</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#C2410C", lineHeight: 1 }}>{stats.contacted}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>need docs & eligibility</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Qualified</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#4338CA", lineHeight: 1 }}>{stats.qualified}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>ready for proposal</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Collecting Docs</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#166534", lineHeight: 1 }}>{stats.collecting}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>in progress</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Disbursed</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#059669", lineHeight: 1 }}>{stats.disbursed}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>completed</div>
        </div>
        <div className="vll-stat" style={{ background: "white", borderRadius: 14, padding: "14px 18px", border: "1px solid #EDE9F6" }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700 }}>Total</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: P, lineHeight: 1 }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>all leads</div>
        </div>
      </div>

      {/* Tabs for Lead Status */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }} className="custom-tabs">
        <TabPane tab={<span><Badge count={stats.assigned} style={{ backgroundColor: P }} /> Assigned</span>} key="assigned" />
        <TabPane tab={<span><Badge count={stats.contacted} /> Contacted</span>} key="contacted" />
        <TabPane tab={<span><Badge count={stats.qualified} /> Qualified</span>} key="qualified" />
        <TabPane tab={<span><Badge count={stats.collecting} /> Collecting Docs</span>} key="collecting" />
        <TabPane tab={<span><Badge count={stats.disbursed} /> Disbursed</span>} key="disbursed" />
        <TabPane tab={<span><Badge count={stats.total} /> All</span>} key="all" />
      </Tabs>

      {/* Quick Search */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #EDE9F6", padding: "14px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div className="vll-input" style={{ flex: 1, minWidth: 220 }}>
            <Input
              prefix={<SearchOutlined style={{ color: P }} />}
              placeholder="Search name, email, phone..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
              onPressEnter={handleSearchEnter}
              allowClear
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="vll-table" style={{ background: "white", borderRadius: 16, border: "1px solid #EDE9F6", overflow: "hidden" }}>
        <CustomTable
          columns={columns}
          data={filteredData}
          loading={loading}
          totalItems={filteredData.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          showSearch={false}
        />
      </div>

      {/* Filter Drawer */}
      <Drawer
        className="vll-drawer"
        title="Filter My Leads"
        placement="right"
        width={360}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={<Button size="small" onClick={resetFilters} style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2", borderRadius: 8 }}>Reset All</Button>}
        footer={
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={() => setDrawerOpen(false)} style={{ flex: 1, borderRadius: 10 }}>Cancel</Button>
            <Button type="primary" onClick={applyFilters}
              style={{ flex: 2, background: `linear-gradient(135deg, #2D0058, ${PM})`, border: "none", borderRadius: 10, fontWeight: 600 }}>
              Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <FilterGroup label="Search" icon="🔍" hint="Name, email, or phone">
            <Input placeholder="e.g. Ahmed" value={filters.search} onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))} />
          </FilterGroup>
          <FilterGroup label="Eligibility Status" icon="✅" hint="Filter by eligibility">
            <Select style={{ width: "100%" }} placeholder="All" value={filters.eligibilityStatus || undefined} onChange={(v) => setFilters(p => ({ ...p, eligibilityStatus: v || "" }))} allowClear>
              <Option value="eligible">Eligible</Option>
              <Option value="not_eligible">Not Eligible</Option>
              <Option value="not_checked">Not Checked</Option>
            </Select>
          </FilterGroup>
          <FilterGroup label="Document Progress" icon="📄" hint="Filter by document completion">
            <Select style={{ width: "100%" }} placeholder="All" value={filters.documentProgress || undefined} onChange={(v) => setFilters(p => ({ ...p, documentProgress: v || "" }))} allowClear>
              <Option value="complete">100% Complete</Option>
              <Option value="incomplete">Incomplete</Option>
            </Select>
          </FilterGroup>
        </div>
      </Drawer>

      {/* Status Update Modal - Contact */}
      <Modal
        open={statusModal && selectedStatus === "Contacted"}
        onCancel={() => !statusLoading && setStatusModal(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FFF7ED", border: "1px solid #C2410C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneOutlined style={{ color: "#C2410C", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Mark as Contacted</div>
              {statusTarget && (
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  {statusTarget.customerInfo?.fullName || "—"} • {statusTarget.customerInfo?.mobileNumber || ""}
                </div>
              )}
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setStatusModal(false)} disabled={statusLoading}>Cancel</Button>,
          <Button
            key="submit"
            type="primary"
            loading={statusLoading}
            onClick={handleContactUpdate}
            style={{ background: "#C2410C", borderColor: "#C2410C", borderRadius: 8, fontWeight: 600 }}
            icon={<PhoneOutlined />}
          >
            Confirm — Contacted
          </Button>,
        ]}
        centered
        width={500}
        destroyOnClose
      >
        {/* Lead Summary */}
        {statusTarget && (
          <div style={{ background: "#F9F6FF", borderRadius: 12, padding: "16px", marginBottom: 20, border: `1px solid ${PB}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Client Name</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{statusTarget.customerInfo?.fullName || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Mobile</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{statusTarget.customerInfo?.mobileNumber || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Property Value</div>
                <div style={{ fontSize: 14, color: "#059669", fontWeight: 600 }}>AED {fmt(statusTarget.propertyDetails?.propertyValue)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Current Status</div>
                <div>
                  <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, background: STATUS_CFG[statusTarget.currentStatus]?.bg, color: STATUS_CFG[statusTarget.currentStatus]?.text }}>
                    {statusTarget.currentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Input */}
        <div style={{ marginBottom: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Contact Notes <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional but recommended)</span>
          </label>
        </div>
        <TextArea
          rows={4}
          value={statusNotes}
          onChange={(e) => setStatusNotes(e.target.value)}
          placeholder="e.g., Customer contacted. Interested in 2M AED loan, 25 years fixed rate. Will send documents tomorrow."
          maxLength={500}
          showCount
          style={{ borderRadius: 10, borderColor: "#E8DFF5" }}
        />
      </Modal>

      {/* Status Update Modal - Qualified */}
          {/* Status Update Modal - Qualified */}
      <Modal
        open={statusModal && selectedStatus === "Qualified"}
        onCancel={() => !statusLoading && setStatusModal(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EEF2FF", border: "1px solid #4338CA", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleOutlined style={{ color: "#4338CA", fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Mark as Qualified</div>
              {statusTarget && (
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  {statusTarget.customerInfo?.fullName || "—"} • {statusTarget.customerInfo?.mobileNumber || ""}
                </div>
              )}
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setStatusModal(false)} disabled={statusLoading}>Cancel</Button>,
          <Button
            key="submit"
            type="primary"
            loading={statusLoading}
            onClick={handleQualifyUpdate}
            style={{ background: "#4338CA", borderColor: "#4338CA", borderRadius: 8, fontWeight: 600 }}
            icon={<CheckCircleOutlined />}
          >
            Confirm — Qualify Lead
          </Button>,
        ]}
        centered
        width={500}
        destroyOnClose
      >
        {/* Lead Summary */}
        {statusTarget && (
          <div style={{ background: "#F9F6FF", borderRadius: 12, padding: "16px", marginBottom: 20, border: `1px solid ${PB}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Client Name</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{statusTarget.customerInfo?.fullName || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Mobile</div>
                <div style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{statusTarget.customerInfo?.mobileNumber || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Property Value</div>
                <div style={{ fontSize: 14, color: "#059669", fontWeight: 600 }}>AED {fmt(statusTarget.propertyDetails?.propertyValue)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Current Status</div>
                <div>
                  <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, background: STATUS_CFG[statusTarget.currentStatus]?.bg, color: STATUS_CFG[statusTarget.currentStatus]?.text }}>
                    {statusTarget.currentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ UPDATED DOCUMENT VERIFICATION STATUS */}
        {statusTarget && (
          (() => {
            const docStatus = getDocumentVerificationStatus(statusTarget);
            const isAllUploaded = docStatus.isComplete;
            const isAllVerified = docStatus.isVerified;
            const verifiedCount = docStatus.verified || 0;
            const totalDocs = docStatus.total;
            
            let bgColor = "#FEF3C7";
            let borderColor = "#FDE68A";
            let textColor = "#92400E";
            let icon = <WarningOutlined style={{ color: "#D97706" }} />;
            let message = "";
            
            if (!isAllUploaded) {
              bgColor = "#FEF3C7";
              borderColor = "#FDE68A";
              icon = <WarningOutlined style={{ color: "#D97706" }} />;
              message = `⚠️ Document upload is only ${docStatus.percentage}% complete. Please upload all documents first.`;
            } else if (isAllUploaded && !isAllVerified) {
              bgColor = "#EFF6FF";
              borderColor = "#BFDBFE";
              textColor = "#1E40AF";
              icon = <InfoCircleOutlined style={{ color: "#3B82F6" }} />;
              message = `⚠️ All ${totalDocs} documents are UPLOADED but NOT VERIFIED yet.\nPlease wait for Ops team to verify the documents.\nVerified: ${verifiedCount}/${totalDocs}`;
            } else if (isAllVerified) {
              bgColor = "#F0FDF4";
              borderColor = "#BBF7D0";
              textColor = "#065F46";
              icon = <CheckCircleOutlined style={{ color: "#10B981" }} />;
              message = `✅ All ${totalDocs} documents have been VERIFIED by Ops team.`;
            }
            
            return (
              <div style={{ 
                background: bgColor, 
                borderRadius: 10, 
                padding: "12px", 
                marginBottom: 16, 
                border: `1px solid ${borderColor}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "pre-line" }}>
                  {icon}
                  <span style={{ fontSize: 12, color: textColor }}>
                    {message}
                  </span>
                </div>
                {!isAllVerified && isAllUploaded && (
                  <div style={{ marginTop: 8 }}>
                    <Progress 
                      percent={docStatus.verifiedPercentage} 
                      size="small" 
                      strokeColor="#3B82F6"
                      format={() => `${docStatus.verified}/${totalDocs} Verified`}
                    />
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                      💡 Documents are being reviewed by our Ops team. You will be notified once verified.
                    </div>
                  </div>
                )}
                {!isAllUploaded && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "#92400E" }}>
                    💡 Please upload all required documents first. After upload, Ops team will verify them.
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* Eligibility Status */}
        {statusTarget && (
          <div style={{ 
            background: statusTarget?.eligibility?.isEligible ? "#F0FDF4" : statusTarget?.eligibility?.checked ? "#FEF2F2" : "#FEF3C7", 
            borderRadius: 10, 
            padding: "12px", 
            marginBottom: 16, 
            border: `1px solid ${statusTarget?.eligibility?.isEligible ? "#BBF7D0" : statusTarget?.eligibility?.checked ? "#FECACA" : "#FDE68A"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {statusTarget?.eligibility?.isEligible ? (
                <CheckCircleOutlined style={{ color: "#10B981" }} />
              ) : statusTarget?.eligibility?.checked ? (
                <CloseCircleOutlined style={{ color: "#EF4444" }} />
              ) : (
                <WarningOutlined style={{ color: "#D97706" }} />
              )}
              <span style={{ fontSize: 12, color: statusTarget?.eligibility?.isEligible ? "#065F46" : statusTarget?.eligibility?.checked ? "#991B1B" : "#92400E" }}>
                {statusTarget?.eligibility?.isEligible 
                  ? `✅ Customer is ELIGIBLE (Score: ${statusTarget.eligibility.eligibilityScore || 0}%)` 
                  : statusTarget?.eligibility?.checked 
                    ? "❌ Customer is NOT ELIGIBLE. Please review eligibility details."
                    : "⚠️ Eligibility check not performed. Please check eligibility first."
                }
              </span>
            </div>
            {statusTarget?.eligibility?.eligibilityNotes && !statusTarget?.eligibility?.isEligible && (
              <div style={{ marginTop: 8, fontSize: 11, color: "#6B7280" }}>
                {statusTarget.eligibility.eligibilityNotes}
              </div>
            )}
          </div>
        )}

        {/* Notes Input */}
        <div style={{ marginBottom: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Qualification Notes <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
          </label>
        </div>
        <TextArea
          rows={4}
          value={statusNotes}
          onChange={(e) => setStatusNotes(e.target.value)}
          placeholder="e.g., Customer qualified. Monthly income 35k AED. Eligible for loan up to 1.5M AED. Customer agreed to proceed."
          maxLength={500}
          showCount
          style={{ borderRadius: 10, borderColor: "#E8DFF5" }}
        />
      </Modal>
    </div>
  );
};

export default AdvisorLeads;

// Filter Group helper
function FilterGroup({ label, icon, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6B21A8", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</span>
          {hint && <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{hint}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}