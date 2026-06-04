import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { apiService } from "../../../../manageApi/utils/custom.apiservice";
import {
  Card, Tag, Button, Spin, Alert, Descriptions, Row, Col, 
  Statistic, Divider, Tabs, Table as AntTable, Typography, 
  Badge, Space, Progress, Modal, message, Tooltip, Avatar
} from "antd";
import {
  DollarOutlined, BankOutlined, HomeOutlined, UserOutlined,
  CheckCircleOutlined, ClockCircleOutlined, RiseOutlined,
  FallOutlined, PercentageOutlined, WalletOutlined, FileTextOutlined,
  CalculatorOutlined, TrophyOutlined, GiftOutlined, CalendarOutlined,
  ArrowLeftOutlined, DownloadOutlined, PrinterOutlined, EyeOutlined,
  InfoCircleOutlined, FundOutlined, ShoppingOutlined, InsuranceOutlined,
  TeamOutlined, GoldOutlined, SwapOutlined, SafetyOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const PURPLE = "#5C039B";
const PURPLE_LIGHT = "#F3E8FF";
const SUCCESS_COLOR = "#10b981";
const SUCCESS_LIGHT = "#D1FAE5";
const WARNING_COLOR = "#f59e0b";
const WARNING_LIGHT = "#FEF3C7";
const ERROR_COLOR = "#ef4444";
const INFO_COLOR = "#3b82f6";
const INFO_LIGHT = "#DBEAFE";

const roleSlugMap = {
  '0': 'superadmin', '1': 'admin', '2': "customer",
  '15': "agency", '16': "agent", '17': "developer",
  '18': "vault-admin", '22': "vaultagent", '21': "vaultpartner",
  '24': "GridAdvisor", '26': "vault-advisor", '23': "vault-ops", '25': "gridreferralpartner",
};

const DisbursedFullAmountCases = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const roleSlug = roleSlugMap[user?.role?.code] ?? "superadmin";

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "AED 0";
    return `AED ${Number(value).toLocaleString()}`;
  };

  const formatNumber = (value) => {
    if (!value) return "0";
    return Number(value).toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("DD MMM YYYY, hh:mm A");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiService.get(`/vault/cases/ops/bank-decision/${caseId}/amount-details`);
        if (response) {
          setCaseData(response.data);
        } else {
          message.error("Failed to load amount details");
        }
      } catch (err) {
        console.error("Error fetching amount details:", err);
        message.error("Failed to load amount details");
      } finally {
        setLoading(false);
      }
    };
    
    if (caseId) {
      fetchData();
    }
  }, [caseId]);

  const handleBack = () => navigate(-1);
  const handlePrint = () => window.print();
  
  const handleExport = () => {
    const exportData = {
      caseReference: caseData?.caseReference,
      caseId: caseData?.caseId,
      exportedAt: new Date().toISOString(),
      ...caseData
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amount-details-${caseData?.caseReference || caseId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success("Export completed");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9FAFB" }}>
        <Alert message="No Data Found" description="Unable to load amount details for this case" type="error" showIcon />
      </div>
    );
  }

  const data = caseData;
  const comparison = data.amountComparison || {};
  const bankOffer = data.bankOffer || {};
  const commission = data.commissionCalculation || {};
  const summary = data.summary || {};
  const timeline = data.amountTimeline || [];
  const customerPayment = data.customerPaymentCalculation || {};
  const dbrAnalysis = data.dbrAnalysis || {};

  // Chart data for amortization
  const amortizationData = [
    { year: 0, principal: 0, interest: 0 },
    { year: 5, principal: Math.round((1300000 / 25) * 5), interest: Math.round((791000 / 25) * 5) },
    { year: 10, principal: Math.round((1300000 / 25) * 10), interest: Math.round((791000 / 25) * 10) },
    { year: 15, principal: Math.round((1300000 / 25) * 15), interest: Math.round((791000 / 25) * 15) },
    { year: 20, principal: Math.round((1300000 / 25) * 20), interest: Math.round((791000 / 25) * 20) },
    { year: 25, principal: 1300000, interest: 791000 },
  ];

  const pieData = [
    { name: 'Principal Amount', value: customerPayment.totalPaymentOverTerm?.totalPrincipal || 1300000, color: PURPLE },
    { name: 'Total Interest', value: customerPayment.totalPaymentOverTerm?.totalInterest || 791000, color: WARNING_COLOR },
    { name: 'Insurance', value: customerPayment.totalPaymentOverTerm?.totalInsuranceOverTerm || 70500, color: INFO_COLOR },
  ];

  const upfrontPieData = [
    { name: 'Down Payment', value: summary.downPayment || 300000, color: PURPLE },
    { name: 'DLD Fee', value: (summary.propertyValue || 1600000) * 0.04, color: WARNING_COLOR },
    { name: 'Registration Fee', value: (comparison.disbursedAmount || 1300000) * 0.0025, color: INFO_COLOR },
    { name: 'Valuation Fee', value: bankOffer.valuationFee || 2500, color: SUCCESS_COLOR },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F9FAFB 0%, #F3E8FF 100%)", padding: "24px 20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
        {/* Header with Gradient */}
        <div style={{ 
          background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE}CC 100%)`,
          borderRadius: 20, padding: "24px 28px", marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          boxShadow: `0 10px 40px ${PURPLE}30`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar size={56} icon={<DollarOutlined />} style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }} />
            <div>
              <Title level={3} style={{ margin: 0, color: "#fff" }}>Amount Details</Title>
              <Space size="middle" style={{ marginTop: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.9)" }}>Case: {data.caseReference}</Text>
                <Badge color={SUCCESS_COLOR} text={<Text style={{ color: "#fff" }}>Status: {data.currentStatus}</Text>} />
              </Space>
            </div>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff" }}>Back</Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff" }}>Print</Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff" }}>Export</Button>
          </Space>
        </div>

        {/* Key Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, textAlign: "center", borderTop: `4px solid ${PURPLE}` }}>
              <Statistic title="Requested Amount" value={comparison.requestedAmount} prefix={<BankOutlined />} valueStyle={{ fontSize: 24 }} formatter={(v) => formatCurrency(v)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, textAlign: "center", borderTop: `4px solid ${WARNING_COLOR}` }}>
              <Statistic title="Approved Amount" value={comparison.approvedAmount} prefix={<CheckCircleOutlined />} valueStyle={{ color: WARNING_COLOR, fontSize: 24 }} formatter={(v) => formatCurrency(v)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, textAlign: "center", borderTop: `4px solid ${SUCCESS_COLOR}`, background: `linear-gradient(135deg, ${SUCCESS_LIGHT} 0%, #fff 100%)` }}>
              <Statistic title="Disbursed Amount" value={comparison.disbursedAmount} prefix={<DollarOutlined style={{ color: SUCCESS_COLOR }} />} valueStyle={{ color: SUCCESS_COLOR, fontSize: 24 }} formatter={(v) => formatCurrency(v)} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ borderRadius: 16, textAlign: "center", borderTop: `4px solid ${INFO_COLOR}` }}>
              <Statistic title="Monthly EMI" value={bankOffer.monthlyEMI} prefix={<CalculatorOutlined />} valueStyle={{ fontSize: 24 }} formatter={(v) => formatCurrency(v)} />
            </Card>
          </Col>
        </Row>

        {/* Comparison Alert */}
        {comparison.amountDifference !== 0 && comparison.amountDifference !== undefined && (
          <Alert message={comparison.message} type={comparison.amountStatus === 'reduced' ? 'warning' : 'info'} showIcon style={{ marginBottom: 24, borderRadius: 12 }} />
        )}

        {/* Main Tabs */}
        <Card style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            {/* Tab 1: Overview */}
            <TabPane tab={<span><DashboardOutlined /> Overview</span>} key="overview">
              <div style={{ padding: "16px 0" }}>
                {/* DBR Score Card */}
                <Card style={{ marginBottom: 24, background: `linear-gradient(135deg, ${INFO_LIGHT} 0%, #fff 100%)`, borderRadius: 16 }}>
                  <Row align="middle" gutter={24}>
                    <Col xs={24} md={8}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <Progress type="circle" percent={dbrAnalysis.dbrPercentage} width={120} strokeColor={dbrAnalysis.dbrPercentage <= 50 ? SUCCESS_COLOR : WARNING_COLOR} />
                          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                            <Text strong style={{ fontSize: 20 }}>{dbrAnalysis.dbrPercentage}%</Text>
                          </div>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <Tag color={dbrAnalysis.eligibilityStatus === 'Eligible' ? 'success' : 'warning'} style={{ fontSize: 14, padding: "4px 12px" }}>
                            {dbrAnalysis.eligibilityStatus}
                          </Tag>
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} md={16}>
                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <Statistic title="Monthly Income" value={dbrAnalysis.monthlyIncome} prefix={<WalletOutlined />} formatter={(v) => formatCurrency(v)} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Monthly EMI" value={dbrAnalysis.proposedEMI} prefix={<CalculatorOutlined />} formatter={(v) => formatCurrency(v)} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Existing Liabilities" value={dbrAnalysis.existingLiabilities} prefix={<FallOutlined />} formatter={(v) => formatCurrency(v)} />
                        </Col>
                        <Col span={12}>
                          <Statistic title="Total Obligations" value={dbrAnalysis.totalMonthlyObligations} prefix={<RiseOutlined />} formatter={(v) => formatCurrency(v)} />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>

                {/* Loan Overview Cards */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title={<span><BankOutlined /> Loan Information</span>} style={{ borderRadius: 16 }} headStyle={{ borderBottom: `2px solid ${PURPLE}` }}>
                      <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Bank Name"><Tag color="purple">{bankOffer.bankName}</Tag></Descriptions.Item>
                        <Descriptions.Item label="Interest Rate">{bankOffer.interestRate}% ({bankOffer.interestRateType})</Descriptions.Item>
                        <Descriptions.Item label="Loan Tenure">{bankOffer.tenureYears} years ({bankOffer.tenureMonths} months)</Descriptions.Item>
                        <Descriptions.Item label="Monthly EMI">{formatCurrency(bankOffer.monthlyEMI)}</Descriptions.Item>
                        <Descriptions.Item label="Processing Fee">{formatCurrency(bankOffer.processingFee)}</Descriptions.Item>
                        <Descriptions.Item label="Valuation Fee">{formatCurrency(bankOffer.valuationFee)}</Descriptions.Item>
                        <Descriptions.Item label="Early Settlement Fee">{bankOffer.earlySettlementFee}%</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title={<span><HomeOutlined /> Property Information</span>} style={{ borderRadius: 16 }} headStyle={{ borderBottom: `2px solid ${PURPLE}` }}>
                      <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Property Value">{formatCurrency(summary.propertyValue)}</Descriptions.Item>
                        <Descriptions.Item label="Down Payment">{formatCurrency(summary.downPayment)} ({Math.round((summary.downPayment / summary.propertyValue) * 100)}%)</Descriptions.Item>
                        <Descriptions.Item label="LTV Ratio">{summary.ltvPercentage}%</Descriptions.Item>
                        <Descriptions.Item label="Loan Amount">{formatCurrency(comparison.disbursedAmount)}</Descriptions.Item>
                        <Descriptions.Item label="Total Upfront Cost">{formatCurrency(summary.totalUpfrontCost)}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>

                {/* Commission Summary */}
                {commission.primaryRecipient && (
                  <Card style={{ marginTop: 24, borderRadius: 16, background: `linear-gradient(135deg, ${SUCCESS_LIGHT} 0%, #fff 100%)` }} bodyStyle={{ padding: 20 }}>
                    <Row gutter={24} align="middle">
                      <Col xs={24} md={6}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ width: 80, height: 80, borderRadius: 40, background: SUCCESS_COLOR, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                            <GiftOutlined style={{ fontSize: 40, color: "#fff" }} />
                          </div>
                          <Text strong style={{ marginTop: 12, display: "block" }}>Commission Summary</Text>
                        </div>
                      </Col>
                      <Col xs={24} md={18}>
                        <Row gutter={[24, 16]}>
                          <Col span={12}>
                            <Statistic title="Xoto Commission from Bank" value={commission.xotoCommissionFromBank} prefix={<BankOutlined />} formatter={(v) => formatCurrency(v)} />
                          </Col>
                          <Col span={12}>
                            <Statistic title="Xoto Net Profit" value={commission.xotoNetProfit} prefix={<DollarOutlined />} valueStyle={{ color: SUCCESS_COLOR }} formatter={(v) => formatCurrency(v)} />
                          </Col>
                          <Col span={12}>
                            <Statistic title={`Recipient (${commission.primaryRecipient.type})`} value={commission.primaryRecipient.commissionAmount} prefix={<UserOutlined />} formatter={(v) => formatCurrency(v)} />
                          </Col>
                          <Col span={12}>
                            <Text type="secondary">Formula: {commission.primaryRecipient.formula}</Text>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Card>
                )}
              </div>
            </TabPane>

            {/* Tab 2: Financial Breakdown */}
            <TabPane tab={<span><CalculatorOutlined /> Financial Breakdown</span>} key="financial">
              <div style={{ padding: "16px 0" }}>
                {/* Payment Breakdown Charts */}
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                  <Col xs={24} lg={12}>
                    <Card title="Total Payment Breakdown" style={{ borderRadius: 16 }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <Divider />
                      <Row gutter={16}>
                        {pieData.map(item => (
                          <Col span={8} key={item.name} style={{ textAlign: "center" }}>
                            <div style={{ width: 12, height: 12, background: item.color, borderRadius: 2, display: "inline-block", marginRight: 6 }} />
                            <Text type="secondary">{item.name}</Text>
                            <div><Text strong>{formatCurrency(item.value)}</Text></div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Upfront Cost Breakdown" style={{ borderRadius: 16 }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={upfrontPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                            {upfrontPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>

                {/* Monthly Payment Schedule */}
                <Card title="Monthly Payment Breakdown" style={{ borderRadius: 16, marginBottom: 24 }}>
                  <Row gutter={24}>
                    <Col xs={24} sm={12}>
                      <div style={{ textAlign: "center", padding: 16, background: INFO_LIGHT, borderRadius: 12 }}>
                        <Text type="secondary">Principal & Interest</Text>
                        <Title level={2} style={{ margin: 8, color: INFO_COLOR }}>{formatCurrency(customerPayment.monthlyPayment?.principalAndInterest)}</Title>
                        <Text type="secondary">per month</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ textAlign: "center", padding: 16, background: SUCCESS_LIGHT, borderRadius: 12 }}>
                        <Text type="secondary">Total Monthly Payment</Text>
                        <Title level={2} style={{ margin: 8, color: SUCCESS_COLOR }}>{formatCurrency(customerPayment.monthlyPayment?.totalMonthlyPayment)}</Title>
                        <Text type="secondary">(including insurance)</Text>
                      </div>
                    </Col>
                  </Row>
                  <Divider />
                  <Row gutter={16}>
                    <Col span={8} style={{ textAlign: "center" }}>
                      <Text type="secondary">Life Insurance</Text>
                      <div><Text strong>{formatCurrency(customerPayment.monthlyPayment?.lifeInsurance)}/month</Text></div>
                    </Col>
                    <Col span={8} style={{ textAlign: "center" }}>
                      <Text type="secondary">Property Insurance</Text>
                      <div><Text strong>{formatCurrency(customerPayment.monthlyPayment?.propertyInsurance)}/month</Text></div>
                    </Col>
                    <Col span={8} style={{ textAlign: "center" }}>
                      <Text type="secondary">Insurance Over 25 Years</Text>
                      <div><Text strong>{formatCurrency(customerPayment.totalPaymentOverTerm?.totalInsuranceOverTerm)}</Text></div>
                    </Col>
                  </Row>
                </Card>

                {/* Amortization Chart */}
                <Card title="Amortization Schedule (Principal vs Interest Over Time)" style={{ borderRadius: 16 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={amortizationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                      <YAxis tickFormatter={(v) => `AED ${(v / 1000).toFixed(0)}K`} />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="principal" stackId="1" stroke={PURPLE} fill={PURPLE} fillOpacity={0.6} name="Principal Paid" />
                      <Area type="monotone" dataKey="interest" stackId="1" stroke={WARNING_COLOR} fill={WARNING_COLOR} fillOpacity={0.6} name="Interest Paid" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabPane>

            {/* Tab 3: Commission Details */}
            <TabPane tab={<span><GiftOutlined /> Commission</span>} key="commission">
              <Card style={{ borderRadius: 16 }}>
                <AntTable columns={[
                  { title: 'Parameter', dataIndex: 'label', key: 'label' },
                  { title: 'Value', dataIndex: 'value', key: 'value' }
                ]} dataSource={[
                  { key: '1', label: 'Disbursed Amount', value: formatCurrency(commission.loanAmount) },
                  { key: '2', label: 'Loan Tier', value: commission.loanTier },
                  { key: '3', label: 'Xoto Commission Rate', value: commission.xotoCommissionRate },
                  { key: '4', label: 'Xoto Commission from Bank', value: formatCurrency(commission.xotoCommissionFromBank) },
                  { key: '5', label: 'Xoto Net Profit', value: formatCurrency(commission.xotoNetProfit) },
                  { key: '6', label: 'Total Payout', value: formatCurrency(commission.totalPayout) },
                  { key: '7', label: 'Recipient Type', value: commission.primaryRecipient?.type },
                  { key: '8', label: 'Recipient Name', value: commission.primaryRecipient?.name },
                  { key: '9', label: 'Recipient Percentage', value: `${commission.primaryRecipient?.percentage}%` },
                  { key: '10', label: 'Commission Amount', value: formatCurrency(commission.primaryRecipient?.commissionAmount), highlight: true },
                  { key: '11', label: 'Calculation Formula', value: commission.primaryRecipient?.formula },
                ]} pagination={false} bordered rowKey="key" />
                
                {commission.secondaryRecipient && (
                  <Card style={{ marginTop: 16, background: WARNING_LIGHT, borderRadius: 12 }}>
                    <Text strong>⚠️ Secondary Recipient</Text>
                    <div>{commission.secondaryRecipient.name} gets {commission.secondaryRecipient.percentage}% ({formatCurrency(commission.secondaryRecipient.commissionAmount)})</div>
                    <Text type="secondary">Formula: {commission.secondaryRecipient.formula}</Text>
                  </Card>
                )}
              </Card>
            </TabPane>

            {/* Tab 4: Timeline */}
            <TabPane tab={<span><ClockCircleOutlined /> Timeline</span>} key="timeline">
              <div style={{ padding: "16px 0" }}>
                {timeline.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", marginBottom: 16, padding: 16, background: item.isFinal ? SUCCESS_LIGHT : "#F8FAFC", borderRadius: 12, borderLeft: `4px solid ${item.isFinal ? SUCCESS_COLOR : PURPLE}` }}>
                    <div style={{ minWidth: 180 }}><Text strong>{formatDate(item.date)}</Text></div>
                    <div style={{ flex: 1 }}>
                      <Text>{item.event}</Text>
                      {item.reference && <div><Text type="secondary" style={{ fontSize: 12 }}>Reference: {item.reference}</Text></div>}
                      <Text type="secondary" style={{ fontSize: 11 }}>By: {item.addedBy}</Text>
                    </div>
                    {item.isFinal && <Tag color="success">Final</Tag>}
                  </div>
                ))}
              </div>
            </TabPane>
          </Tabs>
        </Card>

        {/* Bottom Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 16, textAlign: "center" }}>
              <Text type="secondary">Total Upfront Cost</Text>
              <Title level={3} style={{ margin: "8px 0 0", color: ERROR_COLOR }}>{formatCurrency(summary.totalUpfrontCost)}</Title>
              <Text type="secondary">Paid at start</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 16, textAlign: "center" }}>
              <Text type="secondary">Total Interest Payable</Text>
              <Title level={3} style={{ margin: "8px 0 0", color: WARNING_COLOR }}>{formatCurrency(summary.totalInterestPayable)}</Title>
              <Text type="secondary">Over {bankOffer.tenureYears} years</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ borderRadius: 16, textAlign: "center", background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, #fff 100%)` }}>
              <Text type="secondary">Total Amount Payable</Text>
              <Title level={3} style={{ margin: "8px 0 0", color: PURPLE }}>{formatCurrency(summary.totalAmountPayable)}</Title>
              <Text type="secondary">Principal + Interest</Text>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

// Helper icon component
const DashboardOutlined = (props) => <span {...props}>📊</span>;

export default DisbursedFullAmountCases;