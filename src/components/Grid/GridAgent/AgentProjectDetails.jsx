import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Typography, Button, Spin, message,
  Divider, Popover, Modal, Image, Tag, Progress,
  Form, Input, Select, Alert,
} from "antd";
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  WalletOutlined, BankOutlined, ArrowLeftOutlined, MoneyCollectOutlined,
  CheckCircleOutlined, ThunderboltOutlined, UserOutlined, QrcodeOutlined,
  SafetyCertificateOutlined, BuildOutlined, HomeOutlined, ApartmentOutlined,
  ToolOutlined, CarOutlined, ScheduleOutlined, AppstoreOutlined,
  PaperClipOutlined, StarOutlined, InfoCircleOutlined,
} from "@ant-design/icons";
import {
  FiMapPin, FiDownload, FiX, FiLoader, FiCheckCircle,
  FiHome, FiEdit3, FiMail, FiCopy, FiEye,
} from "react-icons/fi";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text, Paragraph } = Typography;

// ─── Theme ────────────────────────────────────────────────────────────────────
const P  = "#4A027C";
const P2 = "#7C3AED";
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => (Number(n) || 0).toLocaleString();

const getAllPhotos = (property) => {
  const photos = [];
  if (property?.media) {
    ["architectureImages", "interiorImages", "lobbyImages", "otherImages"].forEach((key) => {
      if (Array.isArray(property.media[key]))
        photos.push(...property.media[key].filter(Boolean));
    });
  }
  if (property?.photos) {
    if (Array.isArray(property.photos)) photos.push(...property.photos);
    else if (typeof property.photos === "object") {
      Object.values(property.photos).forEach((cat) => {
        if (Array.isArray(cat)) photos.push(...cat);
      });
    }
  }
  const logo = property?.mainLogo || property?.media?.mainLogo;
  if (logo && !photos.includes(logo)) photos.unshift(logo);
  if (photos.length === 0)
    photos.push("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg");
  return [...new Set(photos)];
};

const getLabel = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item.title || item.name || item.label || item.amenity || "";
};

const getFeatureList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  if (typeof value !== "object") return [];

  return Object.entries(value)
    .filter(([, enabled]) => enabled === true)
    .map(([key]) =>
      key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
};

const CATEGORY_LABELS = {
  brochure: "Brochure", floor_plan: "Floor Plan", payment_plan: "Payment Plan",
  noc: "NOC", title_deed_template: "Title Deed Template",
  developer_profile: "Developer Profile", other: "Other",
};
const CAT_COLORS = {
  brochure: "#6d28d9", floor_plan: "#0369a1", payment_plan: "#166534",
  noc: "#b45309", title_deed_template: "#991b1b", developer_profile: "#7e22ce", other: "#475569",
};

// ─── UI helpers ───────────────────────────────────────────────────────────────
const SectionTitle = ({ children, icon: Icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
    {Icon && (
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", color: P }}>
        <Icon />
      </div>
    )}
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{children}</h2>
  </div>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #f8fafc" }}>
    {Icon && (
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", color: P, flexShrink: 0 }}>
        <Icon style={{ fontSize: 13 }} />
      </div>
    )}
    <div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{value || "—"}</p>
    </div>
  </div>
);

const Btn = ({ children, onClick, variant = "primary", loading: isLoading, disabled }) => {
  const styles = {
    primary: { background: GR, color: "#fff", border: "none" },
    ghost:   { background: "#fff", color: "#374151", border: "1px solid #e2e8f0" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{
        ...styles[variant],
        padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700,
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        opacity: disabled || isLoading ? 0.65 : 1,
        display: "inline-flex", alignItems: "center", gap: 8,
      }}
    >
      {isLoading ? <FiLoader size={14} /> : children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// AI PRESENTATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const PresentationModal = ({ property: initialProperty, onClose }) => {
  const [step,             setStep]            = useState(1);
  const [generating,       setGenerating]      = useState(false);
  const [saving,           setSaving]          = useState(false);
  const [narrative,        setNarrative]       = useState(null);
  const [trackingUrl,      setTrackingUrl]     = useState("");
  const [previewUrl,       setPreviewUrl]      = useState("");
  const [copied,           setCopied]          = useState(false);
  const [property,         setProperty]        = useState(initialProperty);
  const [propertyLoading,  setPropertyLoading] = useState(false);

  const [settings, setSettings] = useState({
    language: "English", currency: "AED", areaUnit: "sqft", tone: "professional",
    sections: {
      cover: true, projectDescription: true, developer: true,
      unitPrices: true, paymentPlan: true, location: true,
      gallery: true, keyHighlights: true,
    },
  });

  const [clientNotes, setClientNotes] = useState({
    clientName: "", budget: "", requirements: "",
  });

  useEffect(() => {
    if (!initialProperty?._id) return;
    setPropertyLoading(true);
    apiService.get(`/properties/${initialProperty._id}`)
      .then((res) => { const d = res?.data?.data || res?.data; if (d) setProperty(d); })
      .catch(() => {})
      .finally(() => setPropertyLoading(false));
  }, [initialProperty._id]);

  const buildCleanProperty = () => ({
    propertyName:    property.propertyName || property.projectName || "",
    type:            property.propertyType || "Residential",
    propertySubType: property.propertySubType || "",
    area:            property.area || property.locality || "",
    city:            property.city || "Dubai",
    country:         property.country || "UAE",
    price:           property.price || property.price_min || 0,
    price_min:       property.price_min || property.price || 0,
    price_max:       property.price_max || 0,
    bedrooms:        property.bedrooms || 0,
    bathrooms:       property.bathrooms || 0,
    builtUpArea:     property.builtUpArea || 0,
    floors:          property.floors || property.numberOfFloors || 0,
    furnishingStatus:   property.furnishingStatus || "",
    parkingAllocation:  property.parkingAllocation || "",
    mainLogo:        property.mainLogo || property.media?.mainLogo || "",
    photos:          getAllPhotos(property),
    developer:       property.developerName || "",
    developerDetails: (() => {
      const dev = property.developerDetails || property.developer || {};
      return {
        name:        dev.name || property.developerName || "",
        logo:        dev.logo || "",
        description: dev.description || "",
        email:       dev.email || "",
        phone:       dev.phone || dev.phone_number || "",
      };
    })(),
    completionDate:      property.completionDate || "",
    constructionProgress: property.constructionProgress || 0,
    serviceCharge:       property.serviceCharge || "",
    totalUnits:          property.totalUnits || 0,
    description:         property.description || property.overview || "",
    locality:            property.locality || property.area || "",
    location:            property.location || {},
    amenities:           Array.isArray(property.amenities)
      ? property.amenities.map(getLabel).filter(Boolean) : [],
    paymentPlan: (() => {
      const pp = property.paymentPlan;
      if (!Array.isArray(pp) || pp.length === 0) return [];
      const flat = [];
      pp.forEach((plan) => {
        if (Array.isArray(plan.stages)) {
          plan.stages.forEach((s) =>
            flat.push({
              milestone:   s.milestoneTitle || s.title || s.stage || "",
              percentage:  s.percentage || 0,
              description: s.description || "",
            })
          );
        }
      });
      return flat;
    })(),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res  = await apiService.post("/presentation/generate-narrative", {
        property: buildCleanProperty(), clientNotes, settings,
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { setNarrative(data.data); setStep(2); }
      else message.error(data?.message || "Generation failed");
    } catch (e) {
      message.error(e?.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await apiService.post("/presentation/save", {
        propertyId: property._id, property: buildCleanProperty(),
        narrative, settings, clientNotes, agentProfile: {},
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        setTrackingUrl(data.data.trackingUrl);
        setPreviewUrl(data.data.trackingUrl + "?preview=true");
        setStep(3);
        message.success("Presentation saved!");
      } else {
        message.error(data?.message || "Save failed");
      }
    } catch (e) {
      message.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const waMessage = encodeURIComponent(
    `Hi! 👋\n\nPlease find the property presentation for *${property?.propertyName}* here:\n${trackingUrl}\n\n_Powered by Xoto GRID_`
  );

  const toggleSection = (key) =>
    setSettings((p) => ({ ...p, sections: { ...p.sections, [key]: !p.sections[key] } }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1050,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      background: "rgba(0,0,0,0.55)",
    }}>
      <div style={{
        background: "#fff", width: "100%", maxWidth: 640, maxHeight: "92vh",
        display: "flex", flexDirection: "column",
        borderRadius: "24px 24px 0 0", overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ background: GR, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>AI Presentation Generator</h3>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              {step === 1 ? "Customize your presentation" : step === 2 ? "Review AI-generated content" : "Share with your client"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ width: 8, height: 8, borderRadius: "50%", background: step >= s ? "#fff" : "rgba(255,255,255,0.3)" }} />
              ))}
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Step 1 – Customize */}
        {step === 1 && (
          <div style={{ overflowY: "auto", flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            {propertyLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <FiLoader size={13} style={{ color: "#3b82f6" }} />
                <p style={{ margin: 0, fontSize: 12, color: "#1d4ed8" }}>Loading full property data…</p>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, background: "#f3e8ff", border: "1px solid #ede9fe" }}>
              {property.mainLogo
                ? <img src={property.mainLogo} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} alt="" />
                : <div style={{ width: 48, height: 48, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FiHome size={18} color={P} /></div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{property.propertyName || property.projectName}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{[property.area || property.locality, property.city].filter(Boolean).join(", ")}</p>
              </div>
            </div>

            {/* Client Details */}
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Client Details</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Client Name</label>
                  <input value={clientNotes.clientName} onChange={(e) => setClientNotes((p) => ({ ...p, clientName: e.target.value }))} placeholder="Ahmed Ali"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Budget</label>
                    <input value={clientNotes.budget} onChange={(e) => setClientNotes((p) => ({ ...p, budget: e.target.value }))} placeholder="AED 1,500,000"
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Key Requirement</label>
                    <input value={clientNotes.requirements} onChange={(e) => setClientNotes((p) => ({ ...p, requirements: e.target.value }))} placeholder="Sea view, 2BR..."
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Presentation Settings</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Language", key: "language", options: ["English", "Arabic", "Hindi", "Urdu", "Russian"] },
                  { label: "Currency", key: "currency", options: ["AED", "USD", "GBP", "EUR", "INR"] },
                  { label: "Area Unit", key: "areaUnit",  options: ["sqft", "sqm"] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 4 }}>{label}</label>
                    <select value={settings[key]} onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fafafa" }}>
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>Tone</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["professional", "luxury", "friendly"].map((tone) => (
                    <button key={tone} onClick={() => setSettings((p) => ({ ...p, tone }))}
                      style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 12, fontWeight: 700, textTransform: "capitalize", cursor: "pointer", border: settings.tone === tone ? `1px solid ${P}` : "1px solid #e2e8f0", background: settings.tone === tone ? "#f3e8ff" : "#fff", color: settings.tone === tone ? P : "#64748b" }}>
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sections */}
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Include Sections</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {Object.entries({
                  cover: "Cover Slide", projectDescription: "Project Description", developer: "Developer Info",
                  unitPrices: "Unit Prices", paymentPlan: "Payment Plan", location: "Location & Map",
                  gallery: "Photo Gallery", keyHighlights: "Key Highlights",
                }).map(([key, label]) => (
                  <button key={key} onClick={() => toggleSection(key)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, border: settings.sections[key] ? `1px solid ${P2}` : "1px solid #e2e8f0", background: settings.sections[key] ? "#f3e8ff" : "#fafafa", cursor: "pointer", fontSize: 12, fontWeight: 600, color: settings.sections[key] ? P : "#64748b", textAlign: "left" }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: settings.sections[key] ? P : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {settings.sections[key] && <FiCheckCircle size={10} color="#fff" />}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 – Review */}
        {step === 2 && narrative && (
          <div style={{ overflowY: "auto", flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <FiCheckCircle size={14} color="#16a34a" />
              <p style={{ margin: 0, fontSize: 12, color: "#15803d", fontWeight: 600 }}>AI narrative generated — review and edit if needed</p>
            </div>
            {[
              { label: "Property Overview",     field: "propertyOverview",  rows: 3 },
              { label: "Location & Community",  field: "locationCommunity", rows: 2 },
              { label: "Next Steps (CTA)",       field: "nextSteps",        rows: 2 },
            ].map(({ label, field, rows }) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</label>
                <textarea rows={rows} value={narrative[field] || ""} onChange={(e) => setNarrative((p) => ({ ...p, [field]: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#fafafa", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
            ))}
            {Array.isArray(narrative.keyHighlights) && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Key Highlights</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {narrative.keyHighlights.map((h, i) => (
                    <input key={i} value={h} onChange={(e) => {
                      const updated = [...narrative.keyHighlights];
                      updated[i] = e.target.value;
                      setNarrative((p) => ({ ...p, keyHighlights: updated }));
                    }} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", background: "#fafafa", boxSizing: "border-box" }} />
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setStep(1)} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: P, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <FiEdit3 size={11} /> Back to customize
            </button>
          </div>
        )}

        {/* Step 3 – Share */}
        {step === 3 && (
          <div style={{ overflowY: "auto", flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <FiCheckCircle size={20} color="#16a34a" />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#15803d" }}>Presentation ready!</p>
                <p style={{ margin: 0, fontSize: 12, color: "#16a34a" }}>Share the tracked link with your client</p>
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: P, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>🔗 Client Link (Tracked)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input readOnly value={trackingUrl} style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: `1px solid ${P2}`, background: "#f3e8ff", fontSize: 13, color: P, fontWeight: 600, outline: "none" }} />
                <button onClick={() => { navigator.clipboard.writeText(trackingUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${copied ? "#bbf7d0" : P2}`, background: copied ? "#f0fdf4" : "#f3e8ff", cursor: "pointer", fontSize: 14, fontWeight: 700, color: copied ? "#16a34a" : P, flexShrink: 0 }}>
                  {copied ? "✓" : <FiCopy size={14} />}
                </button>
              </div>
            </div>
            {previewUrl && (
              <a href={previewUrl} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fafafa", fontSize: 14, color: "#374151", textDecoration: "none", fontWeight: 600 }}>
                <FiEye size={13} /> Open Preview (Not Tracked)
              </a>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <a href={`https://wa.me/?text=${waMessage}`} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#fff", background: "#25D366", textDecoration: "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href={`mailto:?subject=Property Presentation — ${property?.propertyName}&body=${waMessage}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#374151", border: "1px solid #e2e8f0", background: "#fff", textDecoration: "none" }}>
                <FiMail size={15} /> Email
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
          <Btn variant="ghost" onClick={onClose}>{step === 3 ? "Close" : "Cancel"}</Btn>
          <div style={{ display: "flex", gap: 8 }}>
            {step === 2 && <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>}
            {step === 1 && <Btn onClick={handleGenerate} loading={generating} disabled={propertyLoading}>Generate with AI →</Btn>}
            {step === 2 && <Btn onClick={handleSave} loading={saving}><FiCheckCircle size={14} /> Save & Get Link →</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LEAD CREATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════
const LeadCreationModal = ({ property, visible, onClose, onSuccess }) => {
  const [form]           = Form.useForm();
  const [submitting,     setSubmitting]    = useState(false);
  const [inventoryUnits, setInventoryUnits] = useState([]);
  const [loadingUnits,   setLoadingUnits]  = useState(false);

  useEffect(() => {
    if (!visible || !property) return;
    if (property.propertySubType === "off_plan" || property.inventory?.length) {
      setLoadingUnits(true);
      apiService.get(`/properties/inventory?propertyId=${property._id || property.id}`)
        .then((res) => setInventoryUnits(Array.isArray(res?.data?.data) ? res.data.data : []))
        .catch(() => setInventoryUnits([]))
        .finally(() => setLoadingUnits(false));
    } else {
      setInventoryUnits([]);
    }
  }, [visible, property]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        first_name:        values.first_name || "",
        last_name:         values.last_name  || "",
        phone_number:      values.phone_number || "",
        country_code:      values.country_code || "+971",
        email:             values.email || "",
        listing_id:        property._id || property.id,
        inventory_unit_id: values.inventory_unit_id || "",
        transaction_type:  property.propertySubType === "rental" ? "rent" : "buy",
        enquiry_type:      property.propertySubType === "rental" ? "rent" : "buy",
        additional_notes:  values.additional_notes || `Enquired about ${property.propertyName}`,
      };
      const res    = await apiService.post("/gridlead/agent/create-lead", payload);
      const result = res?.data?.success !== undefined ? res.data : res;
      if (result?.success) {
        message.success("Lead created and property linked!");
        form.resetFields();
        onSuccess?.();
        onClose();
      } else {
        message.error(result?.message || "Could not create lead");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Create Lead & Link Property"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={580}
      centered
      destroyOnClose
    >
      <div style={{ marginBottom: 16, padding: 12, background: "#f9f5ff", borderRadius: 10, border: "1px solid #ede9fe" }}>
        <Text strong style={{ color: P }}>{property?.propertyName || property?.projectName}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>will be automatically linked to this new lead.</Text>
      </div>
      <Form form={form} layout="vertical" requiredMark="optional" onFinish={handleSubmit} initialValues={{ country_code: "+971" }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="John" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="Smith" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Phone Number" required>
          <Input.Group compact>
            <Form.Item name="country_code" noStyle>
              <Select style={{ width: 90 }}>
                {["+971", "+91", "+1", "+44", "+966"].map((c) => (
                  <Select.Option key={c} value={c}>{c}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="phone_number" noStyle rules={[{ required: true, message: "Required" }]}>
              <Input style={{ width: "calc(100% - 90px)" }} placeholder="50 123 4567" />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item name="email" label="Email"
          rules={[{ required: true, message: "Required" }, { type: "email", message: "Invalid email" }]}>
          <Input placeholder="client@example.com" />
        </Form.Item>
        {inventoryUnits.length > 0 && (
          <Form.Item name="inventory_unit_id" label="Interested Unit (optional)">
            <Select placeholder="Select a unit" loading={loadingUnits} allowClear>
              {inventoryUnits.map((unit) => {
                const label = [
                  unit.unitNumber ? `Unit ${unit.unitNumber}` : null,
                  unit.bedrooms   ? `${unit.bedrooms}BR` : null,
                  unit.area       ? `${fmt(unit.area)} sqft` : null,
                  unit.price      ? `AED ${fmt(unit.price)}` : null,
                ].filter(Boolean).join(" | ");
                return <Select.Option key={unit._id || unit.id} value={unit._id || unit.id}>{label}</Select.Option>;
              })}
            </Select>
          </Form.Item>
        )}
        <Form.Item name="additional_notes" label="Private Notes">
          <Input.TextArea rows={2} placeholder="Any special remarks..." />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button onClick={onClose} style={{ borderRadius: 10 }}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting}
            style={{ borderRadius: 10, background: P, borderColor: P }}>
            Create Lead
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AgentProjectDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [property,         setProperty]        = useState(null);
  const [loading,          setLoading]         = useState(true);
  const [inventoryCounts,  setInventoryCounts]  = useState({ total: 0, available: 0, reserved: 0, booked: 0, sold: 0 });
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoTab,         setPhotoTab]        = useState("all");
  const [allPhotos,        setAllPhotos]       = useState([]);
  const [documents,        setDocuments]       = useState([]);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showLeadModal,    setShowLeadModal]   = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
    fetchDocuments();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res  = await apiService.get(`/properties/${id}`);
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setProperty(data);
        setAllPhotos(getAllPhotos(data));
        if (data.propertySubType === "off_plan") await fetchInventoryUnits(data._id || id);
      } else {
        message.error("Failed to load property details");
      }
    } catch {
      message.error("API error while fetching property");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await apiService.get(`/property-documents/${id}`);
      setDocuments(res?.data?.data || res?.data || []);
    } catch { /* silent */ }
  };

  const fetchInventoryUnits = async (propertyId) => {
    try {
      const res  = await apiService.get(`properties/inventory?propertyId=${propertyId}`);
      const raw  = res?.data?.data || res?.data || res;
      const data = Array.isArray(raw) ? raw : [];
      setInventoryCounts({
        total:     data.length,
        available: data.filter((u) => u.status === "available").length,
        reserved:  data.filter((u) => u.status === "reserved").length,
        booked:    data.filter((u) => u.status === "booked").length,
        sold:      data.filter((u) => u.status === "sold").length,
      });
    } catch { /* silent */ }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
      <Spin size="large" />
    </div>
  );
  if (!property) return (
    <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", minHeight: "100vh" }}>
      <Title level={4}>Project not found!</Title>
      <Button type="primary" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  // ── Derived values ──────────────────────────────────────────────────────────
  const projectName   = property.projectName || property.propertyName || "Project";
  const developerName = property?.developer?.name || property?.developerDetails?.name || property?.developerName || "";
  const developerLogo = property?.developer?.logo || property?.developerDetails?.logo;
  const developerDesc = property?.developerDetails?.description || property?.developer?.description || "";
  const fullAddress   = [property.locality || property.area, property.city || "Dubai", property.country || "UAE"].filter(Boolean).join(", ");

  const priceMin = property.priceRange?.min || property.price || property.price_min || 0;
  const priceMax = property.priceRange?.max || property.price_max || 0;
  const currency = property.priceRange?.currency || property.currency || "AED";
  const priceDisplay = priceMax && priceMax !== priceMin
    ? `${currency} ${fmt(priceMin)} – ${fmt(priceMax)}`
    : `${currency} ${fmt(priceMin)}`;

  const completionDisplay = property.completionDate?.quarter && property.completionDate?.year
    ? `${property.completionDate.quarter} ${property.completionDate.year}`
    : typeof property.completionDate === "string" ? property.completionDate : null;

  const constructionPct = Number(property.constructionProgress) || 0;
  const paymentStages   = property.paymentPlan?.[0]?.stages?.filter(Boolean) || [];

  const getPaymentPlanSummary = () => {
    if (paymentStages.length > 0)
      return paymentStages.map((s) => `${s.percentage ?? 0}% ${(s.milestoneTitle || s.title || s.stage || "").replace(/_/g, " ")}`.trim()).join(" • ");
    if (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage)
      return `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%`;
    return null;
  };

  const getCommissionText = () => {
    if (property.shareCommission && property.shareCommissionPercentage) return `${property.shareCommissionPercentage}% Shared`;
    if (property.commission) return `${property.commission}%`;
    if (property.commissionType)
      return property.commissionType === "percentage"
        ? `${property.commissionValue || 0}%`
        : `${currency} ${fmt(property.commissionValue || 0)}`;
    return null;
  };

  const getStatusTag = () => {
    if (property.propertySubType === "off_plan")
      return <span style={{ background: "#f3e8ff", color: "#6d28d9", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1px solid #ede9fe" }}>🏗️ Off-Plan</span>;
    if (property.approvalStatus === "approved" && property.listingStatus === "active")
      return <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1px solid #bbf7d0" }}>✓ Active</span>;
    return <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: "1px solid #e2e8f0" }}>Draft</span>;
  };

  const displayFeatures = [...new Set(
    [...getFeatureList(property.amenities), ...getFeatureList(property.facilities)]
      .map(getLabel)
      .filter(Boolean)
  )];

  const lat      = property?.location?.latitude;
  const lng      = property?.location?.longitude;
  const mapQuery = lat && lng ? `${lat},${lng}` : encodeURIComponent(`${projectName} ${fullAddress}`);
  const mapSrc   = `https://maps.google.com/maps?q=${mapQuery}&t=m&z=15&ie=UTF8&iwloc=&output=embed`;

  const mediaCategories = {
    all:          getAllPhotos(property),
    architecture: (property.media?.architectureImages || []).filter(Boolean),
    interior:     (property.media?.interiorImages     || []).filter(Boolean),
    lobby:        (property.media?.lobbyImages        || []).filter(Boolean),
  };
  const galleryPhotos = mediaCategories[photoTab]?.length > 0 ? mediaCategories[photoTab] : mediaCategories.all;

  const qrContent = (
    <div style={{ padding: 8, textAlign: "center", width: 192 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Dubai REST Verification</div>
      {property.qrCode || property.qr_code ? (
        <div style={{ border: "1px solid #f1f5f9", padding: 8, borderRadius: 12, background: "#f8fafc" }}>
          <img src={property.qrCode || property.qr_code} alt="DLD QR Code" style={{ width: "100%", height: "auto", borderRadius: 8 }} />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#f97316", fontWeight: 600, padding: "16px 0", background: "#fff7ed", borderRadius: 12, border: "1px solid #fed7aa" }}>QR Code Unavailable</div>
      )}
      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>Scan using Dubai REST app to verify authenticity.</div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: 80 }}>

      {/* AI Presentation Modal */}
      {showPresentation && property && (
        <PresentationModal property={property} onClose={() => setShowPresentation(false)} />
      )}

      {/* Lead Modal */}
      <LeadCreationModal
        property={property}
        visible={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSuccess={() => message.success("Lead created and linked to this property!")}
      />

      {/* Top Bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 8px rgba(0,0,0,0.04)", padding: "14px 32px", marginBottom: 32 }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#374151", background: "none", border: "none", cursor: "pointer" }}>
          <ArrowLeftOutlined /> Back to Catalogue
        </button>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
        <Row gutter={[40, 40]}>

          {/* ══════ LEFT COLUMN ══════ */}
          <Col xs={24} lg={16}>

            {/* ── Hero ── */}
            <div style={{ position: "relative", height: 480, borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", marginBottom: 40, background: "#e2e8f0" }}>
              <img
                src={allPhotos[0]}
                alt={projectName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)" }} />

              {/* Top badges */}
              <div style={{ position: "absolute", top: 24, left: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {getStatusTag()}
                {completionDisplay && (
                  <span style={{ background: "rgba(255,255,255,0.9)", color: "#1e293b", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                    Handover: {completionDisplay}
                  </span>
                )}
                {(property.trakheesiPermitId || property.trakheesi_permit_id) && (
                  <span style={{ background: "#22c55e", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                    <SafetyCertificateOutlined /> Trakheesi: {property.trakheesiPermitId || property.trakheesi_permit_id}
                  </span>
                )}
              </div>

              {/* Bottom left buttons */}
              <div style={{ position: "absolute", bottom: 24, left: 24, display: "flex", gap: 10 }}>
                <button onClick={() => setIsPhotoModalOpen(true)}
                  style={{ background: "rgba(255,255,255,0.9)", color: "#1e293b", border: "none", borderRadius: 14, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <PictureOutlined /> {allPhotos.length} Photos
                </button>
                {property.brochure && (
                  <a href={property.brochure} target="_blank" rel="noreferrer"
                    style={{ background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 14, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(255,255,255,0.2)" }}>
                    <FilePdfOutlined /> Brochure
                  </a>
                )}
              </div>

              {/* DLD QR button */}
              <div style={{ position: "absolute", bottom: 24, right: 24 }}>
                <Popover content={qrContent} placement="topRight" trigger="hover" overlayInnerStyle={{ borderRadius: 16 }}>
                  <button style={{ background: "#fff", color: P, border: "none", borderRadius: 14, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    <QrcodeOutlined /> Verify Listing
                  </button>
                </Popover>
              </div>
            </div>

            {/* ── Overview ── */}
            <div style={{ marginBottom: 32 }}>
              <SectionTitle icon={InfoCircleOutlined}>Project Overview</SectionTitle>
              <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: "#4b5563", fontWeight: 500 }}>
                {property.description || property.overview || "Detailed description for this property is not available yet."}
              </Paragraph>
            </div>

            <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />

            {/* ── Property Details ── */}
            <div style={{ marginBottom: 32 }}>
              <SectionTitle icon={HomeOutlined}>Property Details</SectionTitle>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "4px 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <InfoRow label="Property Type"    value={property.propertyType}                                   icon={AppstoreOutlined} />
                  <InfoRow label="Sub Type"         value={property.propertySubType?.replace(/_/g, " ")?.toUpperCase()} icon={BuildOutlined} />
                  <InfoRow label="Locality"         value={property.locality || property.area}                     icon={EnvironmentOutlined} />
                  {completionDisplay && <InfoRow label="Completion Date" value={completionDisplay}                 icon={ScheduleOutlined} />}
                  {property.numberOfFloors  && <InfoRow label="Floors"          value={property.numberOfFloors}    icon={ApartmentOutlined} />}
                  {property.furnishingStatus && <InfoRow label="Furnishing"     value={property.furnishingStatus}  icon={HomeOutlined} />}
                  {property.parkingAllocation && <InfoRow label="Parking"       value={property.parkingAllocation} icon={CarOutlined} />}
                  {property.serviceCharge    && <InfoRow label="Service Charge" value={`AED ${fmt(property.serviceCharge)} / sqft / yr`} icon={ToolOutlined} />}
                </div>
              </div>
            </div>

            {/* ── Construction Progress ── */}
            {property.propertySubType === "off_plan" && constructionPct > 0 && (
              <>
                <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />
                <div style={{ marginBottom: 32 }}>
                  <SectionTitle icon={BuildOutlined}>Construction Progress</SectionTitle>
                  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>Overall Completion</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: P }}>{constructionPct}%</span>
                    </div>
                    <Progress percent={constructionPct} strokeColor={{ from: P, to: P2 }} trailColor="#f1f5f9" strokeWidth={12} showInfo={false} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Foundation</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Handover</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Inventory ── */}
            {property.propertySubType === "off_plan" && (
              <>
                <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />
                <div style={{ marginBottom: 32 }}>
                  <SectionTitle icon={ApartmentOutlined}>Inventory Availability</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Total",     value: inventoryCounts.total,     bg: "#f8fafc", color: "#1e293b" },
                      { label: "Available", value: inventoryCounts.available, bg: "#f0fdf4", color: "#15803d" },
                      { label: "Reserved",  value: inventoryCounts.reserved,  bg: "#fffbeb", color: "#b45309" },
                      { label: "Booked",    value: inventoryCounts.booked,    bg: "#eff6ff", color: "#1d4ed8" },
                      { label: "Sold",      value: inventoryCounts.sold,      bg: "#fef2f2", color: "#b91c1c" },
                    ].map(({ label, value, bg, color }) => (
                      <div key={label} style={{ background: bg, borderRadius: 16, padding: "16px 8px", textAlign: "center", border: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {property.buildings?.length > 0 && (
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", padding: 16 }}>
                      <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Buildings / Towers</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {property.buildings.map((b, i) => {
                          const name  = typeof b === "string" ? b : b?.name || b?.title || `Tower ${i + 1}`;
                          const units = typeof b === "object" ? b?.units || b?.totalUnits : null;
                          return (
                            <div key={i} style={{ background: "#f3e8ff", border: "1px solid #ede9fe", borderRadius: 12, padding: "8px 14px", fontSize: 13, fontWeight: 700, color: "#6d28d9" }}>
                              {name}{units ? <span style={{ color: "#a78bfa", fontWeight: 500, marginLeft: 4 }}>({units} units)</span> : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Payment Plan ── */}
            {paymentStages.length > 0 && (
              <>
                <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />
                <div style={{ marginBottom: 32 }}>
                  <SectionTitle icon={WalletOutlined}>Payment Plan</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {paymentStages.map((stage, i) => (
                      <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: GR, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1e293b", textTransform: "capitalize" }}>
                            {stage.milestoneTitle || stage.title || (typeof stage.stage === "string" ? stage.stage : "") || `Stage ${i + 1}`}
                          </p>
                          {stage.description && typeof stage.description === "string" && (
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{stage.description}</p>
                          )}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: P, flexShrink: 0 }}>{stage.percentage ?? 0}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Amenities ── */}
            {displayFeatures.length > 0 && (
              <>
                <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />
                <div style={{ marginBottom: 32 }}>
                  <SectionTitle icon={StarOutlined}>Amenities & Facilities</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {displayFeatures.map((item, i) => (
                      <div key={i} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", color: P, flexShrink: 0 }}>
                          <CheckCircleOutlined />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Floor Plans ── */}
            {property.floorPlans?.length > 0 && (
              <>
                <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />
                <div style={{ marginBottom: 32 }}>
                  <SectionTitle icon={AppstoreOutlined}>Floor Plans</SectionTitle>
                  <Image.PreviewGroup>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                      {property.floorPlans.map((fp, i) => (
                        <div key={i} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                          <Image
                            src={fp?.imageUrl || fp?.url || fp}
                            alt={fp?.label || `Floor Plan ${i + 1}`}
                            style={{ height: 180, objectFit: "contain", width: "100%" }}
                            fallback="https://placehold.co/400x300?text=Floor+Plan"
                          />
                          {fp?.label && (
                            <div style={{ padding: "8px 12px", background: "#fff", borderTop: "1px solid #f1f5f9" }}>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#374151" }}>{fp.label}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Image.PreviewGroup>
                </div>
              </>
            )}

            {/* ── Developer Details ── */}
            {developerName && (
              <>
                <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />
                <div style={{ marginBottom: 32 }}>
                  <SectionTitle icon={BankOutlined}>Developer Details</SectionTitle>
                  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: developerDesc ? 16 : 0 }}>
                      {developerLogo ? (
                        <img src={developerLogo} alt={developerName} style={{ width: 64, height: 64, borderRadius: 16, objectFit: "contain", border: "1px solid #f1f5f9", padding: 4, background: "#f8fafc" }} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: GR, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 900 }}>
                          {developerName?.[0] || "D"}
                        </div>
                      )}
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1e293b" }}>{developerName}</h3>
                        {property?.developerDetails?.established && (
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b", fontWeight: 600 }}>Est. {property.developerDetails.established}</p>
                        )}
                      </div>
                    </div>
                    {developerDesc && <p style={{ margin: 0, fontSize: 14, color: "#4b5563", lineHeight: 1.7 }}>{developerDesc}</p>}
                  </div>
                </div>
              </>
            )}

            <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />

            {/* ── Document Library ── */}
            <div style={{ marginBottom: 32 }}>
              <SectionTitle icon={FilePdfOutlined}>Document Library</SectionTitle>
              {documents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9" }}>
                  <FilePdfOutlined style={{ fontSize: 40, color: "#e2e8f0", display: "block", marginBottom: 12 }} />
                  <p style={{ margin: 0, color: "#94a3b8", fontWeight: 600 }}>No documents available for this property</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {documents.map((doc) => (
                    <div key={doc._id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {doc.fileType === "image"
                          ? <PictureOutlined style={{ fontSize: 20, color: P }} />
                          : <FilePdfOutlined style={{ fontSize: 20, color: "#dc2626" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</p>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#f3e8ff", color: CAT_COLORS[doc.documentCategory] || "#475569", fontWeight: 600, display: "inline-block", marginTop: 4 }}>
                          {CATEGORY_LABELS[doc.documentCategory] || doc.documentCategory}
                        </span>
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                        style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", textDecoration: "none", flexShrink: 0 }}>
                        <FiDownload size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Divider style={{ margin: "24px 0", borderColor: "#f1f5f9" }} />

            {/* ── Location Map ── */}
            <div style={{ marginBottom: 16 }}>
              <SectionTitle icon={EnvironmentOutlined}>Location</SectionTitle>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: "10px 14px", width: "fit-content" }}>
                <FiMapPin size={14} color={P} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{fullAddress}</span>
              </div>
              {property.projectPlan && (
                <a href={property.projectPlan} target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, marginBottom: 14, padding: "8px 14px", borderRadius: 12, border: `1px solid ${P2}`, color: P, background: "#f3e8ff", textDecoration: "none" }}>
                  <PaperClipOutlined /> View Site Plan
                </a>
              )}
              <div style={{ width: "100%", height: 360, borderRadius: 20, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen title="Location Map" src={mapSrc} />
              </div>
            </div>

          </Col>

          {/* ══════ RIGHT COLUMN ══════ */}
          <Col xs={24} lg={8}>
            <div style={{ position: "sticky", top: 112 }}>

              {/* Price Card */}
              <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #f1f5f9", boxShadow: "0 8px 30px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: 16 }}>
                <div style={{ padding: 24, borderBottom: "1px solid #f8fafc" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Project</p>
                  <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: "#1e293b", lineHeight: 1.3 }}>{projectName}</h1>
                  <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                    <FiMapPin size={12} /> {[property.locality || property.area, property.city].filter(Boolean).join(", ")}
                  </p>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {priceMax && priceMax !== priceMin ? "Price Range" : "Starting Price"}
                  </p>
                  <div style={{ fontSize: 26, fontWeight: 900, color: P }}>{priceDisplay}</div>
                </div>

                <div style={{ padding: "16px 24px", background: "#fafafa", display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { icon: BankOutlined,        label: "Developer",    value: developerName,         color: null },
                    { icon: HomeOutlined,         label: "Type",         value: property.propertyType, color: null },
                    { icon: ScheduleOutlined,     label: "Handover",     value: completionDisplay,     color: null },
                    { icon: WalletOutlined,       label: "Payment Plan", value: getPaymentPlanSummary(), color: null },
                    { icon: MoneyCollectOutlined, label: "Commission",   value: getCommissionText(),   color: "#16a34a" },
                  ].filter((r) => r.value).map(({ icon: Icon, label, value, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: color ? "#f0fdf4" : "#fff", border: `1px solid ${color ? "#bbf7d0" : "#f1f5f9"}`, display: "flex", alignItems: "center", justifyContent: "center", color: color || "#64748b", flexShrink: 0 }}>
                        <Icon />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: color ? "#16a34a" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 800, color: color || "#1e293b" }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <button onClick={() => setShowPresentation(true)}
                  style={{ width: "100%", height: 52, borderRadius: 16, border: "none", background: GR, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <ThunderboltOutlined /> Generate AI Presentation
                </button>
                <button onClick={() => setShowLeadModal(true)}
                  style={{ width: "100%", height: 52, borderRadius: 16, border: `1px solid ${P}`, background: "#fff", color: P, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <UserOutlined /> Add Lead
                </button>
              </div>

              {/* Compliance Card */}
              {(property.trakheesiPermitId || property.trakheesi_permit_id || property.qrCode) && (
                <div style={{ background: "#f0fdf4", borderRadius: 16, border: "1px solid #bbf7d0", padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <SafetyCertificateOutlined style={{ color: "#16a34a", fontSize: 16 }} />
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#15803d" }}>Regulatory Compliance</p>
                  </div>
                  {(property.trakheesiPermitId || property.trakheesi_permit_id) && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Trakheesi Permit ID</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#14532d", fontFamily: "monospace" }}>{property.trakheesiPermitId || property.trakheesi_permit_id}</p>
                    </div>
                  )}
                  {property.qrCode && (
                    <div>
                      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>DLD QR Code</p>
                      <div style={{ background: "#fff", borderRadius: 12, padding: 8, border: "1px solid #bbf7d0", width: 88 }}>
                        <img src={property.qrCode} alt="DLD QR" style={{ width: "100%", height: "auto" }} />
                      </div>
                      <p style={{ margin: "6px 0 0", fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Scan via Dubai REST app</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </Col>
        </Row>
      </div>

      {/* ── Gallery Modal ── */}
      <Modal
        title={<span style={{ fontSize: 18, fontWeight: 800 }}>Property Gallery</span>}
        open={isPhotoModalOpen}
        onCancel={() => setIsPhotoModalOpen(false)}
        footer={null}
        width={1000}
        centered
        styles={{ body: { padding: "16px 24px" } }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {Object.entries({ all: "All", architecture: "Architecture", interior: "Interior", lobby: "Lobby" }).map(([key, label]) => {
            const count = mediaCategories[key]?.length || 0;
            if (key !== "all" && count === 0) return null;
            return (
              <button key={key} onClick={() => setPhotoTab(key)}
                style={{ padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1px solid", borderColor: photoTab === key ? "transparent" : "#e2e8f0", background: photoTab === key ? GR : "#fff", color: photoTab === key ? "#fff" : "#374151" }}>
                {label}{key !== "all" && count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
        <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
          <Image.PreviewGroup>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {galleryPhotos.map((photo, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f1f5f9", height: 140, background: "#f8fafc" }}>
                  <Image src={photo} alt={`Photo ${i + 1}`} style={{ height: 140, objectFit: "cover", width: "100%" }}
                    fallback="https://placehold.co/600x400?text=Unavailable" />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      </Modal>

    </div>
  );
}
