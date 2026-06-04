import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "../../../../../../manageApi/utils/custom.apiservice"; 
import { showToast } from "../../../../../../manageApi/utils/toast"; 
import {
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaBox,
  FaServicestack,
  FaMapMarkerAlt,
  FaUserCheck,
  FaAward,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaClock,
} from "react-icons/fa";
import { PiShieldCheck } from "react-icons/pi";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Card,
  Modal,
  Button,
  Input,
  Spin,
  Avatar,
  Tag,
  Tooltip,
  Typography,
  Image,
  Space,
  Row,
  Col,
  Empty,
  Badge,
  Statistic,
  Descriptions,
} from "antd";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Define base URL for local images only
const BASE_URL = "http://localhost:5000";

// --- HELPER: Handle S3 URLs vs Local Paths ---
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("https")) {
    return path; // Return S3/External URL as is
  }
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
};

const FreelancerProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const params = new URLSearchParams(location.search);
  const freelancerId = params.get("freelancerId");

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [reason, setReason] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const theme = {
    primary: "#7e22ce",
    primaryLight: "#a855f7",
    secondary: "#f3e8ff",
    text: "#1f2937",
    textLight: "#6b7280",
    background: "#faf5ff",
    cardBg: "#ffffff",
  };

  const fetchFreelancer = async () => {
    if (!freelancerId) return;
    setLoading(true);
    try {
      const response = await apiService.get(`/freelancer?freelancerId=${freelancerId}`);
      if (response.success) {
        setFreelancer(response.freelancer);
      }
    } catch (error) {
      console.error("Error fetching freelancer:", error);
      showToast("Failed to load freelancer details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancer();
  }, [freelancerId]);

  // --- Document Logic ---
  const openVerificationModal = (docId, approving) => {
    setSelectedDocId(docId);
    setIsApproving(approving);
    setReason("");
    setSuggestion("");
    setVerificationModalOpen(true);
  };

  const handleSubmitVerification = async () => {
    if (!isApproving && !reason.trim()) {
      showToast("Reason is required for rejection", "error");
      return;
    }

    setVerifyingDoc(selectedDocId);
    try {
      const response = await apiService.put("/freelancer/document/verification/check", {
        freelancerId: freelancerId,
        documentId: selectedDocId,
        verified: isApproving,
        reason: reason.trim(),
        suggestion: suggestion.trim(),
      });
      
      if (response.success) {
        showToast(`Document ${isApproving ? "approved" : "rejected"} successfully`, "success");
        setVerificationModalOpen(false);
        fetchFreelancer();
      } else {
        showToast(response.message || "Failed to update document", "error");
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to update document", "error");
    } finally {
      setVerifyingDoc(null);
    }
  };

  const downloadDocument = (path) => {
    window.open(getImageUrl(path), "_blank");
  };

  const openImageModal = (document) => {
    setSelectedDocument(document);
    setImageViewerOpen(true);
  };

  const closeImageModal = () => {
    setImageViewerOpen(false);
    setSelectedDocument(null);
  };

  const statusConfig = {
    0: { color: "#f59e0b", label: "Pending", icon: <FaClock /> },
    1: { color: "#10b981", label: "Approved", icon: <FaRegCheckCircle /> },
    2: { color: "#ef4444", label: "Rejected", icon: <FaRegTimesCircle /> },
    3: { color: "#6b7280", label: "Suspended", icon: <PiShieldCheck /> },
  };

  const documentTypeLabel = {
    resume: "Resume",
    portfolio: "Portfolio",
    identityProof: "Identity Proof",
    addressProof: "Address Proof",
    certificate: "Certificate",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Spin size="large" style={{ color: theme.primary }} />
        <Text className="mt-4 text-gray-500">Loading Profile...</Text>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center shadow-md">
          <FaUserCheck className="text-4xl text-gray-400 mx-auto mb-4" />
          <Title level={4}>Freelancer Not Found</Title>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const fullName = `${freelancer.name?.first_name || ""} ${freelancer.name?.last_name || ""}`.trim();
  const currentStatus = statusConfig[freelancer.status_info?.status] || statusConfig[0];

  return (
    <div className="min-h-screen p-6" style={{ background: theme.background }}>
      {/* --- HEADER --- */}
      <div className="mb-6">
        <Button
          icon={<FaArrowLeft />}
          onClick={() => navigate(-1)}
          className="mb-4 text-purple-700 border-purple-200 hover:text-purple-900"
        >
          Back
        </Button>

        <Card 
          className="shadow-xl border-0 overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <div 
            className="p-8" 
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryLight} 100%)` }}
          >
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={4} className="text-center md:text-left">
                {/* --- PROFILE IMAGE with S3 Support --- */}
                <Avatar
                  size={120}
                  src={getImageUrl(freelancer.profile_image)}
                  className="border-4 border-white/30 shadow-lg bg-white"
                  icon={<FaUserCheck className="text-gray-400"/>}
                />
              </Col>
              
              <Col xs={24} md={12} className="text-white text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <Title level={2} style={{ color: 'white', margin: 0 }}>{fullName}</Title>
                  <Tag color={currentStatus.color} className="border-0 font-bold px-3 py-1 rounded-full">
                    {currentStatus.icon} {currentStatus.label}
                  </Tag>
                </div>
                
                <Space direction="vertical" size={1} className="text-purple-100">
                  <span className="flex items-center gap-2"><FaEnvelope /> {freelancer.email}</span>
                  <span className="flex items-center gap-2">
                    <FaPhone /> {freelancer.mobile?.country_code} {freelancer.mobile?.number}
                    {freelancer.is_mobile_verified && <Badge status="success" text={<span className="text-green-300 text-xs">Verified</span>} />}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaMapMarkerAlt /> {freelancer.location?.city}, {freelancer.location?.country}
                  </span>
                </Space>
              </Col>

              <Col xs={24} md={8}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic 
                      title={<span className="text-purple-200">Experience</span>} 
                      value={freelancer.professional?.experience_years || 0} 
                      suffix="Years" 
                      valueStyle={{ color: 'white' }} 
                      prefix={<FaAward />} 
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title={<span className="text-purple-200">Services</span>} 
                      value={freelancer.services_offered?.length || 0} 
                      valueStyle={{ color: 'white' }} 
                      prefix={<FaServicestack />} 
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Card>
      </div>

      <Row gutter={[24, 24]}>
        {/* --- LEFT COLUMN (Info) --- */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" className="w-full" size="large">
            
            {/* Basic Info */}
            <Card title={<span>Basic Info</span>} className="shadow-sm">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Languages">
                  <Space wrap>
                    {freelancer.languages?.map(l => (
                      <Tag key={l} color="purple">{l}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Joined">
                  {freelancer.meta?.created_at ? new Date(freelancer.meta.created_at).toLocaleDateString() : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Professional */}
            <Card title={<span> Professional</span>} className="shadow-sm">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Availability">
                  <Tag color="blue">{freelancer.professional?.availability || "Not specified"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Bio">
                  <Paragraph ellipsis={{ rows: 3, expandable: true }}>
                    {freelancer.professional?.bio || "No bio provided"}
                  </Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Location */}
            <Card title={<span> Location</span>} className="shadow-sm">
              <Descriptions column={1} size="small">
                <Descriptions.Item >
                  {freelancer.location ? (
                    <div className="flex flex-col gap-1">
                      <span><strong>City:</strong> {freelancer.location.city || "—"}</span>
                      <span><strong>State:</strong> {freelancer.location.state || "—"}</span>
                      <span><strong>Country:</strong> {freelancer.location.country || "—"}</span>
                      <span><strong>PO Box:</strong> {freelancer.location.po_box || "—"}</span>
                    </div>
                  ) : (
                    <Tag color="default">Location not provided</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Payment */}
            <Card title={<span> Payment Details</span>} className="shadow-sm">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Method">{freelancer.payment?.preferred_method || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Currency">
                  {freelancer.payment?.preferred_currency?.code ? 
                    `${freelancer.payment.preferred_currency.code} (${freelancer.payment.preferred_currency.symbol})` : 
                    "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Vat Number">{freelancer.payment?.vat_number || "N/A"}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Space>
        </Col>

        {/* --- RIGHT COLUMN (Services & Docs) --- */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" className="w-full" size="large">
            
            {/* Services */}
            <Card title={<span>Services Offered</span>} className="shadow-sm">
              {freelancer.services_offered?.length > 0 ? (
                freelancer.services_offered.map((service) => (
                  <Card key={service._id} type="inner" className="mb-4 bg-gray-50 border-gray-200">
                    <Title level={5} className="m-0 text-purple-800">{service.category?.label || "Unnamed Service"}</Title>
                    <Paragraph className="text-gray-600 mb-3">{service.description || "No description provided"}</Paragraph>

                    {service.subcategories?.length > 0 ? (
                      <div className="space-y-2">
                        {service.subcategories.map((sub) => (
                          <div key={sub._id} className="flex justify-between items-center bg-white p-3 rounded border">
                            <Text strong>{sub.type?.label || "Unnamed Sub-Service"}</Text>
                            <Tag color="green" className="text-sm px-3 py-1">
                              {freelancer.payment?.preferred_currency?.symbol || "$"} {sub.price_range || "Not set"} {sub.unit ? `/ ${sub.unit}` : ""}
                            </Tag>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Text type="secondary">No sub-services added</Text>
                    )}

                    {/* Service Images S3 Support */}
                    {service.images?.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {service.images.slice(0, 3).map((img, i) => (
                          <Image
                            key={i}
                            width={70}
                            height={70}
                            src={getImageUrl(img)}
                            className="rounded border"
                            alt="Service"
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Empty description="No Services Listed" />
              )}
            </Card>

            {/* Documents (Admin Verification) */}
            <Card title={<span>Documents & Verification</span>} className="shadow-sm">
              <Row gutter={[16, 16]}>
                {freelancer.documents?.map((doc) => (
                  <Col xs={24} sm={12} key={doc._id}>
                    <Card size="small" className="h-full border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <Text strong className="capitalize">{documentTypeLabel[doc.type] || doc.type}</Text>
                        <Badge 
                          status={doc.verified ? "success" : doc.reason ? "error" : "processing"} 
                          text={doc.verified ? "Verified" : doc.reason ? "Rejected" : "Pending"} 
                        />
                      </div>
                      
                      {/* Document Preview Thumbnail */}
                      <div className="bg-gray-100 h-32 flex items-center justify-center rounded mb-3 overflow-hidden cursor-pointer" onClick={() => openImageModal(doc)}>
                         <Image 
                            src={getImageUrl(doc.path)} 
                            preview={false} 
                            height="100%" 
                            width="100%" 
                            style={{objectFit: 'cover'}}
                            fallback="https://via.placeholder.com/300x200?text=Document+File"
                         />
                      </div>

                      <Space className="w-full justify-between">
                        <Space>
                          <Tooltip title="View Full">
                            <Button size="small" icon={<EyeOutlined />} onClick={() => openImageModal(doc)} />
                          </Tooltip>
                          <Tooltip title="Download">
                            <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadDocument(doc.path)} />
                          </Tooltip>
                        </Space>

                        {/* Admin Actions */}
                        {!doc.verified && !doc.reason && (
                          <Space>
                            <Tooltip title="Approve">
                              <Button size="small" type="primary" className="bg-green-500 border-green-500 hover:bg-green-600" icon={<CheckOutlined />} onClick={() => openVerificationModal(doc._id, true)} />
                            </Tooltip>
                            <Tooltip title="Reject">
                              <Button size="small" type="primary" danger icon={<CloseOutlined />} onClick={() => openVerificationModal(doc._id, false)} />
                            </Tooltip>
                          </Space>
                        )}
                        
                        {doc.reason && <div className="text-xs text-red-500">Reason: {doc.reason}</div>}
                      </Space>
                      
                      <div className="text-xs text-gray-400 mt-2 text-right">
                        Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "N/A"}
                      </div>
                    </Card>
                  </Col>
                ))}
                {(!freelancer.documents || freelancer.documents.length === 0) && <Empty className="w-full" description="No documents uploaded" />}
              </Row>
            </Card>

            {/* Portfolio */}
            {freelancer.portfolio?.length > 0 && (
              <Card title={<span><FaBox className="mr-2 text-purple-600"/> Portfolio</span>} className="shadow-sm">
                <Row gutter={[16, 16]}>
                  {freelancer.portfolio.map((item, idx) => (
                    <Col xs={24} md={12} key={idx}>
                      <Card hoverable className="h-full" 
                        cover={item.images?.[0] && (
                          <img alt="portfolio" src={getImageUrl(item.images[0])} className="h-40 object-cover" />
                        )}
                      >
                        <Card.Meta 
                          title={item.title || "Untitled Project"}
                          description={
                            <div>
                              <Text type="secondary" className="text-xs">{item.category?.name || "Uncategorized"} - {item.subcategory?.name || "No subcategory"}</Text>
                              <Paragraph ellipsis={{ rows: 2 }} className="mt-1 mb-0">{item.description || "No description"}</Paragraph>
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

          </Space>
        </Col>
      </Row>

      {/* --- MODALS --- */}
      
      {/* Image Preview Modal using S3 URL */}
      <Modal open={imageViewerOpen} onCancel={closeImageModal} footer={null} width={800} centered>
        {selectedDocument && (
          <img 
            src={getImageUrl(selectedDocument.path)} 
            alt="Document" 
            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/800x600?text=Document+Not+Found";
            }}
          />
        )}
      </Modal>

      {/* Verification Modal */}
      <Modal
        open={verificationModalOpen}
        onCancel={() => setVerificationModalOpen(false)}
        title={isApproving ? "Approve Document" : "Reject Document"}
        footer={[
          <Button key="back" onClick={() => setVerificationModalOpen(false)}>Cancel</Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger={!isApproving}
            className={isApproving ? "bg-green-600 border-green-600 hover:bg-green-700" : ""}
            loading={verifyingDoc === selectedDocId}
            onClick={handleSubmitVerification}
          >
            {isApproving ? "Approve" : "Reject"}
          </Button>
        ]}
      >
        {!isApproving && (
          <div className="mb-4">
            <Text strong className="text-red-500">Reason for Rejection *</Text>
            <TextArea 
              rows={3} 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="e.g. Document is blurry, incomplete information, etc." 
              required
            />
          </div>
        )}
        <div>
          <Text strong>Suggestion (Optional)</Text>
          <TextArea 
            rows={2} 
            value={suggestion} 
            onChange={(e) => setSuggestion(e.target.value)} 
            placeholder="e.g. Please upload a clearer scan, provide complete address proof, etc." 
          />
        </div>
      </Modal>

    </div>
  );
};

export default FreelancerProfile;