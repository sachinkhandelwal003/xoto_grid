import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  FiX, FiLoader, FiCalendar, FiClock, FiHome,
  FiUser, FiMessageSquare, FiCheckCircle, FiPhone,
} from 'react-icons/fi';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
];

// Convert "13:30" → "01:30 PM"
const to12h = (t) => {
  if (!t) return '';
  const [hStr, m] = t.split(':');
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${m} ${period}`;
};

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all';

/**
 * ScheduleViewingModal
 *
 * Props:
 *   propertyId   – pre-fill property (from property detail page)
 *   propertyName – display label for the property
 *   leadId       – pre-fill lead (from lead detail page)
 *   leadName     – display label for the lead
 *   leadPhone    – client phone (from lead detail page)
 *   onClose      – called when modal is dismissed
 *   onSuccess    – called after successful submission
 */
const ScheduleViewingModal = ({
  propertyId,
  propertyName,
  leadId,
  leadName,
  leadPhone,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    selectedLeadId:     leadId     || '',
    selectedPropertyId: propertyId || '',
    preferredDate:      '',
    preferredTime:      '',
    visitType:          'in_person',
    notes:              '',
  });

  const [leads,        setLeads]        = useState([]);
  const [properties,   setProperties]   = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingProps, setLoadingProps] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  // ── Fetch leads if none pre-filled — only keep leads with a phone number ──────
  useEffect(() => {
    if (leadId) return;
    setLoadingLeads(true);
    apiService.get('/gridlead/agent/my-leads?page=1&limit=100')
      .then(res => {
        const payload = res?.data?.success !== undefined ? res.data : res;
        const list    = payload?.data || payload?.leads || [];
        const withPhone = (Array.isArray(list) ? list : []).filter(l => {
          const ph = l.contact_info?.mobile?.number || l.phone || '';
          return String(ph).trim().length > 0;
        });
        setLeads(withPhone);
      })
      .catch(() => setLeads([]))
      .finally(() => setLoadingLeads(false));
  }, [leadId]);

  // ── Fetch matched properties when a lead is selected (no property pre-fill) ─
  useEffect(() => {
    if (propertyId || !form.selectedLeadId) return;
    setLoadingProps(true);
    apiService.get(`/gridlead/${form.selectedLeadId}/smart-matches`)
      .then(res => {
        const payload = res?.data?.success !== undefined ? res.data : res;
        setProperties(Array.isArray(payload?.data) ? payload.data : []);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoadingProps(false));
  }, [form.selectedLeadId, propertyId]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Resolve lead details from selected lead in dropdown ──────────────────────
  const selectedLeadObj = leads.find(l => (l._id || l.id) === form.selectedLeadId);

  const resolvedLeadId    = leadId     || form.selectedLeadId;
  const resolvedPropertyId = propertyId || form.selectedPropertyId;

  const resolvedClientName = leadName || (() => {
    if (!selectedLeadObj) return '';
    const fn = selectedLeadObj.contact_info?.name?.first_name || selectedLeadObj.first_name || '';
    const ln = selectedLeadObj.contact_info?.name?.last_name  || selectedLeadObj.last_name  || '';
    return `${fn} ${ln}`.trim();
  })();

  const resolvedClientPhone = leadPhone || (() => {
    if (!selectedLeadObj) return '';
    const cc = selectedLeadObj.contact_info?.mobile?.country_code || '';
    const ph = selectedLeadObj.contact_info?.mobile?.number       || '';
    return `${cc}${ph}`.trim();
  })();

  const resolvedPropertyName = propertyName || (() => {
    const p = properties.find(x => (x._id || x.id) === form.selectedPropertyId);
    return p?.propertyName || p?.projectName || '';
  })();

  const missingPhone = leadId && !resolvedClientPhone;

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    if (!resolvedLeadId)       { message.warning('Please select a lead'); return false; }
    if (!resolvedClientPhone)  { message.warning('This lead has no phone number. Site visit request cannot be submitted without a client phone number.'); return false; }
    if (!resolvedPropertyId)   { message.warning('Please select a property'); return false; }
    if (!form.preferredDate)   { message.warning('Please select a preferred date'); return false; }
    if (!form.preferredTime)   { message.warning('Please select a preferred time'); return false; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (new Date(form.preferredDate) < today) { message.warning('Date cannot be in the past'); return false; }
    return true;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        lead:          resolvedLeadId,
        property:      resolvedPropertyId,
        scheduledDate: form.preferredDate,
        visitTime:     to12h(form.preferredTime),
        clientName:    resolvedClientName || 'Client',
        clientPhone:   resolvedClientPhone || '',
        visitType:     form.visitType,
        notes:         form.notes,
      };
      await apiService.post('/agent/lead/create-site-visit', payload);
      message.success('Viewing request submitted! Admin will confirm shortly.');
      onSuccess?.();
      onClose();
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to submit viewing request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div className="bg-white w-full sm:rounded-3xl sm:max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: GR }}>
          <div>
            <h3 className="text-base font-extrabold text-white">Schedule a Viewing</h3>
            <p className="text-xs text-white/70 mt-0.5">Request a property visit for your client</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* ── Lead: pre-filled chip OR dropdown ── */}
          {leadId ? (
            <>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 border border-purple-100">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GR, color: '#fff' }}>
                  <FiUser size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</p>
                  <p className="text-sm font-bold text-gray-900">{leadName || 'Selected Client'}</p>
                  {leadPhone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><FiPhone size={10} /> {leadPhone}</p>}
                </div>
              </div>
              {missingPhone && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <FiPhone size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 leading-relaxed font-medium">
                    This lead does not have a phone number. A site visit request cannot be sent to admin without a client phone number. Please update the lead with a phone number first.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Select Client / Lead <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={form.selectedLeadId}
                  onChange={e => { set('selectedLeadId', e.target.value); set('selectedPropertyId', ''); }}
                  disabled={loadingLeads}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all appearance-none"
                >
                  <option value="">{loadingLeads ? 'Loading leads…' : leads.length === 0 ? 'No leads found' : 'Choose a lead'}</option>
                  {leads.map(l => {
                    const fn    = l.contact_info?.name?.first_name || l.first_name || '';
                    const ln    = l.contact_info?.name?.last_name  || l.last_name  || '';
                    const ph    = l.contact_info?.mobile?.number   || '';
                    const label = `${fn} ${ln}`.trim() || ph || String(l._id).slice(-6);
                    return <option key={l._id || l.id} value={l._id || l.id}>{label}</option>;
                  })}
                </select>
              </div>
            </div>
          )}

          {/* ── Property: pre-filled chip OR dropdown ── */}
          {propertyId ? (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 border border-purple-100">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GR, color: '#fff' }}>
                <FiHome size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property</p>
                <p className="text-sm font-bold text-gray-900">{propertyName || 'Selected Property'}</p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Select Property <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiHome size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={form.selectedPropertyId}
                  onChange={e => set('selectedPropertyId', e.target.value)}
                  disabled={!form.selectedLeadId || loadingProps}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all appearance-none disabled:opacity-50"
                >
                  <option value="">
                    {!form.selectedLeadId
                      ? 'Select a lead first'
                      : loadingProps
                        ? 'Loading matched properties…'
                        : properties.length === 0
                          ? 'No matched properties found'
                          : 'Choose a property'}
                  </option>
                  {properties.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.propertyName || p.projectName || 'Unnamed'}{p.area ? ` · ${p.area}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {form.selectedLeadId && properties.length === 0 && !loadingProps && (
                <p className="text-xs text-amber-600 mt-1.5 font-medium flex items-center gap-1">
                  No matched properties for this lead yet. Record client interest in Matched Properties first.
                </p>
              )}
            </div>
          )}

          {/* ── Date + Time ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                <FiCalendar size={11} className="inline mr-1" />Preferred Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.preferredDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('preferredDate', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                <FiClock size={11} className="inline mr-1" />Preferred Time <span className="text-red-500">*</span>
              </label>
              <select
                value={form.preferredTime}
                onChange={e => set('preferredTime', e.target.value)}
                className={inputCls + ' appearance-none'}
              >
                <option value="">Choose time</option>
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>{to12h(t)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Visit type ── */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Visit Type</label>
            <div className="flex gap-2">
              {[
                { value: 'in_person', label: 'In-Person' },
                { value: 'virtual',   label: 'Virtual Tour' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('visitType', value)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    form.visitType === value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-500 hover:border-purple-300 bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Notes ── */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              <FiMessageSquare size={11} className="inline mr-1" />Notes (optional)
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Special requirements, access instructions, client preferences…"
              className={inputCls + ' resize-none'}
            />
          </div>

          {/* ── Info banner ── */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <FiCheckCircle size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              A Xoto admin will review this request and assign a Xoto Advisor to coordinate and confirm the viewing. You'll be notified once confirmed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || missingPhone}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60"
            style={{ background: GR }}
          >
            {submitting ? <FiLoader size={14} className="animate-spin" /> : <FiCalendar size={14} />}
            {submitting ? 'Submitting…' : 'Request Viewing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleViewingModal;
