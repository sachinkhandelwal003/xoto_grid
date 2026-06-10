import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Typography, Button, Tag, Spin, message,
  Divider, Avatar, Space, Modal, Image, Select, Checkbox,
  Input, Alert, Form, Popover,
} from "antd";
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  TagOutlined, WalletOutlined, BankOutlined,
  ShareAltOutlined, MessageOutlined, AppstoreOutlined,
  ArrowLeftOutlined, EditOutlined, RobotOutlined, MoneyCollectOutlined,
  EyeOutlined, DownloadOutlined, HomeOutlined, BuildOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  UnorderedListOutlined, ThunderboltOutlined, FileTextOutlined,
  UserOutlined, QrcodeOutlined, SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  FiX, FiLoader, FiCheckCircle, FiHome, FiMapPin, FiEdit3,
  FiMail, FiCopy, FiEye,
} from "react-icons/fi";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

const { Title, Text, Paragraph } = Typography;

// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────
const P  = "#4A027C";
const P2 = "#7C3AED";
const PRIMARY = "#5c039b";
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─────────────────────────────────────────────
// TRANSLATION HOOK
// ─────────────────────────────────────────────
const translateText = async (text, targetLang) => {
  if (targetLang === "EN" || targetLang === "English") return text;
  try {
    const response = await apiService.post("aiii/translate", { text, targetLang });
    if (response.data?.success && response.data?.translatedText)
      return response.data.translatedText;
    return text;
  } catch {
    return text;
  }
};

const useTranslation = () => {
  const [translations, setTranslations] = useState({
    EN: {
      lookWhatWeFound: "Look what we found for you",
      developer: "Developer",
      aboutProject: "ABOUT THE PROJECT",
      priceFrom: "Price from",
      paymentPlan: "Payment Plan",
      location: "Location description and benefits",
      amenities: "Features & Amenities",
      theVisionaryBehind: "The Visionary Behind",
      luxuryLiving: "Luxury Living",
      typicalUnits: "Typical Units",
      pricingAvailability: "Project general facts",
      primeLocation: "PRIME LOCATION",
      unitType: "Unit type",
      bedrooms: "Bedrooms",
      amount: "Amount",
      area: "Area, sqft",
      priceFromTable: "Price from",
      onBooking: "On booking",
      duringConstruction: "During construction",
      uponHandover: "Upon Handover",
      handover: "Handover",
      paymentPlanOption: "Payment Plan Option",
      allOptions: "All options",
      dateOfCreation: "Date of creation",
      finishing: "Finishing and materials",
      architecture: "ARCHITECTURE",
      advisor: "XOTO Real Estate Advisor",
      availableUnits: "Available Units",
      unitDetails: "Unit Details",
      status: "Status",
      view: "View",
      parking: "Parking",
    },
  });
  const [currentLang, setCurrentLang] = useState("EN");
  const [isTranslating, setIsTranslating] = useState(false);

  const translateAll = async (langCode) => {
    if (langCode === "EN") { setCurrentLang("EN"); return; }
    if (translations[langCode]) { setCurrentLang(langCode); return; }
    setIsTranslating(true);
    try {
      const translated = {};
      for (const [key, value] of Object.entries(translations.EN)) {
        translated[key] = await translateText(value, langCode);
      }
      setTranslations((prev) => ({ ...prev, [langCode]: translated }));
      setCurrentLang(langCode);
      message.success(`Content translated to ${langCode}`);
    } catch {
      message.error(`Translation failed. Using English.`);
    } finally {
      setIsTranslating(false);
    }
  };

  const t = (key) => translations[currentLang]?.[key] || translations.EN[key];
  return { t, translateAll, currentLang, isTranslating, translations };
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const getAllPhotos = (property) => {
  const photos = [];
  if (property?.photos) {
    if (Array.isArray(property.photos)) {
      photos.push(...property.photos);
    } else if (typeof property.photos === "object") {
      Object.values(property.photos).forEach((category) => {
        if (Array.isArray(category)) photos.push(...category);
      });
    }
  }
  if (property?.media) {
    ["architectureImages", "interiorImages", "lobbyImages", "otherImages"].forEach((key) => {
      if (Array.isArray(property.media[key]))
        photos.push(...property.media[key].filter(Boolean));
    });
  }
  if (property?.mainLogo && !photos.includes(property.mainLogo))
    photos.unshift(property.mainLogo);
  if (property?.media?.mainLogo && !photos.includes(property.media.mainLogo))
    photos.unshift(property.media.mainLogo);
  if (photos.length === 0)
    photos.push("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg");
  return [...new Set(photos)];
};

// ─────────────────────────────────────────────
// SHARED BUTTON COMPONENT
// ─────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", loading, disabled, size = "md", className = "" }) => {
  const base  = "flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3 text-sm" };
  const vars  = {
    primary: "text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
    ghost:   "border border-gray-200 text-gray-600 bg-white hover:bg-gray-50",
    danger:  "border border-red-200 text-red-600 bg-red-50 hover:bg-red-100",
    success: "text-white shadow-md hover:shadow-lg",
  };
  const bg = variant === "primary" ? GR : variant === "success" ? "linear-gradient(135deg,#059669,#10b981)" : "";
  return (
    <button
      className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}
      style={bg ? { background: bg } : {}}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <FiLoader size={14} className="animate-spin" /> : children}
    </button>
  );
};

// ─────────────────────────────────────────────
// AI PRESENTATION MODAL
// ─────────────────────────────────────────────
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

  useEffect(() => {
    if (!initialProperty?._id) return;
    setPropertyLoading(true);
    apiService
      .get(`/property/${initialProperty._id}`)
      .then((res) => {
        const data = res?.data?.data || res?.data;
        if (data) setProperty(data);
      })
      .catch(() => console.warn("Full property fetch failed, using partial data"))
      .finally(() => setPropertyLoading(false));
  }, [initialProperty._id]);

  const [settings, setSettings] = useState({
    language: "English",
    currency: "AED",
    areaUnit: "sqft",
    tone: "professional",
    sections: {
      cover:              true,
      projectDescription: true,
      developer:          true,
      unitPrices:         true,
      paymentPlan:        true,
      location:           true,
      gallery:            true,
      keyHighlights:      true,
    },
  });

  const [clientNotes, setClientNotes] = useState({
    clientName:   "",
    budget:       property?.price_min ? `AED ${Number(property.price_min).toLocaleString()}` : "",
    requirements: "",
  });

  const buildCleanProperty = () => ({
    propertyName:      property.propertyName || property.projectName || "",
    type:              property.propertyType || "Residential",
    propertySubType:   property.propertySubType || "",
    area:              property.area || property.locality || "",
    city:              property.city || "Dubai",
    country:           property.country || "UAE",
    price:             property.price     || property.price_min || 0,
    price_min:         property.price_min || property.price     || 0,
    price_max:         property.price_max || 0,
    bedrooms:          property.bedrooms  || 0,
    bathrooms:         property.bathrooms || 0,
    builtUpArea:       property.builtUpArea || 0,
    floors:            property.floors    || property.numberOfFloors || 0,
    furnishingStatus:  property.furnishingStatus || property.furnishing || "",
    ownershipType:     property.ownershipType || "",
    parkingAllocation: property.parkingAllocation || "",
    mainLogo:          property.mainLogo  || property.media?.mainLogo || "",
    photos: (() => {
      const allPhotos = [];
      const mainLogo = property.mainLogo || property.media?.mainLogo;
      if (mainLogo) allPhotos.push(mainLogo);
      const ph = property.photos;
      if (ph && typeof ph === "object" && !Array.isArray(ph)) {
        Object.values(ph).forEach((arr) => { if (Array.isArray(arr)) allPhotos.push(...arr.filter(Boolean)); });
      } else if (Array.isArray(ph)) {
        allPhotos.push(...ph.filter(Boolean));
      }
      const med = property.media;
      if (med && typeof med === "object") {
        ["architectureImages", "interiorImages", "lobbyImages", "otherImages"].forEach((key) => {
          if (Array.isArray(med[key])) allPhotos.push(...med[key].filter(Boolean));
        });
      }
      return [...new Set(allPhotos)];
    })(),
    developer:        property.developerName || "",
    developerDetails: (() => {
      const dev = property.developerDetails || property.developer || {};
      return {
        name:        dev.name        || property.developerName || "",
        logo:        dev.logo        || dev.mainLogo || "",
        description: dev.description || dev.overview || "",
        email:       dev.email       || "",
        phone:       dev.phone       || dev.phone_number || "",
        websiteUrl:  dev.websiteUrl  || "",
      };
    })(),
    completionDate:       property.completionDate       || "",
    projectStatus:        property.projectStatus        || "",
    developmentStatus:    property.developmentStatus    || "",
    constructionProgress: property.constructionProgress || 0,
    readinessProgress:    property.readinessProgress    || "",
    serviceCharge:        property.serviceCharge        || "",
    totalUnits:           property.totalUnits           || 0,
    description:          property.description          || property.overview || "",
    locality:             property.locality             || property.area || "",
    location:             property.location             || {},
    amenities:            Array.isArray(property.amenities) ? property.amenities : [],
    paymentPlan: (() => {
      const pp = property.paymentPlan;
      if (!pp || !Array.isArray(pp) || pp.length === 0) return [];
      const flat = [];
      pp.forEach((plan) => {
        if (plan.stages && Array.isArray(plan.stages)) {
          plan.stages.forEach((s) =>
            flat.push({ milestone: s.stage?.replace(/_/g, " ") || "", percentage: s.percentage || 0, description: s.description || "" })
          );
        }
      });
      return flat;
    })(),
    unitTypes: (() => {
      if (Array.isArray(property.inventory) && property.inventory.length > 0) {
        return property.inventory.map((inv) => ({
          type: inv.unitType || "", area: inv.sqft || inv.sqm || 0,
          price: property.price_min || property.price || 0, units: inv.units || 1,
        }));
      }
      if (Array.isArray(property.unitTypes) && property.unitTypes.length > 0)
        return property.unitTypes.map((t) => ({ type: t, area: 0, price: 0 }));
      return [];
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

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waMessage = encodeURIComponent(
    `Hi! 👋\n\nPlease find the property presentation for *${property?.propertyName}* here:\n${trackingUrl}\n\n_Powered by Xoto GRID_`
  );

  const toggleSection = (key) =>
    setSettings((p) => ({ ...p, sections: { ...p.sections, [key]: !p.sections[key] } }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
      <div className="bg-white w-full sm:rounded-3xl sm:max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">AI Presentation Generator</h3>
            <p className="text-xs text-white/70 mt-0.5">
              {step === 1 && "Customize your presentation"}
              {step === 2 && "Preview AI-generated content"}
              {step === 3 && "Share with your client"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`w-2 h-2 rounded-full transition-all ${step >= s ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Step 1: Customize */}
        {step === 1 && (
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {propertyLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <FiLoader size={13} className="animate-spin text-blue-500" />
                <p className="text-xs text-blue-600 font-medium">Loading full property data…</p>
              </div>
            )}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 border border-purple-100">
              {property.mainLogo
                ? <img src={property.mainLogo} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                : <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0"><FiHome size={18} style={{ color: P }} /></div>
              }
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{property.propertyName}</p>
                <p className="text-xs text-gray-500 truncate">{[property.area, property.city].filter(Boolean).join(", ")}</p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <p className="text-sm font-extrabold" style={{ color: P }}>
                  {(property.price || property.price_min) > 0 ? `AED ${Number(property.price || property.price_min).toLocaleString()}` : "On Request"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Client Details</p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1">Client Name</label>
                  <input value={clientNotes.clientName} onChange={(e) => setClientNotes((p) => ({ ...p, clientName: e.target.value }))} placeholder="Ahmed Ali"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">Budget</label>
                    <input value={clientNotes.budget} onChange={(e) => setClientNotes((p) => ({ ...p, budget: e.target.value }))} placeholder="AED 1,500,000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">Key Requirement</label>
                    <input value={clientNotes.requirements} onChange={(e) => setClientNotes((p) => ({ ...p, requirements: e.target.value }))} placeholder="Sea view, 2BR..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Presentation Settings</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Language", key: "language", options: ["English", "Arabic", "Hindi", "Urdu", "Russian"] },
                  { label: "Currency", key: "currency", options: ["AED", "USD", "GBP", "EUR", "INR"] },
                  { label: "Area Unit", key: "areaUnit", options: ["sqft", "sqm"] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">{label}</label>
                    <select value={settings[key]} onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none">
                      {options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-500 font-semibold mb-2">Tone</label>
                <div className="flex gap-2">
                  {["professional", "luxury", "friendly"].map((tone) => (
                    <button key={tone} onClick={() => setSettings((p) => ({ ...p, tone }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border capitalize transition-all ${settings.tone === tone ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-purple-300"}`}>
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Include Sections</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries({
                  cover: "Cover Slide", projectDescription: "Project Description", developer: "Developer Info",
                  unitPrices: "Unit Prices", paymentPlan: "Payment Plan", location: "Location & Map",
                  gallery: "Photo Gallery", keyHighlights: "Key Highlights",
                }).map(([key, label]) => (
                  <button key={key} onClick={() => toggleSection(key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all text-left ${settings.sections[key] ? "border-purple-300 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-400 bg-gray-50"}`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${settings.sections[key] ? "bg-purple-600" : "bg-gray-200"}`}>
                      {settings.sections[key] && <FiCheckCircle size={10} className="text-white" />}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Narrative Preview */}
        {step === 2 && narrative && (
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
              <FiCheckCircle size={15} className="text-green-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-green-700">AI narrative generated — review and edit if needed</p>
            </div>
            {[
              { label: "Property Overview", field: "propertyOverview", rows: 3 },
              { label: "Location & Community", field: "locationCommunity", rows: 2 },
              { label: "Next Steps (CTA)", field: "nextSteps", rows: 2 },
            ].map(({ label, field, rows }) => (
              <div key={field}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</label>
                <textarea rows={rows} value={narrative[field]} onChange={(e) => setNarrative((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Key Highlights</label>
              <div className="space-y-2">
                {(narrative.keyHighlights || []).map((h, i) => (
                  <input key={i} value={h} onChange={(e) => {
                    const updated = [...narrative.keyHighlights];
                    updated[i] = e.target.value;
                    setNarrative((p) => ({ ...p, keyHighlights: updated }));
                  }} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                ))}
              </div>
            </div>
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline">
              <FiEdit3 size={11} /> Back to customize
            </button>
          </div>
        )}

        {/* Step 3: Share */}
        {step === 3 && (
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
              <FiCheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">Presentation ready!</p>
                <p className="text-xs text-green-700 mt-0.5">Share the tracked link with your client</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">🔗 Client Link (Tracked)</label>
              <div className="flex gap-2">
                <input readOnly value={trackingUrl} className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-sm text-purple-700 font-medium outline-none" />
                <button onClick={handleCopy} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex-shrink-0 ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"}`}>
                  {copied ? "✓ Copied" : <FiCopy size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-purple-500 mt-1 font-medium">✓ Every open is tracked — device, time, and engagement score</p>
            </div>
            {previewUrl && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">👁 Your Preview (Not Tracked)</label>
                <a href={previewUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-all">
                  <FiEye size={13} /> Open Preview
                </a>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Share Via</label>
              <div className="grid grid-cols-2 gap-3">
                <a href={`https://wa.me/?text=${waMessage}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: "#25D366" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a href={`mailto:?subject=Property Presentation — ${property?.propertyName}&body=${waMessage}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                  <FiMail size={15} /> Email
                </a>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50">
              <p className="text-xs font-bold text-purple-700 mb-2">📊 Tracking details:</p>
              <ul className="space-y-1 text-xs text-purple-600">
                <li>✓ Exact time client opens the presentation</li>
                <li>✓ Device type (Mobile / Desktop)</li>
                <li>✓ Number of times opened</li>
                <li>✓ Lead engagement score +15 per view</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-between flex-shrink-0">
          <Btn variant="ghost" onClick={onClose}>{step === 3 ? "Close" : "Cancel"}</Btn>
          <div className="flex gap-2">
            {step === 2 && <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>}
            {step === 1 && (
              <Btn variant="primary" onClick={handleGenerate} loading={generating} disabled={propertyLoading}>
                Generate with AI →
              </Btn>
            )}
            {step === 2 && (
              <Btn variant="primary" onClick={handleSave} loading={saving}>
                <FiCheckCircle size={14} /> Save & Get Link →
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LEAD CREATION MODAL
// ─────────────────────────────────────────────
const LeadCreationModal = ({ property, visible, onClose, onSuccess }) => {
  const [form]          = Form.useForm();
  const [submitting,    setSubmitting]   = useState(false);
  const [inventoryUnits, setInventoryUnits] = useState([]);
  const [loadingUnits,  setLoadingUnits] = useState(false);

  useEffect(() => {
    if (!visible || !property) return;
    if (property.propertySubType === "off_plan" || property.inventory?.length) {
      setLoadingUnits(true);
      apiService
        .get(`/properties/inventory?propertyId=${property._id || property.id}`)
        .then((res) => {
          const data = Array.isArray(res?.data?.data) ? res.data.data : [];
          setInventoryUnits(data);
        })
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
    <Modal title="Create Lead & Link Property" open={visible} onCancel={onClose} footer={null} width={600} centered destroyOnClose>
      <div style={{ marginBottom: 16, padding: 12, background: "#f9f5ff", borderRadius: 8 }}>
        <Text strong style={{ color: "#5c039b" }}>{property?.propertyName}</Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>will be automatically linked to this new lead.</Text>
      </div>
      <Form form={form} layout="vertical" requiredMark="optional" onFinish={handleSubmit} initialValues={{ country_code: "+971" }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Please enter first name" }]}>
              <Input placeholder="John" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="last_name" label="Last Name" rules={[{ required: true, message: "Please enter last name" }]}>
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
            <Form.Item name="phone_number" noStyle rules={[{ required: true, message: "Please enter phone number" }]}>
              <Input style={{ width: "calc(100% - 90px)" }} placeholder="50 123 4567" />
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item name="email" label="Email"
          rules={[{ required: true, message: "Please enter client email" }, { type: "email", message: "Please enter a valid email address" }]}>
          <Input placeholder="client@example.com" />
        </Form.Item>
        {inventoryUnits.length > 0 && (
          <Form.Item name="inventory_unit_id" label="Interested Unit (optional)">
            <Select placeholder="Select a unit" loading={loadingUnits} allowClear>
              {inventoryUnits.map((unit) => {
                const label = [
                  unit.unitNumber ? `Unit ${unit.unitNumber}` : null,
                  unit.bedroomType || unit.bedrooms ? `${unit.bedrooms}BR` : null,
                  unit.area ? `${Number(unit.area).toLocaleString()} sqft` : null,
                  unit.price ? `AED ${Number(unit.price).toLocaleString()}` : null,
                ].filter(Boolean).join(" | ");
                return (
                  <Select.Option key={unit._id || unit.id} value={unit._id || unit.id}>{label}</Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        )}
        <Form.Item name="additional_notes" label="Private Notes">
          <Input.TextArea rows={2} placeholder="Any special remarks..." />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button onClick={onClose} style={{ borderRadius: 8 }}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={submitting} style={{ borderRadius: 8, background: "#5c039b", borderColor: "#5c039b" }}>
            Create Lead
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AgentProjectDetails() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [property,          setProperty]         = useState(null);
  const [loading,           setLoading]          = useState(true);
  const [inventoryLoading,  setInventoryLoading] = useState(false);
  const [inventoryUnits,    setInventoryUnits]   = useState([]);
  const [inventoryCounts,   setInventoryCounts]  = useState({ total: 0, available: 0, reserved: 0, booked: 0, sold: 0 });
  const [isGenerating,      setIsGenerating]     = useState(false);
  const [isPhotoModalOpen,  setIsPhotoModalOpen] = useState(false);
  const [isOfferModalOpen,  setIsOfferModalOpen] = useState(false);
  const [showPresentation,  setShowPresentation] = useState(false);
  const [showLeadModal,     setShowLeadModal]    = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [isEditingDesc,     setIsEditingDesc]    = useState(false);
  const [isImprovingAI,     setIsImprovingAI]    = useState(false);
  const [allPhotos,         setAllPhotos]        = useState([]);
  const [activeUnitTab,     setActiveUnitTab]    = useState("all");

  const [pdfPreferences, setPdfPreferences] = useState({
    language:    "EN",
    currency:    "AED",
    measureUnit: "sqft",
    slides:      ["Cover slide", "Project description", "Developer", "Unit prices", "Payment plans", "Location"],
  });

  const { t, translateAll, currentLang, isTranslating, translations } = useTranslation();

  useEffect(() => {
    if (pdfPreferences.language !== currentLang) translateAll(pdfPreferences.language);
  }, [pdfPreferences.language]);

  useEffect(() => { fetchPropertyDetails(); }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const res          = await apiService.get(`/properties/${id}`);
      const responseData = res?.data?.data || res?.data || res;
      if (responseData) {
        setProperty(responseData);
        setCustomDescription(responseData.description || responseData.overview || "Detailed description for this property is not available yet.");
        setAllPhotos(getAllPhotos(responseData));
        if (responseData.propertySubType === "off_plan") {
          await fetchInventoryUnits(responseData._id || id);
        }
      } else {
        message.error("Failed to load property details");
      }
    } catch {
      message.error("API error while fetching property");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryUnits = async (propertyId) => {
    try {
      setInventoryLoading(true);
      const res          = await apiService.get(`properties/inventory?propertyId=${propertyId}`);
      const responseData = res?.data?.data || res?.data || res;
      if (responseData) {
        const data = Array.isArray(responseData) ? responseData : [];
        setInventoryUnits(data);
        setInventoryCounts({
          total:     data.length,
          available: data.filter((u) => u.status === "available").length,
          reserved:  data.filter((u) => u.status === "reserved").length,
          booked:    data.filter((u) => u.status === "booked").length,
          sold:      data.filter((u) => u.status === "sold").length,
        });
      }
    } catch { console.error("Error fetching inventory"); }
    finally { setInventoryLoading(false); }
  };

  const handleImproveWithAI = async () => {
    if (!customDescription.trim()) { message.warning("Please enter some description first!"); return; }
    setIsImprovingAI(true);
    message.loading({ content: "XOTO AI is enhancing the description...", key: "ai_load" });
    try {
      const response     = await apiService.post("aiii/improve-description", { description: customDescription });
      const responseData = response.data ? response.data : response;
      const improvedText = responseData?.improvedDescription || responseData?.data;
      if (improvedText) {
        setCustomDescription(improvedText);
        message.success({ content: "Description perfectly enhanced!", key: "ai_load", duration: 2 });
      } else {
        message.error({ content: "AI responded, but format was wrong.", key: "ai_load" });
      }
    } catch {
      message.error({ content: "Backend error. Make sure server is running!", key: "ai_load", duration: 5 });
    } finally {
      setIsImprovingAI(false);
    }
  };

  const handleGenerateOffer = async (actionType = "download") => {
    setIsGenerating(true);
    const key = "updatable";
    try {
      const storedUser  = JSON.parse(localStorage.getItem("user_data") || localStorage.getItem("user") || "{}");
      const agentInfo   = {
        name:  storedUser?.first_name ? `${storedUser.first_name} ${storedUser.last_name || ""}`.trim() : "XOTO Agent",
        email: storedUser?.email || "agent@xoto.ae",
        phone: storedUser?.phone_number ? `${storedUser.country_code || "+971"} ${storedUser.phone_number}` : "+971 50 000 0000",
        photo: storedUser?.profile_photo || "",
      };
      const updatedProperty     = { ...property, description: customDescription };
      const htmlContent         = `<!DOCTYPE html><html><body>PDF Preview for ${updatedProperty.propertyName}</body></html>`;

      if (actionType === "view") {
        const previewWindow = window.open("", "_blank");
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
        message.success({ content: "Preview opened in new tab!", key });
      } else {
        const container = document.createElement("div");
        container.innerHTML = htmlContent;
        container.style.cssText = "position:fixed;top:-10000px;left:0;width:1200px;z-index:-9999;background:#fff;";
        document.body.appendChild(container);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const pages = container.querySelectorAll(".page");
        const pdf   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
        for (let i = 0; i < pages.length; i++) {
          if (i > 0) pdf.addPage();
          try {
            const canvas  = await html2canvas(pages[i], { scale: 2, logging: false, useCORS: true, allowTaint: true, windowWidth: 1200, backgroundColor: "#ffffff" });
            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            pdf.addImage(imgData, "JPEG", 0, 0, 210, (canvas.height * 210) / canvas.width, undefined, "FAST");
          } catch (pageError) { console.error(`Error rendering page ${i}:`, pageError); }
        }
        document.body.removeChild(container);
        pdf.save(`${updatedProperty.propertyName?.replace(/\s+/g, "_") || "Sales_Offer"}_${Date.now()}.pdf`);
        message.success({ content: "PDF Downloaded Successfully!", key });
        setIsOfferModalOpen(false);
      }
    } catch {
      message.error({ content: "Failed to generate PDF. Please try again.", key });
    } finally {
      setIsGenerating(false);
    }
  };

  const getFilteredUnits = () =>
    activeUnitTab === "all" ? inventoryUnits : inventoryUnits.filter((u) => u.status === activeUnitTab);

  // ── Computed values ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50"><Spin size="large" /></div>
  );
  if (!property) return (
    <div className="p-10 text-center bg-slate-50 h-screen">
      <Title level={4}>Project not found!</Title>
      <Button type="primary" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const getImage       = () => allPhotos[0] || "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg";
  const developerName  = property?.developer?.name || property?.developerName || "Premium Developer";
  const fullAddress    = `${property?.area || property?.locality || "Area"}, ${property?.city || "Dubai"}, ${property?.country || "UAE"}`;
  const displayAmenitiesUI = property?.amenities?.length > 0
    ? property.amenities
    : ["Infinity Pool", "Outdoor Gym", "BBQ Area", "Rooftop Terraces", "Co-working Space", "Water Lounges", "Cinema", "Club House", "Spa"];

  const getPaymentPlan = () => {
    if (property.paymentPlan?.length > 0) {
      const plan = property.paymentPlan[0];
      if (plan.stages?.length > 0) {
        return plan.stages.filter((s) => s != null).map((s) => `${s.percentage ?? 0}% ${s.stage?.replace(/_/g, " ") || ""}`).join(" • ");
      }
    }
    if (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage)
      return `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%`;
    return "Contact us for payment plan";
  };

  const getCommissionText = () => {
    if (property.shareCommission && property.shareCommissionPercentage) return `${property.shareCommissionPercentage}% Shared`;
    if (property.commission) return `${property.commission}%`;
    if (property.commissionType) {
      return property.commissionType === "percentage"
        ? `${property.commissionValue || 0}%`
        : `${property.currency || "AED"} ${(property.commissionValue || 0).toLocaleString()}`;
    }
    return "Contact for details";
  };

  const getStatusTag = () => {
    const status  = property.approvalStatus;
    const listing = property.listingStatus;
    if (property.propertySubType === "off_plan") return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">🏗️ Off-Plan</span>;
    if (status === "approved" && listing === "active") return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">✓ Active Listing</span>;
    if (status === "pending") return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">⏳ Pending Approval</span>;
    if (status === "rejected") return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">✕ Rejected</span>;
    return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">Draft</span>;
  };

  // Exact lat/lng map pinning with fallback
  const lat    = property?.location?.latitude;
  const lng    = property?.location?.longitude;
  const mapQuery = lat && lng ? `${lat},${lng}` : encodeURIComponent(`${property?.propertyName} ${fullAddress}`);
  const mapSrc   = `https://maps.google.com/maps?q=${mapQuery}&t=m&z=15&ie=UTF8&iwloc=&output=embed`;

  // DLD QR Popover
  const qrContent = (
    <div className="p-2 text-center w-48">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dubai REST Verification</div>
      {property.qrCode || property.qr_code ? (
        <div className="border border-slate-100 p-2 rounded-xl bg-slate-50 shadow-inner">
          <img src={property.qrCode || property.qr_code} alt="DLD QR Code" className="w-full h-auto object-contain rounded-lg mix-blend-multiply" />
        </div>
      ) : (
        <div className="text-xs text-orange-500 font-semibold py-4 bg-orange-50 rounded-xl border border-orange-100">QR Code Unavailable</div>
      )}
      <div className="text-[10px] font-medium text-slate-500 mt-2 leading-tight">
        Scan using Dubai REST app to verify authenticity.
      </div>
    </div>
  );

  const languages = [
    { code: "EN", name: "English" }, { code: "HI", name: "Hindi" }, { code: "AR", name: "Arabic" },
    { code: "RU", name: "Russian" }, { code: "ZH", name: "Chinese" }, { code: "FA", name: "Persian" },
    { code: "FR", name: "French" },  { code: "ES", name: "Spanish" }, { code: "DE", name: "German" }, { code: "IT", name: "Italian" },
  ];
  const currencies = [
    { code: "AED", name: "UAE Dirham" }, { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },       { code: "GBP", name: "British Pound" }, { code: "INR", name: "Indian Rupee" },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 pb-20">

      {/* AI Presentation Modal */}
      {showPresentation && property && (
        <PresentationModal property={property} onClose={() => setShowPresentation(false)} />
      )}

      {/* Lead Creation Modal */}
      <LeadCreationModal
        property={property}
        visible={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSuccess={() => message.success("Lead created and linked to this property!")}
      />

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-8 py-4 mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeftOutlined /> Back to Catalogue
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <Row gutter={[40, 40]}>

          {/* ═══ LEFT COLUMN ═══ */}
          <Col xs={24} lg={16}>

            {/* Hero Image */}
            <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 mb-10 group bg-slate-100">
              <img src={getImage()} alt={property.propertyName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

              {/* Top badges */}
              <div className="absolute top-6 left-6 flex gap-3 flex-wrap">
                {getStatusTag()}
                {property.completionDate?.year && (
                  <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Handover: {property.completionDate.quarter} {property.completionDate.year}
                  </span>
                )}
                {property.readinessProgress && (
                  <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Progress: {property.readinessProgress}
                  </span>
                )}
                {(property.trakheesiPermitId || property.trakheesi_permit_id) && (
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-emerald-400">
                    <SafetyCertificateOutlined /> Trakheesi: {property.trakheesiPermitId || property.trakheesi_permit_id}
                  </span>
                )}
              </div>

              {/* Bottom-left buttons */}
              <div className="absolute bottom-6 left-6 flex gap-3">
                <button onClick={() => setIsPhotoModalOpen(true)} className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-900 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2">
                  <PictureOutlined /> {allPhotos.length} Photos
                </button>
                {property.brochure && (
                  <a href={property.brochure} target="_blank" rel="noreferrer" className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-white/20">
                    <FilePdfOutlined /> Brochure
                  </a>
                )}
              </div>

              {/* Bottom-right: DLD QR Verification */}
              <div className="absolute bottom-6 right-6">
                <Popover content={qrContent} placement="topRight" trigger="hover" overlayInnerStyle={{ borderRadius: "16px" }}>
                  <button className="bg-white text-[#5c039b] hover:bg-purple-50 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 border border-white/20 hover:scale-105">
                    <QrcodeOutlined className="text-lg" /> Verify Listing
                  </button>
                </Popover>
              </div>
            </div>

            {/* Pending alert */}
            {property.approvalStatus === "pending" && (
              <Alert message="Pending Approval" description="This property is awaiting admin approval. Some features may be limited until approved." type="warning" showIcon style={{ marginBottom: 24, borderRadius: 12 }} />
            )}

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Project Overview</h2>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-4">The Vision & Facts</p>
              <Paragraph className="text-[15px] leading-relaxed text-gray-600 font-medium whitespace-pre-wrap"
                ellipsis={{ rows: 4, expandable: true, symbol: "Read More" }}>
                {customDescription}
              </Paragraph>
            </div>

            <Divider className="my-10 border-gray-100" />

            {/* Amenities */}
            <div className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Premium Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayAmenitiesUI.map((amenity, index) => (
                  <div key={index} className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                      <CheckCircleOutlined />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Divider className="my-10 border-gray-100" />

            {/* Inventory / Units */}
            <div className="mb-12">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">
                <UnorderedListOutlined style={{ marginRight: 8 }} /> Units & Availability
              </h2>

              {property.propertySubType === "off_plan" && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[
                      { label: "Total",     value: inventoryCounts.total,     bg: "bg-gray-50",    border: "border-gray-200",   text: "text-gray-900"   },
                      { label: "Available", value: inventoryCounts.available, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
                      { label: "Reserved",  value: inventoryCounts.reserved,  bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"  },
                      { label: "Booked",    value: inventoryCounts.booked,    bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"   },
                      { label: "Sold",      value: inventoryCounts.sold,      bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700"    },
                    ].map(({ label, value, bg, border, text }) => (
                      <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                        <div className={`text-2xl font-black ${text}`}>{value}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">{label}</div>
                      </div>
                    ))}
                  </div>

                  {inventoryUnits.length > 0 && (
                    <div className="flex gap-2 mb-6 flex-wrap">
                      {["all", "available", "reserved", "booked", "sold"].map((tab) => (
                        <button key={tab} onClick={() => setActiveUnitTab(tab)}
                          className={`px-4 py-2 rounded-full border text-xs font-bold cursor-pointer transition-all ${activeUnitTab === tab ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          {tab !== "all" && inventoryCounts[tab] > 0 && (
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeUnitTab === tab ? "bg-white/20" : "bg-gray-100"}`}>
                              {inventoryCounts[tab]}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {inventoryLoading ? (
                    <div className="flex justify-center py-8"><Spin /></div>
                  ) : getFilteredUnits().length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {["Unit", "Type", "Bedrooms", "Area", "Price", "Status"].map((h) => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {getFilteredUnits().map((unit, idx) => (
                            <tr key={unit._id || idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 font-bold text-gray-900">{unit.unitNumber || `#${idx + 1}`}</td>
                              <td className="px-4 py-3 text-gray-600">{unit.unitType || "—"}</td>
                              <td className="px-4 py-3 text-gray-600">{unit.bedrooms || unit.bedroomType || "—"}</td>
                              <td className="px-4 py-3 text-gray-600">{unit.area ? `${Number(unit.area).toLocaleString()} sqft` : "—"}</td>
                              <td className="px-4 py-3 font-bold text-purple-700">{unit.price ? `AED ${Number(unit.price).toLocaleString()}` : "On Request"}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                  unit.status === "available" ? "bg-emerald-100 text-emerald-700" :
                                  unit.status === "sold"      ? "bg-red-100 text-red-700" :
                                  unit.status === "booked"    ? "bg-blue-100 text-blue-700" :
                                  "bg-amber-100 text-amber-700"
                                }`}>
                                  {unit.status || "available"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <Divider className="my-10 border-gray-100" />

            {/* Location Map */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">Location Map</h2>
              <div className="flex items-center gap-2 mb-4 bg-gray-50 border border-gray-100 p-3 rounded-xl w-fit">
                <EnvironmentOutlined className="text-purple-600 text-lg" />
                <span className="text-sm font-bold text-gray-700">{fullAddress}</span>
              </div>
              <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen title="Property Location Map" src={mapSrc} />
              </div>
            </div>
          </Col>

          {/* ═══ RIGHT COLUMN ═══ */}
          <Col xs={24} lg={8}>
            <div className="sticky top-28">

              {/* Main Summary Card */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100">
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Project Valuation</div>
                  <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">{property.propertyName}</h1>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                    <FiMapPin size={14} /> {[property.locality || property.area, property.city].filter(Boolean).join(", ")}
                  </p>
                  <div className="mt-6 mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Starting Price</p>
                    <div className="text-3xl font-black" style={{ color: PRIMARY }}>
                      AED {Number(property.price || property.price_min || 0).toLocaleString()}
                    </div>
                    {property.price_max && property.price_max !== property.price_min && (
                      <p className="text-xs text-gray-400 mt-1">up to AED {Number(property.price_max).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50 flex flex-col gap-5">
                  {[
                    { icon: <AppstoreOutlined />, label: "Available Units", value: inventoryCounts.available > 0 ? inventoryCounts.available : (property.totalUnits || "Contact for availability"), iconBg: "bg-white border-gray-200 text-gray-500" },
                    { icon: <BankOutlined />, label: "Developer", value: developerName, iconBg: "bg-white border-gray-200 text-gray-500" },
                    { icon: <WalletOutlined />, label: "Payment Plan", value: getPaymentPlan(), iconBg: "bg-white border-gray-200 text-gray-500" },
                  ].map(({ icon, label, value, iconBg }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl border shadow-sm flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-sm font-extrabold text-gray-800">{value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <MoneyCollectOutlined />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-0.5">Agent Commission</p>
                      <p className="text-sm font-extrabold text-emerald-700">{getCommissionText()}</p>
                    </div>
                  </div>
                  {property.builtUpArea && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 flex-shrink-0"><HomeOutlined /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Area</p>
                        <p className="text-sm font-extrabold text-gray-800">{property.builtUpArea} {property.builtUpAreaUnit || "sqft"}</p>
                      </div>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 flex-shrink-0"><BuildOutlined /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Furnishing</p>
                        <p className="text-sm font-extrabold text-gray-800 capitalize">{property.furnishing}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-t-xl text-center">
                <span className="text-xs font-bold text-amber-700">🔑 Your customised personal offer. Try it!</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="h-14 rounded-b-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  style={{ background: "#5B45FF" }}
                >
                  <FileTextOutlined /> Sales Offer
                </button>
                <button
                  onClick={() => setShowPresentation(true)}
                  className="h-14 rounded-b-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  style={{ background: "linear-gradient(90deg, #5C039B 0%, #A855F7 100%)" }}
                >
                  <ThunderboltOutlined /> AI Presentation
                </button>
              </div>
              <button
                onClick={() => setShowLeadModal(true)}
                className="w-full h-14 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border transition-all mb-3 hover:bg-purple-50 hover:border-purple-300"
                style={{ background: "#f3e8ff", color: "#5c039b", borderColor: "#c4b5fd" }}
              >
                <UserOutlined /> Add to Lead
              </button>
            </div>
          </Col>
        </Row>
      </div>

      {/* ── IMAGE GALLERY MODAL ── */}
      <Modal
        title={<span className="font-extrabold text-xl text-slate-800">Property Gallery</span>}
        open={isPhotoModalOpen} onCancel={() => setIsPhotoModalOpen(false)} footer={null} width={1000} centered
        styles={{ body: { padding: "20px 24px" } }}
      >
        <div className="mt-2 max-h-[70vh] overflow-y-auto pr-2">
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allPhotos.map((photo, index) => (
                <div key={index} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-zoom-in bg-slate-50 h-36">
                  <Image src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover"
                    style={{ height: "144px", objectFit: "cover" }}
                    fallback="https://placehold.co/600x400?text=Image+Unavailable" />
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      </Modal>

      {/* ── SALES OFFER MODAL ── */}
      <Modal
        title={<div style={{ textAlign: "center", fontSize: 18, fontWeight: "bold" }}>Generate Sales Offer</div>}
        open={isOfferModalOpen} onCancel={() => setIsOfferModalOpen(false)} footer={null} width={750} centered
        bodyStyle={{ padding: "10px 24px 24px" }}
      >
        <div style={{ maxHeight: "75vh", overflowY: "auto", paddingRight: 5 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 4 }}>PDF Preferences</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Configure your presentation before generation</div>

          <div style={{ marginTop: 20 }}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>Language</Text>
            <Select value={pdfPreferences.language} style={{ width: "100%" }} size="large" loading={isTranslating}
              onChange={(val) => setPdfPreferences({ ...pdfPreferences, language: val })}>
              {languages.map((l) => (
                <Select.Option key={l.code} value={l.code}><strong style={{ marginRight: 8 }}>{l.code}</strong>{l.name}</Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>Currency</Text>
            <Select value={pdfPreferences.currency} style={{ width: "100%" }} size="large" showSearch optionFilterProp="children"
              onChange={(val) => setPdfPreferences({ ...pdfPreferences, currency: val })}>
              {currencies.map((c) => (
                <Select.Option key={c.code} value={c.code}><strong style={{ marginRight: 8 }}>{c.code}</strong>{c.name}</Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>Measure Units</Text>
            <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 8, padding: 4 }}>
              {["ft2", "m2"].map((u) => (
                <div key={u} onClick={() => setPdfPreferences({ ...pdfPreferences, measureUnit: u })}
                  style={{ flex: 1, textAlign: "center", padding: "6px 0", cursor: "pointer", borderRadius: 6,
                    background: pdfPreferences.measureUnit === u ? "#fff" : "transparent",
                    fontWeight: pdfPreferences.measureUnit === u ? "bold" : "normal",
                    color: pdfPreferences.measureUnit === u ? PRIMARY : "#6b7280",
                    boxShadow: pdfPreferences.measureUnit === u ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                  {u === "ft2" ? "ft²" : "m²"}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Display Settings</div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            {["Cover slide", "Project description", "Developer", "Unit prices", "Payment plans", "Location"].map((item) => (
              <Checkbox key={item} defaultChecked={pdfPreferences.slides.includes(item)}
                onChange={(e) => {
                  let s = [...pdfPreferences.slides];
                  if (e.target.checked) { if (!s.includes(item)) s.push(item); }
                  else { s = s.filter((x) => x !== item); }
                  setPdfPreferences({ ...pdfPreferences, slides: s });
                }}>
                {item}
              </Checkbox>
            ))}
          </div>

          <Divider />

          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Personalised Description</div>
          <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>Adapt the project description yourself or with XOTO AI.</div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", fontWeight: "bold" }}>Description</Text>
            {isEditingDesc ? (
              <Input.TextArea rows={4} value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} style={{ borderRadius: 8, marginBottom: 12, marginTop: 8 }} />
            ) : (
              <div style={{ maxHeight: 100, overflowY: "auto", fontSize: 13, color: "#4b5563", marginBottom: 12, marginTop: 8 }}>{customDescription}</div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Button style={{ flex: 1 }} icon={<EditOutlined />} onClick={() => setIsEditingDesc(!isEditingDesc)}>
                {isEditingDesc ? "Save" : "Edit"}
              </Button>
              <Button type="primary" style={{ flex: 1, background: "linear-gradient(90deg,#5C039B 0%,#a855f7 100%)", border: "none" }}
                icon={<RobotOutlined />} loading={isImprovingAI} onClick={handleImproveWithAI}>
                Improve with AI
              </Button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 15, marginTop: 24 }}>
            <Button size="large" icon={<EyeOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer("view")} style={{ flex: 1, height: 50, borderRadius: 10, fontWeight: "bold" }}>
              Preview
            </Button>
            <Button type="primary" size="large" icon={<DownloadOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer("download")}
              style={{ flex: 1, height: 50, borderRadius: 10, background: "#1f1f1f", fontWeight: "bold", color: "#fff" }}>
              Download
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}