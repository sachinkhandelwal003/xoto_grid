// ════════════════════════════════════════════════════════════════════════════
// GridAdvisorLeadDetail.jsx — with AI Presentation Generator (fully synced)
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUser, FiHome, FiClock, FiPhone, FiMail, FiMapPin, FiDollarSign,
  FiCalendar, FiMessageSquare, FiTag, FiAlertCircle, FiActivity, FiLayers,
  FiArrowLeft, FiImage, FiInfo, FiXCircle, FiCheckCircle, FiSearch,
  FiChevronDown, FiChevronUp, FiAlertTriangle, FiFileText, FiRefreshCw,
  FiLoader, FiX, FiPlus, FiSend, FiEdit3, FiThumbsUp, FiThumbsDown,
  FiMinus, FiZap, FiList, FiArrowRight, FiStar, FiPackage, FiEye, FiCopy,
} from 'react-icons/fi';
import { message, Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

// ─── THEME ───────────────────────────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:                  { label: 'New',                  bg: '#dbeafe', text: '#1e40af' },
  contacted:            { label: 'Contacted',            bg: '#fef3c7', text: '#92400e' },
  in_discussion:        { label: 'In Discussion',        bg: '#fef9c3', text: '#854d0e' },
  site_visit_scheduled: { label: 'Site Visit Scheduled', bg: '#f3e8ff', text: '#6b21a8' },
  offer_made:           { label: 'Offer Made',           bg: '#cffafe', text: '#0e7490' },
  reserved:             { label: 'Reserved',             bg: '#e0e7ff', text: '#3730a3' },
  spa_signed:           { label: 'SPA Signed',           bg: '#dcfce7', text: '#166534' },
  completed:            { label: 'Completed',            bg: '#bbf7d0', text: '#14532d' },
  not_proceeding:       { label: 'Not Proceeding',       bg: '#fee2e2', text: '#991b1b' },
};

const STATUS_FLOW = [
  'new','contacted','in_discussion','site_visit_scheduled',
  'offer_made','reserved','spa_signed','completed',
];

const ADVISOR_STATUS_FLOW = [
  'new','contacted','in_discussion','site_visit_scheduled',
  'offer_made','reserved',
];


const getInventoryList = (item) => item?.inventory || item?.listing_inventory || item?.source?.listing_inventory || [];
const getRecordId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') return value._id || value.id || '';
  return value;
};
const getInventoryId = (unit) => getRecordId(unit);
const getLeadPropertyIds = (lead, targetProperty) => {
  const targetId = getRecordId(targetProperty);
  if (targetId) return [String(targetId)];

  const interestedIds = [
    ...(lead?.matched_listings || [])
      .filter((m) => m?.client_interested === true)
      .map((m) => getRecordId(m?.listing_id)),
    ...(lead?.advisor_suggestions || [])
      .filter((s) => s?.client_reaction === 'interested')
      .map((s) => getRecordId(s?.property_id)),
  ].filter(Boolean).map(String);

  const fallbackIds = [
    getRecordId(lead?.source?.listing_id || lead?.source?.property_id),
  ].filter(Boolean).map(String);

  return Array.from(new Set(interestedIds.length ? interestedIds : fallbackIds));
};
const unitBelongsToProperties = (unit, propertyIds) => {
  if (!propertyIds.length || !unit || typeof unit !== 'object') return true;
  const unitPropertyId = getRecordId(unit.propertyId || unit.property_id || unit.property);
  return !!unitPropertyId && propertyIds.includes(String(unitPropertyId));
};
const hasInventoryDetails = (unit) => !!(unit && typeof unit === 'object' && (
  unit.unitNumber || unit.unitNo || unit.unit_number || unit.bedroomType || unit.bedrooms != null || unit.area || unit.price || unit.status
));
const getInventoryLabel = (unit) => {
  if (!unit) return '';
  if (typeof unit !== 'object') return 'Selected unit (details unavailable)';
  const unitNumber = unit.unitNumber || unit.unitNo || unit.unit_number;
  const bedroom = unit.bedroomType || (unit.bedrooms != null ? (unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms}BR`) : null);
  const bits = [
    unitNumber ? `Unit ${unitNumber}` : null,
    unit.buildingName,
    bedroom,
    unit.area ? `${Number(unit.area).toLocaleString()} ${unit.areaUnit || 'sqft'}` : null,
    unit.price ? `${unit.currency || 'AED'} ${Number(unit.price).toLocaleString()}` : null,
    unit.status,
  ].filter(Boolean);
  return bits.join(' | ') || 'Selected unit (details unavailable)';
};
const InventorySummary = ({ units = [], selectedUnit }) => {
  const visible = selectedUnit ? [selectedUnit] : units.slice(0, 3);
  if (!visible.length) return <p className="mt-2 text-[10px] font-semibold text-gray-400">No inventory available</p>;
  return (
    <div className="mt-2 space-y-1.5">
      {visible.map((unit) => (
        <div key={getInventoryId(unit)} className="rounded-lg border border-purple-100 bg-purple-50 px-2.5 py-1.5 text-[10px] font-semibold text-purple-800">
          {selectedUnit ? 'Interested: ' : ''}{getInventoryLabel(unit)}
        </div>
      ))}
      {!selectedUnit && units.length > 3 && <p className="text-[10px] font-semibold text-gray-400">+{units.length - 3} more units</p>}
    </div>
  );
};

const REACTION_CONFIG = {
  interested:     { label: 'Interested',     bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', Icon: FiThumbsUp   },
  not_interested: { label: 'Not Interested', bg: '#fef2f2', color: '#dc2626', border: '#fecaca', Icon: FiThumbsDown },
  maybe:          { label: 'Maybe',          bg: '#fffbeb', color: '#d97706', border: '#fde68a', Icon: FiMinus      },
  pending:        { label: 'Pending',        bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', Icon: FiClock      },
};

// ─── ATOMS ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || { label: status || '—', bg: '#f3f4f6', text: '#374151' };
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#F5F3FF' }}>
      <Icon size={13} style={{ color: P }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5 break-words leading-snug">{value || '—'}</p>
    </div>
  </div>
);

const SectionBox = ({ title, icon: Icon, children, action, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
        style={{ background: accent || GR }}>
        <Icon size={14} />
      </div>
      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1">{title}</h4>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Btn = ({ children, onClick, variant = 'primary', loading, disabled, size = 'md', className = '' }) => {
  const base = 'flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-sm' };
  const vars = {
    primary: 'text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
    ghost:   'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50',
    danger:  'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100',
    success: 'text-white shadow-md hover:shadow-lg',
    amber:   'text-white shadow-md hover:shadow-lg',
  };
  const bgs = {
    primary: GR,
    success: 'linear-gradient(135deg,#059669,#10b981)',
    amber:   'linear-gradient(135deg,#d97706,#f59e0b)',
  };
  return (
    <button className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}
      style={bgs[variant] ? { background: bgs[variant] } : {}}
      onClick={onClick} disabled={disabled || loading}>
      {loading ? <FiLoader size={14} className="animate-spin" /> : children}
    </button>
  );
};

const ReactionPill = ({ reaction }) => {
  const cfg = REACTION_CONFIG[reaction] || REACTION_CONFIG.pending;
  const { Icon } = cfg;
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

// ─── AI PRESENTATION MODAL ────────────────────────────────────────────────────
// ✅ Fully synced with GridAgentLeadDetail version
const PresentationModal = ({ lead, property: initialProperty, onClose }) => {
  const [step,            setStep]           = useState(1);
  const [generating,      setGenerating]     = useState(false);
  const [saving,          setSaving]         = useState(false);
  const [narrative,       setNarrative]      = useState(null);

  // ✅ Two URLs — tracking (client) and preview (agent)
  const [trackingUrl,     setTrackingUrl]    = useState('');
  const [previewUrl,      setPreviewUrl]     = useState('');
  const [copied,          setCopied]         = useState(false);

  // ✅ initialProperty se start, API se full data fetch
  const [property,        setProperty]        = useState(initialProperty);
  const [propertyLoading, setPropertyLoading] = useState(false);

  useEffect(() => {
    if (!initialProperty?._id) return;
    setPropertyLoading(true);
    apiService.get(`/property/${initialProperty._id}`)
      .then(res => {
        const data = res?.data?.data || res?.data;
        if (data) setProperty(data);
      })
      .catch(() => console.warn('Full property fetch failed'))
      .finally(() => setPropertyLoading(false));
  }, [initialProperty._id]);

  const [settings, setSettings] = useState({
    language: 'English', currency: 'AED', areaUnit: 'sqft', tone: 'professional',
    sections: {
      cover: true, projectDescription: true, developer: true,
      unitPrices: true, paymentPlan: true, location: true, gallery: true, keyHighlights: true,
    },
  });

  const [clientNotes, setClientNotes] = useState({
    clientName: `${lead?.contact_info?.name?.first_name || ''} ${lead?.contact_info?.name?.last_name || ''}`.trim(),
    budget: lead?.requirements?.budget_max
      ? `AED ${Number(lead.requirements.budget_max).toLocaleString()}`
      : '',
    requirements: [
      lead?.requirements?.property_type,
      lead?.requirements?.bedrooms != null
        ? (lead.requirements.bedrooms === 0 ? 'Studio' : `${lead.requirements.bedrooms} BR`)
        : null,
      ...(lead?.requirements?.location_preferences || []).map(l => typeof l === 'string' ? l : l.area),
    ].filter(Boolean).join(', '),
  });

  // ✅ Fully synced buildCleanProperty — same as GridAgentLeadDetail
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
    bedrooms:          property.bedrooms     || 0,
    bathrooms:         property.bathrooms    || 0,
    builtUpArea:       property.builtUpArea  || 0,
    floors:            property.floors       || property.numberOfFloors || 0,
    furnishingStatus:  property.furnishingStatus || property.furnishing || '',
    ownershipType:     property.ownershipType || '',
    parkingAllocation: property.parkingAllocation || '',
    mainLogo:          property.mainLogo || property.media?.mainLogo || '',

    // ✅ Complete photo extraction — mainLogo + photos object + media object
    photos: (() => {
      const allPhotos = [];
      const mainLogo = property.mainLogo || property.media?.mainLogo;
      if (mainLogo) allPhotos.push(mainLogo);

      const ph = property.photos;
      if (ph && typeof ph === 'object' && !Array.isArray(ph)) {
        Object.values(ph).forEach(arr => {
          if (Array.isArray(arr)) allPhotos.push(...arr.filter(Boolean));
        });
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

    developer: property.developerName || '',

    // ✅ Full developerDetails extraction
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
    description:          property.description || property.overview || '',
    locality:             property.locality || property.area || '',
    location:             property.location || {},
    proximity:            property.proximity || {},
    isFeatured:           property.isFeatured || false,
    saleStatus:           property.saleStatus || 'Available',

    // ✅ facilities: object → readable array
    facilities: (() => {
      const f = property.facilities;
      if (!f) return [];
      if (Array.isArray(f)) return f;
      return Object.entries(f)
        .filter(([, v]) => v === true)
        .map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim());
    })(),

    amenities: Array.isArray(property.amenities) ? property.amenities : [],

    // ✅ paymentPlan: nested stages → flat array
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

    // ✅ unitTypes from inventory or unitTypes array
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

  // ── Step 1: Generate narrative ────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiService.post('/presentation/generate-narrative', {
        property: buildCleanProperty(), clientNotes, settings,
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { setNarrative(data.data); setStep(2); }
      else message.error(data?.message || 'Generation failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Generation failed'); }
    finally { setGenerating(false); }
  };

  // ── Step 2: Save → get both URLs ─────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiService.post('/presentation/save', {
        leadId: lead._id, propertyId: property._id, property: buildCleanProperty(),
        narrative, settings, clientNotes, agentProfile: {},
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        setTrackingUrl(data.data.trackingUrl);
        // ✅ Preview = tracking URL + ?preview=true (no tracking fired)
        setPreviewUrl(data.data.trackingUrl + '?preview=true');
        setStep(3);
        message.success('Presentation saved!');
      } else message.error(data?.message || 'Save failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waMessage = encodeURIComponent(
    `Hi ${clientNotes.clientName}! 👋\n\nPlease find the property presentation for *${property?.propertyName}* here:\n${trackingUrl}\n\n_Powered by Xoto GRID_`
  );

  const toggleSection = (key) =>
    setSettings(p => ({ ...p, sections: { ...p.sections, [key]: !p.sections[key] } }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}>
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
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
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
                  <input value={clientNotes.clientName}
                    onChange={e => setClientNotes(p => ({ ...p, clientName: e.target.value }))}
                    placeholder="Ahmed Ali"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">Budget</label>
                    <input value={clientNotes.budget}
                      onChange={e => setClientNotes(p => ({ ...p, budget: e.target.value }))}
                      placeholder="AED 1,500,000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1">Key Requirement</label>
                    <input value={clientNotes.requirements}
                      onChange={e => setClientNotes(p => ({ ...p, requirements: e.target.value }))}
                      placeholder="Sea view, 2BR..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
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
                  <select value={settings.language}
                    onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none">
                    {['English','Arabic','Hindi','Urdu','Russian'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1">Currency</label>
                  <select value={settings.currency}
                    onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none">
                    {['AED','USD','GBP','EUR','INR'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1">Area Unit</label>
                  <select value={settings.areaUnit}
                    onChange={e => setSettings(p => ({ ...p, areaUnit: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none">
                    <option value="sqft">sqft</option>
                    <option value="sqm">sqm</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-500 font-semibold mb-2">Tone</label>
                <div className="flex gap-2">
                  {['professional','luxury','friendly'].map(t => (
                    <button key={t} onClick={() => setSettings(p => ({ ...p, tone: t }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border capitalize transition-all
                        ${settings.tone === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>
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
                  <button key={key} onClick={() => toggleSection(key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all text-left
                      ${settings.sections[key] ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-400 bg-gray-50'}`}>
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
              <textarea rows={3} value={narrative.propertyOverview}
                onChange={e => setNarrative(p => ({ ...p, propertyOverview: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Key Highlights</label>
              <div className="space-y-2">
                {(narrative.keyHighlights || []).map((h, i) => (
                  <input key={i} value={h}
                    onChange={e => {
                      const updated = [...narrative.keyHighlights];
                      updated[i] = e.target.value;
                      setNarrative(p => ({ ...p, keyHighlights: updated }));
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location & Community</label>
              <textarea rows={2} value={narrative.locationCommunity}
                onChange={e => setNarrative(p => ({ ...p, locationCommunity: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Next Steps (CTA)</label>
              <textarea rows={2} value={narrative.nextSteps}
                onChange={e => setNarrative(p => ({ ...p, nextSteps: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
            </div>

            <button onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline">
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

            {/* ✅ Tracking URL — client ke liye */}
            <div>
              <label className="block text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">
                🔗 Client Link (Tracked) — Share This
              </label>
              <div className="flex gap-2">
                <input readOnly value={trackingUrl}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-sm text-purple-700 font-medium outline-none" />
                <button onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex-shrink-0
                    ${copied ? 'bg-green-50 border-green-300 text-green-700' : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'}`}>
                  {copied ? '✓ Copied' : <FiCopy size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-purple-500 mt-1 font-medium">
                ✓ Every open is tracked — device, time, and engagement score
              </p>
            </div>

            {/* ✅ Preview URL — agent ke liye only (no tracking) */}
            {previewUrl && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  👁 Your Preview (Not Tracked)
                </label>
                <a href={previewUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 transition-all">
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
                <a href={`https://wa.me/?text=${waMessage}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: '#25D366' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a href={`mailto:${lead?.contact_info?.email?.address || ''}?subject=Property Presentation — ${property?.propertyName}&body=${waMessage}`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                  <FiMail size={15} /> Email
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50">
              <p className="text-xs font-bold text-purple-700 mb-2">📊 Tracking kya karta hai:</p>
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

// ─── PROPERTY CARD (with Generate Presentation button) ────────────────────────
const PropertyCard = ({ property, onSuggest, alreadySuggested, suggesting, onGeneratePresentation }) => {
  const price = property.price_min || property.price || 0;
  const loc   = [property.area, property.city].filter(Boolean).join(', ');
  const inventory = getInventoryList(property);
  const selectedUnit = property.interested_inventory_unit || null;

  return (
    <div className={`rounded-2xl border overflow-hidden bg-white transition-all hover:shadow-md
      ${alreadySuggested ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'}`}>
      <div className="h-28 bg-slate-100 relative overflow-hidden">
        {property.mainLogo
          ? <img src={property.mainLogo} alt={property.propertyName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={28} /></div>}
        {property.isFeatured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>
        )}
        {alreadySuggested && (
          <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
            style={{ background: P, color: '#fff' }}>Suggested ✓</span>
        )}
      </div>
      <div className="p-3.5">
        <div className="text-sm font-bold text-gray-900 truncate leading-snug">{property.propertyName || property.title}</div>
        {loc && <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate"><FiMapPin size={10} /> {loc}</div>}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
          <span className="text-sm font-extrabold" style={{ color: P }}>
            {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}
          </span>
          <div className="flex gap-1.5 text-[10px] text-gray-400 font-medium">
            {property.bedrooms > 0 && <span>{property.bedrooms}BR</span>}
            {property.bathrooms > 0 && <span>· {property.bathrooms}BA</span>}
          </div>
        </div>
        <InventorySummary units={inventory} selectedUnit={selectedUnit} />
      </div>

      {/* Generate Presentation */}
      <div className="px-3.5 pb-2">
        <button
          onClick={() => onGeneratePresentation(property)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
          <FiFileText size={12} /> Generate Presentation
        </button>
      </div>

      <div className="px-3.5 pb-3.5">
        <Btn size="sm"
          variant={alreadySuggested ? 'ghost' : 'primary'}
          disabled={alreadySuggested || suggesting}
          loading={suggesting}
          onClick={() => onSuggest(property._id)}
          className="w-full">
          {alreadySuggested ? <><FiCheckCircle size={12} /> Suggested</> : <><FiSend size={12} /> Suggest to Client</>}
        </Btn>
      </div>
    </div>
  );
};

// ─── SUGGEST MODAL ────────────────────────────────────────────────────────────
const SuggestModal = ({ property, leadId, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const res  = await apiService.post(`/gridlead/${leadId}/suggest-property`, { property_id: property._id, inventory_unit_id: getInventoryId(property.interested_inventory_unit), note: note.trim() });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Property suggested to client'); onSuccess(); onClose(); }
      else message.error(data?.message || 'Failed to suggest property');
    } catch (e) { message.error(e?.response?.data?.message || 'Failed to suggest property'); }
    finally { setLoading(false); }
  };

  const price = property.price_min || property.price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Suggest Property to Client</h3>
            <p className="text-xs text-white/70 mt-0.5">Add a note to explain why this property fits</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
              {property.mainLogo ? <img src={property.mainLogo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={20} /></div>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{property.propertyName || property.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{[property.area, property.city].filter(Boolean).join(', ')}</p>
              <p className="text-sm font-extrabold mt-1" style={{ color: P }}>{price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Note for Client (optional)</p>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Why this property fits their requirements..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSuggest} loading={loading}><FiSend size={14} /> Suggest Property</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── REACTION MODAL ───────────────────────────────────────────────────────────
const ReactionModal = ({ suggestion, leadId, onClose, onSuccess }) => {
  const [reaction, setReaction] = useState(suggestion?.client_reaction === 'pending' ? '' : suggestion?.client_reaction || '');
  const [loading, setLoading] = useState(false);

  const options = [
    { value: 'interested',     label: 'Interested',     icon: FiThumbsUp,   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    { value: 'not_interested', label: 'Not Interested', icon: FiThumbsDown, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    { value: 'maybe',          label: 'Maybe',          icon: FiMinus,      color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  ];

  const handleSave = async () => {
    if (!reaction) return message.warning('Please select a reaction');
    setLoading(true);
    try {
      const res = await apiService.put(`/gridlead/${leadId}/suggestion-reaction`, {
        property_id: suggestion.property_id?._id || suggestion.property_id, reaction,
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Client reaction recorded'); onSuccess(); onClose(); }
      else message.error(data?.message || 'Failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const propName = typeof suggestion.property_id === 'object' ? (suggestion.property_id?.propertyName || 'Property') : 'Property';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Record Client Reaction</h3>
            <p className="text-xs text-white/70 mt-0.5 truncate max-w-xs">{propName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500 font-medium">What was the client's response to this property?</p>
          <div className="grid grid-cols-3 gap-3">
            {options.map(o => {
              const Icon = o.icon;
              return (
                <button key={o.value} onClick={() => setReaction(o.value)}
                  className="p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all"
                  style={reaction === o.value ? { background: o.bg, borderColor: o.border, color: o.color } : { background: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }}>
                  <Icon size={22} />
                  <span className="text-xs font-bold">{o.label}</span>
                  {reaction === o.value && <FiCheckCircle size={14} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} loading={loading} disabled={!reaction}><FiCheckCircle size={14} /> Record Reaction</Btn>
        </div>
      </div>
    </div>
  );
};


  

// ─── STATUS MODAL ─────────────────────────────────────────────────────────────
// ─── STATUS MODAL (Step-by-step, English only, one status at a time) ─────────
const REQUIRES_INVENTORY = ['reserved'];

const StatusModal = ({ lead, targetProperty, onClose, onSuccess }) => {
  const current = lead?.status || 'new';
  const currIdx = ADVISOR_STATUS_FLOW.indexOf(current);

  // Advisors can move the lead only up to Reserved. SPA and deal creation are admin-owned.
  const nextStatus = ADVISOR_STATUS_FLOW[currIdx + 1] || null;

  const [step,             setStep]             = useState(1); // 1 | 2 | 3
  const [status,           setStatus]           = useState(nextStatus || '');
  const [notes,            setNotes]            = useState('');
  const [inventoryUnitId,  setInventoryUnitId]  = useState(
    getInventoryId(lead?.deal_record?.inventory_unit_id) || ''
  );
  const [fetchedInventory, setFetchedInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [loading,          setLoading]          = useState(false);

  const propertyIds    = getLeadPropertyIds(lead, targetProperty);
  const needsInventory = REQUIRES_INVENTORY.includes(status);
  const isAdminStage   = ['reserved', 'spa_signed', 'completed'].includes(current);
  const isAlreadyDone  = (!nextStatus || isAdminStage) && current !== 'not_proceeding';

  // ── Fetch inventory ───────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    if (!propertyIds.length) { setFetchedInventory([]); return; }
    setInventoryLoading(true);
    Promise.all(
      propertyIds.map(pid =>
        apiService.get(`/properties/inventory?propertyId=${pid}`).catch(() => null)
      )
    ).then(responses => {
      const units = responses.flatMap(res => {
        const payload = res?.data?.data || res?.data || res;
        return Array.isArray(payload) ? payload : [];
      });
      if (active) setFetchedInventory(units);
    }).finally(() => { if (active) setInventoryLoading(false); });
    return () => { active = false; };
  }, [propertyIds.join('|')]);

  // ── Build inventory options ───────────────────────────────────────────────
  const inventorySources = [
    lead?.deal_record?.inventory_unit_id,
    lead?.source?.inventory_unit_id,
    ...(lead?.matched_listings    || []).map(m => m?.inventory_unit_id),
    ...(lead?.advisor_suggestions || []).map(s => s?.inventory_unit_id),
    ...getInventoryList(lead?.source),
    ...(lead?.matched_listings    || []).flatMap(m => [
      ...getInventoryList(m?.listing_id || m),
      ...(m?.interested_inventory_unit ? [m.interested_inventory_unit] : []),
    ]),
    ...(lead?.advisor_suggestions || []).flatMap(s => [
      ...getInventoryList(s?.property_id || s),
      ...(s?.interested_inventory_unit ? [s.interested_inventory_unit] : []),
    ]),
    ...fetchedInventory,
  ];
  const inventoryById = new Map();
  inventorySources
    .filter(unit => unit && unitBelongsToProperties(unit, propertyIds))
    .forEach(unit => {
      const id = String(getInventoryId(unit));
      if (!id) return;
      const existing = inventoryById.get(id);
      if (!existing || hasInventoryDetails(unit)) inventoryById.set(id, unit);
    });
  const inventoryOptions  = Array.from(inventoryById.values()).filter(hasInventoryDetails);
  const selectedHasOption = inventoryOptions.some(
    u => String(getInventoryId(u)) === String(inventoryUnitId)
  );

  // ── Step navigation ───────────────────────────────────────────────────────
  const goNext = () => {
    if (step === 1) {
      if (!status) return message.warning('Please select a status to proceed');
      setStep(needsInventory ? 2 : 3);
    } else if (step === 2) {
      if (!inventoryUnitId) return message.warning('Selecting an inventory unit is required');
      setStep(3);
    }
  };

  const goBack = () => {
    if (step === 3) setStep(needsInventory ? 2 : 1);
    else if (step === 2) setStep(1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { status, notes };
      if (needsInventory || inventoryUnitId) payload.inventoryUnitId = inventoryUnitId;

      const res  = await apiService.put(`/gridlead/${lead._id}/status`, payload);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success(`Status updated to "${STATUS_CONFIG[status]?.label || status}"`);
        onSuccess();
        onClose();
      } else {
        message.error(data?.message || 'Update failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Header step pills ─────────────────────────────────────────────────────
  const headerSteps = [
    { id: 'choose',    label: 'Select Status' },
    ...(needsInventory ? [{ id: 'inventory', label: 'Select Unit' }] : []),
    { id: 'confirm',   label: 'Confirm'       },
  ];
  const activeHeaderStep = needsInventory ? step : step === 3 ? 2 : step;

  const cfg = status ? STATUS_CONFIG[status] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div className="bg-white w-full sm:rounded-3xl sm:max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* ── Header ── */}
        <div
          className="px-6 py-5 flex items-start justify-between gap-4 flex-shrink-0"
          style={{ background: GR }}
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-white leading-tight">
              Update Lead Status
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              Status moves one step at a time
            </p>

            {/* Step pills */}
            <div className="flex items-center gap-2 mt-3">
              {headerSteps.map((s, i) => {
                const vs     = i + 1;
                const done   = vs < activeHeaderStep;
                const active = vs === activeHeaderStep;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-all
                          ${done   ? 'bg-white text-purple-700'
                          : active ? 'bg-white/30 text-white ring-2 ring-white'
                                   : 'bg-white/15 text-white/50'}`}
                      >
                        {done ? <FiCheckCircle size={11} /> : vs}
                      </div>
                      <span
                        className={`text-[10px] font-bold hidden sm:block transition-all
                          ${active ? 'text-white' : done ? 'text-white/80' : 'text-white/40'}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < headerSteps.length - 1 && (
                      <div
                        className={`flex-1 h-px min-w-[12px] transition-all
                          ${done ? 'bg-white/70' : 'bg-white/25'}`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 flex-shrink-0 mt-0.5"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* ══ STEP 1: SELECT STATUS ══ */}
          {step === 1 && (
            <>
              {/* Current status row */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-500 font-semibold">Current Status:</span>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: STATUS_CONFIG[current]?.bg  || '#f3f4f6',
                    color:      STATUS_CONFIG[current]?.text || '#374151',
                  }}
                >
                  {STATUS_CONFIG[current]?.label || current}
                </span>
              </div>

              {/* Already at final stage */}
              {isAlreadyDone ? (
                <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <FiCheckCircle size={30} className="mx-auto mb-2 text-green-400" />
                  <p className="text-sm font-bold text-gray-700">
                    {current === 'reserved' ? 'Lead reserved and sent to admin' : 'No advisor updates available'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {current === 'reserved'
                      ? 'Admin will upload SPA documents and create the deal record.'
                      : 'SPA and deal record steps are handled by admin.'}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Next Available Step
                  </p>

                  <div className="space-y-2">
                    {/* The one allowed next status */}
                    {nextStatus && (() => {
                      const s   = nextStatus;
                      const c   = STATUS_CONFIG[s];
                      const sel = status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => { setStatus(s); setInventoryUnitId(''); }}
                          className="w-full p-4 rounded-xl border-2 text-left transition-all"
                          style={
                            sel
                              ? { background: c.bg, borderColor: c.text, color: c.text }
                              : { background: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold">{c?.label || s}</p>
                              {REQUIRES_INVENTORY.includes(s) && (
                                <span
                                  className="mt-1.5 inline-block text-[9px] font-bold px-2 py-0.5 rounded-full"
                                  style={{ background: '#ede9fe', color: P }}
                                >
                                  Inventory unit required
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                ${sel ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}
                            >
                              {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })()}

                    {/* Divider */}
                    {nextStatus && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400 font-semibold">or close lead</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                    )}

                    {/* Not proceeding */}
                    {current !== 'not_proceeding' && (() => {
                      const s   = 'not_proceeding';
                      const c   = STATUS_CONFIG[s];
                      const sel = status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => { setStatus(s); setInventoryUnitId(''); }}
                          className="w-full p-4 rounded-xl border-2 text-left transition-all"
                          style={
                            sel
                              ? { background: c.bg, borderColor: c.text, color: c.text }
                              : { background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold">{c?.label || s}</p>
                              <p className="text-[10px] font-medium mt-0.5 opacity-70">
                                Mark this lead as closed / lost
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                ${sel ? 'border-red-600 bg-red-600' : 'border-red-300'}`}
                            >
                              {sel && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })()}
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ STEP 2: SELECT INVENTORY ══ */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <FiAlertCircle size={15} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-amber-800">
                  <strong>{STATUS_CONFIG[status]?.label}</strong> requires an inventory unit —
                  you cannot proceed without selecting one.
                </p>
              </div>

              {cfg && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold">Status:</span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {cfg.label}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">
                  Inventory Unit <span className="text-red-500">*</span>
                </label>

                {inventoryLoading ? (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <FiLoader size={14} className="animate-spin text-purple-500" />
                    <span className="text-sm text-gray-500">Loading inventory…</span>
                  </div>
                ) : inventoryOptions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 space-y-1">
                    <p className="text-sm font-bold text-red-700">
                      No inventory available for this property
                    </p>
                    <p className="text-xs text-red-500">
                      Add inventory to the property first, then come back to update the status.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inventoryOptions.map(unit => {
                      const uid  = String(getInventoryId(unit));
                      const isSel = String(inventoryUnitId) === uid;
                      return (
                        <button
                          key={uid}
                          onClick={() => setInventoryUnitId(uid)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 transition-all
                            ${isSel
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/40'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className="text-sm font-bold truncate"
                                style={{ color: isSel ? P : '#1f2937' }}
                              >
                                {getInventoryLabel(unit)}
                              </p>
                              {unit.status && (
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase">
                                  {unit.status}
                                </p>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                                ${isSel ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}
                            >
                              {isSel && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {inventoryUnitId && !selectedHasOption && (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="text-xs text-gray-500 font-medium">
                          Previously selected unit (details unavailable): {inventoryUnitId}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ STEP 3: CONFIRM ══ */}
          {step === 3 && (
            <>
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-green-50 border border-green-200">
                <FiCheckCircle size={15} className="text-green-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-green-800">
                  Everything looks good — review and confirm the update.
                </p>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Current Status
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: STATUS_CONFIG[current]?.bg  || '#f3f4f6',
                      color:      STATUS_CONFIG[current]?.text || '#374151',
                    }}
                  >
                    {STATUS_CONFIG[current]?.label || current}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-white">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                    Updating To
                  </span>
                  {cfg && (
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      {cfg.label}
                    </span>
                  )}
                </div>

                {needsInventory && inventoryUnitId && (
                  <div className="px-4 py-3 bg-gray-50">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
                      Inventory Unit
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {(() => {
                        const unit = inventoryOptions.find(
                          u => String(getInventoryId(u)) === String(inventoryUnitId)
                        );
                        return unit ? getInventoryLabel(unit) : inventoryUnitId;
                      })()}
                    </p>
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Note (optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Client confirmed visit for Saturday…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
          {step === 1 ? (
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          ) : (
            <Btn variant="ghost" onClick={goBack}>← Back</Btn>
          )}

          {step < 3 ? (
            <Btn
              variant="primary"
              onClick={goNext}
              disabled={
                (step === 1 && (!status || isAlreadyDone)) ||
                (step === 2 && (!inventoryUnitId || inventoryOptions.length === 0))
              }
            >
              {step === 1 && needsInventory && status
                ? 'Next: Select Unit →'
                : 'Next: Confirm →'}
            </Btn>
          ) : (
            <Btn variant="primary" onClick={handleUpdate} loading={loading}>
              <FiCheckCircle size={14} /> Confirm Update
            </Btn>
          )}
        </div>

      </div>
    </div>
  );
};

// ─── NOTE MODAL ───────────────────────────────────────────────────────────────
const NoteModal = ({ leadId, onClose, onAdded }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return message.warning('Note text is required');
    setLoading(true);
    try {
      const res  = await apiService.post(`/gridlead/${leadId}/note-advisor`, { text: text.trim() });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Note added'); onAdded(data.data); onClose(); }
      else message.error(data?.message || 'Failed');
    } catch { message.error('Note endpoint not available — use status update with notes'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <h3 className="text-base font-extrabold text-white">Add Note</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <textarea rows={5} value={text} autoFocus onChange={e => setText(e.target.value)} placeholder="Write your note about this lead or client..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAdd} loading={loading}><FiPlus size={14} /> Add Note</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── UPDATE REQUIREMENTS MODAL ────────────────────────────────────────────────
const UpdateReqModal = ({ lead, onClose, onSuccess }) => {
  const req = lead?.requirements || {};
  const [form, setForm] = useState({
    property_type:        req.property_type    || '',
    transaction_type:     req.transaction_type || 'buy',
    budget_min:           req.budget_min       || '',
    budget_max:           req.budget_max       || '',
    bedrooms:             req.bedrooms ?? '',
    bathrooms:            req.bathrooms ?? '',
    furnished:            req.furnished        || 'any',
    additional_notes:     req.additional_notes || '',
    location_preferences: (req.location_preferences || []).map(l => typeof l === 'string' ? l : l.area),
  });
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        requirements: {
          ...form,
          budget_min: form.budget_min ? Number(form.budget_min) : undefined,
          budget_max: form.budget_max ? Number(form.budget_max) : undefined,
          bedrooms:   form.bedrooms !== '' ? Number(form.bedrooms) : undefined,
          bathrooms:  form.bathrooms !== '' ? Number(form.bathrooms) : undefined,
          location_preferences: form.location_preferences.filter(l => l.trim()).map(l => ({ area: l })),
        },
        reason: reason || 'Requirements updated by advisor',
      };
      const res  = await apiService.put(`/gridlead/${lead._id}/update-requirements`, payload);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Requirements updated. Fresh matches loaded.'); onSuccess(data); }
      else message.error(data?.message || 'Update failed');
    } catch (e) { message.error(e?.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all';
  const selCls   = inputCls + ' appearance-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white w-full sm:rounded-3xl sm:max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Update Requirements</h3>
            <p className="text-xs text-white/70 mt-0.5">Fresh property matches will be generated</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Property Type', key: 'property_type', options: ['','Apartment','Villa','Townhouse','Penthouse','Studio','Office','Retail','Land'] },
              { label: 'Transaction',   key: 'transaction_type', options: ['buy','rent','invest'] },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
                <div className="relative">
                  <select value={form[key]} onChange={e => set(key, e.target.value)} className={selCls}>
                    {options.map(o => <option key={o} value={o}>{o === '' ? 'Any type' : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                  <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Min Budget (AED)</label>
              <input type="number" value={form.budget_min} placeholder="500,000" onChange={e => set('budget_min', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Max Budget (AED)</label>
              <input type="number" value={form.budget_max} placeholder="2,000,000" onChange={e => set('budget_max', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bedrooms</label>
              <div className="relative">
                <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className={selCls}>
                  <option value="">Any</option>
                  {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n === 0 ? 'Studio' : `${n} BR`}</option>)}
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Furnished</label>
              <div className="relative">
                <select value={form.furnished} onChange={e => set('furnished', e.target.value)} className={selCls}>
                  <option value="any">Any</option>
                  <option value="furnished">Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi_furnished">Semi Furnished</option>
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location Preferences</label>
            <div className="space-y-2">
              {form.location_preferences.map((loc, i) => (
                <div key={i} className="flex gap-2">
                  <div className="relative flex-1">
                    <FiMapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={loc} placeholder="e.g. Dubai Marina"
                      onChange={e => { const locs = [...form.location_preferences]; locs[i] = e.target.value; set('location_preferences', locs); }}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  </div>
                  <button onClick={() => set('location_preferences', form.location_preferences.filter((_, idx) => idx !== i))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-400 hover:bg-red-100">
                    <FiX size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => set('location_preferences', [...form.location_preferences, ''])}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100">
                <FiPlus size={13} /> Add Location
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Additional Notes</label>
            <textarea rows={2} value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)} placeholder="Special requirements…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reason for Update</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Client increased budget" className={inputCls} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} loading={loading}><FiRefreshCw size={14} /> Update & Re-match</Btn>
        </div>
      </div>
    </div>
  );
};

// ─── PROPERTY SEARCH PANEL ────────────────────────────────────────────────────
const PropertySearchPanel = ({ leadId, alreadySuggestedIds, onSuggested, onGeneratePresentation }) => {
  const [query,            setQuery]            = useState('');
  const [results,          setResults]          = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [suggestingId,     setSuggestingId]     = useState(null);
  const [showSuggestModal, setShowSuggestModal] = useState(null);
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) return setResults([]);
    setLoading(true);
    try {
      const res  = await apiService.get(`/properties?search=${encodeURIComponent(q)}&limit=8&approvalStatus=approved&listingStatus=active`);
      const data = res?.data?.data || res?.data || [];
      setResults(Array.isArray(data) ? data : []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  return (
    <div>
      {showSuggestModal && (
        <SuggestModal property={showSuggestModal} leadId={leadId}
          onClose={() => setShowSuggestModal(null)}
          onSuccess={() => { setShowSuggestModal(null); onSuggested(); }} />
      )}

      <div className="relative">
        <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={handleInput} placeholder="Search by property name, area, or developer..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
        {loading && <FiLoader size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400 animate-spin" />}
      </div>

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((p, i) => {
            const price = p.price_min || p.price || 0;
            const loc   = [p.area, p.city].filter(Boolean).join(', ');
            const isSuggested = alreadySuggestedIds.includes(String(p._id));
            return (
              <div key={p._id || i}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm
                  ${isSuggested ? 'border-purple-100 bg-purple-50' : 'border-gray-100 bg-white'}`}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  {p.mainLogo ? <img src={p.mainLogo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={18} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{p.propertyName || p.title}</p>
                  {loc && <p className="text-xs text-gray-400 mt-0.5 truncate"><FiMapPin size={9} className="inline mr-1" />{loc}</p>}
                  <p className="text-xs font-bold mt-1" style={{ color: P }}>
                    {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}
                    {p.bedrooms > 0 && ` · ${p.bedrooms}BR`}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => onGeneratePresentation(p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
                    <FiFileText size={10} /> PPT
                  </button>
                  <Btn size="sm" variant={isSuggested ? 'ghost' : 'primary'}
                    disabled={isSuggested || suggestingId === p._id} loading={suggestingId === p._id}
                    onClick={() => !isSuggested && setShowSuggestModal(p)}>
                    {isSuggested ? <><FiCheckCircle size={11} /> Suggested</> : <><FiSend size={11} /> Suggest</>}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <div className="mt-4 text-center py-6 text-gray-400 text-sm">
          <FiSearch size={28} className="mx-auto mb-2 opacity-30" />
          No properties found for "{query}"
        </div>
      )}

      {!query.trim() && (
        <div className="mt-4 text-center py-6 text-gray-400 text-sm">
          <FiSearch size={28} className="mx-auto mb-2 opacity-30" />
          Search the property catalogue to suggest alternatives
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const GridAdvisorLeadDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [lead,         setLead]         = useState(null);
  const [pageLoading,  setPageLoading]  = useState(true);
  const [matches,      setMatches]      = useState([]);
  const [matchType,    setMatchType]    = useState('');
  const [matchNote,    setMatchNote]    = useState('');
  const [matchLoading, setMatchLoading] = useState(false);
  const [isNurturing,  setIsNurturing]  = useState(false);

  const [activeTab, setActiveTab] = useState('matches');

  // Modals
  const [showStatus,    setShowStatus]    = useState(false);
  const [statusTargetProperty, setStatusTargetProperty] = useState(null);
  const [showNote,      setShowNote]      = useState(false);
  const [showReqs,      setShowReqs]      = useState(false);
  const [suggestModal,  setSuggestModal]  = useState(null);
  const [reactionModal, setReactionModal] = useState(null);

  // Presentation modal
  const [showPresentation, setShowPresentation] = useState(false);
  const [selectedProperty,  setSelectedProperty]  = useState(null);

  const [showNotes,   setShowNotes]   = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const fetchLead = useCallback(async () => {
    setPageLoading(true);
    try {
      const res  = await apiService.get(`/gridlead/${id}`);
      const data = res?.data?.data || res?.data;
      setLead(data);
    } catch { message.error('Failed to load lead'); }
    finally { setPageLoading(false); }
  }, [id]);

  const fetchMatches = useCallback(async () => {
    setMatchLoading(true);
    try {
      const res     = await apiService.get(`/gridlead/${id}/smart-matches`);
      const payload = res?.data?.success !== undefined ? res.data : res;
      setMatches(payload?.data || []);
      setMatchType(payload?.matchType || '');
      setMatchNote(payload?.note || '');
      setIsNurturing(payload?.is_nurturing || false);
    } catch { setMatches([]); setMatchType('none'); }
    finally { setMatchLoading(false); }
  }, [id]);

  useEffect(() => {
    if (id) { fetchLead(); fetchMatches(); }
  }, [id, fetchLead, fetchMatches]);

  const handleGeneratePresentation = (property) => {
    setSelectedProperty(property);
    setShowPresentation(true);
  };

  const openStatusModal = (property = null) => {
    setStatusTargetProperty(property);
    setShowStatus(true);
  };

  const fn      = lead?.contact_info?.name?.first_name || '';
  const ln      = lead?.contact_info?.name?.last_name  || '';
  const phone   = lead?.contact_info?.mobile?.number   || '—';
  const cc      = lead?.contact_info?.mobile?.country_code || '';
  const email   = lead?.contact_info?.email?.address   || null;
  const req     = lead?.requirements || {};
  const locs    = (req.location_preferences || []).map(l => typeof l === 'string' ? l : l.area).filter(Boolean);
  const notes   = lead?.notes || [];
  const hist    = lead?.status_history || [];
  const suggestions = lead?.advisor_suggestions || [];

  const alreadySuggestedIds = suggestions.map(s => String(s.property_id?._id || s.property_id));
  const interestedCount = suggestions.filter(s => s.client_reaction === 'interested').length;
  const pendingCount    = suggestions.filter(s => s.client_reaction === 'pending').length;

  const handleReqsSuccess = (data) => {
    setShowReqs(false);
    if (data?.new_matches?.data) {
      setMatches(data.new_matches.data);
      setMatchType(data.new_matches.matchType || '');
      setMatchNote(data.new_matches.note || '');
    }
    fetchLead();
  };

  const handleSuggestFromMatch = (property) => {
    if (alreadySuggestedIds.includes(String(property._id))) return message.info('Already suggested to client');
    setSuggestModal(property);
  };

  if (pageLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Spin size="large" />
      <p className="mt-4 text-gray-400 font-medium text-sm">Loading lead…</p>
    </div>
  );

  if (!lead) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <FiAlertCircle size={48} className="text-gray-300" />
      <p className="text-gray-500">Lead not found or access denied.</p>
      <Btn variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={14} /> Go Back</Btn>
    </div>
  );

  const MC_CONFIG = {
    exact:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Exact Match',   Icon: FiCheckCircle },
    relaxed: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Relaxed Match', Icon: FiActivity    },
    broad:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Broader Area',  Icon: FiMapPin      },
    none:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'No Matches',    Icon: FiXCircle     },
  };
  const mc = MC_CONFIG[matchType] || null;

  return (
    <>
      {/* ── MODALS ── */}
      {showStatus   && <StatusModal lead={lead} targetProperty={statusTargetProperty} onClose={() => { setShowStatus(false); setStatusTargetProperty(null); }} onSuccess={fetchLead} />}
      {showNote     && <NoteModal leadId={id} onClose={() => setShowNote(false)} onAdded={() => fetchLead()} />}
      {showReqs     && <UpdateReqModal lead={lead} onClose={() => setShowReqs(false)} onSuccess={handleReqsSuccess} />}
      {suggestModal && (
        <SuggestModal property={suggestModal} leadId={id}
          onClose={() => setSuggestModal(null)}
          onSuccess={() => { setSuggestModal(null); fetchLead(); }} />
      )}
      {reactionModal && (
        <ReactionModal suggestion={reactionModal} leadId={id}
          onClose={() => setReactionModal(null)}
          onSuccess={() => { setReactionModal(null); fetchLead(); }} />
      )}
      {showPresentation && selectedProperty && (
        <PresentationModal
          lead={lead}
          property={selectedProperty}
          onClose={() => { setShowPresentation(false); setSelectedProperty(null); }}
        />
      )}

      <div className="min-h-screen bg-slate-50 font-sans">

        {/* ── TOP BAR ── */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                <FiArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-gray-900 truncate">{`${fn} ${ln}`.trim() || 'Unknown Client'}</h1>
                <p className="text-xs text-gray-400 font-medium">Lead · {String(lead._id).slice(-8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={lead.status} />
              <span className="px-2.5 py-1 rounded-full text-xs font-bold border"
                style={{
                  background: lead.classification === 'hot' ? '#fef2f2' : lead.classification === 'warm' ? '#fffbeb' : '#f9fafb',
                  color: lead.classification === 'hot' ? '#dc2626' : lead.classification === 'warm' ? '#d97706' : '#6b7280',
                  borderColor: lead.classification === 'hot' ? '#fecaca' : lead.classification === 'warm' ? '#fde68a' : '#e5e7eb',
                }}>
                {lead.classification?.charAt(0).toUpperCase() + lead.classification?.slice(1) || '—'}
              </span>
              <Btn variant="primary" size="sm" onClick={() => openStatusModal()}>
                <FiEdit3 size={12} /> Update Status
              </Btn>
            </div>
          </div>
        </div>

        {/* ── NURTURING BANNER ── */}
        {isNurturing && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <FiAlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Client in Nurturing Mode</p>
                <p className="text-xs text-amber-700 mt-0.5">No exact matches found. Suggest properties manually or update requirements.</p>
              </div>
              <Btn variant="amber" size="sm" onClick={() => setActiveTab('suggest')}>
                <FiSearch size={12} /> Search Properties
              </Btn>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT SIDEBAR ── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Avatar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 shadow-lg"
                    style={{ background: GR }}>{(fn?.[0] || '?').toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold text-gray-900 leading-tight truncate">{`${fn} ${ln}`.trim() || 'Unknown'}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lead.enquiry_type && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                          {lead.enquiry_type.replace(/_/g, ' ')}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: '#f5f3ff', color: P, border: '1px solid #ddd6fe' }}>
                        {lead.lead_type || 'platform'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <SectionBox title="Contact Info" icon={FiUser}>
                <InfoRow icon={FiPhone}         label="Phone"    value={`${cc} ${phone}`.trim()} />
                {email && <InfoRow icon={FiMail} label="Email"   value={email} />}
                <InfoRow icon={FiMessageSquare} label="Preferred" value={lead.contact_info?.preferred_contact || '—'} />
              </SectionBox>

              {/* Requirements */}
              <SectionBox title="Client Requirements" icon={FiTag}
                action={
                  <button onClick={() => setShowReqs(true)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100">
                    <FiEdit3 size={11} /> Edit
                  </button>
                }>
                {req.property_type    && <InfoRow icon={FiHome}        label="Type"        value={req.property_type} />}
                {req.transaction_type && <InfoRow icon={FiTag}         label="Transaction" value={req.transaction_type} />}
                {(req.budget_min || req.budget_max) && (
                  <InfoRow icon={FiDollarSign} label="Budget" value={
                    req.budget_min && req.budget_max
                      ? `AED ${Number(req.budget_min).toLocaleString()} – ${Number(req.budget_max).toLocaleString()}`
                      : req.budget_max ? `Up to AED ${Number(req.budget_max).toLocaleString()}` : `From AED ${Number(req.budget_min).toLocaleString()}`
                  } />
                )}
                {req.bedrooms  != null && <InfoRow icon={FiHome}    label="Bedrooms"   value={req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`} />}
                {req.furnished         && <InfoRow icon={FiHome}    label="Furnishing"  value={req.furnished} />}
                {locs.length > 0       && <InfoRow icon={FiMapPin}  label="Locations"   value={locs.join(', ')} />}
                {req.additional_notes  && <InfoRow icon={FiMessageSquare} label="Notes" value={req.additional_notes} />}
              </SectionBox>

              {/* Suggestion summary */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Suggestion Summary</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Total',      value: suggestions.length, bg: '#f5f3ff', color: P },
                      { label: 'Interested', value: interestedCount,    bg: '#f0fdf4', color: '#16a34a' },
                      { label: 'Pending',    value: pendingCount,       bg: '#fffbeb', color: '#d97706' },
                    ].map((s, i) => (
                      <div key={i} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                        <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead meta */}
              <SectionBox title="Lead Info" icon={FiLayers} accent="#475569">
                <InfoRow icon={FiLayers} label="Source"  value={lead.source?.channel?.replace(/_/g, ' ') || '—'} />
                <InfoRow icon={FiClock}  label="Created" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-AE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'} />
                {lead.assigned_at && <InfoRow icon={FiCalendar} label="Assigned" value={new Date(lead.assigned_at).toLocaleString('en-AE', { day:'2-digit', month:'short', year:'numeric' })} />}
                {lead.classification_reason && <InfoRow icon={FiAlertCircle} label="Classification" value={lead.classification_reason} />}
              </SectionBox>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="space-y-2">
                  <Btn variant="primary" size="sm" onClick={() => openStatusModal()} className="w-full"><FiEdit3 size={13} /> Update Lead Status</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => setShowReqs(true)} className="w-full"><FiRefreshCw size={13} /> Update Requirements</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => setShowNote(true)} className="w-full"><FiFileText size={13} /> Add Note</Btn>
                  <Btn variant="ghost" size="sm" onClick={() => setActiveTab('suggest')} className="w-full"><FiSearch size={13} /> Search & Suggest Property</Btn>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="lg:col-span-8 space-y-5">

              {/* Tab bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100">
                  {[
                    { key: 'matches',     label: 'Smart Matches',    icon: FiZap,    count: matches.length },
                    { key: 'suggest',     label: 'Search & Suggest', icon: FiSearch, count: null },
                    { key: 'suggestions', label: 'My Suggestions',   icon: FiList,   count: suggestions.length },
                  ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition-all border-b-2
                        ${activeTab === tab.key ? 'border-purple-600 text-purple-700 bg-purple-50/60' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                      <tab.icon size={14} />
                      {tab.label}
                      {tab.count != null && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-5">

                  {/* ── SMART MATCHES ── */}
                  {activeTab === 'matches' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {mc && !matchLoading && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
                              <mc.Icon size={10} /> {mc.label}
                            </span>
                          )}
                          {matchNote && <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium"><FiInfo size={12} /> {matchNote}</span>}
                        </div>
                        <Btn variant="ghost" size="sm" onClick={fetchMatches} loading={matchLoading}><FiRefreshCw size={12} /> Refresh</Btn>
                      </div>

                      {matchLoading && (
                        <div className="text-center py-10">
                          <FiLoader size={24} className="animate-spin mx-auto mb-3" style={{ color: P }} />
                          <p className="text-xs text-gray-400">Finding best matches…</p>
                        </div>
                      )}

                      {!matchLoading && (matchType === 'none' || (isNurturing && matches.length === 0)) && (
                        <div className="p-5 rounded-2xl bg-red-50 border border-red-100 mb-4 text-center">
                          <FiXCircle size={28} className="mx-auto mb-3 text-red-300" />
                          <p className="text-sm font-bold text-red-600 mb-1">No matching properties found</p>
                          <p className="text-xs text-red-700 leading-relaxed max-w-sm mx-auto">
                            Suggest properties manually using the <strong>Search & Suggest</strong> tab, or update requirements.
                          </p>
                          <div className="flex gap-2 justify-center mt-4">
                            <Btn variant="primary" size="sm" onClick={() => setActiveTab('suggest')}><FiSearch size={12} /> Search Properties</Btn>
                            <Btn variant="ghost" size="sm" onClick={() => setShowReqs(true)}><FiEdit3 size={12} /> Update Requirements</Btn>
                          </div>
                        </div>
                      )}

                      {!matchLoading && matches.length > 0 && (
                        <>
                          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                            These properties match the client's requirements. Click <strong>Suggest to Client</strong> or <strong>Generate Presentation</strong>.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {matches.map((p, i) => (
                              <PropertyCard key={p._id || i} property={p}
                                onSuggest={() => handleSuggestFromMatch(p)}
                                alreadySuggested={alreadySuggestedIds.includes(String(p._id))}
                                onGeneratePresentation={handleGeneratePresentation}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── SEARCH & SUGGEST ── */}
                  {activeTab === 'suggest' && (
                    <div>
                      <div className="mb-4">
                        <p className="text-sm font-bold text-gray-800 mb-1">Search the Property Catalogue</p>
                        <p className="text-xs text-gray-500 leading-relaxed">Find properties, generate presentations, or suggest directly to the client.</p>
                      </div>
                      <PropertySearchPanel
                        leadId={id}
                        alreadySuggestedIds={alreadySuggestedIds}
                        onSuggested={() => fetchLead()}
                        onGeneratePresentation={handleGeneratePresentation}
                      />
                    </div>
                  )}

                  {/* ── MY SUGGESTIONS ── */}
                  {activeTab === 'suggestions' && (
                    <div>
                      {suggestions.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <FiPackage size={32} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">No suggestions yet</p>
                          <p className="text-xs mt-1 mb-4">Use Smart Matches or Search to suggest properties</p>
                          <Btn variant="primary" size="sm" onClick={() => setActiveTab('matches')}><FiZap size={12} /> View Smart Matches</Btn>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Summary */}
                          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex-wrap">
                            <span className="text-xs text-gray-500 font-medium">Client reactions:</span>
                            {[
                              { r: 'interested',     color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                              { r: 'not_interested', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                              { r: 'maybe',          color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                              { r: 'pending',        color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
                            ].map(({ r, color, bg, border }) => {
                              const cnt = suggestions.filter(s => (s.client_reaction || 'pending') === r).length;
                              if (cnt === 0) return null;
                              return (
                                <span key={r} className="px-2.5 py-1 rounded-full text-xs font-bold border"
                                  style={{ background: bg, color, borderColor: border }}>
                                  {cnt} {REACTION_CONFIG[r]?.label}
                                </span>
                              );
                            })}
                          </div>

                          {suggestions.map((s, i) => {
                            const prop     = s.property_id;
                            const propName = typeof prop === 'object' ? (prop?.propertyName || prop?.title || 'Property') : `Property ID: ${String(prop).slice(-6)}`;
                            const price    = typeof prop === 'object' ? (prop?.price_min || prop?.price || 0) : 0;
                            const loc      = typeof prop === 'object' ? [prop?.area, prop?.city].filter(Boolean).join(', ') : '';
                            const reaction = s.client_reaction || 'pending';
                            const rcfg     = REACTION_CONFIG[reaction];

                            return (
                              <div key={i} className={`rounded-2xl border overflow-hidden transition-all
                                ${reaction === 'interested' ? 'border-green-200 bg-green-50/30' :
                                  reaction === 'not_interested' ? 'border-red-100' :
                                  reaction === 'maybe' ? 'border-amber-100' : 'border-gray-100 bg-white'}`}>
                                <div className="flex gap-3 p-4">
                                  {typeof prop === 'object' && prop?.mainLogo
                                    ? <img src={prop.mainLogo} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                                    : <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-300"><FiImage size={20} /></div>}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{propName}</p>
                                        {loc && <p className="text-xs text-gray-400 mt-0.5 truncate"><FiMapPin size={9} className="inline mr-1" />{loc}</p>}
                                        {price > 0 && <p className="text-sm font-extrabold mt-1" style={{ color: P }}>AED {Number(price).toLocaleString()}</p>}
                                      </div>
                                      <ReactionPill reaction={reaction} />
                                    </div>
                                    {s.interested_inventory_unit && <p className="text-[10px] font-semibold text-purple-700 mt-1">Unit: {getInventoryLabel(s.interested_inventory_unit)}</p>}
                                    {s.note && (
                                      <p className="text-xs text-gray-500 mt-2 bg-white rounded-lg p-2 border border-gray-100 leading-relaxed">"{s.note}"</p>
                                    )}
                                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <FiClock size={10} />
                                        Suggested {s.suggested_at ? new Date(s.suggested_at).toLocaleDateString('en-AE', { day:'2-digit', month:'short' }) : '—'}
                                      </span>
                                      <div className="flex gap-2">
                                        {typeof prop === 'object' && prop?._id && (
                                          <button onClick={() => handleGeneratePresentation(prop)}
                                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all">
                                            <FiFileText size={10} /> PPT
                                          </button>
                                        )}
                                        <button onClick={() => setReactionModal(s)}
                                          className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all"
                                          style={{ background: rcfg.bg, color: rcfg.color, borderColor: rcfg.border }}>
                                          <FiEdit3 size={10} />
                                          {reaction === 'pending' ? 'Record Reaction' : 'Update Reaction'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {reaction === 'interested' && (
                                  <div className="px-4 pb-3">
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200">
                                      <FiCheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                      <p className="text-xs font-semibold text-green-800">
                                        Client is interested — progress the lead status
                                      </p>
                                      <button onClick={() => openStatusModal(prop)}
                                        className="ml-auto flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 flex-shrink-0">
                                        Progress <FiArrowRight size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Progress */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Lead Progress</p>
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {ADVISOR_STATUS_FLOW.map((s, i) => {
                    const cfg = STATUS_CONFIG[s];
                    const currIdx    = ADVISOR_STATUS_FLOW.indexOf(lead.status);
                    const isCompleted = i < currIdx;
                    const isCurrent   = i === currIdx;
                    return (
                      <React.Fragment key={s}>
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                            ${isCompleted ? 'border-green-400 bg-green-400' : isCurrent ? 'border-purple-600 bg-purple-600' : 'border-gray-200 bg-white'}`}>
                            {isCompleted
                              ? <FiCheckCircle size={14} className="text-white" />
                              : isCurrent ? <div className="w-3 h-3 rounded-full bg-white" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                          </div>
                          <span className={`text-[9px] font-bold text-center leading-tight max-w-[52px]
                            ${isCurrent ? 'text-purple-700' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                            {cfg?.label || s}
                          </span>
                        </div>
                        {i < ADVISOR_STATUS_FLOW.length - 1 && (
                          <div className={`flex-1 h-0.5 mb-5 min-w-[12px] ${isCompleted ? 'bg-green-400' : 'bg-gray-100'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                {lead.status === 'not_proceeding' && (
                  <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                    <FiXCircle size={14} className="text-red-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-700">Lead marked as Not Proceeding</span>
                  </div>
                )}
              </div>

              {/* ── NOTES — fixed height + scroll ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNotes(p => !p)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: GR }}>
                    <FiMessageSquare size={14} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
                    Notes
                    {notes.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{notes.length}</span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); setShowNote(true); }}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100">
                      <FiPlus size={11} /> Add
                    </button>
                    {showNotes ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                  </div>
                </button>

                {showNotes && (
                  <div className="p-5">
                    {notes.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-4">No notes yet. Click Add to write one.</p>
                    ) : (
                      /* ✅ Fixed height + scrollable notes list */
                      <div className="max-h-72 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {[...notes].reverse().map((n, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {(n.author?.[0] || 'A').toUpperCase()}
                              </span>
                              <span className="text-xs font-bold text-gray-600">{n.author || 'Advisor'}</span>
                              {n.author_type && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-500 uppercase">{n.author_type}</span>
                              )}
                              <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                                <FiClock size={10} />
                                {(n.created_at || n.createdAt)
                                  ? new Date(n.created_at || n.createdAt).toLocaleDateString('en-AE', { day:'2-digit', month:'short', year:'numeric' })
                                  : '—'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status History */}
              {hist.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowHistory(p => !p)}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white" style={{ background: GR }}>
                      <FiActivity size={14} />
                    </div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
                      Status Timeline
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{hist.length}</span>
                    </h4>
                    {showHistory ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
                  </button>
                  {showHistory && (
                    <div className="px-5 pb-5">
                      <div className="relative">
                        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-100" />
                        <div className="space-y-4">
                          {[...hist].reverse().map((h, i) => (
                            <div key={i} className="relative pl-10">
                              <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center" style={{ background: P }}>
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <StatusBadge status={h.status} />
                                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <FiCalendar size={10} />
                                    {h.changed_at ? new Date(h.changed_at).toLocaleDateString('en-AE', { day:'2-digit', month:'short' }) : '—'}
                                  </span>
                                </div>
                                {h.notes && <p className="text-xs text-gray-500 leading-relaxed">{h.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GridAdvisorLeadDetail;
