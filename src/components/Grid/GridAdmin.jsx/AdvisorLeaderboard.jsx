import React, { useEffect, useState } from "react";
import { Avatar, Col, Progress, Row, Spin, Table, Tag, Typography, Tabs } from "antd";
import { FireOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

  :root {
    --sb-dark:    #14051f;
    --sb-mid:     #2a1247;
    --sb-accent:  #5c039b;
    --bg:         #faf5ff;
    --surface:    #FFFFFF;
    --surface2:   #f5ebff;
    --surface3:   #e9d5ff;
    --border:     #e9d5ff;
    --border2:    #d8b4fe;
    --tx:         #140D2A;
    --tx-sub:     #4B3D6E;
    --tx-muted:   #8a70a8;
    --pur-soft:   #f3e8ff;
    --pur-mid:    #c084fc;
    --sh-sm:  0 1px 3px rgba(92,3,155,0.07), 0 1px 2px rgba(0,0,0,0.04);
    --sh-md:  0 4px 16px rgba(92,3,155,0.11), 0 2px 4px rgba(0,0,0,0.04);
    --sh-lg:  0 14px 40px rgba(92,3,155,0.15), 0 4px 8px rgba(0,0,0,0.06);
    --sh-card:0 2px 8px rgba(92,3,155,0.07);
    --rad:    12px;
    --rad-sm: 8px;
    --rad-xs: 6px;
  }

  *, *::before, *::after { box-sizing: border-box; }

  .xp-root {
    padding: 32px 36px 64px;
    background: var(--bg);
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    color: var(--tx);
  }

  .xp-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1.5px solid var(--border);
  }
  .xp-title {
    font-family: 'Sora', sans-serif !important;
    font-size: 26px !important;
    font-weight: 700 !important;
    color: var(--tx) !important;
    margin: 0 !important;
    line-height: 1.15 !important;
    letter-spacing: -0.4px;
  }
  .xp-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: var(--tx-muted);
    margin: 4px 0 0;
  }

  .xp-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--rad);
    overflow: hidden;
    box-shadow: var(--sh-card);
    transition: box-shadow 0.24s, transform 0.24s, border-color 0.2s;
  }
  .xp-card:hover {
    box-shadow: var(--sh-lg);
    transform: translateY(-3px);
    border-color: var(--pur-mid);
  }

  .xp-top-card {
    border-radius: var(--rad);
    padding: 20px;
    transition: all 0.24s;
    border: 1.5px solid transparent;
  }
  .xp-top-card:hover {
    transform: translateY(-3px);
  }
  .xp-top-card.rank-1 {
    background: linear-gradient(135deg, #5c039b 0%, #8b5cf6 100%);
    border-color: #5c039b;
    color: #ffffff;
    box-shadow: 0 10px 25px -5px rgba(92, 3, 155, 0.4);
  }
  .xp-top-card.rank-1:hover {
    box-shadow: 0 15px 35px -5px rgba(92, 3, 155, 0.6);
  }
  .xp-top-card.rank-1 .ant-typography, .xp-top-card.rank-1 .xp-card-metric {
    color: #ffffff !important;
  }
  .xp-top-card.rank-2 {
    background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
    border-color: #7c3aed;
    color: #ffffff;
    box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.3);
  }
  .xp-top-card.rank-2:hover {
    box-shadow: 0 15px 30px -5px rgba(124, 58, 237, 0.5);
  }
  .xp-top-card.rank-2 .ant-typography, .xp-top-card.rank-2 .xp-card-metric {
    color: #ffffff !important;
  }
  .xp-top-card.rank-3 {
    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    border-color: #c084fc;
    color: #5c039b;
    box-shadow: var(--sh-card);
  }
  .xp-top-card.rank-3:hover {
    box-shadow: var(--sh-lg);
  }
  .xp-top-card.rank-3 .ant-typography, .xp-top-card.rank-3 .xp-card-metric {
    color: #5c039b !important;
  }

  .xp-table .ant-table {
    background: transparent;
    font-family: 'Inter', sans-serif;
  }
  .xp-table .ant-table-thead > tr > th {
    background: var(--surface2);
    color: var(--tx-sub);
    font-weight: 600;
    font-size: 12px;
    border-bottom: 1.5px solid var(--border);
  }
  .xp-table .ant-table-tbody > tr > td {
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .xp-table .ant-table-tbody > tr:hover > td {
    background: var(--pur-soft);
  }

  /* Custom tabs to match the purple theme */
  .xp-tabs .ant-tabs-nav::before {
    border-bottom: 1.5px solid var(--border) !important;
  }
  .xp-tabs .ant-tabs-tab {
    color: var(--tx-muted) !important;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  }
  .xp-tabs .ant-tabs-tab:hover {
    color: var(--sb-accent) !important;
  }
  .xp-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--sb-accent) !important;
    font-weight: 600 !important;
  }
  .xp-tabs .ant-tabs-ink-bar {
    background: var(--sb-accent) !important;
    height: 3px !important;
    border-radius: 3px 3px 0 0;
  }

  /* Spin loader purple style */
  .ant-spin {
    color: var(--sb-accent) !important;
  }
  .ant-spin-dot-item {
    background-color: var(--sb-accent) !important;
  }

  /* Table pagination styles - strictly purple theme */
  .xp-table .ant-pagination {
    margin: 16px 24px !important;
  }
  .xp-table .ant-pagination-item {
    border-color: var(--border) !important;
    background: var(--surface) !important;
    border-radius: var(--rad-sm) !important;
    transition: all 0.2s;
  }
  .xp-table .ant-pagination-item a {
    color: var(--tx-sub) !important;
    font-family: 'Inter', sans-serif !important;
  }
  .xp-table .ant-pagination-item-active {
    background: var(--sb-accent) !important;
    border-color: var(--sb-accent) !important;
  }
  .xp-table .ant-pagination-item-active a {
    color: #ffffff !important;
  }
  .xp-table .ant-pagination-prev .ant-pagination-item-link,
  .xp-table .ant-pagination-next .ant-pagination-item-link {
    border-color: var(--border) !important;
    background: var(--surface) !important;
    border-radius: var(--rad-sm) !important;
    color: var(--tx-sub) !important;
    transition: all 0.2s;
  }
  .xp-table .ant-pagination-item:hover,
  .xp-table .ant-pagination-prev:hover .ant-pagination-item-link,
  .xp-table .ant-pagination-next:hover .ant-pagination-item-link {
    border-color: var(--pur-mid) !important;
    background: var(--pur-soft) !important;
  }
  .xp-table .ant-pagination-item:hover a {
    color: var(--sb-accent) !important;
  }
  .xp-table .ant-pagination-disabled .ant-pagination-item-link {
    border-color: var(--border) !important;
    color: var(--tx-muted) !important;
    opacity: 0.5;
    background: var(--surface) !important;
  }

  @keyframes xp-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .xp-animate { animation: xp-up 0.38s ease both; }
`;

const AdvisorLeaderboard = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [period, setPeriod] = useState("weekly");

  useEffect(() => {
    const loadPerformance = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(`/gridadvisor/leaderboard?period=${period}`);
        const leaderboardData = res?.data?.leaderboard;
        setRows(Array.isArray(leaderboardData) ? leaderboardData : []);
      } catch (error) {
        console.error("Failed to load advisor leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, [period]);

  const topThree = rows.slice(0, 3);

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      width: 80,
      render: (rank) => <Text strong style={{ color: 'var(--sb-accent)' }}>#{rank}</Text>,
    },
    {
      title: "Advisor",
      dataIndex: "name",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
          <Avatar 
            src={row.profilePhotoUrl} 
            style={{ 
              background: row.rank === 1 || row.rank === 2 ? "#ffffff" : "var(--sb-accent)",
              color: row.rank === 1 || row.rank === 2 ? "var(--sb-accent)" : "#ffffff"
            }} 
            icon={row.rank === 1 ? <TrophyOutlined /> : <UserOutlined />} 
          />
          <div>
            <Text strong style={{ fontFamily: 'Sora, sans-serif', color: 'var(--tx)' }}>{row.name}</Text>
            <div style={{ fontSize: 12, color: "var(--tx-muted)" }}>{row.email || "-"}</div>
            <div style={{ fontSize: 11, color: "var(--pur-mid)" }}>Employee ID: {row.employeeId || "-"}</div>
          </div>
        </div>
      ),
    },
    { title: "Department", dataIndex: "department", width: 150 },
    { title: "Total Leads", dataIndex: "totalLeads", sorter: (a, b) => a.totalLeads - b.totalLeads },
    { title: "Active Leads", dataIndex: "activeLeads", sorter: (a, b) => a.activeLeads - b.activeLeads },
    { title: "Converted", dataIndex: "convertedLeads", sorter: (a, b) => a.convertedLeads - b.convertedLeads },
    {
      title: "Conversion Rate",
      dataIndex: "conversionRate",
      width: 170,
      render: (value = 0) => (
        <Progress 
          percent={value} 
          size="small" 
          strokeColor={{
            '0%': 'var(--pur-mid)',
            '100%': 'var(--sb-accent)',
          }}
          trailColor="var(--pur-soft)"
        />
      ),
    },
    {
      title: "Composite Score",
      dataIndex: "compositeScore",
      width: 140,
      sorter: (a, b) => a.compositeScore - b.compositeScore,
      render: (score) => <Text strong style={{ color: 'var(--sb-accent)' }}>{score} pts</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const isActive = status === "active";
        return (
          <Tag 
            style={{
              backgroundColor: isActive ? "rgba(92, 3, 155, 0.08)" : "rgba(192, 132, 252, 0.08)",
              color: isActive ? "var(--sb-accent)" : "var(--pur-mid)",
              borderColor: isActive ? "rgba(92, 3, 155, 0.2)" : "rgba(192, 132, 252, 0.2)",
              borderRadius: "4px",
              fontWeight: 500,
            }}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Inactive"}
          </Tag>
        );
      }
    },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="xp-root">
        <div className="xp-header">
          <div>
            <Title className="xp-title">Advisor Leaderboard</Title>
            <p className="xp-subtitle">Internal advisor ranking by total leads, conversions, and composite score for assignment decisions.</p>
          </div>
        </div>

        <Tabs
          activeKey={period}
          onChange={setPeriod}
          style={{ marginBottom: 20 }}
          className="xp-tabs"
        >
          <Tabs.TabPane tab="Weekly" key="weekly" />
          <Tabs.TabPane tab="Monthly" key="monthly" />
          <Tabs.TabPane tab="Quarterly" key="quarterly" />
          <Tabs.TabPane tab="Annual" key="annual" />
          <Tabs.TabPane tab="Trust Ranking" key="trust" />
        </Tabs>

        <Spin spinning={loading}>
          {rows.length ? (
            <>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {topThree.map((advisor, index) => (
                  <Col xs={24} md={8} key={advisor._id} className="xp-animate" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className={`xp-top-card rank-${advisor.rank}`}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <Avatar 
                          size={56} 
                          src={advisor.profilePhotoUrl} 
                          style={{ 
                            background: advisor.rank === 1 || advisor.rank === 2 ? "#ffffff" : "var(--sb-accent)",
                            color: advisor.rank === 1 || advisor.rank === 2 ? "var(--sb-accent)" : "#ffffff"
                          }} 
                          icon={advisor.rank === 1 ? <TrophyOutlined /> : <FireOutlined />} 
                        />
                        <div style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: 600, color: 'inherit', opacity: 0.85 }}>Rank #{advisor.rank}</Text>
                          <Title level={5} style={{ margin: "2px 0", fontFamily: 'Sora, sans-serif' }}>{advisor.name}</Title>
                          <div className="xp-card-metric" style={{ fontWeight: 600, fontSize: 13 }}>
                            {period === 'trust' ? (
                              <span>Score: <strong>{advisor.compositeScore}</strong> pts</span>
                            ) : (
                              <span>Conv. Rate: <strong>{advisor.conversionRate}%</strong> ({advisor.convertedLeads}/{advisor.totalLeads})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="xp-card">
                <Table 
                  className="xp-table"
                  columns={columns} 
                  dataSource={rows} 
                  rowKey="_id" 
                  pagination={{ pageSize: 10 }} 
                  scroll={{ x: 1200 }} 
                  locale={{
                    emptyText: (
                      <div style={{ padding: 32, textAlign: 'center' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                        <Text style={{ color: "var(--tx-muted)", fontSize: 13 }}>No records found</Text>
                      </div>
                    )
                  }}
                />
              </div>
            </>
          ) : (
            <div className="xp-card">
              <div style={{ padding: 72, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.35 }}>🏆</div>
                <Text style={{ fontSize: 14, color: "var(--tx-muted)" }}>No advisor activity yet</Text>
              </div>
            </div>
          )}
        </Spin>
      </div>
    </>
  );
};

export default AdvisorLeaderboard;
