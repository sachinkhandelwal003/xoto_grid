import React, { useState, useEffect } from "react";
import {
  Card, Row, Col, Table, Select, DatePicker, Button, Tag,
  Typography, Space, Empty, Spin, Tooltip, Statistic
} from "antd";
import {
  FileExcelOutlined, FilePdfOutlined, SearchOutlined,
  ReloadOutlined, FilterOutlined, CalendarOutlined, DownloadOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { apiService } from "@/api/apiService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function GridListingReports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  useEffect(() => {
    fetchListingReportData();
  }, []);

  const fetchListingReportData = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockData = [
        {
          id: 1,
          listingId: "LST001",
          propertyTitle: "2BHK Apartment - Bandra, Mumbai",
          agentName: "John Doe",
          listingDate: dayjs().subtract(20, 'days').format('YYYY-MM-DD'),
          status: "active",
          views: 150,
          inquiries: 12,
          leads: 3,
          price: 5000000,
          city: "Mumbai",
          propertyType: "Apartment"
        },
        {
          id: 2,
          listingId: "LST002",
          propertyTitle: "3BHK Villa - Koregaon Park, Pune",
          agentName: "Jane Smith",
          listingDate: dayjs().subtract(15, 'days').format('YYYY-MM-DD'),
          status: "active",
          views: 220,
          inquiries: 18,
          leads: 5,
          price: 8500000,
          city: "Pune",
          propertyType: "Villa"
        },
        {
          id: 3,
          listingId: "LST003",
          propertyTitle: "1BHK Studio - Indiranagar, Bangalore",
          agentName: "Mike Johnson",
          listingDate: dayjs().subtract(10, 'days').format('YYYY-MM-DD'),
          status: "sold",
          views: 95,
          inquiries: 8,
          leads: 2,
          price: 3500000,
          city: "Bangalore",
          propertyType: "Studio"
        },
        {
          id: 4,
          listingId: "LST004",
          propertyTitle: "4BHK House - New Delhi",
          agentName: "John Doe",
          listingDate: dayjs().subtract(5, 'days').format('YYYY-MM-DD'),
          status: "active",
          views: 310,
          inquiries: 25,
          leads: 8,
          price: 12000000,
          city: "Delhi",
          propertyType: "House"
        },
        {
          id: 5,
          listingId: "LST005",
          propertyTitle: "2BHK Apartment - Baner, Pune",
          agentName: "Sarah Wilson",
          listingDate: dayjs().subtract(25, 'days').format('YYYY-MM-DD'),
          status: "inactive",
          views: 45,
          inquiries: 3,
          leads: 0,
          price: 4200000,
          city: "Pune",
          propertyType: "Apartment"
        }
      ];

      // Extract unique agents
      const uniqueAgents = [...new Set(mockData.map(d => d.agentName))];
      setAgents(uniqueAgents);
      setReportData(mockData);
    } catch (error) {
      console.error("Error fetching listing reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Listing ID",
      dataIndex: "listingId",
      key: "listingId",
      width: 100,
      sorter: (a, b) => a.listingId.localeCompare(b.listingId)
    },
    {
      title: "Property",
      dataIndex: "propertyTitle",
      key: "propertyTitle",
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: "Agent",
      dataIndex: "agentName",
      key: "agentName",
      width: 120,
      filters: agents.map(a => ({ text: a, value: a })),
      onFilter: (value, record) => record.agentName === value
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        const statusConfig = {
          active: { color: "green", text: "Active" },
          sold: { color: "blue", text: "Sold" },
          inactive: { color: "default", text: "Inactive" }
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: "Type",
      dataIndex: "propertyType",
      key: "propertyType",
      width: 100
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      width: 100,
      filters: [...new Set(reportData.map(d => d.city))].map(c => ({ text: c, value: c }))
    },
    {
      title: "Views",
      dataIndex: "views",
      key: "views",
      width: 80,
      sorter: (a, b) => a.views - b.views,
      render: (views) => <Text strong>{views}</Text>
    },
    {
      title: "Inquiries",
      dataIndex: "inquiries",
      key: "inquiries",
      width: 100,
      sorter: (a, b) => a.inquiries - b.inquiries,
      render: (inquiries) => <Text strong className="text-blue-600">{inquiries}</Text>
    },
    {
      title: "Leads",
      dataIndex: "leads",
      key: "leads",
      width: 80,
      sorter: (a, b) => a.leads - b.leads,
      render: (leads) => <Text strong className="text-green-600">{leads}</Text>
    },
    {
      title: "Price (₹)",
      dataIndex: "price",
      key: "price",
      width: 140,
      render: (price) => <Text strong>{(price / 1000000).toFixed(1)}Cr</Text>,
      sorter: (a, b) => a.price - b.price
    }
  ];

  const stats = [
    {
      label: "Total Listings",
      value: reportData.length,
      color: "#1890ff"
    },
    {
      label: "Active Listings",
      value: reportData.filter(d => d.status === 'active').length,
      color: "#52c41a"
    },
    {
      label: "Total Views",
      value: reportData.reduce((sum, d) => sum + d.views, 0),
      color: "#faad14"
    },
    {
      label: "Total Leads",
      value: reportData.reduce((sum, d) => sum + d.leads, 0),
      color: "#ff4d4f"
    }
  ];

  const handleExportExcel = () => {
    alert("Export to Excel functionality would be implemented here");
  };

  const handleExportPDF = () => {
    alert("Export to PDF functionality would be implemented here");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Title level={2}>
          <HomeOutlined /> Listing Reports
        </Title>
        <Text type="secondary">
          Property listing performance and engagement metrics
        </Text>
      </div>

      {/* Filters */}
      <Card className="mb-6" bordered={false}>
        <Space wrap>
          <Select
            placeholder="Filter by Agent"
            style={{ width: 200 }}
            allowClear
            onChange={setSelectedAgent}
            options={agents.map(a => ({ label: a, value: a }))}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchListingReportData}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        {stats.map((stat, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title={stat.label}
                value={stat.value}
                valueStyle={{ color: stat.color, fontSize: "28px", fontWeight: "bold" }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Listing Table */}
      <Card bordered={false} className="shadow-sm">
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            total: reportData.length
          }}
        />
      </Card>
    </div>
  );
}
