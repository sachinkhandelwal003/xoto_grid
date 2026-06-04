import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import { message, Spin, Progress, Modal, Tabs, Tag, Descriptions, Row, Col, Card, Statistic, Steps, Button, Space, Alert, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  BankOutlined,
  HomeOutlined,
  DollarCircleOutlined,
  IdcardOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DownloadOutlined,FileOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/* ─── Constants ────────────────────────────────────────── */
const PRIMARY = '#5c039c';
const PRIMARY_LIGHT = '#f3e8ff';

// Role slug mapping for navigation
const roleSlugMap = {
  0: "superadmin", 1: "admin", 2: "customer",
  15: "agency", 16: "agent", 17: "developer", 18: "vault-admin"
};

// Document label mapping for display (for API document types)
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
};

// Document category mapping
const getDocumentCategory = (docType) => {
  const identityDocs = ['emirates_id_front', 'emirates_id_back', 'passport', 'visa'];
  const financialDocs = ['bank_statements', 'salary_certificate', 'payslips'];
  const propertyDocs = ['title_deed'];
  const bankForms = ['bank_application_form', 'consent_form'];
  
  if (identityDocs.includes(docType)) return 'identity';
  if (financialDocs.includes(docType)) return 'financial';
  if (propertyDocs.includes(docType)) return 'property';
  if (bankForms.includes(docType)) return 'bank_form';
  return 'other';
};

const getCategoryLabel = (category) => {
  const labels = {
    identity: { label: 'Identity Documents', icon: <UserOutlined />, order: 1 },
    financial: { label: 'Financial Documents', icon: <BankOutlined />, order: 2 },
    property: { label: 'Property Documents', icon: <HomeOutlined />, order: 3 },
    bank_form: { label: 'Bank Forms', icon: <FileTextOutlined />, order: 4 },
    other: { label: 'Other Documents', icon: <FileOutlined />, order: 5 }
  };
  return labels[category] || labels.other;
};

// Accepted file types based on document type
const getAcceptedFileTypes = (docType) => {
  const pdfOnly = ['bank_statements', 'payslips', 'bank_application_form', 'consent_form'];
  if (pdfOnly.includes(docType)) return '.pdf';
  return '.pdf,.jpg,.jpeg,.png';
};

/* ─── Helpers ──────────────────────────────────────────── */
const isPdf = (name = '') => name?.toLowerCase().endsWith('.pdf');
const fmtSize = (mb) => (mb >= 1 ? `${mb.toFixed(1)} MB` : `${(mb * 1024).toFixed(0)} KB`);

/* ─── View Button Component ────────────────────────────── */
const ViewButton = ({ doc }) => {
  const [open, setOpen] = useState(false);
  const fileUrl = doc.fileUrl || doc.url || doc.documentUrl || doc.file_url;
  if (!fileUrl) return null;
  
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '10px 14px',
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          color: '#374151',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <EyeOutlined /> View
      </button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1000}
        centered
        destroyOnClose
        title="Document Preview"
      >
        <div style={{ minHeight: 600, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isPdf(fileUrl) ? (
            <iframe src={fileUrl} style={{ width: '100%', height: 600, border: 'none' }} title="PDF Preview" />
          ) : (
            <img src={fileUrl} alt="preview" style={{ maxHeight: 600, maxWidth: '100%', objectFit: 'contain' }} />
          )}
        </div>
      </Modal>
    </>
  );
};

/* ─── Document Upload Card Component ──────────────────── */
const DocUploadCard = ({ docRequirement, caseId, uploadedDocs, onUploadSuccess }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const documentType = docRequirement.documentType;
  const docLabel = DOCUMENT_LABELS[documentType] || documentType.replace(/_/g, ' ').toUpperCase();
  
  // Find if this document is already uploaded
  const existing = uploadedDocs.find(d => (d.documentType || d.document_type) === documentType);
  
  // Get status from API (based on isUploaded and isVerified from requiredDocuments)
  const isUploaded = docRequirement.isUploaded || !!existing;
  const isVerified = docRequirement.isVerified || existing?.verificationStatus === 'verified';
  const isRejected = existing?.verificationStatus === 'rejected';
  
  const status = isVerified ? 'verified' : isRejected ? 'rejected' : (isUploaded ? 'pending' : null);

  const statusConfig = {
    verified: { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircleOutlined />, text: 'Verified' },
    rejected: { color: '#ef4444', bg: '#fef2f2', icon: <CloseCircleOutlined />, text: 'Rejected' },
    pending: { color: '#f59e0b', bg: '#fffbeb', icon: <ClockCircleOutlined />, text: 'Pending Verification' },
  };

  const sc = statusConfig[status];
  const showUpload = !isVerified;

  const handleFile = async (file) => {
    if (!file) return;
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 10) {
      message.error('File size must be under 10 MB');
      return;
    }

    try {
      setUploading(true);

      const category = getDocumentCategory(documentType);

      // Upload file to server
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('entityType', 'Case');
      uploadForm.append('entityId', caseId);

      const uploadRes = await apiService.post('/upload', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const fileUrl = uploadRes?.url || uploadRes?.file?.url;

      if (!fileUrl) throw new Error('File upload failed: no URL in response');

      // Save document metadata
      const payload = {
        entityType: 'Case',
        entityId: caseId,
        documentType: documentType,
        documentCategory: category || '',
        fileUrl,
        fileName: file.name,
        fileSizeMb: parseFloat(sizeMb.toFixed(2)),
        mimeType: file.type,
      };

      await apiService.post(`/vault/lead/documents/cases/${caseId}`, payload);

      message.success(`${docLabel} uploaded successfully!`);
      onUploadSuccess();
    } catch (err) {
      console.error(err);
      message.error(`Failed to upload ${docLabel}. Please try again.`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      style={{
        background: '#fff',
        border: `1.5px solid ${dragOver ? PRIMARY : isVerified ? '#10b981' : isUploaded ? PRIMARY : '#e5e7eb'}`,
        borderRadius: 14,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: dragOver ? `0 0 0 3px ${PRIMARY}22` : '0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Verified overlay tint */}
      {isVerified && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #ecfdf588 0%, #fff 60%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              flexShrink: 0,
              background: existing ? (isVerified ? '#ecfdf5' : PRIMARY_LIGHT) : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: isVerified ? '#10b981' : existing ? PRIMARY : '#9ca3af',
            }}
          >
            {existing ? (isPdf(existing.fileName) ? <FilePdfOutlined /> : <FileImageOutlined />) : <UploadOutlined />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', lineHeight: 1.3 }}>{docLabel}</div>
            {existing?.fileName && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{existing.fileName}</div>
            )}
          </div>
        </div>

        {sc && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: sc.color,
              background: sc.bg,
              padding: '4px 10px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {sc.icon} {sc.text}
          </span>
        )}
      </div>

      {/* Drop zone hint */}
      {showUpload && (
        <div
          style={{
            border: `1.5px dashed ${dragOver ? PRIMARY : '#d1d5db'}`,
            borderRadius: 10,
            padding: '14px 10px',
            textAlign: 'center',
            background: dragOver ? PRIMARY_LIGHT : '#fafafa',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 12, color: '#6b7280' }}>{dragOver ? '📂 Drop to upload' : 'Drag & drop or click below'}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
            {getAcceptedFileTypes(documentType).replace(/\./g, '').toUpperCase().replace(/,/g, ' • ')} • Max 10 MB
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {showUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={getAcceptedFileTypes(documentType)}
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              style={{
                flex: 1,
                padding: '10px 0',
                background: uploading ? '#e5e7eb' : PRIMARY,
                color: uploading ? '#9ca3af' : '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'opacity 0.2s',
              }}
            >
              {uploading ? (
                <>
                  <Spin size="small" /> Uploading…
                </>
              ) : existing ? (
                <>
                  <ReloadOutlined /> Re-upload
                </>
              ) : (
                <>
                  <UploadOutlined /> Upload File
                </>
              )}
            </button>
          </>
        )}

        {existing && <ViewButton doc={existing} />}
        {existing?.fileUrl && (
          <button
            onClick={() => window.open(existing.fileUrl, '_blank')}
            style={{
              padding: '10px 14px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              color: '#374151',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <DownloadOutlined /> Download
          </button>
        )}
      </div>

      {isRejected && existing?.rejectionReason && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: '#dc2626',
          }}
        >
          <strong>Rejected:</strong> {existing.rejectionReason}
        </div>
      )}
    </div>
  );
};

/* ─── Main Case Detail View Component ─────────────────── */
const DetailedViewCases = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch case details and documents
  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const res = await apiService.get(`/vault/cases/${caseId}`);
      if (res?.success) {
        setCaseData(res.data.case);
        setDocuments(res.data.documents || []);
        // Get required documents from API response
        const required = res.data.case?.documentStatus?.requiredDocuments || [];
        setRequiredDocuments(required);
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

  // Calculate document statistics from requiredDocuments
  const totalRequired = requiredDocuments.length;
  const uploadedCount = requiredDocuments.filter(d => d.isUploaded).length;
  const verifiedCount = requiredDocuments.filter(d => d.isVerified).length;
  const pendingCount = requiredDocuments.filter(d => !d.isUploaded).length;
  const pct = totalRequired > 0 ? Math.round((uploadedCount / totalRequired) * 100) : 0;

  // Group required documents by category
  const groupedDocuments = requiredDocuments.reduce((groups, doc) => {
    const category = getDocumentCategory(doc.documentType);
    if (!groups[category]) groups[category] = [];
    groups[category].push(doc);
    return groups;
  }, {});

  // Status steps for timeline
  const statusSteps = [
    'Draft', 'Submitted to Xoto', 'Bank Application', 'Collecting Documentation',
    'Pre-Approved', 'Valuation', 'FOL Processed', 'FOL Issued', 'FOL Signed', 'Disbursed'
  ];
  const currentStepIndex = statusSteps.indexOf(caseData?.currentStatus);

  const getStatusColor = (status) => {
    const colorMap = {
      'Draft': 'default',
      'Submitted to Xoto': 'processing',
      'Bank Application': 'processing',
      'Collecting Documentation': 'warning',
      'Pre-Approved': 'success',
      'Valuation': 'processing',
      'FOL Processed': 'success',
      'FOL Issued': 'success',
      'FOL Signed': 'success',
      'Disbursed': 'success',
      'Rejected': 'error',
      'Lost': 'default'
    };
    return colorMap[status] || 'default';
  };

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
        <Title level={4}>Case not found</Title>
        <Button onClick={() => navigate(-1)}>Back to Cases</Button>
      </div>
    );
  }

  const ci = caseData.clientInfo || {};

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#374151',
            fontWeight: 500,
            fontSize: 14,
            marginBottom: 28,
          }}
        >
          <ArrowLeftOutlined /> Back to Cases
        </button>

        {/* Header with Gradient */}
        <div
          style={{
            background: `linear-gradient(135deg, ${PRIMARY} 0%, #7c3aed 100%)`,
            borderRadius: 16,
            padding: '28px 32px',
            color: '#fff',
            marginBottom: 28,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, opacity: 0.7, textTransform: 'uppercase', marginBottom: 6 }}>
              Case Details
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>
              {caseData.caseReference}
            </h1>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7, fontFamily: 'monospace' }}>
              {ci.fullName || 'Client Name'} • Created {dayjs(caseData.createdAt).format('DD MMM YYYY')}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Tag color={getStatusColor(caseData.currentStatus)} style={{ fontSize: 14, padding: '4px 16px' }}>
              {caseData.currentStatus}
            </Tag>
          </div>
        </div>

        {/* Document Statistics Banner */}
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: '20px 24px',
            border: '1px solid #e5e7eb',
            marginBottom: 28,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Document Progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: PRIMARY }}>
                {uploadedCount} / {totalRequired} documents
              </span>
            </div>
            <Progress percent={pct} strokeColor={{ '0%': PRIMARY, '100%': '#7c3aed' }} trailColor="#e5e7eb" strokeWidth={10} showInfo={false} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: pct === 100 ? '#10b981' : PRIMARY }}>{pct}%</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>complete</div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { label: 'Uploaded', value: uploadedCount, color: PRIMARY },
              { label: 'Verified', value: verifiedCount, color: '#10b981' },
              { label: 'Pending', value: pendingCount, color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              padding: '10px 18px',
              background: refreshing ? '#f3f4f6' : '#fff',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              color: '#374151',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {refreshing ? <Spin size="small" /> : <ReloadOutlined />} Refresh
          </button>
        </div>

        {/* Tabs Section */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: 16 }}>
          <TabPane tab="Overview" key="overview">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Status Timeline */}
              <Card style={{ borderRadius: 16 }}>
                <Steps current={currentStepIndex} size="small" items={statusSteps.map(step => ({ title: step }))} responsive />
              </Card>

              {/* Client & Property Info */}
              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <Card title={<span><UserOutlined style={{ color: PRIMARY }} /> Client Information</span>} style={{ borderRadius: 16 }}>
                    <Descriptions bordered size="small" column={1}>
                      <Descriptions.Item label="Full Name"><Text strong>{ci.fullName}</Text></Descriptions.Item>
                      <Descriptions.Item label="Email">{ci.email}</Descriptions.Item>
                      <Descriptions.Item label="Mobile">{ci.mobile}</Descriptions.Item>
                      <Descriptions.Item label="Nationality">{ci.nationality}</Descriptions.Item>
                      <Descriptions.Item label="Marital Status">{ci.maritalStatus}</Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">{dayjs(ci.dateOfBirth).format('DD/MM/YYYY')}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title={<span><HomeOutlined style={{ color: PRIMARY }} /> Property Information</span>} style={{ borderRadius: 16 }}>
                    <Descriptions bordered size="small" column={1}>
                      <Descriptions.Item label="Property Type">{caseData.propertyInfo?.propertyType} - {caseData.propertyInfo?.propertySubtype}</Descriptions.Item>
                      <Descriptions.Item label="Property Value">AED {caseData.propertyInfo?.propertyValue?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Loan Amount">AED {caseData.propertyInfo?.loanAmount?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Down Payment">AED {caseData.propertyInfo?.downPayment?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="LTV">{(caseData.propertyInfo?.ltvPercentage || 0).toFixed(1)}%</Descriptions.Item>
                      <Descriptions.Item label="Address">{caseData.propertyInfo?.propertyAddress?.building}, {caseData.propertyInfo?.propertyAddress?.area}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>

              {/* Employment & Loan Details */}
              <Row gutter={24}>
                <Col xs={24} lg={12}>
                  <Card title={<span><IdcardOutlined style={{ color: PRIMARY }} /> Employment Details</span>} style={{ borderRadius: 16 }}>
                    <Descriptions bordered size="small" column={1}>
                      <Descriptions.Item label="Employer">{caseData.employmentDetails?.employerName}</Descriptions.Item>
                      <Descriptions.Item label="Designation">{caseData.employmentDetails?.designation}</Descriptions.Item>
                      <Descriptions.Item label="Employment Type">{caseData.employmentDetails?.employmentType}</Descriptions.Item>
                      <Descriptions.Item label="Years with Employer">{caseData.employmentDetails?.yearsWithEmployer} years</Descriptions.Item>
                      <Descriptions.Item label="Monthly Income">AED {caseData.incomeDetails?.totalMonthlyIncome?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="DBR">{(caseData.expenseDetails?.dbrPercentage || 0).toFixed(1)}% - {caseData.expenseDetails?.dbrStatus}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title={<span><BankOutlined style={{ color: PRIMARY }} /> Loan Details</span>} style={{ borderRadius: 16 }}>
                    <Descriptions bordered size="small" column={1}>
                      <Descriptions.Item label="Bank">{caseData.loanInfo?.selectedBank}</Descriptions.Item>
                      <Descriptions.Item label="Interest Rate">{caseData.loanInfo?.interestRatePercentage}%</Descriptions.Item>
                      <Descriptions.Item label="Tenure">{caseData.loanInfo?.tenureYears} Years</Descriptions.Item>
                      <Descriptions.Item label="Monthly EMI">AED {caseData.loanInfo?.monthlyInstallment?.totalMonthlyPayment?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Processing Fee">AED {caseData.loanInfo?.processingFee?.toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="Valuation Fee">AED {caseData.loanInfo?.valuationFee?.toLocaleString()}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
            </Space>
          </TabPane>

          <TabPane tab={`Documents (${uploadedCount}/${totalRequired})`} key="documents">
            <div style={{ marginBottom: 24 }}>
              <Alert
                message="Document Requirements"
                description={`Please upload all ${totalRequired} required documents. Verified documents will be marked with a green check.`}
                type="info"
                showIcon
                style={{ borderRadius: 12 }}
              />
            </div>

            {/* Group documents by category and render */}
            {Object.entries(groupedDocuments)
              .sort((a, b) => {
                const orderA = getCategoryLabel(a[0]).order;
                const orderB = getCategoryLabel(b[0]).order;
                return orderA - orderB;
              })
              .map(([category, docs]) => {
                const categoryInfo = getCategoryLabel(category);
                const uploadedInCategory = docs.filter(d => d.isUploaded).length;
                
                return (
                  <div key={category} style={{ marginBottom: 32 }}>
                    {/* Category Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: PRIMARY,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                        }}
                      >
                        {categoryInfo.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{categoryInfo.label}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {uploadedInCategory} / {docs.length} uploaded
                        </div>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: 16,
                      }}
                    >
                      {docs.map((docReq) => (
                        <DocUploadCard
                          key={docReq.documentType}
                          docRequirement={docReq}
                          caseId={caseId}
                          uploadedDocs={documents}
                          onUploadSuccess={() => fetchData(true)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

            {/* All Done Banner */}
            {pct === 100 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1.5px solid #6ee7b7',
                  borderRadius: 14,
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginTop: 8,
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 36, color: '#10b981' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#065f46' }}>All documents uploaded!</div>
                  <div style={{ fontSize: 13, color: '#047857', marginTop: 4 }}>This case is ready for submission once all documents are verified.</div>
                </div>
              </div>
            )}
          </TabPane>

          <TabPane tab="Uploaded Files" key="files">
            <Card style={{ borderRadius: 16 }}>
              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <FileTextOutlined style={{ fontSize: 48, color: '#ccc' }} />
                  <br />
                  <Text type="secondary">No documents uploaded yet</Text>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: 16,
                  }}
                >
                  {documents.map((doc, idx) => {
                    const docLabel = DOCUMENT_LABELS[doc.documentType] || doc.documentType.replace(/_/g, ' ').toUpperCase();
                    const isVerified = doc.verificationStatus === 'verified';
                    const isRejected = doc.verificationStatus === 'rejected';
                    
                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#fff',
                          border: `1px solid ${isVerified ? '#10b981' : isRejected ? '#ef4444' : '#e5e7eb'}`,
                          borderRadius: 14,
                          padding: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 10,
                              background: isVerified ? '#ecfdf5' : isRejected ? '#fef2f2' : '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 20,
                              color: isVerified ? '#10b981' : isRejected ? '#ef4444' : PRIMARY,
                            }}
                          >
                            {isPdf(doc.fileName) ? <FilePdfOutlined /> : <FileImageOutlined />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{docLabel}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{doc.fileName}</div>
                          </div>
                          <Tag color={isVerified ? 'success' : isRejected ? 'error' : 'warning'}>
                            {isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                          </Tag>
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>
                          Uploaded: {dayjs(doc.uploadedAt).format('DD MMM YYYY, hh:mm A')} • Size: {fmtSize(doc.fileSizeMb)}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <ViewButton doc={doc} />
                          <button
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                            style={{
                              flex: 1,
                              padding: '8px',
                              background: '#f3f4f6',
                              border: '1px solid #e5e7eb',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: 12,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                          >
                            <DownloadOutlined /> Download
                          </button>
                        </div>
                        {isRejected && doc.rejectionReason && (
                          <div style={{ fontSize: 11, color: '#dc2626', background: '#fef2f2', padding: 8, borderRadius: 6 }}>
                            Rejected: {doc.rejectionReason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default DetailedViewCases;