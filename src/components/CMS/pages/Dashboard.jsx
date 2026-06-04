import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  TeamOutlined, 
  EnvironmentOutlined, 
  ArrowUpOutlined,
  PlusOutlined,
  FileTextOutlined,
  UserAddOutlined,
  SettingOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons';
import { Card, Row, Col, Select, Button, Typography, Tag, Avatar, List, Statistic, Spin, Alert,Space  } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { Option } = Select;

const PURPLE_THEME = {
  primary: '#722ed1',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  info: '#1890ff',
  warning: '#faad14',
  error: '#f5222d'
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/dashboard/view/superadmin');
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // --- Data Transformers for Recharts ---
  
  const getTimelineData = () => {
    if (!dashboardData?.leads?.timeline) return [];
    return dashboardData.leads.timeline.map(item => ({
      name: new Date(item._id).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      total: item.total
    }));
  };

  const getLeadTypePieData = () => {
    if (!dashboardData?.leads?.types) return [];
    const colors = ['#722ed1', '#13c2c2', '#52c41a', '#fadb14', '#fa8c16', '#eb2f96', '#2f54eb'];
    return dashboardData.leads.types.map((item, index) => ({
      name: item._id.replace('_', ' ').toUpperCase(),
      value: item.count,
      color: colors[index % colors.length]
    }));
  };

  const getLeadStatusBarData = () => {
    if (!dashboardData?.leads?.status) return [];
    return dashboardData.leads.status.map(item => ({
      name: item._id.toUpperCase(),
      count: item.count
    }));
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" tip="Loading Stats..." /></div>;
  if (error) return <div className="p-6"><Alert message="Error" description={error} type="error" showIcon /></div>;

  const statsCards = [
    { label: 'Total Leads', value: dashboardData.leads.total, icon: <FileTextOutlined />, color: PURPLE_THEME.primary, bg: PURPLE_THEME.primaryBg },
    { label: 'Active Freelancers', value: dashboardData.users.freelancers, icon: <TeamOutlined />, color: PURPLE_THEME.info, bg: '#e6f7ff' },
    { label: 'Total Properties', value: dashboardData.properties.total, icon: <HomeOutlined />, color: PURPLE_THEME.success, bg: '#f6ffed' },
    { label: 'Verified Developers', value: dashboardData.developers.verified, icon: <CheckCircleOutlined />, color: PURPLE_THEME.warning, bg: '#fff7e6' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
          
        <div>
          <Title level={2} style={{ margin: 0 }}> Dashboard  View</Title>
          <Text type="secondary">Real-time overview of leads, properties, and users.</Text>
        </div>
        <div className="flex gap-3 bg-primary text-white cursor-pointer p-2 rounded-lg shadow-sm"> 
        <button className='cursor-pointer' onClick={() => window.location.href = '/'}>Go To Home</button>
        </div>
        {/* <Space>
          <Button icon={<PlusOutlined />} type="primary" style={{ background: PURPLE_THEME.primary }}>New Property</Button>
          <Button icon={<SettingOutlined />} />
        </Space> */}
      </div>

      {/* STATS ROW */}
      <Row gutter={[16, 16]} className="mb-8">
        {statsCards.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-xl">
              <Statistic 
                title={<Text type="secondary">{stat.label}</Text>}
                value={stat.value}
                prefix={<span className="p-2 rounded-lg mr-2" style={{ backgroundColor: stat.bg, color: stat.color }}>{stat.icon}</span>}
              />
              <div className="mt-2"><Tag color="green"><ArrowUpOutlined /> 12%</Tag> <Text type="secondary" size="small">Growth</Text></div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHARTS SECTION */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Lead Generation Timeline">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={getTimelineData()}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE_THEME.primary} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={PURPLE_THEME.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke={PURPLE_THEME.primary} fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl" title="Leads by Category">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={getLeadTypePieData()} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {getLeadTypePieData().map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* LOWER SECTION */}
      <Row gutter={[16, 16]}>
        {/* User Stats Card */}
        <Col xs={24} md={8}>
          <Card title="User Overview" bordered={false} className="shadow-sm rounded-xl h-full">
            <List itemLayout="horizontal">
              <List.Item extra={<Text strong>{dashboardData.users.freelancers}</Text>}>
                <List.Item.Meta avatar={<Avatar icon={<TeamOutlined />} style={{backgroundColor: '#e6f7ff', color: '#1890ff'}} />} title="Freelancers" />
              </List.Item>
              <List.Item extra={<Text strong style={{color: '#faad14'}}>{dashboardData.users.pendingFreelancers}</Text>}>
                <List.Item.Meta avatar={<Avatar icon={<ClockCircleOutlined />} style={{backgroundColor: '#fff7e6', color: '#faad14'}} />} title="Pending Freelancers" />
              </List.Item>
              <List.Item extra={<Text strong>{dashboardData.users.vendors}</Text>}>
                <List.Item.Meta avatar={<Avatar icon={<DeploymentUnitOutlined />} style={{backgroundColor: '#f9f0ff', color: '#722ed1'}} />} title="Vendors" />
              </List.Item>
            </List>
          </Card>
        </Col>

        {/* Lead Status Bar Chart */}
        <Col xs={24} md={8}>
          <Card title="Lead Type Distribution" bordered={false} className="shadow-sm rounded-xl h-full">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getLeadStatusBarData()} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" fill={PURPLE_THEME.primary} radius={[0, 4, 4, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Property Status Grid */}
        <Col xs={24} md={8}>
          <Card title="Property Inventory" bordered={false} className="shadow-sm rounded-xl h-full">
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card size="small" className="bg-gray-50 text-center">
                  <Statistic title="Available" value={dashboardData.properties.available} valueStyle={{color: PURPLE_THEME.success, fontSize: '18px'}} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="bg-gray-50 text-center">
                  <Statistic title="Featured" value={dashboardData.properties.featured} valueStyle={{color: PURPLE_THEME.info, fontSize: '18px'}} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="bg-gray-50 text-center">
                  <Statistic title="Not Ready" value={dashboardData.properties.notReady} valueStyle={{color: PURPLE_THEME.error, fontSize: '18px'}} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="bg-gray-50 text-center">
                  <Statistic title="Verified Devs" value={dashboardData.developers.verified} valueStyle={{color: PURPLE_THEME.warning, fontSize: '18px'}} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;