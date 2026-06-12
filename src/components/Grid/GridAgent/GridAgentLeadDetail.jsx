import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUser, FiHome, FiClock, FiPhone, FiMail, FiMapPin, FiDollarSign,
  FiCalendar, FiMessageSquare, FiTag, FiAlertCircle, FiActivity, FiLayers,
  FiArrowLeft, FiImage, FiInfo, FiXCircle, FiCheckCircle, FiThumbsUp,
  FiThumbsDown, FiMinus, FiSend, FiEdit3, FiPlus, FiX, FiLoader,
  FiChevronDown, FiChevronUp, FiAlertTriangle, FiFileText, FiRefreshCw,
  FiEye, FiCopy,
} from 'react-icons/fi';
import { message, Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { StatusBadge, ClassBadge, EnquiryTag } from './GridAgentLead';

// ─── THEME ───────────────────────────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── MATCH CONFIG ─────────────────────────────────────────────────────────────
const MC = {
  exact:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Exact Match',   Icon: FiCheckCircle },
  relaxed: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Relaxed Match', Icon: FiActivity },
  broad:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Broader Area',  Icon: FiMapPin },
  none:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'No Matches',    Icon: FiXCircle },
};

const isAssignmentText = (v) => {
  const t = String(v || '').toLowerCase();
  return t.includes('assigned') || t.includes('assign advisor') || t.includes('advisor');
};


const hasInventoryDetail = (unit) => {
  if (!unit || typeof unit !== 'object') return false;
  return Boolean(
    unit.unitNumber || unit.unit_number || unit.unitNo || unit.unit_no || unit.number ||
    unit.bedroomType || unit.bedroom_type || unit.bedrooms != null || unit.bedroom != null ||
    unit.area || unit.builtUpArea || unit.built_up_area || unit.sqft || unit.size ||
    unit.price || unit.price_min || unit.startingPrice || unit.starting_price || unit.salePrice || unit.amount ||
    unit.status || unit.availability || unit.inventoryStatus || unit.inventory_status
  );
};
const getInventoryList = (item) => {
  const candidates = [
    item?.listing_inventory,
    item?.source?.listing_inventory,
    item?.property_inventory,
    item?.availableUnits,
    item?.units,
    item?.inventory,
  ];

  for (const list of candidates) {
    if (!Array.isArray(list) || !list.length) continue;
    const detailed = list.filter(hasInventoryDetail);
    if (detailed.length) return detailed;
  }

  return [];
};
const getInventoryId = (unit) => {
  if (!unit || typeof unit !== 'object') return unit;
  return unit._id || unit.id || unit.inventoryId || unit.inventory_id || unit.unitId || unit.unit_id || unit.unitNumber || unit.unit_number || `${unit.unitType || unit.unit_type || 'unit'}-${unit.area || unit.builtUpArea || unit.price || ''}`;
};
const getInventoryLabel = (unit) => {
  if (!unit) return '';
  if (typeof unit !== 'object') return String(unit);

  const unitNumber = unit.unitNumber || unit.unit_number || unit.unitNo || unit.unit_no || unit.unit || unit.number;
  const bedroomValue = unit.bedroomType || unit.bedroom_type || unit.bedrooms || unit.bedroom;
  const unitType = unit.unitType || unit.unit_type || unit.type || unit.configuration || unit.propertyType;
  const areaValue = unit.area || unit.builtUpArea || unit.built_up_area || unit.sqft || unit.size || unit.areaFrom || unit.area_from;
  const areaUnit = unit.areaUnit || unit.area_unit || unit.builtUpAreaUnit || 'sqft';
  const priceValue = unit.price || unit.price_min || unit.startingPrice || unit.starting_price || unit.salePrice || unit.amount;
  const currency = unit.currency || 'AED';
  const status = unit.status || unit.availability || unit.inventoryStatus || unit.inventory_status;

  const bedroomLabel = bedroomValue != null && bedroomValue !== ''
    ? (String(bedroomValue).toLowerCase() === 'studio' || Number(bedroomValue) === 0 ? 'Studio' : String(bedroomValue).match(/br|bed/i) ? String(bedroomValue) : `${bedroomValue}BR`)
    : null;

  const bits = [
    unitNumber ? `Unit ${unitNumber}` : null,
    bedroomLabel || unitType,
    areaValue ? `${Number(areaValue).toLocaleString()} ${areaUnit}` : null,
    priceValue ? `${currency} ${Number(priceValue).toLocaleString()}` : null,
    status,
  ].filter(Boolean);

  if (bits.length) return bits.join(' | ');

  const fallback = Object.entries(unit)
    .filter(([, value]) => value !== null && value !== undefined && value !== '' && typeof value !== 'object')
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');

  return fallback || 'Inventory unit';
};
const InventorySummary = ({ units = [], selectedUnit }) => {
  const visible = selectedUnit ? [selectedUnit] : units.slice(0, 3);
  if (!visible.length) return null;
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

const sanitize = (lead) => {
  if (!lead || typeof lead !== 'object') return lead;
  const { assigned_to, assignedAdvisor, assigned_at, assigned_by, assignment_notes, ...safe } = lead;
  return {
    ...safe,
    notes: Array.isArray(lead.notes)
      ? lead.notes.filter(n => !isAssignmentText(n?.text || n?.notes || n))
      : lead.notes,
    status_history: Array.isArray(lead.status_history)
      ? lead.status_history.filter(e => !isAssignmentText(e?.status) && !isAssignmentText(e?.notes))
      : lead.status_history,
  };
};

// ─── TINY UI ATOMS ────────────────────────────────────────────────────────────
const Tag = ({ children, color = P, bg = '#F5F3FF', border = '#DDD6FE' }) => (
  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
    style={{ color, background: bg, border: `1px solid ${border}` }}>
    {children}
  </span>
);

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

const SectionBox = ({ title, icon: Icon, children, action }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P, color: '#fff' }}>
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
  };
  const bg = variant === 'primary' ? GR : variant === 'success' ? 'linear-gradient(135deg,#059669,#10b981)' : '';
  return (
    <button className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}
      style={bg ? { background: bg } : {}} onClick={onClick} disabled={disabled || loading}>
      {loading ? <FiLoader size={14} className="animate-spin" /> : children}
    </button>
  );
};

// ─── PROPERTY CARD ────────────────────────────────────────────────────────────
const PropertyCard = ({ property, matchType, reaction, onReact, saving, onGeneratePresentation, selectedInventoryId, onInventoryChange }) => {
  const price = property.price_min || property.price || 0;
  const loc   = [property.area, property.city].filter(Boolean).join(', ');
  const mc    = MC[matchType] || MC.broad;
  const inventory = getInventoryList(property);
  const interestedUnit = property.interested_inventory_unit || inventory.find(u => getInventoryId(u) === selectedInventoryId) || null;

  return (
    <div className={`rounded-2xl border overflow-hidden bg-white transition-all duration-200 hover:shadow-md
      ${reaction === true ? 'border-green-200 ring-1 ring-green-200' : reaction === false ? 'border-red-100' : 'border-gray-100'}`}>

      {/* Image */}
      <div className="h-28 bg-slate-100 relative overflow-hidden">
        {property.mainLogo ? (
          <img src={property.mainLogo} alt={property.propertyName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={28} /></div>
        )}
        <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
          style={{ background: mc.color, color: '#fff' }}>{matchType}</span>
        {property.isFeatured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="text-sm font-bold text-gray-900 truncate leading-snug">{property.propertyName}</div>
        {loc && <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate"><FiMapPin size={10} /> {loc}</div>}
        <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-gray-50">
          <span className="text-sm font-extrabold" style={{ color: P }}>
            {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}
          </span>
          <div className="flex gap-1 text-[10px] text-gray-400 font-medium">
            {property.bedrooms > 0 && <span>{property.bedrooms}BR</span>}
            {property.bathrooms > 0 && <span>· {property.bathrooms}BA</span>}
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-2">
        <InventorySummary units={inventory} selectedUnit={interestedUnit} />
        {inventory.length > 0 && (
          <select
            value={selectedInventoryId || ''}
            onChange={(e) => onInventoryChange(property._id, e.target.value)}
            className="mt-2 w-full rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none"
            style={{ color: '#111827', backgroundColor: '#ffffff', colorScheme: 'light' }}
          >
            <option value="" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Select client unit</option>
            {inventory.map(unit => (
              <option
                key={getInventoryId(unit)}
                value={getInventoryId(unit)}
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              >
                {getInventoryLabel(unit)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Generate Presentation */}
      <div className="px-3.5 pb-2">
        <button
          onClick={() => onGeneratePresentation(property)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
          <FiFileText size={12} /> Generate Presentation
        </button>
      </div>

      {/* Reaction row */}
      <div className="px-3.5 pb-3.5 flex gap-2">
        <button onClick={() => onReact(property._id, true)} disabled={saving}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all
            ${reaction === true ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50'}`}>
          <FiThumbsUp size={12} /> Interested
        </button>
        <button onClick={() => onReact(property._id, false)} disabled={saving}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all
            ${reaction === false ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-600 hover:bg-red-50'}`}>
          <FiThumbsDown size={12} /> Not Interested
        </button>
      </div>
    </div>
  );
};

// ─── AI PRESENTATION MODAL ────────────────────────────────────────────────────
// ✅ FIX: property → initialProperty so state name doesn't clash
const PresentationModal = ({ lead, property: initialProperty, onClose }) => {
  const [step,           setStep]       = useState(1);
  const [generating,     setGenerating] = useState(false);
  const [saving,         setSaving]     = useState(false);
  const [narrative,      setNarrative]  = useState(null);

  // ✅ Two URLs — tracking (client) and s3 (agent preview)
  const [trackingUrl,    setTrackingUrl]  = useState('');
  const [previewUrl,     setPreviewUrl]   = useState('');
  const [copied,         setCopied]       = useState(false);

  // ✅ FIX: initialProperty se start karo, API se full data fetch karo
  const [property,        setProperty]        = useState(initialProperty);
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

  // ── Clean property data for backend ──────────────────────────────────────
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
    photos: (() => {
  const allPhotos = [];
  // mainLogo as first photo
  const mainLogo = property.mainLogo || property.media?.mainLogo;
  if (mainLogo) allPhotos.push(mainLogo);
  
  // photos object se
  const ph = property.photos;
  if (ph && typeof ph === 'object' && !Array.isArray(ph)) {
    Object.values(ph).forEach(arr => {
      if (Array.isArray(arr)) allPhotos.push(...arr.filter(Boolean));
    });
  } else if (Array.isArray(ph)) {
    allPhotos.push(...ph.filter(Boolean));
  }

  // media object se
  const med = property.media;
  if (med && typeof med === 'object') {
    ['architectureImages','interiorImages','lobbyImages','otherImages'].forEach(key => {
      if (Array.isArray(med[key])) allPhotos.push(...med[key].filter(Boolean));
    });
  }
  return [...new Set(allPhotos)];
})(),
    developer:         property.developerName || '',
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
    completionDate:    property.completionDate || '',
    projectStatus:     property.projectStatus  || '',
    developmentStatus: property.developmentStatus || '',
    constructionProgress: property.constructionProgress || 0,
    readinessProgress: property.readinessProgress || '',
    serviceCharge:     property.serviceCharge || '',
    totalUnits:        property.totalUnits    || 0,
    soldUnits:         property.soldUnits     || 0,
    reservedUnits:     property.reservedUnits || 0,
    description:       property.description || property.overview || '',
    locality:          property.locality || property.area || '',
    location:          property.location || {},
    proximity:         property.proximity || {},
    isFeatured:        property.isFeatured || false,
    saleStatus:        property.saleStatus || 'Available',

    // facilities: object → readable array
    facilities: (() => {
      const f = property.facilities;
      if (!f) return [];
      if (Array.isArray(f)) return f;
      return Object.entries(f)
        .filter(([, v]) => v === true)
        .map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim());
    })(),

    amenities: Array.isArray(property.amenities) ? property.amenities : [],

    // paymentPlan: nested stages → flat array
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

    // unitTypes from inventory or unitTypes array
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
        property:    buildCleanProperty(),
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

  // ── Step 2: Save → get both URLs ─────────────────────────────────────────
  const handleSave = async () => {
  setSaving(true);
  try {
    const res = await apiService.post('/presentation/save', {
      leadId:       lead._id,
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
      // ✅ Preview = same tracking URL + ?preview=true (view track nahi hoga)
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

            {/* Property loading indicator */}
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
                    {['English', 'Arabic', 'Hindi', 'Urdu', 'Russian'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1">Currency</label>
                  <select value={settings.currency}
                    onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none">
                    {['AED', 'USD', 'GBP', 'EUR', 'INR'].map(c => <option key={c} value={c}>{c}</option>)}
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
                  {['professional', 'luxury', 'friendly'].map(t => (
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

            {/* ✅ S3 Preview URL — agent ke liye only */}
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

            {/* Share buttons — tracking URL use hoga */}
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

            {/* Tracking info */}
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

// ─── SUBMIT TO XOTO MODAL ────────────────────────────────────────────────────
const SubmitModal = ({ lead, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    first_name:      lead?.contact_info?.name?.first_name || '',
    last_name:       lead?.contact_info?.name?.last_name  || '',
    phone_number:    lead?.contact_info?.mobile?.number   || '',
    country_code:    lead?.contact_info?.mobile?.country_code || '+971',
    email:           lead?.contact_info?.email?.address   || '',
    submission_note: '',
  });
  const [loading, setLoading] = useState(false);

  const interestedCount = (lead?.matched_listings || []).filter(m => m.client_interested === true).length;
  const canSubmit       = interestedCount > 0;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res  = await apiService.post(`/gridlead/agent/${lead._id}/submit-to-xoto`, form);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Lead submitted to Xoto admin successfully!');
        onSuccess();
      } else {
        message.error(data?.message || 'Submission failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Submit to Xoto Admin</h3>
            <p className="text-xs text-white/70 mt-0.5">An advisor will be assigned after submission</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!canSubmit ? (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <FiAlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Client reactions required</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Client must show interest in at least 1 property before submitting.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 border border-green-200">
              <FiCheckCircle size={16} className="text-green-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-800">
                {interestedCount} interested propert{interestedCount > 1 ? 'ies' : 'y'} recorded — ready to submit
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Confirm Client Details</p>
            <div className="grid grid-cols-2 gap-3">
              {[{ key: 'first_name', placeholder: 'First name' }, { key: 'last_name', placeholder: 'Last name' }].map(f => (
                <input key={f.key} value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              ))}
              <div className="col-span-2 flex gap-2">
                <select value={form.country_code} onChange={e => setForm(p => ({ ...p, country_code: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-gray-50 outline-none" style={{ minWidth: 80 }}>
                  {['+971', '+91', '+1', '+44', '+966', '+974'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={form.phone_number} placeholder="Phone number"
                  onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              </div>
              <input value={form.email} placeholder="Email (optional)" type="email"
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="col-span-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Submission Note (optional)</p>
            <textarea rows={3} value={form.submission_note} placeholder="Any notes for the admin or advisor…"
              onChange={e => setForm(p => ({ ...p, submission_note: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} loading={loading} disabled={!canSubmit}>
            <FiSend size={14} /> Submit to Xoto
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── UPDATE REQUIREMENTS PANEL ────────────────────────────────────────────────
const UpdateRequirementsPanel = ({ lead, onClose, onSuccess }) => {
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
  const [reason,  setReason]  = useState('');
  const [loading, setLoading] = useState(false);

  const set       = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addLoc    = () => setForm(p => ({ ...p, location_preferences: [...p.location_preferences, ''] }));
  const removeLoc = (i) => setForm(p => ({ ...p, location_preferences: p.location_preferences.filter((_, idx) => idx !== i) }));
  const setLoc    = (i, v) => setForm(p => ({ ...p, location_preferences: p.location_preferences.map((l, idx) => idx === i ? v : l) }));

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
        reason: reason || 'Client changed preferences',
      };
      const res  = await apiService.post(`/gridlead/agent/${lead._id}/update-requirements`, payload);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Requirements updated. Fresh matches loaded.');
        onSuccess(data);
      } else {
        message.error(data?.message || 'Update failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all';
  const selCls   = inputCls + ' appearance-none';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white w-full sm:rounded-3xl sm:max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Update Requirements</h3>
            <p className="text-xs text-white/70 mt-0.5">Fresh property matches will be generated after saving</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Property Type</label>
              <div className="relative">
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)} className={selCls}>
                  <option value="">Any type</option>
                  {['Apartment','Villa','Townhouse','Penthouse','Studio','Office','Retail','Land'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Transaction</label>
              <div className="relative">
                <select value={form.transaction_type} onChange={e => set('transaction_type', e.target.value)} className={selCls}>
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                  <option value="invest">Invest</option>
                </select>
                <FiChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Bathrooms</label>
              <div className="relative">
                <select value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className={selCls}>
                  <option value="">Any</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
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
                    <input value={loc} placeholder="e.g. Dubai Marina" onChange={e => setLoc(i, e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  </div>
                  <button onClick={() => removeLoc(i)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-400 hover:bg-red-100">
                    <FiX size={14} />
                  </button>
                </div>
              ))}
              <button onClick={addLoc} className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100">
                <FiPlus size={13} /> Add Location
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Additional Notes</label>
            <textarea rows={2} value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)}
              placeholder="Special requirements…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Reason for Update</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Client increased budget" className={inputCls} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} loading={loading}>
            <FiRefreshCw size={14} /> Update & Re-match
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── ADD NOTE PANEL ───────────────────────────────────────────────────────────
const NotePanel = ({ leadId, onClose, onAdded }) => {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return message.warning('Note text is required');
    setLoading(true);
    try {
      const res  = await apiService.post(`/gridlead/agent/${leadId}/note`, { text: text.trim() });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Note added');
        onAdded(data.data);
        onClose();
      } else {
        message.error(data?.message || 'Failed to add note');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <h3 className="text-base font-extrabold text-white">Add Private Note</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <textarea rows={5} value={text} autoFocus onChange={e => setText(e.target.value)}
            placeholder="Write your note about this client or lead…"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          <div className="flex gap-3 justify-end">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={handleAdd} loading={loading}>
              <FiPlus size={14} /> Add Note
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── EDIT LEAD MODAL ─────────────────────────────────────────────────────────
const EditLeadModal = ({ lead, onClose, onSuccess }) => {
  const req = lead?.requirements || {};
  const ci  = lead?.contact_info || {};

  const [form, setForm] = useState({
    first_name:    ci.name?.first_name || '',
    last_name:     ci.name?.last_name  || '',
    phone_number:  ci.mobile?.number   || '',
    country_code:  ci.mobile?.country_code || '+971',
    email:         ci.email?.address   || '',
    property_type: req.property_type   || '',
    transaction_type: req.transaction_type || 'buy',
    budget_min:    req.budget_min  || '',
    budget_max:    req.budget_max  || '',
    bedrooms:      req.bedrooms != null ? String(req.bedrooms) : '',
    bathrooms:     req.bathrooms != null ? String(req.bathrooms) : '',
    furnished:     req.furnished  || 'any',
    additional_notes: req.additional_notes || '',
    ready_by_date: req.ready_by_date ? req.ready_by_date.split('T')[0] : '',
  });
  const [locationInputs, setLocationInputs] = useState(
    (req.location_preferences || []).map(l => typeof l === 'string' ? l : l.area).concat([''])
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (form.budget_min && form.budget_max && Number(form.budget_min) > Number(form.budget_max))
      errs.budget_max = 'Max budget cannot be less than min budget';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const filledLocs = locationInputs.filter(l => l.trim());
      const res  = await apiService.put(`/gridlead/agent/${lead._id}/edit`, {
        ...form,
        location_preferences: filledLocs,
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) onSuccess(data?.data);
      else { message.error(data?.message || 'Failed to update lead'); }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const updateLoc = (i, v) => {
    const next = [...locationInputs];
    next[i] = v;
    if (i === next.length - 1 && v.trim()) next.push('');
    setLocationInputs(next);
  };
  const removeLoc = (i) => setLocationInputs(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: P, color: '#fff' }}>
              <FiEdit3 size={16} />
            </div>
            <h3 className="text-base font-extrabold text-gray-900">Edit Lead</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Client Info */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Client Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input value={form.first_name} onChange={e => set('first_name', e.target.value)}
                  placeholder="John"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.first_name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'}`} />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Last Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input value={form.last_name} onChange={e => set('last_name', e.target.value)}
                  placeholder="Smith"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <div className="flex gap-2">
                  <select value={form.country_code} onChange={e => set('country_code', e.target.value)}
                    className="px-2 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400" style={{ minWidth: 80 }}>
                    {['+971','+91','+1','+44','+966','+974','+965','+968'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input value={form.phone_number} onChange={e => set('phone_number', e.target.value)}
                    placeholder="50 123 4567" type="tel"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                <input value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="john@example.com" type="email"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Property Requirements</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Property Type</label>
                <select value={form.property_type} onChange={e => set('property_type', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 transition-all">
                  <option value="">Any</option>
                  {['Apartment','Villa','Townhouse','Penthouse','Studio','Office','Retail','Warehouse','Land'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Transaction Type</label>
                <select value={form.transaction_type} onChange={e => set('transaction_type', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 transition-all">
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                  <option value="invest">Invest</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Min Budget (AED)</label>
                <input value={form.budget_min} onChange={e => set('budget_min', e.target.value)}
                  type="number" placeholder="500,000"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Max Budget (AED)</label>
                <input value={form.budget_max} onChange={e => set('budget_max', e.target.value)}
                  type="number" placeholder="2,000,000"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.budget_max ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100'}`} />
                {errors.budget_max && <p className="text-xs text-red-500 mt-1">{errors.budget_max}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Bedrooms</label>
                <select value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 transition-all">
                  <option value="">Any</option>
                  {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n === 0 ? 'Studio' : `${n} BR`}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Furnishing</label>
                <select value={form.furnished} onChange={e => set('furnished', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 transition-all">
                  {['any','furnished','unfurnished','semi-furnished'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Preferred Locations</p>
            <div className="space-y-2">
              {locationInputs.map((loc, i) => (
                <div key={i} className="flex gap-2">
                  <input value={loc} onChange={e => updateLoc(i, e.target.value)}
                    placeholder={`Location ${i + 1} (e.g. Dubai Marina)`}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                  {locationInputs.length > 1 && (
                    <button onClick={() => removeLoc(i)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
                      <FiX size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Additional Notes</label>
            <textarea value={form.additional_notes} onChange={e => set('additional_notes', e.target.value)}
              rows={3} placeholder="Any special requirements or notes..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: GR }}>
            {saving ? <FiLoader size={14} className="animate-spin" /> : <FiEdit3 size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const GridAgentLeadDetail = () => {
  const { id }  = useParams();
  const navigate = useNavigate();

  const [lead,          setLead]          = useState(null);
  const [pageLoading,   setPageLoading]   = useState(true);
  const [matches,       setMatches]       = useState([]);
  const [matchType,     setMatchType]     = useState('');
  const [matchNote,     setMatchNote]     = useState('');
  const [matchLoading,  setMatchLoading]  = useState(false);
  const [isNurturing,   setIsNurturing]   = useState(false);
  const [reactions,     setReactions]     = useState({});
  const [savingMatches, setSavingMatches] = useState(false);
  const [dirtyReactions, setDirtyReactions] = useState(false);
  const [selectedInventoryByProperty, setSelectedInventoryByProperty] = useState({});

  // Modals
  const [showSubmit,       setShowSubmit]       = useState(false);
  const [showReqs,         setShowReqs]         = useState(false);
  const [showNote,         setShowNote]         = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditLead,     setShowEditLead]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,         setDeleting]         = useState(false);

  // Collapsibles
  const [showHistory, setShowHistory] = useState(false);
  const [showNotes,   setShowNotes]   = useState(true);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchLead = useCallback(async () => {
    setPageLoading(true);
    try {
      const res  = await apiService.get(`/gridlead/${id}`);
      const data = res?.data?.data || res?.data;
      const safe = sanitize(data);
      setLead(safe);
      const initReactions = {};
      const initInventory = {};
      (safe?.matched_listings || []).forEach(m => {
        if (m.listing_id?._id || m.listing_id) {
          const lid = m.listing_id?._id?.toString() || m.listing_id?.toString();
          initReactions[lid] = m.client_interested;
          if (m.inventory_unit_id) initInventory[lid] = m.inventory_unit_id;
        }
      });
      setReactions(initReactions);
      setSelectedInventoryByProperty(initInventory);
    } catch {
      message.error('Failed to load lead details');
    } finally {
      setPageLoading(false);
    }
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
    } catch {
      setMatches([]);
      setMatchType('none');
    } finally {
      setMatchLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) { fetchLead(); fetchMatches(); }
  }, [id, fetchLead, fetchMatches]);

  // ── Reactions ────────────────────────────────────────────────────────────
  const handleInventoryChange = (propertyId, inventoryUnitId) => {
    const pid = propertyId?.toString();
    setSelectedInventoryByProperty(prev => ({ ...prev, [pid]: inventoryUnitId }));
    setDirtyReactions(true);
  };

  const handleReact = (propertyId, interested) => {
    const pid = propertyId?.toString();
    setReactions(prev => {
      const newVal = prev[pid] === interested ? null : interested;
      return { ...prev, [pid]: newVal };
    });
    setDirtyReactions(true);
  };

  const handleSaveReactions = async () => {
    setSavingMatches(true);
    try {
      const listings = matches.map(p => ({
        listing_id:          p._id,
        match_score:         Math.max(0, p.matchScore ?? 50),
        presented_to_client: true,
        client_interested:   reactions[p._id?.toString()] ?? null,
        ...(selectedInventoryByProperty[p._id?.toString()] && { inventory_unit_id: selectedInventoryByProperty[p._id?.toString()] }),
      }));
      const res  = await apiService.post(`/gridlead/agent/${id}/save-matches`, { listings });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success(`Reactions saved — ${data.data?.interested || 0} interested, ${data.data?.not_interested || 0} not interested`);
        setDirtyReactions(false);
        fetchLead();
      } else {
        message.error(data?.message || 'Failed to save reactions');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to save reactions');
    } finally {
      setSavingMatches(false);
    }
  };

  const handleGeneratePresentation = (property) => {
    setSelectedProperty(property);
    setShowPresentation(true);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const interestedCount    = Object.values(reactions).filter(v => v === true).length;
  const notInterestedCount = Object.values(reactions).filter(v => v === false).length;
  const isSubmitted        = lead?.submitted_to_xoto;

  const fn    = lead?.contact_info?.name?.first_name || '';
  const ln    = lead?.contact_info?.name?.last_name  || '';
  const phone = lead?.contact_info?.mobile?.number   || '—';
  const cc    = lead?.contact_info?.mobile?.country_code || '';
  const email = lead?.contact_info?.email?.address   || null;
  const req   = lead?.requirements || {};
  const locs  = (req.location_preferences || []).map(l => typeof l === 'string' ? l : l.area).filter(Boolean);
  const prop  = lead?.source?.listing_id;
  const notes = (lead?.notes || []).filter(n => !isAssignmentText(n?.text || ''));
  const hist  = (lead?.status_history || []).filter(h => !isAssignmentText(h?.notes || ''));

  const handleSubmitSuccess = () => { setShowSubmit(false); fetchLead(); };
  const handleReqsSuccess   = (data) => {
    setShowReqs(false);
    if (data?.new_matches?.data) {
      setMatches(data.new_matches.data);
      setMatchType(data.new_matches.matchType || '');
      setMatchNote(data.new_matches.note || '');
    }
    fetchLead();
  };
  const handleNoteAdded = (note) => {
    setLead(prev => ({ ...prev, notes: [...(prev.notes || []), note] }));
  };

  const handleEditSuccess = (updated) => {
    setShowEditLead(false);
    if (updated) setLead(sanitize(updated));
    else fetchLead();
    message.success('Lead updated successfully');
  };

  const handleDeleteLead = async () => {
    setDeleting(true);
    try {
      const res  = await apiService.delete(`/gridlead/agent/${id}/delete`);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Lead deleted');
        navigate(-1);
      } else {
        message.error(data?.message || 'Failed to delete lead');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to delete lead');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Spin size="large" />
      <p className="mt-4 text-gray-400 font-medium text-sm">Loading lead profile…</p>
    </div>
  );

  if (!lead) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <FiAlertCircle size={48} className="text-gray-300" />
      <p className="text-gray-500">Lead not found or access denied.</p>
      <Btn variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={14} /> Go Back</Btn>
    </div>
  );

  const mc        = MC[matchType] || null;
  const MatchIcon = mc?.Icon;

  return (
    <>
      {/* ── MODALS ── */}
      {showPresentation && selectedProperty && (
        <PresentationModal
          lead={lead}
          property={selectedProperty}
          onClose={() => { setShowPresentation(false); setSelectedProperty(null); }}
        />
      )}
      {showSubmit && <SubmitModal lead={lead} onClose={() => setShowSubmit(false)} onSuccess={handleSubmitSuccess} />}
      {showReqs   && <UpdateRequirementsPanel lead={lead} onClose={() => setShowReqs(false)} onSuccess={handleReqsSuccess} />}
      {showNote   && <NotePanel leadId={id} onClose={() => setShowNote(false)} onAdded={handleNoteAdded} />}
      {showEditLead && <EditLeadModal lead={lead} onClose={() => setShowEditLead(false)} onSuccess={handleEditSuccess} />}

      {/* ── DELETE CONFIRM ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <FiAlertTriangle size={20} className="text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete Lead?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the lead for <span className="font-bold text-gray-800">{`${fn} ${ln}`.trim() || 'this client'}</span>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDeleteLead} disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <FiLoader size={14} className="animate-spin" /> : <FiAlertTriangle size={14} />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 font-sans">

        {/* ── TOP BAR ── */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                <FiArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-gray-900 truncate">{`${fn} ${ln}`.trim() || 'Unknown Client'}</h1>
                <p className="text-xs text-gray-400 font-medium">Lead ID: {String(lead._id).slice(-8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={lead.status} />
              <ClassBadge cls={lead.classification} />
              {isSubmitted && <Tag color="#059669" bg="#f0fdf4" border="#bbf7d0">Submitted ✓</Tag>}
              {!isSubmitted && (
                <>
                  <Btn variant="ghost" size="sm" onClick={() => setShowEditLead(true)}>
                    <FiEdit3 size={13} /> Edit Lead
                  </Btn>
                  <Btn variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                    <FiX size={13} /> Delete
                  </Btn>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── SUBMITTED BANNER ── */}
        {isSubmitted && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
              <FiCheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">Lead submitted to Xoto Admin</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Submitted on {lead.submitted_to_xoto_at
                    ? new Date(lead.submitted_to_xoto_at).toLocaleString('en-AE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
                    : '—'}. An advisor will be assigned shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT sidebar ── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Avatar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 shadow-lg"
                    style={{ background: GR }}>{(fn?.[0] || '?').toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold text-gray-900 leading-tight truncate">{`${fn} ${ln}`.trim() || 'Unknown'}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lead.enquiry_type && <EnquiryTag type={lead.enquiry_type} />}
                      <Tag>{lead.lead_type || 'agent'}</Tag>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <SectionBox title="Contact Info" icon={FiUser}>
                <div className="divide-y divide-gray-50">
                  <InfoRow icon={FiPhone}         label="Phone"     value={`${cc} ${phone}`.trim()} />
                  {email && <InfoRow icon={FiMail} label="Email"     value={email} />}
                  <InfoRow icon={FiMessageSquare} label="Preferred"  value={lead.contact_info?.preferred_contact || '—'} />
                </div>
              </SectionBox>

              {/* Requirements */}
              <SectionBox title="Requirements" icon={FiTag}
                action={!isSubmitted && (
                  <button onClick={() => setShowReqs(true)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100">
                    <FiEdit3 size={11} /> Edit
                  </button>
                )}>
                <div className="divide-y divide-gray-50">
                  {req.property_type    && <InfoRow icon={FiHome}        label="Type"        value={req.property_type} />}
                  {req.transaction_type && <InfoRow icon={FiTag}         label="Transaction" value={req.transaction_type} />}
                  {(req.budget_min || req.budget_max) && (
                    <InfoRow icon={FiDollarSign} label="Budget" value={
                      req.budget_min && req.budget_max
                        ? `AED ${Number(req.budget_min).toLocaleString()} – AED ${Number(req.budget_max).toLocaleString()}`
                        : req.budget_max ? `Up to AED ${Number(req.budget_max).toLocaleString()}` : `From AED ${Number(req.budget_min).toLocaleString()}`
                    } />
                  )}
                  {req.bedrooms != null && <InfoRow icon={FiHome}   label="Bedrooms"   value={req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`} />}
                  {req.furnished        && <InfoRow icon={FiHome}   label="Furnishing"  value={req.furnished} />}
                  {locs.length > 0      && <InfoRow icon={FiMapPin} label="Locations"   value={locs.join(', ')} />}
                  {req.ready_by_date    && <InfoRow icon={FiCalendar} label="Ready By" value={new Date(req.ready_by_date).toLocaleDateString('en-AE',{day:'2-digit',month:'short',year:'numeric'})} />}
                  {req.additional_notes && <InfoRow icon={FiMessageSquare} label="Notes" value={req.additional_notes} />}
                </div>
              </SectionBox>

              {/* Linked property */}
              {prop && typeof prop === 'object' && (
                <SectionBox title="Linked Property" icon={FiHome}>
                  <div className="divide-y divide-gray-50">
                    <InfoRow icon={FiHome}       label="Name"  value={prop.propertyName || prop.title || '—'} />
                    <InfoRow icon={FiMapPin}     label="Area"  value={prop.area || '—'} />
                    {prop.price && <InfoRow icon={FiDollarSign} label="Price" value={`AED ${Number(prop.price).toLocaleString()}`} />}
                  </div>
                </SectionBox>
              )}

              {/* Lead meta */}
              <SectionBox title="Lead Info" icon={FiLayers}>
                <div className="divide-y divide-gray-50">
                  <InfoRow icon={FiLayers} label="Source"  value={lead.source?.channel?.replace(/_/g,' ') || '—'} />
                  <InfoRow icon={FiClock}  label="Created" value={lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-AE',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'} />
                  {lead.classification_reason && <InfoRow icon={FiAlertCircle} label="Classification Reason" value={lead.classification_reason} />}
                </div>
              </SectionBox>
            </div>

            {/* ── RIGHT ── */}
            <div className="lg:col-span-8 space-y-5">

              {/* Action bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {dirtyReactions && !isSubmitted && (
                    <Btn variant="primary" onClick={handleSaveReactions} loading={savingMatches} size="sm">
                      <FiCheckCircle size={13} /> Save Reactions
                      {interestedCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/30 text-[10px] font-bold">{interestedCount}</span>}
                    </Btn>
                  )}
                  {!isSubmitted ? (
                    <Btn variant="success" onClick={() => setShowSubmit(true)} size="sm" disabled={interestedCount === 0}>
                      <FiSend size={13} /> Submit to Xoto
                      {interestedCount === 0 && <span className="ml-1 text-[10px] opacity-70">(need interest)</span>}
                    </Btn>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-green-700 bg-green-50 border border-green-200">
                      <FiCheckCircle size={13} /> Submitted to Xoto
                    </span>
                  )}
                  {!isSubmitted && (
                    <Btn variant="ghost" onClick={() => setShowReqs(true)} size="sm">
                      <FiEdit3 size={13} /> Update Requirements
                    </Btn>
                  )}
                  <Btn variant="ghost" onClick={() => setShowNote(true)} size="sm">
                    <FiFileText size={13} /> Add Note
                  </Btn>
                  <Btn variant="ghost" onClick={fetchMatches} loading={matchLoading} size="sm">
                    <FiRefreshCw size={13} /> Refresh Matches
                  </Btn>
                </div>

                {(interestedCount > 0 || notInterestedCount > 0) && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium">Client reactions:</span>
                    {interestedCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                        <FiThumbsUp size={11} /> {interestedCount} Interested
                      </span>
                    )}
                    {notInterestedCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                        <FiThumbsDown size={11} /> {notInterestedCount} Not Interested
                      </span>
                    )}
                    {dirtyReactions && !savingMatches && (
                      <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        <FiAlertTriangle size={11} /> Unsaved — click Save Reactions
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Matched Properties */}
              <SectionBox title="Matched Properties" icon={FiHome}
                action={mc && !matchLoading && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
                    <MatchIcon size={10} /> {mc.label}
                  </span>
                )}>

                {matchLoading && (
                  <div className="text-center py-10">
                    <FiLoader size={24} className="animate-spin mx-auto mb-3" style={{ color: P }} />
                    <p className="text-xs text-gray-400 font-medium">Finding best matches…</p>
                  </div>
                )}

                {!matchLoading && matchNote && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 mb-4 text-xs font-medium text-blue-700">
                    <FiInfo size={13} className="flex-shrink-0 mt-0.5 text-blue-500" />
                    {matchNote}
                  </div>
                )}

                {!matchLoading && (matchType === 'none' || isNurturing) && (
                  <div className="p-5 rounded-2xl bg-red-50 border border-red-100 mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-red-600 mb-1.5">
                      <FiXCircle size={16} /> No matching properties found
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed pl-6">
                      This client has been added to the nurturing list. Try updating requirements to broaden the search.
                    </p>
                  </div>
                )}

                {!matchLoading && matches.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 font-medium mb-4">
                      Click <strong>Interested</strong> / <strong>Not Interested</strong> on each property to record client reactions, then click <strong>Save Reactions</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {matches.map((p, i) => (
                        <PropertyCard
                          key={p._id || i}
                          property={p}
                          matchType={matchType}
                          reaction={reactions[p._id?.toString()]}
                          onReact={handleReact}
                          selectedInventoryId={selectedInventoryByProperty[p._id?.toString()]}
                          onInventoryChange={handleInventoryChange}
                          saving={savingMatches}
                          onGeneratePresentation={handleGeneratePresentation}
                        />
                      ))}
                    </div>
                    {!isSubmitted && matches.length > 0 && (
                      <div className="mt-5 flex justify-end">
                        <Btn variant="primary" onClick={handleSaveReactions} loading={savingMatches} disabled={!dirtyReactions}>
                          <FiCheckCircle size={14} />
                          {dirtyReactions ? 'Save Reactions' : 'Reactions Saved'}
                        </Btn>
                      </div>
                    )}
                  </>
                )}

                {!matchLoading && matches.length === 0 && matchType !== 'none' && !isNurturing && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <FiHome size={32} className="mx-auto mb-3 opacity-30" />
                    No properties loaded yet.
                  </div>
                )}
              </SectionBox>

              {/* Notes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNotes(p => !p)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P, color: '#fff' }}>
                    <FiMessageSquare size={14} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
                    Private Notes {notes.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{notes.length}</span>}
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
                    {notes.length === 0
                      ? <p className="text-center text-xs text-gray-400 py-4">No notes yet. Click Add to write one.</p>
                      : (
                        <div className="space-y-3">
                          {[...notes].reverse().map((n, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {(n.author?.[0] || 'A').toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-gray-600">{n.author || 'Agent'}</span>
                                {n.author_type && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-500 uppercase">{n.author_type}</span>}
                                <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                                  <FiClock size={10} />
                                  {(n.created_at || n.createdAt)
                                    ? new Date(n.created_at || n.createdAt).toLocaleDateString('en-AE',{day:'2-digit',month:'short',year:'numeric'})
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P, color: '#fff' }}>
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
                              <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center"
                                style={{ background: '#4A027C' }}>
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <StatusBadge status={h.status} />
                                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <FiCalendar size={10} />
                                    {h.changed_at ? new Date(h.changed_at).toLocaleDateString('en-AE',{day:'2-digit',month:'short'}) : '—'}
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

export default GridAgentLeadDetail;




