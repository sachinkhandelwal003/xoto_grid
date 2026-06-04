import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../../manageApi/utils/custom.apiservice';
import CustomTable from '../../../pages/custom/CustomTable';
import { useSelector } from "react-redux";

import {
  Drawer, Button, Card, Tag, message, Form, Input, InputNumber,
  Modal, Row, Col, Divider, Table, Space, Select,
  Descriptions, Badge, Typography, Avatar, Tooltip,
  Image, List, Empty, Collapse, Alert
} from 'antd';
import {
  EyeOutlined, FileAddOutlined,
  UserOutlined,
  CalculatorOutlined, 
  PictureOutlined, EnvironmentOutlined,
  IdcardOutlined, QuestionCircleOutlined,
  DeleteOutlined, PlusOutlined, FileTextOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { showSuccessAlert, showErrorAlert } from '../../../../../manageApi/utils/sweetAlert';

// --- Import Freelancer Context ---
import { useFreelancer } from '../../../../../../src/context/FreelancerContext';      
import logo from "../../../../../assets/img/logoNew.png";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;

// Purple Theme Colors
const PURPLE_THEME = {
  primary: '#722ed1',
  primaryLight: '#9254de',
  primaryBg: '#f9f0ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  gray: '#6b7280',
};

const QuotationLeadsList = () => {
  const user = useSelector((s) => s.auth?.user);
  
  // Use Freelancer Context to access profile/rates
  const { freelancer } = useFreelancer(); 

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Drawers
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewQuotationModal, setViewQuotationModal] = useState(false);

  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [mySubmittedQuotation, setMySubmittedQuotation] = useState(null);

  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalItems: 0 });
  const [filters, setFilters] = useState({ status: 'assigned' });
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  
  
  // Single Item State
  const [quotationPrice, setQuotationPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [scopeOfWork, setScopeOfWork] = useState('');

  const statusConfig = {
    pending: { label: 'Pending', color: 'warning', bgColor: '#fff7e6', textColor: '#fa8c16' },
    assigned: { label: 'Assigned', color: 'processing', bgColor: '#e6f7ff', textColor: '#1890ff' },
    request_sent: { label: 'Request Sent', color: 'purple', bgColor: '#f9f0ff', textColor: '#722ed1' },
    quotations_received: { label: 'Quotations Received', color: 'success', bgColor: '#f6ffed', textColor: '#52c41a' },
    final_created: { label: 'Final Created', color: 'purple', bgColor: '#f0e6ff', textColor: '#722ed1' },
    superadmin_approved: { label: 'Approved', color: 'success', bgColor: '#f6ffed', textColor: '#52c41a' },
    customer_accepted: { label: 'Accepted', color: 'green', bgColor: '#f6ffed', textColor: '#389e0d' },
    customer_rejected: { label: 'Rejected', color: 'error', bgColor: '#fff1f0', textColor: '#cf1322' }
  };

  // --- Helpers ---
  const formatMobileNumber = (mobileObj) => mobileObj ? `${mobileObj.country_code || ''} ${mobileObj.number || ''}`.trim() : 'N/A';
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const formatCurrency = (amount, currency = 'AED') => amount ? `${currency} ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : `${currency} 0.00`;
  
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getCustomerName = (customer) => {
    if (!customer) return 'N/A';
    if (customer.name) return `${customer.name.first_name || ''} ${customer.name.last_name || ''}`.trim();
    return customer.full_name || customer.email || 'N/A';
  };

  // --- API Calls ---
  const fetchLeads = async (page = 1, limit = 10, filterParams = {}) => {
    setLoading(true);
    try {
      const params = { page, limit, freelancer_id: user?.id, ...filterParams };
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
      showErrorAlert('Error', 'Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  };

  const hasSubmittedQuotation = (estimate) => {
    if (!estimate.freelancer_quotations || !user?.id) return false;
    return estimate.freelancer_quotations.some(q => q.freelancer?._id === user.id || q.freelancer === user.id);
  };

  const isSentToFreelancer = (estimate) => {
    if (!estimate.sent_to_freelancers || !user?.id) return false;
    return estimate.sent_to_freelancers.some(f => f._id === user.id || f.id === user.id);
  };

  // --- Components ---
  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge
        count={config.label}
        style={{ backgroundColor: config.bgColor, color: config.textColor, border: `1px solid ${config.textColor}20` }}
      />
    );
  };

  const DetailCard = ({ title, icon, children }) => (
    <Card 
      size="small" 
      title={<div className="flex items-center gap-2" style={{ color: PURPLE_THEME.primary }}>{icon} <span className="font-semibold">{title}</span></div>}
      style={{ borderLeft: `4px solid ${PURPLE_THEME.primary}`, marginBottom: '16px', borderRadius: '8px' }}
      headStyle={{ background: PURPLE_THEME.primaryBg, borderBottom: 'none' }}
      bodyStyle={{ padding: '16px' }}
    >
      {children}
    </Card>
  );

  // --- Action Handlers ---
  const calculateGrandTotal = () => {
    const discountAmount = (quotationPrice * discountPercent) / 100;
    return quotationPrice - discountAmount;
  };

  const handlePageChange = (page, pageSize) => fetchLeads(page, pageSize, filters);
  const handleFilter = (newFilters) => { setFilters(newFilters); fetchLeads(1, pagination.itemsPerPage, newFilters); };

  // --- OPEN CREATE MODAL & AUTO-POPULATE PRICE ---
  const openCreateQuotationModal = (estimate) => {
    if (hasSubmittedQuotation(estimate)) return message.info('You have already submitted a quotation');
    
    setSelectedEstimate(estimate);
    form.resetFields();
    
    // Reset state
    setQuotationPrice(0);
    setDiscountPercent(0);
    setScopeOfWork('');

    // 1. Find matching service in Freelancer Profile (Rate Card)
    let initialPrice = 0;
    const typeLabel = estimate.type?.label || 'Service';
    const subcategoryLabel = estimate.subcategory?.label || 'General';

    if (freelancer && freelancer.services_offered) {
        // Look for matching subcategory/type in freelancer profile
        const matchedService = freelancer.services_offered.find(s => 
            s.subcategories && s.subcategories.some(sub => sub.type?._id === estimate.type?._id)
        );

        if (matchedService) {
            const specificType = matchedService.subcategories.find(sub => sub.type?._id === estimate.type?._id);
            if (specificType) {
                // Use price from profile (Rate Card)
                initialPrice = parseFloat(specificType.price_range) || 0;
            }
        }
    }

    // Set the initial price (this is the TOTAL price, not per sq.ft)
    setQuotationPrice(initialPrice);

    setCreateModalVisible(true);
  };

  const openViewQuotationModal = (estimate) => {
    const myQ = estimate.freelancer_quotations?.find(q => q.freelancer?._id === user.id || q.freelancer === user.id);
    if (myQ) {
      setMySubmittedQuotation(myQ.quotation || myQ);
      setSelectedEstimate(estimate);
      setViewQuotationModal(true);
    }
  };

  
  const openDetailsDrawer = (lead) => { setSelectedLead(lead); setDetailsDrawerVisible(true); };

  const handleSubmitQuotation = async () => {
    setSubmitting(true);
    try {
      if (!scopeOfWork?.trim()) {
        setSubmitting(false);
        return showErrorAlert("Validation Error", "Scope of work is required.");
      }
      
      if (quotationPrice <= 0) {
        setSubmitting(false);
        return showErrorAlert("Validation Error", "Please enter a valid price.");
      }
      
      // Calculate final price after discount
      const discountAmount = (quotationPrice * discountPercent) / 100;
      const finalPrice = quotationPrice;

      // Send simplified JSON format as requested
      const quotationData = { 
        scope_of_work: scopeOfWork,
        price: finalPrice,  // Final price after discount
        discount_percent: discountPercent,
        estimate_type: selectedEstimate?.type?._id,
        estimate_subcategory: selectedEstimate?.subcategory?._id
      };
      
      
      
      const response = await apiService.post(`/estimates/${selectedEstimate._id}/quotation`, quotationData);
      
      if (response.success) {
        showSuccessAlert("Success", "Quotation submitted successfully");
        setCreateModalVisible(false);
        setSelectedEstimate(null);
        fetchLeads(pagination.currentPage, pagination.itemsPerPage, filters);
      }
    } catch (error) {
      showErrorAlert("Error", error?.response?.data?.message || "Failed to submit quotation");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { if (user?.id) fetchLeads(1, 10, { status: 'assigned' }); }, [user]);

  // --- Main Table Columns ---
  const columns = [
    { 
      title: 'Customer', width: 220, 
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} style={{ background: PURPLE_THEME.primaryBg, color: PURPLE_THEME.primary }} icon={<UserOutlined />} />
          <div>
            <div className="font-semibold">{getCustomerName(r.customer)}</div>
            <div className="text-xs text-gray-400">{formatMobileNumber(r.customer?.mobile)}</div>
          </div>
        </div>
      )
    },
    { 
      title: 'Service Details', width: 200, 
      render: (_, r) => (
        <div>
          <Tag color="purple">{r.service_type?.toUpperCase()}</Tag>
          <div className="text-sm font-medium mt-1">{r.subcategory?.label}</div>
          <div className="text-xs text-gray-500">{r.type?.label}</div>
        </div>
      )
    },
    { 
      title: 'Area', width: 100, 
      render: (_, r) => (
        <div className="text-center">
          <div className="font-bold text-gray-700">{r.area_sqft} <span className="text-xs font-normal">sq.ft</span></div>
        </div>
      )
    },
  
    // { title: 'Status', width: 120, render: (_, r) => <StatusBadge status={r.status} /> },
    { 
      title: 'Actions', width: 180, 
      render: (_, r) => (
        <Space>
          <Tooltip title="View Details">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openDetailsDrawer(r)} />
          </Tooltip>
          {isSentToFreelancer(r) && !hasSubmittedQuotation(r) ? (
            <Button type="primary" size="small" icon={<FileAddOutlined />} onClick={() => openCreateQuotationModal(r)} style={{ background: PURPLE_THEME.primary }}>Quote</Button>
          ) : hasSubmittedQuotation(r) ? (
            <Button size="small" onClick={() => openViewQuotationModal(r)} style={{ color: PURPLE_THEME.success, borderColor: PURPLE_THEME.success }}>View Quote</Button>
          ) : null}
        </Space>
      )
    }
  ];

  const grandTotal = calculateGrandTotal();

  return (
    <div className="min-h-screen p-6" style={{ background: '#f0f2f5' }}>
      <div className="max-w-screen-2xl mx-auto">
        <Title level={2} style={{ color: PURPLE_THEME.primary, marginBottom: 20 }}>My Estimations</Title>
        
        <Card bodyStyle={{ padding: 0 }} className="shadow-lg">
          <CustomTable 
            columns={columns} 
            data={leads} 
            totalItems={pagination.totalItems} 
            currentPage={pagination.currentPage} 
            itemsPerPage={pagination.itemsPerPage} 
            onPageChange={handlePageChange} 
            onFilter={handleFilter} 
            loading={loading} 
          />
        </Card>

        {/* --- DETAILS DRAWER --- */}
        <Drawer 
          title={<div className="flex items-center gap-2 text-purple-700"><FileTextOutlined /> Estimate Full Details</div>} 
          width={900} 
          onClose={() => setDetailsDrawerVisible(false)} 
          open={detailsDrawerVisible}
          bodyStyle={{ padding: '24px', backgroundColor: '#fafafa' }}
        >
          {selectedLead && (
            <div className="space-y-6">
              <div className="flex justify-between items-center p-5 bg-white rounded-xl border border-purple-100 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 m-0">{selectedLead.service_type} - {selectedLead.subcategory?.label}</h3>
                  <div className="text-gray-500 mt-1">Ref: {selectedLead._id.substring(0,8).toUpperCase()}</div>
                </div>
                <StatusBadge status={selectedLead.status} />
              </div>

              <Row gutter={24}>
                <Col span={14}>
                  <DetailCard title="Customer Information" icon={<IdcardOutlined />}>
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Name"><span className="font-medium">{getCustomerName(selectedLead.customer)}</span></Descriptions.Item>
                      <Descriptions.Item label="Email">{selectedLead.customer?.email}</Descriptions.Item>
                      <Descriptions.Item label="Mobile">{formatMobileNumber(selectedLead.customer?.mobile)}</Descriptions.Item>
                      {selectedLead.customer?.location && (
                        <Descriptions.Item label="Address">
                          <div className="text-xs text-gray-500 leading-tight">
                            {selectedLead.customer.location.address}<br/>
                            {selectedLead.customer.location.city}, {selectedLead.customer.location.state}
                          </div>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </DetailCard>

                  {/* Enhanced Estimate Answers Display */}
                  {selectedLead.EstimateAnswers?.length > 0 && (
                     <DetailCard title="Estimation Details" icon={<QuestionCircleOutlined />}>
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
                  <DetailCard title="Service Specifications" icon={<CalculatorOutlined />}>
                    <div className="bg-purple-50 p-4 rounded-lg text-center mb-4 border border-purple-100">
                       <div className="text-3xl font-bold text-purple-700">{selectedLead.area_sqft}</div>
                       <div className="text-xs text-purple-400 uppercase font-bold tracking-wider">Total Area (Sq.Ft)</div>
                    </div>
                    <Descriptions column={1} size="small" bordered>
                       <Descriptions.Item label="Dimensions">{selectedLead.area_length || '-'} x {selectedLead.area_width || '-'}</Descriptions.Item>
                       <Descriptions.Item label="Type">{selectedLead.type?.label}</Descriptions.Item>
                       <Descriptions.Item label="Category">{selectedLead.subcategory?.label}</Descriptions.Item>
                       <Descriptions.Item label="Estimate Amount"><strong>{formatCurrency(selectedLead.estimated_amount)}</strong></Descriptions.Item>
                    </Descriptions>
                    {selectedLead.description && (
                      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600 italic border border-gray-200">
                        "{selectedLead.description}"
                      </div>
                    )}
                  </DetailCard>

                  {(selectedLead.type_gallery_snapshot?.previewImage?.url || selectedLead.type_gallery_snapshot?.moodboardImages?.length > 0) && (
                    <DetailCard title="Visual References" icon={<PictureOutlined />}>
                       {selectedLead.type_gallery_snapshot?.previewImage?.url && (
                          <div className="mb-3">
                             <div className="text-xs font-bold text-gray-400 mb-1">PREVIEW IMAGE</div>
                             <Image 
                               src={getFullImageUrl(selectedLead.type_gallery_snapshot.previewImage.url)} 
                               className="rounded shadow-sm"
                               style={{ maxHeight: 150, objectFit: 'cover', width: '100%' }}
                             />
                          </div>
                       )}
                       {selectedLead.type_gallery_snapshot?.moodboardImages?.length > 0 && (
                          <div>
                             <div className="text-xs font-bold text-gray-400 mb-1">MOODBOARD</div>
                             <div className="grid grid-cols-3 gap-2">
                                {selectedLead.type_gallery_snapshot.moodboardImages.map((img, i) => (
                                   <Image 
                                     key={i}
                                     src={getFullImageUrl(img.url)}
                                     className="rounded border border-gray-200"
                                     style={{ height: 60, objectFit: 'cover', width: '100%' }}
                                   />
                                ))}
                             </div>
                          </div>
                       )}
                    </DetailCard>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Drawer>

        {/* --- CREATE QUOTATION MODAL --- */}
        <Modal
          title={null}
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={null}
          width={1000}
          style={{ top: 20 }}
          destroyOnClose
          maskClosable={false}
        >
          <div className="p-6">
            {/* Header with Logo */}
            <div className="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                <img src={logo} alt="Company Logo" style={{ height: 50, marginBottom: 8 }} />
                <div className="text-xs text-gray-500">Freelancer Quotation</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-700">QUOTATION</div>
                <div className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</div>
                {selectedEstimate && (
                  <div className="text-xs text-gray-500 mt-1">
                    For Estimate: {selectedEstimate._id.substring(0,8)}
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Estimate Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <Row gutter={24}>
                <Col span={12}>
                  <div className="mb-2">
                    <div className="text-xs text-gray-500">CUSTOMER</div>
                    <div className="font-bold text-lg">{getCustomerName(selectedEstimate?.customer)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">SERVICE</div>
                    <div className="font-medium">
                      <Tag color="purple">{selectedEstimate?.service_type?.toUpperCase()}</Tag>
                      {selectedEstimate?.subcategory?.label} - {selectedEstimate?.type?.label}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="mb-2">
                        <div className="text-xs text-gray-500">AREA</div>
                        <div className="font-bold text-lg">{selectedEstimate?.area_sqft} sq.ft</div>
                      </div>
                    </Col>
                
                  </Row>
                </Col>
              </Row>
            </div>

            {/* Quotation Form */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column - Price Inputs */}
              <div className="col-span-8">
                <Card 
                  title={<div className="font-bold">Quotation Details</div>}
                  className="shadow-sm border"
                >
                  <div className="space-y-6">
                    {/* Price Input */}
                    <div>
                      <div className="font-medium mb-2">Total Quotation Amount (AED)</div>
                      <InputNumber
                        style={{ width: '100%', borderColor: PURPLE_THEME.primary, height: 48 }}
                        size="large"
                        min={0}
                        value={quotationPrice}
                        onChange={(value) => setQuotationPrice(value || 0)}
                        placeholder="Enter your quotation price"
                        prefix="AED"
                        className="text-lg"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Total price for the entire project
                      </div>
                    </div>

                    {/* Discount */}
                    <div>
                      <div className="font-medium mb-2">Discount Percentage</div>
                      <InputNumber
                        style={{ width: '100%', height: 48 }}
                        size="large"
                        min={0}
                        max={100}
                        value={discountPercent}
                        onChange={(value) => setDiscountPercent(value || 0)}
                        placeholder="Enter discount percentage"
                        addonAfter="%"
                        className="text-lg"
                      />
                    </div>

                    {/* Scope of Work */}
                    <div>
                      <div className="font-medium mb-2">Scope of Work / Terms</div>
                      <TextArea
                        rows={6}
                        value={scopeOfWork}
                        onChange={(e) => setScopeOfWork(e.target.value)}
                        placeholder="Describe the scope of work, materials, timeline, terms and conditions clearly..."
                        style={{ borderColor: PURPLE_THEME.primary }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Summary */}
              <div className="col-span-4">
                <Card 
                  className="bg-purple-50 border-purple-200 shadow-sm"
                  title={<div className="font-bold text-purple-700">Price Summary</div>}
                >
                  <div className="space-y-4">
                    {/* Service Type */}
                    <div className="bg-white p-3 rounded border">
                      <div className="text-xs text-gray-500">SERVICE TYPE</div>
                      <div className="font-bold">{selectedEstimate?.type?.label}</div>
                      <div className="text-sm text-gray-600">{selectedEstimate?.subcategory?.label}</div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">Quotation Amount:</span>
                        <span className="font-bold text-lg">{formatCurrency(quotationPrice)}</span>
                      </div>
                      
                      {discountPercent > 0 && (
                        <>
                          <div className="flex justify-between items-center text-red-500 border-b pb-2">
                            <span>Discount ({discountPercent}%):</span>
                            <span className="font-bold">-{formatCurrency((quotationPrice * discountPercent) / 100)}</span>
                          </div>
                          <div className="border-b border-dashed"></div>
                        </>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-lg">Grand Total:</span>
                        <span className="text-2xl font-bold text-purple-700">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button 
                        type="primary" 
                        onClick={handleSubmitQuotation} 
                        loading={submitting} 
                        style={{ 
                          background: PURPLE_THEME.primary,
                          width: '100%',
                          height: 48,
                          fontSize: '16px'
                        }}
                        disabled={!scopeOfWork.trim() || quotationPrice <= 0}
                        block
                      >
                        {submitting ? 'Submitting...' : 'Submit Quotation'}
                      </Button>
                      
                      <Button 
                        onClick={() => setCreateModalVisible(false)} 
                        style={{ 
                          width: '100%',
                          height: 40,
                          marginTop: 12,
                          borderColor: PURPLE_THEME.gray
                        }}
                        block
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 text-center pt-4 border-t">
                      * This quotation will be submitted to the customer for review
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Modal>

        {/* --- VIEW SUBMITTED QUOTATION MODAL --- */}
        <Modal
          title={null}
          open={viewQuotationModal}
          onCancel={() => setViewQuotationModal(false)}
          footer={<Button onClick={() => setViewQuotationModal(false)}>Close</Button>}
          width={900}
          style={{ top: 20 }}
        >
          {mySubmittedQuotation && (
            <div className="p-6">
              {/* Header with Logo */}
              <div className="flex justify-between items-start border-b pb-6 mb-6">
                <div>
                  <img src={logo} alt="Company Logo" style={{ height: 50, marginBottom: 8 }} />
                  <div className="text-xs text-gray-500">Submitted Quotation</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-700">QUOTATION</div>
                  <div className="text-sm text-gray-500">Date: {formatDate(mySubmittedQuotation.createdAt)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Reference: {mySubmittedQuotation._id.substring(0,8)}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <Tag color="green" style={{ fontSize: 14, padding: '6px 12px' }}>
                    SUBMITTED
                  </Tag>
                  <div className="text-sm text-gray-500 mt-1">
                    Submitted on {formatDate(mySubmittedQuotation.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Freelancer</div>
                  <div className="font-bold">{freelancer?.name.full_name || 'N/A'}</div>
                </div>
              </div>

              {/* Quotation Summary Card */}
             <div className="overflow-x-auto">
  <table className="w-full border border-purple-200 border-collapse">
    <thead>
      <tr className="text-xs text-gray-500 uppercase">
        <th className="border border-purple-200 p-4 text-center">Service Type</th>
        <th className="border border-purple-200 p-4 text-center">Price</th>
        <th className="border border-purple-200 p-4 text-center">Discount</th>
        <th className="border border-purple-200 p-4 text-center">Quotation Amount</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td className="border border-purple-200 p-4 text-center">
          <div className="font-bold text-lg">
            {mySubmittedQuotation.estimate_type?.label ||
              selectedEstimate?.type?.label}
          </div>
          <div className="text-sm text-gray-600">
            {mySubmittedQuotation.estimate_subcategory?.label ||
              selectedEstimate?.subcategory?.label}
          </div>
        </td>

        <td className="border border-purple-200 p-4 text-center">
          <div className="text-3xl font-bold text-purple-700">
            {formatCurrency(mySubmittedQuotation.price)}
          </div>
        </td>

        <td className="border border-purple-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-500">
            {mySubmittedQuotation.discount_percent || 0}%
          </div>
          <div className="text-sm text-gray-600">
            -{formatCurrency(
              (mySubmittedQuotation.price *
                (mySubmittedQuotation.discount_percent || 0)) /
                100
            )}
          </div>
        </td>

        <td className="border border-purple-200 p-4 text-center">
          <div className="text-3xl font-bold text-purple-700">
            {formatCurrency(mySubmittedQuotation.grand_total)}
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

              {/* Scope of Work */}
              <Card 
                title={<div className="font-bold">Scope of Work & Terms</div>}
                className="mb-6 shadow-sm"
              >
                <div className="p-4 bg-gray-50 rounded border">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {mySubmittedQuotation.scope_of_work || 'No scope of work provided.'}
                  </p>
                </div>
              </Card>

              {/* Estimate Details */}
              {/* {selectedEstimate && (
                <Card 
                  title={<div className="font-bold">Estimate Details</div>}
                  className="shadow-sm"
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="text-xs text-gray-500 mb-1">CUSTOMER</div>
                        <div className="font-bold">{getCustomerName(selectedEstimate.customer)}</div>
                      </div>
                    </Col>
                    <Col span={4}>
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="text-xs text-gray-500 mb-1">AREA</div>
                        <div className="font-bold">{selectedEstimate.area_sqft} sq.ft</div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="text-xs text-gray-500 mb-1">SERVICE</div>
                        <div className="font-bold">{selectedEstimate.service_type}</div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="text-xs text-gray-500 mb-1">ESTIMATE VALUE</div>
                        <div className="font-bold text-purple-700">
                          {formatCurrency(selectedEstimate.estimated_amount)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )} */}
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};

export default QuotationLeadsList;