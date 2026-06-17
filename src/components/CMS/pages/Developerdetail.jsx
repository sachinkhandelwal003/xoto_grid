import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Typography, Avatar, Space, message, Modal, Button,
  Tag, Spin, Input, Select, Card, Row, Col, Upload, Tabs, Badge,
} from "antd";
import {
  ArrowLeftOutlined, EnvironmentOutlined, CheckOutlined, CloseOutlined,
  UploadOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
  ExclamationCircleOutlined, MailOutlined, PhoneOutlined, FileTextOutlined,
  UserOutlined, CalendarOutlined, GlobalOutlined, SafetyCertificateOutlined,
  FileDoneOutlined, IdcardOutlined, BuildOutlined, StarOutlined,
  CheckCircleOutlined, DollarOutlined, TeamOutlined, BarChartOutlined,
  LinkOutlined, HomeOutlined, EyeOutlined, CameraOutlined,
  FileImageOutlined, BankOutlined, ClockCircleOutlined,FolderOutlined, SyncOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// ─── Xoto Theme ───────────────────────────────────────────────────────────────
const P       = "#5c039b";
const P2      = "#7c3aed";
const GR      = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;
const DARK_GR = `linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)`;
const BG      = "#f5f3ff";
const BORDER  = "#ede9fe";
const WHITE   = "#ffffff";

const UPLOAD_URL = "https://xoto.ae/api/upload";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hasText     = (v) => typeof v === "string" && v.trim().length > 0;
const hasValidDoc = (doc) => hasText(doc?.url) && hasText(doc?.name);
const fmt  = (d) => !d ? "—" : new Date(d).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" });
const fmtT = (d) => !d ? "—" : new Date(d).toLocaleString("en-AE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const kycColor = (s) => s === "approved" ? "green" : s === "rejected" ? "red" : "orange";
const agrColor = (s) => s === "approved" ? "green" : s === "changes_requested" ? "orange" : s === "rejected" ? "red" : s === "pending_review" ? "blue" : "default";

const KYC_LABEL = { passport: "Passport", emirates_id: "Emirates ID", trade_license: "Trade License" };
const AGR_LABEL = { main_agreement: "Main Agreement", commission_schedule: "Commission Schedule", addendum: "Addendum" };

// ─── Upload helper ────────────────────────────────────────────────────────────
const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const res  = await fetch(UPLOAD_URL, { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.message || "Upload failed");
  return data?.file?.url || data?.url || data?.data?.url || "";
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ icon, title, extra, children, accent }) => (
  <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: "0 2px 12px rgba(92,3,155,0.05)", overflow: "hidden", marginBottom: 20 }}>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 20px",
      background: accent ? `linear-gradient(135deg, ${P}15 0%, ${P2}10 100%)` : "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
      borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: GR, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {React.cloneElement(icon, { style: { color: "#fff", fontSize: 14 } })}
        </div>
        <Text strong style={{ fontSize: 14, color: "#1e1b4b" }}>{title}</Text>
      </div>
      {extra}
    </div>
    <div style={{ padding: 20 }}>{children}</div>
  </div>
);

// ─── Info Item ────────────────────────────────────────────────────────────────
const Info = ({ label, value, icon, full }) => {
  if (!value && value !== 0) return null;
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined, background: "#fafafa", borderRadius: 10, padding: "11px 14px", border: "1px solid #f0e8ff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
        {icon && React.cloneElement(icon, { style: { color: P, fontSize: 11 } })}
        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</span>
      </div>
      <div style={{ fontSize: 13, color: "#111827", fontWeight: 600 }}>{value}</div>
    </div>
  );
};

// ─── Doc Card ─────────────────────────────────────────────────────────────────
const DocCard = ({ doc, label }) => (
  <a href={doc.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
    <div
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "#faf5ff", border: `1px solid ${BORDER}`, cursor: "pointer", transition: "all 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "#f3e8ff"; e.currentTarget.style.borderColor = "#c4b5fd"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#faf5ff"; e.currentTarget.style.borderColor = BORDER; }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 8, background: GR, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FileTextOutlined style={{ color: "#fff", fontSize: 15 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{doc.name}{doc.uploadedAt ? ` · ${fmt(doc.uploadedAt)}` : ""}</div>
      </div>
      <LinkOutlined style={{ color: P, fontSize: 14, flexShrink: 0 }} />
    </div>
  </a>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const Stat = ({ label, value, icon, color, bg }) => (
  <div style={{ background: bg, borderRadius: 14, padding: "18px 14px", border: `1px solid ${color}25`, textAlign: "center" }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
      {React.cloneElement(icon, { style: { color, fontSize: 18 } })}
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, marginTop: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
  </div>
);

// ─── Pill ─────────────────────────────────────────────────────────────────────
const Pill = ({ children, color = "gray" }) => {
  const MAP = { green: ["#d1fae5","#065f46","#6ee7b7"], red: ["#fee2e2","#991b1b","#fca5a5"], orange: ["#fef3c7","#92400e","#fcd34d"], blue: ["#dbeafe","#1e40af","#93c5fd"], purple: ["#ede9fe","#5b21b6","#c4b5fd"], cyan: ["#cffafe","#164e63","#67e8f9"], gray: ["#f3f4f6","#374151","#d1d5db"] };
  const [bg, text, border] = MAP[color] || MAP.gray;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, background: bg, color: text, border: `1px solid ${border}` }}>{children}</span>;
};

// ─── Property Card (rich off-plan aware) ─────────────────────────────────────
const PropertyCard = ({ p, onClick }) => {
  const isOffPlan = p.propertySubType === "off_plan";
  const cover = p.mainLogo || p.photos?.architecture?.[0] || p.photos?.other?.[0];
  const price = p.price_min && p.price_max && p.price_min !== p.price_max
    ? `AED ${Number(p.price_min).toLocaleString()} – ${Number(p.price_max).toLocaleString()}`
    : p.price ? `AED ${Number(p.price).toLocaleString()}` : "On Request";

  return (
    <div
      onClick={onClick}
      style={{ borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden", cursor: "pointer", background: WHITE, boxShadow: "0 2px 8px rgba(92,3,155,0.05)", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(92,3,155,0.13)"; e.currentTarget.style.borderColor = "#c4b5fd"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(92,3,155,0.05)"; e.currentTarget.style.borderColor = BORDER; }}
    >
      {/* Cover */}
      <div style={{ height: 130, background: "#f3e8ff", position: "relative", overflow: "hidden" }}>
        {cover ? (
          <img src={cover} alt={p.propertyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#c4b5fd" }}>🏢</div>
        )}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
          <span style={{ background: P, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
            {p.propertySubType?.replace(/_/g, " ").toUpperCase() || "PROPERTY"}
          </span>
          {isOffPlan && p.completionDate?.year && (
            <span style={{ background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
  <CalendarOutlined /> {p.completionDate.quarter} {p.completionDate.year}
</span>
          )}
        </div>
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <span style={{ background: p.approvalStatus === "approved" ? "#059669" : p.approvalStatus === "pending" ? "#d97706" : "#dc2626", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
            {p.approvalStatus?.toUpperCase()}
          </span>
        </div>
        {isOffPlan && p.readinessProgress && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.3)" }}>
            <div style={{ height: "100%", background: "#10b981", width: p.readinessProgress }} />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.propertyName}</div>
        {(p.area || p.city) && (
          <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3, marginBottom: 8 }}>
            <EnvironmentOutlined style={{ fontSize: 10 }} />{[p.area, p.city].filter(Boolean).join(", ")}
          </div>
        )}

        {/* Off-plan extras */}
        {isOffPlan && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {p.inventory?.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "#5b21b6", background: "#ede9fe", padding: "2px 7px", borderRadius: 10 }}>
                {p.inventory.length} Unit Types
              </span>
            )}
            {p.brochure && (
             <a href={p.brochure} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
  style={{ fontSize: 10, fontWeight: 600, color: "#2563eb", background: "#dbeafe", padding: "2px 7px", borderRadius: 10, textDecoration: "none" }}>
  <FileTextOutlined /> Brochure
</a>
            )}
            {p.projectStatus && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "#065f46", background: "#d1fae5", padding: "2px 7px", borderRadius: 10 }}>
                {p.projectStatus.replace(/_/g, " ")}
              </span>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: P }}>{price}</span>
          <span style={{ fontSize: 10, color: P, display: "flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
            <EyeOutlined /> View
          </span>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const DeveloperDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [dev,          setDev]          = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [properties,   setProperties]   = useState([]);
  const [description,  setDescription]  = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [activeTab,    setActiveTab]    = useState("overview");

  // Modals
  const [descModal,         setDescModal]         = useState(false);
  const [rejectModal,       setRejectModal]        = useState(false);
  const [rejectReason,      setRejectReason]       = useState("");
  const [kycLoading,        setKycLoading]         = useState(false);
  const [agrApproveModal,   setAgrApproveModal]    = useState(false);
  const [agrApproveRemark,  setAgrApproveRemark]   = useState("");
  const [agrApproveLoad,    setAgrApproveLoad]     = useState(false);
  const [agrChangesModal,   setAgrChangesModal]    = useState(false);
  const [agrChangesMsg,     setAgrChangesMsg]      = useState("");
  const [agrChangesRemark,  setAgrChangesRemark]   = useState("");
  const [agrChangesLoad,    setAgrChangesLoad]     = useState(false);
  const [uploadModal,       setUploadModal]        = useState(false);
  const [uploadLoad,        setUploadLoad]         = useState(false);
  const [uploadDocs,        setUploadDocs]         = useState([{ type: "main_agreement", name: "", url: "" }]);
  const [adminFilesModal,   setAdminFilesModal]    = useState(false);
  const [adminFiles,        setAdminFiles]         = useState([{ name: "", url: "", type: "brochure" }]);
  const [adminFilesLoad,    setAdminFilesLoad]     = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDev = async (devId) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/developer/get-developer-by-id`, { id: devId });
      const d   = res?.data || res;
      setDev(d);
      setDescription(d?.description || "");
      fetchProperties(d._id);
    } catch { message.error("Failed to load developer details."); }
    finally { setLoading(false); }
  };

  const fetchProperties = async (devId) => {
    try {
      const res  = await apiService.get(`/properties?developerId=${devId}`);
      const body = res?.data;
      setProperties(Array.isArray(body) ? body : (body?.data || []));
    } catch { /* silent */ }
  };

  useEffect(() => { if (id) fetchDev(id); }, [id]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogoUpload = async (file) => {
    setLogoUploading(true);
    try {
      const url = await uploadFile(file);
      await apiService.post(`/developer/edit-developer/${dev._id}`, { logo: url });
      message.success("Logo updated!");
      fetchDev(dev._id);
    } catch { message.error("Logo upload failed."); }
    finally { setLogoUploading(false); }
    return false; // prevent default upload
  };

  const handleKycApprove = async () => {
    setKycLoading(true);
    try {
      await apiService.put(`/developer/admin/review-kyc/${dev._id}`, { action: "approve" });
      message.success("Verification approved!"); fetchDev(dev._id);
    } catch { message.error("Approval failed."); }
    finally { setKycLoading(false); }
  };

  const handleKycReject = async () => {
    if (!rejectReason.trim()) { message.warning("Please enter a rejection reason."); return; }
    setKycLoading(true);
    try {
      await apiService.put(`/developer/admin/review-kyc/${dev._id}`, { action: "reject", rejectionReason: rejectReason.trim() });
      message.success("Verification rejected."); setRejectModal(false); setRejectReason(""); fetchDev(dev._id);
    } catch { message.error("Rejection failed."); }
    finally { setKycLoading(false); }
  };

  const handleAgrApprove = async () => {
    setAgrApproveLoad(true);
    try {
      await apiService.put(`/developer/admin/verify-agreement/${dev._id}`, { remarks: agrApproveRemark.trim() });
      message.success("Agreement approved!"); setAgrApproveModal(false); setAgrApproveRemark(""); fetchDev(dev._id);
    } catch { message.error("Approval failed."); }
    finally { setAgrApproveLoad(false); }
  };

  const handleAgrChanges = async () => {
    if (!agrChangesMsg.trim() || !agrChangesRemark.trim()) { message.warning("Please fill both fields."); return; }
    setAgrChangesLoad(true);
    try {
      await apiService.post(`/developer/admin/request-changes/${dev._id}`, { message: agrChangesMsg.trim(), remarks: agrChangesRemark.trim() });
      message.success("Change request sent."); setAgrChangesModal(false); setAgrChangesMsg(""); setAgrChangesRemark(""); fetchDev(dev._id);
    } catch { message.error("Failed."); }
    finally { setAgrChangesLoad(false); }
  };

  const handleUploadDocs = async () => {
    const valid = uploadDocs.filter(d => d.type && d.name && d.url);
    if (!valid.length) { message.warning("Please fill all fields."); return; }
    setUploadLoad(true);
    try {
      await apiService.post(`/agreement/upload`, { developerId: dev._id, agreementDocuments: valid });
      message.success("Uploaded!"); setUploadModal(false); setUploadDocs([{ type: "main_agreement", name: "", url: "" }]); fetchDev(dev._id);
    } catch { message.error("Upload failed."); }
    finally { setUploadLoad(false); }
  };

  const handleAdminFilesUpload = async () => {
    const valid = adminFiles.filter(f => f.name && f.url);
    if (!valid.length) { message.warning("Please fill all fields."); return; }
    setAdminFilesLoad(true);
    try {
      // Store admin files as part of developer's kycDocuments or a separate adminFiles array
      await apiService.post(`/developer/edit-developer/${dev._id}`, {
        adminFiles: [...(dev.adminFiles || []), ...valid.map(f => ({ ...f, uploadedAt: new Date() }))],
      });
      message.success("Files uploaded!"); setAdminFilesModal(false); setAdminFiles([{ name: "", url: "", type: "brochure" }]); fetchDev(dev._id);
    } catch { message.error("Upload failed."); }
    finally { setAdminFilesLoad(false); }
  };

  const handleUpdateDesc = async () => {
    try {
      await apiService.post(`/developer/edit-developer/${dev._id}`, { description });
      message.success("Description updated!"); setDescModal(false); fetchDev(dev._id);
    } catch { message.error("Update failed."); }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
      <Spin size="large" />
    </div>
  );
  if (!dev) return (
    <div style={{ padding: 80, textAlign: "center" }}>
      <Title level={4}>Developer not found</Title>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const kycDocs       = (dev.kycDocuments || []).filter(hasValidDoc);
  const agrDocs       = (dev.agreementDocuments || []).filter(hasValidDoc);
  const adminFileDocs = (dev.adminFiles || []).filter(hasValidDoc);
  const showAgrStatus = hasText(dev.agreementStatus) && dev.agreementStatus !== "not_uploaded";
  const offplanProps  = properties.filter(p => p.propertySubType === "off_plan");
  const otherProps    = properties.filter(p => p.propertySubType !== "off_plan");
  const pendingCount  = properties.filter(p => p.approvalStatus === "pending").length;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: "100vh", padding: "24px 28px" }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}
          style={{ borderRadius: 9, borderColor: P, color: P, fontWeight: 600 }}>
          Back to Developer List
        </Button>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {dev.kycStatus === "pending" && <>
            <Button type="primary" icon={<CheckOutlined />} loading={kycLoading} onClick={handleKycApprove}
              style={{ background: "#059669", borderColor: "#059669", borderRadius: 9, fontWeight: 600 }}>
              Approve KYC
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={() => setRejectModal(true)} style={{ borderRadius: 9, fontWeight: 600 }}>
              Reject KYC
            </Button>
          </>}
          <Button icon={<FileImageOutlined />} onClick={() => setAdminFilesModal(true)}
            style={{ borderRadius: 9, borderColor: "#2563eb", color: "#2563eb", fontWeight: 600 }}>
            Upload Files
          </Button>
          <Button icon={<UploadOutlined />} onClick={() => setUploadModal(true)}
            style={{ borderRadius: 9, borderColor: P, color: P, fontWeight: 600 }}>
            Upload Agreement
          </Button>
        </div>
      </div>

      {/* ══ HERO BANNER ══════════════════════════════════════════════════════════ */}
      <div style={{
        background: DARK_GR,
        borderRadius: 20, padding: "32px", marginBottom: 24,
        position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(92,3,155,0.3)",
      }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(124,58,237,0.1)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: 80, width: 160, height: 160, borderRadius: "50%", background: "rgba(92,3,155,0.15)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Avatar with logo upload */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Avatar size={100} shape="square" src={dev.logo}
              style={{ borderRadius: 16, border: "3px solid rgba(196,167,255,0.35)", background: "#2d0a52", fontSize: 40, color: "#c4a7ff", fontWeight: 800 }}>
              {dev.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Upload showUploadList={false} beforeUpload={handleLogoUpload} accept="image/*">
              <button style={{
                position: "absolute", bottom: -4, right: -4,
                width: 28, height: 28, borderRadius: "50%",
                background: GR, border: "2px solid #1e0b3a",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>
                {logoUploading ? <Spin size="small" /> : <CameraOutlined style={{ color: "#fff", fontSize: 12 }} />}
              </button>
            </Upload>
          </div>

          {/* Name + Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: "rgba(196,167,255,0.55)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>
              Developer Profile
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 2 }}>{dev.name}</div>
            {hasText(dev.companyName) && dev.companyName !== dev.name && (
              <div style={{ fontSize: 13, color: "rgba(196,167,255,0.6)", marginBottom: 10 }}>{dev.companyName}</div>
            )}
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
              <Pill color={dev.isVerifiedByAdmin ? "green" : "red"}>{dev.isVerifiedByAdmin ? "✓ Verified" : "✗ Unverified"}</Pill>
              <Pill color={dev.accountStatus === "active" ? "cyan" : "orange"}>{dev.accountStatus?.toUpperCase()}</Pill>
              <Pill color="purple">KYC: {dev.kycStatus?.toUpperCase()}</Pill>
              {showAgrStatus && <Pill color={agrColor(dev.agreementStatus)}>AGR: {dev.agreementStatus?.replace(/_/g, " ").toUpperCase()}</Pill>}
              <Pill color="blue">Onboarding: {dev.onboardingStatus?.replace(/_/g, " ").toUpperCase()}</Pill>
              {dev.reraNumber && <Pill color="gray">RERA: {dev.reraNumber}</Pill>}
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { icon: <MailOutlined />, val: dev.email },
                { icon: <PhoneOutlined />, val: `${dev.country_code} ${dev.phone_number}` },
                hasText(dev.city) && { icon: <EnvironmentOutlined />, val: `${dev.city}, ${dev.country}` },
                hasText(dev.websiteUrl) && { icon: <GlobalOutlined />, val: dev.websiteUrl },
              ].filter(Boolean).map((item, i) => (
                <span key={i} style={{ color: "rgba(196,167,255,0.65)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                  {React.cloneElement(item.icon, { style: { fontSize: 12 } })} {item.val}
                </span>
              ))}
            </div>
          </div>

          {/* Quick stats top right */}
        
        </div>
      </div>

      {/* ══ STATS ROW ════════════════════════════════════════════════════════════ */}
      <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
        {[
          { label: "Presentations",   value: dev.presentationsGenerated_stats ?? 0, icon: <BarChartOutlined />, color: "#2563eb", bg: "#dbeafe" },
          { label: "Leads Generated", value: dev.leadsGenerated_stats ?? 0,         icon: <TeamOutlined />,     color: "#059669", bg: "#d1fae5" },
          { label: "Units Sold",      value: dev.unitsSold_stats ?? 0,              icon: <HomeOutlined />,     color: "#7c3aed", bg: "#ede9fe" },
          { label: "Conversion Rate", value: `${dev.conversionRate_stats ?? 0}%`,   icon: <StarOutlined />,     color: "#d97706", bg: "#fef3c7" },
          { label: "Operating Years", value: dev.operatingYears ? `${dev.operatingYears} yrs` : "—", icon: <CalendarOutlined />, color: "#be185d", bg: "#fce7f3" },
          { label: "Total Documents", value: kycDocs.length + agrDocs.length + adminFileDocs.length, icon: <FileTextOutlined />, color: "#0891b2", bg: "#cffafe" },
        ].map(s => (
          <Col xs={12} sm={8} md={4} key={s.label}><Stat {...s} /></Col>
        ))}
      </Row>

      {/* ══ ACTION BANNERS ═══════════════════════════════════════════════════════ */}
      {dev.kycStatus === "pending" && (
        <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #93c5fd", borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 3 }}><FileTextOutlined /> KYC Pending Review</div>
              <div style={{ fontSize: 12, color: "#3b82f6" }}>Developer submitted KYC documents. Please review and take action.</div>
            </div>
            <Space>
              <Button type="primary" icon={<CheckOutlined />} loading={kycLoading} onClick={handleKycApprove}
                style={{ background: "#059669", borderColor: "#059669", borderRadius: 8, fontWeight: 600 }}>Approve KYC</Button>
              <Button danger icon={<CloseOutlined />} onClick={() => setRejectModal(true)} style={{ borderRadius: 8, fontWeight: 600 }}>Reject</Button>
            </Space>
          </div>
        </div>
      )}

      {dev.agreementStatus === "pending_review" && agrDocs.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1px solid #fcd34d", borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 3 }}><FileTextOutlined /> Agreement Pending Review</div>
              <div style={{ fontSize: 12, color: "#b45309" }}>Developer submitted agreement documents. Please review and take action.</div>
            </div>
            <Space>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => setAgrApproveModal(true)}
                style={{ background: "#059669", borderColor: "#059669", borderRadius: 8, fontWeight: 600 }}>Approve</Button>
              <Button icon={<ExclamationCircleOutlined />} onClick={() => setAgrChangesModal(true)}
                style={{ borderRadius: 8, borderColor: "#f59e0b", color: "#d97706", fontWeight: 600 }}>Request Changes</Button>
            </Space>
          </div>
        </div>
      )}

      {dev.agreementStatus === "approved" && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 14, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <CheckCircleOutlined style={{ color: "#059669", fontSize: 18 }} />
          <div>
            <div style={{ fontWeight: 700, color: "#166534" }}>Agreement Approved</div>
            {hasText(dev.agreementRemarks) && <div style={{ fontSize: 12, color: "#166534" }}>Remark: {dev.agreementRemarks}</div>}
            <div style={{ fontSize: 11, color: "#15803d" }}>on {fmt(dev.agreementVerifiedAt)}</div>
          </div>
        </div>
      )}

      {dev.agreementStatus === "changes_requested" && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 14, padding: "14px 20px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 4 }}><SyncOutlined /> Correction Requested</div>
          {dev.agreementFeedback?.message && <div style={{ fontSize: 12, color: "#78350f", marginBottom: 2 }}>Message: {dev.agreementFeedback.message}</div>}
          {dev.agreementFeedback?.remarks && <div style={{ fontSize: 12, color: "#78350f", marginBottom: 10 }}>Remarks: {dev.agreementFeedback.remarks}</div>}
          <Space>
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => setAgrApproveModal(true)}
              style={{ background: "#059669", borderColor: "#059669", borderRadius: 7, fontWeight: 600 }}>Approve Now</Button>
            <Button size="small" icon={<EditOutlined />} onClick={() => setAgrChangesModal(true)}
              style={{ borderRadius: 7, borderColor: "#f59e0b", color: "#d97706", fontWeight: 600 }}>Resend Request</Button>
          </Space>
        </div>
      )}

      {/* ══ TABS ═════════════════════════════════════════════════════════════════ */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        style={{ marginBottom: 8 }}
        tabBarStyle={{ background: WHITE, borderRadius: "16px 16px 0 0", padding: "0 20px", border: `1px solid ${BORDER}`, borderBottom: "none", marginBottom: 0 }}
       items={[
  { key: "overview",    label: <span><FileTextOutlined /> Overview</span> },
  { key: "properties",  label: <span><HomeOutlined /> Properties <Badge count={properties.length} style={{ background: P }} /></span> },
  { key: "documents",   label: <span><FolderOutlined /> Documents <Badge count={kycDocs.length + agrDocs.length + adminFileDocs.length} style={{ background: "#2563eb" }} /></span> },
  { key: "compliance",  label: <span><CheckCircleOutlined /> Compliance</span> },
]}
      />

      <div style={{ background: WHITE, borderRadius: "0 0 16px 16px", border: `1px solid ${BORDER}`, borderTop: "none", padding: 24, marginBottom: 24, boxShadow: "0 4px 20px rgba(92,3,155,0.05)" }}>

        {/* ── TAB: OVERVIEW ── */}
      {/* ── TAB: OVERVIEW ── */}
{activeTab === "overview" && (
  <Row gutter={[24, 0]}>
    <Col xs={24} lg={14}>
      {/* Basic Information */}
      <Section icon={<UserOutlined />} title="Basic Information"
        extra={
          <Button size="small" icon={<EditOutlined />} onClick={() => setDescModal(true)}
            style={{ borderRadius: 7, borderColor: P, color: P, fontSize: 12, fontWeight: 600 }}>
            Edit Description
          </Button>
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
          <Info label="Email"             icon={<MailOutlined />}              value={dev.email} />
          <Info label="Official Email"    icon={<MailOutlined />}              value={dev.officialEmailId} />
          <Info label="Phone"             icon={<PhoneOutlined />}             value={`${dev.country_code} ${dev.phone_number}`} />
          <Info label="Authorized Person" icon={<UserOutlined />}              value={dev.authorizedPersonName} />
          <Info label="Primary Contact"   icon={<UserOutlined />}              value={dev.primaryContactName} />
          <Info label="City"              icon={<EnvironmentOutlined />}       value={dev.city} />
          <Info label="Country"           icon={<EnvironmentOutlined />}       value={dev.country} />
          <Info label="Address"           icon={<EnvironmentOutlined />}       value={dev.address} />
          <Info label="Website"           icon={<GlobalOutlined />}            value={dev.websiteUrl} />
          <Info label="RERA Number"       icon={<IdcardOutlined />}            value={dev.reraNumber} />
          <Info label="DLD Number"        icon={<IdcardOutlined />}            value={dev.dldNumber || dev.dldRegistrationNumber} />
          <Info label="Dev. License"      icon={<SafetyCertificateOutlined />} value={dev.developerLicenseNumber} />
          <Info label="Operating Years"   icon={<CalendarOutlined />}          value={dev.operatingYears ? `${dev.operatingYears} Years` : null} />
          <Info label="Onboarding Source" icon={<CheckCircleOutlined />}       value={dev.onboardingSource?.replace(/_/g, " ")} />
          {hasText(dev.description) && (
            <div style={{ gridColumn: "1 / -1", background: "#faf5ff", borderRadius: 10, padding: "14px", border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Description (shown on property pages)</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{dev.description}</div>
            </div>
          )}
        </div>
      </Section>

      {/* Developer Card Preview — moved here from right column */}
      <Section icon={<BankOutlined />} title="Developer Card Preview" accent>
        <div style={{ padding: 4 }}>
          <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>
            This is how the developer info appears on off‑plan property detail pages
          </div>
          <div style={{ background: "linear-gradient(135deg, #faf5ff, #f3e8ff)", borderRadius: 14, padding: 20, border: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <Avatar size={56} shape="square" src={dev.logo}
                style={{ borderRadius: 12, border: `2px solid ${BORDER}`, background: "#fff", fontSize: 22, color: P, fontWeight: 800 }}>
                {dev.name?.charAt(0)}
              </Avatar>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>{dev.name}</div>
                {hasText(dev.companyName) && dev.companyName !== dev.name && (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{dev.companyName}</div>
                )}
                {dev.isVerifiedByAdmin && (
                  <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircleOutlined /> Verified Developer
                  </div>
                )}
              </div>
            </div>
            {hasText(dev.description) && (
              <p style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.7, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {dev.description}
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                dev.reraNumber && { label: "RERA", val: dev.reraNumber },
                dev.developerLicenseNumber && { label: "License", val: dev.developerLicenseNumber },
                dev.operatingYears && { label: "Experience", val: `${dev.operatingYears} Years` },
                (dev.city || dev.country) && { label: "Location", val: [dev.city, dev.country].filter(Boolean).join(", ") },
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ fontSize: 11, color: "#374151" }}>
                  <span style={{ color: "#9ca3af", fontWeight: 600 }}>{item.label}: </span>
                  <span style={{ fontWeight: 600 }}>{item.val}</span>
                </div>
              ))}
            </div>
            {agrDocs.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Documents</div>
                {agrDocs.slice(0, 2).map((doc, i) => (
                  <a key={i} href={doc.url} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: P, fontWeight: 600, marginBottom: 4, textDecoration: "none" }}>
                    <FileTextOutlined /> {AGR_LABEL[doc.type] || doc.type}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>
    </Col>

    <Col xs={24} lg={10}>
      {/* Agreement Info */}
      {showAgrStatus && (
        <Section icon={<FileDoneOutlined />} title="Agreement Info">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Info label="Agreement Status"     icon={<CheckCircleOutlined />} value={<Tag color={agrColor(dev.agreementStatus)} style={{ borderRadius: 20, margin: 0 }}>{dev.agreementStatus?.replace(/_/g, " ").toUpperCase()}</Tag>} />
            <Info label="Agreement Signed"     icon={<CheckCircleOutlined />} value={dev.agreementSigned ? "Yes" : null} />
            <Info label="Agreement Verified"   icon={<CheckCircleOutlined />} value={dev.agreementVerified ? "Yes" : null} />
            <Info label="Signed At"            icon={<CalendarOutlined />}    value={fmt(dev.agreementSignedAt)} />
            <Info label="Verified At"          icon={<CalendarOutlined />}    value={fmt(dev.agreementVerifiedAt)} />
            <Info label="Commercial Status"    icon={<CheckCircleOutlined />} value={<Tag color={dev.commercialAgreementStatus === "completed" ? "green" : "orange"} style={{ borderRadius: 20, margin: 0 }}>{dev.commercialAgreementStatus?.toUpperCase()}</Tag>} />
            <Info label="Commercial Completed" icon={<CalendarOutlined />}    value={fmt(dev.commercialAgreementCompletedAt)} />
            {hasText(dev.agreementRemarks) && (
              <div style={{ gridColumn: "1 / -1", background: "#faf5ff", borderRadius: 10, padding: "12px 14px", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Remarks</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{dev.agreementRemarks}</div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Engagement Plan — moved here from left column */}
      {dev.engagementPlan && (
        <Section icon={<DollarOutlined />} title="Engagement Plan">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            <Info label="Plan Type"      icon={<FileDoneOutlined />}    value={dev.engagementPlan.type || "Not Assigned"} />
            <Info label="Price"          icon={<DollarOutlined />}      value={dev.engagementPlan.price === 0 ? "Free" : `AED ${dev.engagementPlan.price?.toLocaleString()}`} />
            <Info label="Payment Status" icon={<CheckCircleOutlined />} value={<Tag color={dev.engagementPlan.paymentStatus === "paid" ? "green" : "orange"} style={{ borderRadius: 20, margin: 0 }}>{dev.engagementPlan.paymentStatus?.toUpperCase()}</Tag>} />
            <Info label="Payment Date"   icon={<CalendarOutlined />}    value={fmt(dev.engagementPlan.paymentDate)} />
            <Info label="Start Date"     icon={<CalendarOutlined />}    value={fmt(dev.engagementPlan.startDate)} />
            <Info label="End Date"       icon={<CalendarOutlined />}    value={fmt(dev.engagementPlan.endDate)} />
            {hasText(dev.engagementPlan.invoiceUrl) && (
              <div style={{ gridColumn: "1 / -1" }}>
                <a href={dev.engagementPlan.invoiceUrl} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, color: P, fontSize: 13, fontWeight: 600 }}>
                  <LinkOutlined /> View Invoice
                </a>
              </div>
            )}
          </div>
        </Section>
      )}
    </Col>
  </Row>
)}

        {/* ── TAB: PROPERTIES ── */}
        {activeTab === "properties" && (
          <div>
            {/* Off-Plan */}
            {offplanProps.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: GR, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BuildOutlined style={{ color: "#fff", fontSize: 13 }} />
                  </div>
                  <Text strong style={{ fontSize: 15, color: "#1e1b4b" }}>Off-Plan Projects ({offplanProps.length})</Text>
                  <span style={{ fontSize: 11, color: "#6b7280", background: "#f3e8ff", padding: "2px 8px", borderRadius: 10 }}>
                    Developer info auto-populated on these property pages
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {offplanProps.map(p => (
                    <PropertyCard key={p._id} p={p} onClick={() => navigate(`/dashboard/admin/property/view/${p._id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Other */}
            {otherProps.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "#0891b230", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HomeOutlined style={{ color: "#0891b2", fontSize: 13 }} />
                  </div>
                  <Text strong style={{ fontSize: 15, color: "#1e1b4b" }}>Other Listings ({otherProps.length})</Text>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {otherProps.map(p => (
                    <PropertyCard key={p._id} p={p} onClick={() => navigate(`/dashboard/admin/property/view/${p._id}`)} />
                  ))}
                </div>
              </div>
            )}

            {properties.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
                <BuildOutlined style={{ fontSize: 48, marginBottom: 12, display: "block" }} />
                <div style={{ fontSize: 15, fontWeight: 600 }}>No properties listed yet</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Properties added by or for this developer will appear here</div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: DOCUMENTS ── */}
        {activeTab === "documents" && (
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={8}>
              <Section icon={<IdcardOutlined />} title={`KYC Documents (${kycDocs.length})`}>
                {kycDocs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>No KYC documents uploaded.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {kycDocs.map((doc, i) => <DocCard key={i} doc={doc} label={KYC_LABEL[doc.type] || doc.type} />)}
                  </div>
                )}
              </Section>
            </Col>
            <Col xs={24} lg={8}>
              <Section icon={<FileDoneOutlined />} title={`Agreement Documents (${agrDocs.length})`}
                extra={
                  <Button size="small" icon={<UploadOutlined />} onClick={() => setUploadModal(true)}
                    style={{ borderRadius: 7, borderColor: P, color: P, fontSize: 11, fontWeight: 600 }}>Upload</Button>
                }
              >
                {agrDocs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>No agreement documents uploaded.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {agrDocs.map((doc, i) => <DocCard key={i} doc={doc} label={AGR_LABEL[doc.type] || doc.type} />)}
                  </div>
                )}
              </Section>
            </Col>
            <Col xs={24} lg={8}>
              <Section icon={<FileImageOutlined />} title={`Admin Uploaded Files (${adminFileDocs.length})`}
                extra={
                  <Button size="small" icon={<PlusOutlined />} onClick={() => setAdminFilesModal(true)}
                    style={{ borderRadius: 7, borderColor: "#2563eb", color: "#2563eb", fontSize: 11, fontWeight: 600 }}>Add</Button>
                }
              >
                {adminFileDocs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>
                    No admin files uploaded yet.
                    <br />
                    <Button size="small" onClick={() => setAdminFilesModal(true)} style={{ marginTop: 10, borderColor: "#2563eb", color: "#2563eb", borderRadius: 7 }}>
                      Upload Files
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {adminFileDocs.map((doc, i) => <DocCard key={i} doc={doc} label={doc.type ? doc.type.replace(/_/g, " ") : doc.name} />)}
                  </div>
                )}
              </Section>
              {/* Trade License */}
              {hasValidDoc(dev.tradeLicenseDocument) && (
                <Section icon={<FileTextOutlined />} title="Trade License">
                  <DocCard doc={dev.tradeLicenseDocument} label="Trade License Document" />
                </Section>
              )}
            </Col>
          </Row>
        )}

        {/* ── TAB: COMPLIANCE ── */}
        {activeTab === "compliance" && (
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={12}>
              <Section icon={<SafetyCertificateOutlined />} title="KYC & Verification">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Info label="KYC Status"           icon={<CheckCircleOutlined />} value={<Tag color={kycColor(dev.kycStatus)} style={{ borderRadius: 20, margin: 0 }}>{dev.kycStatus?.toUpperCase()}</Tag>} />
                  <Info label="Application Status"   icon={<CheckCircleOutlined />} value={<Tag color={dev.applicationStatus === "approved" ? "green" : "orange"} style={{ borderRadius: 20, margin: 0 }}>{dev.applicationStatus?.toUpperCase()}</Tag>} />
                  <Info label="Account Status"       icon={<CheckCircleOutlined />} value={<Tag color={dev.accountStatus === "active" ? "cyan" : "orange"} style={{ borderRadius: 20, margin: 0 }}>{dev.accountStatus?.toUpperCase()}</Tag>} />
                  <Info label="Access Granted"       icon={<CheckCircleOutlined />} value={dev.accessGranted ? <Tag color="green" style={{ borderRadius: 20, margin: 0 }}>Yes</Tag> : "No"} />
                  <Info label="Onboarding Started"   icon={<CalendarOutlined />}    value={fmt(dev.onboardingStartedAt)} />
                  <Info label="Onboarding Completed" icon={<CalendarOutlined />}    value={fmt(dev.onboardingCompletedAt)} />
                  <Info label="Access Granted At"    icon={<CalendarOutlined />}    value={fmt(dev.accessGrantedAt)} />
                  <Info label="Application Reviewed" icon={<CalendarOutlined />}    value={fmt(dev.applicationReviewedAt)} />
                  <Info label="KYC Reviewed At"      icon={<CalendarOutlined />}    value={fmt(dev.kycReviewedAt)} />
                  <Info label="TAT Days"             icon={<ClockCircleOutlined />} value={dev.tatDays ? `${dev.tatDays} Day(s)` : null} />
                  {hasText(dev.kycRejectionReason) && (
                    <div style={{ gridColumn: "1 / -1", background: "#fef2f2", borderRadius: 10, padding: "12px 14px", border: "1px solid #fecaca" }}>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>KYC Rejection Reason</div>
                      <div style={{ fontSize: 13, color: "#991b1b" }}>{dev.kycRejectionReason}</div>
                    </div>
                  )}
                  {hasText(dev.applicationRejectionReason) && (
                    <div style={{ gridColumn: "1 / -1", background: "#fef2f2", borderRadius: 10, padding: "12px 14px", border: "1px solid #fecaca" }}>
                      <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Application Rejection Reason</div>
                      <div style={{ fontSize: 13, color: "#991b1b" }}>{dev.applicationRejectionReason}</div>
                    </div>
                  )}
                </div>
              </Section>
            </Col>
            <Col xs={24} lg={12}>
              {/* Onboarding checklist */}
              <Section icon={<CheckCircleOutlined />} title="Onboarding Checklist">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Application Submitted", done: !!dev.applicationSubmittedAt, date: fmt(dev.applicationSubmittedAt) },
                    { label: "Application Approved",  done: dev.applicationStatus === "approved", date: fmt(dev.applicationReviewedAt) },
                    { label: "KYC Verified",           done: dev.kycStatus === "approved", date: fmt(dev.kycReviewedAt) },
                    { label: "Agreement Signed",       done: dev.agreementSigned, date: fmt(dev.agreementSignedAt) },
                    { label: "Agreement Verified",     done: dev.agreementVerified, date: fmt(dev.agreementVerifiedAt) },
                    { label: "Platform Access Granted", done: dev.accessGranted, date: fmt(dev.accessGrantedAt) },
                    { label: "Onboarding Complete",    done: dev.onboardingStatus === "completed", date: fmt(dev.onboardingCompletedAt) },
                  ].map(({ label, done, date }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: done ? "#f0fdf4" : "#fafafa", border: `1px solid ${done ? "#86efac" : "#f0e8ff"}` }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? "#059669" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {done ? <CheckOutlined style={{ color: "#fff", fontSize: 11 }} /> : <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db", display: "block" }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: done ? "#166534" : "#374151" }}>{label}</div>
                        {done && date !== "—" && <div style={{ fontSize: 11, color: "#6b7280" }}>{date}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </Col>
          </Row>
        )}
      </div>

      {/* ════════ MODALS ════════════════════════════════════════════════════════ */}

      {/* KYC Reject */}
      <Modal title={<Space><CloseOutlined style={{ color: "#ef4444" }} /><Text strong>Reject KYC</Text></Space>}
        open={rejectModal} centered onCancel={() => { setRejectModal(false); setRejectReason(""); }}
        footer={[
          <Button key="c" onClick={() => { setRejectModal(false); setRejectReason(""); }}>Cancel</Button>,
          <Button key="r" danger loading={kycLoading} onClick={handleKycReject} icon={<CloseOutlined />} style={{ fontWeight: 600 }}>Confirm Reject</Button>,
        ]}>
        <TextArea rows={4} placeholder="e.g. Trade license is expired." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ borderRadius: 8, marginTop: 16 }} />
      </Modal>

      {/* Agreement Approve */}
      <Modal title={<Space><CheckOutlined style={{ color: "#059669" }} /><Text strong>Approve Agreement</Text></Space>}
        open={agrApproveModal} centered onCancel={() => { setAgrApproveModal(false); setAgrApproveRemark(""); }}
        footer={[
          <Button key="c" onClick={() => { setAgrApproveModal(false); setAgrApproveRemark(""); }}>Cancel</Button>,
          <Button key="a" type="primary" loading={agrApproveLoad} onClick={handleAgrApprove} icon={<CheckOutlined />}
            style={{ background: "#059669", borderColor: "#059669", fontWeight: 600 }}>Confirm Approve</Button>,
        ]}>
        <TextArea rows={3} placeholder="Remark (optional)" value={agrApproveRemark} onChange={e => setAgrApproveRemark(e.target.value)} style={{ borderRadius: 8, marginTop: 16 }} />
      </Modal>

      {/* Agreement Request Changes */}
      <Modal title={<Space><ExclamationCircleOutlined style={{ color: "#d97706" }} /><Text strong>Request Changes</Text></Space>}
        open={agrChangesModal} centered onCancel={() => { setAgrChangesModal(false); setAgrChangesMsg(""); setAgrChangesRemark(""); }}
        footer={[
          <Button key="c" onClick={() => { setAgrChangesModal(false); setAgrChangesMsg(""); setAgrChangesRemark(""); }}>Cancel</Button>,
          <Button key="s" type="primary" loading={agrChangesLoad} onClick={handleAgrChanges} icon={<EditOutlined />}
            style={{ background: "#d97706", borderColor: "#d97706", fontWeight: 600 }}>Send Request</Button>,
        ]}>
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 6 }}>Message <Text type="danger">*</Text></Text>
          <TextArea rows={3} value={agrChangesMsg} onChange={e => setAgrChangesMsg(e.target.value)} style={{ borderRadius: 8, marginBottom: 16 }} />
          <Text strong style={{ display: "block", marginBottom: 6 }}>Remarks <Text type="danger">*</Text></Text>
          <TextArea rows={2} value={agrChangesRemark} onChange={e => setAgrChangesRemark(e.target.value)} style={{ borderRadius: 8 }} />
        </div>
      </Modal>

      {/* Upload Agreement Docs */}
      <Modal title={<Space><UploadOutlined style={{ color: P }} /><Text strong>Upload Agreement Documents</Text></Space>}
        open={uploadModal} centered width={600}
        onCancel={() => { setUploadModal(false); setUploadDocs([{ type: "main_agreement", name: "", url: "" }]); }}
        footer={[
          <Button key="c" onClick={() => { setUploadModal(false); setUploadDocs([{ type: "main_agreement", name: "", url: "" }]); }}>Cancel</Button>,
          <Button key="u" type="primary" loading={uploadLoad} onClick={handleUploadDocs} icon={<UploadOutlined />}
            style={{ background: P, borderColor: P, fontWeight: 600 }}>Upload</Button>,
        ]}>
        <div style={{ padding: "12px 0" }}>
          {uploadDocs.map((doc, index) => (
            <Card key={index} size="small" bordered style={{ borderRadius: 10, marginBottom: 12 }}>
              <Row gutter={[10, 10]} align="middle">
                <Col xs={24} sm={10}>
                  <Select value={doc.type} style={{ width: "100%" }}
                    onChange={v => { const u = [...uploadDocs]; u[index].type = v; setUploadDocs(u); }}>
                    <Option value="main_agreement">Main Agreement</Option>
                    <Option value="commission_schedule">Commission Schedule</Option>
                    <Option value="addendum">Addendum</Option>
                  </Select>
                </Col>
                <Col xs={22} sm={12}>
                  <Input placeholder="File name" value={doc.name} onChange={e => { const u = [...uploadDocs]; u[index].name = e.target.value; setUploadDocs(u); }} />
                </Col>
                <Col xs={2}>
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setUploadDocs(uploadDocs.filter((_, i) => i !== index))} />
                </Col>
                <Col xs={24}>
                  <Input placeholder="File URL" value={doc.url} onChange={e => { const u = [...uploadDocs]; u[index].url = e.target.value; setUploadDocs(u); }} />
                </Col>
              </Row>
            </Card>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />}
            onClick={() => setUploadDocs([...uploadDocs, { type: "addendum", name: "", url: "" }])}>
            Add Another Document
          </Button>
        </div>
      </Modal>

      {/* Upload Admin Files */}
      <Modal title={<Space><FileImageOutlined style={{ color: "#2563eb" }} /><Text strong>Upload Admin Files</Text></Space>}
        open={adminFilesModal} centered width={600}
        onCancel={() => { setAdminFilesModal(false); setAdminFiles([{ name: "", url: "", type: "brochure" }]); }}
        footer={[
          <Button key="c" onClick={() => { setAdminFilesModal(false); setAdminFiles([{ name: "", url: "", type: "brochure" }]); }}>Cancel</Button>,
          <Button key="u" type="primary" loading={adminFilesLoad} onClick={handleAdminFilesUpload} icon={<UploadOutlined />}
            style={{ background: "#2563eb", borderColor: "#2563eb", fontWeight: 600 }}>Upload</Button>,
        ]}>
        <div style={{ marginBottom: 10, fontSize: 12, color: "#6b7280" }}>
          These files (brochures, floor plans, marketing material) are stored on the developer profile and can be linked from property pages.
        </div>
        {adminFiles.map((file, index) => (
          <Card key={index} size="small" bordered style={{ borderRadius: 10, marginBottom: 12 }}>
            <Row gutter={[10, 10]} align="middle">
              <Col xs={24} sm={10}>
                <Select value={file.type} style={{ width: "100%" }}
                  onChange={v => { const u = [...adminFiles]; u[index].type = v; setAdminFiles(u); }}>
                  <Option value="brochure">Brochure</Option>
                  <Option value="floor_plan">Floor Plan</Option>
                  <Option value="marketing_material">Marketing Material</Option>
                  <Option value="legal_document">Legal Document</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Col>
              <Col xs={22} sm={12}>
                <Input placeholder="File name" value={file.name} onChange={e => { const u = [...adminFiles]; u[index].name = e.target.value; setAdminFiles(u); }} />
              </Col>
              <Col xs={2}>
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setAdminFiles(adminFiles.filter((_, i) => i !== index))} />
              </Col>
              <Col xs={24}>
                <Input placeholder="File URL" value={file.url} onChange={e => { const u = [...adminFiles]; u[index].url = e.target.value; setAdminFiles(u); }} />
              </Col>
            </Row>
          </Card>
        ))}
        <Button type="dashed" block icon={<PlusOutlined />}
          onClick={() => setAdminFiles([...adminFiles, { name: "", url: "", type: "brochure" }])}>
          Add Another File
        </Button>
      </Modal>

      {/* Edit Description */}
      <Modal title="Edit Developer Description" open={descModal}
        onCancel={() => setDescModal(false)} onOk={handleUpdateDesc} okText="Save"
        okButtonProps={{ style: { background: P, borderColor: P } }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          This description will appear on all off-plan property detail pages for this developer.
        </div>
        <TextArea rows={6} value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Enter developer description — this appears on property pages" style={{ borderRadius: 8 }} />
      </Modal>

    </div>
  );
};

export default DeveloperDetail;