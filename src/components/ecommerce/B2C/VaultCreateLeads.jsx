import React, { useState } from 'react';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import {
  Form, Input, Button, Card, Row, Col, Typography,
  message, Space, Modal, Alert, Select, Divider
} from 'antd';
import {
  UserOutlined, MailOutlined, SaveOutlined,
  CheckOutlined, EyeOutlined, BankOutlined
} from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BRAND_PURPLE = '#5C039B';

/* ─────────────────────────────── CONSTANTS ─────────────────────────────── */

const UAE_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

/* ─────────────────────────────── MAIN COMPONENT ─────────────────────────────── */

const VaultCreateLeads = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);

  const handlePreview = async () => {
    try {
      // ✅ PRD Compliant: Only validate Name and Mobile Number
      const values = await form.validateFields(['fullName', 'mobileNumber']);
      const allValues = form.getFieldsValue(true);
      setFormValues(allValues);
      setConfirmModalVisible(true);
    } catch (err) {
      message.error("Customer Name and Mobile Number are required");
    }
  };

  const handleSubmit = async () => {
    if (!formValues) return;
    
    setLoading(true);
    try {
      const payload = {
        customerInfo: {
          fullName: formValues.fullName,
          email: formValues.email || null,
          mobileNumber: formValues.mobileNumber,
        },
        propertyDetails: formValues.city ? {
          propertyAddress: {
            city: formValues.city || null,
            area: formValues.area || null,
          }
        } : {},
        referralType: 'Referral Only', // Defaulted safely since UI is removed
        notesToXoto: formValues.notesToXoto || null,
      };
      
      await apiService.post('/vault/lead/create', payload);
      message.success('Lead created successfully!');
      form.resetFields();
      setConfirmModalVisible(false);
      setFormValues(null);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) => value || 'N/A';

  const renderConfirmModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckOutlined style={{ color: BRAND_PURPLE, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b' }}>Confirm Lead Submission</span>
        </div>
      }
      open={confirmModalVisible}
      onCancel={() => { setConfirmModalVisible(false); setFormValues(null); }}
      width={600}
      footer={[
        <Button key="cancel" onClick={() => { setConfirmModalVisible(false); setFormValues(null); }} style={{ borderRadius: 8 }}>
          Edit Details
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          style={{ background: BRAND_PURPLE, borderColor: BRAND_PURPLE, borderRadius: 8 }}
          icon={<SaveOutlined />}
        >
          Confirm & Submit Lead
        </Button>
      ]}
    >
      {formValues && (
        <div>
          <Alert
            message="Review Lead Details"
            description="Once submitted, the lead will be queued for assignment to an advisor."
            type="info"
            showIcon
            style={{ marginBottom: 20, borderRadius: 12 }}
          />
          
          <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12 }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Full Name</Text>
                <div><Text strong>{formatValue(formValues.fullName)}</Text></div>
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Mobile Number</Text>
                <div><Text strong>+{formatValue(formValues.mobileNumber)}</Text></div>
              </Col>
              <Col xs={24} md={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Email</Text>
                <div><Text strong>{formatValue(formValues.email)}</Text></div>
              </Col>
              
              {(formValues.city || formValues.area) && (
                <Col xs={24} md={12}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Location</Text>
                  <div><Text strong>{formatValue(formValues.city)} {formValues.area ? `, ${formValues.area}` : ''}</Text></div>
                </Col>
              )}
              
              {formValues.notesToXoto && (
                <Col span={24}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Notes</Text>
                  <div><Text>{formValues.notesToXoto}</Text></div>
                </Col>
              )}
            </Row>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          {/* <BankOutlined style={{ fontSize: 40, color: BRAND_PURPLE, marginBottom: 8 }} /> */}
          <Title level={3} style={{ margin: 0, color: '#1f2937' }}>Create New Lead</Title>
          <Text type="secondary">Submit a mortgage referral in seconds</Text>
        </div>

        <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handlePreview}
          >
            {/* Customer Info */}
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ color: BRAND_PURPLE, marginBottom: 16 }}>
                <UserOutlined /> Customer Information
              </Title>
              
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="fullName" 
                    label="Full Name" 
                    rules={[{ required: true, message: 'Customer name is required' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="e.g. Ahmed Al Mansouri" 
                      style={{ borderRadius: 8 }}
                      prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item 
                    name="mobileNumber" 
                    label="Mobile Number" 
                    rules={[{ required: true, message: 'Mobile number is required' }]}
                  >
                    <PhoneInput
                      country="ae"
                      preferredCountries={['ae', 'sa', 'in', 'pk', 'gb', 'us']}
                      enableSearch
                      placeholder="Enter mobile number"
                      inputStyle={{ width: '100%', height: 40, borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item 
                    name="email" 
                    label="Email Address (Optional)"
                    rules={[{ type: 'email', message: 'Valid email required' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="customer@example.com" 
                      style={{ borderRadius: 8 }}
                      prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Location & Notes Info - Merged for better flow */}
            <div style={{ marginBottom: 16 }}>
              <Title level={5} style={{ color: BRAND_PURPLE, marginBottom: 16 }}>
                <BankOutlined /> Location & Additional Details (Optional)
              </Title>
              
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="city" label="City">
                    <Select size="large" placeholder="Select city" style={{ borderRadius: 8 }} allowClear>
                      {UAE_CITIES.map(city => <Option key={city} value={city}>{city}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="area" label="Area / Community">
                    <Input size="large" placeholder="e.g. Downtown Dubai" style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="notesToXoto" label="Notes">
                    <TextArea rows={3} placeholder="Any additional information..." style={{ borderRadius: 8 }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Action Buttons */}
            <Divider style={{ margin: '16px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <Button size="large" onClick={() => form.resetFields()} style={{ borderRadius: 8 }}>
                Reset
              </Button>
              <Button
                type="primary" 
                htmlType="submit" 
                size="large" 
                icon={<EyeOutlined />}
                style={{ background: BRAND_PURPLE, borderColor: BRAND_PURPLE, borderRadius: 8, minWidth: 140 }}
              >
                Preview & Submit
              </Button>
            </div>
          </Form>
        </Card>

        {/* Info Note */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CheckOutlined style={{ color: BRAND_PURPLE }} /> Only Name and Mobile Number are required. 
            Other details can be added later by the assigned advisor.
          </Text>
        </div>

        {renderConfirmModal()}
      </div>
    </div>
  );
};

export default VaultCreateLeads;