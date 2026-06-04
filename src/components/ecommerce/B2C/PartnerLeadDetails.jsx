// src/pages/Leads/VaultAgentLeadDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Modal, Form, Input, Select, InputNumber, DatePicker, Button } from "antd";
import {
  ChevronLeft, User, Mail, Phone, Home, DollarSign, FileText,
  Eye, AlertCircle, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Layers, BarChart2, Shield, Activity, Check, Copy, Info,
  MapPin, Calendar, Hash, FilePlus, ClipboardList, Upload,
  TrendingUp, Percent, MessageSquare, ExternalLink, Clock,
  Zap, GitBranch, CreditCard, Globe, Target, Link,
} from "lucide-react";
import { Edit3 } from "lucide-react";
import dayjs from "dayjs";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

// ─── Design Tokens ─────────────────────────────────────────────────────────
const C = {
  primary: "#5C039B",
  primaryMid: "#7C3AED",
  primaryLight: "#9333EA",
  primaryGlow: "rgba(92,3,155,0.12)",
  primarySoft: "#F5F0FF",
  primaryBord: "#E9D5FF",
  green: "#10B981",
  greenSoft: "#ECFDF5",
  greenBord: "#A7F3D0",
  red: "#EF4444",
  redSoft: "#FEF2F2",
  redBord: "#FECACA",
  amber: "#F59E0B",
  amberSoft: "#FFFBEB",
  amberBord: "#FDE68A",
  blue: "#3B82F6",
  blueSoft: "#EFF6FF",
  gray: "#6B7280",
  grayLight: "#F9FAFB",
  grayBord: "#E5E7EB",
  text: "#111827",
  textSub: "#374151",
  textMuted: "#9CA3AF",
  white: "#FFFFFF",
  bg: "#F4F0FA",
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const show = (v) => (v !== null && v !== undefined && v !== "") ? v : null;
const fmt = (n) => n ? Number(n).toLocaleString("en-AE") : "—";
const fmtDate = (s) => { try { return s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null; } catch { return null; } };
const fmtDT = (s) => { try { return s ? new Date(s).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null; } catch { return null; } };
const boolLabel = (v) => v === true ? "Yes" : v === false ? "No" : null;
const isPdf = (url) => url?.toLowerCase()?.includes(".pdf");
const capWords = (s) => s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

// Helper to safely extract name from object or return raw value
const normalizeText = (val) => {
  if (!val) return "—";
  if (typeof val === "object") {
    // Handle nested name object
    if (val.name) {
      if (typeof val.name === "object" && val.name.first_name) {
        return `${val.name.first_name || ""} ${val.name.last_name || ""}`.trim() || "—";
      }
      if (typeof val.name === "string") return val.name;
    }
    // Handle fullName property
    if (val.fullName) return val.fullName;
    // Handle email property
    if (val.email) return val.email;
    // Handle _id as fallback
    if (val._id) return val._id;
    return "—";
  }
  return val;
};

// Safely get created by name from various possible structures
const getCreatedByName = (sourceInfo) => {
  if (!sourceInfo) return "—";
  if (sourceInfo.createdByName && typeof sourceInfo.createdByName === "string") {
    return sourceInfo.createdByName;
  }
  if (sourceInfo.createdById) {
    if (typeof sourceInfo.createdById === "object") {
      if (sourceInfo.createdById.name) {
        if (typeof sourceInfo.createdById.name === "object") {
          return `${sourceInfo.createdById.name.first_name || ""} ${sourceInfo.createdById.name.last_name || ""}`.trim() || "—";
        }
        return sourceInfo.createdById.name;
      }
      if (sourceInfo.createdById.email) return sourceInfo.createdById.email;
      if (sourceInfo.createdById._id) return sourceInfo.createdById._id;
    }
    if (typeof sourceInfo.createdById === "string") return sourceInfo.createdById;
  }
  return "—";
};

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CFG = {
  "New": { bg: "#EFF6FF", color: "#1D4ED8", border: "#93C5FD" },
  "Assigned": { bg: C.primarySoft, color: C.primary, border: C.primaryBord },
  "Contacted": { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  "Qualified": { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
  "Collecting Documentation": { bg: C.amberSoft, color: "#B45309", border: C.amberBord },
  "Documents Complete": { bg: "#ECFEFF", color: "#0E7490", border: "#A5F3FC" },
  "Application Opened": { bg: "#FFF5F3", color: "#C2410C", border: C.redBord },
  "Not Proceeding": { bg: C.redSoft, color: C.red, border: C.redBord },
  "Disbursed": { bg: C.greenSoft, color: C.green, border: C.greenBord },
};

const STATUS_OPTIONS = [
  "New", "Contacted", "Qualified", "Collecting Documentation",
  "Documents Complete", "Application Opened", "Disbursed", "Not Proceeding",
];

// ══════════════════════════════════════════════════════════════════════════
export default function PartnerLeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [leadStatus, setLeadStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [qualityScore, setQualityScore] = useState(95);
  const [docOverrides, setDocOverrides] = useState({});
  const [flashMsg, setFlashMsg] = useState({ type: "", text: "" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [form] = Form.useForm();

  const flash = (type, text) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg({ type: "", text: "" }), 4000);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchLead = async () => {
    try {
      setLoading(true); setError("");
      const res = await apiService.get(`/vault/lead/${id}`);
      const data = res?.data?.data || res?.data || null;
      setLead(data);
      setLeadStatus(data?.currentStatus || "");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocs = async () => {
    try {
      setDocsLoading(true);
      const res = await apiService.get(`/vault/lead/documents/${id}`);
      const raw = res?.data;
      const docs = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw?.documents) ? raw.documents
            : Array.isArray(raw?.data?.documents) ? raw.data.documents : [];
      setDocuments(docs);
    } catch { /* silent */ }
    finally { setDocsLoading(false); }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setEditSubmitting(true);

      const payload = {
        customerInfo: {
          ...values.customerInfo,
          dateOfBirth: values.customerInfo.dateOfBirth
            ? values.customerInfo.dateOfBirth.format('YYYY-MM-DD')
            : undefined,
        },
        propertyDetails: {
          ...values.propertyDetails,
          completionDate: values.propertyDetails.completionDate
            ? values.propertyDetails.completionDate.format('YYYY-MM-DD')
            : undefined,
        },
        loanRequirements: values.loanRequirements,
        referralType: values.referralType,
        loanAmountRange: values.loanAmountRange,
        source: values.source,
        notesToXoto: values.notesToXoto,
        currentStatus: values.currentStatus,
        commissionInfo: values.commissionInfo,
      };

      await apiService.put(`/vault/lead/advisor/lead/${id}/info`, payload);
      message.success('Lead updated successfully');
      setEditModalOpen(false);
      fetchLead();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setEditSubmitting(false);
    }
  };

  useEffect(() => { if (id) { fetchLead(); fetchDocs(); } }, [id]);

  // ── Status Update ─────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!leadStatus) { flash("error", "Please select a status"); return; }
    try {
      setStatusUpdating(true);
      await apiService.put(`/vault/lead/admin/${id}/status`, {
        status: leadStatus,
        notes: statusNote.trim() || undefined,
      });
      flash("success", `Status updated to "${leadStatus}"`);
      setStatusNote("");
      await fetchLead();
    } catch (err) {
      flash("error", err?.response?.data?.message || "Status update failed");
    } finally {
      setStatusUpdating(false);
    }
  };

  // ── Document modal ─────────────────────────────────────────────────────
  const openDocModal = (doc) => {
    const fileUrl = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
    if (!fileUrl) { message.warning("File URL not available"); return; }
    const docId = doc._id || doc.id;
    const override = docOverrides[docId];
    setSelectedDoc({ ...doc, fileUrl, ...(override || {}) });
    setModalOpen(true);
    setModalLoading(true);
    setShowRejectInput(false);
    setRejectReason("");
    setQualityScore(95);
  };

  const closeDocModal = () => { setModalOpen(false); setSelectedDoc(null); setShowRejectInput(false); };

  const handleVerifyDoc = async () => {
    const docId = selectedDoc?._id || selectedDoc?.id;
    if (!docId) return;
    setVerifying(true);
    try {
      await apiService.post(`/vault/lead/documents/${docId}/verify`, { qualityScore });
      const ov = { status: "Verified", verification_status: "Verified" };
      setDocOverrides((p) => ({ ...p, [docId]: ov }));
      setSelectedDoc((p) => ({ ...p, ...ov }));
      flash("success", "Document verified!");
      await fetchDocs();
    } catch (err) {
      flash("error", err?.response?.data?.message || "Verification failed");
    } finally { setVerifying(false); }
  };

  const handleRejectDoc = async () => {
    if (!rejectReason.trim()) { flash("error", "Please enter a rejection reason"); return; }
    const docId = selectedDoc?._id || selectedDoc?.id;
    if (!docId) return;
    setRejecting(true);
    try {
      await apiService.post(`/vault/lead/documents/${docId}/reject`, { reason: rejectReason });
      const ov = { status: "Rejected", verification_status: "Rejected", rejectionReason: rejectReason };
      setDocOverrides((p) => ({ ...p, [docId]: ov }));
      setSelectedDoc((p) => ({ ...p, ...ov }));
      setShowRejectInput(false);
      flash("success", "Document rejected.");
      await fetchDocs();
    } catch (err) {
      flash("error", err?.response?.data?.message || "Rejection failed");
    } finally { setRejecting(false); }
  };

  useEffect(() => {
    if (editModalOpen && lead) {
      const ci = lead.customerInfo || {};
      const pd = lead.propertyDetails || {};
      const pa = pd.propertyAddress || {};
      const lr = lead.loanRequirements || {};
      const si = lead.sourceInfo || {};
      const ci2 = lead.commissionInfo || {};

      form.setFieldsValue({
        customerInfo: {
          fullName: ci.fullName,
          email: ci.email,
          mobileNumber: ci.mobileNumber,
          alternativePhone: ci.alternativePhone,
          whatsappNumber: ci.whatsappNumber,
          dateOfBirth: ci.dateOfBirth ? dayjs(ci.dateOfBirth) : null,
          nationality: ci.nationality,
          maritalStatus: ci.maritalStatus,
          numberOfDependents: ci.numberOfDependents,
          occupation: ci.occupation,
          employer: ci.employer,
          monthlySalary: ci.monthlySalary,
          preferredName: ci.preferredName,
        },
        propertyDetails: {
          propertyType: pd.propertyType,
          propertySubtype: pd.propertySubtype,
          propertyValue: pd.propertyValue,
          downPaymentAmount: pd.downPaymentAmount,
          loanAmountRequired: pd.loanAmountRequired,
          propertyAgeYears: pd.propertyAgeYears,
          isOffPlan: pd.isOffPlan,
          completionDate: pd.completionDate ? dayjs(pd.completionDate) : null,
          propertyAddress: {
            building: pa.building,
            area: pa.area,
            city: pa.city,
          },
        },
        loanRequirements: {
          preferredTenureYears: lr.preferredTenureYears,
          preferredInterestRateType: lr.preferredInterestRateType,
          preferredBanks: lr.preferredBanks || [],
          feeFinancingPreference: lr.feeFinancingPreference,
          lifeInsurancePreference: lr.lifeInsurancePreference,
          propertyInsurancePreference: lr.propertyInsurancePreference,
          specialRequirements: lr.specialRequirements,
        },
        referralType: lead.referralType,
        loanAmountRange: lead.loanAmountRange,
        source: si.source,
        notesToXoto: lead.notesToXoto,
        currentStatus: lead.currentStatus,
        commissionInfo: {
          commissionEligible: ci2.commissionEligible,
          commissionStatus: ci2.commissionStatus,
          commissionAmount: ci2.commissionAmount,
        },
      });
    }
  }, [editModalOpen, lead, form]);

  // ── Loading / Error ────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RefreshCw size={24} color={C.primary} style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <p style={{ color: C.gray, fontSize: 14, fontWeight: 500 }}>Loading lead details...</p>
    </div>
  );

  if (error || !lead) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: C.redSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <AlertCircle size={28} color={C.red} />
      </div>
      <p style={{ color: "#B91C1C", marginBottom: 20, fontSize: 15, fontWeight: 600 }}>{error || "Lead not found"}</p>
      <button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        <ChevronLeft size={16} /> Go Back
      </button>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // ── Destructure API response with safe defaults ───────────────────────
  // ══════════════════════════════════════════════════════════════════════
  const ci = lead.customerInfo || {};
  const pd = lead.propertyDetails || {};
  const pa = pd.propertyAddress || {};
  const dc = lead.documentCollection || {};
  const si = lead.sourceInfo || {};
  const at = lead.assignedTo || {};
  const sla = lead.sla || {};
  const lr = lead.loanRequirements || {};
  const cv = lead.conversionInfo || {};
  const ci2 = lead.commissionInfo || {};
  const dup = lead.duplicateCheck || {};

  const currentStatus = lead.currentStatus || "New";
  const statusCfg = STATUS_CFG[currentStatus] || STATUS_CFG["New"];

  // Property address string
  const propertyAddr = [pa.building, pa.area, pa.city].filter(Boolean).join(", ");

  // Document counts
  const docsUploaded = dc.documentsUploaded ?? documents.length;
  const docsVerified = dc.documentsVerified ?? documents.filter((d) => (d.status || d.verification_status) === "Verified").length;
  const docsPending = dc.documentsPending ?? documents.filter((d) => { const s = d.status || d.verification_status; return !s || s === "Pending"; }).length;
  const docsRejected = dc.documentsRejected ?? documents.filter((d) => (d.status || d.verification_status) === "Rejected").length;
  const docsRequired = dc.totalDocumentsRequired ?? 7;

  // SLA status
  const isSlaBreached = sla.breached === true;
  const slaDeadline = sla.deadline;

  // Get assigned by name safely
  const assignedByName = (() => {
    if (!at.assignedBy) return null;
    if (typeof at.assignedBy === "string") return at.assignedBy;
    if (typeof at.assignedBy === "object") {
      if (at.assignedBy.name) {
        if (typeof at.assignedBy.name === "object") {
          return `${at.assignedBy.name.first_name || ""} ${at.assignedBy.name.last_name || ""}`.trim();
        }
        return at.assignedBy.name;
      }
      if (at.assignedBy.email) return at.assignedBy.email;
    }
    return null;
  })();

  // Tabs
  const TABS = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "property", label: "Property", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "financial", label: "Financial", icon: DollarSign },
    { id: "status", label: "Status", icon: ClipboardList },
    // { id: "system", label: "System", icon: Shield },
  ];

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .pd-tab:hover { background: ${C.primaryGlow} !important; color: ${C.primary} !important; }
        .pd-row:last-child { border-bottom: none !important; }
        .pd-copy:hover { color: ${C.primary} !important; background: ${C.primarySoft} !important; }
        .pd-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(92,3,155,0.1) !important; }
        .doc-card:hover { border-color: ${C.primaryBord} !important; box-shadow: 0 4px 16px rgba(92,3,155,0.08) !important; }
        .status-btn:hover { opacity: 0.85; }
        @media(max-width:768px){ .pd-grid-2{ grid-template-columns:1fr !important; } .pd-stats{ grid-template-columns:1fr 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Back & Edit Buttons ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.white, border: `1px solid ${C.grayBord}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primaryBord; e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primarySoft; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.grayBord; e.currentTarget.style.color = C.textSub; e.currentTarget.style.background = C.white; }}
          >
            <ChevronLeft size={15} /> Back to Vault Leads
          </button>
          {/* <button
            onClick={() => setEditModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: C.white, border: `1px solid ${C.grayBord}`,
              borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.primary,
              cursor: 'pointer', transition: 'all .2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.primaryBord;
              e.currentTarget.style.background = C.primarySoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.grayBord;
              e.currentTarget.style.background = C.white;
            }}
          >
            <Edit3 size={15} /> Edit Lead
          </button> */}
        </div>

        {/* ── Flash ── */}
        {flashMsg.text && (
          <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: flashMsg.type === "success" ? C.greenSoft : C.redSoft, color: flashMsg.type === "success" ? "#065F46" : "#991B1B", border: `1px solid ${flashMsg.type === "success" ? C.greenBord : C.redBord}` }}>
            {flashMsg.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {flashMsg.text}
          </div>
        )}

        {/* ── SLA Breach banner ── */}
        {isSlaBreached && (
          <div style={{ marginBottom: 14, padding: "10px 16px", borderRadius: 10, fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: C.redSoft, color: "#991B1B", border: `1px solid ${C.redBord}`, fontWeight: 600 }}>
            <AlertTriangle size={15} /> SLA Breached — This lead requires immediate attention
            {slaDeadline && <span style={{ fontWeight: 400, marginLeft: 4 }}>Deadline was: {fmtDT(slaDeadline)}</span>}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            PROFILE HEADER
        ════════════════════════════════════════════════════════════ */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.grayBord}`, marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(92,3,155,0.06)", animation: "fadeUp .4s ease" }}>
          <div style={{ height: 5, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid}, ${C.primaryLight})` }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "24px 28px 22px", flexWrap: "wrap" }}>
            {/* Icon */}
            <div style={{ width: 76, height: 76, borderRadius: 18, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={32} color={C.primary} />
            </div>

            {/* Client info */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-.4px" }}>
                  {ci.fullName || "—"}
                </h1>
                {ci.preferredName && <StatusPill bg={C.primarySoft} color={C.primary} label={`"${ci.preferredName}"`} />}
                <StatusPill bg={statusCfg.bg} color={statusCfg.color} label={currentStatus} dot />
                {lead.referralType && <StatusPill bg="#F0F9FF" color="#0369A1" label={lead.referralType} />}
                {lead.loanAmountRange && <StatusPill bg={C.amberSoft} color="#B45309" label={lead.loanAmountRange} />}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
                <InfoChip icon={Mail} value={ci.email} />
                <InfoChip icon={Phone} value={ci.mobileNumber} />
                <InfoChip icon={MapPin} value={propertyAddr || null} />
                <InfoChip icon={DollarSign} value={pd.loanAmountRequired ? `Loan: AED ${fmt(pd.loanAmountRequired)}` : pd.propertyValue ? `Property: AED ${fmt(pd.propertyValue)}` : null} />
                <InfoChip icon={Calendar} value={lead.createdAt ? `Created ${fmtDate(lead.createdAt)}` : null} />
                <InfoChip icon={Hash} value={lead._id ? `ID: …${lead._id.slice(-6)}` : null} />
              </div>
            </div>

            {/* Assigned Advisor + Source */}
            
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            STATS ROW
        ════════════════════════════════════════════════════════════ */}
        <div className="pd-stats" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
          <StatTile icon={DollarSign} color={C.primary} label="Loan Amount" value={pd.loanAmountRequired ? `AED ${fmt(pd.loanAmountRequired)}` : "—"} />
          <StatTile icon={TrendingUp} color={C.green} label="Property Value" value={pd.propertyValue ? `AED ${fmt(pd.propertyValue)}` : "—"} />
          <StatTile icon={FileText} color="#0891B2" label="Documents" value={`${docsUploaded} / ${docsRequired}`} />
          <StatTile icon={Percent} color={C.amber} label="Collection" value={`${dc.collectionPercentage ?? 0}%`} />
          <StatTile icon={Clock} color={isSlaBreached ? C.red : C.green} label="SLA" value={isSlaBreached ? "Breached" : "On Track"} />
        </div>

        {/* ════════════════════════════════════════════════════════════
            TABS
        ════════════════════════════════════════════════════════════ */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.grayBord}`, padding: "4px 6px", display: "flex", gap: 2, marginBottom: 16, overflowX: "auto" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className="pd-tab"
                onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "none", background: active ? C.primarySoft : "transparent", color: active ? C.primary : C.gray, fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s", borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent" }}
              >
                <Icon size={14} /> {tab.label}
                {tab.id === "documents" && documents.length > 0 && (
                  <span style={{ background: C.primarySoft, color: C.primary, fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, border: `1px solid ${C.primaryBord}` }}>
                    {documents.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════════
            TAB CONTENT
        ════════════════════════════════════════════════════════════ */}
        <div style={{ animation: "fadeUp .3s ease" }} key={activeTab}>

          {/* ── OVERVIEW ──────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

              <Section icon={User} title="Client Information">
                <DRow label="Full Name" value={show(ci.fullName)} />
                <DRow label="Preferred Name" value={show(ci.preferredName)} />
                <DRow label="Email" value={show(ci.email)} copy />
                <DRow label="Mobile" value={show(ci.mobileNumber)} copy />
                <DRow label="Alt. Phone" value={show(ci.alternativePhone)} />
                <DRow label="WhatsApp" value={show(ci.whatsappNumber)} copy />
                <DRow label="Date of Birth" value={fmtDate(ci.dateOfBirth)} />
                <DRow label="Nationality" value={show(ci.nationality)} />
                <DRow label="Marital Status" value={show(ci.maritalStatus)} />
                <DRow label="Dependents" value={show(ci.numberOfDependents)} />
                <DRow label="Occupation" value={show(ci.occupation)} />
                <DRow label="Employer" value={show(ci.employer)} />
                <DRow label="Monthly Salary" value={ci.monthlySalary ? `AED ${fmt(ci.monthlySalary)}` : null} />
              </Section>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Lead source */}
                <Section icon={FilePlus} title="Lead Source">
                  <DRow label="Source" value={show(capWords(si.source))} />
                  <DRow label="Submission" value={show(capWords(si.submissionMethod))} />
                  <DRow label="Created By" value={getCreatedByName(si)} />
                  <DRow label="Role" value={show(capWords(si.createdByRole))} />
                  <DRow label="Agent ID" value={show(si.createdById?._id || si.createdById)} copy />
                  <DRow label="Submitted At" value={fmtDT(si.createdAt)} />
                  <DRow label="Referral Type" value={show(lead.referralType)} />
                  <DRow label="Loan Range" value={show(lead.loanAmountRange)} />
                </Section>

             
              </div>

              {/* Notes */}
              {lead.notesToXoto && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <Section icon={MessageSquare} title="Notes to Xoto">
                    <div style={{ background: C.primarySoft, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.primaryBord}`, fontSize: 14, color: C.textSub, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                      {lead.notesToXoto}
                    </div>
                  </Section>
                </div>
              )}
            </div>
          )}

          {/* ── PROPERTY ──────────────────────────────────────────── */}
          {activeTab === "property" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

              <Section icon={Home} title="Property Details">
                <DRow label="Property Type" value={show(pd.propertyType)} />
                <DRow label="Property Subtype" value={show(pd.propertySubtype)} />
                <DRow label="Property Value" value={pd.propertyValue ? `AED ${fmt(pd.propertyValue)}` : null} />
                <DRow label="Down Payment" value={pd.downPaymentAmount ? `AED ${fmt(pd.downPaymentAmount)}` : null} />
                <DRow label="Loan Amount" value={pd.loanAmountRequired ? `AED ${fmt(pd.loanAmountRequired)}` : null} />
                <DRow label="Property Age" value={pd.propertyAgeYears !== null ? show(pd.propertyAgeYears) : null} />
                <DRow label="Off-Plan" value={boolLabel(pd.isOffPlan)} />
                <DRow label="Completion Date" value={fmtDate(pd.completionDate)} />
              </Section>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section icon={MapPin} title="Property Address">
                  <DRow label="Building" value={show(pa.building)} />
                  <DRow label="Area" value={show(pa.area)} />
                  <DRow label="City" value={show(pa.city)} />
                </Section>

                <Section icon={Target} title="Loan Requirements">
                  <DRow label="Preferred Tenure" value={lr.preferredTenureYears ? `${lr.preferredTenureYears} years` : null} />
                  <DRow label="Rate Type" value={show(lr.preferredInterestRateType)} />
                  <DRow label="Preferred Banks" value={lr.preferredBanks?.length ? lr.preferredBanks.join(", ") : "No preference"} />
                  <DRow label="Fee Financing" value={boolLabel(lr.feeFinancingPreference)} highlight={lr.feeFinancingPreference} />
                  <DRow label="Life Insurance" value={boolLabel(lr.lifeInsurancePreference)} highlight={lr.lifeInsurancePreference} />
                  <DRow label="Property Insurance" value={boolLabel(lr.propertyInsurancePreference)} highlight={lr.propertyInsurancePreference} />
                  {lr.specialRequirements && <DRow label="Special Requirements" value={show(lr.specialRequirements)} />}
                </Section>
              </div>

            </div>
          )}

          {/* ── DOCUMENTS ─────────────────────────────────────────── */}
          {activeTab === "documents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Doc stats from API */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {[
                  { label: "Required", value: docsRequired, color: C.gray },
                  { label: "Uploaded", value: docsUploaded, color: C.primary },
                  { label: "Verified", value: docsVerified, color: C.green },
                  { label: "Pending", value: docsPending, color: C.amber },
                  { label: "Rejected", value: docsRejected, color: C.red },
                ].map((s) => (
                  <div key={s.label} className="pd-stat" style={{ background: C.white, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.grayBord}`, transition: "all .2s", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Collection progress */}
              <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.grayBord}`, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textSub }}>Collection Progress</span>
                    {dc.collectionMethod && <span style={{ fontSize: 11, color: C.gray, marginLeft: 8 }}>via {capWords(dc.collectionMethod)}</span>}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.primary }}>{dc.collectionPercentage ?? 0}%</span>
                </div>
                <div style={{ background: C.primaryBord, borderRadius: 99, height: 10, marginBottom: 8 }}>
                  <div style={{ width: `${dc.collectionPercentage ?? 0}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid})`, height: "100%", borderRadius: 99, transition: "width .4s" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <div style={{ fontSize: 11, color: C.gray }}>
                    Verification: <strong style={{ color: C.primary }}>{dc.verificationPercentage ?? 0}%</strong>
                  </div>
                  <div style={{ fontSize: 11, color: C.gray }}>
                    Collection Started: <strong style={{ color: C.textSub }}>{fmtDate(dc.collectionStartedAt) || "—"}</strong>
                  </div>
                  <div style={{ fontSize: 11 }}>
                    {dc.readyForSubmission
                      ? <span style={{ color: C.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={12} /> Ready for Submission</span>
                      : <span style={{ color: C.amber, display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={12} /> Not Ready Yet</span>
                    }
                  </div>
                </div>
              </div>

              {/* Doc cards */}
              <Section icon={FileText} title={`Uploaded Documents (${documents.length})`}>
                {docsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}><Spin size="large" /></div>
                ) : documents.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                    {documents.map((doc, i) => {
                      const docId = doc._id || doc.id;
                      const override = docOverrides[docId];
                      return <DocCard key={docId || i} doc={override ? { ...doc, ...override } : doc} onView={openDocModal} />;
                    })}
                  </div>
                ) : <EmptyNote msg="No documents uploaded yet" />}
              </Section>
            </div>
          )}

          {/* ── FINANCIAL ─────────────────────────────────────────── */}
          {activeTab === "financial" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

              <Section icon={DollarSign} title="Commission Information">
                <DRow label="Commission Eligible" value={boolLabel(ci2.commissionEligible)} highlight={ci2.commissionEligible} />
                <DRow label="Commission Status" value={show(ci2.commissionStatus)} badge={ci2.commissionStatus === "Pending" ? { bg: C.amberSoft, color: "#B45309" } : ci2.commissionStatus === "Paid" ? { bg: C.greenSoft, color: C.green } : undefined} />
                <DRow label="Commission Amount" value={ci2.commissionAmount ? `AED ${fmt(ci2.commissionAmount)}` : null} />
                <DRow label="Expected Commission" value={lead.expectedCommission ? `AED ${fmt(lead.expectedCommission)}` : null} />
                <DRow label="Commission Tier" value={lead.commissionTier ? `${lead.commissionTier}%` : null} />
                <DRow label="Loan Amount Range" value={show(lead.loanAmountRange)} />
                <DRow label="Payment Date" value={fmtDate(ci2.expectedPaymentDate)} />
                <DRow label="Paid At" value={fmtDT(ci2.paidAt)} />
              </Section>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section icon={BarChart2} title="Commission Calculation">
                  <DRow label="Bank Commission to Xoto" value={ci2.calculation?.bankCommissionToXoto ? `${ci2.calculation.bankCommissionToXoto}%` : null} />
                  <DRow label="Agent Percentage" value={ci2.calculation?.agentPercentage ? `${ci2.calculation.agentPercentage}%` : null} />
                  <DRow label="Formula" value={show(ci2.calculation?.formula)} />
                </Section>

                <Section icon={GitBranch} title="Conversion Status">
                  <DRow label="Converted to Case" value={boolLabel(cv.convertedToCase)} highlight={cv.convertedToCase} />
                  <DRow label="Case ID" value={show(cv.caseId)} copy />
                  <DRow label="Converted At" value={fmtDT(cv.convertedAt)} />
                  <DRow label="Converted By" value={show(cv.convertedByName)} />
                  <DRow label="Converted Role" value={show(capWords(cv.convertedByRole))} />
                </Section>
              </div>

            </div>
          )}

          {/* ── STATUS ────────────────────────────────────────────── */}
          {activeTab === "status" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

              <Section icon={ClipboardList} title="Update Lead Status">
                {/* Current */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, marginBottom: 18 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusCfg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.gray }}>Current:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: statusCfg.color }}>{currentStatus}</span>
                </div>

                {/* Status selector */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                  {STATUS_OPTIONS.map((opt) => {
                    const cfg = STATUS_CFG[opt] || {};
                    const active = leadStatus === opt;
                    return (
                      <button key={opt} className="status-btn" onClick={() => setLeadStatus(opt)}
                        style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${active ? cfg.color || C.primary : C.grayBord}`, background: active ? cfg.bg || C.primarySoft : C.white, color: active ? cfg.color || C.primary : C.gray, transition: "all .15s" }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  Note <span style={{ color: C.textMuted, fontWeight: 400, textTransform: "none" }}>(optional)</span>
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note about this status change..."
                  style={{ width: "100%", border: `1px solid ${C.grayBord}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: C.text, marginBottom: 14 }}
                />
                <button
                  onClick={handleStatusUpdate}
                  disabled={statusUpdating || !leadStatus}
                  style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14, background: statusUpdating || !leadStatus ? C.grayBord : `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: statusUpdating || !leadStatus ? C.textMuted : "#fff", cursor: statusUpdating || !leadStatus ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {statusUpdating ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Updating...</> : <><ClipboardList size={14} /> Update Status</>}
                </button>
              </Section>

      
            </div>
          )}

          {/* ── SYSTEM ────────────────────────────────────────────── */}
          {/* {activeTab === "system" && (
            <div className="pd-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

              <Section icon={Shield} title="System Information">
                <DRow label="Lead ID" value={show(lead._id)} copy mono />
                <DRow label="Customer ID" value={show(lead.customerId)} copy />
                <DRow label="Version" value={lead.__v !== undefined ? `v${lead.__v}` : null} />
                <DRow label="Source" value={show(capWords(si.source))} />
                <DRow label="Source IP" value={show(si.sourceIp)} />
                <DRow label="User Agent" value={show(si.userAgent)} />
                <DRow label="Created At" value={fmtDT(lead.createdAt)} />
                <DRow label="Updated At" value={fmtDT(lead.updatedAt)} />
                <DRow label="Deleted" value={boolLabel(lead.isDeleted)} highlight={!lead.isDeleted} />
                <DRow label="Deleted At" value={fmtDT(lead.deletedAt)} />
              </Section>

              <Section icon={Activity} title="Lead Flags">
                <FlagRow label="Docs Ready for Submission" value={dc.readyForSubmission} icon={FileText} />
                <FlagRow label="Advisor Assigned" value={!!(at.advisorId)} icon={User} />
                <FlagRow label="SLA On Track" value={!sla.breached} icon={Clock} />
                <FlagRow label="Commission Eligible" value={ci2.commissionEligible} icon={DollarSign} />
                <FlagRow label="Converted to Case" value={cv.convertedToCase} icon={GitBranch} />
                <FlagRow label="Is Duplicate" value={dup.isDuplicate} icon={Activity} invert />
                <FlagRow label="Deleted" value={lead.isDeleted} icon={XCircle} invert />
              </Section>

            </div>
          )} */}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DOCUMENT PREVIEW MODAL
      ════════════════════════════════════════════════════════════════ */}
      {modalOpen && selectedDoc && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDocModal(); }}
        >
          <div style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 960, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <div style={{ height: 4, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid})` }} />

            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.grayBord}` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{selectedDoc?.fileName || selectedDoc?.file_name || "Document Preview"}</div>
                {selectedDoc?.documentType && <div style={{ fontSize: 12, color: C.primary, marginTop: 2 }}>{selectedDoc.documentType}</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {(() => {
                  const ds = selectedDoc?.status || selectedDoc?.verification_status;
                  const cfg = { Verified: { color: C.green, bg: C.greenSoft }, Rejected: { color: C.red, bg: C.redSoft }, Pending: { color: C.amber, bg: C.amberSoft } }[ds];
                  return ds && cfg ? <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "4px 12px", borderRadius: 99 }}>{ds}</span> : null;
                })()}
                <button onClick={closeDocModal} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
              </div>
            </div>

            {/* Preview */}
            <div style={{ flex: 1, background: C.grayLight, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 400, overflow: "hidden" }}>
              {modalLoading && <div style={{ position: "absolute", zIndex: 2 }}><Spin size="large" /></div>}
              {isPdf(selectedDoc.fileUrl)
                ? <iframe src={selectedDoc.fileUrl} style={{ width: "100%", height: 500, border: "none" }} onLoad={() => setModalLoading(false)} title="pdf" />
                : <img src={selectedDoc.fileUrl} alt="preview" style={{ maxHeight: 500, maxWidth: "100%", objectFit: "contain" }} onLoad={() => setModalLoading(false)} />
              }
            </div>

            {/* Actions */}
            <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.grayBord}` }}>
              {(() => {
                const ds = selectedDoc?.status || selectedDoc?.verification_status;
                if (ds === "Verified") return <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.green, fontWeight: 600, fontSize: 13 }}><CheckCircle size={15} /> Document is Verified</div>;
                if (ds === "Rejected") return (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.red, fontWeight: 600, fontSize: 13 }}>
                    <XCircle size={15} /> Rejected
                    {selectedDoc?.rejectionReason && <span style={{ fontWeight: 400, color: C.gray, fontSize: 12 }}>— {selectedDoc.rejectionReason}</span>}
                  </div>
                );
                return showRejectInput ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input autoFocus value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRejectDoc()} placeholder="Enter rejection reason..." style={{ flex: 1, padding: "9px 14px", border: `1px solid ${C.grayBord}`, borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                    <button onClick={handleRejectDoc} disabled={rejecting || !rejectReason.trim()} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: rejecting || !rejectReason.trim() ? C.grayBord : C.red, color: "#fff", fontWeight: 700, fontSize: 13, cursor: !rejectReason.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                      {rejecting ? "Rejecting..." : "Confirm Reject"}
                    </button>
                    <button onClick={() => { setShowRejectInput(false); setRejectReason(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.grayBord}`, background: C.white, color: C.gray, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.grayLight, border: `1px solid ${C.grayBord}`, borderRadius: 10, padding: "8px 14px" }}>
                      <span style={{ fontSize: 13, color: C.textSub, fontWeight: 500 }}>Quality Score</span>
                      <input type="number" min={0} max={100} value={qualityScore} onChange={(e) => setQualityScore(Math.min(100, Math.max(0, Number(e.target.value))))} style={{ width: 60, padding: "4px 8px", border: `1px solid ${C.grayBord}`, borderRadius: 8, fontSize: 14, fontWeight: 700, color: C.primary, textAlign: "center", outline: "none" }} />
                      <span style={{ fontSize: 12, color: C.gray }}>/100</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                      <button onClick={() => setShowRejectInput(true)} style={{ padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${C.redBord}`, background: C.redSoft, color: C.red, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><XCircle size={14} /> Reject</button>
                      <button onClick={handleVerifyDoc} disabled={verifying} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: verifying ? C.grayBord : C.green, color: verifying ? C.textMuted : "#fff", fontWeight: 700, fontSize: 13, cursor: verifying ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        {verifying ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Verifying...</> : <><CheckCircle size={14} /> Verify</>}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Edit3 size={18} color={C.primary} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Edit Lead</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        width={960}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}
        >
          {/* ----- Client Information ----- */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px', color: C.primary }}>Client Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item name={['customerInfo', 'fullName']} label="Full Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'preferredName']} label="Preferred Name">
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'email']} label="Email">
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'mobileNumber']} label="Mobile">
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'alternativePhone']} label="Alt. Phone">
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'whatsappNumber']} label="WhatsApp">
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'dateOfBirth']} label="Date of Birth">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={['customerInfo', 'nationality']} label="Nationality">
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'maritalStatus']} label="Marital Status">
                <Select allowClear>
                  <Select.Option value="Single">Single</Select.Option>
                  <Select.Option value="Married">Married</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['customerInfo', 'numberOfDependents']} label="Dependents">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={['customerInfo', 'occupation']} label="Occupation">
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'employer']} label="Employer">
                <Input />
              </Form.Item>
              <Form.Item name={['customerInfo', 'monthlySalary']} label="Monthly Salary">
                <InputNumber min={0} style={{ width: '100%' }} addonBefore="AED" />
              </Form.Item>
            </div>
          </div>

          {/* ----- Property Details ----- */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px', color: C.primary }}>Property Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item name={['propertyDetails', 'propertyType']} label="Property Type">
                <Input />
              </Form.Item>
              <Form.Item name={['propertyDetails', 'propertySubtype']} label="Subtype">
                <Input />
              </Form.Item>
              <Form.Item name={['propertyDetails', 'propertyValue']} label="Property Value">
                <InputNumber style={{ width: '100%' }} addonBefore="AED" min={0} />
              </Form.Item>
              <Form.Item name={['propertyDetails', 'downPaymentAmount']} label="Down Payment">
                <InputNumber style={{ width: '100%' }} addonBefore="AED" min={0} />
              </Form.Item>
              <Form.Item name={['propertyDetails', 'loanAmountRequired']} label="Loan Required">
                <InputNumber style={{ width: '100%' }} addonBefore="AED" min={0} />
              </Form.Item>
              <Form.Item name={['propertyDetails', 'propertyAgeYears']} label="Property Age (years)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={['propertyDetails', 'isOffPlan']} label="Off-Plan?">
                <Select allowClear>
                  <Select.Option value={true}>Yes</Select.Option>
                  <Select.Option value={false}>No</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['propertyDetails', 'completionDate']} label="Completion Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <h4 style={{ margin: '16px 0 8px' }}>Property Address</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
              <Form.Item name={['propertyDetails', 'propertyAddress', 'building']} label="Building">
                <Input />
              </Form.Item>
              <Form.Item name={['propertyDetails', 'propertyAddress', 'area']} label="Area">
                <Input />
              </Form.Item>
              <Form.Item name={['propertyDetails', 'propertyAddress', 'city']} label="City">
                <Input />
              </Form.Item>
            </div>
          </div>

          {/* ----- Loan Requirements ----- */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 12px', color: C.primary }}>Loan Requirements</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item name={['loanRequirements', 'preferredTenureYears']} label="Tenure (years)">
                <InputNumber min={1} max={25} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={['loanRequirements', 'preferredInterestRateType']} label="Rate Type">
                <Select allowClear>
                  <Select.Option value="Fixed">Fixed</Select.Option>
                  <Select.Option value="Variable">Variable</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['loanRequirements', 'preferredBanks']} label="Preferred Banks (comma separated)">
                <Select mode="tags" style={{ width: '100%' }} placeholder="Select or type bank" />
              </Form.Item>
              <Form.Item name={['loanRequirements', 'feeFinancingPreference']} label="Fee Financing?">
                <Select allowClear>
                  <Select.Option value={true}>Yes</Select.Option>
                  <Select.Option value={false}>No</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['loanRequirements', 'lifeInsurancePreference']} label="Life Insurance?">
                <Select allowClear>
                  <Select.Option value={true}>Yes</Select.Option>
                  <Select.Option value={false}>No</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['loanRequirements', 'propertyInsurancePreference']} label="Property Insurance?">
                <Select allowClear>
                  <Select.Option value={true}>Yes</Select.Option>
                  <Select.Option value={false}>No</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <Form.Item name={['loanRequirements', 'specialRequirements']} label="Special Requirements">
              <Input.TextArea rows={2} />
            </Form.Item>
          </div>

          {/* ----- Commission & Lead Info ----- */}
          <div>
            <h4 style={{ margin: '0 0 12px', color: C.primary }}>Commission & Lead Info</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Form.Item name={['commissionInfo', 'commissionEligible']} label="Commission Eligible?">
                <Select allowClear>
                  <Select.Option value={true}>Yes</Select.Option>
                  <Select.Option value={false}>No</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['commissionInfo', 'commissionStatus']} label="Commission Status">
                <Select allowClear>
                  <Select.Option value="Pending">Pending</Select.Option>
                  <Select.Option value="Paid">Paid</Select.Option>
                  <Select.Option value="Cancelled">Cancelled</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name={['commissionInfo', 'commissionAmount']} label="Commission Amount">
                <InputNumber style={{ width: '100%' }} addonBefore="AED" min={0} />
              </Form.Item>
              <Form.Item name="referralType" label="Referral Type">
                <Select allowClear>
                  <Select.Option value="Referral Only">Referral Only</Select.Option>
                  <Select.Option value="Docs Provided">Docs Provided</Select.Option>
                  <Select.Option value="Full Application">Full Application</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="loanAmountRange" label="Loan Amount Range">
                <Select allowClear>
                  <Select.Option value="< 500K">{'< 500K'}</Select.Option>
                  <Select.Option value="500K-1M">500K-1M</Select.Option>
                  <Select.Option value="1M-2M">1M-2M</Select.Option>
                  <Select.Option value="2M-5M">2M-5M</Select.Option>
                  <Select.Option value="> 5M">{'> 5M'}</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="source" label="Source">
                <Select allowClear>
                  <Select.Option value="website">Website</Select.Option>
                  <Select.Option value="freelance_agent">Freelance Agent</Select.Option>
                  <Select.Option value="partner">Partner</Select.Option>
                  <Select.Option value="admin">Admin</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="currentStatus" label="Status">
                <Select allowClear>
                  {STATUS_OPTIONS.map(opt => (
                    <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <Form.Item name="notesToXoto" label="Notes to Xoto">
              <Input.TextArea rows={3} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, borderTop: `1px solid ${C.grayBord}`, paddingTop: 16 }}>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={editSubmitting}
              onClick={handleEditSubmit}
              icon={<Edit3 size={14} />}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Sub-components ───────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

function Section({ icon: Icon, title, children }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.grayBord}`, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "13px 20px", background: C.grayLight, borderBottom: `1px solid ${C.grayBord}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primarySoft, border: `1px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={14} color={C.primary} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text, letterSpacing: "-.2px" }}>{title}</span>
      </div>
      <div style={{ padding: "14px 20px" }}>{children}</div>
    </div>
  );
}

function DRow({ label, value, copy, link, badge, highlight, expired, mono }) {
  const [copied, setCopied] = useState(false);
  
  // Handle object values safely
  let displayValue = value ?? "—";
  if (typeof displayValue === "object" && displayValue !== null) {
    if (displayValue.name) {
      if (typeof displayValue.name === "object") {
        displayValue = `${displayValue.name.first_name || ""} ${displayValue.name.last_name || ""}`.trim() || "—";
      } else {
        displayValue = displayValue.name;
      }
    } else if (displayValue.email) {
      displayValue = displayValue.email;
    } else if (displayValue._id) {
      displayValue = displayValue._id;
    } else {
      displayValue = JSON.stringify(displayValue);
    }
  }
  
  const isMissing = displayValue === "—" || displayValue === null || displayValue === undefined || displayValue === "";
  
  return (
    <div className="pd-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.grayLight}` }}>
      <span style={{ fontSize: 12, color: C.gray, fontWeight: 500, minWidth: 150, flexShrink: 0 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {badge && !isMissing ? (
          <span style={{ padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color }}>{displayValue}</span>
        ) : link && !isMissing ? (
          <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.primary, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>{displayValue} <ExternalLink size={11} /></a>
        ) : (
          <span style={{ fontSize: 13, fontWeight: isMissing ? 400 : 500, color: expired ? C.red : highlight ? C.green : isMissing ? C.textMuted : C.text, fontFamily: mono && !isMissing ? "'Courier New', monospace" : undefined, wordBreak: "break-all", textAlign: "right" }}>
            {expired && !isMissing ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={12} color={C.red} /> {displayValue}</span> : displayValue}
          </span>
        )}
        {copy && value && (
          <button className="pd-copy" onClick={() => { navigator.clipboard.writeText(String(value)); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 5px", borderRadius: 5, color: copied ? C.green : C.textMuted, display: "flex", alignItems: "center", transition: "all .2s" }}>
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="pd-stat" style={{ background: C.white, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.grayBord}`, transition: "all .2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={12} color={color} />
        </div>
        <span style={{ fontSize: 10, color: C.gray, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{value}</div>
    </div>
  );
}

function StatusPill({ bg, color, icon: Icon, label, dot }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: bg, color }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />}
      {Icon && <Icon size={11} />}
      {label}
    </span>
  );
}

function InfoChip({ icon: Icon, value }) {
  return value ? (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.gray }}>
      <Icon size={13} color={C.textMuted} /> {value}
    </div>
  ) : null;
}

function EmptyNote({ msg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.textMuted, fontSize: 13, padding: "10px 0", fontStyle: "italic" }}>
      <Info size={14} color={C.textMuted} /> {msg}
    </div>
  );
}

function FlagRow({ label, value, icon: Icon, invert = false }) {
  const isTrue = value === true, isFalse = value === false;
  const good = invert ? isFalse : isTrue;
  return (
    <div className="pd-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.grayLight}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textSub, fontWeight: 500 }}>
        <Icon size={14} color={C.gray} /> {label}
      </div>
      {!isTrue && !isFalse ? (
        <span style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>—</span>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: good ? C.greenSoft : C.redSoft }}>
          {good ? <CheckCircle size={12} color={C.green} /> : <XCircle size={12} color={C.red} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: good ? C.green : C.red }}>{isTrue ? "Yes" : "No"}</span>
        </div>
      )}
    </div>
  );
}

function DocCard({ doc, onView }) {
  const fileUrl = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
  const fileName = doc.fileName || doc.file_name || doc.name || "Unnamed Document";
  const docType = doc.documentType || doc.document_type || doc.type;
  const status = doc.status || doc.verification_status;
  const uploadAt = doc.uploadedAt || doc.created_at || doc.createdAt;
  const sCfg = { Verified: { color: C.green, bg: C.greenSoft, border: C.greenBord }, Rejected: { color: C.red, bg: C.redSoft, border: C.redBord }, Pending: { color: C.amber, bg: C.amberSoft, border: C.amberBord } }[status] || { color: C.gray, bg: C.grayLight, border: C.grayBord };
  return (
    <div className="doc-card" style={{ background: C.white, borderRadius: 12, border: `1px solid ${status === "Verified" ? C.greenBord : status === "Rejected" ? C.redBord : C.grayBord}`, padding: 16, display: "flex", flexDirection: "column", gap: 10, transition: "all .2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: isPdf(fileUrl) ? C.redSoft : C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${isPdf(fileUrl) ? C.redBord : C.primaryBord}` }}>
          <FileText size={20} color={isPdf(fileUrl) ? C.red : C.primary} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: C.text, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{fileName}</div>
          {docType && <div style={{ fontSize: 11, color: C.primary, marginTop: 2 }}>{docType}</div>}
          {uploadAt && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{fmtDate(uploadAt)}</div>}
        </div>
      </div>
      {status && <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.border}`, alignSelf: "flex-start" }}>{status}</span>}
      {status === "Rejected" && doc.rejectionReason && (
        <div style={{ background: C.redSoft, border: `1px solid ${C.redBord}`, borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#DC2626" }}>
          <strong>Reason:</strong> {doc.rejectionReason}
        </div>
      )}
      <button onClick={() => onView(doc)} disabled={!fileUrl} style={{ marginTop: "auto", width: "100%", padding: "9px 0", background: fileUrl ? `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})` : C.grayBord, color: fileUrl ? "#fff" : C.textMuted, border: "none", borderRadius: 9, fontWeight: 600, fontSize: 13, cursor: fileUrl ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Eye size={14} /> View Document
      </button>
    </div>
  );
}