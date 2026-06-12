import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { City } from 'country-state-city';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiHome, FiMapPin,
  FiCalendar, FiFileText, FiCheckCircle, FiAlertCircle,
  FiChevronDown, FiPlus, FiX, FiLoader, FiSearch, FiStar, FiActivity,
  FiImage, FiInfo, FiXCircle
} from 'react-icons/fi';
import { message } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const PRIMARY = '#5c039b';
const PRIMARY_LIGHT = '#fdf4f8';
// const GRADIENT = 'linear-gradient(135deg, #5c039b 0%, #9d174d 100%)';

// Custom AED Icon/Text for Budget Inputs
const AEDIcon = ({ className }) => (
  <span className={`${className} text-[10px] font-extrabold tracking-widest mt-0.5`}>AED</span>
);

// ─────────────────────────────────────────────────────────────
// FORM FIELD COMPONENTS
// ─────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
    {children} {required && <span className="text-red-500 normal-case">*</span>}
  </label>
);

const InputField = ({ label, required, error, icon: Icon, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Icon size={16} className="text-gray-400" /></div>}
      <input
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 rounded-xl border text-sm font-medium text-gray-800 bg-gray-50/50 placeholder-gray-400 outline-none transition-all duration-200 
        ${error ? 'border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-[#5c039b] focus:bg-white focus:ring-4 focus:ring-[#5c039b]/10 hover:border-gray-300'}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1.5"><FiAlertCircle size={12} />{error}</p>}
  </div>
);

const SelectField = ({ label, required, error, children, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <div className="relative">
      <select
        className={`w-full pl-4 pr-10 py-2.5 rounded-xl border text-sm font-medium text-gray-800 bg-gray-50/50 outline-none appearance-none transition-all duration-200 
        ${error ? 'border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-[#5c039b] focus:bg-white focus:ring-4 focus:ring-[#5c039b]/10 hover:border-gray-300'}`}
        {...props}
      >
        {children}
      </select>
      <FiChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1.5"><FiAlertCircle size={12} />{error}</p>}
  </div>
);

const TextareaField = ({ label, required, error, ...props }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    <textarea
      rows={3}
      className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-gray-800 bg-gray-50/50 placeholder-gray-400 outline-none transition-all duration-200 resize-none 
      ${error ? 'border-red-400 bg-red-50 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-[#5c039b] focus:bg-white focus:ring-4 focus:ring-[#5c039b]/10 hover:border-gray-300'}`}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1.5"><FiAlertCircle size={12} />{error}</p>}
  </div>
);

const SectionCard = ({ title, icon: Icon, children, headerExtra }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: PRIMARY_LIGHT, color: PRIMARY }}>
        <Icon size={16} />
      </div>
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
      {headerExtra && <div className="ml-auto">{headerExtra}</div>}
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// LIVE MATCH PANEL COMPONENTS
// ─────────────────────────────────────────────────────────────
const MATCH_CONFIG = {
  exact:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', badge: '#16a34a', label: 'Exact Match',   icon: FiCheckCircle },
  relaxed: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', badge: '#d97706', label: 'Relaxed Match', icon: FiActivity },
  broad:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', badge: '#2563eb', label: 'Broader Area',  icon: FiMapPin },
  none:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', badge: '#dc2626', label: 'No Matches',    icon: FiXCircle },
};

const PropertyMatchCard = ({ property, matchType, onSelect }) => {
  const price = property.price_min || property.price || 0;
  const loc   = [property.area, property.city].filter(Boolean).join(', ');
  const mc    = MATCH_CONFIG[matchType] || MATCH_CONFIG.broad;
  const inventory = getInventoryList(property);
  const selectedUnit = property.interested_inventory_unit || null;

  return (
<div
  onClick={() => onSelect?.(property)}
  className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200 group cursor-pointer"
>      <div className="h-20 bg-slate-100 relative overflow-hidden flex items-center justify-center">
        {property.mainLogo ? (
          <img src={property.mainLogo} alt={property.propertyName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <FiImage size={24} className="text-slate-300" />
        )}
        
        <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1"
          style={{ background: mc.badge, color: '#fff' }}>
          {matchType}
        </span>
        
        {property.isFeatured && (
          <span className="absolute top-2 left-2 bg-amber-900 text-amber-100 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            <FiStar size={8} /> Featured
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="text-xs font-bold text-gray-900 truncate">{property.propertyName}</div>
        {loc && (
          <div className="text-[10px] font-medium text-gray-500 mt-1 mb-2 flex items-center gap-1 truncate">
            <FiMapPin size={10} className="flex-shrink-0"/> {loc}
          </div>
        )}
        <div className="flex justify-between items-center border-t border-gray-50 pt-2 mt-1">
          <div className="text-xs font-extrabold" style={{ color: PRIMARY }}>
            {price > 0 ? `AED ${Number(price).toLocaleString()}` : 'Price on Request'}
          </div>
          <div className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
            {property.bedrooms > 0 ? `${property.bedrooms} BR` : property.bedroomType === 'studio' ? 'Studio' : ''}
          </div>
        </div>
        <InventorySummary units={inventory} selectedUnit={selectedUnit} />
      </div>
    </div>
  );
};

const LiveMatchPanel = ({
  matches,
  loading,
  matchType,
  matchNote,
  hasFiltered,
  onSelectProperty
}) => {
  const mc = MATCH_CONFIG[matchType] || null;
  const McIcon = mc?.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden sticky top-24">
      
      {/* Header */}
      <div className="px-5 py-4 text-white flex items-center justify-between bg-[#5c039b]">
        <div>
          <div className="text-sm font-extrabold tracking-wide flex items-center gap-2">
            <FiActivity size={16} /> LIVE MATCHES
          </div>
          <div className="text-[10px] font-medium opacity-80 mt-1">
            Auto-updates via AI engine
          </div>
        </div>
        {hasFiltered && !loading && mc && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold shadow-sm">
            {matches.length} Found
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 bg-slate-50/50 min-h-[300px]">
        
        {/* Empty state */}
        {!hasFiltered && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: PRIMARY_LIGHT, color: PRIMARY }}>
              <FiSearch size={28} />
            </div>
            <div className="text-sm font-bold text-gray-800 mb-2">No criteria set</div>
            <div className="text-xs text-gray-500 leading-relaxed font-medium">
              Fill in property type, budget, or location to see matching listings instantly.
            </div>
          </div>
        )}

        {/* Loading */}
        {hasFiltered && loading && (
          <div className="text-center py-12 px-4">
            <FiLoader size={28} className="animate-spin mx-auto mb-4" style={{ color: PRIMARY }} />
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Scanning inventory...</div>
          </div>
        )}

        {/* Results */}
        {hasFiltered && !loading && (
          <>
            {mc && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 shadow-sm"
                style={{ background: mc.bg, border: `1px solid ${mc.border}` }}>
                <McIcon size={14} style={{ color: mc.color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: mc.color }}>{mc.label}</span>
              </div>
            )}

            {matchNote && (
              <div className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-100 p-3 mb-4 rounded-xl flex items-start gap-2 shadow-sm">
                <FiInfo className="mt-0.5 flex-shrink-0 text-purple-600" size={14} />
                <span className="leading-relaxed">{matchNote}</span>
              </div>
            )}

            {matchType === 'none' && (
              <div className="text-center p-5 bg-red-50 rounded-xl border border-red-100 shadow-sm">
                <FiXCircle size={32} className="text-red-400 mx-auto mb-3" />
                <div className="text-sm font-bold text-red-700 mb-2">No Matching Properties</div>
                <div className="text-xs font-medium text-red-800/80 leading-relaxed mb-4">
                  This client will be added to the nurturing list. The assigned advisor can manually suggest alternatives.
                </div>
                <div className="px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 text-xs font-semibold text-amber-800 flex items-start gap-2 text-left">
                  <FiInfo size={14} className="mt-0.5 flex-shrink-0" />
                  <span>Tip: Try broadening the budget range or removing location filters.</span>
                </div>
              </div>
            )}

           {matches.length > 0 && (
<div>

{/* Summary */}

<div className="flex items-center justify-between mb-3 px-1">
<div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
Showing {matches.length} Properties
</div>

<div className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-bold">
Smart AI Match
</div>
</div>

{/* Grid */}

<div className="
grid
grid-cols-1
gap-3
max-h-[650px]
overflow-y-auto
pr-2
scrollbar-thin
scrollbar-thumb-purple-200
scrollbar-track-transparent
">

{matches.map((p,i)=>(
 <PropertyMatchCard
  key={p._id || i}
  property={p}
  matchType={matchType}
  onSelect={onSelectProperty}
/>
))}

</div>

</div>
)}
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────
const UAE_POPULAR_AREAS = [
  'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Jumeirah Village Circle',
  'Jumeirah Lake Towers', 'Palm Jumeirah', 'Dubai Hills Estate', 'Arabian Ranches',
  'Damac Hills', 'Dubai Creek Harbour', 'Meydan', 'Jumeirah Beach Residence',
  'Al Barsha', 'Dubai Silicon Oasis', 'International City', 'Dubai Sports City',
  'Motor City', 'Al Furjan', 'Town Square', 'Jumeirah Golf Estates',
  'Yas Island', 'Saadiyat Island', 'Al Reem Island', 'Al Raha Beach',
  'Khalifa City', 'Mohammed Bin Zayed City', 'Al Maryah Island',
  'Sharjah Waterfront City', 'Aljada', 'Maryam Island', 'Al Majaz',
  'Ajman Corniche', 'Al Nuaimiya', 'Al Hamra Village', 'Mina Al Arab',
];

const UNIT_TYPE_MAP = {
  Apartment: 'apartment', Villa: 'villa', Townhouse: 'townhouse',
  Penthouse: 'penthouse', Studio: 'apartment', Office: 'office',
  Retail: 'retail', Warehouse: 'warehouse', Land: 'plot',
};

const unwrapList = (res) => {
  const data = res?.data?.success !== undefined ? res.data : res?.data || res;
  if (Array.isArray(data))             return data;
  if (Array.isArray(data?.data))       return data.data;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data?.results))    return data.results;
  if (Array.isArray(data?.items))      return data.items;
  return [];
};

const getPropertyId   = (p) => p?._id || p?.id || '';
const getPropertyName = (p) => p?.propertyName || p?.title || p?.name || 'Untitled';
const getPropertyMeta = (p) => {
  const loc   = [p?.area, p?.city, p?.emirate].filter(Boolean).join(', ');
  const price = p?.price ? `AED ${Number(p.price).toLocaleString('en-AE')}` : '';
  return [loc, price].filter(Boolean).join(' - ');
};

const getInventoryList = (item) => item?.inventory || item?.listing_inventory || item?.source?.listing_inventory || [];
const getInventoryId = (unit) => unit?._id || unit?.id || unit;
const getInventoryLabel = (unit) => {
  if (!unit) return '';
  const bits = [
    unit.unitNumber ? `Unit ${unit.unitNumber}` : null,
    unit.bedroomType || (unit.bedrooms != null ? (unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms}BR`) : null),
    unit.area ? `${Number(unit.area).toLocaleString()} ${unit.areaUnit || 'sqft'}` : null,
    unit.price ? `AED ${Number(unit.price).toLocaleString()}` : null,
    unit.status,
  ].filter(Boolean);
  return bits.join(' | ');
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


// ─────────────────────────────────────────────────────────────
// MAIN: CREATE LEAD PAGE
// ─────────────────────────────────────────────────────────────
const CreateAgentLead = ({ navigate }) => {
  const routerNavigate = useNavigate();
  const goTo = navigate || routerNavigate;

  const [form, setForm] = useState({
    first_name: '', last_name: '', phone_number: '',
    country_code: '+971', email: '',
    property_type: '', transaction_type: 'buy',
    budget_min: '', budget_max: '',
    bedrooms: '', bathrooms: '',
    area_sqft_min: '', area_sqft_max: '',
    furnished: 'any', ready_by_date: '', additional_notes: '',
    enquiry_type: '', listing_id: '', inventory_unit_id: '',
  });

  const [locationInputs, setLocationInputs] = useState(['']);
  const [properties, setProperties]         = useState([]);
  const [propertyInventory, setPropertyInventory] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]   = useState('');

  // ── Live matching state ───────────────────────────────────
  const [liveMatches,  setLiveMatches]  = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchType,    setMatchType]    = useState('');
  const [matchNote,    setMatchNote]    = useState('');
  const [hasFiltered,  setHasFiltered]  = useState(false);
  const matchTimerRef = useRef(null);

  const uaeLocations = useMemo(() => {
    const cities = City.getCitiesOfCountry('AE')?.map((c) => c.name) || [];
    return [...new Set([...UAE_POPULAR_AREAS, ...cities])].sort((a, b) => a.localeCompare(b));
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true);
      try {
        const res = await apiService.get('/properties/public');
        setProperties(unwrapList(res).filter((p) => getPropertyId(p)));
      } catch {
        setProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProperties();
  }, []);


  useEffect(() => {
    const fetchInventoryForSelectedProperty = async () => {
      if (!form.listing_id) {
        setPropertyInventory([]);
        setForm((prev) => ({ ...prev, inventory_unit_id: '' }));
        return;
      }
      setLoadingInventory(true);
      try {
        const res = await apiService.get(`/properties/inventory?propertyId=${form.listing_id}`);
        const data = res?.data?.data || res?.data || res;
        setPropertyInventory(Array.isArray(data) ? data : []);
      } catch {
        setPropertyInventory([]);
      } finally {
        setLoadingInventory(false);
      }
    };
    fetchInventoryForSelectedProperty();
  }, [form.listing_id]);

  useEffect(() => {
    const hasAnyCriteria =
      form.property_type || form.budget_max || form.budget_min ||
      form.bedrooms || locationInputs.some((l) => l.trim());

    if (!hasAnyCriteria) {
      setLiveMatches([]);
      setHasFiltered(false);
      setMatchType('');
      setMatchNote('');
      return;
    }

    setHasFiltered(true);

    if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    matchTimerRef.current = setTimeout(fetchLiveMatches, 750);

    return () => {
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.property_type, form.transaction_type, form.budget_min, form.budget_max, form.bedrooms, locationInputs]);

  const buildParams = (mode) => {
    const p = new URLSearchParams();
    p.set('approvalStatus', 'approved');
    p.set('listingStatus', 'active');
    p.set('limit', '8');

    if (form.transaction_type === 'rent') p.set('propertySubType', 'rental');
    if (form.property_type && UNIT_TYPE_MAP[form.property_type]) {
      p.set('unitType', UNIT_TYPE_MAP[form.property_type]);
    }

    const mult = mode === 'relaxed' ? 1.2 : mode === 'broad' ? 1.5 : 1.0;
    if (form.budget_max) p.set('maxPrice', Math.round(Number(form.budget_max) * mult));
    if (form.budget_min && mode === 'strict') p.set('minPrice', form.budget_min);

    if (form.bedrooms) {
      const beds = mode === 'relaxed' ? Math.max(0, Number(form.bedrooms) - 1) : Number(form.bedrooms);
      p.set('bedrooms', beds);
    }

    if (mode !== 'broad') {
      const areas = locationInputs.filter((l) => l.trim());
      if (areas[0]) p.set('area', areas[0]);
    }

    return p.toString();
  };

  const fetchLiveMatches = async () => {
    const hasAnyCriteria =
      form.property_type || form.budget_max || form.budget_min ||
      form.bedrooms || locationInputs.some((l) => l.trim());

    if (!hasAnyCriteria) {
      setLiveMatches([]);
      setMatchType('none');
      setMatchNote('');
      setMatchLoading(false);
      return;
    }

    setMatchLoading(true);
    try {
      const strictRes  = await apiService.get(`/properties/?${buildParams('strict')}`);
      const strictData = unwrapList(strictRes);
      if (strictData.length >= 2) {
        setLiveMatches(strictData.slice(0, 8));
        setMatchType('exact');
        setMatchNote('');
        return;
      }

      const relaxedRes  = await apiService.get(`/properties/?${buildParams('relaxed')}`);
      const relaxedData = unwrapList(relaxedRes);
      if (relaxedData.length >= 2) {
        setLiveMatches(relaxedData.slice(0, 8));
        setMatchType('relaxed');
        setMatchNote('Budget slightly relaxed & bedroom count adjusted for better results.');
        return;
      }

      const broadRes  = await apiService.get(`/properties/?${buildParams('broad')}`);
      const broadData = unwrapList(broadRes);
      setLiveMatches(broadData.slice(0, 8));
      setMatchType(broadData.length > 0 ? 'broad' : 'none');
      setMatchNote(broadData.length > 0 ? 'Showing properties from similar areas based on budget.' : '');

    } catch {
      setLiveMatches([]);
      setMatchType('none');
      setMatchNote('');
    } finally {
      setMatchLoading(false);
    }
  };

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const addLocation    = () => setLocationInputs((prev) => [...prev, '']);
  const removeLocation = (i) => setLocationInputs((prev) => prev.filter((_, idx) => idx !== i));
  const updateLocation = (i, val) => setLocationInputs((prev) => prev.map((v, idx) => idx === i ? val : v));

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (form.budget_min && form.budget_max && Number(form.budget_min) > Number(form.budget_max))
      errs.budget_max = 'Max budget cannot be less than Min budget';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...(form.first_name   && { first_name:   form.first_name.trim()   }),
        ...(form.last_name    && { last_name:    form.last_name.trim()    }),
        ...(form.phone_number && { phone_number:  form.phone_number.trim(), country_code: form.country_code }),
        ...(form.email        && { email:         form.email.trim()        }),
        ...(form.property_type    && { property_type:   form.property_type    }),
        transaction_type:           form.transaction_type,
        location_preferences:       locationInputs.filter((l) => l.trim()).map((l) => l.trim()),
        ...(form.budget_min   && { budget_min:   Number(form.budget_min)    }),
        ...(form.budget_max   && { budget_max:   Number(form.budget_max)    }),
        ...(form.bedrooms     && { bedrooms:      Number(form.bedrooms)      }),
        ...(form.bathrooms    && { bathrooms:     Number(form.bathrooms)     }),
        ...(form.area_sqft_min && { area_sqft_min: Number(form.area_sqft_min) }),
        ...(form.area_sqft_max && { area_sqft_max: Number(form.area_sqft_max) }),
        furnished:              form.furnished,
        ...(form.ready_by_date    && { ready_by_date:    form.ready_by_date    }),
        ...(form.additional_notes && { additional_notes: form.additional_notes }),
        ...(form.enquiry_type && { enquiry_type: form.enquiry_type }),
        ...(form.listing_id   && { listing_id:   form.listing_id   }),
        ...(form.inventory_unit_id && { inventory_unit_id: form.inventory_unit_id }),
      };

      const res    = await apiService.post('/gridlead/agent/create-lead', payload);
      const result = res?.data?.success !== undefined ? res.data : res;

      if (result?.success) {
        message.success(result?.message || 'Lead created successfully');
        goTo('/dashboard/agent/GridAgent-lead');
      } else {
        const errMsg = result?.message || 'Something went wrong.';
        setApiError(errMsg);
        message.error(errMsg);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Server error.';
      setApiError(errMsg);
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">

      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => goTo('/dashboard/agent/GridAgent-lead')}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Create New Lead</h1>
              <p className="text-xs font-medium text-gray-400 mt-0.5 tracking-wider uppercase">Add a new client requirement</p>
            </div>
          </div>

          {/* Match count chip in header */}
          {hasFiltered && !matchLoading && matchType && matchType !== 'none' && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm"
              style={{ background: MATCH_CONFIG[matchType]?.bg, color: MATCH_CONFIG[matchType]?.color, border: `1px solid ${MATCH_CONFIG[matchType]?.border}` }}>
              <FiCheckCircle size={14} /> {liveMatches.length} {matchType} Match{liveMatches.length !== 1 ? 'es' : ''}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* ── LEFT: Form ── */}
          <div className="flex-1 min-w-0 w-full">
            <form id="create-lead-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

              {apiError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 shadow-sm">
                  <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-sm font-semibold text-red-800">{apiError}</p>
                </div>
              )}

              {/* Section 1: Client Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: PRIMARY_LIGHT, color: PRIMARY }}>
                    <FiUser size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Client Information</h3>
                </div>
                <div className="px-6 pt-4 pb-2">
                  <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                    <FiInfo className="text-purple-500 mt-0.5 flex-shrink-0" size={15} />
                    <p className="text-xs font-medium text-purple-800 leading-relaxed">
                      <span className="font-bold">Client anonymity is protected.</span> Only first name is required. Phone, email and last name are optional — you are not required to disclose your client's contact details. Contact info can be shared later when proceeding to site visit.
                    </p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="First Name" placeholder="e.g. John" required icon={FiUser}
                    value={form.first_name}
                    error={errors.first_name}
                    onChange={(e) => set('first_name', e.target.value)}
                  />
                  <InputField
                    label="Last Name" placeholder="e.g. Smith (optional)"
                    value={form.last_name}
                    onChange={(e) => set('last_name', e.target.value)}
                  />
                  <div>
                    <Label>Phone Number <span className="text-gray-400 font-normal normal-case text-[11px]">(optional)</span></Label>
                    <div className="flex gap-2">
                      <select
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-gray-50/50 outline-none focus:border-[#5c039b] focus:bg-white focus:ring-4 focus:ring-[#5c039b]/10 appearance-none transition-all"
                        style={{ minWidth: 90 }}
                        value={form.country_code}
                        onChange={(e) => set('country_code', e.target.value)}
                      >
                        {['+971', '+91', '+1', '+44', '+966', '+974', '+965', '+968'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input
                        type="tel" placeholder="50 123 4567 (optional)"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-gray-50/50 placeholder-gray-400 outline-none focus:border-[#5c039b] focus:bg-white focus:ring-4 focus:ring-[#5c039b]/10 transition-all"
                        value={form.phone_number}
                        onChange={(e) => set('phone_number', e.target.value)}
                      />
                    </div>
                  </div>
                  <InputField label="Email Address" type="email" placeholder="john@example.com (optional)" icon={FiMail} value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
              </div>

              {/* Section 2: Property Requirements */}
              <SectionCard title="Property Requirements" icon={FiHome}>
                <SelectField label="Property Type" value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>
                  <option value="">Select property type</option>
                  {['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Office', 'Retail', 'Warehouse', 'Land'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </SelectField>
                <SelectField label="Transaction Type" required value={form.transaction_type} onChange={(e) => set('transaction_type', e.target.value)}>
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                  <option value="invest">Invest</option>
                </SelectField>
                <InputField label="Min Budget" type="number" placeholder="500,000" icon={AEDIcon} value={form.budget_min} onChange={(e) => set('budget_min', e.target.value)} />
                <InputField label="Max Budget" type="number" placeholder="2,000,000" icon={AEDIcon} value={form.budget_max} onChange={(e) => set('budget_max', e.target.value)} error={errors.budget_max} />
                <SelectField label="Bedrooms" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}>
                  <option value="">Any</option>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>{n === 0 ? 'Studio' : `${n} BR`}</option>
                  ))}
                </SelectField>
                <SelectField label="Bathrooms" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)}>
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((n) => (<option key={n} value={n}>{n}</option>))}
                </SelectField>
                <InputField label="Min Area (sqft)" type="number" placeholder="500"  value={form.area_sqft_min} onChange={(e) => set('area_sqft_min', e.target.value)} />
                <InputField label="Max Area (sqft)" type="number" placeholder="3000" value={form.area_sqft_max} onChange={(e) => set('area_sqft_max', e.target.value)} />
                <SelectField label="Furnishing" value={form.furnished} onChange={(e) => set('furnished', e.target.value)}>
                  <option value="any">Any</option>
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </SelectField>
                <InputField label="Ready By Date" type="date" icon={FiCalendar} value={form.ready_by_date} onChange={(e) => set('ready_by_date', e.target.value)} />
              </SectionCard>

              {/* Section 3: Location Preferences */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: PRIMARY_LIGHT, color: PRIMARY }}>
                    <FiMapPin size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Location Preferences</h3>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg ml-auto uppercase tracking-wide">Affects live matching</span>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <datalist id="uae-location-options">
                    {uaeLocations.map((l) => <option key={l} value={l} />)}
                  </datalist>
                  {locationInputs.map((loc, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <FiMapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text" list="uae-location-options"
                          placeholder="Search UAE location (e.g., Dubai Marina)"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-gray-50/50 placeholder-gray-400 outline-none focus:border-[#5c039b] focus:bg-white focus:ring-4 focus:ring-[#5c039b]/10 transition-all"
                          value={loc}
                          onChange={(e) => updateLocation(i, e.target.value)}
                        />
                      </div>
                      {locationInputs.length > 1 && (
                        <button type="button" onClick={() => removeLocation(i)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <FiX size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addLocation}
                    className="flex items-center gap-2 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors px-4 py-2 rounded-xl w-fit">
                    <FiPlus size={16} /> Add Another Location
                  </button>
                </div>
              </div>

              {/* Mobile — live match panel */}
              <div className="xl:hidden mt-2">
               <LiveMatchPanel
  matches={liveMatches}
  loading={matchLoading}
  matchType={matchType}
  matchNote={matchNote}
  hasFiltered={hasFiltered}
  onSelectProperty={(property) => {
    console.log("Selected Property:", property);

    setSelectedProperty(property);

    setForm(prev => ({
      ...prev,
      listing_id: property._id
    }));
  }}
/>
              </div>

              {/* Section 4: Additional Info */}
              <SectionCard title="Additional Information" icon={FiFileText}>
                  <SelectField label="Enquiry Type" value={form.enquiry_type} onChange={(e) => set('enquiry_type', e.target.value)}>
                    <option value="">Auto (from transaction type)</option>
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                    <option value="sell">Sell</option>
                    <option value="general_enquiry">General Enquiry</option>
                    <option value="consultation">Consultation</option>
                  </SelectField>
                  {selectedProperty && (
  <div className="md:col-span-2">
    <Label>Selected Property</Label>

    <div className="p-4 rounded-xl border border-green-200 bg-green-50">
      <div className="font-bold text-green-800">
        {selectedProperty.propertyName}
      </div>

      <div className="text-sm text-green-700 mt-1">
        {selectedProperty.area}, {selectedProperty.city}
      </div>

      <div className="text-sm font-semibold mt-2">
        AED {Number(
          selectedProperty.price_min ||
          selectedProperty.price ||
          0
        ).toLocaleString()}
      </div>
    </div>
  </div>
)}
                  {form.listing_id && (
                    <div>
                      <Label>Interested Inventory Unit</Label>
                      <div className="relative">
                        <select
                          value={form.inventory_unit_id}
                          onChange={(e) => set('inventory_unit_id', e.target.value)}
                          className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-gray-50/50 outline-none appearance-none focus:border-[#5c039b] focus:bg-white focus:ring-4 focus:ring-[#5c039b]/10 transition-all"
                        >
                          <option value="">{loadingInventory ? 'Loading inventory...' : 'Select interested unit (optional)'}</option>
                          {propertyInventory.map((unit) => (
                            <option key={getInventoryId(unit)} value={getInventoryId(unit)}>{getInventoryLabel(unit)}</option>
                          ))}
                        </select>
                        {loadingInventory
                          ? <FiLoader size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none" />
                          : <FiChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        }
                      </div>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <TextareaField
                      label="Additional Notes"
                      placeholder="Any special requirements or private notes about the client…"
                      value={form.additional_notes}
                      onChange={(e) => set('additional_notes', e.target.value)}
                    />
                  </div>
              </SectionCard>

              {/* Submit bar */}
              <div className="sticky bottom-0 z-30 -mx-6 mt-4 border-t border-gray-200 bg-white/80 backdrop-blur-md px-6 py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => goTo('/dashboard/agent/GridAgent-lead')}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed w-full sm:w-auto bg-[#5c039b]"
                    
                  >
                    {submitting
                      ? <><FiLoader size={16} className="animate-spin" /> Saving Profile…</>
                      : <><FiCheckCircle size={16} /> Save Lead Profile</>
                    }
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ── RIGHT: Live Match Panel (desktop only, sticky) ── */}
          <div className="w-[340px] flex-shrink-0 sticky top-28 hidden xl:block">
        <LiveMatchPanel
  matches={liveMatches}
  loading={matchLoading}
  matchType={matchType}
  matchNote={matchNote}
  hasFiltered={hasFiltered}
  onSelectProperty={(property) => {
    console.log("Selected Property:", property);

    setSelectedProperty(property);

    setForm(prev => ({
      ...prev,
      listing_id: property._id
    }));
  }}
/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgentLead;