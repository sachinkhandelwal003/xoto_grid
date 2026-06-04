// src/pages/Leads/VaultAgentLeadDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spin, message } from "antd";
import {
  ChevronLeft, User, Mail, Phone, Home, DollarSign, FileText,
  Eye, AlertCircle, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Layers, Shield, Activity, Check, Copy, Info,
  MapPin, Calendar, FilePlus, ClipboardList,
  TrendingUp, Percent, MessageSquare, Clock,
  Calculator, Target, ShieldCheck
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
const formatDocType = (type) => {
  if (!type) return "Document";
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '18': "vault-admin",
  '22': "vaultagent",
  '21': "vaultpartner",
  '23': "vault-ops",
  '26': "vault-advisor",
  '25': "gridReferralPartner",
};

// ══════════════════════════════════════════════════════════════════════════
export default function VaultAgentLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s?.auth || {});

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

  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";

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
      if (data) {
        setLead(data);
        setLeadStatus(data?.currentStatus || "");
      } else {
        setError("Lead data not found");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load lead");
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
      setDocuments(docs || []);
    } catch { 
      setDocuments([]);
    } finally { 
      setDocsLoading(false); 
    }
  };

  useEffect(() => { if (id) { fetchLead(); fetchDocs(); } }, [id]);

  // ── Status Update ─────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!leadStatus) { flash("error", "Please select a status"); return; }
    try {
      setStatusUpdating(true);
      await apiService.put(`/vault/lead/${id}/status`, {
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

  // ── Document Preview & Verification ───────────────────────────────────
  const openDocModal = (doc) => {
    const fileUrl = doc?.fileUrl || doc?.url || doc?.documentUrl || doc?.file_url;
    if (!fileUrl) { message.warning("File URL not available"); return; }
    const docId = doc?._id || doc?.id;
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
      const ov = { status: "Verified", verificationStatus: "Verified" };
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
      const ov = { status: "Rejected", verificationStatus: "Rejected", rejectionReason: rejectReason };
      setDocOverrides((p) => ({ ...p, [docId]: ov }));
      setSelectedDoc((p) => ({ ...p, ...ov }));
      setShowRejectInput(false);
      flash("success", "Document rejected.");
      await fetchDocs();
    } catch (err) {
      flash("error", err?.response?.data?.message || "Rejection failed");
    } finally { setRejecting(false); }
  };

  const goToEditEligibility = () => {
    navigate(`/dashboard/${roleSlug}/vault/lead/${id}/eligibility`);
  };

  // ── Loading / Error ────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RefreshCw size={24} color={C.primary} style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <p style={{ color: C.primary, fontSize: 15, fontWeight: 600 }}>Loading premium data...</p>
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

  // ── Destructure API response safely ───────────────────────────────────
  const ci = lead?.customerInfo || {};
  const pd = lead?.propertyDetails || {};
  const pa = pd?.propertyAddress || {};
  const dc = lead?.documentCollection || {};
  const si = lead?.sourceInfo || {};
  const at = lead?.assignedTo || {};
  const sla = lead?.sla || {};
  const lr = lead?.loanRequirements || {};
  const dup = lead?.duplicateCheck || {};
  const elig = lead?.eligibility || {};

  const currentStatus = lead?.currentStatus || "New";
  const statusCfg = STATUS_CFG[currentStatus] || STATUS_CFG["New"];
  const propertyAddr = [pa?.building, pa?.area, pa?.city].filter(Boolean).join(", ");
  const docsUploaded = dc?.documentsUploaded ?? documents?.length ?? 0;
  
  const getDocStatus = (d) => (d?.verificationStatus || d?.status || d?.verification_status)?.toLowerCase();
  const docsVerified = documents?.filter((d) => getDocStatus(d) === "verified").length || 0;
  const docsPending = documents?.filter((d) => !getDocStatus(d) || getDocStatus(d) === "pending").length || 0;
  const docsRejected = documents?.filter((d) => getDocStatus(d) === "rejected").length || 0;
  const docsRequired = dc?.totalDocumentsRequired ?? 7;
  const isSlaBreached = sla?.breached === true;

  const TABS = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "eligibility", label: "Eligibility", icon: ShieldCheck },
    { id: "property", label: "Property", icon: Home },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "status", label: "Status", icon: ClipboardList },
    { id: "system", label: "System", icon: Shield },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .pd-tab:hover { background: ${C.primaryGlow} !important; color: ${C.primary} !important; }
        .doc-card { transition: all 0.25s ease; cursor: pointer; }
        .doc-card:hover { border-color: ${C.primary} !important; box-shadow: 0 8px 20px rgba(92,3,155,0.1) !important; transform: translateY(-2px); }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "8px 16px", background: C.white, border: `1px solid ${C.grayBord}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer", transition: "0.2s" }}
        >
          <ChevronLeft size={15} /> Back to Leads
        </button>

        {/* Flash Message */}
        {flashMsg.text && (
          <div style={{ marginBottom: 16, padding: "12px 18px", borderRadius: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: flashMsg.type === "success" ? C.greenSoft : C.redSoft, color: flashMsg.type === "success" ? "#065F46" : "#991B1B", border: `1px solid ${flashMsg.type === "success" ? C.greenBord : C.redBord}`, fontWeight: 500, animation: "fadeUp 0.3s ease" }}>
            {flashMsg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {flashMsg.text}
          </div>
        )}

        {/* SLA Breach banner */}
        {isSlaBreached && (
          <div style={{ marginBottom: 14, padding: "12px 18px", borderRadius: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: C.redSoft, color: "#991B1B", border: `1px solid ${C.redBord}`, fontWeight: 600 }}>
            <AlertTriangle size={16} /> SLA Breached — This lead requires immediate attention
          </div>
        )}

        {/* Profile Header */}
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.grayBord}`, marginBottom: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(92,3,155,0.06)" }}>
          <div style={{ height: 6, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid}, ${C.primaryLight})` }} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24, padding: "28px", flexWrap: "wrap" }}>
            <div style={{ width: 84, height: 84, borderRadius: 22, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={36} color={C.primary} />
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.5px" }}>{ci?.fullName || "—"}</h1>
                <StatusPill bg={statusCfg.bg} color={statusCfg.color} label={currentStatus} dot />
                {elig?.checked && (
                  <StatusPill 
                    bg={elig.isEligible ? C.greenSoft : C.redSoft} 
                    color={elig.isEligible ? "#065F46" : "#991B1B"} 
                    label={elig.isEligible ? "Eligible" : "Not Eligible"} 
                  />
                )}
                {lead?.referralType && <StatusPill bg="#F0F9FF" color="#0369A1" label={lead.referralType} />}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
                <InfoChip icon={Mail} value={ci?.email} />
                <InfoChip icon={Phone} value={ci?.mobileNumber} />
                <InfoChip icon={MapPin} value={propertyAddr || null} />
                <InfoChip icon={DollarSign} value={pd?.loanAmountRequired ? `Loan: AED ${fmt(pd.loanAmountRequired)}` : null} />
                <InfoChip icon={Calendar} value={lead?.createdAt ? `Created ${fmtDate(lead.createdAt)}` : null} />
              </div>
            </div>

            <div style={{ flexShrink: 0, textAlign: "right", minWidth: 160, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
              <button
                onClick={goToEditEligibility}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(92,3,155,0.25)", transition: "0.2s" }}
              >
                <Calculator size={15} /> Check Eligibility
              </button>
              {at?.advisorName ? (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>Assigned To</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{at.advisorName}</div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: C.amber, background: C.amberSoft, padding: "6px 12px", borderRadius: 10, fontWeight: 600 }}>⚠ No Advisor</div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
          <StatTile icon={DollarSign} color={C.primary} label="Loan Amount" value={pd?.loanAmountRequired ? `AED ${fmt(pd.loanAmountRequired)}` : "—"} />
          <StatTile icon={TrendingUp} color={C.green} label="Property Value" value={pd?.propertyValue ? `AED ${fmt(pd.propertyValue)}` : "—"} />
          <StatTile icon={FileText} color="#0891B2" label="Documents" value={`${docsUploaded} / ${docsRequired}`} />
          <StatTile icon={Percent} color={C.amber} label="Collection" value={`${dc?.collectionPercentage ?? 0}%`} />
        </div>

        {/* Tabs */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.grayBord}`, padding: "6px", display: "flex", gap: 4, marginBottom: 20, overflowX: "auto" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className="pd-tab"
                onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: "none", background: active ? C.primarySoft : "transparent", color: active ? C.primary : C.gray, fontWeight: active ? 700 : 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }}
              >
                <Icon size={16} /> {tab.label}
                {tab.id === "documents" && documents?.length > 0 && (
                  <span style={{ background: active ? C.primary : C.grayLight, color: active ? C.white : C.textSub, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>{documents.length}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div key={activeTab} style={{ animation: "fadeUp 0.3s ease" }}>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
              <Section icon={User} title="Client Information">
                <DRow label="Full Name" value={show(ci?.fullName)} />
                <DRow label="Preferred Name" value={show(ci?.preferredName)} />
                <DRow label="Email" value={show(ci?.email)} copy />
                <DRow label="Mobile" value={show(ci?.mobileNumber)} copy />
                <DRow label="Date of Birth" value={fmtDate(ci?.dateOfBirth)} />
                <DRow label="Nationality" value={show(ci?.nationality)} />
                <DRow label="Marital Status" value={show(ci?.maritalStatus)} />
                <DRow label="Dependents" value={show(ci?.numberOfDependents)} />
                <DRow label="Occupation" value={show(ci?.occupation)} />
                <DRow label="Employer" value={show(ci?.employer)} />
                <DRow label="Monthly Salary" value={ci?.monthlySalary ? `AED ${fmt(ci.monthlySalary)}` : null} />
              </Section>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Section icon={FilePlus} title="Lead Source">
                  <DRow label="Source" value={show(capWords(si?.source))} />
                  <DRow label="Created By" value={si?.createdByName || "—"} />
                  <DRow label="Submitted At" value={fmtDT(si?.createdAt)} />
                  <DRow label="Referral Type" value={show(lead?.referralType)} />
                </Section>
                <Section icon={User} title="Assigned Advisor">
                  {at?.advisorName ? (
                    <>
                      <DRow label="Advisor Name" value={at.advisorName} />
                      <DRow label="Assigned At" value={fmtDT(at.assignedAt)} />
                    </>
                  ) : <EmptyNote msg="No advisor assigned yet" />}
                </Section>
              </div>

              {lead?.notesToXoto && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <Section icon={MessageSquare} title="Notes to Xoto">
                    <div style={{ background: C.primarySoft, borderRadius: 12, padding: "16px", border: `1px solid ${C.primaryBord}`, fontSize: 14, color: C.primary, fontWeight: 500, lineHeight: 1.6 }}>
                      {lead.notesToXoto}
                    </div>
                  </Section>
                </div>
              )}
            </div>
          )}

          {/* Eligibility Tab */}
          {activeTab === "eligibility" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
              {elig?.checked ? (
                <>
                  {/* Hero Status Banner for Eligibility */}
                  <div style={{ background: elig.isEligible ? C.greenSoft : C.redSoft, border: `2px solid ${elig.isEligible ? C.greenBord : C.redBord}`, borderRadius: 20, padding: 28, display: 'flex', alignItems: 'center', gap: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: elig.isEligible ? C.white : C.redSoft, border: `2px solid ${elig.isEligible ? C.greenBord : C.redBord}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {elig.isEligible ? <CheckCircle size={32} color={C.green} /> : <XCircle size={32} color={C.red} />}
                    </div>
                    <div>
                      {/* Green heading as per user preference context */}
                      <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: elig.isEligible ? '#065F46' : '#991B1B' }}>
                        {elig.isEligible ? "Customer is Eligible" : "Customer is Not Eligible"}
                      </h3>
                      <p style={{ margin: '8px 0 0 0', color: elig.isEligible ? '#047857' : '#B91C1C', fontSize: 15, fontWeight: 500 }}>
                        {elig.eligibilityNotes || "The automated eligibility check has been completed."}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Eligibility Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
                    <Section icon={Activity} title="Eligibility Metrics">
                      <DRow label="Eligibility Score" value={elig.eligibilityScore !== null ? `${elig.eligibilityScore}/100` : null} />
                      <DRow label="Risk Grade" value={elig.riskGrade} />
                      <DRow label="DBR Percentage" value={elig.dbrPercentage !== null ? `${elig.dbrPercentage}%` : null} />
                      <DRow label="DBR Status" value={elig.dbrStatus} />
                      <DRow label="Estimated LTV" value={elig.estimatedLTV !== null ? `${elig.estimatedLTV}%` : null} />
                      <DRow label="Recommended Loan" value={elig.recommendedLoanAmount ? `AED ${fmt(elig.recommendedLoanAmount)}` : null} />
                    </Section>

                    <Section icon={Clock} title="Eligibility Check Details">
                      <DRow label="Check Status" value={elig.checked ? "Completed" : "Pending"} />
                      <DRow label="Checked At" value={fmtDT(elig.checkedAt)} />
                      <DRow label="Checked By (ID)" value={show(elig.checkedBy)} mono />
                      <DRow label="Latest Check ID" value={show(elig.latestEligibilityCheckId)} mono copy />
                    </Section>
                  </div>
                </>
              ) : (
                <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.grayBord}`, padding: 40, textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: C.amberSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <ShieldCheck size={32} color={C.amber} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 8px" }}>Eligibility Not Checked</h3>
                  <p style={{ color: C.gray, fontSize: 15, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>This customer's profile has not been run through the eligibility calculator yet.</p>
                  <button onClick={goToEditEligibility} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(92,3,155,0.25)" }}>
                    <Calculator size={16} /> Run Eligibility Check Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Property Tab */}
          {activeTab === "property" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
              <Section icon={Home} title="Property Details">
                <DRow label="Property Type" value={show(pd?.propertyType)} />
                <DRow label="Property Value" value={pd?.propertyValue ? `AED ${fmt(pd.propertyValue)}` : null} />
                <DRow label="Down Payment" value={pd?.downPaymentAmount ? `AED ${fmt(pd.downPaymentAmount)}` : null} />
                <DRow label="Loan Amount" value={pd?.loanAmountRequired ? `AED ${fmt(pd.loanAmountRequired)}` : null} />
                <DRow label="Off-Plan" value={boolLabel(pd?.isOffPlan)} />
              </Section>
              <Section icon={Target} title="Loan Requirements">
                <DRow label="Preferred Tenure" value={lr?.preferredTenureYears ? `${lr.preferredTenureYears} years` : null} />
                <DRow label="Rate Type" value={show(lr?.preferredInterestRateType)} />
                <DRow label="Preferred Banks" value={lr?.preferredBanks?.length ? lr.preferredBanks.join(", ") : "No preference"} />
              </Section>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { label: "Uploaded", value: docsUploaded, color: C.primary, bg: C.primarySoft, bord: C.primaryBord },
                  { label: "Verified", value: docsVerified, color: C.green, bg: C.greenSoft, bord: C.greenBord },
                  { label: "Pending", value: docsPending, color: C.amber, bg: C.amberSoft, bord: C.amberBord },
                  { label: "Rejected", value: docsRejected, color: C.red, bg: C.redSoft, bord: C.redBord },
                ].map((s) => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: "16px", border: `1px solid ${s.bord}`, textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: s.color, fontWeight: 700, marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <Section icon={FileText} title={`Documents (${documents?.length || 0})`}>
                {docsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}><Spin size="large" /></div>
                ) : documents?.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {documents.map((doc, i) => {
                      const docId = doc?._id || doc?.id;
                      const override = docOverrides[docId];
                      return <DocCard key={docId || i} doc={override ? { ...doc, ...override } : doc} onView={openDocModal} />;
                    })}
                  </div>
                ) : <EmptyNote msg="No documents uploaded yet" />}
              </Section>
            </div>
          )}

          {/* Status Tab */}
          {activeTab === "status" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
              <Section icon={ClipboardList} title="Update Lead Status">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                  {STATUS_OPTIONS.map((opt) => {
                    const cfg = STATUS_CFG[opt] || {};
                    const active = leadStatus === opt;
                    return (
                      <button key={opt} onClick={() => setLeadStatus(opt)}
                        style={{ padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `2px solid ${active ? cfg.color || C.primary : C.grayBord}`, background: active ? cfg.bg || C.primarySoft : C.white, color: active ? cfg.color || C.primary : C.textSub, transition: "0.2s" }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={4} placeholder="Add an optional note about this status change..." style={{ width: "100%", border: `1px solid ${C.grayBord}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, marginBottom: 16, outline: "none", resize: "vertical" }} />
                <button onClick={handleStatusUpdate} disabled={statusUpdating || !leadStatus} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "none", fontWeight: 800, fontSize: 15, background: statusUpdating || !leadStatus ? C.grayBord : `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`, color: statusUpdating || !leadStatus ? C.textMuted : "#fff", cursor: statusUpdating || !leadStatus ? "not-allowed" : "pointer", boxShadow: statusUpdating || !leadStatus ? "none" : "0 4px 14px rgba(92,3,155,0.3)", transition: "0.2s" }}>
                  {statusUpdating ? "Updating..." : "Confirm Status Update"}
                </button>
              </Section>

              <Section icon={Clock} title="SLA Information">
                <DRow label="SLA Breached" value={boolLabel(sla?.breached)} />
                <DRow label="Deadline" value={fmtDT(sla?.deadline)} />
                <DRow label="First Contact At" value={fmtDT(sla?.firstContactAt)} />
                <DRow label="Qualified At" value={fmtDT(sla?.qualificationAt)} />
              </Section>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>
              <Section icon={Shield} title="System Info">
                <DRow label="Lead ID" value={show(lead?._id)} copy mono />
                <DRow label="Customer ID" value={show(lead?.customerId)} copy mono />
                <DRow label="Created At" value={fmtDT(lead?.createdAt)} />
                <DRow label="Updated At" value={fmtDT(lead?.updatedAt)} />
                <DRow label="Deleted" value={boolLabel(lead?.isDeleted)} />
              </Section>
              <Section icon={Activity} title="Flags">
                <FlagRow label="Advisor Assigned" value={!!(at?.advisorId)} icon={User} />
                <FlagRow label="SLA On Track" value={!sla?.breached} icon={Clock} />
                <FlagRow label="Is Duplicate" value={dup?.isDuplicate} icon={Activity} invert />
              </Section>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {modalOpen && selectedDoc && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => { if (e.target === e.currentTarget) closeDocModal(); }}>
          <div style={{ background: C.white, borderRadius: 24, width: "100%", maxWidth: 1000, maxHeight: "95vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ height: 6, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid})` }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.grayBord}` }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: C.text }}>{formatDocType(selectedDoc?.documentType || selectedDoc?.documentCategory)}</div>
                <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>{selectedDoc?.fileName || "Document"}</div>
              </div>
              <button onClick={closeDocModal} style={{ background: C.grayLight, border: `1px solid ${C.grayBord}`, cursor: "pointer", fontSize: 18, width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: C.textSub }}>✕</button>
            </div>
            <div style={{ flex: 1, background: C.grayLight, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 500, position: "relative" }}>
              {modalLoading && <div style={{ position: "absolute" }}><Spin size="large" /></div>}
              {isPdf(selectedDoc?.fileUrl) ? (
                <iframe src={selectedDoc.fileUrl} style={{ width: "100%", height: "100%", minHeight: 600, border: "none" }} onLoad={() => setModalLoading(false)} title="pdf" />
              ) : (
                <img src={selectedDoc.fileUrl} alt="preview" style={{ maxHeight: "70vh", maxWidth: "100%", objectFit: "contain", padding: 20 }} onLoad={() => setModalLoading(false)} />
              )}
            </div>
            <div style={{ padding: "20px 24px", borderTop: `1px solid ${C.grayBord}`, background: C.white }}>
              {showRejectInput ? (
                <div style={{ display: "flex", gap: 12, animation: "fadeUp 0.2s ease" }}>
                  <input autoFocus value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter detailed rejection reason..." style={{ flex: 1, padding: "12px 16px", border: `2px solid ${C.redBord}`, borderRadius: 12, outline: "none", fontSize: 14 }} />
                  <button onClick={handleRejectDoc} disabled={rejecting || !rejectReason.trim()} style={{ padding: "0 24px", borderRadius: 12, background: C.red, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>{rejecting ? "Rejecting..." : "Confirm Reject"}</button>
                  <button onClick={() => { setShowRejectInput(false); setRejectReason(""); }} style={{ padding: "0 20px", borderRadius: 12, border: `2px solid ${C.grayBord}`, background: C.white, fontWeight: 700, color: C.textSub, cursor: "pointer" }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
                  <button onClick={() => setShowRejectInput(true)} style={{ padding: "12px 24px", borderRadius: 12, border: `2px solid ${C.redBord}`, background: C.redSoft, color: C.red, fontWeight: 800, cursor: "pointer", fontSize: 14 }}>Reject Document</button>
                  <button onClick={handleVerifyDoc} disabled={verifying} style={{ padding: "12px 32px", borderRadius: 12, background: verifying ? C.grayBord : C.green, color: "#fff", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer" }}>{verifying ? "Verifying..." : "Approve & Verify"}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ── Shared Sub-components ────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

function Section({ icon: Icon, title, children }) {
  return (
    <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.grayBord}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
      <div style={{ padding: "16px 24px", background: C.grayLight, borderBottom: `1px solid ${C.grayBord}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primarySoft, border: `1px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={16} color={C.primary} /></div>
        <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</span>
      </div>
      <div style={{ padding: "16px 24px" }}>{children}</div>
    </div>
  );
}

function DRow({ label, value, copy, mono }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px dashed ${C.grayBord}`, lastChild: { borderBottom: "none" } }}>
      <span style={{ fontSize: 13, color: C.gray, fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, color: C.text, fontWeight: 500, fontFamily: mono ? "monospace" : "inherit" }}>{value || "—"}</span>
        {copy && value && (
          <button onClick={() => { navigator.clipboard.writeText(String(value)); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: C.grayLight, border: `1px solid ${C.grayBord}`, cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {copied ? <Check size={14} color={C.green} /> : <Copy size={14} color={C.textMuted} />}
          </button>
        )}
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.grayBord}`, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={16} color={color} /></div>
        <span style={{ fontSize: 11, color: C.gray, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{value}</div>
    </div>
  );
}

function StatusPill({ bg, color, label, dot }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 800, background: bg, color, border: `1px solid ${color}30` }}>
      {dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />}
      {label}
    </span>
  );
}

function InfoChip({ icon: Icon, value }) {
  return value ? (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textSub, fontWeight: 500 }}>
      <Icon size={15} color={C.primaryLight} /> {value}
    </div>
  ) : null;
}

function EmptyNote({ msg }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textMuted, fontSize: 14, padding: "16px 0", fontStyle: "italic", fontWeight: 500 }}><Info size={16} /> {msg}</div>;
}

function FlagRow({ label, value, icon: Icon, invert = false }) {
  const good = invert ? !value : value;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px dashed ${C.grayBord}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.textSub, fontWeight: 600 }}><Icon size={16} color={C.gray} /> {label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: good ? C.greenSoft : C.redSoft, border: `1px solid ${good ? C.greenBord : C.redBord}` }}>
        {good ? <CheckCircle size={14} color={C.green} /> : <XCircle size={14} color={C.red} />}
        <span style={{ fontSize: 12, fontWeight: 800, color: good ? C.green : C.red }}>{value ? "Yes" : "No"}</span>
      </div>
    </div>
  );
}

function DocCard({ doc, onView }) {
  const fileUrl = doc?.fileUrl || doc?.url || doc?.documentUrl || doc?.file_url;
  const rawFileName = doc?.fileName || doc?.file_name || doc?.name || "Unknown File";
  const docTypeRaw = doc?.documentType || doc?.documentCategory;
  const displayTitle = formatDocType(docTypeRaw);
  
  const rawStatus = doc?.verificationStatus || doc?.status || doc?.verification_status || "Pending";
  const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase(); // Normalize
  
  const sCfg = { 
    Verified: { color: C.green, bg: C.greenSoft, bord: C.greenBord }, 
    Rejected: { color: C.red, bg: C.redSoft, bord: C.redBord }, 
    Pending: { color: C.amber, bg: C.amberSoft, bord: C.amberBord } 
  }[status] || { color: C.gray, bg: C.grayLight, bord: C.grayBord };

  return (
    <div className="doc-card" onClick={() => fileUrl && onView(doc)} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.grayBord}`, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${C.primaryBord}` }}>
          <FileText size={24} color={C.primary} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayTitle}
          </div>
          <div style={{ fontSize: 12, color: C.gray, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {rawFileName}
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800, background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.bord}`, display: "inline-block" }}>
              {status}
            </span>
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onView(doc); }} disabled={!fileUrl} style={{ padding: "12px 0", background: fileUrl ? C.primarySoft : C.grayLight, color: fileUrl ? C.primary : C.textMuted, border: fileUrl ? `1px solid ${C.primaryBord}` : `1px solid ${C.grayBord}`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: fileUrl ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "0.2s" }}>
        <Eye size={16} /> View Document
      </button>
    </div>
  );
}

const STATUS_OPTIONS = [
  "New", "Contacted", "Qualified", "Collecting Documentation",
  "Documents Complete", "Application Opened", "Disbursed", "Not Proceeding",
];
