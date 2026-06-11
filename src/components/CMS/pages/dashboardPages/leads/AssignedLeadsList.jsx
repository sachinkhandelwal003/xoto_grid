import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../pages/custom/CustomTable';
import { useFreelancer } from '../../../../../../src/context/FreelancerContext';

// Logo import
import logo from "../../../../../assets/img/logoNew.png";

import { 
  Drawer, 
  List, 
  Avatar, 
  Button, 
  Spin, 
  Tabs, 
  Card, 
  Tag, 
  message, 
  Badge, 
  Alert, 
  Row, 
  Col, 
  Modal, 
  Select, 
  Form, 
  Input, 
  InputNumber, 
  Divider, 
  Descriptions, 
  Table, 
  Space, 
  Collapse,
  Timeline,
  Typography,
  Tooltip,
  Image,
  Rate,
  Popover,
  Steps,
  Statistic,
  Progress,
  Radio,
  Switch
} from 'antd';

import { 
  UserOutlined, 
  SendOutlined, 
  EyeOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  DollarOutlined, 
  ClockCircleOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  CalculatorOutlined,
  PhoneOutlined,
  MailOutlined,
  PaperClipOutlined,
  FileOutlined,
  TeamOutlined,
  IdcardOutlined,
  HistoryOutlined,
  ToolOutlined,
  CheckOutlined,
  CloseOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  StarOutlined,
  WalletOutlined,
  CheckCircleFilled,
  PercentageOutlined,
  CalculatorFilled,
  InfoCircleOutlined,
  FileDoneOutlined,
  AuditOutlined,
  BarChartOutlined,
  EyeInvisibleOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined
} from '@ant-design/icons';

import { showSuccessAlert, showErrorAlert, showConfirmDialog } from '../../../../../manageApi/utils/sweetAlert';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

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

const AssignedLeadsList = () => {
    const user = useSelector((s) => s.auth?.user);
    const { freelancer } = useFreelancer();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Freelancers & Quotations Data
    const [freelancers, setFreelancers] = useState([]);
    const [freelancersLoading, setFreelancersLoading] = useState(false);
    const [quotations, setQuotations] = useState([]);
    const [quotationsLoading, setQuotationsLoading] = useState(false);

    // Visibility States
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [freelancerDrawerVisible, setFreelancerDrawerVisible] = useState(false);
    const [activityLogVisible, setActivityLogVisible] = useState(false);
    
    // MODALS
    const [reviewQuotesModalVisible, setReviewQuotesModalVisible] = useState(false);
    const [finalQuotationModalVisible, setFinalQuotationModalVisible] = useState(false);
    const [viewFinalQuotationModalVisible, setViewFinalQuotationModalVisible] = useState(false);

    // Selection States
    const [selectedLead, setSelectedLead] = useState(null);
    const [selectedFreelancers, setSelectedFreelancers] = useState([]);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    
    // Pagination & Filters
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalItems: 0 });
    const [filters, setFilters] = useState({ status: 'assigned' });

    // Form & Dynamic Items
    const [finalQuotationForm] = Form.useForm();
    const [items, setItems] = useState([
        { sno: 1, item: '', description: '', unit: '', quantity: 1, unit_price: 0, total: 0 }
    ]);
// ✅ Ant Design correct way to watch discount
const discountPercent = Form.useWatch('discount_percent', finalQuotationForm) || 0;
    // Margin Calculation State - Moved here to be accessible by all modals
    const [marginType, setMarginType] = useState('percentage'); // 'percentage' or 'fixed'
    const [marginValue, setMarginValue] = useState(15); // 15% by default
    const [selectedFreelancerQuotationId, setSelectedFreelancerQuotationId] = useState(null);
    const [marginAmount, setMarginAmount] = useState(0);
    const [priceAfterMargin, setPriceAfterMargin] = useState(0);
    const [basePrice, setBasePrice] = useState(0);
    const [liveFinalPrice, setLiveFinalPrice] = useState(0);

    // Activity Logs
    const [activityLogs, setActivityLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // --- CONFIGURATION OBJECTS ---
    const statusConfig = {
        pending: { label: 'Pending', color: 'warning', bgColor: '#fff7e6', textColor: '#fa8c16', icon: <ClockCircleOutlined /> },
        assigned: { label: 'Assigned', color: 'processing', bgColor: '#e6f7ff', textColor: '#1890ff', icon: <UserOutlined /> },
        request_sent: { label: 'Request Sent', color: 'purple', bgColor: '#f9f0ff', textColor: '#722ed1', icon: <SendOutlined /> },
        final_created: { label: 'Final Created', color: 'purple', bgColor: '#f0e6ff', textColor: '#722ed1', icon: <FileTextOutlined /> },
        superadmin_approved: { label: 'Approved', color: 'success', bgColor: '#f6ffed', textColor: '#52c41a', icon: <CheckCircleOutlined /> },
        customer_accepted: { label: 'Customer Accepted', color: 'green', bgColor: '#f6ffed', textColor: '#389e0d', icon: <CheckOutlined /> },
        customer_rejected: { label: 'Customer Rejected', color: 'error', bgColor: '#fff1f0', textColor: '#cf1322', icon: <CloseOutlined /> }
    };

    const leadStatusConfig = {
  new: { color: 'blue', label: 'New' },
  in_progress: { color: 'orange', label: 'In Progress' },
  deal: { color: 'green', label: 'Deal' },
  cancelled: { color: 'red', label: 'Cancelled' },
};

const customerResponseConfig = {
  pending: { color: 'gold', label: 'Pending' },
  accepted: { color: 'green', label: 'Accepted' },
  rejected: { color: 'red', label: 'Rejected' },
  no_response: { color: 'default', label: 'No Response' },
};

    const supervisorProgressConfig = {
        none: { label: 'Not Started', color: 'default', bgColor: '#f5f5f5', textColor: '#8c8c8c' },
        request_sent: { label: 'Request Sent', color: 'purple', bgColor: '#f9f0ff', textColor: '#722ed1' },
        request_completed: { label: 'Request Completed', color: 'success', bgColor: '#f6ffed', textColor: '#52c41a' },
        final_quotation_created: { label: 'Final Created', color: 'purple', bgColor: '#f0e6ff', textColor: '#722ed1' }
    };

    const unitOptions = ['sq.ft', 'sq.m', 'lumpsum', 'hour', 'day', 'week', 'month', 'piece', 'kg', 'meter', 'set', 'unit', 'lot'];

    // --- HELPERS ---
    const formatMobileNumber = (mobileObj) => mobileObj ? `${mobileObj.country_code || ''} ${mobileObj.number || ''}`.trim() : 'N/A';
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const formatCurrency = (amount, currency = 'AED') => amount ? `${currency} ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${currency} 0.00`;
    
    // Get full image URL
    const getFullImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // Get customer name
    const getCustomerName = (customer) => {
        if (!customer) return 'N/A';
        if (customer.name) {
            return `${customer.name.first_name || ''} ${customer.name.last_name || ''}`.trim();
        }
        return customer.full_name || customer.email || 'N/A';
    };

    // Get freelancer rate for specific service
    const getFreelancerRate = (freelancer, serviceCategoryId, serviceTypeId) => {
        if (!freelancer.services_offered || !serviceCategoryId) return null;
        
        const service = freelancer.services_offered.find(s => 
            s.category && s.category._id === serviceCategoryId
        );
        
        if (!service || !service.subcategories) return null;
        
        if (serviceTypeId) {
            const subcategory = service.subcategories.find(sub => 
                sub.type && sub.type._id === serviceTypeId
            );
            return subcategory || null;
        }
        
        return service.subcategories.length > 0 ? service.subcategories[0] : null;
    };

    // Format rate display
    const formatRateDisplay = (rateData) => {
        if (!rateData) return 'Not specified';
        return `${formatCurrency(rateData.price_range)} ${rateData.unit || ''}`.trim();
    };

    // Get selected freelancer quotation
    const getSelectedFreelancerQuotation = (lead) => {
        if (!lead?.freelancer_quotations || !lead?.freelancer_selected_quotation) return null;
        const quotation = lead.freelancer_quotations.find(q => q.quotation._id === lead.freelancer_selected_quotation);
        return quotation?.quotation || null;
    };

    // --- MARGIN CALCULATION FUNCTIONS ---
    const calculateMargin = (basePriceValue = basePrice) => {
        if (!basePriceValue || basePriceValue <= 0) {
            return { marginAmount: 0, finalPrice: 0 };
        }
        
        const base = parseFloat(basePriceValue);
        let calculatedMargin = 0;
        let finalPrice = base;
        
        if (marginType === 'percentage') {
            calculatedMargin = (base * parseFloat(marginValue)) / 100;
        } else {
            calculatedMargin = parseFloat(marginValue) || 0;
        }
        
        finalPrice = base + calculatedMargin;
        
        return { 
            marginAmount: Number(calculatedMargin.toFixed(2)), 
            finalPrice: Number(finalPrice.toFixed(2)) 
        };
    };

    const updateMarginCalculation = () => {
        const { marginAmount: newMargin, finalPrice: newFinalPrice } = calculateMargin();
        setMarginAmount(newMargin);
        setPriceAfterMargin(newFinalPrice);
        
        // Update items with the new price
        if (items.length > 0) {
            const updatedItems = [...items];
            updatedItems[0] = {
                ...updatedItems[0],
                unit_price: newFinalPrice,
                total: newFinalPrice
            };
            setItems(updatedItems);
        }
        
        // Update live final price
        updateLiveFinalPrice();
    };

    const updateLiveFinalPrice = () => {
    const discountPercent = finalQuotationForm.getFieldValue('discount_percent') || 0;
    // const discountAmount = (priceAfterMargin * discountPercent) / 100;
    const finalPriceAfterDiscount = priceAfterMargin;
    setLiveFinalPrice(Number(finalPriceAfterDiscount.toFixed(2)));
};
useEffect(() => {
    if (priceAfterMargin > 0) {
        const discountAmount = (priceAfterMargin * discountPercent) / 100;
        const finalPriceAfterDiscount = priceAfterMargin - discountAmount;
        setLiveFinalPrice(Number(finalPriceAfterDiscount.toFixed(2)));
    }
}, [discountPercent, priceAfterMargin]);
// Remove the problematic useEffect and add this simple one:
useEffect(() => {
    // Initial calculation
    updateLiveFinalPrice();
}, [priceAfterMargin]);
    // --- API CALLS ---
    const fetchLeads = async (page = 1, limit = 10, filterParams = {}) => {
        setLoading(true);
        try {
            const params = { page, limit, supervisor: user?.id, ...filterParams };
            const response = await apiService.get('/estimates', params);
           
            
            if (response.success) {
                setLeads(response.data || []);
                setPagination(prev => ({ 
                    ...prev, 
                    currentPage: response.pagination?.page || page, 
                    itemsPerPage: response.pagination?.limit || limit, 
                    totalItems: response.pagination?.total || 0 
                }));
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
            showErrorAlert('Error', 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    };

    const fetchFreelancers = async (serviceCategoryId) => {
        setFreelancersLoading(true);
        try {
            const params = { 
                isActive: true,
                serviceCategory: serviceCategoryId 
            };
            const response = await apiService.get('/freelancer', params);
            
            
            if (response.success) {
                setFreelancers(response.freelancers || []);
                if (response.freelancers && response.freelancers.length > 0) {
                    message.success(`Found ${response.freelancers.length} freelancers for this service`);
                }
            }
        } catch (error) {
            console.error('Error fetching freelancers:', error);
            showErrorAlert('Error', 'Failed to fetch freelancers');
        } finally {
            setFreelancersLoading(false);
        }
    };
    const hasFreelancerSubmittedQuotation = (lead, freelancerId) => {
    if (!lead?.freelancer_quotations?.length) return false;

    return lead.freelancer_quotations.some(
        fq =>
            fq.freelancer?.id === freelancerId &&
            fq.quotation?.status === 'freelancer_to_supervisor'
    );
};

    const fetchQuotations = async (estimateId) => {
        setQuotationsLoading(true);
        try {
            const response = await apiService.get(`/estimates/quotation-by-estimate-id?estimate_id=${estimateId}`);
            if (response.success) setQuotations(response.data || []);
        } catch (error) {
            showErrorAlert('Error', 'Failed to fetch quotations');
        } finally {
            setQuotationsLoading(false);
        }
    };

    // --- CALCULATION LOGIC ---
    const updateItemTotal = (index) => {
        const newItems = [...items];
        const item = newItems[index];
        item.total = (item.quantity || 0) * (item.unit_price || 0);
        setItems(newItems);
        updateLiveFinalPrice();
    };

    // --- HANDLERS ---
    const handleSendToFreelancers = async () => {
        if (!selectedLead || selectedFreelancers.length === 0) return message.error('Please select at least one freelancer');
        const confirm = await showConfirmDialog('Send to Freelancers', `Send to ${selectedFreelancers.length} freelancer(s)?`, 'Send');
        if (confirm.isConfirmed) {
            try {
                const response = await apiService.put(`/estimates/${selectedLead._id}/send-to-freelancers`, { freelancer_ids: selectedFreelancers });
                if (response.success) {
                    showSuccessAlert('Success', 'Lead sent successfully');
                    setFreelancerDrawerVisible(false);
                    fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
                }
            } catch (error) {
                showErrorAlert('Error', 'Failed to send lead');
            }
        }
    };

    const openFreelancerDrawer = (lead) => {
        setSelectedLead(lead);
        setSelectedFreelancers([]);
        setFreelancerDrawerVisible(true);
        
        const serviceCategoryId = lead.subcategory?._id;
        if (serviceCategoryId) {
            fetchFreelancers(serviceCategoryId);
        } else {
            message.warning('Service category not found for this lead');
            setFreelancers([]);
        }
    };

    const openReviewModal = async (lead) => {
        setSelectedLead(lead);
        setReviewQuotesModalVisible(true);
        await fetchQuotations(lead._id);
    };

    const openActivityLog = async (lead) => {
        setSelectedLead(lead);
        setActivityLogVisible(true);
    };

    const openMarginCalculator = (quotation) => {
        if (!quotation) return;
        
        setSelectedQuotation(quotation);
        setSelectedFreelancerQuotationId(quotation._id);
        
        // Set base price from freelancer quotation
        const freelancerPrice = quotation.grand_total || quotation.price || 0;
        setBasePrice(freelancerPrice);
        
        // Calculate initial margin
        updateMarginCalculation();
    };

    const openFinalQuotationModal = (lead, quotationData = null, applyMargin = false) => {
        setSelectedLead(lead);

        let scopeOfWork = '';
        let discountPercent = 0;
        let freelancerPrice = 0;

        if (quotationData) {
            // Set base price from freelancer quotation
            freelancerPrice = quotationData.grand_total || quotationData.price || 0;
            setBasePrice(freelancerPrice);
            setSelectedFreelancerQuotationId(quotationData._id);
            
            scopeOfWork = quotationData.scope_of_work || '';
            discountPercent = quotationData.discount_percent || 0;

            // Calculate price after margin
            const { finalPrice } = calculateMargin(freelancerPrice);
            const finalPriceToUse = applyMargin ? finalPrice : freelancerPrice;

            setItems([{
                sno: 1,
                item: `${lead.subcategory?.label} - ${lead.type?.label}`,
                description: scopeOfWork || 'Complete service as per quotation',
                unit_price: finalPriceToUse,
                total: finalPriceToUse
            }]);
        } else {
            setItems([
                { sno: 1, item: '', description: '', unit_price: 0, total: 0 }
            ]);
        }

        finalQuotationForm.setFieldsValue({
            scope_of_work: scopeOfWork,
            discount_percent: discountPercent
        });

        setFinalQuotationModalVisible(true);
        
        // Update live final price
        updateLiveFinalPrice();
    };

    const handleCopyFreelancerData = (quotation) => {
        openFinalQuotationModal(selectedLead, quotation, false);
        setReviewQuotesModalVisible(false);
    };

    const handleApplyMargin = () => {
        // Update margin calculation
        updateMarginCalculation();
        
        // Show success message
        message.success(
            `Margin applied. New price: ${formatCurrency(priceAfterMargin)}`
        );
    };

   const handleCreateFinalQuotation = async (values) => {
  const { scope_of_work, discount_percent } = values;

  if (!selectedFreelancerQuotationId) {
    return showErrorAlert("Error", "Please select a freelancer quotation first");
  }

  try {
    // ✅ ALWAYS send freelancer grand_total as base price
    const freelancerBasePrice = Number(basePrice); // already set from quotation

    // ✅ margin amount logic (unchanged)
    const marginAmountToSend =
      marginType === 'percentage'
        ? Number(((freelancerBasePrice * marginValue) / 100).toFixed(2))
        : Number(marginValue);

    const payload = {
      scope_of_work: scope_of_work || '',

      // ✅ IMPORTANT FIX HERE
      price: freelancerBasePrice,

      discount_percent: discount_percent || 0,
      estimate_type: selectedLead.type._id,
      estimate_subcategory: selectedLead.subcategory._id,
      freelancer_quotation_id: selectedFreelancerQuotationId,

      // ✅ margin stored separately
      margin_type: marginType === 'percentage' ? 'percentage' : 'amount',
      margin_percent: marginType === 'percentage' ? marginValue : 0,
      margin_amount: marginAmountToSend
    };

    

    const response = await apiService.post(
      `/estimates/${selectedLead._id}/final-quotation`,
      payload
    );

    if (response.success) {
      showSuccessAlert("Success", "Final quotation created successfully");
      setFinalQuotationModalVisible(false);
      setSelectedFreelancerQuotationId(null);
      fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
    }
  } catch (error) {
    showErrorAlert("Error", "Failed to create final quotation");
  }
};
const handleTabChange = (tabKey) => {
    let filterParams = { status: 'assigned' };

    if (tabKey === 'assigned') {
        filterParams.supervisor_progress = 'none';
    } 
    else if (tabKey === 'request_sent') {
        filterParams.supervisor_progress = 'request_sent';
    } 
    else if (tabKey === 'quotations_received') {
        filterParams.supervisor_progress = 'request_completed';
    } 
    else if (tabKey === 'final_created') {
        filterParams.status = 'final_created';
    }
    else if (tabKey === 'submitted') {
        filterParams.status = 'supervisor_submitted';
    }

    setFilters(filterParams);
    fetchLeads(1, pagination.itemsPerPage, filterParams);
};


   const getActiveTabKey = () => {
    if (filters.status === 'supervisor_submitted') return 'submitted';
    if (filters.status === 'final_created') return 'final_created';
    if (filters.supervisor_progress === 'request_completed') return 'quotations_received';
    if (filters.supervisor_progress === 'request_sent') return 'request_sent';
    return 'assigned';
};


    const handleViewFinalQuotation = (lead) => {
        setSelectedLead(lead);
        setViewFinalQuotationModalVisible(true);
    };

    const handleDownloadFinalQuotation = () => {
        // Implement PDF download functionality
        message.success('Download feature coming soon!');
    };

    const handlePrintFinalQuotation = () => {
        // Implement print functionality
        window.print();
    };

    // --- USE EFFECTS ---
    useEffect(() => {
        if (user?.id) fetchLeads(1, 10, { status: 'assigned', supervisor_progress: 'none' });
    }, [user]);

    // Update live price when margin settings change
    useEffect(() => {
        if (basePrice > 0) {
            updateMarginCalculation();
        }
    }, [marginType, marginValue, basePrice]);

    // Update live price when discount changes
 

    // --- COLUMNS DEFINITIONS ---
    const itemColumns = [
        { title: 'Item', dataIndex: 'item', render: (t, r, i) => <Input value={t} onChange={(e) => { const n = [...items]; n[i].item = e.target.value; setItems(n); }} placeholder="Item Name" /> },
        { title: 'Description', dataIndex: 'description', render: (t, r, i) => <Input value={t} onChange={(e) => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} placeholder="Desc" /> },
        { title: 'Price', dataIndex: 'unit_price', width: 110, render: (t, r, i) => <InputNumber min={0} value={t} onChange={(v) => { const n = [...items]; n[i].unit_price = v; setItems(n); updateItemTotal(i); }} style={{ width: '100%' }} /> },
        { title: 'Total', dataIndex: 'total', width: 100, align: 'right', render: (t) => <span style={{ color: PURPLE_THEME.success, fontWeight: 'bold' }}>{t?.toLocaleString()}</span> },
    ];

const getColumnsForTab = (activeTab) => {
    const columns = [
        {
            title: 'Customer Info',
            width: 250,
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    <Avatar size={40} icon={<UserOutlined />} />
                    <div>
                        <div className="font-semibold">{getCustomerName(r.customer)}</div>
                        <div className="text-xs text-gray-500">{r.customer?.email}</div>
                        <div className="text-xs text-gray-400">
                            {formatMobileNumber(r.customer?.mobile)}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Service',
            render: (_, r) => (
                <>
                    <Tag color="purple">{r.service_type}</Tag>
                    <div className="text-sm">{r.subcategory?.label}</div>
                </>
            )
        },
        {
            title: 'Area',
            width: 100,
            render: (_, r) => <b>{r.area_sqft} sq.ft</b>
        }
    ];

    /* ✅ PROGRESS — hide for submitted */
    if (activeTab !== 'submitted') {
        columns.push({
            title: 'Progress',
            render: (_, r) => {
                const cfg =
                    supervisorProgressConfig[r.supervisor_progress] ||
                    supervisorProgressConfig.none;
                return <Tag color={cfg.color}>{cfg.label}</Tag>;
            }
        });
    }

    /* ✅ STATUS — show ONLY for submitted */
    if (activeTab === 'submitted') {
        columns.push({
            title: 'Status',
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <Tag color="blue">
                        Main: {r.status}
                    </Tag>

                    <Tag
                        color={
                            r.customer_response?.status === 'accepted'
                                ? 'green'
                                : r.customer_response?.status === 'rejected'
                                ? 'red'
                                : 'orange'
                        }
                    >
                        Customer: {r.customer_response?.status || 'Pending'}
                    </Tag>
                </Space>
            )
        });
    }

    /* ✅ QUOTATIONS — hide for submitted */
    if (activeTab !== 'submitted') {
        columns.push({
            title: 'Quotations',
            width: 100,
            render: (_, r) => (
                <Badge count={r.freelancer_quotations?.length || 0} />
            )
        });
    }

    /* ✅ FINAL CREATED EXTRA COLUMN */
    if (activeTab === 'final_created') {
        columns.push({
            title: 'Final Amount',
            render: (_, r) => (
                <b className="text-purple-700">
                    {formatCurrency(r.final_quotation?.price)}
                </b>
            )
        });
    }

    /* ✅ ACTIONS */
    columns.push({
        title: 'Actions',
        fixed: 'right',
        width: 180,
        render: (_, r) => (
            <Space>
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedLead(r);
                        setDrawerVisible(true);
                    }}
                />

                {activeTab === 'assigned' && (
                    <Button type="primary" onClick={() => openFreelancerDrawer(r)}>
                        Send
                    </Button>
                )}

                {activeTab === 'quotations_received' && (
                    <Button type="primary" onClick={() => openReviewModal(r)}>
                        Review
                    </Button>
                )}

                {(activeTab === 'submitted' || activeTab === 'final_created') && (
                    <Button onClick={() => handleViewFinalQuotation(r)}>
                        View Final
                    </Button>
                )}
                   
            </Space>
        )
    });

    return columns;
};

    const DetailCard = ({ title, icon, children, extra }) => (
        <Card 
            size="small" 
            title={<span className="flex items-center gap-2 text-purple-700">{icon} {title}</span>} 
            className="mb-4 shadow-sm" 
            headStyle={{ background: '#fafafa' }}
            extra={extra}
        >
            {children}
        </Card>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-screen-2xl mx-auto">
                <Title level={2} className="mb-6" style={{ color: PURPLE_THEME.dark }}>My Estimates</Title>

                {/* STATISTICS CARD */}
                <Row gutter={16} className="mb-6">
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Assigned"
                                value={leads.filter(l => l.supervisor_progress === 'none').length}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: PURPLE_THEME.primary }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Request Sent"
                                value={leads.filter(l => l.supervisor_progress === 'request_sent').length}
                                prefix={<SendOutlined />}
                                valueStyle={{ color: PURPLE_THEME.info }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Quotations Received"
                                value={leads.filter(l => l.supervisor_progress === 'request_completed').length}
                                prefix={<FileTextOutlined />}
                                valueStyle={{ color: PURPLE_THEME.success }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Final Created"
                                value={leads.filter(l => l.status === 'final_created').length}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: PURPLE_THEME.warning }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* TABS */}
                <Card bodyStyle={{ padding: 0 }} className="mb-6 overflow-hidden rounded-lg shadow-sm">
                    <Tabs activeKey={getActiveTabKey()} onChange={handleTabChange} type="card" size="large" tabBarStyle={{ margin: 0 }}>
                        <Tabs.TabPane tab="Assigned (New)" key="assigned" />
                        <Tabs.TabPane tab="Request Sent" key="request_sent" />
                        <Tabs.TabPane tab={<Badge count={leads.filter(l => l.supervisor_progress === 'request_completed').length} offset={[10, 0]}>Quotations Received</Badge>} key="quotations_received" />
                        <Tabs.TabPane tab={<Badge count={leads.filter(l => l.status === 'final_created').length} offset={[10, 0]}>Final Created</Badge>} key="final_created" />
<Tabs.TabPane 
  tab={
    <Badge count={leads.filter(l => l.status === 'supervisor_submitted').length} offset={[10, 0]}>
      Submitted
    </Badge>
  } 
  key="submitted" 
/>
                    </Tabs>
                </Card>

                {/* TABLE */}
                <Card bodyStyle={{ padding: 0 }}>
                    <CustomTable 
                        columns={getColumnsForTab(getActiveTabKey())} 
                        data={leads} 
                        totalItems={pagination.totalItems} 
                        currentPage={pagination.currentPage} 
                        itemsPerPage={pagination.itemsPerPage} 
                        onPageChange={(p, l) => fetchLeads(p, l, filters)} 
                        loading={loading} 
                    />
                </Card>
            </div>

            {/* --- DRAWER: FULL DETAILS (LEFT SIDE) --- */}
            <Drawer 
                title={<span className="text-purple-700"><FileTextOutlined /> Lead Full Information</span>} 
                width={1300} 
                onClose={() => setDrawerVisible(false)} 
                open={drawerVisible}
            >
                {selectedLead && (
                    <div className="p-2">
                        {/* Lead Status Header */}
                    <div className="flex justify-between items-center mb-6 p-5 bg-purple-50 rounded-xl border border-purple-100 shadow-sm">
  <div>
    <h3 className="text-xl font-bold text-purple-800 m-0">
      {selectedLead.service_type} - {selectedLead.subcategory?.label}
    </h3>
  </div>

  <div className="flex flex-col items-end gap-2">
    <Tag
      color={leadStatusConfig[selectedLead.status]?.color}
      style={{ fontSize: '14px', padding: '4px 12px' }}
    >
      Main Status: {leadStatusConfig[selectedLead.status]?.label}
    </Tag>

    <Tag
      color={customerResponseConfig[selectedLead.customer_response?.status]?.color}
      style={{ fontSize: '14px', padding: '4px 12px' }}
    >
      Customer Response: {customerResponseConfig[selectedLead.customer_response?.status]?.label}
    </Tag>

    {/* <Tag
      color={supervisorProgressConfig[selectedLead.supervisor_progress]?.color}
      style={{ fontSize: '14px', padding: '4px 12px' }}
    >
      Supervisor: {supervisorProgressConfig[selectedLead.supervisor_progress]?.label}
    </Tag> */}
  </div>
</div>


                        <Row gutter={16}>
                            <Col span={14}>
                                {/* Customer Details */}
                                <DetailCard title="Customer Details" icon={<IdcardOutlined />}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Descriptions column={1} size="small" bordered={false}>
                                                <Descriptions.Item label={<Text strong><UserOutlined /> Name</Text>}>
                                                    {getCustomerName(selectedLead.customer)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<Text strong><MailOutlined /> Email</Text>}>
                                                    {selectedLead.customer?.email || selectedLead.customer_email || 'N/A'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<Text strong><PhoneOutlined /> Mobile</Text>}>
                                                    {formatMobileNumber(selectedLead.customer?.mobile || selectedLead.customer_mobile)}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Col>
                                        <Col span={12}>
                                            {selectedLead.customer?.location && (
                                                <div>
                                                    <Text strong><EnvironmentOutlined /> Location</Text>
                                                    <div className="text-gray-600 mt-1" style={{ fontSize: '13px' }}>
                                                        <div>{selectedLead.customer.location.address}</div>
                                                        <div>{selectedLead.customer.location.city}, {selectedLead.customer.location.state}</div>
                                                        <div>{selectedLead.customer.location.country}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </DetailCard>

                                {/* Estimate Answers */}
                                {selectedLead.EstimateAnswers?.length > 0 && (
                                    <DetailCard title="Estimate Questions & Answers" icon={<CalculatorOutlined />}>
                                        <div className="space-y-3">
                                            {selectedLead.EstimateAnswers.map((ans, idx) => (
                                                <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-100">
                                                    <div className="text-sm font-medium text-gray-700 mb-1">{ans.questionText}</div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <Tag color="blue">
                                                            {ans.selectedOption?.title || ans.answerValue || 'N/A'}
                                                        </Tag>
                                                        {ans.calculatedAmount > 0 && (
                                                            <span className="font-bold text-green-600">
                                                                {formatCurrency(ans.calculatedAmount)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </DetailCard>
                                )}
                            </Col>

                            <Col span={10}>
                                {/* Service & Package Details */}
                                <DetailCard title="Service Details" icon={<ToolOutlined />}>
                                    <Descriptions column={1} size="small" bordered={false}>
                                        <Descriptions.Item label="Service Type">
                                            <Tag color="purple">{selectedLead.service_type}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Subcategory">
                                            <Text strong>{selectedLead.subcategory?.label}</Text>
                                            <div className="text-xs text-gray-500 mt-1">{selectedLead.subcategory?.description}</div>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Service Type">
                                            <Text strong>{selectedLead.type?.label}</Text>
                                            <div className="text-xs text-gray-500 mt-1">{selectedLead.type?.description}</div>
                                        </Descriptions.Item>
                                       
                                    </Descriptions>
                                </DetailCard>

                                {/* Area Specifications */}
                                <DetailCard title="Area Specifications" icon={<CalculatorOutlined />}>
                                    <div className="flex justify-around bg-gray-50 p-3 rounded-lg border mb-3">
                                        <div className="text-center">
                                            <Title level={4} className="m-0" style={{ color: PURPLE_THEME.primary }}>{selectedLead.area_sqft}</Title>
                                            <Text size="small" type="secondary">Sq.Ft</Text>
                                        </div>
                                        <Divider type="vertical" style={{ height: '40px' }} />
                                    
                                    </div>
                                </DetailCard>

                                {/* Assigned Freelancers */}
                         <DetailCard title="Assigned Freelancers" icon={<TeamOutlined />}>
    {selectedLead?.sent_to_freelancers?.length > 0 ? (
        <List
            itemLayout="horizontal"
            dataSource={selectedLead.sent_to_freelancers}
            renderItem={(f) => {
                const quotationReceived = hasFreelancerSubmittedQuotation(
                    selectedLead,
                    f.id || f._id
                );

                return (
                    <List.Item className="px-0">
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    style={{ backgroundColor: '#87d068' }}
                                    icon={<UserOutlined />}
                                />
                            }
                            title={
                                <Text strong>
                                    {f.full_name ||
                                        `${f.name?.first_name} ${f.name?.last_name}`}
                                </Text>
                            }
                            description={
                                <Space direction="vertical" size={0}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        <MailOutlined /> {f.email}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        <PhoneOutlined /> {formatMobileNumber(f.mobile)}
                                    </Text>
                                </Space>
                            }
                        />

                        {/* ✅ STATUS TAG */}
                        {quotationReceived ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                                Quotation Received
                            </Tag>
                        ) : (
                            <Tag color="orange" icon={<ClockCircleOutlined />}>
                                Waiting
                            </Tag>
                        )}
                    </List.Item>
                );
            }}
        />
    ) : (
        <Alert
            message="No Freelancers Assigned"
            description="This lead has not been sent to any freelancers yet."
            type="info"
            showIcon
            action={
                <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                        setDrawerVisible(false);
                        openFreelancerDrawer(selectedLead);
                    }}
                >
                    Assign Now
                </Button>
            }
        />
    )}
</DetailCard>
                            </Col>
                        </Row>
                    </div>
                )}
            </Drawer>

            {/* --- DRAWER: SELECT FREELANCERS --- */}
            <Drawer 
                title={
                    <div className="flex items-center justify-between">
                        <span>Select Freelancers for: <strong>{selectedLead?.subcategory?.label}</strong></span>
                    </div>
                } 
                width={600} 
                onClose={() => setFreelancerDrawerVisible(false)} 
                open={freelancerDrawerVisible}
            >
                {freelancersLoading ? (
                    <div className="text-center py-10">
                        <Spin size="large" />
                        <div className="mt-4 text-gray-500">Fetching freelancers for this service...</div>
                    </div>
                ) : (
                    <>
                        <Alert 
                            message={`Found ${freelancers.length} freelancers for "${selectedLead?.subcategory?.label}"`}
                            type="info"
                            showIcon
                            className="mb-4"
                        />
                        
                        <List
                            dataSource={freelancers}
                            renderItem={item => {
                                const rateData = getFreelancerRate(item, selectedLead?.subcategory?._id, selectedLead?.type?._id);
                                
                                return (
                                    <List.Item 
                                        className="hover:bg-gray-50 p-3 rounded-lg border mb-2"
                                        actions={[
                                            <Button 
                                                type={selectedFreelancers.includes(item._id) ? 'primary' : 'default'} 
                                                onClick={() => {
                                                    setSelectedFreelancers(prev => 
                                                        prev.includes(item._id) 
                                                            ? prev.filter(id => id !== item._id) 
                                                            : [...prev, item._id]
                                                    );
                                                }}
                                            >
                                                {selectedFreelancers.includes(item._id) ? 'Selected' : 'Select'}
                                            </Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar src={item.avatar} icon={<UserOutlined />} />}
                                            title={
                                                <div className="flex items-center gap-2">
                                                    <Text strong>{`${item.name?.first_name} ${item.name?.last_name}`}</Text>
                                                    {item.onboarding_status === 'approved' && (
                                                        <Tag color="green" icon={<CheckCircleFilled />} size="small">Approved</Tag>
                                                    )}
                                                </div>
                                            }
                                            description={
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <MailOutlined className="text-gray-400" />
                                                        <Text type="secondary">{item.email}</Text>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <PhoneOutlined className="text-gray-400" />
                                                        <Text type="secondary">{formatMobileNumber(item.mobile)}</Text>
                                                    </div>
                                                    
                                                    {/* Rate Information */}
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <WalletOutlined className="text-green-500" />
                                                        {rateData ? (
                                                            <div className="flex items-center gap-2">
                                                                <Tag color="green" className="font-bold">
                                                                    {formatCurrency(rateData.price_range)} {rateData.unit}
                                                                </Tag>
                                                                {rateData.type?.label && (
                                                                    <Tag color="blue" size="small">{rateData.type.label}</Tag>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Tag color="default">Rate not specified</Tag>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Experience */}
                                                    {item.professional?.experience_years && (
                                                        <div className="flex items-center gap-2">
                                                            <StarOutlined className="text-yellow-500" />
                                                            <Text type="secondary">{item.professional.experience_years} years experience</Text>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Location */}
                                                    {item.location?.city && (
                                                        <div className="flex items-center gap-2">
                                                            <EnvironmentOutlined className="text-blue-500" />
                                                            <Text type="secondary">
                                                                {item.location.city}, {item.location.state}
                                                            </Text>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                        
                        <div className="mt-6 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <Button 
                                    type="primary" 
                                    disabled={selectedFreelancers.length === 0}
                                    onClick={handleSendToFreelancers}
                                    size="large"
                                    style={{ background: PURPLE_THEME.primary }}
                                >
                                    Send to {selectedFreelancers.length} Freelancer(s)
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Drawer>

            {/* --- MODAL: REVIEW FREELANCER QUOTATIONS --- */}
            <Modal
                title={null}
                open={reviewQuotesModalVisible}
                onCancel={() => setReviewQuotesModalVisible(false)}
                footer={null}
                width={900}
                style={{ top: 20 }}
            >
                {quotationsLoading ? <div className="text-center py-10"><Spin size="large" /></div> : (
                    <div className="space-y-6">
                        <Title level={4} className="text-center mb-4">Received Quotations</Title>
                        
                        <Collapse accordion defaultActiveKey={['0']}>
                            {quotations.map((quote, idx) => (
                                <Panel 
                                    header={
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-3">
                                                <Avatar 
                                                    size="small" 
                                                    src={quote.created_by?.avatar} 
                                                    icon={<UserOutlined />}
                                                    style={{ 
                                                        backgroundColor: selectedFreelancerQuotationId === quote._id ? 
                                                        PURPLE_THEME.primary : '#f5f5f5' 
                                                    }}
                                                />
                                                <span>
                                                    Quote from <strong>{quote.created_by?.name?.first_name} {quote.created_by?.name?.last_name}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedFreelancerQuotationId === quote._id && (
                                                    <Tag color="green" icon={<CheckOutlined />}>Selected</Tag>
                                                )}
                                                <Tag color="blue">{formatCurrency(quote.grand_total || quote.price)}</Tag>
                                            </div>
                                        </div>
                                    } 
                                    key={idx}
                                >
                                    <div className="p-6 border rounded-lg bg-white shadow-sm">
                                        {/* Header with Logo */}
                                        <div className="flex justify-between items-start border-b pb-4 mb-4">
                                            <div>
                                                <img src={logo} alt="Company Logo" style={{ height: 50, marginBottom: 8 }} />
                                                <div className="text-xs text-gray-500">Incoming Quotation</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-700">QUOTATION</div>
                                                <div className="text-xs text-gray-500">Date: {formatDate(quote.createdAt)}</div>
                                                <div className="text-xs text-gray-500">Ref: {quote._id.substring(0,8)}</div>
                                            </div>
                                        </div>

                                        {/* Quotation Summary */}
                                        <Row gutter={16} className="mb-4">
                                            <Col span={12}>
                                                <Card size="small" title="Quotation Summary">
                                                    <Descriptions column={1} size="small">
                                                        <Descriptions.Item label="Price">{formatCurrency(quote.price)}</Descriptions.Item>
                                                        <Descriptions.Item label="Discount">{quote.discount_percent || 0}%</Descriptions.Item>
                                                        <Descriptions.Item label="Grand Total">
                                                            <strong>{formatCurrency(quote.grand_total || quote.price)}</strong>
                                                        </Descriptions.Item>
                                                    </Descriptions>
                                                </Card>
                                            </Col>
                                            <Col span={12}>
                                                <Card size="small" title="Freelancer Details">
                                                    <Descriptions column={1} size="small">
                                                        <Descriptions.Item label="Name">
                                                            {quote.created_by?.name?.first_name} {quote.created_by?.name?.last_name}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Email">{quote.created_by?.email}</Descriptions.Item>
                                                        <Descriptions.Item label="Mobile">
                                                            {formatMobileNumber(quote.created_by?.mobile)}
                                                        </Descriptions.Item>
                                                    </Descriptions>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {/* Scope of Work */}
                                        <Card size="small" title="Scope of Work" className="mb-4">
                                            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                                {quote.scope_of_work || 'No scope of work provided.'}
                                            </p>
                                        </Card>

                                        {/* Action Buttons */}
                                        <div className="flex justify-between gap-2">
                                            <Button 
                                                type="default"
                                                icon={<CalculatorFilled />}
                                                onClick={() => {
                                                    openMarginCalculator(quote);
                                                    setReviewQuotesModalVisible(false);
                                                    setFinalQuotationModalVisible(true);
                                                }}
                                            >
                                                Add Margin & Create Final
                                            </Button>
                                            <Space>
                                                <Button 
                                                    type="primary" 
                                                    icon={<CheckOutlined />} 
                                                    onClick={() => handleCopyFreelancerData(quote)}
                                                    style={{ background: PURPLE_THEME.success, borderColor: PURPLE_THEME.success }}
                                                >
                                                    Use This Quotation
                                                </Button>
                                            </Space>
                                        </div>
                                    </div>
                                </Panel>
                            ))}
                        </Collapse>

                        {quotations.length === 0 && <Alert message="No quotations received yet." type="warning" />}
                    </div>
                )}
            </Modal>

            {/* --- MODAL: CREATE FINAL QUOTATION (WITH MARGIN CALCULATOR) --- */}
            <Modal
                title={null}
                open={finalQuotationModalVisible}
                onCancel={() => {
                    setFinalQuotationModalVisible(false);
                    setSelectedFreelancerQuotationId(null);
                }}
                footer={null}
                width={1100}
                style={{ top: 20 }}
                bodyStyle={{ padding: 0 }} 
            >
                <Form 
                    form={finalQuotationForm} 
                    layout="vertical" 
                    onFinish={handleCreateFinalQuotation}
                    initialValues={{
                        discount_percent: 0,
                        scope_of_work: selectedLead?.scope_of_work || ""
                    }}
                >
                    {/* INVOICE HEADER */}
                    <div className="p-6 bg-white rounded-t-lg">
                        <div className="flex justify-between items-start border-b pb-6 mb-6">
                            <div>
                                <img src={logo} alt="Company Logo" style={{ height: 60, marginBottom: 10 }} />
                                <div className="text-gray-500 text-sm">
                                    Professional Quotation<br/>For Customer Approval
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl font-bold text-purple-700 m-0">FINAL QUOTATION</h1>
                                <div className="mt-2 text-gray-600">
                                    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                                    <div><strong>Ref:</strong> {selectedLead?._id?.substring(0,8).toUpperCase()}</div>
                                 
                                </div>
                            </div>
                        </div>

                        <Row gutter={16}>
                            {/* Left Column - Margin Calculator */}
                            <Col span={8}>
                                <Card 
                                    title={
                                        <span className="flex items-center gap-2">
                                            <CalculatorFilled /> Margin Calculator
                                        </span>
                                    }
                                    className="h-full"
                                >
                                    <div className="space-y-4">
                                        {/* Source Price */}
                                        <div className="bg-gray-50 p-3 rounded">
                                            <div className="text-sm text-gray-500 mb-1">Freelancer Quotation Price</div>
                                            <div className="text-xl font-bold text-gray-800">
                                                {formatCurrency(basePrice)}
                                            </div>
                                            {selectedQuotation?.created_by && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    By: {selectedQuotation.created_by.name?.first_name} {selectedQuotation.created_by.name?.last_name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Margin Type */}
                                        <div>
                                            <div className="font-medium mb-2">Margin Type</div>
                                            <Radio.Group 
                                                value={marginType} 
                                                onChange={(e) => {
                                                    setMarginType(e.target.value);
                                                    updateMarginCalculation();
                                                }}
                                                buttonStyle="solid"
                                                className="w-full"
                                            >
                                                <Radio.Button value="percentage" className="w-1/2 text-center">Percentage (%)</Radio.Button>
                                                <Radio.Button value="fixed" className="w-1/2 text-center">Fixed Amount</Radio.Button>
                                            </Radio.Group>
                                        </div>

                                        {/* Margin Value */}
                                        <div>
                                            <div className="font-medium mb-2">
                                                {marginType === 'percentage' ? 'Margin Percentage' : 'Fixed Margin Amount'}
                                            </div>
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                value={marginValue}
                                                onChange={(value) => {
                                                    setMarginValue(value || 0);
                                                    updateMarginCalculation();
                                                }}
                                                min={0}
                                                max={marginType === 'percentage' ? 100 : 1000000}
                                                addonAfter={marginType === 'percentage' ? '%' : 'AED'}
                                            />
                                        </div>

                                        {/* Margin Calculation Results */}
                                        <Card size="small" title="Margin Calculation">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Freelancer Price:</span>
                                                    <span className="font-medium">{formatCurrency(basePrice)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Margin ({marginType === 'percentage' ? `${marginValue}%` : 'Fixed'}):</span>
                                                    <span className="font-medium text-green-600">
                                                        +{formatCurrency(marginAmount)}
                                                    </span>
                                                </div>
                                                <Divider style={{ margin: '8px 0' }} />
                                                <div className="flex justify-between text-lg font-bold text-purple-700">
                                                    <span>Price After Margin:</span>
                                                    <span>{formatCurrency(priceAfterMargin)}</span>
                                                </div>
                                            </div>
                                        </Card>

                                        <Button 
                                            type="primary"
                                            onClick={handleApplyMargin}
                                            block
                                            style={{ background: PURPLE_THEME.primary }}
                                        >
                                            Apply Margin
                                        </Button>
                                    </div>
                                </Card>
                            </Col>

                            {/* Right Column - Quotation Details */}
                            <Col span={16}>
                                <Card title="Quotation Details" className="h-full">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Card size="small" title="Customer Information" className="mb-4">
                                                <Descriptions column={1} size="small">
                                                    <Descriptions.Item label="Name">
                                                        {getCustomerName(selectedLead?.customer)}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Email">
                                                        {selectedLead?.customer?.email}
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Mobile">
                                                        {formatMobileNumber(selectedLead?.customer?.mobile)}
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card size="small" title="Service Details" className="mb-4">
                                                <Descriptions column={1} size="small">
                                                    <Descriptions.Item label="Estimate Type">
                                                        <Tag color="purple">{selectedLead?.type?.label}</Tag>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Subcategory">
                                                        <Tag color="blue">{selectedLead?.subcategory?.label}</Tag>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Area">
                                                        <strong>{selectedLead?.area_sqft} sq.ft</strong>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="Estimate ID">
                                                        <code>{selectedLead?._id?.substring(0,8)}</code>
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            </Card>
                                        </Col>
                                    </Row>

                                    {/* Scope of Work */}
                                    <div className="mb-4">
                                        <Form.Item 
                                            name="scope_of_work" 
                                            label="Scope of Work" 
                                            rules={[{ required: true, message: 'Please enter scope of work' }]}
                                        >
                                            <TextArea 
                                                rows={4} 
                                                placeholder="Detailed description of the work to be performed, materials to be used, timelines, and any specific requirements..."
                                                style={{ fontSize: '14px' }}
                                            />
                                        </Form.Item>
                                    </div>

                                    {/* Discount and Final Price */}
                                    <Card size="small" className="mb-4">
                                        <div className="space-y-4">
                                            {/* <Form.Item 
                                                name="discount_percent" 
                                                label="Discount Percentage"
                                                help="Enter discount percentage (0-100)"
                                            >
                                                <InputNumber 
                                                    min={0} 
                                                    max={100} 
                                                    style={{ width: '100%' }} 
                                                    addonAfter="%"
                                                    onChange={() => updateLiveFinalPrice()}
                                                />
                                            </Form.Item> */}

                                            {/* Live Price Calculation */}
                                            <div className="bg-purple-50 p-4 rounded border border-purple-100">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Price After Margin:</span>
                                                        <span className="font-semibold">{formatCurrency(priceAfterMargin)}</span>
                                                    </div>
                                                    
                                                  
                                                    
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    
                                                    <div className="flex justify-between text-xl font-bold text-purple-800">
                                                        <span>Final Price:</span>
                                                        <span>{formatCurrency(liveFinalPrice)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Card>
                            </Col>
                        </Row>

                        {/* Hidden fields for estimate_type and estimate_subcategory */}
                        <Form.Item name="estimate_type" hidden initialValue={selectedLead?.type?._id}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="estimate_subcategory" hidden initialValue={selectedLead?.subcategory?._id}>
                            <Input />
                        </Form.Item>

                        {/* Validation Message */}
                        {!selectedFreelancerQuotationId && (
                            <Alert 
                                message="No Freelancer Quotation Selected"
                                description="Please select a freelancer quotation first before creating the final quotation."
                                type="warning"
                                showIcon
                                className="mb-4"
                                action={
                                    <Button 
                                        size="small" 
                                        onClick={() => {
                                            setFinalQuotationModalVisible(false);
                                            setReviewQuotesModalVisible(true);
                                        }}
                                    >
                                        Select Quotation
                                    </Button>
                                }
                            />
                        )}
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="p-4 bg-gray-100 flex justify-between items-center rounded-b-lg border-t">
                        <div>
                            {selectedFreelancerQuotationId ? (
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                    Using freelancer quotation 
                                </Tag>
                            ) : (
                                <Tag color="orange" icon={<InfoCircleOutlined />}>
                                    No freelancer quotation selected
                                </Tag>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                onClick={() => {
                                    setFinalQuotationModalVisible(false);
                                    setSelectedFreelancerQuotationId(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                size="large" 
                                icon={<FileDoneOutlined />} 
                                style={{ background: PURPLE_THEME.primary }}
                                disabled={!selectedFreelancerQuotationId}
                            >
                                Create Final Quotation
                            </Button>
                        </div>
                    </div>
                </Form>
            </Modal>

            {/* --- MODAL: VIEW FINAL QUOTATION --- */}
            <Modal
                open={viewFinalQuotationModalVisible}
                onCancel={() => setViewFinalQuotationModalVisible(false)}
                footer={null}
                width={900}
                style={{ top: 20 }}
            >
                <>
                {selectedLead?.final_quotation ? (
                    <div className="space-y-6">
                        {/* Quotation Header */}
                        <div className="flex justify-between items-start border-b pb-4 mb-4">
                            <div>
                                <img src={logo} alt="Company Logo" style={{ height: 50, marginBottom: 8 }} />
                                {/* <div className="text-xs text-gray-500">Final Quotation</div> */}
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-purple-700">FINAL QUOTATION</div>
                                <div className="text-xs text-gray-500">Date: {formatDate(selectedLead.final_quotation.createdAt)}</div>
                                {/* <div className="mt-2">
                                    {selectedLead.final_quotation.superadmin_approved ? (
                                        <Tag color="success" icon={<CheckCircleOutlined />}>Approved</Tag>
                                    ) : (
                                        <Tag color="warning" icon={<ClockCircleOutlined />}>Pending Approval</Tag>
                                    )}
                                </div> */}
                            </div>
                        </div>

                        {/* Customer & Service Info */}
                        <Row gutter={16} className="mb-4">
                            <Col span={12}>
                                <Card size="small" title="Customer Information">
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Name">
                                            {getCustomerName(selectedLead.customer)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Email">
                                            {selectedLead.customer?.email}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Mobile">
                                            {formatMobileNumber(selectedLead.customer?.mobile)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title="Service Details">
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Service Type">
                                            <Tag color="purple">{selectedLead.service_type}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Subcategory">
                                            <Tag color="blue">{selectedLead.subcategory?.label}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Type">
                                            <Tag color="green">{selectedLead.type?.label}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Area">
                                            <strong>{selectedLead.area_sqft} sq.ft</strong>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>

                        {/* Final Quotation Details */}
                        <Card title="Quotation Details" className="mb-4">
                            <Row gutter={16}>
                                <Col span={16}>
                                    <div className="mb-4">
                                        <div className="font-medium mb-2">Scope of Work:</div>
                                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {selectedLead.final_quotation.scope_of_work || 'No scope of work provided.'}
                                            </p>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div className="bg-purple-50 p-4 rounded border border-purple-100">
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="font-medium">Price:</span>
                                                <span className="font-semibold">{formatCurrency(selectedLead.final_quotation.price)}</span>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <span className="font-medium">Discount:</span>
                                                <span className="font-semibold text-red-500">
                                                    {selectedLead.final_quotation.discount_percent || 0}%
                                                </span>
                                            </div>
                                            
                                            <Divider style={{ margin: '8px 0' }} />
                                            
                                            <div className="flex justify-between text-lg font-bold text-purple-800">
                                                <span>Grand Total:</span>
                                                <span>{formatCurrency(selectedLead.final_quotation.grand_total || selectedLead.final_quotation.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                        {/* Source Information */}
                        {/* {selectedLead.freelancer_selected_quotation && (
                            <Card title="Source Information" size="small" className="mb-4">
                                <Descriptions column={2} size="small">
                                    <Descriptions.Item label="Based on Freelancer Quotation">
                                        <Tag color="green">
                                            #{selectedLead.freelancer_selected_quotation.substring(0,8)}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Freelancer">
                                        {(() => {
                                            const selectedQuotation = getSelectedFreelancerQuotation(selectedLead);
                                            if (selectedQuotation?.created_by) {
                                                return `${selectedQuotation.created_by.name?.first_name} ${selectedQuotation.created_by.name?.last_name}`;
                                            }
                                            return 'N/A';
                                        })()}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )} */}

                        {/* Timeline */}
                        {/* <Card title="Timeline" size="small">
                            <Timeline mode="left" size="small">
                                <Timeline.Item color="green" label={formatDate(selectedLead.createdAt)}>
                                    Estimate Created
                                </Timeline.Item>
                                <Timeline.Item color="blue" label={formatDate(selectedLead.assigned_at)}>
                                    Assigned to Supervisor
                                </Timeline.Item>
                                {selectedLead.freelancer_quotations?.length > 0 && (
                                    <Timeline.Item color="purple" label={formatDate(selectedLead.freelancer_quotations[0].submitted_at)}>
                                        First Quotation Received
                                    </Timeline.Item>
                                )}
                                <Timeline.Item color="orange" label={formatDate(selectedLead.final_quotation.createdAt)}>
                                    Final Quotation Created
                                </Timeline.Item>
                            </Timeline>
                        </Card> */}

                     
                    </div>
                ) : (
                    <Alert 
                        message="No Final Quotation Found"
                        description="This estimate doesn't have a final quotation yet."
                        type="warning"
                        showIcon
                    />
                )}
                </>
                
                 {selectedLead?.admin_final_quotation ? (
                    <div className="space-y-6">
                  

                        {/* Final Quotation Details */}
                        <Card title="Admin quotaion details" className="mb-4">
                            <Row gutter={16}>
                                
                                <Col span={14}>
                                    <div className="bg-purple-50 p-4 rounded border border-purple-100">
                                        <div className="space-y-3">
                                              <div className="flex justify-between">
  <span className="font-medium">Margin on Supervisor Quotation:</span>
  <span className="font-semibold">
    {selectedLead?.admin_final_quotation?.margin_percent}% (
    {formatCurrency(selectedLead?.admin_final_quotation?.margin_amount)})
  </span>
</div>

                                            <div className="flex justify-between">
                                                <span className="font-medium">Price:</span>
                                                <span className="font-semibold">{formatCurrency(selectedLead.admin_final_quotation.price)}</span>
                                            </div>
                                            
                                            
                                            
                                            <Divider style={{ margin: '8px 0' }} />
                                            
                                            <div className="flex justify-between text-lg font-bold text-purple-800">
                                                <span>Grand Total:</span>
                                                <span>{formatCurrency(selectedLead.admin_final_quotation.grand_total || selectedLead.final_quotation.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>

                     


                        
                    </div>
                ) : (
                    <Alert 
                        message="No Final Quotation Found"
                        description="This estimate doesn't have a final quotation yet."
                        type="warning"
                        showIcon
                    />
                )}
            </Modal>
            
        </div>
    );
};

export default AssignedLeadsList;