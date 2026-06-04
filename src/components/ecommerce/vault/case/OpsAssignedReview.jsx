import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { 
  message, Spin, Progress, Modal, Tabs, Tag, Descriptions, 
  Row, Col, Card, Steps, Button, Space, Alert, Typography, 
  Form, Input, Select, Badge, Tooltip, Statistic, Divider,
  Empty, Collapse, Timeline as AntTimeline, Grid, Table, Popconfirm
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  BankOutlined,
  HomeOutlined,
  IdcardOutlined,
  FileTextOutlined,
  DownloadOutlined,
  SendOutlined,
  RollbackOutlined,
  FileProtectOutlined,
  DollarOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  TeamOutlined,
  WalletOutlined,
  PercentageOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CalculatorOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
  SwapOutlined,
  AuditOutlined,
  RightOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

// Theme Colors
const PRIMARY = '#5c039c';
const PRIMARY_HOVER = '#7c3aed';
const PRIMARY_LIGHT = '#f3e8ff';
const PRIMARY_BORDER = '#e9d5ff';
const SUCCESS_COLOR = '#10b981';
const SUCCESS_HOVER = '#059669';
const WARNING_COLOR = '#f59e0b';
const WARNING_HOVER = '#d97706';
const ERROR_COLOR = '#ef4444';
const ERROR_HOVER = '#dc2626';
const INFO_COLOR = '#3b82f6';
const INFO_HOVER = '#2563eb';

// Role slug mapping
const roleSlugMap = {
  0: "superadmin", 1: "admin", 2: "customer",
  15: "agency", 16: "agent", 17: "developer", 18: "vault-admin", 23: "ops"
};

// Document labels
const DOCUMENT_LABELS = {
  'bank_application_form': 'Bank Application Form',
  'emirates_id_front': 'Emirates ID (Front)',
  'emirates_id_back': 'Emirates ID (Back)',
  'passport': 'Passport Copy',
  'visa': 'Residence Visa',
  'bank_statements': 'Bank Statements (6 Months)',
  'salary_certificate': 'Salary Certificate',
  'payslips': 'Payslips (6 Months)',
  'title_deed': 'Title Deed',
  'consent_form': 'Consent Form',
  'property_valuation': 'Property Valuation Report',
  'fol_document': 'FOL Document',
  'signed_fol': 'Signed FOL',
  'noc_letter': 'NOC Letter'
};

// ==================== COMPLETE STATUS FLOW CONFIGURATION ====================
const STATUS_FLOW = [
  { 
    key: 'Assigned - Pending Review', 
    title: 'Assigned', 
    icon: <UserOutlined />, 
    color: INFO_COLOR,
    nextStatuses: ['Under Review', 'Returned - Pending Correction'],
    description: 'Case assigned to Ops team',
    requiresAmount: false
  },
  { 
    key: 'Under Review', 
    title: 'Under Review', 
    icon: <EyeOutlined />, 
    color: INFO_COLOR,
    nextStatuses: ['Bank Application', 'Returned - Pending Correction'],
    description: 'Ops team is reviewing documents',
    requiresAmount: false
  },
  { 
    key: 'Returned - Pending Correction', 
    title: 'Returned', 
    icon: <RollbackOutlined />, 
    color: WARNING_COLOR,
    nextStatuses: ['Resubmitted-After Correction'],
    description: 'Sent back for corrections',
    requiresAmount: false
  },
  { 
    key: 'Resubmitted-After Correction', 
    title: 'Resubmitted', 
    icon: <SwapOutlined />, 
    color: WARNING_COLOR,
    nextStatuses: ['Under Review'],
    description: 'Advisor resubmitted after corrections',
    requiresAmount: false
  },
  { 
    key: 'Bank Application', 
    title: 'Bank Application', 
    icon: <SendOutlined />, 
    color: PRIMARY,
    nextStatuses: ['Pre-Approved', 'Collecting Documentation', 'Rejected'],
    description: 'Submitted to bank for processing',
    requiresAmount: false,
    requiresReference: true
  },
  { 
    key: 'Collecting Documentation', 
    title: 'Collecting Docs', 
    icon: <FileTextOutlined />, 
    color: WARNING_COLOR,
    nextStatuses: ['Bank Application', 'Lost'],
    description: 'Bank requested additional documents',
    requiresAmount: false
  },
  { 
    key: 'Pre-Approved', 
    title: 'Pre-Approved', 
    icon: <CheckCircleOutlined />, 
    color: SUCCESS_COLOR,
    nextStatuses: ['Valuation', 'Rejected'],
    description: 'Bank pre-approved the loan',
    requiresAmount: true,
    amountLabel: 'Pre-Approved Amount'
  },
  { 
    key: 'Valuation', 
    title: 'Valuation', 
    icon: <HomeOutlined />, 
    color: WARNING_COLOR,
    nextStatuses: ['FOL Processed', 'Rejected'],
    description: 'Property valuation in progress',
    requiresAmount: false
  },
  { 
    key: 'FOL Processed', 
    title: 'FOL Processed', 
    icon: <FileTextOutlined />, 
    color: INFO_COLOR,
    nextStatuses: ['FOL Issued', 'Rejected'],
    description: 'Bank processing Final Offer Letter',
    requiresAmount: false
  },
  { 
    key: 'FOL Issued', 
    title: 'FOL Issued', 
    icon: <FileTextOutlined />, 
    color: INFO_COLOR,
    nextStatuses: ['FOL Signed', 'Rejected'],
    description: 'Final Offer Letter issued',
    requiresAmount: true,
    amountLabel: 'FOL Amount'
  },
  { 
    key: 'FOL Signed', 
    title: 'FOL Signed', 
    icon: <CheckCircleOutlined />, 
    color: SUCCESS_COLOR,
    nextStatuses: ['Disbursed', 'Rejected'],
    description: 'Customer signed the FOL',
    requiresAmount: false
  },
  { 
    key: 'Disbursed', 
    title: 'Disbursed', 
    icon: <DollarOutlined />, 
    color: SUCCESS_COLOR,
    nextStatuses: [],
    description: 'Loan amount disbursed successfully!',
    requiresAmount: true,
    amountLabel: 'Disbursed Amount'
  },
  { 
    key: 'Rejected', 
    title: 'Rejected', 
    icon: <CloseCircleOutlined />, 
    color: ERROR_COLOR,
    nextStatuses: [],
    description: 'Case rejected by bank',
    requiresAmount: false,
    requiresReason: true
  },
  { 
    key: 'Lost', 
    title: 'Lost', 
    icon: <CloseCircleOutlined />, 
    color: '#6B7280',
    nextStatuses: [],
    description: 'Case lost',
    requiresAmount: false,
    requiresReason: true
  }
];


// After STATUS_FLOW definition, add this:

// Available statuses for quick update buttons (with big icons)
const AVAILABLE_STATUSES = [
  { value: 'Under Review', label: 'Under Review', color: INFO_COLOR, icon: <EyeOutlined style={{ fontSize: 28 }} />, bgColor: '#eff6ff' },
  { value: 'Returned - Pending Correction', label: 'Return for Correction', color: WARNING_COLOR, icon: <RollbackOutlined style={{ fontSize: 28 }} />, bgColor: '#fffbeb' },
  { value: 'Bank Application', label: 'Submit to Bank', color: SUCCESS_COLOR, icon: <SendOutlined style={{ fontSize: 28 }} />, bgColor: '#ecfdf5' },
  { value: 'Pre-Approved', label: 'Pre-Approved', color: SUCCESS_COLOR, icon: <CheckCircleOutlined style={{ fontSize: 28 }} />, bgColor: '#ecfdf5' },
  { value: 'Valuation', label: 'Valuation Requested', color: WARNING_COLOR, icon: <HomeOutlined style={{ fontSize: 28 }} />, bgColor: '#fffbeb' },
  { value: 'FOL Processed', label: 'FOL Processed', color: INFO_COLOR, icon: <FileTextOutlined style={{ fontSize: 28 }} />, bgColor: '#eff6ff' },
  { value: 'FOL Issued', label: 'FOL Issued', color: INFO_COLOR, icon: <FileTextOutlined style={{ fontSize: 28 }} />, bgColor: '#eff6ff' },
  { value: 'FOL Signed', label: 'FOL Signed', color: SUCCESS_COLOR, icon: <CheckCircleOutlined style={{ fontSize: 28 }} />, bgColor: '#ecfdf5' },
  { value: 'Disbursed', label: 'Disbursed', color: SUCCESS_COLOR, icon: <DollarOutlined style={{ fontSize: 28 }} />, bgColor: '#ecfdf5' },
  { value: 'Collecting Documentation', label: 'Collecting Docs', color: WARNING_COLOR, icon: <FileTextOutlined style={{ fontSize: 28 }} />, bgColor: '#fffbeb' },
  { value: 'Rejected', label: 'Rejected', color: ERROR_COLOR, icon: <CloseCircleOutlined style={{ fontSize: 28 }} />, bgColor: '#fef2f2' },
  { value: 'Lost', label: 'Lost', color: '#6B7280', icon: <CloseCircleOutlined style={{ fontSize: 28 }} />, bgColor: '#f3f4f6' }
];
// Get status config by key
const getStatusConfig = (statusKey) => {
  return STATUS_FLOW.find(s => s.key === statusKey) || STATUS_FLOW[0];
};

// Get next status suggestions
const getSuggestedNextStatuses = (currentStatus) => {
  const config = getStatusConfig(currentStatus);
  return config.nextStatuses || [];
};

// Get status index for timeline
const getStatusIndex = (statusKey) => {
  const order = [
    'Assigned - Pending Review',
    'Under Review',
    'Bank Application',
    'Pre-Approved',
    'Valuation',
    'FOL Processed',
    'FOL Issued',
    'FOL Signed',
    'Disbursed'
  ];
  const index = order.findIndex(o => o === statusKey);
  return index !== -1 ? index : 0;
};

// Custom Button Component
const CustomButton = ({ children, type = 'primary', onClick, loading, disabled, icon, style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getButtonStyle = () => {
    let baseStyle = {
      background: PRIMARY,
      borderColor: PRIMARY,
      color: '#fff',
      borderRadius: 8,
      fontWeight: 500,
      transition: 'all 0.3s ease',
    };
    
    if (type === 'success') {
      baseStyle = { ...baseStyle, background: SUCCESS_COLOR, borderColor: SUCCESS_COLOR };
    } else if (type === 'warning') {
      baseStyle = { ...baseStyle, background: WARNING_COLOR, borderColor: WARNING_COLOR };
    } else if (type === 'danger') {
      baseStyle = { ...baseStyle, background: ERROR_COLOR, borderColor: ERROR_COLOR };
    } else if (type === 'outline') {
      baseStyle = { ...baseStyle, background: '#fff', borderColor: PRIMARY_BORDER, color: PRIMARY };
    }
    
    if (isHovered && !disabled && !loading) {
      if (type === 'success') {
        baseStyle = { ...baseStyle, background: SUCCESS_HOVER, borderColor: SUCCESS_HOVER, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${SUCCESS_COLOR}40` };
      } else if (type === 'warning') {
        baseStyle = { ...baseStyle, background: WARNING_HOVER, borderColor: WARNING_HOVER, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${WARNING_COLOR}40` };
      } else if (type === 'danger') {
        baseStyle = { ...baseStyle, background: ERROR_HOVER, borderColor: ERROR_HOVER, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${ERROR_COLOR}40` };
      } else if (type === 'outline') {
        baseStyle = { ...baseStyle, background: PRIMARY_LIGHT, borderColor: PRIMARY, color: PRIMARY, transform: 'translateY(-2px)' };
      } else {
        baseStyle = { ...baseStyle, background: PRIMARY_HOVER, borderColor: PRIMARY_HOVER, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${PRIMARY}40` };
      }
    }
    return baseStyle;
  };

  return (
    <Button
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={{ ...getButtonStyle(), ...style }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Button>
  );
};

// Document verification card component
const DocumentReviewCard = ({ doc, onVerify, onReject, isUpdating }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const docLabel = DOCUMENT_LABELS[doc.documentType] || doc.documentType?.replace(/_/g, ' ').toUpperCase() || 'Document';
  const isVerified = doc.verificationStatus === 'verified';
  const isRejected = doc.verificationStatus === 'rejected';

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      await onVerify(doc._id, doc.documentType);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    try {
      await onReject(doc._id, doc.documentType, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setSubmitting(false);
    }
  };

  const isPdf = (url) => url?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <Card
        hoverable
        style={{
          borderRadius: 16,
          border: `1.5px solid ${isVerified ? SUCCESS_COLOR : isRejected ? ERROR_COLOR : isHovered ? PRIMARY : '#e5e7eb'}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered ? `0 8px 20px ${PRIMARY}20` : '0 1px 3px rgba(0,0,0,0.05)',
        }}
        bodyStyle={{ padding: 16 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: isVerified ? '#ecfdf5' : isRejected ? '#fef2f2' : PRIMARY_LIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: isVerified ? SUCCESS_COLOR : isRejected ? ERROR_COLOR : PRIMARY,
              flexShrink: 0,
            }}
          >
            <FileProtectOutlined />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <Text strong style={{ fontSize: 14 }}>{docLabel}</Text>
              <Badge
                color={isVerified ? SUCCESS_COLOR : isRejected ? ERROR_COLOR : WARNING_COLOR}
                text={
                  <span style={{ color: isVerified ? SUCCESS_COLOR : isRejected ? ERROR_COLOR : WARNING_COLOR, fontSize: 11 }}>
                    {isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                  </span>
                }
              />
            </div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }} ellipsis>
              {doc.fileName}
            </Text>
            <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>
              {dayjs(doc.uploadedAt).format('DD MMM YYYY')}
            </Text>
            {doc.isFromLead && (
              <Tag color="purple" style={{ marginTop: 8, fontSize: 10, borderRadius: 6 }}>
                Copied from Lead
              </Tag>
            )}
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <CustomButton type="outline" size="small" icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)} style={{ flex: 1, padding: '4px 0' }}>
            View
          </CustomButton>
          <CustomButton type="outline" size="small" icon={<DownloadOutlined />} onClick={() => window.open(doc.fileUrl, '_blank')} style={{ flex: 1, padding: '4px 0' }}>
            Download
          </CustomButton>
          {!isVerified && !isRejected && (
            <>
              <CustomButton type="success" size="small" icon={<CheckCircleOutlined />} onClick={handleVerify} loading={submitting} disabled={isUpdating} style={{ flex: 1, padding: '4px 0' }}>
                Verify
              </CustomButton>
              <CustomButton type="danger" size="small" icon={<CloseCircleOutlined />} onClick={() => setShowRejectModal(true)} loading={submitting} disabled={isUpdating} style={{ flex: 1, padding: '4px 0' }}>
                Reject
              </CustomButton>
            </>
          )}
        </div>

        {isRejected && doc.rejectionReason && (
          <div
            style={{
              marginTop: 12,
              padding: 8,
              background: '#fef2f2',
              borderRadius: 8,
              fontSize: 11,
              color: ERROR_COLOR,
            }}
          >
            <strong>Rejection:</strong> {doc.rejectionReason}
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        title={`Preview: ${docLabel}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <CustomButton key="close" type="outline" onClick={() => setPreviewVisible(false)}>Close</CustomButton>,
          <CustomButton key="download" type="primary" icon={<DownloadOutlined />} onClick={() => window.open(doc.fileUrl, '_blank')}>
            Download
          </CustomButton>
        ]}
        width={900}
        centered
      >
        <div style={{ minHeight: 500, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
          {isPdf(doc.fileUrl) ? (
            <iframe src={doc.fileUrl} style={{ width: '100%', height: 550, border: 'none' }} title="PDF Preview" />
          ) : (
            <img src={doc.fileUrl} alt="preview" style={{ maxHeight: 550, maxWidth: '100%', objectFit: 'contain' }} />
          )}
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Document"
        open={showRejectModal}
        onCancel={() => { setShowRejectModal(false); setRejectReason(''); }}
        footer={[
          <CustomButton key="cancel" type="outline" onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>
            Cancel
          </CustomButton>,
          <CustomButton key="reject" type="danger" onClick={handleReject} loading={submitting}>
            Confirm Reject
          </CustomButton>
        ]}
      >
        <Alert
          message="Provide Rejection Reason"
          description="Please explain why this document is being rejected so the submitter can fix it."
          type="warning"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
        <div style={{ marginBottom: 16 }}>
          <Text strong>Document: </Text>
          <Text>{docLabel}</Text>
        </div>
        <TextArea
          rows={4}
          placeholder="e.g., Document is blurry, missing signature, incorrect format, etc."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </Modal>
    </>
  );
};

// Info Card Component
const InfoCard = ({ title, icon, children, color = PRIMARY }) => (
  <Card 
    style={{ borderRadius: 16, height: '100%', overflow: 'hidden' }} 
    headStyle={{ borderBottom: `2px solid ${color}`, padding: '12px 16px', background: '#fafafa' }}
    bodyStyle={{ padding: 16 }}
    title={
      <span style={{ color: color, fontWeight: 600, fontSize: 14 }}>
        {icon} {title}
      </span>
    }
  >
    {children}
  </Card>
);

const OpsAssignedReview = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "ops";
  const screens = useBreakpoint();

  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [bankProduct, setBankProduct] = useState(null);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [valuationDate, setValuationDate] = useState('');
  const [folAmount, setFolAmount] = useState('');
  
  // Loading states for specific actions
  const [underReviewLoading, setUnderReviewLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await apiService.get(`/vault/cases/${caseId}`);
      if (res?.success) {
        setCaseData(res.data.case);
        setDocuments(res.data.documents || []);
        
        // Set approved amount from existing data if available
        if (res.data.case?.loanInfo?.approvedAmount) {
          setApprovedAmount(res.data.case.loanInfo.approvedAmount.toString());
        }
        
        const bankProductId = res.data.case?.loanInfo?.selectedBankProduct;
        if (bankProductId) {
          try {
            const bankRes = await apiService.get(`/bank/products/get-bank-product/${bankProductId}`);
            if (bankRes?.success) {
              setBankProduct(bankRes.data);
            }
          } catch (err) {
            console.error("Error fetching bank product:", err);
          }
        }
      } else {
        message.error("Failed to load case details");
      }
    } catch (err) {
      console.error("Error fetching case:", err);
      message.error(err.response?.data?.message || "Failed to load case details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (caseId) fetchData();
  }, [caseId]);

  // Verify document
  const handleVerifyDocument = async (documentId, documentType) => {
    setUpdating(true);
    try {
      const response = await apiService.post(`/vault/lead/documents/${documentId}/verify`, {
        verificationStatus: 'verified',
        verifiedAt: new Date()
      });
      if (response?.success) {
        message.success(`${DOCUMENT_LABELS[documentType] || documentType} verified successfully`);
        fetchData();
      } else {
        message.error(response?.message || "Failed to verify document");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to verify document");
    } finally {
      setUpdating(false);
    }
  };

  // Reject document
  const handleRejectDocument = async (documentId, documentType, reason) => {
    setUpdating(true);
    try {
      const response = await apiService.post(`/vault/lead/documents/${documentId}/reject`, {
        verificationStatus: 'rejected',
        rejectionReason: reason,
        verifiedAt: new Date()
      });
      if (response?.success) {
        message.warning(`${DOCUMENT_LABELS[documentType] || documentType} rejected`);
        fetchData();
      } else {
        message.error(response?.message || "Failed to reject document");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to reject document");
    } finally {
      setUpdating(false);
    }
  };

  // Update case status with loading animation - FIXED to handle all amounts correctly
  const handleUpdateStatus = async (status, shouldCloseModal = true) => {
    if (!status) return;
    
    // Validate required fields
    const statusConfig = getStatusConfig(status);
    if (statusConfig.requiresAmount && !approvedAmount && status !== 'Disbursed') {
      message.error(`Please enter ${statusConfig.amountLabel}`);
      return;
    }
    if (status === 'Disbursed' && !approvedAmount) {
      message.error('Please enter the disbursed amount');
      return;
    }
    if (statusConfig.requiresReason && !statusNotes) {
      message.error('Please provide a reason for this status');
      return;
    }
    
    // Set specific loading state for Under Review
    if (status === 'Under Review') {
      setUnderReviewLoading(true);
    }
    
    setUpdating(true);
    try {
      const payload = {
        status: status,
        notes: statusNotes
      };
      
      // Handle Bank Application - Bank Reference Number
      if (status === 'Bank Application' && bankReference) {
        payload.bankReference = bankReference;
      }
      
      // Handle Pre-Approved - Pre-Approved Amount
      if (status === 'Pre-Approved' && approvedAmount) {
        payload.approvedAmount = parseFloat(approvedAmount);
      }
      
      // Handle FOL Issued - FOL Amount
      if (status === 'FOL Issued' && folAmount) {
        payload.approvedAmount = parseFloat(folAmount);
      }
      
      // Handle Disbursed - Disbursed Amount
      if (status === 'Disbursed' && approvedAmount) {
        payload.disbursedAmount = parseFloat(approvedAmount);
      }

      // Use the update status endpoint
      const response = await apiService.put(`/vault/cases/${caseId}/status`, payload);
      
      if (response?.success) {
        // Display appropriate success messages with amounts
        let successMessage = '';
        if (status === 'Pre-Approved') {
          successMessage = approvedAmount 
            ? `✅ Case Pre-Approved! Amount: AED ${parseFloat(approvedAmount).toLocaleString()}`
            : '✅ Case Pre-Approved!';
        } else if (status === 'FOL Issued') {
          successMessage = folAmount 
            ? `📨 FOL Issued! Amount: AED ${parseFloat(folAmount).toLocaleString()}`
            : '📨 FOL Issued!';
        } else if (status === 'Disbursed') {
          successMessage = approvedAmount 
            ? `💰 Case Disbursed! Amount: AED ${parseFloat(approvedAmount).toLocaleString()}`
            : '💰 Case Disbursed!';
        } else if (status === 'Valuation') {
          successMessage = '🏠 Valuation requested from bank.';
        } else if (status === 'FOL Processed') {
          successMessage = '📄 FOL being processed by bank';
        } else if (status === 'FOL Signed') {
          successMessage = '✍️ FOL Signed by client';
        } else if (status === 'Collecting Documentation') {
          successMessage = '📋 Additional documents requested from client';
        } else if (status === 'Rejected') {
          successMessage = `❌ Case rejected by bank. Reason: ${statusNotes || 'N/A'}`;
        } else if (status === 'Lost') {
          successMessage = `📉 Case lost. Reason: ${statusNotes || 'N/A'}`;
        } else if (status === 'Under Review') {
          successMessage = '🔍 Case under review by Ops team';
        } else if (status === 'Bank Application') {
          successMessage = bankReference 
            ? `🏦 Submitted to bank. Reference: ${bankReference}`
            : '🏦 Case submitted to bank successfully';
        } else if (status === 'Returned - Pending Correction') {
          successMessage = '⚠️ Case returned for correction. Submitter notified.';
        } else if (status === 'Resubmitted-After Correction') {
          successMessage = '🔄 Case resubmitted after correction. Waiting for Ops review.';
        } else {
          successMessage = `Case status updated to ${status}`;
        }
        
        message.success(successMessage);
        
        if (shouldCloseModal) {
          setStatusModalVisible(false);
        }
        
        // Reset all form fields
        setSelectedStatus('');
        setStatusNotes('');
        setApprovedAmount('');
        setBankReference('');
        setFolAmount('');
        
        // Refresh data
        fetchData();
        
        // Show additional celebration for Disbursed
        if (status === 'Disbursed') {
          setTimeout(() => {
            message.success({
              content: '🎉 Congratulations! Case disbursed successfully! Commission will be processed. 🎉',
              duration: 5,
            });
          }, 500);
        }
        
        // Clear Under Review loading after 2 seconds
        if (status === 'Under Review') {
          setTimeout(() => {
            setUnderReviewLoading(false);
          }, 2000);
        }
      } else {
        message.error(response?.message || "Failed to update status");
        setUnderReviewLoading(false);
      }
    } catch (err) {
      console.error("Status update error:", err);
      message.error(err.response?.data?.message || "Failed to update status");
      setUnderReviewLoading(false);
    } finally {
      setUpdating(false);
    }
  };

  // Return case for correction
  const handleReturnCase = async () => {
    if (!returnNotes.trim()) {
      message.error('Please provide correction notes');
      return;
    }
    setUpdating(true);
    try {
      const response = await apiService.post(`/vault/cases/ops/return/${caseId}`, {
        correctionNotes: returnNotes
      });
      if (response?.success) {
        message.warning("Case returned for correction - Submitter notified");
        setReturnModalVisible(false);
        setReturnNotes('');
        fetchData();
      } else {
        message.error(response?.message || "Failed to return case");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to return case");
    } finally {
      setUpdating(false);
    }
  };

  // Submit to bank - FIXED API endpoint
  const handleSubmitToBank = async () => {
    setUpdating(true);
    try {
      const response = await apiService.post(`/vault/cases/ops/submit-to-bank/${caseId}`, {
        bankName: caseData?.loanInfo?.selectedBank,
        bankReference: bankReference,
        notes: statusNotes
      });
      if (response?.success) {
        message.success("Case submitted to bank successfully");
        setStatusModalVisible(false);
        setBankReference('');
        setStatusNotes('');
        fetchData();
      } else {
        message.error(response?.message || "Failed to submit to bank");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to submit to bank");
    } finally {
      setUpdating(false);
    }
  };

  // Calculate stats
  const totalDocs = documents.length;
  const verifiedCount = documents.filter(d => d.verificationStatus === 'verified').length;
  const rejectedCount = documents.filter(d => d.verificationStatus === 'rejected').length;
  const pendingCount = documents.filter(d => d.verificationStatus === 'pending').length;
  const allVerified = totalDocs > 0 && verifiedCount === totalDocs && rejectedCount === 0;
  const verificationProgress = totalDocs > 0 ? (verifiedCount / totalDocs) * 100 : 0;
  
  // Get current status index for timeline
  const currentStatusIndex = getStatusIndex(caseData?.currentStatus);
  const currentStatusConfig = getStatusConfig(caseData?.currentStatus);
  const suggestedNextStatuses = getSuggestedNextStatuses(caseData?.currentStatus);
  
  const canSubmitToBank = allVerified && caseData?.currentStatus === 'Under Review';

  // Calculations data for table
  const calculationsData = [
    { key: '1', label: 'Property Value', value: `AED ${caseData?.propertyInfo?.propertyValue?.toLocaleString() || 0}`, icon: <HomeOutlined /> },
    { key: '2', label: 'Down Payment', value: `AED ${caseData?.propertyInfo?.downPayment?.toLocaleString() || 0}`, icon: <DollarOutlined /> },
    { key: '3', label: 'Requested Loan Amount', value: `AED ${caseData?.loanInfo?.requestedAmount?.toLocaleString() || 0}`, icon: <BankOutlined /> },
    { key: '4', label: 'Approved Amount', value: `AED ${caseData?.loanInfo?.approvedAmount?.toLocaleString() || 'Pending'}`, icon: <CheckCircleOutlined /> },
    { key: '5', label: 'LTV Ratio', value: `${caseData?.propertyInfo?.ltvPercentage || 0}%`, icon: <PercentageOutlined /> },
    { key: '6', label: 'Interest Rate', value: `${caseData?.loanInfo?.interestRatePercentage || 0}%`, icon: <RiseOutlined /> },
    { key: '7', label: 'Tenure', value: `${caseData?.loanInfo?.tenureYears || 0} years`, icon: <CalendarOutlined /> },
    { key: '8', label: 'Monthly EMI', value: `AED ${caseData?.loanInfo?.monthlyInstallment?.principalAndInterest?.toLocaleString() || 0}`, icon: <CalculatorOutlined /> },
    { key: '9', label: 'Monthly Income', value: `AED ${caseData?.incomeDetails?.totalMonthlyIncome?.toLocaleString() || 0}`, icon: <WalletOutlined /> },
    { key: '10', label: 'Monthly Liabilities', value: `AED ${caseData?.expenseDetails?.totalMonthlyLiabilities?.toLocaleString() || 0}`, icon: <FallOutlined /> },
    { key: '11', label: 'DBR', value: `${caseData?.expenseDetails?.dbrPercentage || 0}% (${caseData?.expenseDetails?.dbrStatus || 'N/A'})`, icon: <PercentageOutlined /> },
    { key: '12', label: 'Processing Fee', value: `AED ${caseData?.loanInfo?.processingFee?.toLocaleString() || 0}`, icon: <FileTextOutlined /> },
  ];

  const calculationsColumns = [
    { 
      title: 'Parameter', 
      dataIndex: 'label', 
      key: 'label',
      render: (text, record) => (
        <span><span style={{ marginRight: 8 }}>{record.icon}</span> {text}</span>
      )
    },
    { 
      title: 'Value', 
      dataIndex: 'value', 
      key: 'value',
      render: (text) => <Text strong style={{ color: text.includes('Ineligible') ? ERROR_COLOR : text.includes('Borderline') ? WARNING_COLOR : PRIMARY }}>{text}</Text>
    }
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Empty description="Case not found" />
        <CustomButton type="primary" onClick={() => navigate('/dashboard/ops/cases/assigned')} style={{ marginTop: 16 }}>
          Back to Cases
        </CustomButton>
      </div>
    );
  }

  const ci = caseData.clientInfo || {};
  const pi = caseData.propertyInfo || {};
  const li = caseData.loanInfo || {};
  const ei = caseData.employmentDetails || {};
  const ii = caseData.incomeDetails || {};
  const exp = caseData.expenseDetails || {};

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header with Gradient */}
        <div
          style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_HOVER} 100%)`,
            borderRadius: 20,
            padding: '24px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            boxShadow: `0 4px 20px ${PRIMARY}30`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <Title level={3} style={{ margin: 0, color: '#fff' }}>{caseData.caseReference}</Title>
              <Space size="middle" style={{ marginTop: 6 }} wrap>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}><UserOutlined /> {ci.fullName || 'N/A'}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}><MailOutlined /> {ci.email || 'N/A'}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13 }}><PhoneOutlined /> {ci.mobile || 'N/A'}</Text>
              </Space>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Badge 
              color={caseData.currentStatus === 'Disbursed' ? SUCCESS_COLOR : '#fff'} 
              text={<span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{caseData.currentStatus}</span>}
            />
            <CustomButton 
              type="outline" 
              icon={<ReloadOutlined />} 
              onClick={fetchData} 
              loading={refreshing}
              style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff', padding: '0 12px' }}
            >
              Refresh
            </CustomButton>
          </div>
        </div>

        {/* Status Progress Timeline - Enhanced with status description */}
        <Card style={{ borderRadius: 16, marginBottom: 24 }} bodyStyle={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Text strong style={{ fontSize: 16, color: PRIMARY }}>Case Progress Timeline</Text>
              <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>Status: {currentStatusConfig?.description}</Text>
            </div>
            {suggestedNextStatuses.length > 0 && (
              <Alert
                message={`Next: ${suggestedNextStatuses.join(' → ')}`}
                type="info"
                showIcon
                icon={<RightOutlined />}
                style={{ borderRadius: 20, fontSize: 12 }}
              />
            )}
          </div>
          <Steps
            current={currentStatusIndex}
            items={STATUS_FLOW.slice(0, 9).map(step => ({
              title: step.title,
              icon: step.icon,
              status: currentStatusIndex > STATUS_FLOW.slice(0, 9).findIndex(s => s.key === step.key) ? 'finish' : 
                      currentStatusIndex === STATUS_FLOW.slice(0, 9).findIndex(s => s.key === step.key) ? 'process' : 'wait'
            }))}
            responsive={false}
          />
        </Card>

        {/* Amount Summary Card - Shows approved/disbursed amounts */}
        {(caseData?.loanInfo?.approvedAmount || caseData?.loanInfo?.disbursedAmount) && (
          <Card style={{ borderRadius: 16, marginBottom: 24, background: '#f0fdf4', border: `1px solid ${SUCCESS_COLOR}` }}>
            <Row gutter={[16, 16]} justify="center">
              {caseData?.loanInfo?.requestedAmount && (
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Requested Amount</Text>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#6B7280' }}>AED {caseData.loanInfo.requestedAmount.toLocaleString()}</div>
                </Col>
              )}
              {caseData?.loanInfo?.approvedAmount && (
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Approved Amount</Text>
                  <div style={{ fontSize: 20, fontWeight: 700, color: SUCCESS_COLOR }}>AED {caseData.loanInfo.approvedAmount.toLocaleString()}</div>
                  {caseData.loanInfo.approvedAmount < caseData.loanInfo.requestedAmount && (
                    <Tag color="warning" style={{ marginTop: 4 }}>Lower than requested</Tag>
                  )}
                </Col>
              )}
              {caseData?.loanInfo?.disbursedAmount && (
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Disbursed Amount</Text>
                  <div style={{ fontSize: 20, fontWeight: 700, color: SUCCESS_COLOR }}>AED {caseData.loanInfo.disbursedAmount.toLocaleString()}</div>
                  <Tag color="success" style={{ marginTop: 4 }}>Completed</Tag>
                </Col>
              )}
            </Row>
          </Card>
        )}

        {/* Stats Cards Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={20}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Card style={{ borderRadius: 16, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <FileTextOutlined style={{ fontSize: 20, color: PRIMARY }} />
                  </div>
                  <Statistic title="Total Documents" value={totalDocs} valueStyle={{ fontSize: 24 }} />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ borderRadius: 16, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <CheckCircleOutlined style={{ fontSize: 20, color: SUCCESS_COLOR }} />
                  </div>
                  <Statistic title="Verified" value={verifiedCount} valueStyle={{ color: SUCCESS_COLOR, fontSize: 24 }} />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ borderRadius: 16, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <ClockCircleOutlined style={{ fontSize: 20, color: WARNING_COLOR }} />
                  </div>
                  <Statistic title="Pending" value={pendingCount} valueStyle={{ color: WARNING_COLOR, fontSize: 24 }} />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card style={{ borderRadius: 16, textAlign: 'center' }} bodyStyle={{ padding: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <CloseCircleOutlined style={{ fontSize: 20, color: ERROR_COLOR }} />
                  </div>
                  <Statistic title="Rejected" value={rejectedCount} valueStyle={{ color: ERROR_COLOR, fontSize: 24 }} />
                </Card>
              </Col>
            </Row>
          </Col>
          <Col xs={24} md={4}>
            <Card 
              style={{ borderRadius: 16, height: '100%', background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_HOVER} 100%)` }}
              bodyStyle={{ padding: 16, textAlign: 'center' }}
            >
              <div style={{ marginBottom: 8 }}>
                <TrophyOutlined style={{ fontSize: 28, color: '#fff' }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                {currentStatusIndex + 1}/9
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Steps Completed</div>
              <Progress percent={Math.round(((currentStatusIndex + 1) / 9) * 100)} showInfo={false} strokeColor="#fff" trailColor="rgba(255,255,255,0.3)" style={{ marginTop: 12 }} />
            </Card>
          </Col>
        </Row>

        {/* Verification Progress & Bank Details Button */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong>Document Verification Progress</Text>
                    <Text strong style={{ color: verificationProgress === 100 ? SUCCESS_COLOR : PRIMARY }}>
                      {verifiedCount}/{totalDocs} Verified ({Math.round(verificationProgress)}%)
                    </Text>
                  </div>
                  <Progress percent={verificationProgress} strokeColor={verificationProgress === 100 ? SUCCESS_COLOR : PRIMARY} trailColor="#e5e7eb" size="middle" strokeWidth={10} />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card style={{ borderRadius: 16, border: `1px solid ${PRIMARY_BORDER}`, cursor: 'pointer' }} onClick={() => setBankModalVisible(true)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BankOutlined style={{ fontSize: 24, color: PRIMARY }} />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 14 }}>Bank Product Details</Text>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>{li.selectedBank || 'N/A'}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{li.interestRatePercentage || 0}%</Text>
                    </div>
                  </div>
                </div>
                <InfoCircleOutlined style={{ fontSize: 20, color: PRIMARY }} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Calculations Table */}
        <Card 
          title={<span><CalculatorOutlined style={{ marginRight: 8, color: PRIMARY }} /> Loan Calculations & Financial Summary</span>} 
          style={{ borderRadius: 16, marginBottom: 24 }}
          headStyle={{ borderBottom: `1px solid ${PRIMARY_BORDER}` }}
        >
          <Table 
            columns={calculationsColumns} 
            dataSource={calculationsData} 
            pagination={false} 
            size="middle"
            bordered
            rowKey="key"
            style={{ borderRadius: 12, overflow: 'hidden' }}
          />
        </Card>

        {/* Rectangle Tabs */}
        <div style={{ marginBottom: 24, borderBottom: `1px solid ${PRIMARY_BORDER}` }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { key: 'documents', label: 'Document Review', icon: <FileProtectOutlined />, count: pendingCount },
              { key: 'info', label: 'Client Information', icon: <UserOutlined /> },
              { key: 'actions', label: 'Actions & Status', icon: <ThunderboltOutlined /> }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '10px 24px',
                  background: activeTab === tab.key ? PRIMARY : 'transparent',
                  color: activeTab === tab.key ? '#fff' : PRIMARY,
                  border: 'none',
                  borderRadius: '12px 12px 0 0',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginRight: 4,
                }}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge count={tab.count} style={{ background: activeTab === tab.key ? '#fff' : PRIMARY, color: activeTab === tab.key ? PRIMARY : '#fff', marginLeft: 4 }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: 16 }}>
          {/* Document Review Tab */}
          {activeTab === 'documents' && (
            <div>
              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16 }}>
                  <FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} />
                  <br />
                  <Text type="secondary" style={{ marginTop: 16, display: 'block' }}>No documents uploaded yet</Text>
                </div>
              ) : (
                <div>
                  {['identity', 'financial', 'property', 'bank_form', 'other'].map(category => {
                    const categoryDocs = documents.filter(d => d.documentCategory === category);
                    if (categoryDocs.length === 0) return null;
                    
                    const categoryLabels = {
                      identity: { label: 'Identity Documents', icon: <UserOutlined />, color: INFO_COLOR },
                      financial: { label: 'Financial Documents', icon: <WalletOutlined />, color: SUCCESS_COLOR },
                      property: { label: 'Property Documents', icon: <HomeOutlined />, color: WARNING_COLOR },
                      bank_form: { label: 'Bank Forms', icon: <BankOutlined />, color: PRIMARY },
                      other: { label: 'Other Documents', icon: <FileTextOutlined />, color: '#6B7280' }
                    };
                    const catInfo = categoryLabels[category];
                    
                    return (
                      <div key={category} style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 8, borderBottom: `2px solid ${catInfo.color}` }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${catInfo.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: catInfo.color }}>
                            {catInfo.icon}
                          </div>
                          <div>
                            <Text strong style={{ fontSize: 15 }}>{catInfo.label}</Text>
                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                              ({categoryDocs.filter(d => d.verificationStatus === 'verified').length}/{categoryDocs.length})
                            </Text>
                          </div>
                        </div>
                        <Row gutter={[16, 16]}>
                          {categoryDocs.map(doc => (
                            <Col key={doc._id} xs={24} sm={12} md={8} lg={6}>
                              <DocumentReviewCard doc={doc} onVerify={handleVerifyDocument} onReject={handleRejectDocument} isUpdating={updating} />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Client Information Tab */}
          {activeTab === 'info' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <InfoCard title="Personal Details" icon={<UserOutlined />}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Full Name"><Text strong>{ci.fullName || 'N/A'}</Text></Descriptions.Item>
                    <Descriptions.Item label="Gender">{ci.gender || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="DOB">{ci.dateOfBirth ? dayjs(ci.dateOfBirth).format('DD MMM YYYY') : 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Nationality">{ci.nationality || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Marital Status">{ci.maritalStatus || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Dependents">{ci.numberOfDependents || 0}</Descriptions.Item>
                  </Descriptions>
                </InfoCard>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <InfoCard title="Contact" icon={<PhoneOutlined />}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Email"><MailOutlined /> {ci.email || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Mobile"><PhoneOutlined /> {ci.mobile || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Home Phone">{ci.homePhone || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Work Phone">{ci.workPhone || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="WhatsApp">{ci.whatsapp || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </InfoCard>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <InfoCard title="Employment" icon={<IdcardOutlined />}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Employer">{ei.employerName || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Designation">{ei.designation || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Type">{ei.employmentType || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Experience">{ei.yearsWithEmployer || 0} years</Descriptions.Item>
                    <Descriptions.Item label="Probation">{ei.probationPeriod || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </InfoCard>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <InfoCard title="Income" icon={<DollarOutlined />}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Basic Salary">AED {ii.basicSalary?.toLocaleString() || 0}</Descriptions.Item>
                    <Descriptions.Item label="Total Monthly">AED {ii.totalMonthlyIncome?.toLocaleString() || 0}</Descriptions.Item>
                    <Descriptions.Item label="Annual Bonus">AED {ii.annualBonus?.toLocaleString() || 0}</Descriptions.Item>
                    <Descriptions.Item label="DBR"><Tag color={exp.dbrPercentage <= 50 ? 'success' : 'warning'}>{exp.dbrPercentage || 0}%</Tag></Descriptions.Item>
                  </Descriptions>
                </InfoCard>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <InfoCard title="Property" icon={<HomeOutlined />}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Type">{pi.propertyType || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Value">AED {pi.propertyValue?.toLocaleString() || 0}</Descriptions.Item>
                    <Descriptions.Item label="Loan Amount">AED {pi.loanAmount?.toLocaleString() || 0}</Descriptions.Item>
                    <Descriptions.Item label="LTV">{pi.ltvPercentage || 0}%</Descriptions.Item>
                    <Descriptions.Item label="Area">{pi.propertyAddress?.area || 'N/A'}</Descriptions.Item>
                  </Descriptions>
                </InfoCard>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <InfoCard title="Loan" icon={<BankOutlined />}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Bank">{li.selectedBank || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Rate">{li.interestRatePercentage || 0}%</Descriptions.Item>
                    <Descriptions.Item label="Tenure">{li.tenureYears || 0} years</Descriptions.Item>
                    <Descriptions.Item label="EMI">AED {li.monthlyInstallment?.totalMonthlyPayment?.toLocaleString() || 0}</Descriptions.Item>
                    {caseData?.loanInfo?.approvedAmount && (
                      <Descriptions.Item label="Approved Amount">AED {caseData.loanInfo.approvedAmount.toLocaleString()}</Descriptions.Item>
                    )}
                  </Descriptions>
                </InfoCard>
              </Col>
            </Row>
          )}

          {/* Actions Tab - Complete Status Update Section */}
          {activeTab === 'actions' && (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card hoverable style={{ borderRadius: 16, textAlign: 'center', cursor: 'pointer', border: `1px solid ${WARNING_COLOR}` }} bodyStyle={{ padding: 24 }} onClick={() => setReturnModalVisible(true)}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <RollbackOutlined style={{ fontSize: 24, color: WARNING_COLOR }} />
                  </div>
                  <Title level={4} style={{ marginTop: 0 }}>Return for Correction</Title>
                  <Text type="secondary">Send back to submitter with correction notes</Text>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card hoverable={canSubmitToBank} style={{ borderRadius: 16, textAlign: 'center', cursor: canSubmitToBank ? 'pointer' : 'not-allowed', border: `1px solid ${SUCCESS_COLOR}`, opacity: canSubmitToBank ? 1 : 0.6 }} bodyStyle={{ padding: 24 }} onClick={() => {
                  if (canSubmitToBank) {
                    setSelectedStatus('Bank Application');
                    setStatusModalVisible(true);
                  } else {
                    message.warning('Please verify all documents before submitting to bank');
                  }
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <SendOutlined style={{ fontSize: 24, color: SUCCESS_COLOR }} />
                  </div>
                  <Title level={4} style={{ marginTop: 0 }}>Submit to Bank</Title>
                  <Text type="secondary">Submit complete case to bank for processing</Text>
                  {!canSubmitToBank && <Tag color="warning" style={{ marginTop: 12 }}>Requires all documents verified ({verifiedCount}/{totalDocs})</Tag>}
                </Card>
              </Col>
              <Col span={24}>
                <Card title={<span><ThunderboltOutlined style={{ marginRight: 8, color: PRIMARY }} /> Quick Status Updates</span>} style={{ borderRadius: 16 }} headStyle={{ borderBottom: `1px solid ${PRIMARY_BORDER}` }}>
                  <Row gutter={[16, 16]}>
                    {/* Show suggested next statuses first with highlight */}
                    {suggestedNextStatuses.map(statusValue => {
                      const status = AVAILABLE_STATUSES.find(s => s.value === statusValue);
                      if (!status) return null;
                      return (
                        <Col xs={24} sm={12} md={8} lg={6} key={status.value}>
                          <Card 
                            hoverable 
                            style={{ 
                              borderRadius: 16, 
                              textAlign: 'center', 
                              cursor: 'pointer',
                              border: `2px solid ${status.color}`,
                              transition: 'all 0.3s ease',
                              background: '#fff',
                              boxShadow: `0 2px 8px ${status.color}40`
                            }}
                            bodyStyle={{ padding: '24px 16px' }}
                            onClick={() => {
                              setSelectedStatus(status.value);
                              setStatusModalVisible(true);
                            }}
                          >
                            <div style={{ 
                              width: 64, 
                              height: 64, 
                              borderRadius: 32, 
                              background: status.bgColor, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              margin: '0 auto 12px'
                            }}>
                              {status.icon}
                            </div>
                            <Title level={5} style={{ margin: '8px 0 4px', color: status.color }}>{status.label}</Title>
                            <Tag color="purple" style={{ marginTop: 8 }}>Recommended Next Step</Tag>
                          </Card>
                        </Col>
                      );
                    })}
                    
                    {/* Show other available statuses */}
                    {AVAILABLE_STATUSES.filter(s => s.value !== caseData?.currentStatus && !suggestedNextStatuses.includes(s.value)).map(status => (
                      <Col xs={24} sm={12} md={8} lg={6} key={status.value}>
                        <Card 
                          hoverable 
                          style={{ 
                            borderRadius: 16, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            border: `1px solid ${status.color}`,
                            transition: 'all 0.3s ease',
                            background: underReviewLoading && status.value === 'Under Review' ? '#f5f5f5' : '#fff',
                            opacity: underReviewLoading && status.value === 'Under Review' ? 0.7 : 1
                          }}
                          bodyStyle={{ padding: '24px 16px' }}
                          onClick={() => {
                            if (status.value === 'Under Review') {
                              handleUpdateStatus(status.value);
                            } else {
                              setSelectedStatus(status.value);
                              setStatusModalVisible(true);
                            }
                          }}
                        >
                          {underReviewLoading && status.value === 'Under Review' ? (
                            <div style={{ textAlign: 'center' }}>
                              <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: status.color }} spin />} />
                              <div style={{ marginTop: 12, fontWeight: 500, color: status.color }}>Updating Status...</div>
                            </div>
                          ) : (
                            <>
                              <div style={{ 
                                width: 64, 
                                height: 64, 
                                borderRadius: 32, 
                                background: status.bgColor, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                margin: '0 auto 12px'
                              }}>
                                {status.icon}
                              </div>
                              <Title level={5} style={{ margin: '8px 0 4px', color: status.color }}>{status.label}</Title>
                              <Text type="secondary" style={{ fontSize: 11 }}>Click to update status</Text>
                            </>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            </Row>
          )}
        </div>

        {/* Bank Product Modal */}
        <Modal
          title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BankOutlined style={{ color: PRIMARY }} /><span>Bank Product Details</span></div>}
          open={bankModalVisible}
          onCancel={() => setBankModalVisible(false)}
          footer={[<CustomButton key="close" type="primary" onClick={() => setBankModalVisible(false)}>Close</CustomButton>]}
          width={700}
        >
          {bankProduct ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: 16, background: PRIMARY_LIGHT, borderRadius: 12 }}>
                <img src={bankProduct.bankInfo?.logo} alt={bankProduct.bankInfo?.bankName} style={{ width: 50, height: 50, borderRadius: 8 }} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>{bankProduct.bankInfo?.bankName}</Title>
                  <Text type="secondary">{bankProduct.offerSummary?.title}</Text>
                </div>
                <Tag color="purple" style={{ marginLeft: 'auto' }}>{bankProduct.offerSummary?.initialRate}%</Tag>
              </div>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Product Type">{bankProduct.offerSummary?.productType}</Descriptions.Item>
                <Descriptions.Item label="Interest Rate">{bankProduct.offerSummary?.initialRate}%</Descriptions.Item>
                <Descriptions.Item label="Max LTV">{bankProduct.loanDetails?.maxLoanToValue}%</Descriptions.Item>
                <Descriptions.Item label="Min LTV">{bankProduct.loanDetails?.minLoanToValue}%</Descriptions.Item>
                <Descriptions.Item label="Tenure">{bankProduct.loanDetails?.tenureYears} years</Descriptions.Item>
                <Descriptions.Item label="Processing Fee">{bankProduct.costBreakdown?.bankProcessingFee || 0} AED</Descriptions.Item>
                <Descriptions.Item label="Valuation Fee">{bankProduct.costBreakdown?.valuationFee || 0} AED</Descriptions.Item>
                <Descriptions.Item label="Early Settlement">{bankProduct.loanDetails?.earlySettlementFee}</Descriptions.Item>
              </Descriptions>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}><Spin /><div style={{ marginTop: 16 }}>Loading bank product details...</div></div>
          )}
        </Modal>

        {/* Status Update Modal - Dynamic based on selected status */}
        <Modal
          title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SendOutlined style={{ color: SUCCESS_COLOR }} /><span>Update Case Status</span></div>}
          open={statusModalVisible}
          onCancel={() => { setStatusModalVisible(false); setSelectedStatus(''); setStatusNotes(''); setApprovedAmount(''); setBankReference(''); setFolAmount(''); }}
          footer={[
            <CustomButton key="cancel" type="outline" onClick={() => { setStatusModalVisible(false); setSelectedStatus(''); setStatusNotes(''); setApprovedAmount(''); setBankReference(''); setFolAmount(''); }}>Cancel</CustomButton>,
            <CustomButton key="submit" type="success" onClick={selectedStatus === 'Bank Application' ? handleSubmitToBank : () => handleUpdateStatus(selectedStatus)} loading={updating}>Confirm Update</CustomButton>
          ]}
          width={500}
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: PRIMARY_LIGHT, padding: 12, borderRadius: 12, marginBottom: 16 }}>
              <Text strong>Current Status:</Text> <Badge color={PRIMARY} text={caseData?.currentStatus} style={{ marginLeft: 12 }} />
            </div>
            <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 12 }}>
              <Text strong>New Status:</Text> <Tag color="success" style={{ marginLeft: 12, fontSize: 14, borderRadius: 20 }}>{selectedStatus}</Tag>
            </div>
          </div>
          
          {/* Dynamic amount/fields based on selected status */}
          {selectedStatus === 'Bank Application' && (
            <Form.Item label="Bank Reference Number">
              <Input placeholder="Enter bank reference number" value={bankReference} onChange={(e) => setBankReference(e.target.value)} prefix={<BankOutlined />} style={{ borderRadius: 8 }} />
            </Form.Item>
          )}
          
          {selectedStatus === 'Pre-Approved' && (
            <>
              <Alert
                message="Bank Pre-Approval"
                description="Enter the amount bank has pre-approved. This may be lower than requested."
                type="info"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
              <Form.Item label="Pre-Approved Amount" required>
                <Input 
                  placeholder="Enter pre-approved amount" 
                  value={approvedAmount} 
                  onChange={(e) => setApprovedAmount(e.target.value)} 
                  prefix="AED" 
                  type="number" 
                  style={{ borderRadius: 8 }}
                />
                {caseData?.loanInfo?.requestedAmount && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Requested: AED {caseData.loanInfo.requestedAmount.toLocaleString()}
                  </Text>
                )}
              </Form.Item>
            </>
          )}
          
          {selectedStatus === 'FOL Issued' && (
            <>
              <Alert
                message="Final Offer Letter Issued"
                description="Enter the final amount from the bank's offer letter."
                type="info"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
              <Form.Item label="FOL Amount" required>
                <Input 
                  placeholder="Enter FOL amount" 
                  value={folAmount} 
                  onChange={(e) => setFolAmount(e.target.value)} 
                  prefix="AED" 
                  type="number" 
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </>
          )}
          
          {selectedStatus === 'Disbursed' && (
            <>
              <Alert
                message="Disbursement Confirmation"
                description="Enter the actual amount disbursed by the bank. This will be used for commission calculation."
                type="success"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
              <Form.Item label="Disbursed Amount" required>
                <Input 
                  placeholder="Enter disbursed loan amount" 
                  value={approvedAmount} 
                  onChange={(e) => setApprovedAmount(e.target.value)} 
                  prefix="AED" 
                  type="number" 
                  style={{ borderRadius: 8 }}
                />
                {caseData?.loanInfo?.approvedAmount && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Pre-Approved: AED {caseData.loanInfo.approvedAmount.toLocaleString()}
                  </Text>
                )}
              </Form.Item>
            </>
          )}
          
          {selectedStatus === 'Rejected' && (
            <Form.Item label="Rejection Reason" required>
              <TextArea 
                rows={3} 
                placeholder="Please provide the reason for rejection from bank..." 
                value={statusNotes} 
                onChange={(e) => setStatusNotes(e.target.value)} 
                style={{ borderRadius: 8 }} 
              />
            </Form.Item>
          )}
          
          {selectedStatus === 'Lost' && (
            <Form.Item label="Reason for Loss" required>
              <TextArea 
                rows={3} 
                placeholder="Why was this case lost? (e.g., customer found better rate, withdrew application, etc.)" 
                value={statusNotes} 
                onChange={(e) => setStatusNotes(e.target.value)} 
                style={{ borderRadius: 8 }} 
              />
            </Form.Item>
          )}
          
          {selectedStatus === 'Returned - Pending Correction' && (
            <Form.Item label="Correction Notes" required>
              <TextArea 
                rows={4} 
                placeholder="Please provide detailed instructions on what needs to be corrected..." 
                value={statusNotes} 
                onChange={(e) => setStatusNotes(e.target.value)} 
                style={{ borderRadius: 8 }} 
              />
            </Form.Item>
          )}
          
          {/* General Notes for other statuses */}
          {!['Bank Application', 'Pre-Approved', 'FOL Issued', 'Disbursed', 'Rejected', 'Lost', 'Returned - Pending Correction'].includes(selectedStatus) && (
            <Form.Item label="Notes">
              <TextArea 
                rows={3} 
                placeholder="Add any notes about this status update..." 
                value={statusNotes} 
                onChange={(e) => setStatusNotes(e.target.value)} 
                style={{ borderRadius: 8 }} 
              />
            </Form.Item>
          )}
        </Modal>

        {/* Return Modal */}
        <Modal
          title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><RollbackOutlined style={{ color: WARNING_COLOR }} /><span>Return Case for Correction</span></div>}
          open={returnModalVisible}
          onCancel={() => { setReturnModalVisible(false); setReturnNotes(''); }}
          footer={[
            <CustomButton key="cancel" type="outline" onClick={() => { setReturnModalVisible(false); setReturnNotes(''); }}>Cancel</CustomButton>,
            <CustomButton key="submit" type="warning" onClick={handleReturnCase} loading={updating} icon={<RollbackOutlined />}>Return Case</CustomButton>
          ]}
          width={550}
        >
          <Alert message="Returning this case will send it back to the submitter" description="The submitter will need to make corrections and resubmit the case for review." type="warning" showIcon style={{ marginBottom: 16, borderRadius: 8 }} />
          <div style={{ marginBottom: 16 }}><Text strong>Case: </Text><Text code>{caseData.caseReference}</Text></div>
          <Form.Item label="Correction Notes" required>
            <TextArea rows={4} placeholder="Please provide detailed instructions on what needs to be corrected..." value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Modal>
      </div>
    </div>
  );
};

export default OpsAssignedReview;