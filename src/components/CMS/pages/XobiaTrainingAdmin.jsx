import React, { useState } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Space,
  Button,
  Tabs,
  Table,
  Tag,
  Progress,
  List,
  Avatar,
  Tooltip
} from "antd";
import {
  RobotOutlined,
  BookOutlined,
  WarningOutlined,
  PlusOutlined,
  PlaySquareOutlined,
  FileTextOutlined,
  TrophyOutlined,
  BellOutlined,
  EditOutlined,
  BarChartOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const XobiaTrainingAdmin = () => {
  const [activeTab, setActiveTab] = useState("1");

  // --- MOCK DATA FOR STATS ---
  const stats = [
    { title: "Active Learners", value: "1,245", icon: <BookOutlined />, color: "#2563eb", bg: "#dbeafe" },
    { title: "Avg. Completion", value: "68%", icon: <TrophyOutlined />, color: "#059669", bg: "#d1fae5" },
    { title: "Compliance Warnings", value: "32", icon: <WarningOutlined />, color: "#ef4444", bg: "#fee2e2" },
    { title: "Xobia Bot Queries", value: "8,402", icon: <RobotOutlined />, color: "#5c039b", bg: "#f3e8ff" },
  ];

  // --- MOCK DATA FOR COURSE LIBRARY ---
  const courseData = [
    { key: 1, title: "Platform Onboarding 101", role: "All Roles", type: "Mandatory", format: "Video", enrolled: 1200, completion: 85 },
    { key: 2, title: "Advanced Lead Nurturing", role: "Agents", type: "Optional", format: "Interactive", enrolled: 450, completion: 42 },
    { key: 3, title: "Secondary Market Compliance", role: "Brokers", type: "Mandatory", format: "PDF + Quiz", enrolled: 310, completion: 92 },
    { key: 4, title: "Using XOTO Blitz Effectively", role: "Agencies", type: "Optional", format: "Video", enrolled: 150, completion: 60 },
  ];

  const courseColumns = [
    {
      title: "Course Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Space>
          <div style={{ padding: "8px", background: "#f3f4f6", borderRadius: "8px", color: "#4b5563" }}>
            {record.format === "Video" ? <PlaySquareOutlined /> : <FileTextOutlined />}
          </div>
          <Text strong style={{ color: "#1f2937", fontSize: "14px" }}>{text}</Text>
        </Space>
      )
    },
    { title: "Target Role", dataIndex: "role", key: "role", render: (text) => <Text type="secondary">{text}</Text> },
    {
      title: "Requirement",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "Mandatory" ? "red" : "default"} style={{ borderRadius: "10px", padding: "2px 10px" }}>
          {type}
        </Tag>
      )
    },
    {
      title: "Progress Status",
      key: "progress",
      width: "25%",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
            <Text type="secondary">{record.enrolled} Enrolled</Text>
            <Text strong style={{ color: "#5c039b" }}>{record.completion}%</Text>
          </div>
          <Progress percent={record.completion} strokeColor="#5c039b" showInfo={false} size="small" />
        </div>
      )
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: () => (
        <Button type="text" icon={<EditOutlined style={{ color: "#5c039b" }} />}>Edit</Button>
      )
    }
  ];

  // --- MOCK DATA FOR COMPLIANCE (AGENTS FAILING MANDATORY TRAINING) ---
  const complianceData = [
    { key: 1, agent: "Rahul Sharma", agency: "Apex Realtors", missingModule: "Platform Onboarding 101", daysOverdue: 14 },
    { key: 2, agent: "Amit Jain", agency: "Global Homes", missingModule: "Secondary Market Compliance", daysOverdue: 7 },
    { key: 3, agent: "Priya Desai", agency: "Urban Nest", missingModule: "RERA Guidelines 2026", daysOverdue: 21 },
  ];

  const complianceColumns = [
    {
      title: "Agent Details",
      key: "agent",
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}>{record.agent.charAt(0)}</Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong>{record.agent}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>{record.agency}</Text>
          </div>
        </Space>
      )
    },
    {
      title: "Missing Mandatory Module",
      dataIndex: "missingModule",
      key: "missingModule",
      render: (text) => <Text strong style={{ color: "#374151" }}>{text}</Text>
    },
    {
      title: "Overdue Status",
      dataIndex: "daysOverdue",
      key: "daysOverdue",
      render: (days) => (
        <Tag color="error" icon={<WarningOutlined />} style={{ borderRadius: "10px", padding: "4px 10px" }}>
          {days} Days Overdue
        </Tag>
      )
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: () => (
        <Button type="primary" danger icon={<BellOutlined />} style={{ borderRadius: "8px" }}>
          Send Warning
        </Button>
      )
    }
  ];

  // --- XOBIA BOT TOP QUERIES ---
  const botQueries = [
    { topic: "How to generate AI presentations?", count: 1240, status: "High Demand" },
    { topic: "Change password / Account locked", count: 850, status: "Resolved via Bot" },
    { topic: "How to assign leads to agents?", count: 620, status: "Needs Tutorial" },
    { topic: "Commission split rules", count: 410, status: "Resolved via Bot" },
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ padding: "12px", background: "linear-gradient(135deg, #5c039b 0%, #3b0263 100%)", borderRadius: "12px", color: "white" }}>
            <RobotOutlined style={{ fontSize: "28px" }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
              Xobia Training & LMS
            </Title>
            <Text type="secondary" style={{ fontSize: "15px" }}>
              Manage learning paths, track compliance, and analyze AI Bot interactions.
            </Text>
          </div>
        </div>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          style={{ background: "#5c039b", borderColor: "#5c039b", borderRadius: "8px", fontWeight: "bold", boxShadow: "0 4px 10px rgba(92,3,155,0.2)" }}
        >
          Create New Course
        </Button>
      </div>

      {/* QUICK STATS */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              bordered={false} 
              style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ 
                  width: "56px", height: "56px", borderRadius: "12px", 
                  background: stat.bg, color: stat.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px"
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
      </Row>

      {/* TABS SECTION */}
      <Card 
        bordered={false} 
        style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        bodyStyle={{ padding: "0" }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: "0 24px" }}
          items={[
            {
              key: "1",
              label: <span style={{ fontSize: "15px", fontWeight: "500" }}><BarChartOutlined /> Overview & Analytics</span>,
              children: (
                <div style={{ padding: "24px 0" }}>
                  <Row gutter={[32, 32]}>
                    <Col xs={24} lg={12}>
                      <Title level={5} style={{ color: "#374151", marginBottom: "20px" }}>Top Xobia AI Bot Queries</Title>
                      <Text type="secondary" style={{ display: "block", marginBottom: "16px" }}>
                        What users are asking the AI Bot the most. Use this to identify training gaps.
                      </Text>
                      <List
                        itemLayout="horizontal"
                        dataSource={botQueries}
                        renderItem={item => (
                          <List.Item
                            actions={[<Tag color={item.status === "Needs Tutorial" ? "warning" : "purple"} style={{ borderRadius: "10px" }}>{item.status}</Tag>]}
                            style={{ padding: "16px 0", borderBottom: "1px solid #f3f4f6" }}
                          >
                            <List.Item.Meta
                              avatar={<Avatar icon={<RobotOutlined />} style={{ backgroundColor: "#f3e8ff", color: "#5c039b" }} />}
                              title={<Text strong style={{ color: "#1f2937" }}>"{item.topic}"</Text>}
                              description={<Text type="secondary">{item.count} queries this month</Text>}
                            />
                          </List.Item>
                        )}
                      />
                    </Col>
                    <Col xs={24} lg={12}>
                      <div style={{ background: "#f8f9fa", padding: "24px", borderRadius: "12px", border: "1px dashed #d1d5db" }}>
                        <Title level={5} style={{ color: "#374151", marginBottom: "8px" }}>AI Training Recommendation</Title>
                        <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>
                          Based on platform usage and bot queries, Xobia suggests creating these modules:
                        </Text>
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                          <Card size="small" style={{ borderRadius: "8px", borderLeft: "4px solid #f59e0b" }}>
                            <Text strong>Tutorial: Mastering the Lead Kanban Board</Text>
                            <div style={{ marginTop: "4px" }}><Text type="secondary" style={{ fontSize: "12px" }}>High demand detected from 400+ agents.</Text></div>
                          </Card>
                          <Card size="small" style={{ borderRadius: "8px", borderLeft: "4px solid #5c039b" }}>
                            <Text strong>Guide: Using WhatsApp Credits in Blitz</Text>
                            <div style={{ marginTop: "4px" }}><Text type="secondary" style={{ fontSize: "12px" }}>Frequent queries from Agency Managers.</Text></div>
                          </Card>
                        </Space>
                      </div>
                    </Col>
                  </Row>
                </div>
              )
            },
            {
              key: "2",
              label: <span style={{ fontSize: "15px", fontWeight: "500" }}><BookOutlined /> Course Library</span>,
              children: (
                <div style={{ padding: "24px 0" }}>
                  <Table 
                    columns={courseColumns} 
                    dataSource={courseData} 
                    pagination={false} 
                  />
                </div>
              )
            },
            {
              key: "3",
              label: <span style={{ fontSize: "15px", fontWeight: "500", color: "#ef4444" }}><WarningOutlined /> Compliance Tracker</span>,
              children: (
                <div style={{ padding: "24px 0" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <Text type="secondary">Agents listed below have exceeded the deadline to complete mandatory compliance training.</Text>
                  </div>
                  <Table 
                    columns={complianceColumns} 
                    dataSource={complianceData} 
                    pagination={false} 
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

    </div>
  );
};

export default XobiaTrainingAdmin;