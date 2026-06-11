import React, { useState, useEffect, useMemo, useRef } from 'react';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../pages/custom/CustomTable';
// 1. IMPORT YOUR LOGO HERE
import logo from "../../../../../assets/img/logoNew.png";

import {
  Modal,
  Button,
  Tabs,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Avatar,
  Divider,
  Descriptions,
  Timeline,
  Popconfirm,
  Badge,
  Tooltip,
  Table,
  Empty,
  Image,
  List,
  Collapse,
  Input
} from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RocketOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  PrinterOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  ToolOutlined,
  SafetyOutlined,
  GoldOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  CalculatorOutlined,
  TeamOutlined,
  HistoryOutlined,
  DollarOutlined,
  CheckOutlined,
  FileDoneOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { showSuccessAlert, showErrorAlert } from '../../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Search } = Input;

// Purple Theme Colors (Same as LeadsList)
const PURPLE_THEME = {
  primary: '#722ed1',
  primaryLight: '#9254de',
  primaryLighter: '#d3adf7',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  dark: '#1f2937',
  gray: '#6b7280',
  light: '#f8fafc'
};

const Leads = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('deals');
  
  // Data States
  const [acceptedLeads, setAcceptedLeads] = useState([]);
  const [rejectedLeads, setRejectedLeads] = useState([]);
  const [deals, setDeals] = useState([]);

  // Pagination States
  const [acceptedPagination, setAcceptedPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  const [rejectedPagination, setRejectedPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  const [dealsPagination, setDealsPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  // Action States
  const [convertingDeal, setConvertingDeal] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState({ visible: false, data: null });
  const [quotationModal, setQuotationModal] = useState({ visible: false, data: null });
  const [adminQuotationViewModal, setAdminQuotationViewModal] = useState({
    visible: false,
    data: null
  });
  
  // Search State
  const [searchText, setSearchText] = useState('');
  
  // Prevent double call in React strict mode
  const dataFetchedRef = useRef(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    rejected: 0,
    deals: 0,
    potential_revenue: 0,
    secured_revenue: 0
  });

  // --- CONFIGURATIONS ---

  const statusConfig = {
    customer_accepted: { label: 'Accepted', color: 'success', icon: <CheckCircleOutlined />, bgColor: '#f6ffed', textColor: '#52c41a' },
    customer_rejected: { label: 'Rejected', color: 'error', icon: <CloseCircleOutlined />, bgColor: '#fff1f0', textColor: '#ff4d4f' },
    deal: { label: 'Deal Created', color: 'purple', icon: <RocketOutlined />, bgColor: '#f9f0ff', textColor: '#722ed1' }
  };

  // --- HELPERS ---
  const formatCurrency = (amount, currency = 'AED') => amount ? `${currency} ${parseFloat(amount).toLocaleString()}` : `${currency} 0`;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const formatMobileNumber = (mobileObj) => mobileObj ? `${mobileObj.country_code || ''} ${mobileObj.number || ''}`.trim() : 'N/A';
  
  // Get full image URL
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL}${path}` : path;
  };

  // Get customer name
  const getCustomerName = (customer) => {
    if (!customer) return 'N/A';
    if (customer.name) {
      return `${customer.name.first_name || ''} ${customer.name.last_name || ''}`.trim();
    }
    return customer.full_name || customer.email || 'N/A';
  };

  // --- API CALLS ---

  const flattenLeadsForSearch = (list = []) => {
    return list.map((lead) => {
      const first = lead.customer?.name?.first_name || '';
      const last = lead.customer?.name?.last_name || '';
      const fullName = `${first} ${last}`.trim();

      const email = lead.customer?.email || lead.customer_email || '';

      const phone = lead.customer?.mobile
        ? `${lead.customer.mobile.country_code || ''} ${lead.customer.mobile.number || ''}`.trim()
        : `${lead.customer_mobile?.country_code || ''} ${lead.customer_mobile?.number || ''}`.trim();

      const location = lead.customer?.location
        ? [
          lead.customer.location.area,
          lead.customer.location.city,
          lead.customer.location.state,
          lead.customer.location.country,
          lead.customer.location.address
        ]
          .filter(Boolean)
          .join(' ')
        : '';

      const service = [
        lead.service_type,
        lead.subcategory?.label,
        lead.type?.label
      ]
        .filter(Boolean)
        .join(' ');

      return {
        ...lead,

        // ✅ Flat searchable fields
        __search_customerName: fullName,
        __search_email: email,
        __search_mobile: phone,
        __search_location: location,
        __search_service: service,
      };
    });
  };

  const fetchLeads = async (status, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await apiService.get("/estimates", {
        status: status === "accepted" ? "customer_accepted" : "customer_rejected",
        page: page,
        limit: limit,
      });

      if (response?.success) {
        const rawData = response.data || [];
        const formattedData = flattenLeadsForSearch(rawData);

       

        if (status === "accepted") {
          setAcceptedLeads(formattedData);
          setAcceptedPagination({
            currentPage: response.pagination?.page || page,
            itemsPerPage: response.pagination?.limit || limit,
            totalItems: response.pagination?.total || 0
          });
        } else {
          setRejectedLeads(formattedData);
          setRejectedPagination({
            currentPage: response.pagination?.page || page,
            itemsPerPage: response.pagination?.limit || limit,
            totalItems: response.pagination?.total || 0
          });
        }

        updateStats(rawData, status);
      }
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", `Failed to load ${status} leads`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await apiService.get('/estimates', {
        status: 'deal',
        page: page,
        limit: limit
      });

      if (response.success) {
        
        const formattedData = flattenLeadsForSearch(response.data || []);
        setDeals(formattedData);
        setDealsPagination({
          currentPage: response.pagination?.page || page,
          itemsPerPage: response.pagination?.limit || limit,
          totalItems: response.pagination?.total || 0
        });
        updateDealStats(response.data || []);
      }
    } catch (error) {
      console.error(error);
      showErrorAlert('Error', 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToDeal = async (estimateId) => {
    setConvertingDeal(estimateId);
    try {
      const response = await apiService.post(`/estimates/${estimateId}/convert-to-deal`);
      if (response.success) {
        showSuccessAlert('Success', 'Converted to deal successfully');
        setViewDetailsModal({ visible: false, data: null });
        fetchLeads('accepted', acceptedPagination.currentPage, acceptedPagination.itemsPerPage);
        fetchDeals(dealsPagination.currentPage, dealsPagination.itemsPerPage);
      }
    } catch (error) {
      showErrorAlert('Error', 'Failed to convert to deal');
    } finally {
      setConvertingDeal(null);
    }
  };

  // Handle page change
  const handlePageChange = (page, pageSize) => {
    if (activeTab === 'accepted') {
      fetchLeads('accepted', page, pageSize);
    } else if (activeTab === 'rejected') {
      fetchLeads('rejected', page, pageSize);
    } else if (activeTab === 'deals') {
      fetchDeals(page, pageSize);
    }
  };

  // --- STATS HELPERS ---

  const updateStats = (data, type) => {
    setStats(prev => {
      const newStats = { ...prev };
      if (type === 'accepted') {
        newStats.accepted = data.length;
        newStats.potential_revenue = data.reduce((sum, item) => sum + (item.admin_final_quotation?.grand_total || item.final_quotation?.grand_total || 0), 0);
      } else if (type === 'rejected') {
        newStats.rejected = data.length;
      }
      newStats.total = newStats.accepted + newStats.rejected + newStats.deals;
      return newStats;
    });
  };

  const updateDealStats = (data) => {
    setStats(prev => ({
      ...prev,
      deals: data.length,
      secured_revenue: data.reduce((sum, item) => sum + (item.admin_final_quotation?.grand_total || item.final_quotation?.grand_total || 0), 0)
    }));
  };

  // Get current pagination based on active tab
  const getCurrentPagination = () => {
    if (activeTab === 'accepted') return acceptedPagination;
    if (activeTab === 'rejected') return rejectedPagination;
    return dealsPagination;
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'accepted') return acceptedLeads;
    if (activeTab === 'rejected') return rejectedLeads;
    return deals;
  };

  // Filter data based on search text
  const filteredData = useMemo(() => {
    const currentData = getCurrentData();
    if (!searchText) return currentData;

    const text = searchText.toLowerCase();

    return currentData.filter(item =>
      [
        item.__search_customerName,
        item.__search_email,
        item.__search_mobile,
        item.__search_location,
        item.__search_service
      ]
        .filter(Boolean)
        .some(field =>
          field.toLowerCase().includes(text)
        )
    );
  }, [searchText, activeTab, acceptedLeads, rejectedLeads, deals]);

  // --- EFFECTS ---

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    if (activeTab === 'deals') {
      fetchDeals();
    } else {
      fetchLeads(activeTab);
    }
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchText(''); // Clear search on tab change
    
    // Reset to first page when changing tabs
    if (key === 'accepted') {
      fetchLeads('accepted', 1, acceptedPagination.itemsPerPage);
    } else if (key === 'rejected') {
      fetchLeads('rejected', 1, rejectedPagination.itemsPerPage);
    } else if (key === 'deals') {
      fetchDeals(1, dealsPagination.itemsPerPage);
    }
  };

  // --- COLUMNS ---

  const getColumns = () => [
    {
      title: 'Customer',
      width: 220,
      render: (_, r) => {
        const customerName = getCustomerName(r.customer);
        const customerEmail = r.customer?.email || r.customer_email || 'N/A';
        
        return (
          <div className="flex items-center gap-3">
            <Avatar 
              size={40} 
              style={{ 
                background: activeTab === 'rejected' ? '#fff1f0' : PURPLE_THEME.primaryBg, 
                color: activeTab === 'rejected' ? '#ff4d4f' : PURPLE_THEME.primary 
              }}
              icon={activeTab === 'deals' ? <RocketOutlined /> : <UserOutlined />}
            />
            <div>
              <div className="font-semibold text-gray-900">{customerName}</div>
              <div className="text-xs text-gray-500">{customerEmail}</div>
              <div className="text-xs text-gray-400">{formatMobileNumber(r.customer?.mobile || r.customer_mobile)}</div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Service Info',
      width: 200,
      render: (_, r) => (
        <div>
           <Tag color={activeTab === 'deals' ? 'purple' : 'blue'}>{r.service_type?.toUpperCase()}</Tag>
           <div className="text-sm font-medium mt-1">{r.subcategory?.label}</div>
           <div className="text-xs text-gray-500">{r.type?.label}</div>
           <div className="text-xs text-gray-400">{r.area_sqft} sq.ft</div>
        </div>
      )
    },
    {
      title: 'Value',
      width: 150,
      render: (_, r) => {
        // Use admin_final_quotation if available, otherwise fall back to final_quotation
        const quotation = r.admin_final_quotation || r.final_quotation;
        return (
          <div>
            <div className={`font-bold ${activeTab === 'rejected' ? 'text-red-500' : 'text-green-600'}`}>
              {formatCurrency(quotation?.grand_total)}
            </div>
            <div className="text-xs text-gray-400">Grand Total</div>
            {/* Show badge if it's admin_final_quotation */}
            {r.admin_final_quotation && (
              <Tag color="green" size="small" className="text-xs mt-1">
                Admin Approved
              </Tag>
            )}
          </div>
        );
      }
    },
    // Only show Rejection Reason if on Rejected Tab
    ...(activeTab === 'rejected' ? [{
      title: 'Rejection Reason',
      width: 200,
      render: (_, r) => (
        <Tooltip title={r.customer_response?.reason}>
          <div className="text-red-500 text-sm truncate max-w-[180px]">
            {r.customer_response?.reason || 'No reason provided'}
          </div>
        </Tooltip>
      )
    }] : []),
    
    {
      title: 'Status',
      width: 140,
      render: (_, r) => {
        const cfg = statusConfig[r.status] || statusConfig.customer_accepted;
        return (
          <Tag color={cfg.color} style={{ borderRadius: 10, padding: '2px 10px' }}>
             {cfg.icon} <span className="ml-1">{cfg.label}</span>
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      fixed: 'right',
      width: 250,
      render: (_, r) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
                icon={<EyeOutlined />} 
                size="small"
                onClick={() => setViewDetailsModal({ visible: true, data: r })}
            />
          </Tooltip>
          
          {/* View Admin Quotation Button */}
          {r.admin_final_quotation && (
            <Tooltip title="View Admin Quotation">
              <Button
                size="small"
                icon={<FileDoneOutlined />}
                onClick={() =>
                  setAdminQuotationViewModal({
                    visible: true,
                    data: r
                  })
                }
              >
                View Quotation
              </Button>
            </Tooltip>
          )}
          
          {/* Conversion Button only for Accepted Leads */}
          {r.status === 'customer_accepted' && !r.project_reference && (
            <Popconfirm 
              title="Convert to Deal" 
              description="Create a project from this lead?" 
              onConfirm={() => handleConvertToDeal(r._id)}
              okText="Yes, Convert"
              okButtonProps={{ loading: convertingDeal === r._id }}
            >
              <Button 
                type="primary" 
                size="small" 
                icon={<RocketOutlined />}
                loading={convertingDeal === r._id}
                style={{ background: PURPLE_THEME.primary, borderColor: PURPLE_THEME.primary }}
              >
                Convert
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // --- SUB-COMPONENTS ---
  const DetailCard = ({ title, icon, children, className }) => (
    <Card 
      size="small" 
      title={<span className="flex items-center gap-2 text-purple-700">{icon} {title}</span>}
      className={`mb-4 shadow-sm ${className}`}
      headStyle={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
    >
      {children}
    </Card>
  );

  const QuotationHeader = ({ title, statusTag, date }) => (
    <div className="p-4 bg-gray-50 border-b mb-4">
      <div className="flex justify-between items-start">
        <div>
          <img src={logo} alt="Company Logo" style={{ height: 40, marginBottom: 8 }} />
          <div className="text-gray-500 text-sm">
            <strong>Date:</strong> {formatDate(date)}
          </div>
        </div>
        <div className="text-right">
          <Title level={4} style={{ color: PURPLE_THEME.primary, margin: 0 }}>
            {title}
          </Title>
          {statusTag}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* HEADER TITLE */}
      <div className="mb-6">
        <Title level={3}>Deals & Conversions</Title>
        <Text type="secondary">Manage accepted quotations, handle rejections, and monitor converted deals.</Text>
      </div>

      

      {/* TABS FILTER */}
      <Card bodyStyle={{ padding: 0 }} className="mb-6 overflow-hidden rounded-lg shadow-sm">
        <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange} 
            type="card" 
            size="large"
            tabBarStyle={{ margin: 0, background: '#fff' }}
        >
           <TabPane 
                tab={
                   <span className="px-4">
                      <RocketOutlined style={{color: '#722ed1'}} /> Active Deals
                      <Badge count={dealsPagination.totalItems} style={{ backgroundColor: '#722ed1', marginLeft: 8 }} />
                   </span>
                } 
                key="deals" 
            />
            <TabPane 
                tab={
                   <span className="px-4">
                      <CheckCircleOutlined style={{color: '#52c41a'}} /> Accepted
                      <Badge count={acceptedPagination.totalItems} style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
                   </span>
                } 
                key="accepted" 
            />
            <TabPane 
                tab={
                   <span className="px-4">
                      <CloseCircleOutlined style={{color: '#ff4d4f'}} /> Rejected
                      <Badge count={rejectedPagination.totalItems} style={{ backgroundColor: '#ff4d4f', marginLeft: 8 }} />
                   </span>
                } 
                key="rejected" 
            />
           
        </Tabs>
      </Card>

     

      {/* DATA TABLE */}
      <Card bodyStyle={{ padding: '0px' }}>
        <CustomTable
          columns={getColumns()}
          data={filteredData}
          loading={loading}
          totalItems={getCurrentPagination().totalItems}
          currentPage={getCurrentPagination().currentPage}
          itemsPerPage={getCurrentPagination().itemsPerPage}
          onPageChange={handlePageChange}
        />
      </Card>

      {/* ========================================================= */}
      {/* VIEW DETAILS MODAL (FULL PROFILE)                         */}
      {/* ========================================================= */}
      <Modal
        title={null}
        open={viewDetailsModal.visible}
        onCancel={() => setViewDetailsModal({ visible: false, data: null })}
        width={1100}
        footer={null}
        style={{ top: 20 }}
      >
        {viewDetailsModal.data && (
            <div>
                {/* 1. HEADER */}
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                        <div className="flex items-center gap-3">
                           <Title level={3} style={{ margin: 0, color: PURPLE_THEME.primary }}>
                               {getCustomerName(viewDetailsModal.data.customer)}
                           </Title>
                           {viewDetailsModal.data.project_reference && (
                             <Tag color="purple">PROJECT #{viewDetailsModal.data.project_reference.substring(0,6)}</Tag>
                           )}
                        </div>
                        <Text type="secondary">{viewDetailsModal.data.service_type} | {viewDetailsModal.data.subcategory?.label}</Text>
                    </div>
                    <div className="text-right">
                        <Tag 
                          color={statusConfig[viewDetailsModal.data.status]?.color} 
                          style={{ fontSize: 14, padding: '4px 12px' }}
                        >
                            {statusConfig[viewDetailsModal.data.status]?.icon} {statusConfig[viewDetailsModal.data.status]?.label.toUpperCase()}
                        </Tag>
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    {/* LEFT COL */}
                    <Col span={14}>
                        {/* Customer Details */}
                        <DetailCard title="Customer Details" icon={<IdcardOutlined />}>
                            <div className="flex items-center gap-4">
                                <Avatar size={54} icon={<UserOutlined />} style={{ background: PURPLE_THEME.primaryLight }} />
                                <div>
                                    <div className="font-bold text-lg">{getCustomerName(viewDetailsModal.data.customer)}</div>
                                    <div className="text-gray-600"><MailOutlined /> {viewDetailsModal.data.customer?.email || viewDetailsModal.data.customer_email}</div>
                                    <div className="text-gray-600"><PhoneOutlined /> {formatMobileNumber(viewDetailsModal.data.customer?.mobile || viewDetailsModal.data.customer_mobile)}</div>
                                    {viewDetailsModal.data.customer?.location && (
                                      <div className="text-gray-600"><EnvironmentOutlined /> {viewDetailsModal.data.customer.location.address}</div>
                                    )}
                                </div>
                            </div>
                        </DetailCard>

                        {/* Project Images */}
                        {(viewDetailsModal.data.type_gallery_snapshot?.previewImage?.url || 
                          viewDetailsModal.data.type_gallery_snapshot?.moodboardImages?.length > 0) && (
                          <DetailCard title="Project Images" icon={<PictureOutlined />}>
                            <div className="space-y-4">
                              {viewDetailsModal.data.type_gallery_snapshot?.previewImage?.url && (
                                <div>
                                  <Text strong>Preview Image:</Text>
                                  <div className="mt-2">
                                    <Image
                                      width="100%"
                                      src={getFullImageUrl(viewDetailsModal.data.type_gallery_snapshot.previewImage.url)}
                                      alt={viewDetailsModal.data.type_gallery_snapshot.previewImage.title || 'Preview'}
                                      className="rounded-md"
                                      fallback="https://via.placeholder.com/300x200?text=No+Image"
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {viewDetailsModal.data.type_gallery_snapshot?.moodboardImages?.length > 0 && (
                                <div>
                                  <Text strong>Moodboard Images ({viewDetailsModal.data.type_gallery_snapshot.moodboardImages.length}):</Text>
                                  <div className="mt-2 grid grid-cols-2 gap-3">
                                    {viewDetailsModal.data.type_gallery_snapshot.moodboardImages.map((img, idx) => (
                                      <div key={idx} className="relative">
                                        <Image
                                          width="100%"
                                          height={120}
                                          src={getFullImageUrl(img.url)}
                                          alt={img.title || `Moodboard ${idx + 1}`}
                                          className="rounded-md object-cover"
                                          fallback="https://via.placeholder.com/150x120?text=Image"
                                        />
                                        <div className="text-xs text-gray-500 mt-1 truncate">{img.title}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DetailCard>
                        )}

                        {/* Service & Requirements */}
                        <DetailCard title="Service & Requirements" icon={<ToolOutlined />}>
                           <Descriptions bordered size="small" column={2}>
                                <Descriptions.Item label="Service Type">
                                  <Tag color="purple">{viewDetailsModal.data.service_type}</Tag>
                                </Descriptions.Item>
                                
                                <Descriptions.Item label="Subcategory">{viewDetailsModal.data.subcategory?.label}</Descriptions.Item>
                                <Descriptions.Item label="Type">{viewDetailsModal.data.type?.label}</Descriptions.Item>
                                <Descriptions.Item label="Area">{viewDetailsModal.data.area_sqft} sq.ft</Descriptions.Item>
                           </Descriptions>
                           <div className="mt-3">
                              <Text strong>Description:</Text>
                              <p className="text-gray-500 text-sm mt-1">{viewDetailsModal.data.description || 'No description provided.'}</p>
                           </div>
                        </DetailCard>


                        {/* If Rejected, show reason prominently */}
                        {viewDetailsModal.data.status === 'customer_rejected' && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                                <div className="text-red-700 font-bold mb-1"><CloseCircleOutlined /> Rejection Reason</div>
                                <p className="text-red-600 m-0">{viewDetailsModal.data.customer_response?.reason || 'No reason provided'}</p>
                            </div>
                        )}
                    </Col>

                    {/* RIGHT COL */}
                    <Col span={10}>
                         {/* Status Timeline */}
                         <DetailCard title="Status Timeline" icon={<HistoryOutlined />}>
                             <Timeline className="mt-2">
                                <Timeline.Item color="green">
                                  Estimate Created: {formatDate(viewDetailsModal.data.createdAt)}
                                </Timeline.Item>
                                <Timeline.Item color="blue">
                                  Submitted: {formatDate(viewDetailsModal.data.submitted_at)}
                                </Timeline.Item>
                                <Timeline.Item color="purple">
                                  Assigned to Supervisor: {formatDate(viewDetailsModal.data.assigned_at)}
                                </Timeline.Item>
                                <Timeline.Item color="orange">
                                  Supervisor Progress: {viewDetailsModal.data.supervisor_progress}
                                </Timeline.Item>
                                {viewDetailsModal.data.customer_response?.responded_at && (
                                  <Timeline.Item 
                                    color={viewDetailsModal.data.status === 'customer_rejected' ? 'red' : 'green'}
                                    dot={viewDetailsModal.data.status === 'customer_rejected' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                                  >
                                     Customer Response: {formatDate(viewDetailsModal.data.customer_response.responded_at)}
                                  </Timeline.Item>
                                )}
                                {viewDetailsModal.data.status === 'deal' && (
                                   <Timeline.Item dot={<RocketOutlined />} color="purple">
                                      Converted to Deal: {formatDate(viewDetailsModal.data.deal_converted_at)}
                                   </Timeline.Item>
                                )}
                             </Timeline>
                         </DetailCard>

                         {/* Supervisor Information */}
                         {viewDetailsModal.data.assigned_supervisor && (
                           <DetailCard title="Supervisor Information" icon={<TeamOutlined />}>
                             <div className="space-y-2">
                               <div className="flex items-center gap-2">
                                 <Avatar size={32} icon={<UserOutlined />} />
                                 <div>
                                   <Text strong>
                                     {viewDetailsModal.data.assigned_supervisor.name?.first_name} {viewDetailsModal.data.assigned_supervisor.name?.last_name}
                                   </Text>
                                   <div className="text-xs text-gray-500">{viewDetailsModal.data.assigned_supervisor.email}</div>
                                 </div>
                               </div>
                               <div className="text-xs text-gray-500">
                                 Assigned by: {formatDate(viewDetailsModal.data.assigned_at)}
                               </div>
                             </div>
                           </DetailCard>
                         )}

                         {/* FINANCIAL SUMMARY CARD */}
                      {(() => {
                        const quotation =
                          viewDetailsModal.data.admin_final_quotation ||
                          viewDetailsModal.data.final_quotation;

                        if (!quotation) return <Empty description="No Quotation Data" />;

                        return (
                          <Card
                            title={
                              <span className="text-green-700">
                                <FileTextOutlined />{' '}
                                {quotation.role === 'admin'
                                  ? 'Admin Final Quotation'
                                  : 'Final Quotation'}
                                {quotation.superadmin_approved && (
                                  <Tag color="green" className="ml-2">
                                    Admin Approved
                                  </Tag>
                                )}
                              </span>
                            }
                            className="border-green-200 bg-green-50"
                            size="small"
                          >
                            <div className="text-center py-4">
                              <div className="text-3xl font-bold text-green-700">
                                {formatCurrency(quotation.grand_total)}
                              </div>

                              <div className="text-xs text-gray-500 mb-4">
                                Approved Amount
                              </div>

                              <div className="text-left text-sm space-y-1 mb-4">
                                

                                {quotation.discount_amount > 0 && (
                                  <div className="flex justify-between text-red-500">
                                    <span>
                                      Discount ({quotation.discount_percent}%):
                                    </span>
                                    <span>-{formatCurrency(quotation.discount_amount)}</span>
                                  </div>
                                )}

                                <div className="flex justify-between">
                                  <span>Margin ({quotation.margin_percent}%):</span>
                                  <span>+{formatCurrency(quotation.margin_amount)}</span>
                                </div>

                                <Divider className="my-2" />

                                <div className="flex justify-between font-bold">
                                  <span>Grand Total:</span>
                                  <span>{formatCurrency(quotation.grand_total)}</span>
                                </div>
                              </div>

                              <div className="text-xs text-gray-500 mt-2">
                                Created by:{' '}
                                {quotation.role === 'admin'
                                  ? 'Administrator'
                                  : quotation.role === 'supervisor'
                                  ? 'Supervisor'
                                  : 'Freelancer'}
                              </div>

                            
                            </div>
                          </Card>
                        );
                      })()}
                         {/* Package Details */}
                         {viewDetailsModal.data.package && (
                           <DetailCard title="Package Details" icon={<GoldOutlined />}>
                             <div>
                               <Text strong>{viewDetailsModal.data.package.name}</Text>
                               <div className="text-sm text-gray-600 mt-1">{viewDetailsModal.data.package.description}</div>
                               <div className="text-green-600 font-bold mt-2">
                                 Price: {formatCurrency(viewDetailsModal.data.package.price, viewDetailsModal.data.package.currency)}
                               </div>
                               {viewDetailsModal.data.package.features && (
                                 <div className="mt-2">
                                   <Text strong className="text-xs">Features:</Text>
                                   <ul className="text-xs text-gray-600 pl-4 mt-1 space-y-1">
                                     {viewDetailsModal.data.package.features.slice(0, 3).map((f, i) => (
                                       <li key={i}>{f}</li>
                                     ))}
                                   </ul>
                                 </div>
                               )}
                             </div>
                           </DetailCard>
                         )}
                    </Col>
                </Row>
            </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* INVOICE MODAL (Quotation View)                       */}
      {/* ========================================================= */}
      <Modal
        title={null}
        footer={null}
        open={quotationModal.visible}
        onCancel={() => setQuotationModal({ visible: false, data: null })}
        width={900}
        bodyStyle={{ padding: 0 }}
        centered
      >
        {quotationModal.data && (
            <div className="bg-white">
                {/* HEADER */}
                <div className="p-8 bg-gray-50 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <img src={logo} alt="Company Logo" style={{ height: 60, marginBottom: 10 }} />
                            <div className="text-gray-500 text-sm">
                                Clean & Green Services<br/>
                                123 Landscape Avenue, Dubai, UAE<br/>
                                contact@company.com
                            </div>
                        </div>
                        <div className="text-right">
                            <Title level={2} style={{ color: PURPLE_THEME.primary, margin: 0 }}>
                                {quotationModal.data.role === 'admin' ? 'ADMIN FINAL QUOTATION' : 'FINAL QUOTATION'}
                            </Title>
                            <div className="mt-2 text-gray-600">
                                <div><strong>Date:</strong> {formatDate(quotationModal.data.createdAt || quotationModal.data.created_at)}</div>
                                <div><strong>Status:</strong> <Tag color={quotationModal.data.superadmin_approved ? "green" : "blue"}>
                                  {quotationModal.data.superadmin_approved ? "ADMIN APPROVED" : "PENDING"}
                                </Tag></div>
                                <div><strong>Quotation ID:</strong> {quotationModal.data._id?.substring(0,8).toUpperCase()}</div>
                                <div><strong>Created by:</strong> {quotationModal.data.role === 'admin' ? 'Administrator' : quotationModal.data.role === 'supervisor' ? 'Supervisor' : 'Freelancer'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ITEMS */}
                <div className="p-8">
                    <Table 
                        dataSource={quotationModal.data.items || []}
                        rowKey={(r, i) => i}
                        pagination={false}
                        bordered
                        size="small"
                        columns={[
                            { title: '#', dataIndex: 'sno', width: 50, align: 'center' },
                            { title: 'Item', dataIndex: 'item', render: (t, r) => <div><div className="font-bold">{t}</div><div className="text-xs text-gray-500">{r.description}</div></div> },
                            { title: 'Unit', dataIndex: 'unit', width: 80, align: 'center' },
                            { title: 'Qty', dataIndex: 'quantity', width: 80, align: 'center' },
                            { title: 'Price', dataIndex: 'unit_price', width: 120, align: 'right', render: (v) => formatCurrency(v) },
                            { title: 'Total', dataIndex: 'total', width: 120, align: 'right', render: (v) => <strong>{formatCurrency(v)}</strong> }
                        ]}
                    />

                    <div className="flex justify-end mt-6">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(quotationModal.data.subtotal)}</span>
                            </div>
                            {quotationModal.data.discount_amount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Discount ({quotationModal.data.discount_percent}%):</span>
                                    <span>- {formatCurrency(quotationModal.data.discount_amount)}</span>
                                </div>
                            )}
                            {quotationModal.data.margin_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Margin ({quotationModal.data.margin_percent}%):</span>
                                    <span>+ {formatCurrency(quotationModal.data.margin_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-purple-800 border-t pt-3">
                                <span>Grand Total:</span>
                                <span>{formatCurrency(quotationModal.data.grand_total)}</span>
                            </div>
                        </div>
                    </div>

                    {quotationModal.data.scope_of_work && (
                        <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-100">
                            <h5 className="font-bold text-gray-700 mb-2">Scope of Work:</h5>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{quotationModal.data.scope_of_work}</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-100 border-t flex justify-end gap-3">
                    <Button onClick={() => setQuotationModal({ visible: false, data: null })}>Close</Button>
                    <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Print</Button>
                </div>
            </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* ADMIN QUOTATION VIEW MODAL (Same as LeadsList)           */}
      {/* ========================================================= */}
      <Modal
        title={null}
        open={adminQuotationViewModal.visible}
        onCancel={() => setAdminQuotationViewModal({ visible: false, data: null })}
        footer={[
          <Button
            key="close"
            onClick={() =>
              setAdminQuotationViewModal({ visible: false, data: null })
            }
          >
            Close
          </Button>
        ]}
        width={900}
        centered
      >
        {adminQuotationViewModal.data?.admin_final_quotation && (() => {
          const lead = adminQuotationViewModal.data;
          const q = lead.admin_final_quotation;

          return (
            <div className="bg-white">
              {/* 🔥 HEADER WITH LOGO */}
              <QuotationHeader
                title="FINAL QUOTATION"
                date={q.createdAt}
                statusTag={
                  <Tag color="success" style={{ marginTop: 8 }}>
                    APPROVED & SENT
                  </Tag>
                }
              />

              {/* CUSTOMER & SERVICE INFO */}
              <div className="mb-6">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="p-3 bg-gray-50 rounded">
                      <Text strong>Customer:</Text>
                      <div className="font-medium">
                        {lead.customer?.name?.first_name}{' '}
                        {lead.customer?.name?.last_name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {lead.customer?.email}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="p-3 bg-gray-50 rounded">
                      <Text strong>Service:</Text>
                      <Tag color="purple">
                        {lead.service_type?.toUpperCase()}
                      </Tag>
                      <div className="text-sm text-gray-600 mt-1">
                        {lead.subcategory?.label} – {lead.type?.label}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* SCOPE OF WORK */}
              {q.scope_of_work && (
                <div className="mb-6">
                  <Text strong>Scope of Work:</Text>
                  <Paragraph className="mt-2 bg-gray-50 p-3 rounded">
                    {q.scope_of_work}
                  </Paragraph>
                </div>
              )}

              {/* PRICE BREAKDOWN */}
              <div className="mb-6 p-4 border rounded">
                <Text strong className="block mb-3">Price Breakdown:</Text>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span className="font-medium">
                      {formatCurrency(q.price)}
                    </span>
                  </div>

                  {q.discount_percent > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Discount ({q.discount_percent}%):</span>
                      <span>-{formatCurrency(q.discount_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-purple-700">
                    <span>Admin Margin ({q.margin_percent}%):</span>
                    <span className="font-bold">
                      +{formatCurrency(q.margin_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xl font-bold text-purple-800 border-t pt-3">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(q.grand_total)}</span>
                  </div>
                </div>
              </div>

              {/* FOOTER NOTE */}
              <div className="text-xs text-gray-500 italic">
                This quotation has been approved and sent to the customer.
              </div>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
};

export default Leads;