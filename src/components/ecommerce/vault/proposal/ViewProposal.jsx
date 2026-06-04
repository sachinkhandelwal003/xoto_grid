import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Tabs, Button, Typography, Row, Col, Avatar, 
  Tag, Descriptions, Divider, Spin, message, Modal, Badge, 
  Pagination, Space, Input, Tooltip, Progress, Table, Statistic
} from 'antd';
import {
  UserOutlined, BankOutlined, FileTextOutlined, 
  CalendarOutlined, EyeOutlined, HomeOutlined, DollarCircleOutlined,
  MailOutlined, LinkOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, PercentageOutlined, WalletOutlined, 
  SafetyCertificateOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const THEME_COLOR = "#5C039B";

const STATUS_TABS = ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'];

const ViewProposal = () => {
  // --- STATE ---
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Draft');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewingProposal, setViewingProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [sendingProposal, setSendingProposal] = useState(null);
  const [clientEmail, setClientEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // --- API CALLS ---
  const fetchProposals = useCallback(async (page, status) => {
    setLoading(true);
    try {
      const res = await apiService.get(`/vault/lead/proposals/my-proposals?page=${page}&limit=10&status=${status}`);
      if (res?.success) {
        setProposals(res.data || []);
        setTotalItems(res.pagination?.total || 0);
      }
    } catch (err) {
      message.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals(currentPage, activeTab);
  }, [currentPage, activeTab, fetchProposals]);

  // --- HANDLERS ---
  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openProposalDetails = (proposal) => {
    setViewingProposal(proposal);
    setIsModalOpen(true);
  };

  const openSendModal = (proposal) => {
    setSendingProposal(proposal);
    setClientEmail(proposal.leadId?.customerInfo?.email || '');
    setIsSendModalOpen(true);
  };

  const handleSendProposal = async () => {
    if (!clientEmail) {
      message.error('Please enter client email address');
      return;
    }
    if (!clientEmail.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/)) {
      message.error('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await apiService.post(`/vault/lead/proposals/${sendingProposal._id}/send`, {
        clientEmail: clientEmail
      });
      if (response?.success) {
        message.success('Proposal sent successfully to client!');
        setIsSendModalOpen(false);
        fetchProposals(currentPage, activeTab);
      } else {
        message.error(response?.message || 'Failed to send proposal');
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to send proposal');
    } finally {
      setSendingEmail(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    message.success(`${type} copied to clipboard!`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'default',
      'Sent': 'processing',
      'Viewed': 'warning',
      'Accepted': 'success',
      'Rejected': 'error',
      'Expired': 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Draft': <FileTextOutlined />,
      'Sent': <MailOutlined />,
      'Viewed': <EyeOutlined />,
      'Accepted': <CheckCircleOutlined />,
      'Rejected': <CloseCircleOutlined />,
      'Expired': <ClockCircleOutlined />
    };
    return icons[status] || <FileTextOutlined />;
  };

  // Format number with commas
  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return `AED ${value.toLocaleString()}`;
  };

  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontWeight: 800 }}>Manage Proposals</Title>
        <Text type="secondary">View, track, and manage all client mortgage proposals.</Text>
      </div>

      {/* Tabs */}
      <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 24 }} bodyStyle={{ padding: '16px 24px' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange} 
          tabBarGutter={32}
          items={STATUS_TABS.map(status => ({
            label: <span style={{ fontSize: 16, fontWeight: activeTab === status ? 600 : 400 }}>{status}</span>,
            key: status
          }))}
        />
      </Card>

      {/* Proposal Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {proposals.map(proposal => {
              const lead = proposal.leadId;
              const customerName = lead?.customerInfo?.fullName || 'Unknown Customer';
              const bankCount = proposal.selectedBankProducts?.length || 0;
              const propValue = proposal.clientRequirements?.targetPropertyValue;
              const bestRate = proposal.bankComparison?.bestRate;
              const estimatedDbr = proposal.customerFinancialSummary?.estimatedDbr;
              
              return (
                <Col xs={24} md={12} lg={8} key={proposal._id}>
                  <Card 
                    hoverable
                    style={{ 
                      borderRadius: 16, 
                      border: '1px solid #e8e8e8',
                      borderTop: `4px solid ${THEME_COLOR}`,
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <div style={{ padding: 20 }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Avatar icon={<UserOutlined />} style={{ backgroundColor: THEME_COLOR }} size="large" />
                          <div>
                            <Text strong style={{ fontSize: 16, display: 'block' }}>{customerName}</Text>
                            <Badge status={getStatusColor(proposal.status)} text={<span style={{fontSize: 12, color: '#666'}}>{proposal.status}</span>} />
                          </div>
                        </div>
                        {proposal.status === 'Sent' && proposal.fullSecureLink && (
                          <Tooltip title="Copy secure link">
                            <Button size="small" icon={<LinkOutlined />} onClick={() => copyToClipboard(proposal.fullSecureLink, 'Secure link')} />
                          </Tooltip>
                        )}
                      </div>

                      {/* Key Stats */}
                      <Row gutter={16} style={{ background: '#f9f9f9', padding: '12px', borderRadius: 8, marginBottom: 16 }}>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Property Value</Text>
                          <div style={{ fontWeight: 'bold', color: '#1e1b4b' }}>{formatCurrency(propValue)}</div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" style={{ fontSize: 11 }}>Best Rate</Text>
                          <div style={{ fontWeight: 'bold', color: THEME_COLOR }}>{bestRate || 'N/A'}%</div>
                        </Col>
                      </Row>

                      {/* Banks */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Avatar.Group maxCount={3} size="small" maxStyle={{ color: THEME_COLOR, backgroundColor: '#f0e6ff' }}>
                          {proposal.selectedBankProducts?.map((product, idx) => (
                            <Avatar key={idx} src={product.bankProductId?.bankInfo?.logo} style={{ border: '1px solid #eee' }} />
                          ))}
                        </Avatar.Group>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined /> {dayjs(proposal.createdAt).format('MMM DD, YYYY')}
                        </Text>
                      </div>

                      {/* DBR Progress */}
                      {estimatedDbr && (
                        <div style={{ marginBottom: 12 }}>
                          <Progress 
                            percent={Math.min(estimatedDbr, 100)} 
                            size="small" 
                            strokeColor={estimatedDbr <= 50 ? '#10b981' : estimatedDbr <= 55 ? '#f39c12' : '#e74c3c'}
                            format={() => `${estimatedDbr}% DBR`}
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button 
                          type="primary" 
                          block 
                          icon={<EyeOutlined />}
                          style={{ background: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: 8 }}
                          onClick={() => openProposalDetails(proposal)}
                        >
                          View Details
                        </Button>
                        {proposal.status === 'Draft' && (
                          <Button block icon={<MailOutlined />} style={{ borderRadius: 8 }} onClick={() => openSendModal(proposal)}>
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {proposals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              <FileTextOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
              <br/>
              <Text type="secondary">No proposals found for status: <b>{activeTab}</b></Text>
            </div>
          )}

          {totalItems > 0 && (
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination current={currentPage} total={totalItems} pageSize={10} onChange={handlePageChange} showSizeChanger={false} />
            </div>
          )}
        </>
      )}

      {/* Send Proposal Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MailOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
            <div>
              <div style={{ fontSize: 20, color: '#1e1b4b', fontWeight: 800 }}>Send Proposal to Client</div>
              <div style={{ fontSize: 13, color: '#666' }}>Proposal: {sendingProposal?._id?.slice(-8)}</div>
            </div>
          </div>
        }
        open={isSendModalOpen}
        onCancel={() => setIsSendModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsSendModalOpen(false)}>Cancel</Button>,
          <Button key="send" type="primary" loading={sendingEmail} onClick={handleSendProposal} style={{ background: THEME_COLOR }}>
            Send Proposal
          </Button>
        ]}
        width={600}
        centered
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 24 }}>
            <Text strong>Client Information:</Text>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8 }}>
              <div><Text type="secondary">Name:</Text> <Text strong>{sendingProposal?.leadId?.customerInfo?.fullName}</Text></div>
              <div><Text type="secondary">Phone:</Text> {sendingProposal?.leadId?.customerInfo?.mobileNumber}</div>
            </div>
          </div>
          <div>
            <Text strong>Client Email Address:</Text>
            <Input
              placeholder="client@example.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              style={{ marginTop: 8, borderRadius: 8 }}
              prefix={<MailOutlined style={{ color: '#999' }} />}
            />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              The client will receive a secure link to view and accept this proposal.
            </Text>
          </div>
        </div>
      </Modal>

      {/* Full Proposal Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 8 }}>
            <FileTextOutlined style={{ color: THEME_COLOR, fontSize: 24 }} />
            <div>
              <div style={{ fontSize: 20, color: '#1e1b4b', fontWeight: 800 }}>Proposal Details</div>
              <div style={{ fontSize: 13, color: '#666' }}>Ref: {viewingProposal?._id?.slice(-12)}</div>
            </div>
            <Tag color={getStatusColor(viewingProposal?.status)} style={{ marginLeft: 'auto', fontSize: 14, padding: '4px 12px', borderRadius: 20 }}>
              {viewingProposal?.status}
            </Tag>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>Close</Button>,
          viewingProposal?.status === 'Draft' && (
            <Button key="send" type="primary" icon={<MailOutlined />} onClick={() => {
              setIsModalOpen(false);
              openSendModal(viewingProposal);
            }} style={{ background: THEME_COLOR }}>
              Send to Client
            </Button>
          ),
          viewingProposal?.fullSecureLink && viewingProposal?.status === 'Sent' && (
            <Button key="copy" icon={<LinkOutlined />} onClick={() => copyToClipboard(viewingProposal.fullSecureLink, 'Secure link')}>
              Copy Secure Link
            </Button>
          )
        ]}
        width={1200}
        centered
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: '24px' }}
      >
        {viewingProposal && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Client & Property Summary */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title={<span><UserOutlined style={{color: THEME_COLOR}}/> Client Profile</span>} size="small" style={{ borderRadius: 12 }}>
                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Full Name"><Text strong>{viewingProposal.leadId?.customerInfo?.fullName}</Text></Descriptions.Item>
                    <Descriptions.Item label="Email">{viewingProposal.leadId?.customerInfo?.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{viewingProposal.leadId?.customerInfo?.mobileNumber}</Descriptions.Item>
                    <Descriptions.Item label="Nationality">{viewingProposal.leadId?.customerInfo?.nationality}</Descriptions.Item>
                    <Descriptions.Item label="Monthly Salary">
                      <Text strong style={{ color: '#10b981', fontSize: 16 }}>
                        AED {viewingProposal.leadId?.customerInfo?.monthlySalary?.toLocaleString()}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Employment">{viewingProposal.leadId?.customerInfo?.occupation} at {viewingProposal.leadId?.customerInfo?.employer}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title={<span><HomeOutlined style={{color: THEME_COLOR}}/> Loan Requirements</span>} size="small" style={{ borderRadius: 12 }}>
                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Property Value">{formatCurrency(viewingProposal.clientRequirements?.targetPropertyValue)}</Descriptions.Item>
                    <Descriptions.Item label="Loan Amount">{formatCurrency(viewingProposal.customerFinancialSummary?.estimatedLoanAmount)}</Descriptions.Item>
                    <Descriptions.Item label="LTV Ratio">{viewingProposal.customerFinancialSummary?.estimatedLtv}%</Descriptions.Item>
                    <Descriptions.Item label="Preferred Tenure">{viewingProposal.clientRequirements?.preferredLoanTenureYears} Years</Descriptions.Item>
                    <Descriptions.Item label="Property Type">{viewingProposal.clientRequirements?.propertyType}</Descriptions.Item>
                    <Descriptions.Item label="DBR Status">
                      <Tag color={viewingProposal.customerFinancialSummary?.eligibilityStatus === 'Eligible' ? 'green' : 'orange'}>
                        {viewingProposal.customerFinancialSummary?.eligibilityStatus}
                      </Tag>
                      {viewingProposal.customerFinancialSummary?.estimatedDbr}%
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Bank Comparison Summary */}
            {viewingProposal.bankComparison && (
              <Card title={<span><ThunderboltOutlined style={{color: THEME_COLOR}}/> Bank Comparison Summary</span>} size="small" style={{ borderRadius: 12 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic 
                      title="Best Interest Rate" 
                      value={viewingProposal.bankComparison.bestRate} 
                      suffix="%" 
                      valueStyle={{ color: THEME_COLOR }}
                      prefix={<PercentageOutlined />}
                    />
                    <Text type="secondary">from {viewingProposal.bankComparison.bestRateBank}</Text>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic 
                      title="Lowest EMI" 
                      value={viewingProposal.bankComparison.lowestEmi} 
                      prefix="AED" 
                      valueStyle={{ color: '#10b981' }}
                    />
                    <Text type="secondary">from {viewingProposal.bankComparison.lowestEmiBank}</Text>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Statistic 
                      title="Lowest Upfront Cost" 
                      value={viewingProposal.bankComparison.lowestUpfront} 
                      prefix="AED" 
                      valueStyle={{ color: '#f39c12' }}
                    />
                    <Text type="secondary">from {viewingProposal.bankComparison.lowestUpfrontBank}</Text>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Tag color="gold" style={{ fontSize: 14, padding: '8px 16px' }}>
                      ⭐ Recommended: {viewingProposal.bankComparison.recommendedBank}
                    </Tag>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Cover Note */}
            <Card title="Cover Note" size="small" style={{ borderRadius: 12 }}>
              <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '16px', borderRadius: 8, fontFamily: 'monospace' }}>
                {viewingProposal.coverNote || 'No cover note provided.'}
              </div>
            </Card>

            {/* Bank Products Details */}
            <div>
              <Title level={5} style={{ color: THEME_COLOR, marginBottom: 16 }}>Selected Bank Products ({viewingProposal.selectedBankProducts?.length})</Title>
              <Row gutter={[24, 24]}>
                {viewingProposal.selectedBankProducts?.map((item, idx) => {
                  const product = item.bankProductId;
                  if (!product) return null;
                  
                  return (
                    <Col xs={24} lg={12} key={idx}>
                      <Card 
                        size="small" 
                        style={{ 
                          borderRadius: 12, 
                          border: `1px solid ${THEME_COLOR}30`,
                          background: '#fff'
                        }}
                        bodyStyle={{ padding: 20 }}
                      >
                        {/* Bank Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                          <Avatar src={product.bankInfo?.logo} size={56} shape="square" style={{ border: '1px solid #eee', borderRadius: 8 }} />
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: 18, display: 'block' }}>{product.offerSummary?.title}</Text>
                            <Text type="secondary">{product.bankInfo?.bankName} • {product.offerSummary?.productType} • {product.bankInfo?.rating}★</Text>
                          </div>
                          {product.isPopular && <Tag color="gold" style={{ borderRadius: 20 }}>🔥 Popular</Tag>}
                        </div>

                        {/* Key Financials */}
                        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                          <Col span={8} style={{ textAlign: 'center' }}>
                            <div style={{ background: '#f8f5ff', padding: '12px', borderRadius: 8 }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>Interest Rate</Text>
                              <div style={{ fontSize: 22, fontWeight: 'bold', color: THEME_COLOR }}>{item.snapshotRate}%</div>
                              <Text type="secondary" style={{ fontSize: 10 }}>Fixed for {product.offerSummary?.fixedYears || 3} years</Text>
                            </div>
                          </Col>
                          <Col span={8} style={{ textAlign: 'center' }}>
                            <div style={{ background: '#f8f5ff', padding: '12px', borderRadius: 8 }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>Monthly EMI</Text>
                              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981' }}>AED {item.snapshotEmi?.toLocaleString()}</div>
                              <Text type="secondary" style={{ fontSize: 10 }}>25 years tenure</Text>
                            </div>
                          </Col>
                          <Col span={8} style={{ textAlign: 'center' }}>
                            <div style={{ background: '#f8f5ff', padding: '12px', borderRadius: 8 }}>
                              <Text type="secondary" style={{ fontSize: 11 }}>DBR</Text>
                              <div style={{ fontSize: 18, fontWeight: 'bold', color: item.snapshotDbr <= 50 ? '#10b981' : '#e74c3c' }}>{item.snapshotDbr}%</div>
                              <Text type="secondary" style={{ fontSize: 10 }}>of monthly income</Text>
                            </div>
                          </Col>
                        </Row>

                        {/* Loan Details */}
                        <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
                          <Descriptions.Item label="Max LTV">{item.snapshotMaxLtv}%</Descriptions.Item>
                          <Descriptions.Item label="Loan Amount">AED {item.snapshotLoanAmount?.toLocaleString()}</Descriptions.Item>
                          <Descriptions.Item label="Processing Fee">{item.snapshotProcessingFee > 0 ? `AED ${item.snapshotProcessingFee}` : 'FREE'}</Descriptions.Item>
                          <Descriptions.Item label="Valuation Fee">AED {item.snapshotValuationFee}</Descriptions.Item>
                          <Descriptions.Item label="LTV Ratio">{item.snapshotLtv}%</Descriptions.Item>
                          <Descriptions.Item label="Tenure">{item.snapshotTenureYears} Years</Descriptions.Item>
                        </Descriptions>

                        {/* Features */}
                        <div>
                          <Text strong style={{ fontSize: 12 }}>Key Features:</Text>
                          <div style={{ marginTop: 8 }}>
                            {(item.snapshotFeatures?.length > 0 ? item.snapshotFeatures : product.features?.keyFeatures || []).map((feat, i) => (
                              <Tag key={i} style={{ marginBottom: 4, borderRadius: 16, background: '#f0e6ff', border: 'none', color: THEME_COLOR }}>
                                <CheckCircleOutlined style={{ marginRight: 4 }} /> {feat}
                              </Tag>
                            ))}
                          </div>
                        </div>

                        {/* EMI Calculation Table */}
                        <Divider style={{ margin: '16px 0' }} />
                        <div>
                          <Text strong style={{ fontSize: 12 }}>EMI Breakdown for AED {item.snapshotLoanAmount?.toLocaleString()}:</Text>
                          <div style={{ marginTop: 8, background: '#f9f9f9', padding: '12px', borderRadius: 8 }}>
                            <Row>
                              <Col span={6}><Text type="secondary">Principal + Interest:</Text></Col>
                              <Col span={6}><Text strong>AED {item.snapshotEmi?.toLocaleString()}</Text></Col>
                              <Col span={6}><Text type="secondary">Total Monthly:</Text></Col>
                              <Col span={6}><Text strong style={{ color: THEME_COLOR }}>AED {item.snapshotMonthlyPayment?.toLocaleString()}</Text></Col>
                            </Row>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>

            {/* Tracking Info */}
            {(viewingProposal.status === 'Sent' || viewingProposal.status === 'Viewed' || viewingProposal.status === 'Accepted') && (
              <Card title="Tracking Information" size="small" style={{ borderRadius: 12 }}>
                <Descriptions bordered size="small" column={2}>
                  <Descriptions.Item label="Sent To">{viewingProposal.sentTo}</Descriptions.Item>
                  <Descriptions.Item label="Sent At">{dayjs(viewingProposal.sentAt).format('MMM DD, YYYY hh:mm A')}</Descriptions.Item>
                  {viewingProposal.viewedAt && <Descriptions.Item label="Viewed At">{dayjs(viewingProposal.viewedAt).format('MMM DD, YYYY hh:mm A')}</Descriptions.Item>}
                  {viewingProposal.acceptedAt && <Descriptions.Item label="Accepted At">{dayjs(viewingProposal.acceptedAt).format('MMM DD, YYYY hh:mm A')}</Descriptions.Item>}
                  <Descriptions.Item label="Expires At">{dayjs(viewingProposal.expiresAt).format('MMM DD, YYYY hh:mm A')}</Descriptions.Item>
                  {viewingProposal.fullSecureLink && (
                    <Descriptions.Item label="Secure Link" span={2}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 12, wordBreak: 'break-all' }}>{viewingProposal.fullSecureLink}</Text>
                        <Button size="small" icon={<LinkOutlined />} onClick={() => copyToClipboard(viewingProposal.fullSecureLink, 'Secure link')} />
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ViewProposal;