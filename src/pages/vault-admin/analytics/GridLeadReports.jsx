import React, { useState, useEffect } from "react";
import {
  Card, Row, Col, Table, Select, DatePicker, Button, Tag,
  Typography, Space, Empty, Spin, Tooltip, Progress
} from "antd";
import {
  FileExcelOutlined, FilePdfOutlined, SearchOutlined,
  ReloadOutlined, FilterOutlined, CalendarOutlined, DownloadOutlined
} from "@ant-design/icons";
import { apiService } from "@/api/apiService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function GridLeadReports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  useEffect(() => {
    fetchLeadReportData();
  }, []);

  const fetchLeadReportData = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const mockData = [
        {
          id: 1,
          leadId: "LD001",
          agentName: "John Doe",
          leadTitle: "2BHK Apartment - Mumbai",
          status: "qualified",
          createdDate: dayjs().subtract(5, 'days').format('YYYY-MM-DD'),
          convertedDate: dayjs().subtract(2, 'days').format('YYYY-MM-DD'),
          daysToConversion: 3,
          value: 50000,
          source: "Website"
        },
        {
          id: 2,
          leadId: "LD002",
          agentName: "Jane Smith",
          leadTitle: "3BHK Villa - Pune",
          status: "in-progress",
          createdDate: dayjs().subtract(10, 'days').format('YYYY-MM-DD'),
          convertedDate: null,
          daysToConversion: 10,
          value: 75000,
          source: "Referral"
        },
        {
          id: 3,
          leadId: "LD003",
          agentName: "Mike Johnson",
          leadTitle: "1BHK Studio - Bangalore",
          status: "qualified",
          createdDate: dayjs().subtract(15, 'days').format('YYYY-MM-DD'),
          convertedDate: dayjs().subtract(8, 'days').format('YYYY-MM-DD'),
          daysToConversion: 7,
          value: 35000,
          source: "Advertisement"
        },
        {
          id: 4,
          leadId: "LD004",
          agentName: "John Doe",
          leadTitle: "4BHK House - Delhi",
          status: "lost",
          createdDate: dayjs().subtract(20, 'days').format('YYYY-MM-DD'),
          convertedDate: null,
          daysToConversion: null,
          value: 120000,
          source: "Website"
        }
      ];

      // Extract unique advisors
      const uniqueAdvisors = [...new Set(mockData.map(d => d.agentName))];
      setAdvisors(uniqueAdvisors);
      setReportData(mockData);
    } catch (error) {
      console.error("Error fetching lead reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Lead ID",
      dataIndex: "leadId",
      key: "leadId",
      width: 100,
      sorter: (a, b) => a.leadId.localeCompare(b.leadId)
    },
    {
      title: "Lead Title",
      dataIndex: "leadTitle",
      key: "leadTitle",
      render: (text) => <Text ellipsis>{text}</Text>
    },
    {
      title: "Agent",
      dataIndex: "agentName",
      key: "agentName",
      width: 150,
      filters: advisors.map(a => ({ text: a, value: a })),
      onFilter: (value, record) => record.agentName === value
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          qualified: { color: "green", text: "Qualified" },
          "in-progress": { color: "processing", text: "In Progress" },
          lost: { color: "red", text: "Lost" }
        };
        const config = statusConfig[status] || { color: "default", text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 120
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 130,
      sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
    },
    {
      title: "Days to Conversion",
      dataIndex: "daysToConversion",
      key: "daysToConversion",
      width: 130,
      render: (days) => days ? <Text>{days} days</Text> : <Text type="secondary">-</Text>
    },
    {
      title: "Value (₹)",
      dataIndex: "value",
      key: "value",
      width: 120,
      render: (value) => <Text strong>₹{value.toLocaleString()}</Text>,
      sorter: (a, b) => a.value - b.value
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
          <FileExcelOutlined /> Lead Reports
        </Title>
        <Text type="secondary">
          Comprehensive lead performance and conversion analytics
        </Text>
      </div>

      {/* Filters */}
      <Card className="mb-6" bordered={false}>
        <Space wrap>
          <Select
            placeholder="Filter by Agent"
            style={{ width: 200 }}
            allowClear
            onChange={setSelectedAdvisor}
            options={advisors.map(a => ({ label: a, value: a }))}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchLeadReportData}
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
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <div className="text-center">
              <Text type="secondary">Total Leads</Text>
              <Title level={3}>{reportData.length}</Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <div className="text-center">
              <Text type="secondary">Qualified</Text>
              <Title level={3} className="text-green-600">
                {reportData.filter(d => d.status === 'qualified').length}
              </Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <div className="text-center">
              <Text type="secondary">Avg Days to Conversion</Text>
              <Title level={3}>
                {(
                  reportData
                    .filter(d => d.daysToConversion)
                    .reduce((sum, d) => sum + d.daysToConversion, 0) /
                  reportData.filter(d => d.daysToConversion).length || 0
                ).toFixed(1)}
              </Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <div className="text-center">
              <Text type="secondary">Total Value</Text>
              <Title level={3} className="text-blue-600">
                ₹{reportData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
              </Title>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Lead Table */}
      <Card bordered={false} className="shadow-sm">
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
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
