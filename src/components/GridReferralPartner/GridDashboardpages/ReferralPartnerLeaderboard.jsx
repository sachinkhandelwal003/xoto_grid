import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Avatar, List, Tag, Button, Empty, Divider, Spin } from 'antd';
import {
  TrophyOutlined, UserOutlined, DollarOutlined, RiseOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { apiService } from '../../../manageApi/utils/custom.apiservice';
import { message } from 'antd';

const { Title, Text } = Typography;

// ─── Theme System ─────────────────────────────────────────────────────────────
const THEME = {
  primary: '#5C039B',
  primaryMid: '#7C3AED',
  primaryLight: '#F5F0FF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  textDark: '#0F172A',
  textMuted: '#64748B',
  bgPage: '#F8FAFC',
  border: '#E2E8F0',
};

// ─── Rank Badge Component ─────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  let bgColor, textColor, icon;
  
  if (rank === 1) {
    bgColor = '#FEF3C7';
    textColor = '#D97706';
    icon = <TrophyOutlined style={{ color: '#F59E0B' }} />;
  } else if (rank === 2) {
    bgColor = '#F1F5F9';
    textColor = '#64748B';
    icon = <TrophyOutlined style={{ color: '#94A3B8' }} />;
  } else if (rank === 3) {
    bgColor = '#FFF7ED';
    textColor = '#EA580C';
    icon = <TrophyOutlined style={{ color: '#F97316' }} />;
  } else {
    bgColor = '#F8FAFC';
    textColor = '#64748B';
  }
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: bgColor,
      color: textColor,
      fontWeight: 700,
      fontSize: 16
    }}>
      {rank <= 3 ? icon : rank}
    </div>
  );
};

// ─── Main Leaderboard Component ───────────────────────────────────────────────
const ReferralPartnerLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [activePeriod, setActivePeriod] = useState('monthly'); // weekly, monthly, quarterly, annual
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/referral/leaderboard?period=${activePeriod}`);
      const data = res?.data;
      if (data?.leaderboard) {
        setLeaderboard(data.leaderboard);
        setMyRank(data.myRank || null);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard', err);
      message.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [activePeriod]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (change) => {
    if (change === 'up')   return <ArrowUpOutlined style={{ color: THEME.success }} />;
    if (change === 'down') return <ArrowDownOutlined style={{ color: THEME.danger }} />;
    return null; // 'stable' or no change — show nothing
  };

  return (
    <div style={{ backgroundColor: THEME.bgPage, minHeight: '100vh', padding: '40px 32px' }}>
      <Spin spinning={loading} tip="Loading leaderboard...">
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
          marginBottom: 32
        }}>
          <div>
            <Title level={3} style={{ margin: 0, color: THEME.textDark, fontWeight: 700 }}>
              Leaderboard
            </Title>
            <Text style={{ color: THEME.textMuted, fontSize: 14 }}>
              Ranked by earnings and conversion rate
            </Text>
          </div>

          {/* Period Selector */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'weekly',    label: 'Weekly' },
              { key: 'monthly',   label: 'Monthly' },
              { key: 'quarterly', label: 'Quarterly' },
              { key: 'annual',    label: 'Annual' },
            ].map(({ key, label }) => (
              <Button
                key={key}
                type={activePeriod === key ? 'primary' : 'default'}
                onClick={() => setActivePeriod(key)}
                style={{
                  borderRadius: 8,
                  height: 38,
                  fontWeight: 500,
                  backgroundColor: activePeriod === key ? THEME.primary : 'white',
                  borderColor: activePeriod === key ? THEME.primary : THEME.border,
                  color: activePeriod === key ? 'white' : THEME.textMuted,
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

      {/* My Rank Section */}
      {myRank && (
        <Card
          bordered={false}
          style={{
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
            border: `1px solid ${THEME.border}`,
            marginBottom: 32,
            background: `linear-gradient(135deg, ${THEME.primaryLight} 0%, #F8FAFC 100%)`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <RankBadge rank={myRank.rank} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Title level={5} style={{ margin: 0, color: THEME.textDark, fontWeight: 700 }}>
                    Your Rank
                  </Title>
                  <Tag
                    color="blue"
                    style={{
                      borderRadius: 20,
                      padding: '2px 10px',
                      border: 'none',
                      fontWeight: 600
                    }}
                  >
                    #{myRank.rank}
                  </Tag>
                </div>
                <Text style={{ color: THEME.textMuted, fontSize: 14 }}>
                  Keep up the great work! You're in the top {Math.round((myRank.rank / leaderboard.length) * 100)}% of partners
                </Text>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 12, color: THEME.textMuted, display: 'block', marginBottom: 4 }}>
                  Total Leads
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 700, color: THEME.textDark }}>
                  {myRank.totalLeads}
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 12, color: THEME.textMuted, display: 'block', marginBottom: 4 }}>
                  Conversion Rate
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 700, color: THEME.primary }}>
                  {myRank.conversionRate}%
                </Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 12, color: THEME.textMuted, display: 'block', marginBottom: 4 }}>
                  Commission Earned
                </Text>
                <Text style={{ fontSize: 20, fontWeight: 700, color: THEME.success }}>
                  AED {myRank.commissionEarned.toLocaleString()}
                </Text>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top 3 Winners */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {leaderboard.slice(0, 3).map((user) => (
          <Col xs={24} sm={12} md={8} key={user.id}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                boxShadow: user.rank === 1 ? '0 10px 40px rgba(92, 3, 155, 0.15)' : '0 4px 20px rgba(15, 23, 42, 0.02)',
                border: `1px solid ${THEME.border}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              <div style={{
                position: 'absolute',
                top: -24,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1
              }}>
                <RankBadge rank={user.rank} />
              </div>
              
              <div style={{ paddingTop: 20 }}>
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{
                    background: user.rank === 1 ? THEME.primary : THEME.primaryLight,
                    color: user.rank === 1 ? 'white' : THEME.primary,
                    border: `4px solid white`,
                    boxShadow: user.rank === 1 ? '0 4px 12px rgba(92, 3, 155, 0.2)' : 'none',
                    marginBottom: 16
                  }}
                />
                
                <Title level={5} style={{ margin: '0 0 4px', color: THEME.textDark, fontWeight: 700 }}>
                  {user.name}
                </Title>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                  {getRankIcon(user.change)}
                  <Text style={{
                    fontSize: 13,
                    color: user.change === 'up' ? THEME.success : user.change === 'down' ? THEME.danger : THEME.textMuted,
                    fontWeight: 600
                  }}>
                    {user.changeValue > 0 ? `+${user.changeValue}` : user.changeValue < 0 ? user.changeValue : 'No change'}
                  </Text>
                </div>

                <Divider style={{ margin: '12px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: 16 }}>
                  <div>
                    <Text style={{ fontSize: 11, color: THEME.textMuted, display: 'block', marginBottom: 2 }}>
                      Leads
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 700, color: THEME.textDark }}>
                      {user.totalLeads}
                    </Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 11, color: THEME.textMuted, display: 'block', marginBottom: 2 }}>
                      Conversion
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 700, color: THEME.primary }}>
                      {user.conversionRate}%
                    </Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 11, color: THEME.textMuted, display: 'block', marginBottom: 2 }}>
                      Earned
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 700, color: THEME.success }}>
                      AED {user.commissionEarned.toLocaleString()}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Full Leaderboard List */}
      <Card
        bordered={false}
        style={{
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
          border: `1px solid ${THEME.border}`
        }}
        title={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: THEME.textDark }}>
              Full Rankings
            </span>
            <span style={{ fontSize: 12, fontWeight: 400, color: THEME.textMuted }}>
              All referral partners ranked by performance
            </span>
          </div>
        }
      >
        {leaderboard.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={leaderboard.slice(3)}
            renderItem={(user) => (
              <List.Item
                style={{
                  padding: '16px 0',
                  borderBottom: `1px solid ${THEME.border}`,
                  alignItems: 'center'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <RankBadge rank={user.rank} />
                      <Avatar
                        size={48}
                        icon={<UserOutlined />}
                        style={{
                          background: THEME.primaryLight,
                          color: THEME.primary,
                          fontWeight: 600
                        }}
                      />
                    </div>
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: 600, color: THEME.textDark }}>
                        {user.name}
                      </Text>
                      {getRankIcon(user.change)}
                      <Text style={{
                        fontSize: 12,
                        color: user.change === 'up' ? THEME.success : user.change === 'down' ? THEME.danger : THEME.textMuted,
                        fontWeight: 600
                      }}>
                        {user.changeValue > 0 ? `+${user.changeValue}` : user.changeValue < 0 ? user.changeValue : 'No change'}
                      </Text>
                    </div>
                  }
                  description={
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UserOutlined style={{ fontSize: 12, color: THEME.textMuted }} />
                        <Text style={{ fontSize: 13, color: THEME.textMuted }}>
                          {user.totalLeads} leads
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RiseOutlined style={{ fontSize: 12, color: THEME.textMuted }} />
                        <Text style={{ fontSize: 13, color: THEME.textMuted }}>
                          {user.conversionRate}% conversion
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <DollarOutlined style={{ fontSize: 12, color: THEME.textMuted }} />
                        <Text style={{ fontSize: 13, color: THEME.textMuted }}>
                          AED {user.commissionEarned.toLocaleString()} earned
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description={
              <Text style={{ color: THEME.textMuted }}>
                No data available for the selected period
              </Text>
            }
          />
        )}
      </Card>
      </Spin>
    </div>
  );
};

export default ReferralPartnerLeaderboard;
