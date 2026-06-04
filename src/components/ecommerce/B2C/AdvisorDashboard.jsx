// src/components/ecommerce/B2C/AdvisorDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Row, Col, Typography, Avatar, Button, Table, Tag,
  Space, Badge, Spin, message, Progress, Tooltip, Alert, Segmented
} from "antd";
import {
  UserOutlined, TeamOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ArrowRightOutlined, PlusOutlined,
  EyeOutlined, DollarOutlined, WarningOutlined,
  PhoneOutlined, FileTextOutlined, RocketOutlined,
  DownloadOutlined, ReloadOutlined, BarChartOutlined,
  LineChartOutlined, PieChartOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import dayjs from "dayjs";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell
} from "recharts";

const { Title, Text } = Typography;

const P = "#5C039B";
const PM = "#7C3AED";
const GN = "#22C55E";
const BL = "#3B82F6";
const AMB = "#F59E0B";
const RD = "#EF4444";

const StatCard = ({ icon, label, value, color, suffix, tooltip, loading }) => (
  <Card bordered={false} style={{ borderRadius: 18, border: "1px solid #f0e8ff", height: "100%" }} bodyStyle={{ padding: "18px 20px" }} hoverable>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {loading ? <Spin size="small" /> : React.cloneElement(icon, { style: { fontSize: 24, color } })}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1a0533", lineHeight: 1.2 }}>
          {loading ? "..." : (typeof value === 'number' ? value.toLocaleString() : value || "—")}
          {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: "#9b8ab0", marginLeft: 4 }}>{suffix}</span>}
        </div>
        <div style={{ fontSize: 12, color: "#9b8ab0", marginTop: 2, fontWeight: 500 }}>{label}</div>
        {tooltip && <div style={{ fontSize: 10, color: "#c4b5e0", marginTop: 2 }}>{tooltip}</div>}
      </div>
    </div>
  </Card>
);

// Status Color Mapping
const getStatusColor = (status) => {
  const colors = {
    "New": "blue",
    "Assigned": "purple",
    "Contacted": "orange",
    "Qualified": "geekblue",
    "Collecting Documents": "cyan",
    "Documents Complete": "green",
    "Application Opened": "volcano",
    "Not Proceeding": "red",
    "Disbursed": "success"
  };
  return colors[status] || "default";
};

// SLA Status Display
const getSLADisplay = (slaStatus) => {
  switch(slaStatus) {
    case 'breached':
      return { color: RD, text: 'SLA Breached', icon: <WarningOutlined /> };
    case 'approaching':
      return { color: AMB, text: 'SLA Approaching', icon: <ClockCircleOutlined /> };
    default:
      return { color: GN, text: 'On Track', icon: <CheckCircleOutlined /> };
  }
};

// Custom Tooltip for Charts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "white", padding: "12px 16px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: `1px solid ${P}20` }}>
        <p style={{ margin: 0, fontWeight: 600, color: "#1a0533" }}>{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ margin: "4px 0 0", color: item.color, fontSize: 13 }}>
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState("month");
  const [chartType, setChartType] = useState("line");

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await apiService.get(`/vault/statistics/advisor/stats?range=${timeFilter}`);
      
      if (response?.data?.success) {
        setStats(response.data);
      } else if (response?.data) {
        setStats(response.data);
      } else {
        message.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      message.error(error?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 120000);
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  const advisorInfo = stats?.data?.advisorInfo || stats?.advisorInfo || {};
  const workload = stats?.data?.workload || stats?.workload || {};
  const leadsData = stats?.data?.leads || stats?.leads || {};
  const casesData = stats?.data?.cases || stats?.cases || {};
  const slaMetrics = stats?.data?.slaMetrics || stats?.slaMetrics || {};
  const quickActions = stats?.data?.quickActions || stats?.quickActions || {};
  const graphs = stats?.data?.graphs || stats?.graphs || {};

  // Prepare chart data
  const leadsOverTimeData = graphs.leadsOverTime?.map(item => ({
    date: dayjs(item.date).format("DD MMM"),
    fullDate: item.date,
    count: item.count
  })) || [];

  const slaTrendData = graphs.slaTrend?.map(item => ({
    date: dayjs(item.date).format("DD MMM"),
    fullDate: item.date,
    Breached: item.breached,
    Compliant: item.compliant
  })) || [];

  const caseProgressionData = graphs.caseProgression?.filter(item => item.count > 0) || [];
  
  // Prepare pie chart data for lead status
  const leadStatusData = Object.entries(leadsData.byStatus || {})
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));

  const leadColumns = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1a0533" }}>{record.customerName || "—"}</div>
          {record.propertyValue && (
            <div style={{ fontSize: 11, color: "#9b8ab0", marginTop: 2 }}>
              AED {record.propertyValue.toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => {
        const color = getStatusColor(status);
        return <Tag color={color} style={{ borderRadius: 20, fontWeight: 500 }}>{status}</Tag>;
      },
    },
    {
      title: "SLA Status",
      key: "sla",
      width: 130,
      render: (_, record) => {
        const slaDisplay = getSLADisplay(record.slaStatus);
        return (
          <Tooltip title={`Assigned: ${record.timeSinceAssignment || 'N/A'}`}>
            <Space size={4}>
              <span style={{ color: slaDisplay.color }}>{slaDisplay.icon}</span>
              <span style={{ fontSize: 12, color: slaDisplay.color }}>{slaDisplay.text}</span>
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: "Documents",
      key: "docs",
      width: 100,
      render: (_, record) => (
        record.hasUploadedDocs ? (
          <Tag color="green" style={{ borderRadius: 20 }}>✅ Uploaded</Tag>
        ) : (
          <Tag color="default" style={{ borderRadius: 20 }}>📄 Pending</Tag>
        )
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "created",
      width: 110,
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/vault/lead/${record._id}`)} style={{ color: P }}>
          View
        </Button>
      ),
    },
  ];

  if (loading && !stats) {
    return (
      <div style={{ background: "#f9f6ff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f9f6ff", minHeight: "100vh", padding: "32px 28px" }}>
      <style>{`
        .vpp .ant-table-thead > tr > th { background: #faf8ff !important; color: ${P} !important; font-weight: 600 !important; }
        .vpp .ant-table-tbody > tr:hover > td { background: #f5f0ff !important; }
        .sla-warning { animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
      
      <div className="vpp">
        {/* Hero Section */}
        <Card bordered={false} style={{ borderRadius: 24, overflow: "hidden", marginBottom: 28, boxShadow: "0 8px 24px rgba(92,3,155,0.08)", border: "1px solid #ede4ff" }} bodyStyle={{ padding: 0 }}>
          <div style={{ height: 120, background: `linear-gradient(135deg, ${P}, ${PM})` }} />
          <div style={{ background: "#fff", padding: "0 32px 28px", marginTop: -48 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
              <Badge dot status={workload.isOverloaded ? "warning" : "success"} offset={[-8, 88]}>
                <Avatar size={112} src={advisorInfo.profilePic} icon={<UserOutlined />} style={{ background: "#f5f3ff", color: P, border: "4px solid #fff", boxShadow: "0 6px 16px rgba(92,3,155,0.12)" }} />
              </Badge>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <Title level={2} style={{ margin: 0, color: "#1a0533", fontWeight: 800 }}>{advisorInfo.name || "Advisor"}</Title>
                <Text type="secondary" style={{ fontSize: 15 }}>{advisorInfo.designation || "Mortgage Advisor"} • {advisorInfo.department || "Mortgage Advisory"}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color="purple" style={{ borderRadius: 20 }}>
                    📊 Workload: {workload.currentLeads || 0}/{workload.maxCapacity || 100} ({workload.capacityUtilization || 0}%)
                  </Tag>
                  {workload.isOverloaded && <Tag color="red" style={{ borderRadius: 20, marginLeft: 8 }}>⚠️ Overloaded</Tag>}
                </div>
              </div>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchDashboardStats} loading={refreshing} style={{ borderRadius: 30 }}>
                  Refresh
                </Button>
              </Space>
            </div>
          </div>
        </Card>

        {/* SLA Alert Banner */}
        {slaMetrics.complianceRate < 85 && slaMetrics.breached > 0 && (
          <Alert
            message={
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <WarningOutlined style={{ fontSize: 18, color: RD }} />
                <span>
                  <strong>SLA Compliance Alert</strong> — Your compliance rate is {slaMetrics.complianceRate}% (Target: 85%)
                </span>
              </div>
            }
            description={`${slaMetrics.breached} lead(s) have breached the ${slaMetrics.targetHours}-hour SLA. Average response time: ${slaMetrics.averageResponseTimeHours} hours.`}
            type="error"
            showIcon={false}
            style={{ marginBottom: 24, borderRadius: 16, border: `1px solid #FECACA`, background: "#FEF2F2" }}
            action={
              <Button size="small" danger onClick={() => navigate("/advisor/list?filter=breached")}>
                View Breached
              </Button>
            }
          />
        )}

        {/* Stats Row */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard icon={<TeamOutlined />} label="Total Leads" value={leadsData.total} color={P} loading={loading} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard icon={<CheckCircleOutlined />} label="Converted" value={leadsData.converted} color={GN} loading={loading} tooltip="Disbursed leads" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard icon={<ClockCircleOutlined />} label="Contacted" value={leadsData.contacted} color={AMB} loading={loading} />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard icon={<DollarOutlined />} label="Qualified" value={leadsData.qualified} color={BL} loading={loading} />
          </Col>
        </Row>

        {/* Graphs Section */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          {/* Leads Over Time Chart */}
          <Col xs={24} lg={12}>
            <Card 
              bordered={false} 
              style={{ borderRadius: 20, border: "1px solid #f0e8ff", height: "100%" }}
              title={
                <Space>
                  <BarChartOutlined style={{ color: P }} />
                  <span style={{ fontWeight: 600, color: P }}>Leads Over Time</span>
                </Space>
              }
              extra={
                <Segmented
                  size="small"
                  value={chartType}
                  onChange={setChartType}
                  options={[
                    { value: 'line', icon: <LineChartOutlined /> },
                    { value: 'bar', icon: <BarChartOutlined /> }
                  ]}
                />
              }
            >
              <ResponsiveContainer width="100%" height={280}>
                {chartType === 'line' ? (
                  <LineChart data={leadsOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ff" />
                    <XAxis dataKey="date" tick={{ fill: "#9b8ab0", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9b8ab0", fontSize: 11 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Line type="monotone" dataKey="count" stroke={P} strokeWidth={3} dot={{ fill: P, r: 4 }} name="Leads" />
                  </LineChart>
                ) : (
                  <BarChart data={leadsOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ff" />
                    <XAxis dataKey="date" tick={{ fill: "#9b8ab0", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9b8ab0", fontSize: 11 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="count" fill={P} radius={[6, 6, 0, 0]} name="Leads" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* SLA Trend Chart */}
          <Col xs={24} lg={12}>
            <Card 
              bordered={false} 
              style={{ borderRadius: 20, border: "1px solid #f0e8ff", height: "100%" }}
              title={
                <Space>
                  <LineChartOutlined style={{ color: P }} />
                  <span style={{ fontWeight: 600, color: P }}>SLA Compliance Trend</span>
                </Space>
              }
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={slaTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ff" />
                  <XAxis dataKey="date" tick={{ fill: "#9b8ab0", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#9b8ab0", fontSize: 11 }} />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="Compliant" stroke={GN} strokeWidth={3} dot={{ fill: GN, r: 4 }} name="Compliant" />
                  <Line type="monotone" dataKey="Breached" stroke={RD} strokeWidth={3} dot={{ fill: RD, r: 4 }} name="Breached" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Additional Charts Row */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          {/* Lead Status Distribution - Pie Chart */}
          {leadStatusData.length > 0 && (
            <Col xs={24} lg={12}>
              <Card 
                bordered={false} 
                style={{ borderRadius: 20, border: "1px solid #f0e8ff", height: "100%" }}
                title={
                  <Space>
                    <PieChartOutlined style={{ color: P }} />
                    <span style={{ fontWeight: 600, color: P }}>Lead Status Distribution</span>
                  </Space>
                }
              >
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={leadStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {leadStatusData.map((entry, index) => {
                        const colors = [P, GN, BL, AMB, RD, "#8B5CF6", "#EC4899"];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <RechartsTooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          {/* Case Progression - Bar Chart */}
          {caseProgressionData.length > 0 && (
            <Col xs={24} lg={12}>
              <Card 
                bordered={false} 
                style={{ borderRadius: 20, border: "1px solid #f0e8ff", height: "100%" }}
                title={
                  <Space>
                    <BarChartOutlined style={{ color: P }} />
                    <span style={{ fontWeight: 600, color: P }}>Case Progression</span>
                  </Space>
                }
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={caseProgressionData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e8ff" />
                    <XAxis type="number" tick={{ fill: "#9b8ab0", fontSize: 11 }} />
                    <YAxis type="category" dataKey="status" tick={{ fill: "#9b8ab0", fontSize: 11 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="count" fill={P} radius={[0, 6, 6, 0]} name="Cases" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}
        </Row>

        {/* Performance Metrics Row */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 18, border: "1px solid #f0e8ff", background: "white" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#9b8ab0", fontWeight: 600, marginBottom: 8 }}>SLA Compliance</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: slaMetrics.complianceRate >= 85 ? GN : RD }}>
                  {slaMetrics.complianceRate || 0}%
                </div>
                <Progress percent={slaMetrics.complianceRate || 0} strokeColor={slaMetrics.complianceRate >= 85 ? GN : RD} showInfo={false} style={{ marginTop: 8 }} />
                <div style={{ fontSize: 11, color: "#9b8ab0", marginTop: 8 }}>Target: 85%</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 18, border: "1px solid #f0e8ff", background: "white" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#9b8ab0", fontWeight: 600, marginBottom: 8 }}>Avg Response Time</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: slaMetrics.averageResponseTimeHours <= 4 ? GN : slaMetrics.averageResponseTimeHours <= 8 ? AMB : RD }}>
                  {slaMetrics.averageResponseTimeHours || 0}h
                </div>
                <div style={{ fontSize: 11, color: "#9b8ab0", marginTop: 8 }}>Target: 4 hours</div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 18, border: "1px solid #f0e8ff", background: "white" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#9b8ab0", fontWeight: 600, marginBottom: 8 }}>Conversion Rate</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: BL }}>
                  {leadsData?.funnel?.overallConversionRate || 0}%
                </div>
                <div style={{ fontSize: 11, color: "#9b8ab0", marginTop: 8 }}>
                  {leadsData.converted || 0} / {leadsData.total || 0} leads
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 18, border: "1px solid #f0e8ff", background: "white" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#9b8ab0", fontWeight: 600, marginBottom: 8 }}>Active Cases</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: BL }}>{casesData.active || 0}</div>
                <div style={{ fontSize: 11, color: "#9b8ab0", marginTop: 8 }}>
                  Completed: {casesData.completed || 0}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row gutter={[18, 18]} style={{ marginBottom: 28 }}>
          <Col xs={24}>
            <Card bordered={false} style={{ borderRadius: 20, background: `linear-gradient(135deg, ${P}08, white)`, border: `1px solid ${P}20` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: P }}>Quick Actions</Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>Take action on pending items</Text>
                </div>
                <Space size={12}>
                  {quickActions.needsContact > 0 && (
                    <Button icon={<PhoneOutlined />} onClick={() => navigate("/advisor/list?filter=needsContact")} style={{ borderRadius: 30, borderColor: AMB, color: AMB }}>
                      Call {quickActions.needsContact} Leads
                    </Button>
                  )}
                  {quickActions.needsUpdate > 0 && (
                    <Button icon={<FileTextOutlined />} onClick={() => navigate("/advisor/list?filter=needsUpdate")} style={{ borderRadius: 30, borderColor: BL, color: BL }}>
                      Update {quickActions.needsUpdate} Leads
                    </Button>
                  )}
                  {quickActions.canCreateApplication > 0 && (
                    <Button type="primary" icon={<RocketOutlined />} onClick={() => navigate("/advisor/list?filter=canCreateApp")} style={{ background: P, borderColor: P, borderRadius: 30 }}>
                      Create {quickActions.canCreateApplication} Applications
                    </Button>
                  )}
                </Space>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Leads Table */}
        <Card 
          bordered={false} 
          style={{ borderRadius: 20, boxShadow: "0 4px 20px rgba(92,3,155,0.06)", border: "1px solid #f0e8ff", overflow: "hidden" }} 
          bodyStyle={{ padding: "24px" }} 
          title={
            <span style={{ fontSize: 16, fontWeight: 700, color: P }}>Recent Leads</span>
          } 
          extra={
            <Space>
              <Button type="link" onClick={() => navigate("/advisor/list")} style={{ color: P }}>
                View All <ArrowRightOutlined />
              </Button>
              <Button type="link" icon={<DownloadOutlined />} style={{ color: P }} onClick={() => message.info("Export feature coming soon")}>
                Export
              </Button>
            </Space>
          }
        >
          <Table 
            columns={leadColumns} 
            dataSource={leadsData.recent || []} 
            rowKey="_id" 
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} leads` }}
            size="middle"
          />
        </Card>

        {/* Lead Funnel Summary */}
        {leadsData.funnel && (
          <Card bordered={false} style={{ borderRadius: 20, marginTop: 28, border: "1px solid #f0e8ff" }}>
            <Title level={5} style={{ color: P, marginBottom: 16 }}>Lead Funnel Analysis</Title>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#9b8ab0" }}>Contact Rate</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: AMB }}>{leadsData.funnel.contactRate || 0}%</div>
                  <Progress percent={leadsData.funnel.contactRate || 0} strokeColor={AMB} showInfo={false} size="small" />
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#9b8ab0" }}>Qualification Rate</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: BL }}>{leadsData.funnel.qualificationRate || 0}%</div>
                  <Progress percent={leadsData.funnel.qualificationRate || 0} strokeColor={BL} showInfo={false} size="small" />
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#9b8ab0" }}>Conversion Rate</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: GN }}>{leadsData.funnel.conversionRate || 0}%</div>
                  <Progress percent={leadsData.funnel.conversionRate || 0} strokeColor={GN} showInfo={false} size="small" />
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#9b8ab0" }}>Overall Conversion</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: P }}>{leadsData.funnel.overallConversionRate || 0}%</div>
                  <Progress percent={leadsData.funnel.overallConversionRate || 0} strokeColor={P} showInfo={false} size="small" />
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvisorDashboard;