import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Select,
  Typography,
  Row,
  Col,
  Button,
  Spin,
  message
} from "antd";
import { apiService } from "../../../manageApi/utils/custom.apiservice";

const { Title } = Typography;
const { Option } = Select;

const AgencyLeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, closed: 0 });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [leadsRes, dashboardRes] = await Promise.all([
        apiService.get("agency/leads"),
        apiService.get("agency/dashboard")
      ]);
      
      console.log('leadsRes:', leadsRes);
      console.log('dashboardRes:', dashboardRes);
      
      const data = leadsRes?.data?.data || [];
      const dashboardData = dashboardRes?.data;
      
      console.log('data:', data);
      console.log('dashboardData:', dashboardData);
      
      const formattedLeads = data.map((lead, idx) => ({
        key: lead._id || idx,
        client: lead.contact_info?.name?.first_name ? 
          `${lead.contact_info.name.first_name} ${lead.contact_info.name.last_name || ""}` : 
          "Client",
        project: lead.requirements?.property_type || "Project",
        budget: lead.requirements?.budget_min && lead.requirements?.budget_max ? 
          `AED ${lead.requirements.budget_min.toLocaleString()} - ${lead.requirements.budget_max.toLocaleString()}` : 
          lead.requirements?.budget_min ? 
            `AED ${lead.requirements.budget_min.toLocaleString()}` : 
            lead.requirements?.budget_max ? 
              `AED ${lead.requirements.budget_max.toLocaleString()}` : 
              "-",
        status: lead.status || "new",
        assignedTo: lead.created_by_agent?.first_name ? 
          `${lead.created_by_agent.first_name} ${lead.created_by_agent.last_name || ""}` : 
          lead.created_by_agent?.fullName || 
          null,
      }));

      setLeads(formattedLeads);
      
      const total = dashboardData?.stats?.total_leads || data.length;
      const active = dashboardData?.stats?.active_leads || data.filter(l => 
        l.status && !['completed', 'not_proceeding'].includes(l.status)
      ).length;
      const closed = (dashboardData?.stats?.total_deals || 0) || data.filter(l => 
        l.status && ['completed', 'not_proceeding'].includes(l.status)
      ).length;

      setStats({ total, active, closed });

    } catch (err) {
      console.error("Failed to fetch leads:", err);
      message.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const columns = [
    {
      title: "Client",
      dataIndex: "client",
    },
    {
      title: "Project",
      dataIndex: "project",
    },
    {
      title: "Budget",
      dataIndex: "budget",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const statusMap = {
          'new': { color: 'blue', label: 'New' },
          'contacted': { color: 'cyan', label: 'Contacted' },
          'qualified': { color: 'purple', label: 'Qualified' },
          'in_discussion': { color: 'orange', label: 'In Discussion' },
          'site_visit_scheduled': { color: 'geekblue', label: 'Visit Scheduled' },
          'offer_made': { color: 'gold', label: 'Offer Made' },
          'reserved': { color: 'volcano', label: 'Reserved' },
          'spa_signed': { color: 'green', label: 'SPA Signed' },
          'completed': { color: 'green', label: 'Completed' },
          'not_proceeding': { color: 'default', label: 'Not Proceeding' },
        };
        const config = statusMap[status?.toLowerCase()] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>Lead Management</Title>

      {/* Summary */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card bordered={false}>
            <Title level={5}>Total Leads</Title>
            <Title level={3}>{stats.total}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Title level={5}>Active</Title>
            <Title level={3}>{stats.active}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Title level={5}>Closed</Title>
            <Title level={3}>{stats.closed}</Title>
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Spin spinning={loading}>
          <Table 
            columns={columns} 
            dataSource={leads} 
            pagination={false} 
          />
        </Spin>
      </Card>
    </div>
  );
};

export default AgencyLeadManagement;