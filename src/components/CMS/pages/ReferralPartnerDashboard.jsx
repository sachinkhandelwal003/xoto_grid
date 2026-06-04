import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Tag, Badge, Avatar, List, Progress, Button, Space, Divider, Spin } from 'antd';
import {
  UserOutlined, DollarOutlined, CheckCircleOutlined,
  FileTextOutlined, PlusOutlined, ArrowRightOutlined,
  ClockCircleOutlined, EnvironmentOutlined, WalletOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { message } from 'antd';

const { Title, Text } = Typography;

// ─── Theme System ─────────────────────────────────────────────────────────────
const THEME = {
  primary: '#5C039B',
  primaryMid: '#7C3AED',
  primaryLight: '#F5F0FF',
  success: '#10B981',
  successLight: '#E6F4EA',
  info: '#3B82F6',
  infoLight: '#EBF5FF',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  textDark: '#0F172A',
  textMuted: '#64748B',
  bgPage: '#F8FAFC',
  border: '#E2E8F0',
};

// ─── Color Map Helper ─────────────────────────────────────────────────────────
const getStatusConfig = (status) => {
  const configs = {
    new: { color: '#3B82F6', bg: '#EBF5FF', label: 'New Lead' },
    contacted: { color: '#8B5CF6', bg: '#F5F3FF', label: 'Contacted' },
    qualified: { color: '#06B6D4', bg: '#ECFEFF', label: 'Qualified' },
    in_discussion: { color: '#F59E0B', bg: '#FFFBEB', label: 'In Discussion' },
    site_visit_scheduled: { color: '#06B6D4', bg: '#E6F4EA', label: 'Site Visit' },
    offer_made: { color: '#EC4899', bg: '#FDF2F8', label: 'Offer Made' },
    completed: { color: '#10B981', bg: '#E6F4EA', label: 'Completed' },
    not_proceeding: { color: '#EF4444', bg: '#FEF2F2', label: 'Dropped' }
  };
  return configs[status] || { color: '#64748B', bg: '#F1F5F9', label: status };
};

const StatusPill = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <Tag style={{
      backgroundColor: config.bg,
      color: config.color,
      borderColor: 'transparent',
      borderRadius: '6px',
      fontWeight: 600,
      padding: '4px 10px'
    }}>
      {config.label}
    </Tag>
  );
};

const StatCard = ({ icon, label, value, color, suffix, subtext }) => (
  <Card
    bordered={false}
    style={{
      borderRadius: 16,
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
      border: `1px solid ${THEME.border}`,
      height: '100%'
    }}
  >
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: `${color}12`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { style: { fontSize: 20, color } })}
      </div>
      <div>
        <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: THEME.textDark, lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value || '—'}
          {suffix && <span style={{ fontSize: 14, fontWeight: 400, color: THEME.textMuted, marginLeft: 4 }}>{suffix}</span>}
        </div>
        {subtext && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6 }}>{subtext}</div>}
      </div>
    </div>
  </Card>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ReferralPartnerDashboard = () => {
  const navigate = useNavigate();

  // Safe selector configuration fallbacks
  const authState = useSelector((state) => state?.auth);
  const user = authState?.user || null;

  const [stats, setStats] = useState({ total: 0, new: 0, in_progress: 0, completed: 0, submitted: 0, commission: { pending: 0, paid: 0 } });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiService.get('/gridlead/referral/stats');
      const payload = res?.data?.success !== undefined ? res.data : res;
      if (payload?.success && payload?.data?.stats) {
        setStats(payload.data.stats);
        if (payload.data.recent_leads) {
          setRecentLeads(payload.data.recent_leads);
        }
      }
    } catch (err) {
      console.error('Failed to fetch referral partner stats', err);
    }
  }, []);

  const fetchRecentLeads = useCallback(async () => {
    try {
      const res = await apiService.get('/gridlead/referral/my-leads?limit=5');
      const payload = res?.data?.success !== undefined ? res.data : res;
      if (payload?.data) {
        setRecentLeads(payload.data);
      }
    } catch (err) {
      console.error('Failed to fetch recent leads', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecentLeads()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchRecentLeads]);

  const partnerName = user ? `${user.firstName || user.first_name || 'Referral'} ${user.lastName || user.last_name || 'Partner'}` : 'Referral Partner';
  const profileCompletion = 75;
  const isProfileComplete = profileCompletion === 100;

  return (
    <div style={{ backgroundColor: THEME.bgPage, minHeight: '100vh', padding: '40px 32px' }}>
      <Spin spinning={loading} tip="Loading dashboard...">
        {/* Upper Layout Header Block */}
        <div style={{ marginBottom: 32 }}>
          <div>
            <Title level={3} style={{ margin: 0, color: THEME.textDark, fontWeight: 700 }}>
              Welcome back, {user?.firstName || user?.first_name || 'Partner'}! 👋
            </Title>
            <Text style={{ color: THEME.textMuted, fontSize: 14 }}>
              Track your client referrals and monitor upcoming commission earnings pipeline.
            </Text>
          </div>
        </div>

        <Row gutter={[32, 32]}>
          {/* Left Grid Layout Pipeline */}
          <Col xs={24}>

            {/* Main Counter Blocks */}
            <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  icon={<FileTextOutlined />}
                  label="Leads Submitted"
                  value={stats.submitted}
                  color={THEME.primary}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  icon={<CheckCircleOutlined />}
                  label="Leads Converted"
                  value={stats.completed}
                  color={THEME.success}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <StatCard
                  icon={<DollarOutlined />}
                  label="Commission Earned"
                  value={stats.commission?.paid || 0}
                  suffix=" AED"
                  color={THEME.warning}
                />
              </Col>
            </Row>

            {/* Core Recent Activity Feed Wrapper */}
            <Card
              bordered={false}
              style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)', border: `1px solid ${THEME.border}` }}
              title={
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: THEME.textDark }}>Recent Lead Activity</span>
                  <span style={{ fontSize: 12, fontWeight: 400, color: THEME.textMuted }}>Latest {Math.min(recentLeads.length, 5)} entries processed</span>
                </div>
              }
              extra={
                <Button type="link" onClick={() => navigate('/dashboard/gridreferralpartner/total-leads')} style={{ color: THEME.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  View All Referrals <ArrowRightOutlined style={{ fontSize: 12 }} />
                </Button>
              }
            >
              <div style={{ padding: '4px 24px 24px 24px' }}>
                {recentLeads.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={recentLeads.slice(0, 5)}
                    renderItem={(item) => {
                      const firstName = item.contact_info?.name?.first_name || '';
                      const lastName = item.contact_info?.name?.last_name || '';
                      const clientName = `${firstName} ${lastName}`.trim() || 'Unknown Client';

                      const req = item.requirements || {};
                      const locs = req.location_preferences?.map((l) => (typeof l === 'string' ? l : l.area)).filter(Boolean);
                      const location = locs?.[0] || 'N/A';
                      const budget = req.budget_max ? `AED ${(req.budget_max / 1000).toFixed(0)}k` : 'No Budget';
                      const spaceType = req.bedrooms != null ? (req.bedrooms === 0 ? 'Studio' : `${req.bedrooms} BR`) : req.property_type || 'General';

                      return (
                        <List.Item
                          style={{ padding: '20px 0', borderBottom: `1px solid ${THEME.border}` }}
                          extra={<div style={{ marginTop: 4 }}><StatusPill status={item.status} /></div>}
                        >
                          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <Avatar size={44} style={{ backgroundColor: THEME.primaryLight, color: THEME.primary, fontWeight: 700, flexShrink: 0 }}>
                              {clientName.charAt(0) || 'U'}
                            </Avatar>

                            <div style={{ flex: 1 }}>
                              <div style={{ marginBottom: 4 }}>
                                <Text style={{ fontSize: 15, fontWeight: 600, color: THEME.textDark, marginRight: 8 }}>
                                  {item.enquiry_type ? `${item.enquiry_type.toUpperCase()} Enquiry` : 'New Lead'}
                                </Text>
                                <Text style={{ fontSize: 14, color: THEME.textMuted }}>
                                  • Reference: {clientName}
                                </Text>
                              </div>

                              <Space size={8} style={{ flexWrap: 'wrap', margin: '6px 0 10px' }}>
                                <Tag bordered={false} icon={<EnvironmentOutlined />} style={{ color: THEME.textMuted, background: '#F1F5F9' }}>
                                  {location}
                                </Tag>
                                <Tag bordered={false} icon={<WalletOutlined />} style={{ color: THEME.textMuted, background: '#F1F5F9' }}>
                                  {budget}
                                </Tag>
                                <Tag bordered={false} style={{ color: THEME.primary, background: THEME.primaryLight, fontWeight: 500 }}>
                                  {spaceType}
                                </Tag>
                              </Space>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: THEME.textMuted, fontSize: 12 }}>
                                <ClockCircleOutlined style={{ fontSize: 11 }} />
                                <span>Logged on {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>No leads registered yet. Generate your first referral payout above!</Text>
                  </div>
                )}
              </div>
            </Card>
        </Col>
      </Row>
      </Spin>
    </div>
  );
};

export default ReferralPartnerDashboard;
