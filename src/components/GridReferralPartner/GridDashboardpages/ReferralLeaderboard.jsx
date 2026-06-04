import { useState, useEffect } from "react";
import { Card, Tabs, Table, Tag, Spin, message, Typography } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { apiService } from "../../../manageApi/utils/custom.apiservice"; // adjust path

const { Title } = Typography;

const THEME = {
  primary: "#5c039b",
  primaryLight: "#f3e8ff",
  success: "#16a34a",
  gray: "#64748b",
};

const ReferralLeaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period]);

  const fetchLeaderboard = async (selectedPeriod) => {
    setLoading(true);
    try {
      const res = await apiService.get(
        `/referral/leaderboard?period=${selectedPeriod}`
      );
      setData(res.data?.leaderboard || []);
    } catch (err) {
      message.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank) => (
        <span style={{ fontWeight: 700, fontSize: 16 }}>
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
        </span>
      ),
    },
    {
      title: "Partner",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>{text}</span>
          {record.isCurrentUser && (
            <Tag color="purple" style={{ borderRadius: 20, fontSize: 11 }}>
              You
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Earnings (AED)",
      dataIndex: "earnings",
      key: "earnings",
      align: "right",
      render: (value) => value.toLocaleString(),
    },
    {
      title: "Conversion Rate",
      dataIndex: "conversionRate",
      key: "conversionRate",
      align: "right",
    },
  ];

  return (
    <div style={{ padding: "28px 32px", background: "#faf5ff", minHeight: "100vh" }}>
      <Title level={3} style={{ color: THEME.primary, marginBottom: 24 }}>
        <TrophyOutlined style={{ marginRight: 8 }} /> Referral Partner Leaderboard
      </Title>

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          border: `1px solid ${THEME.border}`,
          boxShadow: "0 1px 4px rgba(92,3,155,0.06)",
        }}
      >
        <Tabs
          activeKey={period}
          onChange={setPeriod}
          tabBarStyle={{ marginBottom: 24 }}
        >
          <Tabs.TabPane tab="Monthly" key="monthly" />
          <Tabs.TabPane tab="Weekly" key="weekly" />
          <Tabs.TabPane tab="Quarterly" key="quarterly" />
          <Tabs.TabPane tab="Annual" key="annual" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="rank"
          loading={loading}
          pagination={false}
          size="middle"
          rowClassName={(record) =>
            record.isCurrentUser ? "leaderboard-current-row" : ""
          }
        />
      </Card>

      {/* Quick inline style for highlighted row */}
      <style>{`
        .leaderboard-current-row {
          background: ${THEME.primaryLight};
        }
        .leaderboard-current-row:hover > td {
          background: #ede0ff !important;
        }
      `}</style>
    </div>
  );
};

export default ReferralLeaderboard;