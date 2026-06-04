import * as React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {useNavigate, Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Avatar, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Spin, 
  Alert,
  Tooltip as AntTooltip
} from 'antd';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  SyncOutlined, 
  ExportOutlined, 
  ProductOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { apiService } from '../../../manageApi/utils/custom.apiservice';

const { Title, Text } = Typography;

// --- ROLE MAPPING ---
const roleSlugMap = {
  0: "superadmin",
  1: "admin",
  5: "vendor-b2c",
  6: "vendor-b2b",
  7: "freelancer",
  11: "accountant",
};

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  success: "#52c41a",
  info: "#1890ff",
  bgLight: "#f9f0ff",
};


const VendorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
     // Get dynamic role slug
  const roleSlug = roleSlugMap[user?.role?.code] ?? "dashboard";
   // --- NAVIGATION HANDLERS ---
  const handleUpdateProfile = () => navigate(`/dashboard/${roleSlug}/update`);
  const handleAddProducts = () => navigate(`/dashboard/${roleSlug}/products/add`);
  const handleViewProducts = () => navigate(`/dashboard/${roleSlug}/products/my`);
 
 

  // Default Date Range
  const fromDate = dayjs().subtract(1, 'month').format('DD-MM-YYYY');
  const toDate = dayjs().add(1, 'day').format('DD-MM-YYYY');

  const fetchDashboardData = async () => {
    if (!user?.id && !user?._id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.get('/dashboard/view/vendor', {
        vendor_id: user?.id || user?._id,
        from: fromDate,
        to: toDate
      });

      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vendor dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  // --- CHART DATA TRANSFORMATION ---
  const salesGraphData = data?.sales_graph?.map(item => ({
    date: dayjs(item.date).format('DD MMM'),
    revenue: item.total_revenue
  })) || [];

  // --- TABLE COLUMNS ---
  const productColumns = [
    {
      title: 'S.No',
      key: 'serial',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space size="middle">
          <Avatar 
            shape="square" 
            size={45} 
            src={record.photos?.[0]} 
            icon={<ProductOutlined />} 
            className="border"
          />
          <div style={{ maxWidth: 250 }}>
            <Text strong block ellipsis={{ tooltip: name }}>{name}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{record.categoryName || 'General'}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'discountedPrice',
      key: 'price',
      align: 'right',
      render: (price, record) => (
        <Text strong style={{ color: THEME.success }}>
          {record.currency || 'AED'} {price?.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Inventory',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (q) => (
        <Tag color={q > 10 ? 'green' : 'orange'} bordered={false}>
          {q} Units
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading Vendor Insights..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Data Fetch Error"
          description={error}
          type="error"
          showIcon
          action={<Button size="small" type="primary" onClick={fetchDashboardData}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Title level={2} style={{ margin: 0 }}>Vendor Overview</Title>
          <Text type="secondary">Real-time performance metrics for your shop.</Text>
        </div>
         <div className="flex gap-3 bg-primary text-white cursor-pointer p-2 rounded-lg shadow-sm"> 
        <button className='cursor-pointer' onClick={() => window.location.href = '/'}>Go To Home</button>
        </div>
      
      </div>

      {/* 2. STATS GRID */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title={<Text type="secondary">Total Revenue</Text>}
              value={data?.total_revenue || 0}
              precision={2}
              prefix={<span className="p-3 rounded-lg mr-2" style={{ background: THEME.bgLight, color: THEME.primary }}><DollarOutlined /></span>}
              suffix={<Text style={{ fontSize: 14 }}>AED</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title={<Text type="secondary">Total Orders</Text>}
              value={data?.total_orders || 0}
              prefix={<span className="p-3 rounded-lg mr-2" style={{ background: '#e6f7ff', color: THEME.info }}><ShoppingOutlined /></span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm rounded-xl">
            <Statistic
              title={<Text type="secondary">Total Products</Text>}
              value={data?.total_products || 0}
              prefix={<span className="p-3 rounded-lg mr-2" style={{ background: '#f6ffed', color: THEME.success }}><ProductOutlined /></span>}
            />
          </Card>
        </Col>
      </Row>

      {/* 3. CHART & TOP PRODUCTS */}
      <Row gutter={[16, 16]} className="mb-8">
        {/* Sales Area Chart */}
        <Col xs={24} lg={16}>
          <Card 
            title="Revenue Timeline" 
            bordered={false} 
            className="shadow-sm rounded-xl"
            extra={<AntTooltip title="Revenue generated based on orders"><InfoCircleOutlined /></AntTooltip>}
          >
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={salesGraphData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8c8c' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8c8c' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={THEME.primary} 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card title="Management" bordered={false} className="shadow-sm rounded-xl h-full">
            <Space direction="vertical" className="w-full" size="middle">
              <Button block size="large" onClick={()=>handleUpdateProfile()} >Update Profile</Button>
              <Button block size="large" onClick={handleViewProducts} >View Product</Button>
              <Button block size="large" onClick={handleAddProducts}>Add Product</Button>
              
              <div className="bg-purple-50 p-4 rounded-xl mt-4 border border-purple-100">
                <Text strong style={{ color: THEME.primary }}>Vendor Tip</Text>
                <p className="text-xs text-gray-500 mt-2 mb-0">
                  Products with clear descriptions and high-quality images have a 40% higher conversion rate.
                </p>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 4. TOP PRODUCTS TABLE */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Top 5 Performing Products" 
            bordered={false} 
            className="shadow-sm rounded-xl"
            bodyStyle={{ padding: '0' }}
          >
            <Table 
              columns={productColumns} 
              dataSource={data?.top_products?.slice(0, 5) || []} 
              pagination={false}
              rowKey="_id"
              locale={{ emptyText: 'No products sold in this period' }}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default VendorDashboard;