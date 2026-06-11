import {
  Card,
  Typography,
  Tag,
  Button,
  Descriptions,
  Input,
  Modal,
  Form,
  Row,
  Col,
  Image,
  Space,
  Alert,
  Spin,
  Progress,
  Upload,
  Popover,
  Tooltip,
  Divider,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  BuildOutlined,
  WalletOutlined,
  TeamOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  QrcodeOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  FolderOpenOutlined,
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
  pending:           "orange",
  approved:          "green",
  rejected:          "red",
  changes_requested: "gold",
  draft:             "default",
};

const SUBTYPE_LABEL = {
  off_plan:   "Off-Plan",
  secondary:  "Secondary",
  rental:     "Rental",
  commercial: "Commercial",
};

const SUBTYPE_COLOR = {
  off_plan:   "purple",
  secondary:  "blue",
  rental:     "green",
  commercial: "orange",
};

// collect all photos from both legacy + new media schema
const collectPhotos = (p) => {
  const list = [];
  const med  = p?.media;
  if (med) {
    if (med.mainLogo) list.push(med.mainLogo);
    ["architectureImages", "interiorImages", "lobbyImages", "otherImages"].forEach(k => {
      if (Array.isArray(med[k])) list.push(...med[k].filter(Boolean));
    });
  }
  if (Array.isArray(p?.photos)) list.push(...p.photos.filter(u => u && !list.includes(u)));
  else if (p?.photos && typeof p.photos === "object") {
    Object.values(p.photos).forEach(arr => {
      if (Array.isArray(arr)) arr.forEach(u => { if (u && !list.includes(u)) list.push(u); });
    });
  }
  if (p?.mainLogo && !list.includes(p.mainLogo)) list.push(p.mainLogo);
  return list;
};

export default function AdminPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property,       setProperty]       = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [actionLoading,  setActionLoading]  = useState(false);
  const [rejectModal,    setRejectModal]    = useState(false);
  const [changesModal,   setChangesModal]   = useState(false);
  const [rejectForm]                        = Form.useForm();
  const [changesForm]                       = Form.useForm();

  // Compliance fields
  const [qrCodeUrl,       setQrCodeUrl]       = useState("");
  const [trakheesiId,     setTrakheesiId]     = useState("");
  const [qrUploading,     setQrUploading]     = useState(false);
  const [complianceSaving, setComplianceSaving] = useState(false);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const json = await apiService.get(`/properties/${id}`);
      const data = json?.data?.data || json?.data || null;
      setProperty(data);
      if (data?.qrCode)              setQrCodeUrl(data.qrCode);
      if (data?.trakheesiPermitId)   setTrakheesiId(data.trakheesiPermitId);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load property.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompliance = async () => {
    if (!trakheesiId.trim()) {
      message.warning("Please enter the Trakheesi Permit ID.");
      return;
    }
    if (!qrCodeUrl) {
      message.warning("Please upload the QR code image.");
      return;
    }
    try {
      setComplianceSaving(true);
      await apiService.patch(`/properties/${id}`, {
        trakheesiPermitId: trakheesiId.trim(),
        qrCode: qrCodeUrl,
      });
      message.success("Compliance info saved.");
      fetchProperty();
    } catch (err) {
      console.error(err);
      message.error("Failed to save compliance info.");
    } finally {
      setComplianceSaving(false);
    }
  };

  const handleQrUpload = async ({ file, onSuccess, onError }) => {
    try {
      setQrUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiService.upload(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/upload`, fd);
      const url = res?.data?.file?.url || res?.data?.url || res?.file?.url || res?.url;
      if (!url) throw new Error("No URL returned");
      setQrCodeUrl(url);
      message.success("QR code uploaded.");
      onSuccess({ url });
    } catch (err) {
      message.error("QR code upload failed.");
      onError(err);
    } finally {
      setQrUploading(false);
    }
  };

  useEffect(() => { fetchProperty(); }, [id]);

  const handleApprove = async () => {
    if (!qrCodeUrl) {
      message.error("Upload the QR code before approving.");
      return;
    }
    if (!trakheesiId.trim()) {
      message.error("Enter the Trakheesi Permit ID before approving.");
      return;
    }
    try {
      setActionLoading(true);
      // persist compliance if not already saved
      await apiService.patch(`/properties/${id}`, {
        trakheesiPermitId: trakheesiId.trim(),
        qrCode: qrCodeUrl,
      });
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
      await apiService.patch(`/properties/${id}/request-changes`, { adminComments: values.adminComments });
      showToast("success", "Changes requested successfully.");
      setChangesModal(false);
      changesForm.resetFields();
      fetchProperty();
    } catch {
      showToast("error", "Failed to request changes.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" message="Property not found." />
        <Button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const isPending  = property.approvalStatus === "pending";
  const isRejected = property.approvalStatus === "rejected";
  const isChangesReq = property.approvalStatus === "changes_requested";
  const photos     = collectPhotos(property);
  const subType    = property.propertySubType;
  const devDetails = property.developerDetails || {};
  const loc        = property.location || {};
  const lat        = loc.latitude;
  const lng        = loc.longitude;
  // payment plan summary
  const payPlan = property.paymentPlan?.[0];
  const stages  = payPlan?.stages || [];

  // price display
  const priceDisplay = (() => {
    if (property.price_min && property.price_max && property.price_min !== property.price_max)
      return `AED ${Number(property.price_min).toLocaleString()} – ${Number(property.price_max).toLocaleString()}`;
    const p = property.price || property.price_min || 0;
    return p ? `AED ${Number(p).toLocaleString()}` : "—";
  })();

  return (
    <div style={{ padding: "24px 32px", background: "#f8f9fa", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/dashboard/admin/properties")}>
              Back
            </Button>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {property.propertyName || property.projectName || "Property Detail"}
              </Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Tag color={SUBTYPE_COLOR[subType] || "default"}>
                  {SUBTYPE_LABEL[subType] || subType || "—"}
                </Tag>
                <Tag color={STATUS_COLOR[property.approvalStatus] || "default"} style={{ fontSize: 13, padding: "2px 10px" }}>
                  {property.approvalStatus?.replace("_", " ").toUpperCase()}
                </Tag>
                {property.listingStatus && (
                  <Tag color={property.listingStatus === "active" ? "green" : "default"}>
                    {property.listingStatus}
                  </Tag>
                )}
              </Space>
            </div>
          </Space>
        </Col>
        <Col>
          <Space>
            {(isPending || isChangesReq) && (
              <>
                <Tooltip
                  title={!qrCodeUrl || !trakheesiId.trim()
                    ? "Save QR code and Trakheesi Permit ID first"
                    : ""}
                >
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={actionLoading}
                    disabled={!qrCodeUrl || !trakheesiId.trim()}
                    style={{ background: "#16a34a", borderColor: "#16a34a", borderRadius: 8 }}
                    onClick={handleApprove}
                  >
                    Approve
                  </Button>
                </Tooltip>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={actionLoading}
                  style={{ borderRadius: 8 }}
                  onClick={() => setRejectModal(true)}
                >
                  Reject
                </Button>
              </>
            )}
            {isPending && (
              <Button
                icon={<ClockCircleOutlined />}
                style={{ borderColor: "#f97316", color: "#f97316", borderRadius: 8 }}
                onClick={() => setChangesModal(true)}
              >
                Request Changes
              </Button>
            )}
            {isRejected && (
              <Tooltip
                title={!qrCodeUrl || !trakheesiId.trim()
                  ? "Save QR code and Trakheesi Permit ID first"
                  : ""}
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading}
                  disabled={!qrCodeUrl || !trakheesiId.trim()}
                  style={{ background: THEME.primary, borderColor: THEME.primary, borderRadius: 8 }}
                  onClick={handleApprove}
                >
                  Approve Anyway
                </Button>
              </Tooltip>
            )}
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => navigate(`/dashboard/admin/properties/${property._id}/documents`)}
            style={{ borderColor: '#7c3aed', color: '#7c3aed', borderRadius: 8 }}
          >
            Documents
          </Button>
          </Space>
        </Col>
      </Row>

      {/* ── STATUS BANNERS ── */}
      {isChangesReq && property.adminComments && (
        <Alert
          type="warning"
          showIcon
          message="Changes Requested"
          description={property.adminComments}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}
      {isRejected && property.rejectionReason && (
        <Alert
          type="error"
          showIcon
          message="Rejection Reason"
          description={property.rejectionReason}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}
      {property.approvalStatus === "approved" && (
        <Alert
          type="success"
          showIcon
          message="This property is live and approved."
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <Row gutter={[20, 20]}>

        {/* ── LEFT COLUMN ── */}
        <Col xs={24} lg={16}>

          {/* Media — Architecture / Interior / Lobby / Videos */}
          {(() => {
            const med   = property.media || {};
            const arch  = Array.isArray(med.architectureImages)  ? med.architectureImages.filter(Boolean)  : [];
            const inter = Array.isArray(med.interiorImages)      ? med.interiorImages.filter(Boolean)      : [];
            const lobby = Array.isArray(med.lobbyImages)         ? med.lobbyImages.filter(Boolean)         : [];
            const main  = med.mainLogo;
            const vids  = Array.isArray(property.youtubeVideos)  ? property.youtubeVideos.filter(Boolean)  : [];
            const hasAny = main || arch.length || inter.length || lobby.length || vids.length || photos.length;
            if (!hasAny) return null;

            const PhotoGrid = ({ urls, label }) => urls.length === 0 ? null : (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
                  {label} ({urls.length})
                </Text>
                <Image.PreviewGroup>
                  <Row gutter={[8, 8]}>
                    {urls.map((url, i) => (
                      <Col key={i} xs={12} sm={8} md={6}>
                        <Image src={url} alt={`${label} ${i+1}`} style={{ borderRadius: 8, objectFit: "cover", height: 100, width: "100%" }} />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </div>
            );

            return (
              <Card
                title={<><PictureOutlined style={{ marginRight: 8 }} />Media</>}
                style={{ borderRadius: 12, marginBottom: 16 }}
              >
                {main && (
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>Main Logo / Hero</Text>
                    <Image src={main} alt="Main Logo" style={{ height: 120, borderRadius: 8, objectFit: "cover" }} />
                  </div>
                )}
                <PhotoGrid urls={arch}  label="Architecture" />
                <PhotoGrid urls={inter} label="Interiors" />
                <PhotoGrid urls={lobby} label="Lobby" />
                {/* Fallback: photos not in new schema slots */}
                {(() => {
                  const already = [main, ...arch, ...inter, ...lobby].filter(Boolean);
                  const rest = photos.filter(u => !already.includes(u));
                  return <PhotoGrid urls={rest} label="Other Photos" />;
                })()}
                {vids.length > 0 && (
                  <div>
                    <Divider style={{ margin: "12px 0 10px" }} />
                    <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 10 }}>
                      YouTube Videos ({vids.length})
                    </Text>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {vids.map((v, i) => {
                        const vid = v.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/");
                        const embedUrl = vid.includes("embed/") ? vid : null;
                        return embedUrl ? (
                          <iframe
                            key={i}
                            src={embedUrl}
                            width="100%" height="200"
                            style={{ borderRadius: 8, border: 0 }}
                            allowFullScreen
                            title={`Video ${i + 1}`}
                          />
                        ) : (
                          <Button key={i} href={v} target="_blank" size="small">Video {i + 1}</Button>
                        );
                      })}
                    </Space>
                  </div>
                )}
              </Card>
            );
          })()}

          {/* Project Details */}
          <Card
            title={<><BuildOutlined style={{ marginRight: 8 }} />Project Details</>}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Property Name">
                {property.propertyName || property.projectName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Property Sub-Type">
                <Tag color={SUBTYPE_COLOR[subType] || "default"}>
                  {SUBTYPE_LABEL[subType] || subType || "—"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Property Type">
                {property.propertyType || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Project Status">
                {property.projectStatus || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Unit Types">
                {Array.isArray(property.unitTypes) && property.unitTypes.length > 0
                  ? property.unitTypes.join(", ")
                  : (property.unitType || "—")}
              </Descriptions.Item>
              <Descriptions.Item label="Bedrooms">
                {property.bedroomType || (property.bedrooms != null ? (property.bedrooms === 0 ? "Studio" : property.bedrooms) : "—")}
              </Descriptions.Item>
              <Descriptions.Item label="Price Range">
                <Text strong>
                  {property.priceRange?.from || property.price_min
                    ? `AED ${Number(property.priceRange?.from || property.price_min).toLocaleString()}${
                        (property.priceRange?.to || property.price_max)
                          ? ` – AED ${Number(property.priceRange?.to || property.price_max).toLocaleString()}`
                          : ""
                      }`
                    : priceDisplay}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Development Status">
                {property.developmentStatus || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Sale Status">
                <Tag color={
                  property.saleStatus === "Available" ? "green" :
                  property.saleStatus === "Reserved"  ? "orange" :
                  property.saleStatus === "Sold"       ? "red" : "default"
                }>
                  {property.saleStatus || "—"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Furnishing">
                {property.furnishing || property.furnishingStatus || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Built-Up Area">
                {property.builtUpArea ? `${Number(property.builtUpArea).toLocaleString()} sqft` : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Total Units">
                {property.totalUnits || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Floors">
                {property.numberOfFloors || property.floors || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Service Charge">
                {property.serviceCharge ? `${property.serviceCharge} AED/sqft/yr` : "—"}
              </Descriptions.Item>
              {(subType === "off_plan" || property.completionDate) && (
                <>
                  <Descriptions.Item label="Completion Date">
                    {property.completionDate?.quarter
                      ? `${property.completionDate.quarter} ${property.completionDate.year}`
                      : property.completionDate?.fullDate
                        ? new Date(property.completionDate.fullDate).toLocaleDateString("en-AE", { month: "short", year: "numeric" })
                        : (property.completionDate || "—")}
                  </Descriptions.Item>
                  {property.constructionProgress != null && (
                    <Descriptions.Item label="Construction Progress" span={2}>
                      <Progress
                        percent={property.constructionProgress}
                        size="small"
                        strokeColor="#6d28d9"
                        style={{ margin: 0, maxWidth: 240 }}
                        format={p => `${p}%`}
                      />
                    </Descriptions.Item>
                  )}
                </>
              )}
              {subType === "rental" && (
                <Descriptions.Item label="Rent Frequency">
                  {property.rentalFrequency || "—"}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ownership">
                {property.ownershipType || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Parking">
                {property.parkingAllocation || (property.parkingSpaces > 0 ? `${property.parkingSpaces} space(s)` : "—")}
              </Descriptions.Item>
            </Descriptions>

            {/* Description */}
            {(property.description || property.overview) && (
              <>
                <Divider style={{ margin: "16px 0 12px" }} />
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</Text>
                <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.8, marginTop: 8 }}>
                  {property.description || property.overview}
                </p>
              </>
            )}
          </Card>

          {/* Buildings in the Project */}
          {Array.isArray(property.buildings) && property.buildings.length > 0 && (
            <Card
              title={<><BuildOutlined style={{ marginRight: 8 }} />Buildings / Towers ({property.buildings.length})</>}
              style={{ borderRadius: 12, marginBottom: 16 }}
            >
              <Row gutter={[12, 12]}>
                {property.buildings.map((b, i) => (
                  <Col key={i} xs={24} sm={12}>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                      {b.image && (
                        <Image
                          src={b.image}
                          alt={b.title || `Building ${i + 1}`}
                          style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                        />
                      )}
                      <div style={{ padding: "10px 12px" }}>
                        <Text strong style={{ fontSize: 14 }}>{b.title || `Building ${i + 1}`}</Text>
                        {b.description && (
                          <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0", lineHeight: 1.5 }}>{b.description}</p>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Floor Plans & Unit Details */}
          {Array.isArray(property.floorPlans) && property.floorPlans.length > 0 && (
            <Card
              title="Floor Plans & Unit Types"
              style={{ borderRadius: 12, marginBottom: 16 }}
            >
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "flex", background: "#f3f4f6", padding: "8px 14px", fontWeight: 600, fontSize: 13, borderBottom: "1px solid #e5e7eb" }}>
                  <span style={{ flex: 2 }}>Unit Type</span>
                  <span style={{ flex: 1, textAlign: "right" }}>Area From</span>
                  <span style={{ flex: 1, textAlign: "right" }}>Area To</span>
                </div>
                {property.floorPlans.map((fp, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", padding: "9px 14px",
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                      borderBottom: i < property.floorPlans.length - 1 ? "1px solid #f0f0f0" : "none",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ flex: 2 }}><Tag color="purple">{fp.unitType || "—"}</Tag></span>
                    <span style={{ flex: 1, textAlign: "right" }}>{fp.areaFrom ? `${fp.areaFrom} sqft` : "—"}</span>
                    <span style={{ flex: 1, textAlign: "right" }}>{fp.areaTo   ? `${fp.areaTo} sqft`   : "—"}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Inventory Overview */}
          {(() => {
            const inv = Array.isArray(property.inventory) ? property.inventory
              : Array.isArray(property.inventoryConfig) ? property.inventoryConfig
              : [];
            if (!inv.length && !property.parkingAllocation) return null;
            return (
              <Card title="Inventory Overview" style={{ borderRadius: 12, marginBottom: 16 }}>
                {inv.length > 0 && (
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: property.parkingAllocation ? 14 : 0 }}>
                    <div style={{ display: "flex", background: "#f3f4f6", padding: "8px 14px", fontWeight: 600, fontSize: 13, borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{ flex: 2 }}>Unit Type</span>
                      <span style={{ flex: 1, textAlign: "center" }}>Units</span>
                      <span style={{ flex: 2, textAlign: "right" }}>Starting Area</span>
                    </div>
                    {inv.map((u, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex", padding: "9px 14px",
                          background: i % 2 === 0 ? "#fff" : "#fafafa",
                          borderBottom: i < inv.length - 1 ? "1px solid #f0f0f0" : "none",
                          fontSize: 14,
                        }}
                      >
                        <span style={{ flex: 2 }}><Tag color="geekblue">{u.unitType || "—"}</Tag></span>
                        <span style={{ flex: 1, textAlign: "center", fontWeight: 600 }}>{u.numberOfUnits ?? u.count ?? "—"}</span>
                        <span style={{ flex: 2, textAlign: "right" }}>
                          {u.startingSquareFootage || u.sqft
                            ? `${u.startingSquareFootage || u.sqft} sqft`
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {property.parkingAllocation && (
                  <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                    <Text strong>Parking: </Text>
                    <Text>{property.parkingAllocation}</Text>
                  </div>
                )}
              </Card>
            );
          })()}

          {/* Location */}
          <Card
            title={<><EnvironmentOutlined style={{ marginRight: 8 }} />Location</>}
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Locality / Community">
                {property.locality || property.area || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="City">{property.city || "—"}</Descriptions.Item>
              <Descriptions.Item label="Country">{property.country || "UAE"}</Descriptions.Item>
              {loc.address && (
                <Descriptions.Item label="Address" span={2}>{loc.address}</Descriptions.Item>
              )}
              {lat && lng && (
                <Descriptions.Item label="Coordinates" span={2}>
                  <Text copyable>{lat}, {lng}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Map */}
            <div style={{ borderRadius: 10, overflow: "hidden", height: 300, border: "1px solid #e5e7eb" }}>
              {lat && lng ? (
                <iframe
                  width="100%" height="100%" style={{ border: 0 }}
                  loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                />
              ) : (
                <iframe
                  width="100%" height="100%" style={{ border: 0 }}
                  loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent([property.propertyName, property.locality || property.area, property.city, "UAE"].filter(Boolean).join(", "))}&t=m&z=13&output=embed`}
                />
              )}
            </div>
          </Card>

          {/* Payment Plan */}
          {stages.length > 0 && (
            <Card
              title={<><WalletOutlined style={{ marginRight: 8 }} />Payment Plan</>}
              style={{ borderRadius: 12, marginBottom: 16 }}
            >
              {payPlan?.title && <Text strong style={{ display: "block", marginBottom: 12 }}>{payPlan.title}</Text>}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                {stages.map((s, i) => {
                  const label = s.milestoneTitle || s.label || s.stage?.replace(/_/g, " ") || `Stage ${i + 1}`;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 16px",
                        background: i % 2 === 0 ? "#fafafa" : "#fff",
                        borderBottom: i < stages.length - 1 ? "1px solid #f0f0f0" : "none",
                        fontSize: 14,
                      }}
                    >
                      <Text style={{ textTransform: "capitalize" }}>{label}</Text>
                      <Tag color="purple" style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>{s.percentage}%</Tag>
                    </div>
                  );
                })}
                {(() => {
                  const total = stages.reduce((a, s) => a + (s.percentage || 0), 0);
                  return (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: total === 100 ? "#d1fae5" : "#fee2e2", fontWeight: 700 }}>
                      <Text strong style={{ color: total === 100 ? "#065f46" : "#991b1b" }}>Total</Text>
                      <Text strong style={{ color: total === 100 ? "#065f46" : "#991b1b" }}>{total}%{total !== 100 && " ⚠"}</Text>
                    </div>
                  );
                })()}
              </div>
            </Card>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <Card title="Amenities" style={{ borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {property.amenities.map((a, i) => (
                  <Tag key={i} color="geekblue" style={{ borderRadius: 20, padding: "3px 12px" }}>{a}</Tag>
                ))}
              </div>
            </Card>
          )}
        </Col>

        {/* ── RIGHT COLUMN ── */}
        <Col xs={24} lg={8}>

          {/* Listing Info */}
          <Card title="Listing Info" style={{ borderRadius: 12, marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Approval Status">
                <Tag color={STATUS_COLOR[property.approvalStatus] || "default"}>
                  {property.approvalStatus?.replace("_", " ").toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Listing Status">
                <Tag color={property.listingStatus === "active" ? "green" : "default"}>
                  {property.listingStatus || "—"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Property ID">
                <Text copyable style={{ fontSize: 12 }}>{property._id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {property.createdAt
                  ? new Date(property.createdAt).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" })
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {property.updatedAt
                  ? new Date(property.updatedAt).toLocaleDateString("en-AE", { day: "2-digit", month: "short", year: "numeric" })
                  : "—"}
              </Descriptions.Item>
              {property.reraPermitNumber && (
                <Descriptions.Item label="RERA Permit">{property.reraPermitNumber}</Descriptions.Item>
              )}
              {property.dldRegistrationNumber && (
                <Descriptions.Item label="DLD Reg.">{property.dldRegistrationNumber}</Descriptions.Item>
              )}
              {property.trakheesiPermitId && (
                <Descriptions.Item label="Trakheesi Permit">
                  <Text copyable strong style={{ color: "#7c3aed" }}>{property.trakheesiPermitId}</Text>
                </Descriptions.Item>
              )}
              {property.qrCode && (
                <Descriptions.Item label="QR Code">
                  <Popover
                    trigger="hover"
                    placement="left"
                    content={
                      <img
                        src={property.qrCode}
                        alt="QR Code"
                        style={{ width: 180, height: 180, objectFit: "contain", display: "block" }}
                      />
                    }
                  >
                    <Button size="small" icon={<QrcodeOutlined />} style={{ borderRadius: 6, borderColor: "#7c3aed", color: "#7c3aed" }}>
                      Hover to Scan
                    </Button>
                  </Popover>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Developer Details */}
          {(devDetails.companyName || devDetails.contactName || property.developerName) && (
            <Card
              title={<><TeamOutlined style={{ marginRight: 8 }} />Developer</>}
              style={{ borderRadius: 12, marginBottom: 16 }}
            >
              {devDetails.logo && (
                <div style={{ marginBottom: 12, textAlign: "center" }}>
                  <img src={devDetails.logo} alt="logo" style={{ height: 48, objectFit: "contain", borderRadius: 8 }} />
                </div>
              )}
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Company">
                  {devDetails.companyName || property.developerName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Licence No.">
                  {devDetails.developerLicenseNumber || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Contact">
                  {devDetails.primaryContactName || devDetails.contactName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {devDetails.phone || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {devDetails.email || "—"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Commission */}
          <Card title="Commission" style={{ borderRadius: 12, marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Share Commission">
                <Tag color={property.shareCommission ? "green" : "default"} style={{ borderRadius: 20 }}>
                  {property.shareCommission ? "Yes" : "No"}
                </Tag>
              </Descriptions.Item>
              {property.shareCommission && (
                <Descriptions.Item label="Commission %">{property.commission || 0}%</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Documents */}
          {(property.brochure || property.projectPlan) && (
            <Card title="Documents" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                {property.brochure && (
                  <Button block icon={<PictureOutlined />} href={property.brochure} target="_blank">
                    Download Brochure
                  </Button>
                )}
                {property.projectPlan && (
                  <Button block href={property.projectPlan} target="_blank">
                    Download Site Plan
                  </Button>
                )}
              </Space>
            </Card>
          )}

          {/* ── COMPLIANCE ── */}
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: "#7c3aed" }} />
                <span>Compliance</span>
                {qrCodeUrl && trakheesiId.trim()
                  ? <Tag color="green" style={{ marginLeft: 4 }}>Complete</Tag>
                  : <Tag color="orange" style={{ marginLeft: 4 }}>Required</Tag>}
              </Space>
            }
            style={{ borderRadius: 12, marginBottom: 16, border: (!qrCodeUrl || !trakheesiId.trim()) ? "1px solid #f97316" : "1px solid #e5e7eb" }}
          >
            {(!qrCodeUrl || !trakheesiId.trim()) && (
              <Alert
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
                message="Both QR code and Trakheesi Permit ID are required before this listing can go live."
                style={{ marginBottom: 16, borderRadius: 8, fontSize: 12 }}
              />
            )}

            {/* Trakheesi Permit ID */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                Trakheesi Permit ID <Text type="danger">*</Text>
              </Text>
              <Input
                size="large"
                placeholder="e.g. 123456789"
                value={trakheesiId}
                onChange={e => setTrakheesiId(e.target.value)}
                prefix={<SafetyCertificateOutlined style={{ color: "#9ca3af" }} />}
                style={{ borderRadius: 8 }}
              />
            </div>

            {/* QR Code Upload */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                QR Code Image <Text type="danger">*</Text>
              </Text>
              {qrCodeUrl ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Popover
                    trigger="hover"
                    placement="left"
                    content={
                      <div style={{ padding: 8, textAlign: "center" }}>
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          style={{ width: 200, height: 200, objectFit: "contain", display: "block" }}
                        />
                        <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: "block" }}>
                          Hover to scan or click to enlarge
                        </Text>
                      </div>
                    }
                  >
                    <Button
                      icon={<QrcodeOutlined style={{ fontSize: 18 }} />}
                      style={{ borderRadius: 8, borderColor: "#7c3aed", color: "#7c3aed", height: 40, paddingInline: 16 }}
                    >
                      View QR Code
                    </Button>
                  </Popover>
                  <Upload
                    customRequest={handleQrUpload}
                    showUploadList={false}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Tooltip title="Replace QR code">
                      <Button size="small" icon={<UploadOutlined />} style={{ borderRadius: 6 }}>
                        Replace
                      </Button>
                    </Tooltip>
                  </Upload>
                </div>
              ) : (
                <Upload
                  customRequest={handleQrUpload}
                  showUploadList={false}
                  accept="image/*"
                  maxCount={1}
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={qrUploading}
                    size="large"
                    style={{ borderRadius: 8, borderStyle: "dashed", width: "100%" }}
                  >
                    {qrUploading ? "Uploading..." : "Upload QR Code Image"}
                  </Button>
                </Upload>
              )}
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <Button
              block
              type="primary"
              loading={complianceSaving}
              onClick={handleSaveCompliance}
              style={{ borderRadius: 8, background: "#7c3aed", borderColor: "#7c3aed" }}
              disabled={!qrCodeUrl || !trakheesiId.trim()}
            >
              Save Compliance Info
            </Button>
          </Card>

          {/* Quick Actions */}
          {(isPending || isChangesReq) && (
            <Card title="Quick Actions" style={{ borderRadius: 12, marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Tooltip
                  title={!qrCodeUrl || !trakheesiId.trim()
                    ? "Save QR code and Trakheesi Permit ID first"
                    : ""}
                >
                <Button
                  block type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading}
                  disabled={!qrCodeUrl || !trakheesiId.trim()}
                  style={{ background: "#16a34a", borderColor: "#16a34a", borderRadius: 8 }}
                  onClick={handleApprove}
                >
                  Approve & Publish
                </Button>
                </Tooltip>
                <Button
                  block danger
                  icon={<CloseCircleOutlined />}
                  loading={actionLoading}
                  style={{ borderRadius: 8 }}
                  onClick={() => setRejectModal(true)}
                >
                  Reject with Reason
                </Button>
                {isPending && (
                  <Button
                    block
                    icon={<ClockCircleOutlined />}
                    style={{ borderColor: "#f97316", color: "#f97316", borderRadius: 8 }}
                    onClick={() => setChangesModal(true)}
                  >
                    Request Changes
                  </Button>
                )}
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      {/* ── REJECT MODAL ── */}
      <Modal
        title="Reject Property"
        open={rejectModal}
        onCancel={() => { setRejectModal(false); rejectForm.resetFields(); }}
        footer={null}
        destroyOnHidden
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[{ required: true, message: "Please provide a rejection reason." }]}
          >
            <TextArea rows={4} placeholder="e.g. Incomplete information, invalid photos, wrong pricing..." />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button onClick={() => { setRejectModal(false); rejectForm.resetFields(); }}>Cancel</Button>
            <Button type="primary" htmlType="submit" danger loading={actionLoading}>Confirm Rejection</Button>
          </div>
        </Form>
      </Modal>

      {/* ── REQUEST CHANGES MODAL ── */}
      <Modal
        title="Request Changes"
        open={changesModal}
        onCancel={() => { setChangesModal(false); changesForm.resetFields(); }}
        footer={null}
        destroyOnHidden
      >
        <Form form={changesForm} layout="vertical" onFinish={handleRequestChanges}>
          <Form.Item
            name="adminComments"
            label="Changes Required"
            rules={[{ required: true, message: "Please describe what changes are needed." }]}
          >
            <TextArea rows={4} placeholder="e.g. Please update the floor plan photos, fix pricing..." />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button onClick={() => { setChangesModal(false); changesForm.resetFields(); }}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={actionLoading}
              style={{ background: "#f97316", borderColor: "#f97316" }}
            >
              Send Request
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
