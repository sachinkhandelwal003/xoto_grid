import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiUser, FiPhone, FiMail, FiMapPin,
  FiDollarSign, FiHome, FiClock, FiAlertCircle,
  FiCheckCircle, FiEdit2, FiActivity, FiChevronDown, FiChevronUp,
  FiFileText, FiX,
} from 'react-icons/fi';
import { Spin, Modal, Form, Input, InputNumber, Select, Button, message } from 'antd';
import { Country } from 'country-state-city';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Option } = Select;

const P  = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  new:                  { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', label: 'New Lead'       },
  contacted:            { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE', label: 'Contacted'      },
  qualified:            { bg: '#ECFEFF', color: '#0891B2', border: '#A5F3FC', label: 'Qualified'      },
  in_discussion:        { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: 'In Discussion'  },
  site_visit_scheduled: { bg: '#ECFEFF', color: '#0891B2', border: '#A5F3FC', label: 'Site Visit'     },
  offer_made:           { bg: '#FDF2F8', color: '#DB2777', border: '#FBCFE8', label: 'Offer Made'     },
  reserved:             { bg: '#FDF2F8', color: '#DB2777', border: '#FBCFE8', label: 'Reserved'       },
  spa_signed:           { bg: '#ECFDF5', color: '#059669', border: '#6EE7B7', label: 'SPA Signed'     },
  completed:            { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: 'Completed'      },
  not_proceeding:       { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Not Proceeding' },
};

const CLASS_CFG = {
  hot:  { bg: '#FEF2F2', color: '#DC2626', label: 'Hot'  },
  warm: { bg: '#FFFBEB', color: '#D97706', label: 'Warm' },
  cold: { bg: '#EFF6FF', color: '#2563EB', label: 'Cold' },
};

const COMMISSION_CFG = {
  pending:   { bg: '#FFFBEB', color: '#D97706', label: 'Pending'   },
  confirmed: { bg: '#EFF6FF', color: '#2563EB', label: 'Confirmed' },
  paid:      { bg: '#F0FDF4', color: '#16A34A', label: 'Paid'      },
  cancelled: { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelled' },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (v) => (v == null || v === '' ? '—' : String(v));
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n) =>
  n != null ? `AED ${Number(n).toLocaleString()}` : null;

// ─── SMALL ATOMS ─────────────────────────────────────────────────────────────
const Badge = ({ label, bg, color, border }) => (
  <span style={{
    background: bg, color, border: `1px solid ${border || bg}`,
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px',
    display: 'inline-block',
  }}>{label}</span>
);

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0', label: status || '—' };
  return <Badge {...c} />;
};

const ClassBadge = ({ cls }) => {
  const c = CLASS_CFG[cls];
  if (!c) return null;
  return <Badge label={c.label} bg={c.bg} color={c.color} />;
};

const CommissionBadge = ({ status }) => {
  const c = COMMISSION_CFG[status] || COMMISSION_CFG.pending;
  return <Badge label={c.label} bg={c.bg} color={c.color} />;
};

// ─── INFO ROW ────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid #F8FAFC' }}>
    <div style={{
      width: '32px', height: '32px', borderRadius: '10px', background: '#F5F3FF',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={13} color={P} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 600, margin: 0, wordBreak: 'break-word' }}>{value || '—'}</p>
    </div>
  </div>
);

// ─── CARD ────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff', borderRadius: '16px', border: '1px solid #E8ECF0',
    boxShadow: '0 2px 12px rgba(15,23,42,0.04)', overflow: 'hidden', ...style,
  }}>
    {children}
  </div>
);

const CardHeader = ({ title, icon: Icon, action }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 20px', borderBottom: '1px solid #F1F5F9',
  }}>
    <div style={{
      width: '30px', height: '30px', borderRadius: '9px',
      background: GR, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={13} color="#fff" />
    </div>
    <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, flex: 1 }}>{title}</h3>
    {action}
  </div>
);

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const StatCard = ({ label, children, accentColor }) => (
  <div style={{
    background: '#fff', borderRadius: '14px', border: '1px solid #E8ECF0',
    padding: '16px 18px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
    borderLeft: `3px solid ${accentColor || P}`,
  }}>
    <p style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>{label}</p>
    {children}
  </div>
);

// ─── EDIT MODAL ──────────────────────────────────────────────────────────────
function EditLeadModal({ lead, visible, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const countryOptions = useMemo(() =>
    Country.getAllCountries()
      .map(c => ({ name: c.name, code: `+${c.phonecode}`, iso: c.isoCode }))
      .filter(c => c.code !== '+undefined')
      .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  useEffect(() => {
    if (visible && lead) {
      const ci   = lead.contact_info || {};
      const name = ci.name  || {};
      const mob  = ci.mobile || {};
      const em   = ci.email  || {};
      const req  = lead.requirements || {};
      const locs = (req.location_preferences || []).map(l => l?.area || l).filter(Boolean);

      form.setFieldsValue({
        customerName: `${name.first_name || ''} ${name.last_name || ''}`.trim(),
        countryCode:  mob.country_code || '+971',
        phoneNumber:  mob.number || '',
        email:        em.address || '',
        interestArea: locs[0] || '',
        budget:       req.budget_max || req.budget_min || null,
        propertyType: req.property_type || undefined,
      });
    }
  }, [visible, lead, form]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const nameParts  = (values.customerName || '').trim().split(/\s+/);
      const first_name = nameParts[0] || '';
      const last_name  = nameParts.slice(1).join(' ') || '';

      const payload = {
        first_name,
        last_name,
        phone_number:  values.phoneNumber,
        country_code:  values.countryCode || '+971',
        email:         values.email || undefined,
        interest_area: values.interestArea || undefined,
        budget_max:    values.budget || undefined,
        property_type: values.propertyType || undefined,
        transaction_type: lead.requirements?.transaction_type || 'buy',
      };

      await apiService.put(`/gridlead/referral/${lead._id}/update-requirements`, {
        requirements: payload,
        reason: 'Updated by referral partner',
      });

      message.success('Lead updated successfully');
      onSaved();
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: GR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiEdit2 size={13} color="#fff" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B' }}>Edit Lead</span>
        </div>
      }
      width={580}
      styles={{ body: { padding: '20px 24px 4px' } }}
    >
      <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>

        {/* Customer Name */}
        <Form.Item name="customerName" label={<FieldLabel text="Customer Name" required />}
          rules={[{ required: true, message: 'Required' }]} style={{ marginBottom: '16px' }}>
          <Input prefix={<FiUser size={14} color="#94A3B8" />} placeholder="Full name" size="large"
            style={{ borderRadius: '10px' }} />
        </Form.Item>

        {/* Phone */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '6px' }}><FieldLabel text="Phone" required /></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Form.Item name="countryCode" noStyle rules={[{ required: true }]}>
              <Select showSearch size="large" style={{ width: '140px' }}
                filterOption={(i, o) => o?.children?.toString().toLowerCase().includes(i.toLowerCase())}>
                {countryOptions.map(c => <Option key={c.iso} value={c.code}>{c.code} {c.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="phoneNumber" noStyle
              rules={[{ required: true, message: 'Phone required' }, { pattern: /^\d{6,15}$/, message: 'Invalid phone' }]}>
              <Input prefix={<FiPhone size={14} color="#94A3B8" />} placeholder="501234567"
                size="large" style={{ borderRadius: '10px', flex: 1 }} />
            </Form.Item>
          </div>
        </div>

        {/* Email */}
        <Form.Item name="email" label={<FieldLabel text="Email" />}
          rules={[{ type: 'email', message: 'Invalid email' }]} style={{ marginBottom: '16px' }}>
          <Input prefix={<FiMail size={14} color="#94A3B8" />} placeholder="client@email.com"
            size="large" style={{ borderRadius: '10px' }} />
        </Form.Item>

        {/* 2 cols: Interest Area + Budget */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <Form.Item name="interestArea" label={<FieldLabel text="Interest Area" />} style={{ marginBottom: 0 }}>
            <Input prefix={<FiMapPin size={14} color="#94A3B8" />} placeholder="Dubai Marina"
              size="large" style={{ borderRadius: '10px' }} />
          </Form.Item>
          <Form.Item name="budget" label={<FieldLabel text="Budget (AED)" />} style={{ marginBottom: 0 }}>
            <InputNumber placeholder="1,500,000" size="large" style={{ width: '100%', borderRadius: '10px' }}
              formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v?.replace(/,/g, '')} min={0} />
          </Form.Item>
        </div>

        {/* Property Type */}
        <Form.Item name="propertyType" label={<FieldLabel text="Property Type" />} style={{ marginBottom: '24px' }}>
          <Select placeholder="Select type" size="large" allowClear style={{ borderRadius: '10px' }}>
            <Option value="Apartment">Apartment</Option>
            <Option value="Villa">Villa</Option>
            <Option value="Townhouse">Townhouse</Option>
            <Option value="Penthouse">Penthouse</Option>
            <Option value="Commercial">Commercial</Option>
            <Option value="Land">Land</Option>
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingBottom: '4px' }}>
          <Button onClick={onClose} size="large" style={{ borderRadius: '10px', minWidth: '90px' }}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={saving} size="large"
            style={{ borderRadius: '10px', minWidth: '120px', background: GR, border: 'none' }}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

function FieldLabel({ text, required }) {
  return (
    <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
      {text}{required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
    </span>
  );
}

// ─── STATUS TIMELINE ─────────────────────────────────────────────────────────
function StatusTimeline({ history }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0',
          fontSize: '12px', color: '#64748B', fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiActivity size={13} /> Status Timeline ({history.length})
        </span>
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {open && (
        <div style={{ position: 'relative', paddingLeft: '24px', marginTop: '8px' }}>
          <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: '#E8ECF0' }} />
          {[...history].reverse().map((h, i) => {
            const cfg = STATUS_CFG[h.status] || { bg: '#F1F5F9', color: '#64748B', label: h.status };
            return (
              <div key={i} style={{ position: 'relative', marginBottom: '12px' }}>
                <div style={{
                  position: 'absolute', left: '-21px', top: '6px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: cfg.color, border: '2px solid #fff', boxShadow: '0 0 0 2px ' + cfg.color,
                }} />
                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px', border: '1px solid #E8ECF0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '3px 8px', borderRadius: '20px' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock size={10} />
                      {h.changed_at ? new Date(h.changed_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' }) : '—'}
                    </span>
                  </div>
                  {h.notes && <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0', lineHeight: 1.5 }}>{h.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ReferralPartnerLeadDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [lead,       setLead]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [editOpen,   setEditOpen]   = useState(false);

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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <Spin size="large" />
      <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Loading lead…</p>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !lead) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <FiAlertCircle size={40} color="#E5E7EB" />
      <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>{error || 'Lead not found.'}</p>
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px',
        borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff',
        color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
      }}>
        <FiArrowLeft size={14} /> Go Back
      </button>
    </div>
  );

  // ── Data ──────────────────────────────────────────────────────────────────
  const ci      = lead.contact_info  || {};
  const name    = ci.name            || {};
  const mobile  = ci.mobile          || {};
  const email   = ci.email           || {};
  const req     = lead.requirements  || {};

  const fn       = name.first_name || '';
  const ln       = name.last_name  || '';
  const fullName = `${fn} ${ln}`.trim() || 'Unknown Client';
  const initials = fn?.[0] ? (fn[0] + (ln?.[0] || '')).toUpperCase() : '?';

  const locs = (req.location_preferences || [])
    .map(l => (typeof l === 'string' ? l : l?.area))
    .filter(Boolean);

  const budgetStr = req.budget_max
    ? `Up to ${fmtMoney(req.budget_max)}`
    : req.budget_min ? `From ${fmtMoney(req.budget_min)}` : null;

  const isAssignmentNote = (text = '') =>
    /assign|advisor|assigned to|routing|escalat/i.test(text);

  const notes      = (lead.notes || []).filter(n => !isAssignmentNote(n?.text || ''));
  const statusHist = lead.status_history || [];
  const statusCfg  = STATUS_CFG[lead.status] || { bg: '#F1F5F9', color: '#64748B', label: lead.status || '—' };
  const commStatus = lead.referral_info?.commission_status || 'pending';
  const reference  = `REF-${lead._id?.toString().slice(-8).toUpperCase()}`;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100%', padding: '0' }}>

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <div style={{ background: GR, padding: '24px 28px 28px' }}>
        {/* Back row */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '10px', padding: '7px 14px', color: '#fff',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginBottom: '20px',
          }}
        >
          <FiArrowLeft size={13} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{fullName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
                  background: 'rgba(255,255,255,0.15)', padding: '3px 10px',
                  borderRadius: '20px', letterSpacing: '0.5px',
                }}>
                  {reference}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: statusCfg.color,
                  background: statusCfg.bg, padding: '3px 10px', borderRadius: '20px',
                }}>
                  {statusCfg.label}
                </span>
                {lead.submitted_to_xoto && (
                  <span style={{
                    fontSize: '11px', fontWeight: 700, color: '#16A34A',
                    background: '#F0FDF4', padding: '3px 10px', borderRadius: '20px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <FiCheckCircle size={11} /> Submitted
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setEditOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#fff', border: 'none', borderRadius: '12px',
              padding: '10px 20px', color: P, fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
          >
            <FiEdit2 size={14} /> Edit Lead
          </button>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 28px', maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── 2-COLUMN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* ════ LEFT COLUMN ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Contact Info */}
            <Card>
              <CardHeader title="Contact Info" icon={FiUser} />
              <div style={{ padding: '4px 20px 8px' }}>
                <InfoRow icon={FiUser}  label="Full Name" value={fullName !== 'Unknown Client' ? fullName : '—'} />
                <InfoRow icon={FiPhone} label="Phone"
                  value={mobile.number ? `${mobile.country_code || ''} ${mobile.number}`.trim() : '—'} />
                <InfoRow icon={FiMail}  label="Email" value={fmt(email.address)} />
              </div>
            </Card>

            {/* Lead Meta */}
            <Card>
              <CardHeader title="Lead Info" icon={FiClock} />
              <div style={{ padding: '4px 20px 8px' }}>
                <InfoRow icon={FiClock}       label="Submitted On" value={fmtDate(lead.createdAt)} />
                <InfoRow icon={FiClock}       label="Last Updated" value={fmtDate(lead.updatedAt)} />
                <InfoRow icon={FiCheckCircle} label="Commission"   value={commStatus.replace(/_/g, ' ')} />
                {lead.referral_info?.commission_rate != null && (
                  <InfoRow icon={FiFileText} label="Commission Rate" value={`${lead.referral_info.commission_rate}%`} />
                )}
              </div>
            </Card>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── 3 Stat cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <StatCard label="Lead Status" accentColor={statusCfg.color}>
                <StatusBadge status={lead.status} />
              </StatCard>
              <StatCard label="Priority" accentColor={CLASS_CFG[lead.classification]?.color || P}>
                <ClassBadge cls={lead.classification} />
              </StatCard>
              <StatCard label="Commission" accentColor={COMMISSION_CFG[commStatus]?.color || '#D97706'}>
                <CommissionBadge status={commStatus} />
              </StatCard>
            </div>

            {/* ── Requirements visual card ── */}
            <Card>
              <CardHeader title="Requirements" icon={FiHome} />
              <div style={{ padding: '16px 20px' }}>
                {/* Pill tags row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {req.property_type && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F5F3FF', color: P, border: '1px solid #DDD6FE', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 700 }}>
                      <FiHome size={11} /> {req.property_type}
                    </span>
                  )}
                  {locs.map((l, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ECFEFF', color: '#0891B2', border: '1px solid #A5F3FC', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 700 }}>
                      <FiMapPin size={11} /> {l}
                    </span>
                  ))}
                  {budgetStr && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 700 }}>
                      <FiDollarSign size={11} /> {budgetStr}
                    </span>
                  )}
                  {req.transaction_type && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
                      <FiFileText size={11} /> {req.transaction_type}
                    </span>
                  )}
                </div>
                {/* Detail rows */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', borderTop: '1px solid #F1F5F9', paddingTop: '4px' }}>
                  <InfoRow icon={FiHome}       label="Property Type" value={fmt(req.property_type)} />
                  <InfoRow icon={FiMapPin}     label="Location"      value={locs.length > 0 ? locs.join(', ') : '—'} />
                  <InfoRow icon={FiDollarSign} label="Budget"        value={budgetStr || '—'} />
                  <InfoRow icon={FiFileText}   label="Transaction"   value={fmt(req.transaction_type)} />
                </div>
              </div>
            </Card>

            {/* ── Notes ── */}
            <Card>
              <CardHeader title="Notes" icon={FiFileText} />
              <div style={{ padding: '16px 20px' }}>
                {notes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF', fontSize: '13px' }}>
                    No notes yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notes.map((n, i) => (
                      <div key={i} style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px 16px', border: '1px solid #E8ECF0' }}>
                        <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 8px', lineHeight: 1.6 }}>{n.text || n}</p>
                        {(n.author || n.created_at) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #E8ECF0', paddingTop: '8px' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#F5F3FF', color: P, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                              {(n.author?.[0] || 'A').toUpperCase()}
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{n.author || 'Referral Partner'}</span>
                            {(n.created_at || n.createdAt) && (
                              <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <FiClock size={10} /> {fmtDate(n.created_at || n.createdAt)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* ── Status Timeline ── */}
            {statusHist.length > 0 && (
              <Card>
                <div style={{ padding: '12px 20px 16px' }}>
                  <StatusTimeline history={statusHist} />
                </div>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      <EditLeadModal
        lead={lead}
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={fetchLead}
      />
    </div>
  );
}
