import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../../manageApi/utils/custom.apiservice';
import {
  Card, Steps, Button, Typography, Row, Col, Avatar,
  Tag, Descriptions, Divider, Spin, message, Modal,
  Progress, Empty, Alert, Statistic, Space, Input, Badge, Tooltip
} from 'antd';
import { useSelector } from 'react-redux';
import {
  UserOutlined, FileTextOutlined, BankOutlined,
  CheckCircleOutlined, EyeOutlined,
  LoadingOutlined, CalculatorOutlined, RocketOutlined,
  ArrowRightOutlined, StarFilled, FireOutlined,
  TrophyOutlined, DollarOutlined, SafetyOutlined,
  PlusOutlined, CloseOutlined, ArrowLeftOutlined,
  SendOutlined, InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const THEME = '#5C039B';
const THEME_LIGHT = '#f5f0ff';
const THEME_MID = '#7c3aed';
const GREEN = '#059669';
const GOLD = '#d97706';

// ─────────────────────────────────────────────
// Loader
// ─────────────────────────────────────────────
const Loader = ({ text = 'Loading...' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 40px',
    background: 'linear-gradient(135deg, #f5f0ff 0%, #faf5ff 100%)',
    borderRadius: 16, gap: 20
  }}>
    <div style={{ position: 'relative' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: `conic-gradient(${THEME} 0%, transparent 70%)`,
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{
        position: 'absolute', inset: 6, borderRadius: '50%',
        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <BankOutlined style={{ color: THEME, fontSize: 22 }} />
      </div>
    </div>
    <Text style={{ color: THEME, fontWeight: 600, fontSize: 15 }}>{text}</Text>
    <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
  </div>
);

// ─────────────────────────────────────────────
// Bank Offer Card (shown in Step 3 - Offers Screen)
// ─────────────────────────────────────────────
const OfferCard = ({ offer, index }) => {
  const isBestRate = index === 0;
  const isPopular = offer.isPopular;

  const badgeColor = isBestRate ? GOLD : isPopular ? GREEN : THEME;
  const badgeLabel = isBestRate ? '🏆 Best Rate' : isPopular ? '🔥 Popular' : null;

  return (
    <div style={{
      background: '#fff',
      border: `2px solid ${isBestRate ? GOLD : '#e5e7eb'}`,
      borderRadius: 20,
      padding: '28px 24px',
      position: 'relative',
      boxShadow: isBestRate
        ? '0 8px 32px rgba(217,119,6,0.15)'
        : '0 2px 12px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Badge */}
      {badgeLabel && (
        <div style={{
          position: 'absolute', top: -14, left: 24,
          background: badgeColor, color: '#fff',
          padding: '4px 14px', borderRadius: 20,
          fontSize: 12, fontWeight: 700, letterSpacing: 0.3
        }}>
          {badgeLabel}
        </div>
      )}

      {/* Bank Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <img
          src={offer.bankLogo}
          alt={offer.bankName}
          style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 10, border: '1px solid #f0f0f0', background: '#fafafa', padding: 4 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div>
          <Text strong style={{ fontSize: 17, display: 'block' }}>{offer.bankName}</Text>
          <Tag
            style={{
              background: offer.interestType === 'ISLAMIC' ? '#ecfdf5' : '#eff6ff',
              color: offer.interestType === 'ISLAMIC' ? '#059669' : '#2563eb',
              border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600
            }}
          >
            {offer.interestType}
          </Tag>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME, lineHeight: 1 }}>
            {offer.interestRate}%
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>Interest Rate</Text>
        </div>
      </div>

      <Divider style={{ margin: '0 0 20px' }} />

      {/* Key Numbers */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <div style={{ background: THEME_LIGHT, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
            <DollarOutlined style={{ color: THEME, fontSize: 18, marginBottom: 4, display: 'block' }} />
            <Text style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>Monthly EMI</Text>
            <Text strong style={{ fontSize: 14, color: '#111' }}>AED {offer.emi?.toLocaleString()}</Text>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
            <SafetyOutlined style={{ color: GREEN, fontSize: 18, marginBottom: 4, display: 'block' }} />
            <Text style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>Loan Amount</Text>
            <Text strong style={{ fontSize: 14, color: '#111' }}>AED {(offer.loanAmount / 1000).toFixed(0)}K</Text>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ background: '#fffbeb', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
            <TrophyOutlined style={{ color: GOLD, fontSize: 18, marginBottom: 4, display: 'block' }} />
            <Text style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>Tenure</Text>
            <Text strong style={{ fontSize: 14, color: '#111' }}>{offer.tenureYears} Yrs</Text>
          </div>
        </Col>
      </Row>

      {/* LTV & DBR */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>LTV Ratio</Text>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Text strong style={{ fontSize: 12 }}>{offer.ltv?.value}%</Text>
            <Tag style={{
              background: offer.ltv?.eligible ? '#ecfdf5' : '#fef2f2',
              color: offer.ltv?.eligible ? GREEN : '#dc2626',
              border: 'none', borderRadius: 4, fontSize: 10, padding: '0 6px'
            }}>
              Max {offer.ltv?.maxAllowed}%
            </Tag>
          </div>
        </div>
        <Progress
          percent={offer.ltv?.value}
          strokeColor={offer.ltv?.eligible ? GREEN : '#dc2626'}
          trailColor="#f3f4f6"
          showInfo={false}
          size="small"
          style={{ marginBottom: 10 }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>DBR Ratio</Text>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Text strong style={{ fontSize: 12 }}>{offer.dbr?.dbr}%</Text>
            <Tag style={{
              background: offer.dbr?.isEligible ? '#ecfdf5' : '#fef2f2',
              color: offer.dbr?.isEligible ? GREEN : '#dc2626',
              border: 'none', borderRadius: 4, fontSize: 10, padding: '0 6px'
            }}>
              Max {offer.dbr?.maxAllowed}%
            </Tag>
          </div>
        </div>
        <Progress
          percent={offer.dbr?.dbr}
          strokeColor={offer.dbr?.isEligible ? GREEN : '#dc2626'}
          trailColor="#f3f4f6"
          showInfo={false}
          size="small"
        />
      </div>

      {/* Upfront Costs */}
      <div style={{
        background: '#f9fafb', borderRadius: 12, padding: '14px 16px'
      }}>
        <Text style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10, display: 'block' }}>
          Upfront Costs
        </Text>
        <Row gutter={[8, 8]}>
          {[
            ['DLD Fee', offer.upfrontCosts?.dldFee],
            ['Registration', offer.upfrontCosts?.registrationFee],
            ['Valuation', offer.upfrontCosts?.valuationFee],
            ['Processing', offer.upfrontCosts?.processingFee],
          ].map(([label, val]) => (
            <Col span={12} key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>{label}</Text>
                <Text style={{ fontSize: 11, fontWeight: 600 }}>
                  {val === 0 ? <span style={{ color: GREEN }}>FREE</span> : `AED ${val?.toLocaleString()}`}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text strong style={{ fontSize: 13 }}>Total Upfront</Text>
          <Text strong style={{ fontSize: 13, color: THEME }}>AED {offer.upfrontCosts?.total?.toLocaleString()}</Text>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Bank Product Selection Card (Step 2)
// ─────────────────────────────────────────────
const BankSelectCard = ({ bank, isSelected, onToggle, disabled }) => (
  <div
    onClick={() => !disabled && onToggle(bank)}
    style={{
      background: '#fff',
      border: `2px solid ${isSelected ? THEME : '#e5e7eb'}`,
      borderRadius: 16,
      padding: '20px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s',
      position: 'relative',
      boxShadow: isSelected ? `0 4px 20px ${THEME}25` : '0 2px 8px rgba(0,0,0,0.05)',
    }}
  >
    {isSelected && (
      <div style={{
        position: 'absolute', top: 12, right: 12,
        width: 28, height: 28, borderRadius: '50%',
        background: THEME, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <CheckCircleOutlined style={{ color: '#fff', fontSize: 14 }} />
      </div>
    )}
    {bank.isPopular && !isSelected && (
      <div style={{
        position: 'absolute', top: 12, right: 12,
        background: '#fef3c7', color: GOLD,
        padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600
      }}>
        🔥 Popular
      </div>
    )}

    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <img
        src={bank.logo}
        alt={bank.bankName}
        style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10, border: '1px solid #f0f0f0', background: '#fafafa', padding: 4 }}
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div style={{ flex: 1 }}>
        <Text strong style={{ fontSize: 15, display: 'block' }}>{bank.bankName}</Text>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Tag style={{ fontSize: 11, borderRadius: 6, background: THEME_LIGHT, color: THEME, border: 'none' }}>
            {bank.interestRate}% Rate
          </Tag>
          <Tag style={{ fontSize: 11, borderRadius: 6, background: '#f0fdf4', color: GREEN, border: 'none' }}>
            {bank.interestType}
          </Tag>
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
      <div>
        <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Max LTV</Text>
        <Text strong>{bank.maxLTV || 85}%</Text>
      </div>
      <div>
        <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Min Salary</Text>
        <Text strong>AED {bank.minSalary?.toLocaleString() || 'N/A'}</Text>
      </div>
      <div>
        <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Tenure</Text>
        <Text strong>25 Yrs</Text>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const CreateProposalAdmin = () => {
  const { user } = useSelector(s => s.auth);

  // ── State ──
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 0 – Lead
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  // Step 1 – Lead docs
  const [leadDocuments, setLeadDocuments] = useState([]);
  const [viewingDoc, setViewingDoc] = useState(null);

  // Step 2 – Bank product selection
  const [bankProducts, setBankProducts] = useState([]);
  const [selectedBanks, setSelectedBanks] = useState([]); // [{bankProductId, bankName, logo, interestRate, interestType, ...}]
  const [fetchingBanks, setFetchingBanks] = useState(false);

  // Step 3 – Calculate offers
  const [offers, setOffers] = useState(null);            // full API response data
  const [calculatingOffers, setCalculatingOffers] = useState(false);

  // Step 4 – Finalize
  const [coverNote, setCoverNote] = useState('');

  // ── Fetch Leads ──
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const roleCode = user?.role?.code;
      let url = '';
      if (roleCode === '18') {
        url = '/vault/lead/admin/all?page=1&limit=50&status=Qualified';
      } else if (roleCode === '21') {
        url = '/vault/lead/partner/get?page=1&limit=50&status=Qualified';
      } else {
        url = '/vault/lead/advisor/my-leads?page=1&limit=50&status=Qualified';
      }
      const res = await apiService.get(url);
      if (res?.success) {
        setLeads((res.data || []).filter(l => l.currentStatus === 'Qualified'));
      }
    } catch {
      message.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Fetch Bank Products ──
  const fetchBankProducts = async () => {
    setFetchingBanks(true);
    try {
      const res = await apiService.get('/bank/products/get-all-bank-products?page=1&limit=50');
      if (res?.success) {
        const banks = res.data.map(b => ({
          bankProductId: b._id,
          bankName: b.bankInfo?.bankName,
          logo: b.bankInfo?.logo,
          interestRate: b.offerSummary?.initialRate,
          interestType: b.offerSummary?.productType,
          maxLTV: b.loanDetails?.maxLoanToValue,
          minSalary: b.eligibility?.minSalary,
          isPopular: b.isPopular,
          features: b.features?.keyFeatures || [],
        }));
        setBankProducts(banks);
      }
    } catch {
      message.error('Failed to fetch bank products');
    } finally {
      setFetchingBanks(false);
    }
  };

  // ── Fetch Lead Documents ──
  const fetchLeadDocuments = async leadId => {
    try {
      const res = await apiService.get(`/vault/lead/documents/${leadId}`);
      if (res?.success) setLeadDocuments(res.data || []);
    } catch {
      console.error('Failed to fetch documents');
    }
  };

  // ── Calculate Offers (POST to calculate-offer) ──
  const calculateOffers = async () => {
    if (!selectedLead || selectedBanks.length === 0) return;
    setCalculatingOffers(true);
    try {
      const payload = {
        leadId: selectedLead._id,
        bankProductIds: selectedBanks.map(b => b.bankProductId),
        tenureYears: selectedLead?.loanRequirements?.preferredTenureYears || 25,
        propertyValue: selectedLead?.propertyDetails?.propertyValue,
        downPayment: selectedLead?.propertyDetails?.downPaymentAmount || 0,
      };
      const res = await apiService.post('/vault/lead/proposals/calculate-offer', payload);
      if (res?.success) {
        setOffers(res.data);
        setCurrentStep(3); // Move to offers screen
      } else {
        message.error(res?.message || 'Failed to calculate offers');
      }
    } catch {
      message.error('Error calculating offers');
    } finally {
      setCalculatingOffers(false);
    }
  };

  // ── Submit Proposal ──
  const submitProposal = async () => {
    if (!coverNote.trim()) {
      message.warning('Cover note is required.');
      return;
    }
    setSubmitting(true);
    const payload = {
      leadId: selectedLead._id,
      selectedBankProducts: selectedBanks.map(b => ({
        bankProductId: b.bankProductId,
        snapshotRate: b.interestRate,
        snapshotFeatures: b.features || ['Competitive rates', 'Flexible terms', 'Quick approval'],
        snapshotMaxLtv: b.maxLTV || 80,
      })),
      coverNote,
    };
    try {
      const res = await apiService.post('/vault/lead/proposals', payload);
      if (res?.success) {
        message.success('Proposal created successfully!');
        // Reset everything
        setCurrentStep(0);
        setSelectedLead(null);
        setSelectedBanks([]);
        setOffers(null);
        setCoverNote('');
        setLeadDocuments([]);
        fetchLeads();
      } else {
        message.error(res?.message || 'Failed to create proposal');
      }
    } catch {
      message.error('Error submitting proposal');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auto-cover note ──
  useEffect(() => {
    if (currentStep === 4 && selectedLead && !coverNote && offers) {
      const loanAmount = (selectedLead.propertyDetails?.propertyValue || 0) - (selectedLead.propertyDetails?.downPaymentAmount || 0);
      const bestOffer = offers.offers?.[0];
      setCoverNote(
        `Dear ${selectedLead.customerInfo?.fullName},\n\nThank you for choosing Xoto VAULT for your mortgage needs.\n\nBased on your profile:\n• Property Value: AED ${selectedLead.propertyDetails?.propertyValue?.toLocaleString()}\n• Loan Amount: AED ${loanAmount?.toLocaleString()}\n• Monthly Salary: AED ${selectedLead.customerInfo?.monthlySalary?.toLocaleString()}\n\nOur best offer for you:\n• ${bestOffer?.bankName} — ${bestOffer?.interestRate}% rate, EMI AED ${bestOffer?.emi?.toLocaleString()}\n\nPlease review the attached proposal. Feel free to contact us with any questions.\n\nBest regards,\nXoto VAULT Team`
      );
    }
  }, [currentStep, selectedLead, offers]);

  // ── Lifecycle ──
  useEffect(() => {
    fetchLeads();
    fetchBankProducts();
  }, [fetchLeads]);

  useEffect(() => {
    if (currentStep === 1 && selectedLead) fetchLeadDocuments(selectedLead._id);
  }, [currentStep, selectedLead]);

  // ── Bank toggle handler ──
  const toggleBank = bank => {
    const already = selectedBanks.find(b => b.bankProductId === bank.bankProductId);
    if (already) {
      setSelectedBanks(selectedBanks.filter(b => b.bankProductId !== bank.bankProductId));
    } else {
      if (selectedBanks.length >= 3) {
        message.warning('Maximum 3 banks can be selected');
        return;
      }
      setSelectedBanks([...selectedBanks, bank]);
    }
  };

  // ─────────────────────────────────────────────
  // STEP 0 – Select Lead
  // ─────────────────────────────────────────────
  const renderStep0 = () => (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Title level={4} style={{ color: THEME, margin: 0 }}>Select a Qualified Lead</Title>
        <Text type="secondary">Choose the customer you want to create a proposal for</Text>
      </div>

      {loading ? (
        <Loader text="Fetching qualified leads..." />
      ) : leads.length === 0 ? (
        <Empty description="No qualified leads found" />
      ) : (
        <Row gutter={[16, 16]}>
          {leads.map(lead => {
            const isSelected = selectedLead?._id === lead._id;
            return (
              <Col xs={24} md={12} lg={8} key={lead._id}>
                <div
                  onClick={() => setSelectedLead(lead)}
                  style={{
                    background: '#fff',
                    border: `2px solid ${isSelected ? THEME : '#e5e7eb'}`,
                    borderRadius: 16,
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? `0 4px 20px ${THEME}20` : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: isSelected ? THEME : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <UserOutlined style={{ color: isSelected ? '#fff' : '#6b7280', fontSize: 18 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ fontSize: 15, display: 'block' }}>{lead.customerInfo?.fullName}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{lead.customerInfo?.email}</Text>
                    </div>
                    {isSelected && <CheckCircleOutlined style={{ color: THEME, fontSize: 20 }} />}
                  </div>
                  <Divider style={{ margin: '0 0 14px' }} />
                  <Row gutter={12}>
                    <Col span={12}>
                      <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Property Value</Text>
                      <Text strong style={{ fontSize: 13 }}>AED {lead.propertyDetails?.propertyValue?.toLocaleString()}</Text>
                    </Col>
                    <Col span={12}>
                      <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Monthly Salary</Text>
                      <Text strong style={{ fontSize: 13 }}>AED {lead.customerInfo?.monthlySalary?.toLocaleString()}</Text>
                    </Col>
                  </Row>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
        <Button
          type="primary" size="large" disabled={!selectedLead}
          onClick={() => setCurrentStep(1)}
          style={{ background: THEME, borderColor: THEME, borderRadius: 10, padding: '0 36px', height: 46 }}
        >
          Continue <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // STEP 1 – Lead Details
  // ─────────────────────────────────────────────
  const renderStep1 = () => {
    const loanAmount = (selectedLead?.propertyDetails?.propertyValue || 0) - (selectedLead?.propertyDetails?.downPaymentAmount || 0);
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <Title level={4} style={{ color: THEME, margin: 0 }}>Lead Details & Documents</Title>
          <Text type="secondary">Review customer information before selecting banks</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={<span><UserOutlined style={{ color: THEME, marginRight: 8 }} />Customer Information</span>}
              style={{ borderRadius: 14, marginBottom: 20 }}
            >
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Full Name">{selectedLead?.customerInfo?.fullName}</Descriptions.Item>
                <Descriptions.Item label="Nationality">{selectedLead?.customerInfo?.nationality}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedLead?.customerInfo?.email}</Descriptions.Item>
                <Descriptions.Item label="Mobile">{selectedLead?.customerInfo?.mobileNumber}</Descriptions.Item>
                <Descriptions.Item label="Occupation">{selectedLead?.customerInfo?.occupation || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Employer">{selectedLead?.customerInfo?.employer || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Monthly Salary" span={2}>
                  <Text strong style={{ color: GREEN, fontSize: 16 }}>
                    AED {selectedLead?.customerInfo?.monthlySalary?.toLocaleString()}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title={<span><BankOutlined style={{ color: THEME, marginRight: 8 }} />Property & Loan Details</span>}
              style={{ borderRadius: 14 }}
            >
              <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                {[
                  ['Property Value', `AED ${selectedLead?.propertyDetails?.propertyValue?.toLocaleString()}`],
                  ['Down Payment', `AED ${selectedLead?.propertyDetails?.downPaymentAmount?.toLocaleString() || 0}`],
                  ['Loan Amount', `AED ${loanAmount?.toLocaleString()}`],
                ].map(([label, val]) => (
                  <Col span={8} key={label}>
                    <div style={{ background: THEME_LIGHT, borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                      <Text style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>{label}</Text>
                      <Text strong style={{ fontSize: 14, color: THEME }}>{val}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Property Type">{selectedLead?.propertyDetails?.propertyType}</Descriptions.Item>
                <Descriptions.Item label="Location">{selectedLead?.propertyDetails?.propertyAddress?.area}, {selectedLead?.propertyDetails?.propertyAddress?.city}</Descriptions.Item>
                <Descriptions.Item label="Preferred Tenure">{selectedLead?.loanRequirements?.preferredTenureYears || 25} Years</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={<span><FileTextOutlined style={{ color: THEME, marginRight: 8 }} />Documents</span>}
              style={{ borderRadius: 14 }}
            >
              {leadDocuments.length === 0 ? (
                <Text type="secondary">No documents uploaded yet</Text>
              ) : (
                leadDocuments.map(doc => (
                  <div key={doc._id} style={{
                    marginBottom: 12, display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '10px 12px',
                    background: '#fafafa', borderRadius: 10
                  }}>
                    <div>
                      <Text strong style={{ textTransform: 'capitalize', fontSize: 13 }}>
                        {doc.documentType?.replace(/_/g, ' ')}
                      </Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{doc.formattedFileSize}</Text>
                    </div>
                    <Button
                      type="text" icon={<EyeOutlined />} size="small"
                      style={{ color: THEME }} onClick={() => setViewingDoc(doc)}
                    />
                  </div>
                ))
              )}
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
          <Button size="large" onClick={() => setCurrentStep(0)} style={{ borderRadius: 10, padding: '0 32px', height: 46 }}>
            <ArrowLeftOutlined /> Back
          </Button>
          <Button
            type="primary" size="large" onClick={() => setCurrentStep(2)}
            style={{ background: THEME, borderColor: THEME, borderRadius: 10, padding: '0 36px', height: 46 }}
          >
            Choose Banks <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // STEP 2 – Select Banks (up to 3)
  // ─────────────────────────────────────────────
  const renderStep2 = () => (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={4} style={{ color: THEME, margin: 0 }}>Select Banks for Proposal</Title>
          <Text type="secondary">Choose up to 3 banks to include in the offer comparison</Text>
        </div>
        <div style={{
          background: selectedBanks.length === 3 ? '#fef3c7' : THEME_LIGHT,
          color: selectedBanks.length === 3 ? GOLD : THEME,
          padding: '6px 18px', borderRadius: 20, fontWeight: 700, fontSize: 14
        }}>
          {selectedBanks.length}/3 Selected
        </div>
      </div>

      {/* Selected chips */}
      {selectedBanks.length > 0 && (
        <div style={{
          background: THEME_LIGHT, borderRadius: 14, padding: '14px 18px',
          marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center'
        }}>
          <Text strong style={{ color: THEME, marginRight: 4 }}>Selected:</Text>
          {selectedBanks.map(b => (
            <Tag
              key={b.bankProductId}
              closable
              onClose={() => toggleBank(b)}
              style={{ borderRadius: 20, padding: '4px 12px', background: '#fff', color: THEME, border: `1px solid ${THEME}`, fontSize: 13 }}
            >
              {b.bankName}
            </Tag>
          ))}
        </div>
      )}

      {fetchingBanks ? (
        <Loader text="Loading bank products..." />
      ) : bankProducts.length === 0 ? (
        <Empty description="No bank products available" />
      ) : (
        <Row gutter={[20, 20]}>
          {bankProducts.map(bank => {
            const isSelected = selectedBanks.some(b => b.bankProductId === bank.bankProductId);
            const isDisabled = !isSelected && selectedBanks.length >= 3;
            return (
              <Col xs={24} md={12} lg={8} key={bank.bankProductId}>
                <BankSelectCard
                  bank={bank}
                  isSelected={isSelected}
                  onToggle={toggleBank}
                  disabled={isDisabled}
                />
              </Col>
            );
          })}
        </Row>
      )}

      <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
        <Button size="large" onClick={() => setCurrentStep(1)} style={{ borderRadius: 10, padding: '0 32px', height: 46 }}>
          <ArrowLeftOutlined /> Back
        </Button>
        <Button
          type="primary" size="large"
          disabled={selectedBanks.length === 0}
          loading={calculatingOffers}
          onClick={calculateOffers}
          style={{
            background: selectedBanks.length > 0 ? THEME : '#d1d5db',
            borderColor: selectedBanks.length > 0 ? THEME : '#d1d5db',
            borderRadius: 10, padding: '0 36px', height: 46
          }}
        >
          {calculatingOffers ? 'Calculating Offers...' : `Calculate Offers (${selectedBanks.length})`}
          {!calculatingOffers && <CalculatorOutlined />}
        </Button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // STEP 3 – Show Calculated Offers
  // ─────────────────────────────────────────────
  const renderStep3 = () => {
    if (!offers) return <Empty description="No offers available" />;

    return (
      <div>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${THEME} 0%, ${THEME_MID} 100%)`,
          borderRadius: 18, padding: '28px 32px', marginBottom: 32, color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <TrophyOutlined style={{ fontSize: 36 }} />
            <div>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>Your Personalised Offers</Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                {offers.totalCalculated} offers calculated based on your profile
              </Text>
            </div>
          </div>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={8}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 18px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, display: 'block' }}>Best Rate</Text>
                <Text strong style={{ color: '#fff', fontSize: 24 }}>{offers.bestRate}%</Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, display: 'block' }}>{offers.bestRateBank}</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 18px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, display: 'block' }}>Lowest EMI</Text>
                <Text strong style={{ color: '#fff', fontSize: 24 }}>AED {offers.lowestEmi?.toLocaleString()}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, display: 'block' }}>per month</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 18px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, display: 'block' }}>Banks Compared</Text>
                <Text strong style={{ color: '#fff', fontSize: 24 }}>{offers.totalCalculated}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, display: 'block' }}>all eligible</Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Offers Grid */}
        <Row gutter={[24, 24]}>
          {(offers.offers || []).map((offer, i) => (
            <Col xs={24} md={12} lg={8} key={offer.bankId}>
              <OfferCard offer={offer} index={i} />
            </Col>
          ))}
        </Row>

        {/* CTA */}
        <div style={{
          marginTop: 40, padding: '28px 32px',
          background: 'linear-gradient(135deg, #f5f0ff 0%, #faf7ff 100%)',
          borderRadius: 18, textAlign: 'center',
          border: `1px solid ${THEME}20`
        }}>
          <Text style={{ fontSize: 16, color: '#374151', display: 'block', marginBottom: 8 }}>
            Ready to proceed with these offers?
          </Text>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Create a professional proposal to share with the customer
          </Text>
          <Space size={16}>
            <Button
              size="large" onClick={() => setCurrentStep(2)}
              style={{ borderRadius: 10, padding: '0 28px', height: 48 }}
            >
              <ArrowLeftOutlined /> Change Banks
            </Button>
            <Button
              type="primary" size="large" onClick={() => setCurrentStep(4)}
              style={{
                background: `linear-gradient(135deg, ${THEME} 0%, ${THEME_MID} 100%)`,
                border: 'none', borderRadius: 10, padding: '0 36px', height: 48,
                fontWeight: 700, boxShadow: `0 6px 20px ${THEME}40`
              }}
            >
              <SendOutlined /> Create Proposal Now
            </Button>
          </Space>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
          <Button size="large" onClick={() => setCurrentStep(2)} style={{ borderRadius: 10, padding: '0 28px', height: 44 }}>
            <ArrowLeftOutlined /> Back
          </Button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // STEP 4 – Finalize & Submit
  // ─────────────────────────────────────────────
  const renderStep4 = () => {
    const loanAmount = (selectedLead?.propertyDetails?.propertyValue || 0) - (selectedLead?.propertyDetails?.downPaymentAmount || 0);
    const bestOffer = offers?.offers?.[0];

    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <Title level={4} style={{ color: THEME, margin: 0 }}>Finalize Proposal</Title>
          <Text type="secondary">Write a cover note and submit the proposal to the customer</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={15}>
            <Card
              title={<span><FileTextOutlined style={{ color: THEME, marginRight: 8 }} />Cover Note</span>}
              style={{ borderRadius: 14 }}
            >
              <TextArea
                rows={12}
                value={coverNote}
                onChange={e => setCoverNote(e.target.value)}
                placeholder="Write a personalised cover note for the customer..."
                style={{ borderRadius: 10, fontSize: 14, lineHeight: 1.7 }}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                {coverNote.length} characters
              </Text>
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            {/* Summary */}
            <Card
              title="Proposal Summary"
              style={{ borderRadius: 14, marginBottom: 20, background: THEME_LIGHT }}
              headStyle={{ color: THEME, borderBottom: `1px solid ${THEME}20` }}
            >
              <div style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>Customer</Text>
                <Text strong style={{ display: 'block', fontSize: 15 }}>{selectedLead?.customerInfo?.fullName}</Text>
              </div>
              <Divider style={{ margin: '10px 0' }} />
              <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                <Col span={12}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Property Value</Text>
                  <Text strong style={{ fontSize: 13 }}>AED {selectedLead?.propertyDetails?.propertyValue?.toLocaleString()}</Text>
                </Col>
                <Col span={12}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Loan Amount</Text>
                  <Text strong style={{ fontSize: 13 }}>AED {loanAmount?.toLocaleString()}</Text>
                </Col>
                <Col span={12}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Best Rate</Text>
                  <Text strong style={{ fontSize: 13, color: THEME }}>{bestOffer?.interestRate}%</Text>
                </Col>
                <Col span={12}>
                  <Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Lowest EMI</Text>
                  <Text strong style={{ fontSize: 13, color: GREEN }}>AED {offers?.lowestEmi?.toLocaleString()}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: '10px 0' }} />
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>
                {selectedBanks.length} Banks Included
              </Text>
              {selectedBanks.map((b, i) => {
                const matchedOffer = offers?.offers?.find(o => o.bankId === b.bankProductId);
                return (
                  <div key={i} style={{
                    background: '#fff', borderRadius: 10, padding: '10px 14px',
                    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <img
                      src={b.logo} alt={b.bankName}
                      style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, border: '1px solid #f0f0f0', padding: 2 }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <Text strong style={{ fontSize: 13 }}>{b.bankName}</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                        {matchedOffer ? `${matchedOffer.interestRate}% • EMI AED ${matchedOffer.emi?.toLocaleString()}` : `${b.interestRate}%`}
                      </Text>
                    </div>
                    {i === 0 && <StarFilled style={{ color: GOLD, marginLeft: 'auto' }} />}
                  </div>
                );
              })}
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
          <Button size="large" onClick={() => setCurrentStep(3)} style={{ borderRadius: 10, padding: '0 32px', height: 46 }}>
            <ArrowLeftOutlined /> Back
          </Button>
          <Button
            type="primary" size="large" loading={submitting} onClick={submitProposal}
            disabled={!coverNote.trim()}
            style={{
              background: `linear-gradient(135deg, ${GREEN} 0%, #10b981 100%)`,
              border: 'none', borderRadius: 10, padding: '0 40px', height: 46,
              fontWeight: 700, boxShadow: '0 6px 20px rgba(5,150,105,0.35)'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Proposal'} {!submitting && <SendOutlined />}
          </Button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Steps config
  // ─────────────────────────────────────────────
  const steps = [
    { title: 'Select Lead', icon: <UserOutlined /> },
    { title: 'Review Lead', icon: <FileTextOutlined /> },
    { title: 'Choose Banks', icon: <BankOutlined /> },
    { title: 'View Offers', icon: <CalculatorOutlined /> },
    { title: 'Finalize', icon: <CheckCircleOutlined /> },
  ];

  return (
    <div style={{ padding: '24px', background: '#fdfbff', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: `linear-gradient(135deg, ${THEME} 0%, ${THEME_MID} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <RocketOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <div>
            <Title level={2} style={{ color: '#1e1b4b', margin: 0, fontSize: 26 }}>
              Create Mortgage Proposal
            </Title>
            <Text type="secondary">Select a lead → choose banks → view offers → create proposal</Text>
          </div>
        </div>
      </div>

      <Card style={{ borderRadius: 20, border: '1px solid #f0f0f0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Steps */}
        <div style={{ marginBottom: 40, padding: '0 8px' }}>
          <Steps
            current={currentStep}
            items={steps.map((s, i) => ({
              title: s.title,
              icon: currentStep > i
                ? <CheckCircleOutlined style={{ color: GREEN }} />
                : React.cloneElement(s.icon, { style: { color: currentStep === i ? THEME : '#9ca3af' } }),
              status: currentStep > i ? 'finish' : currentStep === i ? 'process' : 'wait',
            }))}
            style={{ '--ant-color-primary': THEME }}
          />
        </div>

        {/* Step content */}
        <div style={{ minHeight: 450 }}>
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </Card>

      {/* Document Viewer Modal */}
      <Modal
        title="Document Viewer"
        open={!!viewingDoc}
        onCancel={() => setViewingDoc(null)}
        footer={[
          <Button key="close" onClick={() => setViewingDoc(null)}>Close</Button>,
          <Button key="open" type="primary" style={{ background: THEME }} href={viewingDoc?.fileUrl} target="_blank">
            Open in New Tab
          </Button>
        ]}
        width={860}
        centered
        bodyStyle={{ padding: 0, height: '65vh' }}
      >
        {viewingDoc && (
          viewingDoc.mimeType === 'application/pdf'
            ? <iframe src={viewingDoc.fileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Document" />
            : <div style={{ textAlign: 'center', padding: 40, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={viewingDoc.fileUrl} alt="Document" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
        )}
      </Modal>
    </div>
  );
};

export default CreateProposalAdmin;