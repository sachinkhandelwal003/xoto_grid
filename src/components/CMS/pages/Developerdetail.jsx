import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import {
  Typography, Avatar, Row, Col, Space, message,
  Modal, Button, Tag, Spin, Divider, Input, Descriptions, Select, Card
} from "antd";
import {
  ArrowLeftOutlined, EnvironmentOutlined, CheckOutlined, CloseOutlined,
  UploadOutlined, PlusOutlined, DeleteOutlined, EditOutlined,
  ExclamationCircleOutlined, MailOutlined, PhoneOutlined, FileTextOutlined,
  UserOutlined, CalendarOutlined, GlobalOutlined, SafetyCertificateOutlined,
  FileDoneOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DeveloperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Main States
  const [selectedDev, setSelectedDev] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  // Verification states
  const [kycActionLoading, setKycActionLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // ✅ Agreement Upload states
  const [agreementModalVisible, setAgreementModalVisible] = useState(false);
  const [agreementLoading, setAgreementLoading] = useState(false);
  const [agreementDocs, setAgreementDocs] = useState([{ type: 'main_agreement', name: '', url: '' }]);

  // ✅ Agreement Approve states
  const [approveAgreementModal, setApproveAgreementModal] = useState(false);
  const [approveRemark, setApproveRemark] = useState('');
  const [approveAgreementLoading, setApproveAgreementLoading] = useState(false);

  // ✅ Agreement Request Changes states
  const [requestChangesModal, setRequestChangesModal] = useState(false);
  const [requestChangesMessage, setRequestChangesMessage] = useState('');
  const [requestChangesRemark, setRequestChangesRemark] = useState('');
  const [requestChangesLoading, setRequestChangesLoading] = useState(false);

  // Labels & Helpers
  const kycTypeLabel = { passport: "Passport", emirates_id: "Emirates ID", trade_license: "Trade License" };
  const agreementTypeLabel = { main_agreement: "Main Agreement", commission_schedule: "Commission Schedule", addendum: "Addendum" };

  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  const hasValidDoc = (doc) => hasText(doc?.url) && hasText(doc?.name);
  const visibleKycDocuments = (selectedDev?.kycDocuments || []).filter(hasValidDoc);
  const visibleAgreementDocuments = (selectedDev?.agreementDocuments || []).filter(hasValidDoc);
  const hasEngagementPlan = Boolean(
    selectedDev?.engagementPlan &&
    (
      hasText(selectedDev.engagementPlan.type) ||
      Number(selectedDev.engagementPlan.price || 0) > 0 ||
      hasText(selectedDev.engagementPlan.invoiceUrl) ||
      selectedDev.engagementPlan.paymentStatus === "paid" ||
      selectedDev.engagementPlan.startDate ||
      selectedDev.engagementPlan.endDate ||
      selectedDev.engagementPlan.paymentDate
    )
  );
  const shouldShowAgreementStatus = hasText(selectedDev?.agreementStatus) && selectedDev.agreementStatus !== "not_uploaded";

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getKycStatusColor = (status) => {
    if (status === "approved") return "green";
    if (status === "rejected") return "red";
    return "orange";
  };

  const getAgreementStatusColor = (status) => {
    if (status === "approved") return "green";
    if (status === "changes_requested") return "orange";
    if (status === "rejected") return "red";
    if (status === "pending_review") return "blue";
    return "default";
  };

  // ✅ FETCH DEVELOPER BY ID
  const fetchDeveloperById = async (devId) => {
    setLoadingDetail(true);
    try {
      const resData = await apiService.get(`/property/get-developer-by-id`, { id: devId });
      const dev = resData?.data || resData;
      setSelectedDev(dev);
    } catch (err) {
      message.error("Failed to load developer details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDeveloperById(id);
    }
  }, [id]);

  // ✅ ACTION HANDLERS
  const handleKycApprove = async () => {
    if (!selectedDev) return;
    setKycActionLoading(true);
    try {
      await apiService.put(`/developer/admin/review-kyc/${selectedDev._id}`, { action: "approve" });
      message.success("Verification approved successfully!");
      fetchDeveloperById(selectedDev._id);
    } catch (err) {
      message.error("Verification approval failed.");
    } finally {
      setKycActionLoading(false);
    }
  };

  const handleKycReject = async () => {
    if (!rejectionReason.trim()) { message.warning("Please enter a rejection reason."); return; }
    setKycActionLoading(true);
    try {
      await apiService.put(`/developer/admin/review-kyc/${selectedDev._id}`, {
        action: "reject", rejectionReason: rejectionReason.trim()
      });
      message.success("Verification rejected.");
      setRejectModalVisible(false);
      setRejectionReason('');
      fetchDeveloperById(selectedDev._id);
    } catch (err) {
      message.error("Verification rejection failed.");
    } finally {
      setKycActionLoading(false);
    }
  };

  const handleAgreementApprove = async () => {
    setApproveAgreementLoading(true);
    try {
      await apiService.put(`/developer/admin/verify-agreement/${selectedDev._id}`, {
        remarks: approveRemark.trim()
      });
      message.success("Agreement Approved successfully!");
      setApproveAgreementModal(false);
      setApproveRemark('');
      fetchDeveloperById(selectedDev._id);
    } catch (err) {
      message.error("Agreement approval failed.");
    } finally {
      setApproveAgreementLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!requestChangesMessage.trim() || !requestChangesRemark.trim()) {
      message.warning("Please fill in both message and remarks.");
      return;
    }
    setRequestChangesLoading(true);
    try {
      await apiService.post(`/developer/admin/request-changes/${selectedDev._id}`, {
        message: requestChangesMessage.trim(),
        remarks: requestChangesRemark.trim()
      });
      message.success("Change request sent to developer.");
      setRequestChangesModal(false);
      setRequestChangesMessage('');
      setRequestChangesRemark('');
      fetchDeveloperById(selectedDev._id);
    } catch (err) {
      message.error("Failed to send change request.");
    } finally {
      setRequestChangesLoading(false);
    }
  };

  const handleAgreementUpload = async () => {
    const validDocs = agreementDocs.filter(d => d.type && d.name && d.url);
    if (validDocs.length === 0) { message.warning("Please fill all document fields."); return; }
    setAgreementLoading(true);
    try {
      await apiService.post(`/agreement/upload`, {
        developerId: selectedDev._id,
        agreementDocuments: validDocs
      });
      message.success("Agreement documents uploaded successfully!");
      setAgreementModalVisible(false);
      setAgreementDocs([{ type: 'main_agreement', name: '', url: '' }]);
      fetchDeveloperById(selectedDev._id);
    } catch (err) {
      message.error("Agreement upload failed.");
    } finally {
      setAgreementLoading(false);
    }
  };

  const addAgreementDoc = () => setAgreementDocs([...agreementDocs, { type: 'addendum', name: '', url: '' }]);
  const removeAgreementDoc = (index) => setAgreementDocs(agreementDocs.filter((_, i) => i !== index));
  const updateAgreementDoc = (index, field, value) => {
    const updated = [...agreementDocs];
    updated[index][field] = value;
    setAgreementDocs(updated);
  };

  // ✅ REUSABLE SUB-COMPONENTS
  const DocCard = ({ doc, typeLabel, accentColor = "#5c039b", bgColor = "#faf5ff", borderColor = "#e9d5ff", iconBg = "#ede9fe" }) => (
    <a href={doc.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
      <Card size="small" hoverable
        style={{ borderRadius: "10px", border: `1px solid ${borderColor}`, background: bgColor, marginBottom: "10px" }}
        bodyStyle={{ padding: "12px 14px" }}
      >
        <Space>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileTextOutlined style={{ color: accentColor, fontSize: "16px" }} />
          </div>
          <div>
            <Text strong style={{ fontSize: "13px", color: "#374151", display: "block" }}>{typeLabel[doc.type] || doc.type}</Text>
            <Text type="secondary" style={{ fontSize: "11px" }}>{doc.uploadedBy ? `By ${doc.uploadedBy} · ` : ''}{formatDate(doc.uploadedAt)}</Text>
          </div>
        </Space>
      </Card>
    </a>
  );

  const AgreementActionBanner = () => {
    const status = selectedDev?.agreementStatus;
    const feedback = selectedDev?.agreementFeedback;

    if (status === "pending_review" && visibleAgreementDocuments.length > 0) {
      return (
        <div style={{
          background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #93c5fd", borderRadius: "12px",
          padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px"
        }}>
          <div>
            <Text strong style={{ color: "#1e40af", fontSize: "14px" }}>📋 Agreement Pending Review</Text><br />
            <Text type="secondary" style={{ fontSize: "12px" }}>Developer has submitted agreement documents. Review and take action.</Text>
          </div>
          <Space>
            <Button type="primary" icon={<CheckOutlined />} onClick={() => setApproveAgreementModal(true)}
              style={{ background: "#059669", borderColor: "#059669", borderRadius: "8px", fontWeight: "600" }}>Approve</Button>
            <Button icon={<ExclamationCircleOutlined />} onClick={() => setRequestChangesModal(true)}
              style={{ borderRadius: "8px", fontWeight: "600", borderColor: "#f59e0b", color: "#d97706", background: "#fffbeb" }}>Request Changes</Button>
          </Space>
        </div>
      );
    }
    if (status === "approved") {
      return (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "14px 20px", marginBottom: "16px" }}>
          <Text strong style={{ color: "#166534" }}>✅ Agreement Approved</Text>
          {selectedDev?.agreementRemarks && <Text type="secondary" style={{ fontSize: "12px", marginLeft: "8px" }}>Remark: {selectedDev.agreementRemarks}</Text>}
          <Text type="secondary" style={{ fontSize: "12px", marginLeft: "8px" }}>on {formatDate(selectedDev?.agreementVerifiedAt)}</Text>
        </div>
      );
    }
    if (status === "changes_requested") {
      return (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "12px", padding: "14px 20px", marginBottom: "16px" }}>
          <Text strong style={{ color: "#92400e" }}>🔄 Correction Requested</Text>
          {feedback?.message && <div style={{ marginTop: "6px" }}><Text type="secondary" style={{ fontSize: "12px" }}>Message: </Text><Text style={{ fontSize: "12px", color: "#78350f" }}>{feedback.message}</Text></div>}
          {feedback?.remarks && <div style={{ marginTop: "4px" }}><Text type="secondary" style={{ fontSize: "12px" }}>Remarks: </Text><Text style={{ fontSize: "12px", color: "#78350f" }}>{feedback.remarks}</Text></div>}
          <div style={{ marginTop: "12px" }}>
            <Space>
              <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => setApproveAgreementModal(true)}
                style={{ background: "#059669", borderColor: "#059669", borderRadius: "6px", fontWeight: "600" }}>Approve Now</Button>
              <Button size="small" icon={<EditOutlined />} onClick={() => setRequestChangesModal(true)}
                style={{ borderRadius: "6px", fontWeight: "600", borderColor: "#f59e0b", color: "#d97706" }}>Resend Changes</Button>
            </Space>
          </div>
        </div>
      );
    }
    return null;
  };

  // ✅ LOADING OR NOT FOUND STATES
  if (loadingDetail) return <div style={{ textAlign: "center", padding: "100px" }}><Spin size="large" /></div>;
  if (!selectedDev) return <div style={{ textAlign: "center", padding: "100px" }}><Title level={4}>Developer not found</Title></div>;

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* BACK BUTTON */}
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: "24px", borderRadius: "8px" }}>
        Back to List
      </Button>

      {/* MAIN CONTENT CARD */}
      <div style={{ background: "#fff", padding: "32px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        
        {/* PROFILE HEADER */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Avatar size={88} shape="square" src={selectedDev.logo}
            style={{ backgroundColor: "#f3e8ff", color: "#5c039b", fontSize: "34px", fontWeight: "bold", borderRadius: "14px" }}
          >
            {selectedDev.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Title level={4} style={{ marginTop: "14px", marginBottom: "6px" }}>{selectedDev.name}</Title>
          <Space wrap style={{ justifyContent: "center" }}>
            <Tag color={selectedDev.isVerifiedByAdmin ? "green" : "red"} style={{ borderRadius: "20px", padding: "2px 12px" }}>
              {selectedDev.isVerifiedByAdmin ? "✓ Verified" : "✗ Unverified"}
            </Tag>
            <Tag color={selectedDev.accountStatus === "active" ? "cyan" : "orange"} style={{ borderRadius: "20px", padding: "2px 12px" }}>
              Status: {selectedDev.accountStatus?.toUpperCase()}
            </Tag>
            <Tag style={{ borderRadius: "20px", padding: "2px 12px" }}>
              Onboarding: {selectedDev.onboardingStatus?.replace(/_/g, " ").toUpperCase()}
            </Tag>
            <Tag color={getKycStatusColor(selectedDev.kycStatus)} style={{ borderRadius: "20px", padding: "2px 12px" }}>
              Verification: {selectedDev.kycStatus?.toUpperCase()}
            </Tag>
            {shouldShowAgreementStatus && (
              <Tag color={getAgreementStatusColor(selectedDev.agreementStatus)} style={{ borderRadius: "20px", padding: "2px 12px" }}>
                AGR: {selectedDev.agreementStatus?.replace(/_/g, " ").toUpperCase()}
              </Tag>
            )}
            {selectedDev.reraNumber && <Tag color="blue" style={{ borderRadius: "20px", padding: "2px 12px" }}>RERA: {selectedDev.reraNumber}</Tag>}
          </Space>
        </div>

        {/* BASIC INFO */}
        <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}><Space><UserOutlined /> Basic Information</Space></Divider>
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle"
          labelStyle={{ fontWeight: "600", color: "#4b5563", background: "#faf5ff", width: "160px" }} style={{ marginBottom: "24px" }}
        >
          <Descriptions.Item label="Email"><MailOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.email}</Descriptions.Item>
          {hasText(selectedDev.officialEmailId) && <Descriptions.Item label="Official Email"><MailOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.officialEmailId}</Descriptions.Item>}
          <Descriptions.Item label="Phone"><PhoneOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.country_code} {selectedDev.phone_number}</Descriptions.Item>
          {hasText(selectedDev.authorizedPersonName) && <Descriptions.Item label="Authorized Person"><UserOutlined style={{ marginRight: 6, color: "#5c039b" }} />{selectedDev.authorizedPersonName}</Descriptions.Item>}
          {(hasText(selectedDev.city) || hasText(selectedDev.country)) && <Descriptions.Item label="City / Country"><EnvironmentOutlined style={{ marginRight: 6, color: "#5c039b" }} />{[selectedDev.city, selectedDev.country].filter(Boolean).join(", ")}</Descriptions.Item>}
          {hasText(selectedDev.address) && <Descriptions.Item label="Address">{selectedDev.address}</Descriptions.Item>}
          {hasText(selectedDev.websiteUrl) && (
            <Descriptions.Item label="Website" span={2}>
              <a href={selectedDev.websiteUrl} target="_blank" rel="noreferrer" style={{ color: "#5c039b" }}><GlobalOutlined style={{ marginRight: 6 }} />{selectedDev.websiteUrl}</a>
            </Descriptions.Item>
          )}
          {Number(selectedDev.operatingYears || 0) > 0 && <Descriptions.Item label="Operating Years">{selectedDev.operatingYears} Years</Descriptions.Item>}
          {Number(selectedDev.tatDays || 0) > 0 && <Descriptions.Item label="TAT Days">{selectedDev.tatDays} Day(s)</Descriptions.Item>}
          {hasText(selectedDev.description) && <Descriptions.Item label="Description" span={2}>{selectedDev.description}</Descriptions.Item>}
        </Descriptions>

        {/* ONBOARDING & AGREEMENT */}
        <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}><Space><SafetyCertificateOutlined /> Onboarding & Agreement</Space></Divider>
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="middle"
          labelStyle={{ fontWeight: "600", color: "#4b5563", background: "#faf5ff", width: "160px" }} style={{ marginBottom: "24px" }}
        >
          <Descriptions.Item label="Onboarding Status"><Tag color="purple" style={{ borderRadius: "20px" }}>{selectedDev.onboardingStatus?.replace(/_/g, " ").toUpperCase()}</Tag></Descriptions.Item>
          {selectedDev.agreementSigned && <Descriptions.Item label="Agreement Signed"><Tag color="green">Signed</Tag></Descriptions.Item>}
          {shouldShowAgreementStatus && <Descriptions.Item label="Agreement Status"><Tag color={getAgreementStatusColor(selectedDev.agreementStatus)} style={{ borderRadius: "20px" }}>{selectedDev.agreementStatus.replace(/_/g, " ").toUpperCase()}</Tag></Descriptions.Item>}
          {selectedDev.agreementVerified && <Descriptions.Item label="Agreement Verified"><Tag color="green">Yes</Tag></Descriptions.Item>}
          {selectedDev.agreementSignedAt && <Descriptions.Item label="Agreement Signed At"><CalendarOutlined style={{ marginRight: 6, color: "#5c039b" }} />{formatDate(selectedDev.agreementSignedAt)}</Descriptions.Item>}
          {selectedDev.kycReviewedAt && <Descriptions.Item label="Verification Reviewed At"><CalendarOutlined style={{ marginRight: 6, color: "#5c039b" }} />{formatDate(selectedDev.kycReviewedAt)}</Descriptions.Item>}
        </Descriptions>

        {/* ENGAGEMENT PLAN */}
        {hasEngagementPlan && (
          <>
            <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}><Space><FileDoneOutlined /> Engagement Plan</Space></Divider>
            <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }} size="middle"
              labelStyle={{ fontWeight: "600", color: "#4b5563", background: "#faf5ff", width: "140px" }} style={{ marginBottom: "24px" }}
            >
              <Descriptions.Item label="Plan Type"><Tag color={selectedDev.engagementPlan.type ? "purple" : "default"} style={{ borderRadius: "20px", textTransform: "capitalize" }}>{selectedDev.engagementPlan.type || "Not Assigned"}</Tag></Descriptions.Item>
              <Descriptions.Item label="Price">{selectedDev.engagementPlan.price === 0 ? <Tag color="green">Free</Tag> : `AED ${selectedDev.engagementPlan.price}`}</Descriptions.Item>
              <Descriptions.Item label="Payment Status"><Tag color={selectedDev.engagementPlan.paymentStatus === "paid" ? "green" : "orange"} style={{ borderRadius: "20px" }}>{selectedDev.engagementPlan.paymentStatus?.toUpperCase()}</Tag></Descriptions.Item>
            </Descriptions>
          </>
        )}

        {/* PERFORMANCE STATS */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {[
            { label: "Presentations Generated", value: selectedDev.presentationsGenerated_stats ?? 0, color: "#2563eb", bg: "#dbeafe" },
            { label: "Leads Generated", value: selectedDev.leadsGenerated_stats ?? 0, color: "#059669", bg: "#d1fae5" },
            { label: "Units Sold", value: selectedDev.unitsSold_stats ?? 0, color: "#7c3aed", bg: "#ede9fe" },
            { label: "Conversion Rate", value: `${selectedDev.conversionRate_stats ?? 0}%`, color: "#d97706", bg: "#fef3c7" },
          ].map((stat, i) => (
            <Col xs={12} sm={6} key={i}>
              <Card size="small" bordered={false} style={{ borderRadius: "10px", background: stat.bg, textAlign: "center" }} bodyStyle={{ padding: "16px 10px" }}>
                <Title level={3} style={{ margin: 0, color: stat.color }}>{stat.value}</Title>
                <Text style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>{stat.label}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        {/* DOCUMENTS SECTION */}
        <Divider orientation="left" style={{ color: "#5c039b", borderColor: "#e9d5ff" }}>
          <Space>
            <FileTextOutlined /> Documents
            <Button size="small" type="primary" icon={<UploadOutlined />} onClick={() => setAgreementModalVisible(true)}
              style={{ background: "#2563eb", borderColor: "#2563eb", borderRadius: "6px", fontSize: "12px" }}>
              Upload Agreement
            </Button>
          </Space>
        </Divider>

        <Row gutter={[24, 16]} style={{ marginBottom: "24px" }}>
          {/* VERIFICATION DOCUMENTS COLUMN */}
          <Col xs={24} md={12}>
            {selectedDev.kycStatus === "pending" && (
              <div style={{
                background: "linear-gradient(135deg, #fefce8, #fffbeb)", border: "1px solid #fde68a", borderRadius: "12px",
                padding: "14px 16px", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px"
              }}>
                <div><Text strong style={{ color: "#92400e", fontSize: "13px" }}>Verification Pending Review</Text></div>
                <Space size={6}>
                  <Button size="small" type="primary" icon={<CheckOutlined />} loading={kycActionLoading} onClick={handleKycApprove}
                    style={{ background: "#059669", borderColor: "#059669", borderRadius: "6px", fontWeight: "600" }}>Approve</Button>
                  <Button size="small" danger icon={<CloseOutlined />} onClick={() => setRejectModalVisible(true)}
                    style={{ borderRadius: "6px", fontWeight: "600" }}>Reject</Button>
                </Space>
              </div>
            )}
            {selectedDev.kycStatus === "approved" && (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "12px 16px", marginBottom: "12px" }}>
                <Text strong style={{ color: "#166534" }}>Verification Approved</Text>
              </div>
            )}
            {selectedDev.kycStatus === "rejected" && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "12px 16px", marginBottom: "12px" }}>
                <Text strong style={{ color: "#991b1b" }}>Verification Rejected</Text>
              </div>
            )}
            <Card bordered style={{ borderRadius: "12px", border: "1px solid #e9d5ff" }} bodyStyle={{ padding: "16px" }}
              title={<Space><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5c039b" }} /><Text strong style={{ color: "#5c039b", fontSize: "13px" }}>Verification Documents</Text></Space>}
            >
              {visibleKycDocuments.length > 0
                ? visibleKycDocuments.map((doc) => <DocCard key={doc._id || doc.url} doc={doc} typeLabel={kycTypeLabel} accentColor="#5c039b" bgColor="#faf5ff" borderColor="#e9d5ff" iconBg="#ede9fe" />)
                : <Text type="secondary" style={{ fontSize: "13px" }}>No verification documents uploaded.</Text>}
            </Card>
          </Col>

          {/* AGREEMENT DOCUMENTS COLUMN */}
          <Col xs={24} md={12}>
            <AgreementActionBanner />
            <Card bordered style={{ borderRadius: "12px", border: "1px solid #bfdbfe" }} bodyStyle={{ padding: "16px" }}
              title={<Space><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb" }} /><Text strong style={{ color: "#2563eb", fontSize: "13px" }}>Agreement Documents</Text></Space>}
            >
              {visibleAgreementDocuments.length > 0
                ? visibleAgreementDocuments.map((doc) => <DocCard key={doc._id || doc.url} doc={doc} typeLabel={agreementTypeLabel} accentColor="#2563eb" bgColor="#eff6ff" borderColor="#bfdbfe" iconBg="#dbeafe" />)
                : <Text type="secondary" style={{ fontSize: "13px" }}>No agreement documents uploaded.</Text>}
            </Card>
          </Col>
        </Row>
      </div>

      {/* MODALS */}
      <Modal title={<Space><CloseOutlined style={{ color: "#ef4444" }} /><Text strong>Reject Verification - Provide Reason</Text></Space>}
        open={rejectModalVisible} onCancel={() => { setRejectModalVisible(false); setRejectionReason(''); }} centered
        footer={[
          <Button key="cancel" onClick={() => { setRejectModalVisible(false); setRejectionReason(''); }}>Cancel</Button>,
          <Button key="reject" danger loading={kycActionLoading} onClick={handleKycReject} icon={<CloseOutlined />} style={{ fontWeight: "600" }}>Confirm Reject</Button>
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <TextArea rows={4} placeholder="e.g. Trade license is expired." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} style={{ borderRadius: "8px", borderColor: "#fca5a5" }} />
        </div>
      </Modal>

      <Modal title={<Space><CheckOutlined style={{ color: "#059669" }} /><Text strong>Approve Agreement</Text></Space>}
        open={approveAgreementModal} onCancel={() => { setApproveAgreementModal(false); setApproveRemark(''); }} centered
        footer={[
          <Button key="cancel" onClick={() => { setApproveAgreementModal(false); setApproveRemark(''); }}>Cancel</Button>,
          <Button key="approve" type="primary" loading={approveAgreementLoading} onClick={handleAgreementApprove} icon={<CheckOutlined />} style={{ background: "#059669", borderColor: "#059669", fontWeight: "600" }}>Confirm Approve</Button>
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <TextArea rows={3} placeholder="Remark (optional)" value={approveRemark} onChange={(e) => setApproveRemark(e.target.value)} style={{ borderRadius: "8px", borderColor: "#86efac" }} />
        </div>
      </Modal>

      <Modal title={<Space><ExclamationCircleOutlined style={{ color: "#d97706" }} /><Text strong>Request Changes</Text></Space>}
        open={requestChangesModal} onCancel={() => { setRequestChangesModal(false); setRequestChangesMessage(''); setRequestChangesRemark(''); }} centered
        footer={[
          <Button key="cancel" onClick={() => { setRequestChangesModal(false); setRequestChangesMessage(''); setRequestChangesRemark(''); }}>Cancel</Button>,
          <Button key="send" type="primary" loading={requestChangesLoading} onClick={handleRequestChanges} icon={<EditOutlined />} style={{ background: "#d97706", borderColor: "#d97706", fontWeight: "600" }}>Send Request</Button>
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <Text strong style={{ display: "block", marginBottom: "6px" }}>Message <Text type="danger">*</Text></Text>
          <TextArea rows={3} value={requestChangesMessage} onChange={(e) => setRequestChangesMessage(e.target.value)} style={{ borderRadius: "8px", marginBottom: "16px" }} />
          <Text strong style={{ display: "block", marginBottom: "6px" }}>Remarks <Text type="danger">*</Text></Text>
          <TextArea rows={2} value={requestChangesRemark} onChange={(e) => setRequestChangesRemark(e.target.value)} style={{ borderRadius: "8px" }} />
        </div>
      </Modal>

      <Modal title={<Space><UploadOutlined style={{ color: "#2563eb" }} /><Text strong>Upload Documents</Text></Space>}
        open={agreementModalVisible} onCancel={() => { setAgreementModalVisible(false); setAgreementDocs([{ type: 'main_agreement', name: '', url: '' }]); }} centered
        footer={[
          <Button key="cancel" onClick={() => { setAgreementModalVisible(false); setAgreementDocs([{ type: 'main_agreement', name: '', url: '' }]); }}>Cancel</Button>,
          <Button key="upload" type="primary" loading={agreementLoading} onClick={handleAgreementUpload} icon={<UploadOutlined />} style={{ background: "#2563eb", borderColor: "#2563eb", fontWeight: "600" }}>Upload</Button>
        ]}
      >
        <div style={{ padding: "12px 0" }}>
          {agreementDocs.map((doc, index) => (
            <Card key={index} size="small" bordered style={{ borderRadius: "10px", marginBottom: "12px" }}>
              <Row gutter={[10, 10]} align="middle">
                <Col xs={24} sm={10}>
                  <Select value={doc.type} onChange={(val) => updateAgreementDoc(index, 'type', val)} style={{ width: "100%" }}>
                    <Option value="main_agreement">Main Agreement</Option>
                    <Option value="commission_schedule">Commission Schedule</Option>
                    <Option value="addendum">Addendum</Option>
                  </Select>
                </Col>
                <Col xs={22} sm={12}>
                  <Input placeholder="File name" value={doc.name} onChange={(e) => updateAgreementDoc(index, 'name', e.target.value)} />
                </Col>
                <Col xs={2}><Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeAgreementDoc(index)} /></Col>
                <Col xs={24}><Input placeholder="URL" value={doc.url} onChange={(e) => updateAgreementDoc(index, 'url', e.target.value)} /></Col>
              </Row>
            </Card>
          ))}
          <Button type="dashed" block icon={<PlusOutlined />} onClick={addAgreementDoc}>Add Another</Button>
        </div>
      </Modal>

    </div>
  );
};

export default DeveloperDetail;
