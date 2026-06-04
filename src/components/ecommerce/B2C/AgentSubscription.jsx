import React, { useState } from "react";
import {
  Card, Typography, Progress, Button, Tag, Row, Col, Space,
  List, Avatar, Badge, Input, Divider
} from "antd";
import {
  PlayCircleOutlined, CheckCircleFilled, LockOutlined,
  TrophyOutlined, RobotOutlined, SendOutlined,
  FireFilled, StarFilled
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function XotoGridTrainingAgent() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm Xobia AI. Need help with the 'Objection Handling' module?" }
  ]);

  // Simulated Module Data
  const modules = [
    { id: 1, title: "Welcome to XOTO GRID", type: "Video", duration: "5 mins", status: "completed" },
    { id: 2, title: "Mastering the Presentation Generator", type: "Interactive", duration: "15 mins", status: "completed" },
    { id: 3, title: "Handling Price Objections", type: "Video + Quiz", duration: "20 mins", status: "active" },
    { id: 4, title: "Closing the Deal - Level 1", type: "Certification", duration: "30 mins", status: "locked" },
  ];

  const handleChat = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { role: "user", text: chatInput }]);
    setChatInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bot", text: "Based on Module 3, you should highlight the ROI and premium amenities to justify the price to the client." }]);
    }, 1000);
  };

  return (
    <div className="p-6 bg-[#f6f7fb] min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-6">
        <Title level={3} style={{ margin: 0 }}>XOTO Academy & Learning Path</Title>
        <Text type="secondary">Complete modules to earn XP, Badges, and unlock advanced platform tools.</Text>
      </div>

      <Row gutter={24}>
        
        {/* LEFT COLUMN: LEARNING PATH & GAMIFICATION */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={24} style={{ display: "flex", width: "100%" }}>
            
            {/* GAMIFICATION & XP CARD */}
            <Card className="rounded-2xl shadow-sm border-none" style={{ background: "linear-gradient(135deg, #2b0245, #5c039b)", color: "white" }}>
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size={20} align="center">
                    <Avatar size={72} icon={<StarFilled />} style={{ background: "#ffd700", color: "#b8860b", border: "4px solid rgba(255,255,255,0.2)" }} />
                    <div>
                      <Text style={{ color: "#d9b3ff", fontWeight: 600, letterSpacing: 1 }}>CURRENT RANK</Text>
                      <Title level={2} style={{ color: "white", margin: 0 }}>Presentation Pro</Title>
                      <Space className="mt-2">
                        <Tag color="purple" className="border-none bg-white/20 text-white rounded-full">
                          <FireFilled style={{ color: "#ff7a45" }} /> 1,450 XP
                        </Tag>
                        <Tag color="blue" className="border-none bg-white/20 text-white rounded-full">Level 4</Tag>
                      </Space>
                    </div>
                  </Space>
                </Col>
                <Col style={{ width: "250px", textAlign: "right" }}>
                  <Text style={{ color: "white" }}>550 XP to Next Rank: <b>Deal Closer</b></Text>
                  <Progress percent={72} strokeColor="#ffd700" trailColor="rgba(255,255,255,0.2)" showInfo={false} strokeWidth={10} className="mt-2" />
                </Col>
              </Row>
            </Card>

            {/* MODULES LIST */}
            <Card className="rounded-2xl shadow-sm border-none" title="Your Assigned Learning Path">
              <List
                itemLayout="horizontal"
                dataSource={modules}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "16px",
                      background: item.status === "active" ? "#fbf8ff" : "white",
                      border: item.status === "active" ? "1px solid #d9b3ff" : "1px solid #f0f0f0",
                      borderRadius: "12px",
                      marginBottom: "12px",
                      opacity: item.status === "locked" ? 0.6 : 1
                    }}
                    actions={[
                      item.status === "completed" ? (
                        <Tag color="success" icon={<CheckCircleFilled />}>Completed</Tag>
                      ) : item.status === "active" ? (
                        <Button type="primary" style={{ background: "#5c039b" }}>Continue</Button>
                      ) : (
                        <LockOutlined style={{ fontSize: 20, color: "#bfbfbf" }} />
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          size={48} 
                          icon={item.status === "locked" ? <LockOutlined /> : <PlayCircleOutlined />} 
                          style={{ 
                            background: item.status === "completed" ? "#52c41a" : item.status === "active" ? "#5c039b" : "#f5f5f5",
                            color: item.status === "locked" ? "#bfbfbf" : "white"
                          }} 
                        />
                      }
                      title={<Text strong style={{ fontSize: "16px" }}>{item.title}</Text>}
                      description={
                        <Space>
                          <Text type="secondary">{item.type}</Text>
                          <Divider type="vertical" />
                          <Text type="secondary">{item.duration}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

          </Space>
        </Col>

        {/* RIGHT COLUMN: XOBIA AI TUTOR */}
        <Col xs={24} lg={8}>
          <Card 
            className="rounded-2xl shadow-sm border-none h-full flex flex-col"
            bodyStyle={{ padding: 0, display: "flex", flexDirection: "column", height: "100%" }}
            title={
              <Space>
                <Avatar icon={<RobotOutlined />} style={{ background: "#5c039b" }} />
                <span style={{ fontWeight: 600 }}>Xobia AI Tutor</span>
              </Space>
            }
          >
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4" style={{ background: "#fafafa", minHeight: "400px" }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    style={{
                      background: msg.role === "user" ? "#5c039b" : "white",
                      color: msg.role === "user" ? "white" : "black",
                      padding: "12px 16px",
                      borderRadius: msg.role === "user" ? "16px 16px 0 16px" : "16px 16px 16px 0",
                      maxWidth: "85%",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      border: msg.role === "bot" ? "1px solid #f0f0f0" : "none"
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Area */}
            <div className="p-4 border-t bg-white rounded-b-2xl">
              <Space.Compact style={{ width: "100%" }}>
                <Input 
                  size="large"
                  placeholder="Ask a doubt about this module..." 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onPressEnter={handleChat}
                  style={{ borderRadius: "8px 0 0 8px" }}
                />
                <Button 
                  size="large" 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleChat}
                  style={{ background: "#5c039b", borderRadius: "0 8px 8px 0" }}
                />
              </Space.Compact>
              <Text type="secondary" style={{ fontSize: "11px", display: "block", marginTop: "8px", textAlign: "center" }}>
                Xobia AI answers are based on XOTO official training materials.
              </Text>
            </div>
          </Card>
        </Col>

      </Row>
    </div>
  );
}