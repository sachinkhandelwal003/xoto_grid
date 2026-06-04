import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Tabs, Button, Typography, Row, Col, Avatar, 
  Tag, Descriptions, Divider, Spin, message, Badge, 
  Pagination, Space, Progress, Statistic, Modal, Tooltip, Alert
} from 'antd';
import {
  UserOutlined, BankOutlined, FileTextOutlined, 
  CalendarOutlined, EyeOutlined, HomeOutlined, 
  DollarCircleOutlined, MailOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, RocketOutlined,
  SendOutlined, TrophyOutlined, TeamOutlined, InfoCircleOutlined,
  StarOutlined, FireOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const THEME_COLOR = "#5C039B";
const SUCCESS_COLOR = "#10b981";

// Case statuses for tabs
const CASE_STATUSES = ['Draft'];

// Role slug mapping for navigation
const roleSlugMap = {
  '0': 'superadmin',
  '1': 'admin',
  '2': "customer",
  '5': 'vendor-b2c',
  '6': 'vendor-b2b',
  '7': 'freelancer',
  '11': 'accountant',
  '12': 'supervisor',
  '15': "agency",        // Agency
  '16': "agent",         // Agent
  '17': "developer",
  '18': "vault-admin", //vault
  '22': "vaultagent",
  '21': "vaultpartner",
  '24': "GridAdvisor",
  '23': "vault-advisor",
  // '26': "vault-ops",
  // '26': "vault-advisor",
  // '23': "vault-ops",
  '25': "gridreferralpartner",
  '26': "vault-advisor",
  // '23': "vault-ops",
  
   
 


};

const ViewCases = () => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  // --- STATE ---
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination & Filtering
  const [activeTab, setActiveTab] = useState('Draft');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Submit Modal State
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedCaseForSubmit, setSelectedCaseForSubmit] = useState(null);
  const [submitSuccessModal, setSubmitSuccessModal] = useState(false);
  const [submittedCaseName, setSubmittedCaseName] = useState('');
  const [celebration, setCelebration] = useState(false);

  // --- API CALLS ---
  const fetchCases = useCallback(async (page, status) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/vault/cases?page=${page}&limit=10&status=${status}`);
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

  // Submit case to Xoto
  const submitCaseToXoto = async () => {
    if (!selectedCaseForSubmit) return;
    
    setSubmitting(true);
    try {
      const response = await apiService.post(`/vault/cases/${selectedCaseForSubmit._id}/submit`);
      
      if (response?.success) {
        // Show celebration animation
        setCelebration(true);
        setTimeout(() => setCelebration(false), 3000);
        
        setSubmittedCaseName(selectedCaseForSubmit.clientInfo?.fullName || selectedCaseForSubmit.caseReference);
        setSubmitModalVisible(false);
        setSubmitSuccessModal(true);
        
        // Refresh the cases list
        fetchCases(currentPage, activeTab);
        
        message.success({
          content: "Case submitted to Xoto team successfully!",
          duration: 3,
          icon: <CheckCircleOutlined />
        });
      } else {
        message.error(response?.message || "Failed to submit case");
      }
    } catch (err) {
      console.error("Submit error:", err);
      message.error(err.response?.data?.message || "Error submitting case");
    } finally {
      setSubmitting(false);
      setSelectedCaseForSubmit(null);
    }
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    fetchCases(currentPage, activeTab);
  }, [currentPage, activeTab, fetchCases]);

  // --- HANDLERS ---
  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const navigateToCaseDetail = (caseItem) => {
    navigate(`/dashboard/${roleSlug}/case/view/${caseItem._id}`);
  };

  const openSubmitModal = (caseItem, e) => {
    e.stopPropagation();
    setSelectedCaseForSubmit(caseItem);
    setSubmitModalVisible(true);
  };

  // --- STATUS COLOR MAP ---
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

  const getDocumentProgress = (documentStatus) => {
    const total = documentStatus?.requiredDocuments?.length || 10;
    const uploaded = documentStatus?.documentsUploadedCount || 0;
    const percentage = total > 0 ? (uploaded / total) * 100 : 0;
    return { total, uploaded, percentage };
  };

  const isReadyForSubmission = (caseItem) => {
    const docProgress = getDocumentProgress(caseItem.documentStatus);
    return docProgress.uploaded === docProgress.total && docProgress.total > 0;
  };

  // Render Case Card
  const renderCaseCard = (caseItem) => {
    const clientName = caseItem.clientInfo?.fullName || 'Unknown Client';
    const propertyValue = caseItem.propertyInfo?.propertyValue || 0;
    const loanAmount = caseItem.propertyInfo?.loanAmount || caseItem.loanInfo?.requestedAmount || 0;
    const bankName = caseItem.loanInfo?.selectedBank || 'Not Selected';
    const docProgress = getDocumentProgress(caseItem.documentStatus);
    const createdBy = caseItem.createdBy?.role === 'admin' ? 'Admin' : caseItem.createdBy?.partnerName || 'Partner';
    const isReady = isReadyForSubmission(caseItem);
    const isDraft = caseItem.currentStatus === 'Draft';
    
    return (
      <Card 
        hoverable
        style={{ 
          borderRadius: 16, 
          border: '1px solid #e8e8e8',
          borderTop: `4px solid ${THEME_COLOR}`,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          cursor: 'pointer'
        }}
        bodyStyle={{ padding: 0 }}
        onClick={() => navigateToCaseDetail(caseItem)}
      >
        <div style={{ padding: 20 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: THEME_COLOR }} size="large" />
              <div>
                <Text strong style={{ fontSize: 16, display: 'block' }}>{clientName}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>Case: {caseItem.caseReference}</Text>
              </div>
            </div>
            <Badge 
              status={getStatusColor(caseItem.currentStatus)} 
              text={<span style={{ fontSize: 11 }}>{caseItem.currentStatus}</span>} 
            />
          </div>

          {/* Key Metrics */}
          <Row gutter={12} style={{ background: '#f9f9f9', padding: '12px', borderRadius: 8, marginBottom: 16 }}>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Property Value</Text>
              <div style={{ fontWeight: 'bold', color: '#1e1b4b' }}>
                AED {propertyValue.toLocaleString()}
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 11 }}>Loan Amount</Text>
              <div style={{ fontWeight: 'bold', color: THEME_COLOR }}>
                AED {loanAmount.toLocaleString()}
              </div>
            </Col>
          </Row>

          {/* Bank Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BankOutlined style={{ color: THEME_COLOR }} />
            <Text strong style={{ fontSize: 13 }}>{bankName}</Text>
            {caseItem.loanInfo?.interestRatePercentage && (
              <Tag color="purple" style={{ marginLeft: 'auto' }}>
                {caseItem.loanInfo.interestRatePercentage}%
              </Tag>
            )}
          </div>

          {/* Document Progress */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Documents</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{docProgress.uploaded}/{docProgress.total}</Text>
            </div>
            <Progress 
              percent={docProgress.percentage} 
              size="small" 
              strokeColor={docProgress.percentage === 100 ? SUCCESS_COLOR : THEME_COLOR}
              showInfo={false}
            />
            {docProgress.percentage === 100 && (
              <Tag color="success" style={{ marginTop: 6, fontSize: 10 }}>
                <CheckCircleOutlined /> All documents uploaded
              </Tag>
            )}
          </div>

          {/* Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#888', marginBottom: 16 }}>
            <span><CalendarOutlined /> {dayjs(caseItem.createdAt).format('MMM DD, YYYY')}</span>
            <span><UserOutlined /> {createdBy}</span>
          </div>

          {/* Submit Button - Only for Draft cases */}
          {isDraft && (
            <Tooltip title={isReady ? "Submit to Xoto Team" : `Please upload ${docProgress.total - docProgress.uploaded} more document(s) before submitting`}>
              <Button 
                type="primary"
                block
                icon={<SendOutlined />}
                onClick={(e) => openSubmitModal(caseItem, e)}
                disabled={!isReady}
                style={{ 
                  background: isReady ? SUCCESS_COLOR : '#d1d5db',
                  borderColor: isReady ? SUCCESS_COLOR : '#d1d5db',
                  borderRadius: 8,
                  marginTop: 8
                }}
              >
                {isReady ? 'Submit to Xoto' : `${docProgress.uploaded}/${docProgress.total} Documents Required`}
              </Button>
            </Tooltip>
          )}
        </div>
      </Card>
    );
  };

  // Submit Confirmation Modal
  const renderSubmitModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SendOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>Submit Case to Xoto</span>
        </div>
      }
      open={submitModalVisible}
      onCancel={() => { setSubmitModalVisible(false); setSelectedCaseForSubmit(null); }}
      footer={[
        <Button key="cancel" onClick={() => { setSubmitModalVisible(false); setSelectedCaseForSubmit(null); }} style={{ borderRadius: 8 }}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={submitCaseToXoto}
          loading={submitting}
          style={{ background: SUCCESS_COLOR, borderColor: SUCCESS_COLOR, borderRadius: 8 }}
          icon={<RocketOutlined />}
        >
          Yes, Submit Case
        </Button>
      ]}
      width={550}
      centered
    >
      {selectedCaseForSubmit && (
        <div style={{ padding: '8px 0' }}>
          <Alert
            message="Confirm Submission"
            description={`Are you sure you want to submit "${selectedCaseForSubmit.clientInfo?.fullName || selectedCaseForSubmit.caseReference}" to the Xoto team for further processing?`}
            type="warning"
            showIcon
            style={{ borderRadius: 12, marginBottom: 20 }}
          />
          
          <div style={{ background: '#f8f5ff', padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text strong>Case Reference:</Text>
              <Text>{selectedCaseForSubmit.caseReference}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text strong>Client Name:</Text>
              <Text>{selectedCaseForSubmit.clientInfo?.fullName}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text strong>Loan Amount:</Text>
              <Text strong style={{ color: THEME_COLOR }}>AED {selectedCaseForSubmit.propertyInfo?.loanAmount?.toLocaleString()}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Documents:</Text>
              <Tag color="success">
                {selectedCaseForSubmit.documentStatus?.documentsUploadedCount || 0}/{selectedCaseForSubmit.documentStatus?.requiredDocuments?.length || 10} Uploaded
              </Tag>
            </div>
          </div>
          
          <Text type="secondary" style={{ fontSize: 12 }}>
            <InfoCircleOutlined /> Once submitted, the Xoto team will review your case and contact you for further processing.
          </Text>
        </div>
      )}
    </Modal>
  );

  // Success Modal with Celebration Animation
  const renderSuccessModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TrophyOutlined style={{ color: SUCCESS_COLOR, fontSize: 28 }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: SUCCESS_COLOR }}>Congratulations!</span>
        </div>
      }
      open={submitSuccessModal}
      onCancel={() => setSubmitSuccessModal(false)}
      footer={[
        <Button 
          key="ok" 
          type="primary" 
          onClick={() => setSubmitSuccessModal(false)}
          style={{ background: SUCCESS_COLOR, borderColor: SUCCESS_COLOR, borderRadius: 8 }}
        >
          Great! Thanks
        </Button>
      ]}
      width={550}
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {/* Celebration Animation */}
        {celebration && (
          <div className="celebration-animation">
            <div className="star star1">⭐</div>
            <div className="star star2">🎉</div>
            <div className="star star3">✨</div>
            <div className="star star4">🌟</div>
            <div className="star star5">🎊</div>
          </div>
        )}
        
        <div style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 40, 
          background: '#ecfdf5', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px',
          animation: celebration ? 'bounce 0.5s ease' : 'none'
        }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: SUCCESS_COLOR }} />
        </div>
        
        <Title level={4} style={{ color: '#1e1b4b', marginBottom: 12 }}>
          Case Successfully Submitted! 🎉
        </Title>
        
        <Text style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
          Your case <strong>{submittedCaseName}</strong> has been submitted to the Xoto team.
        </Text>
        
        <div style={{ background: '#f8f5ff', padding: 16, borderRadius: 12, margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <TeamOutlined style={{ fontSize: 24, color: THEME_COLOR }} />
            <div>
              <Text strong>What happens next?</Text>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                Our team will review your case and contact you within 24-48 hours with updates.
              </div>
            </div>
          </div>
        </div>
        
        <Text type="secondary" style={{ fontSize: 12 }}>
          You can track the status of your case from the "Submitted to Xoto" tab.
        </Text>
      </div>
      
      <style jsx>{`
        .celebration-animation {
          position: relative;
          height: 100px;
          margin-bottom: 20px;
        }
        .star {
          position: absolute;
          font-size: 24px;
          animation: float 1s ease-out forwards;
        }
        .star1 { top: 0; left: 10%; animation-delay: 0s; }
        .star2 { top: 20%; left: 30%; animation-delay: 0.2s; }
        .star3 { top: 10%; left: 50%; animation-delay: 0.4s; }
        .star4 { top: 30%; left: 70%; animation-delay: 0.1s; }
        .star5 { top: 5%; left: 85%; animation-delay: 0.3s; }
        
        @keyframes float {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          20% {
            transform: translateY(-20px) scale(1);
            opacity: 1;
          }
          80% {
            transform: translateY(-60px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0.5);
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </Modal>
  );

  // Main Render
  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      
      {/* Header Area */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Manage Cases</Title>
        <Text type="secondary">Track and manage all mortgage cases from creation to disbursement.</Text>
      </div>

     
      {/* Cases Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {cases.map(caseItem => (
              <Col xs={24} md={12} lg={8} key={caseItem._id}>
                {renderCaseCard(caseItem)}
              </Col>
            ))}
          </Row>

          {cases.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              <FileTextOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
              <br/>
              <Text type="secondary">No cases found for status: <b>{activeTab}</b></Text>
              {activeTab === 'Draft' && (
                <div style={{ marginTop: 16 }}>
                  <Button type="link" onClick={() => navigate(`/dashboard/${roleSlug}/vault/cases/create`)}>
                    Create a new case from a proposal
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalItems > 0 && (
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination 
                current={currentPage} 
                total={totalItems} 
                pageSize={10} 
                onChange={handlePageChange} 
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {renderSubmitModal()}
      {renderSuccessModal()}
    </div>
  );
};

export default ViewCases;