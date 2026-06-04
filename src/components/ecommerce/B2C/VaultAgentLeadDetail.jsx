// src/pages/Leads/VaultAgentLeadDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
import {
  ChevronLeft, User, Mail, Phone, Home, DollarSign, FileText,
  Eye, AlertCircle, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Layers, BarChart2, Shield, Activity, Check, Copy, Info,
  MapPin, Calendar, Hash, FilePlus, ClipboardList, Upload,
  TrendingUp, Percent, MessageSquare, ExternalLink, Clock,
  Zap, GitBranch, CreditCard, Globe, Target, Link, Edit2, Save, X,
} from "lucide-react";
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
export default function VaultAgentLeadDetail() {
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
  const [selectedDoc,    setSelectedDoc]    = useState(null);
  const [modalOpen,      setModalOpen]      = useState(false);
  const [modalLoading,   setModalLoading]   = useState(false);
  const [verifying,      setVerifying]      = useState(false);
  const [rejecting,      setRejecting]      = useState(false);
  const [showRejectInput,setShowRejectInput]= useState(false);
  const [rejectReason,   setRejectReason]   = useState("");
  const [qualityScore,   setQualityScore]   = useState(95);
  const [docOverrides,   setDocOverrides]   = useState({});
  const [flashMsg,       setFlashMsg]       = useState({ type: "", text: "" });

  // ── Edit Modal State ────────────────────────────────────────────────────
  const [editModalOpen,     setEditModalOpen]     = useState(false);
  const [editSaving,        setEditSaving]        = useState(false);
  const [editForm,          setEditForm]          = useState({});
  const [editFormOriginal,  setEditFormOriginal]  = useState({});

  const flash = (type, text) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg({ type: "", text: "" }), 4000);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchLead = async () => {
    try {
      setLoading(true); setError("");
      const res  = await apiService.get(`/vault/lead/${id}`);
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

  useEffect(() => { if (id) { fetchLead(); fetchDocs(); } }, [id]);

  // ── Open Edit Modal ────────────────────────────────────────────────────
  const openEditModal = () => {
    if (!lead) return;
    const ci = lead.customerInfo    || {};
    const pd = lead.propertyDetails || {};
    const pa = pd.propertyAddress   || {};
    const lr = lead.loanRequirements|| {};
    const initialForm = {
      fullName                    : ci.fullName                    ?? "",
      preferredName               : ci.preferredName               ?? "",
      email                       : ci.email                       ?? "",
      mobileNumber                : ci.mobileNumber                ?? "",
      alternativePhone            : ci.alternativePhone            ?? "",
      whatsappNumber              : ci.whatsappNumber              ?? "",
      nationality                 : ci.nationality                 ?? "",
      maritalStatus               : ci.maritalStatus               ?? "",
      numberOfDependents          : ci.numberOfDependents          ?? "",
      occupation                  : ci.occupation                  ?? "",
      employer                    : ci.employer                    ?? "",
      monthlySalary               : ci.monthlySalary               ?? "",
      propertyType                : pd.propertyType                ?? "",
      propertySubtype             : pd.propertySubtype             ?? "",
      propertyValue               : pd.propertyValue               ?? "",
      loanAmountRequired          : pd.loanAmountRequired          ?? "",
      downPaymentAmount           : pd.downPaymentAmount           ?? "",
      propertyAgeYears            : pd.propertyAgeYears            ?? "",
      isOffPlan                   : pd.isOffPlan                   ?? false,
      building                    : pa.building                    ?? "",
      area                        : pa.area                        ?? "",
      city                        : pa.city                        ?? "",
      preferredTenureYears        : lr.preferredTenureYears        ?? "",
      preferredInterestRateType   : lr.preferredInterestRateType   ?? "",
      preferredBanks              : lr.preferredBanks?.join(", ") ?? "",
      feeFinancingPreference      : lr.feeFinancingPreference      ?? false,
      lifeInsurancePreference     : lr.lifeInsurancePreference     ?? false,
      propertyInsurancePreference : lr.propertyInsurancePreference ?? false,
      specialRequirements         : lr.specialRequirements         ?? "",
      notesToXoto                 : lead.notesToXoto               ?? "",
    };
    setEditForm(initialForm);
    setEditFormOriginal(initialForm);
    setEditModalOpen(true);
  };

  const handleEditChange = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Build only-changed nested payload, hit correct endpoint ───────────
  const handleEditSave = async () => {
    setEditSaving(true);
    try {
      const num        = (v) => (v !== "" && v !== null && v !== undefined) ? Number(v) : undefined;
      const orig       = editFormOriginal;
      const isDiff     = (key) => String(editForm[key]) !== String(orig[key] ?? "");
      const isBoolDiff = (key) => editForm[key] !== orig[key];

      // ── Customer Info section ─────────────────────────────────────────
      const ciKeys  = ["fullName","preferredName","email","mobileNumber","alternativePhone","whatsappNumber","nationality","maritalStatus","numberOfDependents","occupation","employer","monthlySalary"];
      const ciDirty = ciKeys.some(isDiff);
      const ci = ciDirty ? {} : null;
      if (ciDirty) {
        if (isDiff("fullName"))            ci.fullName            = editForm.fullName;
        if (isDiff("preferredName"))       ci.preferredName       = editForm.preferredName;
        if (isDiff("email"))               ci.email               = editForm.email;
        if (isDiff("mobileNumber"))        ci.mobileNumber        = editForm.mobileNumber;
        if (isDiff("alternativePhone"))    ci.alternativePhone    = editForm.alternativePhone;
        if (isDiff("whatsappNumber"))      ci.whatsappNumber      = editForm.whatsappNumber;
        if (isDiff("nationality"))         ci.nationality         = editForm.nationality;
        if (isDiff("maritalStatus"))       ci.maritalStatus       = editForm.maritalStatus;
        if (isDiff("numberOfDependents"))  ci.numberOfDependents  = num(editForm.numberOfDependents);
        if (isDiff("occupation"))          ci.occupation          = editForm.occupation;
        if (isDiff("employer"))            ci.employer            = editForm.employer;
        if (isDiff("monthlySalary"))       ci.monthlySalary       = num(editForm.monthlySalary);
      }

      // ── Property Details section ──────────────────────────────────────
      const pdScalarKeys = ["propertyType","propertySubtype","propertyValue","loanAmountRequired","downPaymentAmount","propertyAgeYears"];
      const addrKeys     = ["building","area","city"];
      const pdDirty      = pdScalarKeys.some(isDiff) || isBoolDiff("isOffPlan") || addrKeys.some(isDiff);
      const pd = pdDirty ? {} : null;
      if (pdDirty) {
        if (isDiff("propertyType"))         pd.propertyType       = editForm.propertyType;
        if (isDiff("propertySubtype"))      pd.propertySubtype    = editForm.propertySubtype;
        if (isDiff("propertyValue"))        pd.propertyValue      = num(editForm.propertyValue);
        if (isDiff("loanAmountRequired"))   pd.loanAmountRequired = num(editForm.loanAmountRequired);
        if (isDiff("downPaymentAmount"))    pd.downPaymentAmount  = num(editForm.downPaymentAmount);
        if (isDiff("propertyAgeYears"))     pd.propertyAgeYears   = num(editForm.propertyAgeYears);
        if (isBoolDiff("isOffPlan"))        pd.isOffPlan          = editForm.isOffPlan;
        if (addrKeys.some(isDiff)) {
          const addr = {};
          if (isDiff("building")) addr.building = editForm.building;
          if (isDiff("area"))     addr.area     = editForm.area;
          if (isDiff("city"))     addr.city     = editForm.city;
          pd.propertyAddress = addr;
        }
      }

      // ── Loan Requirements section ─────────────────────────────────────
      const lrScalarKeys = ["preferredTenureYears","preferredInterestRateType","preferredBanks","specialRequirements"];
      const lrBoolKeys   = ["feeFinancingPreference","lifeInsurancePreference","propertyInsurancePreference"];
      const lrDirty      = lrScalarKeys.some(isDiff) || lrBoolKeys.some(isBoolDiff);
      const lr = lrDirty ? {} : null;
      if (lrDirty) {
        if (isDiff("preferredTenureYears"))        lr.preferredTenureYears      = num(editForm.preferredTenureYears);
        if (isDiff("preferredInterestRateType"))   lr.preferredInterestRateType = editForm.preferredInterestRateType;
        if (isDiff("preferredBanks"))              lr.preferredBanks            = editForm.preferredBanks.split(",").map((s) => s.trim()).filter(Boolean);
        if (isDiff("specialRequirements"))         lr.specialRequirements       = editForm.specialRequirements;
        if (isBoolDiff("feeFinancingPreference"))      lr.feeFinancingPreference      = editForm.feeFinancingPreference;
        if (isBoolDiff("lifeInsurancePreference"))     lr.lifeInsurancePreference     = editForm.lifeInsurancePreference;
        if (isBoolDiff("propertyInsurancePreference")) lr.propertyInsurancePreference = editForm.propertyInsurancePreference;
      }

      // ── Assemble final payload ────────────────────────────────────────
      const payload = {};
      if (ci)                              payload.customerInfo     = ci;
      if (pd)                              payload.propertyDetails  = pd;
      if (lr)                              payload.loanRequirements = lr;
      if (isDiff("notesToXoto"))           payload.notesToXoto      = editForm.notesToXoto;

      if (Object.keys(payload).length === 0) {
        flash("error", "No changes to save");
        setEditSaving(false);
        return;
      }

      // ── Call correct API ──────────────────────────────────────────────
      const res         = await apiService.put(`/vault/lead/advisor/lead/${id}/info`, payload);
      const updatedData = res?.data?.data || res?.data || null;

      // ── Optimistic merge: update local state immediately ──────────────
      setLead((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (payload.customerInfo)    next.customerInfo    = { ...(prev.customerInfo    || {}), ...payload.customerInfo };
        if (payload.propertyDetails) next.propertyDetails = {
          ...(prev.propertyDetails || {}),
          ...payload.propertyDetails,
          propertyAddress: {
            ...((prev.propertyDetails || {}).propertyAddress || {}),
            ...(payload.propertyDetails.propertyAddress || {}),
          },
        };
        if (payload.loanRequirements) next.loanRequirements = { ...(prev.loanRequirements || {}), ...payload.loanRequirements };
        if (payload.notesToXoto !== undefined) next.notesToXoto = payload.notesToXoto;
        return updatedData ? { ...next, ...updatedData } : next;
      });

      const sections = Object.keys(payload).join(", ");
      flash("success", `Saved changes to: ${sections}`);
      setEditModalOpen(false);
    } catch (err) {
      flash("error", err?.response?.data?.message || "Failed to save changes");
    } finally {
      setEditSaving(false);
    }
  };

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
    const docId    = doc._id || doc.id;
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

  // ── Destructure API response ──────────────────────────────────────────
  const ci  = lead.customerInfo       || {};
  const pd  = lead.propertyDetails    || {};
  const pa  = pd.propertyAddress      || {};
  const dc  = lead.documentCollection || {};
  const si  = lead.sourceInfo         || {};
  const at  = lead.assignedTo         || {};
  const sla = lead.sla                || {};
  const lr  = lead.loanRequirements   || {};
  const cv  = lead.conversionInfo     || {};
  const ci2 = lead.commissionInfo     || {};
  const dup = lead.duplicateCheck     || {};

  const currentStatus = lead.currentStatus || "New";
  const statusCfg = STATUS_CFG[currentStatus] || STATUS_CFG["New"];

  const propertyAddr = [pa.building, pa.area, pa.city].filter(Boolean).join(", ");

  const docsUploaded = dc.documentsUploaded   ?? documents.length;
  const docsVerified = dc.documentsVerified   ?? documents.filter((d) => (d.status || d.verification_status) === "Verified").length;
  const docsPending  = dc.documentsPending    ?? documents.filter((d) => { const s = d.status || d.verification_status; return !s || s === "Pending"; }).length;
  const docsRejected = dc.documentsRejected   ?? documents.filter((d) => (d.status || d.verification_status) === "Rejected").length;
  const docsRequired = dc.totalDocumentsRequired ?? 7;

  const isSlaBreached = sla.breached === true;
  const slaDeadline = sla.deadline;

  const TABS = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "property", label: "Property", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "financial", label: "Financial", icon: DollarSign },
    { id: "status", label: "Status", icon: ClipboardList },
    { id: "system", label: "System", icon: Shield },
  ];

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        .pd-tab:hover     { background: ${C.primaryGlow} !important; color: ${C.primary} !important; }
        .pd-row:last-child { border-bottom: none !important; }
        .pd-copy:hover    { color: ${C.primary} !important; background: ${C.primarySoft} !important; }
        .pd-stat:hover    { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(92,3,155,0.1) !important; }
        .doc-card:hover   { border-color: ${C.primaryBord} !important; box-shadow: 0 4px 16px rgba(92,3,155,0.08) !important; }
        .status-btn:hover { opacity: 0.85; }
        .edit-btn:hover   { background: linear-gradient(135deg, #4A0280, #6D28D9) !important; box-shadow: 0 4px 20px rgba(92,3,155,0.35) !important; transform: translateY(-1px); }
        .edit-input:focus { border-color: ${C.primary} !important; outline: none; box-shadow: 0 0 0 3px rgba(92,3,155,0.1); }
        .edit-input       { transition: border-color .2s, box-shadow .2s; }
        .em-overlay       { animation: fadeIn .2s ease; }
        .em-panel         { animation: slideUp .25s ease; }
        @media(max-width:768px){ .pd-grid-2{ grid-template-columns:1fr !important; } .pd-stats{ grid-template-columns:1fr 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Back ── */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "8px 16px", background: C.white, border: `1px solid ${C.grayBord}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primaryBord; e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primarySoft; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.grayBord; e.currentTarget.style.color = C.textSub; e.currentTarget.style.background = C.white; }}
        >
          <ChevronLeft size={15} /> Back to Vault Leads
        </button>

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

            {/* ── TOP RIGHT: Assigned Advisor + Source + EDIT BUTTON ── */}
            <div style={{ flexShrink: 0, textAlign: "right", minWidth: 150, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              {/* Edit Button */}
              <button
                className="edit-btn"
                onClick={openEditModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 18px",
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all .2s",
                  boxShadow: "0 2px 12px rgba(92,3,155,0.25)",
                  letterSpacing: ".01em",
                }}
              >
                <Edit2 size={14} /> Edit Lead
              </button>

              {/* Assigned Advisor */}
              {at.advisorName ? (
                <div>
                  <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Assigned To</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{normalizeText(at.advisorName)}</div>
                  {at.assignedAt && <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{fmtDate(at.assignedAt)}</div>}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: C.amber, background: C.amberSoft, padding: "4px 10px", borderRadius: 8, display: "inline-block" }}>
                  ⚠ No Advisor Assigned
                </div>
              )}
              {si.source && <StatusPill bg={C.primarySoft} color={C.primary} label={capWords(si.source)} />}
            </div>
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

                <Section icon={User} title="Assigned Advisor">
                  {at.advisorName || at.advisorId ? (
                    <>
                      <DRow label="Advisor Name" value={normalizeText(at.advisorName)} />
                      <DRow label="Advisor ID" value={show(at.advisorId)} copy />
                      <DRow label="Assigned At" value={fmtDT(at.assignedAt)} />
                      <DRow label="Assigned By" value={show(at.assignedBy)} />
                    </>
                  ) : <EmptyNote msg="No advisor assigned yet" />}
                </Section>
              </div>

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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {[
                  { label: "Required",  value: docsRequired, color: C.gray    },
                  { label: "Uploaded",  value: docsUploaded, color: C.primary  },
                  { label: "Verified",  value: docsVerified, color: C.green   },
                  { label: "Pending",   value: docsPending,  color: C.amber   },
                  { label: "Rejected",  value: docsRejected, color: C.red     },
                ].map((s) => (
                  <div key={s.label} className="pd-stat" style={{ background: C.white, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.grayBord}`, transition: "all .2s", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

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
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, marginBottom: 18 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusCfg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.gray }}>Current:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: statusCfg.color }}>{currentStatus}</span>
                </div>

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

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section icon={Clock} title="SLA Information">
                  <DRow label="SLA Breached" value={boolLabel(sla.breached)} highlight={!sla.breached} />
                  <DRow label="Deadline" value={fmtDT(sla.deadline)} expired={isSlaBreached} />
                  <DRow label="First Contact At" value={fmtDT(sla.firstContactAt)} />
                  <DRow label="Qualified At" value={fmtDT(sla.qualificationAt)} />
                  <DRow label="Breached At" value={fmtDT(sla.breachedAt)} />
                  <DRow label="Reminders Sent" value={show(sla.reminderCount)} />
                  <DRow label="Last Reminder" value={fmtDT(sla.lastReminderSentAt)} />
                </Section>

                <Section icon={Activity} title="Duplicate Check">
                  <DRow label="Is Duplicate" value={boolLabel(dup.isDuplicate)} highlight={!dup.isDuplicate} />
                  <DRow label="Phone Match Found" value={boolLabel(dup.matchingPhoneFound)} highlight={!dup.matchingPhoneFound} />
                  <DRow label="Lookback Days" value={dup.lookbackDays ? `${dup.lookbackDays} days` : null} />
                  <DRow label="Checked At" value={fmtDT(dup.checkPerformedAt)} />
                </Section>
              </div>
            </div>
          )}

          {/* ── SYSTEM ────────────────────────────────────────────── */}
          {activeTab === "system" && (
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
          )}
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

            <div style={{ flex: 1, background: C.grayLight, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 400, overflow: "hidden" }}>
              {modalLoading && <div style={{ position: "absolute", zIndex: 2 }}><Spin size="large" /></div>}
              {isPdf(selectedDoc.fileUrl)
                ? <iframe src={selectedDoc.fileUrl} style={{ width: "100%", height: 500, border: "none" }} onLoad={() => setModalLoading(false)} title="pdf" />
                : <img src={selectedDoc.fileUrl} alt="preview" style={{ maxHeight: 500, maxWidth: "100%", objectFit: "contain" }} onLoad={() => setModalLoading(false)} />
              }
            </div>

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

      {/* ════════════════════════════════════════════════════════════════
          EDIT LEAD MODAL
      ════════════════════════════════════════════════════════════════ */}
      {editModalOpen && (
        <EditModal
          form={editForm}
          original={editFormOriginal}
          onChange={handleEditChange}
          onSave={handleEditSave}
          onClose={() => { if (!editSaving) setEditModalOpen(false); }}
          saving={editSaving}
          leadName={ci.fullName}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── EDIT MODAL ───────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

function EditModal({ form, original, onChange, onSave, onClose, saving, leadName }) {
  // Track which fields have changed for visual diff indicator
  const isDirty = (key) => String(form[key] ?? "") !== String(original[key] ?? "");
  const isBoolDirty = (key) => form[key] !== original[key];

  const dirtyCount = [
    "fullName","preferredName","email","mobileNumber","alternativePhone","whatsappNumber",
    "nationality","maritalStatus","numberOfDependents","occupation","employer","monthlySalary",
    "propertyType","propertySubtype","propertyValue","loanAmountRequired","downPaymentAmount",
    "propertyAgeYears","building","area","city","preferredTenureYears","preferredInterestRateType",
    "preferredBanks","specialRequirements","notesToXoto",
  ].filter(isDirty).length + [
    "isOffPlan","feeFinancingPreference","lifeInsurancePreference","propertyInsurancePreference",
  ].filter(isBoolDirty).length;

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="em-overlay"
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", backdropFilter: "blur(3px)", overflowY: "auto" }}
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div
        className="em-panel"
        style={{ background: C.white, borderRadius: 20, width: "100%", maxWidth: 860, boxShadow: "0 32px 100px rgba(0,0,0,0.22)", overflow: "hidden", marginBottom: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid}, ${C.primaryLight})` }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${C.grayBord}`, background: C.grayLight }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primarySoft, border: `1.5px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Edit2 size={16} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-.3px" }}>Edit Lead</div>
              {leadName && <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>{leadName}</div>}
            </div>
            {dirtyCount > 0 && (
              <span style={{ background: C.primarySoft, color: C.primary, border: `1px solid ${C.primaryBord}`, borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "2px 9px" }}>
                {dirtyCount} change{dirtyCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            style={{ background: "none", border: `1px solid ${C.grayBord}`, borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", color: C.gray, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
            onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.borderColor = C.redBord; e.currentTarget.style.color = C.red; e.currentTarget.style.background = C.redSoft; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.grayBord; e.currentTarget.style.color = C.gray; e.currentTarget.style.background = "none"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 28, maxHeight: "70vh", overflowY: "auto" }}>

          {/* ─── Customer Info ─────────────────────────────────── */}
          <EditSection title="Customer Information" icon={User}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              <EditField label="Full Name"         value={form.fullName}          onChange={(v) => onChange("fullName", v)}          dirty={isDirty("fullName")} />
              <EditField label="Preferred Name"    value={form.preferredName}     onChange={(v) => onChange("preferredName", v)}     dirty={isDirty("preferredName")} />
              <EditField label="Email"             value={form.email}             onChange={(v) => onChange("email", v)}             type="email" dirty={isDirty("email")} />
              <EditField label="Mobile Number"     value={form.mobileNumber}      onChange={(v) => onChange("mobileNumber", v)}      dirty={isDirty("mobileNumber")} />
              <EditField label="Alternative Phone" value={form.alternativePhone}  onChange={(v) => onChange("alternativePhone", v)}  dirty={isDirty("alternativePhone")} />
              <EditField label="WhatsApp Number"   value={form.whatsappNumber}    onChange={(v) => onChange("whatsappNumber", v)}    dirty={isDirty("whatsappNumber")} />
              <EditField label="Nationality"       value={form.nationality}       onChange={(v) => onChange("nationality", v)}       dirty={isDirty("nationality")} />
              <EditField label="Marital Status"    value={form.maritalStatus}     onChange={(v) => onChange("maritalStatus", v)}     dirty={isDirty("maritalStatus")} />
              <EditField label="No. of Dependents" value={form.numberOfDependents}onChange={(v) => onChange("numberOfDependents", v)}type="number" dirty={isDirty("numberOfDependents")} />
              <EditField label="Monthly Salary (AED)" value={form.monthlySalary} onChange={(v) => onChange("monthlySalary", v)}    type="number" dirty={isDirty("monthlySalary")} />
              <EditField label="Occupation"        value={form.occupation}        onChange={(v) => onChange("occupation", v)}        dirty={isDirty("occupation")} />
              <EditField label="Employer"          value={form.employer}          onChange={(v) => onChange("employer", v)}          dirty={isDirty("employer")} />
            </div>
          </EditSection>

          {/* ─── Property Details ─────────────────────────────── */}
          <EditSection title="Property Details" icon={Home}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              <EditField label="Property Type"       value={form.propertyType}       onChange={(v) => onChange("propertyType", v)}       dirty={isDirty("propertyType")} />
              <EditField label="Property Subtype"    value={form.propertySubtype}    onChange={(v) => onChange("propertySubtype", v)}    dirty={isDirty("propertySubtype")} />
              <EditField label="Property Value (AED)"value={form.propertyValue}      onChange={(v) => onChange("propertyValue", v)}      type="number" dirty={isDirty("propertyValue")} />
              <EditField label="Loan Amount (AED)"   value={form.loanAmountRequired} onChange={(v) => onChange("loanAmountRequired", v)} type="number" dirty={isDirty("loanAmountRequired")} />
              <EditField label="Down Payment (AED)"  value={form.downPaymentAmount}  onChange={(v) => onChange("downPaymentAmount", v)}  type="number" dirty={isDirty("downPaymentAmount")} />
              <EditField label="Property Age (Years)"value={form.propertyAgeYears}   onChange={(v) => onChange("propertyAgeYears", v)}   type="number" dirty={isDirty("propertyAgeYears")} />
            </div>

            {/* Off-Plan Toggle */}
            <div style={{ marginTop: 14 }}>
              <EditToggle
                label="Is Off-Plan"
                value={form.isOffPlan}
                onChange={(v) => onChange("isOffPlan", v)}
                dirty={isBoolDirty("isOffPlan")}
              />
            </div>

            {/* Property Address sub-section */}
            <div style={{ marginTop: 18, padding: "14px 16px", background: C.grayLight, borderRadius: 12, border: `1px solid ${C.grayBord}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={11} color={C.textMuted} /> Property Address
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px 16px" }}>
                <EditField label="Building" value={form.building} onChange={(v) => onChange("building", v)} dirty={isDirty("building")} />
                <EditField label="Area"     value={form.area}     onChange={(v) => onChange("area", v)}     dirty={isDirty("area")} />
                <EditField label="City"     value={form.city}     onChange={(v) => onChange("city", v)}     dirty={isDirty("city")} />
              </div>
            </div>
          </EditSection>

          {/* ─── Loan Requirements ───────────────────────────── */}
          <EditSection title="Loan Requirements" icon={Target}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              <EditField label="Preferred Tenure (Years)"  value={form.preferredTenureYears}      onChange={(v) => onChange("preferredTenureYears", v)}      type="number" dirty={isDirty("preferredTenureYears")} />
              <EditField label="Preferred Rate Type"       value={form.preferredInterestRateType} onChange={(v) => onChange("preferredInterestRateType", v)} dirty={isDirty("preferredInterestRateType")} />
              <div style={{ gridColumn: "1 / -1" }}>
                <EditField label="Preferred Banks (comma-separated)" value={form.preferredBanks} onChange={(v) => onChange("preferredBanks", v)} dirty={isDirty("preferredBanks")} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <EditField label="Special Requirements" value={form.specialRequirements} onChange={(v) => onChange("specialRequirements", v)} multiline rows={2} dirty={isDirty("specialRequirements")} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <EditToggle label="Fee Financing Preference"      value={form.feeFinancingPreference}      onChange={(v) => onChange("feeFinancingPreference", v)}      dirty={isBoolDirty("feeFinancingPreference")} />
              <EditToggle label="Life Insurance Preference"     value={form.lifeInsurancePreference}     onChange={(v) => onChange("lifeInsurancePreference", v)}     dirty={isBoolDirty("lifeInsurancePreference")} />
              <EditToggle label="Property Insurance Preference" value={form.propertyInsurancePreference} onChange={(v) => onChange("propertyInsurancePreference", v)} dirty={isBoolDirty("propertyInsurancePreference")} />
            </div>
          </EditSection>

          {/* ─── Notes ───────────────────────────────────────── */}
          <EditSection title="Notes to Xoto" icon={MessageSquare}>
            <EditField
              label="Notes"
              value={form.notesToXoto}
              onChange={(v) => onChange("notesToXoto", v)}
              multiline
              rows={4}
              dirty={isDirty("notesToXoto")}
            />
          </EditSection>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: `1px solid ${C.grayBord}`, background: C.grayLight, gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            {dirtyCount > 0
              ? <span style={{ color: C.primary, fontWeight: 600 }}>⬤ {dirtyCount} unsaved change{dirtyCount !== 1 ? "s" : ""}</span>
              : <span>No changes yet</span>
            }
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${C.grayBord}`, background: C.white, color: C.textSub, fontWeight: 600, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving || dirtyCount === 0}
              style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: saving || dirtyCount === 0 ? C.grayBord : `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: saving || dirtyCount === 0 ? C.textMuted : "#fff", fontWeight: 700, fontSize: 13, cursor: saving || dirtyCount === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: saving || dirtyCount === 0 ? "none" : "0 2px 12px rgba(92,3,155,0.25)", transition: "all .2s" }}
            >
              {saving
                ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
                : <><Save size={14} /> Save Changes</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Edit Modal Sub-components ────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

function EditSection({ title, icon: Icon, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${C.primaryBord}` }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: C.primarySoft, border: `1px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={13} color={C.primary} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: "-.2px" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function EditField({ label, value, onChange, type = "text", multiline = false, rows = 2, dirty = false }) {
  const baseStyle = {
    width: "100%",
    padding: "9px 12px",
    border: `1.5px solid ${dirty ? C.primaryBord : C.grayBord}`,
    borderRadius: 9,
    fontSize: 13,
    color: C.text,
    fontFamily: "inherit",
    background: dirty ? C.primarySoft : C.white,
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s, background .2s",
    resize: multiline ? "vertical" : undefined,
  };
  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: dirty ? C.primary : C.textSub, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".04em" }}>
        {label}
        {dirty && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, display: "inline-block", flexShrink: 0 }} />}
      </label>
      {multiline ? (
        <textarea
          className="edit-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          style={baseStyle}
        />
      ) : (
        <input
          className="edit-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={baseStyle}
        />
      )}
    </div>
  );
}

function EditToggle({ label, value, onChange, dirty = false }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${dirty ? C.primaryBord : C.grayBord}`, background: dirty ? C.primarySoft : C.white, cursor: "pointer", userSelect: "none", transition: "all .2s" }}
    >
      {/* Toggle switch */}
      <div style={{ width: 36, height: 20, borderRadius: 99, background: value ? C.primary : C.grayBord, position: "relative", transition: "background .2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: value ? 19 : 3, width: 14, height: 14, borderRadius: "50%", background: C.white, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: dirty ? C.primary : C.textSub }}>
        {label}
      </span>
      {dirty && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, flexShrink: 0 }} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Shared Sub-components ────────────────────────────────────────────────────
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