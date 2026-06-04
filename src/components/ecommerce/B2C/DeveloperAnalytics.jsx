import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Breadcrumb,
  Progress,
  Tag,
  Space,
  Spin,
  Empty
} from "antd";

import {
  FundOutlined,
  RiseOutlined,
  ProjectOutlined,
  TeamOutlined,
  EyeOutlined,
  StarOutlined
} from "@ant-design/icons";

import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title, Text } = Typography;

export default function DeveloperAnalytics() {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("/properties/developer/analytics");
      if (res?.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const columns = [
    {
      title: "Project",
      dataIndex: "project",
      render: (text) => <strong>{text}</strong>
    },
    {
      title: "Views",
      dataIndex: "views",
      render: (v) => (
        <Tag color="blue" icon={<EyeOutlined />}>{v}</Tag>
      )
    },
    {
      title: "Wishlists",
      dataIndex: "wishlists",
      render: (v) => (
        <Tag color="gold" icon={<StarOutlined />}>{v}</Tag>
      )
    },
    {
      title: "Bookings",
      dataIndex: "bookings",
      render: (v) => <Tag color="green">{v}</Tag>
    },
    {
      title: "Available",
      dataIndex: "available",
      render: (v) => <Tag color="blue">{v}</Tag>
    },
    {
      title: "Reserved",
      dataIndex: "reserved",
      render: (v) => <Tag color="orange">{v}</Tag>
    },
    {
      title: "Sold",
      dataIndex: "sold",
      render: (v) => <Tag color="green">{v}</Tag>
    }
  ];

  if (loading) {
    return (
      <div style={{ background: "#f6f8fb", minHeight: "100vh", padding: 24, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh", padding: 24 }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 18 }}>
        <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item>Analytics</Breadcrumb.Item>
      </Breadcrumb>

      {/* HEADER */}
      <Card
        style={{
          borderRadius: 14,
          marginBottom: 20,
          background: "linear-gradient(135deg,#5c039b 0%,#7b2cbf 100%)",
          border: "none"
        }}
        bodyStyle={{ padding: 26 }}
      >
        <Title level={3} style={{ color: "white", marginBottom: 4 }}>
          Developer Analytics
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.85)" }}>
          Monitor project performance, leads conversion and sales insights.
        </Text>
      </Card>

      {/* LISTING STATUS CARDS */}
      {analyticsData?.listingsByStatus && (
        <Row gutter={[18, 18]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 14 }}>
              <Statistic
                title="Live Listings"
                value={analyticsData.listingsByStatus.live}
                prefix={<ProjectOutlined style={{ color: "#10b981" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 14 }}>
              <Statistic
                title="Pending Approval"
                value={analyticsData.listingsByStatus.pendingApproval}
                prefix={<TeamOutlined style={{ color: "#f59e0b" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 14 }}>
              <Statistic
                title="Draft"
                value={analyticsData.listingsByStatus.draft}
                prefix={<FundOutlined style={{ color: "#64748b" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 14 }}>
              <Statistic
                title="Rejected"
                value={analyticsData.listingsByStatus.rejected}
                prefix={<TeamOutlined style={{ color: "#ef4444" }} />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* STAT CARDS */}
      <Row gutter={[18, 18]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 14 }}>
            <Statistic
              title="Total Views"
              value={analyticsData?.totalListingViews || 0}
              prefix={<EyeOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 14 }}>
            <Statistic
              title="Total Wishlists"
              value={analyticsData?.totalWishlists || 0}
              prefix={<StarOutlined style={{ color: "#f59e0b" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 14 }}>
            <Statistic
              title="Total Deals Closed"
              value={analyticsData?.totalDealsClosed || 0}
              prefix={<ProjectOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 14 }}>
            <Statistic
              title="Conversion Rate"
              value={
                analyticsData?.totalListingViews > 0
                  ? Math.round((analyticsData.totalDealsClosed / analyticsData.totalListingViews) * 100)
                  : 0
              }
              suffix="%"
              prefix={<RiseOutlined style={{ color: "#faad14" }} />}
            />
            <Progress
              percent={
                analyticsData?.totalListingViews > 0
                  ? Math.round((analyticsData.totalDealsClosed / analyticsData.totalListingViews) * 100)
                  : 0
              }
              size="small"
              strokeColor="#faad14"
            />
          </Card>
        </Col>
      </Row>

      {/* PROJECT PERFORMANCE TABLE */}
      <Card
        style={{
          marginTop: 22,
          borderRadius: 14,
          boxShadow: "0 6px 22px rgba(0,0,0,0.05)"
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={5} style={{ marginBottom: 0 }}>
            Project Performance
          </Title>
          <Text type="secondary">
            Overview of views, wishlists, bookings and inventory per project.
          </Text>

          {analyticsData?.projectPerformance && analyticsData.projectPerformance.length > 0 ? (
            <Table
              columns={columns}
              dataSource={analyticsData.projectPerformance}
              pagination={{ pageSize: 5 }}
            />
          ) : (
            <Empty description="No project data yet" />
          )}
        </Space>
      </Card>
    </div>
  );
}  