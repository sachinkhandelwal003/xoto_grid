import React, { useState } from 'react';
import {
  Form, Input, Select, Button, InputNumber,
  DatePicker, message, Divider,
} from 'antd';
import {
  PlusOutlined, MinusCircleOutlined, ArrowLeftOutlined,
  UserOutlined, PhoneOutlined, MailOutlined,
  HomeOutlined, DollarOutlined, CalendarOutlined,
  EnvironmentOutlined, FileTextOutlined, TagOutlined,
  CheckCircleFilled, GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Option }   = Select;
const { TextArea } = Input;

// ─── Theme ────────────────────────────────────────────────────────
const C = {
  primary:      '#5c039b',
  primaryLight: '#f3e8ff',
  primaryMid:   '#9333ea',
  bg:           '#faf5ff',
  surface:      '#ffffff',
  border:       '#ede9fe',
  borderDark:   '#d8b4fe',
  text:         '#111827',
  sub:          '#4b5563',
  muted:        '#9ca3af',
  success:      '#10b981',
  error:        '#ef4444',
};

// ─── Config ───────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { value: 'buy',             label: 'Buy'             },
  { value: 'rent',            label: 'Rent'            },
  { value: 'sell',            label: 'Sell'            },
  { value: 'hot_property',    label: 'Hot Property'    },
  { value: 'schedule_visit',  label: 'Site Visit'      },
  { value: 'consultation',    label: 'Consultation'    },
  { value: 'general_enquiry', label: 'General Enquiry' },
  { value: 'mortgage',        label: 'Mortgage'        },
  { value: 'investor',        label: 'Investor'        },
];

const SOURCE_OPTIONS = [
  { value: 'admin_manual', label: 'Admin Manual' },
  { value: 'phone_call',   label: 'Phone Call'   },
  { value: 'whatsapp',     label: 'WhatsApp'     },
  { value: 'email',        label: 'Email'        },
  { value: 'bulk_upload',  label: 'Bulk Upload'  },
];

const PROPERTY_TYPES    = ['Apartment','Villa','Townhouse','Penthouse','Studio','Office','Retail','Land'];
const TRANSACTION_TYPES = ['buy','rent','invest'];
const FURNISHED_OPTIONS = ['furnished','unfurnished','semi-furnished','any'];

// ─── Reusable section card ─────────────────────────────────────────
const SectionCard = ({ icon, title, subtitle, children, accent = C.primary }) => (
  <div style={{
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    boxShadow: '0 1px 4px rgba(92,3,155,0.06)',
  }}>
    {/* Section header */}
    <div style={{
      padding: '14px 20px',
      borderBottom: `1px solid ${C.border}`,
      background: C.primaryLight,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: accent, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.sub, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ padding: '20px 20px 4px' }}>{children}</div>
  </div>
);

// ─── Step indicator ────────────────────────────────────────────────
const StepDot = ({ num, label, active, done }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: done ? C.success : active ? C.primary : '#e5e7eb',
      color: '#fff', fontWeight: 700, fontSize: 13,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.25s',
    }}>
      {done ? <CheckCircleFilled /> : num}
    </div>
    <span style={{ fontSize: 10, color: active || done ? C.primary : C.muted, fontWeight: active ? 700 : 500 }}>
      {label}
    </span>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────
const AddGeneralLeads = () => {
  const [form]      = Form.useForm();
  const [loading,   setLoading]   = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const navigate    = useNavigate();

  const steps = ['Contact', 'Lead Info', 'Requirements'];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        first_name:     values.first_name,
        last_name:      values.last_name      || '',
        phone_number:   values.phone_number,
        country_code:   values.country_code   || '+971',
        email:          values.email          || undefined,
        enquiry_type:   values.enquiry_type   || 'general_enquiry',
        source_channel: values.source_channel || 'admin_manual',
        classification: values.classification || 'warm',
        requirements: {
          property_type:       values.property_type    || undefined,
          transaction_type:    values.transaction_type || undefined,
          budget_min:          values.budget_min        ? Number(values.budget_min)        : undefined,
          budget_max:          values.budget_max        ? Number(values.budget_max)        : undefined,
          bedrooms:            values.bedrooms != null && values.bedrooms !== '' ? Number(values.bedrooms) : undefined,
          bathrooms:           values.bathrooms != null && values.bathrooms !== '' ? Number(values.bathrooms) : undefined,
          area_sqft_min:       values.area_sqft_min    ? Number(values.area_sqft_min)    : undefined,
          area_sqft_max:       values.area_sqft_max    ? Number(values.area_sqft_max)    : undefined,
          furnished:           values.furnished        || 'any',
          ready_by_date:       values.ready_by_date    ? values.ready_by_date.toISOString() : undefined,
          additional_notes:    values.additional_notes || '',
          location_preferences: (values.location_preferences || []).map(loc => ({
            area: loc.area, priority: loc.priority || 1,
          })),
        },
      };

      await apiService.post('/gridlead/general/create', payload);
      message.success('Lead created successfully');
      navigate(-1);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  // field style overrides
  const fs = {
    borderRadius: 8,
    borderColor: C.border,
    fontSize: 13,
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: C.sub,
  };

  return (
    <div style={{ padding: '24px 28px', background: C.bg, minHeight: '100vh' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 36, height: 36, borderRadius: 9,
              background: C.surface, border: `1px solid ${C.border}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: C.sub,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}
          >
            <ArrowLeftOutlined style={{ fontSize: 14 }} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text }}>
              Add General Lead
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
              Create a new general lead manually
            </p>
          </div>
        </div>

        {/* Step tracker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <StepDot
                num={i + 1}
                label={s}
                active={activeStep === i}
                done={activeStep > i}
              />
              {i < steps.length - 1 && (
                <div style={{
                  width: 32, height: 2, borderRadius: 2, marginBottom: 16,
                  background: activeStep > i ? C.success : C.border,
                  transition: 'background 0.3s',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        scrollToFirstError
        onValuesChange={() => {
          // update active step based on validation
          const vals = form.getFieldsValue();
          if (vals.first_name && vals.phone_number) {
            if (vals.enquiry_type && vals.source_channel) setActiveStep(2);
            else setActiveStep(1);
          } else {
            setActiveStep(0);
          }
        }}
        initialValues={{
          country_code:      '+971',
          preferred_contact: 'whatsapp',
          source_channel:    'admin_manual',
          enquiry_type:      'general_enquiry',
          classification:    'warm',
          furnished:         'any',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Contact */}
            <SectionCard icon={<UserOutlined />} title="Contact Information" subtitle="Client's personal details">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  name="first_name" label="First Name"
                  rules={[
                    { required: true, message: 'First name is required' },
                    { min: 2, message: 'Minimum 2 characters' },
                    { max: 50, message: 'Maximum 50 characters' },
                    { pattern: /^[a-zA-Z\s]+$/, message: 'Only letters allowed' },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Input style={fs} placeholder="John" prefix={<UserOutlined style={{ color: C.muted }} />} />
                </Form.Item>

                <Form.Item
                  name="last_name" label="Last Name"
                  rules={[
                    { max: 50, message: 'Maximum 50 characters' },
                    { pattern: /^[a-zA-Z\s]*$/, message: 'Only letters allowed' },
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <Input style={fs} placeholder="Doe" />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12, marginBottom: 16 }}>
                <Form.Item name="country_code" label="Code" style={{ marginBottom: 0 }}>
                  <Select style={{ borderRadius: 8 }}>
                    {['+971','+91','+1','+44','+966','+974','+968','+965'].map(c => (
                      <Option key={c} value={c}>{c}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="phone_number" label="Phone Number"
                  rules={[
                    { required: true, message: 'Phone number is required' },
                    { pattern: /^[0-9]{7,15}$/, message: 'Enter 7–15 digit phone number' },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    style={fs} placeholder="501234567"
                    prefix={<PhoneOutlined style={{ color: C.muted }} />}
                  />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  name="email" label="Email"
                  rules={[{ type: 'email', message: 'Enter a valid email address' }]}
                  style={{ marginBottom: 16 }}
                >
                  <Input
                    style={fs} placeholder="john@example.com"
                    prefix={<MailOutlined style={{ color: C.muted }} />}
                  />
                </Form.Item>

                <Form.Item name="preferred_contact" label="Preferred Contact" style={{ marginBottom: 16 }}>
                  <Select style={{ borderRadius: 8 }}>
                    <Option value="whatsapp">WhatsApp</Option>
                    <Option value="call">Phone Call</Option>
                    <Option value="email">Email</Option>
                  </Select>
                </Form.Item>
              </div>
            </SectionCard>

            {/* Lead Details */}
            <SectionCard icon={<TagOutlined />} title="Lead Details" subtitle="Enquiry type and lead source">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  name="enquiry_type" label="Enquiry Type"
                  rules={[{ required: true, message: 'Select enquiry type' }]}
                  style={{ marginBottom: 16 }}
                >
                  <Select style={{ borderRadius: 8 }} placeholder="Select type">
                    {TYPE_OPTIONS.map(t => (
                      <Option key={t.value} value={t.value}>{t.label}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="source_channel" label="Source Channel"
                  rules={[{ required: true, message: 'Select source channel' }]}
                  style={{ marginBottom: 16 }}
                >
                  <Select style={{ borderRadius: 8 }}>
                    {SOURCE_OPTIONS.map(s => (
                      <Option key={s.value} value={s.value}>{s.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  name="classification" label="Classification"
                  rules={[{ required: true, message: 'Select classification' }]}
                  style={{ marginBottom: 16 }}
                >
                  <Select style={{ borderRadius: 8 }}>
                    <Option value="hot">
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>Hot</span>
                    </Option>
                    <Option value="warm">
                      <span style={{ color: '#f97316', fontWeight: 600 }}>Warm</span>
                    </Option>
                    <Option value="cold">
                      <span style={{ color: '#3b82f6', fontWeight: 600 }}>Cold</span>
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item name="classification_reason" label="Reason (optional)" style={{ marginBottom: 16 }}>
                  <Input style={fs} placeholder="Why this classification?" />
                </Form.Item>
              </div>
            </SectionCard>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div>
            {/* Requirements */}
            <SectionCard icon={<HomeOutlined />} title="Property Requirements" subtitle="What the client is looking for">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item name="property_type" label="Property Type" style={{ marginBottom: 16 }}>
                  <Select allowClear placeholder="Any type" style={{ borderRadius: 8 }}>
                    {PROPERTY_TYPES.map(pt => (
                      <Option key={pt} value={pt}>{pt}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="transaction_type" label="Transaction" style={{ marginBottom: 16 }}>
                  <Select allowClear placeholder="Any" style={{ borderRadius: 8 }}>
                    {TRANSACTION_TYPES.map(tt => (
                      <Option key={tt} value={tt}>
                        {tt.charAt(0).toUpperCase() + tt.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              {/* Budget */}
              <div style={{
                background: C.primaryLight, borderRadius: 10,
                padding: '12px 14px', marginBottom: 14,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarOutlined /> BUDGET RANGE (AED)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Form.Item
                    name="budget_min" label="Minimum"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (value < 0) return Promise.reject('Must be positive');
                          const max = form.getFieldValue('budget_max');
                          if (max && value > max) return Promise.reject('Min cannot exceed Max');
                          return Promise.resolve();
                        },
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      style={{ width: '100%', borderRadius: 8 }}
                      placeholder="500,000"
                      min={0}
                      formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={v => v.replace(/,/g, '')}
                    />
                  </Form.Item>
                  <Form.Item
                    name="budget_max" label="Maximum"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (value < 0) return Promise.reject('Must be positive');
                          const min = form.getFieldValue('budget_min');
                          if (min && value < min) return Promise.reject('Max must exceed Min');
                          return Promise.resolve();
                        },
                      },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      style={{ width: '100%', borderRadius: 8 }}
                      placeholder="2,000,000"
                      min={0}
                      formatter={v => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={v => v.replace(/,/g, '')}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Beds / Baths / Furnished */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Form.Item name="bedrooms" label="Bedrooms" style={{ marginBottom: 0 }}>
                  <Select allowClear placeholder="Any" style={{ borderRadius: 8 }}>
                    <Option value={0}>Studio</Option>
                    {[1,2,3,4,5,6,7].map(n => (
                      <Option key={n} value={n}>{n} BR</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="bathrooms" label="Bathrooms" style={{ marginBottom: 0 }}>
                  <Select allowClear placeholder="Any" style={{ borderRadius: 8 }}>
                    {[1,2,3,4,5,6].map(n => (
                      <Option key={n} value={n}>{n} Bath</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="furnished" label="Furnished" style={{ marginBottom: 0 }}>
                  <Select style={{ borderRadius: 8 }}>
                    {FURNISHED_OPTIONS.map(f => (
                      <Option key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              {/* Area sqft */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                <Form.Item
                  name="area_sqft_min" label="Min Area (sqft)"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const max = form.getFieldValue('area_sqft_max');
                        if (max && value > max) return Promise.reject('Min > Max');
                        return Promise.resolve();
                      },
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber style={{ width: '100%', borderRadius: 8 }} placeholder="500" min={0} />
                </Form.Item>
                <Form.Item
                  name="area_sqft_max" label="Max Area (sqft)"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const min = form.getFieldValue('area_sqft_min');
                        if (min && value < min) return Promise.reject('Max < Min');
                        return Promise.resolve();
                      },
                    },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber style={{ width: '100%', borderRadius: 8 }} placeholder="5,000" min={0} />
                </Form.Item>
                <Form.Item name="ready_by_date" label="Ready By" style={{ marginBottom: 0 }}>
                  <DatePicker
                    style={{ width: '100%', borderRadius: 8 }}
                    disabledDate={d => d && d.valueOf() < Date.now()}
                  />
                </Form.Item>
              </div>

             {/* Location Preferences */}
<div style={{
  background: '#f8fafc', border: `1px solid ${C.border}`,
  borderRadius: 10, padding: '12px 14px', marginBottom: 14,
}}>
  <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
    <EnvironmentOutlined /> LOCATION PREFERENCES
  </div>
  <Form.List name="location_preferences">
    {(fields, { add, remove }) => (
      <>
        {fields.map(({ key, name, ...rest }) => (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 32px', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            {/* AREA DROPDOWN (static list) */}
            <Form.Item
              {...rest}
              name={[name, 'area']}
              rules={[
                { required: true, message: 'Area required' },
                { min: 2, message: 'Min 2 chars' },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Select
                style={{ borderRadius: 8 }}
                placeholder="Select area"
                showSearch
                optionFilterProp="label"
              >
                {[
                  'Downtown Dubai',
                  'Dubai Marina',
                  'Business Bay',
                  'Jumeirah Village Circle (JVC)',
                  'Palm Jumeirah',
                  'Dubai Hills Estate',
                  'Arabian Ranches',
                  'Jumeirah Beach Residence (JBR)',
                  'Emaar Beachfront',
                  'Damac Hills',
                ].map(area => (
                  <Option key={area} value={area} label={area}>
                    {area}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* PRIORITY */}
            <Form.Item
              {...rest}
              name={[name, 'priority']}
              initialValue={1}
              style={{ marginBottom: 0 }}
            >
              <Select style={{ borderRadius: 8 }}>
                {[1, 2, 3, 4, 5].map(p => (
                  <Option key={p} value={p}>
                    Priority {p}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Remove button – unchanged */}
            <button
              type="button"
              onClick={() => remove(name)}
              style={{
                width: 32, height: 32, borderRadius: 7,
                border: '1px solid #fecaca', background: '#fff5f5',
                color: '#ef4444', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <MinusCircleOutlined style={{ fontSize: 13 }} />
            </button>
          </div>
        ))}
        {/* Add button – unchanged */}
        <button
          type="button"
          onClick={() => add({ area: '', priority: 1 })}
          style={{
            width: '100%', padding: '8px 0',
            border: `1.5px dashed ${C.borderDark}`,
            borderRadius: 8, background: 'transparent',
            color: C.primary, fontWeight: 600, fontSize: 12,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.primaryLight}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <PlusOutlined style={{ fontSize: 11 }} /> Add Location
        </button>
      </>
    )}
  </Form.List>
</div>

              {/* Notes */}
              <Form.Item
                name="additional_notes"
                label="Additional Notes"
                rules={[{ max: 500, message: 'Maximum 500 characters' }]}
                style={{ marginBottom: 8 }}
              >
                <TextArea
                  rows={3}
                  placeholder="Any specific requirements, preferences, or important details..."
                  style={{ ...fs, resize: 'none' }}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </SectionCard>
          </div>
        </div>

        {/* ── Footer action bar ── */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 -2px 12px rgba(92,3,155,0.06)',
        }}>
          <div style={{ fontSize: 13, color: C.sub }}>
            <span style={{ color: C.error }}>*</span> Fields marked are required
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => form.resetFields()}
              style={{
                padding: '9px 22px', borderRadius: 9,
                border: `1px solid ${C.border}`,
                background: C.surface, color: C.sub,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '9px 28px', borderRadius: 9,
                border: 'none',
                background: loading ? '#c4b5fd' : `linear-gradient(135deg, ${C.primary}, ${C.primaryMid})`,
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: loading ? 'none' : `0 4px 14px rgba(92,3,155,0.35)`,
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Creating...
                </>
              ) : (
                <><PlusOutlined /> Create Lead</>
              )}
            </button>
          </div>
        </div>
      </Form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .ant-form-item-label > label { font-size: 12px !important; font-weight: 600 !important; color: #4b5563 !important; }
        .ant-input, .ant-input-number, .ant-picker, .ant-select-selector {
          border-color: #ede9fe !important;
        }
        .ant-input:focus, .ant-input-number-focused, .ant-picker-focused,
        .ant-select-focused .ant-select-selector {
          border-color: #5c039b !important;
          box-shadow: 0 0 0 2px rgba(92,3,155,0.1) !important;
        }
        .ant-btn-primary { background: #5c039b !important; border-color: #5c039b !important; }
        .ant-form-item-explain-error { font-size: 11px !important; }
      `}</style>
    </div>
  );
};

export default AddGeneralLeads;