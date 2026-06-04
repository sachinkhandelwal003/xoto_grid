import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiUser, FiHome, FiClock, FiPhone, FiMail, FiMapPin, FiDollarSign,
  FiCalendar, FiMessageSquare, FiTag, FiAlertCircle, FiActivity, FiLayers,
  FiArrowLeft, FiImage, FiInfo, FiXCircle, FiCheckCircle, FiUserPlus,
  FiUsers, FiPackage, FiChevronDown, FiChevronUp, FiRefreshCw,
  FiStar, FiAlertTriangle, FiLoader, FiX, FiEdit3, FiFileText
} from 'react-icons/fi';
import { message, Spin, Avatar, Select } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { StatusBadge, ClassificationBadge, TypeTag } from './AgentLeads';

// ─── THEME ────────────────────────────────────────────────────────────────────
const P        = '#5c039b';
const P2       = '#7c3aed';
const TEAL     = '#0d9488';
const GR       = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── MATCH CONFIG ─────────────────────────────────────────────────────────────
const MC = {
  exact:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Exact Match',   Icon: FiCheckCircle },
  relaxed: { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff', label: 'Relaxed Match', Icon: FiActivity    },
  broad:   { bg: '#f5f3ff', color: P,         border: '#ddd6fe', label: 'Broader Area',  Icon: FiMapPin      },
  none:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'No Matches',    Icon: FiXCircle     },
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
    <div className="mt-2 max-h-20 space-y-1.5 overflow-y-auto pr-1">
      {visible.map((unit) => (
        <div key={getInventoryId(unit)} className="rounded-lg border border-purple-100 bg-purple-50 px-2.5 py-1.5 text-[10px] font-semibold text-purple-800">
          {selectedUnit ? 'Interested: ' : ''}{getInventoryLabel(unit)}
        </div>
      ))}
      {!selectedUnit && units.length > 3 && <p className="text-[10px] font-semibold text-gray-400">+{units.length - 3} more units</p>}
    </div>
  );
};

const COMMISSION_CONFIG = {
  pending:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Pending'  },
  approved: { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd', label: 'Approved' },
  paid:     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Paid'     },
  cancelled:{ bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Cancelled'},
};

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-slate-50" style={{ color: P }}>
      <Icon size={13} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5 break-words leading-snug">{value || '—'}</p>
    </div>
  </div>
);

const SectionBox = ({ title, icon: Icon, children, action, accent }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
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
  const base  = 'flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-sm' };
  const vars  = {
    primary: 'text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
    ghost:   'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50',
    danger:  'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100',
    teal:    'text-white shadow-md hover:shadow-lg',
  };
  const bg = variant === 'primary' ? GR : variant === 'teal' ? `linear-gradient(135deg,${TEAL},#14b8a6)` : '';
  return (
    <button className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}
      style={bg ? { background: bg } : {}} onClick={onClick} disabled={disabled || loading}>
      {loading ? <FiLoader size={14} className="animate-spin" /> : children}
    </button>
  );
};

// ─── ASSIGN ADVISOR MODAL ─────────────────────────────────────────────────────
const AssignModal = ({ lead, visible, onClose, onAssigned }) => {
  const [advisors,    setAdvisors]    = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [selected,    setSelected]    = useState('');
  const [notes,       setNotes]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!visible) return;

    // ✅ FIX 2: Reset state har baar modal open hone pe
    setSelected('');
    setNotes('');
    setAdvisors([]);
    setRecommended(null);

    setLoading(true);
    apiService.get(`/gridlead/${lead._id}/suggest-advisors`)
      .then(res => {
        const d = res?.data?.success !== undefined ? res.data : res;
        const opts = d?.options || [];
        const rec  = d?.recommended || null;
        setAdvisors(opts);
        setRecommended(rec);

        // ✅ Auto-select: current advisor ya recommended
        const currentId = lead.assigned_to?._id?.toString() || 
                          (typeof lead.assigned_to === 'string' ? lead.assigned_to : '');
        if (currentId) {
          setSelected(currentId);
        } else if (rec?._id) {
          setSelected(rec._id);
        }
      })
      .catch(() => setAdvisors([]))
      .finally(() => setLoading(false));
  }, [visible, lead._id]);

  const handleAssign = async () => {
    if (!selected) return message.warning('Please select an advisor');
    setSaving(true);
    try {
      // ✅ FIX 1: success check hatao — catch block handle karega errors
      await apiService.put(`/gridlead/${lead._id}/assign`, { 
        advisorId: selected, 
        notes 
      });
      message.success(
        (lead.assigned_to?._id || lead.assigned_to) 
          ? 'Advisor reassigned successfully' 
          : 'Advisor assigned successfully'
      );
      onAssigned();
      onClose();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Assignment failed');
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  const currentAdvisorId = lead.assigned_to?._id?.toString() || lead.assigned_to?.toString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {currentAdvisorId ? 'Reassign Advisor' : 'Assign Advisor'}
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              {currentAdvisorId ? 'Select a new advisor to take over this lead' : 'Choose the best advisor for this lead'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="text-center py-8"><Spin /></div>
          ) : (
            <>
              {/* Recommended */}
              {recommended && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <FiStar size={11} className="text-amber-500" /> AI Recommended
                  </p>
                  <button onClick={() => setSelected(recommended._id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left
                      ${selected === recommended._id ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-gray-50 hover:border-purple-200'}`}>
                    <Avatar size={40} style={{ background: GR, fontWeight: 700, flexShrink: 0 }}>
                      {`${recommended.firstName?.[0] || ''}${recommended.lastName?.[0] || ''}`.toUpperCase()}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{recommended.firstName} {recommended.lastName}</p>
                      <p className="text-xs text-gray-500">
  {typeof recommended.specialisation === 'string'
    ? recommended.specialisation
    : Array.isArray(recommended.specialisation?.propertyTypes)
      ? recommended.specialisation.propertyTypes.join(', ')
      : 'General'}
</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: P }}>{recommended.leaderboard?.compositeScore || 0} pts</p>
                      <p className="text-[10px] text-gray-400">{recommended.workload?.activeLeadsCount || 0} active</p>
                    </div>
                    {selected === recommended._id && <FiCheckCircle size={18} style={{ color: P }} className="flex-shrink-0" />}
                  </button>
                </div>
              )}

              {/* All advisors */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">All Active Advisors</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {advisors.map(a => (
                    <button key={a._id} onClick={() => setSelected(a._id)}
                      disabled={a._id === currentAdvisorId}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                        ${selected === a._id ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'}
                        ${a._id === currentAdvisorId ? 'opacity-40 cursor-not-allowed' : ''}`}>
                      <Avatar size={34} style={{ background: '#e9d5ff', color: P, fontWeight: 700, flexShrink: 0, fontSize: 12 }}>
                        {`${a.firstName?.[0] || ''}${a.lastName?.[0] || ''}`.toUpperCase()}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {a.firstName} {a.lastName}
                          {a._id === currentAdvisorId && <span className="ml-2 text-[10px] text-gray-400">(current)</span>}
                        </p>
                        <p className="text-[10px] text-gray-400">{a.workload?.activeLeadsCount || 0} active leads</p>
                      </div>
                      <p className="text-xs font-bold text-gray-500 flex-shrink-0">{a.leaderboard?.compositeScore || 0} pts</p>
                      {selected === a._id && <FiCheckCircle size={16} style={{ color: P }} className="flex-shrink-0" />}
                    </button>
                  ))}
                  {advisors.length === 0 && <p className="text-sm text-center text-gray-400 py-4">No active advisors found</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Assignment Note (optional)</p>
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any context for the advisor…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
              </div>
            </>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleAssign} loading={saving} disabled={!selected}>
            <FiUserPlus size={14} /> {currentAdvisorId ? 'Reassign' : 'Assign'}
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── COMMISSION MODAL ─────────────────────────────────────────────────────────
const CommissionModal = ({ lead, onClose, onUpdated }) => {
  const [status, setStatus] = useState(lead?.referral_info?.commission_status || 'pending');
  const [notes,  setNotes]  = useState('');
  const [saving, setSaving] = useState(false);

  const VALID = ['pending', 'approved', 'paid', 'cancelled'];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await apiService.put(`/gridlead/${lead._id}/commission`, { status, notes });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success(`Commission status updated to ${status}`);
        onUpdated(data.data);
        onClose();
      } else {
        message.error(data?.message || 'Update failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <h3 className="text-base font-extrabold text-white">Update Commission Status</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><FiX size={16} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Commission Status</p>
            <div className="grid grid-cols-2 gap-3">
              {VALID.map(s => {
                const cfg = COMMISSION_CONFIG[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all capitalize
                      ${status === s ? 'border-current' : 'border-gray-100 hover:border-gray-200'}`}
                    style={status === s ? { color: cfg.color, background: cfg.bg, borderColor: cfg.border } : {}}>
                    {cfg.label}
                    {status === s && <FiCheckCircle size={14} className="inline ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl border" style={{ background: COMMISSION_CONFIG[status].bg, borderColor: COMMISSION_CONFIG[status].border }}>
            <p className="text-xs font-medium" style={{ color: COMMISSION_CONFIG[status].color }}>
              {status === 'paid' && '✓ Commission will be marked as paid and timestamp recorded.'}
              {status === 'approved' && '✓ Commission approved — awaiting payment processing.'}
              {status === 'pending' && '⏳ Commission pending review.'}
              {status === 'cancelled' && '✗ Commission will be cancelled. This action is permanent.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Admin Note (optional)</p>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reason or reference…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave} loading={saving}>
            <FiCheckCircle size={14} /> Update Commission
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── MATCHED PROPERTY CARD ────────────────────────────────────────────────────
const MatchedPropertyCard = ({ property, matchType }) => {
  const price  = property.price_min || property.price || 0;
  const loc    = [property.area, property.city].filter(Boolean).join(', ');
  const mc     = MC[matchType] || MC.broad;
  const McIcon = mc.Icon;
  const inventory = getInventoryList(property);
  const selectedUnit = property.interested_inventory_unit || null;

  return (
    <div className="flex h-52 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="w-28 flex-shrink-0 bg-slate-100">
        {property.mainLogo
          ? <img src={property.mainLogo} alt={property.propertyName} className="w-full h-full object-cover" />
          : <div className="w-full h-full min-h-[80px] flex items-center justify-center text-slate-300"><FiImage size={22} /></div>}
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto p-3.5">
        <div className="text-sm font-semibold text-gray-900 truncate">{property.propertyName}</div>
        {loc && <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate"><FiMapPin size={9} /> {loc}</div>}
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-sm font-bold" style={{ color: P }}>
            {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'On Request'}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
            <McIcon size={9} /> {mc.label}
          </span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1.5 flex gap-2">
          {property.bedrooms  > 0 && <span>{property.bedrooms}BR</span>}
          {property.bathrooms > 0 && <span>· {property.bathrooms}BA</span>}
          {property.builtUpArea > 0 && <span>· {property.builtUpArea} sqft</span>}
        </div>
        <InventorySummary units={inventory} selectedUnit={selectedUnit} />
      </div>
    </div>
  );
};

// ─── CLIENT REACTION PILL ─────────────────────────────────────────────────────
const ReactionPill = ({ reaction }) => {
  const map = {
    interested:     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: '👍 Interested' },
    not_interested: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: '👎 Not Interested' },
    maybe:          { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: '🤔 Maybe' },
    pending:        { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', label: '⏳ Pending' },
  };
  const cfg = map[reaction] || map.pending;
  return (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const GridAgentLeadDetailadmin = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [lead,            setLead]            = useState(null);
  const [pageLoading,     setPageLoading]     = useState(true);
  const [matches,         setMatches]         = useState([]);
  const [matchType,       setMatchType]       = useState('');
  const [matchNote,       setMatchNote]       = useState('');
  const [matchLoading,    setMatchLoading]    = useState(false);
  const [isNurturing,     setIsNurturing]     = useState(false);

  // modals
  const [showAssign,     setShowAssign]     = useState(false);
  const [showCommission, setShowCommission] = useState(false);

  // collapsibles
  const [showNotes,      setShowNotes]      = useState(true);
  const [showHistory,    setShowHistory]    = useState(false);
  const [showSuggestions,setShowSuggestions]= useState(true);
  const [showMatched,    setShowMatched]    = useState(true);

  const fetchLead = useCallback(async () => {
    setPageLoading(true);
    try {
      const res  = await apiService.get(`/gridlead/${id}`);
      const data = res?.data?.data || res?.data;
      setLead(data);
    } catch {
      message.error('Failed to load lead');
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

  // ── Derived ────────────────────────────────────────────────────────────────
  const fn       = lead?.contact_info?.name?.first_name || '';
  const ln       = lead?.contact_info?.name?.last_name  || '';
  const phone    = lead?.contact_info?.mobile?.number   || '—';
  const cc       = lead?.contact_info?.mobile?.country_code || '';
  const email    = lead?.contact_info?.email?.address   || null;
  const pref     = lead?.contact_info?.preferred_contact || '—';
  const req      = lead?.requirements || {};
  const locs     = (req.location_preferences || []).map(l => typeof l === 'string' ? l : l.area).filter(Boolean);
  const agent    = lead?.created_by_agent;
  const advisor  = typeof lead?.assigned_to === 'object' && lead?.assigned_to?._id
    ? lead.assigned_to
    : null;
  const isReferral    = lead?.lead_type === 'referral';
  const commInfo      = lead?.referral_info;
  const isSubmitted   = lead?.submitted_to_xoto;
  const notes         = lead?.notes || [];
  const history       = lead?.status_history || [];
  const suggestions   = lead?.advisor_suggestions || [];
  const matchedListed = lead?.matched_listings || [];
  const canCreateDealRecord = lead?.status === 'reserved' || lead?.status === 'spa_signed';

  const openDealRecordFlow = () => {
    const base = window.location.pathname.replace(/\/lead-detail-admin\/[^/]+$/, '');
    navigate(`${base}/deal-records/create/${lead._id}`);
  };

  const mc = MC[matchType] || null;
  const McIcon = mc?.Icon;

  // ─── Collapsible Header ─────────────────────────────────────────────────────
  const CollapseHeader = ({ title, icon: Icon, open, onToggle, count, badge, accent }) => (
    <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
      onClick={onToggle}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
        style={{ background: accent || GR }}>
        <Icon size={14} />
      </div>
      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">{title}
        {count != null && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px]">{count}</span>}
      </h4>
      {badge}
      {open ? <FiChevronUp size={14} className="text-gray-400 flex-shrink-0" /> : <FiChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
    </button>
  );

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Spin size="large" />
      <p className="mt-4 text-gray-400 font-medium text-sm">Loading lead profile…</p>
    </div>
  );

  if (!lead) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <FiAlertCircle size={48} className="text-gray-300" />
      <p className="text-gray-500">Lead not found.</p>
      <Btn variant="ghost" onClick={() => navigate(-1)}><FiArrowLeft size={14} /> Go Back</Btn>
    </div>
  );

  return (
    <>
      {/* ── MODALS ── */}
      <AssignModal lead={lead} visible={showAssign} onClose={() => setShowAssign(false)}
        onAssigned={() => { fetchLead(); }} />
      {showCommission && isReferral && (
        <CommissionModal lead={lead} onClose={() => setShowCommission(false)}
          onUpdated={(d) => setLead(prev => ({ ...prev, referral_info: { ...prev.referral_info, ...d } }))} />
      )}

      <div className="min-h-screen bg-slate-50 font-sans">

        {/* ── TOP BAR ── */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <FiArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-gray-900 truncate">{`${fn} ${ln}`.trim() || 'Unknown Client'}</h1>
                <p className="text-xs text-gray-400 font-medium">Lead · {String(lead._id).slice(-8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={lead.status} />
              <ClassificationBadge value={lead.classification} />
              {isSubmitted && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-green-50 text-green-700 border-green-200">Submitted ✓</span>
              )}
              <Btn variant="primary" size="sm" onClick={() => setShowAssign(true)}>
                <FiUserPlus size={13} /> {advisor ? 'Reassign' : 'Assign Advisor'}
              </Btn>
              {isReferral && (
                <Btn variant="ghost" size="sm" onClick={() => setShowCommission(true)}>
                  <FiPackage size={13} /> Commission
                </Btn>
              )}
              {canCreateDealRecord && (
                <Btn variant="teal" size="sm" onClick={openDealRecordFlow}>
                  <FiFileText size={13} /> Create Deal Record
                </Btn>
              )}
            </div>
          </div>
        </div>

        {lead.status === 'reserved' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex-wrap">
              <div className="flex items-center gap-3">
                <FiCheckCircle size={18} className="text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-indigo-900">Reserved by advisor</p>
                  <p className="text-xs text-indigo-700 mt-0.5">Admin can upload SPA documents and create the deal record from this lead.</p>
                </div>
              </div>
              <Btn variant="teal" size="sm" onClick={openDealRecordFlow}>
                <FiFileText size={13} /> Create Deal Record
              </Btn>
            </div>
          </div>
        )}

        {/* ── SUBMISSION BANNER ── */}
        {isSubmitted && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
              <FiCheckCircle size={18} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">Lead submitted to admin queue</p>
                <p className="text-xs text-green-700 mt-0.5">
                  By {lead.submitted_by_agent ? 'agent' : 'system'} on{' '}
                  {lead.submitted_to_xoto_at
                    ? new Date(lead.submitted_to_xoto_at).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── UNASSIGNED ALERT ── */}
        {isSubmitted && !advisor && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-3">
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-3">
                <FiAlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                <p className="text-sm font-bold text-amber-800">No advisor assigned — lead is waiting in queue</p>
              </div>
              <Btn variant="primary" size="sm" onClick={() => setShowAssign(true)}>
                <FiUserPlus size={13} /> Assign Now
              </Btn>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT SIDEBAR ── */}
            <div className="lg:col-span-4 space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 shadow-lg"
                    style={{ background: GR }}>{(fn?.[0] || '?').toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="text-lg font-extrabold text-gray-900 truncate">{`${fn} ${ln}`.trim() || 'Unknown'}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {lead.enquiry_type && <TypeTag type={lead.enquiry_type} />}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: '#f5f3ff', color: P, border: '1px solid #ddd6fe' }}>
                        {lead.lead_type || 'platform'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <SectionBox title="Contact Info" icon={FiUser}>
                <div className="divide-y divide-gray-50">
                  <InfoRow icon={FiPhone}         label="Phone"     value={`${cc} ${phone}`.trim()} />
                  {email && <InfoRow icon={FiMail} label="Email"     value={email} />}
                  <InfoRow icon={FiMessageSquare} label="Preferred"  value={pref} />
                </div>
              </SectionBox>

              {/* Stakeholders */}
              <SectionBox title="Stakeholders" icon={FiUsers}>
                {/* Agent */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {isReferral ? 'Referral Partner' : 'Created by Agent'}
                  </p>
                  {agent ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-gray-100">
                      <Avatar size={36} style={{ background: TEAL, fontWeight: 700, flexShrink: 0 }}>
                        {`${agent.first_name?.[0] || ''}${agent.last_name?.[0] || ''}`.toUpperCase()}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{agent.first_name} {agent.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{agent.phone_number || agent.email || '—'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Created via Platform</p>
                  )}
                </div>

                {/* Advisor */}
                <div className="border-t border-gray-50 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Advisor</p>
                    {advisor && (
                      <button onClick={() => setShowAssign(true)} className="text-[11px] font-bold hover:underline" style={{ color: P }}>
                        <FiEdit3 size={10} className="inline mr-1" />Change
                      </button>
                    )}
                  </div>
                  {advisor ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ background: '#faf5ff', borderColor: '#ddd6fe' }}>
                      <Avatar size={36} style={{ background: GR, fontWeight: 700, flexShrink: 0 }}>
                        {`${advisor.firstName?.[0] || advisor.first_name?.[0] || ''}${advisor.lastName?.[0] || advisor.last_name?.[0] || ''}`.toUpperCase()}
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: P }}>
                          {advisor.firstName || advisor.first_name} {advisor.lastName || advisor.last_name}
                        </p>
                        <p className="text-xs text-purple-500">
                          Assigned {lead.assigned_at ? new Date(lead.assigned_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' }) : '—'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-amber-700 font-semibold mb-2">Not yet assigned</p>
                      <Btn variant="primary" size="sm" onClick={() => setShowAssign(true)}>
                        <FiUserPlus size={12} /> Assign
                      </Btn>
                    </div>
                  )}
                </div>
              </SectionBox>

              {/* Referral / Commission */}
              {isReferral && commInfo && (
                <SectionBox title="Referral & Commission" icon={FiPackage} accent="#d97706"
                  action={
                    <button onClick={() => setShowCommission(true)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200">
                      <FiEdit3 size={10} className="inline mr-1" />Update
                    </button>
                  }>
                  <div className="divide-y divide-gray-50">
                    <div className="py-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Commission Status</p>
                      {(() => {
                        const cfg = COMMISSION_CONFIG[commInfo.commission_status] || COMMISSION_CONFIG.pending;
                        return (
                          <span className="px-3 py-1.5 rounded-full text-xs font-bold border" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                            {cfg.label}
                          </span>
                        );
                      })()}
                    </div>
                    {commInfo.referral_code && <InfoRow icon={FiTag}      label="Referral Code"   value={commInfo.referral_code} />}
                    {commInfo.commission_rate != null && <InfoRow icon={FiDollarSign} label="Commission Rate" value={`${commInfo.commission_rate}%`} />}
                    {commInfo.commission_paid_at && <InfoRow icon={FiCalendar} label="Paid At"
                      value={new Date(commInfo.commission_paid_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })} />}
                    {commInfo.notes && <InfoRow icon={FiMessageSquare} label="Notes" value={commInfo.notes} />}
                  </div>
                </SectionBox>
              )}

              {/* Lead meta */}
              <SectionBox title="Lead Info" icon={FiLayers} accent="#475569">
                <div className="divide-y divide-gray-50">
                  <InfoRow icon={FiLayers} label="Source"      value={lead.source?.channel?.replace(/_/g,' ') || '—'} />
                  <InfoRow icon={FiTag}    label="Enquiry Type" value={lead.enquiry_type || '—'} />
                  <InfoRow icon={FiClock}  label="Created"     value={lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-AE',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'} />
                  {lead.classification_reason && <InfoRow icon={FiAlertCircle} label="Classification Reason" value={lead.classification_reason} />}
                </div>
              </SectionBox>

            </div>

            {/* ── RIGHT MAIN ── */}
            <div className="lg:col-span-8 space-y-4">

              {/* Requirements */}
              {(req.property_type || req.budget_min || req.budget_max || req.bedrooms != null || locs.length > 0 || req.additional_notes) && (
                <SectionBox title="Client Requirements" icon={FiTag}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 divide-y divide-gray-50">
                    {req.property_type    && <InfoRow icon={FiHome}        label="Property Type"  value={req.property_type} />}
                    {req.transaction_type && <InfoRow icon={FiTag}         label="Transaction"    value={req.transaction_type} />}
                    {(req.budget_min || req.budget_max) && (
                      <InfoRow icon={FiDollarSign} label="Budget" value={
                        req.budget_min && req.budget_max
                          ? `AED ${Number(req.budget_min).toLocaleString()} – AED ${Number(req.budget_max).toLocaleString()}`
                          : req.budget_max ? `Up to AED ${Number(req.budget_max).toLocaleString()}` : `From AED ${Number(req.budget_min).toLocaleString()}`
                      } />
                    )}
                    {req.bedrooms  != null && <InfoRow icon={FiHome} label="Bedrooms"   value={req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`} />}
                    {req.bathrooms != null && <InfoRow icon={FiHome} label="Bathrooms"  value={`${req.bathrooms}`} />}
                    {req.furnished         && <InfoRow icon={FiHome} label="Furnishing"  value={req.furnished} />}
                    {req.ready_by_date     && <InfoRow icon={FiCalendar} label="Ready By"
                      value={new Date(req.ready_by_date).toLocaleDateString('en-AE',{day:'2-digit',month:'short',year:'numeric'})} />}
                    {locs.length > 0       && <InfoRow icon={FiMapPin} label="Locations"  value={locs.join(', ')} />}
                    {req.additional_notes  && <InfoRow icon={FiMessageSquare} label="Notes" value={req.additional_notes} />}
                  </div>
                </SectionBox>
              )}

              {/* Client reactions on matched listings */}
              {matchedListed.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <CollapseHeader title="Client Reactions on Properties" icon={FiActivity}
                    count={matchedListed.length} open={showMatched}
                    onToggle={() => setShowMatched(p => !p)} accent="#059669" />
                  {showMatched && (
                    <div className="p-5 space-y-3">
                      {matchedListed.map((m, i) => {
                        const prop = m.listing_id;
                        const name = typeof prop === 'object' ? (prop?.propertyName || prop?.title || 'Property') : `ID: ${String(prop).slice(-6)}`;
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                              <p className="text-xs text-gray-400">Score: {Math.max(0, m.match_score || 0)}</p>
                              {m.interested_inventory_unit && <p className="text-[10px] font-semibold text-purple-700 mt-1">Unit: {getInventoryLabel(m.interested_inventory_unit)}</p>}
                            </div>
                            <ReactionPill reaction={m.client_interested === true ? 'interested' : m.client_interested === false ? 'not_interested' : 'pending'} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Advisor suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <CollapseHeader title="Advisor Suggestions" icon={FiStar}
                    count={suggestions.length} open={showSuggestions}
                    onToggle={() => setShowSuggestions(p => !p)} />
                  {showSuggestions && (
                    <div className="p-5 space-y-3">
                      {suggestions.map((s, i) => {
                        const propId = s.property_id?._id || s.property_id;
                        const propName = typeof s.property_id === 'object'
                          ? (s.property_id?.propertyName || s.property_id?.title || 'Property')
                          : `ID: ${String(propId).slice(-6)}`;
                        return (
                          <div key={i} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-800">{propName}</p>
                              <ReactionPill reaction={s.client_reaction} />
                            </div>
                            {s.interested_inventory_unit && <p className="text-[10px] font-semibold text-purple-700 mt-1">Unit: {getInventoryLabel(s.interested_inventory_unit)}</p>}
                            {s.note && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{s.note}</p>}
                            <p className="text-[10px] text-gray-400 mt-2">
                              Suggested {s.suggested_at ? new Date(s.suggested_at).toLocaleDateString('en-AE',{day:'2-digit',month:'short'}) : '—'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Smart Matches */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: GR }}>
                    <FiHome size={14} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1">Smart Matches</h4>
                  {mc && !matchLoading && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
                      <McIcon size={10} /> {mc.label}
                    </span>
                  )}
                  <button onClick={fetchMatches}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors ml-1">
                    {matchLoading ? <FiLoader size={12} className="animate-spin" /> : <FiRefreshCw size={12} />}
                  </button>
                </div>
                <div className="p-5">
                  {matchLoading && (
                    <div className="text-center py-8">
                      <FiLoader size={22} className="animate-spin mx-auto mb-3" style={{ color: P }} />
                      <p className="text-xs text-gray-400">Finding matches…</p>
                    </div>
                  )}
                  {!matchLoading && matchNote && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100 mb-4 text-xs font-medium" style={{ color: P }}>
                      <FiInfo size={13} className="flex-shrink-0 mt-0.5" /> {matchNote}
                    </div>
                  )}
                  {!matchLoading && (matchType === 'none' || isNurturing) && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 mb-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-red-600 mb-1">
                        <FiXCircle size={16} /> No matching properties found
                      </div>
                      <p className="text-xs text-red-700 leading-relaxed pl-6">Client is in the nurturing list. Advisor can manually suggest alternatives.</p>
                    </div>
                  )}
                  {!matchLoading && matches.length > 0 && (
                    <div className="grid max-h-[560px] grid-cols-1 gap-3 overflow-y-auto pr-1 xl:grid-cols-2">
                      {matches.map((p, i) => <MatchedPropertyCard key={p._id || i} property={p} matchType={matchType} />)}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <CollapseHeader title="Notes" icon={FiMessageSquare}
                  count={notes.length} open={showNotes}
                  onToggle={() => setShowNotes(p => !p)} />
                {showNotes && (
                  <div className="p-5">
                    {notes.length === 0
                      ? <p className="text-center text-xs text-gray-400 py-4">No notes on this lead.</p>
                      : (
                        <div className="space-y-3">
                          {[...notes].reverse().map((n, i) => (
                            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                              <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {(n.author?.[0] || 'A').toUpperCase()}
                                </span>
                                <span className="text-xs font-bold text-gray-600">{n.author || 'System'}</span>
                                {n.author_type && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-500 uppercase">{n.author_type}</span>
                                )}
                                {n.is_private === false && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Public</span>
                                )}
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
              {history.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <CollapseHeader title="Status Timeline" icon={FiActivity}
                    count={history.length} open={showHistory}
                    onToggle={() => setShowHistory(p => !p)} />
                  {showHistory && (
                    <div className="px-5 pb-5 pt-2">
                      <div className="relative">
                        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-100" />
                        <div className="space-y-4">
                          {[...history].reverse().map((h, i) => (
                            <div key={i} className="relative pl-10">
                              <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center"
                                style={{ background: P }}>
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <StatusBadge status={h.status} />
                                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <FiCalendar size={10} />
                                    {h.changed_at ? new Date(h.changed_at).toLocaleDateString('en-AE',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
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

export default GridAgentLeadDetailadmin;



