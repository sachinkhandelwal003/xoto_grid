import React, { useState, useEffect, useCallback } from 'react';
import { message, Spin, Tooltip } from 'antd';
import {
  FiCalendar, FiClock, FiUser, FiHome, FiRefreshCw, FiSearch,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiLoader, FiX,
  FiFilter, FiMapPin, FiPhone, FiEye,
} from 'react-icons/fi';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  requested: { label: 'Requested', bg: '#FFFBEB', color: '#92400E', dot: '#F59E0B' },
  scheduled: { label: 'Scheduled', bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
  assigned:  { label: 'Assigned',  bg: '#F5F3FF', color: '#5B21B6', dot: '#7C3AED' },
  completed: { label: 'Completed', bg: '#F0FDF4', color: '#166534', dot: '#22C55E' },
  cancelled: { label: 'Cancelled', bg: '#FFF1F2', color: '#9F1239', dot: '#F43F5E' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.requested;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all';

// ─── Assign Advisor Modal ─────────────────────────────────────────────────────
const AssignAdvisorModal = ({ request, advisors, onClose, onSuccess }) => {
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [confirmDate,     setConfirmDate]     = useState(request?.scheduledDate || request?.confirmedDate || '');
  const [confirmTime,     setConfirmTime]     = useState(request?.visitTime || request?.confirmedTime || '');
  const [adminNote,       setAdminNote]       = useState('');
  const [submitting,      setSubmitting]      = useState(false);

  const handleAssign = async () => {
    if (!selectedAdvisor) { message.warning('Please select an advisor'); return; }
    if (!confirmDate)     { message.warning('Please set a confirmed date'); return; }
    if (!confirmTime)     { message.warning('Please set a confirmed time'); return; }
    setSubmitting(true);
    try {
      const res  = await apiService.post(`/agent/lead/update-site-visit/${request._id}`, {
        advisor:       selectedAdvisor,
        confirmedDate: confirmDate,
        confirmedTime: confirmTime,
        status:        'assigned',
        adminNote,
      });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success !== false) {
        message.success('Advisor assigned and viewing confirmed!');
        onSuccess();
        onClose();
      } else {
        message.error(data?.message || 'Assignment failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        <div className="px-6 py-5 flex items-center justify-between" style={{ background: GR }}>
          <div>
            <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest mb-0.5">Admin Action</p>
            <h3 className="text-base font-semibold text-white">Assign Xoto Advisor</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Request summary */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 space-y-1.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Viewing Request</p>
            <p className="text-sm font-bold text-gray-900">{request?.property?.propertyName || request?.property?.projectName || 'Property'}</p>
            <p className="text-xs text-gray-600">
              Client: <strong>{request?.lead?.contact_info?.name?.first_name || request?.clientName || 'Client'}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Requested: {request?.scheduledDate || '—'} at {request?.visitTime || '—'}
            </p>
            {request?.notes && <p className="text-xs text-gray-500 italic">"{request.notes}"</p>}
          </div>

          {/* Advisor selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Select Xoto Advisor <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAdvisor}
              onChange={e => setSelectedAdvisor(e.target.value)}
              className={inputCls + ' appearance-none'}
            >
              <option value="">Choose an advisor…</option>
              {advisors.map(a => (
                <option key={a._id || a.id} value={a._id || a.id}>
                  {a.name || `${a.firstName || a.first_name || ''} ${a.lastName || a.last_name || ''}`.trim() || a.email || 'Advisor'}
                </option>
              ))}
            </select>
          </div>

          {/* Confirmed date + time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Confirmed Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={confirmDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setConfirmDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Confirmed Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={confirmTime}
                onChange={e => setConfirmTime(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Admin note */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Note to Advisor (optional)</label>
            <textarea
              rows={2}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Any special instructions for the advisor…"
              className={inputCls + ' resize-none'}
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
            style={{ background: GR }}
          >
            {submitting ? <FiLoader size={14} className="animate-spin" /> : <FiCheckCircle size={14} />}
            {submitting ? 'Assigning…' : 'Assign & Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ request, onClose, onStatusChange, advisors, onAssign }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res  = await apiService.post(`/agent/lead/update-site-visit/${request._id}`, { status: newStatus });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success !== false) {
        message.success(`Status updated to ${STATUS_CFG[newStatus]?.label || newStatus}`);
        onStatusChange(request._id, newStatus);
        onClose();
      } else {
        message.error(data?.message || 'Update failed');
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const lead = request?.lead;
  const clientName = `${lead?.contact_info?.name?.first_name || ''} ${lead?.contact_info?.name?.last_name || ''}`.trim() || request?.clientName || 'Unknown Client';
  const phone = lead?.contact_info?.mobile ? `${lead.contact_info.mobile.country_code || ''} ${lead.contact_info.mobile.number || ''}`.trim() : (request?.clientPhone || null);
  const agentObj = request?.agent;
  const agentName = agentObj ? (agentObj.name || `${agentObj.first_name || ''} ${agentObj.last_name || ''}`.trim() || agentObj.email || 'Agent') : '—';
  const propName = request?.property?.propertyName || request?.property?.projectName || 'Property';
  const propArea = request?.property?.area || request?.property?.locality || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        <div className="px-5 py-4 flex items-start justify-between flex-shrink-0" style={{ background: GR }}>
          <div>
            <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest mb-0.5">Viewing Request</p>
            <h3 className="text-base font-semibold text-white leading-tight">{propName}</h3>
            <p className="text-xs text-white/60 mt-0.5">#{String(request._id).slice(-8)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 ml-2">
              <FiX size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Property */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Property</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GR, color: '#fff' }}>
                <FiHome size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{propName}</p>
                {propArea && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FiMapPin size={10} /> {propArea}</p>}
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Client</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-extrabold flex-shrink-0" style={{ background: GR }}>
                {clientName[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{clientName}</p>
                {phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FiPhone size={10} /> {phone}</p>}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preferred Date</p>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <FiCalendar size={13} style={{ color: P }} />
                {request.scheduledDate || '—'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preferred Time</p>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <FiClock size={13} style={{ color: P }} />
                {request.visitTime || '—'}
              </p>
            </div>
            {request.confirmedDate && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Confirmed Date</p>
                <p className="text-sm font-bold text-green-800">{new Date(request.confirmedDate).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            )}
            {request.confirmedTime && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Confirmed Time</p>
                <p className="text-sm font-bold text-green-800">{request.confirmedTime}</p>
              </div>
            )}
          </div>

          {/* Visit type */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visit Type:</span>
            <span className="text-sm font-bold text-gray-900">{request.visitType === 'virtual' ? 'Virtual Tour' : 'In-Person'}</span>
          </div>

          {/* Agent */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Agent:</span>
            <span className="text-sm font-bold text-gray-900">{agentName}</span>
          </div>

          {/* Assigned Advisor */}
          {request.advisor && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
              <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Assigned Advisor</p>
              <p className="text-sm font-bold text-purple-900">
                {request.advisor.name || `${request.advisor.firstName || request.advisor.first_name || ''} ${request.advisor.lastName || request.advisor.last_name || ''}`.trim() || request.advisor.email}
              </p>
              {request.adminNote && <p className="text-xs text-purple-600 mt-1 italic">"{request.adminNote}"</p>}
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100">
              <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-1">Agent Notes</p>
              <p className="text-sm text-gray-700">{request.notes}</p>
            </div>
          )}

          {/* Status actions */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Update Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CFG).filter(([k]) => k !== request.status).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  disabled={updatingStatus}
                  style={{ background: cfg.bg, color: cfg.color, padding: '7px 14px', borderRadius: 9, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: updatingStatus ? 0.6 : 1 }}
                >
                  {updatingStatus ? <FiLoader size={11} className="animate-spin" /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />}
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assign advisor action */}
          {!request.advisor && (
            <button
              onClick={() => onAssign(request)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: GR }}
            >
              <FiUser size={14} /> Assign Xoto Advisor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const ViewingRequests = () => {
  const [requests,  setRequests]  = useState([]);
  const [advisors,  setAdvisors]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignTarget,    setAssignTarget]    = useState(null);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:     requests.length,
    pending:   requests.filter(r => r.status === 'requested' || r.status === 'pending').length,
    confirmed: requests.filter(r => r.status === 'scheduled' || r.status === 'confirmed' || r.status === 'assigned').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiService.get('/agent/lead/get-all-site-visits?page=1&limit=200');
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      message.error('Failed to load viewing requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdvisors = useCallback(async () => {
    try {
      const res  = await apiService.get('/gridadvisor?page=1&limit=100');
      const data = res?.data?.data?.advisors || res?.data?.advisors || res?.data?.data || res?.data || [];
      setAdvisors(Array.isArray(data) ? data : []);
    } catch {
      setAdvisors([]);
    }
  }, []);

  useEffect(() => { fetchRequests(); fetchAdvisors(); }, [fetchRequests, fetchAdvisors]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
  };

  const handleAssignSuccess = () => {
    fetchRequests();
    setAssignTarget(null);
    setSelectedRequest(null);
  };

  // ── Normalize field access (site-visit shape) ─────────────────────────────
  const getClientName = (r) => {
    const fn = r.lead?.contact_info?.name?.first_name || '';
    const ln = r.lead?.contact_info?.name?.last_name  || '';
    return `${fn} ${ln}`.trim() || r.clientName || 'Unknown Client';
  };
  const getPropName = (r) =>
    r.property?.propertyName || r.property?.projectName ||
    r.propertyId?.propertyName || r.propertyId?.projectName || 'Property';
  const getPropArea = (r) =>
    r.property?.area || r.property?.locality ||
    r.propertyId?.area || r.propertyId?.locality || '';
  const getAgentName = (r) => {
    const a = r.agent || r.agentId;
    if (!a) return '—';
    return a.name || `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.email || 'Agent';
  };
  const getAdvisorName = (r) => {
    const a = r.advisor;
    if (!a) return null;
    return a.name || `${a.firstName || a.first_name || ''} ${a.lastName || a.last_name || ''}`.trim() || a.email;
  };
  const getDate = (r) => r.scheduledDate || r.preferredDate || r.confirmedDate || '';
  const getTime = (r) => r.visitTime || r.preferredTime || r.confirmedTime || '';

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || getClientName(r).toLowerCase().includes(q) || getPropName(r).toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">

      {/* Modals */}
      {selectedRequest && !assignTarget && (
        <DetailPanel
          request={selectedRequest}
          advisors={advisors}
          onClose={() => setSelectedRequest(null)}
          onStatusChange={handleStatusChange}
          onAssign={(req) => { setAssignTarget(req); setSelectedRequest(null); }}
        />
      )}
      {assignTarget && (
        <AssignAdvisorModal
          request={assignTarget}
          advisors={advisors}
          onClose={() => setAssignTarget(null)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Viewing Requests</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage and assign property viewing requests from agents</p>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? <FiLoader size={13} className="animate-spin" /> : <FiRefreshCw size={13} />}
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total',     value: stats.total,     color: '#0F172A', accent: P },
            { label: 'Pending',   value: stats.pending,   color: '#92400E', accent: '#F59E0B' },
            { label: 'Confirmed', value: stats.confirmed, color: '#1E40AF', accent: '#3B82F6' },
            { label: 'Completed', value: stats.completed, color: '#166534', accent: '#22C55E' },
          ].map(({ label, value, color, accent }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #F1F5F9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} className="rounded-2xl p-5">
              <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 6 }}>{label}</div>
              <div style={{ height: 3, background: accent, borderRadius: 2, marginTop: 10, width: '40%', opacity: 0.4 }} />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by client name or property…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <FiFilter size={14} className="text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 transition-all appearance-none min-w-[140px]"
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
          <div className="flex flex-col items-center py-20 gap-4">
            <Spin size="large" />
            <p className="text-sm text-gray-400 font-medium">Loading viewing requests…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#f3e8ff' }}>
              <FiCalendar size={28} style={{ color: P }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#334155', margin: 0 }}>No viewing requests found</p>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>Requests submitted by agents will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const clientName  = getClientName(r);
              const propName    = getPropName(r);
              const propArea    = getPropArea(r);
              const agentName   = getAgentName(r);
              const advisorName = getAdvisorName(r);
              const rawDate     = getDate(r);
              const prefDate    = rawDate ? new Date(rawDate).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              const prefTime    = getTime(r);

              return (
                <div key={r._id} style={{ background: '#fff', border: '1px solid #F1F5F9', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {/* Left accent bar */}
                  <div style={{ width: 3, borderRadius: 4, background: STATUS_CFG[r.status]?.dot || '#94A3B8', alignSelf: 'stretch', flexShrink: 0, minHeight: 60 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                          <StatusBadge status={r.status} />
                          {r.visitType === 'virtual' && (
                            <span style={{ fontSize: 10, fontWeight: 500, color: '#1D4ED8', background: '#EFF6FF', padding: '3px 8px', borderRadius: 100 }}>Virtual</span>
                          )}
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>{propName}</p>
                        {propArea && <p style={{ fontSize: 12, color: '#94A3B8', margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={10} /> {propArea}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!r.advisor && r.status === 'requested' && (
                          <button
                            onClick={() => setAssignTarget(r)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, border: 'none', background: GR, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                          >
                            <FiUser size={12} /> Assign Advisor
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedRequest(r)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 500, color: '#475569', cursor: 'pointer' }}
                        >
                          <FiEye size={12} /> Details
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 16px' }}>
                      {[
                        { label: 'Client',  value: clientName },
                        { label: 'Agent',   value: agentName },
                        { label: 'Date & Time', value: `${prefDate} · ${prefTime || '—'}` },
                        { label: 'Advisor', value: advisorName || 'Not assigned', muted: !advisorName },
                      ].map(({ label, value, muted }) => (
                        <div key={label}>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
                          <p style={{ fontSize: 12, fontWeight: 500, color: muted ? '#CBD5E1' : '#334155', margin: '2px 0 0' }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {r.notes && (
                      <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{r.notes}"</p>
                    )}
                    <p style={{ fontSize: 11, color: '#CBD5E1', marginTop: 8 }}>
                      Requested {r.createdAt ? new Date(r.createdAt).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
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

export default ViewingRequests;
