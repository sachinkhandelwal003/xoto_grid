import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Button, Typography, Row, Col, Avatar,
  Tag, Divider, Spin, message, Badge,
  Space, Progress, Modal, Tooltip,
  Select, Input, Alert, Empty, Form, Radio
} from 'antd';
import {
  UserOutlined, BankOutlined, FileTextOutlined,
  CalendarOutlined, EyeOutlined, HomeOutlined,
  DollarCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, RocketOutlined,
  SendOutlined, TeamOutlined, EditOutlined,
  HistoryOutlined, FileDoneOutlined,
  LoadingOutlined, ArrowRightOutlined, SyncOutlined,
  WarningOutlined, UserAddOutlined, SwapOutlined,
  ApartmentOutlined, UserSwitchOutlined, TrophyOutlined,
  DollarOutlined, FundOutlined, PlusOutlined, GiftOutlined,
  ReloadOutlined, SearchOutlined, PercentageOutlined,
  RiseOutlined, FallOutlined, WalletOutlined,InfoCircleOutlined 
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
const SUCCESS_LIGHT = "#D1FAE5";
const INFO_LIGHT = "#DBEAFE";

const roleSlugMap = {
  '0': 'superadmin', '1': 'admin', '2': "customer",
  '5': 'vendor-b2c', '6': 'vendor-b2b', '7': 'freelancer',
  '11': 'accountant', '12': 'supervisor', '15': "agency",
  '16': "agent", '17': "developer", '18': "vault-admin",
  '22': "vaultagent", '21': "vaultpartner", '24': "GridAdvisor",
  '23': "vault-ops", '25': "gridreferralpartner", '26': "vault-advisor",
};

const CASE_STATUSES = [
  'Draft', 'Submitted to Xoto', 'In Ops Queue - Pending Pick-up',
  'Assigned - Pending Review', 'Under Review', 'Returned - Pending Correction',
  'Bank Application', 'Collecting Documentation', 'Pre-Approved',
  'Valuation', 'FOL Processed', 'FOL Issued', 'FOL Signed',
  'Disbursed', 'Rejected', 'Lost'
];

const getStatusIcon = (status) => {
  const iconMap = {
    'Draft': <EditOutlined style={{ color: '#9ca3af' }} />,
    'Submitted to Xoto': <SendOutlined style={{ color: THEME_COLOR }} />,
    'In Ops Queue - Pending Pick-up': <ClockCircleOutlined style={{ color: WARNING_COLOR }} />,
    'Assigned - Pending Review': <SyncOutlined spin style={{ color: INFO_COLOR }} />,
    'Under Review': <SyncOutlined spin style={{ color: INFO_COLOR }} />,
    'Returned - Pending Correction': <WarningOutlined style={{ color: ERROR_COLOR }} />,
    'Bank Application': <BankOutlined style={{ color: THEME_COLOR }} />,
    'Collecting Documentation': <FileTextOutlined style={{ color: WARNING_COLOR }} />,
    'Pre-Approved': <CheckCircleOutlined style={{ color: SUCCESS_COLOR }} />,
    'Valuation': <EyeOutlined style={{ color: INFO_COLOR }} />,
    'FOL Processed': <FileDoneOutlined style={{ color: SUCCESS_COLOR }} />,
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
    'Draft': 'default', 'Submitted to Xoto': 'processing',
    'In Ops Queue - Pending Pick-up': 'warning', 'Assigned - Pending Review': 'processing',
    'Under Review': 'processing', 'Returned - Pending Correction': 'error',
    'Bank Application': 'processing', 'Collecting Documentation': 'warning',
    'Pre-Approved': 'success', 'Valuation': 'processing',
    'FOL Processed': 'success', 'FOL Issued': 'success',
    'FOL Signed': 'success', 'Disbursed': 'success',
    'Rejected': 'error', 'Lost': 'default'
  };
  return colorMap[status] || 'default';
};

const getCreatorInfo = (caseItem) => {
  const createdBy = caseItem.createdBy;
  if (!createdBy) return { name: 'Unknown', type: 'Unknown', icon: <UserOutlined />, color: '#9ca3af' };
  
  if (createdBy.role === 'partner' && createdBy.partnerName) {
    return { name: createdBy.partnerName, type: 'Partner', icon: <ApartmentOutlined />, color: '#8b5cf6' };
  } else if (createdBy.role === 'advisor' && createdBy.advisorName) {
    return { name: createdBy.advisorName, type: 'Xoto Advisor', icon: <UserSwitchOutlined />, color: THEME_COLOR };
  } else if (createdBy.role === 'admin' && createdBy.adminName) {
    return { name: createdBy.adminName, type: 'Admin', icon: <TrophyOutlined />, color: '#f59e0b' };
  }
  return { name: 'System', type: 'System', icon: <UserOutlined />, color: '#9ca3af' };
};

const formatCurrency = (value) => {
  if (!value && value !== 0) return "AED 0";
  return `AED ${Number(value).toLocaleString()}`;
};

const AdminManagecases = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalCases, setTotalCases] = useState(0);
  const [activeStatus, setActiveStatus] = useState('Disbursed');
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  
  // Preview Modal State (Only Preview - NO Creation)
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [commissionPreview, setCommissionPreview] = useState(null);
  const [previewForm, setPreviewForm] = useState({
    bankCommissionRate: '',
    actualBankCommission: ''
  });

  const showToast = (message, type = "success") => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Fetch cases
  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/vault/cases?page=${currentPage}&limit=${itemsPerPage}`;
      if (activeStatus !== 'all') url += `&status=${activeStatus}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await apiService.get(url);
      if (response?.success) {
        setCases(response.data || []);
        setTotalCases(response.pagination?.total || 0);
      }
    } catch (err) {
      message.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, activeStatus, search]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Fetch Commission Preview (ONLY - No Creation)
// Fetch Commission Preview (ONLY - No Creation)
const fetchCommissionPreview = async () => {
  if (!selectedCase) return;
  setPreviewLoading(true);
  try {
    let payload = {};
    if (previewForm.actualBankCommission) {
      payload.customBankCommission = parseFloat(previewForm.actualBankCommission);
    } else if (previewForm.bankCommissionRate) {
      payload.customBankRate = parseFloat(previewForm.bankCommissionRate);
    }
    
    const response = await apiService.post(`/vault/commissions/admin/preview/${selectedCase._id}`, payload);
    
    // ✅ FIXED: response.data contains the data directly
    if (response?.success && response?.data) {
      setCommissionPreview(response.data);  // NOT response.data.data
    } else {
      showToast(response?.message || "Failed to preview commission", "error");
    }
  } catch (err) {
    console.error("Preview error:", err);
    showToast(err.response?.data?.message || "Error previewing commission", "error");
  } finally {
    setPreviewLoading(false);
  }
};

  const openPreviewModal = (caseItem) => {
    setSelectedCase(caseItem);
    setCommissionPreview(null);
    setPreviewForm({ bankCommissionRate: '', actualBankCommission: '' });
    setPreviewModalVisible(true);
  };

  const navigateToCaseDetail = (caseId) => {
    navigate(`/dashboard/${roleSlug}/case/view/${caseId}`);
  };

  const navigateToAmountDetails = (caseId) => {
    navigate(`/dashboard/${roleSlug}/case/amount/view/${caseId}`);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setActiveStatus("Disbursed");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusCount = (status) => {
    if (status === 'all') return cases.length;
    return cases.filter(c => c.currentStatus === status).length;
  };

  // Render Case Card
  const renderCaseCard = (caseItem) => {
    const creator = getCreatorInfo(caseItem);
    const isDisbursed = caseItem.currentStatus === 'Disbursed';
    const hasCommission = caseItem.commissionInfo || false;
    const disbursedAmount = caseItem.loanInfo?.disbursedAmount || caseItem.loanInfo?.approvedAmount || 0;
    
    const xotoCommission = disbursedAmount * 0.01;
    let partnerPercentage = 80;
    if (caseItem.createdBy?.role === 'partner') {
      partnerPercentage = disbursedAmount <= 5000000 ? 80 : 85;
    } else if (caseItem.createdBy?.role === 'advisor') {
      partnerPercentage = 0;
    }
    const estimatedCommission = (xotoCommission * partnerPercentage) / 100;

    return (
      <Card
        style={{
          borderRadius: 20,
          border: isDisbursed ? `1px solid ${SUCCESS_COLOR}40` : `1px solid ${THEME_COLOR}20`,
          overflow: 'hidden',
          height: '100%',
          background: isDisbursed ? `linear-gradient(135deg, #F3E8FF 0%, #ffffff 100%)` : '#fff',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          position: 'relative'
        }}
        hoverable
        bodyStyle={{ padding: 0 }}
      >
        {isDisbursed && (
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 60, height: 60, overflow: 'hidden', zIndex: 10
          }}>
            <div style={{
              position: 'absolute', top: 12, right: -25, width: 80, background: SUCCESS_COLOR,
              color: 'white', textAlign: 'center', padding: '4px 0', fontSize: 10,
              fontWeight: 600, transform: 'rotate(45deg)'
            }}>DISBURSED</div>
          </div>
        )}

        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar icon={creator.icon} style={{ backgroundColor: creator.color }} size={44} />
              <div>
                <Text strong style={{ fontSize: 16 }}>{caseItem.clientInfo?.fullName || 'Unknown'}</Text>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{caseItem.caseReference}</div>
              </div>
            </div>
            <Tag icon={getStatusIcon(caseItem.currentStatus)} color={getStatusColor(caseItem.currentStatus)}>
              {caseItem.currentStatus}
            </Tag>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <Row gutter={12}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 10 }}>Property Value</Text>
                <div style={{ fontWeight: 600 }}>{formatCurrency(caseItem.propertyInfo?.propertyValue)}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 10 }}>Loan Amount</Text>
                <div style={{ fontWeight: 600 }}>{formatCurrency(caseItem.calculations?.loanAmount)}</div>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 10 }}>Bank</Text>
                <div style={{ fontWeight: 600 }}>{caseItem.loanInfo?.selectedBank || 'N/A'}</div>
              </Col>
            </Row>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Documents</Text>
              <Text strong style={{ fontSize: 11 }}>
                {caseItem.documentStatus?.documentsUploadedCount || 0}/{caseItem.documentStatus?.requiredDocuments?.length || 0}
              </Text>
            </div>
            <Progress
              percent={caseItem.documentStatus?.completionPercentage || 0}
              size="small"
              strokeColor={caseItem.documentStatus?.completionPercentage === 100 ? SUCCESS_COLOR : THEME_COLOR}
              showInfo={false}
              strokeWidth={6}
            />
          </div>

          {isDisbursed && (
            <div style={{ background: hasCommission ? SUCCESS_LIGHT : INFO_LIGHT, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 10 }}>Est. Commission</Text>
                  <div style={{ fontWeight: 700, color: SUCCESS_COLOR }}>{formatCurrency(estimatedCommission)}</div>
                </div>
                {hasCommission ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Commission Created</Tag>
                ) : (
                  <Tag color="warning" icon={<ClockCircleOutlined />}>Pending</Tag>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
            <span><CalendarOutlined /> {dayjs(caseItem.createdAt).format('DD MMM YYYY')}</span>
            <span><TeamOutlined /> {creator.type}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tooltip title="View Case Details">
              <Button icon={<EyeOutlined />} onClick={() => navigateToCaseDetail(caseItem._id)} style={{ borderRadius: 8, flex: 1 }}>
                View
              </Button>
            </Tooltip>

            {isDisbursed && (
              <>
                <Tooltip title="View Amount Details">
                  <Button icon={<DollarOutlined />} onClick={() => navigateToAmountDetails(caseItem._id)} style={{ borderRadius: 8, borderColor: SUCCESS_COLOR, color: SUCCESS_COLOR }}>
                    Amount
                  </Button>
                </Tooltip>
                {!hasCommission && (
                  <Tooltip title="Preview Commission">
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => openPreviewModal(caseItem)}
                      style={{ background: SUCCESS_COLOR, borderColor: SUCCESS_COLOR, borderRadius: 8 }}
                    >
                      Preview
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Status Tabs
  const renderStatusTabs = () => {
    const allStatuses = ['all', ...CASE_STATUSES];
    return (
      <div style={{ marginBottom: 24, overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 8 }}>
        <Space size={10} wrap>
          {allStatuses.map(status => {
            const count = getStatusCount(status);
            const isActive = activeStatus === status;
            const displayName = status === 'all' ? 'All Cases' : status;
            return (
              <Button
                key={status}
                onClick={() => setActiveStatus(status)}
                style={{
                  borderRadius: 40, padding: '6px 22px', height: 'auto',
                  background: isActive ? THEME_COLOR : 'white',
                  borderColor: isActive ? THEME_COLOR : '#e5e7eb',
                  color: isActive ? 'white' : '#4b5563', fontWeight: 600,
                  boxShadow: isActive ? `0 2px 8px ${THEME_COLOR}40` : 'none'
                }}
              >
                {status !== 'all' && getStatusIcon(status)}
                <span style={{ marginLeft: status !== 'all' ? 8 : 0 }}>
                  {displayName}{count > 0 && ` (${count})`}
                </span>
              </Button>
            );
          })}
        </Space>
      </div>
    );
  };

  // Stats Summary
  const renderStats = () => {
    const total = cases.length;
    const pendingQueue = cases.filter(c => c.currentStatus === 'In Ops Queue - Pending Pick-up').length;
    const inProgress = cases.filter(c => ['Assigned - Pending Review', 'Under Review', 'Bank Application'].includes(c.currentStatus)).length;
    const completed = cases.filter(c => c.currentStatus === 'Disbursed').length;
    
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: `1px solid ${THEME_COLOR}20` }}>
            <StatisticComp title="Total Cases" value={total} prefix={<FileTextOutlined />} valueStyle={{ color: THEME_COLOR }} />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: `1px solid ${WARNING_COLOR}20` }}>
            <StatisticComp title="Pending Queue" value={pendingQueue} prefix={<ClockCircleOutlined />} valueStyle={{ color: WARNING_COLOR }} />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: `1px solid ${INFO_COLOR}20` }}>
            <StatisticComp title="In Progress" value={inProgress} prefix={<SyncOutlined spin />} valueStyle={{ color: INFO_COLOR }} />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', border: `1px solid ${SUCCESS_COLOR}20` }}>
            <StatisticComp title="Disbursed" value={completed} prefix={<DollarOutlined />} valueStyle={{ color: SUCCESS_COLOR }} />
          </div>
        </Col>
      </Row>
    );
  };

  // Preview Commission Modal (ONLY PREVIEW - NO CREATION)
  const renderPreviewModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <EyeOutlined style={{ color: SUCCESS_COLOR, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Commission Preview</span>
          <Tag color="success">Disbursed Case</Tag>
        </div>
      }
      open={previewModalVisible}
      onCancel={() => { setPreviewModalVisible(false); setSelectedCase(null); setCommissionPreview(null); }}
      width={700}
      footer={[
        <Button key="close" type="primary" onClick={() => { setPreviewModalVisible(false); setSelectedCase(null); setCommissionPreview(null); }} style={{ background: THEME_COLOR }}>
          Close
        </Button>
      ]}
    >
      {selectedCase && (
        <div>
          {/* Case Summary */}
          <div style={{ background: '#f5f0ff', padding: 16, borderRadius: 12, marginBottom: 20 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Case Reference</Text>
                <div><Text strong>{selectedCase.caseReference}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Client Name</Text>
                <div><Text strong>{selectedCase.clientInfo?.fullName}</Text></div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Disbursed Amount</Text>
                <div><Text strong style={{ color: SUCCESS_COLOR, fontSize: 16 }}>{formatCurrency(selectedCase.loanInfo?.disbursedAmount)}</Text></div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 12 }}>Lead Source</Text>
                <div>
                  <Tag color="green" icon={<CheckCircleOutlined />}>Has Lead</Tag>
                </div>
              </Col>
            </Row>
          </div>

          {/* Bank Commission Input for Preview */}
          <div style={{ marginBottom: 20 }}>
            <Text strong>Enter Bank Commission Information to Preview</Text>
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ minWidth: 180 }}>Bank Commission Rate:</span>
                  <Input 
                    placeholder="Rate (%)" 
                    value={previewForm.bankCommissionRate} 
                    onChange={(e) => {
                      setPreviewForm({ ...previewForm, bankCommissionRate: e.target.value, actualBankCommission: '' });
                    }} 
                    suffix="%" 
                    style={{ width: 150 }} 
                    prefix={<PercentageOutlined />}
                  />
                </div>
              </div>
              <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <Text type="secondary">OR</Text>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ minWidth: 180 }}>Actual Bank Commission Amount (AED):</span>
                  <Input 
                    placeholder="Amount (AED)" 
                    value={previewForm.actualBankCommission} 
                    onChange={(e) => {
                      setPreviewForm({ ...previewForm, actualBankCommission: e.target.value, bankCommissionRate: '' });
                    }} 
                    prefix="AED" 
                    style={{ width: 200 }} 
                  />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Button 
                  type="primary" 
                  onClick={fetchCommissionPreview} 
                  loading={previewLoading}
                  icon={<EyeOutlined />}
                  style={{ background: SUCCESS_COLOR, width: '100%' }}
                >
                  Calculate Preview
                </Button>
              </div>
            </div>
          </div>


{commissionPreview && (
  <div style={{ background: SUCCESS_LIGHT, padding: 16, borderRadius: 12, border: `1px solid ${SUCCESS_COLOR}`, marginTop: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <CheckCircleOutlined style={{ color: SUCCESS_COLOR }} />
      <Text strong style={{ color: SUCCESS_COLOR, fontSize: 14 }}>Commission Calculation Result</Text>
    </div>
    
    {commissionPreview.note && (
      <Alert
        message="Lead Source Info"
        description={commissionPreview.note}
        type="info"
        showIcon
        style={{ marginBottom: 16, borderRadius: 8 }}
      />
    )}

    {/* Bank Commission Info */}
    <div style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 }}>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>Bank Commission Details</Text>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: THEME_COLOR }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>Rate</Text>
              <div><Text strong>{commissionPreview.bankCommission?.ratePercentage}</Text></div>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarOutlined style={{ color: SUCCESS_COLOR }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>Xoto Receives</Text>
              <div><Text strong style={{ color: SUCCESS_COLOR }}>{formatCurrency(commissionPreview.bankCommission?.calculatedAmount)}</Text></div>
            </div>
          </div>
        </Col>
      </Row>
    </div>

    {/* Recipient Info */}
    <div style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 }}>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>Recipient Details</Text>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: THEME_COLOR }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>Recipient</Text>
              <div><Text strong>{commissionPreview.recipient?.name}</Text></div>
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PercentageOutlined style={{ color: WARNING_COLOR }} />
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>Percentage</Text>
              <div><Text strong>{commissionPreview.recipient?.percentage}%</Text></div>
            </div>
          </div>
        </Col>
      </Row>
    </div>

    {/* Commission Amount Summary */}
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 12 }}>
      <Text type="secondary">Commission Amount</Text>
      <div style={{ fontSize: 32, fontWeight: 700, color: SUCCESS_COLOR }}>
        {formatCurrency(commissionPreview.recipient?.commissionAmount)}
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>{commissionPreview.recipient?.formula}</Text>
    </div>

    {/* Xoto Profit Summary */}
    <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Gross Commission</Text>
            <div><Text strong>{formatCurrency(commissionPreview.xoto?.grossCommission)}</Text></div>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Xoto Net Profit</Text>
            <div><Text strong style={{ color: SUCCESS_COLOR }}>{formatCurrency(commissionPreview.xoto?.netProfit)}</Text></div>
            <Tag color={commissionPreview.xoto?.profitMargin === '100%' ? 'green' : 'blue'} style={{ marginTop: 4 }}>
              Margin: {commissionPreview.xoto?.profitMargin}
            </Tag>
          </div>
        </Col>
      </Row>
    </div>

    <div style={{ marginTop: 16, textAlign: 'center' }}>
      <Text type="secondary" style={{ fontSize: 11 }}>
        <InfoCircleOutlined /> This is a preview only. No commission has been created.
      </Text>
    </div>
  </div>
)}

          {!commissionPreview && !previewLoading && (
            <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 12 }}>
              <EyeOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Enter bank commission details and click "Calculate Preview"</Text>
              </div>
            </div>
          )}

          {previewLoading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
              <div style={{ marginTop: 12 }}>Calculating commission preview...</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  const totalPages = Math.ceil(totalCases / itemsPerPage);
  const filteredCases = cases;

  return (
    <div style={{ padding: '28px 32px', background: '#fdfbff', minHeight: '100vh' }}>
      {toastMsg && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", alignItems: "center", gap: 8, background: toastMsg.type === "success" ? "#059669" : "#DC2626", color: "#fff", padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
          {toastMsg.type === "success" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}{toastMsg.message}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Case Management</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>Manage mortgage cases, track progress, and preview commissions for disbursed cases</Text>
      </div>

      {renderStats()}
      {renderStatusTabs()}

      {/* Filter Bar */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", marginBottom: 24, border: `1px solid ${THEME_COLOR}20`, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: 1 }}>
          <Input placeholder="Search by case ID or client name..." value={search} onChange={handleSearchChange} style={{ width: 280 }} allowClear prefix={<SearchOutlined />} />
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchCases} loading={loading}>Refresh</Button>
      </div>

      {/* Cases Grid - Card View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}><Spin size="large" /><div style={{ marginTop: 16 }}>Loading cases...</div></div>
      ) : filteredCases.length === 0 ? (
        <Empty description={<span>No cases found for <strong>{activeStatus === 'all' ? 'any' : activeStatus}</strong> status</span>} style={{ padding: '60px 0' }} />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {filteredCases.map(caseItem => (
              <Col xs={24} sm={24} md={12} lg={12} xl={12} key={caseItem._id}>
                {renderCaseCard(caseItem)}
              </Col>
            ))}
          </Row>
          {totalPages > 1 && (
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
              <Space>
                <Button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</Button>
              </Space>
            </div>
          )}
        </>
      )}

      {/* Preview Modal (Only Preview - No Creation) */}
      {renderPreviewModal()}
    </div>
  );
};

// Statistic Component
const StatisticComp = ({ title, value, prefix, valueStyle }) => (
  <div>
    <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
    <div style={{ fontSize: 28, fontWeight: 700, ...valueStyle, marginTop: 4 }}>{prefix && <span style={{ marginRight: 6 }}>{prefix}</span>}{value}</div>
  </div>
);

export default AdminManagecases;