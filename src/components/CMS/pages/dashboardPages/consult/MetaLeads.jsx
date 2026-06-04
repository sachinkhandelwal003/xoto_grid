// src/components/property/PropertyLeads.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Drawer, Descriptions, Tag, Button, Space, Badge,
  message, Avatar, Row, Col, Tabs, Statistic, Tooltip, Empty
} from 'antd';
import {
  PhoneOutlined, MailOutlined, UserOutlined,
  HomeOutlined, DollarCircleOutlined, CalendarOutlined,
  CheckCircleOutlined, EyeOutlined, DeleteOutlined, BellOutlined,
  UsergroupAddOutlined, BankOutlined,
  RiseOutlined, BuildOutlined, QuestionCircleOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showConfirmDialog } from '../../../../../manageApi/utils/sweetAlert';
import CustomTable from '../../custom/CustomTable';

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1",
  secondary: "#1890ff",
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

// --- CONFIGURATION FOR ALL LEAD TYPES ---
const typeConfig = {
  buy: { label: 'Buy', color: 'blue', icon: <HomeOutlined /> },
  sell: { label: 'Sell', color: 'purple', icon: <DollarCircleOutlined /> },
  rent: { label: 'Rent', color: 'cyan', icon: <BankOutlined /> },
  schedule_visit: { label: 'Visit', color: 'orange', icon: <CalendarOutlined /> },
  partner: { label: 'Partner', color: 'green', icon: <UsergroupAddOutlined /> },

  investor: { label: 'Investor', color: 'gold', icon: <RiseOutlined /> },
  developer: { label: 'Developer', color: 'geekblue', icon: <BuildOutlined /> },
  consultation: { label: 'Consultation', color: 'volcano', icon: <SolutionOutlined /> },
  enquiry: { label: 'Enquiry', color: 'magenta', icon: <QuestionCircleOutlined /> }
};

const statusConfig = {
  submit: { label: 'New Lead', color: 'orange', icon: <BellOutlined /> },
  contacted: { label: 'Contacted', color: 'green', icon: <CheckCircleOutlined /> },
  converted: { label: 'Converted', color: 'blue', icon: <CheckCircleOutlined /> },
  dead: { label: 'Dead', color: 'red', icon: <DeleteOutlined /> }
};

const PropertyLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [activeTab, setActiveTab] = useState('all');

  // ✅ CustomTable filters (search etc.)
  const [filters, setFilters] = useState({
    search: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  // --- STATS CALCULATION (Client-side, current page only) ---
  const stats = useMemo(() => {
    return {
      total: pagination.totalItems,
      new: leads.filter(l => l.status === 'submit').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
    };
  }, [leads, pagination.totalItems]);

  const fetchLeads = async (tab = activeTab, page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (tab !== 'all') params.type = tab;

      const res = await apiService.get('/landing/lead', params);

      if (res.success) {
        setLeads(res.data || []);
        setPagination({
          currentPage: res.pagination?.page || page,
          itemsPerPage: res.pagination?.limit || limit,
          totalItems: res.pagination?.total || 0
        });
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to load property leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(activeTab, 1, pagination.itemsPerPage, filters.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchLeads(key, 1, pagination.itemsPerPage, filters.search);
  };

  const handlePageChange = (page, pageSize) => {
    fetchLeads(activeTab, page, pageSize, filters.search);
  };

  // ✅ CustomTable search/filter handler
  const handleFilter = (newFilters) => {
    const updated = {
      ...filters,
      ...newFilters,
      search: (newFilters?.search || "").trim(),
    };

    setFilters(updated);
    fetchLeads(activeTab, 1, pagination.itemsPerPage, updated.search);
  };

  const markAsContacted = async (id) => {
    try {
      await apiService.put(`/property/lead/${id}`, { status: 'contacted' });
      showSuccessAlert('Success!', 'Lead marked as contacted');

      setLeads(prev => prev.map(l => (l._id === id ? { ...l, status: 'contacted' } : l)));

      if (selectedLead?._id === id) {
        setSelectedLead({ ...selectedLead, status: 'contacted' });
      }
    } catch (err) {
      message.error('Failed to update status');
    }
  };

  const softDelete = async (id) => {
    const result = await showConfirmDialog('Delete Lead?', 'This will move it to trash.', 'Yes, Delete');
    if (result.isConfirmed) {
      try {
        await apiService.delete(`/property/lead/${id}`);
        showSuccessAlert('Deleted', 'Lead moved to trash');
        fetchLeads(activeTab, pagination.currentPage, pagination.itemsPerPage, filters.search);
      } catch (err) {
        message.error('Delete failed');
      }
    }
  };

  const getFullName = (record) => {
    if (record.full_name) return record.full_name;
    if (record.name?.first_name) {
      return `${record.name.first_name} ${record.name.last_name || ''}`.trim();
    }
    return 'N/A';
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: 'Prospect Name',
      key: 'name',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: THEME.secondary }} icon={<UserOutlined />} size="large">
            {record.name?.first_name?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-bold text-gray-800">{getFullName(record)}</div>
            <div className="text-xs text-gray-500">{new Date(record.createdAt).toLocaleDateString()}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Intent',
      key: 'type',
      render: (_, record) => {
        const config = typeConfig[record.type] || {
          label: record.type,
          color: 'default',
          icon: <UserOutlined />
        };
        return (
          <Tag icon={config.icon} color={config.color} style={{ borderRadius: 12, padding: '2px 10px' }}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-gray-600">
          <div className="flex items-center gap-2">
            <MailOutlined className="text-gray-400" />
            <span className="text-xs">{record.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneOutlined className="text-gray-400" />
            <span className="text-xs">{record.mobile?.country_code} {record.mobile?.number}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const config = statusConfig[record.status] || { label: record.status };
        return <Badge status={record.status === 'contacted' ? 'success' : 'warning'} text={config.label} />;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              shape="circle"
              icon={<EyeOutlined style={{ color: THEME.primary }} />}
              style={{ borderColor: THEME.primary }}
              onClick={() => {
                setSelectedLead(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>

          {record.status === 'submit' && (
            <Tooltip title="Mark as Contacted">
              <Button
                shape="circle"
                type="primary"
                ghost
                icon={<CheckCircleOutlined />}
                onClick={() => markAsContacted(record._id)}
              />
            </Tooltip>
          )}

          <Tooltip title="Delete">
            <Button
              shape="circle"
              danger
              icon={<DeleteOutlined />}
              onClick={() => softDelete(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const tabItems = [
    { key: 'all', label: (<span><UsergroupAddOutlined /> All Leads</span>) },
    ...Object.keys(typeConfig).map(key => ({
      key,
      label: (<span>{typeConfig[key].icon} {typeConfig[key].label}</span>)
    }))
  ];

  const renderTypeSpecificDetails = (lead) => {
    switch (lead.type) {
      case 'buy':
        return (
          <Descriptions title="Buying Requirements" bordered column={1} size="small" layout="vertical" className="bg-white p-4 rounded border">
            <Descriptions.Item label="Target Location">{lead.country}, {lead.preferred_city}</Descriptions.Item>
            <Descriptions.Item label="Budget Range">{lead.budget || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Desired Bedrooms">{lead.desired_bedrooms || 'N/A'}</Descriptions.Item>
          </Descriptions>
        );

      case 'sell':
        return (
          <Descriptions title="Property for Sale" bordered column={1} size="small" className="bg-white p-4 rounded border">
            <Descriptions.Item label="Location">{lead.country}, {lead.preferred_city} ({lead.area})</Descriptions.Item>
            <Descriptions.Item label="Project / Unit">{lead.project_name}</Descriptions.Item>
            <Descriptions.Item label="Specs">{lead.bedroom_config}</Descriptions.Item>
            <Descriptions.Item label="Asking Price">AED {lead.price?.toLocaleString() || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Description">{lead.description}</Descriptions.Item>
          </Descriptions>
        );

      case 'rent':
        return (
          <Descriptions title="Rental Needs" bordered column={1} size="small" className="bg-white p-4 rounded border">
            <Descriptions.Item label="Preferred Location">{lead.country}, {lead.preferred_city}</Descriptions.Item>
            <Descriptions.Item label="Budget">{lead.budget || 'N/A'}</Descriptions.Item>
          </Descriptions>
        );

      case 'schedule_visit':
        return (
          <Descriptions title="Visit Details" bordered column={1} size="small" className="bg-white p-4 rounded border">
            <Descriptions.Item label="Visitor Occupation">{lead.occupation || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Current Location">{lead.location || 'N/A'}</Descriptions.Item>
          </Descriptions>
        );

      case 'partner':
      case 'investor':
      case 'developer':
        return (
          <Descriptions title={`${typeConfig[lead.type].label} Details`} bordered column={1} size="small" className="bg-white p-4 rounded border">
            <Descriptions.Item label="Company Name">{lead.company || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Stakeholder Role">{lead.stakeholder_type || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Message">{lead.message || 'N/A'}</Descriptions.Item>
          </Descriptions>
        );

      case 'consultation':
        return (
          <Descriptions title="Consultation Request" bordered column={1} size="small" className="bg-white p-4 rounded border">
            <Descriptions.Item label="Consultant Type">
              <Tag color="cyan">{lead.consultant_type?.toUpperCase() || 'GENERAL'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Message">{lead.message || 'N/A'}</Descriptions.Item>
          </Descriptions>
        );

      case 'enquiry':
        return (
          <Descriptions title="General Enquiry" bordered column={1} size="small" className="bg-white p-4 rounded border">
            <Descriptions.Item label="Message">{lead.message || 'N/A'}</Descriptions.Item>
          </Descriptions>
        );

      default:
        return <Empty description="No specific details available" />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header & Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Meta Leads</h1>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
              <Statistic title="Total Leads" value={pagination.totalItems} prefix={<UsergroupAddOutlined style={{ color: THEME.primary }} />} />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
              <Statistic title="New Submissions" value={stats.new} prefix={<BellOutlined style={{ color: THEME.warning }} />} />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
              <Statistic title="Contacted" value={stats.contacted} prefix={<CheckCircleOutlined style={{ color: THEME.success }} />} />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        {/* ❌ Removed manual Input search bar (CustomTable has its own) */}

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          size="large"
          tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
        />

        <div className="p-0">
          <CustomTable
            columns={columns}
            data={leads}
            loading={loading}
            totalItems={pagination.totalItems}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
            onFilter={handleFilter} // ✅ Now CustomTable search works
          />
        </div>
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <HomeOutlined style={{ color: THEME.primary }} />
            <span>Lead Profile</span>
          </div>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose
        bodyStyle={{ backgroundColor: '#f9fafb' }}
      >
        {selectedLead && (
          <div className="space-y-6">
            <Card bordered={false} className="shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: THEME.primary }} />
                <div className="flex-1">
                  <h3 className="text-xl font-bold m-0 text-gray-800">{getFullName(selectedLead)}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Tag color={typeConfig[selectedLead.type]?.color} icon={typeConfig[selectedLead.type]?.icon}>
                      {typeConfig[selectedLead.type]?.label || selectedLead.type}
                    </Tag>
                    <Tag color={statusConfig[selectedLead.status]?.color}>
                      {statusConfig[selectedLead.status]?.label}
                    </Tag>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Received: {new Date(selectedLead.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Contact Information" size="small" bordered={false} className="shadow-sm">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={<span className="text-gray-500"><MailOutlined /> Email</span>}>
                  <a href={`mailto:${selectedLead.email}`} className="text-blue-600">{selectedLead.email || 'N/A'}</a>
                </Descriptions.Item>

                <Descriptions.Item label={<span className="text-gray-500"><PhoneOutlined /> Mobile</span>}>
                  <a href={`tel:${selectedLead.mobile?.country_code}${selectedLead.mobile?.number}`} className="text-blue-600">
                    {selectedLead.mobile?.country_code} {selectedLead.mobile?.number}
                  </a>
                </Descriptions.Item>

                <Descriptions.Item label={<span className="text-gray-500"><BellOutlined /> Preference</span>}>
                  {selectedLead.preferred_contact?.toUpperCase() || 'ANY'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-500 uppercase ml-1">Requirement Details</div>
              {renderTypeSpecificDetails(selectedLead)}
            </div>

            {selectedLead.status === 'submit' && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: THEME.success, borderColor: THEME.success }}
                  onClick={() => {
                    markAsContacted(selectedLead._id);
                    setDrawerVisible(false);
                  }}
                >
                  Mark as Contacted
                </Button>
                <div className="text-center text-xs text-gray-400 mt-2">
                  Acknowledging this lead will update its status to 'Contacted'.
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default PropertyLeads;
