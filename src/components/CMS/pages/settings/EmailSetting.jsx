import React, { useState, useEffect } from 'react';
import { 
  Tabs, Card, Form, Input, Button, Switch, 
  Row, Col, Typography, Divider, Spin, Alert, Space 
} from 'antd';
import { 
  MailOutlined, 
  LockOutlined, 
  GlobalOutlined, 
  SendOutlined, 
  SaveOutlined, 
  SafetyCertificateOutlined,
  SettingOutlined,UserOutlined 
} from '@ant-design/icons';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showErrorAlert } from '../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;

const PURPLE_THEME = {
  primary: '#722ed1',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  light: '#f8fafc'
};

const EmailSetting = () => {
  const [form] = Form.useForm();
  const [testForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // --- API CALLS ---

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiService.get('otp/email-setting');
      if (res.success && res.data) {
        form.setFieldsValue(res.data);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      // Don't show error if it's just a 404 for first-time setup
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSettings = async (values) => {
    setSaving(true);
    try {
      const res = await apiService.put('otp/email-setting', values);
      if (res.success) {
        showSuccessAlert('Success', 'SMTP Configuration updated successfully');
        fetchSettings();
      }
    } catch (error) {
      showErrorAlert('Error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (values) => {
    setTesting(true);
    try {
      const res = await apiService.post('otp/test-email', values);
      if (res.success) {
        showSuccessAlert('Email Sent', `Test email successfully sent to ${values.toEmail}`);
        testForm.resetFields();
      }
    } catch (error) {
      showErrorAlert('SMTP Error', error.response?.data?.error || 'Connection failed. Check your SMTP settings.');
    } finally {
      setTesting(false);
    }
  };

  // --- UI COMPONENTS ---

  const smtpForm = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleUpdateSettings}
      initialValues={{ secure: false, port: 587 }}
    >
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label="SMTP Host"
            name="host"
            rules={[{ required: true, message: 'Please input SMTP host!' }]}
          >
            <Input prefix={<GlobalOutlined />} placeholder="e.g. smtp.gmail.com" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="Port"
            name="port"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input type="number" placeholder="587" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item label="Secure (SSL/TLS)" name="secure" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Auth Username (Email)"
            name="authUser"
            rules={[{ required: true, message: 'Username is required!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="your-email@example.com" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Auth Password"
            name="authPass"
            help="Leave blank to keep current password"
          >
            <Input.Password prefix={<LockOutlined />} placeholder="SMTP Password" />
          </Form.Item>
        </Col>

        <Divider orientation="left">Sender Information</Divider>

        <Col xs={24} md={12}>
          <Form.Item
            label="From Name"
            name="fromName"
            rules={[{ required: true, message: 'Sender name is required!' }]}
          >
            <Input placeholder="e.g. Xoto Support" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="From Email"
            name="fromEmail"
            rules={[{ required: true, type: 'email', message: 'Valid email required!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="noreply@xoto.ae" />
          </Form.Item>
        </Col>
      </Row>

      <div className="mt-4">
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={<SaveOutlined />} 
          loading={saving}
          style={{ background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary }}
        >
          Save Configuration
        </Button>
      </div>
    </Form>
  );

  const testEmailForm = (
    <div style={{ maxWidth: 600 }}>
      <Alert
        message="Test Connection"
        description="Verify your SMTP settings by sending a test message to a recipient."
        type="info"
        showIcon
        className="mb-6"
      />
      <Form form={testForm} layout="vertical" onFinish={handleSendTestEmail}>
        <Form.Item
          label="Recipient Email Address"
          name="toEmail"
          rules={[{ required: true, type: 'email', message: 'Please input a valid recipient email!' }]}
        >
          <Input 
            size="large" 
            prefix={<MailOutlined />} 
            placeholder="enter recipient email..." 
          />
        </Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={<SendOutlined />} 
          loading={testing}
          style={{ background: PURPLE_THEME.success, border: 'none' }}
        >
          Send Test Email
        </Button>
      </Form>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={3}><MailOutlined /> Email Settings</Title>
        <Paragraph type="secondary">
          Configure the SMTP server details used by the system to send automated emails and notifications.
        </Paragraph>
      </div>

      <Card className="shadow-sm rounded-xl overflow-hidden">
        <Spin spinning={loading}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: '1',
                label: <span><SettingOutlined /> SMTP Configuration</span>,
                children: <div className="p-4">{smtpForm}</div>,
              },
              {
                key: '2',
                label: <span><SendOutlined /> Test Connectivity</span>,
                children: <div className="p-4">{testEmailForm}</div>,
              },
            ]}
          />
        </Spin>
      </Card>

      <div className="mt-8">
        <Card className="bg-gray-50 border-dashed">
          <Row align="middle" gutter={16}>
            <Col>
              <SafetyCertificateOutlined style={{ fontSize: 32, color: PURPLE_THEME.primary }} />
            </Col>
            <Col>
              <Text strong className="block">Security Note</Text>
              <Text type="secondary" className="text-xs">
                Connections are handled via NodeMailer. For Gmail, ensure "App Passwords" are used instead of your primary account password.
              </Text>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default EmailSetting;