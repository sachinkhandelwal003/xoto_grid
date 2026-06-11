import React, { useState, useEffect } from "react";
import {
  Card, Row, Col, Statistic, Chart, Select, DatePicker, Button,
  Typography, Space, Empty, Spin
} from "antd";
import {
  LineChartOutlined, ArrowUpOutlined, ArrowDownOutlined,
  CalendarOutlined, ReloadOutlined
} from "@ant-design/icons";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend
} from 'recharts';

const { Title, Text } = Typography;

export default function GridOverview() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  // Sample data - Replace with actual API call
  const overviewStats = [
    { label: "Total Leads", value: 1234, change: 12, trend: "up" },
    { label: "Active Listings", value: 567, change: -3, trend: "down" },
    { label: "Conversion Rate", value: "23.5%", change: 5, trend: "up" },
    { label: "Active Users", value: 890, change: 8, trend: "up" }
  ];

  const chartData = [
    { name: "Jan", leads: 400, listings: 240, conversions: 24 },
    { name: "Feb", leads: 300, listings: 139, conversions: 22 },
    { name: "Mar", leads: 200, listings: 980, conversions: 29 },
    { name: "Apr", leads: 278, listings: 390, conversions: 20 },
    { name: "May", leads: 189, listings: 480, conversions: 21 },
    { name: "Jun", leads: 239, listings: 380, conversions: 25 }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={2}>
          <LineChartOutlined /> Grid Overview
        </Title>
        <Text type="secondary">
          Real-time performance metrics and key statistics
        </Text>
      </div>

      {/* Filters */}
      <Card className="mb-6" bordered={false}>
        <Space>
          <DatePicker.RangePicker
            onChange={(dates) => setDateRange(dates)}
            placeholder={["Start Date", "End Date"]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        {overviewStats.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card bordered={false} className="shadow-sm hover:shadow-md transition">
              <Statistic
                title={stat.label}
                value={stat.value}
                prefix={stat.trend === "up" ? <ArrowUpOutlined className="text-green-500" /> : <ArrowDownOutlined className="text-red-500" />}
                valueStyle={{ color: stat.trend === "up" ? "#52c41a" : "#ff4d4f" }}
                suffix={`${stat.trend === "up" ? "+" : ""}${stat.change}%`}
                suffixStyle={{ fontSize: "14px", color: stat.trend === "up" ? "#52c41a" : "#ff4d4f" }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="Leads & Listings Trend" className="shadow-sm">
            <Spin spinning={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#8884d8" />
                  <Line type="monotone" dataKey="listings" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card bordered={false} title="Conversion Rate Trend" className="shadow-sm">
            <Spin spinning={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="conversions" fill="#ffc069" />
                </BarChart>
              </ResponsiveContainer>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
