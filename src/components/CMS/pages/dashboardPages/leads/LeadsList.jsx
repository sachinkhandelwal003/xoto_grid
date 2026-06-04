import React, { useState, useEffect, useMemo, useRef } from 'react';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../pages/custom/CustomTable';
import logo from "../../../../../assets/img/logoNew.png";

import {
  Drawer,
  List,
  Avatar,
  Button,
  Tabs,
  Modal,
  Table,
  Tag,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Divider,
  Tooltip,
  Timeline,
  Image,
  Carousel,
  Collapse,
  Badge,
  Progress,
  Select,
  Input,
  Form,
  Upload,
  message,
  Popconfirm,
  Alert,
  InputNumber
} from 'antd';

import {
  UserOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  IdcardOutlined,
  GoldOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  CompassOutlined,
  DollarOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  ShoppingOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined,
  GlobalOutlined,
  HomeOutlined,
  BuildOutlined,
  SafetyOutlined,
  FileImageOutlined,
  AppstoreOutlined,
  BarsOutlined,
  PercentageOutlined
} from '@ant-design/icons';

import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../../../../manageApi/utils/sweetAlert';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

// Purple Theme Colors
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

const BASE_URL = "https://xoto.ae/api";

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
const [adminQuotationViewModal, setAdminQuotationViewModal] = useState({
  visible: false,
  data: null
});
  // ✅ Prevent double call in React strict mode
  const dataFetchedRef = useRef(false);

  // Search & Modals
  const [viewDetailsModal, setViewDetailsModal] = useState({ visible: false, data: null });
  const [quotationModal, setQuotationModal] = useState({ 
    visible: false, 
    data: null, 
    estimateStatus: null,
    // Add margin editing state
    marginPercent: 0,
    isMarginEditing: false
  });
  const [imageViewer, setImageViewer] = useState({ visible: false, images: [], currentIndex: 0 });
  const [editQuotationModal, setEditQuotationModal] = useState({ visible: false, data: null });
  const [answersModal, setAnswersModal] = useState({ visible: false, data: null });

  // Stats & Pagination
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    final_created: 0,
    superadmin_approved: 0,
    customer_accepted: 0,
    customer_rejected: 0,
    cancelled: 0,
    deal: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });

  // ✅ Initialize filter with 'pending'
  const [filters, setFilters] = useState({ status: 'pending' });
  const [searchText, setSearchText] = useState('');

  // Edit Quotation Form
  const [editForm] = Form.useForm();
  const [quotationItems, setQuotationItems] = useState([]);

  // --- CONFIGURATIONS ---
  const statusConfig = {
    pending: { label: 'Pending', color: 'warning', icon: <ClockCircleOutlined />, bgColor: '#fff7e6', textColor: '#fa8c16' },
    assigned: { label: 'Assigned', color: 'processing', icon: <TeamOutlined />, bgColor: '#e6f7ff', textColor: '#1890ff' },
    final_created: { label: 'Final Created', color: 'purple', icon: <FileTextOutlined />, bgColor: '#f9f0ff', textColor: '#722ed1' },
    superadmin_approved: { label: 'Approved & Sent', color: 'success', icon: <CheckOutlined />, bgColor: '#f6ffed', textColor: '#52c41a' },
  };

  const progressConfig = {
    none: { label: 'Not Started', color: 'default' },
    request_sent: { label: 'Request Sent', color: 'processing' },
    request_completed: { label: 'Request Completed', color: 'blue' },
    final_quotation_created: { label: 'Final Created', color: 'purple' },
    sent_to_customer: { label: 'Sent to Customer', color: 'orange' },
  };

  // ✅ Helper: location string
  const getLocationString = (location) => {
    if (!location) return 'N/A';
    const parts = [
      location.area,
      location.city,
      location.state,
      location.country
    ].filter(Boolean);
    return parts.join(', ') || location.address || 'N/A';
  };

  // ✅ Helper: currency
  const formatCurrency = (amount) => amount ? `AED ${amount?.toLocaleString()}` : 'AED 0';
  const formatDate = (date) => date ? new Date(date).toLocaleString() : 'N/A';
  const formatShortDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';

  /**
   * ✅ MAIN FIX FOR SEARCH:
   * CustomTable objects ko search nahi karta,
   * isliye leads ko flat string fields me convert kar rahe hain
   */
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

  // --- API CALLS ---
  const fetchLeads = async (page = 1, limit = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const response = await apiService.get('/estimates', {
        page,
        limit,
        ...filterParams,
      });

      if (response.success) {
        const formatted = flattenLeadsForSearch(response.data || []);

        setLeads(formatted);

        setPagination({
          currentPage: response.pagination?.page || page,
          itemsPerPage: response.pagination?.limit || limit,
          totalItems: response.pagination?.total || 0
        });

        calculateStats(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      showErrorAlert('Error', 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    setSupervisorsLoading(true);
    try {
      const res = await apiService.get('/users', { role: 'supervisor' });
      if (res.success) setSupervisors(res.data || []);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    } finally {
      setSupervisorsLoading(false);
    }
  };

  // --- MARGIN FUNCTIONS ---
  const calculateMarginAmount = (baseAmount, marginPercent) => {
    if (!baseAmount || !marginPercent) return 0;
    return (baseAmount * marginPercent) / 100;
  };

  const calculateGrandTotal = (baseAmount, marginPercent, discountPercent = 0) => {
    if (!baseAmount) return 0;
    
    const discountAmount = discountPercent ? (baseAmount * discountPercent) / 100 : 0;
    const amountAfterDiscount = baseAmount - discountAmount;
    const marginAmount = marginPercent ? (amountAfterDiscount * marginPercent) / 100 : 0;
    
    return amountAfterDiscount + marginAmount;
  };

  // --- ACTIONS ---
  const handleTabChange = (key) => {
    const newFilters = { status: key };
    setFilters(newFilters);
    fetchLeads(1, pagination.itemsPerPage, newFilters);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    // You can implement search filtering here
  };

  const openAssignDrawer = (lead) => {
    setSelectedLead(lead);
    setDrawerVisible(true);
    if (supervisors.length === 0) fetchSupervisors();
  };

  const assignSupervisor = async (supervisorId) => {
    const confirm = await showConfirmDialog('Assign Lead', 'Assign this lead to supervisor?', 'Yes, Assign');
    if (confirm.isConfirmed) {
      try {
        await apiService.put(`/estimates/${selectedLead._id}/assign-supervisor`, { supervisor_id: supervisorId });
        showSuccessAlert('Success', 'Lead assigned successfully');
        setDrawerVisible(false);
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (error) {
        showErrorAlert('Error', 'Failed to assign lead');
      }
    }
  };

  const openQuotationModal = (lead) => {
    const finalQuotation = lead.final_quotation;
    const supervisorMarginPercent = finalQuotation?.margin_percent || 0;
    
    setQuotationModal({
      visible: true,
      data: lead,
      estimateStatus: lead.status,
      marginPercent: supervisorMarginPercent, // Default to supervisor's margin
      isMarginEditing: false // Start with margin not being edited
    });
  };

const handleMarginPercentChange = (value) => {
  setQuotationModal(prev => ({
    ...prev,
    marginPercent: value || 0
  }));
};

  const approveQuotation = async () => {
    if (!quotationModal.data) return;
    
    const finalQuotation = quotationModal.data.final_quotation;
    if (!finalQuotation) {
      showErrorAlert('Error', 'No quotation found');
      return;
    }

    // Prepare approval data
    const approvalData = {
      scope_of_work: finalQuotation.scope_of_work || '',
      price: finalQuotation.grand_total || finalQuotation.price || 0,
      discount_percent: finalQuotation.discount_percent || 0,
      estimate_type: quotationModal.data.type?._id || '',
      estimate_subcategory: quotationModal.data.subcategory?._id || '',
      freelancer_quotation_id: finalQuotation.freelancer_quotation_id || '',
      margin_percent: quotationModal.marginPercent || 0,
margin_amount: adminMarginAmount,
      margin_type: 'percentage'
    };

    const confirmMessage = quotationModal.marginPercent > 0 
      ? `Approve quotation with ${quotationModal.marginPercent}% margin (${formatCurrency(adminMarginAmount)})?`
      : 'Approve quotation without any additional margin?';

    const confirm = await showConfirmDialog('Approve & Send', confirmMessage, 'Approve');
    
    if (confirm.isConfirmed) {
      try {
        await apiService.post(`/estimates/approve-quotation-by-admin?id=${quotationModal.data._id}`, approvalData);
        showSuccessAlert('Success', 'Quotation approved and sent to customer');
        
        // Close modals and refresh data
        setQuotationModal({ visible: false, data: null, estimateStatus: null, marginPercent: 0, marginAmount: 0, isMarginEditing: false });
        setViewDetailsModal({ visible: false, data: null });
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
      } catch (error) {
        console.error('Approval error:', error);
        showErrorAlert('Error', 'Failed to approve quotation');
      }
    }
  };

  const rejectQuotation = async (estimateId) => {
    const confirm = await showConfirmDialog('Reject Quotation', 'Reject this quotation? This will send it back to supervisor.', 'Reject');
    if (confirm.isConfirmed) {
      try {
        await apiService.put(`/estimates/${estimateId}/reject-quotation`);
        showSuccessAlert('Success', 'Quotation rejected and sent back to supervisor');
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
        setQuotationModal({ visible: false, data: null, estimateStatus: null, marginPercent: 0, marginAmount: 0, isMarginEditing: false });
      } catch (error) {
        showErrorAlert('Error', 'Failed to reject quotation');
      }
    }
  };

  const downloadQuotationPDF = (lead) => {
    // Implement PDF download functionality
    showSuccessAlert('Info', 'PDF download feature would be implemented here');
  };

  // --- HELPERS ---
  const calculateStats = (data) => {
    const statCounts = {
      total: data.length,
      pending: 0,
      assigned: 0,
      final_created: 0,
      superadmin_approved: 0,
      customer_accepted: 0,
      customer_rejected: 0,
      cancelled: 0,
      deal: 0
    };

    data.forEach(item => {
      if (item.status in statCounts) {
        statCounts[item.status]++;
      }
    });

    setStats(statCounts);
  };

  const calculateEstimatedTotal = (lead) => {
    if (!lead.EstimateAnswers) return 0;
    return lead.EstimateAnswers.reduce((total, answer) => {
      return total + (answer.calculatedAmount || 0);
    }, 0);
  };

  // --- COLUMNS ---
  const columns = useMemo(() => [
    {
      title: 'Customer',
      key: 'customer',
      width: 240,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }}
          >
            {r.customer?.name?.first_name?.charAt(0)?.toUpperCase() || r.customer_name?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">
              {r.customer?.name?.first_name} {r.customer?.name?.last_name || r.customer_name}
            </div>
            <div className="text-xs text-gray-500">{r.customer?.email || r.customer_email}</div>
            <div className="text-xs text-gray-400">
              {r.customer?.mobile?.country_code || r.customer_mobile?.country_code} {r.customer?.mobile?.number || r.customer_mobile?.number}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Service Info',
      key: 'service_info',
      width: 180,
      render: (_, r) => (
        <div>
          <Tag color="purple">{r.service_type?.toUpperCase()}</Tag>
          <div className="text-sm font-medium mt-1">{r.subcategory?.label}</div>
          <div className="text-xs text-gray-500">{r.type?.label}</div>
        </div>
      )
    },
    
    {
      title: 'Area',
      key: 'area',
      width: 120,
      render: (_, r) => (
        <div>
          <span className="font-bold text-gray-700">{r.area_sqft}</span> <span className="text-xs text-gray-500">sq.ft</span>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      render: (_, r) => {
        const cfg = statusConfig[r.status] || statusConfig.pending;
        return (
          <Badge 
            color={cfg.color} 
            text={
              <span className="flex items-center gap-1">
                {cfg.icon}
                <span>{cfg.label}</span>
              </span>
            }
            style={{ fontSize: '12px' }}
          />
        );
      }
    },
  
    {
      title: 'Actions',
      fixed: 'right',
      key: 'actions',
      width: 250,
      render: (_, r) => (
        <Space>
          <Tooltip title="View Full Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => setViewDetailsModal({ visible: true, data: r })}
            />
          </Tooltip>
          
          <Tooltip title="View Answers">
            <Button
              icon={<QuestionCircleOutlined />}
              size="small"
              onClick={() => setAnswersModal({ visible: true, data: r })}
            />
          </Tooltip>
          
          {/* Show View Quotation button for final_created status */}
          {(r.status === 'final_created' && r.final_quotation) && (
            <>
              <Tooltip title="View & Approve Quotation">
                <Button
                  type="primary"
                  size="small"
                  style={{ background: PURPLE_THEME.success }}
                  onClick={() => openQuotationModal(r)}
                >
                  <FileTextOutlined /> View & Approve
                </Button>
              </Tooltip>
            </>
          )}
          
          {/* Show Assign button only for pending status */}
          {r.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => openAssignDrawer(r)}
              style={{ background: PURPLE_THEME.primary }}
            >
              Assign
            </Button>
          )}
          {r.status === 'superadmin_approved' && r.admin_final_quotation && (
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
          {/* Additional actions for other statuses */}
          {r.status === 'superadmin_approved' && (
            <Tag color="success">Sent to Customer</Tag>
          )}
        </Space>
      )
    }
  ], []);

  // --- SUB-COMPONENTS ---
  const DetailSection = ({ title, icon, children, extra, collapsible = false }) => {
    if (collapsible) {
      return (
        <Collapse 
          defaultActiveKey={['1']}
          className="mb-4"
          expandIconPosition="end"
        >
          <Panel 
            header={
              <span className="flex items-center gap-2 text-purple-700 font-medium">
                {icon} {title}
              </span>
            } 
            key="1"
            extra={extra}
          >
            {children}
          </Panel>
        </Collapse>
      );
    }
    
    return (
      <Card
        size="small"
        title={<span className="flex items-center gap-2 text-purple-700 font-medium">{icon} {title}</span>}
        className="mb-4 shadow-sm"
        headStyle={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}
        extra={extra}
      >
        {children}
      </Card>
    );
  };

  const MapDisplay = ({ location }) => {
    if (!location || !location.lat || !location.lng) {
      return (
        <div className="flex items-center justify-center h-40 bg-gray-100 rounded border">
          <Text type="secondary">No location coordinates available</Text>
        </div>
      );
    }

    // ⚠️ Replace with real key
    const GOOGLE_MAPS_API_KEY = "AIzaSyD_xxxxxxxxxxxxxxxxxxxxxxxxxxxx";

    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=600x300&markers=color:red%7Clabel:L%7C${location.lat},${location.lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

    return (
      <div className="relative">
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={staticMapUrl}
            alt="Location Map"
            className="w-full h-auto rounded border"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://via.placeholder.com/600x300/cccccc/666666?text=${encodeURIComponent(
                `Map: ${Number(location.lat).toFixed(4)}, ${Number(location.lng).toFixed(4)}`
              )}`;
            }}
          />
        </a>

        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
          📍 {Number(location.lat).toFixed(4)}, {Number(location.lng).toFixed(4)}
        </div>

        <Button
          type="default"
          size="small"
          icon={<CompassOutlined />}
          className="absolute top-2 right-2 shadow-md"
          href={googleMapsUrl}
          target="_blank"
        >
          Open in Maps
        </Button>
      </div>
    );
  };

  const renderEstimateAnswers = (answers) => {
    if (!answers || answers.length === 0) {
      return <Alert message="No answers recorded" type="info" showIcon />;
    }

    return (
      <div className="space-y-4">
        {answers.map((answer, index) => (
          <Card key={answer._id || index} size="small" className="border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-gray-800 mb-1">
                  {index + 1}. {answer.questionText}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Type:</span> {answer.questionType}
                  {answer.includeInEstimate && (
                    <Tag color="green" size="small" className="ml-2">Included in Estimate</Tag>
                  )}
                  {answer.areaQuestion && (
                    <Tag color="blue" size="small" className="ml-2">Area Question</Tag>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <span className="text-gray-500">Answer:</span>
                    <div className="font-medium">
                      {answer.selectedOption?.title || answer.answerValue || 'Not answered'}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Value:</span>
                    <div className="font-medium">
                      {answer.selectedOption?.value || answer.answerValue || 'N/A'}
                      {answer.selectedOption?.valueSubType && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({answer.selectedOption.valueSubType})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Calculated Amount:</span>
                    <div className="font-bold text-purple-700">
                      {formatCurrency(answer.calculatedAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Total Calculation */}
        <Card size="small" className="bg-purple-50 border-purple-200">
          <div className="flex justify-between items-center">
            <div className="font-bold text-gray-700">Total Estimated Amount:</div>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(answers.reduce((sum, ans) => sum + (ans.calculatedAmount || 0), 0))}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // --- INITIAL FETCH ---
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    fetchLeads(1, 10, filters);
  }, []);

  const adminMarginAmount = useMemo(() => {
  if (!quotationModal.data?.final_quotation) return 0;

  const baseAmount =
    quotationModal.data.final_quotation.grand_total || 0;

  return (baseAmount * (quotationModal.marginPercent || 0)) / 100;
}, [quotationModal.marginPercent, quotationModal.data]);
  // Calculate grand total with margins
  const calculateFinalGrandTotal = () => {
    if (!quotationModal.data?.final_quotation) return 0;
    
    const finalQuotation = quotationModal.data.final_quotation;
    const baseAmount = finalQuotation.grand_total || finalQuotation.price || 0;
    const discountPercent = finalQuotation.discount_percent || 0;
    const adminMarginPercent = quotationModal.marginPercent || 0;
    
    // Calculate discount amount
    const discountAmount = discountPercent ? (baseAmount * discountPercent) / 100 : 0;
    const amountAfterDiscount = baseAmount;
    
    // Calculate supervisor margin
    
   
    // Calculate admin margin
    const adminMarginAmount = adminMarginPercent ? (amountAfterDiscount * adminMarginPercent) / 100 : 0;
        

    // Total = base amount - discount + supervisor margin + admin margin
    return amountAfterDiscount + adminMarginAmount;
  };
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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={3}>Leads Management</Title>
          <div className="flex gap-2">
            <Button 
              type="primary" 
              icon={<UploadOutlined />}
              size="large"
              style={{ background: PURPLE_THEME.primary }}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      <Card bodyStyle={{ padding: 0 }} className="mb-6 overflow-hidden rounded-lg shadow-sm">
        <Tabs
          activeKey={filters.status}
          onChange={handleTabChange}
          type="card"
          size="large"
          tabBarStyle={{ margin: 0, background: '#fff' }}
        >
          {Object.keys(statusConfig).map(key => (
            <TabPane
              tab={
                <span className="flex items-center gap-2 px-4">
                  {statusConfig[key].icon}
                  {statusConfig[key].label}
                  <Badge 
                    count={stats[key]} 
                    style={{ backgroundColor: statusConfig[key].color }}
                  />
                </span>
              }
              key={key}
            />
          ))}
        </Tabs>
      </Card>

      <Card bodyStyle={{ padding: '0px' }}>
        <CustomTable
          columns={columns}
          data={leads}
          loading={loading}
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={(p, l) => fetchLeads(p, l, filters)}
        />
      </Card>

      {/* ======================= VIEW DETAILS MODAL ======================= */}
           <Modal
        title={null}
        open={viewDetailsModal.visible}
        onCancel={() => setViewDetailsModal({ visible: false, data: null })}
        width={1400}
        footer={null}
        style={{ top: 20 }}
        className="leads-details-modal"
      >
        {viewDetailsModal.data && (
          <div>
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div>
                <Title level={3} style={{ margin: 0, color: PURPLE_THEME.primary }}>
                  <BuildOutlined /> {viewDetailsModal.data.service_type?.toUpperCase()} Request
                </Title>
                <Text type="secondary">
                  <CalendarOutlined /> Created on {formatDate(viewDetailsModal.data.createdAt)}
                </Text>
              </div>
              <div className="text-right">
                <Tag color={statusConfig[viewDetailsModal.data.status]?.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {statusConfig[viewDetailsModal.data.status]?.icon}
                  <span className="ml-1">{statusConfig[viewDetailsModal.data.status]?.label?.toUpperCase()}</span>
                </Tag>
                {viewDetailsModal.data.submitted_at && (
                  <div className="text-xs text-gray-400 mt-1">
                    Submitted: {formatDate(viewDetailsModal.data.submitted_at)}
                  </div>
                )}
              </div>
            </div>

            <Row gutter={[24, 24]}>
              <Col span={16}>
                <DetailSection title="Customer Profile" icon={<IdcardOutlined />}>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar size={64} icon={<UserOutlined />} style={{ background: PURPLE_THEME.primaryLight }} />
                    <div className="flex-1">
                      <h4 className="text-lg font-bold m-0">
                        <UserOutlined /> {viewDetailsModal.data.customer?.name?.first_name} {viewDetailsModal.data.customer?.name?.last_name || viewDetailsModal.data.customer_name}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-gray-600">
                          <MailOutlined /> {viewDetailsModal.data.customer?.email || viewDetailsModal.data.customer_email}
                        </div>
                        <div className="text-gray-600">
                          <PhoneOutlined /> {viewDetailsModal.data.customer?.mobile ?
                            `${viewDetailsModal.data.customer.mobile.country_code} ${viewDetailsModal.data.customer.mobile.number}` :
                            `${viewDetailsModal.data.customer_mobile?.country_code} ${viewDetailsModal.data.customer_mobile?.number}`
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {viewDetailsModal.data.customer?.location && (
                    <div className="mt-4">
                      <Divider orientation="left" orientationMargin="0">
                        <EnvironmentOutlined /> Location Details
                      </Divider>

                      <Descriptions bordered size="small" column={2} className="mb-3">
                        <Descriptions.Item label="Address" span={2}>
                          {viewDetailsModal.data.customer.location.address}
                        </Descriptions.Item>
                        <Descriptions.Item label="Area">{viewDetailsModal.data.customer.location.area}</Descriptions.Item>
                        <Descriptions.Item label="City">{viewDetailsModal.data.customer.location.city}</Descriptions.Item>
                        <Descriptions.Item label="State">{viewDetailsModal.data.customer.location.state}</Descriptions.Item>
                        <Descriptions.Item label="Country">{viewDetailsModal.data.customer.location.country}</Descriptions.Item>
                      </Descriptions>

                      <MapDisplay location={viewDetailsModal.data.customer.location} />
                    </div>
                  )}
                </DetailSection>

                <DetailSection title="Service & Requirements" icon={<ToolOutlined />}>
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="Category">{viewDetailsModal.data.subcategory?.label}</Descriptions.Item>
                    <Descriptions.Item label="Type">{viewDetailsModal.data.type?.label}</Descriptions.Item>
                    <Descriptions.Item label="Service Type">
                      <Tag color="purple">{viewDetailsModal.data.service_type?.toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Package">
                      <Tag color="gold">{viewDetailsModal.data.package?.name || 'No Package'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Estimated Amount">
                      {formatCurrency(
                        viewDetailsModal.data.estimated_amount ||
                        viewDetailsModal.data.package?.price ||
                        0
                      )}
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-100">
                    <div className="text-xs text-purple-600 font-bold uppercase mb-2">
                      <HomeOutlined /> Area Dimensions
                    </div>
                    <div className="flex justify-between text-center">
                      <div>
                        <div className="text-xl font-bold">{viewDetailsModal.data.area_sqft}</div>
                        <div className="text-xs text-gray-500">Sq. Ft.</div>
                      </div>
                      <Divider type="vertical" style={{ height: 30 }} />
                      <div>
                        <div className="text-lg font-semibold">{viewDetailsModal.data.area_length} ft</div>
                        <div className="text-xs text-gray-500">Length</div>
                      </div>
                      <Divider type="vertical" style={{ height: 30 }} />
                      <div>
                        <div className="text-lg font-semibold">{viewDetailsModal.data.area_width} ft</div>
                        <div className="text-xs text-gray-500">Width</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Text strong>
                      <FileTextOutlined /> Description:
                    </Text>
                    <Paragraph className="bg-gray-50 p-2 rounded mt-1 text-gray-600">
                      {viewDetailsModal.data.description}
                    </Paragraph>
                  </div>
                </DetailSection>
              </Col>

              <Col span={8}>
                <Card size="small" title="Quotation Summary" className="mb-4">
                  {viewDetailsModal.data?.final_quotation ? (
                    <div>
                      <div className="mb-3 p-2 bg-purple-50 rounded">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-bold text-purple-700">
                            {formatCurrency(viewDetailsModal.data.final_quotation.grand_total)}
                          </span>
                        </div>
                        {viewDetailsModal.data.final_quotation.discount_percent > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Discount:</span>
                            <span>{viewDetailsModal.data.final_quotation.discount_percent}%</span>
                          </div>
                        )}
                        {viewDetailsModal.data.final_quotation.margin_percent > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Margin:</span>
                            <span>{viewDetailsModal.data.final_quotation.margin_percent}%</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center space-y-2">
                        <Button
                          type="primary"
                          icon={<FileTextOutlined />}
                          style={{ background: PURPLE_THEME.primary }}
                          onClick={() => setQuotationModal({ 
                            visible: true, 
                            data: viewDetailsModal.data,
                            estimateStatus: viewDetailsModal.data.status 
                          })}
                          block
                        >
                          View Full Quotation
                        </Button>
                        
                        <Button
                          type="default"
                          icon={<QuestionCircleOutlined />}
                          style={{ borderColor: PURPLE_THEME.info, color: PURPLE_THEME.info }}
                          onClick={() => setAnswersModal({ visible: true, data: viewDetailsModal.data })}
                          block
                        >
                          View Questionnaire Answers
                        </Button>
                        
                        {viewDetailsModal.data.status === 'final_created' && (
                          <>
                            <Button
                              type="default"
                              icon={<CheckOutlined />}
                              style={{ 
                                borderColor: PURPLE_THEME.success, 
                                color: PURPLE_THEME.success,
                              }}
                              onClick={() => approveQuotation(viewDetailsModal.data._id)}
                              block
                            >
                              Approve & Send to Customer
                            </Button>
                            
                            <Button
                              type="default"
                              icon={<CloseCircleOutlined />}
                              style={{ 
                                borderColor: PURPLE_THEME.error, 
                                color: PURPLE_THEME.error,
                              }}
                              onClick={() => rejectQuotation(viewDetailsModal.data._id)}
                              block
                            >
                              Reject Quotation
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      <FileTextOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                      <div>No quotation created yet</div>
                    </div>
                  )}
                </Card>

                <Card size="small" title="Workflow Progress" className="mb-4">
                  <Timeline className="mt-2">
                    <Timeline.Item 
                      color="green" 
                      dot={<CalendarOutlined />}
                    >
                      <div>
                        <strong>Created:</strong>
                        <div className="text-xs text-gray-500">{formatDate(viewDetailsModal.data.createdAt)}</div>
                      </div>
                    </Timeline.Item>
                    
                    <Timeline.Item 
                      color={viewDetailsModal.data.assigned_supervisor ? 'green' : 'gray'}
                      dot={<TeamOutlined />}
                    >
                      <div>
                        <strong>Assigned:</strong>
                        <div className="text-xs text-gray-500">
                          {viewDetailsModal.data.assigned_supervisor ? formatDate(viewDetailsModal.data.assigned_at) : 'Pending'}
                        </div>
                        {viewDetailsModal.data.assigned_supervisor && (
                          <div className="text-xs mt-1">
                            To: {viewDetailsModal.data.assigned_supervisor.name?.first_name} {viewDetailsModal.data.assigned_supervisor.name?.last_name}
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                    
                    <Timeline.Item 
                      color={viewDetailsModal.data.supervisor_progress === 'final_quotation_created' ? 'green' : 'blue'}
                      dot={<BuildOutlined />}
                    >
                      <div>
                        <strong>Supervisor Status:</strong>
                        <div className="mt-1">
                          <Tag color={progressConfig[viewDetailsModal.data.supervisor_progress]?.color}>
                            {progressConfig[viewDetailsModal.data.supervisor_progress]?.label}
                          </Tag>
                        </div>
                      </div>
                    </Timeline.Item>
                    
                    <Timeline.Item 
                      color={viewDetailsModal.data.final_quotation ? 'purple' : 'gray'}
                      dot={<FileTextOutlined />}
                    >
                      <div>
                        <strong>Final Quotation:</strong>
                        <div className="mt-1">
                          {viewDetailsModal.data.final_quotation ? 'Created' : 'Pending'}
                          {viewDetailsModal.data.final_quotation && (
                            <div className="text-xs mt-1">
                              Amount: {formatCurrency(viewDetailsModal.data.final_quotation.grand_total)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Timeline.Item>
                    
                    <Timeline.Item 
                      dot={<GoldOutlined />} 
                      color="purple"
                    >
                      <div>
                        <strong>Customer Status:</strong>
                        <div className="mt-1">
                          <Tag>{progressConfig[viewDetailsModal.data.customer_progress]?.label}</Tag>
                        </div>
                      </div>
                    </Timeline.Item>
                  </Timeline>
                </Card>

                <Card size="small" title="Freelancer Quotes" className="mb-4">
                  {viewDetailsModal.data.freelancer_quotations?.length > 0 ? (
                    <div className="space-y-3">
                      {viewDetailsModal.data.freelancer_quotations.map((quote, index) => (
                        <div 
                          key={quote._id || index}
                          className={`p-3 rounded border ${quote._id === viewDetailsModal.data.freelancer_selected_quotation ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {quote.freelancer?.name?.first_name} {quote.freelancer?.name?.last_name}
                              </div>
                              <div className="text-xs text-gray-500">{quote.freelancer?.email}</div>
                            </div>
                            {quote._id === viewDetailsModal.data.freelancer_selected_quotation && (
                              <Tag color="success">Selected</Tag>
                            )}
                          </div>
                          <div className="mt-2">
                            <div className="font-bold text-purple-700">
                              {formatCurrency(quote.quotation?.grand_total)}
                            </div>
                            {quote.quotation?.discount_percent > 0 && (
                              <div className="text-xs text-gray-500">
                                Discount: {quote.quotation.discount_percent}%
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              Submitted: {formatShortDate(quote.submitted_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-2">
                      No freelancer quotes yet
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* ======================= QUOTATION MODAL WITH MARGIN EDITING ======================= */}
      <Modal
        title="Approve Quotation"
        footer={[
          <Button key="cancel" onClick={() => setQuotationModal({ 
            visible: false, 
            data: null, 
            estimateStatus: null,
            marginPercent: 0,
            marginAmount: 0,
            isMarginEditing: false
          })}>
            Cancel
          </Button>,
          <Button 
            key="reject" 
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => rejectQuotation(quotationModal.data?._id)}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            style={{ background: PURPLE_THEME.success }}
            icon={<CheckOutlined />}
            onClick={approveQuotation}
            loading={loading}
          >
            Approve & Send to Customer
          </Button>
        ]}
        open={quotationModal.visible}
        onCancel={() => setQuotationModal({ 
          visible: false, 
          data: null, 
          estimateStatus: null,
          marginPercent: 0,
          marginAmount: 0,
          isMarginEditing: false
        })}
        width={900}
        centered
      >
        {quotationModal.data?.final_quotation && (
          <div className="bg-white">
            <div className="p-4 bg-gray-50 border-b mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <img src={logo} alt="Company Logo" style={{ height: 40, marginBottom: 8 }} />
                  <div className="text-gray-500 text-sm">
                    <strong>Quotation #:</strong> {quotationModal.data._id?.substring(0, 8).toUpperCase()}<br />
                    <strong>Date:</strong> {formatDate(quotationModal.data.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <Title level={4} style={{ color: PURPLE_THEME.primary, margin: 0 }}>FINAL QUOTATION</Title>
                  <Tag color={statusConfig[quotationModal.data.status]?.color} style={{ marginTop: 8 }}>
                    {statusConfig[quotationModal.data.status]?.label?.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Customer & Service Info */}
            <div className="mb-6">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="p-3 bg-gray-50 rounded">
                    <Text strong>Customer:</Text>
                    <div className="font-medium">
                      {quotationModal.data.customer?.name?.first_name} {quotationModal.data.customer?.name?.last_name}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {quotationModal.data.customer?.email}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="p-3 bg-gray-50 rounded">
                    <Text strong>Service:</Text>
                    <div>
                      <Tag color="purple">{quotationModal.data.service_type?.toUpperCase()}</Tag>
                      <div className="text-sm text-gray-600 mt-1">
                        {quotationModal.data.subcategory?.label} - {quotationModal.data.type?.label}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Scope of Work */}
            {quotationModal.data.final_quotation.scope_of_work && (
              <div className="mb-6">
                <Text strong>Scope of Work:</Text>
                <Paragraph className="mt-2 bg-gray-50 p-3 rounded">
                  {quotationModal.data.final_quotation.scope_of_work}
                </Paragraph>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="mb-6 p-4 border rounded">
              <Text strong className="block mb-3">Price Breakdown:</Text>
              
              <div className="space-y-3">
                {/* Base Price */}
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span className="font-medium">
                    {formatCurrency(quotationModal.data.final_quotation.price || quotationModal.data.final_quotation.subtotal || 0)}
                  </span>
                </div>
                
                {/* Discount */}
                {quotationModal.data.final_quotation.discount_percent > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount ({quotationModal.data.final_quotation.discount_percent}%):</span>
                    <span>-{formatCurrency(quotationModal.data.final_quotation.discount_amount || 0)}</span>
                  </div>
                )}
                
                {/* Supervisor Margin */}
                {quotationModal.data.final_quotation.margin_percent > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Supervisor Margin ({quotationModal.data.final_quotation.margin_percent}%):</span>
                    <span>+{formatCurrency(quotationModal.data.final_quotation.margin_amount || 0)}</span>
                  </div>
                )}
                
                {/* Superadmin Margin - Editable */}
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Text strong>Admin Margin:</Text>
                    {quotationModal.isMarginEditing ? (
                      <div className="flex items-center gap-2">
                        <InputNumber
                          min={0}
                          max={100}
                          value={quotationModal.marginPercent}
                          onChange={handleMarginPercentChange}
                          style={{ width: 80 }}
                          addonAfter="%"
                          size="small"
                        />
                        <Button 
                          size="small" 
                          onClick={() => setQuotationModal(prev => ({ ...prev, isMarginEditing: false }))}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => setQuotationModal(prev => ({ ...prev, isMarginEditing: true }))}
                      >
                        {quotationModal.marginPercent > 0 ? `${quotationModal.marginPercent}%` : 'Add Margin'}
                      </Button>
                    )}
                  </div>
                  <span className="font-bold text-purple-700">
+{formatCurrency(adminMarginAmount)}                  </span>
                </div>
                
                {/* Grand Total */}
                <div className="flex justify-between text-xl font-bold text-purple-800 border-t pt-3">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(calculateFinalGrandTotal())}</span>
                </div>
              </div>
              
              {/* {quotationModal.marginPercent > 0 && (
                <Alert
                  message={`Adding ${quotationModal.marginPercent}% admin margin (${formatCurrency(quotationModal.marginAmount)})`}
                  type="info"
                  showIcon
                  className="mt-3"
                />
              )} */}
            </div>

            {/* Notes */}
            <div className="text-xs text-gray-500 italic">
              Note: This quotation will be sent to the customer for approval after you click "Approve & Send to Customer"
            </div>
          </div>
        )}
      </Modal>
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
      {/* ======================= EDIT QUOTATION MODAL ======================= */}
      {/* ... (existing edit quotation modal) ... */}

      {/* ======================= ANSWERS MODAL ======================= */}
      <Modal
        title="Questionnaire Answers"
        open={answersModal.visible}
        onCancel={() => setAnswersModal({ visible: false, data: null })}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setAnswersModal({ visible: false, data: null })}>
            Close
          </Button>
        ]}
      >
        {answersModal.data && (
          <div>
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <Title level={4} style={{ margin: 0, color: PURPLE_THEME.primary }}>
                    Customer: {answersModal.data.customer?.name?.first_name} {answersModal.data.customer?.name?.last_name}
                  </Title>
                  <Text type="secondary">
                    Service: {answersModal.data.service_type?.toUpperCase()} - {answersModal.data.subcategory?.label}
                  </Text>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-700">
                    {formatCurrency(calculateEstimatedTotal(answersModal.data))}
                  </div>
                  <Text type="secondary">Total Estimated Amount</Text>
                </div>
              </div>
            </div>

            {renderEstimateAnswers(answersModal.data.EstimateAnswers)}
          </div>
        )}
      </Modal>

      {/* ======================= IMAGE VIEWER MODAL ======================= */}
      <Modal
        open={imageViewer.visible}
        onCancel={() => setImageViewer({ visible: false, images: [], currentIndex: 0 })}
        footer={null}
        width={800}
        centered
      >
        <Carousel
          arrows
          dots
          initialSlide={imageViewer.currentIndex}
          afterChange={(current) => setImageViewer(prev => ({ ...prev, currentIndex: current }))}
        >
          {imageViewer.images.map((img, index) => (
            <div key={index} className="text-center">
              <Image src={img.src} alt={img.title} style={{ maxHeight: '500px', objectFit: 'contain' }} preview={false} />
              <div className="mt-4 text-gray-600">{img.title}</div>
            </div>
          ))}
        </Carousel>
      </Modal>

      {/* ======================= ASSIGN DRAWER ======================= */}
      <Drawer
        title="Assign Supervisor"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={400}
      >
        <List
          loading={supervisorsLoading}
          dataSource={supervisors}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type="link" size="small" onClick={() => assignSupervisor(item._id)}>Assign</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={`${item.name?.first_name} ${item.name?.last_name}`}
                description={item.email}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};

export default LeadsList;