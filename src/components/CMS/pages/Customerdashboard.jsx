import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  UserOutlined, 
  FileTextOutlined,
  ShoppingOutlined,
  ProjectOutlined,
  SyncOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { Card, Row, Col, Button, Typography, Tag, Statistic, Avatar, Spin, Alert } from 'antd';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;

const PURPLE_THEME = {
  primary: '#722ed1',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  info: '#1890ff',
  warning: '#faad14',
};

const CustomerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.auth?.user);
  const navigate = useNavigate();
  
  const fromDate = dayjs().subtract(1, 'year').format('DD-MM-YYYY');
  const toDate = dayjs().add(1, 'day').format('DD-MM-YYYY');

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const handleProfile = () => {
    navigate("/dashboard/customer/myprofile");
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const profileRes = await apiService.get('/profile/get-profile-data');
        if (profileRes.data) {
          setUserProfile(profileRes.data);
        }
      } catch (profileErr) {
        console.error("Failed to load profile", profileErr);
      }

      const res = await apiService.get('/dashboard/view/customer', {
        customer_id: user?.id || user?._id,
        from: fromDate,
        to: toDate
      });

      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function to safely get the name string
  const getDisplayName = () => {
    // Priority 1: userProfile from API
    if (userProfile?.name) {
      if (typeof userProfile.name === 'object') {
        return `${userProfile.name.first_name || ''} ${userProfile.name.last_name || ''}`.trim();
      }
      return userProfile.name;
    }
    
    // Priority 2: Redux User
    if (user?.name) {
      if (typeof user.name === 'object') {
        return `${user.name.first_name || ''} ${user.name.last_name || ''}`.trim();
      }
      return user.name;
    }

    // Fallback
    return 'Customer';
  };

  const chartData = data?.purchase_graph?.map(item => ({
    name: dayjs(item.date).format('DD MMM'),
    spent: item.total_spent
  })) || [];

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" tip="Loading Dashboard..." /></div>;
  if (error) return <div className="p-6"><Alert message="Error" description={error} type="error" showIcon closable /></div>;

  const statsCards = [
    { label: 'Total Spent', value: `₹${data?.total_spent?.toLocaleString()}`, icon: <WalletOutlined />, color: PURPLE_THEME.primary, bg: PURPLE_THEME.primaryBg },
    { label: 'Total Orders', value: data?.total_orders, icon: <ShoppingOutlined />, color: PURPLE_THEME.info, bg: '#e6f7ff' },
    { label: 'Total Projects', value: data?.total_projects, icon: <ProjectOutlined />, color: PURPLE_THEME.success, bg: '#f6ffed' },
    { label: 'Total Estimates', value: data?.total_estimates, icon: <FileTextOutlined />, color: PURPLE_THEME.warning, bg: '#fff7e6' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          {/* ✅ Fixed: Simple Welcome + Name */}
          <Title level={2} style={{ margin: 0 }}>
            Welcome, {getDisplayName()} 👋
          </Title>
          <Text type="secondary">Here is your purchase summary.</Text>
        </div>
       <div className="flex gap-3 mt-4 md:mt-0 items-center">

  <Button 
    type="primary" 
    icon={<SyncOutlined />} 
    onClick={handleProfile}
    style={{ 
      background: PURPLE_THEME.primary, 
      borderColor: PURPLE_THEME.primary 
    }}
  >
    My Profile
  </Button>

  <button
    className="bg-[#722ed1] text-white cursor-pointer py-1 px-4 rounded-lg shadow-sm"
    onClick={() => window.location.href = '/'}
  >
    Go To Home
  </button>

</div>

      </div>

      {/* STATS CARDS */}
      <Row gutter={[16, 16]} className="mb-8">
        {statsCards.map((s, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
              <Statistic
                title={<Text type="secondary" className="uppercase text-xs font-bold tracking-wider">{s.label}</Text>}
                value={s.value || 0}
                valueStyle={{ color: '#1f2937', fontWeight: '700' }}
                prefix={
                  <span className="p-3 rounded-lg mr-3 flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </span>
                }
              />
              <div className="mt-3">
                <Tag color="green">Live Data</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* CHART SECTION */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={<span className="flex items-center gap-2"><ShoppingOutlined /> Purchase Spending Timeline</span>} 
            bordered={false} 
            className="shadow-sm rounded-xl"
            styles={{ body: { padding: '24px', height: '450px' } }}
          >
            <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PURPLE_THEME.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={PURPLE_THEME.primary} stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8c8c8c'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#8c8c8c'}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                    />
                    <Area 
                    type="monotone" 
                    dataKey="spent" 
                    stroke={PURPLE_THEME.primary} 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorSpent)" 
                    />
                </AreaChart>
                </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ADDITIONAL INFO */}
      <Row gutter={[16, 16]} className="mt-8">
          <Col span={24}>
              <Card bordered={false} className="shadow-sm rounded-xl">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }} />
                          <div>
                              {/* ✅ Fixed Name Here too */}
                              <Title level={4} style={{ margin: 0 }}>{getDisplayName()}</Title>
                              <Text type="secondary">{user?.email}</Text>
                          </div>
                      </div>
                      <div className="text-right">
                          <Text type="secondary" className="block">Total Products Purchased</Text>
                          <Title level={3} style={{ margin: 0, color: PURPLE_THEME.primary }}>{data?.total_products || 0}</Title>
                      </div>
                  </div>
              </Card>
          </Col>
      </Row>
    </div>
  );
};

export default CustomerDashboard;