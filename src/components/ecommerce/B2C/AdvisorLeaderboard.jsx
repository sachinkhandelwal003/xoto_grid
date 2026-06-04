import React, { useEffect, useState } from "react";
import { Avatar, Card, Col, Empty, Progress, Row, Spin, Table, Tag, Typography } from "antd";
import { DollarOutlined, FireOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');

  :root {
    --sb-dark:    #1E0A3C;
    --sb-mid:     #2D1560;
    --sb-accent:  #7B2FBE;
    --sb-green:   #22C55E;
    --sb-green2:  #16A34A;
    --bg:         #F5F4F8;
    --surface:    #FFFFFF;
    --surface2:   #F0EEF5;
    --surface3:   #E8E4F2;
    --border:     #E2DDF0;
    --border2:    #C9C0E2;
    --tx:         #140D2A;
    --tx-sub:     #4B3D6E;
    --tx-muted:   #8E82AA;
    --pur-soft:   #EDE5F9;
    --pur-mid:    #C4A8F0;
    --sh-sm:  0 1px 3px rgba(123,47,190,0.07), 0 1px 2px rgba(0,0,0,0.04);
    --sh-md:  0 4px 16px rgba(123,47,190,0.11), 0 2px 4px rgba(0,0,0,0.04);
    --sh-lg:  0 14px 40px rgba(123,47,190,0.15), 0 4px 8px rgba(0,0,0,0.06);
    --sh-card:0 2px 8px rgba(123,47,190,0.07);
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
    background: linear-gradient(135deg, var(--surface) 0%, var(--pur-soft) 100%);
    border: 1.5px solid var(--border);
    border-radius: var(--rad);
    padding: 20px;
    box-shadow: var(--sh-card);
    transition: all 0.24s;
  }
  .xp-top-card:hover {
    box-shadow: var(--sh-lg);
    transform: translateY(-3px);
    border-color: var(--pur-mid);
  }
  .xp-top-card.rank-1 {
    background: linear-gradient(135deg, #FFF7ED 0%, #FDE68A 100%);
    border-color: #F59E0B;
  }
  .xp-top-card.rank-2 {
    background: linear-gradient(135deg, #F3F4F6 0%, #D1D5DB 100%);
    border-color: #9CA3AF;
  }
  .xp-top-card.rank-3 {
    background: linear-gradient(135deg, #FFF7ED 0%, #FDBA74 100%);
    border-color: #F97316;
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

  @keyframes xp-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .xp-animate { animation: xp-up 0.38s ease both; }
`;

const AdvisorLeaderboard = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const loadPerformance = async () => {
      setLoading(true);
      try {
        const res = await apiService.get("gridadvisor/leaderboard", { limit: 100 });
        const leaderboardData = res?.data?.leaderboard;
        setRows(Array.isArray(leaderboardData) ? leaderboardData : []);
      } catch (error) {
        console.error("Failed to load advisor leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  const topThree = rows.slice(0, 3);

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      width: 80,
      render: (rank) => <Text strong style={{ color: rank <= 3 ? '#7B2FBE' : '#140D2A' }}>#{rank}</Text>,
    },
    {
      title: "Advisor",
      dataIndex: "name",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
          <Avatar 
            src={row.profilePhotoUrl} 
            style={{ 
              background: row.rank === 1 ? "#F59E0B" : row.rank === 2 ? "#9CA3AF" : row.rank === 3 ? "#F97316" : "#7B2FBE" 
            }} 
            icon={row.rank === 1 ? <TrophyOutlined /> : <UserOutlined />} 
          />
          <div>
            <Text strong style={{ fontFamily: 'Sora, sans-serif', color: '#140D2A' }}>{row.name}</Text>
            <div style={{ fontSize: 12, color: "#8E82AA" }}>{row.email || "-"}</div>
            <div style={{ fontSize: 11, color: "#A0AEC0" }}>Employee ID: {row.employeeId || "-"}</div>
          </div>
        </div>
      ),
    },
    { title: "Department", dataIndex: "department", width: 150 },
    { title: "Total Leads", dataIndex: "totalLeads", sorter: (a, b) => a.totalLeads - b.totalLeads },
    { title: "Active Leads", dataIndex: "activeLeads", sorter: (a, b) => a.activeLeads - b.activeLeads },
    { title: "Converted", dataIndex: "convertedLeads", sorter: (a, b) => a.convertedLeads - b.convertedLeads },
    {
      title: "Conversion",
      dataIndex: "conversionRate",
      width: 170,
      render: (value = 0) => <Progress percent={value} size="small" strokeColor={value >= 25 ? "#16A34A" : "#7B2FBE"} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <Tag color={status === "active" ? "green" : "default"}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : "Inactive"}</Tag>,
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
                            background: advisor.rank === 1 ? "#F59E0B" : advisor.rank === 2 ? "#9CA3AF" : advisor.rank === 3 ? "#F97316" : "#7B2FBE" 
                          }} 
                          icon={advisor.rank === 1 ? <TrophyOutlined /> : <FireOutlined />} 
                        />
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>Rank #{advisor.rank}</Text>
                          <Title level={5} style={{ margin: "2px 0", fontFamily: 'Sora, sans-serif' }}>{advisor.name}</Title>
                          <Text strong style={{ color: advisor.rank === 1 ? "#D97706" : "#7B2FBE" }}>
                            <DollarOutlined /> {advisor.totalLeads} leads
                          </Text>
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
                />
              </div>
            </>
          ) : (
            <div className="xp-card">
              <div style={{ padding: 72, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.35 }}>🏆</div>
                <Text type="secondary" style={{ fontSize: 14 }}>No advisor activity yet</Text>
              </div>
            </div>
          )}
        </Spin>
      </div>
    </>
  );
};

export default AdvisorLeaderboard;
