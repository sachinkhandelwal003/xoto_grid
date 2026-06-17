import React, { useState, useEffect, useCallback } from 'react';
import { message, Spin } from 'antd';
import {
  FiCalendar, FiClock, FiUser, FiHome, FiRefreshCw, FiSearch,
  FiCheckCircle, FiXCircle, FiLoader, FiX, FiFilter, FiMapPin,
  FiPhone, FiChevronRight, FiMessageSquare, FiAlertCircle,
} from 'react-icons/fi';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

const STATUS_CFG = {
  requested: { label: 'Requested', bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
  scheduled: { label: 'Scheduled', bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
  assigned:  { label: 'Assigned',  bg: '#F5F3FF', color: '#5B21B6', dot: '#7C3AED' },
  completed: { label: 'Completed', bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
  cancelled: { label: 'Cancelled', bg: '#FFF1F2', color: '#9F1239', dot: '#F43F5E' },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.requested;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500, letterSpacing: '0.01em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
const ViewingDetailPanel = ({ visit, onClose, onUpdated }) => {
  const [submitting,   setSubmitting]   = useState(false);
  const [advisorNote,  setAdvisorNote]  = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // 'completed' | 'cancelled'

  const lead      = visit?.lead;
  const clientName = `${lead?.contact_info?.name?.first_name || ''} ${lead?.contact_info?.name?.last_name || ''}`.trim() || visit?.clientName || 'Client';
  const phone      = lead?.contact_info?.mobile
    ? `${lead.contact_info.mobile.country_code || ''} ${lead.contact_info.mobile.number || ''}`.trim()
    : visit?.clientPhone || null;
  const propName  = visit?.property?.propertyName || visit?.property?.projectName || 'Property';
  const propArea  = visit?.property?.area || '';
  const agentName = visit?.agent
    ? (visit.agent.name || `${visit.agent.firstName || visit.agent.first_name || ''} ${visit.agent.lastName || visit.agent.last_name || ''}`.trim() || visit.agent.email)
    : null;

  const isDone = ['completed', 'cancelled'].includes(visit.status);

  const handleStatusUpdate = async (newStatus) => {
    setSubmitting(true);
    try {
      await apiService.post(`/agent/lead/update-site-visit/${visit._id}`, {
        status: newStatus,
        ...(advisorNote.trim() ? { adminNote: advisorNote.trim() } : {}),
      });
      message.success(`Viewing marked as ${STATUS_CFG[newStatus]?.label}`);
      onUpdated(visit._id, newStatus);
      onClose();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[88vh] flex flex-col" style={{ border: '1px solid #F1F5F9' }}>

        {/* Header */}
        <div className="px-5 py-4 flex items-start justify-between" style={{ background: GR }}>
          <div>
            <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest mb-0.5">Viewing Assignment</p>
            <h3 className="text-base font-semibold text-white leading-tight">{propName}</h3>
            <p className="text-xs text-white/60 mt-0.5">#{String(visit._id).slice(-8)}</p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusPill status={visit.status} />
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <FiX size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            <InfoTile icon={<FiUser size={13} />} label="Client" value={clientName} />
            {phone && <InfoTile icon={<FiPhone size={13} />} label="Phone" value={phone} />}
            <InfoTile icon={<FiCalendar size={13} />} label="Date" value={visit.confirmedDate || visit.scheduledDate || '—'} />
            <InfoTile icon={<FiClock size={13} />} label="Time" value={visit.confirmedTime || visit.visitTime || '—'} />
            {propArea && <InfoTile icon={<FiMapPin size={13} />} label="Location" value={propArea} />}
            <InfoTile icon={<FiHome size={13} />} label="Visit Type" value={visit.visitType === 'virtual' ? 'Virtual Tour' : 'In-Person'} />
            {agentName && <InfoTile icon={<FiUser size={13} />} label="Agent" value={agentName} />}
          </div>

          {/* Admin instruction */}
          {visit.adminNote && (
            <div style={{ background: '#F5F3FF', border: '1px solid #EDE9FE', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Admin Instructions</p>
              <p style={{ fontSize: 13, color: '#4C1D95', lineHeight: 1.5, margin: 0 }}>"{visit.adminNote}"</p>
            </div>
          )}

          {/* Agent notes */}
          {visit.notes && (
            <div style={{ background: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#854D0E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Agent Notes</p>
              <p style={{ fontSize: 13, color: '#713F12', lineHeight: 1.5, margin: 0 }}>{visit.notes}</p>
            </div>
          )}

          {/* Advisor note + actions */}
          {!isDone && (
            <>
              {confirmAction ? (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '14px' }}>
                  <div className="flex items-start gap-2 mb-3">
                    <FiAlertCircle size={15} style={{ color: '#C2410C', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: '#9A3412', margin: 0, lineHeight: 1.5 }}>
                      Mark this viewing as <strong>{confirmAction}</strong>? This action will notify the admin.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmAction(null)}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 500, color: '#64748B', cursor: 'pointer' }}
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(confirmAction)}
                      disabled={submitting}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: confirmAction === 'completed' ? '#16A34A' : '#DC2626', color: '#fff',
                        opacity: submitting ? 0.6 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {submitting ? <FiLoader size={12} className="animate-spin" /> : null}
                      Confirm {confirmAction === 'completed' ? 'Completed' : 'Cancellation'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                      <FiMessageSquare size={11} /> Note (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={advisorNote}
                      onChange={e => setAdvisorNote(e.target.value)}
                      placeholder="Add a note about this visit…"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, color: '#0F172A', background: '#F8FAFC', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConfirmAction('completed')}
                      style={{ padding: '10px', borderRadius: 10, border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#15803D', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <FiCheckCircle size={14} /> Mark Completed
                    </button>
                    <button
                      onClick={() => setConfirmAction('cancelled')}
                      style={{ padding: '10px', borderRadius: 10, border: '1px solid #FECDD3', background: '#FFF1F2', color: '#BE123C', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <FiXCircle size={14} /> Mark Cancelled
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {isDone && (
            <div style={{ textAlign: 'center', padding: '16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                This viewing is <span style={{ fontWeight: 600, color: STATUS_CFG[visit.status]?.color }}>{visit.status}</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Small reusable tile
const InfoTile = ({ icon, label, value }) => (
  <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
      <span style={{ color: '#94A3B8' }}>{icon}</span>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
    </div>
    <p style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', margin: 0, lineHeight: 1.4 }}>{value}</p>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const AdvisorViewings = () => {
  const [visits,       setVisits]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected,     setSelected]     = useState(null);

  const total     = visits.length;
  const pending   = visits.filter(v => ['assigned', 'scheduled', 'requested'].includes(v.status)).length;
  const completed = visits.filter(v => v.status === 'completed').length;
  const cancelled = visits.filter(v => v.status === 'cancelled').length;

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiService.get('/agent/lead/get-all-site-visits?page=1&limit=100');
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setVisits(Array.isArray(data) ? data : []);
    } catch {
      message.error('Failed to load viewing assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const handleUpdated = (id, newStatus) => {
    setVisits(prev => prev.map(v => v._id === id ? { ...v, status: newStatus } : v));
  };

  const getClientName = (v) => {
    const fn = v.lead?.contact_info?.name?.first_name || '';
    const ln = v.lead?.contact_info?.name?.last_name  || '';
    return `${fn} ${ln}`.trim() || v.clientName || 'Client';
  };
  const getPropName = (v) => v.property?.propertyName || v.property?.projectName || 'Property';
  const getPropArea = (v) => v.property?.area || '';
  const getDate = (v) => v.confirmedDate || v.scheduledDate || '';
  const getTime = (v) => v.confirmedTime || v.visitTime || '';

  const filtered = visits.filter(v => {
    const q = search.toLowerCase();
    const hit = !q || getClientName(v).toLowerCase().includes(q) || getPropName(v).toLowerCase().includes(q);
    const st  = statusFilter === 'all' || v.status === statusFilter;
    return hit && st;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>

      {selected && (
        <ViewingDetailPanel visit={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}

      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0F172A', margin: 0 }}>My Viewings</h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>Property viewings assigned to you by admin</p>
          </div>
          <button
            onClick={fetchVisits}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 500, color: '#475569', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? <FiLoader size={13} className="animate-spin" /> : <FiRefreshCw size={13} />}
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total',     value: total,     color: '#0F172A', accent: P },
            { label: 'Pending',   value: pending,   color: '#5B21B6', accent: P2 },
            { label: 'Completed', value: completed, color: '#166534', accent: '#22C55E' },
            { label: 'Cancelled', value: cancelled, color: '#9F1239', accent: '#F43F5E' },
          ].map(({ label, value, color, accent }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 26, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <div style={{ height: 3, background: accent, borderRadius: 2, marginTop: 10, width: '40%', opacity: 0.4 }} />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <FiSearch size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search client or property…"
                style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, color: '#0F172A', background: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiFilter size={13} style={{ color: '#94A3B8' }} />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, color: '#475569', background: '#F8FAFC', outline: 'none', cursor: 'pointer', minWidth: 140 }}
              >
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CFG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 14 }}>
            <Spin size="large" />
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Loading assignments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCalendar size={22} style={{ color: P }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#334155', margin: 0 }}>No viewings found</p>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Admin will assign property viewings to you here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(v => {
              const clientName = getClientName(v);
              const propName   = getPropName(v);
              const propArea   = getPropArea(v);
              const date       = getDate(v);
              const time       = getTime(v);
              const isDone     = ['completed', 'cancelled'].includes(v.status);
              const cfg        = STATUS_CFG[v.status] || STATUS_CFG.requested;

              return (
                <div
                  key={v._id}
                  style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', gap: 14, alignItems: 'flex-start' }}
                >
                  {/* Left accent bar */}
                  <div style={{ width: 3, borderRadius: 4, background: cfg.dot, alignSelf: 'stretch', flexShrink: 0, minHeight: 60 }} />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                      <div>
                        <div style={{ marginBottom: 6 }}>
                          <StatusPill status={v.status} />
                          {v.visitType === 'virtual' && (
                            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 500, color: '#1D4ED8', background: '#EFF6FF', padding: '3px 8px', borderRadius: 100 }}>Virtual</span>
                          )}
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>{propName}</p>
                        {propArea && (
                          <p style={{ fontSize: 12, color: '#94A3B8', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiMapPin size={10} /> {propArea}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelected(v)}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 500, color: '#475569', cursor: 'pointer', flexShrink: 0 }}
                      >
                        {isDone ? 'View' : 'Details'} <FiChevronRight size={12} />
                      </button>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px' }}>
                      <MetaItem label="Client" value={clientName} />
                      <MetaItem label="Date" value={date || '—'} />
                      <MetaItem label="Time" value={time || '—'} />
                    </div>

                    {/* Admin note preview */}
                    {v.adminNote && (
                      <p style={{ fontSize: 12, color: '#7C3AED', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontStyle: 'italic' }}>
                        <FiMessageSquare size={11} /> "{v.adminNote}"
                      </p>
                    )}

                    {/* Quick actions */}
                    {!isDone && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button
                          onClick={() => setSelected(v)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#15803D', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                        >
                          <FiCheckCircle size={12} /> Completed
                        </button>
                        <button
                          onClick={() => setSelected(v)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #FECDD3', background: '#FFF1F2', color: '#BE123C', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                        >
                          <FiXCircle size={12} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const MetaItem = ({ label, value }) => (
  <div>
    <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
    <p style={{ fontSize: 12, fontWeight: 500, color: '#334155', margin: '2px 0 0' }}>{value}</p>
  </div>
);

export default AdvisorViewings;
