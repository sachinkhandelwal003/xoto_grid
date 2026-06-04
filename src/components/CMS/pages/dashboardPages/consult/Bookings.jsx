// src/components/consult/ConsultBookings.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Tabs, Card, Drawer, Descriptions, Tag, Button, Space, Badge,
  Alert, message, Spin, Avatar, List, Row, Col, Divider, Modal, Select, Input, Statistic,Tooltip
} from 'antd';
import {
  PhoneOutlined, MailOutlined, MessageOutlined, UserOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  EyeOutlined, DeleteOutlined, UndoOutlined, EditOutlined, BellOutlined,
  HomeOutlined, BuildOutlined, SettingOutlined, SearchOutlined, FilterOutlined
} from '@ant-design/icons';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import { showSuccessAlert, showConfirmDialog } from '../../../../../manageApi/utils/sweetAlert';
import CustomTable from '../../../pages/custom/CustomTable';

const { Option } = Select;
const { TextArea } = Input;

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
  submitted: { label: 'Submitted', color: 'orange', icon: <ClockCircleOutlined /> },
  contacted: { label: 'Contacted', color: 'blue', icon: <PhoneOutlined /> },
  qualified: { label: 'Qualified', color: 'green', icon: <CheckCircleOutlined /> },
  not_qualified: { label: 'Not Qualified', color: 'red', icon: <CloseCircleOutlined /> },
  converted: { label: 'Converted', color: 'purple', icon: <CheckCircleOutlined /> },
  rejected: { label: 'Rejected', color: 'volcano', icon: <CloseCircleOutlined /> },
};

const typeConfig = {
  landscape: { label: 'Landscape', color: 'green', icon: <HomeOutlined /> },
  interior: { label: 'Interior', color: 'geekblue', icon: <SettingOutlined /> },
  architect: { label: 'Architect', color: 'cyan', icon: <BuildOutlined /> },
  civil_engineer: { label: 'Civil Engineer', color: 'orange', icon: <BuildOutlined /> },
  other: { label: 'Other', color: 'gray', icon: <SettingOutlined /> },
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('submitted');
  const [selectedType, setSelectedType] = useState('all');
  const [pagination, setPagination] = useState({ 
    currentPage: 1, 
    itemsPerPage: 10, 
    totalItems: 0 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  // --- STATS CALCULATION (Client-side for demo, ideally fetch from API) ---
  const stats = useMemo(() => {
    return {
      total: bookings.length, // Only counts loaded, ideally api should provide total
      new: bookings.filter(b => b.status === 'submitted').length,
      converted: bookings.filter(b => b.status === 'converted').length,
    };
  }, [bookings]);

  const fetchBookings = async (status = activeTab, page = 1, limit = 10, search = '', type = selectedType) => {
    setLoading(true);
    try {
      const params = { 
        page, 
        limit, 
        status,
        active: activeOnly 
      };
      
      if (search) params.search = search;
      if (type && type !== 'all') params.type = type;

      const res = await apiService.get('/consult', params);
      if (res.success) {
        setBookings(res.data);
        setPagination({
          currentPage: res.pagination?.page || 1,
          itemsPerPage: res.pagination?.limit || 10,
          totalItems: res.pagination?.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      message.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab, 1, 10, searchTerm, selectedType);
  }, [activeTab, selectedType, activeOnly]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    fetchBookings(key, 1, 10, searchTerm, selectedType);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    fetchBookings(activeTab, 1, 10, searchTerm, type);
  };

  const handleSearch = () => {
    fetchBookings(activeTab, 1, 10, searchTerm, selectedType);
  };

  const handlePageChange = (page, pageSize) => {
    fetchBookings(activeTab, page, pageSize, searchTerm, selectedType);
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingStatus(true);
    try {
      await apiService.put(`/consult/${id}/status`, { status: newStatus });
      showSuccessAlert('Success', `Status updated to ${statusConfig[newStatus].label}`);
      fetchBookings(activeTab);
      // Close drawer if updating from drawer
      if(selectedBooking && selectedBooking._id === id) {
          setSelectedBooking({...selectedBooking, status: newStatus});
      }
    } catch (err) {
      message.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const softDelete = async (id) => {
    const confirm = await showConfirmDialog('Delete?', 'Move to trash?', 'Yes, Delete');
    if (confirm.isConfirmed) {
      try {
        await apiService.delete(`/consult/${id}`);
        showSuccessAlert('Deleted', 'Moved to trash');
        fetchBookings(activeTab);
      } catch (err) {
        message.error('Delete failed');
      }
    }
  };

  const columns = [
    {
      key: 'full_name',
      title: 'Customer Name',
      render: (_, record) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ backgroundColor: THEME.primary }} 
            size="large"
          >
            {record.full_name?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-bold text-gray-800">{record.full_name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
               {typeConfig[record.type]?.icon} 
               {typeConfig[record.type]?.label || 'Other'}
            </div>
          </div>
        </Space>
      )
    },
    {
      key: 'contact',
      title: 'Contact Details',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-600">
                <MailOutlined className="text-gray-400" />
                <span>{record.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
                <PhoneOutlined className="text-gray-400" />
                <span>{record.mobile?.country_code || '+91'} {record.mobile?.number}</span>
            </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, record) => {
        const config = statusConfig[record.status];
        return (
          <Tag color={config.color} icon={config.icon} style={{ padding: '4px 10px', borderRadius: '12px' }}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Submitted On',
      render: (_, record) => <span className="text-gray-500">{new Date(record.createdAt).toLocaleDateString()}</span>
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
                shape="circle"
                icon={<EyeOutlined style={{ color: THEME.primary }} />}
                style={{ borderColor: THEME.primary }}
                onClick={() => {
                setSelectedBooking(record);
                setDrawerVisible(true);
                }}
            />
          </Tooltip>

          <Select
            size="small"
            value={record.status}
            style={{ width: 130 }}
            onChange={(val) => updateStatus(record._id, val)}
            loading={updatingStatus}
            bordered={false}
            className="bg-gray-50 rounded border border-gray-200"
          >
            {Object.keys(statusConfig).map(key => (
              <Option key={key} value={key}>
                <Space>{statusConfig[key].icon} {statusConfig[key].label}</Space>
              </Option>
            ))}
          </Select>

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

  const tabItems = Object.keys(statusConfig).map(key => {
    return {
      key,
      label: (
        <span>
          {statusConfig[key].icon} {statusConfig[key].label}
        </span>
      ),
      children: null
    };
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 1. Header & Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Consultation Bookings</h1>
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
                    <Statistic 
                        title="Total Requests" 
                        value={pagination.totalItems} 
                        prefix={<MessageOutlined style={{ color: THEME.primary }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.warning }}>
                    <Statistic 
                        title="Pending Review" 
                        value={pagination.totalItems} // Adjust if you have separate counts API
                        prefix={<ClockCircleOutlined style={{ color: THEME.warning }} />} 
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.success }}>
                    <Statistic 
                        title="Converted" 
                        value={stats.converted} 
                        prefix={<CheckCircleOutlined style={{ color: THEME.success }} />} 
                    />
                </Card>
            </Col>
        </Row>
      </div>

      {/* 2. Main Content Card */}
      <Card bordered={false} className="shadow-md rounded-lg" bodyStyle={{ padding: 0 }}>
        
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-100 bg-white rounded-t-lg">
            <Row gutter={[16, 16]} align="middle">
                <Col flex="auto">
                    <Input
                        prefix={<SearchOutlined className="text-gray-400" />}
                        placeholder="Search by name, email..."
                        allowClear
                        size="large"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onPressEnter={handleSearch}
                        className="rounded-lg"
                    />
                </Col>
                <Col>
                    <Select
                        value={selectedType}
                        onChange={handleTypeChange}
                        style={{ width: 180 }}
                        size="large"
                        placeholder="Filter by type"
                    >
                        <Option value="all">All Types</Option>
                        {Object.keys(typeConfig).map(key => (
                            <Option key={key} value={key}>
                                <Space>{typeConfig[key].icon} {typeConfig[key].label}</Space>
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col>
                    <Select
                        value={activeOnly}
                        onChange={(value) => setActiveOnly(value)}
                        style={{ width: 140 }}
                        size="large"
                    >
                        <Option value={true}>Active Only</Option>
                        <Option value={false}>Show All</Option>
                    </Select>
                </Col>
            </Row>
        </div>

        {/* Tabs & Table */}
        <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            size="large"
            tabBarStyle={{ margin: 0, paddingLeft: 16, paddingTop: 16, background: '#fafafa' }}
            items={tabItems}
        />
        
        <div className="p-0">
            <CustomTable
                columns={columns}
                data={bookings}
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
                <UserOutlined style={{ color: THEME.primary }} />
                <span>Request Details</span>
            </div>
        }
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnClose
        bodyStyle={{ backgroundColor: '#f9fafb' }}
      >
        {selectedBooking && (
          <div className="space-y-6">
            
            {/* User Profile Card */}
            <Card bordered={false} className="shadow-sm">
              <div className="flex items-start gap-4">
                <Avatar 
                    size={64} 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: THEME.secondary }} 
                    src={selectedBooking.avatar}
                >
                    {selectedBooking.full_name?.[0]}
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 m-0">{selectedBooking.full_name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Tag color={typeConfig[selectedBooking.type]?.color || 'default'}>
                        {typeConfig[selectedBooking.type]?.icon} {typeConfig[selectedBooking.type]?.label}
                    </Tag>
                    <Tag color={statusConfig[selectedBooking.status].color}>
                        {statusConfig[selectedBooking.status].label}
                    </Tag>
                  </div>
                  <div className="text-gray-400 text-xs mt-2">
                    Submitted: {new Date(selectedBooking.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card title="Contact Information" bordered={false} className="shadow-sm" size="small">
              <Descriptions column={1} layout="horizontal" bordered size="small">
                <Descriptions.Item label={<span className="text-gray-500"><MailOutlined /> Email</span>}>
                  <a href={`mailto:${selectedBooking.email}`} className="text-blue-600 hover:underline">{selectedBooking.email}</a>
                </Descriptions.Item>
                <Descriptions.Item label={<span className="text-gray-500"><PhoneOutlined /> Mobile</span>}>
                  <a href={`tel:${selectedBooking.mobile?.country_code}${selectedBooking.mobile?.number}`} className="text-blue-600 hover:underline">
                    {selectedBooking.mobile?.country_code} {selectedBooking.mobile?.number}
                  </a>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Message Body */}
            <Card title="Customer Message" bordered={false} className="shadow-sm" size="small">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap">
                {selectedBooking.message || <span className="text-gray-400 italic">No message provided by the customer.</span>}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Update Status" bordered={false} className="shadow-sm border-t-4" style={{ borderColor: THEME.primary }}>
              <div className="flex flex-col gap-3">
                <span className="text-gray-500 text-sm">Change the progress of this request:</span>
                <Select
                  size="large"
                  value={selectedBooking.status}
                  style={{ width: '100%' }}
                  onChange={(val) => updateStatus(selectedBooking._id, val)}
                >
                  {Object.keys(statusConfig).map(key => (
                    <Option key={key} value={key}>
                      <Space>{statusConfig[key].icon} {statusConfig[key].label}</Space>
                    </Option>
                  ))}
                </Select>
                
                {selectedBooking.status === 'converted' && (
                    <Alert 
                        message="Conversion Successful" 
                        description="This lead has been marked as converted." 
                        type="success" 
                        showIcon 
                        className="mt-2"
                    />
                )}
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Bookings;