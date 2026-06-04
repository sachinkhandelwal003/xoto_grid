import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiMessageSquare,
  FiHome, FiMapPin, FiDollarSign, FiTag, FiLayers,
  FiClock, FiAlertCircle, FiActivity, FiCheckCircle,
  FiXCircle, FiChevronDown, FiChevronUp, FiInfo,
  FiFileText, FiRadio, FiTarget, FiBarChart2,
  FiLoader, FiShield, FiBriefcase, FiGitBranch,
  FiRepeat, FiList, FiCpu, FiHash,
} from 'react-icons/fi';
import { Spin } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

// ─── THEME ────────────────────────────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  new:                  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'New Lead'      },
  contacted:            { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', label: 'Contacted'     },
  qualified:            { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc', label: 'Qualified'     },
  in_discussion:        { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'In Discussion' },
  site_visit_scheduled: { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc', label: 'Site Visit'   },
  offer_made:           { bg: '#fdf2f8', color: '#db2777', border: '#fbcfe8', label: 'Offer Made'    },
  completed:            { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Completed'     },
  not_proceeding:       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Dropped'       },
};

const CLASS_CFG = {
  hot:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Hot'  },
  warm: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Warm' },
  cold: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Cold' },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (v) => (v == null || v === '' ? '—' : String(v));
const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('en-AE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';
const fmtMoney = (n) =>
  n != null ? `AED ${Number(n).toLocaleString()}` : null;

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const PillTag = ({ label, color, bg, border }) => (
  <span
    className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
    style={{ color, background: bg, border: `1px solid ${border || 'transparent'}` }}
  >
    {label}
  </span>
);

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: status || '—' };
  return <PillTag {...c} />;
};

const ClassBadge = ({ cls }) => {
  const c = CLASS_CFG[cls];
  if (!c) return null;
  return <PillTag {...c} />;
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: '#F5F3FF' }}
    >
      <Icon size={13} style={{ color: P }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5 break-words leading-snug">{value || '—'}</p>
    </div>
  </div>
);

const SectionBox = ({ title, icon: Icon, children, action, collapsible, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className={`flex items-center gap-3 px-5 py-4 border-b border-gray-50 ${collapsible ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: P, color: '#fff' }}
        >
          <Icon size={14} />
        </div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1">{title}</h4>
        {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
        {collapsible && (
          open
            ? <FiChevronUp size={14} className="text-gray-400 flex-shrink-0" />
            : <FiChevronDown size={14} className="text-gray-400 flex-shrink-0" />
        )}
      </div>
      {(!collapsible || open) && <div className="p-5">{children}</div>}
    </div>
  );
};

const EmptyState = ({ text }) => (
  <p className="text-center text-xs text-gray-400 py-4">{text}</p>
);

// ─── BOOL BADGE ───────────────────────────────────────────────────────────────
const BoolBadge = ({ yes, yesLabel = 'Yes', noLabel = 'No' }) => (
  <span
    className="px-2.5 py-0.5 rounded-full text-xs font-bold"
    style={{
      background: yes ? '#f0fdf4' : '#fef2f2',
      color: yes ? '#16a34a' : '#dc2626',
    }}
  >
    {yes ? yesLabel : noLabel}
  </span>
);

// ─── LIST SECTION (for history / empty arrays) ────────────────────────────────
const ListSection = ({ icon: Icon, title, items, renderItem, emptyText, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P, color: '#fff' }}>
          <Icon size={14} />
        </div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
          {title}
          {items?.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{items.length}</span>
          )}
        </h4>
        {open ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
      </button>
      {open && (
        <div className="p-5">
          {!items?.length
            ? <EmptyState text={emptyText || `No ${title.toLowerCase()} yet`} />
            : <div className="space-y-3">{items.map((item, i) => renderItem(item, i))}</div>
          }
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ReferralPartnerLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead,    setLead]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await apiService.get(`/gridlead/${id}`);
      const data = res?.data?.data || res?.data;
      setLead(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (id) fetchLead(); }, [id, fetchLead]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Spin size="large" />
      <p className="mt-4 text-gray-400 font-medium text-sm">Loading lead profile…</p>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !lead) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <FiAlertCircle size={48} className="text-gray-300" />
      <p className="text-gray-500 font-medium">{error || 'Lead not found.'}</p>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 text-sm font-bold transition-colors"
      >
        <FiArrowLeft size={14} /> Go Back
      </button>
    </div>
  );

  // ── Destructure ────────────────────────────────────────────────────────────
  const ci      = lead.contact_info    || {};
  const name    = ci.name              || {};
  const mobile  = ci.mobile            || {};
  const email   = ci.email             || {};
  const req     = lead.requirements    || {};
  const deal    = lead.deal_record     || {};
  const src     = lead.source          || {};
  const nurt    = lead.nurturing       || {};
  const signals = lead.intent_signals  || {};

  const fn       = name.first_name || '';
  const ln       = name.last_name  || '';
  const fullName = `${fn} ${ln}`.trim() || 'Unknown Client';

  const locs = (req.location_preferences || [])
    .map(l => (typeof l === 'string' ? l : l?.area))
    .filter(Boolean);

  const budgetStr = req.budget_min && req.budget_max
    ? `${fmtMoney(req.budget_min)} – ${fmtMoney(req.budget_max)}`
    : req.budget_max ? `Up to ${fmtMoney(req.budget_max)}`
    : req.budget_min ? `From ${fmtMoney(req.budget_min)}`
    : null;

  const bedroomsStr = req.bedrooms != null
    ? (req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`)
    : null;

  const notes        = lead.notes              || [];
  const statusHist   = lead.status_history     || [];
  const assignHist   = lead.assignment_history || [];
  const matchedList  = lead.matched_listings   || [];
  const presentations = lead.presentations     || [];
  const advisors     = lead.advisor_suggestions || [];
  const comms        = lead.communications     || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── STICKY TOP BAR ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold text-gray-900 truncate">{fullName}</h1>
              <p className="text-xs text-gray-400 font-medium">Lead ID: {String(lead._id).slice(-8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={lead.status} />
            <ClassBadge cls={lead.classification} />
            {lead.submitted_to_xoto && (
              <PillTag label="Submitted ✓" color="#059669" bg="#f0fdf4" border="#bbf7d0" />
            )}
            {lead.is_active && (
              <PillTag label="Active" color="#059669" bg="#f0fdf4" border="#bbf7d0" />
            )}
          </div>
        </div>
      </div>

      {/* ── SUBMITTED BANNER ── */}
      {lead.submitted_to_xoto && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
            <FiCheckCircle size={20} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">Lead submitted to Xoto Admin</p>
              <p className="text-xs text-green-700 mt-0.5">An advisor will be assigned shortly.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ════════ LEFT SIDEBAR ════════ */}
          <div className="lg:col-span-4 space-y-4">

            {/* Avatar card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0 shadow-lg"
                  style={{ background: GR }}
                >
                  {(fn?.[0] || '?').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold text-gray-900 leading-tight truncate">{fullName}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {lead.lead_type && (
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
                        style={{ color: P, background: '#F5F3FF', border: `1px solid #DDD6FE` }}
                      >
                        {lead.lead_type.replace(/_/g, ' ')}
                      </span>
                    )}
                    {lead.enquiry_type && (
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
                        style={{ color: '#0891b2', background: '#ecfeff', border: '1px solid #a5f3fc' }}
                      >
                        {lead.enquiry_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <SectionBox title="Contact Info" icon={FiUser}>
              <div className="divide-y divide-gray-50">
                <InfoRow icon={FiUser}         label="First Name"       value={fmt(fn)} />
                <InfoRow icon={FiUser}         label="Last Name"        value={fmt(ln)} />
                <InfoRow icon={FiPhone}        label="Phone"            value={mobile.number ? `${mobile.country_code || ''} ${mobile.number}`.trim() : '—'} />
                <InfoRow icon={FiMail}         label="Email"            value={fmt(email.address)} />
                <InfoRow icon={FiMessageSquare} label="Preferred Contact" value={fmt(ci.preferred_contact)} />
                {mobile.verified !== undefined && (
                  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                      <FiShield size={13} style={{ color: P }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verified</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">Phone: <BoolBadge yes={mobile.verified} /></span>
                        <span className="text-xs text-gray-500">Email: <BoolBadge yes={email.verified} /></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SectionBox>

            {/* Requirements */}
            <SectionBox title="Requirements" icon={FiTag}>
              <div className="divide-y divide-gray-50">
                {req.property_type    && <InfoRow icon={FiHome}        label="Property Type"    value={req.property_type} />}
                {req.transaction_type && <InfoRow icon={FiTag}         label="Transaction"      value={req.transaction_type} />}
                {budgetStr            && <InfoRow icon={FiDollarSign}  label="Budget"           value={budgetStr} />}
                {bedroomsStr          && <InfoRow icon={FiHome}        label="Bedrooms"         value={bedroomsStr} />}
                {req.bathrooms        && <InfoRow icon={FiHome}        label="Bathrooms"        value={String(req.bathrooms)} />}
                {req.furnished        && <InfoRow icon={FiHome}        label="Furnished"        value={req.furnished} />}
                {locs.length > 0      && <InfoRow icon={FiMapPin}      label="Locations"        value={locs.join(', ')} />}
                {req.additional_notes && <InfoRow icon={FiMessageSquare} label="Notes"          value={req.additional_notes} />}
              </div>
              {/* Location pills */}
              {locs.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {locs.map((l, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: '#F5F3FF', color: P, border: `1px solid #DDD6FE` }}
                    >
                      <FiMapPin size={10} /> {l}
                    </span>
                  ))}
                </div>
              )}
            </SectionBox>

            {/* Lead Meta */}
            <SectionBox title="Lead Info" icon={FiLayers}>
              <div className="divide-y divide-gray-50">
                <InfoRow icon={FiRadio}       label="Source Channel"   value={fmt(src.channel?.replace(/_/g, ' '))} />
                <InfoRow icon={FiHash}        label="Lead Type"        value={fmt(lead.lead_type?.replace(/_/g, ' '))} />
                <InfoRow icon={FiTag}         label="Enquiry Type"     value={fmt(lead.enquiry_type)} />
                <InfoRow icon={FiClock}       label="Created"          value={fmtDate(lead.createdAt)} />
                <InfoRow icon={FiClock}       label="Updated"          value={fmtDate(lead.updatedAt)} />
                {lead.classification_reason && (
                  <InfoRow icon={FiAlertCircle} label="Classification Reason" value={lead.classification_reason} />
                )}
              </div>
            </SectionBox>

          </div>

          {/* ════════ RIGHT COLUMN ════════ */}
          <div className="lg:col-span-8 space-y-5">

            {/* ── OVERVIEW STATS STRIP ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Overview</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Status',            value: <StatusBadge status={lead.status} /> },
                  { label: 'Classification',    value: <ClassBadge cls={lead.classification} /> || <span className="text-xs text-gray-400">—</span> },
                  { label: 'Submitted to Xoto', value: <BoolBadge yes={lead.submitted_to_xoto} /> },
                  { label: 'Deal Created',      value: <BoolBadge yes={deal.created} /> },
                  { label: 'Commission',        value: <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{deal.commission_status?.replace(/_/g, ' ') || 'Pending'}</span> },
                  { label: 'Duplicate',         value: <BoolBadge yes={lead.is_duplicate} yesLabel="Yes" noLabel="No" /> },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3.5 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">{label}</p>
                    {value}
                  </div>
                ))}
              </div>
            </div>

            {/* ── DEAL RECORD ── */}
            <SectionBox title="Deal Record" icon={FiBriefcase}>
              <div className="divide-y divide-gray-50">
                <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                    <FiCheckCircle size={13} style={{ color: P }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Deal Created</p>
                    <div className="mt-0.5"><BoolBadge yes={deal.created} /></div>
                  </div>
                </div>
                <InfoRow icon={FiDollarSign} label="Commission Status"  value={fmt(deal.commission_status?.replace(/_/g, ' '))} />
                <div className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                    <FiFileText size={13} style={{ color: P }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Evidence</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <BoolBadge yes={deal.evidence_uploaded} yesLabel="Uploaded" noLabel="Not Uploaded" />
                      {deal.evidence_documents?.length > 0 && (
                        <span className="text-xs text-gray-500">{deal.evidence_documents.length} file(s)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SectionBox>

            {/* ── NURTURING ── */}
            <SectionBox title="Nurturing" icon={FiActivity}>
              <div className="divide-y divide-gray-50">
                <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                    <FiActivity size={13} style={{ color: P }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Is Nurturing</p>
                    <div className="mt-0.5"><BoolBadge yes={nurt.is_nurturing} /></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                    <FiInfo size={13} style={{ color: P }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Notify When Available</p>
                    <div className="mt-0.5"><BoolBadge yes={nurt.notify_when_available} /></div>
                  </div>
                </div>
                {nurt.nurturing_reason && <InfoRow icon={FiMessageSquare} label="Reason"     value={nurt.nurturing_reason} />}
                {nurt.nurturing_started_at && <InfoRow icon={FiClock}     label="Started At" value={fmtDate(nurt.nurturing_started_at)} />}
                {nurt.last_nudge_sent_at   && <InfoRow icon={FiClock}     label="Last Nudge" value={fmtDate(nurt.last_nudge_sent_at)} />}
              </div>
            </SectionBox>

            {/* ── INTENT SIGNALS ── */}
            <SectionBox title="Intent Signals" icon={FiBarChart2}>
              <div className="divide-y divide-gray-50">
                <InfoRow icon={FiRepeat} label="Repeat Visits"     value={fmt(signals.repeat_visits ?? 0)} />
                <InfoRow icon={FiList}   label="Properties Viewed" value={signals.properties_viewed?.length > 0 ? signals.properties_viewed.join(', ') : 'None'} />
                <InfoRow icon={FiTag}    label="Search Criteria"   value={signals.search_criteria?.length > 0 ? signals.search_criteria.join(', ') : 'None'} />
              </div>
            </SectionBox>

            {/* ── ASSIGNMENT & TRACKING ── */}
            <SectionBox title="Assignment & Tracking" icon={FiTarget}>
              <div className="divide-y divide-gray-50">
                <InfoRow icon={FiUser}    label="Assigned To"          value={fmt(lead.assigned_to)} />
                <InfoRow icon={FiClock}   label="Assigned At"          value={fmtDate(lead.assigned_at)} />
                <InfoRow icon={FiUser}    label="Created By Agent"     value={fmt(lead.created_by_agent)} />
                <InfoRow icon={FiHash}    label="Created By (User ID)" value={fmt(lead.created_by)} />
                <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                    <FiCheckCircle size={13} style={{ color: P }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Follow-Up Reminder</p>
                    <div className="mt-0.5">
                      <BoolBadge yes={lead.follow_up_reminder_sent} yesLabel="Sent" noLabel="Not Sent" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F3FF' }}>
                    <FiShield size={13} style={{ color: P }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Flags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <BoolBadge yes={lead.is_active} yesLabel="Active" noLabel="Inactive" />
                      {lead.is_duplicate && <BoolBadge yes={true} yesLabel="Duplicate" noLabel="" />}
                      {lead.is_deleted   && <BoolBadge yes={false} yesLabel="" noLabel="Deleted" />}
                    </div>
                  </div>
                </div>
              </div>
            </SectionBox>

            {/* ── NOTES ── */}
            <ListSection
              icon={FiMessageSquare}
              title="Private Notes"
              items={notes}
              defaultOpen={true}
              emptyText="No notes yet."
              renderItem={(n, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{n.text || n}</p>
                  {n.created_at && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: '#F5F3FF', color: P }}>
                        {(n.author?.[0] || 'A').toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-gray-600">{n.author || 'Agent'}</span>
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <FiClock size={10} /> {fmtDate(n.created_at || n.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            />

            {/* ── STATUS HISTORY ── */}
            {statusHist.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                  onClick={function() { this.nextElementSibling?.classList.toggle('hidden'); }.bind(null)}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P, color: '#fff' }}>
                    <FiActivity size={14} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex-1 text-left">
                    Status Timeline
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">{statusHist.length}</span>
                  </h4>
                </button>
                <StatusTimeline history={statusHist} />
              </div>
            )}

            {/* ── ASSIGNMENT HISTORY ── */}
            <ListSection
              icon={FiGitBranch}
              title="Assignment History"
              items={assignHist}
              defaultOpen={false}
              renderItem={(h, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-sm text-gray-700">
                  <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(h, null, 2)}</pre>
                </div>
              )}
            />

            {/* ── MATCHED LISTINGS ── */}
            <ListSection
              icon={FiHome}
              title="Matched Listings"
              items={matchedList}
              defaultOpen={false}
              renderItem={(m, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-gray-800 truncate">
                      {m.listing_id?.propertyName || m.listing_id?.title || `Listing ${i + 1}`}
                    </span>
                    {m.client_interested === true  && <BoolBadge yes={true}  yesLabel="Interested" noLabel="" />}
                    {m.client_interested === false && <BoolBadge yes={false} yesLabel="" noLabel="Not Interested" />}
                  </div>
                  {m.match_score != null && (
                    <p className="text-xs text-gray-400 mt-1">Match score: {m.match_score}</p>
                  )}
                </div>
              )}
            />

            {/* ── COMMUNICATIONS ── */}
            <ListSection
              icon={FiMessageSquare}
              title="Communications"
              items={comms}
              defaultOpen={false}
              renderItem={(c, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs text-gray-600">
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(c, null, 2)}</pre>
                </div>
              )}
            />

            {/* ── PRESENTATIONS ── */}
            <ListSection
              icon={FiFileText}
              title="Presentations"
              items={presentations}
              defaultOpen={false}
              renderItem={(p, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs text-gray-600">
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(p, null, 2)}</pre>
                </div>
              )}
            />

            {/* ── ADVISOR SUGGESTIONS ── */}
            <ListSection
              icon={FiCpu}
              title="Advisor Suggestions"
              items={advisors}
              defaultOpen={false}
              renderItem={(a, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs text-gray-600">
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(a, null, 2)}</pre>
                </div>
              )}
            />

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STATUS TIMELINE (self-contained collapsible) ─────────────────────────────
function StatusTimeline({ history }) {
  const [open, setOpen] = useState(false);
  const STATUS_CFG_LOCAL = {
    new:                  { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'New Lead'      },
    contacted:            { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', label: 'Contacted'     },
    qualified:            { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc', label: 'Qualified'     },
    in_discussion:        { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'In Discussion' },
    site_visit_scheduled: { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc', label: 'Site Visit'   },
    offer_made:           { bg: '#fdf2f8', color: '#db2777', border: '#fbcfe8', label: 'Offer Made'    },
    completed:            { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Completed'     },
    not_proceeding:       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Dropped'       },
  };

  return (
    <>
      <button
        className="w-full flex items-center justify-end px-5 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        {open ? <><FiChevronUp size={14} className="mr-1"/> Hide</> : <><FiChevronDown size={14} className="mr-1"/> Show timeline</>}
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="relative">
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-4">
              {[...history].reverse().map((h, i) => {
                const cfg = STATUS_CFG_LOCAL[h.status] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: h.status };
                return (
                  <div key={i} className="relative pl-10">
                    <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center" style={{ background: '#4A027C' }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                          <FiClock size={10}/>
                          {h.changed_at ? new Date(h.changed_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' }) : '—'}
                        </span>
                      </div>
                      {h.notes && <p className="text-xs text-gray-500 leading-relaxed">{h.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
