import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  TeamOutlined, 
  HomeOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  ArrowRightOutlined,
  ApiOutlined,
  FileDoneOutlined,
  BankOutlined,
  FileProtectOutlined
} from '@ant-design/icons';
import { Card, Row, Col, Typography, Tag, Statistic, Spin, Button, List, Select, Alert } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;
const { Option } = Select;

const THEME = {
  primary: '#722ed1',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  info: '#1890ff',
  warning: '#faad14',
  error: '#f5222d',
  revenue: '#00b96b',
  purple: '#8b5cf6',
  purpleBg: '#faf5ff'
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/dashboard/view/superadmin?range=${range}`);
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getSourcePieData = () => {
    if (!dashboardData?.leads?.types) return [];
    const colors = [THEME.primary, THEME.info, THEME.warning, THEME.success, '#fa8c16', '#eb2f96', '#2f54eb'];
    return dashboardData.leads.types.map((item, index) => ({
      name: item._id.replace('_', ' ').toUpperCase(),
      value: item.count,
      color: colors[index % colors.length]
    }));
  };

  const getTimelineData = () => {
    if (!dashboardData?.leads?.timeline) return [];
    return dashboardData.leads.timeline.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      leads: item.total,
      deals: Math.floor(item.total * 0.15) // Approximate deals for timeline
    }));
  };

  const getDealStages = () => {
    return [
      { stage: 'New Leads', count: dashboardData?.leads?.total || 0 },
      { stage: 'Site Visits', count: Math.floor((dashboardData?.leads?.total || 0) * 0.35) },
      { stage: 'Token Paid', count: dashboardData?.deals?.pending || 0 },
      { stage: 'Closed Deals', count: dashboardData?.deals?.completed || 0 }
    ];
  };

  const getPendingSummaries = () => {
    return [
      { type: 'Agent Registrations', count: dashboardData?.agents?.pending || 0, link: '/approvals/agents', color: 'blue' },
      { type: 'Agency Registrations', count: dashboardData?.agencies?.pending || 0, link: '/approvals/agencies', color: 'purple' },
      { type: 'Pending Deals', count: dashboardData?.deals?.pending || 0, link: '/deals', color: 'orange' },
      { type: 'Property Listings', count: dashboardData?.properties?.notReady || 0, link: '/properties', color: 'green' }
    ];
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" tip="Loading Xoto Overview..." /></div>;
  if (error) return <div className="p-6"><Alert message="Error" description={error} type="error" showIcon /></div>;

  const statsCards = [
    { label: 'Pending Approvals', value: (dashboardData.agents.pending || 0) + (dashboardData.agencies.pending || 0), icon: <ExclamationCircleOutlined />, color: THEME.warning, bg: '#fffbe6' },
    { label: 'Total Verified Agents', value: dashboardData.agents.approved, icon: <TeamOutlined />, color: THEME.info, bg: '#e6f7ff' },
    { label: 'Total Agencies', value: dashboardData.agencies.total, icon: <BankOutlined />, color: THEME.purple, bg: THEME.purpleBg },
    { label: 'Total Deals', value: dashboardData.deals.total, icon: <FileProtectOutlined />, color: THEME.success, bg: '#f6ffed' },
    { label: 'Active Inventory', value: dashboardData.properties.available, icon: <HomeOutlined />, color: THEME.primary, bg: THEME.primaryBg },
    { label: 'Total Revenue', value: `AED ${(dashboardData.products.revenue || 0).toLocaleString('en-AE')}`, icon: <DollarOutlined />, color: THEME.revenue, bg: '#f6ffed' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>Platform Overview</Title>
          <Text type="secondary">High-level snapshot of Xoto Grid operations and metrics.</Text>
        </div>
        <div className="flex gap-3 items-center">
          <Select 
            defaultValue="7d" 
            style={{ width: 120 }} 
            onChange={setRange}
          >
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
          </Select>
          <div className="flex gap-3 bg-primary text-white cursor-pointer p-2 rounded-lg shadow-sm"> 
            <button className='cursor-pointer' onClick={() => window.location.href = '/'}>Go To Home</button>
          </div>
        </div>
      </div>

      {/* TOP STATS GRID */}
      <Row gutter={[16, 16]} className="mb-8">
        {statsCards.map((stat, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <Statistic 
                title={<Text type="secondary" className="font-medium">{stat.label}</Text>}
                value={stat.value}
                prefix={
                  <div className="p-2 rounded-lg mr-3 flex items-center justify-center" style={{ backgroundColor: stat.bg, color: stat.color, width: '40px', height: '40px' }}>
                    {stat.icon}
                  </div>
                }
                valueStyle={{ fontWeight: '600', fontSize: '24px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* MIDDLE CHARTS GRID */}
      <Row gutter={[16, 16]} className="mb-8">
        {/* Operations Timeline */}
        <Col xs={24} lg={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Operations Timeline (Leads vs Deals)">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={getTimelineData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.success} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" name="New Leads" dataKey="leads" stroke={THEME.primary} fillOpacity={1} fill="url(#colorLeads)" strokeWidth={3} />
                <Area type="monotone" name="Closed Deals" dataKey="deals" stroke={THEME.success} fillOpacity={1} fill="url(#colorDeals)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Source Analytics Pie Chart */}
        <Col xs={24} lg={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full" title="Lead Sources">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={getSourcePieData()} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  {getSourcePieData().map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip itemStyle={{ color: '#333' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* BOTTOM OVERVIEW GRID */}
      <Row gutter={[16, 16]}>
        
        {/* Summary of Pending Items (Instead of Actions) */}
        <Col xs={24} md={8}>
          <Card 
            title={<><FileDoneOutlined className="mr-2 text-yellow-600"/> Pending Approvals Summary</>} 
            bordered={false} 
            className="shadow-sm rounded-xl h-full"
            extra={<Button type="link" size="small">View All</Button>}
          >
            <List 
              itemLayout="horizontal"
              dataSource={getPendingSummaries()}
              renderItem={(item) => (
                <List.Item
                  actions={[<a href={item.link} className="text-gray-400 hover:text-purple-600"><ArrowRightOutlined /></a>]}
                >
                  <List.Item.Meta 
                    title={<span className="font-medium text-gray-700">{item.type}</span>}
                  />
                  <Tag color={item.color} className="rounded-full px-3">{item.count} Pending</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Deal Conversion Funnel */}
        <Col xs={24} md={8}>
          <Card title="Deal Conversion Funnel" bordered={false} className="shadow-sm rounded-xl h-full">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getDealStages()} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" width={90} tick={{fontSize: 12, fill: '#8c8c8c'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="count" fill={THEME.info} radius={[0, 4, 4, 0]} barSize={16}>
                  {getDealStages().map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === 3 ? THEME.success : THEME.info} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* AI & System Usage */}
        <Col xs={24} md={8}>
          <Card title="AI & System Usage" bordered={false} className="shadow-sm rounded-xl h-full">
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Card size="small" bordered={false} className="bg-purple-50 rounded-lg flex items-center">
                  <Statistic 
                    title="Total Leads" 
                    value={dashboardData.leads.total} 
                    prefix={<FileDoneOutlined className="mr-2" />}
                    valueStyle={{color: THEME.primary, fontSize: '22px', fontWeight: 'bold'}} 
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" bordered={false} className="bg-blue-50 text-center rounded-lg">
                  <Statistic title="Active Freelancers" value={dashboardData.users.freelancers} valueStyle={{color: THEME.info, fontSize: '18px', fontWeight: 'bold'}} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" bordered={false} className="bg-green-50 text-center rounded-lg">
                  <Statistic title="Total Properties" value={dashboardData.properties.total} valueStyle={{color: THEME.success, fontSize: '18px', fontWeight: 'bold'}} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

      </Row>
    </div>
  );
};

export default AdminDashboard;
