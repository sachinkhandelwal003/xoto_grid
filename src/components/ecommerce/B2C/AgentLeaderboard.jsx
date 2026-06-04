import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Empty,
  Progress,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;
const { Option } = Select;

const formatMoney = (value) =>
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value || 0);

const trendTag = (value, suffix = "%") => {
  const isUp = Number(value || 0) >= 0;
  return (
    <Tag color={isUp ? "green" : "red"} style={{ margin: 0 }}>
      {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value || 0)}
      {suffix}
    </Tag>
  );
};

const Metric = ({ icon, label, value, change, suffix = "%" }) => (
  <div className="performance-metric">
    <div className="metric-icon">{icon}</div>
    <div className="min-w-0">
      <Text type="secondary" className="block text-xs">{label}</Text>
      <div className="flex flex-wrap items-center gap-2">
        <Text strong className="metric-value">{value}</Text>
        {change !== undefined && trendTag(change, suffix)}
      </div>
    </div>
  </div>
);

const AgentLeaderboard = () => {
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);

  const fetchPerformance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiService.get("agent/leaderboard", { range });
      setPerformanceData(res?.data || null);
    } catch (err) {
      console.error("Failed to fetch agent performance", err);
      message.error("Failed to load performance");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const current = performanceData?.current || {};
  const previous = performanceData?.previous || {};
  const trend = performanceData?.trend || {};
  const chartData = performanceData?.performance_trend || [];
  const isUp = trend.direction !== "down";

  return (
    <Spin spinning={loading}>
      <div className="agent-leaderboard min-h-screen bg-[#f6f8fb] px-3 py-4 sm:px-5 lg:px-6">
        <style>{`
          .agent-leaderboard .ant-card {
            border: 1px solid #e8edf5 !important;
            border-radius: 10px !important;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04) !important;
          }

          .agent-leaderboard .ant-card-body {
            padding: 20px !important;
          }

          .agent-leaderboard .performance-metric {
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 82px;
            border: 1px solid #edf2f7;
            border-radius: 8px;
            background: #f8fafc;
            padding: 12px;
          }

          .agent-leaderboard .metric-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: #f3e8ff;
            color: #5C039B;
            font-size: 18px;
            flex-shrink: 0;
          }

          .agent-leaderboard .metric-value {
            color: #0f172a;
            font-size: 22px;
            line-height: 1.2;
          }

          .agent-leaderboard .metric-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
          }

          .agent-leaderboard .summary-band {
            border: 1px solid ${isUp ? "#bbf7d0" : "#fecaca"};
            background: ${isUp ? "#f0fdf4" : "#fef2f2"};
            border-radius: 10px;
            padding: 14px;
          }

          .agent-leaderboard .chart-box {
            height: 300px;
            margin-top: 18px;
          }

          @media (max-width: 1024px) {
            .agent-leaderboard .metric-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 560px) {
            .agent-leaderboard .metric-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <Card>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Text type="secondary" style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>
                Agent Performance
              </Text>
              <Title level={3} style={{ margin: 0, fontWeight: 900, color: "#0f172a" }}>
                My Progress
              </Title>
              <Text type="secondary">
                Your own lead and conversion movement for the selected period.
              </Text>
            </div>
            <Select value={range} onChange={setRange} style={{ width: 170 }}>
              <Option value="7d">Last 7 Days</Option>
              <Option value="30d">Last 30 Days</Option>
              <Option value="90d">Last 90 Days</Option>
            </Select>
          </div>

          {performanceData ? (
            <>
              <div className="summary-band mb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Text strong style={{ color: isUp ? "#166534" : "#991b1b" }}>
                      {isUp ? "Performance is moving up" : "Performance is moving down"}
                    </Text>
                    <Text type="secondary" className="block">
                      Compared with the previous {performanceData.days_window || 30} days.
                    </Text>
                  </div>
                  {trendTag(trend.progress_change || 0, " pts")}
                </div>
                <Progress
                  percent={current.progress_score || 0}
                  strokeColor={isUp ? "#16a34a" : "#dc2626"}
                  trailColor="#e5e7eb"
                  style={{ marginTop: 10 }}
                />
              </div>

              <div className="metric-grid">
                <Metric
                  icon={<TeamOutlined />}
                  label="Total Leads Given"
                  value={current.total_leads || 0}
                  change={trend.leads_change || 0}
                />
                <Metric
                  icon={<CheckCircleOutlined />}
                  label="Conversions"
                  value={`${current.conversion_rate || 0}%`}
                  change={trend.conversion_change || 0}
                />
                <Metric
                  icon={<RiseOutlined />}
                  label="Closed Deals"
                  value={current.completed_deals || 0}
                  change={trend.deals_change || 0}
                />
                <Metric
                  icon={<DollarOutlined />}
                  label="Commission"
                  value={formatMoney(current.earnings || 0)}
                />
              </div>

              <div className="chart-box">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5C039B" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#5C039B" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="leads" stroke="#5C039B" fill="url(#leadsFill)" strokeWidth={2} />
                      <Area type="monotone" dataKey="conversions" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No performance trend yet" />
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <Text type="secondary" className="block text-xs">Current period</Text>
                  <Text strong>
                    {current.total_leads || 0} leads, {current.completed_deals || 0} conversions, {current.in_progress_leads || 0} in progress
                  </Text>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <Text type="secondary" className="block text-xs">Previous period</Text>
                  <Text strong>
                    {previous.total_leads || 0} leads, {previous.completed_deals || 0} conversions, {previous.in_progress_leads || 0} in progress
                  </Text>
                </div>
              </div>
            </>
          ) : (
            <Empty description="No performance data yet" />
          )}
        </Card>
      </div>
    </Spin>
  );
};

export default AgentLeaderboard;
