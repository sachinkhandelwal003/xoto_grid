// src/pages/Leads/AdvisorLeadUploadDocuments.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import {
  ChevronLeft, Upload, CheckCircle, XCircle, AlertCircle,
  RefreshCw, FileText, User, Home, Phone, Mail,
  Trash2, Eye, File, AlertTriangle, ClipboardList,
} from "lucide-react";
import { apiService } from "../../../../manageApi/utils/custom.apiservice";

// ─── Brand tokens ─────────────────────────────────────────────────────────
const C = {
  primary    : "#5C039B",
  primaryMid : "#7C3AED",
  primarySoft: "#F5F0FF",
  primaryBord: "#E9D5FF",
  green      : "#10B981",
  greenSoft  : "#ECFDF5",
  greenBord  : "#A7F3D0",
  red        : "#EF4444",
  redSoft    : "#FEF2F2",
  amber      : "#F59E0B",
  amberSoft  : "#FFFBEB",
  amberBord  : "#FDE68A",
  gray       : "#6B7280",
  grayLight  : "#F9FAFB",
  grayBord   : "#E5E7EB",
  text       : "#111827",
  textSub    : "#374151",
  textMuted  : "#9CA3AF",
  white      : "#FFFFFF",
  bg         : "#F4F0FA",
};

// ─── Required document types (7 standard mortgage docs) ───────────────────
const REQUIRED_DOCS = [
  { key: "emirates_id_front",    label: "Emirates ID — Front",         icon: "🪪", hint: "Clear photo of front side" },
  { key: "emirates_id_back",     label: "Emirates ID — Back",          icon: "🪪", hint: "Clear photo of back side" },
  { key: "passport",             label: "Passport (Bio Page)",         icon: "📘", hint: "First page with photo" },
  { key: "visa",                 label: "UAE Visa / Residency",        icon: "📄", hint: "Valid residency visa" },
  { key: "salary_certificate",   label: "Salary Certificate",          icon: "💼", hint: "From employer, on letterhead" },
  { key: "bank_statements",      label: "Bank Statements (3 months)",  icon: "🏦", hint: "Last 3 months, all pages" },
  { key: "title_deed_or_spa",    label: "Title Deed / SPA",           icon: "🏠", hint: "Property title deed or sales agreement" },
];

const fmt     = (n)  => n ? Number(n).toLocaleString("en-AE") : "—";
const fmtDate = (s)  => { try { return s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"; } catch { return "—"; } };
const fileSize = (b) => b ? (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`) : "";

// ═══════════════════════════════════════════════════════════════════════════
export default function AdvisorLeadUploadDocuments() {
  const { leadId } = useParams();
  const navigate   = useNavigate();

  const [lead,         setLead]         = useState(null);
  const [loadingLead,  setLoadingLead]  = useState(true);
  const [leadError,    setLeadError]    = useState("");

  // uploads[docKey] = { file: File, preview: url, uploading: bool, uploaded: bool, url: s3url, error: str }
  const [uploads,      setUploads]      = useState({});
  const [submitting,   setSubmitting]   = useState(false);

  const inputRefs = useRef({});

  // ── Fetch lead details ────────────────────────────────────────────────────
  useEffect(() => {
    if (!leadId) return;
    (async () => {
      setLoadingLead(true);
      try {
        const res  = await apiService.get(`/vault/lead/advisor/my-leads/${leadId}`);
        const data = res?.data?.data || res?.data || res;
        setLead(data);
      } catch (err) {
        setLeadError(err?.response?.data?.message || "Failed to load lead details");
      } finally {
        setLoadingLead(false);
      }
    })();
  }, [leadId]);

  // ── File select handler ───────────────────────────────────────────────────
  const handleFileSelect = (docKey, file) => {
    if (!file) return;

    // Validate
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setUploads((p) => ({ ...p, [docKey]: { ...p[docKey], error: "Only JPG, PNG, PDF allowed" } }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploads((p) => ({ ...p, [docKey]: { ...p[docKey], error: "File must be under 10 MB" } }));
      return;
    }

    // Preview for images
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setUploads((p) => ({
      ...p,
      [docKey]: { file, preview, uploading: false, uploaded: false, url: null, error: null },
    }));
  };

  // ── Upload single document to S3 ─────────────────────────────────────────
  // API: POST /vault/lead/advisor/lead/:leadId/documents/upload
  // Body: FormData { file, documentType }
  const uploadDocument = async (docKey) => {
    const entry = uploads[docKey];
    if (!entry?.file || entry.uploading || entry.uploaded) return;

    setUploads((p) => ({ ...p, [docKey]: { ...p[docKey], uploading: true, error: null } }));
    try {
      const formData = new FormData();
      formData.append("file",         entry.file);
      formData.append("documentType", docKey);

      const res    = await apiService.post(`/vault/lead/advisor/lead/${leadId}/documents/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileUrl = res?.data?.url || res?.data?.fileUrl || res?.data?.data?.url || null;

      setUploads((p) => ({ ...p, [docKey]: { ...p[docKey], uploading: false, uploaded: true, url: fileUrl } }));
      message.success(`${REQUIRED_DOCS.find((d) => d.key === docKey)?.label} uploaded!`);
    } catch (err) {
      setUploads((p) => ({
        ...p,
        [docKey]: { ...p[docKey], uploading: false, error: err?.response?.data?.message || "Upload failed" },
      }));
    }
  };

  const removeFile = (docKey) => {
    setUploads((p) => {
      const copy = { ...p };
      delete copy[docKey];
      return copy;
    });
    if (inputRefs.current[docKey]) inputRefs.current[docKey].value = "";
  };

  // ── Submit all documents ──────────────────────────────────────────────────
  // After uploading files individually, submit a final completion call
  const uploadedCount  = Object.values(uploads).filter((u) => u.uploaded).length;
  const totalRequired  = REQUIRED_DOCS.length;
  const pct            = Math.round((uploadedCount / totalRequired) * 100);
  const allUploaded    = uploadedCount === totalRequired;

  const handleFinalSubmit = async () => {
    if (!allUploaded) {
      message.warning(`Please upload all ${totalRequired} required documents first.`);
      return;
    }
    setSubmitting(true);
    try {
      // Mark documents as complete → updates lead status to "Collecting Documentation"
      await apiService.put(`/vault/lead/advisor/lead/${leadId}/status`, {
        status: "Collecting Documentation",
        notes : "All documents uploaded by advisor.",
      });
      message.success("Documents submitted! Lead moved to Collecting Documentation.");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      message.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error ───────────────────────────────────────────────────────
  if (loadingLead) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: C.primarySoft, border: `2px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <RefreshCw size={22} color={C.primary} style={{ animation: "spin 1s linear infinite" }} />
      </div>
      <p style={{ color: C.gray, fontSize: 14, fontWeight: 500 }}>Loading lead details...</p>
    </div>
  );

  if (leadError || !lead) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <AlertCircle size={44} color={C.red} style={{ marginBottom: 16 }} />
      <p style={{ color: "#B91C1C", fontSize: 15, fontWeight: 600, marginBottom: 20 }}>{leadError || "Lead not found"}</p>
      <button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        <ChevronLeft size={16} /> Go Back
      </button>
    </div>
  );

  const ci = lead.customerInfo  || {};
  const pd = lead.propertyDetails || {};

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif", padding: "28px 20px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .doc-drop { transition: all .2s; }
        .doc-drop:hover { border-color: ${C.primary} !important; background: ${C.primarySoft} !important; }
        .doc-card { transition: all .2s; }
        .doc-card:hover { box-shadow: 0 6px 20px rgba(92,3,155,0.1) !important; transform: translateY(-1px); }
        .upload-btn:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* ── Back ── */}
        <button onClick={() => navigate(-1)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, padding: "8px 16px", background: C.white, border: `1px solid ${C.grayBord}`, borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.textSub, cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primaryBord; e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primarySoft; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.grayBord; e.currentTarget.style.color = C.textSub; e.currentTarget.style.background = C.white; }}>
          <ChevronLeft size={15} /> Back to Leads
        </button>

        {/* ── Page title ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a0533", margin: 0 }}>Upload Documents</h1>
          <p style={{ fontSize: 13, color: C.gray, margin: "4px 0 0" }}>Upload all required documents for this lead's mortgage application.</p>
        </div>

        {/* ══ LEAD SUMMARY CARD ══════════════════════════════════════════ */}
        <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.grayBord}`, marginBottom: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(92,3,155,0.06)", animation: "fadeUp .4s ease" }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${C.primary}, ${C.primaryMid})` }} />
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: C.primarySoft, border: `1px solid ${C.primaryBord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClipboardList size={14} color={C.primary} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Lead Summary</span>
              {/* Status badge */}
              <span style={{ marginLeft: "auto", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>
                {lead.currentStatus || "—"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px 20px" }}>
              <SummaryItem icon={<User size={13} />}     label="Client Name"     value={ci.fullName} />
              <SummaryItem icon={<Mail size={13} />}     label="Email"           value={ci.email} />
              <SummaryItem icon={<Phone size={13} />}    label="Mobile"          value={ci.mobileNumber} />
              <SummaryItem icon={<Home size={13} />}     label="Property Type"   value={pd.propertyType} />
              <SummaryItem icon={<Home size={13} />}     label="Property Value"  value={pd.propertyValue ? `AED ${fmt(pd.propertyValue)}` : null} />
              <SummaryItem icon={<FileText size={13} />} label="Referral Type"   value={lead.referralType} />
            </div>
          </div>
        </div>

        {/* ══ PROGRESS BAR ═══════════════════════════════════════════════ */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.grayBord}`, padding: "16px 20px", marginBottom: 20, boxShadow: "0 1px 6px rgba(92,3,155,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Upload Progress</span>
              <span style={{ marginLeft: 10, fontSize: 12, color: C.gray }}>{uploadedCount} of {totalRequired} documents uploaded</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: allUploaded ? C.green : C.primary }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: allUploaded ? C.green : `linear-gradient(90deg, ${C.primary}, ${C.primaryMid})`, borderRadius: 99, transition: "width .5s ease" }} />
          </div>
          {allUploaded && (
            <div style={{ marginTop: 10, padding: "8px 14px", background: C.greenSoft, borderRadius: 10, border: `1px solid ${C.greenBord}`, fontSize: 13, color: "#065F46", display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={14} color={C.green} /> All documents uploaded! Click "Submit All Documents" below.
            </div>
          )}
        </div>

        {/* ══ DOCUMENT UPLOAD CARDS ══════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
          {REQUIRED_DOCS.map((doc) => {
            const entry     = uploads[doc.key] || {};
            const hasFile   = !!entry.file;
            const uploaded  = !!entry.uploaded;
            const uploading = !!entry.uploading;
            const hasError  = !!entry.error;
            const isImg     = entry.file?.type?.startsWith("image/");

            return (
              <div key={doc.key} className="doc-card"
                style={{ background: C.white, borderRadius: 14, border: `1.5px solid ${uploaded ? C.greenBord : hasError ? "#FECACA" : C.grayBord}`, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", transition: "all .2s" }}>

                {/* Card header */}
                <div style={{ padding: "12px 16px", background: uploaded ? C.greenSoft : hasError ? C.redSoft : C.grayLight, borderBottom: `1px solid ${uploaded ? C.greenBord : hasError ? "#FECACA" : C.grayBord}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{doc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{doc.label}</div>
                    <div style={{ fontSize: 11, color: C.gray }}>{doc.hint}</div>
                  </div>
                  {/* Status icon */}
                  {uploaded  && <CheckCircle size={18} color={C.green} />}
                  {hasError  && <XCircle     size={18} color={C.red}   />}
                  {!uploaded && !hasError && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#B91C1C", background: "#FEF2F2", padding: "2px 8px", borderRadius: 20, border: "1px solid #FECACA" }}>REQUIRED</span>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: "14px 16px" }}>

                  {/* No file yet — drop zone */}
                  {!hasFile && !uploaded && (
                    <div className="doc-drop"
                      onClick={() => inputRefs.current[doc.key]?.click()}
                      onDrop={(e) => { e.preventDefault(); handleFileSelect(doc.key, e.dataTransfer.files?.[0]); }}
                      onDragOver={(e) => e.preventDefault()}
                      style={{ border: `2px dashed ${hasError ? C.red : "#D1D5DB"}`, borderRadius: 10, padding: "20px 16px", textAlign: "center", cursor: "pointer", background: hasError ? "#FEF2F2" : "#FAFAFA" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                        <Upload size={18} color={C.primary} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.textSub, margin: 0 }}>Click or drag & drop</p>
                      <p style={{ fontSize: 11, color: C.textMuted, margin: "4px 0 0" }}>JPG, PNG, PDF — max 10 MB</p>
                      {hasError && <p style={{ fontSize: 11, color: C.red, fontWeight: 600, marginTop: 6 }}>{entry.error}</p>}
                    </div>
                  )}

                  {/* File selected but not uploaded */}
                  {hasFile && !uploaded && (
                    <div>
                      {/* Image preview */}
                      {isImg && entry.preview && (
                        <div style={{ marginBottom: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.grayBord}` }}>
                          <img src={entry.preview} alt="preview" style={{ width: "100%", maxHeight: 120, objectFit: "cover", display: "block" }} />
                        </div>
                      )}

                      {/* PDF icon */}
                      {!isImg && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#F8F9FA", borderRadius: 8, marginBottom: 10, border: `1px solid ${C.grayBord}` }}>
                          <File size={24} color={C.primary} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.file.name}</div>
                            <div style={{ fontSize: 11, color: C.gray }}>{fileSize(entry.file.size)}</div>
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {hasError && (
                        <div style={{ padding: "8px 10px", background: C.redSoft, borderRadius: 8, fontSize: 12, color: C.red, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
                          <AlertTriangle size={13} /> {entry.error}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="upload-btn" onClick={() => uploadDocument(doc.key)} disabled={uploading}
                          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#fff", background: uploading ? "#9CA3AF" : C.primary, cursor: uploading ? "not-allowed" : "pointer", transition: "all .18s" }}>
                          {uploading
                            ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</>
                            : <><Upload size={13} /> Upload</>}
                        </button>
                        <button onClick={() => removeFile(doc.key)} disabled={uploading}
                          style={{ padding: "9px 12px", border: `1px solid #FECACA`, borderRadius: 9, fontSize: 13, color: C.red, background: C.redSoft, cursor: uploading ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Uploaded ✅ */}
                  {uploaded && (
                    <div>
                      {/* Image preview for uploaded */}
                      {isImg && entry.preview && (
                        <div style={{ marginBottom: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.greenBord}` }}>
                          <img src={entry.preview} alt="uploaded" style={{ width: "100%", maxHeight: 120, objectFit: "cover", display: "block" }} />
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: C.greenSoft, borderRadius: 8, border: `1px solid ${C.greenBord}` }}>
                        <CheckCircle size={16} color={C.green} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>Uploaded Successfully</div>
                          <div style={{ fontSize: 11, color: "#059669" }}>{entry.file?.name} • {fileSize(entry.file?.size)}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {entry.url && (
                            <a href={entry.url} target="_blank" rel="noreferrer"
                              style={{ padding: "5px 8px", border: `1px solid ${C.greenBord}`, borderRadius: 7, color: C.green, background: C.white, display: "flex", alignItems: "center", textDecoration: "none" }}>
                              <Eye size={13} />
                            </a>
                          )}
                          <button onClick={() => removeFile(doc.key)}
                            style={{ padding: "5px 8px", border: "1px solid #FECACA", borderRadius: 7, color: C.red, background: C.redSoft, cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={(el) => inputRefs.current[doc.key] = el}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileSelect(doc.key, e.target.files?.[0])}
                />
              </div>
            );
          })}
        </div>

        {/* ══ UPLOAD ALL PENDING ══════════════════════════════════════════ */}
        {/* Show "Upload All" if files selected but not yet uploaded */}
        {Object.values(uploads).some((u) => u.file && !u.uploaded && !u.uploading) && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.primaryBord}`, padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 13, color: C.textSub }}>
              <span style={{ fontWeight: 600, color: C.primary }}>
                {Object.values(uploads).filter((u) => u.file && !u.uploaded).length} file(s)
              </span> ready to upload
            </div>
            <button
              onClick={async () => {
                const pending = Object.keys(uploads).filter((k) => uploads[k].file && !uploads[k].uploaded && !uploads[k].uploading);
                for (const key of pending) await uploadDocument(key);
              }}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", background: C.primarySoft, color: C.primary, border: `1px solid ${C.primaryBord}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Upload size={14} /> Upload All Pending
            </button>
          </div>
        )}

        {/* ══ SUBMIT BUTTON ═══════════════════════════════════════════════ */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.grayBord}`, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Ready to Submit?</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
              {allUploaded
                ? "All documents uploaded. Click submit to complete this step."
                : `${totalRequired - uploadedCount} document(s) still required.`}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate(-1)}
              style={{ padding: "10px 20px", background: C.white, color: C.textSub, border: `1px solid ${C.grayBord}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={!allUploaded || submitting}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 24px", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
                color: "#fff",
                background: allUploaded ? `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})` : "#D1D5DB",
                cursor: !allUploaded || submitting ? "not-allowed" : "pointer",
                transition: "all .2s",
              }}>
              {submitting
                ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</>
                : <><CheckCircle size={14} /> Submit All Documents</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Summary item ─────────────────────────────────────────────────────────
function SummaryItem({ icon, label, value }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 3 }}>
        {React.cloneElement(icon, { style: { color: "#9CA3AF" } })} {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{value || "—"}</div>
    </div>
  );
}