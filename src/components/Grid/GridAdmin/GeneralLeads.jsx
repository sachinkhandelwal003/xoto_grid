import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Modal, Button, Tag, Tooltip, Avatar, Radio, Drawer,
  Spin, Empty, message, Form, Input, Select,
} from 'antd';
import {
  ReloadOutlined, PlusOutlined, UploadOutlined,
  PhoneOutlined, MailOutlined, UserOutlined,
  FileTextOutlined, GlobalOutlined, TeamOutlined,
  CheckCircleFilled, CloseCircleOutlined,
  EyeOutlined, UserAddOutlined,
  CalendarOutlined, HomeOutlined, DollarOutlined,
  EnvironmentOutlined, InfoCircleOutlined,
  ClockCircleOutlined, IdcardOutlined, TagOutlined,
} from '@ant-design/icons';
import CustomTable from '../../CMS/pages/custom/CustomTable';
import { useNavigate } from 'react-router-dom';

// ─── Theme ────────────────────────────────────────────────────────────────────
const PRIMARY       = '#5c039b';
const PRIMARY_LIGHT = '#f3e8ff';

// ─── Configs ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  new:                  { color: 'blue',     label: 'New'                   },
  contacted:            { color: 'orange',   label: 'Contacted'             },
  qualified:            { color: 'cyan',     label: 'Qualified'             },
  in_discussion:        { color: 'purple',   label: 'In Discussion'         },
  site_visit_scheduled: { color: 'geekblue', label: 'Site Visit Scheduled'  },
  offer_made:           { color: 'gold',     label: 'Offer Made'            },
  completed:            { color: 'success',  label: 'Completed'             },
  not_proceeding:       { color: 'red',      label: 'Not Proceeding'        },
};

const TYPE_COLORS = {
  buy:             { bg: '#ede9fe', color: '#5b21b6', label: 'Buy'             },
  sell:            { bg: '#fce7f3', color: '#9d174d', label: 'Sell'            },
  rent:            { bg: '#dbeafe', color: '#1e40af', label: 'Rent'            },
  consultation:    { bg: '#fef3c7', color: '#92400e', label: 'Consultation'    },
  schedule_visit:  { bg: '#e0f2fe', color: '#075985', label: 'Site Visit'      },
  hot_property:    { bg: '#fee2e2', color: '#dc2626', label: 'Hot Property'    },
  general_enquiry: { bg: '#f3f4f6', color: '#374151', label: 'General Enquiry' },
  mortgage:        { bg: '#fef9c3', color: '#854d0e', label: 'Mortgage'        },
  investor:        { bg: '#dcfce7', color: '#166534', label: 'Investor'        },
};

// Must match ALLOWED_CHANNELS in controller
const SOURCE_COLORS = {
  admin_manual: { bg: '#f3f4f6', color: '#374151', label: 'Admin Manual' },
  phone_call:   { bg: '#fef3c7', color: '#92400e', label: 'Phone Call'   },
  whatsapp:     { bg: '#dcfce7', color: '#166534', label: 'WhatsApp'     },
  email:        { bg: '#e0f2fe', color: '#075985', label: 'Email'        },
  bulk_upload:  { bg: '#dbeafe', color: '#1e40af', label: 'Bulk Upload'  },
};

const PROPERTY_TYPES    = ['Apartment','Villa','Townhouse','Penthouse','Studio','Office','Retail','Land'];
const TRANSACTION_TYPES = ['buy','rent','sell','invest'];
const FURNISHED_OPTIONS = ['furnished','unfurnished','any'];

// ─── Atoms ────────────────────────────────────────────────────────────────────
const TypeTag = ({ type }) => {
  const t = TYPE_COLORS[type] || { bg: '#f3f4f6', color: '#374151', label: type || '—' };
  return (
    <span style={{ background: t.bg, color: t.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {t.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { color: 'default', label: status || '—' };
  return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11 }}>{s.label}</Tag>;
};

const SourceBadge = ({ source }) => {
  const s = SOURCE_COLORS[source] || { bg: '#f3f4f6', color: '#374151', label: source || '—' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
};

const AdvisorChip = ({ advisor }) => {
  if (!advisor) return <span style={{ color: '#9ca3af', fontSize: 12 }}>— Unassigned</span>;
  const initials = `${advisor.firstName?.[0] || ''}${advisor.lastName?.[0] || ''}`.toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Avatar size={24} style={{ background: PRIMARY, fontSize: 10, fontWeight: 700 }}>{initials}</Avatar>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
        {advisor.firstName} {advisor.lastName}
      </span>
    </div>
  );
};

// ─── Drawer Helpers ───────────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value, valueStyle = {} }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: PRIMARY_LIGHT, color: PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13 }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, wordBreak: 'break-word', ...valueStyle }}>
        {value ?? <span style={{ color: '#d1d5db' }}>—</span>}
      </div>
    </div>
  </div>
);

const DrawerSection = ({ title, icon, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${PRIMARY_LIGHT}` }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, background: PRIMARY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
        {icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </span>
    </div>
    {children}
  </div>
);

// ─── Lead Detail Drawer ───────────────────────────────────────────────────────
const LeadDetailDrawer = ({ lead, open, onClose }) => {
  if (!lead) return null;

  const name  = [lead.contact_info?.name?.first_name, lead.contact_info?.name?.last_name].filter(Boolean).join(' ') || '— No name';
  const phone = lead.contact_info?.mobile?.number
    ? `${lead.contact_info.mobile.country_code || ''} ${lead.contact_info.mobile.number}`.trim()
    : null;
  const email = lead.contact_info?.email?.address;
  const req   = lead.requirements || {};

  const budgetStr = req.budget_min || req.budget_max
    ? [
        req.budget_min ? `AED ${Number(req.budget_min).toLocaleString()}` : 'Any',
        req.budget_max ? `AED ${Number(req.budget_max).toLocaleString()}` : 'Any',
      ].join(' – ')
    : null;

  const bedroomsStr = req.bedrooms != null
    ? (req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} Bedroom${req.bedrooms > 1 ? 's' : ''}`)
    : null;

  const locs = (req.location_preferences || [])
    .map(l => (typeof l === 'string' ? l : l?.area))
    .filter(Boolean);

  const hasReqs = req.property_type || req.transaction_type || budgetStr || bedroomsStr || req.furnished || locs.length > 0 || req.additional_notes;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={420}
      closable={false}
      styles={{
        body:   { padding: 0, background: '#faf5ff' },
        header: { display: 'none' },
        mask:   { background: 'rgba(92,3,155,0.08)' },
      }}
    >
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, #7c3aed 100%)`, padding: '22px 22px 18px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ✕
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{name}</div>
            {phone && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                <PhoneOutlined style={{ fontSize: 11 }} /> {phone}
              </div>
            )}
            {email && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                <MailOutlined style={{ fontSize: 11 }} /> {email}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <StatusBadge status={lead.status} />
          <TypeTag type={lead.enquiry_type} />
          {lead.source?.channel && <SourceBadge source={lead.source.channel} />}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px 100px', overflowY: 'auto', height: 'calc(100vh - 190px)' }}>

        <DrawerSection title="Contact Information" icon={<UserOutlined />}>
          <DetailRow icon={<UserOutlined />}   label="Full Name" value={name} />
          <DetailRow icon={<PhoneOutlined />}  label="Phone"     value={phone} />
          <DetailRow icon={<MailOutlined />}   label="Email"     value={email} />
          <DetailRow icon={<IdcardOutlined />} label="Lead ID"   value={lead._id}
            valueStyle={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }} />
        </DrawerSection>

        <DrawerSection title="Lead Details" icon={<FileTextOutlined />}>
          <DetailRow icon={<TagOutlined />}        label="Enquiry Type" value={<TypeTag type={lead.enquiry_type} />} />
          <DetailRow icon={<InfoCircleOutlined />} label="Status"       value={<StatusBadge status={lead.status} />} />
          <DetailRow icon={<GlobalOutlined />}     label="Source"       value={lead.source?.channel ? <SourceBadge source={lead.source.channel} /> : null} />
          {lead.classification && (
            <DetailRow
              icon={<TagOutlined />}
              label="Classification"
              value={
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                  {lead.classification.charAt(0).toUpperCase() + lead.classification.slice(1)}
                </span>
              }
            />
          )}
          {lead.assigned_to && (
            <DetailRow
              icon={<UserOutlined />}
              label="Assigned Advisor"
              value={`${lead.assigned_to?.firstName || ''} ${lead.assigned_to?.lastName || ''}`.trim() || String(lead.assigned_to)}
            />
          )}
        </DrawerSection>

        {hasReqs && (
          <DrawerSection title="Requirements" icon={<HomeOutlined />}>
            {req.property_type && <DetailRow icon={<HomeOutlined />}        label="Property Type" value={req.property_type} />}
            {req.transaction_type && <DetailRow icon={<TagOutlined />}      label="Transaction"   value={req.transaction_type.charAt(0).toUpperCase() + req.transaction_type.slice(1)} />}
            {budgetStr && <DetailRow icon={<DollarOutlined />}              label="Budget Range"  value={budgetStr} />}
            {bedroomsStr && <DetailRow icon={<HomeOutlined />}              label="Bedrooms"      value={bedroomsStr} />}
            {req.furnished && req.furnished !== 'any' && (
              <DetailRow icon={<InfoCircleOutlined />} label="Furnished" value={req.furnished.charAt(0).toUpperCase() + req.furnished.slice(1)} />
            )}
            {locs.length > 0 && <DetailRow icon={<EnvironmentOutlined />}  label="Locations"     value={locs.join(', ')} />}
            {req.additional_notes && (
              <DetailRow icon={<FileTextOutlined />} label="Notes" value={req.additional_notes}
                valueStyle={{ color: '#6b7280', fontStyle: 'italic' }} />
            )}
          </DrawerSection>
        )}

        <DrawerSection title="Activity" icon={<ClockCircleOutlined />}>
          <DetailRow
            icon={<CalendarOutlined />}
            label="Created"
            value={lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null}
          />
          <DetailRow
            icon={<ClockCircleOutlined />}
            label="Last Updated"
            value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null}
          />
        </DrawerSection>

        {lead.notes?.length > 0 && (
          <DrawerSection title="Notes" icon={<FileTextOutlined />}>
            {lead.notes.map((n, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #ede9fe', borderLeft: `3px solid ${PRIMARY}`, borderRadius: '0 8px 8px 8px', padding: '10px 14px', fontSize: 13, color: '#374151', lineHeight: 1.65, marginBottom: 8 }}>
                {n.text || n}
              </div>
            ))}
          </DrawerSection>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px', background: '#fff', borderTop: '1px solid #ede9fe', display: 'flex', gap: 8 }}>
        <Button block onClick={onClose} style={{ borderColor: '#d1d5db', color: '#6b7280', borderRadius: 8 }}>
          Close
        </Button>
        <Button
          block type="primary"
          icon={<PhoneOutlined />}
          disabled={!phone}
          style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8 }}
          onClick={() => { if (phone) window.open(`tel:${phone.replace(/\s/g, '')}`); }}
        >
          Call
        </Button>
      </div>
    </Drawer>
  );
};

// ─── Assign Modal ─────────────────────────────────────────────────────────────
const AssignModal = ({ lead, visible, onClose, onAssigned }) => {
  const [loading,     setLoading]     = useState(false);
  const [assigning,   setAssigning]   = useState(false);
  const [options,     setOptions]     = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [selectedId,  setSelectedId]  = useState(null);
  const [notes,       setNotes]       = useState('');

  useEffect(() => {
    if (visible && lead) { fetchAdvisors(); setNotes(''); }
  }, [visible, lead]);

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const res     = await apiService.get(`/gridlead/${lead._id}/suggest-advisors`);
      const resData = res?.data || res;
      setOptions(resData?.options || []);
      setRecommended(resData?.recommended || null);
      if (lead.assigned_to) {
        setSelectedId(typeof lead.assigned_to === 'object' ? lead.assigned_to._id : lead.assigned_to);
      } else if (resData?.recommended) {
        setSelectedId(resData.recommended._id);
      }
    } catch {
      message.error('Could not load advisors');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) return message.warning('Please select an advisor');
    setAssigning(true);
    try {
      await apiService.put(`/gridlead/${lead._id}/assign`, { advisorId: selectedId, notes });
      message.success(lead.assigned_to ? 'Advisor reassigned successfully' : 'Advisor assigned successfully');
      onAssigned();
      onClose();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      open={visible} onCancel={onClose} footer={null} width={520}
      title={lead?.assigned_to ? 'Reassign Advisor' : 'Assign Advisor'}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#374151', border: '1px solid #e5e7eb' }}>
            <strong>
              {lead?.contact_info?.name?.first_name
                ? `${lead.contact_info.name.first_name} ${lead.contact_info.name.last_name || ''}`
                : 'No client info'}
            </strong>
            <span style={{ marginLeft: 8, color: '#6b7280' }}>
              · {lead?.requirements?.property_type || '—'}
              {lead?.requirements?.bedrooms != null ? ` · ${lead.requirements.bedrooms === 0 ? 'Studio' : `${lead.requirements.bedrooms} BR`}` : ''}
            </span>
          </div>

          {recommended && !lead?.assigned_to && (
            <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#5b21b6', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700 }}>⭐ Best Match:</span>
              {recommended.firstName} {recommended.lastName}
              <span style={{ color: '#7c3aed', marginLeft: 4 }}>
                (Score: {recommended.leaderboard?.compositeScore || 0} · Active Leads: {recommended.workload?.activeLeadsCount || 0})
              </span>
            </div>
          )}

          <Radio.Group value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {options.length === 0 && <Empty description="No active advisors found" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
              {options.map(adv => {
                const isBestMatch = recommended?._id === adv._id;
                return (
                  <Radio key={adv._id} value={adv._id} style={{ margin: 0 }}>
                    <div style={{ padding: '10px 14px', border: `1px solid ${isBestMatch ? '#c4b5fd' : '#e5e7eb'}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, background: isBestMatch ? '#faf5ff' : '#fff' }}>
                      <Avatar size={28} style={{ background: PRIMARY, fontSize: 11, fontWeight: 700 }}>
                        {`${adv.firstName?.[0] || ''}${adv.lastName?.[0] || ''}`.toUpperCase()}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>
                          {adv.firstName} {adv.lastName}
                          {isBestMatch && (
                            <span style={{ marginLeft: 6, fontSize: 10, background: '#ede9fe', color: '#5b21b6', padding: '1px 6px', borderRadius: 20 }}>
                              Best Match
                            </span>
                          )}
                        </div>
                        {adv.email && <div style={{ fontSize: 11, color: '#6b7280' }}>{adv.email}</div>}
                      </div>
                      <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right', lineHeight: 1.6 }}>
                        <div>Score: {adv.leaderboard?.compositeScore || 0}</div>
                        <div>Leads: {adv.workload?.activeLeadsCount || 0}</div>
                      </div>
                    </div>
                  </Radio>
                );
              })}
            </div>
          </Radio.Group>

          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Assignment note (optional)" rows={2}
            style={{ width: '100%', marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, resize: 'none', fontFamily: 'inherit' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" loading={assigning} onClick={handleAssign} disabled={!selectedId} style={{ background: PRIMARY }}>
              {lead?.assigned_to ? 'Reassign' : 'Assign'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

// ─── Create Lead Modal ────────────────────────────────────────────────────────
const CreateLeadModal = ({ visible, onClose, onCreated }) => {
  const [form]    = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        first_name:     values.first_name,
        last_name:      values.last_name      || '',
        phone_number:   values.phone,
        country_code:   values.country_code   || '+971',
        email:          values.email          || undefined,
        enquiry_type:   values.enquiry_type   || 'general_enquiry',
        source_channel: values.source_channel || 'admin_manual',
        classification: 'warm',
        requirements: {
          property_type:    values.property_type    || undefined,
          transaction_type: values.transaction_type || undefined,
          budget_min:       values.budget_min  ? Number(values.budget_min)  : undefined,
          budget_max:       values.budget_max  ? Number(values.budget_max)  : undefined,
          bedrooms:         values.bedrooms != null && values.bedrooms !== '' ? Number(values.bedrooms) : undefined,
          furnished:        values.furnished   || 'any',
          additional_notes: values.notes       || '',
        },
      };
      await apiService.post('/gridlead/general/create', payload);
      message.success('Lead created successfully');
      form.resetFields();
      onCreated();
      onClose();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const inp = { borderRadius: 8 };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={600}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusOutlined style={{ color: PRIMARY, fontSize: 14 }} />
          </div>
          <span style={{ fontWeight: 700, color: '#111827' }}>Create General Lead</span>
        </div>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* Client Info */}
        <div style={{ background: '#fafafa', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: 'Required' }]} style={{ margin: 0 }}>
              <Input placeholder="John" style={inp} />
            </Form.Item>
            <Form.Item name="last_name" label="Last Name" style={{ margin: 0 }}>
              <Input placeholder="Doe" style={inp} />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12, marginTop: 12 }}>
            <Form.Item name="country_code" label="Code" initialValue="+971" style={{ margin: 0 }}>
              <Select style={inp}>
                {['+971','+91','+1','+44','+966','+974'].map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Required' }]} style={{ margin: 0 }}>
              <Input placeholder="501234567" style={inp} />
            </Form.Item>
          </div>
          <Form.Item name="email" label="Email" style={{ margin: 0, marginTop: 12 }}>
            <Input placeholder="john@example.com" style={inp} />
          </Form.Item>
        </div>

        {/* Lead Details */}
        <div style={{ background: '#fafafa', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="enquiry_type" label="Enquiry Type" initialValue="general_enquiry" style={{ margin: 0 }}>
              <Select style={inp}>
                {Object.entries(TYPE_COLORS).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="source_channel" label="Source" initialValue="admin_manual" style={{ margin: 0 }}>
              <Select style={inp}>
                {Object.entries(SOURCE_COLORS).map(([k, v]) => <Select.Option key={k} value={k}>{v.label}</Select.Option>)}
              </Select>
            </Form.Item>
          </div>
        </div>

        {/* Requirements */}
        <div style={{ background: '#fafafa', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirements (Optional)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="property_type" label="Property Type" style={{ margin: 0 }}>
              <Select placeholder="Any" allowClear style={inp}>
                {PROPERTY_TYPES.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="transaction_type" label="Transaction" style={{ margin: 0 }}>
              <Select placeholder="Any" allowClear style={inp}>
                {TRANSACTION_TYPES.map(t => <Select.Option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="budget_min" label="Budget Min (AED)" style={{ margin: 0 }}>
              <Input type="number" placeholder="500,000" style={inp} />
            </Form.Item>
            <Form.Item name="budget_max" label="Budget Max (AED)" style={{ margin: 0 }}>
              <Input type="number" placeholder="2,000,000" style={inp} />
            </Form.Item>
            <Form.Item name="bedrooms" label="Bedrooms" style={{ margin: 0 }}>
              <Select placeholder="Any" allowClear style={inp}>
                {[0,1,2,3,4,5,6].map(n => <Select.Option key={n} value={n}>{n === 0 ? 'Studio' : `${n} BR`}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="furnished" label="Furnished" initialValue="any" style={{ margin: 0 }}>
              <Select style={inp}>
                {FURNISHED_OPTIONS.map(f => <Select.Option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</Select.Option>)}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="notes" label="Additional Notes" style={{ margin: 0, marginTop: 12 }}>
            <Input.TextArea rows={2} placeholder="Any special requirements..." style={{ borderRadius: 8 }} />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}
            style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 8 }}>
            Create Lead
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ─── CSV parser helper ────────────────────────────────────────────────────────
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = [];
    let cur = '', inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { values.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    values.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { if (values[i] !== undefined) obj[h] = values[i]; });
    return obj;
  });
};

// ─── Bulk Upload Modal ────────────────────────────────────────────────────────
const BulkUploadModal = ({ visible, onClose, onUploaded }) => {
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState([]);   // first 3 rows preview
  const [parseErr,  setParseErr]  = useState('');
  const fileInputRef = React.useRef();

  const handleClose = () => {
    setResult(null); setFile(null); setPreview([]); setParseErr('');
    onClose();
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.csv')) {
      setParseErr('Please upload a .csv file'); setFile(null); setPreview([]); return;
    }
    setFile(f); setResult(null); setParseErr('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target.result);
        setPreview(rows.slice(0, 3));
        setParseErr('');
      } catch (err) {
        setParseErr(err.message); setPreview([]);
      }
    };
    reader.readAsText(f);
  };

  const downloadSample = () => {
    const csv = [
      'first_name,last_name,phone_number,country_code,email,enquiry_type,source_channel',
      'John,Doe,501234567,+971,john@example.com,buy,admin_manual',
      'Jane,Smith,509876543,+971,jane@example.com,rent,phone_call',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'leads_sample.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!file) return message.warning('Please select a CSV file first');
    setLoading(true); setResult(null);
    try {
      const text = await file.text();
      const leads = parseCSV(text);
      if (!leads.length) throw new Error('No data rows found in CSV');
      const res  = await apiService.post('/gridlead/general/bulk', { leads });

      // API returns: { success, summary: { created, duplicates, errors }, data: { created:[], errors:[] } }
      // handle both direct and wrapped response
      const body = res?.success !== undefined ? res : (res?.data || res);

      const createdCount = body?.summary?.created ?? body?.created ?? 0;
      const failedCount  = body?.summary?.errors  ?? body?.failed  ?? 0;
      const errorList    = body?.data?.errors      || body?.errors  || [];

      const summary = {
        created: createdCount,
        failed:  failedCount,
        errors:  errorList.map(e => ({ row: e.index + 1, message: e.reason || JSON.stringify(e) })),
      };
      setResult(summary);

      if (summary.created > 0) {
        message.success(`${summary.created} lead(s) created successfully`);
        setTimeout(() => {
          onUploaded();   // refresh table
          handleClose();  // close modal
        }, 1500);        // small delay so user sees the success message
      }
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Bulk upload failed');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={visible} onCancel={handleClose} footer={null} width={640}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UploadOutlined style={{ color: '#2563eb', fontSize: 14 }} />
          </div>
          <span style={{ fontWeight: 700, color: '#111827' }}>Bulk Upload via CSV</span>
        </div>
      }
    >
      <div style={{ marginTop: 12 }}>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${file ? '#2563eb' : '#d1d5db'}`,
            borderRadius: 12, padding: '28px 20px', textAlign: 'center',
            background: file ? '#eff6ff' : '#fafafa', cursor: 'pointer',
            transition: 'all 0.2s', marginBottom: 16,
          }}
        >
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
          <UploadOutlined style={{ fontSize: 32, color: file ? '#2563eb' : '#9ca3af', marginBottom: 10 }} />
          {file ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb' }}>{file.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                {(file.size / 1024).toFixed(1)} KB · Click to change
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Click to select CSV file</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Only .csv files are supported</div>
            </>
          )}
        </div>

        {/* Parse error */}
        {parseErr && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#dc2626' }}>
            ⚠️ {parseErr}
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Preview (first {preview.length} row{preview.length > 1 ? 's' : ''})
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', fontSize: 11 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#f9fafb', padding: '8px 12px', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                <span>Name</span><span>Phone</span><span>Email</span><span>Type</span>
              </div>
              {preview.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '8px 12px', borderBottom: i < preview.length - 1 ? '1px solid #f3f4f6' : 'none', color: '#374151' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[row.first_name, row.last_name].filter(Boolean).join(' ') || '—'}
                  </span>
                  <span>{row.phone_number || '—'}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.email || '—'}</span>
                  <span>{row.enquiry_type || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required columns info */}
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#92400e' }}>
          <strong>Required columns:</strong> <code>first_name</code>, <code>phone_number</code>
          &nbsp;·&nbsp;
          <strong>Optional:</strong> <code>last_name</code>, <code>country_code</code>, <code>email</code>, <code>enquiry_type</code>, <code>source_channel</code>
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: result.failed > 0 ? '#fff7ed' : '#f0fdf4', border: `1px solid ${result.failed > 0 ? '#fed7aa' : '#bbf7d0'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
                <CheckCircleFilled /> {result.created} Created
              </span>
              {result.failed > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
                  <CloseCircleOutlined /> {result.failed} Failed
                </span>
              )}
            </div>
            {result.errors?.length > 0 && (
              <div style={{ fontSize: 11, color: '#92400e', maxHeight: 120, overflowY: 'auto', marginTop: 8 }}>
                {result.errors.map((e, i) => (
                  <div key={i} style={{ borderTop: '1px solid #fed7aa', paddingTop: 4, marginTop: 4 }}>
                    Row {e.row}: {e.message || JSON.stringify(e)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <Button size="small" onClick={downloadSample} style={{ fontSize: 12, color: '#2563eb', borderColor: '#2563eb', borderRadius: 8 }}>
            Download Sample CSV
          </Button>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button onClick={handleClose}>Close</Button>
            <Button type="primary" loading={loading} onClick={handleSubmit}
              disabled={!file || !!parseErr}
              icon={<UploadOutlined />}
              style={{ background: '#2563eb', borderColor: '#2563eb', borderRadius: 8 }}>
              Upload {file && preview.length ? `(${preview.length}+ rows)` : ''}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const GeneralLeads = () => {
  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [pagination,   setPagination]   = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters,      setFilters]      = useState({});
  const [stats,        setStats]        = useState({ total: 0, new: 0, completed: 0, sources: 0 });
  const [showCreate,   setShowCreate]   = useState(false);
  const [showBulk,     setShowBulk]     = useState(false);
  const [assignLead,   setAssignLead]   = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
const navigate = useNavigate();
  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLeads = useCallback(async (extraFilters = {}, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set('page',  page);
      query.set('limit', limit);
      if (extraFilters.search)         query.set('search',         extraFilters.search);
      if (extraFilters.status)         query.set('status',         extraFilters.status);
      if (extraFilters.type)           query.set('type',           extraFilters.type);
      if (extraFilters.source_channel) query.set('source_channel', extraFilters.source_channel);

      const res = await apiService.get(`/gridlead/general?${query.toString()}`);

      // handle both shapes: res.data.data OR res.data (direct array)
      let list, pg, backStats;
      if (res?.success !== undefined) {
        // direct response: { success, data: [...], pagination, stats }
        list      = Array.isArray(res.data)       ? res.data       : [];
        pg        = res.pagination                 || {};
        backStats = res.stats                      || {};
      } else if (res?.data?.success !== undefined) {
        // wrapped response: { data: { success, data: [...], pagination, stats } }
        list      = Array.isArray(res.data.data)  ? res.data.data  : [];
        pg        = res.data.pagination            || {};
        backStats = res.data.stats                 || {};
      } else {
        // fallback
        list      = Array.isArray(res?.data)       ? res.data       : [];
        pg        = res?.pagination                 || {};
        backStats = res?.stats                      || {};
      }

      setLeads(list);
      setPagination({
        page:       pg.page       || page,
        limit:      pg.limit      || limit,
        total:      pg.total      || list.length,
        totalPages: pg.totalPages || 1,
      });
      setStats({
        total:     backStats.total_general || pg.total || list.length,
        new:       list.filter(l => l.status === 'new').length,
        completed: list.filter(l => l.status === 'completed').length,
        sources:   new Set(list.map(l => l.source?.channel).filter(Boolean)).size,
      });
    } catch (err) {
      console.error('fetchLeads error:', err);
      message.error('Failed to fetch general leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handlePageChange = (page, limit) => fetchLeads(filters, page, limit);
  const handleFilter = (newFilters) => {
    const merged = { ...filters, ...newFilters };
    setFilters(merged);
    fetchLeads(merged, 1, pagination.limit);
  };

  const handleView = (row) => {
    navigate(`/dashboard/admin/lead-detail-admin/${row._id}`);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedLead(null), 300);
  };

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Client Name',
      key: 'contact_info_name',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>
            {row.contact_info?.name?.first_name
              ? `${row.contact_info.name.first_name} ${row.contact_info.name.last_name || ''}`
              : <span style={{ color: '#9ca3af', fontWeight: 400 }}>— No client</span>}
          </div>
          {row.contact_info?.email?.address && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              {row.contact_info.email.address}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Phone',
      key: 'contact_info_phone',
      render: (_, row) => (
        <span style={{ fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>
          {row.contact_info?.mobile?.number
            ? `${row.contact_info.mobile.country_code || ''} ${row.contact_info.mobile.number}`
            : <span style={{ color: '#9ca3af' }}>— N/A</span>}
        </span>
      ),
    },
    {
      title: 'Type',
      key: 'enquiry_type',
      filterable: true,
      filterKey: 'type',
      filterOptions: Object.entries(TYPE_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (_, row) => <TypeTag type={row.enquiry_type} />,
    },
    {
      title: 'Status',
      key: 'status',
      filterable: true,
      filterKey: 'status',
      filterOptions: Object.entries(STATUS_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Source',
      key: 'source',
      filterable: true,
      filterKey: 'source_channel',
      filterOptions: Object.entries(SOURCE_COLORS).map(([k, v]) => ({ value: k, label: v.label })),
      render: (_, row) => <SourceBadge source={row.source?.channel} />,
    },
    {
      title: 'Requirements',
      key: 'requirements',
      render: (_, row) => {
        const r = row.requirements || {};
        const parts = [
          r.property_type,
          r.transaction_type,
          r.bedrooms != null ? (r.bedrooms === 0 ? 'Studio' : `${r.bedrooms} BR`) : null,
          r.budget_max ? `AED ${Number(r.budget_max).toLocaleString()}` : null,
        ].filter(Boolean);
        return parts.length
          ? <span style={{ fontSize: 12, color: '#374151' }}>{parts.join(' · ')}</span>
          : <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>;
      },
    },
    {
      title: 'Assigned Advisor',
      key: 'assignedAdvisor',
      render: (_, row) => <AdvisorChip advisor={row.assignedAdvisor} />,
    },
    {
      title: 'Date',
      key: 'createdAt',
      render: (val) => (
        <span style={{ fontSize: 12, color: '#6b7280' }}>
          {val ? new Date(val).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(row)}
            />
          </Tooltip>
          <Tooltip title={row.assigned_to ? 'Reassign Advisor' : 'Assign Advisor'}>
            <Button
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => setAssignLead(row)}
              style={!row.assigned_to ? { borderColor: PRIMARY, color: PRIMARY } : {}}
            >
              {row.assigned_to ? 'Reassign' : 'Assign'}
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Total Leads',    value: stats.total,     bg: PRIMARY_LIGHT, color: PRIMARY,   icon: <TeamOutlined />      },
    { label: 'New',            value: stats.new,       bg: '#dbeafe',     color: '#1d4ed8', icon: <FileTextOutlined />  },
    { label: 'Completed',      value: stats.completed, bg: '#dcfce7',     color: '#16a34a', icon: <CheckCircleFilled /> },
    { label: 'Unique Sources', value: stats.sources,   bg: '#fef3c7',     color: '#b45309', icon: <GlobalOutlined />    },
  ];

  return (
    <div style={{ padding: '28px 32px', background: '#faf5ff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>General Leads</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Website, manual and bulk-uploaded enquiries</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button icon={<ReloadOutlined />} onClick={() => fetchLeads(filters, pagination.page, pagination.limit)} style={{ borderColor: PRIMARY, color: PRIMARY }}>
            Refresh
          </Button>
          <Button icon={<UploadOutlined />} onClick={() => setShowBulk(true)} style={{ borderColor: '#2563eb', color: '#2563eb' }}>
            Bulk Upload
          </Button>
         <Button
  type="primary"
  icon={<PlusOutlined />}
  onClick={() => navigate('/dashboard/admin/add-generalleads')}
  style={{ background: PRIMARY, borderColor: PRIMARY }}
>
  Add Lead
</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        data={leads}
        loading={loading}
        totalItems={pagination.total}
        currentPage={pagination.page}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        onFilter={handleFilter}
        showSearch
      />

      {/* Modals */}
      <CreateLeadModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => fetchLeads(filters, 1, pagination.limit)}
      />
      <BulkUploadModal
        visible={showBulk}
        onClose={() => setShowBulk(false)}
        onUploaded={() => fetchLeads(filters, 1, pagination.limit)}
      />
      <AssignModal
        lead={assignLead}
        visible={!!assignLead}
        onClose={() => setAssignLead(null)}
        onAssigned={() => {
          setAssignLead(null);
          fetchLeads(filters, pagination.page, pagination.limit);
        }}
      />

      {/* View Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default GeneralLeads;