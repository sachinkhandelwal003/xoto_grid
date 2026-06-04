import React, { useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Select,
  Divider,
  Space,
  message
} from "antd";
import {
  SettingOutlined,
  GlobalOutlined,
  BankOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const GlobalSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Mock initial data based on FRD
  const initialValues = {
    platformName: "Xoto Grid",
    supportEmail: "support@xoto.ae",
    defaultCurrency: "AED",
    maintenanceMode: false,
    platformFeePercent: 10,
    taxPercent: 5,
    minPayout: 1000,
    smsCreditCost: 0.15,
    whatsappCreditCost: 0.50,
    emailCreditCost: 0.05,
    openAiKey: "sk-proj-xxxxxxxxxxxxxxxxxxxx",
    twilioSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    stripeKey: "sk_live_xxxxxxxxxxxxxxxxxxxx"
  };

  const handleSaveSettings = (values) => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      
      message.success("Global settings updated successfully! Changes are now live.");
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "12px", background: "linear-gradient(135deg, #5c039b 0%, #3b0263 100%)", borderRadius: "12px", color: "white" }}>
            <SettingOutlined style={{ fontSize: "28px" }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
              Global System Settings
            </Title>
            <Text type="secondary" style={{ fontSize: "15px" }}>
              Configure core platform rules, financial fees, marketing pricing, and external integrations.
            </Text>
          </div>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<SaveOutlined />} 
          loading={loading}
          onClick={() => form.submit()}
          style={{ background: "#5c039b", borderColor: "#5c039b", borderRadius: "8px", fontWeight: "bold", boxShadow: "0 4px 10px rgba(92,3,155,0.2)" }}
        >
          Save All Changes
        </Button>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        initialValues={initialValues} 
        onFinish={handleSaveSettings}
        requiredMark={false}
      >
        {/* TABS SECTION */}
        <Card 
          bordered={false} 
          style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          bodyStyle={{ padding: "0" }}
        >
          <Tabs
            defaultActiveKey="1"
            style={{ padding: "0 24px" }}
            items={[
              // TAB 1: GENERAL
              {
                key: "1",
                label: <span style={{ fontSize: "15px", fontWeight: "500" }}><GlobalOutlined /> General & Localization</span>,
                children: (
                  <div style={{ padding: "24px 0" }}>
                    <Row gutter={32}>
                      <Col xs={24} md={12}>
                        <Form.Item name="platformName" label={<Text strong>Platform Name</Text>}>
                          <Input size="large" style={{ borderRadius: "8px" }} />
                        </Form.Item>
                        <Form.Item name="supportEmail" label={<Text strong>Global Support Email</Text>}>
                          <Input size="large" style={{ borderRadius: "8px" }} />
                        </Form.Item>
                        <Form.Item name="defaultCurrency" label={<Text strong>Default Platform Currency</Text>}>
                          <Select size="large" style={{ borderRadius: "8px" }}>
                            <Option value="AED">AED - UAE Dirham</Option>
                            <Option value="INR">INR - Indian Rupee</Option>
                            <Option value="USD">USD - US Dollar</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card style={{ background: "#fffbe6", borderColor: "#ffe58f", borderRadius: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong style={{ fontSize: "16px", color: "#d48806" }}>Maintenance Mode</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: "13px" }}>Turn this on to block all agents and agencies from logging in during system updates.</Text>
                            </div>
                            <Form.Item name="maintenanceMode" valuePropName="checked" style={{ margin: 0 }}>
                              <Switch style={{ background: form.getFieldValue("maintenanceMode") ? "#d48806" : "#d1d5db" }} />
                            </Form.Item>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                )
              },
              
              // TAB 2: FINANCE
              {
                key: "2",
                label: <span style={{ fontSize: "15px", fontWeight: "500" }}><BankOutlined /> Finance & Commissions</span>,
                children: (
                  <div style={{ padding: "24px 0" }}>
                    <Title level={5} style={{ marginBottom: "24px" }}>Commission Rules</Title>
                    <Row gutter={32}>
                      <Col xs={24} md={8}>
                        <Form.Item name="platformFeePercent" label={<Text strong>Default Platform Success Fee (%)</Text>}>
                          <InputNumber size="large" min={0} max={100} style={{ width: "100%", borderRadius: "8px" }} addonAfter="%" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="taxPercent" label={<Text strong>Applicable Tax / VAT (%)</Text>}>
                          <InputNumber size="large" min={0} max={100} style={{ width: "100%", borderRadius: "8px" }} addonAfter="%" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="minPayout" label={<Text strong>Minimum Payout Threshold</Text>}>
                          <InputNumber size="large" min={0} style={{ width: "100%", borderRadius: "8px" }} addonBefore="AED" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider />
                    <Space>
                      <SafetyCertificateOutlined style={{ color: "#059669", fontSize: "20px" }} />
                      <Text type="secondary">Changes to financial rules will only apply to new deals created after saving. Existing deals will use historical rates.</Text>
                    </Space>
                  </div>
                )
              },

              // TAB 3: XOTO BLITZ
              {
                key: "3",
                label: <span style={{ fontSize: "15px", fontWeight: "500" }}><ThunderboltOutlined /> XOTO Blitz Pricing</span>,
                children: (
                  <div style={{ padding: "24px 0" }}>
                    <Title level={5} style={{ marginBottom: "8px" }}>Credit Consumption Rates</Title>
                    <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>Set the cost (in currency) deducted from an agency's wallet per message sent.</Text>
                    <Row gutter={32}>
                      <Col xs={24} md={8}>
                        <Form.Item name="whatsappCreditCost" label={<Text strong>WhatsApp Message Cost</Text>}>
                          <InputNumber size="large" step={0.01} style={{ width: "100%", borderRadius: "8px" }} addonBefore="AED" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="smsCreditCost" label={<Text strong>Standard SMS Cost</Text>}>
                          <InputNumber size="large" step={0.01} style={{ width: "100%", borderRadius: "8px" }} addonBefore="AED" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name="emailCreditCost" label={<Text strong>Email Campaign Cost</Text>}>
                          <InputNumber size="large" step={0.01} style={{ width: "100%", borderRadius: "8px" }} addonBefore="AED" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )
              },

              // TAB 4: INTEGRATIONS (API KEYS)
              {
                key: "4",
                label: <span style={{ fontSize: "15px", fontWeight: "500" }}><ApiOutlined /> Integrations & Secrets</span>,
                children: (
                  <div style={{ padding: "24px 0" }}>
                    <Title level={5} style={{ marginBottom: "8px" }}>Third-Party API Keys</Title>
                    <Text type="secondary" style={{ display: "block", marginBottom: "24px", color: "#ef4444" }}>Warning: Changing these keys will directly affect platform functionality. Keep them secure.</Text>
                    <Row gutter={32}>
                      <Col xs={24} md={12}>
                        <Form.Item name="openAiKey" label={<Text strong>OpenAI API Key (For Xobia AI & Presentations)</Text>}>
                          <Input.Password size="large" style={{ borderRadius: "8px" }} />
                        </Form.Item>
                        <Form.Item name="twilioSid" label={<Text strong>Twilio Account SID (For SMS/WhatsApp)</Text>}>
                          <Input.Password size="large" style={{ borderRadius: "8px" }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="stripeKey" label={<Text strong>Stripe Live Secret Key (For Subscriptions)</Text>}>
                          <Input.Password size="large" style={{ borderRadius: "8px" }} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )
              }
            ]}
          />
        </Card>
      </Form>
    </div>
  );
};

export default GlobalSettings;