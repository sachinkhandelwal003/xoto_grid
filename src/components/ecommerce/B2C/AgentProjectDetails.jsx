import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Typography, Button, Tag, Spin, message,
  Card, Divider, Avatar, Space, Modal, Image, Select, Checkbox, Input, Alert,
} from "antd";
import {
  EnvironmentOutlined, PictureOutlined, FilePdfOutlined,
  TagOutlined, WalletOutlined, BankOutlined,
  ShareAltOutlined, MessageOutlined,
  AppstoreOutlined, ArrowLeftOutlined, EditOutlined, RobotOutlined, MoneyCollectOutlined,
  EyeOutlined, DownloadOutlined, HomeOutlined, BuildOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, UnorderedListOutlined,
  ThunderboltOutlined, FileTextOutlined,
} from "@ant-design/icons";
import {
  FiX, FiLoader, FiCheckCircle, FiHome, FiEdit3,
  FiMail, FiCopy, FiEye,
} from "react-icons/fi";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

const { Title, Text, Paragraph } = Typography;

// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─────────────────────────────────────────────
// TRANSLATION
// ─────────────────────────────────────────────
const translateText = async (text, targetLang) => {
  if (targetLang === 'EN' || targetLang === 'English') return text;
  try {
    const response = await apiService.post("aiii/translate", { text, targetLang });
    if (response.data?.success && response.data?.translatedText) return response.data.translatedText;
    return text;
  } catch (error) {
    console.error("Translation error:", error);
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
      parking: "Parking"
    }
  });

  const [currentLang, setCurrentLang] = useState('EN');
  const [isTranslating, setIsTranslating] = useState(false);

  const translateAll = async (langCode) => {
    if (langCode === 'EN') { setCurrentLang('EN'); return; }
    if (translations[langCode]) { setCurrentLang(langCode); return; }
    setIsTranslating(true);
    try {
      const translated = {};
      for (const [key, value] of Object.entries(translations.EN)) {
        translated[key] = await translateText(value, langCode);
      }
      setTranslations(prev => ({ ...prev, [langCode]: translated }));
      setCurrentLang(langCode);
      message.success(`Content translated to ${langCode}`);
    } catch (error) {
      message.error(`Translation failed for ${langCode}. Using English.`);
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
  // media.* fields (new schema)
  const med = property?.media;
  if (med) {
    if (med.mainLogo) photos.push(med.mainLogo);
    ["architectureImages", "interiorImages", "lobbyImages", "otherImages"].forEach(k => {
      if (Array.isArray(med[k])) photos.push(...med[k].filter(Boolean));
    });
  }
  // legacy photos field
  if (property?.photos) {
    if (Array.isArray(property.photos)) {
      property.photos.forEach(p => { if (p && !photos.includes(p)) photos.push(p); });
    } else if (typeof property.photos === 'object') {
      Object.values(property.photos).forEach(category => {
        if (Array.isArray(category)) category.forEach(p => { if (p && !photos.includes(p)) photos.push(p); });
      });
    }
  }
  if (property?.mainLogo && !photos.includes(property.mainLogo)) photos.push(property.mainLogo);
  if (photos.length === 0) photos.push("https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg");
  return photos;
};

// ─────────────────────────────────────────────
// PRESENTATION MODAL
// ─────────────────────────────────────────────

const Btn = ({ children, onClick, variant = 'primary', loading, disabled, size = 'md', className = '' }) => {
  const base  = 'flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-sm' };
  const vars  = {
    primary: 'text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
    ghost:   'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50',
    danger:  'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100',
    success: 'text-white shadow-md hover:shadow-lg',
  };
  const bg = variant === 'primary' ? GR : variant === 'success' ? 'linear-gradient(135deg,#059669,#10b981)' : '';
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

const PresentationModal = ({ property: initialProperty, onClose }) => {
  const [step,            setStep]          = useState(1);
  const [generating,      setGenerating]    = useState(false);
  const [saving,          setSaving]        = useState(false);
  const [narrative,       setNarrative]     = useState(null);
  const [trackingUrl,     setTrackingUrl]   = useState('');
  const [previewUrl,      setPreviewUrl]    = useState('');
  const [copied,          setCopied]        = useState(false);
  const [property,        setProperty]      = useState(initialProperty);
  const [propertyLoading, setPropertyLoading] = useState(false);

  // Fetch full property data on mount
  useEffect(() => {
    if (!initialProperty?._id) return;
    setPropertyLoading(true);
    apiService.get(`/property/${initialProperty._id}`)
      .then(res => {
        const data = res?.data?.data || res?.data;
        if (data) setProperty(data);
      })
      .catch(() => console.warn('Full property fetch failed, using partial data'))
      .finally(() => setPropertyLoading(false));
  }, [initialProperty._id]);

  const [settings, setSettings] = useState({
    language: 'English',
    currency: 'AED',
    areaUnit: 'sqft',
    tone: 'professional',
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
    clientName:   '',
    budget:       property?.price_min ? `AED ${Number(property.price_min).toLocaleString()}` : '',
    requirements: '',
  });

  // ── Clean property data for backend ───────────────────────────────────────
  const buildCleanProperty = () => ({
    propertyName:      property.propertyName || property.projectName || '',
    type:              property.propertyType || 'Residential',
    propertySubType:   property.propertySubType || '',
    area:              property.area || property.locality || '',
    city:              property.city || 'Dubai',
    country:           property.country || 'UAE',
    price:             property.price     || property.price_min || 0,
    price_min:         property.price_min || property.price     || 0,
    price_max:         property.price_max || 0,
    bedrooms:          property.bedrooms  || 0,
    bathrooms:         property.bathrooms || 0,
    builtUpArea:       property.builtUpArea || 0,
    floors:            property.floors    || property.numberOfFloors || 0,
    furnishingStatus:  property.furnishingStatus || property.furnishing || '',
    ownershipType:     property.ownershipType || '',
    parkingAllocation: property.parkingAllocation || '',
    mainLogo:          property.mainLogo  || property.media?.mainLogo || '',
    photos: (() => {
      const allPhotos = [];
      const mainLogo = property.mainLogo || property.media?.mainLogo;
      if (mainLogo) allPhotos.push(mainLogo);
      const ph = property.photos;
      if (ph && typeof ph === 'object' && !Array.isArray(ph)) {
        Object.values(ph).forEach(arr => { if (Array.isArray(arr)) allPhotos.push(...arr.filter(Boolean)); });
      } else if (Array.isArray(ph)) {
        allPhotos.push(...ph.filter(Boolean));
      }
      const med = property.media;
      if (med && typeof med === 'object') {
        ['architectureImages','interiorImages','lobbyImages','otherImages'].forEach(key => {
          if (Array.isArray(med[key])) allPhotos.push(...med[key].filter(Boolean));
        });
      }
      return [...new Set(allPhotos)];
    })(),
    developer:       property.developerName || '',
    developerDetails: (() => {
      const dev = property.developerDetails || property.developer || {};
      return {
        name:        dev.name        || property.developerName || '',
        logo:        dev.logo        || dev.mainLogo || '',
        description: dev.description || dev.overview || '',
        email:       dev.email       || '',
        phone:       dev.phone       || dev.phone_number || '',
        websiteUrl:  dev.websiteUrl  || '',
      };
    })(),
    completionDate:       property.completionDate || '',
    projectStatus:        property.projectStatus  || '',
    developmentStatus:    property.developmentStatus || '',
    constructionProgress: property.constructionProgress || 0,
    readinessProgress:    property.readinessProgress || '',
    serviceCharge:        property.serviceCharge || '',
    totalUnits:           property.totalUnits    || 0,
    soldUnits:            property.soldUnits     || 0,
    reservedUnits:        property.reservedUnits || 0,
    description:          property.description   || property.overview || '',
    locality:             property.locality      || property.area || '',
    location:             property.location      || {},
    proximity:            property.proximity     || {},
    isFeatured:           property.isFeatured    || false,
    saleStatus:           property.saleStatus    || 'Available',
    facilities: (() => {
      const f = property.facilities;
      if (!f) return [];
      if (Array.isArray(f)) return f;
      return Object.entries(f)
        .filter(([, v]) => v === true)
        .map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim());
    })(),
    amenities:   Array.isArray(property.amenities) ? property.amenities : [],
    paymentPlan: (() => {
      const pp = property.paymentPlan;
      if (!pp || !Array.isArray(pp) || pp.length === 0) return [];
      const flat = [];
      pp.forEach(plan => {
        if (plan.stages && Array.isArray(plan.stages)) {
          plan.stages.forEach(s => flat.push({
            milestone:   s.stage?.replace(/_/g, ' ') || '',
            percentage:  s.percentage || 0,
            description: s.description || '',
          }));
        }
      });
      return flat;
    })(),
    unitTypes: (() => {
      if (Array.isArray(property.inventory) && property.inventory.length > 0) {
        return property.inventory.map(inv => ({
          type:  inv.unitType || '',
          area:  inv.sqft || inv.sqm || 0,
          price: property.price_min || property.price || 0,
          units: inv.units || 1,
        }));
      }
      if (Array.isArray(property.unitTypes) && property.unitTypes.length > 0) {
        return property.unitTypes.map(t => ({ type: t, area: 0, price: 0 }));
      }
      return [];
    })(),
  });

  // ── Step 1: Generate narrative ─────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res  = await apiService.post('/presentation/generate-narrative', {
        property: buildCleanProperty(),
        clientNotes,
        settings,
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        setNarrative(data.data);
        setStep(2);
      } else {
        message.error(data?.message || 'Generation failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // ── Step 2: Save → get both URLs ──────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await apiService.post('/presentation/save', {
        propertyId:   property._id,
        property:     buildCleanProperty(),
        narrative,
        settings,
        clientNotes,
        agentProfile: {},
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        setTrackingUrl(data.data.trackingUrl);
        setPreviewUrl(data.data.trackingUrl + '?preview=true');
        setStep(3);
        message.success('Presentation saved!');
      } else {
        message.error(data?.message || 'Save failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Save failed');
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
    setSettings(p => ({ ...p, sections: { ...p.sections, [key]: !p.sections[key] } }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div className="bg-white w-full sm:rounded-3xl sm:max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">AI Presentation Generator</h3>
            <p className="text-xs text-white/70 mt-0.5">
              {step === 1 && 'Customize your presentation'}
              {step === 2 && 'Preview AI-generated content'}
              {step === 3 && 'Share with your client'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(s => (
                <div key={s} className={`w-2 h-2 rounded-full transition-all ${step >= s ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* ── STEP 1: CUSTOMIZE ── */}
        {step === 1 && (
          <div className="overflow-y-auto flex-1 p-6 space-y-5">

            {propertyLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <FiLoader size={13} className="animate-spin text-blue-500" />
                <p className="text-xs text-blue-600 font-medium">Loading full property data…</p>
              </div>
            )}

            {/* Property preview */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 border border-purple-100">
              {property.mainLogo
                ? <img src={property.mainLogo} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                : <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FiHome size={18} style={{ color: P }} />
                  </div>}
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{property.propertyName}</p>
                <p className="text-xs text-gray-500 truncate">{[property.area, property.city].filter(Boolean).join(', ')}</p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <p className="text-sm font-extrabold" style={{ color: P }}>
                  {(property.price || property.price_min) > 0
                    ? `AED ${Number(property.price || property.price_min).toLocaleString()}`
                    : 'On Request'}
                </p>
              </div>
            </div>

            {/* Client info */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Client Details</p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1">Client Name</label>
                  <input
                    value={clientNotes.clientName}
                    onChange={e => setClientNotes(p => ({ ...p, clientName: e.target.value }))}
                    placeholder="Ahmed Ali"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">Budget</label>
                    <input
                      value={clientNotes.budget}
                      onChange={e => setClientNotes(p => ({ ...p, budget: e.target.value }))}
                      placeholder="AED 1,500,000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">Key Requirement</label>
                    <input
                      value={clientNotes.requirements}
                      onChange={e => setClientNotes(p => ({ ...p, requirements: e.target.value }))}
                      placeholder="Sea view, 2BR..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Presentation Settings</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1">Language</label>
                  <select
                    value={settings.language}
                    onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none"
                  >
                    {['English', 'Arabic', 'Hindi', 'Urdu', 'Russian'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none"
                  >
                    {['AED', 'USD', 'GBP', 'EUR', 'INR'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1">Area Unit</label>
                  <select
                    value={settings.areaUnit}
                    onChange={e => setSettings(p => ({ ...p, areaUnit: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none"
                  >
                    <option value="sqft">sqft</option>
                    <option value="sqm">sqm</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-500 font-semibold mb-2">Tone</label>
                <div className="flex gap-2">
                  {['professional', 'luxury', 'friendly'].map(t => (
                    <button
                      key={t}
                      onClick={() => setSettings(p => ({ ...p, tone: t }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border capitalize transition-all
                        ${settings.tone === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sections toggle */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Include Sections</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries({
                  cover:              'Cover Slide',
                  projectDescription: 'Project Description',
                  developer:          'Developer Info',
                  unitPrices:         'Unit Prices',
                  paymentPlan:        'Payment Plan',
                  location:           'Location & Map',
                  gallery:            'Photo Gallery',
                  keyHighlights:      'Key Highlights',
                }).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleSection(key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all text-left
                      ${settings.sections[key] ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-400 bg-gray-50'}`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all
                      ${settings.sections[key] ? 'bg-purple-600' : 'bg-gray-200'}`}>
                      {settings.sections[key] && <FiCheckCircle size={10} className="text-white" />}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: NARRATIVE PREVIEW ── */}
        {step === 2 && narrative && (
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
              <FiCheckCircle size={15} className="text-green-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-green-700">AI narrative generated — review and edit if needed</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Property Overview</label>
              <textarea
                rows={3}
                value={narrative.propertyOverview}
                onChange={e => setNarrative(p => ({ ...p, propertyOverview: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Key Highlights</label>
              <div className="space-y-2">
                {(narrative.keyHighlights || []).map((h, i) => (
                  <input
                    key={i}
                    value={h}
                    onChange={e => {
                      const updated = [...narrative.keyHighlights];
                      updated[i] = e.target.value;
                      setNarrative(p => ({ ...p, keyHighlights: updated }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location & Community</label>
              <textarea
                rows={2}
                value={narrative.locationCommunity}
                onChange={e => setNarrative(p => ({ ...p, locationCommunity: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Next Steps (CTA)</label>
              <textarea
                rows={2}
                value={narrative.nextSteps}
                onChange={e => setNarrative(p => ({ ...p, nextSteps: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
              />
            </div>

            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline"
            >
              <FiEdit3 size={11} /> Back to customize
            </button>
          </div>
        )}

        {/* ── STEP 3: SHARE ── */}
        {step === 3 && (
          <div className="overflow-y-auto flex-1 p-6 space-y-4">

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
              <FiCheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">Presentation ready!</p>
                <p className="text-xs text-green-700 mt-0.5">Share the tracked link with your client</p>
              </div>
            </div>

            {/* Tracking URL */}
            <div>
              <label className="block text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">
                🔗 Client Link (Tracked) — Share This
              </label>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={trackingUrl}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-sm text-purple-700 font-medium outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex-shrink-0
                    ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'}`}
                >
                  {copied ? '✓ Copied' : <FiCopy size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-purple-500 mt-1 font-medium">
                ✓ Every open is tracked — device, time, and engagement score
              </p>
            </div>

            {/* Preview URL */}
            {previewUrl && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  👁 Your Preview (Not Tracked)
                </label>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <FiEye size={13} /> Open Preview
                </a>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">
                  Only you can see this — opens without tracking
                </p>
              </div>
            )}

            {/* Share buttons */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Share Via</label>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/?text=${waMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=Property Presentation — ${property?.propertyName}&body=${waMessage}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <FiMail size={15} /> Email
                </a>
              </div>
            </div>

            {/* Tracking info */}
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
          <Btn variant="ghost" onClick={onClose}>{step === 3 ? 'Close' : 'Cancel'}</Btn>
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
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AgentProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property,       setProperty]      = useState(null);
  const [loading,        setLoading]       = useState(true);
  const [inventoryUnits, setInventoryUnits] = useState([]);
  const [inventoryCounts, setInventoryCounts] = useState({ total: 0, available: 0, reserved: 0, booked: 0, sold: 0 });
  const [isGenerating,    setIsGenerating]    = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // ✅ NEW: AI Presentation modal state
  const [showPresentation, setShowPresentation] = useState(false);

  const [customDescription, setCustomDescription] = useState("");
  const [isEditingDesc,     setIsEditingDesc]     = useState(false);
  const [isImprovingAI,     setIsImprovingAI]     = useState(false);
  const [allPhotos,         setAllPhotos]         = useState([]);
  const [activeUnitTab,     setActiveUnitTab]     = useState("all");

  const [pdfPreferences, setPdfPreferences] = useState({
    language:    'EN',
    currency:    'AED',
    measureUnit: 'sqft',
    slides:      ['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location']
  });

  const { translateAll, currentLang, isTranslating, translations } = useTranslation();

  useEffect(() => {
    if (pdfPreferences.language !== currentLang) {
      translateAll(pdfPreferences.language);
    }
  }, [pdfPreferences.language]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      let res = await apiService.get(`/properties/${id}`);
      let responseData = res?.data?.data || res?.data || res;
      if (responseData && responseData._id) {
        const propertyData = responseData;
        setProperty(propertyData);
        setCustomDescription(propertyData.description || "Detailed description for this property is not available yet.");
        setAllPhotos(getAllPhotos(propertyData));
        await fetchInventoryUnits(propertyData._id || id);
      } else {
        message.error("Failed to load property details");
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      message.error("API error while fetching property");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryUnits = async (propertyId) => {
    try {
      const res = await apiService.get(`/properties/inventory?propertyId=${propertyId}`);
      const responseData = res?.data?.data || res?.data || res;
      if (responseData) {
        setInventoryUnits(Array.isArray(responseData) ? responseData : []);
        const counts = {
          total:     responseData.length || 0,
          available: responseData.filter(u => u.status === "available").length,
          reserved:  responseData.filter(u => u.status === "reserved").length,
          booked:    responseData.filter(u => u.status === "booked").length,
          sold:      responseData.filter(u => u.status === "sold").length,
        };
        setInventoryCounts(counts);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  const handleImproveWithAI = async () => {
    if (!customDescription.trim()) { message.warning("Please enter some description first!"); return; }
    setIsImprovingAI(true);
    message.loading({ content: "XOTO AI is enhancing the description...", key: "ai_load" });
    try {
      const response = await apiService.post("aiii/improve-description", { description: customDescription });
      const responseData = response.data ? response.data : response;
      const improvedText = responseData?.improvedDescription || responseData?.data;
      if (improvedText) {
        setCustomDescription(improvedText);
        message.success({ content: "Description perfectly enhanced!", key: "ai_load", duration: 2 });
      } else {
        message.error({ content: "AI responded, but format was wrong.", key: "ai_load" });
      }
    } catch (error) {
      message.error({ content: "Backend error. Make sure server is running!", key: "ai_load", duration: 5 });
    } finally {
      setIsImprovingAI(false);
    }
  };

  const handleGenerateOffer = async (actionType = 'download') => {
    setIsGenerating(true);
    const key = "updatable";
    try {
      const updatedProperty = { ...property, description: customDescription };
      const htmlContent     = `<!DOCTYPE html><html><body>PDF Preview for ${updatedProperty.propertyName}</body></html>`;

      if (actionType === 'view') {
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
        message.success({ content: "Preview opened in new tab!", key });
      } else {
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.cssText = 'position:fixed;top:-10000px;left:0;width:1200px;z-index:-9999;background:#fff;';
        document.body.appendChild(container);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const pages = container.querySelectorAll('.page');
        const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        for (let i = 0; i < pages.length; i++) {
          if (i > 0) pdf.addPage();
          try {
            const canvas  = await html2canvas(pages[i], { scale: 2, logging: false, useCORS: true, allowTaint: true, windowWidth: 1200, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width, undefined, 'FAST');
          } catch (pageError) { console.error(`Error rendering page ${i}:`, pageError); }
        }
        document.body.removeChild(container);
        pdf.save(`${updatedProperty.propertyName?.replace(/\s+/g, '_') || 'Sales_Offer'}_${Date.now()}.pdf`);
        message.success({ content: "PDF Downloaded Successfully!", key });
        setIsOfferModalOpen(false);
      }
    } catch (error) {
      console.error("PDF Generation Error: ", error);
      message.error({ content: "Failed to generate PDF. Please try again.", key });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Spin size="large" />
    </div>
  );

  if (!property) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <Title level={4}>Project not found!</Title>
      <Button type="primary" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const getImage        = () => allPhotos[0] || "https://xotostaging.s3.me-central-1.amazonaws.com/properties/1773392643245-15.jpg";
  const getPaymentPlan  = () => {
    if (property.paymentPlan?.length > 0) {
      const plan = property.paymentPlan[0];
      if (plan.stages?.length > 0) {
        const firstStage = plan.stages[0];
        const lastStage  = plan.stages[plan.stages.length - 1];
        const downPay    = firstStage.percentage || 0;
        const lastLabel  = lastStage.milestoneTitle || lastStage.stage?.replace(/_/g, ' ') || 'Handover';
        return `${downPay}% Down • ... • ${lastStage.percentage || 0}% ${lastLabel}`;
      }
    }
    if (property.paymentPlan_initialPercentage && property.paymentPlan_laterPercentage)
      return `${property.paymentPlan_initialPercentage}/${property.paymentPlan_laterPercentage}%`;
    return "Contact us for payment plan";
  };
  const getCommissionText = () => {
    if (property.shareCommission && property.shareCommissionPercentage) return `${property.shareCommissionPercentage}% Commission Shared`;
    if (property.commission)     return `${property.commission}% Commission`;
    if (property.commissionType) {
      const val = property.commissionValue || 0;
      return property.commissionType === "percentage" ? `${val}%` : `${property.currency || "AED"} ${val.toLocaleString()}`;
    }
    return "Contact us for commission details";
  };
  const getStatusTag = () => {
    const status  = property.approvalStatus;
    const listing = property.listingStatus;
    if (property.propertySubType === "off_plan") return <Tag color="purple" style={{ borderRadius: 8, fontWeight: 600 }}>Off-Plan Project</Tag>;
    if (status === "approved" && listing === "active") return <Tag color="green" icon={<CheckCircleOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>Active Listing</Tag>;
    if (status === "pending")  return <Tag color="orange" icon={<ClockCircleOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>Pending Approval</Tag>;
    if (status === "rejected") return <Tag color="red" icon={<CloseCircleOutlined />} style={{ borderRadius: 8, fontWeight: 600 }}>Rejected</Tag>;
    return <Tag color="default" style={{ borderRadius: 8 }}>Draft</Tag>;
  };

  const developerName      = property?.developer?.name || property?.developerName || "Developer";
  const displayAmenitiesUI = Array.isArray(property?.amenities) ? property.amenities : [];

  const languages = [
    { code: 'EN', name: 'English' }, { code: 'HI', name: 'Hindi' }, { code: 'AR', name: 'Arabic' },
    { code: 'RU', name: 'Russian' }, { code: 'ZH', name: 'Chinese' }, { code: 'FA', name: 'Persian' },
    { code: 'FR', name: 'French' },  { code: 'ES', name: 'Spanish' }, { code: 'DE', name: 'German' }, { code: 'IT', name: 'Italian' }
  ];
  const currencies = [
    { code: 'AED', name: 'United Arab Emirates Dirham' }, { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },                        { code: 'GBP', name: 'British Pound' }, { code: 'INR', name: 'Indian Rupee' }
  ];

  return (
    <div style={{ padding: "24px 40px", background: "#fff", minHeight: "100vh" }}>

      {/* ✅ AI Presentation Modal — same as GridAgentLeadDetail */}
      {showPresentation && property && (
        <PresentationModal
          property={property}
          onClose={() => setShowPresentation(false)}
        />
      )}

      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ paddingLeft: 0, marginBottom: 16, color: "#555" }}>
        Back to Projects
      </Button>

      <Row gutter={[32, 32]}>
        {/* LEFT COLUMN */}
        <Col xs={24} lg={16}>
          {/* Hero Image */}
          <div style={{ position: "relative", height: 500, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            <img src={getImage()} alt={property.propertyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", top: 20, left: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {getStatusTag()}
              {(property.completionDate?.year || (typeof property.completionDate === 'string' && property.completionDate)) && (
                <Tag style={{ padding: "4px 12px", borderRadius: 8, fontSize: 13, fontWeight: "bold", background: "#fff", color: "#333", border: "none" }}>
                  Handover: {property.completionDate?.quarter ? `${property.completionDate.quarter} ${property.completionDate.year}` : property.completionDate}
                </Tag>
              )}
              {(property.constructionProgress > 0 || property.readinessProgress) && (
                <Tag style={{ padding: "4px 12px", borderRadius: 8, fontSize: 13, fontWeight: "bold", background: "#fff", color: "#333", border: "none" }}>
                  Progress: {property.constructionProgress != null ? `${property.constructionProgress}%` : property.readinessProgress}
                </Tag>
              )}
            </div>
            <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", gap: 12 }}>
              <Button icon={<PictureOutlined />} onClick={() => setIsPhotoModalOpen(true)} style={{ borderRadius: 8, fontWeight: 500, border: "none" }}>
                {allPhotos.length} Photos
              </Button>
              {property.brochure && (
                <Button icon={<FilePdfOutlined />} href={property.brochure} target="_blank" style={{ borderRadius: 8, fontWeight: 500, border: "none" }}>
                  Brochure
                </Button>
              )}
            </div>
          </div>

          {/* Photo strip */}
          {allPhotos.length > 1 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20 }}>
              {allPhotos.slice(0, 8).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Photo ${i + 1}`}
                  onClick={() => setIsPhotoModalOpen(true)}
                  style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0, cursor: "pointer", border: "2px solid transparent", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.target.style.borderColor = "#6366f1"}
                  onMouseLeave={e => e.target.style.borderColor = "transparent"}
                />
              ))}
              {allPhotos.length > 8 && (
                <div onClick={() => setIsPhotoModalOpen(true)} style={{ width: 80, height: 56, borderRadius: 8, flexShrink: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  +{allPhotos.length - 8}
                </div>
              )}
            </div>
          )}

          {property.approvalStatus === "pending" && (
            <Alert message="Pending Approval" description="This property is awaiting admin approval. Some features may be limited until approved." type="warning" showIcon style={{ marginBottom: 24, borderRadius: 12 }} />
          )}

          <Title level={3} style={{ marginBottom: 16 }}>Description</Title>
          <Text type="secondary" strong style={{ display: "block", marginBottom: 12 }}>Project general facts</Text>
          <Paragraph ellipsis={{ rows: 4, expandable: true, symbol: 'Read More' }} style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.8 }}>
            {customDescription}
          </Paragraph>

          <Divider style={{ margin: "40px 0" }} />

          {displayAmenitiesUI.length > 0 && (
            <>
              <Title level={3} style={{ marginBottom: 24 }}>Amenities</Title>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {displayAmenitiesUI.map((amenity, index) => (
                  <div key={index} style={{ padding: "10px 16px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#fff", fontSize: "14px", fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <span style={{ color: "#6366f1", fontSize: "16px", fontWeight: "bold" }}>&#10003;</span>{amenity}
                  </div>
                ))}
              </div>
              <Divider style={{ margin: "40px 0" }} />
            </>
          )}

          {inventoryUnits.length > 0 && (
            <>
              <Divider style={{ margin: "40px 0" }} />
              <Title level={3} style={{ marginBottom: 24 }}>
                <UnorderedListOutlined style={{ marginRight: 8 }} /> Units & Availability
              </Title>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Total",     value: inventoryCounts.total,     bg: "#f3f4f6", color: "#111827" },
                  { label: "Available", value: inventoryCounts.available, bg: "#d1fae5", color: "#065f46" },
                  { label: "Reserved",  value: inventoryCounts.reserved,  bg: "#fef3c7", color: "#92400e" },
                  { label: "Booked",    value: inventoryCounts.booked,    bg: "#dbeafe", color: "#1e40af" },
                  { label: "Sold",      value: inventoryCounts.sold,      bg: "#fee2e2", color: "#991b1b" },
                ].map(({ label, value, bg, color }) => (
                  <div key={label} style={{ background: bg, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {["all", "available", "reserved", "booked", "sold"].map(tab => (
                  <button key={tab} onClick={() => setActiveUnitTab(tab)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: activeUnitTab === tab ? 700 : 400, background: activeUnitTab === tab ? "#111827" : "#fff", color: activeUnitTab === tab ? "#fff" : "#6b7280", borderColor: activeUnitTab === tab ? "#111827" : "#e5e7eb" }}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab !== "all" && inventoryCounts[tab] > 0 && (
                      <span style={{ marginLeft: 6, background: activeUnitTab === tab ? "rgba(255,255,255,0.2)" : "#f3f4f6", borderRadius: 10, padding: "1px 6px", fontSize: 11 }}>
                        {inventoryCounts[tab]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Unit", "Type", "Bedrooms", "Area (sqft)", "Price (AED)", "Status"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(activeUnitTab === "all" ? inventoryUnits : inventoryUnits.filter(u => u.status === activeUnitTab))
                      .slice(0, 50)
                      .map((unit, i) => {
                        const statusColors = {
                          available: { bg: "#d1fae5", color: "#065f46" },
                          reserved:  { bg: "#fef3c7", color: "#92400e" },
                          booked:    { bg: "#dbeafe", color: "#1e40af" },
                          sold:      { bg: "#fee2e2", color: "#991b1b" },
                          hold:      { bg: "#f3e8ff", color: "#5c039b" },
                        };
                        const sc = statusColors[unit.status] || { bg: "#f3f4f6", color: "#374151" };
                        return (
                          <tr key={unit._id || i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                            <td style={{ padding: "10px 14px", fontWeight: 600, color: "#111827" }}>{unit.unitNumber || "—"}</td>
                            <td style={{ padding: "10px 14px", color: "#374151", textTransform: "capitalize" }}>{unit.unitType || unit.bedroomType || "—"}</td>
                            <td style={{ padding: "10px 14px", color: "#374151" }}>{unit.bedrooms != null ? (unit.bedrooms === 0 ? "Studio" : unit.bedrooms) : "—"}</td>
                            <td style={{ padding: "10px 14px", color: "#374151" }}>{unit.builtUpArea ? Number(unit.builtUpArea).toLocaleString() : "—"}</td>
                            <td style={{ padding: "10px 14px", fontWeight: 600, color: "#111827" }}>{unit.price ? Number(unit.price).toLocaleString() : "—"}</td>
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                                {unit.status || "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {inventoryUnits.length > 50 && (
                  <div style={{ padding: "10px 14px", textAlign: "center", fontSize: 13, color: "#9ca3af", borderTop: "1px solid #f3f4f6" }}>
                    Showing 50 of {inventoryUnits.length} units
                  </div>
                )}
              </div>
            </>
          )}

          {/* Payment Plan Section */}
          {property.paymentPlan?.length > 0 && property.paymentPlan[0]?.stages?.length > 0 && (
            <>
              <Divider style={{ margin: "40px 0" }} />
              <Title level={3} style={{ marginBottom: 24 }}>
                <WalletOutlined style={{ marginRight: 8 }} /> Payment Plan
              </Title>
              {property.paymentPlan.map((plan, pi) => {
                const stages = plan.stages || [];
                const total = stages.reduce((s, x) => s + (x.percentage || 0), 0);
                return (
                  <div key={pi} style={{ marginBottom: 24 }}>
                    {plan.title && <Text strong style={{ fontSize: 15, display: "block", marginBottom: 12 }}>{plan.title}</Text>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                      {stages.map((s, si) => (
                        <div key={si} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: si % 2 === 0 ? "#fafafa" : "#fff", borderBottom: si < stages.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                          <Text style={{ fontSize: 14, color: "#374151" }}>
                            {s.milestoneTitle || s.label || s.stage?.replace(/_/g, " ") || `Stage ${si + 1}`}
                          </Text>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "#5c039b", background: "#f3e8ff", padding: "3px 12px", borderRadius: 20 }}>
                            {s.percentage}%
                          </span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: total === 100 ? "#d1fae5" : "#fee2e2", borderTop: "2px solid #e5e7eb" }}>
                        <Text strong style={{ color: total === 100 ? "#065f46" : "#991b1b" }}>Total</Text>
                        <Text strong style={{ color: total === 100 ? "#065f46" : "#991b1b" }}>{total}%{total !== 100 && " ⚠"}</Text>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          <Divider style={{ margin: "40px 0" }} />

          <Title level={3} style={{ marginBottom: 16 }}>Location</Title>
          <div style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, color: "#374151", fontWeight: 500 }}>
              <EnvironmentOutlined style={{ color: "#6366f1", marginRight: 8, fontSize: 18 }} />
              {[property.locality || property.area, property.city, property.country || "UAE"].filter(Boolean).join(", ")}
            </Text>
          </div>
          <div style={{ width: "100%", height: 400, borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            {property.location?.latitude && property.location?.longitude ? (
              <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${property.location.latitude},${property.location.longitude}&z=15&output=embed`}
              />
            ) : (
              <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent([property.propertyName, property.locality || property.area, property.city, "UAE"].filter(Boolean).join(', '))}&t=m&z=14&ie=UTF8&iwloc=&output=embed`}
              />
            )}
          </div>
        </Col>

        {/* RIGHT COLUMN */}
        <Col xs={24} lg={8}>
          <div style={{ position: "sticky", top: 24 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              <EnvironmentOutlined /> {[property.locality || property.area, property.city, property.country || "UAE"].filter(Boolean).join(", ")}
            </Text>
            <Title level={2} style={{ marginTop: 8, marginBottom: 16 }}>
              {property.propertyName} by {developerName}
            </Title>

            {/* Construction progress bar (off-plan only) */}
            {property.propertySubType === "off_plan" && (property.constructionProgress != null || property.readinessProgress) && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>Construction Progress</Text>
                  <Text strong style={{ fontSize: 13, color: "#5c039b" }}>
                    {property.constructionProgress != null ? `${property.constructionProgress}%` : property.readinessProgress}
                  </Text>
                </div>
                <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${property.constructionProgress ?? parseInt(property.readinessProgress) ?? 0}%`, background: "linear-gradient(90deg, #5c039b, #a855f7)", borderRadius: 4, transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <TagOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Price from:</Text>
                  <Text strong style={{ fontSize: 18 }}>{Number(property.price || property.price_min || 0).toLocaleString()} {property.currency || "AED"}</Text>
                  {property.price_max && property.price_max !== property.price_min && (
                    <Text type="secondary" style={{ fontSize: 12, display: "block" }}>up to {Number(property.price_max).toLocaleString()} {property.currency || "AED"}</Text>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <AppstoreOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text strong style={{ fontSize: 16, display: "block" }}>Available Units</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {inventoryCounts.available > 0 ? inventoryCounts.available : (property.totalUnits || property.totalInventory || "Contact for availability")}
                  </Text>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <WalletOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Payment plan:</Text>
                  <Text strong style={{ fontSize: 16 }}>{getPaymentPlan()}</Text>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <BankOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Developer:</Text>
                  <Text strong style={{ fontSize: 16 }}>{developerName}</Text>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <MoneyCollectOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                {/* <div>
                  <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Agent Commission:</Text>
                  <Text strong style={{ fontSize: 16, color: "#16a34a" }}>{getCommissionText()}</Text>
                </div> */}
              </div>
              {property.builtUpArea && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <HomeOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Area:</Text>
                    <Text strong style={{ fontSize: 16 }}>{property.builtUpArea} {property.builtUpAreaUnit || "sqft"}</Text>
                  </div>
                </div>
              )}
              {property.furnishing && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <BuildOutlined style={{ fontSize: 20, color: "#6b7280", marginTop: 4 }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 13, display: "block" }}>Furnishing:</Text>
                    <Text strong style={{ fontSize: 16 }}>{property.furnishing.charAt(0).toUpperCase() + property.furnishing.slice(1)}</Text>
                  </div>
                </div>
              )}
            </div>



            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", marginTop: 12, marginBottom: 14 }}>
              {/* Generate Sales Offer */}
              {/* <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => setIsOfferModalOpen(true)}
                style={{ height: 52, width: "100%", borderRadius: 10, background: "#5B45FF", border: "none", fontWeight: 600, fontSize: 14, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(91,69,255,0.18)", whiteSpace: "normal", textAlign: "center", lineHeight: "1.2" }}
              >
                Generate Sales Offer
              </Button> */}

              {/* ✅ Generate AI Presentation — now opens PresentationModal */}
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => setShowPresentation(true)}
                style={{ height: 52, width: "100%", borderRadius: 10, background: "linear-gradient(90deg, #5C039B 0%, #A855F7 100%)", border: "none", fontWeight: 600, fontSize: 14, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(92,3,155,0.18)", whiteSpace: "normal", textAlign: "center", lineHeight: "1.2" }}
              >
                Generate AI Presentation
              </Button>
            </div>

            {/* <Button
              icon={<ShareAltOutlined />}
              style={{ width: "100%", height: 52, borderRadius: 10, background: "#111827", color: "#fff", border: "none", fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", marginBottom: 16 }}
            >
              Transfer Client
            </Button> */}

            {/* <Card style={{ borderRadius: 12, border: "1px solid #e5e7eb" }} styles={{ body: { padding: "16px 20px" } }}>
              <div style={{ textAlign: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
                <Text strong>Sales Office</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                  <Avatar size={48} src={property.developer?.logo} style={{ background: "#f3f4f6" }}>
                    {!property.developer?.logo && developerName?.charAt(0)}
                  </Avatar>
                  <div>
                    <Text strong style={{ display: "block" }}>{developerName} Team</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>English • Arabic</Text>
                  </div>
                </Space>
                <Button shape="round" icon={<MessageOutlined />} style={{ background: "#d9f99d", color: "#3f6212", border: "none", fontWeight: 600 }}>
                  Support
                </Button>
              </div>
            </Card> */}
          </div>
        </Col>
      </Row>

      {/* Photo Modal */}
      <Modal title={<Title level={5} style={{ margin: 0 }}>Property Gallery</Title>} open={isPhotoModalOpen} onCancel={() => setIsPhotoModalOpen(false)} footer={null} width={900} centered>
        <div style={{ marginTop: 20 }}>
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {allPhotos.map((photo, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <Image src={photo} alt={`Photo ${index + 1}`} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: "1px solid #f0f0f0" }} />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </div>
      </Modal>

      {/* Sales Offer Modal */}
      <Modal
        title={<div style={{ textAlign: 'center', width: '100%', fontSize: '18px', fontWeight: 'bold' }}>Generate Sales Offer</div>}
        open={isOfferModalOpen}
        onCancel={() => setIsOfferModalOpen(false)}
        footer={null}
        width={750}
        centered
        styles={{ body: { padding: '10px 24px 24px' } }}
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '5px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>PDF Preferences</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Configure your presentation before generation</div>

          <div style={{ marginTop: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Language</Text>
            <Select value={pdfPreferences.language} style={{ width: '100%' }} size="large" onChange={val => setPdfPreferences({ ...pdfPreferences, language: val })} loading={isTranslating}>
              {languages.map(l => (
                <Select.Option key={l.code} value={l.code}><strong style={{ marginRight: 8 }}>{l.code}</strong>{l.name}</Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Currency</Text>
            <Select value={pdfPreferences.currency} style={{ width: '100%' }} size="large" showSearch optionFilterProp="children" onChange={val => setPdfPreferences({ ...pdfPreferences, currency: val })}>
              {currencies.map(c => (
                <Select.Option key={c.code} value={c.code}><strong style={{ marginRight: 8 }}>{c.code}</strong>{c.name}</Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Measure units</Text>
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 4 }}>
              {['ft2', 'm2'].map(u => (
                <div key={u} onClick={() => setPdfPreferences({ ...pdfPreferences, measureUnit: u })}
                  style={{ flex: 1, textAlign: 'center', padding: '6px 0', cursor: 'pointer', borderRadius: 6, background: pdfPreferences.measureUnit === u ? '#fff' : 'transparent', fontWeight: pdfPreferences.measureUnit === u ? 'bold' : 'normal', color: pdfPreferences.measureUnit === u ? '#5C039B' : '#6b7280', boxShadow: pdfPreferences.measureUnit === u ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                  {u === 'ft2' ? 'ft²' : 'm²'}
                </div>
              ))}
            </div>
          </div>

          <Divider />

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>Display Settings</div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Cover slide', 'Project description', 'Developer', 'Unit prices', 'Payment plans', 'Location'].map(item => (
              <Checkbox key={item} defaultChecked={pdfPreferences.slides.includes(item)}
                onChange={e => {
                  let s = [...pdfPreferences.slides];
                  if (e.target.checked) { if (!s.includes(item)) s.push(item); } else { s = s.filter(x => x !== item); }
                  setPdfPreferences({ ...pdfPreferences, slides: s });
                }}>
                {item}
              </Checkbox>
            ))}
          </div>

          <Divider />

          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>Personalised description</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Adapt the project description yourself or with the help of XOTO AI.</div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }}>Description</Text>
            {isEditingDesc ? (
              <Input.TextArea rows={4} value={customDescription} onChange={e => setCustomDescription(e.target.value)} style={{ borderRadius: 8, marginBottom: 12, marginTop: 8 }} />
            ) : (
              <div style={{ maxHeight: 100, overflowY: 'auto', fontSize: 13, color: '#4b5563', marginBottom: 12, marginTop: 8 }}>{customDescription}</div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <Button style={{ flex: 1 }} icon={<EditOutlined />} onClick={() => setIsEditingDesc(!isEditingDesc)}>{isEditingDesc ? 'Save' : 'Edit'}</Button>
              <Button type="primary" style={{ flex: 1, background: 'linear-gradient(90deg,#5C039B 0%,#a855f7 100%)', border: 'none' }} icon={<RobotOutlined />} loading={isImprovingAI} onClick={handleImproveWithAI}>
                Improve with AI
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 15, marginTop: 24 }}>
            <Button size="large" icon={<EyeOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer('view')} style={{ flex: 1, height: 50, borderRadius: 10, fontWeight: 'bold' }}>Preview</Button>
            <Button type="primary" size="large" icon={<DownloadOutlined />} loading={isGenerating} onClick={() => handleGenerateOffer('download')} style={{ flex: 1, height: 50, borderRadius: 10, background: '#1f1f1f', fontWeight: 'bold', color: '#fff' }}>Download</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}