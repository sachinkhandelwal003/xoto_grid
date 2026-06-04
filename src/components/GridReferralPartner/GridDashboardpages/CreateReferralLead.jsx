import React, { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, Form, Input, InputNumber, Select, Button, message, Tabs, Spin } from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined, DollarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Country } from 'country-state-city';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Option } = Select;
const { TextArea } = Input;

const THEME = {
  primary: '#5C039B',
  primaryMid: '#7C3AED',
  primaryLight: '#F5F0FF',
  textDark: '#0F172A',
  textMuted: '#64748B',
  bgPage: '#F8FAFC',
};

const CreateReferralLead = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('client');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leadId = searchParams.get('id');

  const countryOptions = useMemo(() => {
    return Country.getAllCountries()
      .map((country) => ({
        name: country.name,
        code: `+${country.phonecode}`,
        isoCode: country.isoCode,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    if (leadId) {
      fetchLeadData(leadId);
    }
  }, [leadId]);

  const fetchLeadData = async (id) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/gridlead/${id}`);
      const data = res?.data?.data || res?.data;
      
      form.setFieldsValue({
        firstName: data.contact_info?.name?.first_name,
        lastName: data.contact_info?.name?.last_name,
        countryCode: data.contact_info?.mobile?.country_code || '+971',
        phoneNumber: data.contact_info?.mobile?.number,
        email: data.contact_info?.email?.address,
        transactionType: data.requirements?.transaction_type,
        propertyType: data.requirements?.property_type,
        areaOfInterest: data.requirements?.location_preferences?.[0]?.area,
        budgetMin: data.requirements?.budget_min,
        budgetMax: data.requirements?.budget_max,
        bedrooms: data.requirements?.bedrooms,
        bathrooms: data.requirements?.bathrooms,
        areaMin: data.requirements?.area_sqft_min,
        areaMax: data.requirements?.area_sqft_max,
        furnished: data.requirements?.furnished,
        readyByDate: data.requirements?.ready_by_date,
        additionalNotes: data.requirements?.additional_notes,
      });
    } catch (err) {
      console.error('Failed to fetch lead data', err);
      message.error('Failed to load lead for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        first_name: values.firstName,
        last_name: values.lastName,
        phone_number: values.phoneNumber,
        country_code: values.countryCode || '+971',
        email: values.email,
        property_type: values.propertyType,
        transaction_type: values.transactionType,
        location_preferences: values.areaOfInterest ? [{ area: values.areaOfInterest }] : [],
        budget_min: values.budgetMin,
        budget_max: values.budgetMax,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        area_sqft_min: values.areaMin,
        area_sqft_max: values.areaMax,
        furnished: values.furnished,
        ready_by_date: values.readyByDate,
        additional_notes: values.additionalNotes,
      };

      if (leadId) {
        await apiService.put(`/gridlead/referral/${leadId}/update-requirements`, {
          requirements: payload,
          reason: 'Updated by referral partner'
        });
        message.success('Referral lead updated successfully!');
      } else {
        await apiService.post('/gridlead/referral/create-lead', payload);
        message.success('Referral lead submitted successfully!');
        form.resetFields();
      }
      
      setActiveTab('client');
      navigate('/dashboard/gridreferralpartner/total-leads');
    } catch (err) {
      console.error('Failed to submit/update referral lead', err);
      message.error(err?.response?.data?.message || `Failed to ${leadId ? 'update' : 'submit'} referral lead.`);
    } finally {
      setSubmitting(false);
    }
  };

  const items = [
    {
      key: 'client',
      label: 'Client Info',
    },
    {
      key: 'property',
      label: 'Property Requirements',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: THEME.bgPage, minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: THEME.textDark, margin: 0 }}>
            {leadId ? 'Edit Referral' : 'Submit a New Referral'}
          </h1>
          <p style={{ color: THEME.textMuted, fontSize: '14px', marginTop: '6px', margin: 0 }}>
            {leadId ? 'Update the referral details below.' : 'Fill in the details below to refer a client.'}
          </p>
        </div>

        <Card
          bordered={false}
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)', border: '1px solid #E2E8F0' }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              preserve={true}
              initialValues={{
                countryCode: '+971',
                transactionType: 'buy',
                furnished: 'any',
              }}
            >
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />

              <div style={{ padding: '24px 0' }}>
              {activeTab === 'client' && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[{ required: true, message: 'First name is required' }]}
                      >
                        <Input placeholder="John" prefix={<UserOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[{ required: true, message: 'Last name is required' }]}
                      >
                        <Input placeholder="Doe" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="countryCode"
                        label="Country Code"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Select placeholder="Select Country Code" showSearch optionFilterProp="children">
                          {countryOptions.map((country) => (
                            <Option key={country.isoCode} value={country.code}>
                              {country.name} ({country.code})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={16}>
                      <Form.Item
                        name="phoneNumber"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Phone number is required' }]}
                      >
                        <Input placeholder="501234567" prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    label="Email (Optional)"
                  >
                    <Input placeholder="john@example.com" prefix={<MailOutlined />} />
                  </Form.Item>
                </div>
              )}

              {activeTab === 'property' && (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="transactionType"
                        label="Looking to"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Select placeholder="Select">
                          <Option value="buy">Buy</Option>
                          <Option value="rent">Rent</Option>
                          <Option value="sell">Sell</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="propertyType"
                        label="Property Type"
                        rules={[{ required: true, message: 'Property type is required' }]}
                      >
                        <Select placeholder="Select Property Type">
                          <Option value="Apartment">Apartment</Option>
                          <Option value="Villa">Villa</Option>
                          <Option value="Townhouse">Townhouse</Option>
                          <Option value="Commercial">Commercial</Option>
                          <Option value="Land">Land</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="areaOfInterest"
                    label="Area of Interest"
                  >
                    <Input placeholder="e.g., Dubai Marina, Jumeirah" />
                  </Form.Item>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="budgetMin"
                        label="Budget (Min) - AED"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Minimum budget"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="budgetMax"
                        label="Budget (Max) - AED"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Maximum budget"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="bedrooms"
                        label="Bedrooms"
                      >
                        <Select placeholder="Any">
                          <Option value={0}>Studio</Option>
                          <Option value={1}>1</Option>
                          <Option value={2}>2</Option>
                          <Option value={3}>3</Option>
                          <Option value={4}>4</Option>
                          <Option value={5}>5+</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="bathrooms"
                        label="Bathrooms"
                      >
                        <Select placeholder="Any">
                          <Option value={1}>1</Option>
                          <Option value={2}>2</Option>
                          <Option value={3}>3</Option>
                          <Option value={4}>4+</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="areaMin"
                        label="Area (Min) - Sq Ft"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Minimum area"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="areaMax"
                        label="Area (Max) - Sq Ft"
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Maximum area"
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="furnished"
                    label="Furnished"
                  >
                    <Select placeholder="Any">
                      <Option value="any">Any</Option>
                      <Option value="furnished">Furnished</Option>
                      <Option value="semi">Semi-Furnished</Option>
                      <Option value="unfurnished">Unfurnished</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="readyByDate"
                    label="Ready By Date (Optional)"
                  >
                    <Input placeholder="e.g., Q1 2025" />
                  </Form.Item>

                  <Form.Item
                    name="additionalNotes"
                    label="Additional Notes"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Any other requirements or notes about the client..."
                    />
                  </Form.Item>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={submitting}
                icon={<PlusOutlined />}
                style={{
                  backgroundColor: THEME.primary,
                  borderColor: THEME.primary,
                  borderRadius: '10px',
                  height: '44px',
                  fontWeight: 600,
                  minWidth: '160px',
                }}
              >
                {submitting ? (leadId ? 'Updating...' : 'Submitting...') : (leadId ? 'Update Referral' : 'Submit Referral')}
              </Button>
            </div>
          </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateReferralLead;
