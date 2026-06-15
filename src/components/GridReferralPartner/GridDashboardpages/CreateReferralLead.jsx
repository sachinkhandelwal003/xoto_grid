import React, { useState, useMemo } from 'react';
import { Form, Input, InputNumber, Select, Button, message } from 'antd';
import { Country } from 'country-state-city';
import { useNavigate } from 'react-router-dom';
import {
  FiUser, FiPhone, FiMail, FiMapPin, FiDollarSign,
  FiHome, FiCheckCircle, FiArrowLeft, FiPlus, FiList,
} from 'react-icons/fi';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Option } = Select;

const P = '#4A027C';
const P2 = '#7C3AED';
const GR = `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`;

// ─── Confirmation Screen ──────────────────────────────────────────────────────
function ConfirmationScreen({ result, onSubmitAnother, onViewLeads }) {
  return (
    <div style={{ background: '#F8FAFC', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 28px' }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>

        {/* Success icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: GR, display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 8px 32px rgba(74,2,124,0.25)',
          }}>
            <FiCheckCircle size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '20px', marginBottom: '8px' }}>
            Referral Submitted!
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
            Your referral has been sent to the Xoto team.
          </p>
        </div>

        {/* Reference card */}
        <div style={{
          background: '#fff', borderRadius: '20px', border: '1px solid #E2E8F0',
          padding: '28px', marginBottom: '20px',
          boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
        }}>
          {/* Reference number */}
          <div style={{
            background: '#F5F3FF', borderRadius: '12px', padding: '16px',
            textAlign: 'center', marginBottom: '24px', border: '1px solid #DDD6FE',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: P2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
              Referral Reference
            </p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: P, margin: 0, letterSpacing: '2px' }}>
              {result.reference}
            </p>
          </div>

          {/* Lead summary — 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <SummaryRow icon={<FiUser size={14} />} label="Client" value={result.client_name || '—'} />
            <SummaryRow icon={<FiPhone size={14} />} label="Phone" value={result.phone || '—'} />
            {result.interest_area && (
              <SummaryRow icon={<FiMapPin size={14} />} label="Interest Area" value={result.interest_area} />
            )}
            {result.budget && (
              <SummaryRow icon={<FiDollarSign size={14} />} label="Budget" value={`AED ${Number(result.budget).toLocaleString()}`} />
            )}
            {result.property_type && (
              <SummaryRow icon={<FiHome size={14} />} label="Property Type" value={result.property_type} />
            )}
          </div>
        </div>

        {/* CTAs — side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Button
            size="large"
            icon={<FiList size={15} />}
            onClick={onViewLeads}
            style={{
              height: '48px', borderRadius: '12px', fontWeight: 700,
              fontSize: '14px', borderColor: P, color: P,
            }}
            block
          >
            View My Referrals
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<FiPlus size={15} />}
            onClick={onSubmitAnother}
            style={{
              height: '48px', borderRadius: '12px', fontWeight: 700,
              fontSize: '14px', background: GR, border: 'none',
              boxShadow: '0 4px 14px rgba(74,2,124,0.3)',
            }}
            block
          >
            Submit Another Lead
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '10px',
        background: '#F5F3FF', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, color: P,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: 700 }}>{value}</span>
      </div>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function CreateReferralLead() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [screen, setScreen] = useState('form'); // 'form' | 'success'
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const countryOptions = useMemo(() =>
    Country.getAllCountries()
      .map(c => ({ name: c.name, code: `+${c.phonecode}`, iso: c.isoCode }))
      .filter(c => c.code !== '+undefined')
      .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Split full name into first / last
      const nameParts = (values.customerName || '').trim().split(/\s+/);
      const first_name = nameParts[0] || '';
      const last_name  = nameParts.slice(1).join(' ') || '';

      const payload = {
        first_name,
        last_name,
        phone_number:  values.phoneNumber,
        country_code:  values.countryCode || '+971',
        ...(values.email        && { email: values.email }),
        ...(values.interestArea && { interest_area: values.interestArea }),
        ...(values.budget       && { budget: values.budget }),
        ...(values.propertyType && { property_type: values.propertyType }),
      };

      const res = await apiService.post('/gridlead/referral/create-lead', payload);
      // apiService.post returns response.data (HTTP body)
      const data = res?.data || res;

      setResult({
        reference:     data.reference || `REF-${String(data.lead_id || '').slice(-8).toUpperCase()}`,
        client_name:   data.client_name || values.customerName,
        phone:         data.phone       || `${values.countryCode || '+971'} ${values.phoneNumber}`,
        interest_area: data.interest_area || values.interestArea || null,
        budget:        data.budget || values.budget || null,
        property_type: data.property_type || values.propertyType || null,
        lead_id:       data.lead_id,
      });
      setScreen('success');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit referral lead.';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAnother = () => {
    form.resetFields();
    form.setFieldsValue({ countryCode: '+971' });
    setResult(null);
    setScreen('form');
  };

  if (screen === 'success') {
    return (
      <ConfirmationScreen
        result={result}
        onSubmitAnother={handleSubmitAnother}
        onViewLeads={() => navigate('/dashboard/gridreferralpartner/total-leads')}
      />
    );
  }

  return (
    <div style={{ background: '#F8FAFC', padding: '24px 28px', height: '100%' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748B', fontSize: '12px', fontWeight: 600,
                marginBottom: '6px', padding: 0,
              }}
            >
              <FiArrowLeft size={13} /> Back
            </button>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Add New Referral
            </h1>
          </div>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0, maxWidth: '280px', textAlign: 'right' }}>
            Fill in your client's details to submit a referral to Xoto.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '28px 32px',
          border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.05)',
        }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            initialValues={{ countryCode: '+971' }}
          >
            {/* Two-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>

              {/* LEFT: Customer Name */}
              <Form.Item
                name="customerName"
                label={<FieldLabel text="Customer Name" required />}
                rules={[{ required: true, message: 'Customer name is required' }]}
                style={{ marginBottom: '18px' }}
              >
                <Input
                  prefix={<FiUser size={14} color="#94A3B8" />}
                  placeholder="e.g. Ahmed Al Mansouri"
                  size="large"
                  style={{ borderRadius: '10px', height: '44px' }}
                />
              </Form.Item>

              {/* RIGHT: Interest Area */}
              <Form.Item
                name="interestArea"
                label={<FieldLabel text="Interest Area" />}
                style={{ marginBottom: '18px' }}
              >
                <Input
                  prefix={<FiMapPin size={14} color="#94A3B8" />}
                  placeholder="e.g. Dubai Marina, Downtown"
                  size="large"
                  style={{ borderRadius: '10px', height: '44px' }}
                />
              </Form.Item>

              {/* LEFT: Phone */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ marginBottom: '8px' }}><FieldLabel text="Customer Phone" required /></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Form.Item name="countryCode" noStyle rules={[{ required: true, message: 'Required' }]}>
                    <Select
                      showSearch
                      size="large"
                      style={{ width: '140px', flexShrink: 0 }}
                      optionFilterProp="children"
                      dropdownStyle={{ borderRadius: '10px' }}
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {countryOptions.map(c => (
                        <Option key={c.iso} value={c.code}>{c.code} {c.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="phoneNumber"
                    noStyle
                    rules={[
                      { required: true, message: 'Phone number is required' },
                      { pattern: /^\d{6,15}$/, message: 'Enter a valid phone number' },
                    ]}
                  >
                    <Input
                      prefix={<FiPhone size={14} color="#94A3B8" />}
                      placeholder="501234567"
                      size="large"
                      style={{ borderRadius: '10px', height: '44px', flex: 1 }}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* RIGHT: Budget */}
              <Form.Item
                name="budget"
                label={<FieldLabel text="Budget (AED)" />}
                style={{ marginBottom: '18px' }}
              >
                <InputNumber
                  placeholder="e.g. 1,500,000"
                  size="large"
                  style={{ width: '100%', borderRadius: '10px', height: '44px' }}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={v => v?.replace(/,/g, '')}
                  min={0}
                />
              </Form.Item>

              {/* LEFT: Email */}
              <Form.Item
                name="email"
                label={<FieldLabel text="Email" />}
                rules={[{ type: 'email', message: 'Enter a valid email' }]}
                style={{ marginBottom: '24px' }}
              >
                <Input
                  prefix={<FiMail size={14} color="#94A3B8" />}
                  placeholder="client@email.com"
                  size="large"
                  style={{ borderRadius: '10px', height: '44px' }}
                />
              </Form.Item>

              {/* RIGHT: Property Type */}
              <Form.Item
                name="propertyType"
                label={<FieldLabel text="Property Type" />}
                style={{ marginBottom: '24px' }}
              >
                <Select
                  placeholder="Select property type"
                  size="large"
                  allowClear
                  style={{ borderRadius: '10px' }}
                  dropdownStyle={{ borderRadius: '10px' }}
                >
                  <Option value="Apartment">Apartment</Option>
                  <Option value="Villa">Villa</Option>
                  <Option value="Townhouse">Townhouse</Option>
                  <Option value="Penthouse">Penthouse</Option>
                  <Option value="Commercial">Commercial</Option>
                  <Option value="Land">Land</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Submit — full width */}
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              size="large"
              style={{
                height: '50px', borderRadius: '12px', fontWeight: 700,
                fontSize: '15px', background: GR, border: 'none',
                boxShadow: '0 4px 16px rgba(74,2,124,0.3)',
              }}
            >
              {submitting ? 'Submitting Referral…' : 'Submit Referral'}
            </Button>
          </Form>
        </div>

        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '11px', marginTop: '12px' }}>
          Client information is kept confidential and used only to process this referral.
        </p>
      </div>
    </div>
  );
}

function FieldLabel({ text, required }) {
  return (
    <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>
      {text}
      {required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
    </span>
  );
}
