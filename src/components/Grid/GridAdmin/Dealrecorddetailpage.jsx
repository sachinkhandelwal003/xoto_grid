// ════════════════════════════════════════════════════════════════════════════
// DealRecordDetailPage.jsx — Full-page Deal Record Detail View
// Updated: full referral commission flow (pending → confirmed → paid)
//          matches DealDetailModal logic exactly
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiDollarSign, FiCheckCircle, FiClock, FiAlertTriangle, FiXCircle,
  FiFlag, FiUpload, FiTrash2, FiCornerUpRight, FiFileText, FiUser, FiHome,
  FiCalendar, FiActivity, FiLayers, FiMapPin, FiPhone, FiMail, FiLock, FiX,
  FiPlus, FiLoader, FiRefreshCw, FiExternalLink, FiBarChart2, FiShield,
  FiAward, FiBriefcase, FiZap, FiAlertCircle, FiDownload,
} from 'react-icons/fi';
import { message } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

// ─── THEME ───────────────────────────────────────────────────────────────────
const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── COMMISSION STATUS CONFIG ─────────────────────────────────────────────────
const COM_STATUS = {
  pending:        { label: 'Pending',   bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  confirmed:      { label: 'Confirmed', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#3b82f6' },
  paid:           { label: 'Paid',      bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: '#22c55e' },
  not_applicable: { label: 'N/A',       bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb', dot: '#9ca3af' },
};

const DEAL_TYPE = {
  sale:  { label: 'Sale',  bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  lease: { label: 'Lease', bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
};

const DOC_TYPES = ['spa', 'booking_form', 'title_deed', 'noc', 'other'];
const UPLOAD_API = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`;

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const fmt = (n, cur = 'AED') =>
  n > 0 ? `${cur} ${Number(n).toLocaleString('en-AE')}` : '—';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─── ATOMS ───────────────────────────────────────────────────────────────────
const Pill = ({ status, type = 'commission' }) => {
  const map = type === 'commission' ? COM_STATUS : DEAL_TYPE;
  const cfg = map[status] || { label: status, bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', dot: '#9ca3af' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
      {type === 'commission' && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />}
      {cfg.label}
    </span>
  );
};

const Btn = ({ children, onClick, variant = 'primary', loading, disabled, size = 'md', className = '' }) => {
  const base  = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { xs: 'px-2.5 py-1.5 text-[11px]', sm: 'px-3.5 py-2 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3 text-sm' };
  const vars  = {
    primary: 'text-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
    ghost:   'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50',
    danger:  'border border-red-200 text-red-600 bg-red-50 hover:bg-red-100',
    success: 'text-white shadow-md',
    amber:   'text-white shadow-md',
    teal:    'text-white shadow-md',
    indigo:  'text-white shadow-md',
  };
  const bgs = {
    primary: GR,
    success: 'linear-gradient(135deg,#059669,#10b981)',
    amber:   'linear-gradient(135deg,#d97706,#f59e0b)',
    teal:    'linear-gradient(135deg,#0d9488,#14b8a6)',
    indigo:  'linear-gradient(135deg,#4f46e5,#6366f1)',
  };
  return (
    <button className={`${base} ${sizes[size]} ${vars[variant]} ${className}`}
      style={bgs[variant] ? { background: bgs[variant] } : {}}
      onClick={onClick} disabled={disabled || loading}>
      {loading ? <FiLoader size={13} className="animate-spin" /> : children}
    </button>
  );
};

const InfoRow = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: '#F5F3FF' }}>
      <Icon size={13} style={{ color: P }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
      <p className={`text-sm text-gray-800 font-medium mt-1 break-all leading-snug ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </p>
    </div>
  </div>
);

const StatBox = ({ label, value, color, bg }) => (
  <div className="p-4 rounded-xl border" style={{ background: bg, borderColor: color + '30' }}>
    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
    <p className="text-lg font-extrabold mt-1.5" style={{ color }}>{value}</p>
  </div>
);

const CommissionBar = ({ gross, xoto, partner, referral }) => {
  const total = gross || 1;
  const bars = [
    { label: 'XOTO',     value: xoto,     pct: (xoto     / total) * 100, color: '#4A027C' },
    { label: 'Partner',  value: partner,  pct: (partner  / total) * 100, color: '#7C3AED' },
    { label: 'Referral', value: referral, pct: (referral / total) * 100, color: '#a78bfa' },
  ].filter(b => b.value > 0);

  return (
    <div className="space-y-3">
      <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
        {bars.map((b, i) => (
          <div key={i} className="h-full transition-all" style={{ width: `${b.pct}%`, background: b.color }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {[{ label: 'Gross Commission', value: gross, color: '#6b7280' }, ...bars].map((b, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color || '#9ca3af' }} />
            <span className="text-[10px] text-gray-500 font-bold">{b.label}</span>
            <span className="text-[10px] font-extrabold text-gray-800">{fmt(b.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// EVIDENCE UPLOAD INLINE SECTION
// ═══════════════════════════════════════════════════════════════════════════
const EvidenceSection = ({ deal, onRefresh, isLocked }) => {
  const [docs, setDocs] = useState([{ docType: 'spa', url: '' }]);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const inp = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all';

  const uploadEvidenceFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(UPLOAD_API, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('File upload failed');
    const data = await response.json();
    return data?.file?.url || data?.url || data?.data?.url || data?.fileUrl || '';
  };

  const handleUpload = async () => {
    const valid = docs.filter(d => d.url.trim());
    if (!valid.length) return message.warning('At least one document URL is required');
    setLoading(true);
    try {
      const res = await apiService.patch(`/deal-record/${deal._id}/evidence`, { evidenceDocuments: valid });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Evidence uploaded');
        onRefresh();
      } else message.error(data?.message || 'Upload failed');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const addDoc = () => setDocs(p => [...p, { docType: 'spa', url: '' }]);
  const removeDoc = (i) => setDocs(p => p.filter((_, idx) => idx !== i));
  const updateDoc = (i, k, v) => setDocs(p => p.map((d, idx) => idx === i ? { ...d, [k]: v } : d));

  const hasEvidence = deal?.evidenceDocuments?.length > 0;

  return (
    <div className="space-y-4">
      {!hasEvidence && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
          <FiUpload size={28} className="mx-auto mb-2 text-amber-400" />
          <p className="text-sm font-bold text-amber-800">No evidence uploaded yet</p>
          <p className="text-xs text-amber-600 mt-1 mb-4">SPA or booking form is required before confirming this deal</p>
        </div>
      )}

      {!isLocked && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add Documents</p>
          {docs.map((doc, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500">Document {i + 1}</p>
                {docs.length > 1 && (
                  <button onClick={() => removeDoc(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <FiX size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Document Type</label>
                  <select value={doc.docType} onChange={e => updateDoc(i, 'docType', e.target.value)} className={inp}>
                    {DOC_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Upload File</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingIndex(i);
                          const uploadedUrl = await uploadEvidenceFile(file);
                          if (!uploadedUrl) throw new Error('No URL returned');
                          updateDoc(i, 'url', uploadedUrl);
                          message.success('File uploaded successfully');
                        } catch (err) {
                          console.error(err);
                          message.error('File upload failed');
                        } finally {
                          setUploadingIndex(null);
                        }
                      }}
                      className="block w-full text-sm"
                    />
                    {uploadingIndex === i && (
                      <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                        <FiLoader size={11} className="animate-spin" /> Uploading...
                      </p>
                    )}
                    {doc.url && uploadingIndex !== i && (
                      <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-green-600 flex items-center gap-1 font-medium">
                        <FiExternalLink size={10} /> View uploaded file
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addDoc}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all">
            <FiPlus size={12} /> Add Document
          </button>
          <Btn variant="primary" onClick={handleUpload} loading={loading}>
            <FiUpload size={13} /> Save Documents
          </Btn>
        </div>
      )}

      {hasEvidence && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Existing Documents ({deal.evidenceDocuments.length})</p>
          <div className="space-y-2">
            {deal.evidenceDocuments.map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f5f3ff' }}>
                  <FiFileText size={15} style={{ color: P }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700 uppercase">{d.docType?.replace('_', ' ')}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(d.uploadedAt)}</p>
                </div>
                <a href={d.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
                  <FiExternalLink size={10}/> View
                </a>
              </div>
            ))}
          </div>
          {!isLocked && (
            <button onClick={addDoc}
              className="mt-3 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all">
              <FiPlus size={12} /> Add More Documents
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FLAG / UNFLAG PANEL
// ═══════════════════════════════════════════════════════════════════════════
const FlagPanel = ({ deal, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const isUnflag = deal?.isFlagged;

  const handleAction = async () => {
    if (!isUnflag && !reason.trim()) return message.warning('Flag reason is required');
    setLoading(true);
    try {
      const endpoint = isUnflag ? `/deal-record/${deal._id}/unflag` : `/deal-record/${deal._id}/flag`;
      const payload  = isUnflag ? {} : { reason: reason.trim() };
      const res = await apiService.patch(endpoint, payload);
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success(isUnflag ? 'Flag removed' : 'Deal flagged');
        onSuccess();
        onClose();
      } else message.error(data?.message || 'Action failed');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <FiFlag size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{isUnflag ? 'Remove Flag' : 'Flag Deal for Review'}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{isUnflag ? 'Clear the review flag' : 'Mark for admin review'}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
      </div>
      <div className="p-6 space-y-4">
        {isUnflag ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm font-semibold text-amber-800">Current flag: <span className="font-bold">"{deal.flagReason}"</span></p>
            <p className="text-xs text-amber-600 mt-1">This will remove the review flag from the deal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <FiAlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium">Flagged deals are highlighted for review and cannot be silently processed.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Flag Reason <span className="text-red-400">*</span></label>
              <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Commission percentage dispute..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none" />
            </div>
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant={isUnflag ? 'ghost' : 'amber'} onClick={handleAction} loading={loading}>
          <FiFlag size={13} /> {isUnflag ? 'Remove Flag' : 'Flag Deal'}
        </Btn>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// VOID PANEL
// ═══════════════════════════════════════════════════════════════════════════
const VoidPanel = ({ deal, onClose, onSuccess }) => {
  const [reason, setReason]   = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const canSubmit = reason.trim() && confirm === deal?.dealReference;

  const handleVoid = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await apiService.patch(`/deal-record/${deal._id}/void`, { reason });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Deal record voided');
        onSuccess();
        onClose();
      } else message.error(data?.message || 'Void failed');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Void failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <FiTrash2 size={16} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Void Deal Record</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Super Admin only — irreversible</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
      </div>
      <div className="p-6 space-y-4">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1">
          <p className="text-sm font-bold text-red-800">⚠ Irreversible Action</p>
          <p className="text-xs text-red-700 leading-relaxed">Voiding releases inventory back to available, reverts lead to In Discussion, and soft-deletes this record.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Void Reason <span className="text-red-400">*</span></label>
          <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Client withdrew..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
            Type <span className="font-mono text-red-600">{deal?.dealReference}</span> to confirm
          </label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={deal?.dealReference}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" onClick={handleVoid} loading={loading} disabled={!canSubmit}><FiTrash2 size={13} /> Void Deal</Btn>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATE PANEL
// ═══════════════════════════════════════════════════════════════════════════
const EscalatePanel = ({ deal, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEscalate = async () => {
    if (!note.trim()) return message.warning('Escalation note is required');
    setLoading(true);
    try {
      const res = await apiService.patch(`/deal-record/${deal._id}/escalate`, { note });
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Deal escalated to super admin');
        onSuccess();
        onClose();
      } else message.error(data?.message || 'Escalate failed');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Escalate failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <FiCornerUpRight size={16} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Escalate to Super Admin</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Raise this deal for urgent review</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={18} /></button>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <FiShield size={15} style={{ color: P }} className="flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-800 font-medium">Super admin will receive an escalation notice and review this deal directly.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Escalation Note <span className="text-red-400">*</span></label>
          <textarea rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="Describe the issue..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none" />
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleEscalate} loading={loading}><FiCornerUpRight size={13} /> Escalate Deal</Btn>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════
const DealRecordDetailPage = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  // Commission lifecycle states
  const [confirming, setConfirming]       = useState(false);
  const [paying, setPaying]               = useState(false);
  const [confirmingRef, setConfirmingRef] = useState(false);  // pending → confirmed
  const [payingRef, setPayingRef]         = useState(false);  // confirmed → paid

  // Inline action panels
  const [showFlagPanel, setShowFlagPanel]         = useState(false);
  const [showVoidPanel, setShowVoidPanel]         = useState(false);
  const [showEscalatePanel, setShowEscalatePanel] = useState(false);

  const fetchDeal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/deal-record/${dealId}`);
      const data = res?.data?.data || res?.data;
      if (data) setDeal(data);
      else message.error('Deal not found');
    } catch {
      message.error('Failed to load deal record');
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    if (dealId) fetchDeal();
  }, [dealId, fetchDeal]);

  // ── Commission lifecycle handlers ──────────────────────────────────────────

  const handleConfirm = async () => {
    const hasEvidence = deal?.evidenceDocuments?.length > 0;
    if (!hasEvidence) return message.warning('Upload evidence documents first');
    setConfirming(true);
    try {
      const res = await apiService.patch(`/deal-record/${deal._id}/confirm`, {});
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Deal confirmed and locked'); fetchDeal(); }
      else message.error(data?.message || 'Confirm failed');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Confirm failed');
    } finally {
      setConfirming(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await apiService.patch(`/deal-record/${deal._id}/pay`, {});
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Commission marked as paid'); fetchDeal(); }
      else message.error(data?.message || 'Action failed');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Action failed');
    } finally {
      setPaying(false);
    }
  };

  // Confirm referral commission: pending → confirmed
  // Requires main commissionStatus to be 'confirmed' or 'paid'
  const handleConfirmReferral = async () => {
    setConfirmingRef(true);
    try {
      const res = await apiService.patch(`/deal-record/${deal._id}/confirm-referral`, {});
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) {
        message.success('Referral commission confirmed — eligible for payout');
        fetchDeal();
      } else message.error(data?.message || 'Confirm referral failed');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Confirm referral failed');
    } finally {
      setConfirmingRef(false);
    }
  };

  // Pay referral commission: confirmed → paid
  const handlePayReferral = async () => {
    setPayingRef(true);
    try {
      const res = await apiService.patch(`/deal-record/${deal._id}/pay-referral`, {});
      const data = res?.data?.success !== undefined ? res.data : res;
      if (data?.success) { message.success('Referral commission marked as paid'); fetchDeal(); }
      else message.error(data?.message || 'Action failed');
    } catch (e) {
      message.error(e?.response?.data?.message || 'Action failed');
    } finally {
      setPayingRef(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
          <FiLoader className="animate-spin" /> Loading deal record...
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold mb-4">Deal record not found</p>
          <Btn variant="primary" onClick={() => navigate(-1)}><FiArrowLeft size={14} /> Go Back</Btn>
        </div>
      </div>
    );
  }

  const prop     = deal?.propertyId;
  const cust     = deal?.customerId;
  const advisor  = deal?.advisorId;
  const agent    = deal?.agentId;
  const unit     = deal?.inventoryUnitId;
  const com      = deal?.commission || {};

  const isLocked    = deal?.isLocked;
  const isFlagged   = deal?.isFlagged;
  const isVoided    = deal?.isVoided;
  const hasEvidence = deal?.evidenceDocuments?.length > 0;

  // Referral flow flags — mirror DealDetailModal exactly
  const canConfirmReferral =
    deal?.referralPartnerId &&
    deal?.referralCommissionStatus === 'pending' &&
    ['confirmed', 'paid'].includes(deal?.commissionStatus) &&
    deal?.commission?.referralShare > 0;

  const canPayReferral =
    deal?.referralPartnerId &&
    deal?.referralCommissionStatus === 'confirmed';

  const TABS = [
    { key: 'overview',   label: 'Overview',   icon: FiLayers    },
    { key: 'commission', label: 'Commission', icon: FiDollarSign },
    { key: 'evidence',   label: 'Evidence',   icon: FiFileText, badge: deal?.evidenceDocuments?.length },
    { key: 'history',    label: 'History',    icon: FiActivity  },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
              <FiArrowLeft size={18} className="text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <p className="text-xl font-extrabold font-mono text-gray-900">{deal?.dealReference}</p>
                <Pill status={deal?.commissionStatus} />
                <Pill status={deal?.dealType} type="deal" />
                {isLocked     && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700"><FiLock size={9}/> Locked</span>}
                {isFlagged    && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"><FiFlag size={9}/> Flagged</span>}
                {isVoided     && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700"><FiXCircle size={9}/> Voided</span>}
                {deal?.isEscalated && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700"><FiCornerUpRight size={9}/> Escalated</span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">Created {fmtDate(deal?.createdAt)}</p>
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => fetchDeal()}>
            <FiRefreshCw size={13}/> Refresh
          </Btn>
        </div>

        {/* ─── TAB BAR ─── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 border-t border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5
                  ${tab === t.key
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <t.icon size={13} />
                {t.label}
                {t.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${tab === t.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                      <FiHome size={13} style={{ color: P }} />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Property</p>
                    </div>
                    <div className="p-4">
                      {typeof prop === 'object' && prop ? (
                        <>
                          <p className="text-sm font-bold text-gray-900">{prop.propertyName || '—'}</p>
                          {prop.area && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><FiMapPin size={10}/> {[prop.area, prop.city].filter(Boolean).join(', ')}</p>}
                          <p className="text-sm font-extrabold mt-1.5" style={{ color: P }}>{fmt(prop.price)}</p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 font-mono">{String(deal?.propertyId || '—').slice(-8)}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                      <FiUser size={13} style={{ color: P }} />
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer</p>
                    </div>
                    <div className="p-4">
                      {typeof cust === 'object' && cust ? (
                        <>
                          <p className="text-sm font-bold text-gray-900">{[cust.firstName, cust.lastName].filter(Boolean).join(' ') || '—'}</p>
                          {cust.phone && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><FiPhone size={10}/> {cust.phone}</p>}
                          {cust.email && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><FiMail size={10}/> {cust.email}</p>}
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 font-mono">{String(deal?.customerId || '—').slice(-8)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {unit && (
                  <div className="p-4 rounded-xl border border-purple-100 bg-purple-50">
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-3">Locked Inventory Unit</p>
                    {typeof unit === 'object' ? (
                      <div className="flex flex-wrap gap-3">
                        {[
                          { l: 'Unit',   v: unit.unitNumber  },
                          { l: 'Floor',  v: unit.floorNumber },
                          { l: 'Type',   v: unit.bedroomType },
                          { l: 'Status', v: unit.status      },
                          { l: 'Price',  v: fmt(unit.price)  },
                        ].filter(f => f.v).map((f, i) => (
                          <div key={i} className="text-center">
                            <p className="text-[9px] font-bold text-purple-400 uppercase">{f.l}</p>
                            <p className="text-xs font-bold text-purple-800 mt-0.5">{f.v}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-mono text-purple-700">{String(unit)}</p>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Deal Participants</p>
                  </div>
                  <div>
                    {advisor && <InfoRow icon={FiAward}          label="Assigned Advisor" value={typeof advisor === 'object' ? `${advisor.firstName || ''} ${advisor.lastName || ''}`.trim() || advisor.email : String(advisor).slice(-8)} />}
                    {agent   && <InfoRow icon={FiUser}           label="Agent"            value={typeof agent   === 'object' ? `${agent.first_name || ''} ${agent.last_name || ''}`.trim()   || agent.email   : String(agent).slice(-8)} />}
                    {deal?.agencyId        && <InfoRow icon={FiBriefcase}    label="Agency"           value={typeof deal.agencyId        === 'object' ? deal.agencyId.companyName        || deal.agencyId.agency_name        : String(deal.agencyId).slice(-8)} />}
                    {deal?.referralPartnerId && <InfoRow icon={FiCornerUpRight} label="Referral Partner" value={typeof deal.referralPartnerId === 'object' ? `${deal.referralPartnerId.firstName || ''} ${deal.referralPartnerId.lastName || ''}`.trim() : String(deal.referralPartnerId).slice(-8)} />}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timeline</p>
                  </div>
                  <div>
                    <InfoRow icon={FiCalendar}    label="Created"   value={fmtDateTime(deal?.createdAt)} />
                    {deal?.confirmedAt && <InfoRow icon={FiCheckCircle} label="Confirmed" value={fmtDateTime(deal.confirmedAt)} />}
                    {deal?.paidAt      && <InfoRow icon={FiDollarSign}  label="Paid"      value={fmtDateTime(deal.paidAt)} />}
                    {deal?.referralPaidAt && <InfoRow icon={FiCornerUpRight} label="Referral Paid" value={fmtDateTime(deal.referralPaidAt)} />}
                  </div>
                </div>

                {isFlagged && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                    <FiFlag size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Flagged for Review</p>
                      <p className="text-xs text-amber-700 mt-0.5">{deal.flagReason}</p>
                    </div>
                  </div>
                )}

                {deal?.isEscalated && (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-2">
                    <FiCornerUpRight size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-orange-800">Escalated to Super Admin</p>
                      <p className="text-xs text-orange-700 mt-0.5">{deal.escalationNote}</p>
                    </div>
                  </div>
                )}

                {deal?.notes && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{deal.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* COMMISSION */}
            {tab === 'commission' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl border border-purple-100 text-center" style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P }}>Transaction Value</p>
                  <p className="text-3xl font-extrabold mt-1" style={{ color: P }}>{fmt(deal?.transactionValue)}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Pill status={deal?.dealType} type="deal" />
                    <Pill status={deal?.commissionStatus} />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                    <FiBarChart2 size={13} style={{ color: P }} />
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Commission Breakdown</p>
                  </div>
                  <div className="p-5 space-y-5">
                    <CommissionBar gross={com.grossAmount} xoto={com.xotoRetained} partner={com.partnerShare} referral={com.referralShare} />
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { l: 'Gross Commission', v: com.grossAmount,   pct: com.grossPercent,    color: '#6b7280', bg: '#f9fafb' },
                        { l: 'XOTO Retained',    v: com.xotoRetained,  pct: com.xotoPercent,     color: P,         bg: '#f5f3ff' },
                        { l: 'Partner Share',    v: com.partnerShare,  pct: com.partnerPercent,  color: P2,        bg: '#faf5ff' },
                        { l: 'Referral Share',   v: com.referralShare, pct: com.referralPercent, color: '#a78bfa', bg: '#fdf4ff' },
                      ].map((r, i) => (
                        <StatBox key={i} label={r.l} value={`${fmt(r.v)} (${r.pct}%)`} color={r.color} bg={r.bg} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Referral commission status card */}
                {deal?.referralPartnerId && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-600">Referral Commission</p>
                      <Pill status={deal.referralCommissionStatus || 'not_applicable'} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>Amount: <strong className="text-gray-800">{fmt(com.referralShare)}</strong></span>
                      {deal.referralPaidAt && <span>Paid: <strong className="text-gray-800">{fmtDate(deal.referralPaidAt)}</strong></span>}
                    </div>
                    {/* Helper: main commission not yet confirmed */}
                    {deal.referralCommissionStatus === 'pending' && !['confirmed','paid'].includes(deal.commissionStatus) && (
                      <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                        <FiAlertCircle size={10} /> Confirm main deal commission first to unlock referral confirmation
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EVIDENCE */}
            {tab === 'evidence' && (
              <EvidenceSection deal={deal} onRefresh={fetchDeal} isLocked={isLocked} />
            )}

            {/* HISTORY */}
            {tab === 'history' && (
              <div className="space-y-4">
                {deal?.statusHistory?.length > 0 ? (
                  <div className="relative">
                    <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-100" />
                    <div className="space-y-4">
                      {[...deal.statusHistory].reverse().map((h, i) => (
                        <div key={i} className="relative pl-10">
                          <div className="absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center" style={{ background: P }}>
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {h.from && <><span className="text-xs font-bold text-gray-400 capitalize">{h.from}</span><FiArrowLeft size={10} className="text-gray-300 rotate-180"/></>}
                                  <span className="text-xs font-bold capitalize" style={{ color: P }}>{h.to}</span>
                                </div>
                                {h.note && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{h.note}</p>}
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">{fmtDate(h.at)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FiActivity size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No status history yet</p>
                  </div>
                )}

                {deal?.editHistory?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Edit History ({deal.editHistory.length})</p>
                    <div className="space-y-2">
                      {deal.editHistory.map((e, i) => (
                        <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-600">Fields: {Object.keys(e.fields || {}).join(', ')}</span>
                            <span className="text-gray-400">{fmtDate(e.editedAt)}</span>
                          </div>
                          {e.reason && <p className="text-gray-500 mt-0.5">{e.reason}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="lg:col-span-1 space-y-4">

            {!isVoided && (
              <>
                {/* Inline action panels */}
                {showFlagPanel     && <FlagPanel     deal={deal} onClose={() => setShowFlagPanel(false)}     onSuccess={fetchDeal} />}
                {showVoidPanel     && <VoidPanel     deal={deal} onClose={() => setShowVoidPanel(false)}     onSuccess={() => navigate(-1)} />}
                {showEscalatePanel && <EscalatePanel deal={deal} onClose={() => setShowEscalatePanel(false)} onSuccess={fetchDeal} />}

                {/* Management actions */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                  {!isLocked && (
                    <Btn size="sm" variant="amber" onClick={() => { setShowFlagPanel(!showFlagPanel); setShowVoidPanel(false); setShowEscalatePanel(false); }} className="w-full justify-center">
                      <FiFlag size={11}/> {isFlagged ? 'Unflag' : 'Flag'}
                    </Btn>
                  )}
                  {!isLocked && !deal?.isEscalated && (
                    <Btn size="sm" variant="ghost" onClick={() => { setShowEscalatePanel(!showEscalatePanel); setShowFlagPanel(false); setShowVoidPanel(false); }} className="w-full justify-center">
                      <FiCornerUpRight size={11}/> Escalate
                    </Btn>
                  )}
                  <Btn size="sm" variant="danger" onClick={() => { setShowVoidPanel(!showVoidPanel); setShowFlagPanel(false); setShowEscalatePanel(false); }} className="w-full justify-center">
                    <FiTrash2 size={11}/> Void
                  </Btn>
                </div>

                {/* Confirm main deal */}
                {!isLocked && deal?.commissionStatus === 'pending' && (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 space-y-2">
                    <Btn
                      variant={hasEvidence ? 'success' : 'ghost'}
                      onClick={handleConfirm}
                      loading={confirming}
                      disabled={!hasEvidence}
                      className="w-full justify-center"
                    >
                      <FiCheckCircle size={11}/> {hasEvidence ? 'Confirm Deal' : 'Upload Evidence First'}
                    </Btn>
                    {!hasEvidence && (
                      <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                        <FiAlertCircle size={10}/> Evidence required to confirm
                      </p>
                    )}
                  </div>
                )}

                {/* Pay main commission */}
                {deal?.commissionStatus === 'confirmed' && (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4">
                    <Btn variant="success" onClick={handlePay} loading={paying} className="w-full justify-center">
                      <FiDollarSign size={11}/> Mark Paid
                    </Btn>
                  </div>
                )}

                {/* Confirm referral commission (pending → confirmed) */}
                {canConfirmReferral && (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 space-y-2">
                    <Btn variant="indigo" onClick={handleConfirmReferral} loading={confirmingRef} className="w-full justify-center">
                      <FiCornerUpRight size={11}/> Confirm Referral
                    </Btn>
                    <p className="text-[10px] text-indigo-500 font-semibold flex items-center gap-1">
                      <FiAlertCircle size={10}/> Marks referral commission as confirmed
                    </p>
                  </div>
                )}

                {/* Pay referral commission (confirmed → paid) */}
                {canPayReferral && (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 space-y-2">
                    <Btn variant="teal" onClick={handlePayReferral} loading={payingRef} className="w-full justify-center">
                      <FiCornerUpRight size={11}/> Pay Referral
                    </Btn>
                    <p className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                      <FiAlertCircle size={10}/> Marks referral commission as paid
                    </p>
                  </div>
                )}

                {/* Hint: main not yet confirmed */}
                {deal?.referralPartnerId && deal?.referralCommissionStatus === 'pending' && !['confirmed','paid'].includes(deal?.commissionStatus) && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                      <FiAlertCircle size={10}/> Confirm main deal commission first to unlock referral payout
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Status card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Status</p>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1">Commission</p>
                  <Pill status={deal?.commissionStatus} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1">Deal Type</p>
                  <Pill status={deal?.dealType} type="deal" />
                </div>
                {deal?.referralPartnerId && (
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1">Referral Commission</p>
                    <Pill status={deal?.referralCommissionStatus || 'not_applicable'} />
                  </div>
                )}
                {isLocked   && <div className="p-2 rounded-lg bg-green-50 border border-green-100 text-center"><p className="text-[10px] font-bold text-green-700">Locked</p></div>}
                {isFlagged  && <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-center"><p className="text-[10px] font-bold text-amber-700">Flagged</p></div>}
                {isVoided   && <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-center"><p className="text-[10px] font-bold text-red-700">Voided</p></div>}
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Summary</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction</span>
                  <span className="font-bold text-gray-800">{fmt(deal?.transactionValue)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-50 pt-2">
                  <span className="text-gray-500">Gross Commission</span>
                  <span className="font-bold text-gray-800">{fmt(com.grossAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">XOTO Share</span>
                  <span className="font-bold" style={{ color: P }}>{fmt(com.xotoRetained)}</span>
                </div>
                {com.partnerShare > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Partner Share</span>
                    <span className="font-bold" style={{ color: P2 }}>{fmt(com.partnerShare)}</span>
                  </div>
                )}
                {com.referralShare > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Referral Share</span>
                    <span className="font-bold text-purple-400">{fmt(com.referralShare)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealRecordDetailPage;