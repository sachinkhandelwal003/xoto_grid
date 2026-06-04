import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Spin, Button, Descriptions, Tag, Divider,
  Row, Col, Avatar, Typography, message, Space, Result,
  Progress, Statistic, Modal, Input, Alert, Timeline
} from 'antd';
import {
  UserOutlined, BankOutlined, HomeOutlined,
  DollarCircleOutlined, CalendarOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, 
  WarningOutlined, FileTextOutlined, SafetyCertificateOutlined,
  ThunderboltOutlined, HeartOutlined, MailOutlined, PhoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const THEME_COLOR = "#5C039B";

const ProposalLink = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  useEffect(() => {
    const fetchProposal = async () => {
      if (!id || !token) {
        setError('Invalid proposal link');
        setLoading(false);
        return;
      }
      
      try {
        const response = await apiService.get(`/vault/lead/proposals/secure/${id}?token=${token}`);
        
        if (response?.success) {
          setProposal(response.data);
        } else {
          setError(response?.message || 'Failed to load proposal');
        }
      } catch (err) {
        console.error('Error fetching proposal:', err);
        setError(err.response?.data?.message || 'Invalid or expired proposal link');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposal();
  }, [id, token]);
  
  const handleAccept = async () => {
    setAccepting(true);
    try {
      const response = await apiService.post(`/vault/lead/proposals/${id}/accept?token=${token}`);
      if (response?.success) {
        message.success('Proposal accepted successfully!');
        window.location.reload();
      } else {
        message.error(response?.message || 'Failed to accept proposal');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to accept proposal');
    } finally {
      setAccepting(false);
    }
  };
  
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('Please provide a reason for rejection');
      return;
    }
    setRejecting(true);
    try {
      const response = await apiService.post(`/vault/lead/proposals/${id}/reject?token=${token}&reason=${encodeURIComponent(rejectReason)}`);
      if (response?.success) {
        message.success('Proposal rejected');
        window.location.reload();
      } else {
        message.error(response?.message || 'Failed to reject proposal');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setRejecting(false);
      setRejectModalOpen(false);
      setRejectReason('');
    }
  };
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ textAlign: 'center', borderRadius: 20, padding: 40 }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 20 }}>Loading Your Proposal...</Title>
          <Text type="secondary">Please wait while we fetch your mortgage options</Text>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="error"
          title="Unable to Load Proposal"
          subTitle={error}
          extra={
            <Button type="primary" onClick={() => window.location.reload()} style={{ background: THEME_COLOR }}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }
  
  if (!proposal) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="warning"
          title="Proposal Not Found"
          subTitle="The proposal you're looking for does not exist."
        />
      </div>
    );
  }
  
  // Check proposal status
  if (proposal.status === 'Accepted') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ textAlign: 'center', borderRadius: 20, padding: 40, maxWidth: 500 }}>
          <CheckCircleOutlined style={{ fontSize: 80, color: '#52c41a', marginBottom: 20 }} />
          <Title level={2}>Proposal Accepted!</Title>
          <Text type="secondary">Thank you for accepting the mortgage proposal.</Text>
          <Divider />
          <Text>Our team will contact you shortly to proceed with the application.</Text>
        </Card>
      </div>
    );
  }
  
  if (proposal.status === 'Rejected') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ textAlign: 'center', borderRadius: 20, padding: 40, maxWidth: 500 }}>
          <CloseCircleOutlined style={{ fontSize: 80, color: '#ff4d4f', marginBottom: 20 }} />
          <Title level={2}>Proposal Rejected</Title>
          <Text type="secondary">Reason: {proposal.rejectionReason || 'No reason provided'}</Text>
        </Card>
      </div>
    );
  }
  
  if (proposal.isExpired) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ textAlign: 'center', borderRadius: 20, padding: 40, maxWidth: 500 }}>
          <WarningOutlined style={{ fontSize: 80, color: '#faad14', marginBottom: 20 }} />
          <Title level={2}>Proposal Expired</Title>
          <Text type="secondary">This proposal expired on {dayjs(proposal.expiresAt).format('MMMM DD, YYYY')}</Text>
        </Card>
      </div>
    );
  }
  
  // Get lead data
  const lead = proposal.leadId;
  const customerInfo = lead?.customerInfo || {};
  const propertyDetails = lead?.propertyDetails || {};
  const bankProducts = proposal.selectedBankProducts || [];
  const bestRateBank = bankProducts.length > 0 ? bankProducts.reduce((a, b) => (a.snapshotRate < b.snapshotRate ? a : b)) : null;
  
  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header Hero Section */}
      <div style={{ 
        background: `linear-gradient(135deg, ${THEME_COLOR} 0%, #3a0263 100%)`,
        padding: '60px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <HeartOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', position: 'absolute', top: 20, right: 20 }} />
          <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>XOTO VAULT</Title>
          <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>Your Personalized Mortgage Proposal</Title>
          <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Tag color="gold" style={{ fontSize: 14, padding: '4px 16px' }}>Proposal ID: {proposal._id?.slice(-8)}</Tag>
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 16px' }}>Status: {proposal.status}</Tag>
            <Tag color="orange" style={{ fontSize: 14, padding: '4px 16px' }}>
              <CalendarOutlined /> Expires: {dayjs(proposal.expiresAt).format('MMM DD, YYYY')}
            </Tag>
          </div>
        </div>
      </div>
      
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {/* Best Rate Highlight */}
        {bestRateBank && (
          <Card style={{ 
            marginBottom: 32, 
            borderRadius: 20,
            background: 'linear-gradient(135deg, #fff 0%, #f8f5ff 100%)',
            border: `2px solid ${THEME_COLOR}20`
          }}>
            <Row align="middle" gutter={24}>
              <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                <Avatar src={bestRateBank.bankProductId?.bankInfo?.logo} size={80} shape="square" />
              </Col>
              <Col xs={24} md={10}>
                <Tag color={THEME_COLOR} style={{ marginBottom: 8 }}>🏆 BEST RATE</Tag>
                <Title level={3} style={{ margin: 0 }}>{bestRateBank.bankProductId?.bankInfo?.bankName}</Title>
                <Text type="secondary">{bestRateBank.bankProductId?.offerSummary?.title}</Text>
              </Col>
              <Col xs={24} md={8}>
                <Statistic 
                  title="Interest Rate" 
                  value={bestRateBank.snapshotRate} 
                  suffix="%" 
                  valueStyle={{ color: THEME_COLOR, fontSize: 32 }}
                />
                <Statistic 
                  title="Monthly EMI" 
                  value={bestRateBank.snapshotEmi} 
                  prefix="AED" 
                  valueStyle={{ fontSize: 18 }}
                />
              </Col>
            </Row>
          </Card>
        )}
        
        <Row gutter={[24, 24]}>
          {/* Client Information */}
          <Col xs={24} lg={12}>
            <Card 
              title={<span><UserOutlined style={{ color: THEME_COLOR }} /> Your Information</span>} 
              style={{ borderRadius: 16, height: '100%' }}
            >
              <Descriptions column={1} size="middle" bordered>
                <Descriptions.Item label="Full Name">
                  <Text strong>{customerInfo.fullName || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Space><MailOutlined /> {customerInfo.email || 'N/A'}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <Space><PhoneOutlined /> {customerInfo.mobileNumber || 'N/A'}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="Nationality">{customerInfo.nationality || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Monthly Salary">
                  <Text strong style={{ color: '#2e7d32', fontSize: 16 }}>
                    AED {customerInfo.monthlySalary?.toLocaleString() || 'N/A'}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          
          {/* Property Information */}
          <Col xs={24} lg={12}>
            <Card 
              title={<span><HomeOutlined style={{ color: THEME_COLOR }} /> Property Details</span>} 
              style={{ borderRadius: 16, height: '100%' }}
            >
              <Descriptions column={1} size="middle" bordered>
                <Descriptions.Item label="Property Type">{propertyDetails.propertyType || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Property Value">
                  <Text strong style={{ fontSize: 16 }}>AED {propertyDetails.propertyValue?.toLocaleString() || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Down Payment">AED {propertyDetails.downPaymentAmount?.toLocaleString() || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Loan Required">
                  <Text strong style={{ color: THEME_COLOR }}>
                    AED {((propertyDetails.propertyValue || 0) - (propertyDetails.downPaymentAmount || 0)).toLocaleString()}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {propertyDetails.propertyAddress?.area}, {propertyDetails.propertyAddress?.city}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
        
        {/* Cover Note */}
        {proposal.coverNote && (
          <Card 
            title={<span><FileTextOutlined style={{ color: THEME_COLOR }} /> Message from Your Advisor</span>} 
            style={{ marginTop: 24, borderRadius: 16, background: '#f8f5ff' }}
          >
            <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 16 }}>
              {proposal.coverNote}
            </Paragraph>
          </Card>
        )}
        
        {/* Bank Options */}
        <div style={{ marginTop: 40 }}>
          <Title level={3}>
            <BankOutlined style={{ color: THEME_COLOR, marginRight: 12 }} />
            Mortgage Options for You
          </Title>
          <Text type="secondary">Compare the following options and choose the one that best fits your needs</Text>
          
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            {bankProducts.map((product, index) => {
              const bank = product.bankProductId;
              if (!bank) return null;
              
              const isBestRate = bankProducts.length > 0 && product.snapshotRate === Math.min(...bankProducts.map(p => p.snapshotRate));
              const isLowestEmi = bankProducts.length > 0 && product.snapshotEmi === Math.min(...bankProducts.map(p => p.snapshotEmi));
              
              return (
                <Col xs={24} lg={12} xl={8} key={index}>
                  <Card 
                    hoverable 
                    style={{ 
                      borderRadius: 20, 
                      border: isBestRate ? `2px solid #ffd700` : `1px solid ${THEME_COLOR}20`,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    {isBestRate && (
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        right: -30,
                        background: '#ffd700',
                        color: '#1e1b4b',
                        padding: '4px 30px',
                        transform: 'rotate(45deg)',
                        fontSize: 12,
                        fontWeight: 'bold',
                        zIndex: 1
                      }}>
                        BEST RATE
                      </div>
                    )}
                    
                    {isLowestEmi && !isBestRate && (
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        right: -30,
                        background: '#10b981',
                        color: 'white',
                        padding: '4px 30px',
                        transform: 'rotate(45deg)',
                        fontSize: 12,
                        fontWeight: 'bold',
                        zIndex: 1
                      }}>
                        LOWEST EMI
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <Avatar 
                        src={bank.bankInfo?.logo} 
                        size={64} 
                        shape="square" 
                        style={{ border: '1px solid #eee', borderRadius: 12 }}
                      />
                      <div>
                        <Text strong style={{ fontSize: 18 }}>{bank.bankInfo?.bankName}</Text>
                        <br />
                        <Text type="secondary">{bank.offerSummary?.title}</Text>
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: `linear-gradient(135deg, ${THEME_COLOR}05 0%, ${THEME_COLOR}10 100%)`,
                      padding: '20px',
                      borderRadius: 16,
                      marginBottom: 20
                    }}>
                      <Row gutter={16}>
                        <Col span={12} style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Interest Rate</Text>
                          <div style={{ fontSize: 28, fontWeight: 'bold', color: THEME_COLOR }}>
                            {product.snapshotRate}%
                          </div>
                        </Col>
                        <Col span={12} style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Monthly EMI</Text>
                          <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                            AED {product.snapshotEmi?.toLocaleString()}
                          </div>
                        </Col>
                      </Row>
                      <Divider style={{ margin: '16px 0' }} />
                      <Row gutter={16}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Max LTV</Text>
                          <div style={{ fontSize: 16, fontWeight: 'bold' }}>{product.snapshotMaxLtv}%</div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Tenure</Text>
                          <div style={{ fontSize: 16, fontWeight: 'bold' }}>{proposal.clientRequirements?.preferredLoanTenureYears} years</div>
                        </Col>
                      </Row>
                    </div>
                    
                    {product.snapshotFeatures?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Text strong style={{ fontSize: 13 }}>Key Features:</Text>
                        <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: 12, color: '#666' }}>
                          {product.snapshotFeatures.slice(0, 3).map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                          {product.snapshotFeatures.length > 3 && (
                            <li>+ {product.snapshotFeatures.length - 3} more features</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <Divider />
                    <div style={{ textAlign: 'center' }}>
                      <Statistic 
                        title="Total Upfront Cost" 
                        value={product.snapshotTotalUpfrontCost || 0} 
                        prefix="AED" 
                        valueStyle={{ fontSize: 18, color: '#e74c3c' }}
                      />
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
        
        {/* Action Buttons */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 48, 
          padding: '32px',
          background: '#f8f5ff',
          borderRadius: 20
        }}>
          <Title level={4}>Ready to proceed with your mortgage?</Title>
          <Text type="secondary">Select one of the options above and let us help you secure your dream home</Text>
          
          <div style={{ marginTop: 32 }}>
            <Space size="large" wrap>
              <Button 
                type="primary" 
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={handleAccept}
                loading={accepting}
                style={{ 
                  background: THEME_COLOR, 
                  borderColor: THEME_COLOR, 
                  padding: '0 48px', 
                  height: 52,
                  fontSize: 16,
                  borderRadius: 12
                }}
              >
                Accept Proposal
              </Button>
              <Button 
                danger
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={() => setRejectModalOpen(true)}
                loading={rejecting}
                style={{ padding: '0 48px', height: 52, fontSize: 16, borderRadius: 12 }}
              >
                Decline Proposal
              </Button>
            </Space>
          </div>
          
          <div style={{ marginTop: 24 }}>
            <Text type="secondary">
              <CalendarOutlined /> This proposal will expire on {dayjs(proposal.expiresAt).format('MMMM DD, YYYY')}
            </Text>
          </div>
        </div>
      </div>
      
      {/* Reject Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
            <span>Decline Proposal</span>
          </div>
        }
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setRejectModalOpen(false)}>
            Go Back
          </Button>,
          <Button 
            key="reject" 
            danger
            onClick={handleReject}
            loading={rejecting}
          >
            Confirm Decline
          </Button>
        ]}
        width={500}
        centered
      >
        <div style={{ padding: '16px 0' }}>
          <Text>Please let us know why you're declining this proposal:</Text>
          <TextArea
            rows={4}
            placeholder="e.g., Found better rate elsewhere, Not ready to proceed, etc."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{ marginTop: 16, borderRadius: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProposalLink;