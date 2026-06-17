import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Avatar, Tag, Typography, Radio, Tabs, Spin, message, Space, Divider, Badge
} from 'antd';
import {
  TrophyOutlined, CrownOutlined, UserOutlined,
  RiseOutlined, SafetyCertificateOutlined, FireOutlined
} from '@ant-design/icons';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const THEME = {
  primary: '#5C039B',
  primaryLight: '#F5F0FF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  textDark: '#0F172A',
  textMuted: '#64748B',
  bgPage: '#F8FAFC',
  border: '#E2E8F0',
};

// ─── Rank Badge ───────────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  if (rank === 1) return <CrownOutlined style={{ color: '#F59E0B', fontSize: 22 }} />;
  if (rank === 2) return <TrophyOutlined style={{ color: '#94A3B8', fontSize: 20 }} />;
  if (rank === 3) return <TrophyOutlined style={{ color: '#F97316', fontSize: 20 }} />;
  return <span style={{ fontWeight: 700, color: '#64748B', fontSize: 14 }}>#{rank}</span>;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon }) => (
  <Card
    bordered={false}
    style={{ borderRadius: 12, flex: 1, minWidth: 160, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    bodyStyle={{ padding: '16px 20px' }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${color}18`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {icon}
      </div>
      <div>
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </Text>
        <Title level={4} style={{ margin: 0, color: THEME.textDark }}>{value}</Title>
      </div>
    </div>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const GridLeaderboard = () => {
  const { user } = useSelector((state) => state.auth);
  const roleCode = user?.role?.code;
  const isAdmin = roleCode === '1' || roleCode === '18' || user?.role?.isSuperAdmin;
  const isAgency = roleCode === '15';

  const [range, setRange] = useState('monthly');
  const [view, setView] = useState(isAgency ? 'agency' : 'global');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

  const rangeTabs = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'annual', label: 'Annual' },
  ];

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        range,
        page: String(pagination.page),
        limit: String(pagination.limit),
      }).toString();

      let endpoint = '';
      let list = [];
      let rankInfo = null;
      let pageInfo = null;

      if (view === 'topConverters') {
        endpoint = `grid/leaderboard/top-converters?${qs}`;
        const res = await apiService.get(endpoint);
        console.log('🔄 Top Converters Response:', res);
        list = res?.data?.data || res?.data?.leaderboard || res?.data || [];
        rankInfo = res?.data?.myRank || null;
        pageInfo = res?.data?.pagination || res?.pagination || null;
      } else if (view === 'trust') {
        endpoint = `grid/leaderboard/trust?${qs}`;
        const res = await apiService.get(endpoint);
        console.log('🔒 Trust Ranking Response:', res);
        list = res?.data?.data || res?.data?.leaderboard || res?.data || [];
        rankInfo = res?.data?.myRank || null;
        pageInfo = res?.data?.pagination || res?.pagination || null;
      } else if (view === 'agency') {
        endpoint = `agency/performance?${qs}`;
        const res = await apiService.get(endpoint);
        console.log('🏢 Agency Performance Response:', res);
        list = res?.data?.leaderboard || res?.data?.data || res?.data || [];
        pageInfo = res?.pagination || null;
      } else {
        // Global leaderboard
        endpoint = `grid/leaderboard?${qs}`;
        const res = await apiService.get(endpoint);
        console.log('🌍 Global Leaderboard Response:', res);

        // Try multiple response shapes
        list = res?.data?.data || res?.data?.leaderboard || res?.data || [];
        rankInfo = res?.data?.myRank || null;
        pageInfo = res?.data?.pagination || res?.pagination || null;
      }

      setData(Array.isArray(list) ? list : []);
      setMyRank(rankInfo);
      if (pageInfo) {
        setPagination(prev => ({
          ...prev,
          total: pageInfo.total || 0,
          totalPages: pageInfo.totalPages || 1,
        }));
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      if (err?.response?.status === 403) {
        message.error('Access denied. You do not have permission to view this.');
        if (view === 'agency') setView('global');
      } else {
        message.error('Failed to load leaderboard');
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [range, view, pagination.page, pagination.limit]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const handleRangeChange = (key) => {
    setRange(key);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewChange = (e) => {
    setView(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTableChange = (paginationConfig) => {
    setPagination(prev => ({
      ...prev,
      page: paginationConfig.current || 1,
      limit: paginationConfig.pageSize || 20,
    }));
  };

  // ── Summary stats ──────────────────────────────────────────────────────────
  const totalAgents = data.filter(r => r.role === 'agent').length;
  const totalAdvisors = data.filter(r => r.role === 'advisor').length;
  const topScore = data[0]?.score || 0;
  const avgConversion = data.length
    ? Math.round(data.reduce((s, r) => s + (r.conversionRate || 0), 0) / data.length)
    : 0;

  // ── Base columns ───────────────────────────────────────────────────────────
  const baseColumns = [
    {
      title: 'Rank', dataIndex: 'rank', key: 'rank', width: 72,
      render: (rank) => <RankBadge rank={rank} />,
    },
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar
            src={record.avatar || record.profile_photo}
            icon={<UserOutlined />}
            style={{ background: THEME.primaryLight, color: THEME.primary }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text strong style={{ fontSize: 14 }}>{name}</Text>
              {record.isCurrentUser && <Tag color="purple" style={{ fontSize: 10 }}>You</Tag>}
            </div>
            {record.role && (
              <Tag
                color={record.role === 'advisor' ? 'blue' : 'cyan'}
                style={{ fontSize: 10, marginTop: 2 }}
              >
                {record.role}
              </Tag>
            )}
            {record.location && (
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                {record.location}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Total Leads', dataIndex: 'totalLeads', key: 'totalLeads', width: 110,
      sorter: (a, b) => a.totalLeads - b.totalLeads,
      render: (val) => <Text>{val || 0}</Text>,
    },
    {
      title: 'Conversion', dataIndex: 'conversionRate', key: 'conversionRate', width: 110,
      sorter: (a, b) => (a.conversionRate || 0) - (b.conversionRate || 0),
      render: (val) => {
        const color = val >= 50 ? THEME.success : val >= 25 ? THEME.warning : THEME.danger;
        return <Text strong style={{ color }}>{val || 0}%</Text>;
      },
    },
    {
      title: 'Deals Closed', dataIndex: 'closedDeals' || 'dealsClosed', key: 'dealsClosed', width: 110,
      sorter: (a, b) => (a.dealsClosed || 0) - (b.dealsClosed || 0),
      render: (val) => <Text>{val || 0}</Text>,
    },
    {
      title: 'Commission', dataIndex: 'commissionEarned', key: 'commissionEarned', width: 140,
      sorter: (a, b) => (a.commissionEarned || 0) - (b.commissionEarned || 0),
      render: (val) =>
        val > 0
          ? <Text style={{ color: THEME.success }}>AED {Number(val).toLocaleString()}</Text>
          : <Text type="secondary">—</Text>,
    },
    {
      title: 'Score', dataIndex: 'score', key: 'score', width: 90,
      defaultSortOrder: 'descend',
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
      render: (val) => (
        <Text strong style={{ color: THEME.primary, fontSize: 15 }}>{val || 0}</Text>
      ),
    },
  ];

  // ── Trust extra columns ────────────────────────────────────────────────────
  const trustColumns = [
    ...baseColumns,
    {
      title: 'Trust Score', dataIndex: 'trustScore', key: 'trustScore', width: 110,
      sorter: (a, b) => (a.trustScore || 0) - (b.trustScore || 0),
      render: (val) => <Text strong style={{ color: THEME.warning }}>{val || 0}</Text>,
    },
    {
      title: 'Compliance', dataIndex: 'complianceStatus', key: 'complianceStatus', width: 120,
      render: (val) => {
        const colorMap = { compliant: 'green', flagged: 'red', incomplete: 'orange' };
        return <Tag color={colorMap[val] || 'default'}>{val?.toUpperCase() || '—'}</Tag>;
      },
    },
  ];

  // ── Agency columns ─────────────────────────────────────────────────────────
  const agencyColumns = [
    {
      title: 'Rank', dataIndex: 'rank', key: 'rank', width: 72,
      render: (rank) => <RankBadge rank={rank} />,
    },
    {
      title: 'Agent', dataIndex: 'name', key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar src={record.profile_photo} icon={<UserOutlined />} />
          <div>
            <Text strong>{name}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Total Leads', dataIndex: 'totalLeads', key: 'totalLeads', width: 110,
      sorter: (a, b) => a.totalLeads - b.totalLeads,
    },
    {
      title: 'Active Leads', dataIndex: 'activeLeads', key: 'activeLeads', width: 110,
      sorter: (a, b) => a.activeLeads - b.activeLeads,
      render: (val) => <Badge count={val} showZero color={THEME.primary} />,
    },
    {
      title: 'Commission Earned', dataIndex: 'commissionEarned', key: 'commissionEarned', width: 140,
      sorter: (a, b) => a.commissionEarned - b.commissionEarned,
      render: (val) =>
        val > 0
          ? <Text style={{ color: THEME.success }}>AED {Number(val).toLocaleString()}</Text>
          : <Text type="secondary">—</Text>,
    },
    {
      title: 'RERA Status', dataIndex: 'reraStatus', key: 'reraStatus', width: 120,
      render: (val) => {
        const colorMap = { approved: 'green', pending: 'orange', not_submitted: 'red' };
        return <Tag color={colorMap[val] || 'default'}>{val?.replace('_', ' ').toUpperCase() || '—'}</Tag>;
      },
    },
  ];

  const activeColumns =
    view === 'trust' ? trustColumns :
    view === 'agency' ? agencyColumns : baseColumns;

  return (
    <div style={{ minHeight: '100vh', background: THEME.bgPage, padding: '24px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: THEME.textDark, fontWeight: 700 }}>
          Grid Leaderboard
        </Title>
        <Text type="secondary">
          {view === 'global' && 'Global ranking of all agents and advisors based on composite score.'}
          {view === 'topConverters' && 'Ranked by leads-to-completed conversion ratio.'}
          {view === 'trust' && 'Trust ranking based on compliance, reliability, and platform tenure.'}
          {view === 'agency' && 'Performance leaderboard of your affiliated agents.'}
        </Text>
      </div>

      {/* View Switcher */}
      <div style={{ marginBottom: 16 }}>
        <Radio.Group value={view} onChange={handleViewChange} buttonStyle="solid" size="middle">
          {!isAgency && <Radio.Button value="global">Leaderboard</Radio.Button>}
          {!isAgency && <Radio.Button value="topConverters">Top Converters</Radio.Button>}
          {isAdmin && <Radio.Button value="trust"><SafetyCertificateOutlined /> Trust</Radio.Button>}
          {isAgency && <Radio.Button value="agency">Agency Performance</Radio.Button>}
        </Radio.Group>
      </div>

      {/* Period Tabs */}
      <div style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={range}
          onChange={handleRangeChange}
          items={rangeTabs}
          tabBarStyle={{ marginBottom: 0 }}
        />
      </div>

      <Divider style={{ margin: '8px 0 16px' }} />

      {/* Summary Stats */}
      {data.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {view === 'agency' ? (
            <StatCard label="Total Agents" value={data.length} color={THEME.primary} icon={<UserOutlined />} />
          ) : (
            <>
              <StatCard label="Agents" value={totalAgents} color={THEME.primary} icon={<UserOutlined />} />
              <StatCard label="Advisors" value={totalAdvisors} color="#0EA5E9" icon={<SafetyCertificateOutlined />} />
              <StatCard label="Top Score" value={topScore} color={THEME.warning} icon={<CrownOutlined />} />
              <StatCard label="Avg Conversion" value={`${avgConversion}%`} color={THEME.success} icon={<RiseOutlined />} />
            </>
          )}
        </div>
      )}

      {/* My Rank Box */}
      {myRank && view !== 'agency' && (
        <Card
          bordered={false}
          style={{
            borderRadius: 12, marginBottom: 20,
            background: THEME.primaryLight,
            border: `1.5px solid ${THEME.primary}`,
          }}
          bodyStyle={{ padding: '14px 20px' }}
        >
          <Space size="large">
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>My Rank</Text>
              <Title level={4} style={{ margin: 0 }}>#{myRank.rank}</Title>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Score</Text>
              <Title level={4} style={{ margin: 0, color: THEME.primary }}>{myRank.score}</Title>
            </div>
            <FireOutlined style={{ color: THEME.warning, fontSize: 24 }} />
          </Space>
        </Card>
      )}

      {/* Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}
      >
        <Spin spinning={loading} tip="Loading leaderboard...">
          <Table
            columns={activeColumns}
            dataSource={data}
            rowKey="_id"
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} users`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            onChange={handleTableChange}
            rowClassName={(record) => record.isCurrentUser ? 'highlight-row' : ''}
            scroll={{ x: 900 }}
            locale={{ emptyText: 'No data available for this period' }}
          />
        </Spin>
      </Card>

      <style>{`
        .highlight-row td {
          background: #f3e8ff !important;
        }
        .highlight-row td:first-child {
          border-left: 4px solid #5C039B;
        }
      `}</style>
    </div>
  );
};

export default GridLeaderboard;