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
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiService } from "../../../manageApi/utils/custom.apiservice";
import { showToast } from "../../../manageApi/utils/toast";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const THEME = { primary: "#6d28d9" };

const STATUS_COLOR = {
  pending:  "orange",
  approved: "green",
  rejected: "red",
};

export default function AdminPropertyDetail() {
  const { id } = useParams(); // /dashboard/admin/properties/:id
  const navigate = useNavigate();

  const [property, setProperty]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject modal
  const [rejectModal, setRejectModal]   = useState(false);
  const [rejectForm]                    = Form.useForm();
//new 
const [requestChangesModal, setRequestChangesModal] = useState(false);
const [requestChangesForm] = Form.useForm();
  // ─── Fetch single property ──────────────────────────────────
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

  // ─── Approve ────────────────────────────────────────────────
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await apiService.patch(`/properties/${id}/approve`);
      showToast("success", "Property approved and published.");
      fetchProperty();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to approve property.");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Reject ─────────────────────────────────────────────────
  const handleReject = async (values) => {
    try {
      setActionLoading(true);
   await apiService.patch(`/properties/${id}/reject`, { rejectionReason: values.reason });

      showToast("success", "Property rejected.");
      setRejectModal(false);
      rejectForm.resetFields();
      fetchProperty();
    } catch (err) {
      console.error(err);
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

  // ─── Loading state ───────────────────────────────────────────
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/dashboard/admin/properties")}
            >
              Back
            </Button>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {property.projectName || "Property Detail"}
              </Title>
              <Text type="secondary">
                {property.listingType === "developer" ? "Off Plan" : "Secondary"} Listing
              </Text>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            <Tag
              color={STATUS_COLOR[property.approvalStatus]}
              style={{ fontSize: 14, padding: "4px 14px" }}
            >
              {property.approvalStatus?.toUpperCase()}
            </Tag>

            {/* Only show action buttons if pending */}
            {isPending && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading}
                  style={{ background: "#16a34a", borderColor: "#16a34a", borderRadius: 8 }}
                  onClick={handleApprove}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={actionLoading}
                  style={{ borderRadius: 8 }}
                  onClick={() => setRejectModal(true)}
                >
                  Reject
                </Button>
                 <Button
      icon={<ClockCircleOutlined />}
      style={{ borderColor: '#f97316', color: '#f97316' }}
      onClick={() => setRequestChangesModal(true)}
    >
      Request Changes
    </Button>
    {property.approvalStatus === 'changes_requested' && property.adminComments && (
  <Alert
    type="warning"
    message={`Changes Requested: ${property.adminComments}`}
    showIcon className="mb-4"
  />
)}
              </>
            )}

            {/* Re-approve if rejected */}
            {isRejected && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={actionLoading}
                style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 8 }}
                onClick={handleApprove}
              >
                Approve Anyway
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Rejection reason banner */}
      {isRejected && property.rejectionReason && (
        <Alert
          type="error"
          message={`Rejection Reason: ${property.rejectionReason}`}
          showIcon
          className="mb-4"
        />
      )}

      <Row gutter={[20, 20]}>

        {/* Left: Property Details */}
        <Col xs={24} lg={16}>

          {/* Photos */}
          {property.photos?.length > 0 && (
            <Card className="shadow-sm rounded-xl mb-4">
              <Title level={5}>Property Photos</Title>
              <Image.PreviewGroup>
                <Row gutter={[8, 8]}>
                  {property.photos.map((url, i) => (
                    <Col key={i} xs={12} md={8}>
                      <Image
                        src={url}
                        alt={`Photo ${i + 1}`}
                        style={{ borderRadius: 8, objectFit: "cover", height: 140, width: "100%" }}
                      />
                    </Col>
                  ))}
                </Row>
              </Image.PreviewGroup>
            </Card>
          )}

          {/* Project Info */}
          <Card className="shadow-sm rounded-xl mb-4">
            <Title level={5}>Project Details</Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Property Name">
                {property.propertyName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Developer Name">
                {property.developerName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {[property.location, property.areaName, property.city, property.area,]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Listing Type">
                <Tag color="purple">
                  {property.propertySubType === "developer" ? "Off Plan" : "Secondary"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Unit Type">
                {property.unitType || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Bedrooms">
                {property.bedrooms || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Price (AED)">
                <Text strong>AED {Number(property.price || 0).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Area">
                {property.area ? `${property.area} sqft` : "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Description */}
          {property.description && (
            <Card className="shadow-sm rounded-xl mb-4">
              <Title level={5}>Description</Title>
              <Text>{property.description}</Text>
            </Card>
          )}

          {/* Location Details */}
          {(property.buildingNo || property.street || property.googleLocation) && (
            <Card className="shadow-sm rounded-xl mb-4">
              <Title level={5}>Location Details</Title>
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                {property.buildingNo && (
                  <Descriptions.Item label="Building No">{property.buildingNo}</Descriptions.Item>
                )}
                {property.street && (
                  <Descriptions.Item label="Street">{property.street}</Descriptions.Item>
                )}
                {property.city && (
                  <Descriptions.Item label="City">{property.city}</Descriptions.Item>
                )}
                {property.country && (
                  <Descriptions.Item label="Country">{property.country}</Descriptions.Item>
                )}
                {property.googleLocation && (
                  <Descriptions.Item label="Maps Link" span={2}>
                    <a href={property.googleLocation} target="_blank" rel="noreferrer">
                      {property.googleLocation}
                    </a>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* Right: Meta Panel */}
        <Col xs={24} lg={8}>

          {/* Status Card */}
          <Card className="shadow-sm rounded-xl mb-4">
            <Title level={5}>Listing Info</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Status">
                <Tag color={STATUS_COLOR[property.approvalStatus]}>
                  {property.approvalStatus?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID">
                <Text copyable style={{ fontSize: 12 }}>{property._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(property.createdAt).toLocaleDateString("en-AE", {
                  day: "2-digit", month: "short", year: "numeric"
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Listing Type">
                {property.listingType === "developer" ? "Off Plan" : "Secondary"}
              </Descriptions.Item>
              <Descriptions.Item label="Project Type">
                {property.projectType || "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Commission Card */}
          <Card className="shadow-sm rounded-xl mb-4">
            <Title level={5}>Commission</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Share Commission">
                <Tag color={property.shareCommission ? "green" : "default"}>
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

          {/* Quick Actions */}
          {isPending && (
            <Card className="shadow-sm rounded-xl">
              <Title level={5}>Quick Actions</Title>
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
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal
        title="Reject Property"
        open={rejectModal}
        onCancel={() => { setRejectModal(false); rejectForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleReject}
        >
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
            <Button onClick={() => { setRejectModal(false); rejectForm.resetFields(); }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              danger
              loading={actionLoading}
            >
              Confirm Rejection
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}