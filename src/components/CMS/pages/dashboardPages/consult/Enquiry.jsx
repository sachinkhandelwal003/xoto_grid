// src/components/CMS/pages/dashboardPages/consult/Enquiry.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Drawer, Descriptions, Tag, Button, Space, Badge,
  Alert, message, Avatar, Row, Col, Input, Tabs, Statistic, Tooltip, Divider
} from 'antd';
import {
  PhoneOutlined, MailOutlined, MessageOutlined, UserOutlined,
  ClockCircleOutlined, CheckCircleOutlined, EyeOutlined,
  DeleteOutlined, BellOutlined, SearchOutlined, SolutionOutlined,
  WhatsAppOutlined
} from '@ant-design/icons';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showConfirmDialog } from '../../../../../manageApi/utils/sweetAlert';
import CustomTable from '../../../pages/custom/CustomTable';

// --- THEME CONFIGURATION ---
const THEME = {
  primary: "#722ed1", // Purple
  secondary: "#1890ff", // Blue
  success: "#52c41a",
  warning: "#faad14",
  error: "#ff4d4f",
  bgLight: "#f9f0ff",
};

const statusConfig = {
  submit: { label: 'New Submission', color: 'orange', icon: <ClockCircleOutlined /> },
  contacted: { label: 'Contacted', color: 'green', icon: <CheckCircleOutlined /> }
};

const Enquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [activeTab, setActiveTab] = useState('submit');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  // --- API CALLS ---
  const fetchEnquiries = async (status = activeTab, page = 1, limit = 10, search = '') => {
    setLoading(true);
    try {
      const params = { page, limit, status };
      if (search) params.search = search;

      const res = await apiService.get('/enquiry', params);
      if (res.success) {
        setEnquiries(res.data);
        setPagination({
          currentPage: res.pagination?.page || 1,
          itemsPerPage: res.pagination?.limit || 10,
          totalItems: res.pagination?.total || 0
        });
      }
    } catch (err) {
      message.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries(activeTab, 1, 10, searchTerm);
  }, [activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchEnquiries(key, 1, 10, searchTerm);
  };

  const handleSearch = () => {
    fetchEnquiries(activeTab, 1, 10, searchTerm);
  };

  const handlePageChange = (page, pageSize) => {
    fetchEnquiries(activeTab, page, pageSize, searchTerm);
  };

  const markAsContacted = async (id) => {
    try {
      await apiService.put(`/enquiry/${id}/contacted`);
      showSuccessAlert('Success!', 'Marked as contacted');
      fetchEnquiries(activeTab);
      // Close drawer if open on the specific item
      if (selectedEnquiry?._id === id) {
        setDrawerVisible(false);
      }
    } catch (err) {
      message.error('Failed to update status');
    }
  };

  const softDelete = async (id) => {
    const result = await showConfirmDialog('Delete Enquiry?', 'This action will move it to trash.', 'Yes, Delete');
    if (result.isConfirmed) {
      try {
        await apiService.delete(`/enquiry/${id}`);
        showSuccessAlert('Deleted', 'Enquiry moved to trash');
        fetchEnquiries(activeTab);
      } catch (err) {
        message.error('Delete failed');
      }
    }
  };

  // --- COLUMNS ---
  const columns = [
    {
      title: 'Contact Name',
      key: 'name',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar 
            size="large" 
            style={{ backgroundColor: THEME.primary, verticalAlign: 'middle' }}
          >
            {(record.full_name || record.name?.first_name)?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-bold text-gray-800">
                {record.full_name || `${record.name?.first_name} ${record.name?.last_name}`}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(record.createdAt).toLocaleDateString()}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Contact Details',
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-gray-600">
          <div className="flex items-center gap-2">
             <MailOutlined className="text-gray-400"/> {record.email}
          </div>
          <div className="flex items-center gap-2">
             <PhoneOutlined className="text-gray-400"/> {record.mobile?.country_code || '+91'} {record.mobile?.number}
          </div>
        </div>
      )
    },
    {
      title: 'Preferred',
      render: (_, record) => {
        let color = 'default';
        let icon = null;
        if(record.preferred_contact === 'whatsapp') { color = 'green'; icon = <WhatsAppOutlined />; }
        if(record.preferred_contact === 'phone') { color = 'blue'; icon = <PhoneOutlined />; }
        if(record.preferred_contact === 'email') { color = 'purple'; icon = <MailOutlined />; }

        return (
          <Tag color={color} icon={icon} className="capitalize px-3 py-1 rounded-full">
            {record.preferred_contact || 'Any'}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      render: (_, record) => {
        const config = statusConfig[record.status] || statusConfig.submit;
        return (
            <Tag icon={config.icon} color={config.color} style={{ padding: '4px 10px', fontSize: '13px' }}>
                {config.label}
            </Tag>
        );
      }
    },
    {
      title: 'Actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              shape="circle"
              icon={<EyeOutlined style={{ color: THEME.primary }} />}
              style={{ borderColor: THEME.primary }}
              onClick={() => {
                setSelectedEnquiry(record);
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
    {
      key: 'submit',
      label: (
        <span>
          {statusConfig.submit.icon} New Submissions
          <Badge count={pagination.totalItems} style={{ marginLeft: 8, backgroundColor: '#fa8c16' }} />
        </span>
      )
    },
    {
      key: 'contacted',
      label: (
        <span>
          {statusConfig.contacted.icon} Contacted History
        </span>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* 1. Header & Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Website Enquiries</h1>
        
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
                    <Statistic 
                        title="Total Active Enquiries" 
                        value={pagination.totalItems} 
                        prefix={<MessageOutlined style={{ color: THEME.primary }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
                    <Statistic 
                        title="Pending Response" 
                        value={pagination.totalItems} // Note: Ideally filter for 'submit' count specifically if API allows
                        prefix={<ClockCircleOutlined style={{ color: THEME.warning }} />} 
                    />
                </Card>
            </Col>
        </Row>
      </div>

      {/* 2. Main Content */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-white rounded-t-lg">
            <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Search by name, email, or mobile number..."
                allowClear
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={handleSearch}
                style={{ maxWidth: 400 }}
                className="rounded-md"
            />
        </div>

        {/* Tabs & Table */}
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
            data={enquiries}
            loading={loading}
            totalItems={pagination.totalItems}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>
      </Card>

      {/* 3. Detail Drawer */}
      <Drawer
        title={
            <div className="flex items-center gap-2">
                <SolutionOutlined style={{ color: THEME.primary }} />
                <span>Enquiry Details</span>
            </div>
        }
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose
        bodyStyle={{ backgroundColor: '#f9fafb' }}
      >
        {selectedEnquiry && (
          <div className="space-y-6">
            
            {/* Header Card */}
            <Card bordered={false} className="shadow-sm">
                <div className="flex items-center gap-4">
                    <Avatar size={64} style={{ backgroundColor: THEME.primary }} icon={<UserOutlined />} />
                    <div>
                        <h3 className="text-xl font-bold m-0">{selectedEnquiry.full_name || `${selectedEnquiry.name?.first_name}`}</h3>
                        <div className="mt-2">
                            <Tag color={statusConfig[selectedEnquiry.status].color}>
                                {statusConfig[selectedEnquiry.status].label}
                            </Tag>
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                            Submitted: {new Date(selectedEnquiry.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Contact Info */}
            <Card title="Contact Information" size="small" bordered={false} className="shadow-sm">
                <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label={<span className="text-gray-500"><MailOutlined/> Email</span>}>
                        <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-600">{selectedEnquiry.email}</a>
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="text-gray-500"><PhoneOutlined/> Mobile</span>}>
                        <a href={`tel:${selectedEnquiry.mobile?.country_code}${selectedEnquiry.mobile?.number}`} className="text-blue-600">
                            {selectedEnquiry.mobile?.country_code} {selectedEnquiry.mobile?.number}
                        </a>
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="text-gray-500"><BellOutlined/> Preference</span>}>
                        {selectedEnquiry.preferred_contact?.toUpperCase()}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Message Box */}
            <Card title="Message from Customer" size="small" bordered={false} className="shadow-sm">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 italic">
                    <MessageOutlined className="mr-2 text-gray-400" />
                    "{selectedEnquiry.message || 'No additional message provided.'}"
                </div>
            </Card>

            {/* Actions Footer */}
            {selectedEnquiry.status === 'submit' && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                    <Button
                        type="primary"
                        size="large"
                        block
                        icon={<CheckCircleOutlined />}
                        style={{ backgroundColor: THEME.success, borderColor: THEME.success }}
                        onClick={() => markAsContacted(selectedEnquiry._id)}
                    >
                        Mark as Contacted
                    </Button>
                    <div className="text-center text-xs text-gray-400 mt-2">
                        This will move the enquiry to the 'Contacted' tab.
                    </div>
                </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Enquiry;