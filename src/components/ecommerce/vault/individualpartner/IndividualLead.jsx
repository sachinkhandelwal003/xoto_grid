import React, { useState } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Form, Input, Select, Button, Card, Row, Col, Typography,
  DatePicker, InputNumber, Switch, Tag, message, Divider, Space, Tooltip
} from 'antd';
import {
  UserOutlined, HomeOutlined, FileTextOutlined, BankOutlined,
  SaveOutlined, InfoCircleOutlined, CheckOutlined, PhoneOutlined,
  MailOutlined, CalendarOutlined, DollarOutlined, EnvironmentOutlined,
  CloseOutlined
} from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const { Title, Text } = Typography;
const { Option }      = Select;
const { TextArea }    = Input;

const THEME = '#5C039B';

const NATIONALITIES = [
  'Emirati', 'Saudi Arabian', 'Indian', 'Pakistani', 'British', 'American',
  'Egyptian', 'Filipino', 'Jordanian', 'Lebanese', 'Syrian', 'Bangladeshi',
  'Sri Lankan', 'Nepalese', 'Indonesian', 'Chinese', 'Canadian', 'Australian',
  'French', 'German', 'Italian', 'Russian', 'South African', 'Nigerian', 'Other',
];

const UAE_AREAS = {
  Dubai: [
    'Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'JBR', 'Business Bay',
    'DIFC', 'Jumeirah', 'Al Barsha', 'Deira', 'Bur Dubai', 'Discovery Gardens',
    'Dubai Hills Estate', 'Arabian Ranches', 'Emirates Hills', 'Mirdif',
    'International City', 'Silicon Oasis', 'JVC', 'JLT', 'Sports City',
  ],
  'Abu Dhabi': [
    'Al Reem Island', 'Saadiyat Island', 'Yas Island', 'Al Khalidiyah',
    'Corniche', 'Khalifa City', 'Mohammed Bin Zayed City', 'Al Raha Beach',
    'Masdar City', 'Al Mushrif',
  ],
  Sharjah:             ['Al Nahda', 'Al Qasimia', 'Al Majaz', 'University City'],
  Ajman:               ['Ajman City', 'Al Rashidiya', 'Mushairef'],
  'Ras Al Khaimah':    ['Al Hamra', 'Mina Al Arab', 'Al Nakheel'],
  Fujairah:            ['Fujairah City'],
  'Umm Al Quwain':     ['UAQ City'],
};

const BANK_LIST = [
  'Emirates NBD', 'Abu Dhabi Commercial Bank (ADCB)', 'First Abu Dhabi Bank (FAB)',
  'Mashreq Bank', 'Dubai Islamic Bank (DIB)', 'Abu Dhabi Islamic Bank (ADIB)',
  'RAKBANK', 'Commercial Bank of Dubai (CBD)', 'Sharjah Islamic Bank',
  'Citibank UAE', 'HSBC UAE', 'Standard Chartered UAE', 'Other',
];

const Req = () => <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>;

const Rec = () => (
  <Tooltip title="Strongly recommended for accurate mortgage assessment">
    <span style={{
      marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 7px',
      borderRadius: 20, background: '#fff7ed', color: '#c2410c',
      border: '1px solid #fed7aa', verticalAlign: 'middle', cursor: 'help',
    }}>
      RECOMMENDED
    </span>
  </Tooltip>
);

const Opt = () => (
  <span style={{
    marginLeft: 6, fontSize: 10, fontWeight: 600, padding: '1px 7px',
    borderRadius: 20, background: '#f1f5f9', color: '#94a3b8',
    border: '1px solid #e2e8f0', verticalAlign: 'middle',
  }}>
    OPTIONAL
  </span>
);

const SectionHead = ({ icon, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '16px 20px', background: '#faf5ff', borderRadius: 12, border: '1px solid #f0e6ff' }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: THEME, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {React.cloneElement(icon, { style: { color: '#fff', fontSize: 18 } })}
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a0533' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: '#9b8ab0', marginTop: 1 }}>{subtitle}</div>}
    </div>
  </div>
);

const Label = ({ children, req, opt, rec }) => (
  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
    {children}
    {req && <Req />}
    {rec && <Rec />}
    {opt && <Opt />}
  </span>
);

/* ─── PhoneInput wrapper so Ant Design Form can control it properly ─── */
const FormPhoneInput = ({ value, onChange, ...rest }) => (
  <PhoneInput
    value={value}
    onChange={(val) => onChange?.(val)}
    inputStyle={{ width: '100%', height: 32, borderRadius: 8, border: '1px solid #d9d9d9' }}
    containerStyle={{ width: '100%' }}
    {...rest}
  />
);

const IndividualLeads = () => {
  const [form]           = Form.useForm();
  const [loading, setLoading]         = useState(false);
  const [preferredBanks, setPreferredBanks] = useState([]);
  const [selectedCity, setSelectedCity]     = useState('Dubai');
  const [isOffPlan, setIsOffPlan]           = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        customerInfo: {
          fullName:           values.fullName,
          preferredName:      values.preferredName    || null,
          email:              values.email,
          mobileNumber:       values.mobileNumber     || null,
          alternativePhone:   values.alternativePhone || null,
          whatsappNumber:     values.whatsappNumber   || null,
          dateOfBirth:        values.dateOfBirth      ? values.dateOfBirth.toISOString() : null,
          nationality:        values.nationality,
          maritalStatus:      values.maritalStatus,
          numberOfDependents: values.numberOfDependents  ?? 0,
          occupation:         values.occupation          || null,
          employer:           values.employer             || null,
          monthlySalary:      values.monthlySalary        || null,
        },
        propertyDetails: {
          propertyType:    values.propertyType,
          propertySubtype: values.propertySubtype || null,
          propertyValue:   values.propertyValue,
          downPaymentAmount:  values.downPaymentAmount   || null,
          loanAmountRequired: values.loanAmountRequired  || null,
          propertyAddress: {
            building: values.building || null,
            area:     values.area     || null,
            city:     values.city     || 'Dubai',
          },
          propertyAgeYears: values.propertyAgeYears || null,
          isOffPlan:        values.isOffPlan         || false,
          completionDate:   values.isOffPlan && values.completionDate
            ? values.completionDate.toISOString()
            : null,
        },
        loanRequirements: {
          preferredTenureYears:        values.preferredTenureYears       || 25,
          preferredInterestRateType:   values.preferredInterestRateType  || 'Fixed',
          preferredBanks:              preferredBanks,
          // ✅ FIX: directly read boolean values from form
          feeFinancingPreference:      values.feeFinancingPreference      ?? true,
          lifeInsurancePreference:     values.lifeInsurancePreference     ?? true,
          propertyInsurancePreference: values.propertyInsurancePreference ?? true,
          specialRequirements:         values.specialRequirements         || null,
        },
        referralType: values.referralType || 'Referral Only',
        notesToXoto:  values.notesToXoto  || null,
      };

      await apiService.post('/vault/lead/partner/create', payload);
      message.success('Lead created successfully!');
      form.resetFields();
      setPreferredBanks([]);
      setIsOffPlan(false);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const addBank    = (bank) => { if (bank && !preferredBanks.includes(bank)) setPreferredBanks(p => [...p, bank]); };
  const removeBank = (bank) => setPreferredBanks(p => p.filter(b => b !== bank));
  const areas      = UAE_AREAS[selectedCity] || [];

  return (
    <div style={{ background: '#f7f3ff', minHeight: '100vh', padding: '28px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 28 }}>
          <Title level={2} style={{ margin: 0, color: '#1a0533', fontWeight: 800 }}>Create New Lead</Title>
          <Text style={{ color: '#9b8ab0', fontSize: 14 }}>Fill in customer and property details to submit a mortgage referral.</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onFinishFailed={({ errorFields }) => {
            message.error("Please fill all required fields");
            if (errorFields.length > 0) {
              form.scrollToField(errorFields[0].name, { behavior: "smooth", block: "center" });
            }
          }}
          scrollToFirstError
          // ✅ FIX: set default values for boolean switches so they work on first submit
          initialValues={{
            feeFinancingPreference:      true,
            lifeInsurancePreference:     true,
            propertyInsurancePreference: true,
            isOffPlan:                   false,
            preferredTenureYears:        25,
            preferredInterestRateType:   'Fixed',
            referralType:                'Referral Only',
            city:                        'Dubai',
          }}
        >

          {/* ══════════════ SECTION 1 — Customer Info ══════════════ */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0e6ff', padding: '24px 28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(92,3,155,0.05)' }}>
            <SectionHead icon={<UserOutlined />} title="Customer Information" subtitle="Personal and contact details of the lead" />

            <Row gutter={[16, 4]}>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="fullName" label={<Label req>Full Legal Name</Label>}
                  rules={[{ required: true, message: 'Full name is required' }]}>
                  <Input prefix={<UserOutlined style={{ color: '#c0aad8' }} />} placeholder="e.g. Ahmed Al Mansouri" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="preferredName" label={<Label opt>Preferred Name</Label>}>
                  <Input placeholder="e.g. Ahmed" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="email" label={<Label req>Email Address</Label>}
                  rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Enter a valid email' }]}>
                  <Input prefix={<MailOutlined style={{ color: '#c0aad8' }} />} placeholder="omar@example.com" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              {/* ✅ FIX: Using FormPhoneInput wrapper for proper Form integration */}
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="mobileNumber" label={<Label req>Mobile Number</Label>}
                  rules={[{ required: true, message: 'Mobile number is required' }]}>
                  <FormPhoneInput
                    country="ae"
                    preferredCountries={['ae', 'sa', 'in', 'pk', 'gb', 'us']}
                    enableSearch
                    placeholder="Enter mobile number"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="alternativePhone" label={<Label opt>Alternative Phone</Label>}>
                  <FormPhoneInput country="ae" enableSearch placeholder="Optional" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="whatsappNumber" label={<Label opt>WhatsApp Number</Label>}>
                  <FormPhoneInput country="ae" enableSearch placeholder="Optional (if different from mobile)" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="dateOfBirth" label={<Label req>Date of Birth</Label>}
                  rules={[{ required: true, message: 'Date of birth is required' }]}>
                  <DatePicker style={{ width: '100%', borderRadius: 8 }} placeholder="Select date" format="DD-MMM-YYYY"
                    disabledDate={d => d && d.valueOf() > Date.now()} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="nationality" label={<Label req>Nationality</Label>}
                  rules={[{ required: true, message: 'Nationality is required' }]}>
                  <Select showSearch placeholder="Select nationality" optionFilterProp="children" style={{ borderRadius: 8 }}>
                    {NATIONALITIES.map(n => <Option key={n} value={n}>{n}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="maritalStatus" label={<Label req>Marital Status</Label>}
                  rules={[{ required: true, message: 'Marital status is required' }]}>
                  <Select placeholder="Select status" style={{ borderRadius: 8 }}>
                    <Option value="Single">Single</Option>
                    <Option value="Married">Married</Option>
                    <Option value="Divorced">Divorced</Option>
                    <Option value="Widowed">Widowed</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="numberOfDependents" label={<Label opt>Number of Dependents</Label>}>
                  <InputNumber min={0} max={20} style={{ width: '100%', borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="occupation" label={<Label opt>Occupation / Job Title</Label>}>
                  <Input placeholder="e.g. Senior Engineer" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="employer" label={<Label opt>Employer / Company Name</Label>}>
                  <Input placeholder="e.g. EMAAR, Emirates NBD" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="monthlySalary" label={<Label rec>Monthly Salary</Label>}>
                  <InputNumber
                    min={0} step={1000} style={{ width: '100%', borderRadius: 8 }}
                    formatter={v => v ? `AED ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={v => v.replace(/AED\s?|(,*)/g, '')}
                    placeholder="e.g. 25,000"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ══════════════ SECTION 2 — Property Details ══════════════ */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0e6ff', padding: '24px 28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(92,3,155,0.05)' }}>
            <SectionHead icon={<HomeOutlined />} title="Property Details" subtitle="Details of the property to be mortgaged" />

            <Row gutter={[16, 4]}>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="propertyType" label={<Label req>Property Type</Label>}
                  rules={[{ required: true, message: 'Property type is required' }]}>
                  <Select style={{ borderRadius: 8 }}>
                    <Option value="Ready">🏠 Ready</Option>
                    <Option value="Off-plan">🏗️ Off-plan</Option>
                    <Option value="Commercial">🏢 Commercial</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="propertySubtype" label={<Label opt>Property Subtype</Label>}>
                  <Select placeholder="Select subtype" allowClear style={{ borderRadius: 8 }}>
                    <Option value="Apartment">Apartment</Option>
                    <Option value="Villa">Villa</Option>
                    <Option value="Townhouse">Townhouse</Option>
                    <Option value="Penthouse">Penthouse</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="propertyValue" label={<Label req>Property Value (AED)</Label>}
                  rules={[{ required: true, message: 'Property value is required' }]}>
                  <InputNumber
                    min={0} style={{ width: '100%', borderRadius: 8 }}
                    formatter={v => v ? `AED ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={v => v.replace(/AED\s?|(,*)/g, '')}
                    placeholder="e.g. 1,500,000"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="downPaymentAmount" label={<Label opt>Down Payment Amount (AED)</Label>}>
                  <InputNumber
                    min={0} style={{ width: '100%', borderRadius: 8 }}
                    formatter={v => v ? `AED ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={v => v.replace(/AED\s?|(,*)/g, '')}
                    placeholder="e.g. 300,000"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="loanAmountRequired" label={<Label opt>Loan Amount Required (AED)</Label>}>
                  <InputNumber
                    min={0} style={{ width: '100%', borderRadius: 8 }}
                    formatter={v => v ? `AED ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={v => v.replace(/AED\s?|(,*)/g, '')}
                    placeholder="e.g. 1,200,000"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="city" label={<Label opt>City</Label>}>
                  <Select onChange={(val) => { setSelectedCity(val); form.setFieldsValue({ area: undefined }); }} style={{ borderRadius: 8 }}>
                    {Object.keys(UAE_AREAS).map(city => <Option key={city} value={city}>{city}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="area" label={<Label opt>Area / Community</Label>}>
                  <Select placeholder="Select area" showSearch allowClear style={{ borderRadius: 8 }}>
                    {areas.map(a => <Option key={a} value={a}>{a}</Option>)}
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="building" label={<Label opt>Building / Tower Name</Label>}>
                  <Input placeholder="e.g. Burj Views, Marina Gate" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="propertyAgeYears" label={<Label opt>Property Age (Years)</Label>}>
                  <InputNumber min={0} max={100} style={{ width: '100%', borderRadius: 8 }} placeholder="0 if new" addonAfter="Yrs" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="isOffPlan" label={<Label opt>Off-Plan Property</Label>} valuePropName="checked">
                  <Switch
                    checkedChildren="Yes — Off-plan"
                    unCheckedChildren="No — Ready / Existing"
                    style={{ background: isOffPlan ? THEME : undefined }}
                    onChange={(v) => setIsOffPlan(v)}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="completionDate"
                  label={<Label opt={!isOffPlan} req={isOffPlan}>Expected Completion Date</Label>}
                  rules={[{ required: isOffPlan, message: 'Required for off-plan property' }]}
                >
                  <DatePicker
                    style={{ width: '100%', borderRadius: 8 }}
                    format="DD-MMM-YYYY"
                    placeholder={isOffPlan ? 'Required for off-plan' : 'Only for off-plan'}
                    disabled={!isOffPlan}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ══════════════ SECTION 3 — Loan Requirements ══════════════ */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0e6ff', padding: '24px 28px', marginBottom: 20, boxShadow: '0 2px 12px rgba(92,3,155,0.05)' }}>
            <SectionHead icon={<BankOutlined />} title="Loan Requirements" subtitle="Customer's mortgage preferences" />

            <Row gutter={[16, 4]}>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="preferredTenureYears" label={<Label opt>Preferred Loan Tenure</Label>}>
                  <InputNumber min={1} max={35} style={{ width: '100%', borderRadius: 8 }} addonAfter="Years" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item name="preferredInterestRateType" label={<Label opt>Interest Rate Type</Label>}>
                  <Select style={{ borderRadius: 8 }}>
                    <Option value="Fixed">Fixed Rate</Option>
                    <Option value="Variable">Variable Rate</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <div style={{ marginBottom: 8 }}>
                  <Label opt>Preferred Banks</Label>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {preferredBanks.map(bank => (
                    <Tag key={bank}
                      style={{ borderRadius: 20, padding: '3px 12px', background: '#f0e6ff', border: '1px solid #d8c5ff', color: THEME, fontWeight: 600, fontSize: 12 }}
                      closeIcon={<CloseOutlined style={{ fontSize: 10, color: '#9b8ab0' }} />}
                      closable onClose={() => removeBank(bank)}>
                      {bank}
                    </Tag>
                  ))}
                  {preferredBanks.length === 0 && (
                    <Text style={{ fontSize: 12, color: '#c0aad8' }}>No banks selected — leave blank if no preference</Text>
                  )}
                </div>
                <Select
                  placeholder="Add a preferred bank (optional)"
                  style={{ width: 280, borderRadius: 8 }}
                  onSelect={(val) => addBank(val)}
                  value={undefined}
                >
                  {BANK_LIST.filter(b => !preferredBanks.includes(b)).map(b => (
                    <Option key={b} value={b}>{b}</Option>
                  ))}
                </Select>
              </Col>

              {/* ✅ FIX: Switch is now direct child of Form.Item — valuePropName="checked" works correctly */}
              <Col xs={24}>
                <Divider style={{ margin: '12px 0' }} />
                <Text style={{ fontSize: 12, fontWeight: 600, color: '#9b8ab0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Customer Preferences</Text>
                <Row gutter={[16, 8]} style={{ marginTop: 12 }}>
                  {[
                    { name: 'feeFinancingPreference',      label: 'Include Fee Financing',      desc: 'Add processing fees into the loan amount' },
                    { name: 'lifeInsurancePreference',     label: 'Include Life Insurance',     desc: 'Mortgage protection life coverage' },
                    { name: 'propertyInsurancePreference', label: 'Include Property Insurance', desc: 'Building and content insurance' },
                  ].map(({ name, label, desc }) => (
                    <Col xs={24} sm={8} key={name}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#faf5ff', borderRadius: 10, border: '1px solid #f0e6ff' }}>
                        {/* ✅ FIX: Form.Item wraps Switch directly, not a div */}
                        <Form.Item name={name} valuePropName="checked" style={{ marginBottom: 0, flexShrink: 0, marginTop: 2 }}>
                          <Switch size="small" />
                        </Form.Item>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0533' }}>{label}</div>
                          <div style={{ fontSize: 11, color: '#9b8ab0', marginTop: 1 }}>{desc}</div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Col>

              <Col xs={24} style={{ marginTop: 8 }}>
                <Form.Item name="specialRequirements" label={<Label opt>Special Requirements</Label>}>
                  <TextArea rows={3} placeholder="e.g. Needs early settlement flexibility, Islamic financing preferred, salary via WPS…" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ══════════════ SECTION 4 — Referral & Notes ══════════════ */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0e6ff', padding: '24px 28px', marginBottom: 24, boxShadow: '0 2px 12px rgba(92,3,155,0.05)' }}>
            <SectionHead icon={<FileTextOutlined />} title="Referral & Notes" subtitle="How you are referring this lead" />

            <Row gutter={[16, 4]}>

              <Col xs={24} md={12}>
                <Form.Item name="referralType" label={<Label opt>Referral Type</Label>}>
                  <Select placeholder="Select referral type" optionLabelProp="label">
                    <Option value="Referral Only" label="Referral Only">
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600 }}>Referral Only</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>I am only referring — Xoto will handle documents</span>
                      </div>
                    </Option>
                    <Option value="Referral + Docs" label="Referral + Docs">
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600 }}>Referral + Docs</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>I will collect and submit documents too</span>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="notesToXoto" label={<Label opt>Notes to Xoto Team</Label>}>
                  <TextArea rows={3} placeholder="e.g. Customer is in a hurry, prefers Islamic financing, referred via Ahmad…" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* ══════════════ SUBMIT ══════════════ */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button size="large"
              onClick={() => { form.resetFields(); setPreferredBanks([]); setIsOffPlan(false); }}
              style={{ borderRadius: 10, height: 46, paddingInline: 28, fontWeight: 600, borderColor: THEME, color: THEME }}>
              Reset
            </Button>
            <Button
              type="primary" htmlType="submit" size="large"
              icon={loading ? null : <SaveOutlined />}
              loading={loading}
              style={{ background: THEME, borderColor: THEME, borderRadius: 10, height: 46, paddingInline: 36, fontWeight: 700, fontSize: 14 }}
            >
              Save Lead
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default IndividualLeads;