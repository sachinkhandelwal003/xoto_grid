import React, { useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Divider
} from "antd";
import {
  NotificationOutlined, // ✅ FIX: Changed BullhornOutlined to NotificationOutlined
  WhatsAppOutlined,
  MailOutlined,
  MessageOutlined,
  ThunderboltFilled,
  PlusOutlined,
  RobotOutlined,
  BarChartOutlined,
  WalletOutlined,
  SendOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const XotoBlitzCampaigns = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [aiLoading, setAiLoading] = useState(false);

  // --- MOCK DATA ---
  const creditWallet = {
    total: 50000,
    used: 34500,
    remaining: 15500,
  };

  const stats = [
    // ✅ FIX: Used NotificationOutlined here
    { title: "Active Campaigns", value: "12", icon: <NotificationOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Total Audience Reached", value: "84.2K", icon: <BarChartOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Available Credits", value: creditWallet.remaining.toLocaleString(), icon: <WalletOutlined />, color: "#d97706", bg: "#fef3c7" },
  ];

  const campaigns = [
    { 
      key: 1, 
      name: "Palm Residency Pre-Launch", 
      channel: "WhatsApp", 
      audience: "High-Intent Buyers", 
      sent: 4500, 
      openRate: 68, 
      status: "Active" 
    },
    { 
      key: 2, 
      name: "Cold Leads Re-engagement", 
      channel: "Email", 
      audience: "Inactive > 60 Days", 
      sent: 12000, 
      openRate: 24, 
      status: "Scheduled" 
    },
    { 
      key: 3, 
      name: "Weekend Site Visit Reminder", 
      channel: "SMS", 
      audience: "Scheduled Visits", 
      sent: 350, 
      openRate: 98, 
      status: "Automated" 
    },
    { 
      key: 4, 
      name: "Q1 Price Drop Alert", 
      channel: "WhatsApp", 
      audience: "All Active Leads", 
      sent: 8000, 
      openRate: 72, 
      status: "Completed" 
    },
  ];

  // Helper to render channel icons
  const getChannelIcon = (channel) => {
    switch (channel) {
      case "WhatsApp": return <WhatsAppOutlined style={{ color: "#25D366", fontSize: "16px" }} />;
      case "Email": return <MailOutlined style={{ color: "#ea4335", fontSize: "16px" }} />;
      case "SMS": return <MessageOutlined style={{ color: "#4F46E5", fontSize: "16px" }} />;
      default: return null;
    }
  };

  const columns = [
    {
      title: "Campaign Details",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: "15px", color: "#1f2937" }}>{text}</Text>
          <Space>
            {getChannelIcon(record.channel)}
            <Text type="secondary" style={{ fontSize: "12px" }}>{record.channel} Campaign</Text>
          </Space>
        </Space>
      )
    },
    {
      title: "Target Segment",
      dataIndex: "audience",
      key: "audience",
      render: (text) => <Tag color="purple" style={{ borderRadius: "10px" }}>{text}</Tag>
    },
    {
      title: "Reach & Engagement",
      key: "performance",
      width: "30%",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingRight: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <Text type="secondary">{record.sent.toLocaleString()} Sent</Text>
            <Text strong style={{ color: "#059669" }}>{record.openRate}% Opened</Text>
          </div>
          <Progress percent={record.openRate} strokeColor="#059669" showInfo={false} size="small" />
        </div>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "Active") color = "processing";
        if (status === "Scheduled") color = "warning";
        if (status === "Automated") color = "cyan";
        if (status === "Completed") color = "success";
        return <Tag color={color} style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px" }}>{status}</Tag>;
      }
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: () => (
        <Button type="link" style={{ color: "#5c039b", fontWeight: "500" }}>View Report</Button>
      )
    }
  ];

  // --- AI GENERATE SIMULATION ---
  const handleAIGenerate = () => {
    setAiLoading(true);
    setTimeout(() => {
      form.setFieldsValue({
        messageContent: "Hi [Lead_Name],\n\nGreat news! We have an exclusive pre-launch offer for Palm Residency with a 5% early-bird discount. Would you like me to share the brochure or schedule a quick site visit this weekend?\n\nBest,\n[Agent_Name]\nXoto Real Estate"
      });
      setAiLoading(false);
    }, 1500);
  };

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "12px", background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)", borderRadius: "12px", color: "white" }}>
            <ThunderboltFilled style={{ fontSize: "28px" }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
              XOTO Blitz Marketing
            </Title>
            <Text type="secondary" style={{ fontSize: "15px" }}>
              Launch, automate, and track AI-powered omnichannel campaigns.
            </Text>
          </div>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalOpen(true)}
          style={{ background: "#5c039b", borderColor: "#5c039b", borderRadius: "8px", fontWeight: "bold", boxShadow: "0 4px 10px rgba(92,3,155,0.2)" }}
        >
          Create Campaign
        </Button>
      </div>

      {/* STATS & WALLET ROW */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {/* Quick Stats */}
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%" }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ 
                  width: "56px", height: "56px", borderRadius: "12px", 
                  background: stat.bg, color: stat.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px"
                }}>
                  {stat.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  <Title level={2} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>
                    {stat.value}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}

        {/* Credit Wallet Summary */}
        <Col xs={24} lg={6}>
          <Card 
            bordered={false} 
            style={{ borderRadius: "12px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
               <Text style={{ color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", fontSize: "12px" }}>XOTO Credits Ledger</Text>
               <ThunderboltFilled style={{ color: "#f59e0b", fontSize: "18px" }} />
            </div>
            <Title level={2} style={{ color: "white", margin: 0 }}>
               {creditWallet.remaining.toLocaleString()} <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "normal" }}>Left</span>
            </Title>
            <div style={{ marginTop: "16px" }}>
              <Progress 
                percent={Math.round((creditWallet.used / creditWallet.total) * 100)} 
                strokeColor="#f59e0b" 
                trailColor="rgba(255,255,255,0.2)"
                showInfo={false}
              />
              <Text style={{ color: "#cbd5e1", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {creditWallet.used.toLocaleString()} credits used out of {creditWallet.total.toLocaleString()}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* CAMPAIGNS TABLE */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={5} style={{ margin: 0, color: "#374151" }}>Campaign History & Performance</Title>
        </div>
        <Table 
          columns={columns} 
          dataSource={campaigns} 
          pagination={false} 
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {/* CREATE CAMPAIGN MODAL WITH AI CONTENT GEN */}
      <Modal
        title={
          <Space>
            <ThunderboltFilled style={{ color: "#f59e0b", fontSize: "20px" }} />
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>Launch New Campaign</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>Cancel</Button>,
          <Button key="draft" type="dashed">Save as Draft</Button>,
          <Button key="launch" type="primary" icon={<SendOutlined />} style={{ background: "#5c039b" }}>
            Schedule & Launch
          </Button>
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: "20px" }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="Campaign Name" name="name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Palm Residency Diwali Offer" size="large" style={{ borderRadius: "8px" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Communication Channel" name="channel" rules={[{ required: true }]}>
                <Select size="large" placeholder="Select Channel">
                  <Option value="whatsapp"><WhatsAppOutlined style={{ color: "#25D366" }} /> WhatsApp</Option>
                  <Option value="email"><MailOutlined style={{ color: "#ea4335" }} /> Email</Option>
                  <Option value="sms"><MessageOutlined style={{ color: "#4F46E5" }} /> SMS</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Target Audience Segment" name="audience">
            <Select size="large" placeholder="Select a dynamic segment">
              <Option value="hot_leads">🔥 Hot Leads (Active in last 7 days)</Option>
            
              <Option value="cold_leads">❄️ Cold Leads (No response &gt; 30 days)</Option>
              <Option value="specific_project">🏢 Interested in specific project</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left" plain><Text type="secondary" style={{ fontSize: "12px" }}>CONTENT CREATION</Text></Divider>

          <div style={{ background: "#f3e8ff", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px dashed #c084fc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <Space>
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: "#5c039b" }} size="small" />
                <Text strong style={{ color: "#5c039b" }}>Xobia AI Copywriter</Text>
              </Space>
              <Button 
                size="small" 
                type="primary" 
                style={{ background: "#5c039b", borderRadius: "6px" }}
                onClick={handleAIGenerate}
                loading={aiLoading}
              >
                Auto-Write Message
              </Button>
            </div>
            <Text type="secondary" style={{ fontSize: "13px" }}>Let AI draft a high-converting message based on your project and audience.</Text>
          </div>

          <Form.Item label="Message Content" name="messageContent" rules={[{ required: true }]}>
            <TextArea 
              rows={6} 
              placeholder="Type your message here, or use the Xobia AI Copywriter above..." 
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: "12px" }}>Use variables like <Text code>[Lead_Name]</Text> or <Text code>[Agent_Name]</Text> for personalization.</Text>

        </Form>
      </Modal>

    </div>
  );
};

export default XotoBlitzCampaigns;