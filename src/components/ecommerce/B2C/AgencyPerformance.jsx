import React from "react";
import { Card, Row, Col, Typography, Table, Progress } from "antd";
import { Line } from "@ant-design/plots";
import {
  TeamOutlined,
  TrophyOutlined,
  WalletOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AgencyPerformance = () => {
  const agents = [
    { key: 1, name: "Rahul Sharma", leads: 20, deals: 5, revenue: 120000 },
    { key: 2, name: "Priya Desai", leads: 15, deals: 4, revenue: 95000 },
    { key: 3, name: "Amit Kumar", leads: 10, deals: 2, revenue: 60000 },  
  ];

  const totalLeads = agents.reduce((sum, a) => sum + a.leads, 0);
  const totalDeals = agents.reduce((sum, a) => sum + a.deals, 0);
  const totalRevenue = agents.reduce((sum, a) => sum + a.revenue, 0);

  const conversionRate = ((totalDeals / totalLeads) * 100).toFixed(1);

  // Stats Array for easy mapping and consistent UI
  const stats = [
    { 
      title: "Total Leads", 
      value: totalLeads, 
      icon: <TeamOutlined />, 
      color: "#2563eb", // Blue
      bg: "#dbeafe" 
    },
    { 
      title: "Total Deals", 
      value: totalDeals, 
      icon: <TrophyOutlined />, 
      color: "#059669", // Green
      bg: "#d1fae5" 
    },
    { 
      title: "Total Revenue", 
      value: `₹ ${totalRevenue.toLocaleString()}`, 
      icon: <WalletOutlined />, 
      color: "#5c039b", // Purple (Theme color)
      bg: "#f3e8ff" 
    },
    { 
      title: "Conversion Rate", 
      value: `${conversionRate}%`, 
      icon: <LineChartOutlined />, 
      color: "#d97706", // Orange
      bg: "#fef3c7",
      isProgress: true 
    },
  ];

  const chartData = [
    { month: "Jan", revenue: 120000 },
    { month: "Feb", revenue: 180000 },
    { month: "Mar", revenue: 150000 },
    { month: "Apr", revenue: 210000 },
    { month: "May", revenue: 260000 },
    { month: "Jun", revenue: 310000 },
  ];

  const config = {
    data: chartData,
    xField: "month",
    yField: "revenue",
    smooth: true,
    color: "#5c039b", // Matched with theme
    lineWidth: 3,
    point: {
      size: 5,
      shape: "circle",
      style: {
        fill: "#fff",
        stroke: "#5c039b",
        lineWidth: 2,
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: "Revenue", value: `₹ ${datum.revenue.toLocaleString()}` };
      },
    },
  };

  const columns = [
    {
      title: "Agent Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong style={{ color: "#1f2937" }}>{text}</Text>,
    },
    {
      title: "Leads Assigned",
      dataIndex: "leads",
      key: "leads",
    },
    {
      title: "Deals Closed",
      dataIndex: "deals",
      key: "deals",
      render: (text) => <Text strong style={{ color: "#059669" }}>{text}</Text>,
    },
    {
      title: "Generated Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (val) => (
        <Text strong style={{ color: "#5c039b" }}>
          ₹ {val.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Conversion",
      key: "conversion",
      render: (_, record) => {
        const rate = ((record.deals / record.leads) * 100).toFixed(1);
        return (
          <Progress 
            percent={parseFloat(rate)} 
            size="small" 
            strokeColor={rate > 20 ? "#059669" : "#5c039b"} 
          />
        );
      }
    }
  ];

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "32px" }}>
        <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
          Agency Performance
        </Title>
        <Text type="secondary" style={{ fontSize: "15px" }}>
          Track overall agency metrics, revenue trends, and individual agent performance.
        </Text>
      </div>

      {/* STATS SECTION */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: "12px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                height: "100%"
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ 
                  width: "56px", 
                  height: "56px", 
                  borderRadius: "12px", 
                  background: stat.bg, 
                  color: stat.color,
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  {stat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {stat.title}
                  </Text>
                  
                  {stat.isProgress ? (
                    <div style={{ marginTop: "4px" }}>
                      <Progress 
                        percent={parseFloat(conversionRate)} 
                        strokeColor={stat.color} 
                        status="active"
                      />
                    </div>
                  ) : (
                    <Title level={3} style={{ margin: "4px 0 0 0", color: "#1f2937" }}>
                      {stat.value}
                    </Title>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHART & TABLE SECTION */}
      <Row gutter={[24, 24]}>
        {/* Revenue Trend Chart */}
        <Col xs={24} xl={10}>
          <Card 
            bordered={false} 
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Title level={5} style={{ marginBottom: "24px", color: "#374151" }}>Revenue Trend</Title>
            <div style={{ height: "300px" }}>
              <Line {...config} />
            </div>
          </Card>
        </Col>

        {/* Agent Performance Table */}
        <Col xs={24} xl={14}>
          <Card 
            bordered={false} 
            style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%" }}
            bodyStyle={{ padding: "0" }}
          >
            <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
              <Title level={5} style={{ margin: 0, color: "#374151" }}>Agent Performance</Title>
            </div>
            <Table 
              columns={columns} 
              dataSource={agents} 
              pagination={false} 
              style={{ padding: "0 24px 24px 24px" }}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default AgencyPerformance;