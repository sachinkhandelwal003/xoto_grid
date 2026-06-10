import {
  Card,
  Typography,
  Tag,
  Button,
  Descriptions,
  Select,
  Input,
  Modal,
  Form,
  Row,
  Col,
  Divider,
  Image,
  Space,
  Alert,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,          // ✅ added missing icon
  EnvironmentOutlined,
  HomeOutlined,
  BuildOutlined,
  KeyOutlined,
  BankOutlined,
  WalletOutlined,
  TagOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../manageApi/utils/toast";

const { Title, Text } = Typography;
const { TextArea } = Input;

const THEME = {
  primary: "#5c039b",      // deep purple
  secondary: "#7c3aed",    // lighter purple
  gradient: "linear-gradient(135deg, #4A027C 0%, #7C3AED 100%)",
};

const STATUS_COLOR = {
  pending:  "orange",
  approved: "green",
  rejected: "red",
  changes_requested: "orange",
};

export default function AdminPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModal, setRejectModal]   = useState(false);
  const [rejectForm]                    = Form.useForm();
  const [requestChangesModal, setRequestChangesModal] = useState(false);
  const [requestChangesForm] = Form.useForm();

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const json = await apiService.get(`/properties/${id}`);
      setProperty(json?.data || null);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load property.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperty(); }, [id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await apiService.patch(`/properties/${id}/approve`);
      showToast("success", "Property approved and published.");
      fetchProperty();
    } catch (err) {
      showToast("error", "Failed to approve property.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (values) => {
    try {
      setActionLoading(true);
      await apiService.patch(`/properties/${id}/reject`, { rejectionReason: values.reason });
      showToast("success", "Property rejected.");
      setRejectModal(false);
      rejectForm.resetFields();
      fetchProperty();
    } catch (err) {
      showToast("error", "Failed to reject property.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async (values) => {
    try {
      setActionLoading(true);
      await apiService.patch(`/properties/${id}/request-changes`, {
        adminComments: values.adminComments
      });
      showToast('success', 'Changes requested successfully.');
      setRequestChangesModal(false);
      requestChangesForm.resetFields();
      fetchProperty();
    } catch {
      showToast('error', 'Failed to request changes.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <Alert type="error" message="Property not found." />
        <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const isPending  = property.approvalStatus === "pending";
  const isApproved = property.approvalStatus === "approved";
  const isRejected = property.approvalStatus === "rejected";
  const isChangesRequested = property.approvalStatus === "changes_requested";

  // Helper to get price display
  const getPrice = () => {
    if (property.price_min && property.price_max)
      return `AED ${Number(property.price_min).toLocaleString()} – ${Number(property.price_max).toLocaleString()}`;
    if (property.price) return `AED ${Number(property.price).toLocaleString()}`;
    return "Contact Us";
  };

  // Image source
  const imgSrc = property.photos?.[0] ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800";

  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa", padding: "24px 32px" }}>

      {/* ── Back button ── */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/dashboard/admin/properties")}
        style={{ borderRadius: 8, marginBottom: 24, fontWeight: 500 }}
      >
        Back to Properties
      </Button>

      {/* ── Header Banner ── */}
      <div
        style={{
          background: THEME.gradient,
          borderRadius: 16,
          padding: "28px 32px",
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 8px 24px rgba(92,3,155,0.15)",
        }}
      >
        <div>
          <Title level={2} style={{ color: "#fff", margin: 0, fontWeight: 800 }}>
            {property.projectName || property.propertyName || "Property Detail"}
          </Title>
          <Space style={{ marginTop: 8 }}>
            <Tag color="white" style={{ color: "#5c039b", fontWeight: 600, borderRadius: 20, padding: "2px 14px" }}>
              {property.propertySubType === "off_plan" ? "Off-Plan" : property.propertySubType === "rental" ? "Rental" : "Secondary"}
            </Tag>
            {property.city && (
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {[property.city, property.country].filter(Boolean).join(", ")}
              </Text>
            )}
          </Space>
        </div>

        <div>
          <Tag
            color={STATUS_COLOR[property.approvalStatus]}
            style={{
              fontSize: 14,
              padding: "4px 20px",
              borderRadius: 20,
              fontWeight: 600,
              border: "2px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
            }}
          >
            {property.approvalStatus?.replace(/_/g, " ").toUpperCase()}
          </Tag>
        </div>
      </div>

      {/* ── Action buttons for pending / changes requested ── */}
      {(isPending || isChangesRequested) && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "16px 24px",
            marginBottom: 24,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={actionLoading}
            style={{
              background: "#16a34a",
              borderColor: "#16a34a",
              borderRadius: 8,
              fontWeight: 600,
            }}
            onClick={handleApprove}
          >
            Approve & Publish
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            loading={actionLoading}
            style={{ borderRadius: 8, fontWeight: 600 }}
            onClick={() => setRejectModal(true)}
          >
            Reject
          </Button>
          <Button
            icon={<ClockCircleOutlined />}
            style={{ borderColor: '#f97316', color: '#f97316', borderRadius: 8, fontWeight: 600 }}
            onClick={() => setRequestChangesModal(true)}
          >
            Request Changes
          </Button>
        </div>
      )}

      {/* Re‑approve if rejected */}
      {isRejected && (
        <div style={{ marginBottom: 24 }}>
          <Alert
            type="error"
            message={`Rejection Reason: ${property.rejectionReason || "N/A"}`}
            showIcon
            style={{ borderRadius: 12 }}
            action={
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={actionLoading}
                style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 8 }}
                onClick={handleApprove}
              >
                Approve Anyway
              </Button>
            }
          />
        </div>
      )}

      {property.approvalStatus === 'changes_requested' && property.adminComments && (
        <Alert
          type="warning"
          message={`Changes Requested: ${property.adminComments}`}
          showIcon
          style={{ borderRadius: 12, marginBottom: 24 }}
        />
      )}

      {/* ── Main Content Grid ── */}
      <Row gutter={[24, 24]}>
        {/* LEFT: Photos & Details */}
        <Col xs={24} lg={16}>
          {/* Photos */}
          {property.photos?.length > 0 && (
            <Card
              className="shadow-sm"
              style={{
                borderRadius: 14,
                marginBottom: 24,
                border: "1px solid #f0f0f0",
              }}
              title={
                <Space>
                  <PictureOutlined style={{ color: THEME.primary }} />
                  <Text strong style={{ fontSize: 15 }}>Property Photos</Text>
                </Space>
              }
            >
              <Image.PreviewGroup>
                <Row gutter={[12, 12]}>
                  {property.photos.map((url, i) => (
                    <Col key={i} xs={12} sm={8} md={6}>
                      <Image
                        src={url}
                        alt={`Photo ${i + 1}`}
                        style={{
                          borderRadius: 10,
                          objectFit: "cover",
                          height: 140,
                          width: "100%",
                          border: "1px solid #f0f0f0",
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </Card>
          )}

          {/* Project Details Card */}
          <Card
            className="shadow-sm"
            style={{
              borderRadius: 14,
              marginBottom: 24,
              border: "1px solid #f0f0f0",
            }}
            title={
              <Space>
                <HomeOutlined style={{ color: THEME.primary }} />
                <Text strong style={{ fontSize: 15 }}>Project Details</Text>
              </Space>
            }
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" labelStyle={{ fontWeight: 600, color: "#4b5563", background: "#faf5ff" }}>
              <Descriptions.Item label="Property Name">{property.propertyName || "—"}</Descriptions.Item>
              <Descriptions.Item label="Developer">{property.developerName || property.developer?.name || "—"}</Descriptions.Item>
              <Descriptions.Item label="Location">
                {[property.location, property.areaName, property.city, property.area].filter(Boolean).join(", ") || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Unit Type">{property.unitType || "—"}</Descriptions.Item>
              <Descriptions.Item label="Bedrooms">{property.bedrooms || "—"}</Descriptions.Item>
              <Descriptions.Item label="Price">{getPrice()}</Descriptions.Item>
              <Descriptions.Item label="Area (sqft)">{property.area || "—"}</Descriptions.Item>
              <Descriptions.Item label="Listing Type">
                <Tag color="purple" style={{ borderRadius: 20 }}>
                  {property.propertySubType === "off_plan" ? "Off-Plan" : property.propertySubType === "rental" ? "Rental" : "Secondary"}
                </Tag>
              </Descriptions.Item>
              {property.bathrooms && (
                <Descriptions.Item label="Bathrooms">{property.bathrooms}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Developer Info Card */}
          {(property.developer?.name || property.developerName) && (
            <Card
              className="shadow-sm"
              style={{
                borderRadius: 14,
                marginBottom: 24,
                border: "1px solid #f0f0f0",
              }}
              title={
                <Space>
                  <BankOutlined style={{ color: THEME.primary }} />
                  <Text strong style={{ fontSize: 15 }}>Developer Information</Text>
                </Space>
              }
            >
              <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: 600, color: "#4b5563", background: "#faf5ff" }}>
                <Descriptions.Item label="Name">{property.developer?.name || property.developerName || "—"}</Descriptions.Item>
                <Descriptions.Item label="Email">{property.developer?.email || "—"}</Descriptions.Item>
                <Descriptions.Item label="Phone">{property.developer?.phone_number || "—"}</Descriptions.Item>
                <Descriptions.Item label="Description">
                  {property.developer?.description || "No description available"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Description */}
          {property.description && (
            <Card
              className="shadow-sm"
              style={{
                borderRadius: 14,
                marginBottom: 24,
                border: "1px solid #f0f0f0",
              }}
              title={<Text strong style={{ fontSize: 15 }}>Description</Text>}
            >
              <Text style={{ color: "#4b5563", lineHeight: 1.7 }}>{property.description}</Text>
            </Card>
          )}

          {/* Location Details */}
          {(property.buildingNo || property.street || property.googleLocation) && (
            <Card
              className="shadow-sm"
              style={{
                borderRadius: 14,
                marginBottom: 24,
                border: "1px solid #f0f0f0",
              }}
              title={<Text strong style={{ fontSize: 15 }}>Location Details</Text>}
            >
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" labelStyle={{ fontWeight: 600, color: "#4b5563", background: "#faf5ff" }}>
                {property.buildingNo && <Descriptions.Item label="Building No">{property.buildingNo}</Descriptions.Item>}
                {property.street && <Descriptions.Item label="Street">{property.street}</Descriptions.Item>}
                {property.city && <Descriptions.Item label="City">{property.city}</Descriptions.Item>}
                {property.country && <Descriptions.Item label="Country">{property.country}</Descriptions.Item>}
                {property.googleLocation && (
                  <Descriptions.Item label="Maps Link" span={2}>
                    <a href={property.googleLocation} target="_blank" rel="noreferrer" style={{ color: THEME.primary }}>
                      {property.googleLocation}
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* RIGHT: Meta Panel */}
        <Col xs={24} lg={8}>
          {/* Listing Info Card */}
          <Card
            className="shadow-sm"
            style={{
              borderRadius: 14,
              marginBottom: 24,
              border: "1px solid #f0f0f0",
            }}
            title={
              <Space>
                <TagOutlined style={{ color: THEME.primary }} />
                <Text strong style={{ fontSize: 15 }}>Listing Info</Text>
              </Space>
            }
          >
            <Descriptions column={1} size="small" labelStyle={{ fontWeight: 600, color: "#4b5563" }}>
              <Descriptions.Item label="Status">
                <Tag color={STATUS_COLOR[property.approvalStatus]} style={{ borderRadius: 20 }}>
                  {property.approvalStatus?.replace(/_/g, " ").toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Property ID">
                <Text copyable style={{ fontSize: 12 }}>{property._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(property.createdAt).toLocaleDateString("en-AE", {
                  day: "2-digit", month: "short", year: "numeric"
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Listing Type">
                {property.propertySubType === "off_plan" ? "Off-Plan" : "Secondary"}
              </Descriptions.Item>
              <Descriptions.Item label="Project Type">{property.projectType || "—"}</Descriptions.Item>
              {property.builtUpArea && (
                <Descriptions.Item label="Built-up Area">{property.builtUpArea} sqft</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Commission Card */}
          <Card
            className="shadow-sm"
            style={{
              borderRadius: 14,
              marginBottom: 24,
              border: "1px solid #f0f0f0",
            }}
            title={
              <Space>
                <WalletOutlined style={{ color: THEME.primary }} />
                <Text strong style={{ fontSize: 15 }}>Commission</Text>
              </Space>
            }
          >
            <Descriptions column={1} size="small" labelStyle={{ fontWeight: 600, color: "#4b5563" }}>
              <Descriptions.Item label="Share Commission">
                <Tag color={property.shareCommission ? "green" : "default"} style={{ borderRadius: 20 }}>
                  {property.shareCommission ? "Yes" : "No"}
                </Tag>
              </Descriptions.Item>
              {property.shareCommission && (
                <Descriptions.Item label="Commission %">
                  {property.commission || 0}%
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Quick Actions for pending */}
          {isPending && (
            <Card
              className="shadow-sm"
              style={{
                borderRadius: 14,
                border: "1px solid #f0f0f0",
              }}
              title={<Text strong style={{ fontSize: 15 }}>Quick Actions</Text>}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  block
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading}
                  style={{ background: "#16a34a", borderColor: "#16a34a", borderRadius: 8 }}
                  onClick={handleApprove}
                >
                  Approve & Publish
                </Button>
                <Button
                  block
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={actionLoading}
                  style={{ borderRadius: 8 }}
                  onClick={() => setRejectModal(true)}
                >
                  Reject with Reason
                </Button>
                <Button
                  block
                  icon={<ClockCircleOutlined />}
                  style={{ borderColor: '#f97316', color: '#f97316', borderRadius: 8 }}
                  onClick={() => setRequestChangesModal(true)}
                >
                  Request Changes
                </Button>
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      {/* ── Reject Modal ── */}
      <Modal
        title="Reject Property"
        open={rejectModal}
        onCancel={() => { setRejectModal(false); rejectForm.resetFields(); }}
        footer={null}
        destroyOnClose
        centered
        bodyStyle={{ padding: "24px" }}
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[{ required: true, message: "Please provide a rejection reason." }]}
          >
            <TextArea
              rows={4}
              placeholder="e.g. Incomplete information, invalid photos, wrong pricing..."
            />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button onClick={() => { setRejectModal(false); rejectForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" danger loading={actionLoading}>
              Confirm Rejection
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ── Request Changes Modal ── */}
      <Modal
        title="Request Changes"
        open={requestChangesModal}
        onCancel={() => { setRequestChangesModal(false); requestChangesForm.resetFields(); }}
        footer={null}
        destroyOnClose
        centered
        bodyStyle={{ padding: "24px" }}
      >
        <Form form={requestChangesForm} layout="vertical" onFinish={handleRequestChanges}>
          <Form.Item
            name="adminComments"
            label="What needs to be changed?"
            rules={[{ required: true, message: "Please describe the required changes." }]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the changes the developer needs to make..."
            />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button onClick={() => { setRequestChangesModal(false); requestChangesForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={actionLoading}
              style={{ background: THEME.primary, borderColor: THEME.primary }}
            >
              Send Request
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}