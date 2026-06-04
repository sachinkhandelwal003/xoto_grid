import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Button, Typography, Row, Col, Avatar,
  Tag, Spin, message, Pagination, Space, Progress, Modal, Tooltip,
  Select, Input, Alert, Empty, Popconfirm
} from 'antd';
import {
  UserOutlined, BankOutlined, FileTextOutlined,
  CalendarOutlined, EyeOutlined, HomeOutlined,
  DollarCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, RocketOutlined,
  SendOutlined, TeamOutlined, InfoCircleOutlined,
  EditOutlined, ArrowRightOutlined, SyncOutlined,
  WarningOutlined, RedoOutlined, CheckOutlined, HistoryOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const THEME_COLOR = "#5C039B";
const SUCCESS_COLOR = "#10b981";
const WARNING_COLOR = "#f59e0b";
const ERROR_COLOR = "#ef4444";
const INFO_COLOR = "#3b82f6";

// ================= STATUS CONFIGURATION =================
const CASE_STATUSES = [
  'Draft',
  'Submitted to Xoto',
  'In Ops Queue - Pending Pick-up',
  'Assigned - Pending Review',
  'Under Review',
  'Returned - Pending Correction',
  'Resubmitted-After Correction',
  'Bank Application',
  'Collecting Documentation',
  'Pre-Approved',
  'Valuation',
  'FOL Processed',
  'FOL Issued',
  'FOL Signed',
  'Disbursed',
  'Rejected',
  'Lost'
];

const getStatusIcon = (status) => {
  const iconMap = {
    'Under Review': <SyncOutlined spin style={{ color: INFO_COLOR }} />,
    'Submitted to Xoto': <SendOutlined style={{ color: THEME_COLOR }} />,
    'In Ops Queue - Pending Pick-up': <ClockCircleOutlined style={{ color: WARNING_COLOR }} />,
    'Assigned - Pending Review': <EyeOutlined style={{ color: INFO_COLOR }} />,
    'Returned - Pending Correction': <WarningOutlined style={{ color: ERROR_COLOR }} />,
    'Resubmitted-After Correction': <RedoOutlined style={{ color: THEME_COLOR }} />,
    'Bank Application': <BankOutlined style={{ color: THEME_COLOR }} />,
    'Collecting Documentation': <FileTextOutlined style={{ color: WARNING_COLOR }} />,
    'Pre-Approved': <CheckCircleOutlined style={{ color: SUCCESS_COLOR }} />,
    'Valuation': <EyeOutlined style={{ color: INFO_COLOR }} />,
    'FOL Processed': <FileTextOutlined style={{ color: SUCCESS_COLOR }} />,
    'FOL Issued': <FileTextOutlined style={{ color: SUCCESS_COLOR }} />,
    'FOL Signed': <CheckCircleOutlined style={{ color: SUCCESS_COLOR }} />,
    'Disbursed': <DollarCircleOutlined style={{ color: SUCCESS_COLOR }} />,
    'Rejected': <CloseCircleOutlined style={{ color: ERROR_COLOR }} />,
    'Lost': <WarningOutlined style={{ color: ERROR_COLOR }} />
  };
  return iconMap[status] || <ClockCircleOutlined />;
};

const getStatusColor = (status) => {
  const colorMap = {
    'Under Review': 'processing',
    'Submitted to Xoto': 'processing',
    'In Ops Queue - Pending Pick-up': 'warning',
    'Assigned - Pending Review': 'processing',
    'Returned - Pending Correction': 'error',
    'Resubmitted-After Correction': 'warning',
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

const getCardGradient = (status) => {
  const gradients = {
    'Under Review': `linear-gradient(135deg, ${INFO_COLOR}08 0%, #fff 100%)`,
    'Returned - Pending Correction': `linear-gradient(135deg, ${ERROR_COLOR}04 0%, #fff 100%)`,
    'Resubmitted-After Correction': `linear-gradient(135deg, ${THEME_COLOR}04 0%, #fff 100%)`,
    'Pre-Approved': `linear-gradient(135deg, ${SUCCESS_COLOR}08 0%, #fff 100%)`,
    'Rejected': `linear-gradient(135deg, ${ERROR_COLOR}04 0%, #fff 100%)`,
    'Disbursed': `linear-gradient(135deg, ${SUCCESS_COLOR}10 0%, #fff 100%)`,
  };
  return gradients[status] || `linear-gradient(135deg, ${THEME_COLOR}04 0%, #fff 100%)`;
};

const getAvailableNextStatuses = (currentStatus) => {
  const transitions = {
    'Draft': ['Submitted to Xoto'],
    'Submitted to Xoto': ['In Ops Queue - Pending Pick-up'],
    'In Ops Queue - Pending Pick-up': ['Assigned - Pending Review'],
    'Assigned - Pending Review': ['Under Review', 'Returned - Pending Correction'],
    'Under Review': ['Bank Application', 'Returned - Pending Correction'],
    'Returned - Pending Correction': ['Resubmitted-After Correction'],
    'Resubmitted-After Correction': ['Under Review'],
    'Bank Application': ['Pre-Approved', 'Collecting Documentation', 'Rejected'],
    'Collecting Documentation': ['Bank Application', 'Lost'],
    'Pre-Approved': ['Valuation', 'Rejected'],
    'Valuation': ['FOL Processed', 'Rejected'],
    'FOL Processed': ['FOL Issued', 'Rejected'],
    'FOL Issued': ['FOL Signed', 'Rejected'],
    'FOL Signed': ['Disbursed', 'Rejected'],
    'Disbursed': [],
    'Rejected': [],
    'Lost': []
  };
  return transitions[currentStatus] || [];
};

const roleSlugMap = {
  0: "superadmin", 1: "admin", 2: "customer",
  15: "agency", 16: "agent", 17: "developer", 18: "vault-admin"
};

const ProcessCasesUpdates = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  // Status Update Modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Resubmit Modal
  const [resubmitModalVisible, setResubmitModalVisible] = useState(false);
  const [resubmitCase, setResubmitCase] = useState(null);
  const [resubmitNotes, setResubmitNotes] = useState('');

  const fetchCases = useCallback(async (page) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/vault/cases?page=${page}&limit=12`);
      if (res?.success) {
        setCases(res.data || []);
        setTotalItems(res.pagination?.total || 0);
      }
    } catch (err) {
      message.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases(currentPage);
  }, [currentPage, fetchCases]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Navigate to View Case
  const navigateToCaseDetail = (caseItem) => {
    navigate(`/dashboard/${roleSlug}/case/view/${caseItem._id}`);
  };

  // Open Status Update Modal
  const openStatusModal = (caseItem) => {
    setSelectedCase(caseItem);
    setSelectedStatus('');
    setStatusNotes('');
    setStatusModalVisible(true);
  };

  // Open Resubmit Modal
  const openResubmitModal = (caseItem) => {
    setResubmitCase(caseItem);
    setResubmitNotes('');
    setResubmitModalVisible(true);
  };

  // API: Update Case Status
  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      message.warning("Please select a status");
      return;
    }

    setUpdating(true);
    try {
      const response = await apiService.put(`/vault/cases/admin/${selectedCase._id}/status`, {
        status: selectedStatus,
        notes: statusNotes
      });

      if (response?.success) {
        message.success(`Case status updated to "${selectedStatus}" successfully!`);
        setStatusModalVisible(false);
        setSelectedCase(null);
        fetchCases(currentPage);
      } else {
        message.error(response?.message || "Failed to update case status");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Error updating case status");
    } finally {
      setUpdating(false);
    }
  };

  // API: Resubmit Case
  const handleResubmitCase = async () => {
    if (!resubmitCase) return;

    setUpdating(true);
    try {
      const response = await apiService.put(`/vault/cases/ops/resubmit/${resubmitCase._id}`, {
        correctionNotes: resubmitNotes || "Corrections completed and resubmitted for review."
      });

      if (response?.success) {
        message.success(`Case "${resubmitCase.caseReference}" resubmitted successfully!`);
        setResubmitModalVisible(false);
        setResubmitCase(null);
        setResubmitNotes('');
        fetchCases(currentPage);
      } else {
        message.error(response?.message || "Failed to resubmit case");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Error resubmitting case");
    } finally {
      setUpdating(false);
    }
  };

  const getDocumentProgress = (documentStatus) => {
    const total = documentStatus?.requiredDocuments?.length || 10;
    const uploaded = documentStatus?.documentsUploadedCount || 0;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;
    return { total, uploaded, percentage };
  };

  const getFilteredCases = () => {
    if (activeTab === 'all') return cases;
    return cases.filter(c => c.currentStatus === activeTab);
  };

  const getStatusCount = (status) => {
    if (status === 'all') return cases.length;
    return cases.filter(c => c.currentStatus === status).length;
  };

  // Render Case Card
  const renderCaseCard = (caseItem) => {
    const clientName = caseItem.clientInfo?.fullName || 'Unknown Client';
    const propertyValue = caseItem.propertyInfo?.propertyValue || 0;
    const loanAmount = caseItem.propertyInfo?.loanAmount || caseItem.loanInfo?.requestedAmount || 0;
    const bankName = caseItem.loanInfo?.selectedBank || 'Not Selected';
    const docProgress = getDocumentProgress(caseItem.documentStatus);
    const createdBy = caseItem.createdBy?.advisorName || caseItem.createdBy?.partnerName || 'Admin';
    const availableStatuses = getAvailableNextStatuses(caseItem.currentStatus);
    const canUpdate = availableStatuses.length > 0;
    const isReturned = caseItem.currentStatus === 'Returned - Pending Correction';
    const isResubmitted = caseItem.currentStatus === 'Resubmitted-After Correction';
    const isUnderReview = caseItem.currentStatus === 'Under Review';
    const statusIcon = getStatusIcon(caseItem.currentStatus);
    const statusColor = getStatusColor(caseItem.currentStatus);
    const cardGradient = getCardGradient(caseItem.currentStatus);

    return (
      <Card
        style={{
          borderRadius: 20,
          border: `1px solid ${isReturned ? ERROR_COLOR : statusColor === 'success' ? SUCCESS_COLOR : statusColor === 'error' ? ERROR_COLOR : '#e8e8e8'}`,
          borderTop: `5px solid ${isReturned ? ERROR_COLOR : statusColor === 'success' ? SUCCESS_COLOR : statusColor === 'error' ? ERROR_COLOR : THEME_COLOR}`,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          background: cardGradient,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Animated loader for Under Review */}
        {isUnderReview && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${INFO_COLOR}, ${THEME_COLOR}, ${INFO_COLOR})`,
            animation: 'loadingProgress 2s ease-in-out infinite',
            zIndex: 10
          }} />
        )}

        {/* Returned Warning Banner */}
        {isReturned && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: ERROR_COLOR,
            color: 'white',
            padding: '6px 16px',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            zIndex: 10
          }}>
            <WarningOutlined style={{ marginRight: 8 }} />
            CORRECTIONS REQUIRED
          </div>
        )}

        {/* Resubmitted Badge */}
        {isResubmitted && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: THEME_COLOR,
            color: 'white',
            padding: '6px 16px',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            zIndex: 10
          }}>
            <RedoOutlined style={{ marginRight: 8 }} />
            RESUBMITTED - Waiting for Ops Review
          </div>
        )}

        <div style={{ padding: isReturned || isResubmitted ? '40px 24px 24px 24px' : '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar
                icon={isUnderReview ? <SyncOutlined spin /> : isReturned ? <WarningOutlined /> : <UserOutlined />}
                style={{
                  backgroundColor: isReturned ? ERROR_COLOR : isUnderReview ? INFO_COLOR : THEME_COLOR,
                  boxShadow: `0 4px 12px ${isReturned ? ERROR_COLOR : isUnderReview ? INFO_COLOR : THEME_COLOR}30`
                }}
                size={52}
              />
              <div>
                <Text strong style={{ fontSize: 18, display: 'block', color: '#1e1b4b' }}>{clientName}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>Case: {caseItem.caseReference}</Text>
              </div>
            </div>
            <Tag icon={statusIcon} color={statusColor} style={{ padding: '6px 14px', borderRadius: 30, fontWeight: 600 }}>
              {caseItem.currentStatus}
            </Tag>
          </div>

          {/* Key Metrics */}
          <Row gutter={16} style={{ background: '#faf9fe', padding: '16px', borderRadius: 16, marginBottom: 20 }}>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HomeOutlined style={{ color: THEME_COLOR }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Property Value</Text>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>AED {propertyValue.toLocaleString()}</div>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarCircleOutlined style={{ color: SUCCESS_COLOR }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>Loan Amount</Text>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>AED {loanAmount.toLocaleString()}</div>
                </div>
              </div>
            </Col>
          </Row>

          {/* Correction Notes for Returned Cases */}
          {isReturned && caseItem.lastReturnNotes && (
            <Alert
              message="Correction Required"
              description={caseItem.lastReturnNotes}
              type="error"
              showIcon
              style={{ marginBottom: 16, borderRadius: 12 }}
            />
          )}

          {/* Bank & Document Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BankOutlined style={{ color: THEME_COLOR }} />
              <Text strong>{bankName}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined style={{ color: THEME_COLOR }} />
              <Text>{docProgress.uploaded}/{docProgress.total} docs</Text>
              <Progress percent={docProgress.percentage} size="small" style={{ width: 80 }} strokeColor={THEME_COLOR} showInfo={false} />
            </div>
          </div>

          {/* Metadata */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 20 }}>
            <span><CalendarOutlined /> {dayjs(caseItem.createdAt).format('MMM DD, YYYY')}</span>
            <span><UserOutlined /> {createdBy}</span>
            {caseItem.assignedTo?.opsName && <span><TeamOutlined /> {caseItem.assignedTo.opsName}</span>}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {/* VIEW CASE BUTTON - Always visible */}
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigateToCaseDetail(caseItem)}
              style={{ borderRadius: 12, flex: 1, height: 42 }}
            >
              View Case
            </Button>

            {/* RESUBMIT BUTTON - Only for Returned cases */}
            {isReturned && (
              <Popconfirm
                title="Confirm Resubmission"
                description="Have you made all corrections? Case will go back to Mortgage Ops."
                onConfirm={() => openResubmitModal(caseItem)}
                okText="Yes"
                cancelText="No"
                placement="topRight"
              >
                <Button
                  type="primary"
                  icon={<RedoOutlined />}
                  style={{ background: SUCCESS_COLOR, borderColor: SUCCESS_COLOR, borderRadius: 12, flex: 1, height: 42, fontWeight: 600 }}
                >
                  Resubmit
                </Button>
              </Popconfirm>
            )}

            {/* UPDATE STATUS BUTTON - For all other cases that can be updated */}
            {!isReturned && canUpdate && (
              <Tooltip title={`Next: ${availableStatuses[0]}`}>
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  onClick={() => openStatusModal(caseItem)}
                  style={{ background: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 12, flex: 1, height: 42, fontWeight: 600 }}
                >
                  Update Status
                </Button>
              </Tooltip>
            )}

            {/* FINAL STAGE BUTTON - Disabled for completed cases */}
            {!isReturned && !canUpdate && (
              <Button disabled style={{ borderRadius: 12, flex: 1, height: 42 }} icon={<CheckCircleOutlined />}>
                Completed
              </Button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes loadingProgress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </Card>
    );
  };

  // Resubmit Modal
  const renderResubmitModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RedoOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Resubmit Case</span>
        </div>
      }
      open={resubmitModalVisible}
      onCancel={() => { setResubmitModalVisible(false); setResubmitCase(null); setResubmitNotes(''); }}
      footer={[
        <Button key="cancel" onClick={() => { setResubmitModalVisible(false); setResubmitCase(null); setResubmitNotes(''); }}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleResubmitCase} loading={updating} style={{ background: SUCCESS_COLOR }}>
          Confirm Resubmit
        </Button>
      ]}
      width={500}
      centered
    >
      {resubmitCase && (
        <>
          <Alert
            message="Correction Required"
            description={resubmitCase.lastReturnNotes || "Please confirm all corrections are made."}
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 12 }}
          />
          <div style={{ marginBottom: 16 }}>
            <Text strong>Resubmission Notes (Optional)</Text>
            <TextArea
              rows={3}
              value={resubmitNotes}
              onChange={(e) => setResubmitNotes(e.target.value)}
              placeholder="Add notes about corrections made..."
              style={{ marginTop: 8, borderRadius: 12 }}
            />
          </div>
        </>
      )}
    </Modal>
  );

  // Status Update Modal
  const renderStatusModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <EditOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Update Status</span>
        </div>
      }
      open={statusModalVisible}
      onCancel={() => { setStatusModalVisible(false); setSelectedCase(null); }}
      footer={[
        <Button key="cancel" onClick={() => { setStatusModalVisible(false); setSelectedCase(null); }}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={handleUpdateStatus} loading={updating} style={{ background: SUCCESS_COLOR }}>
          Update Status
        </Button>
      ]}
      width={500}
      centered
    >
      {selectedCase && (
        <>
          <Alert
            message={`Current: ${selectedCase.currentStatus}`}
            description={`Case: ${selectedCase.caseReference}`}
            type="info"
            showIcon
            style={{ marginBottom: 20, borderRadius: 12 }}
          />
          <div style={{ marginBottom: 16 }}>
            <Text strong>New Status <span style={{ color: 'red' }}>*</span></Text>
            <Select
              placeholder="Select next status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              {getAvailableNextStatuses(selectedCase.currentStatus).map(status => (
                <Option key={status} value={status}>
                  <Space>
                    {getStatusIcon(status)}
                    <span>{status}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text strong>Notes</Text>
            <TextArea
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add details about this update..."
              style={{ marginTop: 8, borderRadius: 12 }}
            />
          </div>
        </>
      )}
    </Modal>
  );

  // Status Tabs
  const renderStatusTabs = () => {
    const allStatuses = ['all', ...CASE_STATUSES];
    return (
      <div style={{ marginBottom: 32, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 8 }}>
        <Space size={12} wrap>
          {allStatuses.map(status => {
            const count = getStatusCount(status);
            const isActive = activeTab === status;
            const displayName = status === 'all' ? 'All Cases' : status;
            return (
              <Button
                key={status}
                onClick={() => setActiveTab(status)}
                style={{
                  borderRadius: 40,
                  padding: '6px 24px',
                  height: 'auto',
                  background: isActive ? THEME_COLOR : 'white',
                  borderColor: isActive ? THEME_COLOR : '#e0e0e0',
                  color: isActive ? 'white' : '#4a5568',
                  fontWeight: 600
                }}
              >
                {status !== 'all' && getStatusIcon(status)}
                <span style={{ marginLeft: status !== 'all' ? 8 : 0 }}>
                  {displayName} ({count})
                </span>
              </Button>
            );
          })}
        </Space>
      </div>
    );
  };

  const filteredCases = getFilteredCases();

  return (
    <div style={{ padding: '28px 32px', background: '#fdfbff', minHeight: '100vh' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Process & Update Cases</Title>
        <Text type="secondary">Manage mortgage case workflows, update statuses, and track progress</Text>
      </div>

      {renderStatusTabs()}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" tip="Loading cases..." />
        </div>
      ) : filteredCases.length === 0 ? (
        <Empty description={`No cases found for ${activeTab === 'all' ? 'any' : activeTab} status`} />
      ) : (
        <>
          <Row gutter={[28, 28]}>
            {filteredCases.map(caseItem => (
              <Col xs={24} key={caseItem._id}>
                {renderCaseCard(caseItem)}
              </Col>
            ))}
          </Row>
          {totalItems > 0 && (
            <div style={{ marginTop: 48, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination current={currentPage} total={totalItems} pageSize={12} onChange={handlePageChange} showTotal={(total) => `Total ${total} cases`} />
            </div>
          )}
        </>
      )}

      {renderStatusModal()}
      {renderResubmitModal()}
    </div>
  );
};

export default ProcessCasesUpdates;